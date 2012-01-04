(function() {
  var Loader;

  Loader = require('./loader').Loader;

  /*
  Scan a YAML stream and produce scanning tokens.
  */

  this.scan = function(stream) {
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

  this.parse = function(stream) {
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

  this.compose = function(stream) {
    var loader;
    loader = new Loader(stream);
    return loader.get_single_node();
  };

  /*
  Parse all YAML documents in a stream and produce corresponding representation
  trees.
  */

  this.compose_all = function(stream) {
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

  this.load = function(stream) {
    var loader;
    loader = new Loader(stream);
    return loader.get_single_data();
  };

}).call(this);
