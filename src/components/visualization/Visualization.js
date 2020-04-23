import React, { useState, useMemo, useEffect } from 'react';
import Loader from "../loader/Loader";
import { TEIDetailsModal } from "./TEIDetailsModal";
import "./Visualization.css";
import { NetworkGraph } from './NetworkGraph';
import { fetchVisualizationData } from '../../utils/fetchVisualizationData';
import { createVisJsConfig } from '../../utils/createVisJsConfig';
import { useDataEngine } from '@dhis2/app-runtime';
import Legend from './Legend';
import { AnalyticsDelayOverlay } from './AnalyticsDelayOverlay';
import { CircularLoader } from '@dhis2/ui-core';

export const Visualization = ({ visualization, programs, parameters }) => {
    const engine = useDataEngine()
    const [data, setData] = useState(undefined)
    const [selectedTei, setSelectedTei] = useState(undefined)

    const graphConfig = useMemo(() => data && createVisJsConfig(visualization, data), [visualization, data])

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
        {!data || !graphConfig
            ? <CircularLoader className="centered" />
            : <>
                <NetworkGraph onNodeSelected={id => setSelectedTei({
                    id,
                    program: data.instances[id].program
                })} {...graphConfig} />
                <Legend visualization={visualization} programs={programs} stats={graphConfig.stats}/>
            </>
        }
        {/* <AnalyticsDelayOverlay /> */}
    </>
}