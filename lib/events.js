(function() {
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  module.exports = (function() {

    function exports() {}

    exports.Event = (function() {

      function Event(start_mark, end_mark) {
        this.start_mark = start_mark;
        this.end_mark = end_mark;
      }

      return Event;

    })();

    exports.NodeEvent = (function() {

      __extends(NodeEvent, exports.Event);

      function NodeEvent(anchor, start_mark, end_mark) {
        this.anchor = anchor;
        this.start_mark = start_mark;
        this.end_mark = end_mark;
      }

      return NodeEvent;

    })();

    exports.CollectionStartEvent = (function() {

      __extends(CollectionStartEvent, exports.NodeEvent);

      function CollectionStartEvent(anchor, tag, implicit, start_mark, end_mark) {
        this.anchor = anchor;
        this.tag = tag;
        this.implicit = implicit;
        this.start_mark = start_mark;
        this.end_mark = end_mark;
      }

      return CollectionStartEvent;

    })();

    exports.CollectionEndEvent = (function() {

      __extends(CollectionEndEvent, exports.Event);

      function CollectionEndEvent() {
        CollectionEndEvent.__super__.constructor.apply(this, arguments);
      }

      return CollectionEndEvent;

    })();

    exports.StreamStartEvent = (function() {

      __extends(StreamStartEvent, exports.Event);

      function StreamStartEvent(start_mark, end_mark, explicit, version, tags) {
        this.start_mark = start_mark;
        this.end_mark = end_mark;
        this.explicit = explicit;
        this.version = version;
        this.tags = tags;
      }

      return StreamStartEvent;

    })();

    exports.StreamEndEvent = (function() {

      __extends(StreamEndEvent, exports.Event);

      function StreamEndEvent() {
        StreamEndEvent.__super__.constructor.apply(this, arguments);
      }

      return StreamEndEvent;

    })();

    exports.DocumentStartEvent = (function() {

      __extends(DocumentStartEvent, exports.Event);

      function DocumentStartEvent(start_mark, end_mark, explicit, version, tags) {
        this.start_mark = start_mark;
        this.end_mark = end_mark;
        this.explicit = explicit;
        this.version = version;
        this.tags = tags;
      }

      return DocumentStartEvent;

    })();

    exports.DocumentEndEvent = (function() {

      __extends(DocumentEndEvent, exports.Event);

      function DocumentEndEvent(start_mark, end_mark, explicit) {
        this.start_mark = start_mark;
        this.end_mark = end_mark;
        this.explicit = explicit;
      }

      return DocumentEndEvent;

    })();

    exports.AliasEvent = (function() {

      __extends(AliasEvent, exports.NodeEvent);

      function AliasEvent() {
        AliasEvent.__super__.constructor.apply(this, arguments);
      }

      return AliasEvent;

    })();

    exports.ScalarEvent = (function() {

      __extends(ScalarEvent, exports.NodeEvent);

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

    })();

    exports.SequenceStartEvent = (function() {

      __extends(SequenceStartEvent, exports.CollectionStartEvent);

      function SequenceStartEvent() {
        SequenceStartEvent.__super__.constructor.apply(this, arguments);
      }

      return SequenceStartEvent;

    })();

    exports.SequenceEndEvent = (function() {

      __extends(SequenceEndEvent, exports.CollectionEndEvent);

      function SequenceEndEvent() {
        SequenceEndEvent.__super__.constructor.apply(this, arguments);
      }

      return SequenceEndEvent;

    })();

    exports.MappingStartEvent = (function() {

      __extends(MappingStartEvent, exports.CollectionStartEvent);

      function MappingStartEvent() {
        MappingStartEvent.__super__.constructor.apply(this, arguments);
      }

      return MappingStartEvent;

    })();

    exports.MappingEndEvent = (function() {

      __extends(MappingEndEvent, exports.CollectionEndEvent);

      function MappingEndEvent() {
        MappingEndEvent.__super__.constructor.apply(this, arguments);
      }

      return MappingEndEvent;

    })();

    return exports;

  })();

}).call(this);
