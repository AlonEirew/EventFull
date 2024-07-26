let cy = null;
let graphEventsToPreset = null;

function styleSelect(relation) {
    let styleClass;
    if (relation === EventRelationType.VAGUE) {
        styleClass = EventRelationType.VAGUE;
    } else if (getRelationMappingSeparateTransitive(relation) === EventRelationType.EQUAL) {
        styleClass = EventRelationType.EQUAL;
    } else if (getRelationMappingSeparateTransitive(relation) === EventRelationType.CONTAINS) {
        styleClass = EventRelationType.CONTAINS;
    } else if (relation === EventRelationType.CAUSE) {
        styleClass = "causal";
    } else if (relation === EventRelationType.NO_CAUSE || relation === EventRelationType.UNCERTAIN_CAUSE) {
        styleClass = "no_causal";
    } else {
        styleClass = relation;
    }

    return styleClass;
}

function createEdge(sourceId, targetId, relation, styleClass) {
    return {
        group: 'edges',
        data: {
            id: String(sourceId) + "_" + String(targetId),
            source: String(sourceId),
            target: String(targetId),
            label: relation
        },
        classes: styleClass
    };
}

function createNode(eventId, word, styleClass) {
    return {
        group: 'nodes',
        data: {
            id: String(eventId),
            label: word + " (" + String(eventId) + ")"
        },
        classes: styleClass
    };
}

function getAllNodes() {
    let elements = [];
    for (let i = 0; i < graphEventsToPreset.length; i++) {
        const node = this.createNode(graphEventsToPreset[i].getId(), graphEventsToPreset[i].getTokens(), graphEventsToPreset[i].getAxisType());
        elements.push(node);
    }

    return elements;
}

function getAxisEdges(formType) {
    let elements = [];
    const allPairs = allAxesGlobal.getAllAxesPairsFlat(formType);
    for (let i = 0; i < allPairs.length; i++) {
        const pair = allPairs[i];
        if (pair.getRelation() !== EventRelationType.NA) {
            const edge = this.createEdge(pair.getFirstId(),
                pair.getSecondId(), pair.getRelation(),
                this.styleSelect(pair.getRelation()));
            elements.push(edge);
        }
    }

    return elements;
}

function highlightCurrentPair(pair) {
    if (cy != null && pair != null) {
        const edgeId1 = String(pair.getFirstId()) + "_" + String(pair.getSecondId())
        const edgeId2 = String(pair.getSecondId()) + "_" + String(pair.getFirstId())
        const removeId1 = cy.$('#' + edgeId1);
        const removeId2 = cy.$('#' + edgeId2);
        cy.remove(removeId1);
        cy.remove(removeId2);

        const edge = this.createEdge(pair.getFirstId(),
            pair.getSecondId(), pair.getRelation(),
            this.styleSelect(pair.getRelation()) + " highlight");
        cy.add(edge);
    }
}

function setNodeSytleByType(nodeId, nodeType) {
    switch (nodeType) {
        case AxisType.MAIN:
            cy.$('#' + nodeId).style('background-color', 'red');
            break;
        default:
            cy.$('#' + nodeId).style('background-color', '#666');
            break;
    }
}

