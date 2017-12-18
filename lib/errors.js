(function() {
  var indexOf = [].indexOf;

  this.Mark = class Mark {
    constructor(line, column, buffer, pointer) {
      this.line = line;
      this.column = column;
      this.buffer = buffer;
      this.pointer = pointer;
    }

    get_snippet(indent = 4, max_length = 75) {
      var break_chars, end, head, ref, ref1, start, tail;
      if (this.buffer == null) {
        return null;
      }
      break_chars = '\x00\r\n\x85\u2028\u2029';
      head = '';
      start = this.pointer;
      while (start > 0 && (ref = this.buffer[start - 1], indexOf.call(break_chars, ref) < 0)) {
        start--;
        if (this.pointer - start > max_length / 2 - 1) {
          head = ' ... ';
          start += 5;
          break;
        }
      }
      tail = '';
      end = this.pointer;
      while (end < this.buffer.length && (ref1 = this.buffer[end], indexOf.call(break_chars, ref1) < 0)) {
        end++;
        if (end - this.pointer > max_length / 2 - 1) {
          tail = ' ... ';
          end -= 5;
          break;
        }
      }
      return `${(new Array(indent)).join(' ')}${head}${this.buffer.slice(start, end)}${tail}\n${(new Array(indent + this.pointer - start + head.length)).join(' ')}^`;
    }

    toString() {
      var snippet, where;
      snippet = this.get_snippet();
      where = `  on line ${this.line + 1}, column ${this.column + 1}`;
      if (snippet) {
        return where;
      } else {
        return `${where}:\n${snippet}`;
      }
    }

  };

  this.YAMLError = class YAMLError extends Error {
    constructor(message) {
      super(message);
      // Hack to get the stack on the error somehow
      Object.defineProperty(this, 'stack', {
        get: function() {
          return this.toString() + '\n' + (new Error).stack.split('\n').slice(1).join('\n');
        }
      });
    }

    toString() {
      return this.message;
    }

  };

  this.MarkedYAMLError = class MarkedYAMLError extends this.YAMLError {
    constructor(context, context_mark, problem, problem_mark, note) {
      super();
      this.context = context;
      this.context_mark = context_mark;
      this.problem = problem;
      this.problem_mark = problem_mark;
      this.note = note;
    }

    toString() {
      var lines;
      lines = [];
      if (this.context != null) {
        lines.push(this.context);
      }
      if ((this.context_mark != null) && ((this.problem == null) || (this.problem_mark == null) || this.context_mark.line !== this.problem_mark.line || this.context_mark.column !== this.problem_mark.column)) {
        lines.push(this.context_mark.toString());
      }
      if (this.problem != null) {
        lines.push(this.problem);
      }
      if (this.problem_mark != null) {
        lines.push(this.problem_mark.toString());
      }
      if (this.note != null) {
        lines.push(this.note);
      }
      return lines.join('\n');
    }

  };

}).call(this);
