import React, { Component } from "react";
import { Link, withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { initCesiumMap } from "../redux/mapReducer/cesium_map_redux";

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
  }
  render() {
    const { url } = this.props.match;
    return (
      <nav>
        <div>
          <Link to={`${url}arcgis`}>arcgis地图</Link>
        </div>
        sadcewcbewbc
        <div id="map-content"></div>
      </nav>
    );
  }
}
export default withRouter(HomePage);
