import {
  type PerspectiveCamera,
  Scene,
  WebGLRenderTarget,
  type WebGPURenderer
} from "three/webgpu";

export class PickHelper {
  pickingTexture = new WebGLRenderTarget(1, 1);
  pickedObject = null;
  scene = new Scene();
  getPos(event: PointerEvent, canvas: HTMLCanvasElement) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) * canvas.width) / rect.width,
      y: ((event.clientY - rect.top) * canvas.height) / rect.height
    };
  }

  async pick(
    pos: { x: number; y: number },
    renderer: WebGPURenderer,
    camera: PerspectiveCamera,
    pixelRatio: number
  ) {
    const context = renderer.getContext() as unknown as WebGLRenderingContext;

    camera.setViewOffset(
      context.canvas.width, // full width
      context.canvas.height, // full top
      (pos.x * pixelRatio) | 0, // rect x
      (pos.y * pixelRatio) | 0, // rect y
      1, // rect width
      1 // rect height
    );

    // render the scene
    renderer.setRenderTarget(this.pickingTexture);
    renderer.render(this.scene, camera);
    renderer.setRenderTarget(null);

    // clear the view offset so rendering returns to normal
    camera.clearViewOffset();

    // read the pixel
    const buffer = await renderer.readRenderTargetPixelsAsync(
      this.pickingTexture,
      0, // x
      0, // y
      1, // width
      1 // height
    );

    const id = (buffer[0] << 16) | (buffer[1] << 8) | buffer[2];

    return id > 0 ? id - 1 : null;
  }
}
