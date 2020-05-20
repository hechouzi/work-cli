import { Cartesian3 } from 'cesium';
import { eventEnum } from '../enum/event_enum'
import ImageEntity from '../entities/imageEntity'
import BillboardEntity from '../entities/billboardEntity'
import DataSource from '../dataSources/dataSource'

export default class CanvasContour {
  constructor(id, viewer) {
    this.id = id
    this.viewer = viewer
    this.isShow = true
    this.myDataSource = ''
  }

  loadData(data) {
    this.dataInfo = {
      Item: data.Item,
      Values: data.Values,
      LonMin: data.Bound[0],
      LonMax: data.Bound[1],
      LatMin: data.Bound[2],
      LatMax: data.Bound[3],
      ContourList: data.Info
    }

    const px1 = this.viewer.Cartesian3ToPx(this.viewer.scene,
      Cartesian3.fromDegrees(this.dataInfo.LonMin, this.dataInfo.LatMin, 0))
    const px2 = this.viewer.Cartesian3ToPx(this.viewer.scene,
      Cartesian3.fromDegrees(this.dataInfo.LonMax, this.dataInfo.LatMax, 0))

    this.boundInfo = {
      Width: Math.abs(px2.x - px1.x),
      Height: Math.abs(px2.y - px1.y)
    }
    debugger
    this.canvasNormal = document.createElement('canvas')
    this.canvasNormal.width = this.boundInfo.Width
    this.canvasNormal.height = this.boundInfo.Height
    this.ctx = this.canvasNormal.getContext('2d')
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

  drawContourLine(color = [255, 0, 0], width = 2) {
    const _this = this
    // this.viewer.addEvent(_this.id, eventEnum.WHEEL, () => {
    //   reDraw()
    // })

    reDraw()

    function reDraw() {

      if (_this.myDataSource) {
        _this.viewer.removerDataSource(_this.myDataSource)
      }

      const ctxNormal = _this.ctx
      ctxNormal.clearRect(0, 0, _this.boundInfo.Width, _this.boundInfo.Height)
      ctxNormal.lineWidth = width
      ctxNormal.strokeStyle = `rgb(${color[0]},${color[1]},${color[2]})`

      const contourLines = _this.dataInfo.ContourList

      let line
      let value
      let xy
      let index = 0
      let isFirst = true
      let labelPtX
      let labelPtY
      const Labels = []
      for (let i = 0; i < contourLines.length; i++) {
        value = contourLines[i].Value
        line = contourLines[i].Line
        index = Math.floor(line.length / 2)

        isFirst = true
        ctxNormal.beginPath()
        for (let j = 0; j < line.length; j++) {
          xy = _this.lonLatToCanvasXY(line[j][0], line[j][1])
          if (isFirst) {
            ctxNormal.moveTo(xy[0], xy[1])
            isFirst = false
          } else {
            ctxNormal.lineTo(xy[0], xy[1])
          }
        }
        ctxNormal.stroke()
        ctxNormal.closePath()

        labelPtX = line[index][0]
        labelPtY = line[index][1]
        Labels.push({
          id: i,
          name: `${value}`,
          position: [labelPtY, labelPtX]
        })
      }

      // return {
      //   pic: this.canvasNormal,
      //   range: [
      //     this.dataInfo.LonMin,
      //     this.dataInfo.LatMin,
      //     this.dataInfo.LonMax,
      //     this.dataInfo.LatMax],
      //   labels: Labels
      // }

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

      const entities = []
      const labels = Labels
      for (let i = 0; i < labels.length; i++) {
        const myBillboardEntity = new BillboardEntity(
          labels[i].id,
          Number(labels[i].name).toFixed(0),
          [labels[i].position[1], labels[i].position[0]],
          false,
          20,
          20,
          _this.isShow
        )
        entities.push(myBillboardEntity)
      }
      _this.myDataSource = new DataSource(_this.id)
      _this.myDataSource.addEntities(entities)
      _this.viewer.addDataSource(_this.myDataSource)
    }
  }

  changeShow() {
    this.viewer.chanegEntityShow(this.id)
    this.viewer.changeDataSourceShow(this.myDataSource)

    this.isShow = this.viewer.entities.getById(this.id).show
  }

  // 最好在销毁的时候使用
  destroy() {
    this.viewer.removeEvent(this.id, eventEnum.WHEEL)
    this.viewer.removerEntity(this.id)
    this.viewer.removerDataSource(this.myDataSource)
  }

}
