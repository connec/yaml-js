(function() {
  var MarkedYAMLError, SimpleKey, tokens, util,
    hasProp = {}.hasOwnProperty,
    indexOf = [].indexOf;

  ({MarkedYAMLError} = require('./errors'));

  tokens = require('./tokens');

  util = require('./util');

  /*
  The Scanner throws these.
  */
  this.ScannerError = class ScannerError extends MarkedYAMLError {};

  /*
  Represents a possible simple key.
  */
  SimpleKey = class SimpleKey {
    constructor(token_number1, required1, index, line, column1, mark1) {
      this.token_number = token_number1;
      this.required = required1;
      this.index = index;
      this.line = line;
      this.column = column1;
      this.mark = mark1;
    }

  };

  /*
  The Scanner class deals with converting a YAML stream into a token stream.
  */
  this.Scanner = (function() {
    var C_LB, C_NUMBERS, C_WS, ESCAPE_CODES, ESCAPE_REPLACEMENTS, ctor;

    class Scanner {
      constructor() {
        return ctor.apply(this, arguments);
      }

      /*
      Initialise the Scanner
      */
      initialise() {
        // Have we reached the end of the stream?
        this.done = false;
        // How many unclosed '{' or '[' have been seen. '0' implies block context.
        this.flow_level = 0;
        // List of processed tokens not yet emitted.
        this.tokens = [];
        // Add the STREAM-START token.
        this.fetch_stream_start();
        // Number of tokens emitted through the `get_token` method.
        this.tokens_taken = 0;
        // Current indentation level. '-1' means no indentation has been seen.
        this.indent = -1;
        // Previous indentation levels.
        this.indents = [];
        // Simple Key Treatment
        //   A simple key is a key that is not denoted by the '?' indicator, e.g.
        //     block simple key: value
        //     ? not a simple key
        //     : { flow simple key: value }
        //   We emit the KEY token before all keys, so when we find a potential
        //   simple key, we try to locate the corresponding ':' indicator.  Simple
        //   keys should be limited to a single line and 1024 characters.

        // Can a simple key start at the current position?  A simple key may
        // start
        //   at the beginning of the line, not counting indentation spaces
        //     (block context)
        //   after '{', '[', ',' (flow context)
        //   after '?', ':', '-' (block context)
        // In the block context, this flag also signifies if a block collection
        // may start at the current position.
        this.allow_simple_key = true;
        // Keep track of possible simple keys.  This is an object.  The key is
        // `flow_level`; there can be no more than one possible simple key for
        // each level.  The value is a SimpleKey object. A simple key may start
        // with ALIAS, ANCHOR, TAG, SCALAR (flow), '[' or '{' tokens.
        return this.possible_simple_keys = {};
      }

      // API methods.
      /*
      Check if the next token is one of the given types.
      */
      check_token(...choices) {
        var choice, i, len;
        while (this.need_more_tokens()) {
          this.fetch_more_tokens();
        }
        if (this.tokens.length !== 0) {
          if (choices.length === 0) {
            return true;
          }
          for (i = 0, len = choices.length; i < len; i++) {
            choice = choices[i];
            if (this.tokens[0] instanceof choice) {
              return true;
            }
          }
        }
        return false;
      }

      /*
      Return the next token, but do not delete it from the queue.
      */
      peek_token() {
        while (this.need_more_tokens()) {
          this.fetch_more_tokens();
        }
        if (this.tokens.length !== 0) {
          return this.tokens[0];
        }
      }

      /*
      Return the next token, and remove it from the queue.
      */
      get_token() {
        while (this.need_more_tokens()) {
          this.fetch_more_tokens();
        }
        if (this.tokens.length !== 0) {
          this.tokens_taken++;
          return this.tokens.shift();
        }
      }

      // Non-API methods.
      need_more_tokens() {
        if (this.done) {
          return false;
        }
        if (this.tokens.length === 0) {
          return true;
        }
        // The current token may be a potential simple key, so we need to look
        // further.
        this.stale_possible_simple_keys();
        if (this.next_possible_simple_key() === this.tokens_taken) {
          return true;
        }
        return false;
      }

      fetch_more_tokens() {
        var char;
        // Eat whitespace and comments until we reach the next token.
        this.scan_to_next_token();
        // Remove obsolete possible simple keys
        this.stale_possible_simple_keys();
        // Compare the current indentation and column. It may add some tokens and
        // decrease the current indentation level.
        this.unwind_indent(this.column);
        // Peek the next character.
        char = this.peek();
        if (char === '\x00') {
          // Is it the end of stream?
          return this.fetch_stream_end();
        }
        if (char === '%' && this.check_directive()) {
          // Is it a directive?
          return this.fetch_directive();
        }
        if (char === '-' && this.check_document_start()) {
          // Is it the document start?
          return this.fetch_document_start();
        }
        if (char === '.' && this.check_document_end()) {
          // Is it the document end?
          return this.fetch_document_end();
        }
        if (char === '[') {
          // TODO: support for BOM within a stream.

          // Is it the flow sequence start indicator?
          return this.fetch_flow_sequence_start();
        }
        if (char === '{') {
          // Is it the flow mapping start indicator?
          return this.fetch_flow_mapping_start();
        }
        if (char === ']') {
          // Is it the flow sequence end indicator?
          return this.fetch_flow_sequence_end();
        }
        if (char === '}') {
          // Is it the flow mapping end indicator?
          return this.fetch_flow_mapping_end();
        }
        if (char === ',') {
          // Is it the flow entry indicator?
          return this.fetch_flow_entry();
        }
        if (char === '-' && this.check_block_entry()) {
          // Is it the block entry indicator?
          return this.fetch_block_entry();
        }
        if (char === '?' && this.check_key()) {
          // Is it the key indicator?
          return this.fetch_key();
        }
        if (char === ':' && this.check_value()) {
          // Is it the value indicator?
          return this.fetch_value();
        }
        if (char === '*') {
          // Is it an alias?
          return this.fetch_alias();
        }
        if (char === '&') {
          // Is it an anchor?
          return this.fetch_anchor();
        }
        if (char === '!') {
          // Is it a tag?
          return this.fetch_tag();
        }
        if (char === '|' && this.flow_level === 0) {
          // Is it a literal scalar?
          return this.fetch_literal();
        }
        if (char === '>' && this.flow_level === 0) {
          // Is it a folded scalar?
          return this.fetch_folded();
        }
        if (char === '\'') {
          // Is it a single quoted scalar?
          return this.fetch_single();
        }
        if (char === '"') {
          // Is it a double quoted scalar?
          return this.fetch_double();
        }
        if (this.check_plain()) {
          // It must be a plain scalar then.
          return this.fetch_plain();
        }
        // No? It's an error.
        throw new exports.ScannerError('while scanning for the next token', null, `found character ${char} that cannot start any token`, this.get_mark());
      }

      // Simple keys treatment.
      /*
      Return the number of the nearest possible simple key.
      */
      next_possible_simple_key() {
        var key, level, min_token_number, ref;
        min_token_number = null;
        ref = this.possible_simple_keys;
        for (level in ref) {
          if (!hasProp.call(ref, level)) continue;
          key = ref[level];
          if (min_token_number === null || key.token_number < min_token_number) {
            min_token_number = key.token_number;
          }
        }
        return min_token_number;
      }

      /*
      Remove entries that are no longer possible simple keys.  According to the
      YAML spec, simple keys:
      should be limited to a single line
      should be no longer than 1024 characters
      Disabling this procedure will allow simple keys of any length and height
      (may cause problems if indentation is broken though).
      */
      stale_possible_simple_keys() {
        var key, level, ref, results;
        ref = this.possible_simple_keys;
        results = [];
        for (level in ref) {
          if (!hasProp.call(ref, level)) continue;
          key = ref[level];
          if (key.line === this.line && this.index - key.index <= 1024) {
            continue;
          }
          if (!key.required) {
            results.push(delete this.possible_simple_keys[level]);
          } else {
            throw new exports.ScannerError('while scanning a simple key', key.mark, 'could not find expected \':\'', this.get_mark());
          }
        }
        return results;
      }

      /*
      The next token may start a simple key.  We check if it's possible and save
      its position.  This function is called for ALIAS, ANCHOR, TAG,
      SCALAR (flow),'[' and '{'.
      */
      save_possible_simple_key() {
        var required, token_number;
        // Check if a simple key is required at the current position.
        required = this.flow_level === 0 && this.indent === this.column;
        if (required && !this.allow_simple_key) {
          // A simple key is required only if it is the first token in the current
          // line.  Therefore it is always allowed.
          throw new Error('logic failure');
        }
        // If simple keys aren't allowed here we're done.
        if (!this.allow_simple_key) {
          return;
        }
        // The next token might be a simple key.  Let's save its number and
        // position.
        this.remove_possible_simple_key();
        token_number = this.tokens_taken + this.tokens.length;
        return this.possible_simple_keys[this.flow_level] = new SimpleKey(token_number, required, this.index, this.line, this.column, this.get_mark());
      }

      /*
      Remove the saved possible simple key at the current flow level.
      */
      remove_possible_simple_key() {
        var key;
        if (!(key = this.possible_simple_keys[this.flow_level])) {
          return;
        }
        if (!key.required) {
          return delete this.possible_simple_keys[this.flow_level];
        } else {
          throw new exports.ScannerError('while scanning a simple key', key.mark, 'could not find expected \':\'', this.get_mark());
        }
      }

      // Indentation functions
      /*
      In flow context, tokens should respect indentation.
      Actually the condition should be `self.indent >= column` according to
      the spec. But this condition will prohibit intuitively correct
      constructions such as
        key : {
        }
      */
      unwind_indent(column) {
        var mark, results;
        // In the flow context, indentation is ignored.  We make the scanner less
        // restrictive than the specification requires.
        if (this.flow_level !== 0) {
          return;
        }
        results = [];
        // In block context we may need to issue the BLOCK-END tokens.
        while (this.indent > column) {
          mark = this.get_mark();
          this.indent = this.indents.pop();
          results.push(this.tokens.push(new tokens.BlockEndToken(mark, mark)));
        }
        return results;
      }

      /*
      Check if we need to increase indentation.
      */
      add_indent(column) {
        if (!(column > this.indent)) {
          return false;
        }
        this.indents.push(this.indent);
        this.indent = column;
        return true;
      }

      // Fetchers.
      fetch_stream_start() {
        var mark;
        mark = this.get_mark();
        return this.tokens.push(new tokens.StreamStartToken(mark, mark, this.encoding));
      }

      fetch_stream_end() {
        var mark;
        // Set the current indentation to -1.
        this.unwind_indent(-1);
        // Reset simple keys.
        this.remove_possible_simple_key();
        this.allow_possible_simple_key = false;
        this.possible_simple_keys = {};
        mark = this.get_mark();
        this.tokens.push(new tokens.StreamEndToken(mark, mark));
        // The stream is finished.
        return this.done = true;
      }

      fetch_directive() {
        // Set the current indentation to -1.
        this.unwind_indent(-1);
        // Reset simple keys.
        this.remove_possible_simple_key();
        this.allow_simple_key = false;
        // Scan and add DIRECTIVE
        return this.tokens.push(this.scan_directive());
      }

      fetch_document_start() {
        return this.fetch_document_indicator(tokens.DocumentStartToken);
      }

      fetch_document_end() {
        return this.fetch_document_indicator(tokens.DocumentEndToken);
      }

      fetch_document_indicator(TokenClass) {
        var start_mark;
        // Set the current indentation to -1.
        this.unwind_indent(-1);
        // Reset simple keys.  Note that there would not be a block collection
        // after '---'.
        this.remove_possible_simple_key();
        this.allow_simple_key = false;
        // Add DOCUMENT-START or DOCUMENT-END.
        start_mark = this.get_mark();
        this.forward(3);
        return this.tokens.push(new TokenClass(start_mark, this.get_mark()));
      }

      fetch_flow_sequence_start() {
        return this.fetch_flow_collection_start(tokens.FlowSequenceStartToken);
      }

      fetch_flow_mapping_start() {
        return this.fetch_flow_collection_start(tokens.FlowMappingStartToken);
      }

      fetch_flow_collection_start(TokenClass) {
        var start_mark;
        // '[' and '{' may start a simple key.
        this.save_possible_simple_key();
        // Increase flow level.
        this.flow_level++;
        // Simple keys are allowed after '[' and '{'
        this.allow_simple_key = true;
        // Add FLOW-SEQUENCE-START or FLOW-MAPPING-START.
        start_mark = this.get_mark();
        this.forward();
        return this.tokens.push(new TokenClass(start_mark, this.get_mark()));
      }

      fetch_flow_sequence_end() {
        return this.fetch_flow_collection_end(tokens.FlowSequenceEndToken);
      }

      fetch_flow_mapping_end() {
        return this.fetch_flow_collection_end(tokens.FlowMappingEndToken);
      }

      fetch_flow_collection_end(TokenClass) {
        var start_mark;
        // Reset possible simple key on the current level.
        this.remove_possible_simple_key();
        // Decrease the flow level
        this.flow_level--;
        // No simple keys after ']' or '}'
        this.allow_simple_key = false;
        // Add FLOW-SEQUENCE-END or FLOW-MAPPING-END.
        start_mark = this.get_mark();
        this.forward();
        return this.tokens.push(new TokenClass(start_mark, this.get_mark()));
      }

      fetch_flow_entry() {
        var start_mark;
        // Simple keys are allowed after ','.
        this.allow_simple_key = true;
        // Reset possible simple key on the current level.
        this.remove_possible_simple_key();
        // Add FLOW-ENTRY
        start_mark = this.get_mark();
        this.forward();
        return this.tokens.push(new tokens.FlowEntryToken(start_mark, this.get_mark()));
      }

      fetch_block_entry() {
        var mark, start_mark;
        // Block context needs additional checks
        if (this.flow_level === 0) {
          // Are we allowed to start a new entry?
          if (!this.allow_simple_key) {
            throw new exports.ScannerError(null, null, 'sequence entries are not allowed here', this.get_mark());
          }
          // We may need to add BLOCK-SEQUENCE-START
          if (this.add_indent(this.column)) {
            mark = this.get_mark();
            this.tokens.push(new tokens.BlockSequenceStartToken(mark, mark));
          }
        }
        // It's an error for the block entry to occur in the flow context but we
        // let the parser detect this.

        // Simple keys are allowed after '-'
        this.allow_simple_key = true;
        // Reset possible simple key on the current level.
        this.remove_possible_simple_key();
        // Add BLOCK-ENTRY
        start_mark = this.get_mark();
        this.forward();
        return this.tokens.push(new tokens.BlockEntryToken(start_mark, this.get_mark()));
      }

      fetch_key() {
        var mark, start_mark;
        // Block context needs additional checks.
        if (this.flow_level === 0) {
          // Are we allowed to start a key?
          if (!this.allow_simple_key) {
            throw new exports.ScannerError(null, null, 'mapping keys are not allowed here', this.get_mark());
          }
          // We may need to add BLOCK-MAPPING-START.
          if (this.add_indent(this.column)) {
            mark = this.get_mark();
            this.tokens.push(new tokens.BlockMappingStartToken(mark, mark));
          }
        }
        // Simple keys are allowed after '?' in the flow context.
        this.allow_simple_key = !this.flow_level;
        // Reset possible simple key on the current level.
        this.remove_possible_simple_key();
        // Add KEY.
        start_mark = this.get_mark();
        this.forward();
        return this.tokens.push(new tokens.KeyToken(start_mark, this.get_mark()));
      }

      fetch_value() {
        var key, mark, start_mark;
        // Do we determine a simple key?
        if (key = this.possible_simple_keys[this.flow_level]) {
          // Add KEY.
          delete this.possible_simple_keys[this.flow_level];
          this.tokens.splice(key.token_number - this.tokens_taken, 0, new tokens.KeyToken(key.mark, key.mark));
          // If this key starts a new block mapping we need to add
          // BLOCK-MAPPING-START.
          if (this.flow_level === 0) {
            if (this.add_indent(key.column)) {
              this.tokens.splice(key.token_number - this.tokens_taken, 0, new tokens.BlockMappingStartToken(key.mark, key.mark));
            }
          }
          // There cannot be two simple keys one after the other.
          this.allow_simple_key = false;
        } else {
          // Block context needs additional checks.
          // TODO: do we really need them?  Parser will catch them anyway.
          // It must be part of a complex key.
          if (this.flow_level === 0) {
            // We are allowed to start a complex value if and only if we can start
            // a simple key.
            if (!this.allow_simple_key) {
              throw new exports.ScannerError(null, null, 'mapping values are not allowed here', this.get_mark());
            }
            // If this value starts a new block mapping we need to add
            // BLOCK-MAPPING-START.  It will be detected as an error later by the
            // parser.
            if (this.add_indent(this.column)) {
              mark = this.get_mark();
              this.tokens.push(new tokens.BlockMappingStartToken(mark, mark));
            }
          }
          // Simple keys are allowed after ':' in the block context.
          this.allow_simple_key = !this.flow_level;
          // Reset possible simple key on the current level.
          this.remove_possible_simple_key();
        }
        // Add VALUE.
        start_mark = this.get_mark();
        this.forward();
        return this.tokens.push(new tokens.ValueToken(start_mark, this.get_mark()));
      }

      fetch_alias() {
        // ALIAS could be a simple key.
        this.save_possible_simple_key();
        // No simple keys after ALIAS.
        this.allow_simple_key = false;
        // Scan and add ALIAS.
        return this.tokens.push(this.scan_anchor(tokens.AliasToken));
      }

      fetch_anchor() {
        // ANCHOR could start a simple key.
        this.save_possible_simple_key();
        // No simple keys allowed after ANCHOR.
        this.allow_simple_key = false;
        // Scan and add ANCHOR.
        return this.tokens.push(this.scan_anchor(tokens.AnchorToken));
      }

      fetch_tag() {
        // TAG could start a simple key
        this.save_possible_simple_key();
        // No simple keys after TAG.
        this.allow_simple_key = false;
        // Scan and add TAG.
        return this.tokens.push(this.scan_tag());
      }

      fetch_literal() {
        return this.fetch_block_scalar('|');
      }

      fetch_folded() {
        return this.fetch_block_scalar('>');
      }

      fetch_block_scalar(style) {
        // A simple key may follow a block sclar.
        this.allow_simple_key = true;
        // Reset possible simple key on the current level.
        this.remove_possible_simple_key();
        // Scan and add SCALAR.
        return this.tokens.push(this.scan_block_scalar(style));
      }

      fetch_single() {
        return this.fetch_flow_scalar('\'');
      }

      fetch_double() {
        return this.fetch_flow_scalar('"');
      }

      fetch_flow_scalar(style) {
        // A flow scalar could be a simple key.
        this.save_possible_simple_key();
        // No simple keys after flow scalars.
        this.allow_simple_key = false;
        // Scan and add SCALAR.
        return this.tokens.push(this.scan_flow_scalar(style));
      }

      fetch_plain() {
        // A plain scalar could be a simple key.
        this.save_possible_simple_key();
        // No simple keys after plain scalars.  But note that `scan_plain` will
        // change this flag if the scan is finished at the beginning of the line.
        this.allow_simple_key = false;
        // Scan and add SCALAR.  May change `allow_simple_key`.
        return this.tokens.push(this.scan_plain());
      }

      // Checkers.
      /*
      DIRECTIVE: ^ '%'
      */
      check_directive() {
        if (this.column === 0) {
          // The % indicator has already been checked.
          return true;
        }
        return false;
      }

      /*
      DOCUMENT-START: ^ '---' (' '|'\n')
      */
      check_document_start() {
        var ref;
        if (this.column === 0 && this.prefix(3) === '---' && (ref = this.peek(3), indexOf.call(C_LB + C_WS + '\x00', ref) >= 0)) {
          return true;
        }
        return false;
      }

      /*
      DOCUMENT-END: ^ '...' (' '|'\n')
      */
      check_document_end() {
        var ref;
        if (this.column === 0 && this.prefix(3) === '...' && (ref = this.peek(3), indexOf.call(C_LB + C_WS + '\x00', ref) >= 0)) {
          return true;
        }
        return false;
      }

      /*
      BLOCK-ENTRY: '-' (' '|'\n')
      */
      check_block_entry() {
        var ref;
        return ref = this.peek(1), indexOf.call(C_LB + C_WS + '\x00', ref) >= 0;
      }

      /*
      KEY (flow context):  '?'
      KEY (block context): '?' (' '|'\n')
      */
      check_key() {
        var ref;
        if (this.flow_level !== 0) {
          // KEY (flow context)
          return true;
        }
        // KEY (block context)
        return ref = this.peek(1), indexOf.call(C_LB + C_WS + '\x00', ref) >= 0;
      }

      /*
      VALUE (flow context):  ':'
      VALUE (block context): ':' (' '|'\n')
      */
      check_value() {
        var ref;
        if (this.flow_level !== 0) {
          // VALUE (flow context)
          return true;
        }
        // VALUE (block context)
        return ref = this.peek(1), indexOf.call(C_LB + C_WS + '\x00', ref) >= 0;
      }

      /*
      A plain scalar may start with any non-space character except:
      '-', '?', ':', ',', '[', ']', '{', '}',
      '#', '&', '*', '!', '|', '>', '\'', '"',
      '%', '@', '`'.

      It may also start with
      '-', '?', ':'
      if it is followed by a non-space character.

      Note that we limit the last rule to the block context (except the '-'
      character) because we want the flow context to be space independent.
      */
      check_plain() {
        var char, ref;
        char = this.peek();
        return indexOf.call(C_LB + C_WS + '\x00-?:,[]{}#&*!|>\'"%@`', char) < 0 || ((ref = this.peek(1), indexOf.call(C_LB + C_WS + '\x00', ref) < 0) && (char === '-' || (this.flow_level === 0 && indexOf.call('?:', char) >= 0)));
      }

      // Scanners.
      /*
      We ignore spaces, line breaks and comments.
      If we find a line break in the block context, we set the flag
      `allow_simple_key` on.
      The byte order mark is stripped if it's the first character in the stream.
      We do not yet support BOM inside the stream as the specification requires.
      Any such mark will be considered as a part of the document.

      TODO: We need to make tab handling rules more sane.  A good rule is
      Tabs cannot precede tokens BLOCK-SEQUENCE-START, BLOCK-MAPPING-START,
      BLOCK-END, KEY (block context), VALUE (block context), BLOCK-ENTRY
      So the tab checking code is
      @allow_simple_key = off if <TAB>
      We also need to add the check for `allow_simple_key is on` to
      `unwind_indent` before issuing BLOCK-END.  Scanners for block, flow and
      plain scalars need to be modified.
      */
      scan_to_next_token() {
        var found, ref, results;
        if (this.index === 0 && this.peek() === '\uFEFF') {
          this.forward();
        }
        found = false;
        results = [];
        while (!found) {
          while (this.peek() === ' ') {
            this.forward();
          }
          if (this.peek() === '#') {
            while (ref = this.peek(), indexOf.call(C_LB + '\x00', ref) < 0) {
              this.forward();
            }
          }
          if (this.scan_line_break()) {
            if (this.flow_level === 0) {
              results.push(this.allow_simple_key = true);
            } else {
              results.push(void 0);
            }
          } else {
            results.push(found = true);
          }
        }
        return results;
      }

      /*
      See the specification for details.
      */
      scan_directive() {
        var end_mark, name, ref, start_mark, value;
        start_mark = this.get_mark();
        this.forward();
        name = this.scan_directive_name(start_mark);
        value = null;
        if (name === 'YAML') {
          value = this.scan_yaml_directive_value(start_mark);
          end_mark = this.get_mark();
        } else if (name === 'TAG') {
          value = this.scan_tag_directive_value(start_mark);
          end_mark = this.get_mark();
        } else {
          end_mark = this.get_mark();
          while (ref = this.peek(), indexOf.call(C_LB + '\x00', ref) < 0) {
            this.forward();
          }
        }
        this.scan_directive_ignored_line(start_mark);
        return new tokens.DirectiveToken(name, value, start_mark, end_mark);
      }

      /*
      See the specification for details.
      */
      scan_directive_name(start_mark) {
        var char, length, value;
        length = 0;
        char = this.peek(length);
        while (('0' <= char && char <= '9') || ('A' <= char && char <= 'Z') || ('a' <= char && char <= 'z') || indexOf.call('-_', char) >= 0) {
          length++;
          char = this.peek(length);
        }
        if (length === 0) {
          throw new exports.ScannerError('while scanning a directive', start_mark, `expected alphanumeric or numeric character but found ${char}`, this.get_mark());
        }
        value = this.prefix(length);
        this.forward(length);
        char = this.peek();
        if (indexOf.call(C_LB + '\x00 ', char) < 0) {
          throw new exports.ScannerError('while scanning a directive', start_mark, `expected alphanumeric or numeric character but found ${char}`, this.get_mark());
        }
        return value;
      }

      /*
      See the specification for details.
      */
      scan_yaml_directive_value(start_mark) {
        var major, minor, ref;
        while (this.peek() === ' ') {
          this.forward();
        }
        major = this.scan_yaml_directive_number(start_mark);
        if (this.peek() !== '.') {
          throw new exports.ScannerError('while scanning a directive', start_mark, `expected a digit or '.' but found ${this.peek()}`, this.get_mark());
        }
        this.forward();
        minor = this.scan_yaml_directive_number(start_mark);
        if (ref = this.peek(), indexOf.call(C_LB + '\x00 ', ref) < 0) {
          throw new exports.ScannerError('while scanning a directive', start_mark, `expected a digit or ' ' but found ${this.peek()}`, this.get_mark());
        }
        return [major, minor];
      }

      /*
      See the specification for details.
      */
      scan_yaml_directive_number(start_mark) {
        var char, length, ref, value;
        char = this.peek();
        if (!(('0' <= char && char <= '9'))) {
          throw new exports.ScannerError('while scanning a directive', start_mark, `expected a digit but found ${char}`, this.get_mark());
        }
        length = 0;
        while (('0' <= (ref = this.peek(length)) && ref <= '9')) {
          length++;
        }
        value = parseInt(this.prefix(length));
        this.forward(length);
        return value;
      }

      /*
      See the specification for details.
      */
      scan_tag_directive_value(start_mark) {
        var handle, prefix;
        while (this.peek() === ' ') {
          this.forward();
        }
        handle = this.scan_tag_directive_handle(start_mark);
        while (this.peek() === ' ') {
          this.forward();
        }
        prefix = this.scan_tag_directive_prefix(start_mark);
        return [handle, prefix];
      }

      /*
      See the specification for details.
      */
      scan_tag_directive_handle(start_mark) {
        var char, value;
        value = this.scan_tag_handle('directive', start_mark);
        char = this.peek();
        if (char !== ' ') {
          throw new exports.ScannerError('while scanning a directive', start_mark, `expected ' ' but found ${char}`, this.get_mark());
        }
        return value;
      }

      /*
      See the specification for details.
      */
      scan_tag_directive_prefix(start_mark) {
        var char, value;
        value = this.scan_tag_uri('directive', start_mark);
        char = this.peek();
        if (indexOf.call(C_LB + '\x00 ', char) < 0) {
          throw new exports.ScannerError('while scanning a directive', start_mark, `expected ' ' but found ${char}`, this.get_mark());
        }
        return value;
      }

      /*
      See the specification for details.
      */
      scan_directive_ignored_line(start_mark) {
        var char, ref;
        while (this.peek() === ' ') {
          this.forward();
        }
        if (this.peek() === '#') {
          while (ref = this.peek(), indexOf.call(C_LB + '\x00', ref) < 0) {
            this.forward();
          }
        }
        char = this.peek();
        if (indexOf.call(C_LB + '\x00', char) < 0) {
          throw new exports.ScannerError('while scanning a directive', start_mark, `expected a comment or a line break but found ${char}`, this.get_mark());
        }
        return this.scan_line_break();
      }

      /*
      The specification does not restrict characters for anchors and aliases.
      This may lead to problems, for instance, the document:
      [ *alias, value ]
      can be interpteted in two ways, as
      [ "value" ]
      and
      [ *alias , "value" ]
      Therefore we restrict aliases to numbers and ASCII letters.
      */
      scan_anchor(TokenClass) {
        var char, indicator, length, name, start_mark, value;
        start_mark = this.get_mark();
        indicator = this.peek();
        if (indicator === '*') {
          name = 'alias';
        } else {
          name = 'anchor';
        }
        this.forward();
        length = 0;
        char = this.peek(length);
        while (('0' <= char && char <= '9') || ('A' <= char && char <= 'Z') || ('a' <= char && char <= 'z') || indexOf.call('-_', char) >= 0) {
          length++;
          char = this.peek(length);
        }
        if (length === 0) {
          throw new exports.ScannerError(`while scanning an ${name}`, start_mark, `expected alphabetic or numeric character but found '${char}'`, this.get_mark());
        }
        value = this.prefix(length);
        this.forward(length);
        char = this.peek();
        if (indexOf.call(C_LB + C_WS + '\x00' + '?:,]}%@`', char) < 0) {
          throw new exports.ScannerError(`while scanning an ${name}`, start_mark, `expected alphabetic or numeric character but found '${char}'`, this.get_mark());
        }
        return new TokenClass(value, start_mark, this.get_mark());
      }

      /*
      See the specification for details.
      */
      scan_tag() {
        var char, handle, length, start_mark, suffix, use_handle;
        start_mark = this.get_mark();
        char = this.peek(1);
        if (char === '<') {
          handle = null;
          this.forward(2);
          suffix = this.scan_tag_uri('tag', start_mark);
          if (this.peek() !== '>') {
            throw new exports.ScannerError('while parsing a tag', start_mark, `expected '>' but found ${this.peek()}`, this.get_mark());
          }
          this.forward();
        } else if (indexOf.call(C_LB + C_WS + '\x00', char) >= 0) {
          handle = null;
          suffix = '!';
          this.forward();
        } else {
          length = 1;
          use_handle = false;
          while (indexOf.call(C_LB + '\x00 ', char) < 0) {
            if (char === '!') {
              use_handle = true;
              break;
            }
            length++;
            char = this.peek(length);
          }
          if (use_handle) {
            handle = this.scan_tag_handle('tag', start_mark);
          } else {
            handle = '!';
            this.forward();
          }
          suffix = this.scan_tag_uri('tag', start_mark);
        }
        char = this.peek();
        if (indexOf.call(C_LB + '\x00 ', char) < 0) {
          throw new exports.ScannerError('while scanning a tag', start_mark, `expected ' ' but found ${char}`, this.get_mark());
        }
        return new tokens.TagToken([handle, suffix], start_mark, this.get_mark());
      }

      /*
      See the specification for details.
      */
      scan_block_scalar(style) {
        var breaks, chomping, chunks, end_mark, folded, increment, indent, leading_non_space, length, line_break, max_indent, min_indent, ref, ref1, ref2, start_mark;
        folded = style === '>';
        chunks = [];
        start_mark = this.get_mark();
        // Scan the header.
        this.forward();
        [chomping, increment] = this.scan_block_scalar_indicators(start_mark);
        this.scan_block_scalar_ignored_line(start_mark);
        // Determine the indentation level and go to the first non-empty line.
        min_indent = this.indent + 1;
        if (min_indent < 1) {
          min_indent = 1;
        }
        if (increment == null) {
          [breaks, max_indent, end_mark] = this.scan_block_scalar_indentation();
          indent = Math.max(min_indent, max_indent);
        } else {
          indent = min_indent + increment - 1;
          [breaks, end_mark] = this.scan_block_scalar_breaks(indent);
        }
        line_break = '';
        // Scan the inner part of the block scalar.
        while (this.column === indent && this.peek() !== '\x00') {
          chunks = chunks.concat(breaks);
          leading_non_space = (ref = this.peek(), indexOf.call(' \t', ref) < 0);
          length = 0;
          while (ref1 = this.peek(length), indexOf.call(C_LB + '\x00', ref1) < 0) {
            length++;
          }
          chunks.push(this.prefix(length));
          this.forward(length);
          line_break = this.scan_line_break();
          [breaks, end_mark] = this.scan_block_scalar_breaks(indent);
          if (this.column === indent && this.peek() !== '\x00') {
            // Unfortunately, folding rules are ambiguous.  This is the folding
            // according to the specification:
            if (folded && line_break === '\n' && leading_non_space && (ref2 = this.peek(), indexOf.call(' \t', ref2) < 0)) {
              if (util.is_empty(breaks)) {
                chunks.push(' ');
              }
            } else {
              chunks.push(line_break);
            }
          } else {
            // This is Clark Evan's interpretation (also in the spec examples):
            // if folded and line_break is '\n'
            //   if not breaks
            //     if @peek() not in ' \t'
            //       chunks.push ' '
            //     else
            //       chunks.push line_break
            // else
            //   chunks.push line_break
            break;
          }
        }
        if (chomping !== false) {
          // Chomp the tail
          chunks.push(line_break);
        }
        if (chomping === true) {
          chunks = chunks.concat(breaks);
        }
        // And we're done.
        return new tokens.ScalarToken(chunks.join(''), false, start_mark, end_mark, style);
      }

      /*
      See the specification for details.
      */
      scan_block_scalar_indicators(start_mark) {
        var char, chomping, increment;
        chomping = null;
        increment = null;
        char = this.peek();
        if (indexOf.call('+-', char) >= 0) {
          chomping = char === '+';
          this.forward();
          char = this.peek();
          if (indexOf.call(C_NUMBERS, char) >= 0) {
            increment = parseInt(char);
            if (increment === 0) {
              throw new exports.ScannerError('while scanning a block scalar', start_mark, 'expected indentation indicator in the range 1-9 but found 0', this.get_mark());
            }
            this.forward();
          }
        } else if (indexOf.call(C_NUMBERS, char) >= 0) {
          increment = parseInt(char);
          if (increment === 0) {
            throw new exports.ScannerError('while scanning a block scalar', start_mark, 'expected indentation indicator in the range 1-9 but found 0', this.get_mark());
          }
          this.forward();
          char = this.peek();
          if (indexOf.call('+-', char) >= 0) {
            chomping = char === '+';
            this.forward();
          }
        }
        char = this.peek();
        if (indexOf.call(C_LB + '\x00 ', char) < 0) {
          throw new exports.ScannerError('while scanning a block scalar', start_mark, `expected chomping or indentation indicators, but found ${char}`, this.get_mark());
        }
        return [chomping, increment];
      }

      /*
      See the specification for details.
      */
      scan_block_scalar_ignored_line(start_mark) {
        var char, ref;
        while (this.peek() === ' ') {
          this.forward();
        }
        if (this.peek() === '#') {
          while (ref = this.peek(), indexOf.call(C_LB + '\x00', ref) < 0) {
            this.forward();
          }
        }
        char = this.peek();
        if (indexOf.call(C_LB + '\x00', char) < 0) {
          throw new exports.ScannerError('while scanning a block scalar', start_mark, `expected a comment or a line break but found ${char}`, this.get_mark());
        }
        return this.scan_line_break();
      }

      /*
      See the specification for details.
      */
      scan_block_scalar_indentation() {
        var chunks, end_mark, max_indent, ref;
        chunks = [];
        max_indent = 0;
        end_mark = this.get_mark();
        while (ref = this.peek(), indexOf.call(C_LB + ' ', ref) >= 0) {
          if (this.peek() !== ' ') {
            chunks.push(this.scan_line_break());
            end_mark = this.get_mark();
          } else {
            this.forward();
            if (this.column > max_indent) {
              max_indent = this.column;
            }
          }
        }
        return [chunks, max_indent, end_mark];
      }

      /*
      See the specification for details.
      */
      scan_block_scalar_breaks(indent) {
        var chunks, end_mark, ref;
        chunks = [];
        end_mark = this.get_mark();
        while (this.column < indent && this.peek() === ' ') {
          this.forward();
        }
        while (ref = this.peek(), indexOf.call(C_LB, ref) >= 0) {
          chunks.push(this.scan_line_break());
          end_mark = this.get_mark();
          while (this.column < indent && this.peek() === ' ') {
            this.forward();
          }
        }
        return [chunks, end_mark];
      }

      /*
      See the specification for details.
      Note that we loose indentation rules for quoted scalars. Quoted scalars
      don't need to adhere indentation because " and ' clearly mark the beginning
      and the end of them. Therefore we are less restrictive than the
      specification requires. We only need to check that document separators are
      not included in scalars.
      */
      scan_flow_scalar(style) {
        var chunks, double, quote, start_mark;
        double = style === '"';
        chunks = [];
        start_mark = this.get_mark();
        quote = this.peek();
        this.forward();
        chunks = chunks.concat(this.scan_flow_scalar_non_spaces(double, start_mark));
        while (this.peek() !== quote) {
          chunks = chunks.concat(this.scan_flow_scalar_spaces(double, start_mark));
          chunks = chunks.concat(this.scan_flow_scalar_non_spaces(double, start_mark));
        }
        this.forward();
        return new tokens.ScalarToken(chunks.join(''), false, start_mark, this.get_mark(), style);
      }

      /*
      See the specification for details.
      */
      scan_flow_scalar_non_spaces(double, start_mark) {
        var char, chunks, code, i, k, length, ref, ref1, ref2;
        chunks = [];
        while (true) {
          length = 0;
          while (ref = this.peek(length), indexOf.call(C_LB + C_WS + '\'"\\\x00', ref) < 0) {
            length++;
          }
          if (length !== 0) {
            chunks.push(this.prefix(length));
            this.forward(length);
          }
          char = this.peek();
          if (!double && char === '\'' && this.peek(1) === '\'') {
            chunks.push('\'');
            this.forward(2);
          } else if ((double && char === '\'') || (!double && indexOf.call('"\\', char) >= 0)) {
            chunks.push(char);
            this.forward();
          } else if (double && char === '\\') {
            this.forward();
            char = this.peek();
            if (char in ESCAPE_REPLACEMENTS) {
              chunks.push(ESCAPE_REPLACEMENTS[char]);
              this.forward();
            } else if (char in ESCAPE_CODES) {
              length = ESCAPE_CODES[char];
              this.forward();
              for (k = i = 0, ref1 = length; 0 <= ref1 ? i < ref1 : i > ref1; k = 0 <= ref1 ? ++i : --i) {
                if (ref2 = this.peek(k), indexOf.call(`${C_NUMBERS}ABCDEFabcdef`, ref2) < 0) {
                  throw new exports.ScannerError('while scanning a double-quoted scalar', start_mark, `expected escape sequence of ${length} hexadecimal numbers, but found ${this.peek(k)}`, this.get_mark());
                }
              }
              code = parseInt(this.prefix(length), 16);
              chunks.push(String.fromCharCode(code));
              this.forward(length);
            } else if (indexOf.call(C_LB, char) >= 0) {
              this.scan_line_break();
              chunks = chunks.concat(this.scan_flow_scalar_breaks(double, start_mark));
            } else {
              throw new exports.ScannerError('while scanning a double-quoted scalar', start_mark, `found unknown escape character ${char}`, this.get_mark());
            }
          } else {
            return chunks;
          }
        }
      }

      /*
      See the specification for details.
      */
      scan_flow_scalar_spaces(double, start_mark) {
        var breaks, char, chunks, length, line_break, ref, whitespaces;
        chunks = [];
        length = 0;
        while (ref = this.peek(length), indexOf.call(C_WS, ref) >= 0) {
          length++;
        }
        whitespaces = this.prefix(length);
        this.forward(length);
        char = this.peek();
        if (char === '\x00') {
          throw new exports.ScannerError('while scanning a quoted scalar', start_mark, 'found unexpected end of stream', this.get_mark());
        }
        if (indexOf.call(C_LB, char) >= 0) {
          line_break = this.scan_line_break();
          breaks = this.scan_flow_scalar_breaks(double, start_mark);
          if (line_break !== '\n') {
            chunks.push(line_break);
          } else if (breaks.length === 0) {
            chunks.push(' ');
          }
          chunks = chunks.concat(breaks);
        } else {
          chunks.push(whitespaces);
        }
        return chunks;
      }

      /*
      See the specification for details.
      */
      scan_flow_scalar_breaks(double, start_mark) {
        var chunks, prefix, ref, ref1, ref2;
        chunks = [];
        while (true) {
          // Instead of checking for indentation, we check for document separators.
          prefix = this.prefix(3);
          if (prefix === '---' || prefix === '...' && (ref = this.peek(3), indexOf.call(C_LB + C_WS + '\x00', ref) >= 0)) {
            throw new exports.ScannerError('while scanning a quoted scalar', start_mark, 'found unexpected document separator', this.get_mark());
          }
          while (ref1 = this.peek(), indexOf.call(C_WS, ref1) >= 0) {
            this.forward();
          }
          if (ref2 = this.peek(), indexOf.call(C_LB, ref2) >= 0) {
            chunks.push(this.scan_line_break());
          } else {
            return chunks;
          }
        }
      }

      /*
      See the specification for details.
      We add an additional restriction for the flow context:
        plain scalars in the flow context cannot contain ',', ':' and '?'.
      We also keep track of the `allow_simple_key` flag here.
      Indentation rules are loosed for the flow context.
      */
      scan_plain() {
        var char, chunks, end_mark, indent, length, ref, ref1, spaces, start_mark;
        chunks = [];
        start_mark = end_mark = this.get_mark();
        indent = this.indent + 1;
        // We allow zero indentation for scalars, but then we need to check for
        // document separators at the beginning of the line.
        // indent = 1 if indent is 0
        spaces = [];
        while (true) {
          length = 0;
          if (this.peek() === '#') {
            break;
          }
          while (true) {
            char = this.peek(length);
            if (indexOf.call(C_LB + C_WS + '\x00', char) >= 0 || (this.flow_level === 0 && char === ':' && (ref = this.peek(length + 1), indexOf.call(C_LB + C_WS + '\x00', ref) >= 0)) || (this.flow_level !== 0 && indexOf.call(',:?[]{}', char) >= 0)) {
              break;
            }
            length++;
          }
          // It's not clear what we should do with ':' in the flow context.
          if (this.flow_level !== 0 && char === ':' && (ref1 = this.peek(length + 1), indexOf.call(C_LB + C_WS + '\x00,[]{}', ref1) < 0)) {
            this.forward(length);
            throw new exports.ScannerError('while scanning a plain scalar', start_mark, 'found unexpected \':\'', this.get_mark(), 'Please check http://pyyaml.org/wiki/YAMLColonInFlowContext');
          }
          if (length === 0) {
            break;
          }
          this.allow_simple_key = false;
          chunks = chunks.concat(spaces);
          chunks.push(this.prefix(length));
          this.forward(length);
          end_mark = this.get_mark();
          spaces = this.scan_plain_spaces(indent, start_mark);
          if ((spaces == null) || spaces.length === 0 || this.peek() === '#' || (this.flow_level === 0 && this.column < indent)) {
            break;
          }
        }
        return new tokens.ScalarToken(chunks.join(''), true, start_mark, end_mark);
      }

      /*
      See the specification for details.
      The specification is really confusing about tabs in plain scalars.
      We just forbid them completely. Do not use tabs in YAML!
      */
      scan_plain_spaces(indent, start_mark) {
        var breaks, char, chunks, length, line_break, prefix, ref, ref1, ref2, ref3, whitespaces;
        chunks = [];
        length = 0;
        while (ref = this.peek(length), indexOf.call(' ', ref) >= 0) {
          length++;
        }
        whitespaces = this.prefix(length);
        this.forward(length);
        char = this.peek();
        if (indexOf.call(C_LB, char) >= 0) {
          line_break = this.scan_line_break();
          this.allow_simple_key = true;
          prefix = this.prefix(3);
          if (prefix === '---' || prefix === '...' && (ref1 = this.peek(3), indexOf.call(C_LB + C_WS + '\x00', ref1) >= 0)) {
            return;
          }
          breaks = [];
          while (ref3 = this.peek(), indexOf.call(C_LB + ' ', ref3) >= 0) {
            if (this.peek() === ' ') {
              this.forward();
            } else {
              breaks.push(this.scan_line_break());
              prefix = this.prefix(3);
              if (prefix === '---' || prefix === '...' && (ref2 = this.peek(3), indexOf.call(C_LB + C_WS + '\x00', ref2) >= 0)) {
                return;
              }
            }
          }
          if (line_break !== '\n') {
            chunks.push(line_break);
          } else if (breaks.length === 0) {
            chunks.push(' ');
          }
          chunks = chunks.concat(breaks);
        } else if (whitespaces) {
          chunks.push(whitespaces);
        }
        return chunks;
      }

      /*
      See the specification for details.
      For some strange reasons, the specification does not allow '_' in tag
      handles. I have allowed it anyway.
      */
      scan_tag_handle(name, start_mark) {
        var char, length, value;
        char = this.peek();
        if (char !== '!') {
          throw new exports.ScannerError(`while scanning a ${name}`, start_mark, `expected '!' but found ${char}`, this.get_mark());
        }
        length = 1;
        char = this.peek(length);
        if (char !== ' ') {
          while (('0' <= char && char <= '9') || ('A' <= char && char <= 'Z') || ('a' <= char && char <= 'z') || indexOf.call('-_', char) >= 0) {
            length++;
            char = this.peek(length);
          }
          if (char !== '!') {
            this.forward(length);
            throw new exports.ScannerError(`while scanning a ${name}`, start_mark, `expected '!' but found ${char}`, this.get_mark());
          }
          length++;
        }
        value = this.prefix(length);
        this.forward(length);
        return value;
      }

      /*
      See the specification for details.
      Note: we do not check if URI is well-formed.
      */
      scan_tag_uri(name, start_mark) {
        var char, chunks, length;
        chunks = [];
        length = 0;
        char = this.peek(length);
        while (('0' <= char && char <= '9') || ('A' <= char && char <= 'Z') || ('a' <= char && char <= 'z') || indexOf.call('-;/?:@&=+$,_.!~*\'()[]%', char) >= 0) {
          if (char === '%') {
            chunks.push(this.prefix(length));
            this.forward(length);
            length = 0;
            chunks.push(this.scan_uri_escapes(name, start_mark));
          } else {
            length++;
          }
          char = this.peek(length);
        }
        if (length !== 0) {
          chunks.push(this.prefix(length));
          this.forward(length);
          length = 0;
        }
        if (chunks.length === 0) {
          throw new exports.ScannerError(`while parsing a ${name}`, start_mark, `expected URI but found ${char}`, this.get_mark());
        }
        return chunks.join('');
      }

      /*
      See the specification for details.
      */
      scan_uri_escapes(name, start_mark) {
        var bytes, i, k, mark;
        bytes = [];
        mark = this.get_mark();
        while (this.peek() === '%') {
          this.forward();
          for (k = i = 0; i <= 2; k = ++i) {
            throw new exports.ScannerError(`while scanning a ${name}`, start_mark, `expected URI escape sequence of 2 hexadecimal numbers but found ${this.peek(k)}`, this.get_mark());
          }
          bytes.push(String.fromCharCode(parseInt(this.prefix(2), 16)));
          this.forward(2);
        }
        return bytes.join('');
      }

      /*
      Transforms:
      '\r\n'      :   '\n'
      '\r'        :   '\n'
      '\n'        :   '\n'
      '\x85'      :   '\n'
      '\u2028'    :   '\u2028'
      '\u2029     :   '\u2029'
      default     :   ''
      */
      scan_line_break() {
        var char;
        char = this.peek();
        if (indexOf.call('\r\n\x85', char) >= 0) {
          if (this.prefix(2) === '\r\n') {
            this.forward(2);
          } else {
            this.forward();
          }
          return '\n';
        } else if (indexOf.call('\u2028\u2029', char) >= 0) {
          this.forward();
          return char;
        }
        return '';
      }

    };

    C_LB = '\r\n\x85\u2028\u2029';

    C_WS = '\t ';

    C_NUMBERS = '0123456789';

    ESCAPE_REPLACEMENTS = {
      '0': '\x00',
      'a': '\x07',
      'b': '\x08',
      't': '\x09',
      '\t': '\x09',
      'n': '\x0A',
      'v': '\x0B',
      'f': '\x0C',
      'r': '\x0D',
      'e': '\x1B',
      ' ': '\x20',
      '"': '"',
      '\\': '\\',
      'N': '\x85',
      '_': '\xA0',
      'L': '\u2028',
      'P': '\u2029'
    };

    ESCAPE_CODES = {
      'x': 2,
      'u': 4,
      'U': 8
    };

    ctor = Scanner.prototype.initialise;

    return Scanner;

  }).call(this);

}).call(this);
