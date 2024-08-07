import * as THREE from "three";
import type { Font, FontData } from "three/addons/loaders/FontLoader.js";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import * as BufferGeometryUtils from "three/addons/utils/BufferGeometryUtils.js";

import fontObject from "@/static/Noto Sans SC Thin_Regular.json";
import type { Palette } from "~/game/gm/palette";

import type { Face, Map } from "../map";

import MapControls from "./mapControls";
import ResourceTracker from "./resourceTracker";
import * as Settings from "./settings";

export default abstract class BaseRendererNew {
  settings: Settings.Type["game"];

  scene: THREE.Scene;
  renderer: THREE.WebGLRenderer;
  camera: THREE.PerspectiveCamera;
  dirLight: THREE.DirectionalLight;

  font: Font;
  faceMaterial: THREE.Material;
  textMaterial: THREE.Material;

  textContainer: THREE.Object3D;
  geometry: THREE.BufferGeometry;

  faceColorStartingIndex: number[] = [];

  map: Map;
  palette: Palette;

  controls: MapControls;
  tracker: ResourceTracker;

  renderRequested = false;

  dispose: () => void;

  abstract placeHelper(helper: THREE.Object3D, face: Face): void;

  abstract placeContainer(container: THREE.Object3D, face: Face): void;

  abstract createGeometry(face: Face): THREE.BufferGeometry;

  abstract getMaxTextWidth(face: Face): number;

  abstract getRotationAngle(): number;

  protected constructor(canvas: HTMLCanvasElement, map: Map, palette: Palette) {
    // Load settings.
    const settings = Settings.Default.game;
    this.settings = settings;

    // Basic setups: Scene, Renderer, Camera.
    const scene = new THREE.Scene();
    this.scene = scene;
    scene.fog = new THREE.Fog(
      settings.view.background,
      settings.view.fog.near,
      settings.view.camera.far
    );

    const renderer = new THREE.WebGLRenderer({
      antialias: settings.view.antialias,
      canvas
    });
    this.renderer = renderer;
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);

    const camera = new THREE.PerspectiveCamera(
      settings.view.camera.fov,
      canvas.clientWidth / canvas.clientHeight,
      settings.view.camera.near,
      settings.view.camera.far
    );
    this.camera = camera;
    camera.position.set(-100, 500, -100);

    // Map controls that supports scaling and panning.
    const controls = new MapControls(camera, canvas, settings.view.controls);
    this.controls = controls;

    // Load font.
    const loader = new FontLoader();
    this.font = loader.parse(fontObject as unknown as FontData);

    // Create materials.
    this.faceMaterial = new THREE.MeshLambertMaterial({
      vertexColors: true,
      side: THREE.DoubleSide
    });

    this.textMaterial = new THREE.MeshBasicMaterial();

    this.faceMaterial.onBeforeCompile = shader => {
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

      vertexShaderReplacements.forEach(rep => {
        shader.vertexShader = shader.vertexShader.replace(rep.from, rep.to);
      });

      fragmentShaderReplacements.forEach(rep => {
        shader.fragmentShader = shader.fragmentShader.replace(rep.from, rep.to);
      });

      shader.uniforms.colorTable = { value: colorTable };
    };

    // Resource tracker for automatic disposing.
    this.tracker = new ResourceTracker();

    // Add lights.
    {
      const light = new THREE.AmbientLight();
      scene.add(light);
      light.intensity = 2;
      light.matrixAutoUpdate = false;
      light.matrixWorldAutoUpdate = false;
    }

    const dirLight = new THREE.DirectionalLight();
    this.dirLight = dirLight;
    dirLight.intensity = 2;
    scene.add(dirLight);
    dirLight.add(dirLight.target);

    // Add faces.
    this.map = map;
    this.palette = palette;

    this.geometry = new THREE.BufferGeometry();
    this.textContainer = new THREE.Object3D();
    this.scene.add(this.textContainer);

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

    let rotationAngle;

