class GraphObj {
    constructor() {
        this._graphMatrix = null;
        this._graphIndices = null;

        if (this._temporalGraphHandler == null) {
            this._temporalGraphHandler = new TemporalGraphHandler();

            if(config.app.includeCausal) {
                this._causalGraphHandler = new CausalGraphHandler();
            }

            if (config.app.includeCoref) {
                this._corefGraphHandler = new CorefGraphHandler();
            }
        }
    }

    handleFormRelations(firstId, secondId, selectedValue, formType) {
        switch (formType) {
            case FormType.TEMPORAL:
                return this._temporalGraphHandler.handleEdgeSelection(this, firstId, secondId, selectedValue);
            case FormType.CAUSAL:
                return this._causalGraphHandler.handleEdgeSelection(this, firstId, secondId, selectedValue);
            case FormType.COREF:
                return this._corefGraphHandler.handleEdgeSelection(this, firstId, secondId, selectedValue);
        }
    }

    getFormTransitiveAndDiscrepancies() {
        return this._temporalGraphHandler.reachAndTransitiveClosureRel(this);
    }

    fillFormMissingRel() {
        let reachAndDiscrepancies = this._temporalGraphHandler.reachAndTransitiveClosureRel(this);
        return this._temporalGraphHandler.fillMissingRelations(this, reachAndDiscrepancies[0]);
    }

    static fromJsonObject(jsonObject) {
        if (jsonObject._graphMatrix != null) {
            const graphObj = new GraphObj();
            graphObj._graphIndices = jsonObject._graphIndices;
            graphObj._graphMatrix = Array(graphObj._graphIndices.length).fill().map(() => Array(graphObj._graphIndices.length).fill(
                new GraphEdge(EventRelationType.NA, false)));

            for (let i = 0; i < graphObj._graphIndices.length; i++) {
                for (let j = 0; j < graphObj._graphIndices.length; j++) {
                    graphObj._graphMatrix[i][j] = GraphEdge.fromJsonObject(jsonObject._graphMatrix[i][j])
                }
            }

            return graphObj;
        }

        return null
    }

    initGraph(graphIndices) {
        if(this._graphMatrix == null) {
            this._graphIndices = graphIndices;
            this._graphMatrix = Array(this._graphIndices.length).fill().map(() =>
                Array(this._graphIndices.length).fill().map(() => new GraphEdge(EventRelationType.NA, false))
            );

            for (let i = 0; i < this._graphIndices.length - 1; i++) {
                this._graphMatrix[i][i+1] = new GraphEdge(EventRelationType.CANDIDATE, false);
                this._graphMatrix[i+1][i] = new GraphEdge(EventRelationType.CANDIDATE, false);
            }
        } else {
            const thisGraphSorted = [...this._graphIndices].sort();
            const funcGraphSorted = [...graphIndices].sort();
            if (JSON.stringify(thisGraphSorted) !== JSON.stringify(funcGraphSorted)) {
                // Find the index of the elements that exist in graphIndices but not in this._graphIndices
                const addedEventsIdxs = graphIndices.map(item => !this._graphIndices.includes(item));
                const removedEventsIdxs = this._graphIndices.map(item => !graphIndices.includes(item));
                for (let i = addedEventsIdxs.length - 1; i >= 0; i--) {
                    if (addedEventsIdxs[i] === true) {
                        // Add new row and column
                        this._graphMatrix.splice(i, 0, Array(this._graphMatrix.length).fill().map(() => new GraphEdge(EventRelationType.NA, false)));
                        this._graphIndices.splice(i, 0, graphIndices[i]);
                        for (let j = this._graphMatrix.length - 1; j >= 0; j--) {
                            this._graphMatrix[j].splice(i, 0, new GraphEdge(EventRelationType.NA, false));
                        }
                    }
                }

                // Remove rows and columns
                for (let i = removedEventsIdxs.length - 1; i >= 0; i--) {
                    if (removedEventsIdxs[i] === true) {
                        // Add new row and column
                        this._graphMatrix.splice(i, 1);
                        this._graphIndices.splice(i, 1);
                        for (let j = this._graphMatrix.length - 1; j >= 0; j--) {
                            this._graphMatrix[j].splice(i, 1);
                        }
                    }
                }
            }
        }
    }

