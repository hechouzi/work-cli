import { WebMapTileServiceImageryProvider, GeographicTilingScheme } from 'cesium';

/* 在线天地图等经纬投影 */
export default class TdtOnlineCLayer {
  constructor() {
    this.baseLayers = []
    this.initTdtOnlineCLayer()
  }

  initTdtOnlineCLayer() {
    // 影像图
    // eslint-disable-next-line camelcase
    const tdt_img_c = new WebMapTileServiceImageryProvider({
      url: 'http://{s}.tianditu.gov.cn/img_c/wmts?service=wmts&request=GetTile&version=1.0.0' +
        '&LAYER=img&tileMatrixSet=c&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}' +
        '&style=default&format=tiles&tk=4aef299f1178a8329a9cdc325a055b85',
      layer: 'tdt_c_img',
      credit: 'tdt_c_img',
      style: 'default',
      format: 'tiles',
      tileMatrixSetID: 'c',
      subdomains: ['t0', 't1', 't2', 't3', 't4', 't5', 't6', 't7'],
      tilingScheme: new GeographicTilingScheme(),
      tileMatrixLabels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
      maximumLevel: 20
    })

    // 影像图标注
    // eslint-disable-next-line camelcase
    const tdt_cia_c = new WebMapTileServiceImageryProvider({
      url: 'http://{s}.tianditu.gov.cn/cia_c/wmts?service=wmts&request=GetTile&version=1.0.0' +
        '&LAYER=cia&tileMatrixSet=c&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}' +
        '&style=default.jpg&tk=4aef299f1178a8329a9cdc325a055b85',
      layer: 'tdt_c_img_cia',
      credit: 'tdt_c_img_cia',
      style: 'default',
      format: 'tiles',
      tileMatrixSetID: 'c',
      subdomains: ['t0', 't1', 't2', 't3', 't4', 't5', 't6', 't7'],
      tilingScheme: new GeographicTilingScheme(),
      tileMatrixLabels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
      maximumLevel: 20
    })

    // 矢量地图
    // eslint-disable-next-line camelcase
    const tdt_vec_c = new WebMapTileServiceImageryProvider({
      url: 'http://{s}.tianditu.gov.cn/vec_c/wmts?service=wmts&request=GetTile&version=1.0.0' +
        '&LAYER=vec&tileMatrixSet=c&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}' +
        '&style=default&format=tiles&tk=4aef299f1178a8329a9cdc325a055b85',
      layer: 'tdt_c_vec',
      credit: 'tdt_c_vec',
      style: 'default',
      format: 'tiles',
      tileMatrixSetID: 'c',
      subdomains: ['t0', 't1', 't2', 't3', 't4', 't5', 't6', 't7'],
      tilingScheme: new GeographicTilingScheme(),
      tileMatrixLabels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
      maximumLevel: 20
    })

    // 矢量地图标注
    // eslint-disable-next-line camelcase
    const tdt_cva_c = new WebMapTileServiceImageryProvider({
      url: 'http://{s}.tianditu.gov.cn/cva_c/wmts?service=wmts&request=GetTile&version=1.0.0' +
        '&LAYER=cva&tileMatrixSet=c&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}' +
        '&style=default.jpg&tk=4aef299f1178a8329a9cdc325a055b85',
      layer: 'tdt_c_vec_cva',
      credit: 'tdt_c_vec_cva',
      style: 'default',
      format: 'tiles',
      tileMatrixSetID: 'c',
      subdomains: ['t0', 't1', 't2', 't3', 't4', 't5', 't6', 't7'],
      tilingScheme: new GeographicTilingScheme(),
      tileMatrixLabels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
      maximumLevel: 20
    })

    // eslint-disable-next-line camelcase
    this.baseLayers = [tdt_img_c, tdt_cia_c, tdt_vec_c, tdt_cva_c]
  }
}
