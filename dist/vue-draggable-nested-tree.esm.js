/*!
 * vue-draggable-nested-tree v3.0.0-beta2
 * (c) phphe <phphe@outlook.com> (https://github.com/phphe)
 * Released under the MIT License.
 */
import { strRand, arrayRemove, hasClass, getOffset, binarySearch } from 'helper-js';
import { breadthFirstSearch, insertBefore, appendTo, prependTo, insertAfter } from 'tree-helper';
import __vue_normalize__ from 'vue-runtime-helpers/dist/normalize-component.mjs';
import draggableHelper from 'draggable-helper';
import _defineProperty from '@babel/runtime/helpers/defineProperty';
import { isPropTrue } from 'vue-functions';

//
var script = {
  name: 'TreeNode',
  props: {
    data: {},
    store: {},
    level: {
      default: 0
    } // readonly

  },

  data() {
    return {
      vm: this
    };
  },

  computed: {
    childrenLevel() {
      return this.level + 1;
    },

    isRoot() {
      return this.data && this.data.isRoot;
    },

    childrenVisible() {
      const {
        data
      } = this;
      return this.isRoot || data && data.children && data.children.length && data.open;
    },

    innerBackStyle() {
      const r = {
        marginBottom: this.store.space + 'px'
      };

      if (!this.isRoot && this.level > 1) {
        r.paddingLeft = (this.level - 1) * this.store.indent + 'px';
      }

      return r;
    }

  },
  watch: {
    data: {
      immediate: true,

      handler(data) {
        if (data) {
          data._vm = this;

          if (!data._treeNodePropertiesCompleted && !data.isRoot) {
            this.store.compeleteNode(data, this.$parent.data);
          }
        }
      }

    }
  } // methods: {},
  // created() {},
  // mounted() {},

};

/* script */
const __vue_script__ = script;
/* template */

var __vue_render__ = function __vue_render__() {
  var _vm = this;

  var _h = _vm.$createElement;

  var _c = _vm._self._c || _h;

  return _c("div", {
    staticClass: "tree-node",
    class: [_vm.data.active ? _vm.store.activatedClass : "", _vm.data.open ? _vm.store.openedClass : "", _vm.data.class],
    style: _vm.data.style,
    attrs: {
      id: _vm.data._id
    }
  }, [!_vm.isRoot ? _vm._t("node-inner-back", function () {
    return [_c("div", {
      staticClass: "tree-node-inner-back",
      class: [_vm.data.innerBackClass],
      style: [_vm.innerBackStyle, _vm.data.innerBackStyle]
    }, [_c("div", {
      staticClass: "tree-node-inner",
      class: [_vm.data.innerClass],
      style: [_vm.data.innerStyle]
    }, [_vm._t("default", null, {
      data: _vm.data,
      store: _vm.store,
      vm: _vm.vm
    })], 2)])];
  }, {
    styleObj: _vm.innerBackStyle,
    data: _vm.data,
    store: _vm.store,
    vm: _vm.vm
  }) : _vm._e(), _c("transition", {
    attrs: {
      name: _vm.store.childrenTransitionName
    }
  }, [_vm.childrenVisible ? _c("div", {
    staticClass: "tree-node-children"
  }, _vm._l(_vm.data.children, function (child) {
    return _c("TreeNode", {
      key: child._id,
      attrs: {
        data: child,
        store: _vm.store,
        level: _vm.childrenLevel
      },
      scopedSlots: _vm._u([{
        key: "default",
        fn: function (props) {
          return [_vm._t("default", null, {
            data: props.data,
            store: props.store,
            vm: props.vm
          })];
        }
      }, {
        key: "node-inner-back",
        fn: function (props) {
          return _vm.store.customInnerBack ? [_vm._t("node-inner-back", null, {
            styleObj: props.styleObj,
            data: props.data,
            store: props.store,
            vm: props.vm
          })] : undefined;
        }
      }], null, true)
    });
  }), 1) : _vm._e()])], 2);
};

var __vue_staticRenderFns__ = [];
__vue_render__._withStripped = true;
/* style */

const __vue_inject_styles__ = undefined;
/* scoped */

const __vue_scope_id__ = undefined;
/* module identifier */

const __vue_module_identifier__ = undefined;
/* functional template */

const __vue_is_functional_template__ = false;
/* style inject */

/* style inject SSR */

/* style inject shadow dom */

const __vue_component__ = /*#__PURE__*/__vue_normalize__({
  render: __vue_render__,
  staticRenderFns: __vue_staticRenderFns__
}, __vue_inject_styles__, __vue_script__, __vue_scope_id__, __vue_is_functional_template__, __vue_module_identifier__, false, undefined, undefined, undefined);

