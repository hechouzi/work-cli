// import Cesium from 'cesium/Cesium'
import { UrlTemplateImageryProvider, WebMercatorTilingScheme } from 'cesium';

/* 在线高德底图 */
export default class AMapLayer {
  constructor() {
    this.baseLayers = []
    this.initAmapLayer()
  }

  initAmapLayer() {
    // 影像地图
    // eslint-disable-next-line camelcase
    const gaode_img = new UrlTemplateImageryProvider({
      url: 'https://webst01.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}',
      credit: 'gaode_img',
      layer: 'gaode_img',
      id: 'gaode_img',
      tilingScheme: new WebMercatorTilingScheme(),
      minimumLevel: 1,
      maximumLevel: 20
    })

    // 地图标注
    // eslint-disable-next-line camelcase
    const gaode_cia = new UrlTemplateImageryProvider({
      url: 'http://webst01.is.autonavi.com/appmaptile?style=8&x={x}&y={y}&z={z}',
      credit: 'gaode_img_cia',
      layer: 'gaode_img_cia',
      id: 'gaode_img_cia',
      tilingScheme: new WebMercatorTilingScheme(),
      minimumLevel: 1,
      maximumLevel: 20
    })

    // 矢量地图
    // eslint-disable-next-line camelcase
    const gaode_vec = new UrlTemplateImageryProvider({
      url: 'https://webrd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}',
      credit: 'gaode_vec',
      layer: 'gaode_vec',
      id: 'gaode_vec',
      tilingScheme: new WebMercatorTilingScheme(),
      minimumLevel: 1,
      maximumLevel: 20
    })

    // eslint-disable-next-line camelcase
    this.baseLayers = [gaode_img, gaode_cia, gaode_vec]
  }
}
