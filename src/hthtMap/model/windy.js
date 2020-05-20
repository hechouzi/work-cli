import {
  GeometryInstance,
  PolylineGeometry,
  Cartesian3,
  Primitive,
  PolylineColorAppearance,
  Color
} from 'cesium';
import { eventEnum } from '../enum/event_enum'

const FRAME_TIME = 50
const PARTICLE_AGEMIN = 30
const PARTICLE_AGERAND = 20
const PARTICLE_NUMS = 500

export default class Windy {
  constructor(viewer) {
    this.isLoadData = false
    this.isInitWindy = false
    this.isShow = true
    this.dataInfo = {
      LonMin: 0,
      LonMax: 0,
      LatMin: 0,
      LatMax: 0,
      DLon: 0,
      DLat: 0,
      LonNums: 0,
      LatNums: 0,
      LonStep: 0,
      LatStep: 0,
      UV: [], // UV分量 [i][j]->([i][j][0]-U [i][j][1]-V [i][j][2]-Speed)
      ParticleBuf: [] // 粒子列表
    }

    this.speedScale = 1
    this.lines = null
    this.primitives = viewer.scene.primitives
    this.viewer = viewer
  }

  changeShow() {
    this.isShow = !this.isShow
  };

  loadData(windData) {

    this.isLoadData = false
    this.isInitWindy = false
    this.dataInfo.ParticleBuf = []
    this.removeLines()

    function getUVSpeed(u, v) {
      return [u, v, Math.sqrt(u * u + v * v)]
    }

    const that = this

    that.dataInfo.UV = []
    that.dataInfo.LonMin = windData.header.lo1
    that.dataInfo.LatMin = windData.header.la1
    that.dataInfo.LonNums = windData.header.nx
    that.dataInfo.LatNums = windData.header.ny
    that.dataInfo.LonStep = windData.header.dx
    that.dataInfo.LatStep = windData.header.dy
    that.dataInfo.DLon = (windData.header.nx - 1) * windData.header.dx
    that.dataInfo.DLat = (windData.header.ny - 1) * windData.header.dy
    that.dataInfo.LonMax = windData.header.lo1 + that.dataInfo.DLon
    that.dataInfo.LatMax = windData.header.la1 + that.dataInfo.DLat

    let index
    let indexRow
    const { uComp } = windData.data
    const { vComp } = windData.data
    for (let i = 0; i < that.dataInfo.LatNums; i++) {
      that.dataInfo.UV[i] = []
      indexRow = i * that.dataInfo.LonNums
      for (let j = 0; j < that.dataInfo.LonNums; j++) {
        index = indexRow + j
        that.dataInfo.UV[i].push(getUVSpeed(uComp[index], vComp[index]))
      }
    }

    that.isLoadData = true

  };

  startWindy() {

    this.stopWindy()
    if (!this.isLoadData || !this.isInitWindy) {
      return
    }

    const that = this

    function getLineInstance(lineColor, ptXYArray) {
      const colors = []
      const pts = []
      const { length } = ptXYArray
      const count = length / 2
      let index1 = 0
      let index2 = 0

      for (let i = 0; i < count; i++) {
        index1 = 2 * i
        index2 = index1 + 1
        colors.push(lineColor.withAlpha(index1 * 1.0 / length),
          lineColor.withAlpha(index2 * 1.0 / length))
        pts.push(that.dataInfo.LonMin + ptXYArray[index1] * that.dataInfo.LonStep,
          that.dataInfo.LatMin + ptXYArray[index2] * that.dataInfo.LatStep)
      }

      return new GeometryInstance({
        geometry: new PolylineGeometry({
          positions: Cartesian3.fromDegreesArray(pts),
          colors,
          width: 1.0,
          colorsPerVertex: true
        })
      })
    }

    function animate() {

      let x
      let y
      let uv
      let xt
      let yt
      let particleObj
      const lineInstances = []
      const particleBuf = that.dataInfo.ParticleBuf
      particleBuf.forEach(function (particle) {
        if (particle.Age >= particle.AgeMax) {
          particleObj = that.getParticle()
          if (particleObj != null) {
            // eslint-disable-next-line no-param-reassign
            particle.X = particleObj.X
            // eslint-disable-next-line no-param-reassign
            particle.Y = particleObj.Y
            // eslint-disable-next-line no-param-reassign
            particle.Color = particleObj.Color
            // eslint-disable-next-line no-param-reassign
            particle.AgeMax = particleObj.AgeMax
            // eslint-disable-next-line no-param-reassign
            particle.Age = 0
            // eslint-disable-next-line no-param-reassign
            particle.Path = []
          }
        }
        x = particle.X
        y = particle.Y
        if (y < 0 || y >= that.dataInfo.LatNums
          || x < 0 || x >= that.dataInfo.LonNums) {
          // eslint-disable-next-line no-param-reassign
          particle.Age = particle.AgeMax
        } else {
          uv = that.interBilinear(x, y)
          if (uv != null) {
            xt = x + uv[0] * that.speedScale
            yt = y + uv[1] * that.speedScale
            particle.Path.push(xt, yt)
            // eslint-disable-next-line no-param-reassign
            particle.X = xt
            // eslint-disable-next-line no-param-reassign
            particle.Y = yt
            if (particle.Path.length >= 4) {
              lineInstances.push(getLineInstance(particle.Color, particle.Path))
            }
          }
          // eslint-disable-next-line no-param-reassign
          particle.Age++
        }
      })

      that.removeLines()
      if (lineInstances.length > 0) {
        that.lines = that.primitives.add(new Primitive({
          appearance: new PolylineColorAppearance({
            translucent: true
          }),
          geometryInstances: lineInstances,
          asynchronous: false,
          show: that.isShow
        }))
      }
    }

    this.playTimer = setInterval(function () {
      animate()
    }, FRAME_TIME)
  };

