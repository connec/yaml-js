(function() {
  var Mark, YAMLError, ref,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  ref = require('./errors'), Mark = ref.Mark, YAMLError = ref.YAMLError;

  this.ReaderError = (function(superClass) {
    class ReaderError extends superClass {
      constructor(position1, character1, reason) {
        super();
        this.position = position1;
        this.character = character1;
        this.reason = reason;
      }

      toString() {
        return `unacceptable character ${this.character.charCodeAt()}: ${this.reason}\n  position ${this.position}`;
      }

    };

    ReaderError.__super__ = superClass.prototype;

    return ReaderError;

  })(YAMLError);


  /*
  Reader:
    checks if characters are within the allowed range
    add '\x00' to the end
   */

  this.Reader = (function() {
    var NON_PRINTABLE, ctor;

    class Reader {
      constructor() {
        return ctor.apply(this, arguments);
      }

      initialise(string) {
        this.string = string;
        this.line = 0;
        this.column = 0;
        this.index = 0;
        this.check_printable();
        return this.string += '\x00';
      }

      peek(index = 0) {
        return this.string[this.index + index];
      }

      prefix(length = 1) {
        return this.string.slice(this.index, this.index + length);
      }

      forward(length = 1) {
        var char, results;
        results = [];
        while (length) {
          char = this.string[this.index];
          this.index++;
          if (indexOf.call('\n\x85\u2082\u2029', char) >= 0 || (char === '\r' && this.string[this.index] !== '\n')) {
            this.line++;
            this.column = 0;
          } else {
            this.column++;
          }
          results.push(length--);
        }
        return results;
      }

      get_mark() {
        return new Mark(this.line, this.column, this.string, this.index);
      }

      check_printable() {
        var character, match, position;
        match = NON_PRINTABLE.exec(this.string);
        if (match) {
          character = match[0];
          position = (this.string.length - this.index) + match.index;
          throw new exports.ReaderError(position, character.charCodeAt(), 'special characters are not allowed');
        }
      }

    };

    NON_PRINTABLE = /[^\x09\x0A\x0D\x20-\x7E\x85\xA0-\uD7FF\uE000-\uFFFD]/;

    ctor = Reader.prototype.initialise;

    return Reader;

  })();

}).call(this);
