import { ImageryLayer, WebMapServiceImageryProvider } from 'cesium';

/*
* 加载服务
* info.：服务的信息
* layers：发布服务的名
* */
export default class WMSServerLayer extends ImageryLayer {
  constructor(info, time) {
    const wmsProvider = new WebMapServiceImageryProvider({
      url: info.url,
      layers: info.layerName,
      parameters: {
        service: 'WMS',
        format: 'image/png',
        transparent: true,
        time,
        sld_body: getStyle(info.colorValue, info.layerName)
      }
    })

    super(wmsProvider)
  }
}

// rgb转16进制
function to16(color) {
  const r = color[0]
  const g = color[1]
  const b = color[2]
  const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
  return hex
}

function getStyle(colorValue, layerName) {
  const colors = []

  for (let i = 0; i < colorValue.length; i++) {
    colors.push(
      {
        color: colorValue[i].color,
        value: colorValue[i].value,
        opacity: colorValue[i].opacity
      })
  }

  const styleLayerName = `<Name>${layerName}</Name>`
  let colorsString = ''
  colors.forEach(item => {
    if (item.opacity) {
      colorsString = colorsString + `<ColorMapEntry color="${item.color}" quantity="${item.value}" opacity="${item.opacity}"/>`
    } else {
      colorsString = colorsString + `<ColorMapEntry color="${item.color}" quantity="${item.value}"/>`
    }
  })
  const result = `<?xml version="1.0" encoding="UTF-8"?>
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
  return result
}
