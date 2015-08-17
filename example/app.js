angular.module("vnd.api-resource", []);

angular.module("vnd.api-resource")
.controller("exampleCtrl", function($scope, nestedEntitiesTransformer) {

    // Test data object on which the referenced properties injection will be performed
    var object = {
        tickets: [
            { id: "0", owner: "Bob Clinton", perfId: "0" },
            { id: "1", owner: "Bob Campbell", perfId: "1" },
            { id: "2", owner: "Larry Smith", perfId: "1" },
            { id: "3", owner: "Scott Gray", perfId: "2" }
        ],
        performances: [
            { id: "0", name: "Performance One", evtId: "0" },
            { id: "1", name: "Performance Two", evtId: "0" },
            { id: "2", name: "Performance Three", evtId: "1" }
        ],
        events: [
            { id: "0", name: "Event One", countryId: "0", test1Id: "0", test2Id: "0" },
            { id: "1", name: "Event Two", countryId: "1", test1Id: "0", test2Id: "1" }
        ],
        countries: [
            { id: "0", name: "USA" },
            { id: "1", name: "Australia" }
        ],
        test1: [
            { id: "0", data: "test one data :@"}
        ],
        test2: [
            { id: "0", data: "test two data" },
            { id: "1", data: "test two data again" }
        ]
    };

    // Test dependencies chain
    var dependenciesChain = [
        {
            sourcePath: "test2",
            sourceId: "id",
            destinationPath: "events",
            destinationId: "test2Id",
            destinationKeyName: "test2"
        },
        {
            sourcePath: "test1",
            sourceId: "id",
            destinationPath: "events",
            destinationId: "test1Id",
            destinationKeyName: "test1"
        },
        {
            sourcePath: "countries",
            sourceId: "id",
            destinationPath: "events",
            destinationId: "countryId",
            destinationKeyName: "country"
        },
        {
            sourcePath: "events",
            sourceId: "id",
            destinationPath: "performances",
            destinationId: "evtId",
            destinationKeyName: "event"
        },
        {
            sourcePath: "performances",
            sourceId: "id",
            destinationPath: "tickets",
            destinationId: "perfId",
            destinationKeyName: "performance"
        }
    ];

/*
// Dependencies chain with dependencies in random order
var dependenciesChain = [
    {
        sourcePath: "events",
        sourceId: "id",
        destinationPath: "performances",
        destinationId: "evtId",
        destinationKeyName: "event"
    },
    {
        sourcePath: "test2",
        sourceId: "id",
        destinationPath: "events",
        destinationId: "test2Id",
        destinationKeyName: "test2"
    },
    {
        sourcePath: "countries",
        sourceId: "id",
        destinationPath: "events",
        destinationId: "countryId",
        destinationKeyName: "country"
    },
    {
        sourcePath: "performances",
        sourceId: "id",
        destinationPath: "tickets",
        destinationId: "perfId",
        destinationKeyName: "performance"
    },
    {
        sourcePath: "test1",
        sourceId: "id",
        destinationPath: "events",
        destinationId: "test1Id",
        destinationKeyName: "test1"
    },
];
*/

    $scope.initialObject = JSON.stringify(object, null, 4);
    $scope.dependencyChain = JSON.stringify(dependenciesChain, null, 4);
    $scope.finalObject = JSON.stringify(nestedEntitiesTransformer(dependenciesChain, object), null, 4);
});