//
var script$1 = {
  props: {
    data: {},
    idLength: {
      type: Number,
      default: 5
    },
    indent: {
      type: Number,
      default: 16
    },
    activatedClass: {
      default: 'active'
    },
    openedClass: {
      default: 'open'
    },
    space: {
      type: Number,
      default: 10
    },
    // space between node, unit px
    childrenTransitionName: {},
    // there are issues under draggable tree
    customInnerBack: {}
  },
  components: {
    TreeNode: __vue_component__
  },

  data() {
    return {
      store: this,
      rootData: null
    };
  },

  // computed: {},
  watch: {
    data: {
      immediate: true,

      handler(data, old) {
        if (data === old) {
          return;
        } // make rootData always use a same object


        this.rootData = this.rootData || {
          isRoot: true,
          _id: `tree_${this._uid}_node_root`,
          children: []
        };
        breadthFirstSearch(data, (node, k, parent) => {
          this.compeleteNode(node, parent);
        });
        this.rootData.children = data;
      }

    }
  },
  methods: {
    compeleteNode(node, parent) {
      const compeletedData = {
        open: true,
        children: [],
        active: false,
        style: {},
        class: '',
        innerStyle: {},
        innerClass: '',
        innerBackStyle: {},
        innerBackClass: {}
      };

      for (const key in compeletedData) {
        if (!node.hasOwnProperty(key)) {
          this.$set(node, key, compeletedData[key]);
        }
      }

      this.$set(node, 'parent', parent || this.rootData);

      if (!node.hasOwnProperty('_id')) {
        node._id = `tree_${this._uid}_node_${strRand(this.idLength)}`;
      }

      node._treeNodePropertiesCompleted = true;
    },

    // pure node self
    pure(node, withChildren, after) {
      const t = Object.assign({}, node);
      delete t._id;
      delete t.parent;
      delete t.children;
      delete t.open;
      delete t.active;
      delete t.style;
      delete t.class;
      delete t.innerStyle;
      delete t.innerClass;
      delete t.innerBackStyle;
      delete t.innerBackClass;

      for (const key of Object.keys(t)) {
        if (key[0] === '_') {
          delete t[key];
        }
      }

      if (withChildren && node.children) {
        t.children = node.children.slice();
        t.children.forEach((v, k) => {
          t.children[k] = this.pure(v, withChildren);
        });
      }

      if (after) {
        return after(t, node) || t;
      }

      return t;
    },

    getNodeById(id) {
      let r;
      breadthFirstSearch(this.rootData.children, node => {
        if (node._id === id) {
          r = node;
          return false;
        }
      });
      return r;
    },

    getActivated() {
      const r = [];
      breadthFirstSearch(this.rootData.children, node => {
        if (node.active) {
          r.push(node);
        }
      });
      return r;
    },

    getOpened() {
      const r = [];
      breadthFirstSearch(this.rootData.children, node => {
        if (node.open) {
          r.push(node);
        }
      });
      return r;
    },

    activeNode(node, inactiveOld) {

      if (inactiveOld) {
        this.getActivated().forEach(node2 => {
          node2.active = false;
        });
      }

      node.active = true;
    },

    toggleActive(node, inactiveOld) {
      if (node.active) {
        node.active = false;
      } else {
        this.activeNode(node, inactiveOld);
      }
    },

    openNode(node, closeOld) {

      if (closeOld) {
        this.getOpened().forEach(node2 => {
          node2.open = false;
          this.$emit('nodeOpenChanged', node2);
        });
      }

      node.open = true;
      this.$emit('nodeOpenChanged', node);
    },

    toggleOpen(node, closeOld) {
      if (node.open) {
        node.open = false;
        this.$emit('nodeOpenChanged', node);
      } else {
        this.openNode(node, closeOld);
      }
    },

    getPureData(after) {
      return this.pure(this.rootData, true, after).children;
    },

    deleteNode(node) {
      return arrayRemove(node.parent.children, node);
    }

  } // created() {},
  // mounted() {},

};

/* script */
const __vue_script__$1 = script$1;
/* template */

var __vue_render__$1 = function __vue_render__() {
  var _vm = this;

  var _h = _vm.$createElement;

  var _c = _vm._self._c || _h;

  return _c("div", {
    staticClass: "he-tree tree"
  }, [_c("TreeNode", {
    attrs: {
      data: _vm.rootData,
      store: _vm.store
    },
    scopedSlots: _vm._u([{
      key: "default",
      fn: function (props) {
        return [_vm._t("default", null, {
          data: props.data,
          store: _vm.store,
          vm: props.vm
        })];
      }
    }, {
      key: "node-inner-back",
      fn: function (props) {
        return _vm.customInnerBack ? [_vm._t("node-inner-back", null, {
          styleObj: props.styleObj,
          data: props.data,
          store: props.store,
          vm: props.vm
        })] : undefined;
      }
    }], null, true)
  })], 1);
};

