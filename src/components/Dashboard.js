import React from "react";
import {Alignment, Button, Navbar} from "@blueprintjs/core";
import App from "./App";


export default class Dashboard extends React.Component {


    render() {
        return (
            <div>
                <Navbar>
                    <Navbar.Group align={Alignment.LEFT}>
                        <Navbar.Heading>Contact Tracing</Navbar.Heading>
                        <Navbar.Divider/>
                    </Navbar.Group>
                </Navbar>
                <div>
                    <App/>
                </div>
            </div>
        );
    }
}