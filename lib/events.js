(function() {
  this.Event = class Event {
    constructor(start_mark1, end_mark1) {
      this.start_mark = start_mark1;
      this.end_mark = end_mark1;
    }

  };

  this.NodeEvent = (function(superClass) {
    class NodeEvent extends superClass {
      constructor(anchor, start_mark, end_mark) {
        super(start_mark, end_mark);
        this.anchor = anchor;
      }

    };

    NodeEvent.__super__ = superClass.prototype;

    return NodeEvent;

  })(this.Event);

  this.CollectionStartEvent = (function(superClass) {
    class CollectionStartEvent extends superClass {
      constructor(anchor, tag, implicit, start_mark, end_mark, flow_style) {
        super(start_mark, end_mark);
        this.anchor = anchor;
        this.tag = tag;
        this.implicit = implicit;
        this.flow_style = flow_style;
      }

    };

    CollectionStartEvent.__super__ = superClass.prototype;

    return CollectionStartEvent;

  })(this.NodeEvent);

  this.CollectionEndEvent = (function(superClass) {
    class CollectionEndEvent extends superClass {};

    CollectionEndEvent.__super__ = superClass.prototype;

    return CollectionEndEvent;

  })(this.Event);

  this.StreamStartEvent = (function(superClass) {
    class StreamStartEvent extends superClass {
      constructor(start_mark, end_mark, encoding) {
        super(start_mark, end_mark);
        this.encoding = encoding;
      }

    };

    StreamStartEvent.__super__ = superClass.prototype;

    return StreamStartEvent;

  })(this.Event);

  this.StreamEndEvent = (function(superClass) {
    class StreamEndEvent extends superClass {};

    StreamEndEvent.__super__ = superClass.prototype;

    return StreamEndEvent;

  })(this.Event);

  this.DocumentStartEvent = (function(superClass) {
    class DocumentStartEvent extends superClass {
      constructor(start_mark, end_mark, explicit, version, tags) {
        super(start_mark, end_mark);
        this.explicit = explicit;
        this.version = version;
        this.tags = tags;
      }

    };

    DocumentStartEvent.__super__ = superClass.prototype;

    return DocumentStartEvent;

  })(this.Event);

  this.DocumentEndEvent = (function(superClass) {
    class DocumentEndEvent extends superClass {
      constructor(start_mark, end_mark, explicit) {
        super(start_mark, end_mark);
        this.explicit = explicit;
      }

    };

    DocumentEndEvent.__super__ = superClass.prototype;

    return DocumentEndEvent;

  })(this.Event);

  this.AliasEvent = (function(superClass) {
    class AliasEvent extends superClass {};

    AliasEvent.__super__ = superClass.prototype;

    return AliasEvent;

  })(this.NodeEvent);

  this.ScalarEvent = (function(superClass) {
    class ScalarEvent extends superClass {
      constructor(anchor, tag, implicit, value, start_mark, end_mark, style) {
        super(start_mark, end_mark);
        this.anchor = anchor;
        this.tag = tag;
        this.implicit = implicit;
        this.value = value;
        this.style = style;
      }

    };

    ScalarEvent.__super__ = superClass.prototype;

    return ScalarEvent;

  })(this.NodeEvent);

  this.SequenceStartEvent = (function(superClass) {
    class SequenceStartEvent extends superClass {};

    SequenceStartEvent.__super__ = superClass.prototype;

    return SequenceStartEvent;

  })(this.CollectionStartEvent);

  this.SequenceEndEvent = (function(superClass) {
    class SequenceEndEvent extends superClass {};

    SequenceEndEvent.__super__ = superClass.prototype;

    return SequenceEndEvent;

  })(this.CollectionEndEvent);

  this.MappingStartEvent = (function(superClass) {
    class MappingStartEvent extends superClass {};

    MappingStartEvent.__super__ = superClass.prototype;

    return MappingStartEvent;

  })(this.CollectionStartEvent);

  this.MappingEndEvent = (function(superClass) {
    class MappingEndEvent extends superClass {};

    MappingEndEvent.__super__ = superClass.prototype;

    return MappingEndEvent;

  })(this.CollectionEndEvent);

}).call(this);
