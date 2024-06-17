
function getAllPairsByRelationGroup(allAxesPairsFlat, relationGroupTest) {
    let relationGroupPairs = [];
    for (let i = 0; i < allAxesPairsFlat.length; i++) {
        if(relationGroupTest(allAxesPairsFlat[i].getRelation())) {
            relationGroupPairs.push(allAxesPairsFlat[i]);
        }
    }

    return relationGroupPairs;
}

function isEqualOrCoref(relation) {
    return getRelationMappingTransitive(relation) === EventRelationType.EQUAL;
    // return relation === EventRelationType.EQUAL ||
    //     relation === EventRelationType.COREF ||
    //     relation === EventRelationType.NO_COREF;
}

function isContainsOrSubEvent(relation) {
    throw new Error("Not implemented");
}

function isBeforeOrCause(relation) {
    return getRelationMappingTransitive(relation) === EventRelationType.BEFORE;
    // return relation === EventRelationType.BEFORE ||
    //     relation === EventRelationType.CAUSE ||
    //     relation === EventRelationType.NO_CAUSE;
}

function getAllBeforePairs(allPairsFlat) {
    return getAllPairsByRelationGroup(allPairsFlat, isBeforeOrCause);
}

function getAllEqualPairs(allPairsFlat) {
    return getAllPairsByRelationGroup(allPairsFlat, isEqualOrCoref);
}

function getAllContainsPairs(allPairsFlat) {
    return getAllPairsByRelationGroup(allPairsFlat, isContainsOrSubEvent);
}

function flatten(arr) {
    return arr.reduce(function (flat, toFlatten) {
        return flat.concat(Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten);
    }, []);
}