import Cesium from 'cesium/Cesium'
/** 卷帘
 * @param { Object } viewer 地图视图
 * @param { Object } sliderLayer 当前已存在图层传入layer，新加图层传入provider
 * @param { String } direction 卷帘方向：left，right
 * @param { Bool } isNewLayer 是否为新加图层，是新图层true，已存在图层false
 */
export default class Slider {
  constructor (viewer, sliderLayer, direction, isNewLayer) {
    this.viewer = viewer // 地图容器
    this.sliderLayer = sliderLayer // 卷帘图层provider
    this.direction = direction // 方向
    this.isNewLayer = isNewLayer // 是否是新图层
  }

  doSlider () {
    const _this = this
    let slider = document.querySelector('#slider')
    slider.style.display = 'block'
    const imagerySplitDirection = this.direction === 'left' ? Cesium.ImagerySplitDirection.LEFT : Cesium.ImagerySplitDirection.RIGHT
    if (!this.isNewLayer) {
      // 当前已存在异常
      this.sliderLayer.splitDirection = imagerySplitDirection
    } else {
      // 添加新图层
      let layers = this.viewer.imageryLayers
      this.sliderLayer = new Cesium.ImageryLayer(this.sliderLayer)
      layers.add(this.sliderLayer)
      this.sliderLayer.splitDirection = imagerySplitDirection // Only show to the left of the slider.
    }

    // Sync the position of the slider with the split position
    this.viewer.scene.imagerySplitPosition = (slider.offsetLeft) / slider.parentElement.offsetWidth

    this.handler = new Cesium.ScreenSpaceEventHandler(slider)

    let moveActive = false // 移动激活状态

    function move(movement) {
      if(!moveActive) {
          return
      }
  
      let relativeOffset = movement.endPosition.x ;
      let splitPosition = (slider.offsetLeft + relativeOffset) / slider.parentElement.offsetWidth
      slider.style.left = 100.0 * splitPosition + '%'
      _this.viewer.scene.imagerySplitPosition = splitPosition
    }

    this.handler.setInputAction(function() {
      moveActive = true
    }, Cesium.ScreenSpaceEventType.LEFT_DOWN)

    this.handler.setInputAction(function() {
        moveActive = true
    }, Cesium.ScreenSpaceEventType.PINCH_START)
    
    this.handler.setInputAction(move, Cesium.ScreenSpaceEventType.MOUSE_MOVE)

    this.handler.setInputAction(move, Cesium.ScreenSpaceEventType.PINCH_MOVE)
    
    this.handler.setInputAction(function() {
        moveActive = false
    }, Cesium.ScreenSpaceEventType.LEFT_UP)

    this.handler.setInputAction(function() {
        moveActive = false
    }, Cesium.ScreenSpaceEventType.PINCH_END)
  }

  clearSlider () {
    let slider = document.querySelector('#slider')
    slider.style.display = 'none'
    if (!this.isNewLayer) {
      this.sliderLayer.splitDirection = Cesium.ImagerySplitDirection.NONE
    } else {
      let layers = this.viewer.imageryLayers
      layers.remove(this.sliderLayer)
    }
    this.handler.destroy()
  }
}