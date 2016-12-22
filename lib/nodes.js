(function() {
  var unique_id;

  unique_id = 0;

  this.Node = class Node {
    constructor(tag, value, start_mark, end_mark) {
      this.tag = tag;
      this.value = value;
      this.start_mark = start_mark;
      this.end_mark = end_mark;
      this.unique_id = `node_${unique_id++}`;
    }

  };

  this.ScalarNode = (function(superClass) {
    class ScalarNode extends superClass {
      constructor(tag, value, start_mark, end_mark, style) {
        super(...arguments);
        this.tag = tag;
        this.value = value;
        this.start_mark = start_mark;
        this.end_mark = end_mark;
        this.style = style;
      }

    };

    ScalarNode.__super__ = superClass.prototype;

    ScalarNode.prototype.id = 'scalar';

    return ScalarNode;

  })(this.Node);

  this.CollectionNode = (function(superClass) {
    class CollectionNode extends superClass {
      constructor(tag, value, start_mark, end_mark, flow_style) {
        super(...arguments);
        this.tag = tag;
        this.value = value;
        this.start_mark = start_mark;
        this.end_mark = end_mark;
        this.flow_style = flow_style;
      }

    };

    CollectionNode.__super__ = superClass.prototype;

    return CollectionNode;

  })(this.Node);

  this.SequenceNode = (function(superClass) {
    class SequenceNode extends superClass {};

    SequenceNode.__super__ = superClass.prototype;

    SequenceNode.prototype.id = 'sequence';

    return SequenceNode;

  })(this.CollectionNode);

  this.MappingNode = (function(superClass) {
    class MappingNode extends superClass {};

    MappingNode.__super__ = superClass.prototype;

    MappingNode.prototype.id = 'mapping';

    return MappingNode;

  })(this.CollectionNode);

}).call(this);
