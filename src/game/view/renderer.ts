import * as THREE from "three";
import type { Font, FontData } from "three/addons/loaders/FontLoader.js";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import * as BufferGeometryUtils from "three/addons/utils/BufferGeometryUtils.js";

import fontObject from "@/static/Noto Sans SC Thin_Regular.json";
import textureImage from "@/static/texture/texture.png";
import textureJson from "@/static/texture/texture.json";
import type { Palette } from "~/game/palette";

import { FaceType, type Face } from "../gm";

import MapControls from "./mapControls";
import ResourceTracker from "./resourceTracker";
import * as Settings from "./settings";
import { MetaLayer } from "./metaLayer";
import { IMAGE_SIZE } from "./constants";

export class Renderer {
  settings: Settings.Type["game"];

  scene: THREE.Scene;
  renderer: THREE.WebGLRenderer;
  camera: THREE.PerspectiveCamera;

  font: Font;
  faceMaterial: THREE.Material;
  textMaterial: THREE.Material;
  textureMaterial: THREE.Material;

  metaContainer: THREE.Object3D;
  geometry: THREE.BufferGeometry;

  faceColorStartingIndex: number[] = [];

  faces: Face[];
  palette: Palette;

  controls: MapControls;
  tracker: ResourceTracker;

  renderRequested = false;

  dispose: () => void;

  constructor(canvas: HTMLCanvasElement, faces: Face[], palette: Palette) {
    // Load settings.
    const settings = Settings.Default.game;
    this.settings = settings;

    // Basic setups: Scene, Renderer, Camera, Helper.
    const scene = new THREE.Scene();
    this.scene = scene;
    scene.fog = new THREE.Fog(
      settings.view.background,
      settings.view.fog.near,
      settings.view.camera.far,
    );

    const renderer = new THREE.WebGLRenderer({
      antialias: settings.view.antialias,
      canvas,
    });
    this.renderer = renderer;
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);

    const camera = new THREE.PerspectiveCamera(
      settings.view.camera.fov,
      canvas.clientWidth / canvas.clientHeight,
      settings.view.camera.near,
      settings.view.camera.far,
    );
    this.camera = camera;
    camera.position.set(-100, 500, -100);
    camera.lookAt(300, 3300, 300);

    const axesHelper = new THREE.AxesHelper(1000);
    scene.add(axesHelper);

    // Map controls that supports scaling and panning.
    const controls = new MapControls(camera, canvas, settings.view.controls);
    this.controls = controls;

    // Load font.
    const loader = new FontLoader();
    this.font = loader.parse(fontObject as unknown as FontData);

    // Create materials.
    this.faceMaterial = new THREE.MeshBasicMaterial({
      vertexColors: true,
      side: THREE.DoubleSide,
    });

    this.textMaterial = new THREE.MeshBasicMaterial();

