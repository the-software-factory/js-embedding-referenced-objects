describe("Test nested transformer", function() {

  var nestedEntitiesTransformer;

  beforeEach(module('vnd.api-resource'));

  beforeEach(inject(function (_nestedEntitiesTransformer_) {

    nestedEntitiesTransformer = _nestedEntitiesTransformer_;
  }));

  describe('nests correctly', function() {
    var response = {
      content: {
        performances: [{performanceID: 1, eventID: "a"}, {perforamnceID: 2, eventID: "a"}],
        events: [{eventID: "a", venueID: "b"}],
        venues: [{venueID: "b"}],
        tickets:  [ {ticketID: 1, packageID: "d"} ],
        packages: [ {packageID: "d"} ]
      }
    };

    var dependencies =
      [
        [
          {
            sourcePath: "content.venues",
            sourceID: "venueID",
            destinationPath: "content.events",
            destinationID: "venueID",
            destinationKeyName: "venue"
          },
          {
            sourcePath: "content.events",
            sourceID: "eventID",
            destinationPath: "content.performances",
            destinationID: "eventID",
            destinationKeyName: "event"
          }
        ],
        [
          {
            sourcePath: "content.packages",
            sourceID: "packageID",
            destinationPath: "content.tickets",
            destinationID: "packageID",
            destinationKeyName: "package"
          }
        ]
      ];

    var expectedResponse = {
      content: {
        performances: [{performanceID: 1, eventID: "a", event: {eventID: "a", venueID: "b", venue: {venueID: "b"}}}, {perforamnceID: 2, eventID: "a", event: {eventID: "a", venueID: "b", venue: {venueID: "b"}}}],
        events: [{eventID: "a", venueID: "b"}],
        venues: [{venueID: "b"}],
        tickets:  [ {ticketID: 1, packageID: "d", package: {packageID: "d"}} ],
        packages: [ {packageID: "d"} ]
      }
    };

    it("the requested entities.", function() {
      console.log(nestedEntitiesTransformer);
      expect(nestedEntitiesTransformer(dependencies, response)).toEqual(expectedResponse);
    });

    it("the requested entities if the destinationID is non provided in the dependency description objects.", function() {
      var copiedDependencies = angular.copy(dependencies);
      delete copiedDependencies[0][0].destinationID;
      delete copiedDependencies[0][1].destinationID;
      expect(nestedEntitiesTransformer(copiedDependencies, response)).toEqual(expectedResponse);
    });
  });

  describe('throw an exception if', function() {
    var dependencies =
      [
        [
          {
            sourcePath: "content.venues",
            sourceID: "venueID",
            destinationPath: "content.events",
            destinationID: "venueID",
            destinationKeyName: "venue"
          },
          {
            sourcePath: "content.events",
            sourceID: "eventID",
            destinationPath: "content.performances",
            destinationID: "eventID",
            destinationKeyName: "event"
          }
        ]
      ];

    var response = {
      content: {
        performances: [{performanceID: 1, eventID: "a"}, {perforamnceID: 2, eventID: "a"}],
        events: [{eventID: "a", venueID: "b"}],
        venues: [{venueID: "b"}]
      }
    };

    it('source path is not provided.', function() {
      var copiedDependencies = angular.copy(dependencies);
      copiedDependencies[0][0].sourcePath = "content.venuis";
      expect(function() { nestedEntitiesTransformer(copiedDependencies, response); }).toThrow("The source path content.venuis does not exist.");
    });

    it('destination path is not provided.', function() {
      var copiedDependencies = angular.copy(dependencies);
      copiedDependencies[0][1].destinationPath = "content.performancess";
      expect(function() { nestedEntitiesTransformer(copiedDependencies, response); }).toThrow("The destination path content.performancess does not exist.");
    });

    it('dependency chain is not valid.', function() {
      var copiedDependencies = angular.copy(dependencies);
      copiedDependencies[0][1].sourcePath = "content.performancess";
      expect(function() { nestedEntitiesTransformer(copiedDependencies, response); }).toThrow("The dependency chain is not valid.");
    });

    it('the first parameter is missing.', function() {
      expect(function() { nestedEntitiesTransformer(); }).toThrow("The first parameter is missing or it is not an array");
    });

    it('the first parameter is not an array.', function() {
      expect(function() { nestedEntitiesTransformer('dependencies', response); }).toThrow("The first parameter is missing or it is not an array");
    });

    it('the second parameter is missing.', function() {
      expect(function() { nestedEntitiesTransformer(dependencies); }).toThrow("The second parameter is missing or it is not an object");
    });

    it('the second parameter is not an object.', function() {
      expect(function() { nestedEntitiesTransformer(dependencies, "response"); }).toThrow("The second parameter is missing or it is not an object");
    });

    it('a dependency chain is not an array.', function() {
      var copiedDependencies = angular.copy(dependencies);
      copiedDependencies[1] = "second.chain";
      expect(function() { nestedEntitiesTransformer(copiedDependencies, response); }).toThrow("The dependency chain (1) is not an array");
    });
  });
});
