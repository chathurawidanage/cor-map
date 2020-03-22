import React from 'react'
import { useDataEngine } from '@dhis2/app-runtime'
import App from './components/App'

import './locales/index'

const ContactTracingApp = () => {
    const engine = useDataEngine()

    return <App engine={engine} />
}

export default ContactTracingApp