import React from 'react'
import { VisualizationWrapper } from './components/VisualizationWrapper';
import "@blueprintjs/core/lib/css/blueprint.css"
import {HashRouter, Switch, Route, Redirect} from "react-router-dom";
import Main from "./components/Main";
import { DataStoreProvider } from './services/dataStore/DataStoreProvider';
import { ConfigurationWrapper } from './components/ConfigurationWrapper';

import './locales'

const ContactTracingApp = () => {
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