// ####################################################
// ############### temporal functions ###############
// ####################################################

class TemporalForm extends PairsForm {
    constructor(pageIndex, allAxes) {
        super(pageIndex, allAxes, null, FormType.TEMPORAL);
    }

    getInstructions() {
        return config.instFiles.temporal;
    }

    loadForm() {
        this._annotations = this.initTmpPairs();
        super.loadForm();
    }

    handleSelection() {
        let retVal = true;
        let selectedValue = this.getRadiosSelected("multiChoice1");
        let selectedContainValue = this.getRadiosSelected("containChoice");
        const combSelect = TemporalForm.getCombinedQRelations(selectedValue, selectedContainValue);
        if (combSelect != null) {
            let pair = this._annotations[this._annotationIndex];
            if (pair.getRelation() === EventRelationType.NA) {
                this._allAxes._tempAnnotationMade++;
            }

            if (this.isRelationChanged(pair.getRelation(), combSelect)) {
                let axisById = this._allAxes.getAxisById(pair.getAxisId());
                const firstId = pair.getFirstId();
                const secondId = pair.getSecondId();
                let discrepancies = axisById.handleFormRelations(firstId, secondId, combSelect, this.formType);
                if (discrepancies.length > 0) {
                    this.handleDiscrepancies(discrepancies[0]);
                    retVal = false;
                }

                this._annotations = this._allAxes.getAllAxesPairsFlat(FormType.TEMPORAL);
            }
        }

        return retVal;
    }


    isRelationChanged(currentRelation, newRelation) {
        if(newRelation === EventRelationType.EQUAL) {
            if(getRelationMappingSeparateTransitive(currentRelation) === EventRelationType.EQUAL) {
                return false;
            }
        } else if (newRelation === EventRelationType.BEFORE) {
            if (getRelationMappingSeparateTransitive(currentRelation) === EventRelationType.BEFORE) {
                return false;
            }
        } else if (newRelation === EventRelationType.CONTAINS) {
            if (getRelationMappingSeparateTransitive(currentRelation) === EventRelationType.CONTAINS) {
                return false;
            }
        }

        return currentRelation !== newRelation;
    }

    getNextUnhandledAnnotation() {
        let candidates = [];
        for (let i = 0; i < this._annotations.length; i++) {
            if (this._annotations[i].getRelation() === EventRelationType.NA) {
                if (candidates.length === 0) {
                    candidates.push(this._annotations[i]);
                } else {
                    if (this._annotations[i].getSecondId() === candidates.at(-1).getSecondId()) {
                        candidates.push(this._annotations[i]);
                    }
                }
            }
        }

        if (candidates.length > 0) {
            this._annotationIndex = this._annotations.indexOf(candidates.at(-1));
            return true;
        } else {
            let selectedValue = this.getRadiosSelected("multiChoice1");
            if (selectedValue != null) {
                for (let i = 0; i < this._annotations.length; i++) {
                    if (this._annotations[i].getRelation() === selectedValue) {
                        this._annotationIndex = i;
                        break;
                    }
                }
            }
        }

        return false;
    }

    getQuestion(pair) {
        const divQuestion1 = document.createElement("div");
        const question1 = document.createElement("h2");
        question1.innerHTML = "[QUESTION-1] Which event started first?";
        divQuestion1.appendChild(question1);
        this.prepareQuestion1Div(divQuestion1, pair);

        divQuestion1.addEventListener('change', function(event) {
            let mainSelectedValue = document.querySelector('input[name="multiChoice1"]:checked').value;
            let checkedElement = document.querySelector('input[name="containChoice"]:checked');
            if (checkedElement !== null) {
                const containsSelectedValue = checkedElement.value;
                mainSelectedValue = TemporalForm.getCombinedQRelations(mainSelectedValue, containsSelectedValue);
            }
        });

        return divQuestion1;
    }

    static getCombinedQRelations(selectRel, containsRel) {
        let retRel = null;
        if (selectRel !== null) {
            retRel = selectRel;
            if (containsRel !== null) {
                if (containsRel === "Yes") {
                    if (selectRel === EventRelationType.BEFORE) {
                        retRel = EventRelationType.CONTAINS;
                    } else if (selectRel === EventRelationType.AFTER) {
                        retRel = EventRelationType.AFTER_CONTAINS;
                    }
                }
            }
        }

        return retRel;
    }

