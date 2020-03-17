import React from 'react';
import './App.css';
import Graph from "react-graph-vis";

const options = {
    layout: {},
    edges: {
        color: "#000000"
    },
    nodes: {
        image: "https://img.icons8.com/pastel-glyph/2x/person-male.png",
        imagePadding: {
            left: 0,
            top: 0,
            bottom: 0,
            right: 0
        }
    },
    autoResize: true,
    height: window.innerHeight + "px",
    width: '100%'
};

const events = {
    select: function (event) {
        var {nodes, edges} = event;
    }
};


export default class App extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            graph: {
                nodes: [],
                edges: []
            }
        }
    }

    addLink(edges, from, to) {
        edges.push({from, to});
    }

    addNode(nodes, label, color, img = "https://img.icons8.com/pastel-glyph/2x/person-male.png") {
        nodes.push({
            id: label,
            label: label,
            color: {background: color},
            image: img,
            shape: "circularImage"
        })
    }

    addInfected(nodes, label) {
        this.addNode(nodes, label, "#ef9a9a");
    }


    addRecovered(nodes, label) {
        this.addNode(nodes, label, "#A5D6A7");
    }

    addDead(nodes, label) {
        this.addNode(nodes, label, "#B0BEC5");
    }

    addCountry(nodes, label) {
        this.addNode(nodes, label, "#81D4FA", "https://i.ya-webdesign.com/images/plane-vector-png-2.png");
    }

    componentDidMount() {
        let nodes = [];
        let edges = [];
        ["IT", "GB", "QT", "IN", "DE", "CN"].forEach(c => this.addCountry(nodes, c));
        for (let i = 0; i < 35; i++) {
            if ([1, 2].indexOf(i + 1) === -1) {
                this.addInfected(nodes, "c" + (i + 1));
            }
        }

        "c6, c5, c13, c7, c19, c16, c18, c18, c15, c14, c17".split(",").forEach(cIt => {
            this.addLink(edges, "IT", cIt.trim());
        });

        // IT cluster
        this.addLink(edges, "c15", "c10");
        this.addLink(edges, "c10", "c11");

        this.addDead(nodes, "x1");
        this.addLink(edges, "IT", "x1");

        this.addRecovered(nodes, "c2");
        this.addLink(edges, "x1", "c2");
        this.addLink(edges, "c2", "c3");
        this.addLink(edges, "c3", "c20");
        this.addLink(edges, "c9", "c23");

        //DE cluster
        this.addLink(edges, "DE", "c31");
        this.addLink(edges, "DE", "c4");
        this.addLink(edges, "DE", "c12");
        this.addLink(edges, "c4", "c12");

        //CN
        this.addRecovered(nodes, "c1");
        this.addLink(edges, "CN", "c1");

        //IN
        this.addLink(edges, "IN", "c29");

        //GB
        this.addLink(edges, "GB", "c32");

        //QT
        this.addLink(edges, "QT", "c35");

        this.setState({
            graph: {nodes, edges}
        })

        // TEIService.getTEIs().then(data => {
        //     let teis = data && data.data && data.data.trackedEntityInstances;
        //     let teiIds = {};
        //     let nodes = [];
        //     let edges = [];
        //     if (teis) {
        //         teis.forEach(tei => {
        //             nodes.push({id: tei.trackedEntityInstance});
        //             teiIds[tei.trackedEntityInstance] = true;
        //
        //             if (tei.relationships && tei.relationships.length > 0) {
        //                 tei.relationships.forEach(rel => {
        //                     console.log(rel);
        //                     edges.push({
        //                         source: rel.from.trackedEntityInstance.trackedEntityInstance,
        //                         target: rel.to.trackedEntityInstance.trackedEntityInstance
        //                     })
        //                 });
        //             }
        //         });
        //
        //         edges = edges.filter(l => teiIds[l.source] && teiIds[l.target]);
        //
        //         // this.setState({
        //         //     data: {nodes, edges}
        //         // })
        //     } else {
        //         console.error("Unknown response");
        //     }
        // }).catch(err => console.log(err));
    }

    render() {
        return (
            <div className="App">
                <Graph
                    graph={this.state.graph}
                    options={options}
                    events={events}
                />
            </div>
        );
    }
}
