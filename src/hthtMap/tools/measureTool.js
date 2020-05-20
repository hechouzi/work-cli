import {
  ScreenSpaceEventHandler,
  ScreenSpaceEventType,
  CustomDataSource,
  defined,
  Color,
  LabelStyle,
  VerticalOrigin,
  Cartesian2,
  CallbackProperty,
  Cartographic,
  Math as CMath,
  HeightReference,
  EllipsoidGeodesic,
  PolygonHierarchy
} from 'cesium';
/* 测量距离 */
export default class MeasureTool {
  constructor(viewer) {
    this.viewer = viewer
    this.dataSource = []
    this.handler = new ScreenSpaceEventHandler(this.viewer.scene.canvas) // 鼠标事件
  }

  // 执行测量距离
  excuteMeasureLength() {
    let _this = this
    this.handler = new ScreenSpaceEventHandler(this.viewer.scene.canvas) // 鼠标事件
    // 取消双击事件
    this.viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(ScreenSpaceEventType.LEFT_DOUBLE_CLICK)
    let positions = []
    let poly = null
    let distance = 0
    let cartesian = null
    this.dataSource = new CustomDataSource('measureSource')
    this.viewer.dataSources.add(this.dataSource)
    let tooltip = document.querySelector('#toolTip')
    tooltip.style.display = "block"
    // 鼠标移入
    this.handler.setInputAction(res => {
      tooltip.innerHTML = '<p>单击开始，双击结束</p>'
      const ray = this.viewer.camera.getPickRay(res.endPosition)
      cartesian = this.viewer.scene.globe.pick(ray, this.viewer.scene)
      // 不在地球范围内
      if (!defined(cartesian)) {
        return
      }
      if (positions.length >= 2) {
        if (!defined(poly)) {
          poly = new PolyLinePrimitive(positions)
        } else {
          positions.pop()
          positions.push(cartesian)
        }
        distance = calculateSpaceDistance(positions)
      }
    }, ScreenSpaceEventType.MOUSE_MOVE)

    // 鼠标左击
    this.handler.setInputAction(res => {
      const ray = this.viewer.camera.getPickRay(res.position)
      cartesian = this.viewer.scene.globe.pick(ray, this.viewer.scene)

      // 不在地球范围内
      if (!defined(cartesian)) {
        return
      }
      if (positions.length === 0) {
        positions.push(cartesian.clone())
      }
      positions.push(cartesian)

      // 记录鼠标单击时的节点位置，异步计算贴地距离
      let labelPt = positions[positions.length - 1]
      let textDistance = positions.length === 2 ? '' : distance
      this.dataSource.entities.add({
        name: '空间直线拐点',
        position: labelPt,
        point: {
          pixelSize: 5,
          color: Color.RED,
          outlineColor: Color.WHITE,
          outlineWidth: 2
        },
        label: {
          text: textDistance,
          font: '18px sans-serif',
          fillColor: Color.GOLD,
          style: LabelStyle.FILL_AND_OUTLINE,
          outlineWidth: 2,
          verticalOrigin: VerticalOrigin.BOTTOM,
          pixelOffset: new Cartesian2(20, -20)
        }
      })

    }, ScreenSpaceEventType.LEFT_CLICK)

    // 双击
    this.handler.setInputAction(res => {
      this.handler.destroy()
      positions.pop()
      // this.excuteMeasureLength()
    }, ScreenSpaceEventType.LEFT_DOUBLE_CLICK)

    // 绘制线
    let PolyLinePrimitive = (function () {
      function _(positions) {
        this.options = {
          name: '空间直线',
          polyline: {
            show: true,
            positions: [],
            material: Color.CHARTREUSE,
            width: 4,
            clampToGround: true
          }
        }
        this.positions = positions
        this._init()
      }

      _.prototype._init = function () {
        let _self = this
        let _update = function () {
          return _self.positions
        }
        // 实时更新polyline.positions
        this.options.polyline.positions = new CallbackProperty(_update, false)
        _this.dataSource.entities.add(this.options)
      }
      return _
    })()

    /**
     * 空间两点距离计算函数
     * @param positions 点的屏幕坐标系数组
     */
    function calculateSpaceDistance(positions) {
      let distance = 0
      for (let i = 0; i < positions.length - 1; i++) {

        let point1cartographic = Cartographic.fromCartesian(positions[i])
        let point2cartographic = Cartographic.fromCartesian(positions[i + 1])
        /** 根据经纬度计算出距离 **/
        let geodesic = new EllipsoidGeodesic()
        geodesic.setEndPoints(point1cartographic, point2cartographic)
        let s = geodesic.surfaceDistance
        // 返回两点之间的距离
        s = Math.sqrt(Math.pow(s, 2) + Math.pow(point2cartographic.height - point1cartographic.height, 2))
        distance = distance + s
      }
      if (distance > 1000) {

      }
      distance = distance > 1000 ? (distance / 1000).toFixed(2) + '千米' : distance.toFixed(2) + '米'
      return distance
    }
  }

