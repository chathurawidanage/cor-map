import React from 'react'
import {HashRouter, Switch, Route, Redirect} from "react-router-dom";
import { StartPage } from "./components/pages/StartPage";

import { DataStoreProvider } from './lib/dataStore/DataStoreProvider';

import { VisualizationPage } from './components/pages/VisualizationPage';
import { ConfigurationPage } from './components/pages/ConfigurationPage';

import './App.css'
import './locales'

const ContactTracingApp = (props) => {
    return (
        <DataStoreProvider loadingComponent="..." namespace={'CONTACT_TRACING_APP'} >
            <HashRouter>
                <Switch>
                    <Route path="/" exact={true} component={StartPage}/>
                    <Route path="/new" exact={true}>
                        <ConfigurationPage />
                    </Route>
                    <Route path="/visualization/:id" exact={true}>
                        <VisualizationPage />
                    </Route>
                    <Route path="/visualization/:id/edit" exact={true}>
                        <ConfigurationPage />
                    </Route>
                    <Redirect to="/" />
                </Switch>
            </HashRouter>
        </DataStoreProvider>
    )
};

export default ContactTracingApp