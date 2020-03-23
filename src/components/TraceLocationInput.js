import React from "react";
import {Button, Card, ControlGroup, InputGroup} from "@blueprintjs/core";
import "./TraceLocationInput.css";

export default class TraceLocationInput extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            phone: ""
        };
    }

    onValueChange = (ev) => {
        this.setState({
            phone: ev.target.value
        });
    };

    onTrace = () => {
        const url = `#/location/${this.state.phone}`;
        window.open(url);
    };

    render() {
        return (
            <div className="search-box">
                <Card>
                    <h5>Trace Location</h5>
                    <ControlGroup fill={true} vertical={false}>
                        <InputGroup placeholder="947123456789" onChange={this.onValueChange} value={this.state.phone}/>
                        <Button icon="search" onClick={this.onTrace}>Trace</Button>
                    </ControlGroup>
                </Card>
            </div>
        );
    }
}