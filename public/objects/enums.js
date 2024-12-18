const FormType = {
    TEMPORAL: 'temporal',
    CAUSAL: 'causal',
    COREF: 'coref',
    NA: 'na'
}

const AxisType = {
    MAIN: 'main',
    NOT_EVENT: 'not_event',
    NA: 'na'
}

const EventRelationType = {
    BEFORE: 'before',
    AFTER: 'after',
    EQUAL: 'equal',
    VAGUE: 'uncertain',
    CAUSE: 'before/cause',
    EFFECT: 'after/effect',
    NO_CAUSE: 'before/no_cause',
    UNCERTAIN_CAUSE: 'uncertain/cause',
    NO_EFFECT: 'after/no_effect',
    UNCERTAIN_EFFECT: 'uncertain/effect',
    COREF: 'equal/coref',
    NO_COREF: 'equal/no_coref',
    UNCERTAIN_COREF: 'uncertain/coref',
    NA: 'unknown',
    CANDIDATE: 'candidate',
}

const CorefState = {
    COREF: 'Coreference',
    NOT_COREF: 'Not Coreference',
    NOT_SURE: 'Not Sure',
    NA: 'unknown'
}

function getRelationMapping(relation) {
    switch (relation) {
        case EventRelationType.EQUAL:
        case EventRelationType.COREF:
        case EventRelationType.NO_COREF:
        case EventRelationType.UNCERTAIN_COREF:
            return EventRelationType.EQUAL;
        case EventRelationType.BEFORE:
        case EventRelationType.CAUSE:
        case EventRelationType.NO_CAUSE:
        case EventRelationType.UNCERTAIN_CAUSE:
            return EventRelationType.BEFORE;
        case EventRelationType.AFTER:
        case EventRelationType.EFFECT:
        case EventRelationType.NO_EFFECT:
        case EventRelationType.UNCERTAIN_EFFECT:
            return EventRelationType.AFTER;
        case EventRelationType.VAGUE:
            return EventRelationType.VAGUE;
        case EventRelationType.CANDIDATE:
            return EventRelationType.CANDIDATE;
        case EventRelationType.NA:
            return EventRelationType.NA;
        default:
            throw new Error("Unknown relation type!");
    }
}

function getRelType(relation) {
    switch (relation) {
        case EventRelationType.EQUAL:
        case EventRelationType.BEFORE:
        case EventRelationType.AFTER:
        case EventRelationType.VAGUE:
            return FormType.TEMPORAL;
        case EventRelationType.COREF:
        case EventRelationType.NO_COREF:
        case EventRelationType.UNCERTAIN_COREF:
            return FormType.COREF;
        case EventRelationType.CAUSE:
        case EventRelationType.EFFECT:
        case EventRelationType.NO_CAUSE:
        case EventRelationType.NO_EFFECT:
        case EventRelationType.UNCERTAIN_CAUSE:
        case EventRelationType.UNCERTAIN_EFFECT:
            return FormType.CAUSAL;
        case EventRelationType.NA:
        case EventRelationType.CANDIDATE:
            return FormType.NA;
        default:
            throw new Error("Unknown relation type!");
    }
}

function getOppositeRelation(relation) {
    switch (relation) {
        case EventRelationType.EQUAL:
            return EventRelationType.EQUAL;
        case EventRelationType.COREF:
            return EventRelationType.COREF;
        case EventRelationType.NO_COREF:
            return EventRelationType.NO_COREF;
        case EventRelationType.UNCERTAIN_COREF:
            return EventRelationType.UNCERTAIN_COREF;
        case EventRelationType.BEFORE:
            return EventRelationType.AFTER;
        case EventRelationType.AFTER:
            return EventRelationType.BEFORE;
        case EventRelationType.CAUSE:
            return EventRelationType.EFFECT;
        case EventRelationType.EFFECT:
            return EventRelationType.CAUSE;
        case EventRelationType.NO_CAUSE:
            return EventRelationType.NO_EFFECT;
        case EventRelationType.NO_EFFECT:
            return EventRelationType.NO_CAUSE;
        case EventRelationType.UNCERTAIN_CAUSE:
            return EventRelationType.UNCERTAIN_EFFECT;
        case EventRelationType.UNCERTAIN_EFFECT:
            return EventRelationType.UNCERTAIN_CAUSE;
        case EventRelationType.VAGUE:
            return EventRelationType.VAGUE;
        case EventRelationType.CANDIDATE:
            return EventRelationType.CANDIDATE;
        case EventRelationType.NA:
            return EventRelationType.NA;
        default:
            throw new Error("Unknown relation type!");
    }
}

