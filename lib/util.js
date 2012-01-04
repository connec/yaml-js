(function() {
  var __hasProp = Object.prototype.hasOwnProperty;

  this.is_empty = function(obj) {
    var key;
    if (Array.isArray(obj) || typeof obj === 'string') return obj.length === 0;
    for (key in obj) {
      if (!__hasProp.call(obj, key)) continue;
      return false;
    }
    return true;
  };

}).call(this);
