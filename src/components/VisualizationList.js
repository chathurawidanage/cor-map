import React, { useMemo } from 'react'
import {useSavedObjectList} from '@dhis2/app-service-datastore'
import {Link} from 'react-router-dom'
import { Menu, MenuItem } from '@dhis2/ui'
import i18n from '../locales/index.js'

import networkIcon from './icons/network.svg'

export const VisualizationList = () => {
    const [visualizations] = useSavedObjectList()

    if (visualizations.length === 0) {
        return <p>
            {i18n.t('No saved visualizations found, use the button below to create one!')}
        </p>
    }

    visualizations.sort((a, b) => 
        a.name === b.name ? 0 : a.name < b.name ? -1 : 1
    )

    return (
        <Menu>
        {visualizations.map(visualization =>
            <Link component={MenuItem} icon={<img width={24} src={networkIcon} />} label={visualization.name} to={`/visualization/${visualization.id}`} key={visualization.id}>
            </Link>
        )}
        </Menu>
    )
}