/*
A small class to stand-in for a stream when you simply want to write to a string.
*/


(function() {
  var _this = this,
    __slice = [].slice,
    __hasProp = {}.hasOwnProperty;

  this.StringStream = (function() {
    function StringStream() {
      this.string = '';
    }

    StringStream.prototype.write = function(chunk) {
      return this.string += chunk;
    };

    return StringStream;

  })();

  this.clone = function(obj) {
    return _this.extend({}, obj);
  };

  this.extend = function() {
    var destination, k, source, sources, v, _i, _len;
    destination = arguments[0], sources = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    for (_i = 0, _len = sources.length; _i < _len; _i++) {
      source = sources[_i];
      for (k in source) {
        v = source[k];
        destination[k] = v;
      }
    }
    return destination;
  };

  this.is_empty = function(obj) {
    var key;
    if (Array.isArray(obj) || typeof obj === 'string') {
      return obj.length === 0;
    }
    for (key in obj) {
      if (!__hasProp.call(obj, key)) continue;
      return false;
    }
    return true;
  };

  this.to_hex = function(num, min_size) {
    var result;
    if (typeof num === 'string') {
      num = num.charCodeAt(0);
    }
    result = num.toString(16);
    if (result.size < min_size) {
      return "" + (new Array(result.size - min_size + 1).join('0')) + result;
    } else {
      return result;
    }
  };

}).call(this);
