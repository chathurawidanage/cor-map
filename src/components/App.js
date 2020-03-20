import React from 'react';
import Graph from "react-graph-vis";
import * as DHIS2Costants from "../DHIS2Constants";
import {
    GENDER_FEMALE,
    GENDER_MALE,
    PROGRAM_ID_CASE,
    PROGRAM_ID_SUSPECT,
    REL_CASE_TO_CASE
} from "../DHIS2Constants";
import Loader from "./loader/Loader";
import TEIDrawer from "./TEIDrawer";
import * as Utils from "../Utils";
import {REL_CASE_TO_SUSPECT} from "../DHIS2Constants";
import Legend from "./Legend";
import { programTEIQuery } from '../queries/TEIQueries';

const options = {
    layout: {
        // improvedLayout: true,
        // "hierarchical": {
        //     "enabled": true,
        //     "sortMethod": "directed",
        //     "direction": "LR",
        //     nodeSpacing: 200,
        //     levelSeparation: 200
        // }
    },
    edges: {
        color: "#000000",
        // smooth: {enabled: true, type: 'straightCross'}
    },
    nodes: {
        imagePadding: 5
    },
    physics: {
        solver: "barnesHut",
        barnesHut: {
            avoidOverlap: 1
        }
    },
    autoResize: true,
    height: (window.innerHeight - 50) + "px",
    width: '100%'
};


