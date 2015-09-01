[![Build Status](https://travis-ci.org/the-software-factory/js-embedding-referenced-objects.svg?branch=master)](https://travis-ci.org/the-software-factory/js-embedding-referenced-objects)

# JS Embedding Referenced Objects
JS Embedding Referenced Objects is an AngularJS module providing a factory for embedding referenced objects
into referencing ones by adding JS object references. For instance, if you have a ticket object that
references performance object by mentioning its ID, you can use this factory to make accessible all
the properties of the correspondent performance object inside the ticket object.

## Installation
You'll need [bower](http://bower.io/) to install JS Embedding Referenced Objects module and its dependencies.
Install the module and save it as a dependency in your project:
```sh
$ bower --save install https://github.com/the-software-factory/js-embedding-referenced-objects.git
```

## Usage
The factory function needs as input a dependencies chain array and the object to manipulate.
The dependencies in the chain can be placed in any order; for instance, if you want to nest
F into D, G into D, D into C and C into B, all the following chains are valid and will produce the same result:

* Chain 1: F&rArr;D, G&rArr;D, D&rArr;C, C&rArr;B
* Chain 2: C&rArr;B, F&rArr;D, D&rArr;C, G&rArr;D
* Chain 3: C&rArr;B, D&rArr;C, G&rArr;D, F&rArr;D

The factory function doesn't alter the input object and performs all the work on its copy,
and then returns that modified copy.

The factory function is defined as follows:

```js
    nestedEntitiesTransformer(dependenciesChain, objectToTransform);
```

It accepts exactly 2 parameters:

### dependenciesChain
* Type: `Array`
* Description:
    The array of dependency objects that tells how the embedding must be performed for the
    specific object property. The dependency object must have the following structure:

```
    {
        sourcePath: "content.events",
        sourceID: "eventID",
        destinationPath: "content.performances.event",
        destinationID: "eventID",
        destinationKeyName: "event"
    }
```

where the object's properties are:

- **sourcePath**: {string} is the path inside the object where the entities which have to be inserted can be found.
    The elements of the path are separated using a dot.
- **sourceID**: {string} the property name of an entity referenced by the sourcePath. This ID must be unique.
- **destinationPath**: {string} is the path inside the object to the entities on which the nesitng must be performed.
    The elements of the path are separated using a dot.
- **destinationID**: {string} destination path's entity property name that holds the ID of the
    source object that we want to insert in the destination object. See the example below for more explanation.
- **destinationKeyName**: {string} the name of the new property which will be created in every
    destination object. It's a JS object reference to the source object


### objectToTransform
* Type: `Object`
* Description: The input object to transofrm

## Example

If you want to transform the following object:
```
    {
        content: {
        	tickets: [
        		{ owner: "Bob", perfId: "0" },
        		{ owner: "Sam", perfIf: "1" },
         		{ ownser: "Sally", perfId: "0" }
         	],
         	performances: [
         		{ id: "0", info: "Performance One" },
         		{ id: "1", info: "Performance Two" }
         	]
        }
    }
```

into this:

```
    {
    	content: {
    		tickets: [
    			{ owner: "Bob", perfId: "0", performance: { id: "0", info: "Performance One" }  },
    	 		{ owner: "Sam", perfIf: "1", performance: { id: "1", info: "Performance Two" } },
    		    { ownser: "Sally", perfId: "0", performance: { id: "0", info: "Performance One" } }
    		],
    		performances: [
    			{ id: "0", info: "Performance One" },
    			{ id: "1", info: "Performance Two" }
    		]
        }
    }
```

you'll need to create a dependencies chain, that basically is a configuration object
that tell how the embedding must be performed, like this:

```
    [
    	{
        	sourcePath: "content.performances",
        	sourceID: "id",
        	destinationPath: "content.tickets",
        	destinationID: "perfId",
        	destinationKeyName: "performance"
        }
    ]
```

## Development
The project has the following structure:
```
dist/
	*.min.js // The minified and uglified version of the source files
src/
    *.js // The source file
tests/
    ... // Contains all tests and all needed file to set up a tests environment.
    *-test.js // All tests need to have the "-test" suffix before the extension.
...
```

### Installation
This project requires [node](https://nodejs.org/) for the development installation so you can
install its development dependencies and test it.

Please run following commands to install all dependencies:
```sh
$ npm install
$ cd test && npm install
```

### Grunt Tasks
Here is a list of grunt `tasks` => `actions` mappings, see below for a deeper explanation of the actions.

|   *Grunt task*    | *jshint* | *uglify* | *usebanner* | *devserver* | *watch* | *emptyTheChangelog* |*conventionalChangelog* | *changelogCommit* |
|-------------------|:--------:|:--------:|:-----------:|:-----------:|:-------:|:-------------------:|:----------------------:|:-----------------:|
|      grunt        |    *     |    *     |      *      |             |         |                    |                         |                   |
| grunt development |          |          |             |      *      |    *    |                    |                         |                   |
| grunt changelog   |          |          |             |             |         |         *          |          *              |         *         |

* *jshint*: Validate files with JSHint.
* *uglify*: Create the final \*.min.js.
* *usebanner*: Prepends a banner to the minified file
* *devserver*: Spawns a web server so you can rapidly test your app in action
* *watch*: Run default task when src or test files are added, modified or deleted.
* *emptyTheChangelog*: Truncates the CHANGELOG.md file as conventionalChangelog task will append fully regenerated changelog
* *conventionalChangelog*: Appends Markdown-formatted changelog history to CHANGELOG.md
* *changelogCommit*: Prepares a new commit with updated CHANGELOG.md and commit message "CHANGELOG.md Updated"

## Tests
Take a look at [`test/README.md`](test/README.md) for more details.

## Contributing
Take a look at [`CONTRIBUTING.md`](CONTRIBUTING.md) for more details.