var __vue_staticRenderFns__$1 = [];
__vue_render__$1._withStripped = true;
/* style */

const __vue_inject_styles__$1 = undefined;
/* scoped */

const __vue_scope_id__$1 = undefined;
/* module identifier */

const __vue_module_identifier__$1 = undefined;
/* functional template */

const __vue_is_functional_template__$1 = false;
/* style inject */

/* style inject SSR */

/* style inject shadow dom */

const __vue_component__$1 = /*#__PURE__*/__vue_normalize__({
  render: __vue_render__$1,
  staticRenderFns: __vue_staticRenderFns__$1
}, __vue_inject_styles__$1, __vue_script__$1, __vue_scope_id__$1, __vue_is_functional_template__$1, __vue_module_identifier__$1, false, undefined, undefined, undefined);

class Cache {
  constructor() {
    _defineProperty(this, "store", {});
  }

  has(name) {
    return this.store.hasOwnProperty(name);
  }

  remember(name, getter) {
    if (!this.has(name)) {
      this.store[name] = {
        value: getter()
      };
    }

    return this.store[name].value;
  }

  forget(name) {
    if (name) {
      if (this.has(name)) {
        delete this.store[name];
      }
    } else {
      this.store = {};
    }
  }

}
function attachCache(obj, cache, toCache) {
  for (const key in toCache) {
    Object.defineProperty(obj, key, {
      get() {
        return cache.remember(key, () => toCache[key].call(this));
      }

    });
  }
}

// from https://gist.github.com/iddan/54d5d9e58311b0495a91bf06de661380

if (!document.elementsFromPoint) {
  document.elementsFromPoint = elementsFromPoint;
}

function elementsFromPoint(x, y) {
  var parents = [];
  var parent = void 0;

  do {
    if (parent !== document.elementFromPoint(x, y)) {
      parent = document.elementFromPoint(x, y);
      parents.push(parent);
      parent.style.pointerEvents = 'none';
    } else {
      parent = false;
    }
  } while (parent);

  parents.forEach(function (parent) {
    return parent.style.pointerEvents = 'all';
  });
  return parents;
}

function getTreeByPoint(x, y, trees) {
  const els = document.elementsFromPoint(x, y);
  let treeEl;
  let nodeEl;
  const betweenEls = [];

  for (const el of els) {
    if (!nodeEl) {
      if (hasClass(el, 'tree-node')) {
        nodeEl = el;
      }
    } else {
      // console.log(el);
      if (hasClass(el, 'tree')) {
        treeEl = el;
        break;
      }

      betweenEls.push(el);
    }
  }

  if (treeEl) {
    // is target tree is another tree, and be covered by other element, like modal, popup
    let covered = false;

    if (!isParent(nodeEl, treeEl)) {
      // cross tree
      for (const el of betweenEls) {
        if (!isParent(el, treeEl)) {
          covered = true;
          break;
        }
      }
    } //


    if (!covered) {
      return trees.find(v => v.$el === treeEl);
    }
  }
}

function isParent(child, parent) {
  let cur = child;

  while (cur) {
    cur = cur.parentNode;

    if (cur === parent) {
      return true;
    }
  }
}

// 对 drag placeholder进行的操作

const targets = {
  'nothing': info => {},
  'after': info => {
    insertDplhAfterTo(info.dplh, info.targetNode);
  },
  'before': info => {
    if (isNodeDroppable(info.targetNode.parent)) {
      insertBefore(info.dplh, info.targetNode);
    } else {
      insertDplhAfterTo(info.dplh, info.targetNode.parent);
    }
  },
  'append': info => {
    if (isNodeDroppable(info.targetNode)) {
      appendTo(info.dplh, info.targetNode);
      if (!info.targetNode.open) info.store.toggleOpen(info.targetNode);
    } else {
      insertDplhAfterTo(info.dplh, info.targetNode);
    }
  },
  'prepend': info => {
    if (isNodeDroppable(info.targetNode)) {
      prependTo(info.dplh, info.targetNode);
      if (!info.targetNode.open) info.store.toggleOpen(info.targetNode);
    } else {
      insertDplhAfterTo(info.dplh, info.targetNode);
    }
  },
  'after target parent': info => {
    insertDplhAfterTo(info.dplh, info.targetNode.parent);
  },
  // append to prev sibling
  'append prev': info => {
    if (isNodeDroppable(info.targetPrev)) {
      appendTo(info.dplh, info.targetPrev);
      if (!info.targetPrev.open) info.store.toggleOpen(info.targetPrev);
    } else {
      insertDplhAfterTo(info.dplh, info.targetPrev);
    }
  },
  // append to current tree
  'append current tree': info => {
    if (isNodeDroppable(info.currentTree.rootData)) {
      appendTo(info.dplh, info.currentTree.rootData);
    }
  }
};

