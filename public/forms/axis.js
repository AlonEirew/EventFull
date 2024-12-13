// ####################################################
// ################# axis functions #################
// ####################################################

class AxisForm extends UIForm {
    constructor(pageIndex, allAxes) {
        if (allAxes != null) {
            super(pageIndex, allAxes, allAxes.getAllAxesEventsSorted());
        }
    }

    getInstructions() {
        return config.instFiles.axis;
    }

    handleSelection(selectedAxisType, annotationIndex) {
        if (selectedAxisType != null) {
            if (selectedAxisType !== this._annotations[annotationIndex].getAxisType()) {
                console.log("User AxisType selection: " + selectedAxisType);
                this._allAxes.removeEventFromAxes(this._annotations[annotationIndex]);
                this._annotations[annotationIndex].setAxisTypeFromOption(selectedAxisType);
                this._allAxes.addEventToAxes(this._annotations[annotationIndex]);
            }
        }

        return true;
    }

    createUI() {
        const leftPanel = document.getElementById("questions");
        const rightPanel = document.getElementById("axis-inst");

        cleanPanel(leftPanel);
        cleanPanel(rightPanel);

        rightPanel.style.display = "block";

        const question = document.createElement("h2");
        question.innerHTML = this.getQuestion(this._annotations[this._annotationIndex]);
        question.id = "axisQuestion";
        rightPanel.appendChild(question);
        addLegend(rightPanel);

        const paragraph = this.getParagraph();
        paragraph.innerHTML = this.formatText();
        leftPanel.appendChild(paragraph);

        let buttContainer = this.createButtonContainer(false, true, false);
        leftPanel.appendChild(buttContainer);

        const nextTaskButton = document.getElementById("next-task");
        nextTaskButton.disabled = pages[currentPageIdx].annotationRemainder() !== 0;

        if (config.app.showRemainingAnnot === true) {
            leftPanel.appendChild(this.getAnnotationsRemainderElem());
        }
    }

    getQuestion(event) {
        // return "Can the event (<span style=\"color:red\">" + event.getTokens() + "</span>) be anchored in time?";
        return "Select the events that can be anchored in time, for more details see the instructions.";
    }

    formatText() {
        let mention = this._annotations[this._annotationIndex];
        let text = [...this._allAxes.getMainDocTokens()];
        const allEvents = this._allAxes.getAllAxesEventsSorted();
        for (let eventIdx = 0; eventIdx < allEvents.length; eventIdx++) {
            if (eventIdx === mention.getEventIndex()) {
                let startIdx = mention.getTokensIds()[0];
                let endIdx = mention.getTokensIds().at(-1);
                for (let i = startIdx; i <= endIdx; i++) {
                    this.setAxisSpan(mention, eventIdx, text, i);
                }
            } else {
                let startIdx = allEvents[eventIdx].getTokensIds()[0];
                let endIdx = allEvents[eventIdx].getTokensIds().at(-1);
                for (let i = startIdx; i <= endIdx; i++) {
                    this.setAxisSpan(allEvents[eventIdx], eventIdx, text, i);
                }
            }
        }

        return text.join(" ");
    }

    setAxisSpan(mention, annotationIndex, text, i) {
        switch (mention.getAxisType()) {
            case AxisType.MAIN:
                text[i] = `<span class=\"label ANC\" onclick=\"showSpanOptions(event, ${annotationIndex})\">${text[i]}</span>`;
                break;
            case AxisType.NOT_EVENT:
                text[i] = `<span class=\"label NOT\" onclick=\"showSpanOptions(event, ${annotationIndex})\">${text[i]}</span>`;
                break;
            default:
                text[i] = `<span class=\"label NA\" onclick=\"showSpanOptions(event, ${annotationIndex})\">${text[i]}</span>`;
                break;
        }
    }

    annotationRemainder() {
        let count = this._annotations.length;
        for (let i = 0; i < this._annotations.length; i++) {
            if (this._annotations[i].getAxisType() !== AxisType.NA) {
                count--;
            }
        }

        return count;
    }
}

function showSpanOptions(event, annotationIndex) {
    const span = event.target;

    let selectedAxisType = null;
    if (span.className === "label NA") {
        selectedAxisType = AxisType.MAIN;
        span.className = "label ANC";
    } else if (span.className === "label ANC") {
        selectedAxisType = AxisType.NOT_EVENT;
        span.className = "label NOT";
    } else if (span.className === "label NOT") {
        selectedAxisType = AxisType.NA;
        span.className = "label NA";
    }

    if (selectedAxisType != null) {
        pages[currentPageIdx].handleSelection(selectedAxisType, annotationIndex);
        const nextTaskButton = document.getElementById("next-task");
        nextTaskButton.disabled = pages[currentPageIdx].annotationRemainder() !== 0;
    }
}

function addLegend(container) {
    // Define the legend items
    const legendItems = [
        { colorClass: "ANC", description: "Events to be considered in the next steps" },
        { colorClass: "NOT", description: "Events to exclude from the next steps" },
        { colorClass: "NA", description: "Events requiring annotation" },
    ];

    // Create a legend container
    const legend = document.createElement("div");
    legend.className = "legend";

    // Add legend items
    legendItems.forEach((item) => {
        const legendItem = document.createElement("div");
        legendItem.className = "legend-item";

        const colorBox = document.createElement("span");
        colorBox.className = `legend-color ${item.colorClass}`; // Use the same classes as spans
        colorBox.textContent = "\u00A0\u00A0"; // Add space for visibility

        const description = document.createElement("span");
        description.className = "legend-description";
        description.textContent = ` = ${item.description}`;

        legendItem.appendChild(colorBox);
        legendItem.appendChild(description);
        legend.appendChild(legendItem);
    });

    // Append the legend to the container
    container.appendChild(legend);
}
