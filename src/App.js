import React from 'react'
import {useDataEngine} from '@dhis2/app-runtime'
import Visualization from './components/Visualization';
import "@blueprintjs/core/lib/css/blueprint.css"
import {HashRouter, Switch, Route} from "react-router-dom";
import Configuration from "./components/Configuration";
import Main from "./components/Main";

const ContactTracingApp = () => {
    const engine = useDataEngine();
    return <HashRouter>
        <Switch>
            <Route path="/" exact={true} component={Main}/>
            <Route path="/configure" exact={true} component={Configuration} engine={engine}/>
            <Route path="/visualize" component={(props) => {
                return <Visualization engine={engine} {...props}/>
            }}/>
        </Switch>
    </HashRouter>
};

export default ContactTracingApp