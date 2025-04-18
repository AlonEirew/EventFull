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

    addToCorefSet(eventList, clusterSet) {
        for (let i = 0; i < eventList.length; i++) {
            let allCoreferringEvents = this._allAxes.getMainAxis().getAxisGraph().getAllCoreferringEvents(eventList[i]);
            allCoreferringEvents.push(eventList[i]);
            let sortedClust = JSON.stringify(allCoreferringEvents.sort());
            if(!clusterSet.has(sortedClust)) {
                clusterSet.add(sortedClust);
            }
        }
    }

    handleEventSelection(currentFocusEvent, checkedItems, uncheckedItems) {
        let allEventClustersBefore = new Set();
        this.addToCorefSet(Array.from(this._allAxes.getMainAxis().getEventIds()), allEventClustersBefore);

        const axis = this._allAxes.getMainAxis();
        // Handle focused with all in list
        for (let i = 0; i < checkedItems.length; i++) {
            axis.handleFormRelations(currentFocusEvent, checkedItems[i], this.getPosFormRel(), this.formType);
        }

        // Handle all in list that coref with focused (should coref to eachother)
        for (let i = 0; i < checkedItems.length; i++) {
            for (let j = i + 1; j < checkedItems.length; j++) {
                axis.handleFormRelations(checkedItems[i], checkedItems[j], this.getPosFormRel(), this.formType);
            }
        }

        // Handle focused with all unchecked items
        for (let i = 0; i < uncheckedItems.length; i++) {
            axis.handleFormRelations(currentFocusEvent, uncheckedItems[i], this.getNegFormRel(), this.formType);
        }

        // Handle all unchecked/checked items (should not coref to each-other)
        for (let i = 0; i < uncheckedItems.length; i++) {
            for (let j = 0; j < checkedItems.length; j++) {
                axis.handleFormRelations(uncheckedItems[i], checkedItems[j], this.getNegFormRel(), this.formType);
            }
        }

        let focusedCluster = this._allAxes.getMainAxis().getAxisGraph().getAllCoreferringEvents(currentFocusEvent);
        focusedCluster.push(currentFocusEvent);
        let discrepancies = [];
        for (let i = 0; i < checkedItems.length; i++) {
            for (let j = 0; j < allEventClustersBefore.size; j++) {
                const clust = JSON.parse(Array.from(allEventClustersBefore)[j]);
                if (clust.includes(checkedItems[i])) {
                    if (clust.length === 1) {
                        break;
                    } else if (clust.includes(currentFocusEvent)) {
                        break
                    } else {
                        // [Cluster Before, Cluster After]
                        discrepancies.push([clust, focusedCluster]);
                    }
                }
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
        return "Which of the highlighted event mentions refers to the same <span style=\"color:#28A745\">" + eventInFocus.getTokensWithEventId() + "</span> event?";
    }

    getDropDownTitle() {
        return "Select (if apply):";
    }

    getAllRelevantRelations(eventId) {
        return this._allAxes.getMainAxis().getAxisGraph().getAllEqualEventsPairs(eventId);
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
                        'opacity': 0,
                    }
                };
            case EventRelationType.EQUAL:
            case EventRelationType.COREF:
                return {
                    selector: '.equal',
                    style: {
                        'line-style': 'dotted',
                        'target-arrow-shape': 'none',
                        'source-arrow-shape': 'none',
                        'width': 2,
                    }
                };
            case EventRelationType.NO_COREF:
            case EventRelationType.UNCERTAIN_COREF:
                return {
                    selector: '.no_coref',
                    style: {
                        'line-style': 'dotted',
                        'target-arrow-shape': 'none',
                        'source-arrow-shape': 'none',
                        'opacity': 0.2,
                        'width': 1,
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
                        'opacity': 0,
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
            case EventRelationType.NA:
                return {
                    selector: '.unknown',
                    style: {
                        'target-arrow-shape': 'none',
                        'source-arrow-shape': 'none',
                        'opacity': 0,
                    }
                };
            default:
                throw new Error("Unknown relation type: " + relationType);
        }
    }
}