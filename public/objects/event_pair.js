class EventPair {
    constructor() {
        this._pairId = null;
        this._axisId = null;
        this._firstId = -1;
        this._secondId = -1;
        this._relation = EventRelationType.NA;
    }

    static initFromData(axisId, firstId, secondId) {
        let eventPair = new EventPair();
        eventPair._pairId = crypto.randomUUID();
        eventPair._axisId = axisId;
        eventPair._firstId = firstId;
        eventPair._secondId = secondId;
        return eventPair;
    }

    static fromJsonObject(jsonObject) {
        let eventPair = new EventPair();
        if(jsonObject != null) {
            eventPair._pairId = jsonObject._pairId;
            eventPair._axisId = jsonObject._axisId;
            eventPair._firstId = jsonObject._firstId;
            eventPair._secondId = jsonObject._secondId;
            eventPair._relation = jsonObject._relation;
        }

        return eventPair;
    }

    getFirstId() {
        return this._firstId;
    }

    getSecondId() {
        return this._secondId;
    }

    getRelation() {
        return this._relation;
    }

    getAxisId() {
        return this._axisId;
    }

    setRelation(value) {
        this._relation = value;
    }
}