  stopWindy() {

    this.play = false
    if (this.playTimer != null) {
      clearInterval(this.playTimer)
    }
  };

  initParticles(speedScale) {

    this.speedScale = speedScale
    this.dataInfo.ParticleBuf = []

    let particleObj
    for (let i = 0; i < PARTICLE_NUMS; i++) {
      particleObj = this.getParticle()
      if (particleObj != null) {
        this.dataInfo.ParticleBuf.push(particleObj)
      }
    }

    if (this.dataInfo.ParticleBuf.length > 0) {
      this.isInitWindy = true
    }
  };

  removeLines() {
    if (this.lines) {
      this.primitives.remove(this.lines)
    }
  };

  getParticle() {

    const uvGridInfo = this.dataInfo.UV
    if (uvGridInfo.length === 0) {
      return null
    }

    let row = 0
    let col = 0
    let safetyNet = 0
    let uvObj = null
    let partObj = null
    do {
      row = Math.floor(Math.random() * (this.dataInfo.LatNums - 2))
      col = Math.floor(Math.random() * (this.dataInfo.LonNums - 2))
      if (row >= 0 && row < this.dataInfo.LatNums
        && col >= 0 && col < this.dataInfo.LonNums) {
        uvObj = this.dataInfo.UV[row][col]
      }
    } while ((uvObj == null || uvObj[2] <= 0) && safetyNet++ < 30)

    const that = this
    if (uvObj != null) {
      partObj = {
        X: col,
        Y: row,
        Color: that.getWindColor(uvObj[2]),
        Age: 0,
        AgeMax: Math.random() * PARTICLE_AGERAND + PARTICLE_AGEMIN,
        Path: []
      }
    }

    return partObj
  };

  interBilinear(px, py) {

    const rowIndex = Math.floor(py)
    const colIndex = Math.floor(px)
    const rowIndex2 = rowIndex + 1
    const colIndex2 = colIndex + 1

    if (rowIndex < 0 || rowIndex >= this.dataInfo.LatNums
      || colIndex < 0 || colIndex >= this.dataInfo.LonNums
      || rowIndex2 < 0 || rowIndex2 >= this.dataInfo.LatNums
      || colIndex2 < 0 || colIndex2 >= this.dataInfo.LonNums) {
      return null
    }

    const g00 = this.dataInfo.UV[rowIndex][colIndex]
    const g01 = this.dataInfo.UV[rowIndex2][colIndex]
    const g10 = this.dataInfo.UV[rowIndex][colIndex2]
    const g11 = this.dataInfo.UV[rowIndex2][colIndex2]

    const x = px - colIndex
    const y = py - rowIndex
    const rx = 1 - x
    const ry = 1 - y
    const a = rx * ry
    const b = x * ry
    const c = rx * y
    const d = x * y

    const u = g00[0] * a + g10[0] * b + g01[0] * c + g11[0] * d
    const v = g00[1] * a + g10[1] * b + g01[1] * c + g11[1] * d
    const s = u * u + v * v

    return [u, v, Math.sqrt(s)]
  };

  // eslint-disable-next-line class-methods-use-this
  getWindColor(speed) {

    let cl = Color.WHITE

    // TODO 颜色设置
    if (speed > 10) {
      cl = Color.RED
    } else if (speed > 8) {
      cl = Color.YELLOW
    } else if (speed > 4) {
      cl = Color.GREEN
    } else if (speed > 2) {
      cl = Color.BLUE
    }

    return cl
  };

  destroy() {
    this.stopWindy()
    const primitives = this.viewer.scene.primitives._primitives
    for (let i = 0; i < primitives.length; i++) {
      if (!primitives[i]._primitives) {
        this.viewer.removePrimitive(primitives[i])
      }
    }
  }
}
