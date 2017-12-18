(function() {
  var emitter, representer, resolver, serializer, util;

  util = require('./util');

  emitter = require('./emitter');

  serializer = require('./serializer');

  representer = require('./representer');

  resolver = require('./resolver');

  this.make_dumper = function(Emitter = emitter.Emitter, Serializer = serializer.Serializer, Representer = representer.Representer, Resolver = resolver.Resolver) {
    var Dumper, components;
    components = [Emitter, Serializer, Representer, Resolver];
    return Dumper = (function() {
      var component;

      class Dumper {
        constructor(stream, options = {}) {
          var i, len, ref;
          components[0].prototype.initialise.call(this, stream, options);
          ref = components.slice(1);
          for (i = 0, len = ref.length; i < len; i++) {
            component = ref[i];
            component.prototype.initialise.call(this, options);
          }
        }

      };

      util.extend(Dumper.prototype, ...((function() {
        var i, len, results;
        results = [];
        for (i = 0, len = components.length; i < len; i++) {
          component = components[i];
          results.push(component.prototype);
        }
        return results;
      })()));

      return Dumper;

    }).call(this);
  };

  this.Dumper = this.make_dumper();

}).call(this);
