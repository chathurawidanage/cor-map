import React from "react";
import { CircularLoader, ScreenCover, ComponentCover } from "@dhis2/ui-core";

export default class Loader extends React.Component {
    render() {
        return (
            <ComponentCover>
                <CircularLoader/>
            </ComponentCover>
        );
    }
}