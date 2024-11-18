let pageTitles = [];
const axisTitle = 'Event Selection';
const temporalTitle = 'Temporal Relation';
const corefTitle = 'Coreference Relation';
const causalTitle = 'Causal Relation';

const yes = 'Yes';
const no = 'No';

let allAxesGlobal = null; // array of axis objects

let currentPageIdx = 0; // 0 - axis, 1 - anchor, 2 - temporal, 3 - coref, 4 - causal
let pages = null; // array of pages (forms) to be displayed

let axisForm = null;
let temporalForm = null;
let corefForm = null;
let causalForm = null;

let currentLoadedFileName = null;

// ####################################################
// ########## index.html general functions ###########
// ####################################################

function clearAll() {
    pages = [];
    currentPageIdx = 0;
    const leftPanel = document.getElementById("questions");
    const rightPanel = document.getElementById("cy");
    cleanPanel(leftPanel);
    cleanPanel(rightPanel);
    toggleGraphDivOff();
    cy = null;
    graphEventsToPreset = null;
}

function jsonReplacer(key, value) {
    // Filtering out properties
    if (value === null) {
        return undefined;
    } else if (value instanceof Set) {
        return Array.from(value);
    }
    return value;
}

function finalExport() {
    if (!config.app.exportAlways) {
        for (let i = 0; i < pages.length; i++) {
            if (!pages[i].isFinalized() || pages[i].annotationRemainder() > 0) {
                Swal.fire({
                    icon: "error",
                    title: 'Incomplete Annotation',
                    html:
                        '<p>Please complete the annotation before exporting.</p>',
                    showCancelButton: false,
                    confirmButtonText: 'OK',
                    allowOutsideClick: false,
                    scrollbarPadding: true
                });
                return;
            }
        }
    }

    let annotations = allAxesGlobal.createExport();
    const json = JSON.stringify(annotations, jsonReplacer, 2);
    const blob = new Blob([json], { type: "application/json" });
    const a = document.createElement('a');

    let fileNameSplit = currentLoadedFileName.split('.');
    let extension = fileNameSplit.pop();
    let finalFileName = fileNameSplit.join('.');
    if (finalFileName.includes("_TS")) {
        finalFileName = finalFileName.split('_TS')[0];
    }
    a.download = finalFileName + "_FinalAnnotations." + extension;
    a.href = window.URL.createObjectURL(blob);
    a.click();
}

function saveFile() {
    console.log("Saving current state");
    const json = JSON.stringify(allAxesGlobal, jsonReplacer, 2);
    const blob = new Blob([json], { type: "application/json" });
    const a = document.createElement('a');

    const dateObject = new Date(new Date().getTime());
    const formattedDate = dateObject.toLocaleString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    }).replace(/,\s/g, '_');

    let fileNameSplit = currentLoadedFileName.split('.');
    let extension = fileNameSplit.pop();
    let finalFileName = fileNameSplit.join('.');
    if (finalFileName.includes("_TS")) {
        finalFileName = finalFileName.split('_TS')[0];
    }
    a.download = finalFileName + "_TS" + formattedDate + "." + extension;
    a.href = window.URL.createObjectURL(blob);
    a.click();
}

function loadSavedState(filePath) {
    console.log("Loading saved state");
    clearAll();
    const input = document.getElementById(filePath);
    const file = input.files[0];
    const reader = new FileReader();
    reader.readAsText(file);
    currentLoadedFileName = file.name;
    reader.onload = function() {
        const fileText = reader.result;
        const objToSave = JSON.parse(fileText);
        allAxesGlobal = AllAxes.fromJsonObject(objToSave);

        pages = [];
        pageTitles = [];
        let pageIndex = 0
        if (config.app.includeAxis) {
            axisForm = new AxisForm(pageIndex, allAxesGlobal);
            pages.push(axisForm);
            pageIndex++;
            pageTitles.push(`Task-${pageIndex}: ${axisTitle}`);
        }

        if (config.app.includeTemp) {
            temporalForm = new TemporalForm(pageIndex, allAxesGlobal);
            pages.push(temporalForm);
            pageIndex++;
            pageTitles.push(`Task-${pageIndex}: ${temporalTitle}`);
        }

        if (config.app.includeCoref) {
            corefForm = new CorefForm(pageIndex, allAxesGlobal);
            pages.push(corefForm);
            pageIndex++;
            pageTitles.push(`Task-${pageIndex}: ${corefTitle}`);
        }

        if (config.app.includeCausal) {
            causalForm = new CausalForm(pageIndex, allAxesGlobal);
            pages.push(causalForm);
            pageIndex++;
            pageTitles.push(`Task-${pageIndex}: ${causalTitle}`);
        }

        pages[0].loadForm();
    }
}

function toggleInstructions() {
    console.log("toggle instructions button clicked");
    const divIstructs = document.getElementsByClassName("instructions-container");
    const buttonIstruct = document.getElementById("instruct-button");
    if (divIstructs.length > 0) {
        if (divIstructs[0].style.display === "none") {
            divIstructs[0].style.display = "block";
            buttonIstruct.innerHTML = "Instructions &#10225;";
        } else {
            divIstructs[0].style.display = "none";
            buttonIstruct.innerHTML = "Instructions &#10224;";
        }
    }
}

function getLastToggleMode() {
    const divIstructs = document.getElementsByClassName("instructions-container");
    if (divIstructs.length > 0) {
        return divIstructs[0].style.display;
    }

    return "none";
}

function setToggleMode(mode) {
    const divIstructs = document.getElementsByClassName("instructions-container");
    if (divIstructs.length > 0) {
        const buttonIstruct = document.getElementById("instruct-button");
        divIstructs[0].style.display = mode;
        if (mode === "none") {
            buttonIstruct.innerHTML = "Instructions &#10224;";
        } else {
            buttonIstruct.innerHTML = "Instructions &#10225;";
        }
    }
}

function readInstructions(instFile) {
    const targetDiv = document.getElementById('instructions-container');
    const lastToggleMode = getLastToggleMode();
    targetDiv.innerHTML = '';

    fetch(`/api/content/${instFile}`).then(response => {
        if (!response.ok) {
            throw new Error(`Failed to fetch the content. Status: ${response.status}`);
        }
        return response.text();
    })
    .then(content => {
        // Insert the content into the target div
        targetDiv.innerHTML = content;
        setToggleMode(lastToggleMode);
    })
    .catch(error => {
        console.error('Error fetching content:', error);
    });
}

function cleanPanel(parantElem) {
    console.log("cleaning the main div element 'questions'");
    while (parantElem.firstChild) {
        parantElem.removeChild(parantElem.firstChild);
    }
}

function toggleGraphDivOn() {
    const divGraph = document.getElementById("cy");
    divGraph.style.display = "block";
}

function toggleGraphDivOff() {
    const divGraph = document.getElementById("cy");
    divGraph.style.display = "none";
}

function showErrorMessage() {
    Swal.fire({
        icon: "error",
        title: 'Something is not right!',
        html:
            '<p>To see the application log:<br>Mouse menu-->inspect-->console</p>',
        showCancelButton: false,
        confirmButtonText: 'OK',
        allowOutsideClick: false,
        scrollbarPadding: true
    });
}