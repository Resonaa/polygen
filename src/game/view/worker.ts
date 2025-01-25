import type { Font, FontData } from "three/addons/loaders/FontLoader.js";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { mergeGeometries as mergeGeometriesLib } from "three/addons/utils/BufferGeometryUtils.js";
import {
  AxesHelper,
  type BufferGeometry,
  Color,
  Euler,
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

import type { GM } from "@logenpy/gm";

import { CanvasProxy } from "./canvasProxy";
import {
  addGeometry,
  mergeGeometries,
  resetGeometries,
  updateGeometry
} from "./geometryUtils";
import { MapControls } from "./mapControls";
import { MetaLayer } from "./metaLayer";
import { ResourceTracker } from "./resourceTracker";
import type * as Settings from "./settings";

import fontObject from "@/static/Noto Sans SC Thin_Regular.json";
import textureJson from "@/static/texture/texture.json";
import textureImage from "@/static/texture/texture.png";
import type { Remote } from "comlink";

let settings: Settings.Type["game"];

let renderer: WebGPURenderer;

let camera: PerspectiveCamera;

let controls: MapControls;

let font: Font;

let gm: Remote<GM>;

let palette: Palette;

const scene = new Scene();

const axesHelper = new AxesHelper(1000);
scene.add(axesHelper);

const textMaterial = new MeshBasicMaterial();

const tracker = new ResourceTracker();

let geometry: Mesh;
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

function requestRenderIfNotRequested() {
  if (!renderRequested) {
    renderRequested = true;
    requestAnimationFrame(render);
  }
}

export function setConfig(arg: {
  palette?: Palette;
  settings?: Settings.Type["game"];
}) {
  if (arg.palette) {
    palette = arg.palette;
  }

  if (arg.settings) {
    settings = arg.settings;
  }
}

export function setGM(_gm: Remote<GM>) {
  gm = _gm;
}

const canvasProxy = new CanvasProxy();

export const handleEvent = canvasProxy.handleEvent.bind(canvasProxy);

export function setCanvasSize(data: Pick<CanvasProxy, "width" | "height">) {
  Object.assign(canvasProxy, data);
}

export function setCanvasBounding(data: Pick<CanvasProxy, "top" | "left">) {
  Object.assign(canvasProxy, data);
}

function resizeRendererToDisplaySize() {
  const canvas = renderer.domElement;
  const width = canvasProxy.width;
  const height = canvasProxy.height;
  const needResize = canvas.width !== width || canvas.height !== height;
  if (needResize) {
    renderer.setSize(width, height, false);
  }
  return needResize;
}

export async function start(canvas: OffscreenCanvas) {
  renderer = new WebGPURenderer({
    antialias: settings.view.antialias,
    // @ts-ignore
    canvas
  });
  renderer.setSize(canvas.width, canvas.height, false);

  camera = new PerspectiveCamera(
    settings.view.camera.fov,
    canvas.width / canvas.height,
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

  font = new FontLoader().parse(fontObject as unknown as FontData);

  new ImageBitmapLoader().load(textureImage, data => {
    texture.image = data;
    texture.flipY = false;
    texture.needsUpdate = true;
  });

  await renderer.init();

  await setup();

  render();

  controls.addEventListener("change", requestRenderIfNotRequested);
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

  if (resizeRendererToDisplaySize()) {
    camera.aspect = canvasProxy.clientWidth / canvasProxy.clientHeight;
    camera.updateProjectionMatrix();
  }

  renderer.render(scene, camera);
}

export function reset() {
  resetGeometries();
  tracker.dispose();
}

async function updateColor(id: number) {
  updateGeometry(geometry, id, new Color(palette[await gm.color(id)]));
}

async function updateText(id: number) {
  const text = (metaContainer.children[id] as MetaLayer).text;
  text.geometry.dispose();

  const amount = await gm.amount(id);

  const maxWidth = await getMaxTextWidth(id);
  const string = amount === 0 ? "" : amount.toString();

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

async function updateImage(id: number) {
  const type = await gm.type(id);
  const frame = textureJson.frames[type].frame;
  const attribute = imageGeometry.getAttribute("uv");
  const uvs = attribute.array;

  const UVS_PER_IMAGE = 8;

  const startingIndex = id * UVS_PER_IMAGE;

  // Update UVs for the plane
  for (let i = startingIndex; i < startingIndex + UVS_PER_IMAGE; i += 2) {
    uvs[i] = (uvs[i] * frame.w + frame.x) / textureJson.meta.size.w;
    uvs[i + 1] = (uvs[i + 1] * frame.h + frame.y) / textureJson.meta.size.h;
  }

  attribute.needsUpdate = true;
}

async function getQuaternion(id: number) {
  const [x, y, z] = await gm.normal(id);
  return new Quaternion().setFromUnitVectors(Object3D.DEFAULT_UP, {
    x,
    y,
    z
  });
}

async function getMaxTextWidth(id: number) {
  const sides = await gm.sides(id);
  const radius = await gm.radius(id);

  const dict = { 6: 1.8, 4: 1.4, 3: 0.86 };

  return dict[sides as keyof typeof dict] * radius * settings.view.map.radius;
}

export async function setup() {
  const imageGeometries = [];

  const size = await gm.size;

  for (let id = 0; id < size; id++) {
    const quaternion = await getQuaternion(id);

    const radius = (await gm.radius(id)) * settings.view.map.radius;
    const sides = await gm.sides(id);
    const position = new Vector3(...(await gm.position(id))).multiplyScalar(
      settings.view.map.radius
    );

    addGeometry(radius, sides, position, quaternion);

    // Add meta.
    {
      const text = new Mesh(undefined, textMaterial);
      text.matrixAutoUpdate = false;

      const meta = new MetaLayer(text);
      meta.position.copy(position);
      meta.applyQuaternion(quaternion);
      meta.matrixAutoUpdate = false;
      meta.updateMatrix();
      metaContainer.add(meta);
      tracker.track(meta);

      const image = new PlaneGeometry(
        settings.view.map.imageSize,
        settings.view.map.imageSize
      );
      image.applyQuaternion(quaternion);
      image.translate(position.x, position.y, position.z + 0.5);
      imageGeometries.push(image);
    }
  }

  geometry = mergeGeometries();
  scene.add(geometry);
  tracker.track(geometry);

  const mergedImageGeometry = mergeGeometriesLib(imageGeometries, false);
  const imageMesh = new Mesh(mergedImageGeometry, textureMaterial);
  imageMesh.matrixAutoUpdate = false;
  imageMesh.matrixWorldAutoUpdate = false;
  scene.add(imageMesh);
  tracker.track(imageMesh);
  imageGeometry = mergedImageGeometry;

  const promises = [];

  for (let id = 0; id < size; id++) {
    promises.push(updateColor(id));
    promises.push(updateText(id));
    promises.push(updateImage(id));
  }

  await Promise.all(promises);
}
