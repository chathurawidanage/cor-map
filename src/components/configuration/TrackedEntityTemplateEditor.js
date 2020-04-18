import React from 'react'
import { Card, SingleSelectField, SingleSelectOption, SwitchField, InputField, MultiSelectField, MultiSelectOption, Button, Input } from '@dhis2/ui-core';
import { SliderPicker } from 'react-color';
import { programsQuery } from '../../queries/TEIQueries';
import { useDataQuery } from '@dhis2/app-runtime';
import Loader from '../loader/Loader';


const TemplatePreview = ({template}) => {
    const label = template.useLabel &&
        template.labelAttributes.length > 0 &&
        template.labelAttributes.map(att => att.label).join(" | ")

    return (
        <div>
            <div className="te-node-preview" style={{backgroundColor: template.color}}>
                {/* {template.useIcon ?
                    <img src="img/man.png" width={40} alt="gender-icon"/> : null} */}
            </div>
            <div className="te-node-preview-label">
                <p>
                    {label || <span>&nbsp;</span>}
                </p>
            </div>
        </div>
    );
}

export const TrackedEntityTemplateEditor = ({template, selectedTEs, onFieldChanged, tes, onDelete}) => {
    let {loading, data} = useDataQuery(programsQuery);

    if (loading) {
        return <Loader/>
    }

    let programById = {};

    data.ps.programs.forEach(pg => {
        programById[pg.id] = pg;
    });


    const onColorChanged = (color) => {
        onFieldChanged(template.id, "color", color.hex);
    };

    const onNameChanged = (name) => {
        onFieldChanged(template.id, "name", name);
    };

    // const onGenderIconToggle = (value) => {
    //     onFieldChanged(template.id, "useIcon", value.checked);
    // };

    const onProgramChanged = (selection) => {
        onFieldChanged(template.id, "program", selection.selected);
    };

    const onLabelToggle = (value) => {
        onFieldChanged(template.id, "useLabel", value.checked);
    };

    const onLabelAttributesChanged = (value) => {
        onFieldChanged(template.id, "labelAttributes", value.selected);
    };

    // const onGenderAttributeChanged = (value) => {
    //     onFieldChanged(template.id, "genderAttribute", value.selected);
    // };

    // const onGenderMaleMatchChanged = (event) => {
    //     onFieldChanged(template.id, "genderMaleMatch", event.value);
    // };

    return (
        <Card>
            <div className="te-card">
                <div className="te-card-header">
                    <TemplatePreview template={template}/>
                </div>
                <div className="te-configs">
                    <InputField label="Template name" error={!template.name.length} onChange={({ value }) => onNameChanged(value)} value={template.name}/>
                    <SliderPicker color={template.color} onChange={onColorChanged}/>
                    <SingleSelectField label="Program"
                                    selected={template.program}
                                    error={!template.program}
                                    onChange={onProgramChanged}>
                        {data.ps.programs.map(pg => <SingleSelectOption label={pg.displayName} value={pg.id} key={pg.id}/>)}
                    </SingleSelectField>
                    {template.program && <>
                        {/* <SwitchField label="Use gender icon" checked={template.useIcon} onChange={onGenderIconToggle}/>
                        {
                            template.useIcon ?
                                <div>
                                    <SingleSelectField label="Choose the gender attribute"
                                                    selected={template.genderAttribute}
                                                    onChange={onGenderAttributeChanged}>
                                        {programById[template.program.value].programTrackedEntityAttributes.map(tea => {
                                            return <SingleSelectOption label={tea.trackedEntityAttribute.displayName}
                                                                    value={tea.trackedEntityAttribute.id}
                                                                    key={tea.trackedEntityAttribute.id}/>
                                        })}
                                    </SingleSelectField>
                                    <InputField label="Value of the 'Male' gender to match" value={template.genderMaleMatch}
                                                onChange={onGenderMaleMatchChanged}/>
                                </div> : null
                        } */}
                        <SwitchField label="Show Node Label" checked={template.useLabel} onChange={onLabelToggle}/>
                        {
                            template.useLabel ?
                                <div>
                                    <MultiSelectField label="Node Label Attributes" selected={template.labelAttributes}
                                                    onChange={onLabelAttributesChanged}>
                                        {programById[template.program.value].programTrackedEntityAttributes.map(tea => {
                                            return <MultiSelectOption label={tea.trackedEntityAttribute.displayName}
                                                                    value={tea.trackedEntityAttribute.id}
                                                                    key={tea.trackedEntityAttribute.id}/>
                                        })}
                                    </MultiSelectField>
                                </div> : null
                        }
                    </>}
                </div>
                <div className="te-card-footer">
                    <Button
                        destructive={true}
                        onClick={() => {
                            onDelete(template.id)
                        }}
                    >
                        Delete
                    </Button>
                </div>
            </div>
        </Card>
    );
};