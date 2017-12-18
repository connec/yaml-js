(function() {
  var composer, constructor, parser, reader, resolver, scanner, util;

  util = require('./util');

  reader = require('./reader');

  scanner = require('./scanner');

  parser = require('./parser');

  composer = require('./composer');

  resolver = require('./resolver');

  constructor = require('./constructor');

  this.make_loader = function(Reader = reader.Reader, Scanner = scanner.Scanner, Parser = parser.Parser, Composer = composer.Composer, Resolver = resolver.Resolver, Constructor = constructor.Constructor) {
    var Loader, components;
    components = [Reader, Scanner, Parser, Composer, Resolver, Constructor];
    return Loader = (function() {
      var component;

      class Loader {
        constructor(stream) {
          var i, len, ref;
          components[0].prototype.initialise.call(this, stream);
          ref = components.slice(1);
          for (i = 0, len = ref.length; i < len; i++) {
            component = ref[i];
            component.prototype.initialise.call(this);
          }
        }

      };

      util.extend(Loader.prototype, ...((function() {
        var i, len, results;
        results = [];
        for (i = 0, len = components.length; i < len; i++) {
          component = components[i];
          results.push(component.prototype);
        }
        return results;
      })()));

      return Loader;

    }).call(this);
  };

  this.Loader = this.make_loader();

}).call(this);
