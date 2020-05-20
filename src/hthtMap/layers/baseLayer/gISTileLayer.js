import { ArcGisMapServerImageryProvider, GeographicTilingScheme } from 'cesium';

/* arcgis底图 */
export default class TdtOnlineCLayer {
  constructor(arcgisTileLayers) {
    this.baseLayers = []
    this.initLayer()
    this.arcgisTileLayers = arcgisTileLayers
  }

  initLayer() {
    // 影像图
    // eslint-disable-next-line camelcase
    const arcgis_img = new ArcGisMapServerImageryProvider({
      url: this.arcgisTileLayers.MAP_IMG,
      tilingScheme: new GeographicTilingScheme(),
      credit: 'arcgis_img'
    })
    // 矢量地图
    // eslint-disable-next-line camelcase
    const arcgis_vec = new ArcGisMapServerImageryProvider({
      url: this.arcgisTileLayers.MAP_VEC,
      tilingScheme: new GeographicTilingScheme(),
      credit: 'arcgis_vec'
    })

    // eslint-disable-next-line camelcase
    this.baseLayers = [arcgis_img, arcgis_vec]
  }
}
