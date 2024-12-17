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
            if(jsonObject._axisGraph && jsonObject._axisGraph._graphMatrix) {
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

    // Method first check if the pair already exists (as it might be already annotated with relation)
    // This is directed, so only before without after
    fromGraphToPairs(formType) {
        let pairs = [];
        this._axisGraph.fillFormMissingRel();
        const eventIds = this._axisGraph.getGraphIndices();
        for(let i = 0; i < eventIds.length; i++) {
            for(let j = 0; j < eventIds.length; j++) {
                let eventPair = EventPair.initFromData(this.getAxisId(), eventIds[i], eventIds[j]);
                const pairRelation = this._axisGraph.getEdgeRelation(i, j);
                const pairIsManuallyAnnotated = this._axisGraph.getEdgeManuallyAnnotated(i, j);
                if(pairRelation === EventRelationType.CANDIDATE) {
                    pairs.push(eventPair);
                } else if(pairRelation === EventRelationType.BEFORE && pairIsManuallyAnnotated) {
                    eventPair.setRelation(EventRelationType.BEFORE);
                    pairs.push(eventPair);
                } else if(pairRelation === EventRelationType.EQUAL && (pairIsManuallyAnnotated || formType === FormType.COREF)) {
                    eventPair.setRelation(EventRelationType.EQUAL);
                    pairs.push(eventPair);
                } else if(pairRelation === EventRelationType.VAGUE && pairIsManuallyAnnotated) {
                    eventPair.setRelation(EventRelationType.VAGUE);
                    pairs.push(eventPair);
                } else if(pairRelation === EventRelationType.COREF && (pairIsManuallyAnnotated || formType === FormType.COREF || formType === FormType.CAUSAL)) {
                    eventPair.setRelation(EventRelationType.COREF);
                    pairs.push(eventPair);
                } else if(pairRelation === EventRelationType.CAUSE && (pairIsManuallyAnnotated || formType === FormType.CAUSAL)) {
                    eventPair.setRelation(EventRelationType.CAUSE);
                    pairs.push(eventPair);
                } else if(pairRelation === EventRelationType.NO_CAUSE && (pairIsManuallyAnnotated || formType === FormType.CAUSAL)) {
                    eventPair.setRelation(EventRelationType.NO_CAUSE);
                    pairs.push(eventPair);
                } else if(pairRelation === EventRelationType.UNCERTAIN_CAUSE && (pairIsManuallyAnnotated || formType === FormType.CAUSAL)) {
                    eventPair.setRelation(EventRelationType.UNCERTAIN_CAUSE);
                    pairs.push(eventPair);
                } else if(pairRelation === EventRelationType.NO_COREF && (pairIsManuallyAnnotated || formType === FormType.COREF || formType === FormType.CAUSAL)) {
                    eventPair.setRelation(EventRelationType.NO_COREF);
                    pairs.push(eventPair);
                } else if(pairRelation === EventRelationType.UNCERTAIN_COREF && (pairIsManuallyAnnotated || formType === FormType.COREF)) {
                    eventPair.setRelation(EventRelationType.UNCERTAIN_COREF);
                    pairs.push(eventPair);
                }
            }
        }

        return pairs;
    }
}
