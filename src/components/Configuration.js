import React from "react";
import {Modal, ModalContent, MultiSelect, MultiSelectField, MultiSelectOption} from "@dhis2/ui-core";
import {useDataQuery} from '@dhis2/app-runtime';
import {relationshipTypes} from "../queries/TEIQueries";
import Loader from "./loader/Loader";

const RelationshipTypes = ({selectedRelations, onChange}) => {
    console.log(selectedRelations);

    let {loading, data} = useDataQuery(relationshipTypes);
    console.log("X", loading, data);

    if (loading) {
        return (
            <Loader/>
        );
    }

    let rts = data.rts.relationshipTypes.map(rt => {
        return <MultiSelectOption label={rt.name} value={rt.id} key={rt.id}/>
    });


    return (
        <Modal position="middle">
            <ModalContent>

                <MultiSelectField label="Relationships" onChange={onChange} selected={selectedRelations}>
                    {rts}
                </MultiSelectField>

            </ModalContent>
        </Modal>
    );
};

export default class Configurations extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            selectedRelations: []
        }
    }

    onRelationsChanged = (rels) => {
        this.setState({
            selectedRelations: rels.selected
        })
    };

    render() {
        return (
            <RelationshipTypes {...this.state} onChange={this.onRelationsChanged}/>
        )
    }
}

