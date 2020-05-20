import {
  PixelFormat,
  PixelDatatype,
  Sampler,
  TextureMinificationFilter,
  TextureMagnificationFilter,
  Cartesian3,
  Cartesian2,
  ShaderSource
} from 'cesium'
import CustomPrimitive from './customPrimitive'
import { createTexture, loadText } from './util'
import { randomizeParticles } from './dataProcess'
import { fileOptions } from './gui'

export default class ParticlesComputing {
  constructor(context, data, userInput, viewerParameters) {
    this.data = data
    this.createWindTextures(context, data)
    this.createParticlesTextures(context, userInput, viewerParameters)
    this.createComputingPrimitives(data, userInput, viewerParameters)
  }

  createWindTextures(context, data) {
    const windTextureOptions = {
      context: context,
      width: data.dimensions.lon,
      height: data.dimensions.lat * data.dimensions.lev,
      pixelFormat: PixelFormat.LUMINANCE,
      pixelDatatype: PixelDatatype.FLOAT,
      flipY: false,
      sampler: new Sampler({
        // the values of texture will not be interpolated
        minificationFilter: TextureMinificationFilter.NEAREST,
        magnificationFilter: TextureMagnificationFilter.NEAREST
      })
    }

    this.windTextures = {
      U: createTexture(windTextureOptions, data.U.array, 1),
      V: createTexture(windTextureOptions, data.V.array, 2)
    }
  }

  createParticlesTextures(context, userInput, viewerParameters) {
    const particlesTextureOptions = {
      context: context,
      width: userInput.particlesTextureSize,
      height: userInput.particlesTextureSize,
      pixelFormat: PixelFormat.RGBA,
      pixelDatatype: PixelDatatype.FLOAT,
      flipY: false,
      sampler: new Sampler({
        // the values of texture will not be interpolated
        minificationFilter: TextureMinificationFilter.NEAREST,
        magnificationFilter: TextureMagnificationFilter.NEAREST
      })
    }

    const particlesArray = randomizeParticles(userInput.maxParticles, viewerParameters, this.data)

    this.particlesTextures = {
      particlesWind: createTexture(particlesTextureOptions),

      currentParticlesPosition: createTexture(particlesTextureOptions, particlesArray, 4),
      nextParticlesPosition: createTexture(particlesTextureOptions, particlesArray, 5),

      currentParticlesSpeed: createTexture(particlesTextureOptions),
      nextParticlesSpeed: createTexture(particlesTextureOptions),

      postProcessingPosition: createTexture(particlesTextureOptions, particlesArray, 8),
      postProcessingSpeed: createTexture(particlesTextureOptions)
    }
  }

  destroyParticlesTextures() {
    Object.keys(this.particlesTextures).forEach((key) => {
      this.particlesTextures[key].destroy()
    })
  }

