import { Cartesian3 } from 'cesium';
import Color from './color'

/*
* point:位置；[118, 32]
* text:文字内容；str
* scale:大小；num
* fillColor:填充颜色；[255, 0, 0]||[255, 0, 0,1]
* */
export default class LabelEntity {
  constructor(id, point, text, scale, fillColor) {
    this.id = id
    this.position = new Cartesian3.fromDegrees(point[0], point[1])
    this.label = {
      text: text,
      scale: scale,
      fillColor: new Color(fillColor)
    }
  }
}
