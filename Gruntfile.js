var exec = require('child_process').exec;
var execSync = require('child_process').execSync;
var fs = require('fs');

module.exports = function(grunt) {

    grunt.initConfig({
        jshint: {
            all: ['Gruntfile.js', 'src/**/*.js', 'test/src/**/*.js']
        },
        uglify: {
            dist: {
                files: {
                    'dist/nestedEntitiesTransformer.min.js': 'src/nestedEntitiesTransformer.js'
                }
            }
        },
        usebanner: {
            banner: {
                options: {
                    position: 'top',
                    linebreak: true,
                    process: function() {
                        var latestTag = execSync("git describe --tags").toString().split('-')[0];
                        var firstYear = "2015";
                        var lastYear = execSync("git log --format='%ai' | head -n 1").toString().split('-')[0];

                        return "/*\n" +
                            " * JS Embedding Referenced Objects v" + latestTag + " (https://github.com/the-software-factory/js-embedding-referenced-objects)\n" +
                            " * Copyright (c) " + ((firstYear === lastYear) ? firstYear : (firstYear + "-" + lastYear)) + " Vendini srl <vendini@pec.it>\n" +
                            " * Licensed under MIT (https://github.com/the-software-factory/js-embedding-referenced-objects/blob/master/LICENSE.md)\n" +
                            " */";
                    }
                },
                files: {
                    src: ['dist/nestedEntitiesTransformer.min.js']
                }
            }
        },
        devserver: {
            options: {
                type: 'http',
                port: '8888',
                base: './',
                async: false
            },
            server: {}
        },
        watch: {
            scripts: {
                files: ['Gruntfile.js', 'src/**/*.js', 'test/**/*.js'],
                tasks: ['default']
            }
        },
        conventionalChangelog: {
            options: {
                changelogOpts: {
                    preset: 'jshint',
                    transform: function(commit, cb) {
                        // Link commit hash to commit page on GitHub
                        commit.shortDesc += " [" + commit.hash.slice(0, 7) +
                        "](https://github.com/the-software-factory/js-object-keys-mapper/commit/" + commit.hash + ")";
                        // Remove the short hash (as we added one in the link)
                        delete commit.hash;

                        cb(null, commit);
                    }
                }
            },
            release: {
                src: 'CHANGELOG.md'
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-devserver');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-banner');
    grunt.loadNpmTasks('grunt-conventional-changelog');

    grunt.registerTask("emptyTheChangelog", function() {
        fs.truncateSync(grunt.config.get("conventionalChangelog.release.src"), 0);
    });

    grunt.registerTask("changelogCommit", function() {
        var done = this.async();

        var gitAdder = exec('git add CHANGELOG.md');

        gitAdder.on("exit", function(exitCode) {
            if (exitCode !== 0) {
                grunt.fail.fatal("changelogCommit task couldn't exec git add command");
            }

            var gitCommitter = exec('git commit -m "CHANGELOG.md Updated"');

            gitCommitter.on("exit", function(exitCode) {
                if (exitCode !== 0) {
                    grunt.fail.fatal("changelogCommit task couldn't exec git commit command");
                }

                grunt.log.ok("Changelog commit is ready");
                done();
            });
        });
    });

    grunt.registerTask("default", ["jshint", "uglify", "usebanner"]);
    grunt.registerTask("development", ["devserver", "watch"]);
    grunt.registerTask("changelog", ["emptyTheChangelog", "conventionalChangelog", "changelogCommit"]);
};
