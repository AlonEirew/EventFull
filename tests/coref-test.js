describe('Coref Graph Algo Tests', () => {
    beforeEach(() => {
        // in graph the indexes are as follows (0, 1, 2, 3)
        graphIdxes = [0, 1, 2, 3, 4]
        graphObj = new GraphObj();
        graphObj.initGraph(graphIdxes);
        graphObjRef = new GraphObj();
        graphObjRef.initGraph(graphIdxes);

        graphObj.handleFormRelations(0, 1, EventRelationType.EQUAL, FormType.TEMPORAL);
        graphObj.handleFormRelations(1, 2, EventRelationType.EQUAL, FormType.TEMPORAL);
        graphObj.handleFormRelations(2, 3, EventRelationType.EQUAL, FormType.TEMPORAL);
        graphObj.handleFormRelations(3, 4, EventRelationType.EQUAL, FormType.TEMPORAL);

        graphObjRef.handleFormRelations(0, 1, EventRelationType.EQUAL, FormType.TEMPORAL);
        graphObjRef.handleFormRelations(1, 2, EventRelationType.EQUAL, FormType.TEMPORAL);
        graphObjRef.handleFormRelations(2, 3, EventRelationType.EQUAL, FormType.TEMPORAL);
        graphObjRef.handleFormRelations(3, 4, EventRelationType.EQUAL, FormType.TEMPORAL);
    });

    it('test1 setting cause relation between two edges', () => {
        graphObj.handleFormRelations(0, 1, EventRelationType.COREF, FormType.COREF);
        graphObj.handleFormRelations(1, 2, EventRelationType.COREF, FormType.COREF);

        let refGraphMatrix = graphObjRef.getGraphMatrix();
        refGraphMatrix[0][1] = EventRelationType.COREF;
        refGraphMatrix[1][0] = EventRelationType.COREF;
        refGraphMatrix[1][2] = EventRelationType.COREF;
        refGraphMatrix[2][1] = EventRelationType.COREF;

        console.log(graphObj.printGraph());
        expect(graphObj.getGraphMatrix()).toEqual(refGraphMatrix);
    });

    it('test2.1 0-coref->1-no_coref->2 => need to check 0->2', () => {
        graphObj.handleFormRelations(0, 1, EventRelationType.COREF, FormType.COREF);
        graphObj.handleFormRelations(1, 2, EventRelationType.NO_COREF, FormType.COREF);

        let refGraphMatrix = graphObjRef.getGraphMatrix();
        refGraphMatrix[0][1] = EventRelationType.COREF;
        refGraphMatrix[1][0] = EventRelationType.COREF;
        refGraphMatrix[1][2] = EventRelationType.NO_COREF;
        refGraphMatrix[2][1] = EventRelationType.NO_COREF;

        console.log(graphObj.printGraph());
        expect(graphObj.getGraphMatrix()).toEqual(refGraphMatrix);
    });

    it('test2.2 0-coref->1-uncertain_coref->2 => need to check 0->2', () => {
        graphObj.handleFormRelations(0, 1, EventRelationType.COREF, FormType.COREF);
        graphObj.handleFormRelations(1, 2, EventRelationType.UNCERTAIN_COREF, FormType.COREF);

        let refGraphMatrix = graphObjRef.getGraphMatrix();
        refGraphMatrix[0][1] = EventRelationType.COREF;
        refGraphMatrix[1][0] = EventRelationType.COREF;
        refGraphMatrix[1][2] = EventRelationType.UNCERTAIN_COREF;
        refGraphMatrix[2][1] = EventRelationType.UNCERTAIN_COREF;

        console.log(graphObj.printGraph());
        expect(graphObj.getGraphMatrix()).toEqual(refGraphMatrix);
    });

    it('test3.1 0-no_coref->1-coref->2 => need to check 0->2', () => {
        graphObj.handleFormRelations(0, 1, EventRelationType.NO_COREF, FormType.COREF);
        graphObj.handleFormRelations(1, 2, EventRelationType.COREF, FormType.COREF);

        let refGraphMatrix = graphObjRef.getGraphMatrix();
        refGraphMatrix[0][1] = EventRelationType.NO_COREF;
        refGraphMatrix[1][0] = EventRelationType.NO_COREF;
        refGraphMatrix[1][2] = EventRelationType.COREF;
        refGraphMatrix[2][1] = EventRelationType.COREF;

        console.log(graphObj.printGraph());
        expect(graphObj.getGraphMatrix()).toEqual(refGraphMatrix);
    });

    it('test3.2 0-coref->1-no_coref->2->coref->3 => need to check 0->3', () => {
        graphObj.handleFormRelations(0, 1, EventRelationType.COREF, FormType.COREF);
        graphObj.handleFormRelations(1, 2, EventRelationType.NO_COREF, FormType.COREF);
        graphObj.handleFormRelations(2, 3, EventRelationType.COREF, FormType.COREF);

        let refGraphMatrix = graphObjRef.getGraphMatrix();
        refGraphMatrix[0][1] = EventRelationType.COREF;
        refGraphMatrix[1][0] = EventRelationType.COREF;
        refGraphMatrix[1][2] = EventRelationType.NO_COREF;
        refGraphMatrix[2][1] = EventRelationType.NO_COREF;
        refGraphMatrix[2][3] = EventRelationType.COREF;
        refGraphMatrix[3][2] = EventRelationType.COREF;

        console.log(graphObj.printGraph());
        expect(graphObj.getGraphMatrix()).toEqual(refGraphMatrix);
    });

    it('test3.3 0-no_coref->1-coref->2->no_coref->3 => need to check 0->3', () => {
        graphObj.handleFormRelations(0, 1, EventRelationType.NO_COREF, FormType.COREF);
        graphObj.handleFormRelations(1, 2, EventRelationType.COREF, FormType.COREF);
        graphObj.handleFormRelations(2, 3, EventRelationType.NO_COREF, FormType.COREF);

        let refGraphMatrix = graphObjRef.getGraphMatrix();
        refGraphMatrix[0][1] = EventRelationType.NO_COREF;
        refGraphMatrix[1][0] = EventRelationType.NO_COREF;
        refGraphMatrix[1][2] = EventRelationType.COREF;
        refGraphMatrix[2][1] = EventRelationType.COREF;
        refGraphMatrix[2][3] = EventRelationType.NO_COREF;
        refGraphMatrix[3][2] = EventRelationType.NO_COREF;

        refGraphMatrix[0][3] = EventRelationType.EQUAL;
        refGraphMatrix[3][0] = EventRelationType.EQUAL;

        console.log(graphObj.printGraph());
        expect(graphObj.getGraphMatrix()).toEqual(refGraphMatrix);
    });

    it('test3.4 0-uncertain_coref->1-coref->2 => need to check 0->2', () => {
        graphObj.handleFormRelations(0, 1, EventRelationType.UNCERTAIN_COREF, FormType.COREF);
        graphObj.handleFormRelations(1, 2, EventRelationType.COREF, FormType.COREF);

        let refGraphMatrix = graphObjRef.getGraphMatrix();
        refGraphMatrix[0][1] = EventRelationType.UNCERTAIN_COREF;
        refGraphMatrix[1][0] = EventRelationType.UNCERTAIN_COREF;
        refGraphMatrix[1][2] = EventRelationType.COREF;
        refGraphMatrix[2][1] = EventRelationType.COREF;

        console.log(graphObj.printGraph());
        expect(graphObj.getGraphMatrix()).toEqual(refGraphMatrix);
    });

    it('test4.1 0-no_coref->1-no_coref->2 => need to check 0->2', () => {
        graphObj.handleFormRelations(0, 1, EventRelationType.NO_COREF, FormType.COREF);
        graphObj.handleFormRelations(1, 2, EventRelationType.NO_COREF, FormType.COREF);

        let refGraphMatrix = graphObjRef.getGraphMatrix();
        refGraphMatrix[0][1] = EventRelationType.NO_COREF;
        refGraphMatrix[1][0] = EventRelationType.NO_COREF;
        refGraphMatrix[1][2] = EventRelationType.NO_COREF;
        refGraphMatrix[2][1] = EventRelationType.NO_COREF;

        expect(refGraphMatrix[0][2]).toEqual(EventRelationType.NA);
        expect(refGraphMatrix[2][0]).toEqual(EventRelationType.NA);

        refGraphMatrix[0][2] = EventRelationType.EQUAL;
        refGraphMatrix[2][0] = EventRelationType.EQUAL;

        console.log(graphObj.printGraph());
        expect(graphObj.getGraphMatrix()).toEqual(refGraphMatrix);
    });

    it('test4.2 0-uncertain_coref->1-uncertain_coref->2 => need to check 0->2', () => {
        graphObj.handleFormRelations(0, 1, EventRelationType.UNCERTAIN_COREF, FormType.COREF);
        graphObj.handleFormRelations(1, 2, EventRelationType.UNCERTAIN_COREF, FormType.COREF);

        let refGraphMatrix = graphObjRef.getGraphMatrix();
        refGraphMatrix[0][1] = EventRelationType.UNCERTAIN_COREF;
        refGraphMatrix[1][0] = EventRelationType.UNCERTAIN_COREF;
        refGraphMatrix[1][2] = EventRelationType.UNCERTAIN_COREF;
        refGraphMatrix[2][1] = EventRelationType.UNCERTAIN_COREF;

        expect(refGraphMatrix[0][2]).toEqual(EventRelationType.NA);
        expect(refGraphMatrix[2][0]).toEqual(EventRelationType.NA);

        refGraphMatrix[0][2] = EventRelationType.EQUAL;
        refGraphMatrix[2][0] = EventRelationType.EQUAL;

        console.log(graphObj.printGraph());
        expect(graphObj.getGraphMatrix()).toEqual(refGraphMatrix);
    });

    it('test5.1 discrepancies 0-no_coref->1-no_coref->2 (0->2 no_coref)', () => {
        let discrepancies = [];
        discrepancies = graphObj.handleFormRelations(0, 1, EventRelationType.NO_COREF, FormType.COREF);
        expect(discrepancies.length).toEqual(0);

        discrepancies = graphObj.handleFormRelations(1, 2, EventRelationType.NO_COREF, FormType.COREF);
        expect(discrepancies.length).toEqual(0);

        discrepancies = graphObj.handleFormRelations(0, 2, EventRelationType.NO_COREF, FormType.COREF);
        expect(discrepancies.length).toEqual(0);
    });

    it('test5.2 discrepancies 0-uncertain_coref->1-uncertain_coref->2 (0->2 no_coref)', () => {
        let discrepancies = [];
        discrepancies = graphObj.handleFormRelations(0, 1, EventRelationType.UNCERTAIN_COREF, FormType.COREF);
        expect(discrepancies.length).toEqual(0);

        discrepancies = graphObj.handleFormRelations(1, 2, EventRelationType.UNCERTAIN_COREF, FormType.COREF);
        expect(discrepancies.length).toEqual(0);

        discrepancies = graphObj.handleFormRelations(0, 2, EventRelationType.UNCERTAIN_COREF, FormType.COREF);
        expect(discrepancies.length).toEqual(0);
    });

    it('test6.1 discrepancies 0-no_coref->1-no_coref->2 (0->2 coref)', () => {
        let discrepancies = [];
        discrepancies = graphObj.handleFormRelations(0, 1, EventRelationType.NO_COREF, FormType.COREF);
        expect(discrepancies.length).toEqual(0);

        discrepancies = graphObj.handleFormRelations(1, 2, EventRelationType.NO_COREF, FormType.COREF);
        expect(discrepancies.length).toEqual(0);

        discrepancies = graphObj.handleFormRelations(0, 2, EventRelationType.COREF, FormType.COREF);
        expect(discrepancies.length).toEqual(0);
    });

    it('test6.2 discrepancies 0-uncertain_coref->1-uncertain_coref->2 (0->2 coref)', () => {
        let discrepancies = [];
        discrepancies = graphObj.handleFormRelations(0, 1, EventRelationType.UNCERTAIN_COREF, FormType.COREF);
        expect(discrepancies.length).toEqual(0);

        discrepancies = graphObj.handleFormRelations(1, 2, EventRelationType.UNCERTAIN_COREF, FormType.COREF);
        expect(discrepancies.length).toEqual(0);

        discrepancies = graphObj.handleFormRelations(0, 2, EventRelationType.COREF, FormType.COREF);
        expect(discrepancies.length).toEqual(0);
    });

    it('test6.3 discrepancies 0-uncertain_coref->1-no_coref->2 (0->2 coref)', () => {
        let discrepancies = [];
        discrepancies = graphObj.handleFormRelations(0, 1, EventRelationType.UNCERTAIN_COREF, FormType.COREF);
        expect(discrepancies.length).toEqual(0);

        discrepancies = graphObj.handleFormRelations(1, 2, EventRelationType.NO_COREF, FormType.COREF);
        expect(discrepancies.length).toEqual(0);

        discrepancies = graphObj.handleFormRelations(0, 2, EventRelationType.COREF, FormType.COREF);
        expect(discrepancies.length).toEqual(0);
    });

    it('test7.1 discrepancies 0-coref->1-no_coref->2 (0->2 coref)', () => {
        let discrepancies = [];
        discrepancies = graphObj.handleFormRelations(0, 1, EventRelationType.COREF, FormType.COREF);
        expect(discrepancies.length).toEqual(0);

        discrepancies = graphObj.handleFormRelations(1, 2, EventRelationType.NO_COREF, FormType.COREF);
        expect(discrepancies.length).toEqual(0);

        discrepancies = graphObj.handleFormRelations(0, 2, EventRelationType.COREF, FormType.COREF);
        expect(discrepancies.length).toBeGreaterThan(0);
    });

    it('test7.2 discrepancies 0-coref->1-uncertain_coref->2 (0->2 coref)', () => {
        let discrepancies = [];
        discrepancies = graphObj.handleFormRelations(0, 1, EventRelationType.COREF, FormType.COREF);
        expect(discrepancies.length).toEqual(0);

        discrepancies = graphObj.handleFormRelations(1, 2, EventRelationType.UNCERTAIN_COREF, FormType.COREF);
        expect(discrepancies.length).toEqual(0);

        discrepancies = graphObj.handleFormRelations(0, 2, EventRelationType.COREF, FormType.COREF);
        expect(discrepancies.length).toBeGreaterThan(0);
    });

    it('test8.1 discrepancies 0-no_coref->1-coref->2 (0->2 coref)', () => {
        let discrepancies = [];
        discrepancies = graphObj.handleFormRelations(0, 1, EventRelationType.NO_COREF, FormType.COREF);
        expect(discrepancies.length).toEqual(0);

        discrepancies = graphObj.handleFormRelations(1, 2, EventRelationType.COREF, FormType.COREF);
        expect(discrepancies.length).toEqual(0);

        discrepancies = graphObj.handleFormRelations(0, 2, EventRelationType.COREF, FormType.COREF);
        expect(discrepancies.length).toBeGreaterThan(0);
    });

    it('test8.2 discrepancies 0-uncertain_coref->1-coref->2 (0->2 coref)', () => {
        let discrepancies = [];
        discrepancies = graphObj.handleFormRelations(0, 1, EventRelationType.UNCERTAIN_COREF, FormType.COREF);
        expect(discrepancies.length).toEqual(0);

        discrepancies = graphObj.handleFormRelations(1, 2, EventRelationType.COREF, FormType.COREF);
        expect(discrepancies.length).toEqual(0);

        discrepancies = graphObj.handleFormRelations(0, 2, EventRelationType.COREF, FormType.COREF);
        expect(discrepancies.length).toBeGreaterThan(0);
    });

    it('test9.1 discrepancies 0-coref->1-coref->2 (0->2 no_coref)', () => {
        let discrepancies = [];
        discrepancies = graphObj.handleFormRelations(0, 1, EventRelationType.COREF, FormType.COREF);
        expect(discrepancies.length).toEqual(0);

        discrepancies = graphObj.handleFormRelations(1, 2, EventRelationType.COREF, FormType.COREF);
        expect(discrepancies.length).toEqual(0);

        discrepancies = graphObj.handleFormRelations(0, 2, EventRelationType.NO_COREF, FormType.COREF);
        expect(discrepancies.length).toBeGreaterThan(0);
    });

    it('test9.2 discrepancies 0-coref->1-coref->2 (0->2 uncertain_coref)', () => {
        let discrepancies = [];
        discrepancies = graphObj.handleFormRelations(0, 1, EventRelationType.COREF, FormType.COREF);
        expect(discrepancies.length).toEqual(0);

        discrepancies = graphObj.handleFormRelations(1, 2, EventRelationType.COREF, FormType.COREF);
        expect(discrepancies.length).toEqual(0);

        discrepancies = graphObj.handleFormRelations(0, 2, EventRelationType.UNCERTAIN_COREF, FormType.COREF);
        expect(discrepancies.length).toBeGreaterThan(0);
    });

    it('test10 discrepancies 0-coref->1-coref->2 (0->2 coref)', () => {
        let discrepancies = [];
        discrepancies = graphObj.handleFormRelations(0, 1, EventRelationType.COREF, FormType.COREF);
        expect(discrepancies.length).toEqual(0);

        discrepancies = graphObj.handleFormRelations(1, 2, EventRelationType.COREF, FormType.COREF);
        expect(discrepancies.length).toEqual(0);

        discrepancies = graphObj.handleFormRelations(0, 2, EventRelationType.COREF, FormType.COREF);
        expect(discrepancies.length).toEqual(0);
    });
});
