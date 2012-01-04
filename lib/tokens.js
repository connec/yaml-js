(function() {
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  module.exports = (function() {

    function exports() {}

    exports.Token = (function() {

      function Token(start_mark, end_mark) {
        this.start_mark = start_mark;
        this.end_mark = end_mark;
      }

      return Token;

    })();

    exports.DirectiveToken = (function() {

      __extends(DirectiveToken, exports.Token);

      DirectiveToken.prototype.id = '<directive>';

      function DirectiveToken(name, value, start_mark, end_mark) {
        this.name = name;
        this.value = value;
        this.start_mark = start_mark;
        this.end_mark = end_mark;
      }

      return DirectiveToken;

    })();

    exports.DocumentStartToken = (function() {

      __extends(DocumentStartToken, exports.Token);

      function DocumentStartToken() {
        DocumentStartToken.__super__.constructor.apply(this, arguments);
      }

      DocumentStartToken.prototype.id = '<document start>';

      return DocumentStartToken;

    })();

    exports.DocumentEndToken = (function() {

      __extends(DocumentEndToken, exports.Token);

      function DocumentEndToken() {
        DocumentEndToken.__super__.constructor.apply(this, arguments);
      }

      DocumentEndToken.prototype.id = '<document end>';

      return DocumentEndToken;

    })();

    exports.StreamStartToken = (function() {

      __extends(StreamStartToken, exports.Token);

      StreamStartToken.prototype.id = '<stream start>';

      function StreamStartToken(start_mark, end_mark, encoding) {
        this.start_mark = start_mark;
        this.end_mark = end_mark;
        this.encoding = encoding;
      }

      return StreamStartToken;

    })();

    exports.StreamEndToken = (function() {

      __extends(StreamEndToken, exports.Token);

      function StreamEndToken() {
        StreamEndToken.__super__.constructor.apply(this, arguments);
      }

      StreamEndToken.prototype.id = '<stream end>';

      return StreamEndToken;

    })();

    exports.BlockSequenceStartToken = (function() {

      __extends(BlockSequenceStartToken, exports.Token);

      function BlockSequenceStartToken() {
        BlockSequenceStartToken.__super__.constructor.apply(this, arguments);
      }

      BlockSequenceStartToken.prototype.id = '<block sequence start>';

      return BlockSequenceStartToken;

    })();

    exports.BlockMappingStartToken = (function() {

      __extends(BlockMappingStartToken, exports.Token);

      function BlockMappingStartToken() {
        BlockMappingStartToken.__super__.constructor.apply(this, arguments);
      }

      BlockMappingStartToken.prototype.id = '<block mapping end>';

      return BlockMappingStartToken;

    })();

    exports.BlockEndToken = (function() {

      __extends(BlockEndToken, exports.Token);

      function BlockEndToken() {
        BlockEndToken.__super__.constructor.apply(this, arguments);
      }

      BlockEndToken.prototype.id = '<block end>';

      return BlockEndToken;

    })();

    exports.FlowSequenceStartToken = (function() {

      __extends(FlowSequenceStartToken, exports.Token);

      function FlowSequenceStartToken() {
        FlowSequenceStartToken.__super__.constructor.apply(this, arguments);
      }

      FlowSequenceStartToken.prototype.id = '[';

      return FlowSequenceStartToken;

    })();

    exports.FlowMappingStartToken = (function() {

      __extends(FlowMappingStartToken, exports.Token);

      function FlowMappingStartToken() {
        FlowMappingStartToken.__super__.constructor.apply(this, arguments);
      }

      FlowMappingStartToken.prototype.id = '{';

      return FlowMappingStartToken;

    })();

    exports.FlowSequenceEndToken = (function() {

      __extends(FlowSequenceEndToken, exports.Token);

      function FlowSequenceEndToken() {
        FlowSequenceEndToken.__super__.constructor.apply(this, arguments);
      }

      FlowSequenceEndToken.prototype.id = ']';

      return FlowSequenceEndToken;

    })();

    exports.FlowMappingEndToken = (function() {

      __extends(FlowMappingEndToken, exports.Token);

      function FlowMappingEndToken() {
        FlowMappingEndToken.__super__.constructor.apply(this, arguments);
      }

      FlowMappingEndToken.prototype.id = '}';

      return FlowMappingEndToken;

    })();

    exports.KeyToken = (function() {

      __extends(KeyToken, exports.Token);

      function KeyToken() {
        KeyToken.__super__.constructor.apply(this, arguments);
      }

      KeyToken.prototype.id = '?';

      return KeyToken;

    })();

    exports.ValueToken = (function() {

      __extends(ValueToken, exports.Token);

      function ValueToken() {
        ValueToken.__super__.constructor.apply(this, arguments);
      }

      ValueToken.prototype.id = ':';

      return ValueToken;

    })();

    exports.BlockEntryToken = (function() {

      __extends(BlockEntryToken, exports.Token);

      function BlockEntryToken() {
        BlockEntryToken.__super__.constructor.apply(this, arguments);
      }

      BlockEntryToken.prototype.id = '-';

      return BlockEntryToken;

    })();

    exports.FlowEntryToken = (function() {

      __extends(FlowEntryToken, exports.Token);

      function FlowEntryToken() {
        FlowEntryToken.__super__.constructor.apply(this, arguments);
      }

      FlowEntryToken.prototype.id = ',';

      return FlowEntryToken;

    })();

    exports.AliasToken = (function() {

      __extends(AliasToken, exports.Token);

      AliasToken.prototype.id = '<alias>';

      function AliasToken(value, start_mark, end_mark) {
        this.value = value;
        this.start_mark = start_mark;
        this.end_mark = end_mark;
      }

      return AliasToken;

    })();

    exports.AnchorToken = (function() {

      __extends(AnchorToken, exports.Token);

      AnchorToken.prototype.id = '<anchor>';

      function AnchorToken(value, start_mark, end_mark) {
        this.value = value;
        this.start_mark = start_mark;
        this.end_mark = end_mark;
      }

      return AnchorToken;

    })();

    exports.TagToken = (function() {

      __extends(TagToken, exports.Token);

      TagToken.prototype.id = '<tag>';

      function TagToken(value, start_mark, end_mark) {
        this.value = value;
        this.start_mark = start_mark;
        this.end_mark = end_mark;
      }

      return TagToken;

    })();

    exports.ScalarToken = (function() {

      __extends(ScalarToken, exports.Token);

      ScalarToken.prototype.id = '<scalar>';

      function ScalarToken(value, plain, start_mark, end_mark, style) {
        this.value = value;
        this.plain = plain;
        this.start_mark = start_mark;
        this.end_mark = end_mark;
        this.style = style;
      }

      return ScalarToken;

    })();

    return exports;

  })();

}).call(this);
