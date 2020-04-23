const getNodeFromTEI = (tei, template, attributes, value) => {
    const teiId = tei.trackedEntityInstance;
    let color = template.color || "white";
    let labelAttributes = template.useLabel ? template.labelAttributes.map(att => att.value) : [];
    let labelArr = labelAttributes.map(att => attributes[att]);
    let label = labelArr.length > 1 ? labelArr.join(" | ") : labelArr.length > 0 ? labelArr[0] : "";
    return {
      id: teiId,
      label: label,
      color: {
        background: color
      },
      value,
      shape: "dot"
    };
  };
  
  const getTemplate = (visualization, program) => {
    return visualization.teTemplates.find(template => template.program.value === program);
  };
  
  const processInstance = (tei, instances, nodes, edges, visualization) => {
    const rels = tei.relationships.filter(rel => 
        rel.from.trackedEntityInstance.trackedEntityInstance === tei.trackedEntityInstance 
        /* && tei.program === visualization.teTemplates[0].program.value */ // Only plot relationships which start from a given program
        && instances[rel.to.trackedEntityInstance.trackedEntityInstance]);
  
    if (!visualization.hideUnrelatedInstances || rels.length) {
      const from = tei.trackedEntityInstance
      const template = getTemplate(visualization, tei.program);
      nodes.set(from, getNodeFromTEI(tei, template, tei.attributes, rels.length));
      
      rels.forEach(rel => {
        const to = rel.to.trackedEntityInstance.trackedEntityInstance;
        edges.push({
          from: from,
          to,
          color: 'black',
          arrows: visualization.useBidirectionalArrows ? 'from,to' : 'to'
        });
        
        if (!nodes.has(to)) {
          const toInstance = instances[to];
          const toTemplate = getTemplate(visualization, toInstance.program);
          nodes.set(to, getNodeFromTEI(toInstance, toTemplate, toInstance.attributes, 1));
        }
      });
    }
  };
  
  export const createVisJsConfig = (visualization, {
    instances
  }) => {
    const nodes = new Map(),
          edges = []
    Object.values(instances).forEach(tei => {
      processInstance(tei, instances, nodes, edges, visualization);
    });
  
    const nodesArray = Array.from(nodes.values())
  
    const stats = nodesArray.reduce((out, node) => {
      const program = instances[node.id].program
      out[program] = (out[program] || 0) + 1
      return out
    }, {})
    
    return {
      nodes: nodesArray,
      edges,
      stats
    };
  };