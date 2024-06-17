class ProjectionForm extends UIForm {
    constructor(pageIndex, allAxes) {
        if (allAxes != null) {
            super(pageIndex, allAxes, allAxes.getAllAxesEventsSorted());
            this.srcDocDict = allAxes.getSources();
            this.allSummaryMentions = this.getAllValidMentions();
            this.allSourceMentions = [];
            for (let i = 0; i < this._allAxes.getSources().length; i++) {
                const docMentions = this._allAxes.getSources()[i]['mentions'];
                // this.allSourceMentions.push(...EventObject.extractEvents(docMentions));
                this.allSourceMentions.push(...docMentions);
            }

            this.allClusters = allAxes.getClusters();
        }
    }

    loadForm() {
        this.allSummaryMentions = this.getAllValidMentions();
        super.loadForm();
    }

    getInstructions() {
        return config.instFiles.projection;
    }

    getAllValidMentions() {
        let allValidMentions = [];
        for (let i = 0; i < this._annotations.length; i++) {
            if (config.app.considerAxisAtAnnotation.includes(this._annotations[i].getAxisType())) {
                allValidMentions.push(this._annotations[i]);
            }
        }

        return allValidMentions;
    }

    createUI() {
        cleanQuestions();
        this.allSummaryMentions = this.getAllValidMentions();
        let questions = document.getElementById('questions');
        const docContainer = this.createScreen();
        questions.appendChild(docContainer);
        this.manageCandidates();
        window.addEventListener('scroll', this.addScrollListener);
        window.scrollBy({
            top: 1, // positive value for scrolling down
            behavior: 'smooth' // Optional: smooth scroll
        });
    }

    manageCandidates(){
        const currentSummaryMention = this.allSummaryMentions[this._annotationIndex];
        const cluster = this.allClusters.find(cluster => cluster['main_mention']['m_id'] === currentSummaryMention.getId());
        const srcClusterMentions = cluster['src_mentions'];

        const docContainer = document.getElementById('cluster-coreferences');
        docContainer.innerHTML = '';
        srcClusterMentions.forEach((token, index) => {
            const sourceMention = this.allSourceMentions.find(mention => mention['m_id'] === token['m_id'])
            const sourceMentToksIdxs = sourceMention['tokens_ids'];
            const tokenIdx = sourceMentToksIdxs[sourceMentToksIdxs.length-1]
            const sourceMentDoc = this.srcDocDict.filter(item => item['doc_id'] === sourceMention['doc_id'])[0];

            const div= document.createElement('div');
            div.className = 'word-box';

            const span1 = document.createElement('span');
            span1.textContent = sourceMentDoc['tokens'].slice(Math.max(tokenIdx - 30, 0), tokenIdx).join(" ") +" ";
            div.appendChild(span1);

            const span2 = document.createElement('span');
            span2.textContent = sourceMention['tokens'];
            span2.style.color = 'red';
            span2.style.fontWeight = 'bold';
            div.appendChild(span2);

            const span3 = document.createElement('span');
            span3.textContent = " " + sourceMentDoc['tokens'].slice(tokenIdx+1, Math.min(tokenIdx + 30, sourceMentDoc['tokens'].length-1)).join(" ");
            div.appendChild(span3);

            // Add buttons
            const selectedValue = ('corefState' in sourceMention) ? sourceMention['corefState'] : CorefState.NA;
            const buttonCoreferenceDiv = document.createElement('div');
            const corefInput = getOption(CorefState.COREF, "multiChoice" + index);
            const noCorefInput = getOption(CorefState.NOT_COREF, "multiChoice" + index);
            const notSureInput = getOption(CorefState.NOT_SURE, "multiChoice" + index);

            switch (selectedValue) {
                case CorefState.COREF:
                    corefInput.checked = true;
                    break;
                case CorefState.NOT_COREF:
                    noCorefInput.checked = true;
                    break;
                case CorefState.NOT_SURE:
                    notSureInput.checked = true;
                    break;
                default:
                    break;
            }

            buttonCoreferenceDiv.appendChild(corefInput);
            buttonCoreferenceDiv.appendChild(document.createTextNode("Coreference"));
            buttonCoreferenceDiv.appendChild(noCorefInput);
            buttonCoreferenceDiv.appendChild(document.createTextNode("Not Coreference"));
            buttonCoreferenceDiv.appendChild(notSureInput);
            buttonCoreferenceDiv.appendChild(document.createTextNode("Not Sure"));

            if (config.app.debug === true) {
                let node = document.createElement("a");
                node.innerHTML = "Score: " + token['score'];
                node.style.float = "right";
                node.style.color = "blue";
                buttonCoreferenceDiv.appendChild(node);
            }

            const buttonShowDiv = document.createElement('div');
            const button4 = document.createElement('button');
            button4.type = "button";
            button4.textContent = 'Show more';
            button4.onclick = function () {
                if (this.textContent === 'Show more') {
                    this.textContent = 'Show less';
                    span1.textContent = sourceMentDoc['tokens'].slice(0, tokenIdx).join(" ") + ' ';
                    span3.textContent = " " + sourceMentDoc['tokens'].slice(tokenIdx + 1, sourceMentDoc['tokens'].length - 1).join(" ");
                } else {
                    this.textContent = 'Show more';
                    span1.textContent = sourceMentDoc['tokens'].slice(Math.max(tokenIdx - 30, 0), tokenIdx).join(" ") +" ";
                    span3.textContent = " " + sourceMentDoc['tokens'].slice(tokenIdx+1, Math.min(tokenIdx + 30, sourceMentDoc['tokens'].length-1)).join(" ");
                }
            }
            buttonShowDiv.appendChild(button4);

            div.appendChild(buttonShowDiv)
            div.appendChild(buttonCoreferenceDiv)
            docContainer.appendChild(div);
        });
    }

    formatText() {
        let text = [...this._allAxes.getMainDocTokens()];
        let startIdx = this.allSummaryMentions[this._annotationIndex].getTokensIds()[0];
        let endIdx = this.allSummaryMentions[this._annotationIndex].getTokensIds().at(-1);
        for (let i = startIdx; i <= endIdx; i++) {
            text[i] = `<span style=\"color:royalblue; font-weight: bold;\">${text[i]}</span>`;
        }

        return text.join(" ");
    }

    handleSelection() {
        const currentSummaryMention = this.allSummaryMentions[this._annotationIndex];
        const cluster = this.allClusters.find(cluster => cluster['main_mention']['m_id'] === currentSummaryMention.getId());
        const srcClusterMentions = cluster['src_mentions'];
        let hasCoref = false;
        srcClusterMentions.forEach((clustMent, index) => {
            const sourceMention = this.allSourceMentions.find(mention => mention['m_id'] === clustMent['m_id'])
            let selectedValue = this.getRadiosSelected("multiChoice" + index);
            if (selectedValue != null) {
                sourceMention['corefState'] = selectedValue;
                if(selectedValue === CorefState.COREF) {
                    hasCoref = true;
                }
            }
        });

        if (hasCoref) {
            currentSummaryMention.setCorefState(CorefState.COREF);
        } else {
            currentSummaryMention.setCorefState(CorefState.NOT_COREF);
        }

        return true;
    }

    createSummaryContainer() {
        const summaryPanel = document.createElement("div");
        summaryPanel.className = "left-projection-container";
        summaryPanel.id = "left-projection-container";

        // Add h2 to left-panel
        const leftPanelHeading = document.createElement("h2");
        leftPanelHeading.textContent = "Summary";
        summaryPanel.appendChild(leftPanelHeading);

        // Add button-container to left-panel
        const buttonContainer = document.createElement("div");
        buttonContainer.id = "button-container";

        // Add ul to left-panel
        const summariesContainer = document.createElement("p");
        summariesContainer.id = "summaries-container";
        summariesContainer.innerHTML = this.formatText();
        summaryPanel.appendChild(summariesContainer);

        // Add buttons to left-button-container
        buttonContainer.appendChild(this.createPrevTaskButton());
        buttonContainer.appendChild(this.createBackButton("Back"));
        buttonContainer.appendChild(this.createNextButton("Next"));
        let unhandButt = this.createUnhandledNextButton("Next Unhandled Event");
        unhandButt.disabled = false;
        buttonContainer.appendChild(unhandButt);
        buttonContainer.appendChild(this.createNextTaskButton());
        summaryPanel.appendChild(buttonContainer);

        if (config.app.showRemainingAnnot === true) {
            summaryPanel.appendChild(this.getAnnotationsRemainderElem());
        }

        return summaryPanel;
    }

    createProjectionContainer() {
        const rightPanel = document.createElement("div");
        rightPanel.className = "right-projection-container";
        rightPanel.id = "right-projection-container";

        const rightPanelHeading = document.createElement("h2");
        rightPanelHeading.textContent = "Candidates Coreference";
        rightPanel.appendChild(rightPanelHeading);

        const clusterCoreferences = document.createElement("div");
        clusterCoreferences.id = "cluster-coreferences";
        rightPanel.appendChild(clusterCoreferences);
        return rightPanel;
    }

    createScreen() {
        // Create left-panel
        const docContainer = document.createElement("div");
        docContainer.className = "projection-parent-container";
        docContainer.id = "projection-parent-container";
        const summaryPanel = this.createSummaryContainer();
        const projectionPanel = this.createProjectionContainer();
        docContainer.appendChild(summaryPanel);
        docContainer.appendChild(projectionPanel);
        return docContainer;
    }

    nextClick() {
        if (this.handleSelection()) {
            if (this._annotationIndex < this.allSummaryMentions.length - 1) {
                this._annotationIndex++;
            }

            this.createUI();
        }
    }

    getNextUnhandledAnnotation() {
        for (let i = 0; i < this.allSummaryMentions.length; i++) {
            const cluster = this.allClusters.find(cluster => cluster['main_mention']['m_id'] === this.allSummaryMentions[i].getId());
            for (let j = 0; j < cluster['src_mentions'].length; j++) {
                const sourceMention = this.allSourceMentions.find(mention => mention['m_id'] === cluster['src_mentions'][j]['m_id'])
                if (!('corefState' in sourceMention) || sourceMention['corefState'] === CorefState.NA) {
                    this._annotationIndex = i;
                    return true;
                }
            }
        }

        return false;
    }

    annotationRemainder() {
        let count = this.allSummaryMentions.length;
        for (let i = 0; i < this.allSummaryMentions.length; i++) {
            let clusterDone = true;
            const cluster = this.allClusters.find(cluster => cluster['main_mention']['m_id'] === this.allSummaryMentions[i].getId());
            for (let j = 0; j < cluster['src_mentions'].length; j++) {
                const sourceMention = this.allSourceMentions.find(mention => mention['m_id'] === cluster['src_mentions'][j]['m_id'])
                if (!('corefState' in sourceMention) || sourceMention['corefState'] === CorefState.NA) {
                    clusterDone = false;
                    break;
                }
            }

            if (clusterDone) {
                count--;
            }
        }

        return count;
    }

    addScrollListener() {
        const summCont = document.getElementById('left-projection-container');
        const projCont = document.getElementById('right-projection-container');

        if (summCont === null || projCont === null) {
            return;
        }
        
        const projContBottom = projCont.offsetTop + projCont.offsetHeight;
        const summContHeight = summCont.offsetHeight;

        const rect = projCont.getBoundingClientRect(); // Get the container's position relative to the viewport

        // Check if container A's bottom would go past container B's bottom
        if (window.scrollY + summContHeight > projContBottom) {
            // Switch to absolute positioning when container A reaches the bottom of container B
            // summCont.style.bottom = window.scrollY + summContHeight - projContBottom + 'px';
            summCont.style.bottom = window.innerHeight - rect.bottom + 'px';
            summCont.style.top = 'auto';
        } else if (rect.top >= 20) {
            summCont.style.top = rect.top + 'px';
            summCont.style.bottom = 'auto';
        } else if (rect.top < 20) {
            summCont.style.top = '20px';
            summCont.style.bottom = 'auto';
        } else {
            // Revert to fixed positioning when not at the bottom of container B
            // summCont.style.position = 'fixed';
            summCont.style.top = 'auto';
            summCont.style.bottom = 'auto';
        }
    }

    isFinalized() {
        window.removeEventListener('scroll', this.addScrollListener);
        return true;
    }
}