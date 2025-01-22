import type { Font, FontData } from "three/addons/loaders/FontLoader.js";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import {
  AxesHelper,
  BufferAttribute,
  type BufferGeometry,
  CircleGeometry,
  Color,
  DoubleSide,
  Euler,
  EventDispatcher,
  Fog,
  ImageBitmapLoader,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  PerspectiveCamera,
  PlaneGeometry,
  Quaternion,
  Scene,
  ShapeGeometry,
  Texture,
  Vector3,
  WebGPURenderer
} from "three/webgpu";

import type { Palette } from "~/game/palette";

import type { Face } from "../gm";

import { IMAGE_SIZE } from "./constants";
import { MapControls } from "./mapControls";
import { MetaLayer } from "./metaLayer";
import { ResourceTracker } from "./resourceTracker";
import type * as Settings from "./settings";
import type { State } from "./workerState";

let settings: Settings.Type["game"];

let state: State;

let renderer: WebGPURenderer;

let camera: PerspectiveCamera;

let controls: MapControls;

let font: Font;

let faces: Face[];

let palette: Palette;

const scene = new Scene();

const axesHelper = new AxesHelper(1000);
scene.add(axesHelper);

const faceMaterial = new MeshBasicMaterial({
  vertexColors: true,
  side: DoubleSide
});

const textMaterial = new MeshBasicMaterial();

const tracker = new ResourceTracker();

let faceGeometry: BufferGeometry;
let imageGeometry: BufferGeometry;

const metaContainer = new Object3D();
metaContainer.matrixAutoUpdate = false;
scene.add(metaContainer);

const texture = new Texture();
const textureMaterial = new MeshBasicMaterial({
  map: texture,
  transparent: true
});

let renderRequested = false;

let faceColorStartingIndex: number[] = [];

function requestRenderIfNotRequested() {
  if (!renderRequested) {
    renderRequested = true;
    requestAnimationFrame(render);
  }
}

export function set(arg: {
  faces?: Face[];
  palette?: Palette;
  settings?: Settings.Type["game"];
  state?: State;
}) {
  if (arg.faces) {
    faces = arg.faces;
  }

  if (arg.palette) {
    palette = arg.palette;
  }

  if (arg.settings) {
    settings = arg.settings;
  }

  if (arg.state) {
    state = arg.state;
  }
}

function noop() {}

class CanvasProxy extends EventDispatcher<Record<string, Event>> {
  // OrbitControls try to set style.touchAction
  style = {};

  left = 0;
  top = 0;
  width = 0;
  height = 0;

  getRootNode() {
    return {
      addEventListener: noop,
      removeEventListener: noop
    };
  }

  get clientWidth() {
    return this.width;
  }

  get clientHeight() {
    return this.height;
  }

  // OrbitControls call these as of r132. Maybe we should implement them
  setPointerCapture = noop;
  releasePointerCapture = noop;

  getBoundingClientRect() {
    return {
      left: this.left,
      top: this.top,
      width: this.width,
      height: this.height,
      right: this.left + this.width,
      bottom: this.top + this.height
    };
  }

  handleEvent(data: Event) {
    data.preventDefault = noop;
    data.stopPropagation = noop;
    this.dispatchEvent(data);
  }

  focus = noop;
}

export const canvasProxy = new CanvasProxy();

export function handleEvent(data: Event) {
  canvasProxy.handleEvent(data);
}

export function setCanvasBounding(
  data: Pick<CanvasProxy, "top" | "left" | "width" | "height">
) {
  Object.assign(canvasProxy, data);
}

export function start(canvas: OffscreenCanvas) {
  scene.fog = new Fog(
    settings.view.background,
    settings.view.fog.near,
    settings.view.camera.far
  );

  renderer = new WebGPURenderer({
    antialias: settings.view.antialias,
    canvas
  });
  renderer.setSize(state.width, state.height, false);

  camera = new PerspectiveCamera(
    settings.view.camera.fov,
    state.width / state.height,
    settings.view.camera.near,
    settings.view.camera.far
  );

  camera.position.set(-100, 500, -100);
  camera.lookAt(300, 3300, 300);

  controls = new MapControls(
    camera,
    canvasProxy as unknown as HTMLElement,
    settings.view.controls
  );

  font = new FontLoader().parse(state.fontObject as unknown as FontData);

  new ImageBitmapLoader().load(state.textureImage, data => {
    texture.image = data;
    texture.flipY = false;
    texture.needsUpdate = true;
  });

  renderer.init().then(() => {
    setup();

    render();

    controls.addEventListener("change", requestRenderIfNotRequested);
  });
}

export function dispose() {
  controls.removeEventListener("change", requestRenderIfNotRequested);
  reset();
}

const cameraDirection = new Vector3();
const rotationMatrix = new Matrix4();
const oldRotation = new Euler();
const newRotation = new Euler();

export function render() {
  renderRequested = false;
  controls.update();

  camera.getWorldDirection(cameraDirection);

  let rotationAngle: number | undefined;

  for (const meta of metaContainer.children) {
    const matrix = meta.matrix;

    oldRotation.setFromRotationMatrix(matrix);

    if (rotationAngle !== undefined) {
      rotationMatrix.makeRotationZ(rotationAngle - oldRotation.z);
      matrix.multiply(rotationMatrix);
      continue;
    }

    rotationMatrix.lookAt(new Vector3(), cameraDirection, Object3D.DEFAULT_UP);
    newRotation.setFromRotationMatrix(rotationMatrix);

    rotationAngle = newRotation.z;
    if (rotationAngle === oldRotation.z) {
      break;
    }

    rotationMatrix.makeRotationZ(rotationAngle - oldRotation.z);
    matrix.multiply(rotationMatrix);
  }

  renderer.render(scene, camera);
}

