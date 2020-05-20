import { Cartesian3 } from 'cesium';
/*
* id:id；str
* name:文字内容；str
* position:位置；[118,32]
* image:图片资源；不是路径
* width：图片宽；num
* height：图片高；num
* */
export default class BillboardEntity {
  constructor(id, name, position, image, width, height, isShow = true) {
    let myImage = new Image()
    if (image) {
      myImage = image
    }
    this.id = id
    this.name = name
    this.show = isShow
    this.position = Cartesian3.fromDegrees(position[0], position[1])
    this.billboard = {
      image: myImage,
      width,
      height
    }
  }
}
