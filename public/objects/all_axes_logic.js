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
        this._tempAnnotationMade = 0;
        this._causeAnnotationMade = 0;
        this._corefAnnotationMade = 0;
        this._subeventAnnotationMade = 0;
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

        return allAxes;
    }

    createExport() {
        const tokens = this.main_doc.tokens;
        const allMentions = this.main_doc.mentions;
        const allPairs = this.getAxesPairs();
        const allClusters = this.getExportClusters();
        // Clean pairID and axisID
        for (let i = 0; i < allPairs.length; i++) {
            allPairs[i]._pairId = null;
            allPairs[i]._axisId = null;
        }

        return {
            'tokens': tokens,
            'allMentions': allMentions,
            'allPairs': allPairs,
            'corefClusters': allClusters,
            '_tempAnnotationMade': this._tempAnnotationMade,
            '_corefAnnotationMade': this._corefAnnotationMade,
            '_causeAnnotationMade': this._causeAnnotationMade,
        };
    }

    setMainAxis(mainAxis) {
        this._mainAxis = mainAxis;
    }

    initTextAndEvents(jsonObject) {
        if(jsonObject != null) {
            this.main_doc = DocObject.fromJsonObject(jsonObject['main_doc']);
            this.addEventsToAxes(this.main_doc.mentions);
        }
    }

    getExportClusters() {
        let allUniqueClusters = new Set();
        let allClusters = [];
        this.getAllRelEvents().forEach(mention => {
            const mentCluster = new ExportCluster(this._mainAxis.getAxisGraph().getAllCoreferringEvents(mention.getId()));
            mentCluster.addEventToCluster(mention);
            if (!allUniqueClusters.has(mentCluster.getClusterId())) {
                allUniqueClusters.add(mentCluster.getClusterId());
                if (mentCluster.getCluster().length > 1) {
                    allClusters.push(mentCluster);
                }
            }
        });

        return allClusters;
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

    getMainAxis() {
        return this._mainAxis;
    }

    getAxisPairsFlat(formType) {
        const axisPairs = this._mainAxis.fromGraphToPairs(formType);
        let allPairsFlat = [];
        for(let j = 0; j < axisPairs.length; j++) {
            const pairToAdd = axisPairs[j];
            if(!AllAxes.isDuplicatePair(pairToAdd, allPairsFlat)) {
                allPairsFlat.push(pairToAdd);
            }
        }

        console.log("Initialized pairs for Axis = " + this._mainAxis.getAxisType());
        console.log("Axis = " + this._mainAxis.getAxisType() + " reach and transitive closure graph:");
        console.log(this._mainAxis.getAxisGraph().printGraph());

        return allPairsFlat;
    }

    getAxesPairs() {
        let allPairs = [];
        allPairs.push.apply(allPairs, this._mainAxis.getAxisGraph().exportAllReachAndTransGraphPairs(this._mainAxis.getAxisId()));
        return allPairs;
    }

    getEventsSorted() {
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
        const mainAxis = this.getMainAxis();
        for (let i = 0; i < allEvents.length; i++) {
            if (mainAxis.getEventIds().has(allEvents[i].getId())) {
                finalEvents.push(allEvents[i]);
                break;
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
        const mainAxis = this.getMainAxis();
        return mainAxis.removeEvent(event);
    }

    addEventsToAxes(eventsToAdd) {
        for (let i = 0; i < eventsToAdd.length; i++) {
            this.addEventToAxes(eventsToAdd[i]);
        }
    }

    addEventToAxes(eventToAdd) {
        if (eventToAdd.getAxisType() === AxisType.MAIN) {
            this._mainAxis.getEventIds().add(eventToAdd.getId());
        }
    }

    getEventAxisId(event) {
        if(event.getAxisType() === AxisType.MAIN) {
            return this._mainAxis.getAxisId();
        }

        return null;
    }

    // check if events can be paired
    isValidPair(event1, event2) {
        if(event1.getAxisType() === event2.getAxisType()) {
            return true;
        }
    }
}