    printGraph() {
        const defaultGraphHandler = new DefaultGraphHandler();
        const axisGraph = defaultGraphHandler.reachAndTransitiveClosureRel(this)[0];
        let columnIds = this._graphIndices;
        let result = [];
        columnIds = columnIds.map(item => `000${item}`.slice(-4));

        result.push("    |" + columnIds.join('|'));
        for (let i = 0; i < axisGraph.length; i++) {
            let row = [];
            for (let j = 0; j < axisGraph[i].length; j++) {
                row.push(getRelationStrValue(axisGraph[i][j]));
            }
            result.push(columnIds[i] + "|" + row.join('|'));
        }

        return result.join('\n');
    }

    getGraphMatrix() {
        return this._graphMatrix;
    }

    getEdgeRelation(firstId, secondId) {
        return this._graphMatrix[firstId][secondId].getEdgeRelation();
    }

    getEdgeManuallyAnnotated(firstId, secondId) {
        return this._graphMatrix[firstId][secondId].isManuallyAnnotated();
    }

    getGraphIndices() {
        return this._graphIndices;
    }

    getCausalCandidatesBeforePairs(eventId) {
        return this._causalGraphHandler.getAllCausalPairCandidates(this, eventId);
    }

    getAllCoreferringEvents(eventId) {
        return this._corefGraphHandler.getAllCoreferringEvents(this, eventId);
    }

    getAllEqualEventsPairs(eventId) {
        let reachAndDiscrepancies = this._corefGraphHandler.reachAndTransitiveClosureRel(this)[0];
        const graphIndices = this.getGraphIndices();
        const graphEventId = graphIndices.indexOf(eventId);
        let equalEventsPairs = [];
        for (let i = 0; i < reachAndDiscrepancies.length; i++) {
            if (getRelationMapping(reachAndDiscrepancies[graphEventId][i]) === EventRelationType.EQUAL) {
                const eventPair = EventPair.initFromData("null", graphIndices[i], eventId);
                eventPair.setRelation(getOppositeRelation(getExportRelation(reachAndDiscrepancies[graphEventId][i])));
                equalEventsPairs.push(eventPair);
            }
        }

        return equalEventsPairs;
    }

    exportAllReachAndTransGraphPairs(axisId) {
        let allPairs = [];
        if (this._graphIndices == null || this._graphIndices.length === 0) {
            return allPairs;
        }

        const eventIds = this._graphIndices;
        let coref = this._corefGraphHandler.reachAndTransitiveClosureRel(this)[0];
        let causal = this._causalGraphHandler.reachAndTransitiveClosureRel(this)[0];
        for (let i = 0; i < this._graphIndices.length; i++) {
            for (let j = i + 1; j < this._graphIndices.length; j++) {
                if (coref[i][j] !== causal[i][j]) {
                    if (coref[i][j] === EventRelationType.NA) {
                        let eventPair = EventPair.initFromData(axisId, eventIds[i], eventIds[j]);
                        eventPair.setRelation(getExportRelation(causal[i][j]));
                        allPairs.push(eventPair);
                    } else if (causal[i][j] === EventRelationType.NA) {
                        let eventPair = EventPair.initFromData(axisId, eventIds[i], eventIds[j]);
                        eventPair.setRelation(getExportRelation(coref[i][j]));
                        allPairs.push(eventPair);
                    } else {
                        let eventPair = EventPair.initFromData(axisId, eventIds[i], eventIds[j]);
                        if (getRelationMapping(causal[i][j]) === EventRelationType.EQUAL) {
                            eventPair.setRelation(getExportRelation(coref[i][j]));
                        } else {
                            eventPair.setRelation(getExportRelation(causal[i][j]));
                        }
                        allPairs.push(eventPair);
                    }
                } else {
                    let eventPair = EventPair.initFromData(axisId, eventIds[i], eventIds[j]);
                    eventPair.setRelation(getExportRelation(causal[i][j]));
                    allPairs.push(eventPair);
                }
            }
        }

        return allPairs;
    }
}

