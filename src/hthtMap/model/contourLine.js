import {
  Cartesian3,
  Color,
  ColorGeometryInstanceAttribute,
  GeometryInstance,
  PolylineColorAppearance,
  PolylineGeometry,
  Primitive
} from 'cesium'

export default class ContourLine {
  constructor(viewer, data) {
    this.viewer = viewer
    this.scene = viewer.scene
    this.primitivesArray = []

    const info = data.Info
    for (let i = 0; i < info.length; i++) {
      this.primitivesArray[i] = this.scene.primitives.add(new Primitive({
        geometryInstances: new GeometryInstance({
          geometry: new PolylineGeometry({
            positions: Cartesian3.fromDegreesArray(
              info[i].Line.flat()
            ),
            width: 2.0,
            vertexFormat: PolylineColorAppearance.VERTEX_FORMAT
          }),
          attributes: {
            color: ColorGeometryInstanceAttribute.fromColor(new Color(1.0, 0.0, 0.0, 0.8))
          }
        }),
        appearance: new PolylineColorAppearance()
      }))
    }
  }

  changeShow(isShow) {
    for (let i = 0; i < this.primitivesArray.length; i++) {
      this.primitivesArray[i].show = isShow
    }
  }

  destroy() {
    for (let i = 0; i < this.primitivesArray.length; i++) {
      this.scene.primitives.remove(this.primitivesArray[i])
    }
  }
}
