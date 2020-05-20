import {
  SceneTransforms,
  Math as CMath,
  Cartesian3
} from 'cesium';
/* 坐标转换组件 */
export default class CoordinateTransform {
  constructor(viewer) {
    this.viewer = viewer
  }

  /**
   * 屏幕坐标转世界坐标
   * @param screenCoordinate 屏幕坐标信息
   */
  screenToWorld(screenCoordinate, viewer) {
    const cartesian = this.viewer.scene.globe.pick(this.viewer.camera.getPickRay(screenCoordinate), this.viewer.scene)
    return cartesian
  }

  /**
   * 世界坐标转屏幕坐标
   * @param worldCoordinate 屏幕坐标信息
   */
  worldToScreen(worldCoordinate, viewer) {
    const screenCoordinate = SceneTransforms.wgs84ToWindowCoordinates(this.viewer.scene, worldCoordinate)
    return screenCoordinate
  }

  /**
   * 世界坐标转地理坐标
   * @param worldCoordinate 世界坐标信息
   */
  worldToGeography(worldCoordinate, viewer) {
    const ellipsoid = this.viewer.scene.globe.ellipsoid
    const cartographic = ellipsoid.cartesianToCartographic(worldCoordinate)
    const result = {
      x: CMath.toDegrees(cartographic.longitude),
      y: CMath.toDegrees(cartographic.latitude),
      alt: cartographic.height
    }
    return result
  }

  /**
   * 地理坐标转世界坐标
   * @param geographyCoordinate 地理坐标信息
   */
  geographyToWorld(geographyCoordinate, viewer) {
    const worldCoordinate = Cartesian3.fromDegrees(geographyCoordinate.x, geographyCoordinate.y)
    return worldCoordinate
  }
} 