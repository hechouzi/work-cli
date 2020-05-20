import {
  PixelFormat,
  PixelDatatype,
  Sampler,
  TextureMinificationFilter,
  TextureMagnificationFilter,
  Cartesian3,
  Cartesian2,
  Geometry,
  GeometryAttributes,
  GeometryAttribute,
  ComponentDatatype,
  PrimitiveType,
  DepthFunction,
  ShaderSource
} from 'cesium'
import CustomPrimitive from './customPrimitive'
import { createTexture, loadText, createFramebuffer, createRawRenderState, getFullscreenQuad } from './util'
import { randomizeParticles } from './dataProcess'
import { fileOptions } from './gui'

export default class ParticlesRendering {
  constructor(context, data, userInput, viewerParameters, particlesComputing) {
    this.createRenderingTextures(context, data)
    this.createRenderingFramebuffers(context)
    this.createRenderingPrimitives(context, userInput, viewerParameters, particlesComputing)
  }

  createRenderingTextures(context, data) {
    const colorTextureOptions = {
      context: context,
      width: context.drawingBufferWidth,
      height: context.drawingBufferHeight,
      pixelFormat: PixelFormat.RGBA,
      pixelDatatype: PixelDatatype.UNSIGNED_BYTE
    }
    const depthTextureOptions = {
      context: context,
      width: context.drawingBufferWidth,
      height: context.drawingBufferHeight,
      pixelFormat: PixelFormat.DEPTH_COMPONENT,
      pixelDatatype: PixelDatatype.UNSIGNED_INT
    }
    const colorTableTextureOptions = {
      context: context,
      width: data.colorTable.colorNum,
      height: 1,
      pixelFormat: PixelFormat.RGB,
      pixelDatatype: PixelDatatype.FLOAT,
      sampler: new Sampler({
        minificationFilter: TextureMinificationFilter.LINEAR,
        magnificationFilter: TextureMagnificationFilter.LINEAR
      })
    }

    this.textures = {
      segmentsColor: createTexture(colorTextureOptions),
      segmentsDepth: createTexture(depthTextureOptions),

      currentTrailsColor: createTexture(colorTextureOptions),
      currentTrailsDepth: createTexture(depthTextureOptions),

      nextTrailsColor: createTexture(colorTextureOptions),
      nextTrailsDepth: createTexture(depthTextureOptions),

      colorTable: createTexture(colorTableTextureOptions, data.colorTable.array)
    }
  }

  createRenderingFramebuffers(context) {
    this.framebuffers = {
      segments: createFramebuffer(context, this.textures.segmentsColor, this.textures.segmentsDepth),
      currentTrails: createFramebuffer(context, this.textures.currentTrailsColor, this.textures.currentTrailsDepth),
      nextTrails: createFramebuffer(context, this.textures.nextTrailsColor, this.textures.nextTrailsDepth)
    }
  }

  createSegmentsGeometry(userInput) {
    const repeatVertex = 4

    let st = []
    for (let s = 0; s < userInput.particlesTextureSize; s++) {
      for (let t = 0; t < userInput.particlesTextureSize; t++) {
        for (let i = 0; i < repeatVertex; i++) {
          st.push(s / userInput.particlesTextureSize)
          st.push(t / userInput.particlesTextureSize)
        }
      }
    }
    st = new Float32Array(st)

    let normal = []
    const pointToUse = [-1, 1]
    const offsetSign = [-1, 1]
    for (let i = 0; i < userInput.maxParticles; i++) {
      for (let j = 0; j < repeatVertex / 2; j++) {
        for (let k = 0; k < repeatVertex / 2; k++) {
          normal.push(pointToUse[j])
          normal.push(offsetSign[k])
          normal.push(0)
        }
      }
    }
    normal = new Float32Array(normal)

    const indexSize = 6 * userInput.maxParticles
    const vertexIndexes = new Uint32Array(indexSize)
    for (let i = 0, j = 0, vertex = 0; i < userInput.maxParticles; i++) {
      vertexIndexes[j++] = vertex + 0
      vertexIndexes[j++] = vertex + 1
      vertexIndexes[j++] = vertex + 2
      vertexIndexes[j++] = vertex + 2
      vertexIndexes[j++] = vertex + 1
      vertexIndexes[j++] = vertex + 3
      vertex += 4
    }

    const geometry = new Geometry({
      attributes: new GeometryAttributes({
        st: new GeometryAttribute({
          componentDatatype: ComponentDatatype.FLOAT,
          componentsPerAttribute: 2,
          values: st
        }),
        normal: new GeometryAttribute({
          componentDatatype: ComponentDatatype.FLOAT,
          componentsPerAttribute: 3,
          values: normal
        })
      }),
      indices: vertexIndexes
    })

    return geometry
  }

