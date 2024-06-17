// ####################################################
// ################# anchor functions ################
// ####################################################

class AnchorForm extends UIForm {
    constructor(pageIndex, allAxes) {
        super(pageIndex, allAxes, AnchorForm.getFormAnnotation(allAxes));
    }

    static getFormAnnotation(allAxis) {
        let intentEvents = [];
        let allAxesEvents = allAxis.getAllAxesEventsSorted();
        for (let i = 0; i < allAxesEvents.length; i++) {
            if (allAxesEvents[i].getAxisType() === AxisType.INTENT) {
                intentEvents.push(allAxesEvents[i]);
            }
        }

        return intentEvents;
    }

    getInstructions() {
        return config.instFiles.anchor;
    }

    loadForm() {
        this._annotations = AnchorForm.getFormAnnotation(this._allAxes);
        if(this._annotationIndex !== 0 && this._annotationIndex >= this._annotations.length) {
            this._annotationIndex = this._annotations.length - 1;
        }

        super.loadForm();
    }

    handleSelection() {
        const radiosSelected = this.getRadiosSelected("multiChoice");
        if (radiosSelected != null && this._annotations.length !== 0) {
            let rootEventIdBefore = this._annotations[this._annotationIndex].getRootAxisEventId();
            let allAxesEvents = this._allAxes.getAllAxesEventsSorted();
            if (rootEventIdBefore !== allAxesEvents[radiosSelected].getId()) {
                this._allAxes.removeIntentEventFromIntentAxes(this._annotations[this._annotationIndex], rootEventIdBefore);
                this._annotations[this._annotationIndex].setRootAxisEventId(allAxesEvents[radiosSelected].getId());
                this._allAxes.addEventToIntentAxis(this._annotations[this._annotationIndex]);
            }
        }

        return true;
    }

    createUI() {
        cleanQuestions();
        const questions = document.getElementById("questions");
        const paragraph = document.createElement("p");
        if (this._annotations.length !== 0) {
            let event = this._annotations[this._annotationIndex];
            paragraph.innerHTML = this.formatText(event);
            questions.appendChild(paragraph);
            questions.appendChild(this.createPrevTaskButton());
            questions.appendChild(this.createBackButton("Back"));
            questions.appendChild(this.createNextButton("Next"));

            if (this.annotationRemainder() === 0) {
                questions.appendChild(this.createNextTaskButton());
            }

            if (config.app.showRemainingAnnot === true) {
                questions.appendChild(this.getAnnotationsRemainderElem());
            }

        } else {
            paragraph.innerHTML = "<p><b>Nothing to anchor! You can proceed to the next task.</b></p>";
            questions.appendChild(paragraph);
            questions.appendChild(this.createPrevTaskButton());
            questions.appendChild(this.createNextTaskButton());
        }
    }

    formatText(event) {
        let text = [...this._allAxes.getMainDocTokens()];
        const allEvents = this._allAxes.getAllAxesEventsSorted();
        for (let eventIdx = 0; eventIdx < allEvents.length; eventIdx++) {
            if (eventIdx === event.getEventIndex()) {
                let startIdx = event.getTokensIds()[0];
                let endIdx = event.getTokensIds().at(-1);
                for (let i = startIdx; i <= endIdx; i++) {
                    text[i] = `<span style=\"color:orangered; font-weight: bold;\">${text[i]}</span>`;
                }
            } else if (allEvents[eventIdx].getAxisType() !== AxisType.MAIN) {
            } else {
                let startIdx = allEvents[eventIdx].getTokensIds()[0];
                let endIdx = allEvents[eventIdx].getTokensIds().at(-1);
                if (allEvents[event.getEventIndex()].getRootAxisEventId() === allEvents[eventIdx].getId()) {
                    text[startIdx] = `<span style=\"color:royalblue; font-weight: bold;\"><input name=\"multiChoice\" value=\"${eventIdx}\" type=\"radio\" checked>${text[startIdx]}</span>`;
                    for (let i = startIdx + 1; i <= endIdx; i++) {
                        text[i] = `<span style=\"color:royalblue; font-weight: bold;\">${text[i]}</span>`;
                    }
                } else {
                    text[startIdx] = `<span style=\"color:royalblue; font-weight: bold;\"><input name=\"multiChoice\" value=\"${eventIdx}\" type=\"radio\">${text[startIdx]}</span>`;
                    for (let i = startIdx + 1; i <= endIdx; i++) {
                        text[i] = `<span style=\"color:royalblue; font-weight: bold;\">${text[i]}</span>`;
                    }
                }
            }
        }

        return text.join(" ");
    }

    annotationRemainder() {
        let count = this._annotations.length;
        for (let i = 0; i < this._annotations.length; i++) {
            if (this._annotations[i].getRootAxisEventId() !== -1) {
                count--;
            }
        }

        return count;
    }
}