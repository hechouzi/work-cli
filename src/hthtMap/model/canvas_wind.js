import { Cartesian3 } from 'cesium';
import { MathUtil } from '../utils/mathUtil'
import { windTypeEnum } from '../enum/wind_type_enum'
import { eventEnum } from '../enum/event_enum'
import ImageEntity from '../entities/imageEntity'

const LINE_COLOR = 'rgba(255,0,0,1)'
const DELTA_ZERO = 0.0001

// 为了不引入Point.js，使用myPoint 替换了所有的new Point
function myPoint({ x, y }) {
  const result = {
    X: x,
    Y: y
  }
  return result
}

export default class CanvasWind {
  constructor(id, viewer) {
    this.id = id
    this.isShow = true
    this.viewer = viewer
    this.WIND_STEP = 10 // 风场间隔
    this.windType = 1
  }

  loadData(windData) {
    this.dataInfo = {
      LonMin: windData.header.lo1,
      LatMin: windData.header.la1,
      LonNums: windData.header.nx,
      LatNums: windData.header.ny,
      LonStep: windData.header.dx,
      LatStep: windData.header.dy,
      DLon: (windData.header.nx - 1) * windData.header.dx,
      DLat: (windData.header.ny - 1) * windData.header.dy,

      UV: [], // UV分量 0-U 1-V UV方向同笛卡尔坐标系
      Wind: []// 风向风速 0-风向 1-风速
    }
    this.dataInfo.LonMax = windData.header.lo1 + this.dataInfo.DLon
    this.dataInfo.LatMax = windData.header.la1 + this.dataInfo.DLat

    let index
    let indexRow
    let windDV
    let minV = 50
    let maxV = 0
    for (let i = 0; i < this.dataInfo.LatNums; i++) {
      this.dataInfo.Wind[i] = []
      indexRow = i * this.dataInfo.LonNums
      for (let j = 0; j < this.dataInfo.LonNums; j++) {
        index = indexRow + j
        windDV = MathUtil.GetWindByUV(windData.data.uComp[index], windData.data.vComp[index])
        this.dataInfo.Wind[i].push(windDV)

        if (minV > windDV[1]) minV = windDV[1]
        if (maxV < windDV[1]) maxV = windDV[1]
      }
    }

    // TODO 数据归一化  注意：此处UV为图像坐标方向 V要取反
    let flagNan = false
    let flagZero = false
    let speedNormal = 0
    const delSpeed = maxV - minV
    let huDu = 0
    const huDuS = Math.PI / 180
    if (Math.abs(delSpeed) < DELTA_ZERO) { // 最大值和最小值相等
      flagNan = true
      if (Math.abs(minV) < DELTA_ZERO) { // 都为0值
        flagZero = true
      }
    }
    for (let i = 0; i < this.dataInfo.LatNums; i++) {
      this.dataInfo.UV[i] = []
      for (let j = 0; j < this.dataInfo.LonNums; j++) {
        huDu = this.dataInfo.Wind[i][j][0] * huDuS
        if (flagNan) {
          if (flagZero) {
            speedNormal = 0
          } else {
            speedNormal = 1
          }
        } else {
          speedNormal = (this.dataInfo.Wind[i][j][1] - minV) / delSpeed
        }
        this.dataInfo.UV[i].push([-speedNormal * Math.sin(huDu), speedNormal * Math.cos(huDu)])
      }
    }

    const px1 = this.viewer.Cartesian3ToPx(this.viewer.scene,
      Cartesian3.fromDegrees(this.dataInfo.LonMin, this.dataInfo.LatMin, 0))
    const px2 = this.viewer.Cartesian3ToPx(this.viewer.scene,
      Cartesian3.fromDegrees(this.dataInfo.LonMax, this.dataInfo.LatMax, 0))

    this.boundInfo = {
      Width: Math.abs(px2.x - px1.x),
      Height: Math.abs(px2.y - px1.y)
    }

    this.canvasNormal = document.createElement('canvas')
    this.canvasNormal.width = this.boundInfo.Width
    this.canvasNormal.height = this.boundInfo.Height
    this.ctx = this.canvasNormal.getContext('2d')
  }

