angular.module('vnd.api-resource')
/**
 * @ngdoc object
 * @module vnd.api-resource
 * @name vnd.api-resource.nestedEntitiesTransformer
 * @description
 * A factory used to build a service which transforms a json object inserting objects inside others that reference them
 * using a declarative approach.
 *
 * <img src="img/autobot.png" width="256" alt="Autobot logo"/>
 */
  .factory('nestedEntitiesTransformer', function() {
    /**
     * @ngdoc function
     * @module vnd.api-resource
     * @name vnd.api-resource.nestedEntitiesTransformer#nestedEntitiesTransformer
     * @methodOf vnd.api-resource.nestedEntitiesTransformer
     * @description
     *
     * A factory used to build a service which transforms a json object inserting objects inside others that
     * reference them using a declarative approach. The function needs as input an array of dependency chains and the
     * object to manipulate. Every chain has to be ordered starting from the object which not depends from any other
     * and continuing with the object that depends from the previous and so on. A single chain has not interruptions.
     * For example if we have to insert the entities C into B and B into A this is the order with which their descriptors
     * should be inserted into the chain. Conversely if the entity B should be inserted into C, and D into C and E
     * into A we need to divide the related descriptors into three chains: [B,C], [D,C], [E,A].
     *
     * @param {Matrix} dependenciesChains An array of dependency chains. Every chain is an ordered array of dependency which are represented
     * by an object of this type:
     * ```js
     * {
     *  sourcePath: "content.events",
     *  sourceID: "eventID",
     *  destinationPath: "content.performances.event",
     *  destinationID: "eventID",
     *  destinationKeyName: "event"
     * }```
     * Where:
     * - **sourcePath**: {string} is the path inside the object where can be found the entities which have to be inserted.
     *     The elements of the path are separated using a dot.
     * - **sourceID**: {string} the property name of an entity inside the sourcePath array. The value of this property has to be univocal.
     * - **destinationPath**: {string} is the path inside the object where the entities, which have to be nested, can
     *     be found. The elements of the path are separated using a dot.
     * - **destinationID**: {string} this value represents the name of the property that holds the ID of the
     *     source object that we want to insert in the destination object. See the example below for more explanation.
     * - **destinationKeyName**: {string} the name of the new property which will be created in every
     *     destination object that holds the source element.
     *
     * In the following example **`entities1`** is the destination object and **`entities2`** is the source object.
     * The **`entities1`** object has a reference to the **`entities2`** object (entity2ID). We want to create a new
     * object with all the properties of **`entities1`** object and the **`entities2`** instead of its reference.
     * This means that the **`entities2`** object will be inserted in the `entity2` property of the **`entities1`** object.
     *
     *```js
     * JSON file to transform
     * {
     *  content: {
     *    entities1: [
     *      {id: "1", entity2ID: "a"},
     *      {id: "2", entity2ID: "b"}
     *    ],
     *    entities2: [
     *      {id: "a", name: "window"},
     *      {id: "b", name: "garden"}
     *    ]
     * }```
     *Then you need to provide this matrix to the function:
     * ```js
     *[
     *  [
     *    {
     *      sourcePath: "content.entities2",
     *      sourceID: "id",
     *      destinationPath: "content.entities1",
     *      destinationID: "entity2ID",
     *      destinationKeyName: "entity2"
     *    }
     *  ]
     * ]
     *```
     * As result of the function we obtain this object:
     *```js
     * JSON file transformed
     * {
     *  content: {
     *    entities1: [
     *      {id: "1", entity2ID: "a", entity2: {id: "a", name: "window"}},
     *      {id: "2", entity2ID: "b", entity2: {id: "b", name: "garden"}}
     *    ],
     *    entities2: [
     *      {id: "a", name: "window"},
     *      {id: "b", name: "garden"}
     *    ]
     * }```
     * @param {Object} response The object to transform.
     *
     * @return {Object} the newly created object.
     */
    return function(dependenciesChains, response) {

      /**
       * A convenience function for accessing an object property using a string path.
       * @param {Object} obj The object of which you want know the value of the properties described by the path.
       * @param {string} path The path used to access a property of an object.
       * @param {string=} separator A character used to separate the various elements of a path.
       * @returns {* | undefined} Returns the value of the object's property identified by the path or 'undefined'
       * if the property does not exist or a not valid parameter is provided to the function.
       */
      function getProperty(obj, path, separator) {
        if((!obj || (typeof obj !== 'object')) || (!path || (typeof path !== 'string'))) {
          return undefined;
        }
        separator = separator || '.';
        var splittedPath = path.split(separator);
        if(splittedPath.length > 0) {
          var i = 0, current = null;
          do {
            current = splittedPath[i];
            i++;
          } while ((obj = obj[current]) && i < splittedPath.length);
          return obj;
        }
        return undefined;
      }

      // Verify that the parameters are provided and are of the expected types.
      if(dependenciesChains === undefined || !Array.isArray(dependenciesChains)) {
        throw "The first parameter is missing or it is not an array";
      }
      if(response === undefined || (typeof response !== 'object')) {
        throw "The second parameter is missing or it is not an object";
      }
      var responseCopy = angular.copy(response);
      // For each chain in the matrix we try to resolve the related dependency.
      angular.forEach(dependenciesChains, function(dependencyChain, key) {
        if(!Array.isArray(dependencyChain)) {
          throw "The dependency chain (" + key + ") is not an array";
        }
        // These objects are used to associate an ID with its entity, in this way we can retrieve an entity using its ID
        var currentIdToEntityDictionary = {}, previousIdToEntityDictionary = {};

        var currentDescriptor, previousDescriptor = null;
        for(var i = 0; i < dependencyChain.length; i++) {
          currentDescriptor = dependencyChain[i];
          if(i !== 0) {
            previousIdToEntityDictionary = currentIdToEntityDictionary;
            currentIdToEntityDictionary = {};
            previousDescriptor = dependencyChain[i - 1];
            // Verify the correctness of the chain.
            if(currentDescriptor.sourcePath !== previousDescriptor.destinationPath) {
              throw "The dependency chain is not valid.";
            }
          }

          // Assume that the resource identified by the sourceEntityPath string is an array
          var entities = getProperty(responseCopy, currentDescriptor.sourcePath);
          if(entities === undefined) {
            throw "The source path " + currentDescriptor.sourcePath + " does not exist.";
          }
          // For every entity in the array we create a property on the object currentIdToEntityDictionary with name equal to sourceID value
          // and as value the entity itself. In this way it can be retrieved later using its id.
          var entity, entityID, destinationID, destinationIDValue;
          for(var j = 0; j < entities.length; j++) {
            entity = angular.copy(entities[j]);
            entityID = entity[currentDescriptor.sourceID];
            currentIdToEntityDictionary[entityID] = entity;
            // If the previous object descriptor is not null we insert the objects retrieved at the previous iteration into
            // the ones found at the current one.
            if(previousDescriptor) {
              destinationID = previousDescriptor.destinationID ? previousDescriptor.destinationID : previousDescriptor.sourceID;
              destinationIDValue = currentIdToEntityDictionary[entityID][destinationID];
              entity[previousDescriptor.destinationKeyName] = previousIdToEntityDictionary[destinationIDValue];
            }
          }
        }
        if(currentDescriptor) {
          // When arrived at the last iteration we insert the entities into object that should be transformed.
          var finalEntities = getProperty(responseCopy, currentDescriptor.destinationPath);
          if (finalEntities === undefined) {
            throw "The destination path " + currentDescriptor.destinationPath + " does not exist.";
          }
          var finalEntity, finalDestinationID, finalReferenceID;
          for (var k = 0; k < finalEntities.length; k++) {
            finalEntity = finalEntities[k];
            finalDestinationID = currentDescriptor.destinationID ? currentDescriptor.destinationID : currentDescriptor.sourceID;
            finalReferenceID = finalEntity[finalDestinationID];
            finalEntity[currentDescriptor.destinationKeyName] = currentIdToEntityDictionary[finalReferenceID];
          }
        }
      }, responseCopy);

      return responseCopy;
    };
  }
);
