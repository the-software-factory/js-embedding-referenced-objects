angular.module('vnd.api-resource')
/**
 * @ngdoc object
 * @module vnd.api-resource
 * @description A factory used to build a service which transforms a json object inserting objects'
 * references inside referencing objects using a declarative approach.
 */
.factory("nestedEntitiesTransformer", function() {
    /**
     * @ngdoc funciton
     * @name vnd.api-resource.nestedEntitiesTransformer#nestedEntitiesTransformer
     * @methodOf vnd.api-resource.nestedEntitiesTransformer
     * @description
     *
     * A factory used to build a service which transforms a json object inserting objects'
     * references inside referencing objects using a declarative approach. The function needs as input a
     * dependencies chain array and the object to manipulate. The dependencies in the chain can be placed
     * in any order; for instance, if you want to nest F into D, G into D, D into C and C into B,
     * all the following chains are valid and will produce the same result:
     * F->D, G->D, D->C, C->B
     * C->B, F->D, D->C, G->D
     * C->B, D->C, G->D, F->D
     * This function doesn't alter the input object and performs all the work on its copy
     *
     * @param  {Object[]} dependenciesChain An array of objects telling how to perform the nesting
     * The objects must be defined as follows:
     * ```js
     * {
     *  sourcePath: "content.events",
     *  sourceID: "eventID",
     *  destinationPath: "content.performances.event",
     *  destinationID: "eventID",
     *  destinationKeyName: "event"
     * }```
     * where:
     * - **sourcePath**: {string} is the path inside the object where the entities which have to be inserted can be found.
     * The elements of the path are separated using a dot.
     * - **sourceID**: {string} the property name of an entity referenced by the sourcePath. This ID must be unique.
     * - **destinationPath**: {string} is the path inside the object to the entities on which the nesitng must be performed.
     * The elements of the path are separated using a dot.
     * - **destinationID**: {string} destination path's entity property name that holds the ID of the
     *     source object that we want to insert in the destination object. See the example below for more explanation.
     * - **destinationKeyName**: {string} the name of the new property which will be created in every
     *     destination object. It's a JS object reference to the source object
     *
     * Example:
     * If you want to transform the following object
     * {
     * 	content: {
     * 		tickets: [
     * 			 { owner: "Bob", perfId: "0" },
     * 			 { owner: "Sam", perfIf: "1" },
     * 			 { ownser: "Sally", perfId: "0" }
     * 		],
     * 		performances: [
     * 			{ id: "0", info: "Performance One" },
     * 			{ id: "1", info: "Performance Two" }
     * 		]
     * 	}
     * }
     *
     *into this:
     *
     * {
     * 	content: {
     * 		tickets: [
     * 			{ owner: "Bob", perfId: "0", performance: { id: "0", info: "Performance One" }  },
     * 	 		{ owner: "Sam", perfIf: "1", performance: { id: "1", info: "Performance Two" } },
     * 		    { ownser: "Sally", perfId: "0", performance: { id: "0", info: "Performance One" } }
     * 		],
     * 		performances: [
     * 			{ id: "0", info: "Performance One" },
     * 			{ id: "1", info: "Performance Two" }
     * 		]
     * 	}
     * }
     *
     * your dependencies chain will be as simple as follows:
     *
     * [
     * 	{
     *  	sourcePath: "content.performances",
     *   	sourceID: "id",
     *   	destinationPath: "content.tickets",
     *   	destinationID: "perfId",
     *   	destinationKeyName: "performance"
     * 	}
     * ]
     *
     * @param  {Object} object The input object to transofrm
     * @return {Object}        The input object transformed accoring to the supplied dependencies chain
     */
    return function(dependenciesChain, object) {
        if (!Array.isArray(dependenciesChain)) {
            throw new Error("The dependenciesChain must be an array");
        }
        if (typeof object !== "object" || Array.isArray(object)) {
            throw new Error("The data source must be an object");
        }

        var objectCopy = angular.copy(object);

        /**
         * Gets or sets object's property with on the specified path
         * If value is not defined than it behaves like a getter
         * If value is defined than it sets the required value
         *
         * @param  {Object}   obj   Object on which get or set action must be performed
         * @param  {string[]} prop  Array obtained by splitting the property's path string
         * @param  {Object}   value Value that will be assigned to the object's property (if defined)
         * @return {Object}   Final value of accessed object's property
         */
        function accessProperty(obj, prop, value) {
            if (!Array.isArray(prop)) {
                throw new Error("prop must be an array obtained by splitting the path sting");
            }

            if (prop.length === 1 && value !== undefined) {
                obj[prop[0]] = value;
                return obj[prop[0]];
            }
            else if (prop.length === 0) {
                return obj;
            }
            else {
                return accessProperty(obj[prop[0]], prop.slice(1), value);
            }
        }

        /**
         * Finds the source object to nest into the destination object and performs the nesting
         *
         * @param  {Object} destination Nesting destination object
         */
        function nest(destination) {
            var dependency = this;

            var source = accessProperty(objectCopy, dependency.sourcePath.split('.'))
                .filter(function(source) {
                    return destination[dependency.destinationId] ===
                        source[dependency.sourceId];
                })[0];

            if (typeof source !== "object") {
                throw new Error("No object to nest was found for dependency " +
                    dependency.sourcePath + ":" + dependency.sourceId + " => " +
                    dependency.destinationPath + ":" + dependency.destinationId
                );
            }

            accessProperty(destination, dependency.destinationKeyName.split('.'), source);
        }

        /**
         * Checks dependency's data types and calls the nesting function
         *
         * @param  {Object} dependency Object holding the dependency nesting configuration
         */
        function forEachDependency(dependency) {
            if (typeof dependency.destinationPath !== "string") {
                throw new Error("The destinationPath option must be a string");
            }
            if (typeof dependency.sourcePath !== "string") {
                throw new Error("The sourcePath option must be a strng");
            }
            if (typeof dependency.destinationId !== "string") {
                throw new Error("The destinationId option must be a string");
            }
            if (typeof dependency.sourceId !== "string") {
                throw new Error("The sourceId option must be a string");
            }
            if (typeof dependency.destinationKeyName !== "string") {
                throw new Error("The destinationKeyName must be a string");
            }

            // dependency is passed as this to forEach's callback
            accessProperty(objectCopy, dependency.destinationPath.split('.')).forEach(nest, dependency);
        }

        // Performs nesting for each dependency supplied
        dependenciesChain.forEach(forEachDependency);

        return objectCopy;
    };
});
