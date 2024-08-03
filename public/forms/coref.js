// ####################################################
// ############## coreference functions ##############
// ####################################################

class CorefForm extends OneToManyForm {

    constructor(pageIndex, allAxes) {
        super(pageIndex, allAxes, [], FormType.COREF, true, true);
    }

    getInstructions() {
        return config.instFiles.coref;
    }

    loadForm() {
        if (this._annotations !== null && this._annotations.length > 0) {
            this._annotations = [];
            this._annotationIndex = 0;
        }

        const allRelEvents = this._allAxes.getAllRelEvents();
        for (let i = 0; i < allRelEvents.length; i++) {
            const allEqualEventIds = this.getAllRelevantRelations(allRelEvents[i].getId());
            if (allEqualEventIds.length > 0) {
                this._annotations.push(allRelEvents[i]);
            }
        }

        super.loadForm();
    }

    handleEventSelection(currentFocusEvent, checkedItems, uncheckedItems) {
        let discrepancies = [];

        // Handle focused with all in list
        for (let i = 0; i < checkedItems.length; i++) {
            const axis = this._allAxes.getAxisById(this._allAxes.getEventAxisId(this._allAxes.getEventByEventId(checkedItems[i])));
            discrepancies = discrepancies.concat(axis.handleFormRelations(currentFocusEvent, checkedItems[i], this.getPosFormRel(), this.formType));
        }

        // Handle all in list that coref with focused (should coref to eachother)
        for (let i = 0; i < checkedItems.length; i++) {
            for (let j = i + 1; j < checkedItems.length; j++) {
                const axis1 = this._allAxes.getAxisById(this._allAxes.getEventAxisId(this._allAxes.getEventByEventId(checkedItems[i])));
                discrepancies = discrepancies.concat(axis1.handleFormRelations(checkedItems[i], checkedItems[j], this.getPosFormRel(), this.formType));
            }
        }

        // Handle focused with all unchecked items
        for (let i = 0; i < uncheckedItems.length; i++) {
            const axis = this._allAxes.getAxisById(this._allAxes.getEventAxisId(this._allAxes.getEventByEventId(uncheckedItems[i])));
            discrepancies = discrepancies.concat(axis.handleFormRelations(currentFocusEvent, uncheckedItems[i], this.getNegFormRel(), this.formType));
        }

        // Handle all unchecked/checked items (should not coref to each-other)
        for (let i = 0; i < uncheckedItems.length; i++) {
            for (let j = 0; j < checkedItems.length; j++) {
                const axis1 = this._allAxes.getAxisById(this._allAxes.getEventAxisId(this._allAxes.getEventByEventId(uncheckedItems[i])));
                discrepancies = discrepancies.concat(axis1.handleFormRelations(uncheckedItems[i], checkedItems[j], this.getNegFormRel(), this.formType));
            }
        }

        return discrepancies;
    }

    getNextUnhandledAnnotation() {
        for (let i = 0; i < this._annotations.length; i++) {
            const allRelevantRelations = this.getAllRelevantRelations(this._annotations[i].getId());
            for (let j = 0; j < allRelevantRelations.length; j++) {
                if(allRelevantRelations[j].getRelation() !== EventRelationType.COREF && allRelevantRelations[j].getRelation() !== EventRelationType.NO_COREF) {
                    this._annotationIndex = i;
                    return true;
                }
            }
        }

        this._annotationIndex = this._annotations.length - 1;
        return false;
    }

    getPosFormRel() {
        return EventRelationType.COREF;
    }

    getNegFormRel() {
        return EventRelationType.NO_COREF;
    }

    getQuestionText(eventInFocus) {
        return "Which of the highlighted events refers to the same (<span style=\"color:royalblue\">" + eventInFocus.getTokensWithEventId() + "</span>) event?";
    }

    getDropDownTitle() {
        return "Select (if apply):";
    }

    getAllRelevantRelations(eventId) {
        const allRelAxes = this._allAxes.getAllRelAxes();
        let allEqualEvents = [];
        for (let i = 0; i < allRelAxes.length; i++) {
            allEqualEvents = allEqualEvents.concat(allRelAxes[i].getAxisGraph().getAllEqualEventsPairs(eventId));
        }

        return allEqualEvents;
    }

    annotationRemainder() {
        for (let i = 0; i < this._annotations.length; i++) {
            const allRelevantRelations = this.getAllRelevantRelations(this._annotations[i].getId());
            for (let j = 0; j < allRelevantRelations.length; j++) {
                if(allRelevantRelations[j].getRelation() !== EventRelationType.COREF && allRelevantRelations[j].getRelation() !== EventRelationType.NO_COREF) {
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
                        'opacity': 0.2,
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
                        'width': 4,
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
                        'opacity': 0.2,
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
                        'opacity': 0.2,
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
                        'opacity': 0.2,
                    }
                };
            default:
                throw new Error("Unknown relation type: " + relationType);
        }
    }
}