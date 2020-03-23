import React from 'react'
import {useDataEngine} from '@dhis2/app-runtime'
import "@blueprintjs/core/lib/css/blueprint.css"
import LocationTrackerMap from "./components/LocationTrackerMap";
import {HashRouter as Router, Route, Switch} from "react-router-dom";
import App from "./components/App";

const ContactTracingApp = () => {
    const engine = useDataEngine();

    let routes = <Router><Switch>
        <Route path="/location/:msisdn" component={(props) => <LocationTrackerMap {...props} engine={engine}/>}/>
        <Route path="/" exact={true} component={(props) => <App {...props} engine={engine}/>}/>
    </Switch></Router>;

    return routes;
};

export default ContactTracingApp