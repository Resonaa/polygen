import type { GM, RP } from "@polygen/wasm";
import type { Remote } from "comlink";
import type { Font, FontData } from "three/addons/loaders/FontLoader.js";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { mergeGeometries as mergeGeometriesLib } from "three/addons/utils/BufferGeometryUtils.js";
import {
  ArrowHelper,
  AxesHelper,
  BufferGeometry,
  Color,
  EdgesGeometry,
  Euler,
  ImageBitmapLoader,
  LineBasicMaterial,
  LineSegments,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  PerspectiveCamera,
  PlaneGeometry,
  Quaternion,
  RingGeometry,
  Scene,
  ShapeGeometry,
  Texture,
  Vector3,
  WebGPURenderer
} from "three/webgpu";

import fontObject from "@/static/Noto Sans SC Thin_Regular.json";
import textureJson from "@/static/texture/texture.json";
import textureImage from "@/static/texture/texture.png";

import type { Palette } from "~/game/palette";

import { CanvasProxy } from "./canvasProxy";
import {
  addGeometry,
  mergeGeometries,
  mergePickingGeometries,
  resetGeometries,
  updateGeometry
} from "./geometryUtils";
import { MapControls } from "./mapControls";
import { MetaLayer } from "./metaLayer";
import { PickHelper } from "./pickHelper";
import { ResourceTracker } from "./resourceTracker";
import type * as Settings from "./settings";

let settings: Settings.Type["game"];

let renderer: WebGPURenderer;

let camera: PerspectiveCamera;

let controls: MapControls;

let font: Font;

let gm: Remote<GM>;
let rp: Remote<RP>;

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

const helperContainer = new Object3D();
helperContainer.matrixAutoUpdate = false;
scene.add(helperContainer);

const texture = new Texture();
const textureMaterial = new MeshBasicMaterial({
  map: texture,
  transparent: true
});

const pickHelper = new PickHelper();
let oldPickIndicator: Mesh;

let renderRequested = false;

function requestRenderIfNotRequested() {
  if (!renderRequested) {
    renderRequested = true;
    requestAnimationFrame(render);
  }
}

let devicePixelRatio = 1;

let selectedId: number | null = null;

export function setConfig(arg: {
  palette?: Palette;
  settings?: Settings.Type["game"];
  devicePixelRatio?: number;
}) {
  if (arg.palette) {
    palette = arg.palette;
  }

  if (arg.settings) {
    settings = arg.settings;
  }

  if (arg.devicePixelRatio) {
    devicePixelRatio = arg.devicePixelRatio;
  }
}

export function setGM(_gm: Remote<GM>) {
  gm = _gm;
}

export function setRP(_rp: Remote<RP>) {
  rp = _rp;
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

  let downPos: { x: number; y: number } | null = null;

  canvasProxy.addEventListener("pointerdown", e => {
    const event = e as unknown as PointerEvent;
    downPos = { x: event.clientX, y: event.clientY };
  });

  canvasProxy.addEventListener("pointermove", e => {
    if (!downPos) {
      return;
    }

    const event = e as unknown as PointerEvent;

    const dx = event.clientX - downPos.x;
    const dy = event.clientY - downPos.y;

    if (Math.sqrt(dx * dx + dy * dy) > 20) {
      downPos = null; // Ignore large movements.
    }
  });

  canvasProxy.addEventListener("pointerup", async event => {
    if (!downPos) {
      return;
    }

    downPos = null;

    const pos = pickHelper.getPos(
      event as unknown as PointerEvent,
      canvasProxy as unknown as HTMLCanvasElement
    );

    const id = await pickHelper.pick(pos, renderer, camera, devicePixelRatio);
    console.log("Picked ID:", id);
    await select(id);
  });
}

export async function select(id: number | null) {
  if (selectedId === id) {
    return;
  }

  selectedId = id;

  if (oldPickIndicator) {
    scene.remove(oldPickIndicator);
    oldPickIndicator.geometry.dispose();
  }

  if (id !== null) {
    const normal = new Vector3(...(await rp.normal(id)));
    const position = new Vector3(...(await rp.position(id))).multiplyScalar(
      settings.view.map.radius
    );
    const radius = (await rp.radius(id)) * settings.view.map.radius;
    const sides = await rp.sides(id);

    const matrix = new Matrix4().lookAt(
      normal,
      new Vector3(),
      Object3D.DEFAULT_UP
    );
    const quaternion = new Quaternion().setFromRotationMatrix(matrix);

    const geometry = new RingGeometry(radius - 5, radius, sides);

    geometry.rotateZ((Math.PI * (sides - 2)) / sides / 2);
    geometry.translate(0, 0, 0.1);
    geometry.applyQuaternion(quaternion);
    geometry.translate(position.x, position.y, position.z);

    const pickIndicator = new Mesh(geometry);
    scene.add(pickIndicator);

    oldPickIndicator = pickIndicator;
  }

  requestRenderIfNotRequested();
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

  for (const _meta of metaContainer.children) {
    const meta = _meta as MetaLayer;

    if (!meta.isTop) {
      continue;
    }

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

async function getMaxTextWidth(id: number) {
  const sides = await rp.sides(id);
  const radius = await rp.radius(id);

  const dict = { 3: 0.86, 4: 1.4, 6: 1.8 };

  return dict[sides as keyof typeof dict] * radius * settings.view.map.radius;
}

export async function setup() {
  const imageGeometries = [];

  const size = await gm.size;

  for (let id = 0; id < size; id++) {
    const normal = new Vector3(...(await rp.normal(id)));
    const matrix = new Matrix4().lookAt(
      normal,
      new Vector3(),
      Object3D.DEFAULT_UP
    );
    const quaternion = new Quaternion().setFromRotationMatrix(matrix);

    const radius = (await rp.radius(id)) * settings.view.map.radius;
    const sides = await rp.sides(id);
    const position = new Vector3(...(await rp.position(id))).multiplyScalar(
      settings.view.map.radius
    );

    addGeometry(id, radius, sides, position, quaternion);

    // const normal = new Vector3(...(await rp.normal(id)));
    // const helper = new ArrowHelper(normal, position, 10, 0xff0000, 10, 5);
    // helperContainer.add(helper);

    // const axesHelper = new AxesHelper(15);
    // axesHelper.position.copy(position);
    // axesHelper.applyQuaternion(quaternion);
    // helperContainer.add(axesHelper);

    // Add meta.
    {
      const text = new Mesh(undefined, textMaterial);
      text.matrixAutoUpdate = false;

      const isTop = normal.y !== 0;
      const meta = new MetaLayer(text, isTop);
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
      image.rotateZ(Math.PI);
      image.translate(0, 0, 0.5);
      image.applyQuaternion(quaternion);
      image.translate(position.x, position.y, position.z);

      imageGeometries.push(image);
    }
  }

  geometry = mergeGeometries();
  scene.add(geometry);

  const pickingGeometry = mergePickingGeometries();
  pickHelper.scene.add(pickingGeometry);

  const edges = new EdgesGeometry(geometry.geometry);
  const line = new LineSegments(
    edges,
    new LineBasicMaterial({
      fog: false,
      linewidth: 0.06
    })
  );

  scene.add(line);
  tracker.track(line);
  tracker.track(geometry);
  tracker.track(helperContainer);
  tracker.track(pickingGeometry);

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
