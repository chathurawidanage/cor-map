import React from 'react';
import ReactDOM from 'react-dom';
import * as serviceWorker from './serviceWorker';
import Dashboard from "./components/Dashboard";
import "@blueprintjs/core/lib/css/blueprint.css";

ReactDOM.render(<Dashboard/>, document.getElementById('root'));

serviceWorker.unregister();
