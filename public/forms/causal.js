// ####################################################
// ############## causal functions ##############
// ####################################################

class CausalForm extends OneToManyForm {

    constructor(pageIndex, allAxes) {
        if (allAxes != null) {
            super(pageIndex, allAxes, [], FormType.CAUSAL, true, false);
        }
    }

    getInstructions() {
        return config.instFiles.causal;
    }

    loadForm() {
        if (this._annotations !== null && this._annotations.length > 0) {
            this._annotations = [];
            this._annotationIndex = 0;
        }

        const allRelEvents = this._allAxes.getAllRelEvents();
        for (let i = 0; i < allRelEvents.length; i++) {
            const allCorefEventIds = this.getAllCorefEvents(allRelEvents[i].getId()).map(event => event.getId());
            const allBeforePairs = this.getAllRelevantRelations(allRelEvents[i].getId());
            if (allBeforePairs.length > 0) {
                if (!this._annotations.some(event => allCorefEventIds.includes(event.getId()))) {
                    this._annotations.push(allRelEvents[i]);
                }
            }
        }

        super.loadForm();
    }

    handleEventSelection(currentFocusEvent, checkedItems, uncheckedItems) {
        let discrepancies = [];

        const allFocusedCoreferringEvents = this.getAllCorefEvents(currentFocusEvent).map(event => event.getId());
        allFocusedCoreferringEvents.push(currentFocusEvent);

        for (let i = 0; i < checkedItems.length; i++) {
            const axis = this._allAxes.getAxisById(this._allAxes.getEventAxisId(this._allAxes.getEventByEventId(checkedItems[i])));
            let allCheckedCoreferringEvents = this.getAllCorefEvents(checkedItems[i]).map(event => event.getId());
            allCheckedCoreferringEvents.push(checkedItems[i]);
            for (let j = 0; j < allFocusedCoreferringEvents.length; j++) {
                for (let k = 0; k < allCheckedCoreferringEvents.length; k++) {
                    discrepancies = discrepancies.concat(axis.handleFormRelations(allCheckedCoreferringEvents[k], allFocusedCoreferringEvents[j], this.getPosFormRel(), this.formType));
                }
            }
        }

        for (let i = 0; i < uncheckedItems.length; i++) {
            const axis = this._allAxes.getAxisById(this._allAxes.getEventAxisId(this._allAxes.getEventByEventId(uncheckedItems[i])));
            let allUnCheckedCoreferringEvents = this.getAllCorefEvents(uncheckedItems[i]).map(event => event.getId());
            allUnCheckedCoreferringEvents.push(uncheckedItems[i]);
            for (let j = 0; j < allFocusedCoreferringEvents.length; j++) {
                for (let k = 0; k < allUnCheckedCoreferringEvents.length; k++) {
                    discrepancies = discrepancies.concat(axis.handleFormRelations(allUnCheckedCoreferringEvents[k], allFocusedCoreferringEvents[j], this.getNegFormRel(), this.formType));
                }
            }
        }

        return discrepancies;
    }

    getPosFormRel() {
        return EventRelationType.CAUSE;
    }

    getNegFormRel() {
        return EventRelationType.NO_CAUSE;
    }

    getQuestionText(eventInFocus) {
        return "Why <span style=\"color:#28A745\">" + eventInFocus.getTokensWithEventId() + "</span> had (have/will) happened?";
    }

    getDropDownTitle() {
        return "Because of:";
    }

    getNextUnhandledAnnotation() {
        for (let i = 0; i < this._annotations.length; i++) {
            const allRelevantRelations = this.getAllRelevantRelations(this._annotations[i].getId());
            for (let j = 0; j < allRelevantRelations.length; j++) {
                if(allRelevantRelations[j].getRelation() !== EventRelationType.CAUSE && allRelevantRelations[j].getRelation() !== EventRelationType.NO_CAUSE) {
                    this._annotationIndex = i;
                    return true;
                }
            }
        }

        this._annotationIndex = this._annotations.length - 1;
        return false;
    }

    getAllRelevantRelations(eventId) {
        const allRelAxes = this._allAxes.getAllRelAxes();
        let allBeforePairs = [];
        let allCorefEvents = [];
        for (let i = 0; i < allRelAxes.length; i++) {
            const causalCandidatesBeforeRel = allRelAxes[i].getAxisGraph().getCausalCandidatesBeforePairs(eventId);
            for (let j = 0; j < causalCandidatesBeforeRel.length; j++) {
                allCorefEvents = this.getAllCorefEvents(causalCandidatesBeforeRel[j].getFirstId()).map(event => event.getId());
                if (!allBeforePairs.some(pair => allCorefEvents.includes(pair.getFirstId()))) {
                    allBeforePairs.push(causalCandidatesBeforeRel[j]);
                }
            }
        }

        return allBeforePairs;
    }

    annotationRemainder() {
        for (let i = 0; i < this._annotations.length; i++) {
            const allRelevantRelations = this.getAllRelevantRelations(this._annotations[i].getId());
            for (let j = 0; j < allRelevantRelations.length; j++) {
                if(allRelevantRelations[j].getRelation() !== EventRelationType.CAUSE && allRelevantRelations[j].getRelation() !== EventRelationType.NO_CAUSE) {
                    return this._annotations.length - (i - 1);
                }
            }
        }
        
        return 0;
    }

    graphPairRelationStyle(relationType) {
        switch (relationType) {
            case EventRelationType.VAGUE:
                return {
                    selector: '.uncertain',
                    style: {
                        'line-style': 'dashed',
                        'target-arrow-shape': 'none',
                        'source-arrow-shape': 'none',
                        'opacity': 0,
                    }
                };
            case EventRelationType.EQUAL:
            case EventRelationType.COREF:
            case EventRelationType.NO_COREF:
            case EventRelationType.UNCERTAIN_COREF:
                return {
                    selector: '.equal',
                    style: {
                        'line-style': 'dotted',
                        'target-arrow-shape': 'none',
                        'source-arrow-shape': 'none',
                        'opacity': 0.2,
                    }
                };
            case EventRelationType.BEFORE:
                return {
                    selector: '.before',
                    style: {
                        'line-style': 'solid',
                        'target-arrow-color': '#808080',
                        'target-arrow-shape': 'triangle-tee',
                        'source-arrow-shape': 'none',
                        'opacity': 0,
                    }
                };
            case EventRelationType.CAUSE:
                return {
                    selector: '.causal',
                    style: {
                        'line-style': 'solid',
                        'target-arrow-color': '#808080',
                        'target-arrow-shape': 'triangle-tee',
                        'source-arrow-shape': 'none',
                    }
                };
            case EventRelationType.NO_CAUSE:
            case EventRelationType.UNCERTAIN_CAUSE:
                return {
                    selector: '.no_causal',
                    style: {
                        'line-style': 'solid',
                        'target-arrow-color': '#808080',
                        'target-arrow-shape': 'triangle-tee',
                        'source-arrow-shape': 'none',
                        'opacity': 0,
                    }
                };
            default:
                throw new Error("Unknown relation type: " + relationType);
        }
    }
}