class DefaultGraphHandler {
    fillMissingRelations(axisGraph, reachAndTransGraph) {
        throw new Error("Not implemented!");
    }

    handleEdgeSelection(axisGraph, firstEventId, secondEventId, selectedRelation) {
        throw new Error("Not implemented!");
    }

    reachAndTransitiveClosureRel(axisGraph) {
        let reachGraph = this.getDirectReachGraph(axisGraph.getGraphMatrix());
        let discrepancies = [];
        const length = reachGraph.length;
        for (let k = 0; k < length; k++) {
            for (let i = 0; i < length; i++) {
                for (let j = 0; j < length; j++) {
                    const directRel = getRelationMapping(reachGraph[i][j]);
                    const inferredTranRel = getRelationMapping(this.getInferredTransitiveRelationType(reachGraph, i, j, k));
                    const emptyTransRel = reachGraph[i][j] === EventRelationType.NA || reachGraph[i][j] === EventRelationType.CANDIDATE;
                    // Check cases that the transitive closure should be also annotated (as before relation)
                    if (inferredTranRel === EventRelationType.BEFORE && i !== j) {
                        if (emptyTransRel) {
                            // [i][k] is equal or before and [k][j] is before
                            reachGraph[i][j] = EventRelationType.BEFORE;
                            reachGraph[j][i] = EventRelationType.AFTER;
                        } else if(getRelationMapping(reachGraph[i][j]) !== EventRelationType.BEFORE) {
                            discrepancies.push([axisGraph.getGraphIndices()[i], axisGraph.getGraphIndices()[j], axisGraph.getGraphIndices()[k], reachGraph[i][j], inferredTranRel]);
                        }
                    } else if (inferredTranRel === EventRelationType.EQUAL && i !== j) {
                        if (emptyTransRel) {
                            // [i][k] is equal and [k][j] is equal
                            reachGraph[i][j] = EventRelationType.EQUAL;
                            reachGraph[j][i] = EventRelationType.EQUAL;
                        } else if(getRelationMapping(reachGraph[i][j]) !== EventRelationType.EQUAL) {
                            discrepancies.push([axisGraph.getGraphIndices()[i], axisGraph.getGraphIndices()[j], axisGraph.getGraphIndices()[k], reachGraph[i][j], inferredTranRel]);
                        }
                    }

                    // Check discrepancies for the other relations (this might create some dups but not a big deal as showing to user only one each time)
                    if (i !== j && directRel === EventRelationType.AFTER && (inferredTranRel === EventRelationType.BEFORE ||
                        inferredTranRel === EventRelationType.EQUAL)) {
                        // Check that the transitive closure was annotated as after however the path indicate a before/equal relation
                        discrepancies.push([axisGraph.getGraphIndices()[i], axisGraph.getGraphIndices()[j], axisGraph.getGraphIndices()[k], reachGraph[i][j], inferredTranRel]);
                    } else if (i !== j && directRel === EventRelationType.BEFORE && (inferredTranRel === EventRelationType.AFTER ||
                        inferredTranRel === EventRelationType.EQUAL)) {
                        // Check that the transitive closure was annotated as before however the path indicate an after/equal relation
                        discrepancies.push([axisGraph.getGraphIndices()[i], axisGraph.getGraphIndices()[j], axisGraph.getGraphIndices()[k], reachGraph[i][j], inferredTranRel]);
                    } else if (i !== j && directRel === EventRelationType.EQUAL && (inferredTranRel === EventRelationType.AFTER ||
                        inferredTranRel === EventRelationType.BEFORE)) {
                        // Check that the transitive closure was annotated as equals however the path indicate a before/after relation
                        discrepancies.push([axisGraph.getGraphIndices()[i], axisGraph.getGraphIndices()[j], axisGraph.getGraphIndices()[k], reachGraph[i][j], inferredTranRel]);
                    } else if (i !== j && directRel === EventRelationType.VAGUE && (inferredTranRel === EventRelationType.AFTER ||
                        inferredTranRel === EventRelationType.BEFORE || inferredTranRel === EventRelationType.EQUAL)) {
                        // Check that the transitive closure was annotated as equals however the path indicate a before/after relation
                        discrepancies.push([axisGraph.getGraphIndices()[i], axisGraph.getGraphIndices()[j], axisGraph.getGraphIndices()[k], reachGraph[i][j], inferredTranRel]);
                    }
                }
            }
        }

        return [reachGraph, discrepancies];
    }