  /**
   * 绘制风符号 正北为0度 顺时针
   * @param windType 类型标识 1-风羽 2-箭头
   * @param ctx2d
   * @param dd 风向 度
   * @param ff 风速
   * @param size 风杆长度
   * @param xy 起点位置
   * @param color 颜色
   */
  drawWindShape(windType, ctx2d, dd, ff, size, xy, color) {
    if (!ctx2d || dd < 0 || ff <= 0 || size < 16) {
      return
    }

    if (windType < 1 || windType > 2) {
      windType = 1
    }

    // 风向转换成弧度
    dd = dd * Math.PI / 180.0
    if (ff === 1) {
      ff = 2
    }
    if (ff >= 50) {
      ff = 50
    }

    // 风向加上180度 比如正北风 方向应该从起点指向正下方 并控制下风速大小
    switch (windType) {
      case windTypeEnum.FEATHER:
        this.drawWindBarb(ctx2d, dd, ff, size, xy, color)
        break
      case windTypeEnum.ARROWS:
        dd += Math.PI
        this.drawWindArrow(ctx2d, dd, ff, size, xy, color)
        break
    }
  };

  drawWindBarb(ctx2d, dd, ff, size, xy, color) {
    ctx2d.strokeStyle = color

    const dw0 = size / 8.0
    const cosd = Math.cos(dd)
    const sind = Math.sin(dd)

    // 风杆
    const ptf1 = myPoint({
      x: xy.X,
      y: xy.Y
    })
    const ptf2 = myPoint({
      x: xy.X + 8 * dw0 * sind,
      y: xy.Y - 8 * dw0 * cosd
    })

    ctx2d.beginPath()
    ctx2d.moveTo(ptf1.X, ptf1.Y)
    ctx2d.lineTo(ptf2.X, ptf2.Y)
    ctx2d.stroke()
    ctx2d.closePath()

    // 风羽
    let n = 0
    let m = 0
    n = Math.floor(ff / 20)
    m = ff % 20

    const dpcha = dw0 * 2.0 * Math.tan(Math.PI / 3.0) // 20m/s 4m/s宽度
    const ptf3 = myPoint({
      x: 0,
      y: 0
    })

    // 20m/s风羽
    let i = 0
    let cnt1 = 8
    let cnt2 = 6
    let cnt20 = 0
    let cnt4 = 0
    for (i = 0; i < n; i++) {
      ptf1.X = xy.X + cnt1 * dw0 * sind
      ptf1.Y = xy.Y - cnt1 * dw0 * cosd

      ptf2.X = xy.X + cnt2 * dw0 * sind
      ptf2.Y = xy.Y - cnt2 * dw0 * cosd

      ptf3.X = ptf1.X + dpcha * cosd
      ptf3.Y = ptf1.Y + dpcha * sind

      ctx2d.beginPath()
      ctx2d.moveTo(ptf1.X, ptf1.Y)
      ctx2d.lineTo(ptf3.X, ptf3.Y)
      ctx2d.lineTo(ptf2.X, ptf2.Y)
      ctx2d.stroke()
      ctx2d.closePath()

      cnt1 -= 2
      cnt2 -= 2
      cnt20++
    }

    // 4m/s风羽
    if (cnt20 === 0) {
      cnt1 = 10
      cnt2 = 8
    } else {
      cnt1 += 1
      cnt2 += 1
    }
    n = Math.floor(m / 4)
    m %= 4

    for (i = 0; i < n; i++) {
      ptf1.X = xy.X + cnt1 * dw0 * sind
      ptf1.Y = xy.Y - cnt1 * dw0 * cosd

      ptf2.X = xy.X + cnt2 * dw0 * sind
      ptf2.Y = xy.Y - cnt2 * dw0 * cosd

      ptf3.X = ptf1.X + dpcha * cosd
      ptf3.Y = ptf1.Y + dpcha * sind

      ctx2d.beginPath()
      ctx2d.moveTo(ptf2.X, ptf2.Y)
      ctx2d.lineTo(ptf3.X, ptf3.Y)
      ctx2d.stroke()
      ctx2d.closePath()

      cnt1--
      cnt2--
      cnt4++
    }

    if (cnt20 + cnt4 === 0) {
      cnt1 = 9
      cnt2 = 7
    }

    // 2m/s风羽
    n = Math.floor(m / 2)
    for (i = 0; i < n; i++) {
      ptf1.X = xy.X + cnt1 * dw0 * sind
      ptf1.Y = xy.Y - cnt1 * dw0 * cosd

      ptf2.X = xy.X + cnt2 * dw0 * sind
      ptf2.Y = xy.Y - cnt2 * dw0 * cosd

      ptf3.X = ptf1.X + dpcha * cosd
      ptf3.Y = ptf1.Y + dpcha * sind

      ptf3.X = (ptf2.X + ptf3.X) / 2.0
      ptf3.Y = (ptf2.Y + ptf3.Y) / 2.0

      ctx2d.beginPath()
      ctx2d.moveTo(ptf2.X, ptf2.Y)
      ctx2d.lineTo(ptf3.X, ptf3.Y)
      ctx2d.stroke()
      ctx2d.closePath()

      cnt1--
      cnt2--
    }
  };

