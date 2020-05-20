import React from "react";
import ReactDOM from "react-dom";
import "./css/index.scss";
import "./css/reset.scss";
import "cesium/Source/Widgets/widgets.css";
import * as serviceWorker from "./serviceWorker";
import { HashRouter } from "react-router-dom";
import { createStore, applyMiddleware, compose } from "redux";
import { Provider } from "react-redux";
import thunk from "redux-thunk";
import reducers from "./redux/reducers";
import IndexRoute from "./router/index-router";
import zhCN from "antd/es/locale/zh_CN";
import { ConfigProvider } from "antd";

const store = createStore(
  reducers,
  compose(
    applyMiddleware(thunk),
    window.devToolsExtension ? window.devToolsExtension() : (fn) => fn
  )
);
ReactDOM.render(
  <Provider store={store}>
    <HashRouter>
      <ConfigProvider locale={zhCN}>
        <IndexRoute></IndexRoute>
      </ConfigProvider>
    </HashRouter>
  </Provider>,
  document.getElementById("root")
);
serviceWorker.unregister();
