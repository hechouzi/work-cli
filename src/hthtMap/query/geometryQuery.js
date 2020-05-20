import Cesium from 'cesium/Cesium'
import axios from 'axios'

/* 空间查询 */
export default class GeometryQuery {
  /**
   * @param { Object } viewer 地图视图
   * @param { Object } layer 查询图层
   */
  constructor (viewer, layer) {
    this.viewer = viewer
    this.layer = layer
    this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas) // 鼠标事件
  }

  /**
   * 执行空间查询
   * @param spatialUrl wfs图层链接: 'http://192.168.1.249:16080/geoserver/jssthx/wfs?SERVICE=WFS&VERSION=1.1.1&REQUEST=GetFeature&outputformat=json'
   * @param layerName 查询的图层名称
   * @param geomType 查询的空间字段 ogc_geom,the_geom,geom,shape具体查询图层的要素属性
   * @param range 空间四角坐标  { minx, miny, maxx, maxy }
   * @param callback 查询结果回调
   */
  excuteQuery (spatialUrl, layerName, geomType, range, callback) {
    let filter = `${spatialUrl}&typename=${layerName}&Filter=%3CFilter%20xmlns:ogc=%22http://www.opengis.net/ogc%22%20xmlns:gml=%22http://www.opengis.net/gml%22%3E%3CIntersects%3E%20%3CPropertyName%3E${geomType}%3C/PropertyName%3E%20%3Cgml:Envelope%20srsName=%22EPSG:4326%22%3E%09%20%3Cgml:lowerCorner%3E${range.minx}%20${range.miny}%3C/gml:lowerCorner%3E%20%09%20%3Cgml:upperCorner%3E${range.maxx}%20${range.maxy}%3C/gml:upperCorner%3E%20%3C/gml:Envelope%3E%3C/Intersects%3E%3C/Filter%3E`
    // var filter = `${spatialUrl}&typename=${mapUrl}&Filter=%3CFilter%20xmlns:ogc=%22http://www.opengis.net/ogc%22%20xmlns:gml=%22http://www.opengis.net/gml%22%3E%3CIntersects%3E%20%3CPropertyName%3Ethe_geom%3C/PropertyName%3E%20%3Cgml:Envelope%20srsName=%22EPSG:4326%22%3E%09%20%3Cgml:lowerCorner%3E${120.52 - 0.0002709031105}%20${33.67 - 0.0002709031105}%3C/gml:lowerCorner%3E%20%09%20%3Cgml:upperCorner%3E${120.52 + 0.0002709031105}%20${33.67 + 0.0002709031105}%3C/gml:upperCorner%3E%20%3C/gml:Envelope%3E%3C/Intersects%3E%3C/Filter%3E`
    axios.post(filter).then(result => {
      if (result.status === 200) {
        if (callback) {
          callback(result.data.features)
        }
      }
    })
  }
}