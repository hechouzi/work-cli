// import Cesium from 'cesium/Cesium'
import { UrlTemplateImageryProvider, WebMercatorTilingScheme } from 'cesium';

/* 在线谷歌底图 */
export default class GoogleLayer {
  constructor() {
    this.baseLayers = []
    this.initGoogleLayer()
  }

  initGoogleLayer() {
    // 谷歌影像地图
    // eslint-disable-next-line camelcase
    const google_img = new UrlTemplateImageryProvider({
      url: 'http://www.google.cn/maps/vt?lyrs=s@800&hl=zh-CN&gl=cn&x={x}&y={y}&z={z}',
      credit: 'google_img',
      layer: 'google_img',
      id: 'google_img',
      tilingScheme: new WebMercatorTilingScheme(),
      minimumLevel: 1,
      maximumLevel: 20
    })

    // 地图标注
    // eslint-disable-next-line camelcase
    const google_cia = new UrlTemplateImageryProvider({
      url: 'http://www.google.cn/maps/vt/lyrs=h@177000000&hl=zh-CN&gl=cn&x={x}&y={y}&z={z}&s=Galil',
      credit: 'google_img_cia',
      layer: 'google_img_cia',
      id: 'google_img_cia',
      tilingScheme: new WebMercatorTilingScheme(),
      minimumLevel: 1,
      maximumLevel: 20
    })

    // 矢量地图
    // eslint-disable-next-line camelcase
    const google_vec = new UrlTemplateImageryProvider({
      url: 'http://www.google.cn/maps/vt/lyrs=m@226000000&hl=zh-CN&gl=cn&x={x}&y={y}&z={z}&s=Galil',
      credit: 'google_vec',
      layer: 'google_vec',
      id: 'google_vec',
      tilingScheme: new WebMercatorTilingScheme(),
      minimumLevel: 1,
      maximumLevel: 20
    })
    // eslint-disable-next-line camelcase
    this.baseLayers = [google_img, google_cia, google_vec]
  }
}
