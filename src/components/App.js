import React from 'react';
import './App.css';
import Graph from "react-graph-vis";
import TEIService from "../services/TEIService";
import * as DHIS2Costants from "../DHIS2Constants";
import {
    DHIS2_ENDPOINT,
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

const CASE = 1;
const SUSPECT = 2;

const options = {
    layout: {},
    edges: {
        color: "#000000"
    },
    nodes: {
        imagePadding: 5
    },
    autoResize: true,
    height: (window.innerHeight - 50) + "px",
    width: '100%'
};


export default class App extends React.Component {

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

    openTracker = (tei) => {
        window.open(`${DHIS2_ENDPOINT}/dhis-web-tracker-capture/index.html#/dashboard?tei=${tei}&program=Cr6bmkKzQ5c&ou=GYBZ1og9bk7`, '_blank');
    };

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

    updateVisualization = () => {
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

        let attributeToFetch = [DHIS2Costants.ATTR_DOB, DHIS2Costants.ATTR_GENDER, DHIS2Costants.ATTR_SN];

        let programs = [PROGRAM_ID_CASE, PROGRAM_ID_SUSPECT];

        let requests = [];
        programs.forEach(program => {
            requests.push(TEIService.getTEIs(program));
            requests.push(TEIService.getTEIAttributes(program, attributeToFetch));
        });

        // load data
        Promise.all(requests).then(results => {
            let teiDB = this.state.teiDB;

            // process TEI response
            [0, 2].forEach(i => {
                if (results[i].data && results[i].data.trackedEntityInstances) {
                    this.processTEIResponse(teiDB, results[i].data.trackedEntityInstances, programs[i / 2]);
                } else {
                    console.warn("Nothing found for Case", i);
                }
            });

            [1, 3].forEach(i => {
                if (results[i].data && results[i].data.rows) {
                    this.processTEIAttributeResponse(teiDB, results[i].data.rows);
                } else {
                    console.warn("No attributes found for Case", i);
                }
            });

            this.setState({
                teiDB
            }, this.updateVisualization);
        });

        // TEIService.getTEIs(DHIS2Costants.PROGRAM_ID_CASE).then(data => {
        //     console.log(data);
        //     let teis = data && data.data && data.data.trackedEntityInstances;
        //     let teiToProgram = {};
        //     let nodes = [];
        //     let edges = [];
        //     if (teis) {
        //         teis.forEach(tei => {
        //             //this.addInfected(nodes, tei.trackedEntityInstance);
        //             teiToProgram[tei.trackedEntityInstance] = DHIS2Costants.PROGRAM_ID_CASE;
        //
        //             if (tei.relationships && tei.relationships.length > 0) {
        //                 tei.relationships.forEach(rel => {
        //                     if (rel.relationshipType === REL_CASE_TO_CASE) {
        //                         this.addCaseToCaseLink(edges, rel.from.trackedEntityInstance.trackedEntityInstance,
        //                             rel.to.trackedEntityInstance.trackedEntityInstance);
        //                     } else {
        //                         this.addLink(edges, rel.from.trackedEntityInstance.trackedEntityInstance,
        //                             rel.to.trackedEntityInstance.trackedEntityInstance);
        //                         teiToProgram[rel.to.trackedEntityInstance.trackedEntityInstance] = DHIS2Costants.PROGRAM_ID_SUSPECT;
        //                     }
        //                 });
        //             }
        //         });
        //
        //         // first add based on type
        //         Object.keys(teiToProgram).forEach(teiId => {
        //             if (teiToProgram[teiId] === DHIS2Costants.PROGRAM_ID_CASE) {
        //                 this.addInfected(nodes, teiId);
        //             } else {
        //                 this.addSuspect(nodes, teiId);
        //             }
        //         });
        //
        //         // load other suspects
        //         TEIService.getTEIs(DHIS2Costants.PROGRAM_ID_SUSPECT).then(data => {
        //             let teis = data && data.data && data.data.trackedEntityInstances;
        //             teis.forEach(tei => {
        //                 if (!teiToProgram[tei.trackedEntityInstance]) {
        //                     teiToProgram[tei.trackedEntityInstance] = DHIS2Costants.PROGRAM_ID_SUSPECT;
        //                     this.addSuspect(nodes, tei.trackedEntityInstance);
        //                 }
        //             });
        //
        //             let count = edges.length;
        //             edges = edges.filter(l => teiToProgram[l.from] && teiToProgram[l.to]);
        //             console.log("Dropped", count - edges.length);
        //             this.setState({
        //                 graph: {nodes, edges},
        //                 loading: false,
        //                 teiToProgram
        //             });
        //         }).catch(err => {
        //             console.log("Failed to load suspects");
        //         });
        //     } else {
        //         console.error("Unknown response");
        //     }
        // }).catch(err => console.log(err));
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
                        <Graph
                            graph={this.state.graph}
                            options={options}
                            events={this.events}/>
                }
            </div>
        );
    }
}
