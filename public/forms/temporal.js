// ####################################################
// ############### temporal functions ###############
// ####################################################

class TemporalForm extends UIForm {
    constructor(pageIndex, allAxes) {
        super(pageIndex, allAxes, null);
        this.formType = FormType.TEMPORAL;
        this._selectedNodes = [];
        this._discrepancy = [];
    }

    getInstructions() {
        return config.instFiles.temporal;
    }

    loadForm() {
        if(document.getElementById("axis-inst") != null) {
            document.getElementById("axis-inst").style.display = "none";
        }

        this._annotations = this.initTmpPairs();
        if (this._annotationIndex !== 0 && this._annotationIndex >= this._annotations.length) {
            this._annotationIndex = this._annotations.length - 1;
        }

        toggleGraphDivOn();
        renderGraph(this);

        window.addEventListener('resize', () => {
            cy.resize(); // Adjust the Cytoscape viewport
            rearrangeGraph(); // Trigger layout recalculation
        });

        super.loadForm();
    }

    createUI() {
        const questions = document.getElementById("questions");
        cleanPanel(questions);

        let pair = null;
        if (this._annotations.length > 0) {
            pair = this._annotations[this._annotationIndex];
        }

        const summaryPanel = document.createElement("div");
        const buttonBackTask = this.createPrevTaskButton();
        const buttonNextTask = this.createNextTaskButton();
        const paragraph = this.getParagraph();

        if (pair != null) {
            paragraph.innerHTML = this.formatText(pair);
            summaryPanel.appendChild(paragraph);

            let divQuestion1 = this.getQuestion(pair);
            summaryPanel.appendChild(divQuestion1);
            summaryPanel.appendChild(document.createElement("br"));
            summaryPanel.appendChild(buttonBackTask);

            summaryPanel.appendChild(buttonNextTask);
            if (config.app.showRemainingAnnot === true) {
                summaryPanel.appendChild(this.getAnnotationsRemainderElem());
            }

            questions.appendChild(summaryPanel);
        } else {
            paragraph.innerHTML = "<p><b>All done with this annotation task! You can proceed to the next task.</b></p>";
            questions.appendChild(paragraph);
            questions.appendChild(buttonBackTask);
            questions.appendChild(buttonNextTask);
        }

        let nodes = refreshGraphElem(this.formType);
        highlightCurrentPair(pair);
        // check if nodes already listening to click event
        if (nodes[0].emitter().listeners.length === 0) {
            nodes.on('click', function (event) {
                const curPage = pages[currentPageIdx];
                if (this.animated()) {
                    curPage._selectedNodes.splice(curPage._selectedNodes.indexOf(this.id()), 1);
                    this.stop(true);
                    this.animate({style: {'opacity': 1}});
                } else if (curPage._selectedNodes.length === 1) {
                    curPage._selectedNodes.push(this.id());
                    curPage.handleManualNodeSelection();
                    nodes.stop(true);
                    nodes.animate({style: {'opacity': 1}});
                    curPage._selectedNodes = [];
                    curPage.createUI();
                } else {
                    curPage._selectedNodes.push(this.id());
                    TemporalForm.blinkNode(this);
                }
            });
        }
    }

    static blinkNode(node) {
        return (
            node.animation({
                style: {'opacity': 0.3}
            }, {
                duration: 700,
                complete: function () {
                    // Reset the node's style after the animation is complete
                    node.animation({style: {'opacity': 1}}, {duration: 700}).play();
                    TemporalForm.blinkNode(node);
                }
            })).play();
    }

    getAnnotationsRemainderElem() {
        const anchorRemains = this.annotationRemainder();
        const countPer = document.createElement("p");
        countPer.style.color = "red";
        countPer.innerHTML = "Remaining relations to annotate = " + anchorRemains;
        return countPer;
    }