function refreshGraphElem(formType) {
    let allCyNodes = cy.nodes().map(x => x.id());
    for (let i = 0; i < graphEventsToPreset.length; i++) {
        let nodeId = graphEventsToPreset[i].getId();
        if (cy.hasElementWithId(nodeId)) {
            const nodeIdx = allCyNodes.indexOf(String(nodeId));
            allCyNodes.splice(nodeIdx, 1);
            setNodeSytleByType(nodeId, graphEventsToPreset[i].getAxisType());
        } else {
            cy.add(createNode(graphEventsToPreset[i].getId(), graphEventsToPreset[i].getTokens(), graphEventsToPreset[i].getAxisType()));
            setNodeSytleByType(nodeId, graphEventsToPreset[i].getAxisType());
        }
    }

    if (allCyNodes.length > 0) {
        for (let i = 0; i < allCyNodes.length; i++) {
            const removeId = cy.$('#' + allCyNodes[i]);
            cy.remove(removeId);
        }
    }

    const axisEdges = this.getAxisEdges(formType);
    const cyEdges = cy.edges();
    for (let i = 0; i < cyEdges.length; i++) {
        const removeId = cy.$('#' + cyEdges[i].id());
        cy.remove(removeId);
    }

    for (let i = 0; i < axisEdges.length; i++) {
        let edgeId = axisEdges[i].data.id;
        let spltEdgeId = axisEdges[i].data.id.split("_");
        const revEdgeId = spltEdgeId[1] + "_" + spltEdgeId[0];
        if (!cy.hasElementWithId(edgeId) && !cy.hasElementWithId(revEdgeId)) {
            cy.add(axisEdges[i]);
        } else if (cy.hasElementWithId(revEdgeId)) {
            const removeId = cy.$('#' + revEdgeId);
            cy.remove(removeId);
            cy.add(axisEdges[i]);
        } else {
            if (cy.hasElementWithId(edgeId)) {
                const removeId = cy.$('#' + edgeId);
                cy.remove(removeId);
            }
            cy.add(axisEdges[i]);
        }
    }

    return cy.nodes();
}

function getNodeStyle() {
    return {
        selector: 'node',
        style: {
            'width': 15,
            'height': 15,
            'background-color': '#666',
            'font-size': 15,
            'label': 'data(label)'
        }
    };
}

function getEdgeStyle() {
    return {
        selector: 'edge',
        style: {
            'width': 2,
            'font-size': 10,
            'line-color': '#808080',
            'target-arrow-color': '#808080',
            'target-arrow-shape': 'triangle-tee',
            'curve-style': 'bezier',
            'label': 'data(label)',
        }
    };
}

function getNodeTypeStyle(nodeType) {
    switch (nodeType) {
        case AxisType.MAIN:
            return {
                selector: '.main',
                style: {
                    'background-color': '#FFC300',
                }
            };
        case AxisType.NA:
            return {
                selector: '.unknown',
                    style: {
                    'target-arrow-shape': 'none',
                    'source-arrow-shape': 'none',
                }
            };
    }
}

function getHighlightStyle() {
    return {
        selector: '.highlight',
        style: {
            'line-color': '#900C3F',
            'target-arrow-color': '#900C3F',
            'line-opacity': 0.5,
            'width': 4,
            'opacity': 1.0,
        }
    };
}

function getGraphStyle(curForm) {
    return [ // the stylesheet for the graph
        this.getNodeStyle(),
        this.getEdgeStyle(),
        curForm.graphPairRelationStyle(EventRelationType.VAGUE),
        curForm.graphPairRelationStyle(EventRelationType.EQUAL),
        curForm.graphPairRelationStyle(EventRelationType.BEFORE),
        curForm.graphPairRelationStyle(EventRelationType.CAUSE),
        curForm.graphPairRelationStyle(EventRelationType.NO_CAUSE),
        curForm.graphPairRelationStyle(EventRelationType.CONTAINS),
        this.getNodeTypeStyle(AxisType.MAIN),
        this.getNodeTypeStyle(AxisType.NA),
        this.getHighlightStyle(),
    ];
}

function renderGraph(curForm) {
    if (cy == null) {
        const elements = this.getAllNodes().concat(this.getAxisEdges(curForm.formType));
        cy = cytoscape({

            container: document.getElementById('cy'), // container to render in

            // userZoomingEnabled: false,

            elements: elements,

            style: this.getGraphStyle(curForm),

            layout: {
                name: 'grid',
                // rows: 1
            },

            zoom: 1,
            minZoom: 1,
            maxZoom: 1,
            zoomingEnabled: false,
        });
    } else {
        cy.style(this.getGraphStyle(curForm));
    }
}