    getDirectReachGraph(graphMatrix) {
        if (graphMatrix == null || graphMatrix.length === 0) {
            return [];
        }

        const length = graphMatrix.length;
        let reach = Array.from(Array(length), () => new Array(length));
        let i, j;
        for (i = 0; i < length; i++) {
            for (j = 0; j < length; j++) {
                reach[i][j] = graphMatrix[i][j].getEdgeRelation();
            }
        }

        return reach;
    }

    getInferredTransitiveRelationType(reachGraph, i, j, k) {
        if((getRelationMapping(reachGraph[i][k]) === EventRelationType.AFTER && getRelationMapping(reachGraph[k][j]) === EventRelationType.AFTER) ||
            (getRelationMapping(reachGraph[i][k]) === EventRelationType.AFTER && getRelationMapping(reachGraph[k][j]) === EventRelationType.EQUAL) ||
            (getRelationMapping(reachGraph[i][k]) === EventRelationType.EQUAL && getRelationMapping(reachGraph[k][j]) === EventRelationType.AFTER)) {
            return EventRelationType.AFTER;
        } else if((getRelationMapping(reachGraph[i][k]) === EventRelationType.BEFORE && getRelationMapping(reachGraph[k][j]) === EventRelationType.BEFORE) ||
            (getRelationMapping(reachGraph[i][k]) === EventRelationType.BEFORE && getRelationMapping(reachGraph[k][j]) === EventRelationType.EQUAL) ||
            (getRelationMapping(reachGraph[i][k]) === EventRelationType.EQUAL && getRelationMapping(reachGraph[k][j]) === EventRelationType.BEFORE)) {
            return EventRelationType.BEFORE;
        } else if(getRelationMapping(reachGraph[i][k]) === EventRelationType.EQUAL && getRelationMapping(reachGraph[k][j]) === EventRelationType.EQUAL) {
            return EventRelationType.EQUAL;
        } else {
            return EventRelationType.NA;
        }
    }
}

