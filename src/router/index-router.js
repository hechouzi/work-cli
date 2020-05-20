import React, { lazy, Suspense, Component } from "react";
import { Switch, Route } from "react-router-dom";
const LazyHomePage = lazy(() => import("../component/home"));

export default class IndexRoute extends Component {
  render() {
    return (
      <Suspense fallback={<div>Loading</div>}>
        <Switch>
          <Route exact component={LazyHomePage} path="/" />
        </Switch>
      </Suspense>
    );
  }
}