    this.faceMaterial.onBeforeCompile = (shader) => {
      const colorTable = new Float32Array(this.palette.length * 3);

      for (const [i, color] of this.palette.entries()) {
        const [r, g, b] = new THREE.Color(color).toArray();

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
        `,
        },
        {
          from: "void main() {",
          to: `
        void main() {
        vColorIndex = colorIndex;
        `,
        },
      ];

      const fragmentShaderReplacements = [
        {
          from: "#include <common>",
          to: `
        #include <common>
        uniform vec3 colorTable[${colorTable.length}];
        varying float vColorIndex;
      `,
        },
        {
          from: "#include <color_fragment>",
          to: `
        {
          diffuseColor.rgb = colorTable[int(vColorIndex)];
        }
      `,
        },
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

    this.geometry = new THREE.BufferGeometry();

    const metaContainer = new THREE.Object3D();
    metaContainer.matrixAutoUpdate = false;
    this.scene.add(metaContainer);
    this.metaContainer = metaContainer;

    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load(textureImage);
    texture.flipY = false;
    this.textureMaterial = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true
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

    const cameraDirection = new THREE.Vector3();
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
    const attribute = this.geometry.getAttribute("colorIndex");
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
      const geometry = new THREE.ShapeGeometry(
        this.font.generateShapes(string, size),
      );
      geometry.computeBoundingBox();

      if (!geometry.boundingBox) {
        throw new Error("bounding box should have been calculated");
      }

      const { min, max } = geometry.boundingBox;
      const subBoundingBox = max.sub(min);

      if (subBoundingBox.x <= maxWidth) {
        subBoundingBox.multiplyScalar(-0.5);
        geometry.translate(subBoundingBox.x, subBoundingBox.y, 0.2);
        text.geometry = geometry;
        break;
      }

      geometry.dispose();
    }
  }

  updateImage(id: number) {
    const face = this.faces[id];
    const frame = textureJson.frames[face.type].frame;
    const image = (this.metaContainer.children[id] as MetaLayer).image;

    image.geometry.dispose();

    if (face.type === FaceType.Empty) {
      return;
    }

    const geometry = new THREE.PlaneGeometry(IMAGE_SIZE, IMAGE_SIZE);

    // Calculate UV coordinates for each plane based on the atlas's metadata
    const attribute = geometry.getAttribute("uv");
    const uvs = attribute.array;
    const offsetX = frame.x / textureJson.meta.size.w;
    const offsetY = frame.y / textureJson.meta.size.h;
    const scaleX = frame.w / textureJson.meta.size.w;
    const scaleY = frame.h / textureJson.meta.size.h;

    // Update UVs for the plane
    for (let i = 0; i < uvs.length; i += 2) {
      uvs[i] = uvs[i] * scaleX + offsetX;
      uvs[i + 1] = uvs[i + 1] * scaleY + offsetY;
    }
  
    attribute.needsUpdate = true;

    geometry.rotateZ(Math.PI);
    geometry.translate(0, 0, 0.1);

    image.geometry = geometry;
  }

  getQuaternion(id: number) {
    const up = new THREE.Vector3(0, 1, 0);
    const [x, y, z] = this.faces[id].normal;
    return new THREE.Quaternion().setFromUnitVectors(up, { x, y, z });
  }

  createGeometry(id: number) {
    const face = this.faces[id];

    const geometry = new THREE.CircleGeometry(
      face.radius * this.settings.view.map.radius,
      face.sides,
    );

    geometry.rotateZ((Math.PI * (face.sides - 2)) / face.sides / 2);

    geometry.applyQuaternion(this.getQuaternion(id));

    geometry.translate(...face.position);

    return geometry;
  }

  getMaxTextWidth(id: number) {
    const face = this.faces[id];

    const dict = { 6: 1.8, 4: 1.4, 3: 0.86 };

    return dict[face.sides] * face.radius * this.settings.view.map.radius;
  }

  setup() {
    const geometries = [];
    this.faceColorStartingIndex = [];

    let startingIndex = 0;

    for (const [id, face] of this.faces.entries()) {
      // Add geometry.
      {
        const geometry = this.createGeometry(id);

        const vertexCount = geometry.getAttribute("position").count;
        this.faceColorStartingIndex.push(startingIndex);

        const colors = new Uint8Array(vertexCount);
        colors.fill(face.color);
        const attribute = new THREE.BufferAttribute(colors, 1);

        geometry.setAttribute("colorIndex", attribute);
        geometries.push(geometry);

        startingIndex += colors.length;
      }

      // Add meta.
      {
        const text = new THREE.Mesh(
          undefined,
          this.textMaterial,
        );
        text.matrixAutoUpdate = false;

        const image = new THREE.Mesh(undefined, this.textureMaterial);
        image.matrixAutoUpdate = false;

        const meta = new MetaLayer(text, image);

        meta.position.fromArray(face.position);
        meta.applyQuaternion(this.getQuaternion(id));

        this.metaContainer.add(meta);

        meta.matrixAutoUpdate = false;

        this.tracker.track(meta);
      }
    }

    this.faceColorStartingIndex.push(startingIndex);

    const mergedGeometry = BufferGeometryUtils.mergeGeometries(
      geometries,
      false,
    );
    const mesh = new THREE.Mesh(mergedGeometry, this.faceMaterial);
    this.scene.add(mesh);
    this.tracker.track(mesh);
    this.geometry = mergedGeometry;

    for (let id = 0; id < this.faces.length; id++) {
      this.updateColor(id);
      this.updateText(id);
      this.updateImage(id);
    }
  }
}
