import React, { useMemo } from 'react'
import {useSavedObjectList} from '../lib/dataStore'
import {Link} from 'react-router-dom'
import { MenuList, MenuItem } from '@dhis2/ui-core'

import networkIcon from './icons/network.svg'

export const VisualizationList = () => {
    const [visualizations] = useSavedObjectList()

    if (visualizations.length === 0) {
        return <p>
            No saved visualizations found, use the button below to create one!
        </p>
    }

    visualizations.sort((a, b) => 
        a.name === b.name ? 0 : a.name < b.name ? -1 : 1
    )

    return (
        <MenuList>
        {visualizations.map(visualization =>
            <Link component={MenuItem} icon={<img width={24} src={networkIcon} />} label={visualization.name} to={`/visualization/${visualization.id}`} key={visualization.id}>
            </Link>
        )}
        </MenuList>
    )
}