class TemporalGraphHandler extends DefaultGraphHandler {
    handleEdgeSelection(axisGraph, firstId, secondId, selectedRelation) {
        let graphMatrix = axisGraph.getGraphMatrix();
        let graphIndices = axisGraph.getGraphIndices();
        const graphFirstId = graphIndices.indexOf(firstId);
        const graphSecondId = graphIndices.indexOf(secondId);
        // console.log("Axis pairs BEFORE selection (for pair-{" + firstId + ", " + secondId + "}) = " + this.prettyPrintAxisPairs());
        switch (selectedRelation) {
            case EventRelationType.BEFORE:
                console.log("user selected temporal relation BEFORE for nodes: {" + firstId + ", " + secondId + "}");
                graphMatrix[graphFirstId][graphSecondId] = new GraphEdge(EventRelationType.BEFORE, true);
                graphMatrix[graphSecondId][graphFirstId] = new GraphEdge(EventRelationType.AFTER, true);
                break;
            case EventRelationType.AFTER:
                console.log("user selected temporal relation AFTER for nodes: {" + firstId + ", " + secondId + "}");
                graphMatrix[graphFirstId][graphSecondId] = new GraphEdge(EventRelationType.AFTER, true);
                graphMatrix[graphSecondId][graphFirstId] = new GraphEdge(EventRelationType.BEFORE, true);
                break;
            case EventRelationType.EQUAL:
                console.log("user selected temporal relation EQUAL for nodes: {" + firstId + ", " + secondId + "}");
                graphMatrix[graphFirstId][graphSecondId] = new GraphEdge(EventRelationType.EQUAL, true);
                graphMatrix[graphSecondId][graphFirstId] = new GraphEdge(EventRelationType.EQUAL, true);
                break;
            case EventRelationType.VAGUE:
                console.log("user selected temporal relation VAGUE for nodes: {" + firstId + ", " + secondId + "}");
                graphMatrix[graphFirstId][graphSecondId] = new GraphEdge(EventRelationType.VAGUE, true);
                graphMatrix[graphSecondId][graphFirstId] = new GraphEdge(EventRelationType.VAGUE, true);
                break;
        }

        // let grpIdx = graphFirstId >= graphSecondId ? graphFirstId : graphSecondId;
        let reachAndDiscrepancies = this.reachAndTransitiveClosureRel(axisGraph);
        this.fillMissingRelations(axisGraph, reachAndDiscrepancies[0]);
        console.log("Axis pairs AFTER selection (for pair-{" + firstId + ", " + secondId + "})");
        return reachAndDiscrepancies[1];
    }

    fillMissingRelations(axisGraph, reachAndTransGraph) {
        let graphMatrix = axisGraph.getGraphMatrix();
        for(let i = 0; i < axisGraph.getGraphIndices().length; i++) {
            for (let j = 0; j < axisGraph.getGraphIndices().length; j++) {
                const graphMatrixEdgeRel = graphMatrix[i][j].getEdgeRelation();
                const graphMatrixEdgeRelOpp = graphMatrix[j][i].getEdgeRelation();
                // If i was able to get from i to second node after the change there is no path from i to the first node
                if (reachAndTransGraph[i][j] === EventRelationType.NA && reachAndTransGraph[j][i] === EventRelationType.NA && i !== j) {
                    // console.log("Adding candidate pair for unreached: {" + i + ", " + j + "}");
                    graphMatrix[i][j] = new GraphEdge(EventRelationType.CANDIDATE, false);
                    graphMatrix[j][i] = new GraphEdge(EventRelationType.CANDIDATE, false);
                    reachAndTransGraph[i][j] = EventRelationType.CANDIDATE;
                    reachAndTransGraph[j][i] = EventRelationType.CANDIDATE;
                } else if ((graphMatrixEdgeRel === EventRelationType.CANDIDATE && graphMatrixEdgeRelOpp === EventRelationType.CANDIDATE) &&
                    (reachAndTransGraph[i][j] !== EventRelationType.NA && reachAndTransGraph[j][i] !== EventRelationType.CANDIDATE)) {
                    // console.log("Removing candidate pair that can be reached: {" + i + ", " + j + "}");
                    graphMatrix[i][j] = new GraphEdge(EventRelationType.NA, false);
                    graphMatrix[j][i] = new GraphEdge(EventRelationType.NA, false);
                }
            }
        }
    }
}

