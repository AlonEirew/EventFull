// describe('All Axes Tests', () => {
//     beforeEach(async function(done) {
//         const url = 'resources/81d6_test_only_events.json'; // Adjust the URL to where your JSON file is served
//         try {
//             const response = await fetch(url);
//             const jsonData = await response.json();
//             expect(jsonData).toBeDefined();
//             allAxes = AllAxes.fromJsonObject(jsonData);
//             done();
//         } catch (error) {
//             console.error('Error fetching JSON:', error);
//             done.fail(error); // Fail the test in case of error
//         }
//     });
//
//     it('simulate annotation', () => {
//         const allPairs = allAxes.getAllAxesPairsFlat(FormType.COREF);
//         // pair0_ids = {47, 40}, pair1_ids = {40, 2}, pair2_ids = {2, 5}
//         const event47 = allAxes.getEventByEventId("47");
//         const event40 = allAxes.getEventByEventId("40");
//         const event2 = allAxes.getEventByEventId("2");
//         const event5 = allAxes.getEventByEventId("5");
//
//         const causalForm = new CausalForm(0, allAxes);
//
//         causalForm.handleSelection();
//
//         allAxes.handleClusterSelection(allPairs[0], EventRelationType.COREF);
//         allAxes.handleClusterSelection(allPairs[1], EventRelationType.COREF);
//         allAxes.handleClusterSelection(allPairs[2], EventRelationType.COREF);
//
//         expect(event47.getClusterId()).toEqual(event40.getClusterId());
//         expect(event40.getClusterId()).toEqual(event2.getClusterId());
//         expect(event2.getClusterId()).toEqual(event5.getClusterId());
//
//         allAxes.handleClusterSelection(allPairs[0], EventRelationType.NO_COREF);
//
//         expect(event47.getClusterId()).not.toEqual(event40.getClusterId());
//         expect(event40.getClusterId()).toEqual(event2.getClusterId());
//         expect(event2.getClusterId()).toEqual(event5.getClusterId());
//
//         allAxes.handleClusterSelection(allPairs[0], EventRelationType.COREF);
//
//         expect(event47.getClusterId()).toEqual(event40.getClusterId());
//         expect(event40.getClusterId()).toEqual(event2.getClusterId());
//         expect(event2.getClusterId()).toEqual(event5.getClusterId());
//
//         allAxes.handleClusterSelection(allPairs[1], EventRelationType.NO_COREF);
//
//         expect(event47.getClusterId()).toEqual(event40.getClusterId());
//         expect(event40.getClusterId()).not.toEqual(event2.getClusterId());
//         expect(event2.getClusterId()).toEqual(event5.getClusterId());
//         expect(event47.getClusterId()).not.toEqual(event2.getClusterId());
//     });
// });