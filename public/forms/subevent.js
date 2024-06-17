// ####################################################
// ############## subevent functions ##############
// ####################################################

const SUB_EVENT_MULTI_CHOICE = "multiChoiceSubEvent";

class SubEventForm extends PairsForm {
    constructor(pageIndex, allAxes) {
        if (allAxes != null) {
            super(pageIndex, allAxes, getAllContainsPairs(allAxes.getAllAxesPairsFlat(FormType.SUB_EVENT)), FormType.SUB_EVENT);
        }
    }

    getInstructions() {
        return config.instFiles.subevent;
    }

    loadForm() {
        this._annotations = getAllContainsPairs(this._allAxes.getAllAxesPairsFlat(FormType.SUB_EVENT));
        super.loadForm();
    }

    handleSelection() {
        let selectedValue = this.getRadiosSelected(SUB_EVENT_MULTI_CHOICE);
        if (selectedValue != null) {
            let selectedRel = this.getSubEventSelection(selectedValue);
            let pair = this.getCurrentContainsAxesPair();
            if (pair.getRelation() !== EventRelationType.SUB_EVENT && pair.getRelation() !== EventRelationType.NO_SUB_EVENT) {
                this._allAxes._subeventAnnotationMade++;
            }

            if (pair.getRelation() !== selectedRel) {
                const firstId = pair.getFirstId();
                const secondId = pair.getSecondId();
                this._allAxes.getAxisById(pair.getAxisId()).handleFormRelations(firstId, secondId, selectedRel, this.formType);
                pair.setRelation(selectedRel);

                this._annotations = getAllContainsPairs(this._allAxes.getAllAxesPairsFlat(FormType.SUB_EVENT));
            }
        }

        return true;
    }

    getQuestion(pair) {
        const divQuestion1 = document.createElement("div");
        const question1 = document.createElement("h2");
        question1.innerHTML = "[QUESTION] Is it possible that (<span style=\"color:royalblue\">" +
            this._allAxes.getEventByEventId(pair.getFirstId()).getTokens() + "</span>) is a supper/general event of (<span style=\"color:orangered\">" +
            this._allAxes.getEventByEventId(pair.getSecondId()).getTokens() + "</span>)?";
        divQuestion1.appendChild(question1);

        const inputY1 = getOption("Yes", SUB_EVENT_MULTI_CHOICE);
        divQuestion1.appendChild(inputY1);
        divQuestion1.appendChild(document.createTextNode("Yes"));
        divQuestion1.appendChild(document.createElement("br"));

        const inputN1 = getOption("No", SUB_EVENT_MULTI_CHOICE);
        divQuestion1.appendChild(inputN1);
        divQuestion1.appendChild(document.createTextNode("No"));
        divQuestion1.appendChild(document.createElement("br"));

        if (pair.getRelation() !== EventRelationType.NA) {
            if (pair.getRelation() === EventRelationType.SUB_EVENT) {
                inputY1.checked = true;
                inputN1.checked = false;
            } else if (pair.getRelation() === EventRelationType.NO_SUB_EVENT) {
                inputN1.checked = true;
                inputY1.checked = false;
            } else {
                inputY1.checked = false;
                inputN1.checked = false;
            }

            highlightCurrentPair(pair);
        }

        return divQuestion1;
    }

    getSubEventSelection(selectedValue) {
        if (selectedValue === yes) {
            return EventRelationType.SUB_EVENT;
        }
        return EventRelationType.NO_SUB_EVENT;
    }

    getCurrentContainsAxesPair() {
        if (this._annotations != null && this._annotations.length > 0) {
            if (this._annotations[this._annotationIndex].getRelation() === EventRelationType.CONTAINS ||
                this._annotations[this._annotationIndex].getRelation() === EventRelationType.SUB_EVENT ||
                this._annotations[this._annotationIndex].getRelation() === EventRelationType.NO_SUB_EVENT) {
                return this._annotations[this._annotationIndex];
            }
        }

        return null;
    }

    getNextUnhandledAnnotation() {
        let candidates = [];
        for (let i = 0; i < this._annotations.length; i++) {
            if (this._annotations[i].getRelation() !== EventRelationType.SUB_EVENT && this._annotations[i].getRelation() !== EventRelationType.NO_SUB_EVENT) {
                candidates.push(this._annotations[i]);
            }
        }

        if (candidates.length > 0) {
            const resultObject = candidates.reduce((minObject, currentObject) => {
                const distance = Math.abs(currentObject.getFirstId() - currentObject.getSecondId());
                const minDistance = Math.abs(minObject.getFirstId() - minObject.getSecondId());
                return distance < minDistance ? currentObject : minObject;
            }, candidates[0]);

            this._annotationIndex = this._annotations.indexOf(resultObject);
            return true;
        }

        return false;
    }

    annotationRemainder() {
        let count = this._annotations.length;
        for (let i = 0; i < this._annotations.length; i++) {
            if (this._annotations[i].getRelation() === EventRelationType.SUB_EVENT || this._annotations[i].getRelation() === EventRelationType.NO_SUB_EVENT) {
                count--;
            }
        }

        return count;
    }

    graphPairRelationStyle(relationType) {
        switch (relationType) {
            case EventRelationType.VAGUE:
                return {
                    selector: '.vague',
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
            case EventRelationType.CONTAINS:
            case EventRelationType.SUB_EVENT:
            case EventRelationType.NO_SUB_EVENT:
                return {
                    selector: '.contains',
                    style: {
                        'line-style': 'solid',
                        'target-arrow-color': '#808080',
                        'target-arrow-shape': 'circle-triangle',
                        'source-arrow-shape': 'circle',
                    }
                };
            default:
                throw new Error("Unknown relation type: " + relationType);
        }
    }
}