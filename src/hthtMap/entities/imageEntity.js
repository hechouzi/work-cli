import { Rectangle } from 'cesium';

/*
* id:id；str
* url:图片资源；url
* range:图片4角坐标；[118, 32, 133, 45]
* */
export default class ImageEntity {
  constructor(id, url, range, isShow = true) {
    this.id = id
    this.show = isShow
    this.rectangle = {
      coordinates: new Rectangle.fromDegrees(...range),
      material: url
    }
  }
}
