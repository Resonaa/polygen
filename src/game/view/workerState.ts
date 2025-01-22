import type fontObject from "@/static/Noto Sans SC Thin_Regular.json";
import type textureJson from "@/static/texture/texture.json";
import type textureImage from "@/static/texture/texture.png";

export interface State {
  fontObject: typeof fontObject;
  textureJson: typeof textureJson;
  textureImage: typeof textureImage;
}
