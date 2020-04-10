import React from "react";
import {Link} from "react-router-dom";
import {Button} from "@dhis2/ui-core";
import "./Main.css";

export default class Main extends React.Component {

    render() {
        return (
            <div className="main-wrapper">
                <h3>Visualizations</h3>
                <Link to="configure">
                    <Button primary={true}>Create</Button>
                </Link>
            </div>
        );
    }
}