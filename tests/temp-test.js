describe('Temporal Graph Algo Tests', () => {
    beforeEach(() => {
        // in graph the indexes are as follows (0, 1, 2, 3=4, 4=5, 5=6, 6=7)
        graphIdxes = [0, 1, 2, 4, 5, 6, 7]
        graphObj = new GraphObj();
        graphObj.initGraph(graphIdxes);
        graphObjRef = new GraphObj();
        graphObjRef.initGraph(graphIdxes);
    });

    it('test1 setting before relation between two edges', () => {
        graphObj.handleFormRelations(0, 1, EventRelationType.BEFORE, FormType.TEMPORAL);
        let refGraphMatrix = graphObjRef.getGraphMatrix();
        refGraphMatrix[0][1] = new GraphEdge(EventRelationType.BEFORE, true);
        refGraphMatrix[1][0] = new GraphEdge(EventRelationType.AFTER, true);
        fillGraphCandidates(refGraphMatrix);

        expect(graphObj.getGraphMatrix()).toEqual(graphObjRef.getGraphMatrix());
    });

    it('test2 setting equal relation between two edges', () => {
        graphObj.handleFormRelations(0, 1, EventRelationType.EQUAL, FormType.TEMPORAL);
        let refGraphMatrix = graphObjRef.getGraphMatrix();
        refGraphMatrix[0][1] = new GraphEdge(EventRelationType.EQUAL, true);
        refGraphMatrix[1][0] = new GraphEdge(EventRelationType.EQUAL, true);
        fillGraphCandidates(refGraphMatrix);

        expect(graphObj.getGraphMatrix()).toEqual(graphObjRef.getGraphMatrix());
    });

    it('test3 setting vague relation between two edges', () => {
        graphObj.handleFormRelations(0, 1, EventRelationType.VAGUE, FormType.TEMPORAL);
        let refGraphMatrix = graphObjRef.getGraphMatrix();
        refGraphMatrix[0][1] = new GraphEdge(EventRelationType.VAGUE, true);
        refGraphMatrix[1][0] = new GraphEdge(EventRelationType.VAGUE, true);
        fillGraphCandidates(refGraphMatrix);

        expect(graphObj.getGraphMatrix()).toEqual(graphObjRef.getGraphMatrix());
    });

    it('test4 annotation all before', () => {
        let refGraphMatrix = graphObjRef.getGraphMatrix();
        fillGraphCandidates(refGraphMatrix);

        graphObj.handleFormRelations(0, 1, EventRelationType.BEFORE, FormType.TEMPORAL);
        refGraphMatrix[0][1] = new GraphEdge(EventRelationType.BEFORE, true);
        refGraphMatrix[1][0] = new GraphEdge(EventRelationType.AFTER, true);

        graphObj.handleFormRelations(1, 2, EventRelationType.BEFORE, FormType.TEMPORAL);
        refGraphMatrix[1][2] = new GraphEdge(EventRelationType.BEFORE, true);
        refGraphMatrix[2][1] = new GraphEdge(EventRelationType.AFTER, true);

        graphObj.handleFormRelations(2, 4, EventRelationType.BEFORE, FormType.TEMPORAL);
        refGraphMatrix[2][3] = new GraphEdge(EventRelationType.BEFORE, true);
        refGraphMatrix[3][2] = new GraphEdge(EventRelationType.AFTER, true);

        graphObj.handleFormRelations(4, 5, EventRelationType.BEFORE, FormType.TEMPORAL);
        refGraphMatrix[3][4] = new GraphEdge(EventRelationType.BEFORE, true);
        refGraphMatrix[4][3] = new GraphEdge(EventRelationType.AFTER, true);

        expect(refGraphMatrix[0][2]).toEqual(new GraphEdge(EventRelationType.CANDIDATE, false));
        expect(refGraphMatrix[2][0]).toEqual(new GraphEdge(EventRelationType.CANDIDATE, false));
        expect(refGraphMatrix[0][3]).toEqual(new GraphEdge(EventRelationType.CANDIDATE, false));
        expect(refGraphMatrix[3][0]).toEqual(new GraphEdge(EventRelationType.CANDIDATE, false));
        expect(refGraphMatrix[0][4]).toEqual(new GraphEdge(EventRelationType.CANDIDATE, false));
        expect(refGraphMatrix[4][0]).toEqual(new GraphEdge(EventRelationType.CANDIDATE, false));
        expect(refGraphMatrix[1][3]).toEqual(new GraphEdge(EventRelationType.CANDIDATE, false));
        expect(refGraphMatrix[3][1]).toEqual(new GraphEdge(EventRelationType.CANDIDATE, false));
        expect(refGraphMatrix[1][4]).toEqual(new GraphEdge(EventRelationType.CANDIDATE, false));
        expect(refGraphMatrix[4][1]).toEqual(new GraphEdge(EventRelationType.CANDIDATE, false));
        expect(refGraphMatrix[2][4]).toEqual(new GraphEdge(EventRelationType.CANDIDATE, false));
        expect(refGraphMatrix[4][2]).toEqual(new GraphEdge(EventRelationType.CANDIDATE, false));

        // remove transitive (candidate) relations
        refGraphMatrix[0][2] = new GraphEdge(EventRelationType.NA, false);
        refGraphMatrix[2][0] = new GraphEdge(EventRelationType.NA, false);

        refGraphMatrix[0][3] = new GraphEdge(EventRelationType.NA, false);
        refGraphMatrix[3][0] = new GraphEdge(EventRelationType.NA, false);

        refGraphMatrix[0][4] = new GraphEdge(EventRelationType.NA, false);
        refGraphMatrix[4][0] = new GraphEdge(EventRelationType.NA, false);

        refGraphMatrix[1][3] = new GraphEdge(EventRelationType.NA, false);
        refGraphMatrix[3][1] = new GraphEdge(EventRelationType.NA, false);

        refGraphMatrix[1][4] = new GraphEdge(EventRelationType.NA, false);
        refGraphMatrix[4][1] = new GraphEdge(EventRelationType.NA, false);

        refGraphMatrix[2][4] = new GraphEdge(EventRelationType.NA, false);
        refGraphMatrix[4][2] = new GraphEdge(EventRelationType.NA, false);

        expect(graphObj.getGraphMatrix()).toEqual(graphObjRef.getGraphMatrix());

        graphObj.handleFormRelations(1, 2, EventRelationType.AFTER, FormType.TEMPORAL);
        refGraphMatrix[1][2] = new GraphEdge(EventRelationType.AFTER, true);
        refGraphMatrix[2][1] = new GraphEdge(EventRelationType.BEFORE, true);

        // Adding back transitives relations that are now needed due to the new relation
        refGraphMatrix[0][2] = new GraphEdge(EventRelationType.CANDIDATE, false);
        refGraphMatrix[2][0] = new GraphEdge(EventRelationType.CANDIDATE, false);

        refGraphMatrix[0][3] = new GraphEdge(EventRelationType.CANDIDATE, false);
        refGraphMatrix[3][0] = new GraphEdge(EventRelationType.CANDIDATE, false);

        refGraphMatrix[0][4] = new GraphEdge(EventRelationType.CANDIDATE, false);
        refGraphMatrix[4][0] = new GraphEdge(EventRelationType.CANDIDATE, false);

        refGraphMatrix[1][3] = new GraphEdge(EventRelationType.CANDIDATE, false);
        refGraphMatrix[3][1] = new GraphEdge(EventRelationType.CANDIDATE, false);

        refGraphMatrix[1][4] = new GraphEdge(EventRelationType.CANDIDATE, false);
        refGraphMatrix[4][1] = new GraphEdge(EventRelationType.CANDIDATE, false);

        expect(graphObj.getGraphMatrix()).toEqual(graphObjRef.getGraphMatrix());
    });

    it('test5 annotation random selection', () => {
        let refGraphMatrix = graphObjRef.getGraphMatrix();
        fillGraphCandidates(refGraphMatrix);

        graphObj.handleFormRelations(0, 1, EventRelationType.VAGUE, FormType.TEMPORAL);
        refGraphMatrix[0][1] = new GraphEdge(EventRelationType.VAGUE, true);
        refGraphMatrix[1][0] = new GraphEdge(EventRelationType.VAGUE, true);

        graphObj.handleFormRelations(1, 2, EventRelationType.BEFORE, FormType.TEMPORAL);
        refGraphMatrix[1][2] = new GraphEdge(EventRelationType.BEFORE, true);
        refGraphMatrix[2][1] = new GraphEdge(EventRelationType.AFTER, true);

        graphObj.handleFormRelations(0, 2, EventRelationType.BEFORE, FormType.TEMPORAL);
        refGraphMatrix[0][2] = new GraphEdge(EventRelationType.BEFORE, true);
        refGraphMatrix[2][0] = new GraphEdge(EventRelationType.AFTER, true);

        graphObj.handleFormRelations(2, 4, EventRelationType.AFTER, FormType.TEMPORAL);
        refGraphMatrix[2][3] = new GraphEdge(EventRelationType.AFTER, true);
        refGraphMatrix[3][2] = new GraphEdge(EventRelationType.BEFORE, true);

        graphObj.handleFormRelations(1, 4, EventRelationType.EQUAL, FormType.TEMPORAL);
        refGraphMatrix[1][3] = new GraphEdge(EventRelationType.EQUAL, true);
        refGraphMatrix[3][1] = new GraphEdge(EventRelationType.EQUAL, true);
        // Removing as there is a transitive path (3->1->2) --> This functionality was removed
        // refGraphMatrix[2][3] = new GraphEdge(EventRelationType.NA, false);
        // refGraphMatrix[3][2] = new GraphEdge(EventRelationType.NA, false);

        graphObj.handleFormRelations(0, 4, EventRelationType.VAGUE, FormType.TEMPORAL);
        refGraphMatrix[0][3] = new GraphEdge(EventRelationType.VAGUE, true);
        refGraphMatrix[3][0] = new GraphEdge(EventRelationType.VAGUE, true);

        expect(graphObj.getGraphMatrix()).toEqual(graphObjRef.getGraphMatrix());
    });

    it('test6 removing transitive that is part of path (disconnecting the graph)', () => {
        let refGraphMatrix = graphObjRef.getGraphMatrix();
        fillGraphCandidates(refGraphMatrix);

        graphObj.handleFormRelations(0, 1, EventRelationType.BEFORE, FormType.TEMPORAL);
        refGraphMatrix[0][1] = new GraphEdge(EventRelationType.BEFORE, true);
        refGraphMatrix[1][0] = new GraphEdge(EventRelationType.AFTER, true);

        graphObj.handleFormRelations(1, 2, EventRelationType.VAGUE, FormType.TEMPORAL);
        refGraphMatrix[1][2] = new GraphEdge(EventRelationType.VAGUE, true);
        refGraphMatrix[2][1] = new GraphEdge(EventRelationType.VAGUE, true);

        graphObj.handleFormRelations(0, 2, EventRelationType.BEFORE, FormType.TEMPORAL);
        refGraphMatrix[0][2] = new GraphEdge(EventRelationType.BEFORE, true);
        refGraphMatrix[2][0] = new GraphEdge(EventRelationType.AFTER, true);

        graphObj.handleFormRelations(2, 4, EventRelationType.EQUAL, FormType.TEMPORAL);
        refGraphMatrix[2][3] = new GraphEdge(EventRelationType.EQUAL, true);
        refGraphMatrix[3][2] = new GraphEdge(EventRelationType.EQUAL, true);
        // Removing as there is a transitive path (0->2->3)
        refGraphMatrix[0][3] = new GraphEdge(EventRelationType.NA, false);
        refGraphMatrix[3][0] = new GraphEdge(EventRelationType.NA, false);
        // Adding as there is no path
        refGraphMatrix[1][3] = new GraphEdge(EventRelationType.CANDIDATE, false);
        refGraphMatrix[3][1] = new GraphEdge(EventRelationType.CANDIDATE, false);


        expect(graphObj.getGraphMatrix()).toEqual(graphObjRef.getGraphMatrix());
    });

    it('test7 removing transitive before that is part of equal path (disconnecting the graph)', () => {
        let refGraphMatrix = graphObjRef.getGraphMatrix();
        fillGraphCandidates(refGraphMatrix);

        // in graph the indexes are as follows (0, 1, 2, 3=4, 4=5, 5=6, 6=7)
        graphObj.handleFormRelations(1, 2, EventRelationType.EQUAL, FormType.TEMPORAL);
        refGraphMatrix[1][2] = new GraphEdge(EventRelationType.EQUAL, true);
        refGraphMatrix[2][1] = new GraphEdge(EventRelationType.EQUAL, true);

        graphObj.handleFormRelations(2, 4, EventRelationType.EQUAL, FormType.TEMPORAL);
        refGraphMatrix[2][3] = new GraphEdge(EventRelationType.EQUAL, true);
        refGraphMatrix[3][2] = new GraphEdge(EventRelationType.EQUAL, true);

        graphObj.handleFormRelations(4, 5, EventRelationType.EQUAL, FormType.TEMPORAL);
        refGraphMatrix[3][4] = new GraphEdge(EventRelationType.EQUAL, true);
        refGraphMatrix[4][3] = new GraphEdge(EventRelationType.EQUAL, true);

        graphObj.handleFormRelations(0, 1, EventRelationType.BEFORE, FormType.TEMPORAL);
        refGraphMatrix[0][1] = new GraphEdge(EventRelationType.BEFORE, true);
        refGraphMatrix[1][0] = new GraphEdge(EventRelationType.AFTER, true);

        // removing transitive paths that are now can be reached and shouldn't be checked (candidate -> NA)
        refGraphMatrix[0][2] = new GraphEdge(EventRelationType.NA, false);
        refGraphMatrix[2][0] = new GraphEdge(EventRelationType.NA, false);
        refGraphMatrix[0][3] = new GraphEdge(EventRelationType.NA, false);
        refGraphMatrix[3][0] = new GraphEdge(EventRelationType.NA, false);
        refGraphMatrix[0][4] = new GraphEdge(EventRelationType.NA, false);
        refGraphMatrix[4][0] = new GraphEdge(EventRelationType.NA, false);
        refGraphMatrix[1][3] = new GraphEdge(EventRelationType.NA, false);
        refGraphMatrix[3][1] = new GraphEdge(EventRelationType.NA, false);
        refGraphMatrix[1][4] = new GraphEdge(EventRelationType.NA, false);
        refGraphMatrix[4][1] = new GraphEdge(EventRelationType.NA, false);
        refGraphMatrix[2][4] = new GraphEdge(EventRelationType.NA, false);
        refGraphMatrix[4][2] = new GraphEdge(EventRelationType.NA, false);

        expect(graphObj.getGraphMatrix()).toEqual(graphObjRef.getGraphMatrix());
    });

    it('test8 transitive A->B->C relations', () => {
        let refGraphMatrix = graphObjRef.getGraphMatrix();
        fillGraphCandidates(refGraphMatrix);

        // in graph the indexes are as follows (0, 1, 2, 3=4, 4=5, 5=6, 6=7)
        graphObj.handleFormRelations(0, 1, EventRelationType.BEFORE, FormType.TEMPORAL);
        refGraphMatrix[0][1] = new GraphEdge(EventRelationType.BEFORE, true);
        refGraphMatrix[1][0] = new GraphEdge(EventRelationType.AFTER, true);

        graphObj.handleFormRelations(1, 2, EventRelationType.BEFORE, FormType.TEMPORAL);
        refGraphMatrix[1][2] = new GraphEdge(EventRelationType.BEFORE, true);
        refGraphMatrix[2][1] = new GraphEdge(EventRelationType.AFTER, true);

        // Adding back transitives relations that are now needed due to the new relation
        refGraphMatrix[0][2] = new GraphEdge(EventRelationType.NA, false);
        refGraphMatrix[2][0] = new GraphEdge(EventRelationType.NA, false);

        expect(graphObj.getGraphMatrix()).toEqual(graphObjRef.getGraphMatrix());
    });

    it('test9 transitive A<->B->C relations', () => {
        let refGraphMatrix = graphObjRef.getGraphMatrix();
        fillGraphCandidates(refGraphMatrix);

        // in graph the indexes are as follows (0, 1, 2, 3=4, 4=5, 5=6, 6=7)
        graphObj.handleFormRelations(0, 1, EventRelationType.EQUAL, FormType.TEMPORAL);
        refGraphMatrix[0][1] = new GraphEdge(EventRelationType.EQUAL, true);
        refGraphMatrix[1][0] = new GraphEdge(EventRelationType.EQUAL, true);

        graphObj.handleFormRelations(1, 2, EventRelationType.BEFORE, FormType.TEMPORAL);
        refGraphMatrix[1][2] = new GraphEdge(EventRelationType.BEFORE, true);
        refGraphMatrix[2][1] = new GraphEdge(EventRelationType.AFTER, true);

        // Adding back transitives relations that are now needed due to the new relation
        refGraphMatrix[0][2] = new GraphEdge(EventRelationType.NA, false);
        refGraphMatrix[2][0] = new GraphEdge(EventRelationType.NA, false);

        expect(graphObj.getGraphMatrix()).toEqual(graphObjRef.getGraphMatrix());
    });

    it('test10 transitive A->B<->C relations', () => {
        let refGraphMatrix = graphObjRef.getGraphMatrix();
        fillGraphCandidates(refGraphMatrix);

        // in graph the indexes are as follows (0, 1, 2, 3=4, 4=5, 5=6, 6=7)
        graphObj.handleFormRelations(0, 1, EventRelationType.BEFORE, FormType.TEMPORAL);
        refGraphMatrix[0][1] = new GraphEdge(EventRelationType.BEFORE, true);
        refGraphMatrix[1][0] = new GraphEdge(EventRelationType.AFTER, true);

        graphObj.handleFormRelations(1, 2, EventRelationType.EQUAL, FormType.TEMPORAL);
        refGraphMatrix[1][2] = new GraphEdge(EventRelationType.EQUAL, true);
        refGraphMatrix[2][1] = new GraphEdge(EventRelationType.EQUAL, true);

        // Adding back transitives relations that are now needed due to the new relation
        refGraphMatrix[0][2] = new GraphEdge(EventRelationType.NA, false);
        refGraphMatrix[2][0] = new GraphEdge(EventRelationType.NA, false);

        expect(graphObj.getGraphMatrix()).toEqual(graphObjRef.getGraphMatrix());
    });

    it('test11 transitive A<->B<->C relations', () => {
        let refGraphMatrix = graphObjRef.getGraphMatrix();
        fillGraphCandidates(refGraphMatrix);

        // in graph the indexes are as follows (0, 1, 2, 3=4, 4=5, 5=6, 6=7)
        graphObj.handleFormRelations(0, 1, EventRelationType.EQUAL, FormType.TEMPORAL);
        refGraphMatrix[0][1] = new GraphEdge(EventRelationType.EQUAL, true);
        refGraphMatrix[1][0] = new GraphEdge(EventRelationType.EQUAL, true);

        graphObj.handleFormRelations(1, 2, EventRelationType.EQUAL, FormType.TEMPORAL);
        refGraphMatrix[1][2] = new GraphEdge(EventRelationType.EQUAL, true);
        refGraphMatrix[2][1] = new GraphEdge(EventRelationType.EQUAL, true);

        // Adding back transitives relations that are now needed due to the new relation
        refGraphMatrix[0][2] = new GraphEdge(EventRelationType.NA, false);
        refGraphMatrix[2][0] = new GraphEdge(EventRelationType.NA, false);

        expect(graphObj.getGraphMatrix()).toEqual(graphObjRef.getGraphMatrix());
    });

    it('test12 transitive A<-B<-C relations', () => {
        let refGraphMatrix = graphObjRef.getGraphMatrix();
        fillGraphCandidates(refGraphMatrix);

        // in graph the indexes are as follows (0, 1, 2, 3=4, 4=5, 5=6, 6=7)
        graphObj.handleFormRelations(0, 1, EventRelationType.AFTER, FormType.TEMPORAL);
        refGraphMatrix[0][1] = new GraphEdge(EventRelationType.AFTER, true);
        refGraphMatrix[1][0] = new GraphEdge(EventRelationType.BEFORE, true);

        graphObj.handleFormRelations(1, 2, EventRelationType.AFTER, FormType.TEMPORAL);
        refGraphMatrix[1][2] = new GraphEdge(EventRelationType.AFTER, true);
        refGraphMatrix[2][1] = new GraphEdge(EventRelationType.BEFORE, true);

        // Adding back transitives relations that are now needed due to the new relation
        refGraphMatrix[0][2] = new GraphEdge(EventRelationType.NA, false);
        refGraphMatrix[2][0] = new GraphEdge(EventRelationType.NA, false);

        expect(graphObj.getGraphMatrix()).toEqual(graphObjRef.getGraphMatrix());
    });

    it('test13 transitive A<->B<-C relations', () => {
        let refGraphMatrix = graphObjRef.getGraphMatrix();
        fillGraphCandidates(refGraphMatrix);

        // in graph the indexes are as follows (0, 1, 2, 3=4, 4=5, 5=6, 6=7)
        graphObj.handleFormRelations(0, 1, EventRelationType.EQUAL, FormType.TEMPORAL);
        refGraphMatrix[0][1] = new GraphEdge(EventRelationType.EQUAL, true);
        refGraphMatrix[1][0] = new GraphEdge(EventRelationType.EQUAL, true);

        graphObj.handleFormRelations(1, 2, EventRelationType.AFTER, FormType.TEMPORAL);
        refGraphMatrix[1][2] = new GraphEdge(EventRelationType.AFTER, true);
        refGraphMatrix[2][1] = new GraphEdge(EventRelationType.BEFORE, true);

        // Adding back transitives relations that are now needed due to the new relation
        refGraphMatrix[0][2] = new GraphEdge(EventRelationType.NA, false);
        refGraphMatrix[2][0] = new GraphEdge(EventRelationType.NA, false);

        expect(graphObj.getGraphMatrix()).toEqual(graphObjRef.getGraphMatrix());
    });

    it('test14 transitive A<-B<->C relations', () => {
        let refGraphMatrix = graphObjRef.getGraphMatrix();
        fillGraphCandidates(refGraphMatrix);

        // in graph the indexes are as follows (0, 1, 2, 3=4, 4=5, 5=6, 6=7)
        graphObj.handleFormRelations(0, 1, EventRelationType.AFTER, FormType.TEMPORAL);
        refGraphMatrix[0][1] = new GraphEdge(EventRelationType.AFTER, true);
        refGraphMatrix[1][0] = new GraphEdge(EventRelationType.BEFORE, true);

        graphObj.handleFormRelations(1, 2, EventRelationType.EQUAL, FormType.TEMPORAL);
        refGraphMatrix[1][2] = new GraphEdge(EventRelationType.EQUAL, true);
        refGraphMatrix[2][1] = new GraphEdge(EventRelationType.EQUAL, true);

        // Adding back transitives relations that are now needed due to the new relation
        refGraphMatrix[0][2] = new GraphEdge(EventRelationType.NA, false);
        refGraphMatrix[2][0] = new GraphEdge(EventRelationType.NA, false);

        expect(graphObj.getGraphMatrix()).toEqual(graphObjRef.getGraphMatrix());
    });

    it('test15 transitive A-?->B<-->C relations ==> A->C (candidate)', () => {
        let refGraphMatrix = graphObjRef.getGraphMatrix();
        fillGraphCandidates(refGraphMatrix);

        // in graph the indexes are as follows (0, 1, 2, 3=4, 4=5, 5=6, 6=7)
        graphObj.handleFormRelations(0, 1, EventRelationType.VAGUE, FormType.TEMPORAL);
        refGraphMatrix[0][1] = new GraphEdge(EventRelationType.VAGUE, true);
        refGraphMatrix[1][0] = new GraphEdge(EventRelationType.VAGUE, true);

        graphObj.handleFormRelations(1, 2, EventRelationType.EQUAL, FormType.TEMPORAL);
        refGraphMatrix[1][2] = new GraphEdge(EventRelationType.EQUAL, true);
        refGraphMatrix[2][1] = new GraphEdge(EventRelationType.EQUAL, true);

        expect(graphObj.getGraphMatrix()).toEqual(graphObjRef.getGraphMatrix());
    });

    it('test16 vague A-?->B-?->C => A->C candidate', () => {
        let refGraphMatrix = graphObjRef.getGraphMatrix();
        fillGraphCandidates(refGraphMatrix);

        // in graph the indexes are as follows (0, 1, 2, 3=4, 4=5, 5=6, 6=7)
        graphObj.handleFormRelations(0, 1, EventRelationType.VAGUE, FormType.TEMPORAL);
        refGraphMatrix[0][1] = new GraphEdge(EventRelationType.VAGUE, true);
        refGraphMatrix[1][0] = new GraphEdge(EventRelationType.VAGUE, true);

        graphObj.handleFormRelations(1, 2, EventRelationType.VAGUE, FormType.TEMPORAL);
        refGraphMatrix[1][2] = new GraphEdge(EventRelationType.VAGUE, true);
        refGraphMatrix[2][1] = new GraphEdge(EventRelationType.VAGUE, true);

        expect(graphObj.getGraphMatrix()).toEqual(graphObjRef.getGraphMatrix());
    });

    it('test17 discrepancies A->B->C->A ', () => {
        let dicrepencies = [];
        dicrepencies = graphObj.handleFormRelations(0, 1, EventRelationType.BEFORE, FormType.TEMPORAL);
        expect(dicrepencies.length).toEqual(0);

        dicrepencies = graphObj.handleFormRelations(1, 2, EventRelationType.BEFORE, FormType.TEMPORAL);
        expect(dicrepencies.length).toEqual(0);

        dicrepencies = graphObj.handleFormRelations(2, 0, EventRelationType.BEFORE, FormType.TEMPORAL);
        expect(dicrepencies.length).toBeGreaterThan(0);
    });

    it('test18 discrepancies A<->B<->C->A ', () => {
        let dicrepencies = [];
        dicrepencies = graphObj.handleFormRelations(0, 1, EventRelationType.EQUAL, FormType.TEMPORAL);
        expect(dicrepencies.length).toEqual(0);

        dicrepencies = graphObj.handleFormRelations(1, 2, EventRelationType.EQUAL, FormType.TEMPORAL);
        expect(dicrepencies.length).toEqual(0);

        dicrepencies = graphObj.handleFormRelations(0, 2, EventRelationType.BEFORE, FormType.TEMPORAL);
        expect(dicrepencies.length).toBeGreaterThan(0);
    });

    it('test18 discrepancies A<->B<->C->A ', () => {
        let dicrepencies = [];
        dicrepencies = graphObj.handleFormRelations(0, 1, EventRelationType.EQUAL, FormType.TEMPORAL);
        expect(dicrepencies.length).toEqual(0);

        dicrepencies = graphObj.handleFormRelations(1, 2, EventRelationType.EQUAL, FormType.TEMPORAL);
        expect(dicrepencies.length).toEqual(0);

        dicrepencies = graphObj.handleFormRelations(0, 2, EventRelationType.VAGUE, FormType.TEMPORAL);
        expect(dicrepencies.length).toBeGreaterThan(0);
    });

    it('test18 discrepancies A<->B<->C->A ', () => {
        let dicrepencies = [];
        dicrepencies = graphObj.handleFormRelations(0, 1, EventRelationType.BEFORE, FormType.TEMPORAL);
        expect(dicrepencies.length).toEqual(0);

        dicrepencies = graphObj.handleFormRelations(2, 1, EventRelationType.BEFORE, FormType.TEMPORAL);
        expect(dicrepencies.length).toEqual(0);

        dicrepencies = graphObj.handleFormRelations(0, 2, EventRelationType.EQUAL, FormType.TEMPORAL);
        expect(dicrepencies.length).toEqual(0);

        dicrepencies = graphObj.handleFormRelations(2, 4, EventRelationType.BEFORE, FormType.TEMPORAL);
        expect(dicrepencies.length).toEqual(0);
    });
});

function fillGraphCandidates(refGraphMatrix) {
    for (let i = 0; i < graphIdxes.length; i++) {
        for (let j = 0; j < graphIdxes.length; j++) {
            if (i === j) {
                continue;
            }

            if (refGraphMatrix[i][j].getEdgeRelation() === EventRelationType.NA) {
                refGraphMatrix[i][j].setEdgeRelation(EventRelationType.CANDIDATE);
            }
        }
    }
}
