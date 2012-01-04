
  module.exports = (function() {
    var Loader;

    function exports() {}

    Loader = require('./loader').Loader;

    /*
      Scan a YAML stream and produce scanning tokens.
    */

    exports.scan = function(stream) {
      var loader, _results;
      loader = new Loader(stream);
      _results = [];
      while (loader.check_token()) {
        _results.push(loader.get_token());
      }
      return _results;
    };

    /*
      Parse a YAML stream and produce parsing events.
    */

    exports.parse = function(stream) {
      var loader, _results;
      loader = new Loader(stream);
      _results = [];
      while (loader.check_event()) {
        _results.push(loader.get_event());
      }
      return _results;
    };

    /*
      Parse the first YAML document in a stream and produce the corresponding
      representation tree.
    */

    exports.compose = function(stream) {
      var loader;
      loader = new Loader(stream);
      return loader.get_single_node();
    };

    /*
      Parse all YAML documents in a stream and produce corresponding representation
      trees.
    */

    exports.compose_all = function(stream) {
      var loader, _results;
      loader = new Loader(stream);
      _results = [];
      while (loader.check_node()) {
        _results.push(loader.get_node());
      }
      return _results;
    };

    /*
      Parse the first YAML document in a stream and produce the corresponding
      Javascript object.
    */

    exports.load = function(stream) {
      var loader;
      loader = new Loader(stream);
      return loader.get_single_data();
    };

    return exports;

  })();
