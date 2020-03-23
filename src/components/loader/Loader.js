import React from "react";
import {ProgressBar} from "@blueprintjs/core";
import "./Loader.css";

export default class Loader extends React.Component {
    render() {
        return (
            <div className="loader-wrapper">
                <ProgressBar/>
                <div style={{paddingTop: 10, textAlign: "center"}}>
                    {
                        this.props.text ? <p>{this.props.text}</p> : <p></p>
                    }
                </div>
            </div>
        );
    }
}