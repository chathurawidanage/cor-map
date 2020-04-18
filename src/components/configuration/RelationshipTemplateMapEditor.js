import React from 'react'
import { SingleSelectField, SingleSelectOption } from '@dhis2/ui-core';

export const RelationshipTemplateMapEditor = ({relationship, templates, trackedEntityTypes, onRelationshipTemplateChanged, relationshipTemplate}) => {
    // eligible templates for "to"
    let templatesTo = [];

    // eligible templates for "from"
    let templatesFrom = [];

    let fromTe = relationship.fromConstraint.trackedEntityType.id;
    let toTe = relationship.toConstraint.trackedEntityType.id;

    let templateIdMap = {}

    templates.forEach(tem => {
        if (tem.te === fromTe) {
            templatesFrom.push(tem);
        }

        if (tem.te === toTe) {
            templatesTo.push(tem);
        }

        templateIdMap[tem.id] = tem;
    });

    const onFromChanged = (selection) => {
        onRelationshipTemplateChanged(relationship.id, "from", selection.selected);
    };

    const onToChanged = (selection) => {
        onRelationshipTemplateChanged(relationship.id, "to", selection.selected);
    };

    relationshipTemplate = relationshipTemplate || {};

    let fromId = relationshipTemplate.from?.value;
    let toId = relationshipTemplate.to?.value;

    return (
        <div>
            <h4>{relationship.name}</h4>
            <div className="relationship-mapping">
                <div>
                    <SingleSelectField label="Template for 'from'" selected={templateIdMap[fromId] ? {
                        value: fromId,
                        label: templateIdMap[fromId]?.name
                    } : {}} onChange={onFromChanged}>
                        {templatesFrom.map(f => <SingleSelectOption label={f.name} value={f.id} key={f.id}/>)}
                    </SingleSelectField>
                </div>
                <div>

                </div>
                <div>
                    <SingleSelectField label="Template for 'to'" selected={templateIdMap[toId] ? {
                        value: toId,
                        label: templateIdMap[toId]?.name
                    } : {}} onChange={onToChanged}>
                        {templatesTo.map(f => <SingleSelectOption label={f.name} value={f.id} key={f.id}/>)}
                    </SingleSelectField>
                </div>
            </div>
            {/*{relationshipTemplate.from && relationshipTemplate.to && (*/}
            {/*    <div className="relationship-preview">*/}
            {/*        <Template template={templates[relationshipTemplate.from.value]}/>*/}
            {/*        <img src="img/arrow.svg" width={60}/>*/}
            {/*        <Template template={templates[relationshipTemplate.to.value]}/>*/}
            {/*    </div>*/}
            {/*)}*/}
        </div>
    );
};