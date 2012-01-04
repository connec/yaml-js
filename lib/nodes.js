(function() {
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  module.exports = (function() {
    var _;

    function exports() {}

    _ = require('underscore');

    exports.Node = (function() {

      function Node(tag, value, start_mark, end_mark) {
        this.tag = tag;
        this.value = value;
        this.start_mark = start_mark;
        this.end_mark = end_mark;
        this.unique_id = _.uniqueId('node_');
      }

      return Node;

    })();

    exports.ScalarNode = (function() {

      __extends(ScalarNode, exports.Node);

      ScalarNode.prototype.id = 'scalar';

      function ScalarNode(tag, value, start_mark, end_mark, style) {
        this.tag = tag;
        this.value = value;
        this.start_mark = start_mark;
        this.end_mark = end_mark;
        this.style = style;
        ScalarNode.__super__.constructor.apply(this, arguments);
      }

      return ScalarNode;

    })();

    exports.CollectionNode = (function() {

      __extends(CollectionNode, exports.Node);

      function CollectionNode(tag, value, start_mark, end_mark, flow_style) {
        this.tag = tag;
        this.value = value;
        this.start_mark = start_mark;
        this.end_mark = end_mark;
        this.flow_style = flow_style;
        CollectionNode.__super__.constructor.apply(this, arguments);
      }

      return CollectionNode;

    })();

    exports.SequenceNode = (function() {

      __extends(SequenceNode, exports.CollectionNode);

      function SequenceNode() {
        SequenceNode.__super__.constructor.apply(this, arguments);
      }

      SequenceNode.prototype.id = 'sequence';

      return SequenceNode;

    })();

    exports.MappingNode = (function() {

      __extends(MappingNode, exports.CollectionNode);

      function MappingNode() {
        MappingNode.__super__.constructor.apply(this, arguments);
      }

      MappingNode.prototype.id = 'mapping';

      return MappingNode;

    })();

    return exports;

  })();

}).call(this);
