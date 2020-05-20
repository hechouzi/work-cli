import { Cartesian3 } from 'cesium'
import Color from './color'

/*
 * pointArray:线的路径；[[118, 32], [118, 33]]
 * color:填充颜色；[255, 0, 0]||[255, 0, 0,1]
 * width:宽度；num
 * */
export default class PolylineEntity {
  constructor(id, pointArray, color, width) {
    this.id = id
    this.polyline = {
      positions: new Cartesian3.fromDegreesArray(pointArray.flat()),
      material: new Color(color),
      width
    }
  }
}
