export const MathUtil = {

  /**
   * 经纬度坐标转换为屏幕坐标（经纬度投影）
   * @param lon
   * @param lat
   * @param width
   * @param height
   * @param xStart
   * @param yStart
   * @param xEnd
   * @param yEnd
   * @returns {{X: number, Y: number}}
   * @constructor
   */
  WorldToScreen (lon, lat, width, height, xStart, yStart, xEnd, yEnd) {
    return {
      X: (lon - xStart) * width / (xEnd - xStart),
      Y: (yEnd - lat) * height / (yEnd - yStart)
    }
  },

  /**
   * 检测两个矩形是否相交
   * @param bound1 结构{LonS: number, LonE: number, LatS: number, LatE: number}
   * @param bound2 结构{LonS: number, LonE: number, LatS: number, LatE: number}
   * @returns {boolean}
   * @constructor
   */
  IsRectangleInter (bound1, bound2) {
    const lonS1 = bound1.LonS
    const lonEnd1 = bound1.LonE
    const latS1 = bound1.LatS
    const latEnd1 = bound1.LatE

    const lonS2 = bound2.LonS
    const lonEnd2 = bound2.LonE
    const latS2 = bound2.LatS
    const latEnd2 = bound2.LatE

    if (lonEnd1 < lonS2 || lonEnd2 < lonS1 || latEnd1 < latS2 || latEnd2 < latS1) {
      return false
    }
    return true
  },

  /**
   * 获取两个多边形的交集
   * @param bound1 结构{LonS: number, LonE: number, LatS: number, LatE: number}
   * @param bound2 结构{LonS: number, LonE: number, LatS: number, LatE: number}
   * @returns {{LonS: number, LonE: number, LatS: number, LatE: number}}
   * @constructor
   */
  GetRectangleInter (bound1, bound2) {
    if (!MathUtil.IsRectangleInter(bound1, bound2)) {
      return null
    }

    const lonS1 = bound1.LonS
    const lonEnd1 = bound1.LonE
    const latS1 = bound1.LatS
    const latEnd1 = bound1.LatE

    const lonS2 = bound2.LonS
    const lonEnd2 = bound2.LonE
    const latS2 = bound2.LatS
    const latEnd2 = bound2.LatE

    return {
      LonS: (lonS1 < lonS2) ? lonS2 : lonS1,
      LonE: (lonEnd1 < lonEnd2) ? lonEnd1 : lonEnd2,
      LatS: (latS1 < latS2) ? latS2 : latS1,
      LatE: (latEnd1 < latEnd2) ? latEnd1 : latEnd2
    }
  },

  /**
   * 获取位置1到位置2的方向角 正北0度 顺时针
   * @param pt1
   * @param pt2
   * @param isAngle true-返回角度 false-返回弧度
   * @returns {number}
   */
  GetAngle (pt1, pt2, isAngle) {
    const td = 0.001
    const lon1 = pt1[0]
    const lat1 = pt1[1]
    const lon2 = pt2[0]
    const lat2 = pt2[1]
    let angle = 0

    if (Math.abs(lat1 - lat2) < td) {
      if (lon2 >= lon1) {
        angle = Math.PI / 2
      } else {
        angle = 3 * Math.PI / 2
      }
    } else {
      angle = Math.atan2(Math.abs(lon1 - lon2), Math.abs(lat1 - lat2))
      if (lon2 >= lon1) {
        if (lat2 < lat1) {
          angle = Math.PI - angle
        }
      } else if (lat2 >= lat1) {
        angle = 2 * Math.PI - angle
      } else {
        angle = Math.PI + angle
      }
    }

    if (isAngle) {
      return angle * 180 / Math.PI
    }
    return angle
  },

  /**
   * 计算地球两点间的距离
   * @param lon1
   * @param lat1
   * @param lon2
   * @param lat2
   * @param isRadian true-返回弧度 false-返回km
   * @returns {number}
   */
  GetDis (lon1, lat1, lon2, lat2, isRadian) {
    const myLat1 = lat1 * Math.PI / 180.0
    const myLat2 = lat2 * Math.PI / 180.0

    const b = lon1 * Math.PI / 180.0 - lon2 * Math.PI / 180.0
    const radian = Math.acos(
      Math.cos(myLat1) * Math.cos(myLat2) * Math.cos(b) + Math.sin(myLat1) * Math.sin(myLat2))

    if (isRadian) {
      return radian
    }
    return radian * 6378.137
  },

  /**
   * 计算地球上区域面积 仅适用于凸多边形
   * @param targetArea 区域点集合 [[0,1]]结构 0-X方向 1-Y方向
   * @returns {number} km²
   */
  GetArea (targetArea) {
    if (targetArea.length < 3) {
      return 0
    }
    let sumArea = 0
    const p1 = targetArea[0]
    let p2
    let p3
    let area
    const size = targetArea.length - 1
    for (let i = 1; i < size; i++) {
      p2 = targetArea[i]
      p3 = targetArea[i + 1]
      area = MathUtil.GetAreaP3(p1, p2, p3)
      // eslint-disable-next-line no-restricted-globals
      if (!isNaN(area)) {
        sumArea += area
      }
    }

    return sumArea
  },

  /**
   * 计算地球上三个位置点面积
   * @param p1 [0,1]结构 0-X方向 1-Y方向
   * @param p2 [0,1]结构 0-X方向 1-Y方向
   * @param p3 [0,1]结构 0-X方向 1-Y方向
   * @returns {number} km²
   * @constructor
   */
  GetAreaP3 (p1, p2, p3) {
    const x1 = p1[0]
    const y1 = p1[1]
    const x2 = p2[0]
    const y2 = p2[1]
    const x3 = p3[0]
    const y3 = p3[1]

    const a = MathUtil.GetDis(x1, y1, x2, y2, true)
    const b = MathUtil.GetDis(x1, y1, x3, y3, true)
    const c = MathUtil.GetDis(x2, y2, x3, y3, true)

    const ra = Math.acos((Math.cos(a) - Math.cos(b) * Math.cos(c)) / (Math.sin(b) * Math.sin(c)))
    const rb = Math.acos((Math.cos(b) - Math.cos(a) * Math.cos(c)) / (Math.sin(a) * Math.sin(c)))
    const rc = Math.acos((Math.cos(c) - Math.cos(a) * Math.cos(b)) / (Math.sin(a) * Math.sin(b)))

    return (ra + rb + rc - Math.PI) * 6378.137 * 6378.137
  },

  /**
   * 检测指定的位置点是否在指定闭合区域内
   * @param {number} x 待检测X方向位置点
   * @param {number} y 待检测Y方向位置点
   * @param targetArea 目标区域闭合点集 [[0,1]]结构 0-X方向 1-Y方向
   * @returns {boolean}
   */
  IsPtInArea (x, y, targetArea) {
    // 闭合区域至少四个位置点
    if (!targetArea || targetArea.length < 4) {
      return false
    }

    const size = targetArea.length - 1
    // 是否闭合区域
    // eslint-disable-next-line eqeqeq
    if (targetArea[0][0] != targetArea[size][0] || targetArea[0][1] != targetArea[size][1]) {
      return false
    }

    let flag = false
    let x1
    let y1
    let x2
    let y2
    for (let i = 0; i < size; i++) {
      // eslint-disable-next-line prefer-destructuring
      x1 = targetArea[i][0]
      // eslint-disable-next-line prefer-destructuring
      y1 = targetArea[i][1]
      // eslint-disable-next-line prefer-destructuring
      x2 = targetArea[i + 1][0]
      // eslint-disable-next-line prefer-destructuring
      y2 = targetArea[i + 1][1]

      if (((y2 <= y && y < y1) || (y1 <= y && y < y2)) &&
        x < ((x1 - x2) * (y - y2) / (y1 - y2) + x2)) {
        flag = !flag
      }
    }

    return flag
  },

  /**
   * 根据UV获取风向风速
   * @param u
   * @param v
   * @returns {*[]}
   * @constructor
   */
  GetWindByUV (u, v) {
    let angle = 0
    if (Math.abs(v) < 0.001) {
      if (u >= 0) {
        angle = 270
      } else {
        angle = 90
      }
    } else {
      angle = Math.atan(Math.abs(u / v)) * 180 / Math.PI
      if (u >= 0) {
        if (v > 0) {
          angle = 180 + angle
        } else {
          angle = 360 - angle
        }
      } else if (v > 0) {
        angle = 180 - angle
      }
    }

    let speed = Math.sqrt(u * u + v * v)
    if (speed > 50) {
      speed = 50
    }
    return [angle, speed]
  }
}