    formatText(pair) {
        let text = [...this._allAxes.getMainDocTokens()];
        const allEvents = this._allAxes.getAllRelEvents();
        const allTimeExpressions = this._allAxes.getAllTimeExpressions();
        let event1 = this._allAxes.getEventByEventId(pair.getFirstId());
        let event2 = this._allAxes.getEventByEventId(pair.getSecondId());
        let start1Idx = event1.getTokensIds()[0];
        let end1Idx = event1.getTokensIds().at(-1);

        for (let i = 0; i < allEvents.length; i++) {
            const eventStartIds = allEvents[i].getTokensIds()[0];
            const eventEndIds = allEvents[i].getTokensIds().at(-1);
            for (let i = eventStartIds; i <= eventEndIds; i++) {
                text[i] = `<span style=\"font-weight: bold;\">${text[i]}`;
            }

            text[eventEndIds] += " (" + allEvents[i].getId() + ")</span>";
        }

        for (let i = 0; i < allTimeExpressions.length; i++) {
            text[allTimeExpressions[i]] = `<span style=\"text-decoration: underline;\">${text[allTimeExpressions[i]]}</span>`;
        }

        for (let i = start1Idx; i <= end1Idx; i++) {
            text[i] = `<span class=\"label ANC\" \">${text[i]}</span>`;
        }

        let start2Idx = event2.getTokensIds()[0];
        let end2Idx = event2.getTokensIds().at(-1);
        for (let i = start2Idx; i <= end2Idx; i++) {
            text[i] = `<span class=\"label NOT\">${text[i]}</span>`;
        }

        return text.join(" ");
    }

    handleSelection() {
        let selectedValue = this.getRadiosSelected("multiChoice1");
        const combSelect = TemporalForm.getCombinedQRelations(selectedValue);
        if (combSelect != null) {
            let pair = this._annotations[this._annotationIndex];
            if (pair.getRelation() === EventRelationType.NA) {
                this._allAxes._tempAnnotationMade++;
            }

            if (this.isRelationChanged(pair.getRelation(), combSelect)) {
                let axisById = this._allAxes.getAxisById(pair.getAxisId());
                const firstId = pair.getFirstId();
                const secondId = pair.getSecondId();
                this._discrepancy = axisById.handleFormRelations(firstId, secondId, combSelect, this.formType);
                if (this._discrepancy.length > 0) {
                    this.handleDiscrepancies(this._discrepancy[0]);
                    pair.setRelation(combSelect);
                    this.createUI();
                    return false;
                }

                this._annotations = this._allAxes.getAllAxesPairsFlat(FormType.TEMPORAL);
            } else if (this._discrepancy.length > 0) {
                this.handleDiscrepancies(this._discrepancy[0]);
                return false;
            }
        }

        return true;
    }

    handleDiscrepancies(discrepancy) {
        const disRootEdge = this._allAxes.getEventByEventId(discrepancy[0]).getTokens();
        const disOtherEdge = this._allAxes.getEventByEventId(discrepancy[1]).getTokens();
        const viaNode = this._allAxes.getEventByEventId(discrepancy[2]).getTokens();
        const currentRelation = discrepancy[3];
        const inferredRelation = discrepancy[4];

        Swal.fire({
            icon: "error",
            title: 'Discrepancy Alert',
            html:
                '<p>Your last selection has created a discrepancy between two events.<br/><br/>The relation currently set between the events: <span style=\"color:orangered; font-weight: bold;\">' + disRootEdge +'</span> and ' +
                '<span style=\"color:orangered; font-weight: bold;\">' + disOtherEdge + '</span> is <span style=\"color:royalblue; font-weight: bold;\">' +
                currentRelation + '</span>. However, due to the last selection, the events can now be inferred indirectly via event ' +
                '<span style=\"color:green; font-weight: bold;\">' + viaNode + '</span> as also having a ' +
                '<span style=\"color:royalblue; font-weight: bold;\">' + inferredRelation + '</span> relation.<br/><br/>' +
                '<span style=\"font-weight: bold;\">Please fix or contact the task admin for help.</p>',
            showCancelButton: false,
            confirmButtonText: 'OK',
            allowOutsideClick: false,
            scrollbarPadding: true
        });
    }

