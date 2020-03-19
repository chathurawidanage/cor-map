import React from "react";
import {Card} from "@blueprintjs/core";
import "./legend.css";

export default class Legend extends React.Component {

    render() {
        return (
            <div className="legend">
                <Card className="legend-card">
                    <div className="leg-item">
                        <div className="leg-item-symbol">
                            <div className="leg-item-symbol-circle case">

                            </div>
                        </div>
                        <div className="leg-item-text">
                            Cases
                        </div>
                    </div>
                    <div className="leg-item">
                        <div className="leg-item-symbol">
                            <div className="leg-item-symbol-circle suspect">

                            </div>
                        </div>
                        <div className="leg-item-text">
                            Suspects
                        </div>
                    </div>
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
                </Card>
            </div>
        )
    }
}