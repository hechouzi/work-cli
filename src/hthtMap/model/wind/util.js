import {
  Math as CMath,
  GeometryAttributes,
  GeometryAttribute,
  ComponentDatatype,
  defined,
  Texture,
  Framebuffer,
  Appearance,
  Geometry
} from 'cesium'
import axios from 'axios'

export const viewRectangleToLonLatRange = function (viewRectangle) {
  const range = {}

  const postiveWest = CMath.mod(viewRectangle.west, CMath.TWO_PI)
  const postiveEast = CMath.mod(viewRectangle.east, CMath.TWO_PI)
  const width = viewRectangle.width

  let longitudeMin
  let longitudeMax
  if (width > CMath.THREE_PI_OVER_TWO) {
    longitudeMin = 0.0
    longitudeMax = CMath.TWO_PI
  } else {
    if (postiveEast - postiveWest < width) {
      longitudeMin = postiveWest
      longitudeMax = postiveWest + width
    } else {
      longitudeMin = postiveWest
      longitudeMax = postiveEast
    }
  }

  range.lon = {
    min: CMath.toDegrees(longitudeMin),
    max: CMath.toDegrees(longitudeMax)
  }

  const south = viewRectangle.south
  const north = viewRectangle.north
  const height = viewRectangle.height

  const extendHeight = height > CMath.PI / 12 ? height / 2 : 0
  let extendedSouth = CMath.clampToLatitudeRange(south - extendHeight)
  let extendedNorth = CMath.clampToLatitudeRange(north + extendHeight)

  // extend the bound in high latitude area to make sure it can cover all the visible area
  if (extendedSouth < -CMath.PI_OVER_THREE) {
    extendedSouth = -CMath.PI_OVER_TWO
  }
  if (extendedNorth > CMath.PI_OVER_THREE) {
    extendedNorth = CMath.PI_OVER_TWO
  }

  range.lat = {
    min: CMath.toDegrees(extendedSouth),
    max: CMath.toDegrees(extendedNorth)
  }

  return range
}

export const createTexture = function (options, typedArray, type) {
  if (defined(typedArray)) {
    const source = {}
    source.arrayBufferView = typedArray
    options.source = source
  }

  const texture = new Texture(options)
  return texture
}

export const loadText = function (filePath) {
  const request = new XMLHttpRequest()
  request.open('GET', filePath, false)
  request.send()
  return request.responseText
}

export const createFramebuffer = function (context, colorTexture, depthTexture) {
  const framebuffer = new Framebuffer({
    context: context,
    colorTextures: [colorTexture],
    depthTexture: depthTexture
  })
  return framebuffer
}

export const createRawRenderState = function (options) {
  const translucent = true
  const closed = false
  const existing = {
    viewport: options.viewport,
    depthTest: options.depthTest,
    depthMask: options.depthMask,
    blending: options.blending
  }

  const rawRenderState = Appearance.getDefaultRenderState(translucent, closed, existing)
  return rawRenderState
}

export const getFullscreenQuad = function () {
  const fullscreenQuad = new Geometry({
    attributes: new GeometryAttributes({
      position: new GeometryAttribute({
        componentDatatype: ComponentDatatype.FLOAT,
        componentsPerAttribute: 3,
        //  v3----v2
        //  |     |
        //  |     |
        //  v0----v1
        values: new Float32Array([
          -1, -1, 0, // v0
          1, -1, 0, // v1
          1, 1, 0, // v2
          -1, 1, 0 // v3
        ])
      }),
      st: new GeometryAttribute({
        componentDatatype: ComponentDatatype.FLOAT,
        componentsPerAttribute: 2,
        values: new Float32Array([
          0, 0,
          1, 0,
          1, 1,
          0, 1
        ])
      })
    }),
    indices: new Uint32Array([3, 2, 0, 0, 2, 1])
  })
  return fullscreenQuad
}
