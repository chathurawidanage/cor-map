const getNodeFromTEI = (tei, template, attributes) => {
    const teiId = tei.trackedEntityInstance

    let color = template.color || "white";

    let labelAttributes = template.useLabel
        ? template.labelAttributes.map(att => att.value)
        : [];

    let labelArr = labelAttributes.map(att => attributes[att]);
    let label = labelArr.length > 1 ? labelArr.join(" | ") : (labelArr.length > 0 ? labelArr[0] : "");
        
    return {
        id: teiId,
        label: label,
        color: {
            background: color
        },
        shape: "dot"
    }
}

export const createVisJsConfig = (visualization, { instances, relationships, attributes } ) => {
    let programToTemplate = {};

    Object.values(visualization.teTemplates).forEach(te => {
        programToTemplate[te.program.value] = te;
    });

    const nodes = Object.values(instances).map(tei => {
        const id = tei.trackedEntityInstance
        const teiAttributes = attributes[id]
        return getNodeFromTEI(tei, programToTemplate[teiAttributes.program], teiAttributes)
    })

    // now process edges
    const edges = relationships.reduce((edges, rel) => {
        if (instances[rel.from] && instances[rel.to]) {
            edges.push({
                from: rel.from,
                to: rel.to,
                color: 'black',
                arrows: visualization.useBidirectionalArrows ? 'from,to' : 'to'
            })
        } else {
            console.warn("Found TEIs that hasn't been added", rel, instances[rel.from], instances[rel.to]);
        }
        return edges
    }, []);

    return { nodes, edges }
}