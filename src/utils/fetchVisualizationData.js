import {getProgramsToQuery, getTEAttributes} from './templateUtils';
import {programTEIQuery} from '../queries/TEIQueries';

const processTEIResponse = (teiDB, trackedEntityInstances, program, visualization) => {
    trackedEntityInstances.forEach(tei => {
        teiDB.attributes[tei.trackedEntityInstance] = {
            program: program
        };
        if (!visualization.hideUnrelatedInstances || (tei.relationships && tei.relationships.length > 0)) {
            teiDB.instances[tei.trackedEntityInstance] = tei
            tei.relationships?.forEach(rel => {
                teiDB.relationships.push({
                    from: rel.from.trackedEntityInstance.trackedEntityInstance,
                    to: rel.to.trackedEntityInstance.trackedEntityInstance
                });
            });
        }
    });
}

const processTEIAttributeResponse = (teiDB, attributes, attributesToFetchMap) => {
    attributes.rows.forEach(row => {
        if (!teiDB.attributes[row[0]]) {
            teiDB.attributes[row[0]] = {}
        }
        for (let i = 7; i < attributes.headers.length; i++) {
            //saving some RAM
            if (attributesToFetchMap[attributes.headers[i].name]) {
                teiDB.attributes[row[0]][attributes.headers[i].name] = row[i];
            }
        }
    });
}

export const fetchVisualizationData = async (engine, visualization) => {
    const programs = getProgramsToQuery(visualization);

    const requests = programs.map(program => {
        const attributesToFetch = getTEAttributes(visualization, program);
        return engine.query(programTEIQuery, {
            variables: {
                program,
                attributes: attributesToFetch
            }
        })
    });

    // load data
    const results = await Promise.all(requests)
        
    let teiDB = {
        instances: [],
        relationships: [],
        attributes: {}
    };

    results.forEach((data, i) => {
        const program = programs[i];

        // todo currently TEI queries sends back all the attributes. Bug?
        // this is just to save some RAM
        const attributesToFetch = getTEAttributes(visualization, program);
        const attributesToFetchMap = {};
        attributesToFetch.forEach(att => {
            attributesToFetchMap[att] = true;
        });

        // process TEI response
        if (data?.teis?.trackedEntityInstances) {
            processTEIResponse(teiDB, data.teis.trackedEntityInstances, program, visualization);
        } else {
            console.warn("Nothing found for program", program);
        }

        if (data?.attributes?.rows) {
            processTEIAttributeResponse(teiDB, data.attributes, attributesToFetchMap);
        } else {
            console.warn("No attributes found for program", program);
        }
    })

    return teiDB
}