class CorefGraphHandler extends TemporalGraphHandler {
    handleEdgeSelection(axisGraph, firstId, secondId, selectedRelation) {
        let graphMatrix = axisGraph.getGraphMatrix();
        let graphIndices = axisGraph.getGraphIndices();
        const graphFirstId = graphIndices.indexOf(firstId);
        const graphSecondId = graphIndices.indexOf(secondId);
        switch (selectedRelation) {
            case EventRelationType.COREF:
                graphMatrix[graphFirstId][graphSecondId].setEdgeRelation(EventRelationType.COREF);
                graphMatrix[graphSecondId][graphFirstId].setEdgeRelation(EventRelationType.COREF);
                break;
            case EventRelationType.NO_COREF:
                graphMatrix[graphFirstId][graphSecondId].setEdgeRelation(EventRelationType.NO_COREF);
                graphMatrix[graphSecondId][graphFirstId].setEdgeRelation(EventRelationType.NO_COREF);
                break;
            case EventRelationType.UNCERTAIN_COREF:
                graphMatrix[graphFirstId][graphSecondId].setEdgeRelation(EventRelationType.UNCERTAIN_COREF);
                graphMatrix[graphSecondId][graphFirstId].setEdgeRelation(EventRelationType.UNCERTAIN_COREF);
                break;
            default:
                throw new Error("Error: Relation " + selectedRelation + " not supported!");
        }

        let reachAndDiscrepancies = this.reachAndTransitiveClosureRel(axisGraph);
        this.fillMissingRelations(axisGraph, reachAndDiscrepancies[0]);
        return reachAndDiscrepancies[1];
    }

    reachAndTransitiveClosureRel(axisGraph) {
        let reachGraph = super.reachAndTransitiveClosureRel(axisGraph)[0];
        let discrepancies = [];
        const length = reachGraph.length;
        for (let k = 0; k < length; k++) {
            for (let i = 0; i < length; i++) {
                for (let j = 0; j < length; j++) {
                    const emptyTransRel = reachGraph[i][j] === EventRelationType.NA || reachGraph[i][j] === EventRelationType.CANDIDATE;
                    const isDirectEqual = getRelationMapping(reachGraph[i][j]) === EventRelationType.EQUAL;
                    const inferredTranRel = this.getInferredTransitiveRelationType(reachGraph, i, j, k);
                    if (inferredTranRel === EventRelationType.COREF && i !== j) {
                        if(emptyTransRel || reachGraph[i][j] === EventRelationType.EQUAL) {
                            reachGraph[i][j] = EventRelationType.COREF;
                            reachGraph[j][i] = EventRelationType.COREF;
                        } else if (!isDirectEqual && reachGraph[i][j] !== EventRelationType.COREF) {
                            discrepancies.push([axisGraph.getGraphIndices()[i], axisGraph.getGraphIndices()[j], axisGraph.getGraphIndices()[k], reachGraph[i][j], inferredTranRel]);
                        }
                    } else if (inferredTranRel === EventRelationType.NO_COREF && i !== j) {
                        if(emptyTransRel || reachGraph[i][j] === EventRelationType.EQUAL) {
                            reachGraph[i][j] = EventRelationType.NO_COREF;
                            reachGraph[j][i] = EventRelationType.NO_COREF;
                        } else if (!isDirectEqual && reachGraph[i][j] !== EventRelationType.NO_COREF && reachGraph[i][j] !== EventRelationType.UNCERTAIN_COREF &&
                            reachGraph[i][j] !== EventRelationType.NO_COREF) {
                            discrepancies.push([axisGraph.getGraphIndices()[i], axisGraph.getGraphIndices()[j], axisGraph.getGraphIndices()[k], reachGraph[i][j], inferredTranRel]);
                        }
                    }

                    // Check discrepancies for the other relations (this might create some dups but not a big deal as showing to user only one each time)
                    if (reachGraph[i][j] === EventRelationType.COREF && inferredTranRel === EventRelationType.NO_COREF && i !== j) {
                        // Check that the transitive closure was annotated as coref however the path indicate a contradicting relation of no coref
                        discrepancies.push([axisGraph.getGraphIndices()[i], axisGraph.getGraphIndices()[j], axisGraph.getGraphIndices()[k], reachGraph[i][j], inferredTranRel]);
                    } else if ((reachGraph[i][j] === EventRelationType.NO_COREF || reachGraph[i][j] === EventRelationType.UNCERTAIN_COREF) &&
                        inferredTranRel === EventRelationType.COREF && i !== j) {
                        // Check that the transitive closure was annotated as coref however the path indicate a contradicting relation
                        discrepancies.push([axisGraph.getGraphIndices()[i], axisGraph.getGraphIndices()[j], axisGraph.getGraphIndices()[k], reachGraph[i][j], inferredTranRel]);
                    }
                }
            }
        }

        return [reachGraph, discrepancies];
    }

