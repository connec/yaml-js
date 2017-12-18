(function() {
  this.Token = class Token {
    constructor(start_mark1, end_mark1) {
      this.start_mark = start_mark1;
      this.end_mark = end_mark1;
    }

  };

  this.DirectiveToken = (function() {
    class DirectiveToken extends this.Token {
      constructor(name, value, start_mark, end_mark) {
        super(start_mark, end_mark);
        this.name = name;
        this.value = value;
      }

    };

    DirectiveToken.prototype.id = '<directive>';

    return DirectiveToken;

  }).call(this);

  this.DocumentStartToken = (function() {
    class DocumentStartToken extends this.Token {};

    DocumentStartToken.prototype.id = '<document start>';

    return DocumentStartToken;

  }).call(this);

  this.DocumentEndToken = (function() {
    class DocumentEndToken extends this.Token {};

    DocumentEndToken.prototype.id = '<document end>';

    return DocumentEndToken;

  }).call(this);

  this.StreamStartToken = (function() {
    class StreamStartToken extends this.Token {
      constructor(start_mark, end_mark, encoding) {
        super(start_mark, end_mark);
        this.encoding = encoding;
      }

    };

    StreamStartToken.prototype.id = '<stream start>';

    return StreamStartToken;

  }).call(this);

  this.StreamEndToken = (function() {
    class StreamEndToken extends this.Token {};

    StreamEndToken.prototype.id = '<stream end>';

    return StreamEndToken;

  }).call(this);

  this.BlockSequenceStartToken = (function() {
    class BlockSequenceStartToken extends this.Token {};

    BlockSequenceStartToken.prototype.id = '<block sequence start>';

    return BlockSequenceStartToken;

  }).call(this);

  this.BlockMappingStartToken = (function() {
    class BlockMappingStartToken extends this.Token {};

    BlockMappingStartToken.prototype.id = '<block mapping end>';

    return BlockMappingStartToken;

  }).call(this);

  this.BlockEndToken = (function() {
    class BlockEndToken extends this.Token {};

    BlockEndToken.prototype.id = '<block end>';

    return BlockEndToken;

  }).call(this);

  this.FlowSequenceStartToken = (function() {
    class FlowSequenceStartToken extends this.Token {};

    FlowSequenceStartToken.prototype.id = '[';

    return FlowSequenceStartToken;

  }).call(this);

  this.FlowMappingStartToken = (function() {
    class FlowMappingStartToken extends this.Token {};

    FlowMappingStartToken.prototype.id = '{';

    return FlowMappingStartToken;

  }).call(this);

  this.FlowSequenceEndToken = (function() {
    class FlowSequenceEndToken extends this.Token {};

    FlowSequenceEndToken.prototype.id = ']';

    return FlowSequenceEndToken;

  }).call(this);

  this.FlowMappingEndToken = (function() {
    class FlowMappingEndToken extends this.Token {};

    FlowMappingEndToken.prototype.id = '}';

    return FlowMappingEndToken;

  }).call(this);

  this.KeyToken = (function() {
    class KeyToken extends this.Token {};

    KeyToken.prototype.id = '?';

    return KeyToken;

  }).call(this);

  this.ValueToken = (function() {
    class ValueToken extends this.Token {};

    ValueToken.prototype.id = ':';

    return ValueToken;

  }).call(this);

  this.BlockEntryToken = (function() {
    class BlockEntryToken extends this.Token {};

    BlockEntryToken.prototype.id = '-';

    return BlockEntryToken;

  }).call(this);

  this.FlowEntryToken = (function() {
    class FlowEntryToken extends this.Token {};

    FlowEntryToken.prototype.id = ',';

    return FlowEntryToken;

  }).call(this);

  this.AliasToken = (function() {
    class AliasToken extends this.Token {
      constructor(value, start_mark, end_mark) {
        super(start_mark, end_mark);
        this.value = value;
      }

    };

    AliasToken.prototype.id = '<alias>';

    return AliasToken;

  }).call(this);

  this.AnchorToken = (function() {
    class AnchorToken extends this.Token {
      constructor(value, start_mark, end_mark) {
        super(start_mark, end_mark);
        this.value = value;
      }

    };

    AnchorToken.prototype.id = '<anchor>';

    return AnchorToken;

  }).call(this);

  this.TagToken = (function() {
    class TagToken extends this.Token {
      constructor(value, start_mark, end_mark) {
        super(start_mark, end_mark);
        this.value = value;
      }

    };

    TagToken.prototype.id = '<tag>';

    return TagToken;

  }).call(this);

  this.ScalarToken = (function() {
    class ScalarToken extends this.Token {
      constructor(value, plain, start_mark, end_mark, style) {
        super(start_mark, end_mark);
        this.value = value;
        this.plain = plain;
        this.style = style;
      }

    };

    ScalarToken.prototype.id = '<scalar>';

    return ScalarToken;

  }).call(this);

}).call(this);
