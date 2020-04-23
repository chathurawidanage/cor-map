import {getProgramsToQuery, getTEAttributes} from './templateUtils';
import {programTEIQuery} from '../queries/TEIQueries';

// const isMoreRecent = (dateA, dateB) => {
//     if (!dateB) {
//         return true
//     }
//     if (!dateA) {
//         return false
//     }
//     return new Date(dateA) > new Date(dateB)
// }

const isHigherPriority = (programA, programB, programs) => {
    return programs.indexOf(programA) > programs.indexOf(programB)
}
const processTEIResponse = (teiDB, trackedEntityInstances, program, visualization, attributesToFetch) => {
    const programs = getProgramsToQuery(visualization);

    trackedEntityInstances.forEach(tei => {
        // const programEnrollmentDate = tei.enrollments.find(e => e.program === program)?.enrollmentDate
        const existingTEI = teiDB.instances[tei.trackedEntityInstance]
        if (existingTEI && isHigherPriority(existingTEI.program, program, programs)) { /*&& isMoreRecent(existingTEI.enrollments[0].enrollmentDate, programEnrollmentDate)*/
            return;
        }

        // Probably unnecessary, better to drop unrelated instances (but difficult to do at this stage)
        tei.attributes = 
            tei.attributes.reduce((acc, { attribute, value }) => {
                if (attributesToFetch.has(attribute)) {
                    acc[attribute] = value
                }
                return acc
            })
        
        tei.program = program
        teiDB.instances[tei.trackedEntityInstance] = tei
    });
}

export const fetchVisualizationData = async (engine, visualization) => {
    const programs = getProgramsToQuery(visualization);

    const requests = programs.map(program => {
        const attributesToFetch = getTEAttributes(visualization, program);
        return engine.query(programTEIQuery, {
            variables: {
                program,
                attributes: attributesToFetch.keys()
            }
        })
    });

    // load data
    const results = await Promise.all(requests)
        
    let teiDB = {
        instances: []
    };

    results.forEach((data, i) => {
        const program = programs[i];

        // todo currently TEI queries sends back all the attributes. Bug?
        // this is just to save some RAM
        const attributesToFetch = getTEAttributes(visualization, program);

        // process TEI response
        if (data?.teis?.trackedEntityInstances) {
            processTEIResponse(teiDB, data.teis.trackedEntityInstances, program, visualization, attributesToFetch);
        } else {
            console.warn("Nothing found for program", program);
        }
    })

    return teiDB
}