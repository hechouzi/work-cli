import {
  Cartesian2,
  BoundingSphere,
  Cartesian3
} from 'cesium'
import ParticleSystem from './particleSystem'

export default class Flow {
  constructor(viewer, windJson, {
    maxParticles,
    particleHeight,
    fadeOpacity,
    dropRate,
    dropRateBump,
    speedFactor,
    lineWidth
  }, colorTable) {
    this.viewer = viewer
    this.scene = viewer.scene
    this.camera = viewer.camera
    this.lonLatRange = [windJson.header.lo1, windJson.header.lo1 + (windJson.header.nx - 1) * windJson.header.dx,
      windJson.header.la1, windJson.header.la1 + (windJson.header.ny - 1) * windJson.header.dy]
    this.isShow = true

    const particlesTextureSize = Math.ceil(Math.sqrt(maxParticles))
    this.panel = {
      particlesTextureSize: particlesTextureSize,
      maxParticles: particlesTextureSize * particlesTextureSize,
      particleHeight,
      fadeOpacity,
      dropRate,
      dropRateBump,
      speedFactor,
      lineWidth
    }

    this.viewerParameters = {
      lonRange: new Cartesian2(),
      latRange: new Cartesian2(),
      pixelSize: 0.0
    }

    this.globeBoundingSphere = new BoundingSphere(Cartesian3.ZERO, 0.99 * 6378137.0)
    this.updateViewerParameters()

    const lonArray = []
    for (let i = 0; i < windJson.header.nx; i++) {
      lonArray.push(windJson.header.lo1 + i * windJson.header.dx)
    }
    const latArray = []
    for (let i = 0; i < windJson.header.ny; i++) {
      latArray.push(windJson.header.la1 + i * windJson.header.dy)
    }
    const colorArray = []
    for (let i = 0; i < colorTable.ncolors; i++) {
      colorArray[3 * i] = colorTable.colorTable[3 * i]
      colorArray[3 * i + 1] = colorTable.colorTable[3 * i + 1]
      colorArray[3 * i + 2] = colorTable.colorTable[3 * i + 2]
    }

    const data = {
      dimensions: {
        lon: windJson.header.nx,
        lat: windJson.header.ny,
        lev: 1
      },
      lon: {
        array: new Float32Array(lonArray),
        min: this.lonLatRange[0],
        max: this.lonLatRange[1]
      },
      lat: {
        array: new Float32Array(latArray),
        min: this.lonLatRange[2],
        max: this.lonLatRange[3]
      },
      lev: {
        array: new Float32Array(1),
        min: 1,
        max: 1
      },
      U: {
        array: new Float32Array(windJson.data.uComp),
        min: Math.min(...windJson.data.uComp),
        max: Math.max(...windJson.data.uComp)
      },
      V: {
        array: new Float32Array(windJson.data.vComp),
        min: Math.min(...windJson.data.vComp),
        max: Math.max(...windJson.data.vComp)
      },
      colorTable: {
        colorNum: colorTable.ncolors,
        array: new Float32Array(colorArray)
      }
    }

    this.particleSystem = new ParticleSystem(this.scene.context, data, this.panel, this.viewerParameters)
    this.addPrimitives()

    this.setupEventListeners()

    // this.imageryLayers = this.viewer.imageryLayers
    // this.setGlobeLayer(this.panel)
  }

  addPrimitives() {
    this.scene.primitives.add(this.particleSystem.particlesComputing.primitives.getWind)
    this.scene.primitives.add(this.particleSystem.particlesComputing.primitives.updateSpeed)
    this.scene.primitives.add(this.particleSystem.particlesComputing.primitives.updatePosition)
    this.scene.primitives.add(this.particleSystem.particlesComputing.primitives.postProcessingPosition)
    this.scene.primitives.add(this.particleSystem.particlesComputing.primitives.postProcessingSpeed)

    this.scene.primitives.add(this.particleSystem.particlesRendering.primitives.segments)
    this.scene.primitives.add(this.particleSystem.particlesRendering.primitives.trails)
    this.scene.primitives.add(this.particleSystem.particlesRendering.primitives.screen)
  }

  updateViewerParameters() {
    this.viewerParameters.lonRange.x = this.lonLatRange[0]
    this.viewerParameters.lonRange.y = this.lonLatRange[1]
    this.viewerParameters.latRange.x = this.lonLatRange[2]
    this.viewerParameters.latRange.y = this.lonLatRange[3]

    const pixelSize = this.camera.getPixelSize(
      this.globeBoundingSphere,
      this.scene.drawingBufferWidth,
      this.scene.drawingBufferHeight
    )

    if (pixelSize > 0) {
      this.viewerParameters.pixelSize = pixelSize
    }
  }

  setupEventListeners() {
    const that = this

    this.camera.moveStart.addEventListener(function () {
      // that.scene.primitives.show = false
      that.refresh(false)
    })

    this.camera.moveEnd.addEventListener(function () {
      if (!that.isShow) {
        return
      }

      that.updateViewerParameters()
      that.particleSystem.applyViewerParameters(that.viewerParameters)
      // that.scene.primitives.show = true
      that.refresh(true)
    })

    let resized = false
    window.addEventListener('resize', function () {
      resized = true
      // that.scene.primitives.show = false
      that.refresh(false)
      that.scene.primitives.removeAll()
    })

    this.scene.preRender.addEventListener(function () {
      if (!that.isShow) {
        return
      }

      if (resized) {
        that.particleSystem.canvasResize(that.scene.context)
        resized = false
        that.addPrimitives()
        // that.scene.primitives.show = true
        that.refresh(true)
      }
    })
  }

  refresh(isShow) {
    const primitivesArray = this.scene.primitives._primitives
    for (let i = 0; i < primitivesArray.length; i++) {
      if (primitivesArray[i].commandType === 'Compute' || primitivesArray[i].commandType === 'Draw') {
        this.viewer.changePrimitiveShow(primitivesArray[i], isShow)
      }
    }
  }

  // 控制显隐
  changeShow(isShow) {
    this.isShow = isShow
    this.refresh(isShow)
  }

  // 销毁
  destroy() {
    this.viewer.removeAllPrimitive()
  }
}
