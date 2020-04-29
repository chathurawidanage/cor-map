import React from "react";
import { CircularLoader } from "@dhis2/ui-core";

export const CenteredMessageLoader = ({ message }) => 
    <div className="centered-message-loader">
        <CircularLoader />
        <span>{message}</span>
    </div>