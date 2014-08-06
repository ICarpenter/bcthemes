module.exports = function (grunt) {
    var path = require('path'), fs = require('fs');
    var __slice = Array.prototype.slice;

    var modules = [];

    function internal() {
        return function () {
            return path.join.apply(null, ['../angular'].concat(__slice.call(arguments)));
        };
    }
    function external() {
        return function () {
            return path.join.apply(null, ['../../public/js/_compiled/'].concat(__slice.call(arguments)));
        };
    }
    function vendor() {
        return path.join.apply(null, ['../../public/js/vendor/'].concat(__slice.call(arguments)));
    }
    function bower() {
        return path.join.apply(null, ['../bower_components/'].concat(__slice.call(arguments)));
    }

    function not(path) { return '!' + path; }
    function rel(site) { return function (p) { return path.relative(dirs.private[site](), p); }; }

    var dirs = {
        private: {
            'themes': internal()
        },
        public: {
            'themes': external()
        }
    };

    var config = {
        vendor: vendor,
        bower: bower,
        jshint: {
            options: { jshintrc: '../js/.jshintrc' },
            gruntfile: {
                src: 'gruntfile.js'
            }
        },
        less: {
            development: {
                options: {
                    compress: true,
                    yuicompress: true,
                    optimization: 2
                },
                files: {
                    // target.css file: source.less file
                    "../../public/css/main.css": "../less/bc_bootstrap.less",
                }
            }
        },
        concat: { options: { separator: ';' } },
        template: {},
        copy: {
            target: {
                files: {
                    "<%= vendor('jquery.js') %>"                   : "<%= bower('jquery/jquery.js') %>",
                    "<%= vendor('angular.js') %>"                  : "<%= bower('angular/angular.js') %>",
                    "<%= vendor('ui-bootstrap-tpls.js') %>"        : "<%= bower('angular-bootstrap/ui-bootstrap-tpls.js') %>",
                }
            }
        },
        watch: {
            files: ['../js/angular/**/*.js', '../less/**/*.less'],
            tasks: ['jshint', 'less', 'concat', 'template'],
            options: {
                nospawn: true
            }
        },
    };

    Object.keys(dirs.private).forEach(function (dir) {
        var path = dirs.private[dir]();
        if(fs.existsSync(path)) {
            fs.readdirSync(path).forEach(function (mod) {
                if(!fs.lstatSync(dirs.private[dir](mod)).isSymbolicLink()) {
                    modules.push({ site: dir, name: mod });
                }
            });
        }
    });

    function buildModule(mod) {
        var dest = dirs.public[mod.site](mod.name + '.js'),
            template = dirs.public[mod.site](mod.name + '.templates.js'),
            modName = mod.site + '-' + mod.name,
            files = ['module.js', '**/*.js']
                        .map(function (path) { return dirs.private[mod.site](mod.name, path); });

        grunt.verbose.writeln('Building module config for ' + mod.name.cyan + ' from ' + mod.site.red);

        this.jshint[modName] = { src: dirs.private[mod.site](mod.name, '**/*.js') };

        this.concat[modName] = {
            src: files.concat(not(dirs.private[mod.site](mod.name, 'tests/**/*.js'))),
            dest: dest
        };

        this.template[modName] = {
            options: { module: mod.name.charAt(0).toUpperCase() + mod.name.slice(1), stripPath: rel(mod.site) },
            src: dirs.private[mod.site](mod.name, 'partials', '**/*.html'),
            dest: template
        };

        this.watch[modName] = {
            files: [dirs.private[mod.site](mod.name, '**/*.js')].concat(not(dirs.private[mod.site](mod.name, 'tests', '**/*.js'))),
            tasks: [modName]
        };
        this.watch[modName + '-templates'] = {
            files: dirs.private[mod.site](mod.name, 'partials', '**/*.html'),
            tasks: [modName + ':templates']
        };

        grunt.registerTask(modName, ['jshint:' + modName, 'concat:' + modName, 'template:' + modName]);
    }

    modules.forEach(buildModule, config);

    fs.readdirSync('node_modules').forEach(function (dir) { if(/grunt-/.test(dir) && dir !== 'grunt-lib-contrib') { grunt.loadNpmTasks(dir); } });
    grunt.loadTasks('tasks');

    grunt.initConfig(config);
    grunt.registerTask('build', ['less', 'copy'].concat(modules.map(function (mod) { return mod.site + '-' + mod.name; })));

    grunt.registerTask('default', ['build', 'watch']);

};