  createRenderingPrimitives(context, userInput, viewerParameters, particlesComputing) {
    const that = this
    this.primitives = {
      segments: new CustomPrimitive({
        commandType: 'Draw',
        attributeLocations: {
          st: 0,
          normal: 1
        },
        geometry: this.createSegmentsGeometry(userInput),
        primitiveType: PrimitiveType.TRIANGLES,
        uniformMap: {
          currentParticlesPosition: function () {
            return particlesComputing.particlesTextures.currentParticlesPosition
          },
          postProcessingPosition: function () {
            return particlesComputing.particlesTextures.postProcessingPosition
          },
          postProcessingSpeed: function () {
            return particlesComputing.particlesTextures.postProcessingSpeed
          },
          colorTable: function () {
            return that.textures.colorTable
          },
          aspect: function () {
            return context.drawingBufferWidth / context.drawingBufferHeight
          },
          pixelSize: function () {
            return viewerParameters.pixelSize
          },
          lineWidth: function () {
            return userInput.lineWidth
          },
          particleHeight: function () {
            return userInput.particleHeight
          }
        },
        vertexShaderSource: new ShaderSource({
          sources: [loadText(fileOptions.glslDirectory + 'segmentDraw.vert')]
        }),
        fragmentShaderSource: new ShaderSource({
          sources: [loadText(fileOptions.glslDirectory + 'segmentDraw.frag')]
        }),
        rawRenderState: createRawRenderState({
          // undefined value means let Cesium deal with it
          viewport: undefined,
          depthTest: {
            enabled: true
          },
          depthMask: true
        }),
        framebuffer: this.framebuffers.segments,
        autoClear: true
      }),

      trails: new CustomPrimitive({
        commandType: 'Draw',
        attributeLocations: {
          position: 0,
          st: 1
        },
        geometry: getFullscreenQuad(),
        primitiveType: PrimitiveType.TRIANGLES,
        uniformMap: {
          segmentsColorTexture: function () {
            return that.textures.segmentsColor
          },
          segmentsDepthTexture: function () {
            return that.textures.segmentsDepth
          },
          currentTrailsColor: function () {
            return that.framebuffers.currentTrails.getColorTexture(0)
          },
          trailsDepthTexture: function () {
            return that.framebuffers.currentTrails.depthTexture
          },
          fadeOpacity: function () {
            return userInput.fadeOpacity
          }
        },
        // prevent Cesium from writing depth because the depth here should be written manually
        vertexShaderSource: new ShaderSource({
          defines: ['DISABLE_GL_POSITION_LOG_DEPTH'],
          sources: [loadText(fileOptions.glslDirectory + 'fullscreen.vert')]
        }),
        fragmentShaderSource: new ShaderSource({
          defines: ['DISABLE_LOG_DEPTH_FRAGMENT_WRITE'],
          sources: [loadText(fileOptions.glslDirectory + 'trailDraw.frag')]
        }),
        rawRenderState: createRawRenderState({
          viewport: undefined,
          depthTest: {
            enabled: true,
            func: DepthFunction.ALWAYS // always pass depth test for full control of depth information
          },
          depthMask: true
        }),
        framebuffer: this.framebuffers.nextTrails,
        autoClear: true,
        preExecute: function () {
          // swap framebuffers before binding
          const temp = that.framebuffers.currentTrails
          that.framebuffers.currentTrails = that.framebuffers.nextTrails
          that.framebuffers.nextTrails = temp

          // keep the framebuffers up to date
          that.primitives.trails.commandToExecute.framebuffer = that.framebuffers.nextTrails
          that.primitives.trails.clearCommand.framebuffer = that.framebuffers.nextTrails
        }
      }),

      screen: new CustomPrimitive({
        commandType: 'Draw',
        attributeLocations: {
          position: 0,
          st: 1
        },
        geometry: getFullscreenQuad(),
        primitiveType: PrimitiveType.TRIANGLES,
        uniformMap: {
          trailsColorTexture: function () {
            return that.framebuffers.nextTrails.getColorTexture(0)
          },
          trailsDepthTexture: function () {
            return that.framebuffers.nextTrails.depthTexture
          }
        },
        // prevent Cesium from writing depth because the depth here should be written manually
        vertexShaderSource: new ShaderSource({
          defines: ['DISABLE_GL_POSITION_LOG_DEPTH'],
          sources: [loadText(fileOptions.glslDirectory + 'fullscreen.vert')]
        }),
        fragmentShaderSource: new ShaderSource({
          defines: ['DISABLE_LOG_DEPTH_FRAGMENT_WRITE'],
          sources: [loadText(fileOptions.glslDirectory + 'screenDraw.frag')]
        }),
        rawRenderState: createRawRenderState({
          viewport: undefined,
          depthTest: {
            enabled: false
          },
          depthMask: true,
          blending: {
            enabled: true
          }
        }),
        framebuffer: undefined // undefined value means let Cesium deal with it
      })
    }
  }
}
