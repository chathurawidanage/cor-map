import React from 'react'
import { useDataEngine } from '@dhis2/app-runtime'
import App from './components/App';
import "@blueprintjs/core/lib/css/blueprint.css"

const ContactTracingApp = () => {
    const engine = useDataEngine();

    return <App engine={engine} />
};

export default ContactTracingApp