  // 执行测量面积
  excuteMeasureArea() {
    let _this = this
    // 取消双击事件-追踪该位置
    // 取消双击事件-追踪该位置
    this.handler = new ScreenSpaceEventHandler(this.viewer.scene.canvas) // 鼠标事件
    this.viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(ScreenSpaceEventType.LEFT_DOUBLE_CLICK)
    let positions = []
    let tempPoints = []
    let polygon = null
    let cartesian = null

    this.dataSources = new CustomDataSource('measureSource')
    this.viewer.dataSources.add(this.dataSources)
    let tooltip = document.querySelector('#toolTip')
    tooltip.style.display = "block"
    // 鼠标滑动事件绘制面
    this.handler.setInputAction(res => {
      const ray = this.viewer.camera.getPickRay(res.endPosition)
      cartesian = this.viewer.scene.globe.pick(ray, this.viewer.scene)
      tooltip.innerHTML = '<p>单击开始，双击结束</p>'
      // 不在地球范围内
      if (!defined(cartesian)) {
        return
      }
      if (positions.length >= 2) {
        if (!defined(polygon)) {
          polygon = new PolygonPrimitive(positions)
        } else {
          positions.pop()
          positions.push(cartesian)
        }
      }
    }, ScreenSpaceEventType.MOUSE_MOVE)

    // 鼠标左击事件绘制点
    this.handler.setInputAction(res => {
      const ray = this.viewer.camera.getPickRay(res.position)
      cartesian = this.viewer.scene.globe.pick(ray, this.viewer.scene)
      // 不在地球范围内
      if (!defined(cartesian)) {
        return
      }
      if (positions.length === 0) {
        positions.push(cartesian.clone())
      }
      positions.push(cartesian)
      //在三维场景中添加点
      const cartographic = Cartographic.fromCartesian(positions[positions.length - 1])
      const longitudeString = CMath.toDegrees(cartographic.longitude)
      const latitudeString = CMath.toDegrees(cartographic.latitude)
      const heightString = cartographic.height
      tempPoints.push({ lon: longitudeString, lat: latitudeString, hei: heightString })
      this.dataSources.entities.add({
        name: '多边形拐点',
        position: positions[positions.length - 1],
        point: {
          pixelSize: 5,
          color: Color.RED,
          outlineColor: Color.WHITE,
          outlineWidth: 2,
          heightReference: HeightReference.CLAMP_TO_GROUND
        }
      })

    }, ScreenSpaceEventType.LEFT_CLICK)

    // 双击
    this.handler.setInputAction(res => {
      this.handler.destroy()
      positions.pop()

      let textArea = getArea(tempPoints) + "平方公里"
      this.dataSources.entities.add({
        name: '多边形面积',
        position: positions[positions.length - 1],
        label: {
          text: textArea,
          font: '18px sans-serif',
          fillColor: Color.GOLD,
          style: LabelStyle.FILL_AND_OUTLINE,
          outlineWidth: 2,
          verticalOrigin: VerticalOrigin.BOTTOM,
          pixelOffset: new Cartesian2(20, -40)
        }
      })
      // this.excuteMeasureArea()
    }, ScreenSpaceEventType.LEFT_DOUBLE_CLICK)

    let PolygonPrimitive = (function () {
      function _(positions) {
        this.options = {
          name: '空间多边形',
          polygon: {
            hierarchy: undefined,
            perPositionHeight: true,
            material: Color.GREEN.withAlpha(0.5)
          }
        }
        this.hierarchy = positions
        this._init()
      }

      _.prototype._init = function () {
        let _self = this
        let _update = function () {
          return new PolygonHierarchy(_self.hierarchy)
        }
        // 实时更新polygon.hierarchy
        this.options.polygon.hierarchy = new CallbackProperty(_update, false)
        _this.dataSources.entities.add(this.options)
      }
      return _
    })()

    let radiansPerDegree = Math.PI / 180.0 // 角度转化为弧度(rad)
    let degreesPerRadian = 180.0 / Math.PI // 弧度转化为角度
    // 计算多边形面积
    function getArea(points) {
      let res = 0
      //拆分三角曲面
      for (let i = 0; i < points.length - 2; i++) {
        let j = (i + 1) % points.length
        let k = (i + 2) % points.length
        let totalAngle = Angle(points[i], points[j], points[k])
        let dis_temp1 = distance(positions[i], positions[j])
        let dis_temp2 = distance(positions[j], positions[k])
        res += dis_temp1 * dis_temp2 * Math.abs(Math.sin(totalAngle))
      }
      return (res / 1000000.0).toFixed(4)
    }

    // 角度
    function Angle(p1, p2, p3) {
      let bearing21 = Bearing(p2, p1)
      let bearing23 = Bearing(p2, p3)
      let angle = bearing21 - bearing23
      if (angle < 0) {
        angle += 360
      }
      return angle
    }

    // 方向
    function Bearing(from, to) {
      var lat1 = from.lat * radiansPerDegree
      var lon1 = from.lon * radiansPerDegree
      var lat2 = to.lat * radiansPerDegree
      var lon2 = to.lon * radiansPerDegree
      var angle = -Math.atan2(Math.sin(lon1 - lon2) * Math.cos(lat2), Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon1 - lon2))
      if (angle < 0) {
        angle += Math.PI * 2.0
      }
      angle = angle * degreesPerRadian // 角度
      return angle
    }

    // 计算长度
    function distance(point1, point2) {
      var point1cartographic = Cartographic.fromCartesian(point1)
      var point2cartographic = Cartographic.fromCartesian(point2)
      /* 根据经纬度计算出距离 */
      var geodesic = new EllipsoidGeodesic()
      geodesic.setEndPoints(point1cartographic, point2cartographic)
      var s = geodesic.surfaceDistance
      // 返回两点之间的距离
      s = Math.sqrt(Math.pow(s, 2) + Math.pow(point2cartographic.height - point1cartographic.height, 2))
      return s
    }
  }

  /**
   * 空间两点距离计算函数
   */
  clearMeasureLayer() {
    let tooltip = document.querySelector('#toolTip')
    tooltip.style.display = "none"
    const dataSource = this.viewer.dataSources.getByName('measureSource')
    if (dataSource) {
      dataSource.forEach(item => {
        this.viewer.dataSources.remove(item, true)
      })
    }
    this.handler.destroy()
  }
}
