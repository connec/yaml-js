(function() {
  var MarkedYAMLError, events, tokens,
    hasProp = {}.hasOwnProperty;

  events = require('./events');

  ({MarkedYAMLError} = require('./errors'));

  tokens = require('./tokens');

  this.ParserError = class ParserError extends MarkedYAMLError {};

  this.Parser = (function() {
    var DEFAULT_TAGS, ctor;

    class Parser {
      constructor() {
        return ctor.apply(this, arguments);
      }

      initialise() {
        this.current_event = null;
        this.yaml_version = null;
        this.tag_handles = {};
        this.states = [];
        this.marks = [];
        return this.state = 'parse_stream_start';
      }

      /*
      Reset the state attributes.
      */
      dispose() {
        this.states = [];
        return this.state = null;
      }

      /*
      Check the type of the next event.
      */
      check_event(...choices) {
        var choice, i, len;
        if (this.current_event === null) {
          if (this.state != null) {
            this.current_event = this[this.state]();
          }
        }
        if (this.current_event !== null) {
          if (choices.length === 0) {
            return true;
          }
          for (i = 0, len = choices.length; i < len; i++) {
            choice = choices[i];
            if (this.current_event instanceof choice) {
              return true;
            }
          }
        }
        return false;
      }

      /*
      Get the next event.
      */
      peek_event() {
        if (this.current_event === null && (this.state != null)) {
          this.current_event = this[this.state]();
        }
        return this.current_event;
      }

      /*
      Get the event and proceed further.
      */
      get_event() {
        var event;
        if (this.current_event === null && (this.state != null)) {
          this.current_event = this[this.state]();
        }
        event = this.current_event;
        this.current_event = null;
        return event;
      }

      // stream ::= STREAM-START implicit_document? explicit_document* STREAM-END
      // implicit_document ::= block_node DOCUMENT-END*
      // explicit_document ::= DIRECTIVE* DOCUMENT-START block_node? DOCUMENT-END*
      /*
      Parse the stream start.
      */
      parse_stream_start() {
        var event, token;
        token = this.get_token();
        event = new events.StreamStartEvent(token.start_mark, token.end_mark);
        // Prepare the next state,
        this.state = 'parse_implicit_document_start';
        return event;
      }

      /*
      Parse an implicit document.
      */
      parse_implicit_document_start() {
        var end_mark, event, start_mark, token;
        if (!this.check_token(tokens.DirectiveToken, tokens.DocumentStartToken, tokens.StreamEndToken)) {
          this.tag_handles = DEFAULT_TAGS;
          token = this.peek_token();
          start_mark = end_mark = token.start_mark;
          event = new events.DocumentStartEvent(start_mark, end_mark, false);
          // Prepare the next state
          this.states.push('parse_document_end');
          this.state = 'parse_block_node';
          return event;
        } else {
          return this.parse_document_start();
        }
      }

      /*
      Parse an explicit document.
      */
      parse_document_start() {
        var end_mark, event, start_mark, tags, token, version;
        while (this.check_token(tokens.DocumentEndToken)) {
          // Parse any extra document end indicators
          this.get_token();
        }
        if (!this.check_token(tokens.StreamEndToken)) {
          start_mark = this.peek_token().start_mark;
          [version, tags] = this.process_directives();
          if (!this.check_token(tokens.DocumentStartToken)) {
            throw new exports.ParserError(`expected '<document start>', but found ${(this.peek_token().id)}`, this.peek_token().start_mark);
          }
          token = this.get_token();
          end_mark = token.end_mark;
          event = new events.DocumentStartEvent(start_mark, end_mark, true, version, tags);
          this.states.push('parse_document_end');
          this.state = 'parse_document_content';
        } else {
          // Parse the end of the stream.
          token = this.get_token();
          event = new events.StreamEndEvent(token.start_mark, token.end_mark);
          if (this.states.length !== 0) {
            throw new Error('assertion error, states should be empty');
          }
          if (this.marks.length !== 0) {
            throw new Error('assertion error, marks should be empty');
          }
          this.state = null;
        }
        return event;
      }

      /*
      Parse the document end.
      */
      parse_document_end() {
        var end_mark, event, explicit, start_mark, token;
        token = this.peek_token();
        start_mark = end_mark = token.start_mark;
        explicit = false;
        if (this.check_token(tokens.DocumentEndToken)) {
          token = this.get_token();
          end_mark = token.end_mark;
          explicit = true;
        }
        event = new events.DocumentEndEvent(start_mark, end_mark, explicit);
        // Prepare next state.
        this.state = 'parse_document_start';
        return event;
      }

      parse_document_content() {
        var event;
        if (this.check_token(tokens.DirectiveToken, tokens.DocumentStartToken, tokens.DocumentEndToken, tokens.StreamEndToken)) {
          event = this.process_empty_scalar(this.peek_token().start_mark);
          this.state = this.states.pop();
          return event;
        } else {
          return this.parse_block_node();
        }
      }

      process_directives() {
        var handle, major, minor, prefix, ref, tag_handles_copy, token, value;
        this.yaml_version = null;
        this.tag_handles = {};
        while (this.check_token(tokens.DirectiveToken)) {
          token = this.get_token();
          if (token.name === 'YAML') {
            if (this.yaml_version !== null) {
              throw new exports.ParserError(null, null, 'found duplicate YAML directive', token.start_mark);
            }
            [major, minor] = token.value;
            if (major !== 1) {
              throw new exports.ParserError(null, null, 'found incompatible YAML document (version 1.* is required)', token.start_mark);
            }
            this.yaml_version = token.value;
          } else if (token.name === 'TAG') {
            [handle, prefix] = token.value;
            if (handle in this.tag_handles) {
              throw new exports.ParserError(null, null, `duplicate tag handle ${handle}`, token.start_mark);
            }
            this.tag_handles[handle] = prefix;
          }
        }
        tag_handles_copy = null;
        ref = this.tag_handles;
        for (handle in ref) {
          if (!hasProp.call(ref, handle)) continue;
          prefix = ref[handle];
          if (tag_handles_copy == null) {
            tag_handles_copy = {};
          }
          tag_handles_copy[handle] = prefix;
        }
        value = [this.yaml_version, tag_handles_copy];
        for (handle in DEFAULT_TAGS) {
          if (!hasProp.call(DEFAULT_TAGS, handle)) continue;
          prefix = DEFAULT_TAGS[handle];
          if (!(prefix in this.tag_handles)) {
            this.tag_handles[handle] = prefix;
          }
        }
        return value;
      }

      // block_node_or_indentless_sequence ::= ALIAS
      //   | properties (block_content | indentless_sequence)?
      //   | block_content
      //   | indentless_block_sequence
      // block_node ::= ALIAS
      //   | properties block_content?
      //   | block_content
      // flow_node ::= ALIAS
      //   | properties flow_content?
      //   | flow_content
      // properties ::= TAG ANCHOR? | ANCHOR TAG?
      // block_content ::= block_collection | flow_collection | SCALAR
      // flow_content ::= flow_collection | SCALAR
      // block_collection ::= block_sequence | block_mapping
      // flow_collection ::= flow_sequence | flow_mapping
      parse_block_node() {
        return this.parse_node(true);
      }

      parse_flow_node() {
        return this.parse_node();
      }

      parse_block_node_or_indentless_sequence() {
        return this.parse_node(true, true);
      }

      parse_node(block = false, indentless_sequence = false) {
        var anchor, end_mark, event, handle, implicit, node, start_mark, suffix, tag, tag_mark, token;
        if (this.check_token(tokens.AliasToken)) {
          token = this.get_token();
          event = new events.AliasEvent(token.value, token.start_mark, token.end_mark);
          this.state = this.states.pop();
        } else {
          anchor = null;
          tag = null;
          start_mark = end_mark = tag_mark = null;
          if (this.check_token(tokens.AnchorToken)) {
            token = this.get_token();
            start_mark = token.start_mark;
            end_mark = token.end_mark;
            anchor = token.value;
            if (this.check_token(tokens.TagToken)) {
              token = this.get_token();
              tag_mark = token.start_mark;
              end_mark = token.end_mark;
              tag = token.value;
            }
          } else if (this.check_token(tokens.TagToken)) {
            token = this.get_token();
            start_mark = tag_mark = token.start_mark;
            end_mark = token.end_mark;
            tag = token.value;
            if (this.check_token(tokens.AnchorToken)) {
              token = this.get_token();
              end_mark = token.end_mark;
              anchor = token.value;
            }
          }
          if (tag !== null) {
            [handle, suffix] = tag;
            if (handle !== null) {
              if (!(handle in this.tag_handles)) {
                throw new exports.ParserError('while parsing a node', start_mark, `found undefined tag handle ${handle}`, tag_mark);
              }
              tag = this.tag_handles[handle] + suffix;
            } else {
              tag = suffix;
            }
          }
          if (start_mark === null) {
            start_mark = end_mark = this.peek_token().start_mark;
          }
          event = null;
          implicit = tag === null || tag === '!';
          if (indentless_sequence && this.check_token(tokens.BlockEntryToken)) {
            end_mark = this.peek_token().end_mark;
            event = new events.SequenceStartEvent(anchor, tag, implicit, start_mark, end_mark);
            this.state = 'parse_indentless_sequence_entry';
          } else {
            if (this.check_token(tokens.ScalarToken)) {
              token = this.get_token();
              end_mark = token.end_mark;
              if ((token.plain && tag === null) || tag === '!') {
                implicit = [true, false];
              } else if (tag === null) {
                implicit = [false, true];
              } else {
                implicit = [false, false];
              }
              event = new events.ScalarEvent(anchor, tag, implicit, token.value, start_mark, end_mark, token.style);
              this.state = this.states.pop();
            } else if (this.check_token(tokens.FlowSequenceStartToken)) {
              end_mark = this.peek_token().end_mark;
              event = new events.SequenceStartEvent(anchor, tag, implicit, start_mark, end_mark, true);
              this.state = 'parse_flow_sequence_first_entry';
            } else if (this.check_token(tokens.FlowMappingStartToken)) {
              end_mark = this.peek_token().end_mark;
              event = new events.MappingStartEvent(anchor, tag, implicit, start_mark, end_mark, true);
              this.state = 'parse_flow_mapping_first_key';
            } else if (block && this.check_token(tokens.BlockSequenceStartToken)) {
              end_mark = this.peek_token().end_mark;
              event = new events.SequenceStartEvent(anchor, tag, implicit, start_mark, end_mark, false);
              this.state = 'parse_block_sequence_first_entry';
            } else if (block && this.check_token(tokens.BlockMappingStartToken)) {
              end_mark = this.peek_token().end_mark;
              event = new events.MappingStartEvent(anchor, tag, implicit, start_mark, end_mark, false);
              this.state = 'parse_block_mapping_first_key';
            } else if (anchor !== null || tag !== null) {
              // Empty scalars are allowed even if a tag or an anchor is specified.
              event = new events.ScalarEvent(anchor, tag, [implicit, false], '', start_mark, end_mark);
              this.state = this.states.pop();
            } else {
              if (block) {
                node = 'block';
              } else {
                node = 'flow';
              }
              token = this.peek_token();
              throw new exports.ParserError(`while parsing a ${node} node`, start_mark, `expected the node content, but found ${token.id}`, token.start_mark);
            }
          }
        }
        return event;
      }

      // block_sequence ::= BLOCK-SEQUENCE-START (BLOCK-ENTRY block_node?)*
      //   BLOCK-END
      parse_block_sequence_first_entry() {
        var token;
        token = this.get_token();
        this.marks.push(token.start_mark);
        return this.parse_block_sequence_entry();
      }

      parse_block_sequence_entry() {
        var event, token;
        if (this.check_token(tokens.BlockEntryToken)) {
          token = this.get_token();
          if (!this.check_token(tokens.BlockEntryToken, tokens.BlockEndToken)) {
            this.states.push('parse_block_sequence_entry');
            return this.parse_block_node();
          } else {
            this.state = 'parse_block_sequence_entry';
            return this.process_empty_scalar(token.end_mark);
          }
        }
        if (!this.check_token(tokens.BlockEndToken)) {
          token = this.peek_token();
          throw new exports.ParserError('while parsing a block collection', this.marks.slice(-1)[0], `expected <block end>, but found ${token.id}`, token.start_mark);
        }
        token = this.get_token();
        event = new events.SequenceEndEvent(token.start_mark, token.end_mark);
        this.state = this.states.pop();
        this.marks.pop();
        return event;
      }

      // indentless_sequence ::= (BLOCK-ENTRY block_node?)+
      parse_indentless_sequence_entry() {
        var event, token;
        if (this.check_token(tokens.BlockEntryToken)) {
          token = this.get_token();
          if (!this.check_token(tokens.BlockEntryToken, tokens.KeyToken, tokens.ValueToken, tokens.BlockEndToken)) {
            this.states.push('parse_indentless_sequence_entry');
            return this.parse_block_node();
          } else {
            this.state = 'parse_indentless_sequence_entry';
            return this.process_empty_scalar(token.end_mark);
          }
        }
        token = this.peek_token();
        event = new events.SequenceEndEvent(token.start_mark, token.start_mark);
        this.state = this.states.pop();
        return event;
      }

      // block_mapping ::= BLOCK-MAPPING-START
      //   ((KEY block_node_or_indentless_sequence?)?
      //   (VALUE block_node_or_indentless_sequence?)?)* BLOCK-END
      parse_block_mapping_first_key() {
        var token;
        token = this.get_token();
        this.marks.push(token.start_mark);
        return this.parse_block_mapping_key();
      }

      parse_block_mapping_key() {
        var event, token;
        if (this.check_token(tokens.KeyToken)) {
          token = this.get_token();
          if (!this.check_token(tokens.KeyToken, tokens.ValueToken, tokens.BlockEndToken)) {
            this.states.push('parse_block_mapping_value');
            return this.parse_block_node_or_indentless_sequence();
          } else {
            this.state = 'parse_block_mapping_value';
            return this.process_empty_scalar(token.end_mark);
          }
        }
        if (!this.check_token(tokens.BlockEndToken)) {
          token = this.peek_token();
          throw new exports.ParserError('while parsing a block mapping', this.marks.slice(-1)[0], `expected <block end>, but found ${token.id}`, token.start_mark);
        }
        token = this.get_token();
        event = new events.MappingEndEvent(token.start_mark, token.end_mark);
        this.state = this.states.pop();
        this.marks.pop();
        return event;
      }

      parse_block_mapping_value() {
        var token;
        if (this.check_token(tokens.ValueToken)) {
          token = this.get_token();
          if (!this.check_token(tokens.KeyToken, tokens.ValueToken, tokens.BlockEndToken)) {
            this.states.push('parse_block_mapping_key');
            return this.parse_block_node_or_indentless_sequence();
          } else {
            this.state = 'parse_block_mapping_key';
            return this.process_empty_scalar(token.end_mark);
          }
        } else {
          this.state = 'parse_block_mapping_key';
          token = this.peek_token();
          return this.process_empty_scalar(token.start_mark);
        }
      }

      // flow_sequence ::= FLOW-SEQUENCE-START
      //   (flow_sequence_entry FLOW-ENTRY)* flow_sequence_entry? FLOW-SEQUENCE-END
      // flow_sequence_entry ::= flow_node | KEY flow_node? (VALUE flow_node?)?

      // Note that while production rules for both flow_sequence_entry and
      // flow_mapping_entry are equal, their interpretations are different.  For
      // `flow_sequence_entry`, the part `KEY flow_node? (VALUE flow_node?)?`
      // generate an inline mapping (set syntax).
      parse_flow_sequence_first_entry() {
        var token;
        token = this.get_token();
        this.marks.push(token.start_mark);
        return this.parse_flow_sequence_entry(true);
      }

      parse_flow_sequence_entry(first = false) {
        var event, token;
        if (!this.check_token(tokens.FlowSequenceEndToken)) {
          if (!first) {
            if (this.check_token(tokens.FlowEntryToken)) {
              this.get_token();
            } else {
              token = this.peek_token();
              throw new exports.ParserError('while parsing a flow sequence', this.marks.slice(-1)[0], `expected ',' or ']', but got ${token.id}`, token.start_mark);
            }
          }
          if (this.check_token(tokens.KeyToken)) {
            token = this.peek_token();
            event = new events.MappingStartEvent(null, null, true, token.start_mark, token.end_mark, true);
            this.state = 'parse_flow_sequence_entry_mapping_key';
            return event;
          } else if (!this.check_token(tokens.FlowSequenceEndToken)) {
            this.states.push('parse_flow_sequence_entry');
            return this.parse_flow_node();
          }
        }
        token = this.get_token();
        event = new events.SequenceEndEvent(token.start_mark, token.end_mark);
        this.state = this.states.pop();
        this.marks.pop();
        return event;
      }

      parse_flow_sequence_entry_mapping_key() {
        var token;
        token = this.get_token();
        if (!this.check_token(tokens.ValueToken, tokens.FlowEntryToken, tokens.FlowSequenceEndToken)) {
          this.states.push('parse_flow_sequence_entry_mapping_value');
          return this.parse_flow_node();
        } else {
          this.state = 'parse_flow_sequence_entry_mapping_value';
          return this.process_empty_scalar(token.end_mark);
        }
      }

      parse_flow_sequence_entry_mapping_value() {
        var token;
        if (this.check_token(tokens.ValueToken)) {
          token = this.get_token();
          if (!this.check_token(tokens.FlowEntryToken, tokens.FlowSequenceEndToken)) {
            this.states.push('parse_flow_sequence_entry_mapping_end');
            return this.parse_flow_node();
          } else {
            this.state = 'parse_flow_sequence_entry_mapping_end';
            return this.process_empty_scalar(token.end_mark);
          }
        } else {
          this.state = 'parse_flow_sequence_entry_mapping_end';
          token = this.peek_token();
          return this.process_empty_scalar(token.start_mark);
        }
      }

      parse_flow_sequence_entry_mapping_end() {
        var token;
        this.state = 'parse_flow_sequence_entry';
        token = this.peek_token();
        return new events.MappingEndEvent(token.start_mark, token.start_mark);
      }

      // flow_mapping ::= FLOW-MAPPING-START (flow_mapping_entry FLOW-ENTRY)*
      //   flow_mapping_entry? FLOW-MAPPING-END
      // flow_mapping_entry ::= flow_node | KEY flow_node? (VALUE flow_node?)?
      parse_flow_mapping_first_key() {
        var token;
        token = this.get_token();
        this.marks.push(token.start_mark);
        return this.parse_flow_mapping_key(true);
      }

      parse_flow_mapping_key(first = false) {
        var event, token;
        if (!this.check_token(tokens.FlowMappingEndToken)) {
          if (!first) {
            if (this.check_token(tokens.FlowEntryToken)) {
              this.get_token();
            } else {
              token = this.peek_token();
              throw new exports.ParserError('while parsing a flow mapping', this.marks.slice(-1)[0], `expected ',' or '}', but got ${token.id}`, token.start_mark);
            }
          }
          if (this.check_token(tokens.KeyToken)) {
            token = this.get_token();
            if (!this.check_token(tokens.ValueToken, tokens.FlowEntryToken, tokens.FlowMappingEndToken)) {
              this.states.push('parse_flow_mapping_value');
              return this.parse_flow_node();
            } else {
              this.state = 'parse_flow_mapping_value';
              return this.process_empty_scalar(token.end_mark);
            }
          } else if (!this.check_token(tokens.FlowMappingEndToken)) {
            this.states.push('parse_flow_mapping_empty_value');
            return this.parse_flow_node();
          }
        }
        token = this.get_token();
        event = new events.MappingEndEvent(token.start_mark, token.end_mark);
        this.state = this.states.pop();
        this.marks.pop();
        return event;
      }

      parse_flow_mapping_value() {
        var token;
        if (this.check_token(tokens.ValueToken)) {
          token = this.get_token();
          if (!this.check_token(tokens.FlowEntryToken, tokens.FlowMappingEndToken)) {
            this.states.push('parse_flow_mapping_key');
            return this.parse_flow_node();
          } else {
            this.state = 'parse_flow_mapping_key';
            return this.process_empty_scalar(token.end_mark);
          }
        } else {
          this.state = 'parse_flow_mapping_key';
          token = this.peek_token();
          return this.process_empty_scalar(token.start_mark);
        }
      }

      parse_flow_mapping_empty_value() {
        this.state = 'parse_flow_mapping_key';
        return this.process_empty_scalar(this.peek_token().start_mark);
      }

      process_empty_scalar(mark) {
        return new events.ScalarEvent(null, null, [true, false], '', mark, mark);
      }

    };

    DEFAULT_TAGS = {
      '!': '!',
      '!!': 'tag:yaml.org,2002:'
    };

    ctor = Parser.prototype.initialise;

    return Parser;

  }).call(this);

}).call(this);
