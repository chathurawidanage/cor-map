import React, { useMemo, useCallback, useState } from "react";
import Graph from "react-graph-vis";
import { CenteredMessageLoader } from "../helpers/CenteredMessageLoader";
import i18n from "../../locales";

const graphOptions = {
    interaction: {
        dragNodes: false
    },
    edges: {
        color: "#000000",
    },
    physics: {
        forceAtlas2Based: {
            avoidOverlap: 1,
        },
        maxVelocity: 146,
        solver: 'forceAtlas2Based',
        timestep: 0.35,
        stabilization: {
            enabled:true,
            iterations:2000,
            updateInterval:25
        }
    },
    autoResize: true,
    height: '100%',
    width: '100%'
};

export const NetworkGraph = ({ nodes, edges, onNodeSelected }) => {
    const [stabilizing, setStabilizing] = useState(true)
    const graphEvents = useMemo(() => ({}))
    
    graphEvents.click = useCallback(({ nodes: clickedNodes }) => {
        if (clickedNodes.length > 0) {
            onNodeSelected(clickedNodes[0])
        }
    }, [onNodeSelected])

    graphEvents.stabilizationIterationsDone = useCallback(() => setStabilizing(false))

    return <>
        {stabilizing && <CenteredMessageLoader message={i18n.t('Building relationship graph...')} />}
        <Graph
            graph={{ nodes, edges }}
            options={graphOptions}
            events={graphEvents} />
    </>
}