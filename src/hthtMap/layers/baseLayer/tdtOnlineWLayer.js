import { WebMapTileServiceImageryProvider, GeographicTilingScheme } from 'cesium';

/* 在线天地图墨卡托投影 */
export default class TdtOnlineWLayer {
  constructor() {
    this.baseLayers = []
    this.initTdtOnlineWLayer()
  }

  initTdtOnlineWLayer() {
    // 影像图
    // eslint-disable-next-line camelcase
    const tdt_img_w = new WebMapTileServiceImageryProvider({
      url: 'http://{s}.tianditu.gov.cn/img_w/wmts?service=wmts&request=GetTile&version=1.0.0' +
        '&LAYER=img&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}' +
        '&style=default&format=tiles&tk=4aef299f1178a8329a9cdc325a055b85',
      layer: 'tdt_w_img',
      credit: 'tdt_w_img',
      style: 'default',
      format: 'image/jpeg',
      subdomains: ['t0', 't1', 't2', 't3', 't4', 't5', 't6', 't7'],
      maximumLevel: 20,
      minimumLevel: 0,
      tileMatrixSetID: 'GoogleMapsCompatible' // 一般使用EPSG:3857坐标系
    })

    // 影像图标注
    // eslint-disable-next-line camelcase
    const tdt_cia_w = new WebMapTileServiceImageryProvider({
      url: 'http://{s}.tianditu.gov.cn/cia_w/wmts?service=wmts&request=GetTile&version=1.0.0' +
        '&LAYER=cia&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}' +
        '&style=default.jpg&tk=4aef299f1178a8329a9cdc325a055b85',
      layer: 'tdt_w_img_cia',
      credit: 'tdt_w_img_cia',
      style: 'default',
      format: 'image/jpeg',
      subdomains: ['t0', 't1', 't2', 't3', 't4', 't5', 't6', 't7'],
      maximumLevel: 20,
      minimumLevel: 0,
      tileMatrixSetID: 'GoogleMapsCompatible' // 一般使用EPSG:3857坐标系
    })

    // 矢量地图
    // eslint-disable-next-line camelcase
    const tdt_vec_w = new WebMapTileServiceImageryProvider({
      url: 'http://{s}.tianditu.gov.cn/vec_w/wmts?service=wmts&request=GetTile&version=1.0.0' +
        '&LAYER=vec&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}' +
        '&style=default&format=tiles&tk=4aef299f1178a8329a9cdc325a055b85',
      layer: 'tdt_w_vec',
      credit: 'tdt_w_vec',
      style: 'default',
      format: 'image/jpeg',
      subdomains: ['t0', 't1', 't2', 't3', 't4', 't5', 't6', 't7'],
      maximumLevel: 20,
      minimumLevel: 0,
      tileMatrixSetID: 'GoogleMapsCompatible' // 一般使用EPSG:3857坐标系
    })

    // 矢量地图标注
    // eslint-disable-next-line camelcase
    const tdt_cva_w = new WebMapTileServiceImageryProvider({
      url: 'http://{s}.tianditu.gov.cn/cva_w/wmts?service=wmts&request=GetTile&version=1.0.0' +
        '&LAYER=cva&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}' +
        '&style=default.jpg&tk=4aef299f1178a8329a9cdc325a055b85',
      layer: 'tdt_w_vec_cva',
      credit: 'tdt_w_vec_cva',
      style: 'default',
      format: 'image/jpeg',
      subdomains: ['t0', 't1', 't2', 't3', 't4', 't5', 't6', 't7'],
      maximumLevel: 20,
      minimumLevel: 0,
      tileMatrixSetID: 'GoogleMapsCompatible' // 一般使用EPSG:3857坐标系
    })

    // eslint-disable-next-line camelcase
    this.baseLayers = [tdt_img_w, tdt_cia_w, tdt_vec_w, tdt_cva_w]
  }
}
