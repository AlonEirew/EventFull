class EventObject {
    constructor() {
        this.tokens = null;
        this.eventIndex = null;
        this.m_id = null;
        this.doc_id = null;
        this.tokens_ids = null;
        this.axisType = AxisType.NA;
        this.rootAxisEventId = -1; // only for intent events
        this.corefState = CorefState.NA;
    }

    static fromJsonObject(jsonObject) {
        let retEvent = new EventObject();
        if (jsonObject != null) {
            if(jsonObject.tokens) retEvent.tokens = jsonObject.tokens;
            if('eventIndex' in jsonObject) retEvent.eventIndex = jsonObject.eventIndex;
            if('m_id' in jsonObject) retEvent.m_id = jsonObject.m_id.toString();
            if('doc_id' in jsonObject) retEvent.doc_id = jsonObject.doc_id;
            if ('tokens_ids' in jsonObject) retEvent.tokens_ids = jsonObject.tokens_ids;
            if ('axisType' in jsonObject) retEvent.axisType = jsonObject.axisType;
            if ('rootAxisEventId' in jsonObject) retEvent.rootAxisEventId = jsonObject.rootAxisEventId;
            if ('corefState' in jsonObject) retEvent.corefState = jsonObject.corefState;
        } else {
            throw new Error('Trying to create event from null object');
        }

        return retEvent;
    }

    getId() {
        return this.m_id;
    }

    getTokens() {
        return this.tokens;
    }

    getTokensWithEventId() {
        return this.tokens + ' (' + this.m_id + ')';
    }

    getEventIndex() {
        return this.eventIndex;
    }

    setEventIndex(value) {
        this.eventIndex = value;
    }

    getTokensIds() {
        return this.tokens_ids;
    }

    getCorefState() {
        return this.corefState;
    }

    setCorefState(value) {
        this.corefState = value;
    }

    getAxisType() {
        return this.axisType;
    }

    setAxisTypeFromOption(value) {
        if(value != null) {
            if (this.axisType === AxisType.NA || this.axisType === value) {
                this.axisType = value;
            } else {
                this.axisType = value;
            }
        }
    }

    static extractEvents(mentions) {
        const extractedEvents = [];
        if (mentions == null) {
            return extractedEvents;
        }

        for (let idx = 0; idx < mentions.length; idx++) {
            let event = new EventObject();
            event.tokens = mentions[idx]['tokens'];
            event.tokens_ids = mentions[idx]['tokens_ids'];
            event.m_id = mentions[idx]['m_id'];
            event.doc_id = mentions[idx]['doc_id'];
            extractedEvents.push(event);
        }

        let mentSorted = extractedEvents.sort((a, b) => a.tokens_ids[0] - b.tokens_ids[0]);
        for (let idx = 0; idx < mentSorted.length; idx++) {
            mentSorted[idx].eventIndex = idx;
        }

        return mentSorted;
    }
}