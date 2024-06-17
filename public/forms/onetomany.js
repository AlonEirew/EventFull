class OneToManyForm extends UIForm {
    constructor(pageIndex, allAxes, allAxesPairs, formType, addNextUnhandled, handleDiscrepancies) {
        super(pageIndex, allAxes, allAxesPairs);
        this.formType = formType;
        this._selectedNodes = [];
        this.addNextUnhandled = addNextUnhandled;
        this.handleDiscrepancies = handleDiscrepancies;
    }

    loadForm() {
        if (this._annotationIndex !== 0 && this._annotationIndex >= this._annotations.length) {
            this._annotationIndex = this._annotations.length - 1;
        }

        toggleGraphDivOn();
        renderGraph(this);
        super.loadForm();
    }

    handleSelection() {
        const allItems = this.getSelectedItems();
        if (this._annotations.length > 0) {
            this._allAxes._corefAnnotationMade++;
            const currentFocusEvent = this._annotations[this._annotationIndex].getId();
            const checkedItems = allItems[0];
            const uncheckedItems = allItems[1];
            const discrepancies = this.handleEventSelection(currentFocusEvent, checkedItems, uncheckedItems);

            if (this.handleDiscrepancies && discrepancies.length > 0) {
                this.handleDiscrepancies(discrepancies[0]);
                return false;
            }
        }

        return true;
    }

    handleEventSelection(currentFocusEvent, checkedItems, uncheckedItems) {
        throw new Error("This method must be implemented by the subclass");
    }

    getAllCorefEvents(eventId) {
        const allRelAxes = this._allAxes.getAllRelAxes();
        let allCorefEvents = [];
        for (let i = 0; i < allRelAxes.length; i++) {
            const corefEvents = allRelAxes[i].getAxisGraph().getAllCoreferringEvents(eventId);
            for (let j = 0; j < corefEvents.length; j++) {
                allCorefEvents.push(this._allAxes.getEventByEventId(corefEvents[j]));
            }
        }

        return allCorefEvents;
    }

    getPosFormRel() {
        throw new Error("This method must be implemented by the subclass");
    }

    getNegFormRel() {
        throw new Error("This method must be implemented by the subclass");
    }

    getAllRelevantRelations(eventId) {
        throw new Error("This method must be implemented by the subclass");
    }

    getQuestionText(eventInFocus) {
        throw new Error("This method must be implemented by the subclass");
    }

    getDropDownTitle() {
        throw new Error("This method must be implemented by the subclass");
    }

    getQuestion(eventInFocus) {
        const divQuestion1 = document.createElement("div");
        const question1 = document.createElement("h2");
        question1.innerHTML = this.getQuestionText(eventInFocus);
        divQuestion1.appendChild(question1);

        let items = this.getAllRelevantRelations(eventInFocus.getId());
        const withinListPairsByType = this._allAxes.getMainAxis().getAxisGraph().getWithinListPairsByType(items, this.formType);

        const dropdown = document.createElement("div");
        dropdown.id = "list1";
        dropdown.className = "dropdown-check-list";
        dropdown.tabIndex = "100";

        const spanText = document.createElement('span');
        spanText.className = "anchor";
        spanText.innerHTML = this.getDropDownTitle();
        dropdown.classList.add('visible');

        dropdown.appendChild(spanText);
        const allItems = document.createElement('ul');
        allItems.className = "items";
        for (let i = 0; i < items.length; i++) {
            const container = document.createElement('li');
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = items[i].getFirstId();
            checkbox.checked = items[i].getRelation() === this.getPosFormRel();

            const textElem = document.createElement('span');
            textElem.innerHTML = this._allAxes.getEventByEventId(items[i].getFirstId()).getTokens();
            if (withinListPairsByType != null && withinListPairsByType.has(i)) {
                textElem.style.color = "green";
                textElem.style.fontWeight = "bold";
            }

            container.appendChild(checkbox);
            container.appendChild(textElem);
            allItems.appendChild(container);
        }

        dropdown.appendChild(allItems);
        divQuestion1.appendChild(dropdown);
        this.highlightRelRelations(eventInFocus);
        return divQuestion1;
    }

    createUI() {
        cleanQuestions();
        let eventInFocus = null;
        if (this._annotations.length > 0) {
            eventInFocus = this._annotations[this._annotationIndex];
        }

        const questions = document.getElementById("questions");
        const summaryPanel = document.createElement("div");
        if (config.app.includeAnchor === true && config.app.includeAxis === true) {
            createAndAddAxisColorBoxes(questions);
        }

        const buttonBackTask = this.createPrevTaskButton();
        const buttonNextTask = this.createNextTaskButton();
        const paragraph = document.createElement("p");
        if (eventInFocus != null) {
            paragraph.innerHTML = this.formatText(eventInFocus);
            summaryPanel.appendChild(paragraph);

            const divQuestion1 = this.getQuestion(eventInFocus);
            summaryPanel.appendChild(divQuestion1);
            summaryPanel.appendChild(document.createElement("br"));
            summaryPanel.appendChild(buttonBackTask);
            summaryPanel.appendChild(this.createBackButton("Back"));
            summaryPanel.appendChild(this.createNextButton("Next"));

            if (this.addNextUnhandled === true) {
                let nextUnhldButt = this.createUnhandledNextButton("Next Unhandled Pair");
                nextUnhldButt.disabled = false;
                summaryPanel.appendChild(nextUnhldButt);
            }

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

        refreshGraphElem(this.formType);
        this.highlightRelRelations(eventInFocus);
    }

    highlightRelRelations(eventInFocus) {
        if (eventInFocus !== null) {
            const allPairs = this.getAllRelevantRelations(eventInFocus.getId());
            for (let i = 0; i < allPairs.length; i++) {
                highlightCurrentPair(allPairs[i]);
            }
        }
    }

    formatText(eventInFocus) {
        let text = [...this._allAxes.getMainDocTokens()];
        const allEvents = this._annotations;
        let start1Idx = eventInFocus.getTokensIds()[0];
        let end1Idx = eventInFocus.getTokensIds().at(-1);

        for (let i = 0; i < allEvents.length; i++) {
            const eventStartIds = allEvents[i].getTokensIds()[0];
            const eventEndIds = allEvents[i].getTokensIds().at(-1);
            for (let i = eventStartIds; i <= eventEndIds; i++) {
                text[i] = `<span style=\"font-weight: bold;\">${text[i]}</span>`;
            }
        }

        for (let i = start1Idx; i <= end1Idx; i++) {
            text[i] = `<span style=\"color:royalblue; font-weight: bold;\">${text[i]}</span>`;
        }

        const allEqualPairs = this.getAllRelevantRelations(eventInFocus.getId());
        for (let i = 0; i < allEqualPairs.length; i++) {
            let curEvent = this._allAxes.getEventByEventId(allEqualPairs[i].getFirstId());
            let start2Idx = curEvent.getTokensIds()[0];
            let end2Idx = curEvent.getTokensIds().at(-1);
            for (let i = start2Idx; i <= end2Idx; i++) {
                text[i] = `<span style=\"color:orangered; font-weight: bold;\">${text[i]}</span>`;
            }
        }

        return text.join(" ");
    }

    annotationRemainder() {
        return -1;
    }

    getSelectedItems() {
        const checkedItems = [];
        const uncheckedItems = [];
        const checkboxes = document.querySelectorAll('#list1 .items input[type="checkbox"]');

        checkboxes.forEach((checkbox) => {
            if (checkbox.checked) {
                const selEventId = checkbox.value;
                checkedItems.push(selEventId);
            } else {
                const selEventId = checkbox.value;
                uncheckedItems.push(selEventId);
            }
        });

        return [checkedItems, uncheckedItems];
    }

    handleManualNodeSelection() {
        this._selectedNodes = this._selectedNodes.slice(0, 2);

        Swal.fire({
            icon: "error",
            title: 'Graph Pair Selection Not Supported',
            html:
                '<p>Selecting pairs in graph is not supported</p>',
            showCancelButton: false,
            confirmButtonText: 'OK',
            allowOutsideClick: false,
            scrollbarPadding: true
        });
    }
}