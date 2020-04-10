import React from 'react'
import {useDataEngine} from '@dhis2/app-runtime'
import { VisualizationWrapper } from './components/VisualizationWrapper';
import "@blueprintjs/core/lib/css/blueprint.css"
import {HashRouter, Switch, Route, Redirect} from "react-router-dom";
import Configuration from "./components/Configuration";
import Main from "./components/Main";
import { DataStoreProvider } from './services/dataStore/DataStoreProvider';
import { ConfigurationWrapper } from './components/ConfigurationWrapper';

const ContactTracingApp = () => {
    const engine = useDataEngine();
        return <DataStoreProvider loadingComponent="..." namespace={'CONTACT_TRACING_APP'} >
            <HashRouter>
                <Switch>
                    <Route path="/" exact={true} component={Main}/>
                    <Route path="/new" exact={true}>
                        <ConfigurationWrapper />
                    </Route>
                    <Route path="/visualization/:id" exact={true}>
                        <VisualizationWrapper />
                    </Route>
                    <Route path="/visualization/:id/edit" exact={true}>
                        <ConfigurationWrapper />
                    </Route>
                    <Redirect to="/" />
                </Switch>
            </HashRouter>
        </DataStoreProvider>
};

export default ContactTracingApp