export function reset() {
  tracker.dispose();
}

function updateColor(id: number) {
  const attribute = faceGeometry.getAttribute("color");
  const colors = attribute.array;
  const start = faceColorStartingIndex[id];
  const end = faceColorStartingIndex[id + 1] - 1;

  const targetColor = new Color(palette[faces[id].color]).toArray();

  for (let i = start; i <= end; i++) {
    colors[i] = targetColor[(i - start) % 3];
  }

  attribute.needsUpdate = true;
}

function updateText(id: number) {
  const text = (metaContainer.children[id] as MetaLayer).text;
  text.geometry.dispose();

  const face = faces[id];

  const maxWidth = getMaxTextWidth(id);
  const string = face.amount === 0 ? "" : face.amount.toString();

  for (
    let size = settings.view.map.maxTextSize;
    size > settings.view.map.minTextSize;
    size -= 2
  ) {
    const geometry = new ShapeGeometry(font.generateShapes(string, size));
    geometry.computeBoundingBox();

    if (!geometry.boundingBox) {
      throw new Error("bounding box should have been calculated");
    }

    const { min, max } = geometry.boundingBox;
    const subBoundingBox = max.sub(min);

    if (subBoundingBox.x <= maxWidth) {
      subBoundingBox.multiplyScalar(-0.5);
      geometry.translate(subBoundingBox.x, subBoundingBox.y, 1);
      text.geometry = geometry;
      break;
    }

    geometry.dispose();
  }
}

function updateImage(id: number) {
  const face = faces[id];
  const frame = state.textureJson.frames[face.type].frame;
  const attribute = imageGeometry.getAttribute("uv");
  const uvs = attribute.array;

  const UVS_PER_IMAGE = 8;

  const startingIndex = id * UVS_PER_IMAGE;

  // Update UVs for the plane
  for (let i = startingIndex; i < startingIndex + UVS_PER_IMAGE; i += 2) {
    uvs[i] = (uvs[i] * frame.w + frame.x) / state.textureJson.meta.size.w;
    uvs[i + 1] =
      (uvs[i + 1] * frame.h + frame.y) / state.textureJson.meta.size.h;
  }

  attribute.needsUpdate = true;
}

function getQuaternion(id: number) {
  const [x, y, z] = faces[id].normal;
  return new Quaternion().setFromUnitVectors(Object3D.DEFAULT_UP, {
    x,
    y,
    z
  });
}

function getMaxTextWidth(id: number) {
  const face = faces[id];

  const dict = { 6: 1.8, 4: 1.4, 3: 0.86 };

  return dict[face.sides] * face.radius * settings.view.map.radius;
}

export function setup() {
  const faceGeometries = [];
  faceColorStartingIndex = [];

  let startingIndex = 0;

  const imageGeometries = [];

  for (const [id, face] of faces.entries()) {
    const quaternion = getQuaternion(id);

    // // Add geometry.
    {
      const geometry = new CircleGeometry(
        face.radius * settings.view.map.radius,
        face.sides
      );

      geometry.rotateZ((Math.PI * (face.sides - 2)) / face.sides / 2);
      geometry.applyQuaternion(quaternion);
      geometry.translate(...face.position);

      const vertexCount = geometry.getAttribute("position").count;
      faceGeometries.push(geometry);
      faceColorStartingIndex.push(startingIndex);
      startingIndex += vertexCount * 3;
    }

    // Add meta.
    {
      const text = new Mesh(undefined, textMaterial);
      text.matrixAutoUpdate = false;

      const meta = new MetaLayer(text);
      meta.position.fromArray(face.position);
      meta.applyQuaternion(quaternion);
      meta.matrixAutoUpdate = false;
      meta.updateMatrix();
      metaContainer.add(meta);
      tracker.track(meta);

      const image = new PlaneGeometry(IMAGE_SIZE, IMAGE_SIZE);
      image.applyQuaternion(quaternion);
      image.translate(
        face.position[0],
        face.position[1],
        face.position[2] + 0.5
      );
      imageGeometries.push(image);
    }
  }

  faceColorStartingIndex.push(startingIndex);

  const mergedFaceGeometry = mergeGeometries(faceGeometries, false);
  const colors = new Float32Array(faceColorStartingIndex[faces.length - 1] * 3);
  mergedFaceGeometry.setAttribute(
    "color",
    new BufferAttribute(colors, 3, false)
  );
  const faceMesh = new Mesh(mergedFaceGeometry, faceMaterial);
  faceMesh.matrixAutoUpdate = false;
  faceMesh.matrixWorldAutoUpdate = false;
  scene.add(faceMesh);
  tracker.track(faceMesh);
  faceGeometry = mergedFaceGeometry;

  const mergedImageGeometry = mergeGeometries(imageGeometries, false);
  const imageMesh = new Mesh(mergedImageGeometry, textureMaterial);
  imageMesh.matrixAutoUpdate = false;
  imageMesh.matrixWorldAutoUpdate = false;
  scene.add(imageMesh);
  tracker.track(imageMesh);
  imageGeometry = mergedImageGeometry;

  for (let id = 0; id < faces.length; id++) {
    updateColor(id);
    updateText(id);
    updateImage(id);
  }
}