  drawWindArrow(ctx2d, dd, ff, size, xy, color) {
    ctx2d.strokeStyle = color

    let dw0 = size / 8.0
    let dw = dw0
    const cosd = Math.cos(dd)
    const sind = Math.sin(dd)

    // 根据风杆长度进行风速分级
    if (ff >= 30) {
      dw = dw0 * 8.0
    } else if (ff >= 25 && ff < 30) {
      dw = dw0 * 7.0
    } else if (ff >= 20 && ff < 25) {
      dw = dw0 * 6.0
    } else if (ff >= 15 && ff < 20) {
      dw = dw0 * 5.0
    } else if (ff >= 10 && ff < 15) {
      dw = dw0 * 4.0
    } else if (ff >= 5 && ff < 10) {
      dw = dw0 * 3.0
    } else {
      dw = dw0 * 2.0
    }
    dw = size

    // 风杆
    const ptf1 = myPoint({
      x: xy.X,
      y: xy.Y
    })
    const ptf2 = myPoint({
      x: xy.X + dw * sind,
      y: xy.Y - dw * cosd
    })

    ctx2d.beginPath()
    ctx2d.moveTo(ptf1.X, ptf1.Y)
    ctx2d.lineTo(ptf2.X, ptf2.Y)
    ctx2d.stroke()
    ctx2d.closePath()

    // 箭头
    dw0 *= 2.0
    const dpcha = dw0 * Math.tan(Math.PI / 6.0)

    const ptf4 = myPoint({
      x: ptf1.X + (dw - dw0) * sind,
      y: ptf1.Y - (dw - dw0) * cosd
    })

    ptf1.X = ptf2.X
    ptf1.Y = ptf2.Y

    ptf2.X = ptf4.X + dpcha * cosd
    ptf2.Y = ptf4.Y + dpcha * sind

    const ptf3 = myPoint({
      x: ptf4.X - dpcha * cosd,
      y: ptf4.Y - dpcha * sind
    })

    ctx2d.beginPath()
    ctx2d.moveTo(ptf2.X, ptf2.Y)
    ctx2d.lineTo(ptf1.X, ptf1.Y)
    ctx2d.lineTo(ptf3.X, ptf3.Y)
    ctx2d.stroke()
    ctx2d.closePath()
  };

  getStep() {
    let resultl
    const eyePosition = (this.viewer.getViewCentre()).height
    // 风场间隔 TODO 需要结合数据分辨率确定
    if (eyePosition >= 1e7) {
      resultl = 4
    } else if (eyePosition > 5e6) {
      resultl = 3
    } else if (eyePosition > 4e6) {
      resultl = 2
    } else {
      resultl = 1
    }
    return resultl
  }

