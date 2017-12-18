(function() {
  /*
  A small class to stand-in for a stream when you simply want to write to a string.
  */
  var ref, ref1, ref2,
    hasProp = {}.hasOwnProperty;

  this.StringStream = class StringStream {
    constructor() {
      this.string = '';
    }

    write(chunk) {
      return this.string += chunk;
    }

  };

  this.clone = (obj) => {
    return Object.assign({}, obj);
  };

  this.extend = function(destination, ...sources) {
    var i, j, len, len1, name, ref, source;
    for (i = 0, len = sources.length; i < len; i++) {
      source = sources[i];
      while (source !== Object.prototype) {
        ref = Object.getOwnPropertyNames(source);
        for (j = 0, len1 = ref.length; j < len1; j++) {
          name = ref[j];
          if (destination[name] == null) {
            destination[name] = source[name];
          }
        }
        source = Object.getPrototypeOf(source);
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
      if (!hasProp.call(obj, key)) continue;
      return false;
    }
    return true;
  };

  this.inspect = (ref = (ref1 = (ref2 = require('util')) != null ? ref2.inspect : void 0) != null ? ref1 : global.inspect) != null ? ref : function(a) {
    return `${a}`;
  };

  this.pad_left = function(str, char, length) {
    str = String(str);
    if (str.length >= length) {
      return str;
    } else if (str.length + 1 === length) {
      return `${char}${str}`;
    } else {
      return `${new Array(length - str.length + 1).join(char)}${str}`;
    }
  };

  this.to_hex = function(num) {
    if (typeof num === 'string') {
      num = num.charCodeAt(0);
    }
    return num.toString(16);
  };

}).call(this);