    fillMissingRelations(axisGraph, reachAndTransGraph) {
        let graphMatrix = axisGraph.getGraphMatrix();
        const length = graphMatrix.length;
        for (let k = 0; k < length; k++) {
            for (let i = 0; i < length; i++) {
                for (let j = 0; j < length; j++) {
                    // Check cases that the transitive closure should be also annotated (path cannot determine if caused or not)
                    const ikNoCoref = reachAndTransGraph[i][k] === EventRelationType.NO_COREF || reachAndTransGraph[i][k] === EventRelationType.UNCERTAIN_COREF;
                    const kjNoCoref = reachAndTransGraph[k][j] === EventRelationType.NO_COREF || reachAndTransGraph[k][j] === EventRelationType.UNCERTAIN_COREF;
                    const notDirectCoref = reachAndTransGraph[i][j] !== EventRelationType.COREF && reachAndTransGraph[i][j] !== EventRelationType.NO_COREF;
                    if (i !== j && (getRelationMapping(reachAndTransGraph[i][j]) === EventRelationType.EQUAL ||
                        getRelationMapping(reachAndTransGraph[i][j]) === EventRelationType.NA) &&
                        ikNoCoref && kjNoCoref && notDirectCoref) {
                        // Adding the transitive before relation to check if its a cause or no cause (as it is undetermined)
                        // will trigger the logic to ask the user
                        reachAndTransGraph[i][j] = EventRelationType.EQUAL;
                        reachAndTransGraph[j][i] = EventRelationType.EQUAL;
                        graphMatrix[i][j].setEdgeRelation(EventRelationType.EQUAL);
                        graphMatrix[j][i].setEdgeRelation(EventRelationType.EQUAL);
                    }
                }
            }
        }
    }

    getAllCoreferringEvents(axisGraph, eventId) {
        let reachAndDiscrepancies = this.reachAndTransitiveClosureRel(axisGraph)[0];
        const graphIndices = axisGraph.getGraphIndices();
        const graphEventId = graphIndices.indexOf(eventId);
        let coreferringEvents = [];
        for (let i = 0; i < reachAndDiscrepancies.length; i++) {
            if (reachAndDiscrepancies[graphEventId][i] === EventRelationType.COREF) {
                coreferringEvents.push(graphIndices[i]);
            }
        }

        return coreferringEvents;
    }

    getInferredTransitiveRelationType(reachAndTransGraph, i, j, k) {
        if (reachAndTransGraph[i][k] === EventRelationType.COREF &&
            (reachAndTransGraph[k][j] === EventRelationType.NO_COREF || reachAndTransGraph[k][j] === EventRelationType.UNCERTAIN_COREF)) {
            return EventRelationType.NO_COREF;
        } else if ((reachAndTransGraph[i][k] === EventRelationType.NO_COREF || reachAndTransGraph[i][k] === EventRelationType.UNCERTAIN_COREF) &&
            reachAndTransGraph[k][j] === EventRelationType.COREF) {
            return EventRelationType.NO_COREF;
        } else if (reachAndTransGraph[i][k] === EventRelationType.COREF && reachAndTransGraph[k][j] === EventRelationType.COREF) {
            return EventRelationType.COREF;
        } else if ((reachAndTransGraph[i][k] === EventRelationType.NO_COREF || reachAndTransGraph[i][k] === EventRelationType.UNCERTAIN_COREF) &&
            (reachAndTransGraph[k][j] === EventRelationType.NO_COREF || reachAndTransGraph[k][j] === EventRelationType.COREF)) {
            // This is NA because in this case we like to ask the user about i,j relation
            return EventRelationType.NA;
        } else {
            return super.getInferredTransitiveRelationType(reachAndTransGraph, i, j, k);
        }
    }
}