  createComputingPrimitives(data, userInput, viewerParameters) {
    const dimension = new Cartesian3(data.dimensions.lon, data.dimensions.lat, data.dimensions.lev)
    const minimum = new Cartesian3(data.lon.min, data.lat.min, data.lev.min)
    const maximum = new Cartesian3(data.lon.max, data.lat.max, data.lev.max)
    const interval = new Cartesian3(
      (maximum.x - minimum.x) / (dimension.x - 1),
      (maximum.y - minimum.y) / (dimension.y - 1),
      dimension.z > 1 ? (maximum.z - minimum.z) / (dimension.z - 1) : 1.0
    )
    const uSpeedRange = new Cartesian2(data.U.min, data.U.max)
    const vSpeedRange = new Cartesian2(data.V.min, data.V.max)

    const that = this
    this.primitives = {
      getWind: new CustomPrimitive({
        commandType: 'Compute',
        uniformMap: {
          U: function () {
            return that.windTextures.U
          },
          V: function () {
            return that.windTextures.V
          },
          currentParticlesPosition: function () {
            return that.particlesTextures.currentParticlesPosition
          },
          dimension: function () {
            return dimension
          },
          minimum: function () {
            return minimum
          },
          maximum: function () {
            return maximum
          },
          interval: function () {
            return interval
          }
        },
        fragmentShaderSource: new ShaderSource({
          sources: [loadText(fileOptions.glslDirectory + 'getWind.frag')]
        }),
        outputTexture: this.particlesTextures.particlesWind,
        preExecute: function () {
          // keep the outputTexture up to date
          that.primitives.getWind.commandToExecute.outputTexture = that.particlesTextures.particlesWind
        }
      }),

      updateSpeed: new CustomPrimitive({
        commandType: 'Compute',
        uniformMap: {
          currentParticlesSpeed: function () {
            return that.particlesTextures.currentParticlesSpeed
          },
          particlesWind: function () {
            return that.particlesTextures.particlesWind
          },
          uSpeedRange: function () {
            return uSpeedRange
          },
          vSpeedRange: function () {
            return vSpeedRange
          },
          pixelSize: function () {
            return viewerParameters.pixelSize
          },
          speedFactor: function () {
            return userInput.speedFactor
          }
        },
        fragmentShaderSource: new ShaderSource({
          sources: [loadText(fileOptions.glslDirectory + 'updateSpeed.frag')]
        }),
        outputTexture: this.particlesTextures.nextParticlesSpeed,
        preExecute: function () {
          // swap textures before binding
          const temp = that.particlesTextures.currentParticlesSpeed
          that.particlesTextures.currentParticlesSpeed = that.particlesTextures.postProcessingSpeed
          that.particlesTextures.postProcessingSpeed = temp

          // keep the outputTexture up to date
          that.primitives.updateSpeed.commandToExecute.outputTexture = that.particlesTextures.nextParticlesSpeed
        }
      }),

      updatePosition: new CustomPrimitive({
        commandType: 'Compute',
        uniformMap: {
          currentParticlesPosition: function () {
            return that.particlesTextures.currentParticlesPosition
          },
          currentParticlesSpeed: function () {
            return that.particlesTextures.currentParticlesSpeed
          }
        },
        fragmentShaderSource: new ShaderSource({
          sources: [loadText(fileOptions.glslDirectory + 'updatePosition.frag')]
        }),
        outputTexture: this.particlesTextures.nextParticlesPosition,
        preExecute: function () {
          // swap textures before binding
          const temp = that.particlesTextures.currentParticlesPosition
          that.particlesTextures.currentParticlesPosition = that.particlesTextures.postProcessingPosition
          that.particlesTextures.postProcessingPosition = temp

          // keep the outputTexture up to date
          that.primitives.updatePosition.commandToExecute.outputTexture = that.particlesTextures.nextParticlesPosition
        }
      }),

      postProcessingPosition: new CustomPrimitive({
        commandType: 'Compute',
        uniformMap: {
          nextParticlesPosition: function () {
            return that.particlesTextures.nextParticlesPosition
          },
          nextParticlesSpeed: function () {
            return that.particlesTextures.nextParticlesSpeed
          },
          lonRange: function () {
            return viewerParameters.lonRange
          },
          latRange: function () {
            return viewerParameters.latRange
          },
          randomCoef: function () {
            const randomCoef = Math.random()
            return randomCoef
          },
          dropRate: function () {
            return userInput.dropRate
          },
          dropRateBump: function () {
            return userInput.dropRateBump
          }
        },
        fragmentShaderSource: new ShaderSource({
          sources: [loadText(fileOptions.glslDirectory + 'postProcessingPosition.frag')]
        }),
        outputTexture: this.particlesTextures.postProcessingPosition,
        preExecute: function () {
          // keep the outputTexture up to date
          that.primitives.postProcessingPosition.commandToExecute.outputTexture = that.particlesTextures.postProcessingPosition
        }
      }),

      postProcessingSpeed: new CustomPrimitive({
        commandType: 'Compute',
        uniformMap: {
          postProcessingPosition: function () {
            return that.particlesTextures.postProcessingPosition
          },
          nextParticlesSpeed: function () {
            return that.particlesTextures.nextParticlesSpeed
          }
        },
        fragmentShaderSource: new ShaderSource({
          sources: [loadText(fileOptions.glslDirectory + 'postProcessingSpeed.frag')]
        }),
        outputTexture: this.particlesTextures.postProcessingSpeed,
        preExecute: function () {
          // keep the outputTexture up to date
          that.primitives.postProcessingSpeed.commandToExecute.outputTexture = that.particlesTextures.postProcessingSpeed
        }
      })
    }
  }
}
