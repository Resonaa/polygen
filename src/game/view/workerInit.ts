import {
  AxesHelper,
  BufferAttribute,
  type BufferGeometry,
  CircleGeometry,
  Color,
  DoubleSide,
  EventDispatcher,
  Fog,
  ImageBitmapLoader,
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
  WebGLRenderer
} from "three";
import type { Font, FontData } from "three/addons/loaders/FontLoader.js";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

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

let renderer: WebGLRenderer;

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

  renderer = new WebGLRenderer({
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

  faceMaterial.onBeforeCompile = shader => {
    const colorTable = new Float32Array(palette.length * 3);

    for (const [i, color] of palette.entries()) {
      const [r, g, b] = new Color(color).toArray();

      colorTable[i * 3] = r;
      colorTable[i * 3 + 1] = g;
      colorTable[i * 3 + 2] = b;
    }

    const vertexShaderReplacements = [
      {
        from: "#include <common>",
        to: `
      #include <common>
      attribute float colorIndex;
      varying float vColorIndex;
      `
      },
      {
        from: "void main() {",
        to: `
      void main() {
      vColorIndex = colorIndex;
      `
      }
    ];

    const fragmentShaderReplacements = [
      {
        from: "#include <common>",
        to: `
      #include <common>
      uniform vec3 colorTable[${colorTable.length}];
      varying float vColorIndex;
    `
      },
      {
        from: "#include <color_fragment>",
        to: `
      {
        diffuseColor.rgb = colorTable[int(vColorIndex)];
      }
    `
      }
    ];

    for (const rep of vertexShaderReplacements) {
      shader.vertexShader = shader.vertexShader.replace(rep.from, rep.to);
    }

    for (const rep of fragmentShaderReplacements) {
      shader.fragmentShader = shader.fragmentShader.replace(rep.from, rep.to);
    }

    shader.uniforms.colorTable = { value: colorTable };
  };

  new ImageBitmapLoader().load(state.textureImage, data => {
    texture.image = data;
    texture.needsUpdate = true;
  });

  setup();

  render();

  controls.addEventListener("change", requestRenderIfNotRequested);
}

export function dispose() {
  controls.removeEventListener("change", requestRenderIfNotRequested);
  reset();
}

export function render() {
  renderRequested = false;
  controls.update();

  const cameraDirection = new Vector3();
  camera.getWorldDirection(cameraDirection);

  let rotationAngle: number | undefined;

  for (const meta of metaContainer.children) {
    if (rotationAngle !== undefined) {
      meta.rotation.z = rotationAngle;
      meta.updateMatrix();
      continue;
    }

    const rotation = meta.rotation.clone();

    meta.lookAt(meta.position.clone().sub(cameraDirection));
    rotationAngle = meta.rotation.z;

    meta.rotation.set(rotation.x, rotation.y, rotationAngle);
    meta.updateMatrix();

    if (rotationAngle === rotation.z) {
      break;
    }
  }

  renderer.render(scene, camera);
}

export function reset() {
  tracker.dispose();
}

function updateColor(id: number) {
  const attribute = faceGeometry.getAttribute("colorIndex");
  const colors = attribute.array;
  const start = faceColorStartingIndex[id];
  const end = faceColorStartingIndex[id + 1] - 1;

  for (let i = start; i <= end; i++) {
    colors[i] = faces[id].color;
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

    // Add geometry.
    {
      const geometry = new CircleGeometry(
        face.radius * settings.view.map.radius,
        face.sides
      );

      geometry.rotateZ((Math.PI * (face.sides - 2)) / face.sides / 2);
      geometry.applyQuaternion(quaternion);
      geometry.translate(...face.position);

      const vertexCount = geometry.getAttribute("position").count;
      faceColorStartingIndex.push(startingIndex);

      const colors = new Uint8Array(vertexCount);
      colors.fill(face.color);
      const attribute = new BufferAttribute(colors, 1);

      geometry.setAttribute("colorIndex", attribute);
      faceGeometries.push(geometry);

      startingIndex += colors.length;
    }

    // Add meta.
    {
      const text = new Mesh(undefined, textMaterial);
      text.matrixAutoUpdate = false;

      const meta = new MetaLayer(text);
      meta.position.fromArray(face.position);
      meta.applyQuaternion(quaternion);
      meta.matrixAutoUpdate = false;
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
