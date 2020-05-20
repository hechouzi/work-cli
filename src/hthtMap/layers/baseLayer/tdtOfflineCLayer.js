import { WebMapTileServiceImageryProvider, GeographicTilingScheme } from 'cesium';

/* 离线天地图等经纬投影 */
export default class TdtOnlineCLayer {
  constructor(offLineTdtLayers) {
    this.baseLayers = []
    this.offLineTdtLayers = offLineTdtLayers
    this.initTdtOfflineCLayer()
  }

  initTdtOfflineCLayer() {
    // 影像图
    // eslint-disable-next-line camelcase
    const tdt_img_off = new WebMapTileServiceImageryProvider({
      url: this.offLineTdtLayers.MAP_IMG,
      layer: 'tdt_off_img',
      credit: 'tdt_off_img',
      style: '',
      format: 'image/png',
      maximumLevel: 20,
      minimumLevel: 0,
      tileMatrixSetID: 'EPSG:4326',
      tilingScheme: new GeographicTilingScheme(),
      tileMatrixLabels: [
        'EPSG:4326:0',
        'EPSG:4326:1',
        'EPSG:4326:2',
        'EPSG:4326:3',
        'EPSG:4326:4',
        'EPSG:4326:5',
        'EPSG:4326:6',
        'EPSG:4326:7',
        'EPSG:4326:8',
        'EPSG:4326:9',
        'EPSG:4326:10',
        'EPSG:4326:11'
      ]
    })

    // 矢量地图
    // eslint-disable-next-line camelcase
    const tdt_vec_off = new WebMapTileServiceImageryProvider({
      url: this.offLineTdtLayers.MAP_VEC,
      layer: 'tdt_off_vec',
      credit: 'tdt_off_vec',
      style: '',
      format: 'image/png',
      maximumLevel: 20,
      minimumLevel: 0,
      tileMatrixSetID: 'EPSG:4326', // 一般使用EPSG:3857坐标系
      tilingScheme: new GeographicTilingScheme(),
      tileMatrixLabels: [
        'EPSG:4326:0',
        'EPSG:4326:1',
        'EPSG:4326:2',
        'EPSG:4326:3',
        'EPSG:4326:4',
        'EPSG:4326:5',
        'EPSG:4326:6',
        'EPSG:4326:7',
        'EPSG:4326:8',
        'EPSG:4326:9',
        'EPSG:4326:10',
        'EPSG:4326:11'
      ]
    })

    // eslint-disable-next-line camelcase
    this.baseLayers = [tdt_img_off, tdt_vec_off]
  }
}