    prepareQuestion1Div(divQuestion1, pair) {
        const input1 = getOption(EventRelationType.BEFORE, "multiChoice1");
        divQuestion1.appendChild(input1);
        let span1 = document.createElement("span");
        span1.style.color = "royalblue";
        span1.style.fontWeight = "bold";
        span1.innerHTML = this._allAxes.getEventByEventId(pair.getFirstId()).getTokens();
        divQuestion1.appendChild(span1);
        divQuestion1.appendChild(document.createElement("br"));

        const input2 = getOption(EventRelationType.AFTER, "multiChoice1");
        divQuestion1.appendChild(input2);
        let span2 = document.createElement("span");
        span2.style.color = "orangered";
        span2.style.fontWeight = "bold";
        span2.innerHTML = this._allAxes.getEventByEventId(pair.getSecondId()).getTokens();
        divQuestion1.appendChild(span2);
        divQuestion1.appendChild(document.createElement("br"));

        const input3 = getOption(EventRelationType.EQUAL, "multiChoice1");
        divQuestion1.appendChild(input3);
        divQuestion1.appendChild(document.createTextNode("Both started at the same time"));
        divQuestion1.appendChild(document.createElement("br"));

        const input4 = getOption(EventRelationType.VAGUE, "multiChoice1");
        divQuestion1.appendChild(input4);
        divQuestion1.appendChild(document.createTextNode("Uncertain"));
        divQuestion1.appendChild(document.createElement("br"));

        let divContains = null;
        if (pair.getRelation() !== EventRelationType.NA) {
            if (getRelationMappingSeparateTransitive(pair.getRelation()) === EventRelationType.BEFORE) {
                input1.checked = true;
                input2.checked = false;
                input3.checked = false;
                input4.checked = false;
            } else if (getRelationMappingSeparateTransitive(pair.getRelation()) === EventRelationType.EQUAL) {
                input1.checked = false;
                input2.checked = false;
                input3.checked = true;
                input4.checked = false;
            } else if (pair.getRelation() === EventRelationType.VAGUE) {
                input1.checked = false;
                input2.checked = false;
                input3.checked = false;
                input4.checked = true;
            } else if (getRelationMappingSeparateTransitive(pair.getRelation()) === EventRelationType.AFTER) { // AFTER
                input2.checked = false;
                input2.checked = true;
                input3.checked = false;
                input4.checked = false;
            } else {
                // CONTAINS
                input1.checked = true;
                input2.checked = false;
                input3.checked = false;
                input4.checked = false;
            }

            highlightCurrentPair(pair);
        }
    }

    static prepareQuestion2Div(pair, relation) {
        let divContains = document.getElementById("divContains");
        let question2 = document.getElementById("question2");
        let inputY = document.getElementById("containChoiceY");
        let inputN = document.getElementById("containChoiceN");

        if (divContains === null) {
            divContains = document.createElement("div");
            divContains.id = "divContains";

            question2 = document.createElement("h3");
            question2.id = "question2";
            divContains.appendChild(question2);

            inputY = getOption("Yes", "containChoice");
            inputY.id = "containChoiceY";
            divContains.appendChild(inputY);
            divContains.appendChild(document.createTextNode("Yes"));
            divContains.appendChild(document.createElement("br"));

            inputN = getOption("No", "containChoice");
            inputN.id = "containChoiceN";
            divContains.appendChild(inputN);
            divContains.appendChild(document.createTextNode("No"));
        }

        const event1 = allAxesGlobal.getEventByEventId(pair.getFirstId()).getTokens();
        const event2 = allAxesGlobal.getEventByEventId(pair.getSecondId()).getTokens();
        if (relation === EventRelationType.BEFORE || relation === EventRelationType.CONTAINS ||
            relation === EventRelationType.SUB_EVENT || relation === EventRelationType.NO_SUB_EVENT) {
            question2.innerHTML = "[QUESTION-2] Is it possible that (<span style=\"color:orangered\">" + event2 + "</span>) " +
                "duration is contained within the duration of (<span style=\"color:royalblue\">" + event1 + "</span>)?";
            if (relation === EventRelationType.BEFORE) {
                inputY.checked = false;
                inputN.checked = true;
            } else {
                inputY.checked = true;
                inputN.checked = false;
            }
        } else if (relation === EventRelationType.AFTER || relation === EventRelationType.AFTER_CONTAINS ||
                    relation === EventRelationType.AFTER_SUB_EVENT || relation === EventRelationType.AFTER_NO_SUB_EVENT) {
            question2.innerHTML = "[QUESTION-2] Is it possible that (<span style=\"color:royalblue\">" + event1 + "</span>) " +
                "duration is contained within the duration of (<span style=\"color:orangered\">" + event2 + "</span>)?";
            if (relation === EventRelationType.AFTER) {
                inputY.checked = false;
                inputN.checked = true;
            } else {
                inputY.checked = true;
                inputN.checked = false;
            }
        }

        return divContains;
    }

