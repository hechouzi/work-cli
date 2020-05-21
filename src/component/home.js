import React, { Component } from 'react'
import { Link, withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import { initCesiumMap } from '../redux/mapReducer/cesium_map_redux'

@connect(
  (state) => ({
    cesiumMapReducer: state.cesiumMapReducer,
  }),
  {
    initCesiumMap,
  }
)
class HomePage extends Component {
  componentDidMount() {
    // const { initCesiumMap } = this.props;
    // initCesiumMap("map-content");
    console.warn('aa')
  }

  render() {
    const { match } = this.props
    const { url } = match
    return (
      <nav>
        <div>
          <Link to={`${url}arcgis`}>arcgis地图</Link>
        </div>
        sadcewcbewbc
        <div id="map-content" />
      </nav>
    )
  }
}
export default withRouter(HomePage)
