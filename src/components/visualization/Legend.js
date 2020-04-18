import React from "react";
import {Card} from "@dhis2/ui-core";
import "./legend.css";

export default class Legend extends React.Component {

    getCircle = (label, color) => {
        return (
            <div className="leg-item" key={label}>
                <div className="leg-item-symbol">
                    <div className="leg-item-symbol-circle symbol-border" style={{backgroundColor: color}}>

                    </div>
                </div>
                <div className="leg-item-text">
                    {label}
                </div>
            </div>
        );
    };

    render() {

        const circles = Object.values(this.props.visualization.teTemplates).map(temp => {
            return this.getCircle(temp.name, temp.color);
        });

        const showIcons = Object.values(this.props.visualization.teTemplates).some(template => template.useIcon)

        return (
            <div className="legend visualization-overlay">
                    {circles}
                    {showIcons && <>
                        <div className="leg-item">
                            <div className="leg-item-symbol">
                                <div className="leg-item-symbol-circle">
                                    <img src="img/man.png" alt="man" width={15}/>
                                </div>
                            </div>
                            <div className="leg-item-text">
                                Male
                            </div>
                        </div>
                        <div className="leg-item">
                            <div className="leg-item-symbol">
                                <div className="leg-item-symbol-circle">
                                    <img src="img/girl.png" alt="man" width={15}/>
                                </div>
                            </div>
                            <div className="leg-item-text">
                                Female
                            </div>
                        </div>
                    </>}
            </div>
        )
    }
}