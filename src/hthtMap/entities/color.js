import { Color as CColor } from 'cesium';
/*
* [255,255,255,1]
* */
export default class Color extends CColor.fromBytes {
  constructor(color) {
    super(color[0], color[1], color[2], color[3] ? (color[3] * 255) : 255)
  }
}
