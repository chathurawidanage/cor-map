import React, { useState, useMemo, useEffect } from 'react';
import { TEIDetailsModal } from "./TEIDetailsModal";
import "./Visualization.css";
import { NetworkGraph } from './NetworkGraph';
import { fetchVisualizationData } from '../../utils/fetchVisualizationData';
import { createVisJsConfig } from '../../utils/createVisJsConfig';
import { useDataEngine } from '@dhis2/app-runtime';
import Legend from './Legend';
// import { AnalyticsDelayOverlay } from './AnalyticsDelayOverlay';
import { AlertBar } from '@dhis2/ui-core';
import i18n from '../../locales';
import { CenteredMessageLoader } from '../helpers/CenteredMessageLoader';

export const Visualization = ({ visualization, programs, parameters }) => {
    const engine = useDataEngine()
    const [data, setData] = useState(undefined)
    const [selectedTei, setSelectedTei] = useState(undefined)

    const graphConfig = useMemo(() => data && createVisJsConfig(visualization, data), [visualization, data])

    const overflown = data && data.overflown
    const empty = graphConfig && graphConfig.nodes.length === 0

    useEffect(() => {
        setData(undefined)
        fetchVisualizationData(engine, visualization, parameters)
            .then(setData)
    }, [engine, visualization, parameters])

    return <>
        {selectedTei 
            ? <TEIDetailsModal 
                te={selectedTei}
                programs={programs}
                onClose={() => {
                    setSelectedTei(undefined);
                }} />
            : null
        }
        {!graphConfig && <CenteredMessageLoader message={i18n.t('Downloading data...')} />}
        {graphConfig && !empty && (
            <NetworkGraph onNodeSelected={id => setSelectedTei({
                id,
                program: data.instances[id].program
            })} {...graphConfig} />
        )}
        { graphConfig && !empty && <Legend visualization={visualization} programs={programs} stats={graphConfig.stats}/>}
        { empty && (
            <div className="alert-bar-container">
                <AlertBar permanent icon>{i18n.t('No relationships found for the selected program enrollment period.')}</AlertBar>
            </div>
        )}
        { overflown && (
            <div className="alert-bar-container">
                <AlertBar permanent critical icon>
                    <span>{i18n.t('Too many tracked entity instances were found for the selected program enrollment start and end dates.  This visualization may be missing some instances and relationships.')}</span>
                    <br/><br/>
                    <strong>{i18n.t('Select a smaller date range and click update to try again.')}</strong>
                </AlertBar>
            </div>
        )}
        {/* <AnalyticsDelayOverlay /> */}
    </>
}