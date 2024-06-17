class PairsForm extends UIForm {
    constructor(pageIndex, allAxes, allAxesPairs, formType) {
        super(pageIndex, allAxes, allAxesPairs);
        this.splitForm = allAxes.getSources() != null && config.app.includeProjection === true &&
            config.app.splitWindow === true;
        this.formType = formType;

        this._selectedNodes = [];
    }

    loadForm() {
        if (this._annotationIndex !== 0 && this._annotationIndex >= this._annotations.length) {
            this._annotationIndex = this._annotations.length - 1;
        }

        toggleGraphDivOn();
        renderGraph(this);
        super.loadForm();
    }

    graphPairRelationStyle(relationType) {
        throw new Error("Not implemented");
    }

    createUI() {
        cleanQuestions();
        let pair = null;
        if (this._annotations.length > 0) {
            pair = this._annotations[this._annotationIndex];
        }

        const questions = document.getElementById("questions");
        const summaryPanel = document.createElement("div");
        if (config.app.includeAnchor === true && config.app.includeAxis === true) {
            createAndAddAxisColorBoxes(questions);
        }

        const buttonBackTask = this.createPrevTaskButton();
        const buttonNextTask = this.createNextTaskButton();
        const paragraph = document.createElement("p");
        if (pair != null) {
            paragraph.innerHTML = this.formatText(pair);
            summaryPanel.appendChild(paragraph);

            const divQuestion1 = this.getQuestion(pair);
            summaryPanel.appendChild(divQuestion1);
            summaryPanel.appendChild(document.createElement("br"));
            summaryPanel.appendChild(buttonBackTask);
            summaryPanel.appendChild(this.createBackButton("Back"));
            summaryPanel.appendChild(this.createNextButton("Next"));

            let nextUnhldButt = this.createUnhandledNextButton("Next Unhandled Pair");
            if (pair.getRelation() !== EventRelationType.NA) {
                nextUnhldButt.disabled = false;
            }

            summaryPanel.appendChild(nextUnhldButt);
            summaryPanel.appendChild(buttonNextTask);

            if (config.app.showRemainingAnnot === true) {
                summaryPanel.appendChild(this.getAnnotationsRemainderElem());
            }

            if (this.splitForm === true) {
                const docContainer = document.createElement("div");
                docContainer.className = "projection-parent-container-not-fixed";
                summaryPanel.className = "left-projection-container-not-fixed";
                let sourceTextWithMentPair = this._allAxes.getSourceTextWithMentPair(pair);
                const rightPanel = document.createElement("div");
                rightPanel.className = "right-projection-container-not-fixed";
                rightPanel.appendChild(this.formatTextExamples(sourceTextWithMentPair));

                docContainer.appendChild(summaryPanel);
                docContainer.appendChild(rightPanel);
                questions.appendChild(docContainer);
            } else {
                questions.appendChild(summaryPanel);
            }
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
                    PairsForm.blinkNode(this);
                }
            });
        }
    }

    handleManualNodeSelection() {
        let found = false;
        for (let i = 0; i < this._annotations.length; i++) {
            if ((this._annotations[i].getFirstId() === this._selectedNodes[0] && this._annotations[i].getSecondId() === this._selectedNodes[1]) ||
                (this._annotations[i].getFirstId() === this._selectedNodes[1] && this._annotations[i].getSecondId() === this._selectedNodes[0])) {
                this._annotationIndex = i;
                found = true;
                break;
            }
        }

        if (!found) {
            Swal.fire({
                icon: "error",
                title: 'Invalid pair selection',
                html:
                    '<p>The pair you selected cannot be annotated as the relation is not yet annotated or not valid for this relation</p>',
                showCancelButton: false,
                confirmButtonText: 'OK',
                allowOutsideClick: false,
                scrollbarPadding: true
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
                    PairsForm.blinkNode(node);
                }
            })).play();
    }

    handleDiscrepancies(discrepancy) {
        const disRootEdge = this._allAxes.getEventByEventId(discrepancy[0]).getTokens();
        const disOtherEdge = this._allAxes.getEventByEventId(discrepancy[1]).getTokens();
        const currentRelation = discrepancy[2];
        const inferredRelation = discrepancy[3];

        Swal.fire({
            icon: "error",
            title: 'Discrepancy Alert',
            html:
                '<p>Your last selection has created a discrepancy between two events.<br/><br/>The relation currently set between the events: <span style=\"color:orangered; font-weight: bold;\">' + disRootEdge +'</span> and ' +
                '<span style=\"color:orangered; font-weight: bold;\">' + disOtherEdge + '</span> is <span style=\"color:royalblue; font-weight: bold;\">' +
                currentRelation + '</span>. However, due to the last selection, the events can now be inferred indirectly also as having a ' +
                '<span style=\"color:royalblue; font-weight: bold;\">' + inferredRelation + '</span> relation.<br/><br/>' +
                '<span style=\"font-weight: bold;\">Please fix or contact the task admin for help.</p>',
            showCancelButton: false,
            confirmButtonText: 'OK',
            allowOutsideClick: false,
            scrollbarPadding: true
        });
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
                text[i] = `<span style=\"font-weight: bold;\">${text[i]}</span>`;
            }
        }

        for (let i = 0; i < allTimeExpressions.length; i++) {
            text[allTimeExpressions[i]] = `<span style=\"text-decoration: underline;\">${text[allTimeExpressions[i]]}</span>`;
        }

        for (let i = start1Idx; i <= end1Idx; i++) {
            text[i] = `<span style=\"color:royalblue; font-weight: bold;\">${text[i]}</span>`;
        }

        let start2Idx = event2.getTokensIds()[0];
        let end2Idx = event2.getTokensIds().at(-1);
        for (let i = start2Idx; i <= end2Idx; i++) {
            text[i] = `<span style=\"color:orangered; font-weight: bold;\">${text[i]}</span>`;
        }

        return text.join(" ");
    }

    formatTextExamples(textWithPairsObj) {
        let textIdx = 0;
        let allTexts = [];
        for (let i = 0; i < textWithPairsObj.length; i++) {
            let tokens = [...textWithPairsObj[i]['tokens']];
            if(textWithPairsObj[i]['firstMentions'] !== null) {
                for (let j = 0; j < textWithPairsObj[i]['firstMentions'].length; j++) {
                    let mention = textWithPairsObj[i]['firstMentions'][j];
                    for (let x = mention['tokens_ids'][0]; x <= mention['tokens_ids'].at(-1); x++) {
                        tokens[x] = `<span style=\"color:royalblue; font-weight: bold;\">${tokens[x]}</span>`;
                    }
                }
            }

            if (textWithPairsObj[i]['secondMentions'] !== null) {
                for (let j = 0; j < textWithPairsObj[i]['secondMentions'].length; j++) {
                    let mention = textWithPairsObj[i]['secondMentions'][j];
                    for (let x = mention['tokens_ids'][0]; x <= mention['tokens_ids'].at(-1); x++) {
                        tokens[x] = `<span style=\"color:orangered; font-weight: bold;\">${tokens[x]}</span>`;
                    }
                }
            }

            allTexts.push([textWithPairsObj[i]['doc_id'], tokens.join(" ")]);
        }

        let title = document.createElement("h2");
        title.id = "title-text";

        let p = document.createElement("p");
        p.id = "example-text";

        if (allTexts.length > 0) {
            title.innerHTML = allTexts[textIdx][0];
            p.innerHTML = allTexts[textIdx][1];
        }

        const div= document.createElement('div');
        div.appendChild(title);
        div.appendChild(p);

        const buttonBack = this.createButton("Next Example");
        buttonBack.onclick = function () {
            let title = document.getElementById("title-text");
            let p = document.getElementById("example-text");
            textIdx++;
            if (textIdx >= allTexts.length) {
                textIdx = 0;
            }

            title.innerHTML = allTexts[textIdx][0];
            p.innerHTML = allTexts[textIdx][1];
        };

        if (allTexts.length <= 1) {
            buttonBack.disabled = true;
        }

        div.appendChild(buttonBack);
        return div;
    }

    getAnnotationsRemainderElem() {
        const anchorRemains = this.annotationRemainder();
        const countPer = document.createElement("p");
        countPer.style.color = "red";
        countPer.innerHTML = "Remaining relations to annotate = " + anchorRemains;
        return countPer;
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
}