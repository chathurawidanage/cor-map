import React from "react";
import "./legend.css";

export default class Legend extends React.Component {

    getCircle = (label, color, count) => {
        return (
            <div className="leg-item" key={label}>
                <div className="leg-item-symbol">
                    <div className="leg-item-symbol-circle symbol-border" style={{backgroundColor: color}}>

                    </div>
                </div>
                <div className="leg-item-text">
                    {label} ({count})
                </div>
            </div>
        );
    };

    render() {

        const circles = Object.values(this.props.visualization.teTemplates).map(temp => {
            const count = this.props.stats[temp.program]
            return this.getCircle(temp.name, temp.color, count);
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
                                {i18n.t('Male')}
                            </div>
                        </div>
                        <div className="leg-item">
                            <div className="leg-item-symbol">
                                <div className="leg-item-symbol-circle">
                                    <img src="img/girl.png" alt="man" width={15}/>
                                </div>
                            </div>
                            <div className="leg-item-text">
                                {i18n.t('Female')}
                            </div>
                        </div>
                    </>}
            </div>
        )
    }
}