class App extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            graph: {
                nodes: [],
                edges: []
            },
            loading: true,
            selectedTei: undefined,
            teiToProgram: {},
            teiDB: {
                program: {
                    [DHIS2Costants.PROGRAM_ID_CASE]: [],
                    [DHIS2Costants.PROGRAM_ID_SUSPECT]: []
                },
                relationships: {
                    [DHIS2Costants.REL_CASE_TO_CASE]: [],
                    [DHIS2Costants.REL_CASE_TO_SUSPECT]: [],
                },
                attributes: {}
            }
        };

        this.events = {
            doubleClick: (event) => {
                let {nodes, edges} = event;
                if (nodes.length > 0) {
                    let tei = nodes[0];
                    this.setState({
                        selectedTei: {id: tei, program: this.state.teiDB.attributes[tei].program}
                    });
                }
            }
        };
    }

    setLoading = (loading) => {
        this.setState({
            loading: loading
        });
    };

    addCaseToCaseLink = (edges, from, to) => {
        this.addLink(edges, from, to, "red");
    };

    addLink(edges, from, to, color = "black") {
        edges.push({from, to, color});
    }

    addNode(nodes, id, label, color, img = "img/man.png") {
        nodes.push({
            id: id,
            label: label,
            color: {background: color},
            image: img,
            shape: "circularImage"
        })
    }

    addInfected(nodes, id, label, img) {
        this.addNode(nodes, id, label, "#ef9a9a", img);
    }

    addSuspect(nodes, id, label, img) {
        this.addNode(nodes, id, label, "#FFEB3B", img);
    }


    addRecovered(nodes, id, label, img) {
        this.addNode(nodes, id, label, "#A5D6A7", img);
    }

    addDead(nodes, id, label, img) {
        this.addNode(nodes, id, label, "#B0BEC5", img);
    }

    addCountry(nodes, label) {
        this.addNode(nodes, label, "#81D4FA", "https://i.ya-webdesign.com/images/plane-vector-png-2.png");
    }

    populateSampleData() {
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
    }

    processTEIResponse(teiDB, trackedEntityInstances, program) {
        trackedEntityInstances.forEach(tei => {
            teiDB.program[program].push(tei.trackedEntityInstance);
            teiDB.attributes[tei.trackedEntityInstance] = {
                age: 0,
                id: "NA",
                gender: -1,
                program: program
            };
            if (tei.relationships && tei.relationships.length > 0) {
                tei.relationships.forEach(rel => {
                    teiDB.relationships[rel.relationshipType].push({
                        from: rel.from.trackedEntityInstance.trackedEntityInstance,
                        to: rel.to.trackedEntityInstance.trackedEntityInstance
                    });
                });
            }
        });
    }

    processTEIAttributeResponse(teiDB, attributes) {
        attributes.forEach(row => {
            if (teiDB.attributes[row[0]]) {
                let dob = row[7];
                if (dob !== "") {
                    try {
                        teiDB.attributes[row[0]].age = Math.ceil((Date.now() - new Date(dob).getTime()) / 3.154e+10);
                    } catch (e) {
                        console.error("Failed to calculate age", e);
                    }
                }

                if (row[8] !== "") {
                    teiDB.attributes[row[0]].gender = row[9] === "Male" ? GENDER_MALE : GENDER_FEMALE;
                }

                if (row[9] !== "") {
                    teiDB.attributes[row[0]].id = row[9];
                }
                console.log()
            }
        });
    }

    updateCaseTrackingVisualization = () => {
        this.setLoading(true);
        let nodes = [];
        let edges = [];

        console.log(this.state.teiDB);

        this.state.teiDB.program[PROGRAM_ID_CASE].forEach(cs => {
            this.addInfected(nodes, cs,
                this.state.teiDB.attributes[cs].id + ` [${this.state.teiDB.attributes[cs].age} yrs]`,
                Utils.getImgForGender(this.state.teiDB.attributes[cs].gender)
            );
        });
        this.state.teiDB.program[PROGRAM_ID_SUSPECT].forEach(sus => {
            this.addSuspect(nodes, sus,
                this.state.teiDB.attributes[sus].id + ` [${this.state.teiDB.attributes[sus].age} yrs]`,
                Utils.getImgForGender(this.state.teiDB.attributes[sus].gender)
            );
        });

        this.state.teiDB.relationships[REL_CASE_TO_CASE].forEach(rel => {
            this.addCaseToCaseLink(edges, rel.from, rel.to);
        });

        this.state.teiDB.relationships[REL_CASE_TO_SUSPECT].forEach(rel => {
            this.addLink(edges, rel.from, rel.to);
        });

        this.setState({
            graph: {nodes, edges},
            loading: false
        });
    };

    componentDidMount() {
        //this.populateSampleData();

        const attributesToFetch = [DHIS2Costants.ATTR_DOB, DHIS2Costants.ATTR_GENDER, DHIS2Costants.ATTR_SN];
        const programs = [PROGRAM_ID_CASE, PROGRAM_ID_SUSPECT];
        const requests = programs.map(program => (
            this.props.engine.query(programTEIQuery, {
                variables: {
                    program,
                    attributes: attributesToFetch
                }
            })
        ));

        // load data
        Promise.all(requests).then(results => {
            let teiDB = this.state.teiDB;

            results.forEach((data, i) => {
                const program = programs[i]
                // process TEI response
                if (data?.teis?.trackedEntityInstances) {
                    this.processTEIResponse(teiDB, data.teis.trackedEntityInstances, program);
                } else {
                    console.warn("Nothing found for program", program);
                }

                if (data?.attributes?.rows) {
                    this.processTEIAttributeResponse(teiDB, data.attributes.rows);
                } else {
                    console.warn("No attributes found for program", program);
                }
            })

            this.setState({
                teiDB
            }, this.updateCaseTrackingVisualization);
        });
    }

    render() {
        return (
            <div className="App">
                {
                    this.state.selectedTei ? <TEIDrawer te={this.state.selectedTei} onClose={() => {
                        this.setState({
                            selectedTei: false
                        });
                    }}/> : null
                }
                {
                    this.state.loading ?
                        <Loader/> :
                        <div>
                            <Legend/>
                            <Graph
                                graph={this.state.graph}
                                options={options}
                                events={this.events}/>
                        </div>
                }
            </div>
        );
    }
}

export default App