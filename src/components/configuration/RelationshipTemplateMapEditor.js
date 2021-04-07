import React from 'react'
import { SingleSelectField, SingleSelectOption } from '@dhis2/ui';
import i18n from '../../locales';

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

    let fromId = relationshipTemplate.from;
    let toId = relationshipTemplate.to;

    return (
        <div>
            <h4>{relationship.name}</h4>
            <div className="relationship-mapping">
                <div>
                    <SingleSelectField label={i18n.t("Template for 'from'")} selected={fromId} onChange={onFromChanged}>
                        {templatesFrom.map(f => <SingleSelectOption label={f.name} value={String(f.id)} key={f.id}/>)}
                    </SingleSelectField>
                </div>
                <div>

                </div>
                <div>
                    <SingleSelectField label={i18n.t("Template for 'to'")} selected={toId} onChange={onToChanged}>
                        {templatesTo.map(f => <SingleSelectOption label={f.name} value={String(f.id)} key={f.id}/>)}
                    </SingleSelectField>
                </div>
            </div>
            {/*{relationshipTemplate.from && relationshipTemplate.to && (*/}
            {/*    <div className="relationship-preview">*/}
            {/*        <Template template={templates[relationshipTemplate.from]}/>*/}
            {/*        <img src="img/arrow.svg" width={60}/>*/}
            {/*        <Template template={templates[relationshipTemplate.to]}/>*/}
            {/*    </div>*/}
            {/*)}*/}
        </div>
    );
};