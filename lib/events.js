(function() {
  this.Event = class Event {
    constructor(start_mark1, end_mark1) {
      this.start_mark = start_mark1;
      this.end_mark = end_mark1;
    }

  };

  this.NodeEvent = class NodeEvent extends this.Event {
    constructor(anchor1, start_mark, end_mark) {
      super(start_mark, end_mark);
      this.anchor = anchor1;
    }

  };

  this.CollectionStartEvent = class CollectionStartEvent extends this.NodeEvent {
    constructor(anchor, tag, implicit, start_mark, end_mark, flow_style) {
      super(anchor, start_mark, end_mark);
      this.tag = tag;
      this.implicit = implicit;
      this.flow_style = flow_style;
    }

  };

  this.CollectionEndEvent = class CollectionEndEvent extends this.Event {};

  this.StreamStartEvent = class StreamStartEvent extends this.Event {
    constructor(start_mark, end_mark, encoding) {
      super(start_mark, end_mark);
      this.encoding = encoding;
    }

  };

  this.StreamEndEvent = class StreamEndEvent extends this.Event {};

  this.DocumentStartEvent = class DocumentStartEvent extends this.Event {
    constructor(start_mark, end_mark, explicit, version, tags) {
      super(start_mark, end_mark);
      this.explicit = explicit;
      this.version = version;
      this.tags = tags;
    }

  };

  this.DocumentEndEvent = class DocumentEndEvent extends this.Event {
    constructor(start_mark, end_mark, explicit) {
      super(start_mark, end_mark);
      this.explicit = explicit;
    }

  };

  this.AliasEvent = class AliasEvent extends this.NodeEvent {};

  this.ScalarEvent = class ScalarEvent extends this.NodeEvent {
    constructor(anchor, tag, implicit, value, start_mark, end_mark, style) {
      super(anchor, start_mark, end_mark);
      this.tag = tag;
      this.implicit = implicit;
      this.value = value;
      this.style = style;
    }

  };

  this.SequenceStartEvent = class SequenceStartEvent extends this.CollectionStartEvent {};

  this.SequenceEndEvent = class SequenceEndEvent extends this.CollectionEndEvent {};

  this.MappingStartEvent = class MappingStartEvent extends this.CollectionStartEvent {};

  this.MappingEndEvent = class MappingEndEvent extends this.CollectionEndEvent {};

}).call(this);
