import React from "react";
import {Button, Drawer, Tag} from "@blueprintjs/core";
import TEIService from "../services/TEIService";
import Loader from "./loader/Loader";
import "./TEIDrawer.css";
import * as DHIS2Constants from "../DHIS2Constants";
import {Intent} from "@blueprintjs/core/lib/cjs/common/intent";

export default class TEIDrawer extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            attributes: [],
            orgUnit: undefined
        }
    }

    openInTracker = () => {
        let url = "https://" + window.location.host + `/dhis-web-tracker-capture/index.html#/dashboard?tei=${this.props.te.id}&program=${this.props.te.program}&ou=${this.state.orgUnit}`;
        window.open(url, "_blank");
    };

    componentDidMount() {
        TEIService.getTEI(this.props.te.id).then(response => {
            this.setState({
                attributes: response.data.attributes,
                orgUnit: response.data.orgUnit,
                loading: false
            });
        }).catch(err => {
            console.error("Error in loading", err);
        });
    }

    render() {

        let att = this.state.attributes.map(att => {
            return (
                <div key={att.attribute}>
                    <h4 className="info-title">{att.displayName}</h4>
                    <p className="info-value">{att.value}</p>
                </div>
            );
        });

        return (
            <div>
                <Drawer isOpen={true} icon="info-sign" title={"Entity " + this.props.te.id} size={Drawer.SIZE_SMALL}
                        onClose={this.props.onClose}>
                    {
                        this.state.loading ? <Loader/> : <div className="info-wrapper">
                            <div className="info-header">
                                <div className="info-tag">
                                    {this.props.te.program
                                    && this.props.te.program === DHIS2Constants.PROGRAM_ID_CASE ?
                                        <Tag intent={Intent.DANGER}>Case</Tag> :
                                        <Tag intent={Intent.WARNING}>Suspect</Tag>}
                                </div>
                                <div className="info-actions">
                                    <Button text="Open in Tracker" onClick={this.openInTracker}/>
                                </div>
                            </div>
                            <div>
                                {att}
                            </div>
                        </div>
                    }
                </Drawer>
            </div>
        );
    }
}