function getExportRelation(relation) {
    switch (relation) {
        case EventRelationType.EQUAL:
            return EventRelationType.EQUAL;
        case EventRelationType.COREF:
            return EventRelationType.COREF;
        case EventRelationType.NO_COREF:
            return EventRelationType.NO_COREF;
        case EventRelationType.UNCERTAIN_COREF:
            return EventRelationType.UNCERTAIN_COREF;
        case EventRelationType.BEFORE:
            return EventRelationType.BEFORE;
        case EventRelationType.CAUSE:
            return EventRelationType.CAUSE;
        case EventRelationType.NO_CAUSE:
            return EventRelationType.NO_CAUSE;
        case EventRelationType.UNCERTAIN_CAUSE:
            return EventRelationType.UNCERTAIN_CAUSE;
        case EventRelationType.AFTER:
            return EventRelationType.AFTER;
        case EventRelationType.EFFECT:
            return EventRelationType.EFFECT;
        case EventRelationType.NO_EFFECT:
            return EventRelationType.NO_EFFECT;
        case EventRelationType.UNCERTAIN_EFFECT:
            return EventRelationType.UNCERTAIN_EFFECT;
        case EventRelationType.VAGUE:
            return EventRelationType.VAGUE;
        case EventRelationType.NA:
        case EventRelationType.CANDIDATE:
            return EventRelationType.NA;
        default:
            throw new Error("Unknown relation type!");
    }
}

function getRelationStrValue(relation) {
    switch (relation) {
        case EventRelationType.NA:
            return "----";
        case EventRelationType.EQUAL:
            return "1111";
        case EventRelationType.COREF:
            return "2222";
        case EventRelationType.NO_COREF:
            return "3333";
        case EventRelationType.UNCERTAIN_COREF:
            return "3--3";
        case EventRelationType.BEFORE:
            return "4444";
        case EventRelationType.CAUSE:
            return "5555";
        case EventRelationType.NO_CAUSE:
            return "6666";
        case EventRelationType.UNCERTAIN_CAUSE:
            return "6--6";
        case EventRelationType.CANDIDATE:
            return "-11-";
        case EventRelationType.AFTER:
            return "-44-";
        case EventRelationType.EFFECT:
            return "-55-";
        case EventRelationType.UNCERTAIN_EFFECT:
        case EventRelationType.NO_EFFECT:
            return "-66-";
        case EventRelationType.VAGUE:
            return "-101";
        default:
            throw new Error("Unknown relation type!");
    }
}

function isCorefRelation(relation) {
    return relation === EventRelationType.COREF || relation === EventRelationType.NO_COREF ||
        relation === EventRelationType.UNCERTAIN_COREF;
}

function isTemporalRelation(relation) {
    return relation === EventRelationType.BEFORE || relation === EventRelationType.AFTER ||
        relation === EventRelationType.EQUAL || relation === EventRelationType.VAGUE;
}

function isCausalRelation(relation) {
    return relation === EventRelationType.CAUSE || relation === EventRelationType.EFFECT ||
        relation === EventRelationType.NO_CAUSE || relation === EventRelationType.NO_EFFECT ||
        relation === EventRelationType.UNCERTAIN_CAUSE || relation === EventRelationType.UNCERTAIN_EFFECT;
}
