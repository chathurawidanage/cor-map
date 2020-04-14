export const trackedEntityInstanceQuery = {
    tei: {
        resource: 'trackedEntityInstances',
        id: ({id}) => id
    }
};


export const relationshipTypes = {
    rts: {
        resource: "relationshipTypes",
        params: () => ({
            paging: 'false',
            fields: ["id", "name", "description", "toConstraint", "fromConstraint"]
        })
    }
};

export const trackedEntityTypes = {
    tes: {
        resource: `trackedEntityTypes`,
        params: () => ({
            paging: "false",
            fields: ["id", "displayName", "trackedEntityTypeAttributes[id,displayName]"]
        })
    }
};

export const programs = {
    ps: {
        resource: `programs`,
        params: () => ({
            paging: "false",
            fields: ["id", "displayName", "trackedEntityType[id,displayName]", "programTrackedEntityAttributes[id,displayName,trackedEntityAttribute[id,displayName]]"]
        })
    }
};

export const trackedEntityType = (te) => {
    return {
        tes: {
            resource: `trackedEntityTypes/${te}`,
            params: () => ({
                paging: "false",
                fields: ["id", "displayName", "trackedEntityTypeAttributes[id,displayName]"]
            })
        }
    }
};

export const programTEIQuery = {
    teis: {
        resource: 'trackedEntityInstances',
        params: ({program}) => ({
            ouMode: 'ACCESSIBLE',
            fields: ['trackedEntityInstance', 'relationships[relationshipType,from[trackedEntityInstance[trackedEntityInstance]],to[trackedEntityInstance[trackedEntityInstance]]]'],
            paging: 'false',
            programStatus: 'ACTIVE',
            program
        })
    },
    attributes: {
        resource: 'trackedEntityInstances/query',
        params: ({program, attributes}) => ({
            ouMode: 'ACCESSIBLE',
            skipMeta: 'true',
            skipPaging: 'true',
            program,
            programStatus: 'ACTIVE',
            attribute: [...attributes]
        })
    }
};