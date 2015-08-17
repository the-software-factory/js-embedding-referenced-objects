angular.module("vnd.api-resource", []);

describe("Test nested transformer", function() {

    var nestedEntitiesTransformer;

    var objectToTransform = {
        content: {
            performances: [{performanceID: 1, eventID: "a"}, {perforamnceID: 2, eventID: "a"}],
            events: [{eventID: "a", venueID: "b"}],
            venues: [{venueID: "b"}],
            tickets:  [
                {ticketID: 1, packageID: "d", test1Id: "0", test2Id: "0"},
                {ticketID: 2, packageID: "d", test1Id: "1", test2Id: "0"}
            ],
            packages: [ {packageID: "d"} ],
            test1: [
                { id: "0", data: "test1 data one", test2Id: "0" },
                { id: "1", data: "test1 data two", test2Id: "0" }
            ],
            test2: [ { id: "0", data: "test2 data", test1Id: "1" } ]
        }
    };

    var chains  = {
        directDependenciesChain: [
            {
                sourcePath: "content.venues",
                sourceId: "venueID",
                destinationPath: "content.events",
                destinationId: "venueID",
                destinationKeyName: "venue"
            },
            {
                sourcePath: "content.events",
                sourceId: "eventID",
                destinationPath: "content.performances",
                destinationId: "eventID",
                destinationKeyName: "event"
            },
            {
                sourcePath: "content.packages",
                sourceId: "packageID",
                destinationPath: "content.tickets",
                destinationId: "packageID",
                destinationKeyName: "package"
            }
        ],
        randomOrderDependeniesChain: [
            {
                sourcePath: "content.packages",
                sourceId: "packageID",
                destinationPath: "content.tickets",
                destinationId: "packageID",
                destinationKeyName: "package"
            },
            {
                sourcePath: "content.venues",
                sourceId: "venueID",
                destinationPath: "content.events",
                destinationId: "venueID",
                destinationKeyName: "venue"
            },
            {
                sourcePath: "content.events",
                sourceId: "eventID",
                destinationPath: "content.performances",
                destinationId: "eventID",
                destinationKeyName: "event"
            }
        ],
        multipleSourcesChain: [
            {
                sourcePath: "content.test1",
                sourceId: "id",
                destinationPath: "content.tickets",
                destinationId: "test1Id",
                destinationKeyName: "test1"
            },
            {
                sourcePath: "content.test2",
                sourceId: "id",
                destinationPath: "content.tickets",
                destinationId: "test2Id",
                destinationKeyName: "test2"
            },
            {
                sourcePath: "content.packages",
                sourceId: "packageID",
                destinationPath: "content.tickets",
                destinationId: "packageID",
                destinationKeyName: "package"
            }
        ]
    };

    var expected = {
        expectedResult: {
            content: {
                performances: [
                    {performanceID: 1, eventID: "a", event: {eventID: "a", venueID: "b", venue: {venueID: "b"}}},
                    {perforamnceID: 2, eventID: "a", event: {eventID: "a", venueID: "b", venue: {venueID: "b"}}}
                ],
                events: [{eventID: "a", venueID: "b", venue: {venueID: "b"}}],
                venues: [{venueID: "b"}],
                tickets: [
                    {ticketID: 1, packageID: "d", test1Id: "0", test2Id: "0", package: {packageID: "d"}},
                    {ticketID: 2, packageID: "d", test1Id: "1", test2Id: "0", package: {packageID: "d"}}
                ],
                packages: [ {packageID: "d"} ],
                test1: [
                    { id: "0", data: "test1 data one", test2Id: "0" },
                    { id: "1", data: "test1 data two", test2Id: "0" }
                ],
                test2: [ { id: "0", data: "test2 data", test1Id: "1" } ]
            }
        },
        multipleSourcesExpectedResult: {
            content: {
                performances: [{performanceID: 1, eventID: "a"}, {perforamnceID: 2, eventID: "a"}],
                events: [{eventID: "a", venueID: "b"}],
                venues: [{venueID: "b"}],
                tickets:  [
                    {
                        ticketID: 1, packageID: "d", test1Id: "0", test2Id: "0",
                        test1: { id: "0", data: "test1 data one", test2Id: "0" },
                        test2: { id: "0", data: "test2 data", test1Id: "1" },
                        package: {packageID: "d"}
                    },
                    {
                        ticketID: 2, packageID: "d", test1Id: "1", test2Id: "0",
                        test1: { id: "1", data: "test1 data two", test2Id: "0" },
                        test2: { id: "0", data: "test2 data", test1Id: "1" },
                        package: {packageID: "d"}
                    }
                ],
                packages: [ {packageID: "d"} ],
                test1: [
                    { id: "0", data: "test1 data one", test2Id: "0" },
                    { id: "1", data: "test1 data two", test2Id: "0" }
                ],
                test2: [ { id: "0", data: "test2 data", test1Id: "1" } ]
            }
        }
    };


    beforeEach(module("vnd.api-resource"));

    beforeEach(inject(function (_nestedEntitiesTransformer_) {

        nestedEntitiesTransformer = _nestedEntitiesTransformer_;
    }));


    describe("nests correctly", function() {
        it("on chain with directly ordered dependencies", function() {
            expect(nestedEntitiesTransformer(chains.directDependenciesChain, objectToTransform)).toEqual(expected.expectedResult);
        });

        it("on chain with randomly placed dependencies", function() {
            expect(nestedEntitiesTransformer(chains.randomOrderDependeniesChain, objectToTransform)).toEqual(expected.expectedResult);
        });

        it("on chain with multiple sources per destination dependencies", function () {
            expect(nestedEntitiesTransformer(chains.multipleSourcesChain, objectToTransform)).toEqual(expected.multipleSourcesExpectedResult);
        });
    });

    describe("throws an exception if", function() {
        var chainsCopy;

        beforeEach(function() {
            chainsCopy = angular.copy(chains);
        });

        it("source path is not provided", function() {
            delete chainsCopy.directDependenciesChain[0].sourcePath;
            expect(function() {
                nestedEntitiesTransformer(chainsCopy.directDependenciesChain, objectToTransform);
            }).toThrow();
        });

        it("destination ID is not provided", function() {
            delete chainsCopy.directDependenciesChain[0].destinationId;
            expect(function() {
                nestedEntitiesTransformer(chainsCopy.directDependenciesChain, objectToTransform);
            }).toThrow();
        });

        it("destination key name is not a string", function() {
            chainsCopy.directDependenciesChain[0].destinationKeyName = 123;
            expect(function() {
                nestedEntitiesTransformer(chainsCopy.directDependenciesChain, objectToTransform);
            }).toThrow();
        });

        it("dependency chain is not an array", function() {
            expect(function() {
                nestedEntitiesTransformer({foo: "bar"}, objectToTransform);
            }).toThrow();
        });

        it("data source is not an object", function() {
            expect(function() {
                nestedEntitiesTransformer(chainsCopy.directDependenciesChain, []);
            }).toThrow();
        });
    });
});
