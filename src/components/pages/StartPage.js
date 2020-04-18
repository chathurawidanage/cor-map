import React from "react";
import "./StartPage.css";
import { VisualizationList } from "../VisualizationList";
import { LinkButton } from '../helpers/LinkButton'
import i18n from "@dhis2/d2-i18n";

export class StartPage extends React.Component {
  render() {
    return <div className="main-background">
                <div className="main-wrapper">
                    <h3>{i18n.t('Saved Visualizations')}</h3>
                    <div className="main-content">
                      <VisualizationList />
                    </div>
                    <div className="main-footer">
                      <LinkButton primary to="new">New Visualization</LinkButton>
                    </div>
                </div>
            </div>;
  }

}