class CausalGraphHandler extends CorefGraphHandler {
    handleEdgeSelection(axisGraph, firstId, secondId, selectedRelation) {
        let graphMatrix = axisGraph.getGraphMatrix();
        const graphIndices = axisGraph.getGraphIndices();
        const graphFirstId = graphIndices.indexOf(firstId);
        const graphSecondId = graphIndices.indexOf(secondId);
        if (selectedRelation === EventRelationType.CAUSE) {
            graphMatrix[graphFirstId][graphSecondId].setEdgeRelation(EventRelationType.CAUSE);
            graphMatrix[graphSecondId][graphFirstId].setEdgeRelation(EventRelationType.EFFECT);
        } else if (selectedRelation === EventRelationType.NO_CAUSE) {
            graphMatrix[graphFirstId][graphSecondId].setEdgeRelation(EventRelationType.NO_CAUSE);
            graphMatrix[graphSecondId][graphFirstId].setEdgeRelation(EventRelationType.NO_EFFECT);
        } else if (selectedRelation === EventRelationType.UNCERTAIN_CAUSE) {
            graphMatrix[graphFirstId][graphSecondId].setEdgeRelation(EventRelationType.UNCERTAIN_CAUSE);
            graphMatrix[graphSecondId][graphFirstId].setEdgeRelation(EventRelationType.UNCERTAIN_EFFECT);
        } else if (selectedRelation === EventRelationType.EFFECT) {
            graphMatrix[graphFirstId][graphSecondId].setEdgeRelation(EventRelationType.EFFECT);
            graphMatrix[graphSecondId][graphFirstId].setEdgeRelation(EventRelationType.CAUSE);
        } else if (selectedRelation === EventRelationType.NO_EFFECT) {
            graphMatrix[graphFirstId][graphSecondId].setEdgeRelation(EventRelationType.NO_EFFECT);
            graphMatrix[graphSecondId][graphFirstId].setEdgeRelation(EventRelationType.NO_CAUSE);
        } else if (selectedRelation === EventRelationType.UNCERTAIN_EFFECT) {
            graphMatrix[graphFirstId][graphSecondId].setEdgeRelation(EventRelationType.UNCERTAIN_EFFECT);
            graphMatrix[graphSecondId][graphFirstId].setEdgeRelation(EventRelationType.UNCERTAIN_CAUSE);
        }

        console.log("Axis pairs AFTER selection (for pair-{" + firstId + ", " + secondId + "})");
        return null;
    }

    getAllCausalPairCandidates(axisGraph, eventId) {
        let reachAndDiscrepancies = this.reachAndTransitiveClosureRel(axisGraph)[0];
        const graphIndices = axisGraph.getGraphIndices();
        const graphEventId = graphIndices.indexOf(eventId);
        let beforePairs = [];
        for (let i = 0; i < reachAndDiscrepancies.length; i++) {
            if (getRelationMapping(reachAndDiscrepancies[graphEventId][i]) === EventRelationType.AFTER) {
                const eventPair = EventPair.initFromData("null", graphIndices[i], eventId);
                eventPair.setRelation(getOppositeRelation(getExportRelation(reachAndDiscrepancies[graphEventId][i])));
                beforePairs.push(eventPair);
            }
        }

        return beforePairs;
    }

    reachAndTransitiveClosureRel(axisGraph) {
        return super.reachAndTransitiveClosureRel(axisGraph);
    }
}

class GraphEdge {
    constructor(relation, manually_annotated) {
        this._relation = relation;
        this._manually_annotated = manually_annotated;
    }

    static fromJsonObject(jsonObject) {
        if (jsonObject == null) {
            return null;
        }

        return new GraphEdge(jsonObject._relation, jsonObject._manually_annotated);
    }

    getEdgeRelation() {
        return this._relation;
    }

    isManuallyAnnotated() {
        return this._manually_annotated;
    }

    setEdgeRelation(relation) {
        this._relation = relation;
    }

    setManuallyAnnotated(manually_annotated) {
        this._manually_annotated = manually_annotated;
    }
}