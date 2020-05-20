import {
  CustomDataSource,
  VerticalOrigin
} from 'cesium';
const FONTSIZE = 20
export default class DataSource extends CustomDataSource {
  constructor(name) {
    super(name)
    this.clustering.enabled = true
    this.clustering.pixelRange = 20
    this.clustering.minimumClusterSize = 1

    this.selectMark = {
      needSelect: false, // 是否需要选中
      id: false// 选中的markid
    }
  }

  markLocation(id) {
    this.selectMark = {
      needSelect: true,// 是否选中
      id// 选中的填图对象id
    }
  }


  addEntities(entities) {
    const entitiesMap = new Map()
    for (let i = 0; i < entities.length; i++) {
      this.entities.add(entities[i])
      entitiesMap.set(entities[i].id, entities[i])
    }

    this.clustering.clusterEvent.addEventListener((clusteredEntities, cluster) => {
      cluster.label.show = true
      cluster.label._fontSize = FONTSIZE
      cluster.label._pixelOffset = {
        x: -10,
        y: 15
      }
      cluster.billboard.show = true
      cluster.billboard.id = cluster.label.id
      cluster.billboard.verticalOrigin = VerticalOrigin.BOTTOM

      if (this.selectMark.needSelect) {
        let myData = false
        for (let i = 0; i < clusteredEntities.length; i++) {
          if (clusteredEntities[i].id === this.selectMark.id) {
            myData = entitiesMap.get(clusteredEntities[0].id)
            break
          }
        }

        if (myData) {
          cluster.billboard.image = myData.billboard.image
          cluster.label._renderedText = `${myData.name}`

          this.selectMark.needSelect = false
        } else {
          cluster.billboard.image = entitiesMap.get(clusteredEntities[0].id).billboard.image
          cluster.label._renderedText = `${entitiesMap.get(clusteredEntities[0].id).name}`
        }
      } else {
        cluster.billboard.image = entitiesMap.get(clusteredEntities[0].id).billboard.image
        cluster.label._renderedText = `${entitiesMap.get(clusteredEntities[0].id).name}`
      }
    })

    // force a re-cluster with the new styling
    const { pixelRange } = this.clustering
    this.clustering.pixelRange = 0
    this.clustering.pixelRange = pixelRange
  }
}
