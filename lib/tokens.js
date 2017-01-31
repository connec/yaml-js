(function() {
  this.Token = class Token {
    constructor(start_mark1, end_mark1) {
      this.start_mark = start_mark1;
      this.end_mark = end_mark1;
    }

  };

  this.DirectiveToken = (function(superClass) {
    class DirectiveToken extends superClass {
      constructor(name, value, start_mark, end_mark) {
        super(start_mark, end_mark);
        this.name = name;
        this.value = value;
      }

    };

    DirectiveToken.__super__ = superClass.prototype;

    DirectiveToken.prototype.id = '<directive>';

    return DirectiveToken;

  })(this.Token);

  this.DocumentStartToken = (function(superClass) {
    class DocumentStartToken extends superClass {};

    DocumentStartToken.__super__ = superClass.prototype;

    DocumentStartToken.prototype.id = '<document start>';

    return DocumentStartToken;

  })(this.Token);

  this.DocumentEndToken = (function(superClass) {
    class DocumentEndToken extends superClass {};

    DocumentEndToken.__super__ = superClass.prototype;

    DocumentEndToken.prototype.id = '<document end>';

    return DocumentEndToken;

  })(this.Token);

  this.StreamStartToken = (function(superClass) {
    class StreamStartToken extends superClass {
      constructor(start_mark, end_mark, encoding) {
        super(start_mark, end_mark);
        this.encoding = encoding;
      }

    };

    StreamStartToken.__super__ = superClass.prototype;

    StreamStartToken.prototype.id = '<stream start>';

    return StreamStartToken;

  })(this.Token);

  this.StreamEndToken = (function(superClass) {
    class StreamEndToken extends superClass {};

    StreamEndToken.__super__ = superClass.prototype;

    StreamEndToken.prototype.id = '<stream end>';

    return StreamEndToken;

  })(this.Token);

  this.BlockSequenceStartToken = (function(superClass) {
    class BlockSequenceStartToken extends superClass {};

    BlockSequenceStartToken.__super__ = superClass.prototype;

    BlockSequenceStartToken.prototype.id = '<block sequence start>';

    return BlockSequenceStartToken;

  })(this.Token);

  this.BlockMappingStartToken = (function(superClass) {
    class BlockMappingStartToken extends superClass {};

    BlockMappingStartToken.__super__ = superClass.prototype;

    BlockMappingStartToken.prototype.id = '<block mapping end>';

    return BlockMappingStartToken;

  })(this.Token);

  this.BlockEndToken = (function(superClass) {
    class BlockEndToken extends superClass {};

    BlockEndToken.__super__ = superClass.prototype;

    BlockEndToken.prototype.id = '<block end>';

    return BlockEndToken;

  })(this.Token);

  this.FlowSequenceStartToken = (function(superClass) {
    class FlowSequenceStartToken extends superClass {};

    FlowSequenceStartToken.__super__ = superClass.prototype;

    FlowSequenceStartToken.prototype.id = '[';

    return FlowSequenceStartToken;

  })(this.Token);

  this.FlowMappingStartToken = (function(superClass) {
    class FlowMappingStartToken extends superClass {};

    FlowMappingStartToken.__super__ = superClass.prototype;

    FlowMappingStartToken.prototype.id = '{';

    return FlowMappingStartToken;

  })(this.Token);

  this.FlowSequenceEndToken = (function(superClass) {
    class FlowSequenceEndToken extends superClass {};

    FlowSequenceEndToken.__super__ = superClass.prototype;

    FlowSequenceEndToken.prototype.id = ']';

    return FlowSequenceEndToken;

  })(this.Token);

  this.FlowMappingEndToken = (function(superClass) {
    class FlowMappingEndToken extends superClass {};

    FlowMappingEndToken.__super__ = superClass.prototype;

    FlowMappingEndToken.prototype.id = '}';

    return FlowMappingEndToken;

  })(this.Token);

  this.KeyToken = (function(superClass) {
    class KeyToken extends superClass {};

    KeyToken.__super__ = superClass.prototype;

    KeyToken.prototype.id = '?';

    return KeyToken;

  })(this.Token);

  this.ValueToken = (function(superClass) {
    class ValueToken extends superClass {};

    ValueToken.__super__ = superClass.prototype;

    ValueToken.prototype.id = ':';

    return ValueToken;

  })(this.Token);

  this.BlockEntryToken = (function(superClass) {
    class BlockEntryToken extends superClass {};

    BlockEntryToken.__super__ = superClass.prototype;

    BlockEntryToken.prototype.id = '-';

    return BlockEntryToken;

  })(this.Token);

  this.FlowEntryToken = (function(superClass) {
    class FlowEntryToken extends superClass {};

    FlowEntryToken.__super__ = superClass.prototype;

    FlowEntryToken.prototype.id = ',';

    return FlowEntryToken;

  })(this.Token);

  this.AliasToken = (function(superClass) {
    class AliasToken extends superClass {
      constructor(value, start_mark, end_mark) {
        super(start_mark, end_mark);
        this.value = value;
      }

    };

    AliasToken.__super__ = superClass.prototype;

    AliasToken.prototype.id = '<alias>';

    return AliasToken;

  })(this.Token);

  this.AnchorToken = (function(superClass) {
    class AnchorToken extends superClass {
      constructor(value, start_mark, end_mark) {
        super(start_mark, end_mark);
        this.value = value;
      }

    };

    AnchorToken.__super__ = superClass.prototype;

    AnchorToken.prototype.id = '<anchor>';

    return AnchorToken;

  })(this.Token);

  this.TagToken = (function(superClass) {
    class TagToken extends superClass {
      constructor(value, start_mark, end_mark) {
        super(start_mark, end_mark);
        this.value = value;
      }

    };

    TagToken.__super__ = superClass.prototype;

    TagToken.prototype.id = '<tag>';

    return TagToken;

  })(this.Token);

  this.ScalarToken = (function(superClass) {
    class ScalarToken extends superClass {
      constructor(value, plain, start_mark, end_mark, style) {
        super(start_mark, end_mark);
        this.value = value;
        this.plain = plain;
        this.style = style;
      }

    };

    ScalarToken.__super__ = superClass.prototype;

    ScalarToken.prototype.id = '<scalar>';

    return ScalarToken;

  })(this.Token);

}).call(this);
