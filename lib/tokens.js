(function() {
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  this.Token = (function() {

    function Token(start_mark, end_mark) {
      this.start_mark = start_mark;
      this.end_mark = end_mark;
    }

    return Token;

  })();

  this.DirectiveToken = (function() {

    __extends(DirectiveToken, this.Token);

    DirectiveToken.prototype.id = '<directive>';

    function DirectiveToken(name, value, start_mark, end_mark) {
      this.name = name;
      this.value = value;
      this.start_mark = start_mark;
      this.end_mark = end_mark;
    }

    return DirectiveToken;

  }).call(this);

  this.DocumentStartToken = (function() {

    __extends(DocumentStartToken, this.Token);

    function DocumentStartToken() {
      DocumentStartToken.__super__.constructor.apply(this, arguments);
    }

    DocumentStartToken.prototype.id = '<document start>';

    return DocumentStartToken;

  }).call(this);

  this.DocumentEndToken = (function() {

    __extends(DocumentEndToken, this.Token);

    function DocumentEndToken() {
      DocumentEndToken.__super__.constructor.apply(this, arguments);
    }

    DocumentEndToken.prototype.id = '<document end>';

    return DocumentEndToken;

  }).call(this);

  this.StreamStartToken = (function() {

    __extends(StreamStartToken, this.Token);

    StreamStartToken.prototype.id = '<stream start>';

    function StreamStartToken(start_mark, end_mark, encoding) {
      this.start_mark = start_mark;
      this.end_mark = end_mark;
      this.encoding = encoding;
    }

    return StreamStartToken;

  }).call(this);

  this.StreamEndToken = (function() {

    __extends(StreamEndToken, this.Token);

    function StreamEndToken() {
      StreamEndToken.__super__.constructor.apply(this, arguments);
    }

    StreamEndToken.prototype.id = '<stream end>';

    return StreamEndToken;

  }).call(this);

  this.BlockSequenceStartToken = (function() {

    __extends(BlockSequenceStartToken, this.Token);

    function BlockSequenceStartToken() {
      BlockSequenceStartToken.__super__.constructor.apply(this, arguments);
    }

    BlockSequenceStartToken.prototype.id = '<block sequence start>';

    return BlockSequenceStartToken;

  }).call(this);

  this.BlockMappingStartToken = (function() {

    __extends(BlockMappingStartToken, this.Token);

    function BlockMappingStartToken() {
      BlockMappingStartToken.__super__.constructor.apply(this, arguments);
    }

    BlockMappingStartToken.prototype.id = '<block mapping end>';

    return BlockMappingStartToken;

  }).call(this);

  this.BlockEndToken = (function() {

    __extends(BlockEndToken, this.Token);

    function BlockEndToken() {
      BlockEndToken.__super__.constructor.apply(this, arguments);
    }

    BlockEndToken.prototype.id = '<block end>';

    return BlockEndToken;

  }).call(this);

  this.FlowSequenceStartToken = (function() {

    __extends(FlowSequenceStartToken, this.Token);

    function FlowSequenceStartToken() {
      FlowSequenceStartToken.__super__.constructor.apply(this, arguments);
    }

    FlowSequenceStartToken.prototype.id = '[';

    return FlowSequenceStartToken;

  }).call(this);

  this.FlowMappingStartToken = (function() {

    __extends(FlowMappingStartToken, this.Token);

    function FlowMappingStartToken() {
      FlowMappingStartToken.__super__.constructor.apply(this, arguments);
    }

    FlowMappingStartToken.prototype.id = '{';

    return FlowMappingStartToken;

  }).call(this);

  this.FlowSequenceEndToken = (function() {

    __extends(FlowSequenceEndToken, this.Token);

    function FlowSequenceEndToken() {
      FlowSequenceEndToken.__super__.constructor.apply(this, arguments);
    }

    FlowSequenceEndToken.prototype.id = ']';

    return FlowSequenceEndToken;

  }).call(this);

  this.FlowMappingEndToken = (function() {

    __extends(FlowMappingEndToken, this.Token);

    function FlowMappingEndToken() {
      FlowMappingEndToken.__super__.constructor.apply(this, arguments);
    }

    FlowMappingEndToken.prototype.id = '}';

    return FlowMappingEndToken;

  }).call(this);

  this.KeyToken = (function() {

    __extends(KeyToken, this.Token);

    function KeyToken() {
      KeyToken.__super__.constructor.apply(this, arguments);
    }

    KeyToken.prototype.id = '?';

    return KeyToken;

  }).call(this);

  this.ValueToken = (function() {

    __extends(ValueToken, this.Token);

    function ValueToken() {
      ValueToken.__super__.constructor.apply(this, arguments);
    }

    ValueToken.prototype.id = ':';

    return ValueToken;

  }).call(this);

  this.BlockEntryToken = (function() {

    __extends(BlockEntryToken, this.Token);

    function BlockEntryToken() {
      BlockEntryToken.__super__.constructor.apply(this, arguments);
    }

    BlockEntryToken.prototype.id = '-';

    return BlockEntryToken;

  }).call(this);

  this.FlowEntryToken = (function() {

    __extends(FlowEntryToken, this.Token);

    function FlowEntryToken() {
      FlowEntryToken.__super__.constructor.apply(this, arguments);
    }

    FlowEntryToken.prototype.id = ',';

    return FlowEntryToken;

  }).call(this);

  this.AliasToken = (function() {

    __extends(AliasToken, this.Token);

    AliasToken.prototype.id = '<alias>';

    function AliasToken(value, start_mark, end_mark) {
      this.value = value;
      this.start_mark = start_mark;
      this.end_mark = end_mark;
    }

    return AliasToken;

  }).call(this);

  this.AnchorToken = (function() {

    __extends(AnchorToken, this.Token);

    AnchorToken.prototype.id = '<anchor>';

    function AnchorToken(value, start_mark, end_mark) {
      this.value = value;
      this.start_mark = start_mark;
      this.end_mark = end_mark;
    }

    return AnchorToken;

  }).call(this);

  this.TagToken = (function() {

    __extends(TagToken, this.Token);

    TagToken.prototype.id = '<tag>';

    function TagToken(value, start_mark, end_mark) {
      this.value = value;
      this.start_mark = start_mark;
      this.end_mark = end_mark;
    }

    return TagToken;

  }).call(this);

  this.ScalarToken = (function() {

    __extends(ScalarToken, this.Token);

    ScalarToken.prototype.id = '<scalar>';

    function ScalarToken(value, plain, start_mark, end_mark, style) {
      this.value = value;
      this.plain = plain;
      this.start_mark = start_mark;
      this.end_mark = end_mark;
      this.style = style;
    }

    return ScalarToken;

  }).call(this);

}).call(this);
