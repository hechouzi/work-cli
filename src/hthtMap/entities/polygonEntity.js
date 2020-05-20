import { Cartesian3 } from 'cesium'
import Color from './color'

/*
 * pointArray:填充图的路径；[[118, 32], [119, 32], [119, 33], [118, 32]]
 * color:填充颜色；[255, 0, 0]||[255, 0, 0,1]
 * */
export default class PolygonEntity {
  constructor(id, pointArray, color) {
    this.id = id
    this.polygon = {
      hierarchy: new Cartesian3.fromDegreesArray(pointArray.flat()),
      material: new Color(color)
    }
  }
}
