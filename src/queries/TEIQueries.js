export const trackedEntityInstanceQuery = {
    tei: {
        resource: 'trackedEntityInstances',
        id: ({ id }) => id
    }
}

export const programTEIQuery = {
    teis: {
        resource: 'trackedEntityInstances',
        params: ({ program }) => ({
            ouMode: 'ACCESSIBLE',
            fields: ['trackedEntityInstance', 'relationships[relationshipType,from[trackedEntityInstance[trackedEntityInstance]],to[trackedEntityInstance[trackedEntityInstance]]]'],
            paging: 'false',
            programStatus: 'ACTIVE',
            program
        })
    },
    attributes: {
        resource: 'trackedEntityInstances/query',
        params: ({ program, attributes }) => ({
            ouMode: 'ACCESSIBLE',
            skipMeta: 'true',
            skipPaging: 'true',
            program,
            programStatus: 'ACTIVE',
            attribute: [...attributes]
        })
    }
}