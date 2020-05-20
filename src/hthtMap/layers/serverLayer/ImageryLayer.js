import Cesium from 'cesium/Cesium'
/* 图片图层 */
export default class ImageryLayer {
  /**
   * @param { String } url 图片
   * @param { Array } range 四角坐标
   */
  constructor (url, range) {
    this.url = url
    this.range = range
    this.initImageryLayer()
  }

  initImageryLayer () {
    const rectangle = Cesium.Rectangle.fromDegrees(this.range.minx, this.range.miny, this.range.maxx, this.range.maxy)
    this.provider = new Cesium.SingleTileImageryProvider({
      url: this.url,
      rectangle: rectangle
    })
  }
}