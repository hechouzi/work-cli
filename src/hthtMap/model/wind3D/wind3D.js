import Cesium from 'cesium/Cesium'
import ParticleSystem from './particleSystem'
import {Util} from './util'

export default class Wind3D {
  constructor(viewer) {
    let options = {
      baseLayerPicker: false,
      geocoder: false,
      infoBox: false,
      fullscreenElement: 'mapContainer',
      scene3DOnly: true
    }

     viewer = new Cesium.Viewer('mapContainer', options);


    this.viewer = viewer
    this.scene = viewer.scene
    this.camera = viewer.camera

    this.viewerParameters = {
      lonRange: new Cesium.Cartesian2(),
      latRange: new Cesium.Cartesian2(),
      pixelSize: 0.0
    }

    this.userInput = {
      particlesTextureSize: Math.ceil(Math.sqrt(16384)),
      articlesTextureSize: 128,
      maxParticles: 16384,
      particleHeight: 100,
      fadeOpacity: 0.996,
      dropRate: 0.003,
      dropRateBump: 0.01,
      speedFactor: 4,
      lineWidth: 4
    }
    // use a smaller earth radius to make sure distance to camera > 0
    this.globeBoundingSphere = new Cesium.BoundingSphere(Cesium.Cartesian3.ZERO, 0.99 * 6378137.0)
    this.updateViewerParameters()

    // this.imageryLayers = this.viewer.imageryLayers
    // this.setGlobeLayer(this.panel.getUserInput())
  }

  loadData(inData) {
    let lonArray = [], latArray = []
    for (let i = 0; i < inData.header.nx; i += inData.header.dx) {
      lonArray.push(inData.header.lo1 + i)
    }

    for (let i = 0; i < inData.header.ny; i += inData.header.dy) {
      latArray.push(inData.header.la1 + i)
    }

    const data = {
      dimensions: {
        lon: inData.header.nx,
        lat: inData.header.ny,
        lev: 1
      },
      lon: {
        array: new Float32Array(lonArray),
        min: lonArray[0],
        max: lonArray[lonArray.length - 1]
      },
      lat: {
        array: new Float32Array(latArray),
        min: latArray[0],
        max: latArray[latArray.length - 1]
      },
      lev: {
        array: new Float32Array(1),
        min: 1,
        max: 1
      },
      U: {
        array: new Float32Array(inData.data.uComp),
        min: Math.min(...inData.data.uComp),
        max: Math.max(...inData.data.uComp)
      },
      V: {
        array: new Float32Array(inData.data.vComp),
        min: Math.min(...inData.data.vComp),
        max: Math.max(...inData.data.vComp)
      },
      colorTable: {
        colorNum: 16,
        array: new Float32Array([0.015685999765992165, 0.05490199849009514, 0.8470590114593506, 0.1254899948835373, 0.31372499465942383, 1, 0.2549020051956177, 0.5882350206375122, 1, 0.4274510145187378, 0.756862998008728, 1, 0.5254899859428406, 0.8509799838066101, 1, 0.6117650270462036, 0.9333329796791077, 1, 0.6862750053405762, 0.9607840180397034, 1, 0.807843029499054, 1, 1, 1, 0.9960780143737793, 0.2784309983253479, 1, 0.9215689897537231, 0, 1, 0.7686269879341125, 0, 1, 0.564706027507782, 0, 1, 0.282353013753891, 0, 1, 0, 0, 0.8352940082550049, 0, 0, 0.6196079850196838, 0, 0])
      }
    }

    console.warn(data)
    this.particleSystem = new ParticleSystem(this.scene.context, data,
      this.userInput, this.viewerParameters)
    this.addPrimitives()

    this.setupEventListeners()
  }

  addPrimitives() {
    // the order of primitives.add() should respect the dependency of primitives
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
    // console.warn(this.camera)
    // console.warn(this.camera.__proto__.computeViewRectangle())
    // console.warn(this.camera.computeViewRectangle())
    // console.warn(this.scene.globe.ellipsoid)
    const viewRectangle = this.viewer.camera.computeViewRectangle(this.scene.globe.ellipsoid)
    console.warn(viewRectangle)
    const lonLatRange = Util.viewRectangleToLonLatRange(viewRectangle)
    this.viewerParameters.lonRange.x = lonLatRange.lon.min
    this.viewerParameters.lonRange.y = lonLatRange.lon.max
    this.viewerParameters.latRange.x = lonLatRange.lat.min
    this.viewerParameters.latRange.y = lonLatRange.lat.max

    const pixelSize = this.camera.getPixelSize(
      this.globeBoundingSphere,
      this.scene.drawingBufferWidth,
      this.scene.drawingBufferHeight
    )

    if (pixelSize > 0) {
      this.viewerParameters.pixelSize = pixelSize
    }
  }

  setGlobeLayer(userInput) {
    this.viewer.imageryLayers.removeAll()
    this.viewer.terrainProvider = new Cesium.EllipsoidTerrainProvider()

    const globeLayer = userInput.globeLayer
    switch (globeLayer.type) {
      case 'NaturalEarthII': {
        this.viewer.imageryLayers.addImageryProvider(
          Cesium.createTileMapServiceImageryProvider({
            url: Cesium.buildModuleUrl('Assets/Textures/NaturalEarthII')
          })
        )
        break
      }
      case 'WMS': {
        this.viewer.imageryLayers.addImageryProvider(new Cesium.WebMapServiceImageryProvider({
          url: userInput.WMS_URL,
          layers: globeLayer.layer,
          parameters: {
            ColorScaleRange: globeLayer.ColorScaleRange
          }
        }))
        break
      }
      case 'WorldTerrain': {
        this.viewer.imageryLayers.addImageryProvider(
          Cesium.createWorldImagery()
        )
        this.viewer.terrainProvider = Cesium.createWorldTerrain()
        break
      }
    }
  }

  setupEventListeners() {
    const that = this

    this.camera.moveStart.addEventListener(function() {
      that.scene.primitives.show = false
    })

    this.camera.moveEnd.addEventListener(function() {
      that.updateViewerParameters()
      that.particleSystem.applyViewerParameters(that.viewerParameters)
      that.scene.primitives.show = true
    })

    let resized = false
    window.addEventListener('resize', function() {
      resized = true
      that.scene.primitives.show = false
      that.scene.primitives.removeAll()
    })

    this.scene.preRender.addEventListener(function() {
      if (resized) {
        that.particleSystem.canvasResize(that.scene.context)
        resized = false
        that.addPrimitives()
        that.scene.primitives.show = true
      }
    })

    // window.addEventListener('particleSystemOptionsChanged', function() {
    //   that.particleSystem.applyUserInput(that.panel.getUserInput())
    // })
    // window.addEventListener('layerOptionsChanged', function() {
    //   that.setGlobeLayer(that.panel.getUserInput())
    // })
  }

  debug() {
    const that = this

    const animate = function() {
      that.viewer.resize()
      that.viewer.render()
      requestAnimationFrame(animate)
    }

    const spector = new SPECTOR.Spector()
    spector.displayUI()
    spector.spyCanvases()

    animate()
  }
}