function insertDplhAfterTo(dplh, targetNode, info) {
  if (!targetNode) {
    return false;
  } else {
    const closest = findParent(targetNode, node => node.parent && isNodeDroppable(node.parent));

    if (closest) {
      insertAfter(dplh, closest);
    } else {
      return false;
    }
  }

  return true;
}

function isNodeDraggable(node) {
  if (node && node.draggable === false) {
    return false;
  }

  return true;
}
function isNodeDroppable(node) {
  if (!droppableIds.hasOwnProperty(node._id)) {
    let r;

    if (node.hasOwnProperty('droppable')) {
      r = node.droppable;
    } else if (node.parent) {
      r = isNodeDroppable(node.parent);
    } else {
      r = true;
    }

    droppableIds[node._id] = r;
  }

  return droppableIds[node._id];
} // find child, excluding dragging node default

function findChild(info, children, handler, reverse) {
  const len = children.length;

  if (reverse) {
    for (let i = len - 1; i >= 0; i--) {
      const item = children[i]; // excluding dragging node

      if (item !== info.node) {
        if (handler(item, i)) {
          return item;
        }
      }
    }
  } else {
    for (let i = 0; i < len; i++) {
      const item = children[i]; // excluding dragging node

      if (item !== info.node) {
        if (handler(item, i)) {
          return item;
        }
      }
    }
  }
} // start from node self


function findParent(node, handle) {
  let current = node;

  while (current) {
    if (handle(current)) {
      return current;
    }

    current = current.parent;
  }
}

const rules = {
  // 另一节点存在
  'targetNode existed': info => info.targetNode,
  // 另一节点是拖动占位节点
  'targetNode is placeholder': info => info.targetNode.isDragPlaceHolder,
  // 另一节点在最上面
  'targetNode at top': info => info.targetAtTop,
  // 另一节点在最下面
  'targetNode at bottom': info => info.targetAtBottom,
  // 另一节点是根节点第二个子
  'targetNode is the second child of root': info => info.currentTreeRootSecondChildExcludingDragging === info.targetNode,
  // 拖动点坐标在任一树中, 同时, 起始树要可拖出, 当前树要可拖入
  'currentTree existed': info => info.currentTree,
  // 当前树为空(不包括占位节点)
  'currentTree empty': info => !findChild(info, info.currentTree.rootData.children, v => v),
  // 占位节点存在
  'placeholder existed': info => info.dplhEl,
  // 占位节点在当前树中
  'placeholder in currentTree': info => info.dplhElInCurrentTree,
  // 占位节点在最上面
  'placeholder at top': info => info.dplhAtTop,
  // 另一节点是打开的
  'targetNode is open': info => info.targetNode.open,
  // 另一节点有子(不包括占位节点)
  'targetNode has children excluding placeholder': info => findChild(info, info.targetNode.children, v => v !== info.dplh),
  // 另一节点是第一个节点
  'targetNode is 1st child': info => findChild(info, info.targetNode.parent.children, v => v) === info.targetNode,
  // 另一节点是最后节点
  'targetNode is last child': info => findChild(info, info.targetNode.parent.children, v => v, true) === info.targetNode,
  // 当前位置在另一节点inner垂直中线上
  'on targetNode middle': info => info.offset.y <= info.tiMiddleY,
  // 当前位置在另一节点inner左边
  'at left': info => info.offset.x < info.tiOffset.x,
  // 当前位置在另一节点innner indent位置右边
  'at indent right': info => info.offset.x > info.tiOffset.x + info.currentTree.indent
}; // convert rule output to Boolean

for (const key of Object.keys(rules)) {
  const old = rules[key];

  rules[key] = (...args) => Boolean(old(...args));
}

let prevTree;
let droppableIds = {};

