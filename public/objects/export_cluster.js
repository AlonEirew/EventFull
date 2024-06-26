class ExportCluster {
    constructor(allMentions) {
        this.cluster = allMentions;
        this.clusterId = allMentions.slice().sort().join('-');
    }

    addEventToCluster(event) {
        this.cluster.push(event.getId());
        this.clusterId = this.cluster.slice().sort().join('-');
    }

    getCluster() {
        return this.cluster;
    }

    getClusterId() {
        return this.clusterId;
    }
}