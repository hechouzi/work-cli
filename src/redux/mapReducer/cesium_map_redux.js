import cesiumApp from "../../hthtMap/cesiumApp";
import axios from "axios";

const CESIUM_MAP = "CESIUM_MAP";
const initState = {
  cesiumViewer: {},
};
export function cesiumMapReducer(state = initState, action) {
  switch (action.type) {
    case CESIUM_MAP:
      return {
        ...state,
        cesiumViewer: action.data,
      };
    // return Object.assign({}, state, {
    //   arcgisViewer: action.data
    // })
    default:
      return state;
  }
}
/*
mapType:
'google_img':谷歌影像地图,
'google_img_cia':地图标注,
'google_vec':矢量地图,
'gaode_img',
'gaode_img_cia',
'gaode_vec',
'tdt_w_img',
'tdt_w_img_cia',
'tdt_w_vec',
'tdt_w_vec_cva'
*/
// 初始化地图
export function initCesiumMap(mapId) {
  return (dispatch) => {
    const params = {
      mapId: mapId,
      center: [118, 20, 10000000],
      is3D: true,
      isFly: true,
      mapType: "google_img",
    };
    const cesiumViewer = new cesiumApp(params);
    dispatch({
      type: CESIUM_MAP,
      data: cesiumViewer,
    });
  };
}