function autoMoveDragPlaceHolder(draggableHelperInfo) {
  const trees = this.store.trees;
  const dhStore = draggableHelperInfo.store; // make info

  const info = {
    event: draggableHelperInfo.event,
    el: dhStore.el,
    vm: this,
    node: this.data,
    store: this.store,
    dplh: this.store.dplh,
    draggableHelperData: {
      opt: draggableHelperInfo.options,
      store: dhStore
    }
  }; //

  attachCache(info, new Cache(), {
    // dragging node coordinate
    // 拖动中的节点相关坐标
    nodeInnerEl() {
      return this.el.querySelector('.tree-node-inner');
    },

    offset() {
      return getOffset(this.nodeInnerEl);
    },

    // left top point
    offset2() {
      return {
        x: this.offset.x + this.nodeInnerEl.offsetWidth,
        y: this.offset.y + this.nodeInnerEl.offsetHeight
      };
    },

    // right bottom point
    offsetToViewPort() {
      const r = this.nodeInnerEl.getBoundingClientRect();
      r.x = r.left;
      r.y = r.top;
      return r;
    },

    // tree
    currentTree() {
      // const currentTree = trees.find(tree => hp.isOffsetInEl(this.offset.x, this.offset.y, tree.$el))
      const currentTree = getTreeByPoint(this.offsetToViewPort.x, this.offsetToViewPort.y, trees);

      if (currentTree) {
        const dragStartTree = this.store;

        if (prevTree == null) {
          prevTree = dragStartTree;
        }

        if (prevTree !== currentTree) {
          if (!isPropTrue(dragStartTree.crossTree) || !isPropTrue(currentTree.crossTree)) {
            return;
          }

          prevTree = currentTree;
        }

        if (!isPropTrue(currentTree.droppable)) {
          return;
        }

        return currentTree;
      }
    },

    currentTreeRootEl() {
      return document.getElementById(this.currentTree.rootData._id);
    },

    currentTreeRootOf4() {
      return getOf4(this.currentTreeRootEl, this.currentTree.space);
    },

    // the second child of currentTree root, excluding dragging node
    currentTreeRootSecondChildExcludingDragging() {
      return this.currentTree.rootData.children.slice(0, 3).filter(v => v !== this.node)[1];
    },

    // placeholder
    dplhEl() {
      return document.getElementById(this.dplh._id);
    },

    dplhElInCurrentTree() {
      return Boolean(this.currentTree.$el.querySelector(`#${this.dplh._id}`));
    },

    dplhOf4() {
      return getOf4(this.dplhEl, this.currentTree.space);
    },

    dplhAtTop() {
      return Math.abs(this.dplhOf4.y - this.currentTreeRootOf4.y) < 5;
    },

    targetAtTop() {
      return Math.abs(this.tiOf4.y - this.currentTreeRootOf4.y) < 5;
    },

    targetAtBottom() {
      return Math.abs(this.tiOf4.y2 - this.currentTreeRootOf4.y2) < 5;
    },

    // most related node
    // 最相关的另一个节点
    targetNode() {
      const {
        currentTree
      } = this;

      if (!currentTree) {
        throw 'no currentTree';
      } //


      const {
        x,
        y
      } = this.offset;
      let currentNode = currentTree.rootData;

      while (true) {
        let children = currentNode.children;

        if (!children) {
          break;
        }

        if (this.node.parent === currentNode) {
          // dragging node is in currentNode children, remove it first
          children = children.slice();
          children.splice(children.indexOf(this.node), 1);
        }

        if (children.length === 0) {
          break;
        }

        const t = binarySearch(children, node => {
          const el = document.getElementById(node._id);
          const ty = getOffset(el).y;
          const ty2 = ty + el.offsetHeight + currentTree.space;

          if (ty2 < y) {
            return -1;
          } else if (ty <= y) {
            return 0;
          } else {
            return 1;
          }
        }, null, null, true);

        if (t.hit) {
          currentNode = t.value;
        } else {
          if (t.bigger) {
            currentNode = children[t.index - 1];
          } else {
            currentNode = t.value;
          }
        }

        if (!currentNode) {
          currentNode = children[0];
          break;
        }

        if (!currentNode) {
          break;
        }

        const innerEl = document.getElementById(currentNode._id).querySelector('.tree-node-inner');
        const of = getOf4(innerEl, currentTree.space);

        if (of.y <= y && y <= of.y2) {
          break;
        }
      }

      return currentNode;
    },

    targetNodeEl() {
      return document.getElementById(this.targetNode._id);
    },

    // targetNodeInnerElOffset
    tiInnerEl() {
      return this.targetNodeEl.querySelector('.tree-node-inner');
    },

    tiOffset() {
      return getOffset(this.tiInnerEl);
    },

    tiOf4() {
      return getOf4(this.tiInnerEl, this.currentTree.space);
    },

    tiMiddleY() {
      return this.tiOffset.y + this.tiInnerEl.offsetHeight / 2;
    },

    //
    targetPrevEl() {
      // tree node 之间不要有其他元素, 否则这里会获取到错误的元素
      let r = this.targetNodeEl.previousSibling;

      if (hasClass(r, 'dragging')) {
        r = r.previousSibling;
      }

      return r;
    },

    targetPrev() {
      const id = this.targetPrevEl.getAttribute('id');
      return this.currentTree.getNodeById(id);
    }

  }); // attachCache end
  // decision start =================================

  const executedRuleCache = {}; // exec rule

  const exec = ruleId => {
    if (!executedRuleCache.hasOwnProperty(ruleId)) {
      let r;

      try {
        r = rules[ruleId](info);
      } catch (e) {
        r = e;

        try {
          if (process.env.DEVELOPE_SELF) {
            // only visible when develop its self
            console.warn(`failed to execute rule '${ruleId}'`, e);
          }
        } catch (e2) {}
      }

      executedRuleCache[ruleId] = r;
    }

    return executedRuleCache[ruleId];
  };

  if (exec('currentTree existed') === true) {
    if (exec('targetNode is placeholder') === false) {
      if (exec('targetNode is the second child of root') === true) {
        if (exec('targetNode has children excluding placeholder') === false) {
          if (exec('on targetNode middle') === true) {
            targets['before'](info);
          } else if (exec('on targetNode middle') === false) {
            if (exec('at indent right') === true) {
              targets['append'](info);
            } else if (exec('at indent right') === false) {
              targets['after'](info);
            }
          }
        } else if (exec('targetNode has children excluding placeholder') === true) {
          targets['prepend'](info);
        }
      } else if (exec('targetNode is the second child of root') === false) {
        if (exec('currentTree empty') === false) {
          if (exec('targetNode at top') === true) {
            if (exec('placeholder in currentTree') === true) {
              if (exec('targetNode has children excluding placeholder') === false) {
                if (exec('on targetNode middle') === false) {
                  if (exec('at indent right') === false) {
                    targets['after'](info);
                  } else if (exec('at indent right') === true) {
                    targets['append'](info);
                  }
                } else if (exec('on targetNode middle') === true) {
                  targets['before'](info);
                }
              } else if (exec('targetNode has children excluding placeholder') === true) {
                if (exec('on targetNode middle') === false) {
                  targets['prepend'](info);
                } else if (exec('on targetNode middle') === true) {
                  targets['before'](info);
                }
              }
            } else if (exec('placeholder in currentTree') === false) {
              targets['before'](info);
            }
          } else if (exec('targetNode at top') === false) {
            if (exec('targetNode at bottom') === false) {
              if (exec('placeholder at top') === true) {
                targets['prepend'](info);
              } else if (exec('placeholder at top') === false) {
                if (exec('targetNode has children excluding placeholder') === true) {
                  targets['prepend'](info);
                } else if (exec('targetNode has children excluding placeholder') === false) {
                  if (exec('targetNode is 1st child') === false) {
                    if (exec('targetNode is last child') === false) {
                      if (exec('on targetNode middle') === true) {
                        if (exec('at indent right') === true) {
                          targets['append'](info);
                        } else if (exec('at indent right') === false) {
                          targets['after'](info);
                        }
                      } else if (exec('on targetNode middle') === false) {
                        if (exec('at indent right') === true) {
                          targets['append'](info);
                        } else if (exec('at indent right') === false) {
                          targets['after'](info);
                        }
                      }
                    } else if (exec('targetNode is last child') === true) {
                      if (exec('at indent right') === true) {
                        targets['append'](info);
                      } else if (exec('at indent right') === false) {
                        targets['after'](info);
                      }
                    }
                  } else if (exec('targetNode is 1st child') === true) {
                    if (exec('targetNode is last child') === true) {
                      targets['append'](info);
                    } else if (exec('targetNode is last child') === false) {
                      if (exec('on targetNode middle') === false) {
                        if (exec('at indent right') === false) {
                          targets['after'](info);
                        } else if (exec('at indent right') === true) {
                          targets['append'](info);
                        }
                      } else if (exec('on targetNode middle') === true) {
                        if (exec('at indent right') === false) {
                          targets['after'](info);
                        } else if (exec('at indent right') === true) {
                          targets['append'](info);
                        }
                      }
                    }
                  }
                }
              }
            } else if (exec('targetNode at bottom') === true) {
              if (exec('placeholder in currentTree') === true) {
                if (exec('on targetNode middle') === false) {
                  if (exec('at indent right') === true) {
                    targets['append'](info);
                  } else if (exec('at indent right') === false) {
                    targets['after'](info);
                  }
                } else if (exec('on targetNode middle') === true) {
                  targets['append'](info);
                }
              } else if (exec('placeholder in currentTree') === false) {
                targets['append'](info);
              }
            }
          }
        } else if (exec('currentTree empty') === true) {
          targets['append current tree'](info);
        }
      }
    } else if (exec('targetNode is placeholder') === true) {
      if (exec('targetNode at bottom') === false) {
        if (exec('targetNode is the second child of root') === false) {
          if (exec('targetNode is 1st child') === true) {
            if (exec('targetNode is last child') === false) {
              targets['nothing'](info);
            } else if (exec('targetNode is last child') === true) {
              if (exec('on targetNode middle') === false) {
                if (exec('at left') === true) {
                  targets['after target parent'](info);
                } else if (exec('at left') === false) {
                  targets['nothing'](info);
                }
              } else if (exec('on targetNode middle') === true) {
                if (exec('at left') === true) {
                  targets['after target parent'](info);
                } else if (exec('at left') === false) {
                  targets['nothing'](info);
                }
              }
            }
          } else if (exec('targetNode is 1st child') === false) {
            if (exec('targetNode is last child') === true) {
              if (exec('on targetNode middle') === true) {
                if (exec('at left') === true) {
                  targets['after target parent'](info);
                } else if (exec('at left') === false) {
                  if (exec('at indent right') === true) {
                    targets['append prev'](info);
                  } else if (exec('at indent right') === false) {
                    targets['nothing'](info);
                  }
                }
              } else if (exec('on targetNode middle') === false) {
                if (exec('at left') === true) {
                  targets['after target parent'](info);
                } else if (exec('at left') === false) {
                  if (exec('at indent right') === true) {
                    targets['append prev'](info);
                  } else if (exec('at indent right') === false) {
                    targets['nothing'](info);
                  }
                }
              }
            } else if (exec('targetNode is last child') === false) {
              if (exec('on targetNode middle') === true) {
                if (exec('at left') === true) {
                  targets['nothing'](info);
                } else if (exec('at left') === false) {
                  if (exec('at indent right') === true) {
                    targets['append prev'](info);
                  } else if (exec('at indent right') === false) {
                    targets['nothing'](info);
                  }
                }
              } else if (exec('on targetNode middle') === false) {
                if (exec('at left') === true) {
                  targets['nothing'](info);
                } else if (exec('at left') === false) {
                  if (exec('at indent right') === true) {
                    targets['append prev'](info);
                  } else if (exec('at indent right') === false) {
                    targets['nothing'](info);
                  }
                }
              }
            }
          }
        } else if (exec('targetNode is the second child of root') === true) {
          if (exec('on targetNode middle') === true) {
            if (exec('at indent right') === true) {
              targets['append prev'](info);
            } else if (exec('at indent right') === false) {
              targets['nothing'](info);
            }
          } else if (exec('on targetNode middle') === false) {
            if (exec('at indent right') === true) {
              targets['append prev'](info);
            } else if (exec('at indent right') === false) {
              targets['nothing'](info);
            }
          }
        }
      } else if (exec('targetNode at bottom') === true) {
        if (exec('targetNode is 1st child') === true) {
          if (exec('on targetNode middle') === false) {
            if (exec('at left') === true) {
              targets['after target parent'](info);
            } else if (exec('at left') === false) {
              targets['nothing'](info);
            }
          } else if (exec('on targetNode middle') === true) {
            if (exec('at left') === false) {
              targets['nothing'](info);
            } else if (exec('at left') === true) {
              targets['after target parent'](info);
            }
          }
        } else if (exec('targetNode is 1st child') === false) {
          if (exec('on targetNode middle') === false) {
            if (exec('at left') === true) {
              targets['after target parent'](info);
            } else if (exec('at left') === false) {
              if (exec('at indent right') === true) {
                targets['append prev'](info);
              } else if (exec('at indent right') === false) {
                targets['nothing'](info);
              }
            }
          } else if (exec('on targetNode middle') === true) {
            if (exec('at left') === true) {
              targets['after target parent'](info);
            } else if (exec('at left') === false) {
              if (exec('at indent right') === true) {
                targets['append prev'](info);
              } else if (exec('at indent right') === false) {
                targets['nothing'](info);
              }
            }
          }
        }
      }
    }
  } else if (exec('currentTree existed') === false) {
    targets['nothing'](info);
  } // decision end =================================
  //

}

