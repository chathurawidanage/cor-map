import React from 'react';
import Graph from "react-graph-vis";
import Loader from "./loader/Loader";
import TEIDrawer from "./TEIDrawer";
import {getProgramsToQuery, getTEAttributes} from "../Utils";
import Legend from "./Legend";
import {programTEIQuery} from '../queries/TEIQueries';
import "./Visualization.css";

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


export default class Visualization extends React.Component {

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
                    // [DHIS2Costants.PROGRAM_ID_CASE]: [],
                    // [DHIS2Costants.PROGRAM_ID_SUSPECT]: []
                },
                relationships: {
                    // [DHIS2Costants.REL_CASE_TO_CASE]: [],
                    // [DHIS2Costants.REL_CASE_TO_SUSPECT]: [],
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

    processTEIResponse(teiDB, trackedEntityInstances, program) {
        teiDB.program[program] = [];
        trackedEntityInstances.forEach(tei => {
            teiDB.program[program].push(tei.trackedEntityInstance);
            teiDB.attributes[tei.trackedEntityInstance] = {
                program: program
            };
            if (tei.relationships && tei.relationships.length > 0) {
                tei.relationships.forEach(rel => {
                    if (!teiDB.relationships[rel.relationshipType]) {
                        teiDB.relationships[rel.relationshipType] = [];
                    }
                    teiDB.relationships[rel.relationshipType].push({
                        from: rel.from.trackedEntityInstance.trackedEntityInstance,
                        to: rel.to.trackedEntityInstance.trackedEntityInstance
                    });
                });
            }
        });
    }

    processTEIAttributeResponse(teiDB, attributes, attributesToFetchMap) {
        attributes.rows.forEach(row => {
            if (!teiDB.attributes[row[0]]) {
                teiDB.attributes[row[0]] = {}
            }
            for (let i = 7; i < attributes.headers.length; i++) {
                //saving some RAM
                if (attributesToFetchMap[attributes.headers[i].name]) {
                    teiDB.attributes[row[0]][attributes.headers[i].name] = row[i];
                }
            }
        });
    }

    updateCaseTrackingVisualization = () => {
        this.setLoading(true);
        let nodes = [];
        let edges = [];

        let programToTemplate = {};

        Object.values(this.props.visualization.teTemplates).forEach(te => {
            programToTemplate[te.program.value] = te;
        });

        console.log(this.state.teiDB);

        let teisAdded = {};

        Object.keys(this.state.teiDB.program).forEach(pgId => {
            let color = programToTemplate[pgId].color || "white";
            let genderAttribute = programToTemplate[pgId].useIcon
                && programToTemplate[pgId].genderAttribute?.value;
            let genderMaleMatch = programToTemplate[pgId].genderMaleMatch;

            let labelAttributes = programToTemplate[pgId].useLabel
                && programToTemplate[pgId].labelAttributes.map(att => att.value);
            this.state.teiDB.program[pgId].forEach(teiId => {
                if (teisAdded[teiId]) {
                    console.warn("Found an already added TEI. Possible multiple enrollments", teiId);
                    return;
                }
                let genderIcon = "img/unknown.png";
                if (genderAttribute) {
                    if (this.state.teiDB.attributes[teiId][genderAttribute]
                        && this.state.teiDB.attributes[teiId][genderAttribute] === genderMaleMatch) {
                        genderIcon = "img/man.png";
                    } else {
                        genderIcon = "img/girl.png";
                    }
                }

                let labelArr = labelAttributes.map(att => this.state.teiDB.attributes[teiId][att]);
                let label = labelArr.length > 1 ? labelArr.join(" | ") : (labelArr.length > 0 ? labelArr[0] : "");
                this.addNode(nodes, teiId, label, color, genderIcon);
                teisAdded[teiId] = true;
            });
        });

        // now process edges
        Object.values(this.state.teiDB.relationships).forEach(rels => {
            rels.forEach(rel => {
                if (teisAdded[rel.from] && teisAdded[rel.to]) {
                    this.addLink(edges, rel.from, rel.to);
                } else {
                    console.warn("Found TEIs that hasn't been added", rel);
                }
            });
        });

        this.setState({
            graph: {nodes, edges},
            loading: false
        });
    };

    componentDidMount() {
        console.log("VISUA", JSON.stringify(this.props.visualization));

        const programs = getProgramsToQuery(this.props.visualization);

        const requests = programs.map(program => {
            const attributesToFetch = getTEAttributes(this.props.visualization, program);
            return this.props.engine.query(programTEIQuery, {
                variables: {
                    program,
                    attributes: attributesToFetch
                }
            })
        });

        // load data
        Promise.all(requests).then(results => {
            let teiDB = this.state.teiDB;

            results.forEach((data, i) => {
                const program = programs[i];

                // todo currently TEI queries sends back all the attributes. Bug?
                // this is just to save some RAM
                const attributesToFetch = getTEAttributes(this.props.visualization, program);
                const attributesToFetchMap = {};
                attributesToFetch.forEach(att => {
                    attributesToFetchMap[att] = true;
                });

                console.log("Data", data);
                // process TEI response
                if (data?.teis?.trackedEntityInstances) {
                    this.processTEIResponse(teiDB, data.teis.trackedEntityInstances, program);
                } else {
                    console.warn("Nothing found for program", program);
                }

                if (data?.attributes?.rows) {
                    this.processTEIAttributeResponse(teiDB, data.attributes, attributesToFetchMap);
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
                            <Legend visualization={this.props.visualization}/>
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