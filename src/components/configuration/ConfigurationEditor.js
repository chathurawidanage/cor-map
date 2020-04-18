import React from "react";
import {
    Button,
    InputField,
    Checkbox
} from "@dhis2/ui-core";
import {trackedEntityTypes, relationshipTypesQuery} from "../../queries/TEIQueries";
import Loader from "../loader/Loader";
import "./ConfigurationEditor.css";

import { TrackedEntityTemplateEditor } from './TrackedEntityTemplateEditor'
import { RelationshipTypeSelect } from "./RelationshipTypeSelect";
import { RelationshipTemplateMapEditor } from "./RelationshipTemplateMapEditor";

const stageValidators = [
    config => config.name !== "",
    config => config.selectedRTs.length > 0,
    config => config.teTemplates.length > 0 && 
        config.teTemplates.every(template => !!template.name.length && !!template.program),
    config => Object.values(config.relationshipTemplates).length > 0
        && Object.values(config.relationshipTemplates).every(rt => rt.from && rt.to)
]
const stageCount = stageValidators.length
const validateStage = (config, stage) => stage < stageCount && stageValidators[stage](config)
const isValidConfiguration = config => stageValidators.every(validate => validate(config))

const newColorSequence = ['red', 'blue', 'green', 'yellow', 'purple', 'black']

const generateTETemplateConfig = (id, te) => {
    return {
        id,
        name: `Template ${id + 1}`,
        color: newColorSequence[id % newColorSequence.length],
        te,
        useIcon: false,
        genderAttribute: {},
        genderMaleMatch: "",
        useLabel: false,
        labelAttributes: []
    };
};

