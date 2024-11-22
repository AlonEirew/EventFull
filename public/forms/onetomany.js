class OneToManyForm extends UIForm {
    constructor(pageIndex, allAxes, allAxesPairs, formType, addNextUnhandled, isHandleDiscrepancies) {
        super(pageIndex, allAxes, allAxesPairs);
        this.formType = formType;
        this._selectedNodes = [];
        this.addNextUnhandled = addNextUnhandled;
        this.isHandleDiscrepancies = isHandleDiscrepancies;
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

            if (this.isHandleDiscrepancies && discrepancies.length > 0) {
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
        question1.style.color = "black";
        divQuestion1.appendChild(question1);

        let items = this.getAllRelevantRelations(eventInFocus.getId());
        const withinListPairsByType = this._allAxes.getMainAxis().getAxisGraph().getWithinListPairsByType(items, this.formType);

        const dropdown = document.createElement("div");
        dropdown.id = "list1";
        dropdown.className = "dropdown-check-list";
        dropdown.tabIndex = 100;

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
            textElem.innerHTML = this._allAxes.getEventByEventId(items[i].getFirstId()).getTokensWithEventId();
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
        const buttonBackTask = this.createPrevTaskButton();
        const buttonNextTask = this.createNextTaskButton();
        const paragraph = document.createElement("p");
        paragraph.style.backgroundColor = "#EBF5FB";

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
                let nextUnhldButt = this.createUnhandledNextButton("Next Unhandled Event");
                nextUnhldButt.disabled = false;
                summaryPanel.appendChild(nextUnhldButt);
            }

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

    handleDiscrepancies(discrepancy) {
        const disRootEdge = this._allAxes.getEventByEventId(discrepancy[0]).getTokens();
        const disOtherEdge = this._allAxes.getEventByEventId(discrepancy[1]).getTokens();
        // Handle presenting k
        const currentRelation = discrepancy[3];
        const inferredRelation = discrepancy[4];

        Swal.fire({
            icon: "info",
            title: 'Cluster Update!',
            html:
                '<p>Your last selection has change the relation between two events.<br/><br/>' +
                'The relation currently set between the events: <span style=\"color:orangered; font-weight: bold;\">' + disRootEdge +'</span> and ' +
                '<span style=\"color:orangered; font-weight: bold;\">' + disOtherEdge + '</span> is <span style=\"color:royalblue; font-weight: bold;\">' +
                currentRelation + '</span>. However, due to your last selection, the events can be inferred as having a ' +
                '<span style=\"color:royalblue; font-weight: bold;\">' + inferredRelation + '</span> relation. This will be fixed automaticly to maintain consistency with your last selection.<br/><br/>' +
                '<span style=\"font-weight: bold;\">Make sure this is correct, and continue by clicking again on the \"next\" button.</p>',
            showCancelButton: false,
            confirmButtonText: 'OK',
            allowOutsideClick: false,
            scrollbarPadding: true
        });
    }

    formatText(eventInFocus) {
        let text = [...this._allAxes.getMainDocTokens()];
        const allEvents = this._annotations;
        let start1Idx = eventInFocus.getTokensIds()[0];
        let end1Idx = eventInFocus.getTokensIds().at(-1);
        let handledIds = new Set();

        for (let i = 0; i < allEvents.length; i++) {
            const eventStartId = allEvents[i].getTokensIds()[0];
            const eventEndId = allEvents[i].getTokensIds().at(-1);
            for (let j = eventStartId; j <= eventEndId; j++) {
                text[j] = `<span style=\"font-weight: bold;\">${text[j]}`;
            }

            text[eventEndId] += " (" + allEvents[i].getId() + ")</span>";
            handledIds.add(allEvents[i].getId());
        }

        for (let i = start1Idx; i <= end1Idx; i++) {
            text[i] = `<span class=\"label ANC\">${text[i]}</span>`;
        }

        const allRelevantPairs = this.getAllRelevantRelations(eventInFocus.getId());
        for (let i = 0; i < allRelevantPairs.length; i++) {
            let curEvent = this._allAxes.getEventByEventId(allRelevantPairs[i].getFirstId());
            let start2Idx = curEvent.getTokensIds()[0];
            let end2Idx = curEvent.getTokensIds().at(-1);
            for (let j = start2Idx; j <= end2Idx; j++) {
                text[j] = `<span class=\"label NOT\">${text[j]}`;
            }

            if (!handledIds.has(curEvent.getId())) {
                text[end2Idx] += " (" + curEvent.getId() + ")</span>";
                handledIds.add(curEvent.getId());
            } else {
                text[end2Idx] += "</span>";
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