    isRelationChanged(currentRelation, newRelation) {
        if(newRelation === EventRelationType.EQUAL) {
            if(getRelationMapping(currentRelation) === EventRelationType.EQUAL) {
                return false;
            }
        } else if (newRelation === EventRelationType.BEFORE) {
            if (getRelationMapping(currentRelation) === EventRelationType.BEFORE) {
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
        question1.innerHTML = "Which event started first?";
        // question1.style.color = "black";
        divQuestion1.appendChild(question1);
        const radioGroup = this.prepareTempOptions(pair);
        divQuestion1.appendChild(radioGroup);

        return divQuestion1;
    }

    static getCombinedQRelations(selectRel) {
        let retRel = null;
        if (selectRel !== null) {
            retRel = selectRel;
        }

        return retRel;
    }

    prepareTempOptions(pair) {
        let radioGroup = document.createElement("div");
        radioGroup.className = "radio-group";

        let span1 = document.createElement("span");
        span1.style.color = "royalblue";
        span1.style.fontWeight = "bold";
        span1.innerHTML = this._allAxes.getEventByEventId(pair.getFirstId()).getTokens();
        const [label1, input1] = this.getOption(EventRelationType.BEFORE, "multiChoice1", span1);
        radioGroup.appendChild(label1);

        let span2 = document.createElement("span");
        span2.style.color = "orangered";
        span2.style.fontWeight = "bold";
        span2.innerHTML = this._allAxes.getEventByEventId(pair.getSecondId()).getTokens();
        const [label2, input2] = this.getOption(EventRelationType.AFTER, "multiChoice1", span2);
        radioGroup.appendChild(label2);

        const [label3, input3] = this.getOption(EventRelationType.EQUAL, "multiChoice1", document.createTextNode("Both started at the same time"));
        radioGroup.appendChild(label3);

        const [label4, input4] = this.getOption(EventRelationType.VAGUE, "multiChoice1", document.createTextNode("Uncertain"));
        radioGroup.appendChild(label4);

        if (pair.getRelation() !== EventRelationType.NA) {
            switch (pair.getRelation()) {
                case EventRelationType.BEFORE:
                    input1.checked = true;
                    break;
                case EventRelationType.AFTER:
                    input2.checked = true;
                    break;
                case EventRelationType.EQUAL:
                    input3.checked = true;
                    break;
                case EventRelationType.VAGUE:
                    input4.checked = true;
                    break;
                default:
                    console.error("Unknown relation type: " + pair.getRelation());
            }

            highlightCurrentPair(pair);
        }

        return radioGroup;
    }

    getOption(answer, name, textValue) {
        let label = document.createElement("label");
        label.className = "radio-option";
        const input = document.createElement("input");
        input.onclick = function() {
            const curPage = pages[currentPageIdx];
            curPage.nextUnhandledClick();
        };

        input.type = "radio";
        input.name = name;
        input.value = answer;
        label.appendChild(input);

        const span = document.createElement("span");
        span.className = "custom-radio";
        label.appendChild(span);

        // const labelText = document.createTextNode(answer);
        label.appendChild(textValue);

        return [label, input];
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

    isFinalized() {
        let allRelAxes = this._allAxes.getAllRelAxes();
        for (let i = 0; i < allRelAxes.length; i++) {
            let discrepancies = allRelAxes[i].getAxisGraph().getFormTransitiveAndDiscrepancies(this.formType)[1];
            if (discrepancies.length > 0) {
                this.handleDiscrepancies(discrepancies[i]);
                return false;
            }
        }

        return true;
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
            default:
                throw new Error("Unknown relation type: " + relationType);
        }
    }
}
