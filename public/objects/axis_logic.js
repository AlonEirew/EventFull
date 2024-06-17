class Axis {
    constructor() {
        this._axisId = crypto.randomUUID();
        this._axisType = AxisType.NA;
        this._eventIds = new Set();
        this._axisGraph = new GraphObj();
        this._anchoringEventId = -1; // only for intent events
    }

    static fromJsonObject(jsonObject) {
        if(jsonObject != null) {
            const axis = new Axis();
            axis._axisId = jsonObject._axisId;
            axis._axisType = jsonObject._axisType;
            axis._anchoringEventId = jsonObject._anchoringEventId;
            axis._eventIds = new Set(jsonObject._eventIds);
            if(jsonObject._axisGraph) {
                axis._axisGraph = GraphObj.fromJsonObject(jsonObject._axisGraph);
            } else if ('_pairs' in jsonObject) {
                axis._axisGraph.initGraph(Array.from(axis._eventIds));
                let discrepancies = [];
                for(let i = 0; i < jsonObject._pairs.length; i++) {
                    const pair = EventPair.fromJsonObject(jsonObject._pairs[i]);
                    let formType = getRelType(pair.getRelation());
                    const desc = axis._axisGraph.handleFormRelations(pair.getFirstId(), pair.getSecondId(), pair.getRelation(), formType);
                    if (desc.length > 0) {
                        discrepancies.push(desc);
                    }
                }

                console.log(discrepancies);
            }

            return axis;
        }

        return null;
    }

    getAxisGraph() {
        return this._axisGraph;
    }

    handleFormRelations(firstId, secondId, combSelect, formType) {
        return this._axisGraph.handleFormRelations(firstId, secondId, combSelect, formType);
    }

    removeEvent(event) {
        if (this._anchoringEventId === event.getId()) {
            this._anchoringEventId._anchoringEventId = -1;
        }

        if (this._eventIds.has(event.getId())) {
            this._eventIds.delete(event.getId());
            return true;
        }

        return false;
    }

    getAxisId() {
        return this._axisId;
    }

    getEventIds() {
        return this._eventIds;
    }

    getAxisType() {
        return this._axisType;
    }

    getAnchorEventId() {
        return this._anchoringEventId;
    }

    // Method first check if the pair already exists (as it might be already annotated with relation)
    // This is directed, so only before without after
    fromGraphToPairs(formType) {
        let pairs = [];
        this._axisGraph.fillFormMissingRel(formType);
        let graphMatrix = this._axisGraph.getGraphMatrix();
        const eventIds = this._axisGraph.getGraphIndices();
        for(let i = 0; i < graphMatrix.length; i++) {
            for(let j = 0; j < graphMatrix[i].length; j++) {
                let eventPair = EventPair.initFromData(this.getAxisId(), eventIds[i], eventIds[j]);
                if(graphMatrix[i][j] === EventRelationType.CANDIDATE) {
                    pairs.push(eventPair);
                } else if(graphMatrix[i][j] === EventRelationType.BEFORE) {
                    eventPair.setRelation(EventRelationType.BEFORE);
                    pairs.push(eventPair);
                } else if (graphMatrix[i][j] === EventRelationType.CONTAINS) {
                    eventPair.setRelation(EventRelationType.CONTAINS);
                    pairs.push(eventPair);
                } else if(graphMatrix[i][j] === EventRelationType.EQUAL) {
                    eventPair.setRelation(EventRelationType.EQUAL);
                    pairs.push(eventPair);
                } else if(graphMatrix[i][j] === EventRelationType.VAGUE) {
                    eventPair.setRelation(EventRelationType.VAGUE);
                    pairs.push(eventPair);
                } else if(graphMatrix[i][j] === EventRelationType.COREF) {
                    eventPair.setRelation(EventRelationType.COREF);
                    pairs.push(eventPair);
                } else if(graphMatrix[i][j] === EventRelationType.CAUSE) {
                    eventPair.setRelation(EventRelationType.CAUSE);
                    pairs.push(eventPair);
                } else if(graphMatrix[i][j] === EventRelationType.NO_CAUSE) {
                    eventPair.setRelation(EventRelationType.NO_CAUSE);
                    pairs.push(eventPair);
                } else if(graphMatrix[i][j] === EventRelationType.UNCERTAIN_CAUSE) {
                    eventPair.setRelation(EventRelationType.UNCERTAIN_CAUSE);
                    pairs.push(eventPair);
                } else if(graphMatrix[i][j] === EventRelationType.NO_COREF) {
                    eventPair.setRelation(EventRelationType.NO_COREF);
                    pairs.push(eventPair);
                } else if(graphMatrix[i][j] === EventRelationType.UNCERTAIN_COREF) {
                    eventPair.setRelation(EventRelationType.UNCERTAIN_COREF);
                    pairs.push(eventPair);
                } else if(graphMatrix[i][j] === EventRelationType.SUB_EVENT) {
                    eventPair.setRelation(EventRelationType.SUB_EVENT);
                    pairs.push(eventPair);
                } else if(graphMatrix[i][j] === EventRelationType.NO_SUB_EVENT) {
                    eventPair.setRelation(EventRelationType.NO_SUB_EVENT);
                    pairs.push(eventPair);
                }
            }
        }

        return pairs;
    }
}