function getOf4(el, space) {
  const r = getOffset(el);
  r.x2 = r.x + el.offsetWidth;
  r.y2 = r.y + el.offsetHeight + space;
  return r;
}

autoMoveDragPlaceHolder.dragStart = function dragStart() {};

autoMoveDragPlaceHolder.dragEnd = function dragEnd() {
  prevTree = null;
  droppableIds = {};
};

var script$2 = {
  extends: __vue_component__,
  name: 'TreeNode',

  mounted() {
    this.store.isNodeDraggable = isNodeDraggable;
    this.store.isNodeDroppable = isNodeDroppable;

    if (this.isRoot || this.data.isDragPlaceHolder) {
      return;
    }

    const {
      dplh
    } = this.store;
    this.$watch('store.draggable', draggable => {
      if (isPropTrue(draggable)) {
        const triggerEl = this.store.getTriggerEl ? this.store.getTriggerEl(this) : this.$el.querySelector('.tree-node-inner');
        this._draggableDestroy = draggableHelper(triggerEl, {
          preventSelect: isPropTrue(this.store.preventSelect),
          // trigger el
          getEl: () => this.$el,
          minTranslate: 10,
          drag: (e, opt, store) => {
            autoMoveDragPlaceHolder.dragStart(); // this store is not tree

            const draggableHelperInfo = {
              event: e,
              options: opt,
              store
            };

            if (this.store.ondragstart && this.store.ondragstart(this.data, draggableHelperInfo) === false) {
              return false;
            }

            if (!isNodeDraggable(this.data)) {
              return false;
            }

            this.store.$emit('drag', this.data); // record start positon

            const siblings = this.data.parent.children;
            this.startPosition = {
              siblings,
              index: siblings.indexOf(this.data)
            }; //

            dplh.innerStyle.height = store.el.offsetHeight + 'px';
            insertAfter(dplh, this.data);
            this.data.class += ' dragging'; // console.log('drag start');
          },
          moving: (e, opt, store) => {
            if (store.movedCount === 0) {
              return;
            }

            const draggableHelperInfo = {
              event: e,
              options: opt,
              store
            };
            return autoMoveDragPlaceHolder.call(this, draggableHelperInfo);
          },
          drop: (e, opt, store) => {
            autoMoveDragPlaceHolder.dragEnd();
            const draggableHelperInfo = {
              event: e,
              options: opt,
              store
            };

            if (this.store.ondragend && this.store.ondragend(this.data, draggableHelperInfo) === false) {
              arrayRemove(dplh.parent.children, dplh); // can't drop, no change
            } else {
              const targetTree = dplh._vm.store;
              const crossTree = targetTree !== this.store;
              const oldTree = crossTree ? this.store : null;
              insertAfter(this.data, dplh);
              arrayRemove(dplh.parent.children, dplh);
              this.data.class = this.data.class.replace(/(^| )dragging( |$)/g, ' ');
              targetTree.$emit('drop', this.data, targetTree, oldTree);
              oldTree && oldTree.$emit('drop', this.data, targetTree, oldTree); // emit change event if changed

              const siblings = this.data.parent.children;

              if (siblings === this.startPosition.siblings && siblings.indexOf(this.data) === this.startPosition.index) ; else {
                this.store.$emit('change', this.data, targetTree, oldTree);
                oldTree && oldTree.$emit('change', this.data, targetTree, oldTree);
              }

              this.startPosition = null;
            } // console.log('drag end');

          }
        });
      } else {
        if (this._draggableDestroy) {
          this._draggableDestroy();

          this._draggableDestroy = null;
        }
      }
    }, {
      immediate: true
    });
  }

};

