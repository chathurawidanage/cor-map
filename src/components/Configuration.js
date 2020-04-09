import React from "react";
import {Card, MultiSelect, MultiSelectOption, Switch} from "@dhis2/ui-core";
import {useDataQuery} from '@dhis2/app-runtime';
import {relationshipTypes, trackedEntityType} from "../queries/TEIQueries";
import Loader from "./loader/Loader";
import {SliderPicker} from "react-color";
import "./Configuration.css";
import uuid from "uuid4";

const RELATIONSHIP_ENTITY_TEI = "TRACKED_ENTITY_INSTANCE";

const generateTEConfig = (te) => {
    return {
        id: te,
        color: "red",
        useIcon: false
    };
};

const RelationshipTypes = ({selectedRTs, selectedTEs, onChange}) => {
    let {loading, data} = useDataQuery(relationshipTypes);

    if (loading) {
        return (
            <Loader/>
        );
    }

    const rtToId = {};

    let rts = data.rts.relationshipTypes.map(rt => {
        // filtering non TEI to TEI relationships
        if (rt.fromConstraint.relationshipEntity !== rt.toConstraint.relationshipEntity
            && rt.fromConstraint.relationshipEntity !== RELATIONSHIP_ENTITY_TEI) {
            return null;
        }
        rtToId[rt.id] = rt;
        return <MultiSelectOption label={rt.name} value={rt.id} key={rt.id}/>
    });

    const addTE = (te) => {
        if (!selectedTEs[te]) {
            selectedTEs[te] = generateTEConfig(te);
        }
    };

    const onRTChange = (ref) => {
        let selectedRTs = ref.selected;

        ref.selected.forEach(rt => {
            addTE(rtToId[rt.value].fromConstraint.trackedEntityType.id);
            addTE(rtToId[rt.value].toConstraint.trackedEntityType.id);
        });
        onChange({
            selectedTEs,
            selectedRTs
        });
    }

    return (
        <MultiSelect onChange={onRTChange} selected={selectedRTs}>
            {rts}
        </MultiSelect>
    );
};

const TrackedEntityTypeCard = ({te, onColorChanged}) => {
    let {loading, data} = useDataQuery(trackedEntityType(te.id));

    if (loading) {
        return <Loader/>
    }

    return (
        <Card className="te-card">
            <div className="te-card-header">
                <h4>{data.tes.displayName}</h4>
            </div>
            <div className="te-node-preview" style={{backgroundColor: te.color}}>
                <img src="img/man.png" width={40}/>
            </div>
            <div className="te-configs">
                <SliderPicker color={te.color} onChangeComplete={(color) => {
                    onColorChanged(te.id, color.hex);
                }}/>
                <div>
                    <Switch label="Use gender icon"/>
                </div>
            </div>
        </Card>
    );
};

export default class Configurations extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            selectedRTs: [],
            selectedTEs: {}
        }
    }

    onRelationsChanged = (rels) => {
        this.setState(rels);
    };

    onTEColorChanged = (te, color) => {
        this.setState({
            selectedTEs: {
                ...this.state.selectedTEs, [te]: {
                    ...this.state.selectedTEs[te], color
                }
            }
        })
    };

    render() {
        let teCards = Object.values(this.state.selectedTEs).map(te => {
            return <TrackedEntityTypeCard te={te} key={te.id} onColorChanged={this.onTEColorChanged}/>
        });

        return (
            <div className="config-wrapper">
                <h2>Configure New Visualization</h2>
                <div>
                    <h3>Step 1</h3>
                    <p>Select the relationships</p>
                    <RelationshipTypes {...this.state} onChange={this.onRelationsChanged}/>
                </div>
                <div className="config-te-wrapper">
                    <h3>Step 2</h3>
                    <p>Define Tracked Entity Templates</p>
                    <div className="config-te-cards">
                        {teCards}
                    </div>
                </div>
                <div className="mapping-wrapper">
                    <h3>Step 3</h3>
                    <p>Map the Templates to Relationships</p>
                </div>
            </div>
        )
    }
}

