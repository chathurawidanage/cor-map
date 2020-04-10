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
import {relationshipTypes, trackedEntityTypes} from "../queries/TEIQueries";
import Loader from "./loader/Loader";
import {SliderPicker} from "react-color";
import "./Configuration.css";
import uuid from "uuid4";
import {EditableText} from "@blueprintjs/core";

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

const Mapping = ({relationship, templates}) => {
    let templatesTo = [];
    let templatesFrom = [];

    console.log(relationship);
};

const TrackedEntityTemplate = ({template, selectedTEs, onFieldChanged, tes, onDelete}) => {

    let tesById = {};

    tes.forEach(te => {
        tesById[te.id] = te;
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

    const onTEChanged = (selection) => {
        onFieldChanged(template.id, "te", selection.selected.value);
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

    return (
        <Card className="te-card">
            <div className="te-card-header">
                <h4>
                    <EditableText placeholder="Unnamed Template" onChange={onNameChanged} value={template.name}/>
                </h4>
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
            <div className="te-configs">
                <SliderPicker color={template.color} onChange={onColorChanged}/>
                <SingleSelectField label="Tracked Entity"
                                   selected={{value: template.te, label: tesById[template.te].displayName}}
                                   onChange={onTEChanged}>
                    {selectedTEs.map(te => <SingleSelectOption label={tesById[te].displayName} value={te} key={te}/>)}
                </SingleSelectField>
                <SwitchField label="Use gender icon" checked={template.useIcon} onChange={onGenderIconToggle}/>
                {
                    template.useIcon ?
                        <div>
                            <SingleSelectField label="Choose the gender attribute"
                                               selected={template.genderAttribute}
                                               onChange={onGenderAttributeChanged}>
                                {tesById[template.te].trackedEntityTypeAttributes.map(tea => {
                                    return <SingleSelectOption label={tea.displayName} value={tea.id} key={tea.id}/>
                                })}
                            </SingleSelectField>
                            <InputField label="Value of the 'Male' gender to match"/>
                        </div> : null
                }
                <SwitchField label="Show Node Label" checked={template.useLabel} onChange={onLabelToggle}/>
                {
                    template.useLabel ?
                        <div>
                            <MultiSelectField label="Node Label Attributes" selected={template.labelAttributes}
                                              onChange={onLabelAttributesChanged}>
                                {tesById[template.te].trackedEntityTypeAttributes.map(tea => {
                                    return <MultiSelectOption label={tea.displayName} value={tea.id} key={tea.id}/>
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
            name: "Cases to Suspects"
        }
    }

    setLoading = (loading) => {
        this.setState({loading});
    };

    componentDidMount() {
        // load meta data
        Promise.all([this.props.engine.query(trackedEntityTypes),
            this.props.engine.query(relationshipTypes)]).then(resp => {
            this.setState({
                loading: false,
                meta: {...resp[0].tes, ...resp[1].rts}
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
        let id = uuid();
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
                        </div>
                        : null
                }
            </div>
        )
    }
}