  lonLatToCanvasXY(lon, lat) {
    const px = {
      x: (lon - this.dataInfo.LonMin) * this.boundInfo.Width /
        (this.dataInfo.LonMax - this.dataInfo.LonMin),
      y: (this.dataInfo.LatMax - lat) * this.boundInfo.Height /
        (this.dataInfo.LatMax - this.dataInfo.LatMin)
    }

    return [px.x, px.y]
  }

  drawWind(type) {
    this.windType = type
    const _this = this

    this.viewer.addEvent(_this.id, eventEnum.WHEEL, () => {
      reDraw()
    })

    reDraw()

    function reDraw() {
      if (_this.WIND_STEP === _this.getStep()) {
        return
      }
      _this.WIND_STEP = _this.getStep()

      const ctxNormal = _this.ctx
      ctxNormal.clearRect(0, 0, _this.boundInfo.Width, _this.boundInfo.Height)
      // ctxNormal.fillStyle = '#FF0000'
      // ctxNormal.fillRect(0, 0, _this.boundInfo.Width, _this.boundInfo.Height)
      const color = LINE_COLOR
      const size = 24
      let lon
      let lat
      let angel
      let speed
      let xy
      let pt
      for (let i = 0; i < _this.dataInfo.LatNums; i += _this.WIND_STEP) {
        lat = _this.dataInfo.LatMin + i * _this.dataInfo.LatStep
        for (let j = 0; j < _this.dataInfo.LonNums; j += _this.WIND_STEP) {
          lon = _this.dataInfo.LonMin + j * _this.dataInfo.LonStep
          angel = _this.dataInfo.Wind[i][j][0]
          speed = _this.dataInfo.Wind[i][j][1]
          xy = _this.lonLatToCanvasXY(lon, lat, true)
          pt = myPoint({
            x: xy[0],
            y: xy[1]
          })
          if (_this.windType === windTypeEnum.FEATHER) {
            if (xy[0] > 0 && xy[0] < _this.boundInfo.Width && xy[1] > 0 && xy[1] <
              _this.boundInfo.Height) {
              _this.drawWindShape(_this.windType, ctxNormal, Math.floor(angel), Math.floor(speed),
                size,
                pt, color)
            }
          } else if (_this.windType === windTypeEnum.ARROWS) {
            if (xy[0] > 0 && xy[0] < _this.boundInfo.Width && xy[1] > 0 && xy[1] <
              _this.boundInfo.Height) {
              _this.drawWindShape(_this.windType, ctxNormal, Math.floor(angel), Math.floor(speed),
                size,
                pt, color)
            }
          }
          // else if (_this.windType == 3) {
          //     if (xy[0] > 0 && xy[0] < _this.boundInfo.Width && xy[1] > 0 && xy[1] < _this.boundInfo.Height) {
          //       _this.drawWindShape(1, ctxNormal, Math.floor(angel), Math.floor(speed), size, pt, color)
          //       _this.drawWindShape(2, ctxNormal, Math.floor(angel), Math.floor(speed), size, pt, color)
          //     }
          //   }
        }
      }

      const info = {
        pic: _this.canvasNormal,
        range: [
          _this.dataInfo.LonMin,
          _this.dataInfo.LatMin,
          _this.dataInfo.LonMax,
          _this.dataInfo.LatMax]
      }

      const myImageEntity = new ImageEntity(_this.id, info.pic, info.range, _this.isShow)
      _this.viewer.addEntity(myImageEntity)
    }
  }

  changeShow() {
    this.viewer.chanegEntityShow(this.id)

    this.isShow = this.viewer.entities.getById(this.id).show
  }

  // 最好在销毁的时候使用
  destroy() {
    this.viewer.removeEvent(this.id, eventEnum.WHEEL)
    this.viewer.removeEntity(this.id)
  }
}