export class ConfigurationEditor extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            stage: props.visualization ? stageCount : 0,
            loading: true,
            meta: {},
            visualization: {
                name: "",
                selectedRTs: [],
                selectedTEs: [],
                teTemplates: [],
                relationshipTemplates: {},
                hideUnrelatedInstances: true,
                useBidirectionalArrows: false,
                ...props.visualization
            }
        }
    }

    setLoading = (loading) => {
        this.setState({ loading });
    };

    componentDidMount() {
        // load meta data
        Promise.all([this.props.engine.query(trackedEntityTypes),
            this.props.engine.query(relationshipTypesQuery)
        ]).then(resp => {
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

    updateStage = () => {
        this.setState(state => {
            if (validateStage(state.visualization, state.stage)) {
                return {
                    stage: this.state.stage + 1
                }
            }
        })
    }

    updateVisualization = visualizationUpdate => {
        this.setState(state => {
            if (typeof visualizationUpdate === 'function') {
                visualizationUpdate = visualizationUpdate(state.visualization)
            }
            return {
                visualization: {
                    ...state.visualization,
                    ...visualizationUpdate,
                }
            }
        });
    }

    onNameChange = (event) => {
        this.updateVisualization({
            name: event.value
        })
        this.updateStage()
    }
    onRelationsChanged = (rels) => {
        this.updateVisualization(rels);
        if (!rels.selectedRTs.some(rel => 
            this.state.meta[rel.value]?.bidirectional
        )) {
            this.updateVisualization({ useBidirectionalArrows: false })
        }
        this.updateStage()
    };

    onTemplateFieldChanged = (templateId, field, value) => {
        this.updateVisualization(visualization => ({
            teTemplates: Object.assign(
                [],
                visualization.teTemplates,
                {
                    [templateId]: {
                        ...visualization.teTemplates[templateId], [field]: value
                    }
                }
            )
        }))
        this.updateStage()
    };

    createNewTETemplate = () => {
        this.updateVisualization(visualization => ({
            teTemplates: visualization.teTemplates.concat([
                generateTETemplateConfig(
                    visualization.teTemplates.length,
                    visualization.selectedTEs[0]
                )
            ])
        }))
        this.updateStage()
    };

    onTemplateRemoveClicked = (templateId) => {
        this.updateVisualization(visualization => {
            const teTemplates = [
                ...visualization.teTemplates
            ];
            teTemplates.splice(templateId, 1);
    
            const relationshipTemplates = Object.entries(visualization.relationshipTemplates).reduce((out, [ id, template ]) => {
                out[id] = {
                    from: template.from?.value === templateId ? undefined : template.from,
                    to: template.to?.value === templateId ? undefined : template.to
                }
                return out;
            }, {})

            return {
                teTemplates,
                relationshipTemplates
            }
        });
    };

    onRelationshipTemplateChanged = (relationshipId, side, templateId) => {
        this.updateVisualization(visualization => {
            const relationshipTemplates = visualization.relationshipTemplates
            if (!relationshipTemplates[relationshipId]) {
                relationshipTemplates[relationshipId] = {}
            }
            relationshipTemplates[relationshipId][side] = templateId;
            return {
                relationshipTemplates
            }
        });
        this.updateStage()
    };

    render() {

        if (this.state.loading) {
            return <Loader/>
        }

        let teCards = this.state.visualization.teTemplates.map(template => {
            return <TrackedEntityTemplateEditor template={template} key={template.id}
                                          selectedTEs={this.state.visualization.selectedTEs}
                                          tes={this.state.meta.trackedEntityTypes}
                                          onDelete={this.onTemplateRemoveClicked}
                                          onFieldChanged={this.onTemplateFieldChanged}/>
        });

        return (
            <div className="config-wrapper">
                <h2>Configure Visualization</h2>
                <div>
                    <h3>Step 1</h3>
                    <InputField placeholder="Unnamed Visualization" label="Give your visualization a name"
                                value={this.state.visualization.name} onChange={this.onNameChange}/>
                </div>
                {this.state.stage >= 1 ?
                    <div>
                        <h3>Step 2</h3>
                        <p>Select the relationships</p>
                        <RelationshipTypeSelect 
                            {...this.state.visualization}
                            onChange={this.onRelationsChanged}
                            rts={this.state.meta.relationshipTypes} />
                    </div> : null
                }
                {this.state.stage >= 2 ?
                        <div className="config-te-wrapper">
                            <h3>Step 3</h3>
                            <p>Define Tracked Entity Templates</p>
                            <Button onClick={this.createNewTETemplate} primary={true}>+ Add Template</Button>
                            <div className="config-te-cards">
                                {teCards}
                            </div>
                        </div>
                        : null
                }
                {this.state.stage >= 3 ?
                        <div className="mapping-wrapper">
                            <h3>Step 4</h3>
                            <p>Map the Templates to Relationships</p>
                            <div>
                                {this.state.visualization.selectedRTs.map(rt => 
                                    <RelationshipTemplateMapEditor key={rt.value}
                                        onRelationshipTemplateChanged={this.onRelationshipTemplateChanged}
                                        relationship={this.state.meta.relationshipTypesInv[rt.value]}
                                        trackedEntityTypes={this.state.meta.trackedEntityTypesInv}
                                        relationshipTemplate={this.state.visualization.relationshipTemplates[rt.value]}
                                        templates={this.state.visualization.teTemplates} />
                                )}
                            </div>
                        </div>
                        : null
                }
                <div className="config-final-step">
                    {this.state.stage >= 4 && <>
                            <h3>Step 5</h3>
                            <div className="config-checkbox">
                                <Checkbox
                                    checked={this.state.visualization.hideUnrelatedInstances}
                                    onChange={({ checked }) => this.updateVisualization({ hideUnrelatedInstances: checked })}
                                    label={'Hide instances with no relationships'}
                                />
                                <Checkbox
                                    disabled={!this.state.visualization.selectedRTs.some(rt => 
                                        this.state.meta.relationshipTypesInv[rt.value]?.bidirectional
                                    )}
                                    checked={this.state.visualization.useBidirectionalArrows}
                                    onChange={({ checked }) => this.updateVisualization({ useBidirectionalArrows: checked })}
                                    label={'Use bi-directional arrows ( <---> )'}
                                />
                            </div>
                        </>
                    }
                    <Button primary={true} disabled={!isValidConfiguration(this.state.visualization)} onClick={() => this.props.onSave(this.state.visualization)}>Save</Button>
                    <Button onClick={() => this.props.onCancel()}>Cancel</Button>
                </div>
            </div>
        )
    }
}

