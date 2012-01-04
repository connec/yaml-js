(function() {
  var Composer, Constructor, Parser, Reader, Resolver, Scanner;

  Reader = require('./reader').Reader;

  Scanner = require('./scanner').Scanner;

  Parser = require('./parser').Parser;

  Composer = require('./composer').Composer;

  Resolver = require('./resolver').Resolver;

  Constructor = require('./constructor').Constructor;

  this.Loader = (function() {
    var key, klass, value, _i, _len, _ref, _ref2;

    _ref = [Reader, Scanner, Parser, Composer, Resolver, Constructor];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      klass = _ref[_i];
      _ref2 = klass.prototype;
      for (key in _ref2) {
        value = _ref2[key];
        Loader.prototype[key] = value;
      }
    }

    function Loader(string) {
      Reader.call(this, string);
      Scanner.call(this);
      Parser.call(this);
      Composer.call(this);
      Resolver.call(this);
      Constructor.call(this);
    }

    return Loader;

  })();

}).call(this);
