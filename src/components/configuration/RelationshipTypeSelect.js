import React from 'react'
import { MultiSelect, MultiSelectOption } from '@dhis2/ui-core';

const RELATIONSHIP_ENTITY_TEI = "TRACKED_ENTITY_INSTANCE";

export const RelationshipTypeSelect = ({selectedRTs, rts, onChange}) => {
    const rtToId = {};
    let rtsSelect = rts.map(rt => {
        // filtering non TEI to TEI relationships
        if (rt.fromConstraint.relationshipEntity !== rt.toConstraint.relationshipEntity
            && rt.fromConstraint.relationshipEntity !== RELATIONSHIP_ENTITY_TEI) {
            return null;
        }
        rtToId[rt.id] = rt;
        return <MultiSelectOption label={rt.name} value={rt.id} key={rt.id}/>
    });

    const onRTChange = (ref) => {
        let selectedRTs = ref.selected;
        let selectedTEs = {}

        ref.selected.forEach(rt => {
            selectedTEs[rtToId[rt.value].fromConstraint.trackedEntityType.id] = true;
            selectedTEs[rtToId[rt.value].toConstraint.trackedEntityType.id] = true;
        });
        onChange({
            selectedTEs: Object.keys(selectedTEs),
            selectedRTs
        });
    }

    return (
        <MultiSelect onChange={onRTChange} selected={selectedRTs}>
            {rtsSelect}
        </MultiSelect>
    );
};