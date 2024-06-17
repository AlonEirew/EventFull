class TimeExpressionObject {
    constructor() {
        this.text = null;
        this.indices = null;
    }

    static fromJsonObject(jsonObject) {
        let retTimeExpr = new TimeExpressionObject();
        if (jsonObject != null) {
            if('text' in jsonObject) retTimeExpr.text = jsonObject.text;
            if('indices' in jsonObject) retTimeExpr.indices = jsonObject.indices;
        }

        return retTimeExpr;
    }
}