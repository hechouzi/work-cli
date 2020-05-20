import {
  WebMapTileServiceImageryProvider,
  GeographicTilingScheme,
  ImageryLayer
} from 'cesium';
/* WMTS图层 */
export default class WMTSLayer {
  /**
   * @param { String } coordinateType 坐标类型 4326:等经纬；3857:墨卡托
   * @param { Object } options 图层配置参数
   * @param { Object } wmtsProvider wmts图层
   */
  constructor(coordinateType, options) {
    this.coordinateType = coordinateType
    this.options = options
    this.provider = {}
    this.initWMTSLayer()
  }

  initWMTSLayer() {
    if (this.coordinateType === '4326') {
      // 设置金字塔模型
      let tileMatrixLabels = []
      const levelLength = this.options.maximumLevel
      for (let i = 0; i < levelLength; i++) {
        tileMatrixLabels.push(`${this.options.tileMatrixSetID}:${i}`)
      }
      this.provider = new WebMapTileServiceImageryProvider({
        url: this.options.url, // 必填
        layer: this.options.layer, // 必填
        style: this.options.style ? this.options.style : '', // 选填 默认''
        format: this.options.format ? this.options.format : 'image/png', // 选填 默认'image/png'
        maximumLevel: this.options.maximumLevel ? this.options.maximumLevel : 21, // 选填
        minimumLevel: this.options.minimumLevel ? this.options.minimumLevel : 0, // 选填
        tileMatrixSetID: this.options.tileMatrixSetID,
        tilingScheme: new GeographicTilingScheme(),
        tileMatrixLabels
      })
    } else if (this.coordinateType === '3857') {
      this.provider = new WebMapTileServiceImageryProvider({
        url: this.options.url, // 必填
        layer: this.options.layer, // 必填
        style: this.options.style ? this.options.style : '', // 选填 默认''
        format: this.options.format ? this.options.format : 'image/png', // 选填 默认'image/png'
        tileMatrixSetID: this.options.tileMatrixSetID, // 必填 
        maximumLevel: this.options.maximumLevel ? this.options.maximumLevel : 21, // 选填
        minimumLevel: this.options.minimumLevel ? this.options.minimumLevel : 0 // 选填
      })
    }
    this.layer = new ImageryLayer(this.provider, { show: true })
  }
}