/* script */
const __vue_script__$2 = script$2;
/* template */

/* style */

const __vue_inject_styles__$2 = undefined;
/* scoped */

const __vue_scope_id__$2 = undefined;
/* module identifier */

const __vue_module_identifier__$2 = undefined;
/* functional template */

const __vue_is_functional_template__$2 = undefined;
/* style inject */

/* style inject SSR */

/* style inject shadow dom */

const __vue_component__$2 = /*#__PURE__*/__vue_normalize__({}, __vue_inject_styles__$2, __vue_script__$2, __vue_scope_id__$2, __vue_is_functional_template__$2, __vue_module_identifier__$2, false, undefined, undefined, undefined);

const trees = []; // for multiple trees
// DragPlaceHolder, unique

const dplh = {
  _id: 'draggable_tree_drag_placeHolder',
  level: null,
  droppable: false,
  isDragPlaceHolder: true,
  class: 'draggable-placeholder',
  style: {},
  innerStyle: {},
  innerClass: 'draggable-placeholder-inner',
  innerBackStyle: {},
  innerBackClass: 'draggable-placeholder-inner-back' // children: [],

};
var script$3 = {
  extends: __vue_component__$1,
  props: {
    getTriggerEl: {
      type: Function
    },
    draggable: {},
    droppable: {
      default: true
    },
    crossTree: {},
    ondragstart: {
      type: Function
    },
    ondragend: {
      type: Function
    },
    preventSelect: {
      default: true
    }
  },
  components: {
    TreeNode: __vue_component__$2
  },

  data() {
    return {
      // DragPlaceHolder
      dplh,
      trees
    };
  },

  // computed: {},
  // watch: {},
  // methods: {},
  created() {
    trees.push(this);
  },

  mounted() {},

  beforeDestroy() {
    arrayRemove(trees, this);
  }

};

/* script */
const __vue_script__$3 = script$3;
/* template */

/* style */

const __vue_inject_styles__$3 = undefined;
/* scoped */

const __vue_scope_id__$3 = undefined;
/* module identifier */

const __vue_module_identifier__$3 = undefined;
/* functional template */

const __vue_is_functional_template__$3 = undefined;
/* style inject */

/* style inject SSR */

/* style inject shadow dom */

const __vue_component__$3 = /*#__PURE__*/__vue_normalize__({}, __vue_inject_styles__$3, __vue_script__$3, __vue_scope_id__$3, __vue_is_functional_template__$3, __vue_module_identifier__$3, false, undefined, undefined, undefined);

export { __vue_component__$3 as DraggableTree, __vue_component__$2 as DraggableTreeNode, __vue_component__$1 as Tree, __vue_component__ as TreeNode };
