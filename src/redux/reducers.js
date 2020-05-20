import { combineReducers } from "redux";
import { cesiumMapReducer } from "./mapReducer/cesium_map_redux";

export default combineReducers({
  cesiumMapReducer,
});
