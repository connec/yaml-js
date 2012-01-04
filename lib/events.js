(function() {
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  this.Event = (function() {

    function Event(start_mark, end_mark) {
      this.start_mark = start_mark;
      this.end_mark = end_mark;
    }

    return Event;

  })();

  this.NodeEvent = (function() {

    __extends(NodeEvent, this.Event);

    function NodeEvent(anchor, start_mark, end_mark) {
      this.anchor = anchor;
      this.start_mark = start_mark;
      this.end_mark = end_mark;
    }

    return NodeEvent;

  }).call(this);

  this.CollectionStartEvent = (function() {

    __extends(CollectionStartEvent, this.NodeEvent);

    function CollectionStartEvent(anchor, tag, implicit, start_mark, end_mark) {
      this.anchor = anchor;
      this.tag = tag;
      this.implicit = implicit;
      this.start_mark = start_mark;
      this.end_mark = end_mark;
    }

    return CollectionStartEvent;

  }).call(this);

  this.CollectionEndEvent = (function() {

    __extends(CollectionEndEvent, this.Event);

    function CollectionEndEvent() {
      CollectionEndEvent.__super__.constructor.apply(this, arguments);
    }

    return CollectionEndEvent;

  }).call(this);

  this.StreamStartEvent = (function() {

    __extends(StreamStartEvent, this.Event);

    function StreamStartEvent(start_mark, end_mark, explicit, version, tags) {
      this.start_mark = start_mark;
      this.end_mark = end_mark;
      this.explicit = explicit;
      this.version = version;
      this.tags = tags;
    }

    return StreamStartEvent;

  }).call(this);

  this.StreamEndEvent = (function() {

    __extends(StreamEndEvent, this.Event);

    function StreamEndEvent() {
      StreamEndEvent.__super__.constructor.apply(this, arguments);
    }

    return StreamEndEvent;

  }).call(this);

  this.DocumentStartEvent = (function() {

    __extends(DocumentStartEvent, this.Event);

    function DocumentStartEvent(start_mark, end_mark, explicit, version, tags) {
      this.start_mark = start_mark;
      this.end_mark = end_mark;
      this.explicit = explicit;
      this.version = version;
      this.tags = tags;
    }

    return DocumentStartEvent;

  }).call(this);

  this.DocumentEndEvent = (function() {

    __extends(DocumentEndEvent, this.Event);

    function DocumentEndEvent(start_mark, end_mark, explicit) {
      this.start_mark = start_mark;
      this.end_mark = end_mark;
      this.explicit = explicit;
    }

    return DocumentEndEvent;

  }).call(this);

  this.AliasEvent = (function() {

    __extends(AliasEvent, this.NodeEvent);

    function AliasEvent() {
      AliasEvent.__super__.constructor.apply(this, arguments);
    }

    return AliasEvent;

  }).call(this);

  this.ScalarEvent = (function() {

    __extends(ScalarEvent, this.NodeEvent);

    function ScalarEvent(anchor, tag, implicit, value, start_mark, end_mark, style) {
      this.anchor = anchor;
      this.tag = tag;
      this.implicit = implicit;
      this.value = value;
      this.start_mark = start_mark;
      this.end_mark = end_mark;
      this.style = style;
    }

    return ScalarEvent;

  }).call(this);

  this.SequenceStartEvent = (function() {

    __extends(SequenceStartEvent, this.CollectionStartEvent);

    function SequenceStartEvent() {
      SequenceStartEvent.__super__.constructor.apply(this, arguments);
    }

    return SequenceStartEvent;

  }).call(this);

  this.SequenceEndEvent = (function() {

    __extends(SequenceEndEvent, this.CollectionEndEvent);

    function SequenceEndEvent() {
      SequenceEndEvent.__super__.constructor.apply(this, arguments);
    }

    return SequenceEndEvent;

  }).call(this);

  this.MappingStartEvent = (function() {

    __extends(MappingStartEvent, this.CollectionStartEvent);

    function MappingStartEvent() {
      MappingStartEvent.__super__.constructor.apply(this, arguments);
    }

    return MappingStartEvent;

  }).call(this);

  this.MappingEndEvent = (function() {

    __extends(MappingEndEvent, this.CollectionEndEvent);

    function MappingEndEvent() {
      MappingEndEvent.__super__.constructor.apply(this, arguments);
    }

    return MappingEndEvent;

  }).call(this);

}).call(this);
