describe('Causal Graph Algo Tests', () => {
    beforeEach(() => {
        // in graph the indexes are as follows (0, 1, 2, 3)
        graphIdxes = [0, 1, 2, 3, 4]
        graphObj = new GraphObj();
        graphObj.initGraph(graphIdxes);
        graphObjRef = new GraphObj();
        graphObjRef.initGraph(graphIdxes);

        graphObj.handleFormRelations(0, 1, EventRelationType.BEFORE, FormType.TEMPORAL);
        graphObj.handleFormRelations(1, 2, EventRelationType.BEFORE, FormType.TEMPORAL);
        graphObj.handleFormRelations(2, 3, EventRelationType.BEFORE, FormType.TEMPORAL);
        // graphObj.handleFormRelations(3, 4, EventRelationType.BEFORE, FormType.TEMPORAL);

        graphObjRef.handleFormRelations(0, 1, EventRelationType.BEFORE, FormType.TEMPORAL);
        graphObjRef.handleFormRelations(1, 2, EventRelationType.BEFORE, FormType.TEMPORAL);
        graphObjRef.handleFormRelations(2, 3, EventRelationType.BEFORE, FormType.TEMPORAL);
        // graphObjRef.handleFormRelations(3, 4, EventRelationType.BEFORE, FormType.TEMPORAL);
    });

    it('test1 setting cause relation between two edges', () => {
        graphObj.handleFormRelations(0, 1, EventRelationType.CAUSE, FormType.CAUSAL);
        graphObj.handleFormRelations(1, 2, EventRelationType.CAUSE, FormType.CAUSAL);

        let refGraphMatrix = graphObjRef.getGraphMatrix();
        refGraphMatrix[0][1] = EventRelationType.CAUSE;
        refGraphMatrix[1][0] = EventRelationType.EFFECT;
        refGraphMatrix[1][2] = EventRelationType.CAUSE;
        refGraphMatrix[2][1] = EventRelationType.EFFECT;

        console.log(graphObj.printGraph());
        expect(graphObj.getGraphMatrix()).toEqual(refGraphMatrix);
    });

    it('test2.1 0-cause->1-no_cause->2 => need to check 0->2', () => {
        graphObj.handleFormRelations(0, 1, EventRelationType.CAUSE, FormType.CAUSAL);
        graphObj.handleFormRelations(1, 2, EventRelationType.NO_CAUSE, FormType.CAUSAL);

        let refGraphMatrix = graphObjRef.getGraphMatrix();
        refGraphMatrix[0][1] = EventRelationType.CAUSE;
        refGraphMatrix[1][0] = EventRelationType.EFFECT;
        refGraphMatrix[1][2] = EventRelationType.NO_CAUSE;
        refGraphMatrix[2][1] = EventRelationType.NO_EFFECT;

        expect(refGraphMatrix[0][2]).toEqual(EventRelationType.NA);
        expect(refGraphMatrix[2][0]).toEqual(EventRelationType.NA);

        // refGraphMatrix[0][2] = EventRelationType.BEFORE;
        // refGraphMatrix[2][0] = EventRelationType.AFTER;

        console.log(graphObj.printGraph());
        expect(graphObj.getGraphMatrix()).toEqual(refGraphMatrix);
    });

    it('test2.2 0-cause->1-uncertain_cause->2 => need to check 0->2', () => {
        graphObj.handleFormRelations(0, 1, EventRelationType.CAUSE, FormType.CAUSAL);
        graphObj.handleFormRelations(1, 2, EventRelationType.UNCERTAIN_CAUSE, FormType.CAUSAL);

        let refGraphMatrix = graphObjRef.getGraphMatrix();
        refGraphMatrix[0][1] = EventRelationType.CAUSE;
        refGraphMatrix[1][0] = EventRelationType.EFFECT;
        refGraphMatrix[1][2] = EventRelationType.UNCERTAIN_CAUSE;
        refGraphMatrix[2][1] = EventRelationType.UNCERTAIN_EFFECT;

        expect(refGraphMatrix[0][2]).toEqual(EventRelationType.NA);
        expect(refGraphMatrix[2][0]).toEqual(EventRelationType.NA);

        // refGraphMatrix[0][2] = EventRelationType.BEFORE;
        // refGraphMatrix[2][0] = EventRelationType.AFTER;

        console.log(graphObj.printGraph());
        expect(graphObj.getGraphMatrix()).toEqual(refGraphMatrix);
    });

    it('test3.1 0-no_cause->1-cause->2 => need to check 0->2', () => {
        graphObj.handleFormRelations(0, 1, EventRelationType.NO_CAUSE, FormType.CAUSAL);
        graphObj.handleFormRelations(1, 2, EventRelationType.CAUSE, FormType.CAUSAL);

        let refGraphMatrix = graphObjRef.getGraphMatrix();
        refGraphMatrix[0][1] = EventRelationType.NO_CAUSE;
        refGraphMatrix[1][0] = EventRelationType.NO_EFFECT;
        refGraphMatrix[1][2] = EventRelationType.CAUSE;
        refGraphMatrix[2][1] = EventRelationType.EFFECT;

        expect(refGraphMatrix[0][2]).toEqual(EventRelationType.NA);
        expect(refGraphMatrix[2][0]).toEqual(EventRelationType.NA);

        // refGraphMatrix[0][2] = EventRelationType.BEFORE;
        // refGraphMatrix[2][0] = EventRelationType.AFTER;

        console.log(graphObj.printGraph());
        expect(graphObj.getGraphMatrix()).toEqual(refGraphMatrix);
    });

    it('test3.2 0-uncertain_cause->1-cause->2 => need to check 0->2', () => {
        graphObj.handleFormRelations(0, 1, EventRelationType.UNCERTAIN_CAUSE, FormType.CAUSAL);
        graphObj.handleFormRelations(1, 2, EventRelationType.CAUSE, FormType.CAUSAL);

        let refGraphMatrix = graphObjRef.getGraphMatrix();
        refGraphMatrix[0][1] = EventRelationType.UNCERTAIN_CAUSE;
        refGraphMatrix[1][0] = EventRelationType.UNCERTAIN_EFFECT;
        refGraphMatrix[1][2] = EventRelationType.CAUSE;
        refGraphMatrix[2][1] = EventRelationType.EFFECT;

        expect(refGraphMatrix[0][2]).toEqual(EventRelationType.NA);
        expect(refGraphMatrix[2][0]).toEqual(EventRelationType.NA);

        // refGraphMatrix[0][2] = EventRelationType.BEFORE;
        // refGraphMatrix[2][0] = EventRelationType.AFTER;

        console.log(graphObj.printGraph());
        expect(graphObj.getGraphMatrix()).toEqual(refGraphMatrix);
    });

    it('test4.1 0-no_cause->1-no_cause->2 => need to check 0->2', () => {
        graphObj.handleFormRelations(0, 1, EventRelationType.NO_CAUSE, FormType.CAUSAL);
        graphObj.handleFormRelations(1, 2, EventRelationType.NO_CAUSE, FormType.CAUSAL);

        let refGraphMatrix = graphObjRef.getGraphMatrix();
        refGraphMatrix[0][1] = EventRelationType.NO_CAUSE;
        refGraphMatrix[1][0] = EventRelationType.NO_EFFECT;
        refGraphMatrix[1][2] = EventRelationType.NO_CAUSE;
        refGraphMatrix[2][1] = EventRelationType.NO_EFFECT;

        expect(refGraphMatrix[0][2]).toEqual(EventRelationType.NA);
        expect(refGraphMatrix[2][0]).toEqual(EventRelationType.NA);

        // refGraphMatrix[0][2] = EventRelationType.BEFORE;
        // refGraphMatrix[2][0] = EventRelationType.AFTER;

        console.log(graphObj.printGraph());
        expect(graphObj.getGraphMatrix()).toEqual(refGraphMatrix);
    });

    it('test4.2 0-uncertain_cause->1-uncertain_cause->2 => need to check 0->2', () => {
        graphObj.handleFormRelations(0, 1, EventRelationType.UNCERTAIN_CAUSE, FormType.CAUSAL);
        graphObj.handleFormRelations(1, 2, EventRelationType.UNCERTAIN_CAUSE, FormType.CAUSAL);

        let refGraphMatrix = graphObjRef.getGraphMatrix();
        refGraphMatrix[0][1] = EventRelationType.UNCERTAIN_CAUSE;
        refGraphMatrix[1][0] = EventRelationType.UNCERTAIN_EFFECT;
        refGraphMatrix[1][2] = EventRelationType.UNCERTAIN_CAUSE;
        refGraphMatrix[2][1] = EventRelationType.UNCERTAIN_EFFECT;

        expect(refGraphMatrix[0][2]).toEqual(EventRelationType.NA);
        expect(refGraphMatrix[2][0]).toEqual(EventRelationType.NA);

        // refGraphMatrix[0][2] = EventRelationType.BEFORE;
        // refGraphMatrix[2][0] = EventRelationType.AFTER;

        console.log(graphObj.printGraph());
        expect(graphObj.getGraphMatrix()).toEqual(refGraphMatrix);
    });

    it('test4.3 0-no_cause->1-uncertain_cause->2 => need to check 0->2', () => {
        graphObj.handleFormRelations(0, 1, EventRelationType.NO_CAUSE, FormType.CAUSAL);
        graphObj.handleFormRelations(1, 2, EventRelationType.UNCERTAIN_CAUSE, FormType.CAUSAL);

        let refGraphMatrix = graphObjRef.getGraphMatrix();
        refGraphMatrix[0][1] = EventRelationType.NO_CAUSE;
        refGraphMatrix[1][0] = EventRelationType.NO_EFFECT;
        refGraphMatrix[1][2] = EventRelationType.UNCERTAIN_CAUSE;
        refGraphMatrix[2][1] = EventRelationType.UNCERTAIN_EFFECT;

        expect(refGraphMatrix[0][2]).toEqual(EventRelationType.NA);
        expect(refGraphMatrix[2][0]).toEqual(EventRelationType.NA);

        // refGraphMatrix[0][2] = EventRelationType.BEFORE;
        // refGraphMatrix[2][0] = EventRelationType.AFTER;

        console.log(graphObj.printGraph());
        expect(graphObj.getGraphMatrix()).toEqual(refGraphMatrix);
    });

    it('test4.4 0-uncertain_cause->1-no_cause->2 => need to check 0->2', () => {
        graphObj.handleFormRelations(0, 1, EventRelationType.UNCERTAIN_CAUSE, FormType.CAUSAL);
        graphObj.handleFormRelations(1, 2, EventRelationType.NO_CAUSE, FormType.CAUSAL);

        let refGraphMatrix = graphObjRef.getGraphMatrix();
        refGraphMatrix[0][1] = EventRelationType.UNCERTAIN_CAUSE;
        refGraphMatrix[1][0] = EventRelationType.UNCERTAIN_EFFECT;
        refGraphMatrix[1][2] = EventRelationType.NO_CAUSE;
        refGraphMatrix[2][1] = EventRelationType.NO_EFFECT;

        expect(refGraphMatrix[0][2]).toEqual(EventRelationType.NA);
        expect(refGraphMatrix[2][0]).toEqual(EventRelationType.NA);

        // refGraphMatrix[0][2] = EventRelationType.BEFORE;
        // refGraphMatrix[2][0] = EventRelationType.AFTER;

        console.log(graphObj.printGraph());
        expect(graphObj.getGraphMatrix()).toEqual(refGraphMatrix);
    });

    // it('test5.1 discrepancies 0-no_cause->1-no_cause->2 (0->2 cause) => need to check 0->2', () => {
    //     let dicrepencies = [];
    //     dicrepencies = graphObj.handleFormRelations(0, 1, EventRelationType.NO_CAUSE, FormType.CAUSAL);
    //     expect(dicrepencies.length).toEqual(0);
    //
    //     dicrepencies = graphObj.handleFormRelations(1, 2, EventRelationType.NO_CAUSE, FormType.CAUSAL);
    //     expect(dicrepencies.length).toEqual(0);
    //
    //     dicrepencies = graphObj.handleFormRelations(0, 2, EventRelationType.CAUSE, FormType.CAUSAL);
    //     expect(dicrepencies.length).toEqual(0);
    // });
    //
    // it('test5.2 discrepancies 0-uncertain_cause->1-no_cause->2 (0->2 cause) => need to check 0->2', () => {
    //     let dicrepencies = [];
    //     dicrepencies = graphObj.handleFormRelations(0, 1, EventRelationType.UNCERTAIN_CAUSE, FormType.CAUSAL);
    //     expect(dicrepencies.length).toEqual(0);
    //
    //     dicrepencies = graphObj.handleFormRelations(1, 2, EventRelationType.NO_CAUSE, FormType.CAUSAL);
    //     expect(dicrepencies.length).toEqual(0);
    //
    //     dicrepencies = graphObj.handleFormRelations(0, 2, EventRelationType.CAUSE, FormType.CAUSAL);
    //     expect(dicrepencies.length).toEqual(0);
    // });
    //
    // it('test5.3 discrepancies 0-no_cause->1-uncertain_cause->2 (0->2 cause) => need to check 0->2', () => {
    //     let dicrepencies = [];
    //     dicrepencies = graphObj.handleFormRelations(0, 1, EventRelationType.NO_CAUSE, FormType.CAUSAL);
    //     expect(dicrepencies.length).toEqual(0);
    //
    //     dicrepencies = graphObj.handleFormRelations(1, 2, EventRelationType.UNCERTAIN_CAUSE, FormType.CAUSAL);
    //     expect(dicrepencies.length).toEqual(0);
    //
    //     dicrepencies = graphObj.handleFormRelations(0, 2, EventRelationType.CAUSE, FormType.CAUSAL);
    //     expect(dicrepencies.length).toEqual(0);
    // });
    //
    // it('test5.4 discrepancies 0-uncertain_cause->1-uncertain_cause->2 (0->2 cause) => need to check 0->2', () => {
    //     let dicrepencies = [];
    //     dicrepencies = graphObj.handleFormRelations(0, 1, EventRelationType.UNCERTAIN_CAUSE, FormType.CAUSAL);
    //     expect(dicrepencies.length).toEqual(0);
    //
    //     dicrepencies = graphObj.handleFormRelations(1, 2, EventRelationType.UNCERTAIN_CAUSE, FormType.CAUSAL);
    //     expect(dicrepencies.length).toEqual(0);
    //
    //     dicrepencies = graphObj.handleFormRelations(0, 2, EventRelationType.CAUSE, FormType.CAUSAL);
    //     expect(dicrepencies.length).toEqual(0);
    // });
    //
    // it('test6.1 discrepancies 0-no_cause->1-no_cause->2 (0->2 no_cause) => need to check 0->2', () => {
    //     let dicrepencies = [];
    //     dicrepencies = graphObj.handleFormRelations(0, 1, EventRelationType.NO_CAUSE, FormType.CAUSAL);
    //     expect(dicrepencies.length).toEqual(0);
    //
    //     dicrepencies = graphObj.handleFormRelations(1, 2, EventRelationType.NO_CAUSE, FormType.CAUSAL);
    //     expect(dicrepencies.length).toEqual(0);
    //
    //     dicrepencies = graphObj.handleFormRelations(0, 2, EventRelationType.NO_CAUSE, FormType.CAUSAL);
    //     expect(dicrepencies.length).toEqual(0);
    // });
    //
    // it('test6.2 discrepancies 0-uncertain_cause->1-uncertain_cause->2 (0->2 uncertain_cause) => need to check 0->2', () => {
    //     let dicrepencies = [];
    //     dicrepencies = graphObj.handleFormRelations(0, 1, EventRelationType.UNCERTAIN_CAUSE, FormType.CAUSAL);
    //     expect(dicrepencies.length).toEqual(0);
    //
    //     dicrepencies = graphObj.handleFormRelations(1, 2, EventRelationType.UNCERTAIN_CAUSE, FormType.CAUSAL);
    //     expect(dicrepencies.length).toEqual(0);
    //
    //     dicrepencies = graphObj.handleFormRelations(0, 2, EventRelationType.UNCERTAIN_CAUSE, FormType.CAUSAL);
    //     expect(dicrepencies.length).toEqual(0);
    // });
    //
    // it('test6.3 discrepancies 0-no_cause->1-uncertain_cause->2 (0->2 no_cause) => need to check 0->2', () => {
    //     let dicrepencies = [];
    //     dicrepencies = graphObj.handleFormRelations(0, 1, EventRelationType.NO_CAUSE, FormType.CAUSAL);
    //     expect(dicrepencies.length).toEqual(0);
    //
    //     dicrepencies = graphObj.handleFormRelations(1, 2, EventRelationType.UNCERTAIN_CAUSE, FormType.CAUSAL);
    //     expect(dicrepencies.length).toEqual(0);
    //
    //     dicrepencies = graphObj.handleFormRelations(0, 2, EventRelationType.NO_CAUSE, FormType.CAUSAL);
    //     expect(dicrepencies.length).toEqual(0);
    // });
    //
    // it('test7 discrepancies 0-cause->1-cause->2 (0->2 cause) => need to check 0->2', () => {
    //     let dicrepencies = [];
    //     dicrepencies = graphObj.handleFormRelations(0, 1, EventRelationType.CAUSE, FormType.CAUSAL);
    //     expect(dicrepencies.length).toEqual(0);
    //
    //     dicrepencies = graphObj.handleFormRelations(1, 2, EventRelationType.CAUSE, FormType.CAUSAL);
    //     expect(dicrepencies.length).toEqual(0);
    //
    //     dicrepencies = graphObj.handleFormRelations(0, 2, EventRelationType.CAUSE, FormType.CAUSAL);
    //     expect(dicrepencies.length).toEqual(0);
    // });
    //
    // it('test8.1 discrepancies 0-cause->1-no_cause->2 (0->2 cause) => need to check 0->2', () => {
    //     let dicrepencies = [];
    //     dicrepencies = graphObj.handleFormRelations(0, 1, EventRelationType.CAUSE, FormType.CAUSAL);
    //     expect(dicrepencies.length).toEqual(0);
    //
    //     dicrepencies = graphObj.handleFormRelations(1, 2, EventRelationType.NO_CAUSE, FormType.CAUSAL);
    //     expect(dicrepencies.length).toEqual(0);
    //
    //     dicrepencies = graphObj.handleFormRelations(0, 2, EventRelationType.CAUSE, FormType.CAUSAL);
    //     expect(dicrepencies.length).toEqual(0);
    // });
    //
    // it('test8.2 discrepancies 0-cause->1-uncertain_cause->2 (0->2 cause) => need to check 0->2', () => {
    //     let dicrepencies = [];
    //     dicrepencies = graphObj.handleFormRelations(0, 1, EventRelationType.CAUSE, FormType.CAUSAL);
    //     expect(dicrepencies.length).toEqual(0);
    //
    //     dicrepencies = graphObj.handleFormRelations(1, 2, EventRelationType.UNCERTAIN_CAUSE, FormType.CAUSAL);
    //     expect(dicrepencies.length).toEqual(0);
    //
    //     dicrepencies = graphObj.handleFormRelations(0, 2, EventRelationType.CAUSE, FormType.CAUSAL);
    //     expect(dicrepencies.length).toEqual(0);
    // });
    //
    // it('test9.1 discrepancies 0-cause->1-no_cause->2 (0->2 cause) => need to check 0->2', () => {
    //     let dicrepencies = [];
    //     dicrepencies = graphObj.handleFormRelations(0, 1, EventRelationType.NO_CAUSE, FormType.CAUSAL);
    //     expect(dicrepencies.length).toEqual(0);
    //
    //     dicrepencies = graphObj.handleFormRelations(1, 2, EventRelationType.CAUSE, FormType.CAUSAL);
    //     expect(dicrepencies.length).toEqual(0);
    //
    //     dicrepencies = graphObj.handleFormRelations(0, 2, EventRelationType.CAUSE, FormType.CAUSAL);
    //     expect(dicrepencies.length).toEqual(0);
    // });
    //
    // it('test9.2 discrepancies 0-cause->1-uncertain_cause->2 (0->2 cause) => need to check 0->2', () => {
    //     let dicrepencies = [];
    //     dicrepencies = graphObj.handleFormRelations(0, 1, EventRelationType.UNCERTAIN_CAUSE, FormType.CAUSAL);
    //     expect(dicrepencies.length).toEqual(0);
    //
    //     dicrepencies = graphObj.handleFormRelations(1, 2, EventRelationType.CAUSE, FormType.CAUSAL);
    //     expect(dicrepencies.length).toEqual(0);
    //
    //     dicrepencies = graphObj.handleFormRelations(0, 2, EventRelationType.CAUSE, FormType.CAUSAL);
    //     expect(dicrepencies.length).toEqual(0);
    // });
    //
    // it('test10.1 discrepancies 0-cause->1-cause->2 (0->2 no_cause) => need to check 0->2', () => {
    //     let dicrepencies = [];
    //     dicrepencies = graphObj.handleFormRelations(0, 1, EventRelationType.CAUSE, FormType.CAUSAL);
    //     expect(dicrepencies.length).toEqual(0);
    //
    //     dicrepencies = graphObj.handleFormRelations(1, 2, EventRelationType.CAUSE, FormType.CAUSAL);
    //     expect(dicrepencies.length).toEqual(0);
    //
    //     dicrepencies = graphObj.handleFormRelations(0, 2, EventRelationType.NO_CAUSE, FormType.CAUSAL);
    //     expect(dicrepencies.length).toBeGreaterThan(0);
    // });
    //
    // it('test10.2 discrepancies 0-cause->1-cause->2 (0->2 uncertain_cause) => need to check 0->2', () => {
    //     let dicrepencies = [];
    //     dicrepencies = graphObj.handleFormRelations(0, 1, EventRelationType.CAUSE, FormType.CAUSAL);
    //     expect(dicrepencies.length).toEqual(0);
    //
    //     dicrepencies = graphObj.handleFormRelations(1, 2, EventRelationType.CAUSE, FormType.CAUSAL);
    //     expect(dicrepencies.length).toEqual(0);
    //
    //     dicrepencies = graphObj.handleFormRelations(0, 2, EventRelationType.UNCERTAIN_CAUSE, FormType.CAUSAL);
    //     expect(dicrepencies.length).toBeGreaterThan(0);
    // });

    it('test11 0-equal->1-cause->2 (0->2 before) => need to check 0->2', () => {
        let dicrepencies = [];
        graphObj.handleFormRelations(0, 1, EventRelationType.EQUAL, FormType.TEMPORAL);

        graphObj.handleFormRelations(1, 2, EventRelationType.CAUSE, FormType.CAUSAL);

        let refGraphMatrix = graphObjRef.getGraphMatrix();
        refGraphMatrix[0][1] = EventRelationType.EQUAL;
        refGraphMatrix[1][0] = EventRelationType.EQUAL;
        refGraphMatrix[1][2] = EventRelationType.CAUSE;
        refGraphMatrix[2][1] = EventRelationType.EFFECT;

        expect(refGraphMatrix[0][2]).toEqual(EventRelationType.NA);
        expect(refGraphMatrix[2][0]).toEqual(EventRelationType.NA);

        // refGraphMatrix[0][2] = EventRelationType.BEFORE;
        // refGraphMatrix[2][0] = EventRelationType.AFTER;

        expect(graphObj.getGraphMatrix()).toEqual(refGraphMatrix);
    });

    it('test12 0-coref->1-cause->2->cause->3 (0->2/3 cause (coref) 1->3 (cause/transitive))', () => {
        let dicrepencies = [];
        graphObj.handleFormRelations(0, 1, EventRelationType.EQUAL, FormType.TEMPORAL);
        graphObj.handleFormRelations(0, 1, EventRelationType.COREF, FormType.COREF);

        graphObj.handleFormRelations(1, 2, EventRelationType.CAUSE, FormType.CAUSAL);

        graphObj.handleFormRelations(2, 3, EventRelationType.CAUSE, FormType.CAUSAL);

        let refGraphMatrix = graphObjRef.getGraphMatrix();
        refGraphMatrix[0][1] = EventRelationType.COREF;
        refGraphMatrix[1][0] = EventRelationType.COREF;
        refGraphMatrix[1][2] = EventRelationType.CAUSE;
        refGraphMatrix[2][1] = EventRelationType.EFFECT;
        refGraphMatrix[2][3] = EventRelationType.CAUSE;
        refGraphMatrix[3][2] = EventRelationType.EFFECT;
        // refGraphMatrix[0][2] = EventRelationType.BEFORE;
        // refGraphMatrix[2][0] = EventRelationType.AFTER;

        expect(graphObj.getGraphMatrix()).toEqual(refGraphMatrix);
    });
});
