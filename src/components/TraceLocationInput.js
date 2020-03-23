import React from "react";
import {Button, Card, ControlGroup, InputGroup} from "@blueprintjs/core";

export default class TraceLocationInput extends React.Component {
    render() {
        return (
            <div className="search-box">
                <Card>
                    <ControlGroup fill={true} vertical={false}>
                        <InputGroup placeholder="Find filters..."/>
                        <Button icon="filter">Search</Button>
                    </ControlGroup>
                </Card>
            </div>
        );
    }
}