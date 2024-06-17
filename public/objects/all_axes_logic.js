class AllAxes {
    constructor(jsonObj) {
        this.#initAxes();
        this.initTextAndEvents(jsonObj);
    }

    #initAxes() {
        this.main_doc = null;
        this.sources = null;
        this.clusters = null;

        this._mainAxis = new Axis();
        this._mainAxis._axisType = AxisType.MAIN;
        this._hypotheticalAxis = new Axis();
        this._hypotheticalAxis._axisType = AxisType.HYPOTHETICAL;
        this._intentAxis = [];
        this._tempAnnotationMade = 0;
        this._causeAnnotationMade = 0;
        this._corefAnnotationMade = 0;
        this._subeventAnnotationMade = 0;
    }

    static convertSelectionFromOption(value) {
        if (value === options[0]) {
            return AxisType.MAIN;
        } else if (value === options[1]) {
            return AxisType.INTENT;
        } else if (value === options[2]) {
            return AxisType.HYPOTHETICAL;
        } else if (value === options[3]) {
            return AxisType.NEGATION;
        } else if (value === options[4]) {
            return AxisType.ABSTRACT;
        } else if (value === options[5]) {
            return AxisType.STATIC;
        } else if (value === options[6]) {
            return AxisType.RECURRENT;
        } else if (value === options[7]) {
            return AxisType.NOT_EVENT;
        } else {
            throw new Error('Invalid axis type');
        }
    }

    static fromJsonObject(jsonObject) {
        const allAxes = new AllAxes(jsonObject);

        if('_tempAnnotationMade' in jsonObject) allAxes._tempAnnotationMade = jsonObject._tempAnnotationMade;
        if('_corefAnnotationMade' in jsonObject) allAxes._corefAnnotationMade = jsonObject._corefAnnotationMade;
        if('_causeAnnotationMade' in jsonObject) allAxes._causeAnnotationMade = jsonObject._causeAnnotationMade;
        if('_subeventAnnotationMade' in jsonObject) allAxes._subeventAnnotationMade = jsonObject._subeventAnnotationMade;

        if(jsonObject['_mainAxis'] != null) {
            allAxes.setMainAxis(Axis.fromJsonObject(jsonObject['_mainAxis']));
        }

        if(jsonObject['_hypotheticalAxis'] != null) {
            allAxes.setHypotheticalAxis(Axis.fromJsonObject(jsonObject['_hypotheticalAxis']));
        }

        if(jsonObject['_intentAxis'] != null && jsonObject['_intentAxis'].length > 0) {
            allAxes.resetIntentAxes();
            const intentAxes = jsonObject['_intentAxis'];
            for(let i = 0; i < intentAxes.length; i++) {
                allAxes.addAxisToIntentAxes(Axis.fromJsonObject(intentAxes[i]));
            }
        }

        return allAxes;
    }

    createExport() {
        const tokens = this.main_doc.tokens;
        const allMentions = this.main_doc.mentions;
        const allPairs = this.getAllAxesPairs();
        // Clean pairID and axisID
        for (let i = 0; i < allPairs.length; i++) {
            allPairs[i]._pairId = null;
            allPairs[i]._axisId = null;
        }

        return {
            'tokens': tokens,
            'allMentions': allMentions,
            'allPairs': allPairs,
            '_tempAnnotationMade': this._tempAnnotationMade,
            '_corefAnnotationMade': this._corefAnnotationMade,
            '_causeAnnotationMade': this._causeAnnotationMade,
        };
    }

    setMainAxis(mainAxis) {
        this._mainAxis = mainAxis;
    }

    getMainAxis() {
        return this._mainAxis;
    }

    setHypotheticalAxis(hypotheticalAxis) {
        this._hypotheticalAxis = hypotheticalAxis;
    }

    resetIntentAxes() {
        this._intentAxis = [];
    }

    addAxisToIntentAxes(intentAxis) {
        if(this._intentAxis === null) {
            this._intentAxis = [];
        }

        this._intentAxis.push(intentAxis);
    }

    initTextAndEvents(jsonObject) {
        if(jsonObject != null) {
            this.main_doc = DocObject.fromJsonObject(jsonObject['main_doc']);
            // This is only for the projection use-case
            if('sources' in jsonObject) this.sources = jsonObject['sources'];
            if('clusters' in jsonObject) {
                this.clusters = jsonObject['clusters'];
                this.clusters.forEach(cluster => {
                    cluster['main_mention']['m_id'] = cluster['main_mention']['m_id'].toString();
                });
            }

            this.addEventsToAxes(this.main_doc.mentions);
        }
    }

    getSources() {
        return this.sources;
    }

    getClusters() {
        return this.clusters;
    }

    getSourceTextWithMentPair(mentPair) {
        let sourcesWithBothEvents = [];
        let firstEvent = this.getEventByEventId(mentPair.getFirstId());
        let secondEvent = this.getEventByEventId(mentPair.getSecondId());
        let firstCluster = this.clusters.find(cluster => cluster['main_mention']['m_id'] === firstEvent.getId());
        let secondCluster = this.clusters.find(cluster => cluster['main_mention']['m_id'] === secondEvent.getId());
        if (this.sources != null) {
            for (let i = 0; i < this.sources.length; i++) {
                // Find events in source
                const found1 = this.sources[i]['mentions'].filter(mention => firstCluster['src_mentions'].some(obj => obj['m_id'] === mention['m_id'])
                    && 'corefState' in mention && mention['corefState'] === CorefState.COREF);
                // const found1 = this.sources[i]['mentions'].find(mention => mention['m_id'] === firstEvent.getId());
                const found2 = this.sources[i]['mentions'].filter(mention => secondCluster['src_mentions'].some(obj => obj['m_id'] === mention['m_id'])
                    && 'corefState' in mention && mention['corefState'] === CorefState.COREF);
                if (found1.length > 0 || found2.length > 0) {
                    let newSource = {
                        'doc_id': this.sources[i]['doc_id'],
                        'tokens': this.sources[i]['tokens'],
                        'firstMentions': found1,
                        'secondMentions': found2
                    };
                    sourcesWithBothEvents.push(newSource);
                }
            }
        }

        return sourcesWithBothEvents;
    }

    getMainDocTokens() {
        return this.main_doc['tokens'];
    }

    getAllTimeExpressions() {
        const timeExpr = this.main_doc['time_exprs'];
        let timeExprIndexs = [];
        for (let i = 0; i < timeExpr.length; i++) {
            timeExprIndexs.push(timeExpr[i].indices);
        }

        return [...new Set(flatten(timeExprIndexs))];
    }

    getEventByEventId(eventId) {
        const allAxesEvents = this.main_doc.mentions
        for (let i = 0; i < allAxesEvents.length; i++) {
            if (allAxesEvents[i].getId() === eventId) {
                return allAxesEvents[i];
            }
        }

        return null;
    }

    getAllRelAxes() {
        let allAxes = [];
        if (config.app.considerAxisAtAnnotation.includes(AxisType.MAIN)) {
            allAxes.push(this._mainAxis);
        }

        if (config.app.considerAxisAtAnnotation.includes(AxisType.HYPOTHETICAL)) {
            allAxes.push(this._hypotheticalAxis);
        }

        if (config.app.considerAxisAtAnnotation.includes(AxisType.INTENT)) {
            allAxes.push.apply(allAxes, this._intentAxis);
        }

        return allAxes;
    }

    getAllAxesPairsFlat(formType) {
        const allAxes = this.getAllRelAxes();
        let allPairsFlat = [];
        for (let i = 0; i < allAxes.length; i++) {
            const axisPairs = allAxes[i].fromGraphToPairs(formType);
            for(let j = 0; j < axisPairs.length; j++) {
                const pairToAdd = axisPairs[j];
                if(!AllAxes.isDuplicatePair(pairToAdd, allPairsFlat)) {
                    allPairsFlat.push(pairToAdd);
                }
            }

            console.log("Initialized pairs for Axis = " + allAxes[i].getAxisType());
            console.log("Axis = " + allAxes[i].getAxisType() + " reach and transitive closure graph:");
            console.log(allAxes[i].getAxisGraph().printGraph());
        }

        return allPairsFlat;
    }

    getAllAxesPairs() {
        // TBD - add the rest of the axis pairs
        let allPairs = [];
        allPairs.push.apply(allPairs, this._mainAxis.getAxisGraph().exportAllReachAndTransGraphPairs(this._mainAxis.getAxisId()));
        allPairs.push.apply(allPairs, this._hypotheticalAxis.getAxisGraph().exportAllReachAndTransGraphPairs(this._hypotheticalAxis.getAxisId()));
        for (let i = 0; i < this._intentAxis.length; i++) {
            allPairs.push.apply(allPairs, this._intentAxis[i].getAxisGraph().exportAllReachAndTransGraphPairs(this._intentAxis[i].getAxisId()));
        }

        return allPairs;
    }

    getAllAxesEventsSorted() {
        const sortedEvents = this.main_doc.mentions;
        let mentSorted = sortedEvents.sort((a, b) => a.tokens_ids[0] - b.tokens_ids[0]);
        for (let idx = 0; idx < mentSorted.length; idx++) {
            mentSorted[idx].setEventIndex(idx);
        }

        return mentSorted;
    }

    getAllRelEvents() {
        const allEvents = this.main_doc.mentions;
        let finalEvents = [];
        const relAxis = this.getAllRelAxes();
        for (let i = 0; i < allEvents.length; i++) {
            for (let j = 0; j < relAxis.length; j++) {
                if (relAxis[j].getEventIds().has(allEvents[i].getId())) {
                    finalEvents.push(allEvents[i]);
                    break;
                }
            }
        }

        return finalEvents;
    }

    static sortEventsByIndex(mentions) {
        return mentions.sort(function(a, b) {return a.getEventIndex() - b.getEventIndex();});
    }

    getAxisById(id) {
        if (this._mainAxis.getAxisId() === id) {
            return this._mainAxis;
        } else if (this._hypotheticalAxis.getAxisId() === id) {
            return this._hypotheticalAxis;
        } else {
            for (let i = 0; i < this._intentAxis.length; i++) {
                if (this._intentAxis[i].getAxisId() === id) {
                    return this._intentAxis[i];
                }
            }
        }

        return null;
    }

    static isDuplicatePair(pairToAdd, allPairs) {
        for(let k = 0; k < allPairs.length; k++) {
            if(pairToAdd.getFirstId() === allPairs[k].getSecondId() &&
                pairToAdd.getSecondId() === allPairs[k].getFirstId() &&
                pairToAdd.getRelation() === allPairs[k].getRelation()) {
                return true;
            }
        }

        return false;
    }

    removeEventFromAxes(event) {
        const allAxes = this.getAllRelAxes();
        for (let i = 0; i < allAxes.length; i++) {
            if(allAxes[i].removeEvent(event)) {
                return true;
            }
        }

        return false;
    }

    removeIntentEventFromIntentAxes(event, rootEventId) {
        if(event.getAxisType() === AxisType.INTENT) {
            for(let i = this._intentAxis.length - 1; i >= 0; i--) {
                if (this._intentAxis[i].getAnchorEventId() === rootEventId) {
                    if (this._intentAxis[i].removeEvent(event)) {
                        if (this._intentAxis[i].getEventIds().size === 0) {
                            this._intentAxis.splice(i, 1);
                        }

                        return true;
                    }
                }
            }
        }

        return false;
    }

    addEventsToAxes(eventsToAdd) {
        for (let i = 0; i < eventsToAdd.length; i++) {
            this.addEventToAxes(eventsToAdd[i]);
        }
    }

    addEventToAxes(eventToAdd) {
        switch (eventToAdd.getAxisType()) {
            case AxisType.MAIN:
                this._mainAxis.getEventIds().add(eventToAdd.getId());
                break;
            case AxisType.HYPOTHETICAL:
                this._hypotheticalAxis.getEventIds().add(eventToAdd.getId());
                break;
            case AxisType.INTENT:
                this.addEventToIntentAxis(eventToAdd);
                break;
        }
    }

    addEventToIntentAxis(event) {
        for (let i = 0; i < this._intentAxis.length; i++) {
            if (this._intentAxis[i].getAnchorEventId() === event.getRootAxisEventId()) {
                this._intentAxis[i].getEventIds().add(event.getId());

                if (event.getRootAxisEventId() !== -1) {
                    this._intentAxis[i].getEventIds().add(event.getRootAxisEventId());
                }
                return;
            }
        }

        const axis = new Axis();
        axis._anchoringEventId = event.getRootAxisEventId();
        axis._eventIds.add(event.getId());

        if(event.getRootAxisEventId() !== -1) {
            axis._eventIds.add(event.getRootAxisEventId());
        }

        axis._axisType = AxisType.INTENT;
        this._intentAxis.push(axis);
    }

    getEventAxisId(event) {
        if(event.getAxisType() === AxisType.MAIN) {
            return this._mainAxis.getAxisId();
        } else if(event.getAxisType() === AxisType.HYPOTHETICAL) {
            return this._hypotheticalAxis.getAxisId();
        } else if(event.getAxisType() === AxisType.INTENT) {
            for(let i = 0; i < this._intentAxis.length; i++) {
                if(this._intentAxis[i].getAnchorEventId() === event.getRootAxisEventId()) {
                    return this._intentAxis[i].getAxisId();
                }
            }
        }

        return null;
    }

    // check if events can be paired
    isValidPair(event1, event2) {
        if(event1.getAxisType() === event2.getAxisType()) {
            if (event1.getAxisType() === AxisType.INTENT) {
                return event1.getRootAxisEventId() === event2.getRootAxisEventId();
            } else {
                return true;
            }
        } else {
            if (event1.getAxisType() === AxisType.INTENT && event2.getAxisType() === AxisType.MAIN) {
                return event1.getRootAxisEventId() === event2.getId();
            } else if (event2.getAxisType() === AxisType.INTENT && event1.getAxisType() === AxisType.MAIN) {
                return event2.getRootAxisEventId() === event1.getId();
            } else {
                return false;
            }
        }
    }
}
