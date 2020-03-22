import React from "react";
import { useDataQuery, useConfig } from '@dhis2/app-runtime';
import i18n from '@dhis2/d2-i18n'
import {Button, Drawer, Tag} from "@blueprintjs/core";
import Loader from "./loader/Loader";
import "./TEIDrawer.css";
import * as DHIS2Constants from "../DHIS2Constants";
import {Intent} from "@blueprintjs/core/lib/cjs/common/intent";
import { trackedEntityInstanceQuery } from "../queries/TEIQueries";

import "@blueprintjs/core/lib/css/blueprint.css";

const TEIDrawer = ({ te, onClose }) => {
    const { baseUrl } = useConfig()
    const { loading, error, data } = useDataQuery(trackedEntityInstanceQuery, { 
        variables: {
            id: te.id
        }
    })

    const openInTracker = () => {
        let url = `${baseUrl}dhis-web-tracker-capture/index.html#/dashboard?tei=${te.id}&program=${te.program}&ou=${data?.tei.orgUnit}`;
        window.open(url, "_blank");
    };

    let att = data?.tei.attributes.map(att => {
        return (
            <div key={att.attribute}>
                <h4 className="info-title">{att.displayName}</h4>
                <p className="info-value">{att.value}</p>
            </div>
        );
    });
    
    console.log(trackedEntityInstanceQuery, error)

    return (
        <div>
            <Drawer isOpen={true} icon="info-sign" title={"Entity " + te.id} size={Drawer.SIZE_SMALL}
                    onClose={onClose}>
                {loading && <Loader/>}
                {error && i18n.t('An unknown error occurred!')}
                {data && <div className="info-wrapper">
                        <div className="info-header">
                            <div className="info-tag">
                                {te.program
                                && te.program === DHIS2Constants.PROGRAM_ID_CASE ?
                                    <Tag intent={Intent.DANGER}>Case</Tag> :
                                    <Tag intent={Intent.WARNING}>Suspect</Tag>}
                            </div>
                            <div className="info-actions">
                                <Button text="Open in Tracker" onClick={openInTracker}/>
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

export default TEIDrawer