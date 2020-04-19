import React, { useMemo, useCallback } from "react";
import Graph from "react-graph-vis";

const graphOptions = {
    layout: {
        // improvedLayout: true,
        // "hierarchical": {
        //     "enabled": true,
        //     "sortMethod": "directed",
        //     "direction": "LR",
        //     nodeSpacing: 200,
        //     levelSeparation: 200
        // }
    },
    edges: {
        color: "#000000",
        smooth: {enabled: true, type: 'straightCross'}
    },
    nodes: {
        imagePadding: 5
    },
    physics: {
        solver: "barnesHut",
        barnesHut: {
            avoidOverlap: 1
        }
    },
    autoResize: true,
    height: '100%',
    width: '100%'
};

export const NetworkGraph = ({ nodes, edges, onNodeSelected }) => {
    const graphEvents = useMemo(() => ({}))
    
    graphEvents.doubleClick = useCallback(({ nodes: clickedNodes }) => {
        if (clickedNodes.length > 0) {
            onNodeSelected(clickedNodes[0])
        }
    }, [onNodeSelected])

    return <Graph
        graph={{ nodes, edges }}
        options={graphOptions}
        events={graphEvents} />
}