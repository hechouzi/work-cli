import Cesium from 'cesium/Cesium'
/* WMS图层 */
export default class WMSLayer {
  /**
   * @param { String } url wms图层路径（必填）
   * @param { String } layers 图层名称（必填）
   * @param { String } cqlFilter 过滤条件（选填）属性筛选：name = '南京市'；空间筛选：INTERSECTS(the_geom, POLYGON((118.955104455667 31.5153937453101,118.955104455667 33.7249937453102,121.473504455667 33.7249937453102,121.473504455667 31.5153937453101,118.955104455667 31.5153937453101)))
   * @param { String } style geoserver设置的样式（选填）
   * @param { String } time 时间（选填）
   * @param { Array } colors 渲染数组（选填）
   */
  constructor (url, layers, cqlFilter = '', style = '', time = '', colors=[]) {
    this.url = url
    this.layers = layers
    this.cqlFilter = cqlFilter
    this.style = style
    this.time = time
    this.colors = colors
    this.provider = {}
    this.initWMSLayer()
  }

  initWMSLayer () {
    let parameters = {
      service: 'WMS',
      format: 'image/png',
      transparent: true,
    }
    this.cqlFilter ? Object.assign(parameters, { CQL_FILTER: this.cqlFilter }) : null

    this.style ? Object.assign(parameters, { styles: this.style }) : null
    // 有时次过滤添加时次过滤条件
    this.time ? Object.assign(parameters, { time: this.time }) : null
    // 前端渲染图层
    if (this.colors.length !== 0) {
      const styleLayerName = `<Name>${this.layers}</Name>`
      let colorsString = ''
      this.colors.forEach(item => {
        if (item.opacity) {
          colorsString = colorsString + `<ColorMapEntry color="${item.color}" quantity="${item.value}" opacity="${item.opacity}"/>`
        } else {
          colorsString = colorsString + `<ColorMapEntry color="${item.color}" quantity="${item.value}"/>`
        }
      })
      const sld = `<?xml version="1.0" encoding="UTF-8"?>
      <StyledLayerDescriptor version="1.0.0" xmlns="http://www.opengis.net/sld" xmlns:ogc="http://www.opengis.net/ogc"
      xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
      xsi:schemaLocation="http://www.opengis.net/sld http://schemas.opengis.net/sld/1.0.0/StyledLayerDescriptor.xsd">
      <NamedLayer>
      ${styleLayerName}
      <UserStyle>
      <Name>style</Name>
      <Title>NDVI distribution</Title>
      <FeatureTypeStyle>
      <Rule>
      <RasterSymbolizer>
      <Opacity>1.0</Opacity>
      <ColorMap>
      ${colorsString}
      </ColorMap>
      </RasterSymbolizer>
      </Rule>
      </FeatureTypeStyle>
      </UserStyle>
      </NamedLayer>
      </StyledLayerDescriptor>`
      Object.assign(parameters, { sld_body: sld })
    }
    const url = this.url
    const layers = this.layers
    this.provider = new Cesium.WebMapServiceImageryProvider({
      url,
      layers,
      parameters
    })
    this.layer = new Cesium.ImageryLayer(this.provider, { show: true })
  }
}