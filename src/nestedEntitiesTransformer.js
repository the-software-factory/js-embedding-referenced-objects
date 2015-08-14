angular.module('vnd.api-resource')

.factory("nestedEntitiesTransformer", function() {
    return function(dependenciesChain, object) {
        if(!Array.isArray(dependenciesChain))
            throw new Error("The dependenciesChain must be an array");
        if(typeof object !== "object" || Array.isArray(object))
            throw new Error("The data source must be an object");

        var objectCopy = angular.copy(object);

        function accessProperty(obj, prop, value) {
            if (typeof prop == 'string')
                return accessProperty(obj, prop.split('.'), value);
            else if (prop.length==1 && value!==undefined)
                return obj[prop[0]] = value;
            else if (prop.length==0)
                return obj;
            else
                return accessProperty(obj[prop[0]], prop.slice(1), value);
        }

        dependenciesChain.forEach(function(dependency) {
            if (typeof dependency.destinationPath !== "string")
                throw new Error("The destinationPath option must be a string");
            if (typeof dependency.sourcePath !== "string")
                throw new Error("The sourcePath option must be a strng");
            if (typeof dependency.destinationId === "undefined")
                throw new Error("The destinationId option must be defined");
            if (typeof dependency.sourceId === "undefined")
                throw new Error("The sourceId option must be defined");
            if (typeof dependency.destinationKeyName !== "string")
                throw new Error("The destinationKeyName must be a string");

            accessProperty(objectCopy, dependency.destinationPath)
                .forEach(function(destination) {
                    var source = accessProperty(objectCopy, dependency.sourcePath)
                        .filter(function(source) {
                            return destination[dependency.destinationId] ===
                                source[dependency.sourceId];
                        })[0];

                    accessProperty(destination, dependency.destinationKeyName, source);
                });
        });

        return objectCopy;
    }
});
