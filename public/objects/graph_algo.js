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
            case FormType.SUB_EVENT:
                return this._subEventGraphHandler.handleEdgeSelection(this, firstId, secondId, selectedValue);
        }
    }

    getFormTransitiveAndDiscrepancies(formType) {
        switch (formType) {
            case FormType.TEMPORAL:
                return this._temporalGraphHandler.reachAndTransitiveClosureRel(this);
            case FormType.CAUSAL:
                return this._causalGraphHandler.reachAndTransitiveClosureRel(this);
            case FormType.COREF:
                return this._corefGraphHandler.reachAndTransitiveClosureRel(this);
            case FormType.SUB_EVENT:
                return this._subEventGraphHandler.reachAndTransitiveClosureRel(this);
        }
    }

    fillFormMissingRel(formType) {
        let reachAndDiscrepancies;
        switch (formType) {
            case FormType.TEMPORAL:
                reachAndDiscrepancies = this._temporalGraphHandler.reachAndTransitiveClosureRel(this);
                return this._temporalGraphHandler.fillMissingRelations(this, reachAndDiscrepancies[0]);
            case FormType.CAUSAL:
                reachAndDiscrepancies = this._causalGraphHandler.reachAndTransitiveClosureRel(this);
                return this._causalGraphHandler.fillMissingRelations(this, reachAndDiscrepancies[0]);
            case FormType.COREF:
                reachAndDiscrepancies = this._corefGraphHandler.reachAndTransitiveClosureRel(this);
                return this._corefGraphHandler.fillMissingRelations(this, reachAndDiscrepancies[0]);
            case FormType.SUB_EVENT:
                return;
                // return this._subEventGraphHandler.reachAndTransitiveClosureRel(this)[1];
        }
    }

    static fromJsonObject(jsonObject) {
        const graphObj = new GraphObj();
        if (jsonObject != null) {
            graphObj._graphMatrix = jsonObject._graphMatrix;
            graphObj._graphIndices = jsonObject._graphIndices;
            return graphObj;
        }

        return graphObj;
    }

    initGraph(graphIndices) {
        if(this._graphMatrix == null) {
            this._graphIndices = graphIndices;
            this._graphMatrix = Array(this._graphIndices.length).fill().map(() => Array(this._graphIndices.length).fill(EventRelationType.NA));
            for (let i = 0; i < this._graphIndices.length - 1; i++) {
                this._graphMatrix[i][i+1] = EventRelationType.CANDIDATE;
                this._graphMatrix[i+1][i] = EventRelationType.CANDIDATE;
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
                        this._graphMatrix.splice(i, 0, Array(this._graphMatrix.length).fill(EventRelationType.NA));
                        for (let j = this._graphMatrix.length - 1; j >= 0; j--) {
                            this._graphMatrix[j].splice(i, 0, EventRelationType.NA);
                        }
                    }
                }

                // Remove rows and columns
                for (let i = removedEventsIdxs.length - 1; i >= 0; i--) {
                    if (removedEventsIdxs[i] === true) {
                        // Add new row and column
                        this._graphMatrix.splice(i, 1);
                        for (let j = this._graphMatrix.length - 1; j >= 0; j--) {
                            this._graphMatrix[j].splice(i, 1);
                        }
                    }
                }

                this._graphIndices = graphIndices;
            }
        }
    }

    removeTemporalTransitiveRels() {
        let currentGraph = this.getGraphMatrix();
        for (let i = 0; i < currentGraph.length; i++) {
            for (let j = 0; j < currentGraph[i].length; j++) {
                if(i === j || currentGraph[i][j] === EventRelationType.NA) {
                    continue;
                }

                let remRelReg = currentGraph[i][j];
                let remRelRev = currentGraph[j][i];
                currentGraph[i][j] = EventRelationType.NA;
                currentGraph[j][i] = EventRelationType.NA;
                let transitiveGraph = this._temporalGraphHandler.reachAndTransitiveClosureRel(this)[0];
                if (transitiveGraph[i][j] === EventRelationType.NA || transitiveGraph[j][i] === EventRelationType.NA) {
                    currentGraph[i][j] = remRelReg;
                    currentGraph[j][i] = remRelRev;
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

    getGraphIndices() {
        return this._graphIndices;
    }

    getCausalCandidatesBeforePairs(eventId) {
        return this._causalGraphHandler.getAllCausalPairCandidates(this, eventId);
    }

    getWithinListPairsByType(allPairs, formType) {
        if (formType === FormType.CAUSAL) {
            return this._causalGraphHandler.getWithinCausalPairs(this, allPairs);
        } else if(formType === FormType.COREF) {
            return this._corefGraphHandler.getWithinCorefPairs(this, allPairs);
        }

        return null;
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
            if (getRelationMappingTransitive(reachAndDiscrepancies[graphEventId][i]) === EventRelationType.EQUAL) {
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
                        if (getRelationMappingTransitive(causal[i][j]) === EventRelationType.EQUAL) {
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
                    const directRel = getRelationMappingSeparateTransitive(reachGraph[i][j]);
                    const inferredTranRel = getRelationMappingSeparateTransitive(this.getInferredTransitiveRelationType(reachGraph, i, j, k));
                    const emptyTransRel = reachGraph[i][j] === EventRelationType.NA || reachGraph[i][j] === EventRelationType.CANDIDATE;
                    // Check cases that the transitive closure should be also annotated (as before relation)
                    if (inferredTranRel === EventRelationType.BEFORE && i !== j) {
                        if (emptyTransRel) {
                            // [i][k] is equal or before and [k][j] is before
                            reachGraph[i][j] = EventRelationType.BEFORE_TRANSITIVE;
                            reachGraph[j][i] = EventRelationType.AFTER_TRANSITIVE;
                        } else if(getRelationMappingTransitive(reachGraph[i][j]) !== EventRelationType.BEFORE) {
                            discrepancies.push([axisGraph.getGraphIndices()[i], axisGraph.getGraphIndices()[j], reachGraph[i][j], inferredTranRel]);
                        }
                    } else if (inferredTranRel === EventRelationType.EQUAL && i !== j) {
                        if (emptyTransRel) {
                            // [i][k] is equal and [k][j] is equal
                            reachGraph[i][j] = EventRelationType.EQUAL_TRANSITIVE;
                            reachGraph[j][i] = EventRelationType.EQUAL_TRANSITIVE;
                        } else if(getRelationMappingTransitive(reachGraph[i][j]) !== EventRelationType.EQUAL) {
                            discrepancies.push([axisGraph.getGraphIndices()[i], axisGraph.getGraphIndices()[j], reachGraph[i][j], inferredTranRel]);
                        }
                    }

                    // Check discrepancies for the other relations (this might create some dups but not a big deal as showing to user only one each time)
                    if (i !== j && directRel === EventRelationType.AFTER && (inferredTranRel === EventRelationType.BEFORE ||
                        inferredTranRel === EventRelationType.EQUAL)) {
                        // Check that the transitive closure was annotated as after however the path indicate a before/equal relation
                        discrepancies.push([axisGraph.getGraphIndices()[i], axisGraph.getGraphIndices()[j], reachGraph[i][j], inferredTranRel]);
                    } else if (i !== j && directRel === EventRelationType.BEFORE && (inferredTranRel === EventRelationType.AFTER ||
                        inferredTranRel === EventRelationType.EQUAL)) {
                        // Check that the transitive closure was annotated as before however the path indicate an after/equal relation
                        discrepancies.push([axisGraph.getGraphIndices()[i], axisGraph.getGraphIndices()[j], reachGraph[i][j], inferredTranRel]);
                    } else if (i !== j && directRel === EventRelationType.EQUAL && (inferredTranRel === EventRelationType.AFTER ||
                        inferredTranRel === EventRelationType.BEFORE)) {
                        // Check that the transitive closure was annotated as equals however the path indicate a before/after relation
                        discrepancies.push([axisGraph.getGraphIndices()[i], axisGraph.getGraphIndices()[j], reachGraph[i][j], inferredTranRel]);
                    } else if (i !== j && directRel === EventRelationType.VAGUE && (inferredTranRel === EventRelationType.AFTER ||
                        inferredTranRel === EventRelationType.BEFORE || inferredTranRel === EventRelationType.EQUAL)) {
                        // Check that the transitive closure was annotated as equals however the path indicate a before/after relation
                        discrepancies.push([axisGraph.getGraphIndices()[i], axisGraph.getGraphIndices()[j], reachGraph[i][j], inferredTranRel]);
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
                reach[i][j] = graphMatrix[i][j];
            }
        }

        return reach;
    }

    getInferredTransitiveRelationType(reachGraph, i, j, k) {
        if((getRelationMappingTransitive(reachGraph[i][k]) === EventRelationType.AFTER && getRelationMappingTransitive(reachGraph[k][j]) === EventRelationType.AFTER) ||
            (getRelationMappingTransitive(reachGraph[i][k]) === EventRelationType.AFTER && getRelationMappingTransitive(reachGraph[k][j]) === EventRelationType.EQUAL) ||
            (getRelationMappingTransitive(reachGraph[i][k]) === EventRelationType.EQUAL && getRelationMappingTransitive(reachGraph[k][j]) === EventRelationType.AFTER)) {
            return EventRelationType.AFTER;
        } else if((getRelationMappingTransitive(reachGraph[i][k]) === EventRelationType.BEFORE && getRelationMappingTransitive(reachGraph[k][j]) === EventRelationType.BEFORE) ||
            (getRelationMappingTransitive(reachGraph[i][k]) === EventRelationType.BEFORE && getRelationMappingTransitive(reachGraph[k][j]) === EventRelationType.EQUAL) ||
            (getRelationMappingTransitive(reachGraph[i][k]) === EventRelationType.EQUAL && getRelationMappingTransitive(reachGraph[k][j]) === EventRelationType.BEFORE)) {
            return EventRelationType.BEFORE;
        } else if(getRelationMappingTransitive(reachGraph[i][k]) === EventRelationType.EQUAL && getRelationMappingTransitive(reachGraph[k][j]) === EventRelationType.EQUAL) {
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
                graphMatrix[graphFirstId][graphSecondId] = EventRelationType.BEFORE;
                graphMatrix[graphSecondId][graphFirstId] = EventRelationType.AFTER;
                break;
            case EventRelationType.AFTER:
                console.log("user selected temporal relation AFTER for nodes: {" + firstId + ", " + secondId + "}");
                graphMatrix[graphFirstId][graphSecondId] = EventRelationType.AFTER;
                graphMatrix[graphSecondId][graphFirstId] = EventRelationType.BEFORE;
                break;
            case EventRelationType.EQUAL:
                console.log("user selected temporal relation EQUAL for nodes: {" + firstId + ", " + secondId + "}");
                graphMatrix[graphFirstId][graphSecondId] = EventRelationType.EQUAL;
                graphMatrix[graphSecondId][graphFirstId] = EventRelationType.EQUAL;
                break;
            case EventRelationType.VAGUE:
                console.log("user selected temporal relation VAGUE for nodes: {" + firstId + ", " + secondId + "}");
                graphMatrix[graphFirstId][graphSecondId] = EventRelationType.VAGUE;
                graphMatrix[graphSecondId][graphFirstId] = EventRelationType.VAGUE;
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
                // If i was able to get from i to second node after the change there is no path from i to the first node
                if (reachAndTransGraph[i][j] === EventRelationType.NA && reachAndTransGraph[j][i] === EventRelationType.NA && i !== j) {
                    // console.log("Adding candidate pair for unreached: {" + i + ", " + j + "}");
                    graphMatrix[i][j] = EventRelationType.CANDIDATE;
                    graphMatrix[j][i] = EventRelationType.CANDIDATE;
                    reachAndTransGraph[i][j] = EventRelationType.CANDIDATE;
                    reachAndTransGraph[j][i] = EventRelationType.CANDIDATE;
                } else if ((graphMatrix[i][j] === EventRelationType.CANDIDATE && graphMatrix[j][i] === EventRelationType.CANDIDATE) &&
                    (reachAndTransGraph[i][j] !== EventRelationType.NA && reachAndTransGraph[j][i] !== EventRelationType.CANDIDATE)) {
                    // console.log("Removing candidate pair that can be reached: {" + i + ", " + j + "}");
                    graphMatrix[i][j] = EventRelationType.NA;
                    graphMatrix[j][i] = EventRelationType.NA;
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
                graphMatrix[graphFirstId][graphSecondId] = EventRelationType.COREF;
                graphMatrix[graphSecondId][graphFirstId] = EventRelationType.COREF;
                break;
            case EventRelationType.NO_COREF:
                graphMatrix[graphFirstId][graphSecondId] = EventRelationType.NO_COREF;
                graphMatrix[graphSecondId][graphFirstId] = EventRelationType.NO_COREF;
                break;
            case EventRelationType.UNCERTAIN_COREF:
                graphMatrix[graphFirstId][graphSecondId] = EventRelationType.UNCERTAIN_COREF;
                graphMatrix[graphSecondId][graphFirstId] = EventRelationType.UNCERTAIN_COREF;
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
                    const isDirectEqual = getRelationMappingSeparateTransitive(reachGraph[i][j]) === EventRelationType.EQUAL;
                    const inferredTranRel = this.getInferredTransitiveRelationType(reachGraph, i, j, k);
                    if (inferredTranRel === EventRelationType.COREF && i !== j) {
                        if(emptyTransRel || reachGraph[i][j] === EventRelationType.EQUAL_TRANSITIVE) {
                            reachGraph[i][j] = EventRelationType.COREF_TRANSITIVE;
                            reachGraph[j][i] = EventRelationType.COREF_TRANSITIVE;
                        } else if (reachGraph[i][j] === EventRelationType.EQUAL_TRANSITIVE) {
                            reachGraph[i][j] = EventRelationType.COREF_TRANSITIVE;
                            reachGraph[j][i] = EventRelationType.COREF_TRANSITIVE;
                        } else if (reachGraph[i][j] === EventRelationType.EQUAL) {
                            reachGraph[i][j] = EventRelationType.COREF;
                            reachGraph[j][i] = EventRelationType.COREF;
                        } else if (!isDirectEqual && reachGraph[i][j] !== EventRelationType.COREF && reachGraph[i][j] !== EventRelationType.COREF_TRANSITIVE) {
                            discrepancies.push([axisGraph.getGraphIndices()[i], axisGraph.getGraphIndices()[j], reachGraph[i][j], inferredTranRel]);
                        }
                    } else if (inferredTranRel === EventRelationType.NO_COREF && i !== j) {
                        if(emptyTransRel || reachGraph[i][j] === EventRelationType.EQUAL_TRANSITIVE) {
                            reachGraph[i][j] = EventRelationType.NO_COREF_TRANSITIVE;
                            reachGraph[j][i] = EventRelationType.NO_COREF_TRANSITIVE;
                        } else if (!isDirectEqual && reachGraph[i][j] !== EventRelationType.NO_COREF && reachGraph[i][j] !== EventRelationType.UNCERTAIN_COREF &&
                            reachGraph[i][j] !== EventRelationType.NO_COREF_TRANSITIVE) {
                            discrepancies.push([axisGraph.getGraphIndices()[i], axisGraph.getGraphIndices()[j], reachGraph[i][j], inferredTranRel]);
                        }
                    }

                    // Check discrepancies for the other relations (this might create some dups but not a big deal as showing to user only one each time)
                    if (reachGraph[i][j] === EventRelationType.COREF && inferredTranRel === EventRelationType.NO_COREF && i !== j) {
                        // Check that the transitive closure was annotated as coref however the path indicate a contradicting relation of no coref
                        discrepancies.push([axisGraph.getGraphIndices()[i], axisGraph.getGraphIndices()[j], reachGraph[i][j], inferredTranRel]);
                    } else if ((reachGraph[i][j] === EventRelationType.NO_COREF || reachGraph[i][j] === EventRelationType.UNCERTAIN_COREF) &&
                        inferredTranRel === EventRelationType.COREF && i !== j) {
                        // Check that the transitive closure was annotated as coref however the path indicate a contradicting relation
                        discrepancies.push([axisGraph.getGraphIndices()[i], axisGraph.getGraphIndices()[j], reachGraph[i][j], inferredTranRel]);
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
                    const ikNoCoref = reachAndTransGraph[i][k] === EventRelationType.NO_COREF || reachAndTransGraph[i][k] === EventRelationType.NO_COREF_TRANSITIVE || reachAndTransGraph[i][k] === EventRelationType.UNCERTAIN_COREF;
                    const kjNoCoref = reachAndTransGraph[k][j] === EventRelationType.NO_COREF || reachAndTransGraph[k][j] === EventRelationType.NO_COREF_TRANSITIVE || reachAndTransGraph[k][j] === EventRelationType.UNCERTAIN_COREF;
                    const notDirectCoref = reachAndTransGraph[i][j] !== EventRelationType.COREF && reachAndTransGraph[i][j] !== EventRelationType.COREF_TRANSITIVE;
                    if (i !== j && (getRelationMappingSeparateTransitive(reachAndTransGraph[i][j]) === EventRelationType.EQUAL_TRANSITIVE ||
                        getRelationMappingSeparateTransitive(reachAndTransGraph[i][j]) === EventRelationType.NA) &&
                        ikNoCoref && kjNoCoref && notDirectCoref) {
                        // Adding the transitive before relation to check if its a cause or no cause (as it is undetermined)
                        // will trigger the logic to ask the user
                        reachAndTransGraph[i][j] = EventRelationType.EQUAL;
                        reachAndTransGraph[j][i] = EventRelationType.EQUAL;
                        graphMatrix[i][j] = EventRelationType.EQUAL;
                        graphMatrix[j][i] = EventRelationType.EQUAL;
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
            if (reachAndDiscrepancies[graphEventId][i] === EventRelationType.COREF || reachAndDiscrepancies[graphEventId][i] === EventRelationType.COREF_TRANSITIVE) {
                coreferringEvents.push(graphIndices[i]);
            }
        }

        return coreferringEvents;
    }

    getInferredTransitiveRelationType(reachAndTransGraph, i, j, k) {
        if ((reachAndTransGraph[i][k] === EventRelationType.COREF || reachAndTransGraph[i][k] === EventRelationType.COREF_TRANSITIVE) &&
            (reachAndTransGraph[k][j] === EventRelationType.NO_COREF || reachAndTransGraph[k][j] === EventRelationType.UNCERTAIN_COREF ||
                reachAndTransGraph[k][j] === EventRelationType.NO_COREF_TRANSITIVE)) {
            return EventRelationType.NO_COREF;
        } else if ((reachAndTransGraph[i][k] === EventRelationType.NO_COREF || reachAndTransGraph[i][k] === EventRelationType.UNCERTAIN_COREF ||
                reachAndTransGraph[i][k] === EventRelationType.NO_COREF_TRANSITIVE) &&
            (reachAndTransGraph[k][j] === EventRelationType.COREF || reachAndTransGraph[k][j] === EventRelationType.COREF_TRANSITIVE)) {
            return EventRelationType.NO_COREF;
        } else if (((reachAndTransGraph[i][k] === EventRelationType.COREF || reachAndTransGraph[i][k] === EventRelationType.COREF_TRANSITIVE) &&
            (reachAndTransGraph[k][j] === EventRelationType.COREF || reachAndTransGraph[k][j] === EventRelationType.COREF_TRANSITIVE))) {
            return EventRelationType.COREF;
        } else if ((reachAndTransGraph[i][k] === EventRelationType.NO_COREF || reachAndTransGraph[i][k] === EventRelationType.UNCERTAIN_COREF ||
                reachAndTransGraph[i][k] === EventRelationType.NO_COREF_TRANSITIVE) &&
            (reachAndTransGraph[k][j] === EventRelationType.NO_COREF || reachAndTransGraph[k][j] === EventRelationType.COREF_TRANSITIVE ||
                reachAndTransGraph[k][j] === EventRelationType.NO_COREF_TRANSITIVE)) {
            // This is NA because in this case we like to ask the user about i,j relation
            return EventRelationType.NA;
        } else {
            return super.getInferredTransitiveRelationType(reachAndTransGraph, i, j, k);
        }
    }

    getWithinCorefPairs(graphObj, allPairs) {
        let reachAndDiscrepancies = this.reachAndTransitiveClosureRel(graphObj)[0];
        const graphIndices = graphObj.getGraphIndices();
        let withinCorefPairs = new Set();
        for (let i = 0; i < allPairs.length; i++) {
            const secondId = graphIndices.indexOf(allPairs[i].getFirstId());
            for (let j = 0; j < allPairs.length; j++) {
                if (i !== j) {
                    const firstId = graphIndices.indexOf(allPairs[j].getFirstId());
                    if (reachAndDiscrepancies[firstId][secondId] === EventRelationType.COREF ||
                        reachAndDiscrepancies[firstId][secondId] === EventRelationType.COREF_TRANSITIVE) {
                        withinCorefPairs.add(i);
                        withinCorefPairs.add(j);
                    }
                }
            }
        }

        return withinCorefPairs;
    }
}

class CausalGraphHandler extends CorefGraphHandler {
    handleEdgeSelection(axisGraph, firstId, secondId, selectedRelation) {
        let graphMatrix = axisGraph.getGraphMatrix();
        const graphIndices = axisGraph.getGraphIndices();
        const graphFirstId = graphIndices.indexOf(firstId);
        const graphSecondId = graphIndices.indexOf(secondId);
        if (selectedRelation === EventRelationType.CAUSE) {
            graphMatrix[graphFirstId][graphSecondId] = EventRelationType.CAUSE;
            graphMatrix[graphSecondId][graphFirstId] = EventRelationType.EFFECT;
        } else if (selectedRelation === EventRelationType.NO_CAUSE) {
            graphMatrix[graphFirstId][graphSecondId] = EventRelationType.NO_CAUSE;
            graphMatrix[graphSecondId][graphFirstId] = EventRelationType.NO_EFFECT;
        } else if (selectedRelation === EventRelationType.UNCERTAIN_CAUSE) {
            graphMatrix[graphFirstId][graphSecondId] = EventRelationType.UNCERTAIN_CAUSE;
            graphMatrix[graphSecondId][graphFirstId] = EventRelationType.UNCERTAIN_EFFECT;
        } else if (selectedRelation === EventRelationType.EFFECT) {
            graphMatrix[graphFirstId][graphSecondId] = EventRelationType.EFFECT;
            graphMatrix[graphSecondId][graphFirstId] = EventRelationType.CAUSE;
        } else if (selectedRelation === EventRelationType.NO_EFFECT) {
            graphMatrix[graphFirstId][graphSecondId] = EventRelationType.NO_EFFECT;
            graphMatrix[graphSecondId][graphFirstId] = EventRelationType.NO_CAUSE;
        } else if (selectedRelation === EventRelationType.UNCERTAIN_EFFECT) {
            graphMatrix[graphFirstId][graphSecondId] = EventRelationType.UNCERTAIN_EFFECT;
            graphMatrix[graphSecondId][graphFirstId] = EventRelationType.UNCERTAIN_CAUSE;
        }

        let reachAndDiscrepancies = this.reachAndTransitiveClosureRel(axisGraph);
        this.fillMissingRelations(axisGraph, reachAndDiscrepancies[0]);
        console.log("Axis pairs AFTER selection (for pair-{" + firstId + ", " + secondId + "})");
        return reachAndDiscrepancies[1];
    }

    getAllCausalPairCandidates(axisGraph, eventId) {
        let reachAndDiscrepancies = this.reachAndTransitiveClosureRel(axisGraph)[0];
        const graphIndices = axisGraph.getGraphIndices();
        const graphEventId = graphIndices.indexOf(eventId);
        let beforePairs = [];
        for (let i = 0; i < reachAndDiscrepancies.length; i++) {
            if (getRelationMappingTransitive(reachAndDiscrepancies[graphEventId][i]) === EventRelationType.AFTER) {
                const eventPair = EventPair.initFromData("null", graphIndices[i], eventId);
                eventPair.setRelation(getOppositeRelation(getExportRelation(reachAndDiscrepancies[graphEventId][i])));
                beforePairs.push(eventPair);
            }
        }

        return beforePairs;
    }

    getWithinCausalPairs(axisGraph, beforePairs) {
        let reachAndDiscrepancies = this.reachAndTransitiveClosureRel(axisGraph)[0];
        const graphIndices = axisGraph.getGraphIndices();
        let withinCausalParis = new Set();
        for (let i = 0; i < beforePairs.length; i++) {
            const secondId = graphIndices.indexOf(beforePairs[i].getFirstId());
            for (let j = 0; j < beforePairs.length; j++) {
                if (i !== j) {
                    const firstId = graphIndices.indexOf(beforePairs[j].getFirstId());
                    if (reachAndDiscrepancies[firstId][secondId] === EventRelationType.CAUSE ||
                        reachAndDiscrepancies[firstId][secondId] === EventRelationType.CAUSE_TRANSITIVE) {
                        withinCausalParis.add(i);
                        withinCausalParis.add(j);
                    }
                }
            }
        }

        // for (let i = withinCausalParis.length - 1; i >= 0; i--) {
        //     beforePairs.splice(withinCausalParis[i], 1);
        // }

        return withinCausalParis;
    }

    reachAndTransitiveClosureRel(axisGraph) {
        let reachGraph = super.reachAndTransitiveClosureRel(axisGraph)[0];
        let discrepancies = [];
        const length = reachGraph.length;
        for (let k = 0; k < length; k++) {
            for (let i = 0; i < length; i++) {
                for (let j = 0; j < length; j++) {
                    const inferredTranRel = this.getInferredTransitiveRelationType(reachGraph, i, j, k);
                    const emptyTransRel = reachGraph[i][j] === EventRelationType.NA || reachGraph[i][j] === EventRelationType.CANDIDATE ||
                        reachGraph[i][j] === EventRelationType.BEFORE || reachGraph[i][j] === EventRelationType.BEFORE_TRANSITIVE;
                    // Check cases that the transitive closure should be also annotated (as before relation)
                    if (inferredTranRel === EventRelationType.CAUSE && i !== j) {
                        if (emptyTransRel) {
                            reachGraph[i][j] = EventRelationType.CAUSE_TRANSITIVE;
                            reachGraph[j][i] = EventRelationType.EFFECT_TRANSITIVE;
                        } else if(getRelationMappingTransitive(reachGraph[i][j]) !== EventRelationType.BEFORE) {
                            discrepancies.push([axisGraph.getGraphIndices()[i], axisGraph.getGraphIndices()[j], reachGraph[i][j], inferredTranRel]);
                        }
                    }

                    // Check discrepancies for the other relations (this might create some dups but not a big deal as showing to user only one each time)
                    if (i !== j && (reachGraph[i][j] === EventRelationType.NO_CAUSE || reachGraph[i][j] === EventRelationType.UNCERTAIN_CAUSE) &&
                        inferredTranRel === EventRelationType.CAUSE) {
                        // Check that the transitive closure was annotated as after however the path indicate a before/equal relation
                        discrepancies.push([axisGraph.getGraphIndices()[i], axisGraph.getGraphIndices()[j], reachGraph[i][j], inferredTranRel]);
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
                    const isDirectCauseAnnot = reachAndTransGraph[i][j] === EventRelationType.CAUSE || reachAndTransGraph[i][j] === EventRelationType.NO_CAUSE ||
                        reachAndTransGraph[i][j] === EventRelationType.UNCERTAIN_CAUSE;
                    const isIKAnnot = reachAndTransGraph[i][k] === EventRelationType.CAUSE || reachAndTransGraph[i][k] === EventRelationType.NO_CAUSE ||
                        reachAndTransGraph[i][k] === EventRelationType.UNCERTAIN_CAUSE;
                    const isKJAnnot = reachAndTransGraph[k][j] === EventRelationType.CAUSE || reachAndTransGraph[k][j] === EventRelationType.NO_CAUSE ||
                        reachAndTransGraph[k][j] === EventRelationType.UNCERTAIN_CAUSE
                    const isInferredCause = reachAndTransGraph[i][j] === EventRelationType.CAUSE_TRANSITIVE || this.getInferredTransitiveRelationType(reachAndTransGraph, i, j, k) === EventRelationType.CAUSE;
                    const isInferredBefore = this.getInferredTransitiveRelationType(reachAndTransGraph, i, j, k) === EventRelationType.BEFORE;
                    const isPathAnnotated = (isIKAnnot && isKJAnnot) ||
                        (isIKAnnot && getRelationMappingTransitive(reachAndTransGraph[k][j]) === EventRelationType.EQUAL ||
                            (isKJAnnot && getRelationMappingTransitive(reachAndTransGraph[i][k]) === EventRelationType.EQUAL));
                    if (i !== j && !isDirectCauseAnnot && !isInferredCause && isPathAnnotated && isInferredBefore) {
                        // Adding the transitive before relation to check if its a cause or no cause (as it is undetermined)
                        // will trigger the logic to ask the user
                        reachAndTransGraph[i][j] = EventRelationType.BEFORE;
                        reachAndTransGraph[j][i] = EventRelationType.AFTER;
                        graphMatrix[i][j] = EventRelationType.BEFORE;
                        graphMatrix[j][i] = EventRelationType.AFTER;
                    } else if (!isDirectCauseAnnot && isInferredCause && graphMatrix[i][j] === EventRelationType.BEFORE) {
                        graphMatrix[i][j] = EventRelationType.CAUSE;
                        graphMatrix[j][i] = EventRelationType.EFFECT;
                    }
                }
            }
        }
    }

    getInferredTransitiveRelationType(reachGraph, i, j, k) {
        if((reachGraph[i][k] === EventRelationType.CAUSE || reachGraph[i][k] === EventRelationType.CAUSE_TRANSITIVE) &&
            (reachGraph[k][j] === EventRelationType.CAUSE || reachGraph[k][j] === EventRelationType.CAUSE_TRANSITIVE)) {
            return EventRelationType.CAUSE;
        } else {
            return super.getInferredTransitiveRelationType(reachGraph, i, j, k);
        }
    }
}