    annotationRemainder() {
        if (this._annotations === null || this._annotations.length === 0) {
            return 0;
        }

        let count = this._annotations.length;
        for (let i = 0; i < this._annotations.length; i++) {
            if (this._annotations[i].getRelation() !== EventRelationType.NA) {
                count--;
            }
        }

        return count;
    }

    initTmpPairs() {
        const allAxesEvents = this._allAxes.getAllAxesEventsSorted()
        if(allAxesEvents == null || allAxesEvents.length === 0) {
            return;
        }

        const allAxes = this._allAxes.getAllRelAxes();
        let allPairsFlat = [];
        let eventsToPresent = [];
        for (let i = 0; i < allAxes.length; i++) {
            let eventIds = allAxes[i].getEventIds();
            let eventIdsSorted = [];
            for (let j = 0; j < allAxesEvents.length; j++) {
                if (eventIds.has(allAxesEvents[j].getId())) {
                    eventIdsSorted.push(allAxesEvents[j].getId());
                    eventsToPresent.push(allAxesEvents[j])
                }
            }

            allAxes[i].getAxisGraph().initGraph(eventIdsSorted);
            if (config.app.removeTransitive) {
                allAxes[i].getAxisGraph().removeTemporalTransitiveRels();
            }

            const axisPairs = allAxes[i].fromGraphToPairs(FormType.TEMPORAL);
            for(let j = 0; j < axisPairs.length; j++) {
                const pairToAdd = axisPairs[j];
                if(!AllAxes.isDuplicatePair(pairToAdd, allPairsFlat)) {
                    allPairsFlat.push(pairToAdd);
                }
            }

            console.log("Axis = " + allAxes[i].getAxisType() + " reach and transitive closure graph:");
            console.log(allAxes[i].getAxisGraph().printGraph());
        }

        graphEventsToPreset = AllAxes.sortEventsByIndex(eventsToPresent);
        return allPairsFlat;
    }


    handleManualNodeSelection() {
        let index = this.findPair(this._annotations);

        if (index === -1) {
            const event1 = this._allAxes.getEventByEventId(this._selectedNodes[0]);
            const event2 = this._allAxes.getEventByEventId(this._selectedNodes[1]);
            const eventAxisId = this._allAxes.getEventAxisId(event1);
            const allPairs = this._allAxes.getAxisById(eventAxisId).getAxisGraph().exportAllReachAndTransGraphPairs(eventAxisId);
            index = this.findPair(allPairs);
            if(this._allAxes.isValidPair(event1, event2)) {
                this._annotationIndex = this._annotations.length;
                this._annotations.push(allPairs[index]);
            } else {
                Swal.fire({
                    icon: "error",
                    title: 'Invalid pair selection',
                    html:
                        '<p>The pair you selected cannot be annotated as they belong to different axis.</p>',
                    showCancelButton: false,
                    confirmButtonText: 'OK',
                    allowOutsideClick: false,
                    scrollbarPadding: true
                });
            }
        } else {
            this._annotationIndex = index;
        }
    }

    findPair(pairsToLookIn) {
        let index = -1;
        for (let i = 0; i < pairsToLookIn.length; i++) {
            if ((pairsToLookIn[i].getFirstId() === this._selectedNodes[0] && pairsToLookIn[i].getSecondId() === this._selectedNodes[1]) ||
                (pairsToLookIn[i].getFirstId() === this._selectedNodes[1] && pairsToLookIn[i].getSecondId() === this._selectedNodes[0])) {
                index = i;
                break;
            }
        }

        return index;
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
                    }
                };
            case EventRelationType.BEFORE:
                return {
                    selector: '.before',
                    style: {
                        'line-style': 'solid',
                        'target-arrow-color': '#808080',
                        'target-arrow-shape': 'triangle-tee',
                        'source-arrow-shape': 'none'
                    }
                };
            case EventRelationType.CAUSE:
                return {
                    selector: '.causal',
                    style: {
                        'line-style': 'solid',
                        'target-arrow-color': '#808080',
                        'target-arrow-shape': 'triangle-tee',
                        'source-arrow-shape': 'none'
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
                        'source-arrow-shape': 'none'
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
                        'source-arrow-shape': 'circle'
                    }
                };
            default:
                throw new Error("Unknown relation type: " + relationType);
        }
    }
}
