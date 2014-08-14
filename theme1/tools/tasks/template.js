module.exports = function (grunt) {
    grunt.registerMultiTask('template', 'Generate template cache for a given module and file list', function () {
        this.files.forEach(function process(file) {
            var cache = {};
            var _ = require('lodash');
            var stripPath = this.options({ stripPath: function (x) { return x; } }).stripPath;

            file.src.filter(function(filepath) {
                if (!grunt.file.exists(filepath)) {
                    grunt.log.warn('Source file "' + filepath + '" not found.');
                    return false;
                } else {
                    return true;
                }
            }).map(function(filepath) {
                cache[stripPath(filepath)] = grunt.file.read(filepath);
            });

            if(Object.keys(cache).length > 0) {
                var data = {
                    angularModule: this.options({ module: this.target }).module,
                    templates: cache,
                    quote: function (str) {
                        return '"' + str.replace(/"/g, '\\"').replace(/\r/g, "\\r").replace(/\n/g, "\\n") + '"';
                    }
                };
                var result = _.template(templateFile, data, { sourceURL: file.dest, imports: { '_': _ } });
                grunt.file.write(file.dest, result);
                grunt.log.writeln('File ' + file.dest.cyan + ' created.');
            } else {
                grunt.verbose.writeln('Not writing ' + file.dest.cyan + ' because there are no partials for it.');
            }
        }.bind(this));
    });

    var templateFile = "angular.module(<%= quote(angularModule + '.templates') %>, []).run(function ($templateCache) {\r\n" +
                            "<% _.forEach(templates, function (contents, file) { %>" +
                                "\t$templateCache.put(<%= quote(file) %>, <%= quote(contents) %>);\r\n" +
                            "<% }); %>" +
                        "});";

};
