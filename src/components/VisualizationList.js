import {useSavedObjectList} from '../services/dataStore'
import {visualizationListItem} from './VisualizationList.module.css'
import {Link} from 'react-router-dom'

export const VisualizationList = () => {
    const [visualizations] = useSavedObjectList()

    return visualizations.map(visualization =>
        <Link to={`/visualization/${visualization.id}`} key={visualization.id}>
            <div className={visualizationListItem}>
                {visualization.name}
            </div>
        </Link>
    )
}