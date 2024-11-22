class UIForm {
    constructor(pageIdx, allAxes, annotations) {
        this._allAxes = allAxes;
        this._annotations = annotations;
        this._annotationIndex = 0;
    }

    getInstructions() {
        throw new Error("Method 'getInstructions()' must be implemented.");
    }

    loadForm() {
        readInstructions(this.getInstructions());
        const title = document.getElementById("title");
        title.innerHTML = pageTitles[currentPageIdx];
        this.createUI();
    }

    handleSelection() {
        throw new Error("Method 'handleSelection()' must be implemented.");
    }

    nextClick() {
        if(this.handleSelection()) {
            if (this._annotationIndex < this._annotations.length - 1) {
                this._annotationIndex++;
            }

            this.createUI();
        }
    }

    backClick() {
        if(this.handleSelection()) {
            if (this._annotationIndex > 0) {
                this._annotationIndex--;
            }
        }

        this.createUI();
    }

    getParagraph() {
        const paragraph = document.createElement("p");
        paragraph.className = "paragraph";
        paragraph.id = "paragraph";
        return paragraph;
    }

    disableAllChildren(component) {
        if (component != null) {
            let childNodes = component.childNodes;
            if (childNodes.length > 0) {
                childNodes.forEach((child) => {
                    this.disableAllChildren(child);
                    child.disabled = true;
                });
            }
        }
    }

    enableAllChildren(component) {
        if (component != null) {
            let childNodes = component.childNodes;
            if (childNodes.length > 0) {
                childNodes.forEach((child) => {
                    this.enableAllChildren(child);
                    child.disabled = false;
                });
            }
        }
    }

    createButtonContainer(isBackTask, isNextTask, isNextUnhandled) {
        const buttonContainer = document.createElement("div");
        buttonContainer.className = "button-container";
        buttonContainer.id = "button-container";
        const nextTaskButton = this.createNextTaskButton();
        nextTaskButton.style.marginRight = "0";

        const centerWrapper = document.createElement("div");

        const nextButton = this.createNextButton("Next");
        const backButton = this.createBackButton("Prev");
        const unhandledNextButton = this.createUnhandledNextButton("Next Unhandled");
        centerWrapper.appendChild(backButton);
        centerWrapper.appendChild(nextButton);
        centerWrapper.appendChild(unhandledNextButton);

        const prevTaskButton = this.createPrevTaskButton();
        prevTaskButton.style.marginLeft = "0";

        buttonContainer.appendChild(prevTaskButton); // Left-aligned

        if (!isBackTask) {
            prevTaskButton.disabled = true;
        }

        if (isNextUnhandled) {
            unhandledNextButton.disabled = false;
            buttonContainer.appendChild(centerWrapper); // Center-aligned
        }

        buttonContainer.appendChild(nextTaskButton); // Right-aligned

        if (!isNextTask) {
            nextTaskButton.disabled = true;
        }

        return buttonContainer;
    }

    createNextTaskButton() {
        const buttonNextTask = document.createElement("button");
        buttonNextTask.type = "button";
        buttonNextTask.id = "next-task";
        buttonNextTask.className = "button-next-task";
        if (currentPageIdx < pages.length - 1) {
            buttonNextTask.innerHTML = "Next Task";
        } else {
            buttonNextTask.innerHTML = "Done?";
        }

        buttonNextTask.onclick = function() {
            pages[currentPageIdx].handleSelection();
            if (pages[currentPageIdx].isFinalized()) {
                toggleGraphDivOff();
                // pages[currentPageIdx].nextClick();
                if (currentPageIdx < pages.length - 1) {
                    currentPageIdx++;
                    pages[currentPageIdx].loadForm();
                } else {
                    for (let i = 0; i < pages.length; i++) {
                        if (pages[i].annotationRemainder() > 0) {
                            currentPageIdx = i;
                            pages[currentPageIdx].loadForm();
                            pages[currentPageIdx].nextUnhandledClick();
                            Swal.fire({
                                icon: "info",
                                title: 'Annotation Not Complete',
                                html:
                                    '<p>Almost done, moving to unhandled annotation</p>',
                                showCancelButton: false,
                                confirmButtonText: 'OK',
                                allowOutsideClick: false,
                                scrollbarPadding: true
                            });
                            return;
                        }
                    }
                    showAnnotCompleteAlert();
                }
            }
        }

        return buttonNextTask;
    }

    isFinalized() {
        return true;
    }

    createPrevTaskButton() {
        const buttonBackTask = document.createElement("button");
        buttonBackTask.type = "button";
        buttonBackTask.className = "button-next-task";
        buttonBackTask.innerHTML = "Prev Task";
        buttonBackTask.onclick = function() {
            const title = document.getElementById("title");
            toggleGraphDivOff();
            pages[currentPageIdx].handleSelection();
            // pages[currentPageIdx].backClick();
            currentPageIdx--;
            title.innerHTML = pageTitles[currentPageIdx];
            pages[currentPageIdx].loadForm();
        }

        return buttonBackTask;
    }

    createUI() {
        throw new Error("Method 'createUI()' must be implemented.");
    }

    formatText() {
        throw new Error("Method 'formatText()' must be implemented.");
    }

    getRadiosSelected(radiosName) {
        const radios = document.getElementsByName(radiosName);
        let selectedValue = null;
        if (radios != null && radios.length > 0) {
            for (const radio of radios) {
                if (radio.checked) {
                    selectedValue = radio.value;
                    break;
                }
            }
        }

        return selectedValue;
    }

    getQuestion(pair) {
        throw new Error("Not implemented");
    }

    getAnnotationsRemainderElem() {
        const anchorRemains = this.annotationRemainder();
        const countPer = document.createElement("p");
        countPer.style.color = "red";
        countPer.innerHTML = "Remaining events to annotate = " + anchorRemains;
        return countPer;
    }

    annotationRemainder() {
        throw new Error("Method 'annotationRemainder()' must be implemented.");
    }

    createUnhandledNextButton(text) {
        const buttonNext = this.createButton(text);
        buttonNext.id = "nextUnhandled";
        buttonNext.disabled = true;
        buttonNext.onclick = function () {
            const curPage = pages[currentPageIdx];
            curPage.nextUnhandledClick();
        };
        return buttonNext;
    }

    getNextUnhandledAnnotation() {
        throw new Error("Method 'getNextUnhandledAnnotation()' must be implemented.");
    }

    nextUnhandledClick() {
        if (this.handleSelection()) {
            if (this.getNextUnhandledAnnotation()) {
                this.createUI();
            } else if(!this.isFinalized()) {
                this.createUI();
            } else {
                Swal.fire({
                    icon: "success",
                    title: 'No More Unhandled Pairs!',
                    html: '<p>Well done!\nYou can proceed to next step.</p>',
                    showCancelButton: false,
                    confirmButtonText: 'OK',
                    allowOutsideClick: false,
                    scrollbarPadding: true
                });

                this.createUI();
            }
        }
    }

    createNextButton(text) {
        const buttonNext = this.createButton(text);
        buttonNext.onclick = function () {
            const curPage = pages[currentPageIdx];
            curPage.nextClick();
        };

        return buttonNext;
    }

    createBackButton(text) {
        const buttonBack = this.createButton(text);
        buttonBack.onclick = function () {
            const curPage = pages[currentPageIdx];
            curPage.backClick();
        };

        return buttonBack;
    }

    createButton(text) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "button";
        button.innerHTML = text;
        return button;
    }
}