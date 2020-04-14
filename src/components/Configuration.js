import React from "react";
import {
    Button,
    Card,
    InputField,
    MultiSelect,
    MultiSelectField,
    MultiSelectOption,
    SingleSelectField,
    SingleSelectOption,
    SwitchField
} from "@dhis2/ui-core";
import {programs, relationshipTypes, trackedEntityInstanceQuery, trackedEntityTypes} from "../queries/TEIQueries";
import Loader from "./loader/Loader";
import {SliderPicker} from "react-color";
import "./Configuration.css";
import uuid from "uuid4";
import {EditableText} from "@blueprintjs/core";
import {useDataQuery} from "@dhis2/app-runtime";

const RELATIONSHIP_ENTITY_TEI = "TRACKED_ENTITY_INSTANCE";

const generateTETemplateConfig = (id, te) => {
    return {
        id,
        name: "Unnamed Template",
        color: "red",
        te,
        useIcon: false,
        genderAttribute: {},
        genderMaleMatch: "",
        useLabel: false,
        labelAttributes: []
    };
};

const RelationshipTypes = ({selectedRTs, rts, onChange}) => {
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

const Mapping = ({relationship, templates, trackedEntityTypes, onRelationshipTemplateChanged, relationshipTemplate}) => {
    // eligible templates for "to"
    let templatesTo = [];

    // eligible templates for "from"
    let templatesFrom = [];

    let fromTe = relationship.fromConstraint.trackedEntityType.id;
    let toTe = relationship.toConstraint.trackedEntityType.id;

    let templateIdMap = {}

    Object.values(templates).forEach(tem => {
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

const Template = ({template}) => {
    return (
        <div>
            <div className="te-node-preview" style={{backgroundColor: template.color}}>
                {template.useIcon ?
                    <img src="img/man.png" width={40} alt="gender-icon"/> : null}
            </div>
            <div className="te-node-preview-label">
                <p>
                    {template.useLabel && template.labelAttributes.map(att => att.label).join(" | ")}
                </p>
            </div>
        </div>
    );
}

const TrackedEntityTemplate = ({template, selectedTEs, onFieldChanged, tes, onDelete}) => {


    let {loading, data} = useDataQuery(programs);

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

    const onGenderIconToggle = (value) => {
        onFieldChanged(template.id, "useIcon", value.checked);
    };

    const onProgramChanged = (selection) => {
        onFieldChanged(template.id, "program", selection.selected);
    };

    const onLabelToggle = (value) => {
        onFieldChanged(template.id, "useLabel", value.checked);
    };

    const onLabelAttributesChanged = (value) => {
        onFieldChanged(template.id, "labelAttributes", value.selected);
    };

    const onGenderAttributeChanged = (value) => {
        onFieldChanged(template.id, "genderAttribute", value.selected);
    };

    const onGenderMaleMatchChanged = (event) => {
        onFieldChanged(template.id, "genderMaleMatch", event.value);
    };

    return (
        <Card className="te-card">
            <div className="te-card-header">
                <h4>
                    <EditableText placeholder="Unnamed Template" onChange={onNameChanged} value={template.name}/>
                </h4>
                <Template template={template}/>
            </div>
            <div className="te-configs">
                <SliderPicker color={template.color} onChange={onColorChanged}/>
                <SingleSelectField label="Program"
                                   selected={template.program}
                                   onChange={onProgramChanged}>
                    {data.ps.programs.map(pg => <SingleSelectOption label={pg.displayName} value={pg.id} key={pg.id}/>)}
                </SingleSelectField>
                <SwitchField label="Use gender icon" checked={template.useIcon} onChange={onGenderIconToggle}/>
                {
                    template.useIcon && template.program ?
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
                }
                <SwitchField label="Show Node Label" checked={template.useLabel} onChange={onLabelToggle}/>
                {
                    template.useLabel && template.program ?
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
                <Button destructive={true} onClick={() => {
                    onDelete(template.id)
                }}>Delete</Button>
            </div>
        </Card>
    );
};

export default class Configurations extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            selectedRTs: [],
            selectedTEs: [],
            teTemplates: {},
            loading: true,
            meta: {},
            name: "Cases to Suspects",
            relationshipTemplates: {},
            ...props.visualization
        }
    }

    setLoading = (loading) => {
        this.setState({loading});
    };

    componentDidMount() {
        // load meta data
        Promise.all([this.props.engine.query(trackedEntityTypes),
            this.props.engine.query(relationshipTypes)]).then(resp => {
            let trackedEntityTypesInv = {};
            let relationshipTypesInv = {};
            resp[0].tes.trackedEntityTypes.forEach(te => {
                trackedEntityTypesInv[te.id] = te;
            });
            resp[1].rts.relationshipTypes.forEach(re => {
                relationshipTypesInv[re.id] = re;
            });

            this.setState({
                loading: false,
                meta: {...resp[0].tes, ...resp[1].rts, trackedEntityTypesInv, relationshipTypesInv}
            })
        });
    }

    onRelationsChanged = (rels) => {
        this.setState(rels);
    };

    onTemplateFieldChanged = (templateId, field, value) => {
        this.setState({
            teTemplates: {
                ...this.state.teTemplates, [templateId]: {
                    ...this.state.teTemplates[templateId], [field]: value
                }
            }
        })
    };

    createNewTETemplate = () => {
        let id = uuid(); // TODO: Probably doesn't need to be a uuid?
        this.setState({
            teTemplates: {
                ...this.state.teTemplates, [id]: generateTETemplateConfig(id, this.state.selectedTEs[0])
            }
        })
    };

    onTemplateRemoveClicked = (templateId) => {
        let teTemplates = this.state.teTemplates;
        delete teTemplates[templateId];

        this.setState({
            teTemplates
        });
    };

    onRelationshipTemplateChanged = (relationshipId, side, templateId) => {
        let relationshipTemplates = this.state.relationshipTemplates;
        if (!relationshipTemplates[relationshipId]) {
            relationshipTemplates[relationshipId] = {}
        }

        relationshipTemplates[relationshipId][side] = templateId;
        console.log("Setting relationship template", relationshipTemplates);
        this.setState({relationshipTemplates});
    };

    render() {

        if (this.state.loading) {
            return <Loader/>
        }

        console.log("MEta", this.state);

        let teCards = Object.values(this.state.teTemplates).map(template => {
            return <TrackedEntityTemplate template={template} key={template.id}
                                          selectedTEs={this.state.selectedTEs}
                                          tes={this.state.meta.trackedEntityTypes}
                                          onDelete={this.onTemplateRemoveClicked}
                                          onFieldChanged={this.onTemplateFieldChanged}/>
        });

        return (
            <div className="config-wrapper">
                <h2>Configure New Visualization</h2>
                <div>
                    <h3>Step 1</h3>
                    <InputField placeholder="Unnamed Visualization" label="Give your visualization a name"
                                value={this.state.name} onChange={(event) => {
                        this.setState({name: event.value});
                    }}/>
                </div>
                {
                    this.state.name !== "" ?
                        <div>
                            <h3>Step 2</h3>
                            <p>Select the relationships</p>
                            <RelationshipTypes {...this.state} onChange={this.onRelationsChanged}
                                               rts={this.state.meta.relationshipTypes}/>
                        </div> : null
                }
                {
                    this.state.selectedTEs.length > 0 ?
                        <div className="config-te-wrapper">
                            <h3>Step 3</h3>
                            <p>Define Tracked Entity Templates</p>
                            <Button onClick={this.createNewTETemplate} primary={true}>New Template</Button>
                            <div className="config-te-cards">
                                {teCards}
                            </div>
                        </div>
                        : null
                }
                {
                    this.state.teTemplates && Object.values(this.state.teTemplates).length > 0 ?
                        <div className="mapping-wrapper">
                            <h3>Step 4</h3>
                            <p>Map the Templates to Relationships</p>
                            <div>
                                {this.state.selectedRTs.map(rt => <Mapping key={rt.value}
                                                                           onRelationshipTemplateChanged={this.onRelationshipTemplateChanged}
                                                                           relationship={this.state.meta.relationshipTypesInv[rt.value]}
                                                                           trackedEntityTypes={this.state.meta.trackedEntityTypesInv}
                                                                           relationshipTemplate={this.state.relationshipTemplates[rt.value]}
                                                                           templates={this.state.teTemplates}/>)}
                            </div>
                        </div>
                        : null
                }
                <div className="config-buttons">
                    {
                        Object.values(this.state.relationshipTemplates).length > 0
                        && Object.values(this.state.relationshipTemplates).map(rt => rt.from && rt.to).filter(valid => !valid).length === 0 &&
                        <>
                            <h3>Step 5</h3>
                            <Button primary={true} onClick={() => this.props.onSave(this.state)}>Save</Button>
                        </>
                    }
                    <Button onClick={() => this.props.onCancel()}>Cancel</Button>
                </div>
            </div>
        )
    }
}

