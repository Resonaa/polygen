import {
  AxesHelper,
  BufferAttribute,
  BufferGeometry,
  CircleGeometry,
  Color,
  DoubleSide,
  Fog,
  ImageBitmapLoader,
  type Material,
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
import type { State } from "./workerEvents";

export class WorkerInit {
  settings: Settings.Type["game"];

  state: State;

  scene: Scene;
  renderer: WebGLRenderer;
  camera: PerspectiveCamera;

  font: Font;
  faceMaterial: Material;
  textMaterial: Material;
  textureMaterial: Material;

  metaContainer: Object3D;
  faceGeometry: BufferGeometry;
  imageGeometry: BufferGeometry;

  faceColorStartingIndex: number[] = [];

  faces: Face[];
  palette: Palette;

  controls: MapControls;
  tracker: ResourceTracker;

  renderRequested = false;

  dispose: () => void;

  constructor(
    canvas: OffscreenCanvas,
    inputElement: HTMLElement,
    faces: Face[],
    palette: Palette,
    settings: Settings.Type["game"],
    state: State
  ) {
    this.settings = settings;
    this.state = state;

    // Basic setups: Scene, Renderer, Camera, Helper.
    const scene = new Scene();
    this.scene = scene;
    scene.fog = new Fog(
      settings.view.background,
      settings.view.fog.near,
      settings.view.camera.far
    );

    const renderer = new WebGLRenderer({
      antialias: settings.view.antialias,
      canvas
    });
    this.renderer = renderer;
    renderer.setSize(state.width, state.height, false);

    const camera = new PerspectiveCamera(
      settings.view.camera.fov,
      state.width / state.height,
      settings.view.camera.near,
      settings.view.camera.far
    );
    this.camera = camera;
    camera.position.set(-100, 500, -100);
    camera.lookAt(300, 3300, 300);

    const axesHelper = new AxesHelper(1000);
    scene.add(axesHelper);

    // Map controls that supports scaling and panning.
    const controls = new MapControls(
      camera,
      inputElement,
      settings.view.controls
    );
    this.controls = controls;

    // Load font.
    const loader = new FontLoader();
    this.font = loader.parse(this.state.fontObject as unknown as FontData);

    // Create materials.
    this.faceMaterial = new MeshBasicMaterial({
      vertexColors: true,
      side: DoubleSide
    });

    this.textMaterial = new MeshBasicMaterial();

    this.faceMaterial.onBeforeCompile = shader => {
      const colorTable = new Float32Array(this.palette.length * 3);

      for (const [i, color] of this.palette.entries()) {
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

    // Resource tracker for automatic disposing.
    this.tracker = new ResourceTracker();

    // Add faces.
    this.faces = faces;
    this.palette = palette;

    this.faceGeometry = new BufferGeometry();
    this.imageGeometry = new BufferGeometry();

    const metaContainer = new Object3D();
    metaContainer.matrixAutoUpdate = false;
    this.scene.add(metaContainer);
    this.metaContainer = metaContainer;

    const texture = new Texture();
    this.textureMaterial = new MeshBasicMaterial({
      map: texture,
      transparent: true
    });

    new ImageBitmapLoader().load(this.state.textureImage, data => {
      texture.image = data;
      texture.needsUpdate = true;
    });

    this.setup();

    const requestRenderIfNotRequested = () => {
      if (!this.renderRequested) {
        this.renderRequested = true;
        requestAnimationFrame(() => this.render());
      }
    };

    this.render();
    controls.addEventListener("change", requestRenderIfNotRequested);

    this.dispose = () => {
      controls.removeEventListener("change", requestRenderIfNotRequested);
      this.reset();
    };
  }

  render() {
    this.renderRequested = false;
    this.controls.update();

    const cameraDirection = new Vector3();
    this.camera.getWorldDirection(cameraDirection);

    let rotationAngle: number | undefined;

    for (const meta of this.metaContainer.children) {
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

    this.renderer.render(this.scene, this.camera);
  }

  reset() {
    this.tracker.dispose();
  }

  updateColor(id: number) {
    const attribute = this.faceGeometry.getAttribute("colorIndex");
    const colors = attribute.array;
    const start = this.faceColorStartingIndex[id];
    const end = this.faceColorStartingIndex[id + 1] - 1;

    for (let i = start; i <= end; i++) {
      colors[i] = this.faces[id].color;
    }

    attribute.needsUpdate = true;
  }

  updateText(id: number) {
    const text = (this.metaContainer.children[id] as MetaLayer).text;
    text.geometry.dispose();

    const face = this.faces[id];

    const maxWidth = this.getMaxTextWidth(id);
    const string = face.amount === 0 ? "" : face.amount.toString();

    for (
      let size = this.settings.view.map.maxTextSize;
      size > this.settings.view.map.minTextSize;
      size -= 2
    ) {
      const geometry = new ShapeGeometry(
        this.font.generateShapes(string, size)
      );
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

  updateImage(id: number) {
    const face = this.faces[id];
    const frame = this.state.textureJson.frames[face.type].frame;
    const attribute = this.imageGeometry.getAttribute("uv");
    const uvs = attribute.array;

    const UVS_PER_IMAGE = 8;

    const startingIndex = id * UVS_PER_IMAGE;

    // Update UVs for the plane
    for (let i = startingIndex; i < startingIndex + UVS_PER_IMAGE; i += 2) {
      uvs[i] =
        (uvs[i] * frame.w + frame.x) / this.state.textureJson.meta.size.w;
      uvs[i + 1] =
        (uvs[i + 1] * frame.h + frame.y) / this.state.textureJson.meta.size.h;
    }

    attribute.needsUpdate = true;
  }

  getQuaternion(id: number) {
    const [x, y, z] = this.faces[id].normal;
    return new Quaternion().setFromUnitVectors(Object3D.DEFAULT_UP, {
      x,
      y,
      z
    });
  }

  getMaxTextWidth(id: number) {
    const face = this.faces[id];

    const dict = { 6: 1.8, 4: 1.4, 3: 0.86 };

    return dict[face.sides] * face.radius * this.settings.view.map.radius;
  }

  setup() {
    const faceGeometries = [];
    this.faceColorStartingIndex = [];

    let startingIndex = 0;

    const imageGeometries = [];

    for (const [id, face] of this.faces.entries()) {
      const quaternion = this.getQuaternion(id);

      // Add geometry.
      {
        const geometry = new CircleGeometry(
          face.radius * this.settings.view.map.radius,
          face.sides
        );

        geometry.rotateZ((Math.PI * (face.sides - 2)) / face.sides / 2);
        geometry.applyQuaternion(quaternion);
        geometry.translate(...face.position);

        const vertexCount = geometry.getAttribute("position").count;
        this.faceColorStartingIndex.push(startingIndex);

        const colors = new Uint8Array(vertexCount);
        colors.fill(face.color);
        const attribute = new BufferAttribute(colors, 1);

        geometry.setAttribute("colorIndex", attribute);
        faceGeometries.push(geometry);

        startingIndex += colors.length;
      }

      // Add meta.
      {
        const text = new Mesh(undefined, this.textMaterial);
        text.matrixAutoUpdate = false;

        const meta = new MetaLayer(text);
        meta.position.fromArray(face.position);
        meta.applyQuaternion(quaternion);
        meta.matrixAutoUpdate = false;
        this.metaContainer.add(meta);
        this.tracker.track(meta);

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

    this.faceColorStartingIndex.push(startingIndex);

    const mergedFaceGeometry = mergeGeometries(faceGeometries, false);
    const faceMesh = new Mesh(mergedFaceGeometry, this.faceMaterial);
    faceMesh.matrixAutoUpdate = false;
    faceMesh.matrixWorldAutoUpdate = false;
    this.scene.add(faceMesh);
    this.tracker.track(faceMesh);
    this.faceGeometry = mergedFaceGeometry;

    const mergedImageGeometry = mergeGeometries(imageGeometries, false);
    const imageMesh = new Mesh(mergedImageGeometry, this.textureMaterial);
    imageMesh.matrixAutoUpdate = false;
    imageMesh.matrixWorldAutoUpdate = false;
    this.scene.add(imageMesh);
    this.tracker.track(imageMesh);
    this.imageGeometry = mergedImageGeometry;

    for (let id = 0; id < this.faces.length; id++) {
      this.updateColor(id);
      this.updateText(id);
      this.updateImage(id);
    }
  }
}
