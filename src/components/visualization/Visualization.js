import React from 'react';
import Graph from "react-graph-vis";
import Loader from "../loader/Loader";
import { TEIDetailsModal } from "./TEIDetailsModal";
import {getProgramsToQuery, getTEAttributes} from "../../Utils";
import {programTEIQuery} from '../../queries/TEIQueries';
import "./Visualization.css";

const options = {
    layout: {
        improvedLayout: true,
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
        smooth: {enabled: true, type: 'straightCross'}
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
    height: '100%',
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
                instances: {},
                relationships: [],
                attributes: {}
            }
        };

        console.log(props.visualization)

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

    addLink(edges, from, to, color = "black") {
        edges.push({
            from,
            to,
            color,
            arrows: this.props.visualization.useBidirectionalArrows ? 'from,to' : 'to'
        });
    }

    addNode(nodes, id, label, color, image) {
        nodes.push({
            id: id,
            label: label,
            color: {background: color},
            image,
            shape: image ? "circularImage" : "dot"
        })
    }

    processTEIResponse(teiDB, trackedEntityInstances, program) {
        trackedEntityInstances.forEach(tei => {
            teiDB.attributes[tei.trackedEntityInstance] = {
                program: program
            };
            if (!this.props.visualization.hideUnrelatedInstances || (tei.relationships && tei.relationships.length > 0)) {
                teiDB.instances[tei.trackedEntityInstance] = tei
                tei.relationships?.forEach(rel => {
                    teiDB.relationships.push({
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

        Object.values(this.state.teiDB.instances).forEach(tei => {
            const teiId = tei.trackedEntityInstance
            const pgId = this.state.teiDB.attributes[teiId].program

            let color = programToTemplate[pgId].color || "white";

            let labelAttributes = programToTemplate[pgId].useLabel
                ? programToTemplate[pgId].labelAttributes.map(att => att.value)
                : [];

            let labelArr = labelAttributes.map(att => this.state.teiDB.attributes[teiId][att]);
            let label = labelArr.length > 1 ? labelArr.join(" | ") : (labelArr.length > 0 ? labelArr[0] : "");
                
            this.addNode(nodes, teiId, label, color);
        })

        // now process edges
        this.state.teiDB.relationships.forEach(rel => {
            if (this.state.teiDB.instances[rel.from] && this.state.teiDB.instances[rel.to]) {
                this.addLink(edges, rel.from, rel.to);
            } else {
                console.warn("Found TEIs that hasn't been added", rel, this.state.teiDB.instances[rel.from], this.state.teiDB.instances[rel.to]);
            }
        });

        this.setState({
            graph: {nodes, edges},
            loading: false
        });
    };

    componentDidMount() {
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
            <div className="visualization-canvas-inner">
                {
                    this.state.selectedTei ? <TEIDetailsModal te={this.state.selectedTei} programs={this.props.programs} onClose={() => {
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