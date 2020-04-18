import React from "react";
import { CircularLoader, ScreenCover } from "@dhis2/ui-core";

export default class Loader extends React.Component {
    render() {
        return (
            <ScreenCover>
                <CircularLoader/>
            </ScreenCover>
        );
    }
}