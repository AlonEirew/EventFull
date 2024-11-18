// ####################################################
// ################# axis functions #################
// ####################################################
const options = ["Yes - It's anchorable", "No"];

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
        cleanQuestions();
        const questions = document.getElementById("questions");
        const paragraph = this.getParagraph();

        const question = document.createElement("h2");
        question.innerHTML = this.getQuestion(this._annotations[this._annotationIndex]);
        question.style.color = "black";
        questions.appendChild(question);

        paragraph.innerHTML = this.formatText();
        questions.appendChild(paragraph);

        if (this.annotationRemainder() === 0 && document.getElementById("next-task") == null) {
            const questions = document.getElementById("questions");
            questions.appendChild(this.createNextTaskButton());
        }

        if (config.app.showRemainingAnnot === true) {
            questions.appendChild(this.getAnnotationsRemainderElem());
        }
    }

    getQuestion(event) {
        // return "Can the event (<span style=\"color:red\">" + event.getTokens() + "</span>) be anchored in time?";
        return "Select the events that can be anchored in time, for details see the instructions.";
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
                    this.setAxisSpan(mention, eventIdx, text, i, true);
                }
            } else {
                let startIdx = allEvents[eventIdx].getTokensIds()[0];
                let endIdx = allEvents[eventIdx].getTokensIds().at(-1);
                for (let i = startIdx; i <= endIdx; i++) {
                    this.setAxisSpan(allEvents[eventIdx], eventIdx, text, i, false);
                }
            }
        }

        return text.join(" ");
    }

    setAxisSpan(mention, annotationIndex, text, i, weight) {
        let fontWeight = "normal";
        let border = "";
        if (weight) {
            fontWeight = "bold";
            border = '2px solid black'
        } else {
            fontWeight = "normal";
            border = "none";
        }

        switch (mention.getAxisType()) {
            case AxisType.MAIN:
                text[i] = `<span class=\"label ANC\" onclick=\"showSpanOptions(event, ${annotationIndex})\" style=\"font-weight: ${fontWeight}; border: ${border};\">${text[i]}</span>`;
                break;
            case AxisType.NOT_EVENT:
                text[i] = `<span class=\"label NOT\" onclick=\"showSpanOptions(event, ${annotationIndex})\" style=\"font-weight: ${fontWeight}; border: ${border};\">${text[i]}</span>`;
                break;
            default:
                text[i] = `<span class=\"label NA\" onclick=\"showSpanOptions(event, ${annotationIndex})\" style=\"font-weight: ${fontWeight}; border: ${border};\">${text[i]}</span>`;
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

    axisToOption(axisType) {
        if (axisType === AxisType.MAIN) {
            return options[0];
        } else if (axisType === AxisType.NOT_EVENT) {
            return options[1];
        } else {
            throw new Error('Invalid axis type');
        }
    }
}

function showSpanOptions(event, annotationIndex) {
    const span = event.target;

    const dropdownAnchor = document.createElement("div");
    dropdownAnchor.id = "dropdown-anchor";
    dropdownAnchor.className = "dropdown-anchor";

    const dropdownAnchorOpt = document.createElement("div");
    dropdownAnchorOpt.className = "dropdown-anchor-options";

    const button1 = document.createElement("button");
    button1.onclick = () => selectOption(annotationIndex, 'Yes - It\'s anchorable', dropdownAnchor, span);
    button1.innerHTML = 'Yes - It\'s anchorable';

    const button2 = document.createElement("button");
    button2.onclick = () => selectOption(annotationIndex, 'No', dropdownAnchor, span);
    button2.innerHTML = 'No';
    dropdownAnchorOpt.appendChild(button1);
    dropdownAnchorOpt.appendChild(button2);

    dropdownAnchor.appendChild(dropdownAnchorOpt);
    document.body.appendChild(dropdownAnchor);

    const rect = span.getBoundingClientRect();
    dropdownAnchor.style.left = `${rect.left + window.scrollX}px`;
    dropdownAnchor.style.top = `${rect.bottom + window.scrollY}px`;

    // Show the dropdown
    dropdownAnchor.style.display = "block";

    // Close the dropdown if clicked outside
    document.addEventListener("click", function closeDropdown(e) {
        if (!dropdownAnchor.contains(e.target) && e.target !== span) {
            dropdownAnchor.style.display = "none";
            document.removeEventListener("click", closeDropdown);
        }
    });
}

function selectOption(annotationIndex, option, dropdown, span) {
    // const dropdown = document.getElementById("dropdown-anchor");
    dropdown.style.display = "none";

    let selectedAxisType = convertOptionToAxis(option, span);
    pages[currentPageIdx].handleSelection(selectedAxisType, annotationIndex);

    if (pages[currentPageIdx].annotationRemainder() === 0 && document.getElementById("next-task") == null) {
        const questions = document.getElementById("questions");
        questions.appendChild(pages[currentPageIdx].createNextTaskButton());
    }
}

function convertOptionToAxis(value, span) {
    if (value === options[0]) {
        span.className = "label ANC";
        return AxisType.MAIN;
    } else if (value === options[1]) {
        span.className = "label NOT";
        return AxisType.NOT_EVENT;
    } else {
        span.className = "label NA";
        return AxisType.NA;
    }
}