    for (const [id, face] of this.map.entries()) {
      if (face.dir >= 0) {
        continue;
      }

      const text = this.textContainer.children[id];

      if (rotationAngle) {
        text.rotation.z = rotationAngle;
        text.updateMatrix();
        continue;
      }

      const rotation = text.rotation.clone();

      text.lookAt(text.position.clone().sub(cameraDirection));
      rotationAngle = text.rotation.z;

      text.rotation.set(rotation.x, rotation.y, rotationAngle);
      text.updateMatrix();

      if (rotationAngle === rotation.z) {
        break;
      }
    }

    this.dirLight.position.copy(this.camera.position);
    this.dirLight.target.position.copy(cameraDirection);

    this.renderer.render(this.scene, this.camera);
  }

  reset() {
    this.tracker.dispose();
  }

  updateColor(face: Face) {
    const attribute = this.geometry.getAttribute("colorIndex");
    const colors = attribute.array as Uint8Array;
    const start = this.faceColorStartingIndex[face.id];
    const end = this.faceColorStartingIndex[face.id + 1] - 1;

    for (let i = start; i <= end; i++) {
      colors[i] = face.color;
    }

    attribute.needsUpdate = true;
  }

  updateText(face: Face) {
    const text = this.textContainer.children[face.id].children[0] as THREE.Mesh;
    text.geometry.dispose();

    let geometry, subBoundingBox;
    const maxWidth = this.getMaxTextWidth(face);
    const string = face.amount === 0 ? "" : face.amount.toString();

    for (
      let size = this.settings.view.map.maxTextSize;
      size > this.settings.view.map.minTextSize;
      size -= 2
    ) {
      geometry = new THREE.ShapeGeometry(
        this.font.generateShapes(string, size)
      );
      geometry.computeBoundingBox();

      const { min, max } = geometry.boundingBox!;
      subBoundingBox = max.sub(min);

      if (subBoundingBox.x <= maxWidth) {
        break;
      }

      geometry.dispose();
    }

    text.geometry = geometry!;
    text.position.copy(subBoundingBox!.multiplyScalar(-0.5).setZ(1));
  }

  setup() {
    // Add helper container for positioning.
    const helper = new THREE.Object3D();
    this.scene.add(helper);

    const geometries = [];
    this.faceColorStartingIndex = [];

    let startingIndex = 0;

    for (const face of this.map) {
      // Place helper and container.
      this.placeHelper(helper, face);

      const container = new THREE.Object3D();
      container.matrixAutoUpdate = false;
      container.matrixWorldAutoUpdate = false;

      helper.add(container);
      this.placeContainer(container, face);

      container.updateMatrix();
      container.updateWorldMatrix(true, false);
      container.position.set(0, 0, 0);
      container.updateMatrix();
      container.removeFromParent();
      container.applyMatrix4(container.matrixWorld);

      this.textContainer.add(container);

      // Add geometry.
      {
        const geometry = this.createGeometry(face);

        const vertexCount = geometry.getAttribute("position").count;
        this.faceColorStartingIndex.push(startingIndex);

        const colors = new Uint8Array(vertexCount);
        colors.fill(face.color);
        const attribute = new THREE.BufferAttribute(colors, 1);

        geometry.setAttribute("colorIndex", attribute);
        geometry.applyMatrix4(container.matrixWorld);
        geometries.push(geometry);

        startingIndex += colors.length;
      }

      // Add text.
      {
        container.add(
          new THREE.Mesh(new THREE.BufferGeometry(), this.textMaterial)
        );
      }

      this.tracker.track(container);
    }

    this.faceColorStartingIndex.push(startingIndex);

    const mergedGeometry = BufferGeometryUtils.mergeGeometries(
      geometries,
      false
    );
    const mesh = new THREE.Mesh(mergedGeometry, this.faceMaterial);
    this.scene.add(mesh);
    this.tracker.track(mesh);
    this.geometry = mergedGeometry;

    helper.removeFromParent();

    for (const face of this.map) {
      this.updateColor(face);
      this.updateText(face);
    }
  }
}
