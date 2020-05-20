import CoordinateTransform from './coordinateTransform'
import {
  ScreenSpaceEventHandler,
  CustomDataSource,
  ScreenSpaceEventType,
  defined,
  CallbackProperty,
  Rectangle,
  Entity,
  Color,
  HeightReference
} from 'cesium';
/** 框选放大/获取区域
 * @param { Object } viewer 地图视图
 */
export default class BoxSelect {
  constructor(viewer) {
    this.viewer = viewer
    this.handler = new ScreenSpaceEventHandler(this.viewer.scene.canvas) // 鼠标事件
  }

  /** 执行框选
  * @param { function } callback 如果有回调参数则返回四角坐标，如果没有，则框选放大
  */
  excuteBoxSelect(callback) {
    let _this = this
    let dataSource = new CustomDataSource('boxSelect')
    this.viewer.dataSources.add(dataSource)
    let activeShapePoints = []
    let activeShape
    let floatingPoint
    let tooltip = document.querySelector('#toolTip')
    tooltip.style.display = "block"
    // 取消双击事件-追踪该位置
    this.viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(ScreenSpaceEventType.LEFT_DOUBLE_CLICK)

    this.handler.setInputAction(res => {
      const ray = this.viewer.camera.getPickRay(res.position)
      let earthPosition = this.viewer.scene.globe.pick(ray, this.viewer.scene)
      // 不在地球范围内
      if (defined(earthPosition)) {
        if (activeShapePoints.length === 0) {
          floatingPoint = createPoint(earthPosition)
          dataSource.entities.add(floatingPoint)
          activeShapePoints.push(earthPosition)
          let dynamicPositions = new CallbackProperty(function () {
            return activeShapePoints
          }, false)
          activeShape = drawShape('rectangle', dynamicPositions) //绘制动态图
          dataSource.entities.add(activeShape)
        }
        activeShapePoints.push(earthPosition)
        createPoint(earthPosition)
        dataSource.entities.add(earthPosition)
      }
    }, ScreenSpaceEventType.LEFT_CLICK)

    // 鼠标移动
    this.handler.setInputAction(res => {
      // tooltip.style.left = res.endPosition.x + 3 + "px"
      // tooltip.style.top = res.endPosition.y - 25 + "px"
      tooltip.innerHTML = '<p>单击开始，右击结束，再次点击取消</p>'
      if (defined(floatingPoint)) {
        const ray = this.viewer.camera.getPickRay(res.endPosition)
        let newPosition = this.viewer.scene.globe.pick(ray, this.viewer.scene)
        if (defined(newPosition)) {
          floatingPoint.position.setValue(newPosition)
          activeShapePoints.pop()
          activeShapePoints.push(newPosition)
        }
      }
    }, ScreenSpaceEventType.MOUSE_MOVE)

    // 双击定位
    this.handler.setInputAction(res => {
      const dataSource = this.viewer.dataSources.getByName('boxSelect')
      if (dataSource[0]._entityCollection.getById('rectangle')) {
        let range = dataSource[0]._entityCollection.getById('rectangle')._description._value
        let xArray = []
        let yArray = []
        range.forEach(item => {
          let coordinateTransform = new CoordinateTransform(this.viewer)
          const xyz = coordinateTransform.worldToGeography(item)
          xArray.push(xyz.x)
          yArray.push(xyz.y)
        })
        let xNewArray = Array.from(new Set(xArray))
        let yNewArray = Array.from(new Set(yArray))
        const borderRange = {
          maxlong: Math.max(...xNewArray),
          minlong: Math.min(...xNewArray),
          maxlat: Math.max(...yNewArray),
          minlat: Math.min(...yNewArray)
        }
        if (callback) {
          callback(borderRange)
        } else {
          var rectangle = new Rectangle.fromDegrees(Math.min(...xNewArray), Math.min(...yNewArray), Math.max(...xNewArray), Math.max(...yNewArray))
          this.viewer.camera.flyTo({
            destination: rectangle
          })
        }
        this.viewer.dataSources.remove(dataSource[0], true)
        this.handler.destroy()
        this.handler = new ScreenSpaceEventHandler(this.viewer.scene.canvas) // 鼠标事件
        callback ? this.excuteBoxSelect(callback) : this.excuteBoxSelect()
      }
    }, ScreenSpaceEventType.RIGHT_CLICK)

    // 创建点
    function createPoint(worldPosition) {
      const point = new Entity({
        position: worldPosition,
        point: {
          color: Color.WHITE,
          pixelSize: 10,
          heightReference: HeightReference.CLAMP_TO_GROUND
        }
      })
      return point
    }

    // 画面
    function drawShape(drawingMode, positionData) {
      let shape
      if (drawingMode === 'rectangle') {
        let arr = typeof positionData.getValue === 'function' ? positionData.getValue(0) : positionData
        shape = new Entity({
          id: 'rectangle',
          name: 'boxRectangle',
          description: arr,
          rectangle: {
            coordinates: new CallbackProperty(function () {
              let obj = Rectangle.fromCartesianArray(arr)
              return obj
            }, false),
            material: Color.RED.withAlpha(0.5)
          }
        })
      }
      return shape
    }

    return this.borderRange
  }

  // 停止框选
  stopBoxSelect() {
    let tooltip = document.querySelector('#toolTip')
    tooltip.style.display = "none"
    const dataSource = this.viewer.dataSources.getByName('boxSelect')
    this.viewer.dataSources.remove(dataSource[0], true)
    this.handler.destroy()
    this.handler = new ScreenSpaceEventHandler(this.viewer.scene.canvas) // 鼠标事件
  }
}