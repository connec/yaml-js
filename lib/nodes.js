(function() {
  var unique_id;
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  unique_id = 0;

  this.Node = (function() {

    function Node(tag, value, start_mark, end_mark) {
      this.tag = tag;
      this.value = value;
      this.start_mark = start_mark;
      this.end_mark = end_mark;
      this.unique_id = "node_" + (unique_id++);
    }

    return Node;

  })();

  this.ScalarNode = (function() {

    __extends(ScalarNode, this.Node);

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

  }).call(this);

  this.CollectionNode = (function() {

    __extends(CollectionNode, this.Node);

    function CollectionNode(tag, value, start_mark, end_mark, flow_style) {
      this.tag = tag;
      this.value = value;
      this.start_mark = start_mark;
      this.end_mark = end_mark;
      this.flow_style = flow_style;
      CollectionNode.__super__.constructor.apply(this, arguments);
    }

    return CollectionNode;

  }).call(this);

  this.SequenceNode = (function() {

    __extends(SequenceNode, this.CollectionNode);

    function SequenceNode() {
      SequenceNode.__super__.constructor.apply(this, arguments);
    }

    SequenceNode.prototype.id = 'sequence';

    return SequenceNode;

  }).call(this);

  this.MappingNode = (function() {

    __extends(MappingNode, this.CollectionNode);

    function MappingNode() {
      MappingNode.__super__.constructor.apply(this, arguments);
    }

    MappingNode.prototype.id = 'mapping';

    return MappingNode;

  }).call(this);

}).call(this);
