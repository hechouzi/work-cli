import { Cartesian3 } from 'cesium';
import Color from "./color";

/*
 * id:id
 * point:点位置；[118, 32]
 * color:填充颜色；[255, 0, 0]||[255, 0, 0,1]
 * pixelSize:大小；num
 * */
export default class PointEntity {
  constructor(id, point, color, pixelSize) {
    this.id = id;
    this.position = new Cartesian3.fromDegrees(point[0], point[1]);
    this.point = {
      color: new Color(color),
      pixelSize: pixelSize
    };
  }
}
