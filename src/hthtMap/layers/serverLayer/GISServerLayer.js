import Cesium from 'cesium/Cesium'
/* arcgis服务图层 */
export default class GISServerLayer {
  /**
   * @param { String } url 图片
   */
  constructor(url) {
    this.url = url
    this.initGisLayer()
  }

  initGisLayer() {
    this.provider = new Cesium.ArcGisMapServerImageryProvider({
      url: this.url,
      credit: 'arcgisMap'
    })
    this.layer = new Cesium.ImageryLayer(this.provider, { show: true })
  }
}
