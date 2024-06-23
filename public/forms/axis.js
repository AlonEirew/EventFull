// ####################################################
// ################# axis functions #################
// ####################################################
const options = ["Yes. It's anchorable", "No. It's intention/wish/opinion", "No. It's hypothetical/condition",
    "No. It's negation", "No. It's abstract/non-specific", "No. It's static", "No. It's recurrent", "No. It's not an event OR it's a causation event"];

class AxisForm extends UIForm {
    constructor(pageIndex, allAxes) {
        if (allAxes != null) {
            super(pageIndex, allAxes, allAxes.getAllAxesEventsSorted());
        }
    }

    getInstructions() {
        return config.instFiles.axis;
    }

    handleSelection() {
        const radiosSelected = this.getRadiosSelected("multiChoice");
        if (radiosSelected != null) {
            let selectedAxisType = AllAxes.convertSelectionFromOption(radiosSelected);
            if (selectedAxisType !== this._annotations[this._annotationIndex].getAxisType()) {
                console.log("User AxisType selection: " + selectedAxisType);
                this._allAxes.removeEventFromAxes(this._annotations[this._annotationIndex]);
                this._annotations[this._annotationIndex].setAxisTypeFromOption(selectedAxisType);
                this._allAxes.addEventToAxes(this._annotations[this._annotationIndex]);
            }
        }

        return true;
    }

    createUI() {
        cleanQuestions();
        const questions = document.getElementById("questions");
        const paragraph = document.createElement("p");

        paragraph.innerHTML = this.formatText();
        questions.appendChild(paragraph);

        const question = document.createElement("h2");
        question.innerHTML = this.getQuestion(this._annotations[this._annotationIndex]);
        questions.appendChild(question);

        let selectedValue = null;
        if (this._annotations[this._annotationIndex].getAxisType() !== AxisType.NA) {
            const selectAxisType = this._annotations[this._annotationIndex].getAxisType();
            selectedValue = this.axisToOption(selectAxisType);
        }

        let hasSelected = null;
        for (let j = 0; j < options.length; j++) {
            const input = getOption(options[j], "multiChoice");

            if (j === 0) {
                hasSelected = input;
            }

            if (selectedValue === options[j]) {
                hasSelected = input;
            }

            questions.appendChild(input);
            questions.appendChild(document.createTextNode(options[j]));
            questions.appendChild(document.createElement("br"));
        }

        hasSelected.checked = true;

        questions.appendChild(this.createBackButton("Back"));
        questions.appendChild(this.createNextButton("Next"));

        if (this.annotationRemainder() === 0 && document.getElementById("next-task") == null) {
            const questions = document.getElementById("questions");
            questions.appendChild(this.createNextTaskButton());
        }

        if (config.app.showRemainingAnnot === true) {
            questions.appendChild(this.getAnnotationsRemainderElem());
        }
    }

    getQuestion(event) {
        return "Can the event (<span style=\"color:red\">" + event.getTokens() + "</span>) be anchored in time?";
    }

    formatText() {
        let event = this._annotations[this._annotationIndex];
        let text = [...this._allAxes.getMainDocTokens()];
        const allEvents = this._allAxes.getAllAxesEventsSorted();
        for (let eventIdx = 0; eventIdx < allEvents.length; eventIdx++) {
            if (eventIdx === event.getEventIndex()) {
                let startIdx = event.getTokensIds()[0];
                let endIdx = event.getTokensIds().at(-1);
                for (let i = startIdx; i <= endIdx; i++) {
                    this.setAxisSpan(event, text, i, true);
                }
            } else {
                let startIdx = allEvents[eventIdx].getTokensIds()[0];
                let endIdx = allEvents[eventIdx].getTokensIds().at(-1);
                for (let i = startIdx; i <= endIdx; i++) {
                    this.setAxisSpan(allEvents[eventIdx], text, i, false);
                }
            }
        }

        return text.join(" ");
    }

    setAxisSpan(event, text, i, weight) {
        let fontWeight = "normal";
        let border = "";
        if (weight) {
            fontWeight = "bold";
            border = '2px solid black'
        } else {
            fontWeight = "normal";
            border = "none";
        }

        switch (event.getAxisType()) {
            case AxisType.MAIN:
                text[i] = `<span class=\"label ANC\" style=\"font-weight: ${fontWeight}; border: ${border};\">${text[i]}</span>`;
                break;
            case AxisType.INTENT:
                text[i] = `<span class=\"label INT\" style=\"font-weight: ${fontWeight}; border: ${border};\">${text[i]}</span>`;
                break;
            case AxisType.HYPOTHETICAL:
                text[i] = `<span class=\"label HYP\" style=\"font-weight: ${fontWeight}; border: ${border};\">${text[i]}</span>`;
                break;
            case AxisType.NEGATION:
                text[i] = `<span class=\"label NEG\" style=\"font-weight: ${fontWeight}; border: ${border};\">${text[i]}</span>`;
                break;
            case AxisType.ABSTRACT:
                text[i] = `<span class=\"label ABS\" style=\"font-weight: ${fontWeight}; border: ${border};\">${text[i]}</span>`;
                break;
            case AxisType.STATIC:
                text[i] = `<span class=\"label STT\" style=\"font-weight: ${fontWeight}; border: ${border};\">${text[i]}</span>`;
                break;
            case AxisType.RECURRENT:
                text[i] = `<span class=\"label REC\" style=\"font-weight: ${fontWeight}; border: ${border};\">${text[i]}</span>`;
                break;
            case AxisType.NOT_EVENT:
                text[i] = `<span class=\"label NOT\" style=\"font-weight: ${fontWeight}; border: ${border};\">${text[i]}</span>`;
                break;
            default:
                text[i] = `<span class=\"label NA\" style=\"font-weight: ${fontWeight}; border: ${border};\">${text[i]}</span>`;
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
        } else if (axisType === AxisType.INTENT) {
            return options[1];
        } else if (axisType === AxisType.HYPOTHETICAL) {
            return options[2];
        } else if (axisType === AxisType.NEGATION) {
            return options[3];
        } else if (axisType === AxisType.ABSTRACT) {
            return options[4];
        } else if (axisType === AxisType.STATIC) {
            return options[5];
        } else if (axisType === AxisType.RECURRENT) {
            return options[6];
        } else if (axisType === AxisType.NOT_EVENT) {
            return options[7];
        } else {
            throw new Error('Invalid axis type');
        }
    }
}