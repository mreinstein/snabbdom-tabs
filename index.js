function vnode(sel, data, children, text, elm) {
  const key = data === void 0 ? void 0 : data.key;
  return { sel, data, children, text, elm, key };
}
const array = Array.isArray;
function primitive(s) {
  return typeof s === "string" || typeof s === "number";
}
function createElement(tagName2) {
  return document.createElement(tagName2);
}
function createElementNS(namespaceURI, qualifiedName) {
  return document.createElementNS(namespaceURI, qualifiedName);
}
function createTextNode(text) {
  return document.createTextNode(text);
}
function createComment(text) {
  return document.createComment(text);
}
function insertBefore(parentNode2, newNode, referenceNode) {
  parentNode2.insertBefore(newNode, referenceNode);
}
function removeChild(node, child) {
  node.removeChild(child);
}
function appendChild(node, child) {
  node.appendChild(child);
}
function parentNode(node) {
  return node.parentNode;
}
function nextSibling(node) {
  return node.nextSibling;
}
function tagName(elm) {
  return elm.tagName;
}
function setTextContent(node, text) {
  node.textContent = text;
}
function getTextContent(node) {
  return node.textContent;
}
function isElement(node) {
  return node.nodeType === 1;
}
function isText(node) {
  return node.nodeType === 3;
}
function isComment(node) {
  return node.nodeType === 8;
}
const htmlDomApi = {
  createElement,
  createElementNS,
  createTextNode,
  createComment,
  insertBefore,
  removeChild,
  appendChild,
  parentNode,
  nextSibling,
  tagName,
  setTextContent,
  getTextContent,
  isElement,
  isText,
  isComment };

function isUndef(s) {
  return s === void 0;
}
function isDef(s) {
  return s !== void 0;
}
const emptyNode = vnode("", {}, [], void 0, void 0);
function sameVnode(vnode1, vnode2) {
  return vnode1.key === vnode2.key && vnode1.sel === vnode2.sel;
}
function isVnode(vnode2) {
  return vnode2.sel !== void 0;
}
function createKeyToOldIdx(children, beginIdx, endIdx) {
  var _a;
  const map = {};
  for (let i = beginIdx; i <= endIdx; ++i) {
    const key = (_a = children[i]) === null || _a === void 0 ? void 0 : _a.key;
    if (key !== void 0) {
      map[key] = i;
    }
  }
  return map;
}
const hooks = ["create", "update", "remove", "destroy", "pre", "post"];
function init(modules, domApi) {
  let i;
  let j;
  const cbs = {
    create: [],
    update: [],
    remove: [],
    destroy: [],
    pre: [],
    post: [] };

  const api = domApi !== void 0 ? domApi : htmlDomApi;
  for (i = 0; i < hooks.length; ++i) {
    cbs[hooks[i]] = [];
    for (j = 0; j < modules.length; ++j) {
      const hook = modules[j][hooks[i]];
      if (hook !== void 0) {
        cbs[hooks[i]].push(hook);
      }
    }
  }
  function emptyNodeAt(elm) {
    const id = elm.id ? "#" + elm.id : "";
    const c = elm.className ? "." + elm.className.split(" ").join(".") : "";
    return vnode(api.tagName(elm).toLowerCase() + id + c, {}, [], void 0, elm);
  }
  function createRmCb(childElm, listeners) {
    return function rmCb() {
      if (--listeners === 0) {
        const parent = api.parentNode(childElm);
        api.removeChild(parent, childElm);
      }
    };
  }
  function createElm(vnode2, insertedVnodeQueue) {
    var _a, _b;
    let i2;
    let data = vnode2.data;
    if (data !== void 0) {
      const init2 = (_a = data.hook) === null || _a === void 0 ? void 0 : _a.init;
      if (isDef(init2)) {
        init2(vnode2);
        data = vnode2.data;
      }
    }
    const children = vnode2.children;
    const sel = vnode2.sel;
    if (sel === "!") {
      if (isUndef(vnode2.text)) {
        vnode2.text = "";
      }
      vnode2.elm = api.createComment(vnode2.text);
    } else if (sel !== void 0) {
      const hashIdx = sel.indexOf("#");
      const dotIdx = sel.indexOf(".", hashIdx);
      const hash = hashIdx > 0 ? hashIdx : sel.length;
      const dot = dotIdx > 0 ? dotIdx : sel.length;
      const tag = hashIdx !== -1 || dotIdx !== -1 ? sel.slice(0, Math.min(hash, dot)) : sel;
      const elm = vnode2.elm = isDef(data) && isDef(i2 = data.ns) ? api.createElementNS(i2, tag) : api.createElement(tag);
      if (hash < dot)
      elm.setAttribute("id", sel.slice(hash + 1, dot));
      if (dotIdx > 0)
      elm.setAttribute("class", sel.slice(dot + 1).replace(/\./g, " "));
      for (i2 = 0; i2 < cbs.create.length; ++i2)
      cbs.create[i2](emptyNode, vnode2);
      if (array(children)) {
        for (i2 = 0; i2 < children.length; ++i2) {
          const ch = children[i2];
          if (ch != null) {
            api.appendChild(elm, createElm(ch, insertedVnodeQueue));
          }
        }
      } else if (primitive(vnode2.text)) {
        api.appendChild(elm, api.createTextNode(vnode2.text));
      }
      const hook = vnode2.data.hook;
      if (isDef(hook)) {
        (_b = hook.create) === null || _b === void 0 ? void 0 : _b.call(hook, emptyNode, vnode2);
        if (hook.insert) {
          insertedVnodeQueue.push(vnode2);
        }
      }
    } else {
      vnode2.elm = api.createTextNode(vnode2.text);
    }
    return vnode2.elm;
  }
  function addVnodes(parentElm, before, vnodes, startIdx, endIdx, insertedVnodeQueue) {
    for (; startIdx <= endIdx; ++startIdx) {
      const ch = vnodes[startIdx];
      if (ch != null) {
        api.insertBefore(parentElm, createElm(ch, insertedVnodeQueue), before);
      }
    }
  }
  function invokeDestroyHook(vnode2) {
    var _a, _b;
    const data = vnode2.data;
    if (data !== void 0) {
      (_b = (_a = data === null || data === void 0 ? void 0 : data.hook) === null || _a === void 0 ? void 0 : _a.destroy) === null || _b === void 0 ? void 0 : _b.call(_a, vnode2);
      for (let i2 = 0; i2 < cbs.destroy.length; ++i2)
      cbs.destroy[i2](vnode2);
      if (vnode2.children !== void 0) {
        for (let j2 = 0; j2 < vnode2.children.length; ++j2) {
          const child = vnode2.children[j2];
          if (child != null && typeof child !== "string") {
            invokeDestroyHook(child);
          }
        }
      }
    }
  }
  function removeVnodes(parentElm, vnodes, startIdx, endIdx) {
    var _a, _b;
    for (; startIdx <= endIdx; ++startIdx) {
      let listeners;
      let rm;
      const ch = vnodes[startIdx];
      if (ch != null) {
        if (isDef(ch.sel)) {
          invokeDestroyHook(ch);
          listeners = cbs.remove.length + 1;
          rm = createRmCb(ch.elm, listeners);
          for (let i2 = 0; i2 < cbs.remove.length; ++i2)
          cbs.remove[i2](ch, rm);
          const removeHook = (_b = (_a = ch === null || ch === void 0 ? void 0 : ch.data) === null || _a === void 0 ? void 0 : _a.hook) === null || _b === void 0 ? void 0 : _b.remove;
          if (isDef(removeHook)) {
            removeHook(ch, rm);
          } else {
            rm();
          }
        } else {
          api.removeChild(parentElm, ch.elm);
        }
      }
    }
  }
  function updateChildren(parentElm, oldCh, newCh, insertedVnodeQueue) {
    let oldStartIdx = 0;
    let newStartIdx = 0;
    let oldEndIdx = oldCh.length - 1;
    let oldStartVnode = oldCh[0];
    let oldEndVnode = oldCh[oldEndIdx];
    let newEndIdx = newCh.length - 1;
    let newStartVnode = newCh[0];
    let newEndVnode = newCh[newEndIdx];
    let oldKeyToIdx;
    let idxInOld;
    let elmToMove;
    let before;
    while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
      if (oldStartVnode == null) {
        oldStartVnode = oldCh[++oldStartIdx];
      } else if (oldEndVnode == null) {
        oldEndVnode = oldCh[--oldEndIdx];
      } else if (newStartVnode == null) {
        newStartVnode = newCh[++newStartIdx];
      } else if (newEndVnode == null) {
        newEndVnode = newCh[--newEndIdx];
      } else if (sameVnode(oldStartVnode, newStartVnode)) {
        patchVnode(oldStartVnode, newStartVnode, insertedVnodeQueue);
        oldStartVnode = oldCh[++oldStartIdx];
        newStartVnode = newCh[++newStartIdx];
      } else if (sameVnode(oldEndVnode, newEndVnode)) {
        patchVnode(oldEndVnode, newEndVnode, insertedVnodeQueue);
        oldEndVnode = oldCh[--oldEndIdx];
        newEndVnode = newCh[--newEndIdx];
      } else if (sameVnode(oldStartVnode, newEndVnode)) {
        patchVnode(oldStartVnode, newEndVnode, insertedVnodeQueue);
        api.insertBefore(parentElm, oldStartVnode.elm, api.nextSibling(oldEndVnode.elm));
        oldStartVnode = oldCh[++oldStartIdx];
        newEndVnode = newCh[--newEndIdx];
      } else if (sameVnode(oldEndVnode, newStartVnode)) {
        patchVnode(oldEndVnode, newStartVnode, insertedVnodeQueue);
        api.insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm);
        oldEndVnode = oldCh[--oldEndIdx];
        newStartVnode = newCh[++newStartIdx];
      } else {
        if (oldKeyToIdx === void 0) {
          oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx);
        }
        idxInOld = oldKeyToIdx[newStartVnode.key];
        if (isUndef(idxInOld)) {
          api.insertBefore(parentElm, createElm(newStartVnode, insertedVnodeQueue), oldStartVnode.elm);
        } else {
          elmToMove = oldCh[idxInOld];
          if (elmToMove.sel !== newStartVnode.sel) {
            api.insertBefore(parentElm, createElm(newStartVnode, insertedVnodeQueue), oldStartVnode.elm);
          } else {
            patchVnode(elmToMove, newStartVnode, insertedVnodeQueue);
            oldCh[idxInOld] = void 0;
            api.insertBefore(parentElm, elmToMove.elm, oldStartVnode.elm);
          }
        }
        newStartVnode = newCh[++newStartIdx];
      }
    }
    if (oldStartIdx <= oldEndIdx || newStartIdx <= newEndIdx) {
      if (oldStartIdx > oldEndIdx) {
        before = newCh[newEndIdx + 1] == null ? null : newCh[newEndIdx + 1].elm;
        addVnodes(parentElm, before, newCh, newStartIdx, newEndIdx, insertedVnodeQueue);
      } else {
        removeVnodes(parentElm, oldCh, oldStartIdx, oldEndIdx);
      }
    }
  }
  function patchVnode(oldVnode, vnode2, insertedVnodeQueue) {
    var _a, _b, _c, _d, _e;
    const hook = (_a = vnode2.data) === null || _a === void 0 ? void 0 : _a.hook;
    (_b = hook === null || hook === void 0 ? void 0 : hook.prepatch) === null || _b === void 0 ? void 0 : _b.call(hook, oldVnode, vnode2);
    const elm = vnode2.elm = oldVnode.elm;
    const oldCh = oldVnode.children;
    const ch = vnode2.children;
    if (oldVnode === vnode2)
    return;
    if (vnode2.data !== void 0) {
      for (let i2 = 0; i2 < cbs.update.length; ++i2)
      cbs.update[i2](oldVnode, vnode2);
      (_d = (_c = vnode2.data.hook) === null || _c === void 0 ? void 0 : _c.update) === null || _d === void 0 ? void 0 : _d.call(_c, oldVnode, vnode2);
    }
    if (isUndef(vnode2.text)) {
      if (isDef(oldCh) && isDef(ch)) {
        if (oldCh !== ch)
        updateChildren(elm, oldCh, ch, insertedVnodeQueue);
      } else if (isDef(ch)) {
        if (isDef(oldVnode.text))
        api.setTextContent(elm, "");
        addVnodes(elm, null, ch, 0, ch.length - 1, insertedVnodeQueue);
      } else if (isDef(oldCh)) {
        removeVnodes(elm, oldCh, 0, oldCh.length - 1);
      } else if (isDef(oldVnode.text)) {
        api.setTextContent(elm, "");
      }
    } else if (oldVnode.text !== vnode2.text) {
      if (isDef(oldCh)) {
        removeVnodes(elm, oldCh, 0, oldCh.length - 1);
      }
      api.setTextContent(elm, vnode2.text);
    }
    (_e = hook === null || hook === void 0 ? void 0 : hook.postpatch) === null || _e === void 0 ? void 0 : _e.call(hook, oldVnode, vnode2);
  }
  return function patch(oldVnode, vnode2) {
    let i2, elm, parent;
    const insertedVnodeQueue = [];
    for (i2 = 0; i2 < cbs.pre.length; ++i2)
    cbs.pre[i2]();
    if (!isVnode(oldVnode)) {
      oldVnode = emptyNodeAt(oldVnode);
    }
    if (sameVnode(oldVnode, vnode2)) {
      patchVnode(oldVnode, vnode2, insertedVnodeQueue);
    } else {
      elm = oldVnode.elm;
      parent = api.parentNode(elm);
      createElm(vnode2, insertedVnodeQueue);
      if (parent !== null) {
        api.insertBefore(parent, vnode2.elm, api.nextSibling(elm));
        removeVnodes(parent, [oldVnode], 0, 0);
      }
    }
    for (i2 = 0; i2 < insertedVnodeQueue.length; ++i2) {
      insertedVnodeQueue[i2].data.hook.insert(insertedVnodeQueue[i2]);
    }
    for (i2 = 0; i2 < cbs.post.length; ++i2)
    cbs.post[i2]();
    return vnode2;
  };
}
function addNS(data, children, sel) {
  data.ns = "http://www.w3.org/2000/svg";
  if (sel !== "foreignObject" && children !== void 0) {
    for (let i = 0; i < children.length; ++i) {
      const childData = children[i].data;
      if (childData !== void 0) {
        addNS(childData, children[i].children, children[i].sel);
      }
    }
  }
}
function h(sel, b, c) {
  var data = {};
  var children;
  var text;
  var i;
  if (c !== void 0) {
    if (b !== null) {
      data = b;
    }
    if (array(c)) {
      children = c;
    } else if (primitive(c)) {
      text = c;
    } else if (c && c.sel) {
      children = [c];
    }
  } else if (b !== void 0 && b !== null) {
    if (array(b)) {
      children = b;
    } else if (primitive(b)) {
      text = b;
    } else if (b && b.sel) {
      children = [b];
    } else {
      data = b;
    }
  }
  if (children !== void 0) {
    for (i = 0; i < children.length; ++i) {
      if (primitive(children[i]))
      children[i] = vnode(void 0, void 0, void 0, children[i], void 0);
    }
  }
  if (sel[0] === "s" && sel[1] === "v" && sel[2] === "g" && (sel.length === 3 || sel[3] === "." || sel[3] === "#")) {
    addNS(data, children, sel);
  }
  return vnode(sel, data, children, text, void 0);
}
function copyToThunk(vnode2, thunk3) {
  vnode2.data.fn = thunk3.data.fn;
  vnode2.data.args = thunk3.data.args;
  thunk3.data = vnode2.data;
  thunk3.children = vnode2.children;
  thunk3.text = vnode2.text;
  thunk3.elm = vnode2.elm;
}
function init$1(thunk3) {
  const cur = thunk3.data;
  const vnode2 = cur.fn.apply(void 0, cur.args);
  copyToThunk(vnode2, thunk3);
}
function prepatch(oldVnode, thunk3) {
  let i;
  const old = oldVnode.data;
  const cur = thunk3.data;
  const oldArgs = old.args;
  const args = cur.args;
  if (old.fn !== cur.fn || oldArgs.length !== args.length) {
    copyToThunk(cur.fn.apply(void 0, args), thunk3);
    return;
  }
  for (i = 0; i < args.length; ++i) {
    if (oldArgs[i] !== args[i]) {
      copyToThunk(cur.fn.apply(void 0, args), thunk3);
      return;
    }
  }
  copyToThunk(oldVnode, thunk3);
}
const thunk = function thunk2(sel, key, fn, args) {
  if (args === void 0) {
    args = fn;
    fn = key;
    key = void 0;
  }
  return h(sel, {
    key,
    hook: { init: init$1, prepatch },
    fn,
    args });

};
var hyperscriptAttributeToProperty = attributeToProperty;
var transform = {
  class: "className",
  for: "htmlFor",
  "http-equiv": "httpEquiv" };

function attributeToProperty(h2) {
  return function (tagName2, attrs, children) {
    for (var attr in attrs) {
      if (attr in transform) {
        attrs[transform[attr]] = attrs[attr];
        delete attrs[attr];
      }
    }
    return h2(tagName2, attrs, children);
  };
}
var VAR = 0,TEXT = 1,OPEN = 2,CLOSE = 3,ATTR = 4;
var ATTR_KEY = 5,ATTR_KEY_W = 6;
var ATTR_VALUE_W = 7,ATTR_VALUE = 8;
var ATTR_VALUE_SQ = 9,ATTR_VALUE_DQ = 10;
var ATTR_EQ = 11,ATTR_BREAK = 12;
var COMMENT = 13;
var hyperx = function (h2, opts) {
  if (!opts)
  opts = {};
  var concat = opts.concat || function (a, b) {
    return String(a) + String(b);
  };
  if (opts.attrToProp !== false) {
    h2 = hyperscriptAttributeToProperty(h2);
  }
  return function (strings) {
    var state = TEXT,reg = "";
    var arglen = arguments.length;
    var parts = [];
    for (var i = 0; i < strings.length; i++) {
      if (i < arglen - 1) {
        var arg = arguments[i + 1];
        var p = parse(strings[i]);
        var xstate = state;
        if (xstate === ATTR_VALUE_DQ)
        xstate = ATTR_VALUE;
        if (xstate === ATTR_VALUE_SQ)
        xstate = ATTR_VALUE;
        if (xstate === ATTR_VALUE_W)
        xstate = ATTR_VALUE;
        if (xstate === ATTR)
        xstate = ATTR_KEY;
        if (xstate === OPEN) {
          if (reg === "/") {
            p.push([OPEN, "/", arg]);
            reg = "";
          } else {
            p.push([OPEN, arg]);
          }
        } else if (xstate === COMMENT && opts.comments) {
          reg += String(arg);
        } else if (xstate !== COMMENT) {
          p.push([VAR, xstate, arg]);
        }
        parts.push.apply(parts, p);
      } else
      parts.push.apply(parts, parse(strings[i]));
    }
    var tree = [null, {}, []];
    var stack = [[tree, -1]];
    for (var i = 0; i < parts.length; i++) {
      var cur = stack[stack.length - 1][0];
      var p = parts[i],s = p[0];
      if (s === OPEN && /^\//.test(p[1])) {
        var ix = stack[stack.length - 1][1];
        if (stack.length > 1) {
          stack.pop();
          stack[stack.length - 1][0][2][ix] = h2(cur[0], cur[1], cur[2].length ? cur[2] : void 0);
        }
      } else if (s === OPEN) {
        var c = [p[1], {}, []];
        cur[2].push(c);
        stack.push([c, cur[2].length - 1]);
      } else if (s === ATTR_KEY || s === VAR && p[1] === ATTR_KEY) {
        var key = "";
        var copyKey;
        for (; i < parts.length; i++) {
          if (parts[i][0] === ATTR_KEY) {
            key = concat(key, parts[i][1]);
          } else if (parts[i][0] === VAR && parts[i][1] === ATTR_KEY) {
            if (typeof parts[i][2] === "object" && !key) {
              for (copyKey in parts[i][2]) {
                if (parts[i][2].hasOwnProperty(copyKey) && !cur[1][copyKey]) {
                  cur[1][copyKey] = parts[i][2][copyKey];
                }
              }
            } else {
              key = concat(key, parts[i][2]);
            }
          } else
          break;
        }
        if (parts[i][0] === ATTR_EQ)
        i++;
        var j = i;
        for (; i < parts.length; i++) {
          if (parts[i][0] === ATTR_VALUE || parts[i][0] === ATTR_KEY) {
            if (!cur[1][key])
            cur[1][key] = strfn(parts[i][1]);else

            parts[i][1] === "" || (cur[1][key] = concat(cur[1][key], parts[i][1]));
          } else if (parts[i][0] === VAR && (parts[i][1] === ATTR_VALUE || parts[i][1] === ATTR_KEY)) {
            if (!cur[1][key])
            cur[1][key] = strfn(parts[i][2]);else

            parts[i][2] === "" || (cur[1][key] = concat(cur[1][key], parts[i][2]));
          } else {
            if (key.length && !cur[1][key] && i === j && (parts[i][0] === CLOSE || parts[i][0] === ATTR_BREAK)) {
              cur[1][key] = key.toLowerCase();
            }
            if (parts[i][0] === CLOSE) {
              i--;
            }
            break;
          }
        }
      } else if (s === ATTR_KEY) {
        cur[1][p[1]] = true;
      } else if (s === VAR && p[1] === ATTR_KEY) {
        cur[1][p[2]] = true;
      } else if (s === CLOSE) {
        if (selfClosing(cur[0]) && stack.length) {
          var ix = stack[stack.length - 1][1];
          stack.pop();
          stack[stack.length - 1][0][2][ix] = h2(cur[0], cur[1], cur[2].length ? cur[2] : void 0);
        }
      } else if (s === VAR && p[1] === TEXT) {
        if (p[2] === void 0 || p[2] === null)
        p[2] = "";else
        if (!p[2])
        p[2] = concat("", p[2]);
        if (Array.isArray(p[2][0])) {
          cur[2].push.apply(cur[2], p[2]);
        } else {
          cur[2].push(p[2]);
        }
      } else if (s === TEXT) {
        cur[2].push(p[1]);
      } else if (s === ATTR_EQ || s === ATTR_BREAK)
      ;else
      {
        throw new Error("unhandled: " + s);
      }
    }
    if (tree[2].length > 1 && /^\s*$/.test(tree[2][0])) {
      tree[2].shift();
    }
    if (tree[2].length > 2 || tree[2].length === 2 && /\S/.test(tree[2][1])) {
      if (opts.createFragment)
      return opts.createFragment(tree[2]);
      throw new Error("multiple root elements must be wrapped in an enclosing tag");
    }
    if (Array.isArray(tree[2][0]) && typeof tree[2][0][0] === "string" && Array.isArray(tree[2][0][2])) {
      tree[2][0] = h2(tree[2][0][0], tree[2][0][1], tree[2][0][2]);
    }
    return tree[2][0];
    function parse(str) {
      var res = [];
      if (state === ATTR_VALUE_W)
      state = ATTR;
      for (var i2 = 0; i2 < str.length; i2++) {
        var c2 = str.charAt(i2);
        if (state === TEXT && c2 === "<") {
          if (reg.length)
          res.push([TEXT, reg]);
          reg = "";
          state = OPEN;
        } else if (c2 === ">" && !quot(state) && state !== COMMENT) {
          if (state === OPEN && reg.length) {
            res.push([OPEN, reg]);
          } else if (state === ATTR_KEY) {
            res.push([ATTR_KEY, reg]);
          } else if (state === ATTR_VALUE && reg.length) {
            res.push([ATTR_VALUE, reg]);
          }
          res.push([CLOSE]);
          reg = "";
          state = TEXT;
        } else if (state === COMMENT && /-$/.test(reg) && c2 === "-") {
          if (opts.comments) {
            res.push([ATTR_VALUE, reg.substr(0, reg.length - 1)]);
          }
          reg = "";
          state = TEXT;
        } else if (state === OPEN && /^!--$/.test(reg)) {
          if (opts.comments) {
            res.push([OPEN, reg], [ATTR_KEY, "comment"], [ATTR_EQ]);
          }
          reg = c2;
          state = COMMENT;
        } else if (state === TEXT || state === COMMENT) {
          reg += c2;
        } else if (state === OPEN && c2 === "/" && reg.length)
        ;else
        if (state === OPEN && /\s/.test(c2)) {
          if (reg.length) {
            res.push([OPEN, reg]);
          }
          reg = "";
          state = ATTR;
        } else if (state === OPEN) {
          reg += c2;
        } else if (state === ATTR && /[^\s"'=/]/.test(c2)) {
          state = ATTR_KEY;
          reg = c2;
        } else if (state === ATTR && /\s/.test(c2)) {
          if (reg.length)
          res.push([ATTR_KEY, reg]);
          res.push([ATTR_BREAK]);
        } else if (state === ATTR_KEY && /\s/.test(c2)) {
          res.push([ATTR_KEY, reg]);
          reg = "";
          state = ATTR_KEY_W;
        } else if (state === ATTR_KEY && c2 === "=") {
          res.push([ATTR_KEY, reg], [ATTR_EQ]);
          reg = "";
          state = ATTR_VALUE_W;
        } else if (state === ATTR_KEY) {
          reg += c2;
        } else if ((state === ATTR_KEY_W || state === ATTR) && c2 === "=") {
          res.push([ATTR_EQ]);
          state = ATTR_VALUE_W;
        } else if ((state === ATTR_KEY_W || state === ATTR) && !/\s/.test(c2)) {
          res.push([ATTR_BREAK]);
          if (/[\w-]/.test(c2)) {
            reg += c2;
            state = ATTR_KEY;
          } else
          state = ATTR;
        } else if (state === ATTR_VALUE_W && c2 === '"') {
          state = ATTR_VALUE_DQ;
        } else if (state === ATTR_VALUE_W && c2 === "'") {
          state = ATTR_VALUE_SQ;
        } else if (state === ATTR_VALUE_DQ && c2 === '"') {
          res.push([ATTR_VALUE, reg], [ATTR_BREAK]);
          reg = "";
          state = ATTR;
        } else if (state === ATTR_VALUE_SQ && c2 === "'") {
          res.push([ATTR_VALUE, reg], [ATTR_BREAK]);
          reg = "";
          state = ATTR;
        } else if (state === ATTR_VALUE_W && !/\s/.test(c2)) {
          state = ATTR_VALUE;
          i2--;
        } else if (state === ATTR_VALUE && /\s/.test(c2)) {
          res.push([ATTR_VALUE, reg], [ATTR_BREAK]);
          reg = "";
          state = ATTR;
        } else if (state === ATTR_VALUE || state === ATTR_VALUE_SQ || state === ATTR_VALUE_DQ) {
          reg += c2;
        }
      }
      if (state === TEXT && reg.length) {
        res.push([TEXT, reg]);
        reg = "";
      } else if (state === ATTR_VALUE && reg.length) {
        res.push([ATTR_VALUE, reg]);
        reg = "";
      } else if (state === ATTR_VALUE_DQ && reg.length) {
        res.push([ATTR_VALUE, reg]);
        reg = "";
      } else if (state === ATTR_VALUE_SQ && reg.length) {
        res.push([ATTR_VALUE, reg]);
        reg = "";
      } else if (state === ATTR_KEY) {
        res.push([ATTR_KEY, reg]);
        reg = "";
      }
      return res;
    }
  };
  function strfn(x) {
    if (typeof x === "function")
    return x;else
    if (typeof x === "string")
    return x;else
    if (x && typeof x === "object")
    return x;else
    if (x === null || x === void 0)
    return x;else

    return concat("", x);
  }
};
function quot(state) {
  return state === ATTR_VALUE_SQ || state === ATTR_VALUE_DQ;
}
var closeRE = RegExp("^(" + [
"area",
"base",
"basefont",
"bgsound",
"br",
"col",
"command",
"embed",
"frame",
"hr",
"img",
"input",
"isindex",
"keygen",
"link",
"meta",
"param",
"source",
"track",
"wbr",
"!--",
"animate",
"animateTransform",
"circle",
"cursor",
"desc",
"ellipse",
"feBlend",
"feColorMatrix",
"feComposite",
"feConvolveMatrix",
"feDiffuseLighting",
"feDisplacementMap",
"feDistantLight",
"feFlood",
"feFuncA",
"feFuncB",
"feFuncG",
"feFuncR",
"feGaussianBlur",
"feImage",
"feMergeNode",
"feMorphology",
"feOffset",
"fePointLight",
"feSpecularLighting",
"feSpotLight",
"feTile",
"feTurbulence",
"font-face-format",
"font-face-name",
"font-face-uri",
"glyph",
"glyphRef",
"hkern",
"image",
"line",
"missing-glyph",
"mpath",
"path",
"polygon",
"polyline",
"rect",
"set",
"stop",
"tref",
"use",
"view",
"vkern"].
join("|") + ")(?:[.#][a-zA-Z0-9\x7F-\uFFFF_:-]+)*$");
function selfClosing(tag) {
  return closeRE.test(tag);
}
function create(modules, options = {}) {
  const directive = options.directive || "@";
  function createElement2(sel, input, content) {
    if (content && content.length) {
      if (content.length === 1)
      content = content[0];else

      content = [].concat.apply([], content);
    }
    const names = Object.keys(input);
    if (!names || !names.length)
    return h(sel, content);
    const data = {};
    for (let i = 0, max = names.length; max > i; i++) {
      const name = names[i];
      if (input[name] === "false")
      input[name] = false;
      if (name.indexOf(directive) === 0) {
        const parts = name.slice(1).split(":");
        let previous = data;
        for (let p = 0, pmax = parts.length, last = pmax - 1; p < pmax; p++) {
          const part = parts[p];
          if (p === last)
          previous[part] = input[name];else
          if (!previous[part])
          previous = previous[part] = {};else

          previous = previous[part];
        }
      } else {
        if (!data.attrs)
        data.attrs = {};
        data.attrs[name] = input[name];
      }
    }
    return h(sel, data, content);
  }
  const patch = init(modules || []);
  const snabby = hyperx(createElement2, { attrToProp: false });
  snabby.update = function update(dest, src) {
    return patch(dest, src);
  };
  snabby.thunk = thunk;
  return snabby;
}
const xlinkNS = "http://www.w3.org/1999/xlink";
const xmlNS = "http://www.w3.org/XML/1998/namespace";
const colonChar = 58;
const xChar = 120;
function updateAttrs(oldVnode, vnode2) {
  var key;
  var elm = vnode2.elm;
  var oldAttrs = oldVnode.data.attrs;
  var attrs = vnode2.data.attrs;
  if (!oldAttrs && !attrs)
  return;
  if (oldAttrs === attrs)
  return;
  oldAttrs = oldAttrs || {};
  attrs = attrs || {};
  for (key in attrs) {
    const cur = attrs[key];
    const old = oldAttrs[key];
    if (old !== cur) {
      if (cur === true) {
        elm.setAttribute(key, "");
      } else if (cur === false) {
        elm.removeAttribute(key);
      } else {
        if (key.charCodeAt(0) !== xChar) {
          elm.setAttribute(key, cur);
        } else if (key.charCodeAt(3) === colonChar) {
          elm.setAttributeNS(xmlNS, key, cur);
        } else if (key.charCodeAt(5) === colonChar) {
          elm.setAttributeNS(xlinkNS, key, cur);
        } else {
          elm.setAttribute(key, cur);
        }
      }
    }
  }
  for (key in oldAttrs) {
    if (!(key in attrs)) {
      elm.removeAttribute(key);
    }
  }
}
const attributesModule = { create: updateAttrs, update: updateAttrs };
function updateClass(oldVnode, vnode2) {
  var cur;
  var name;
  var elm = vnode2.elm;
  var oldClass = oldVnode.data.class;
  var klass = vnode2.data.class;
  if (!oldClass && !klass)
  return;
  if (oldClass === klass)
  return;
  oldClass = oldClass || {};
  klass = klass || {};
  for (name in oldClass) {
    if (oldClass[name] && !Object.prototype.hasOwnProperty.call(klass, name)) {
      elm.classList.remove(name);
    }
  }
  for (name in klass) {
    cur = klass[name];
    if (cur !== oldClass[name]) {
      elm.classList[cur ? "add" : "remove"](name);
    }
  }
}
const classModule = { create: updateClass, update: updateClass };
function updateProps(oldVnode, vnode2) {
  var key;
  var cur;
  var old;
  var elm = vnode2.elm;
  var oldProps = oldVnode.data.props;
  var props = vnode2.data.props;
  if (!oldProps && !props)
  return;
  if (oldProps === props)
  return;
  oldProps = oldProps || {};
  props = props || {};
  for (key in props) {
    cur = props[key];
    old = oldProps[key];
    if (old !== cur && (key !== "value" || elm[key] !== cur)) {
      elm[key] = cur;
    }
  }
}
const propsModule = { create: updateProps, update: updateProps };
var raf = typeof window !== "undefined" && window.requestAnimationFrame.bind(window) || setTimeout;
var nextFrame = function (fn) {
  raf(function () {
    raf(fn);
  });
};
var reflowForced = false;
function setNextFrame(obj, prop, val) {
  nextFrame(function () {
    obj[prop] = val;
  });
}
function updateStyle(oldVnode, vnode2) {
  var cur;
  var name;
  var elm = vnode2.elm;
  var oldStyle = oldVnode.data.style;
  var style = vnode2.data.style;
  if (!oldStyle && !style)
  return;
  if (oldStyle === style)
  return;
  oldStyle = oldStyle || {};
  style = style || {};
  var oldHasDel = ("delayed" in oldStyle);
  for (name in oldStyle) {
    if (!style[name]) {
      if (name[0] === "-" && name[1] === "-") {
        elm.style.removeProperty(name);
      } else {
        elm.style[name] = "";
      }
    }
  }
  for (name in style) {
    cur = style[name];
    if (name === "delayed" && style.delayed) {
      for (const name2 in style.delayed) {
        cur = style.delayed[name2];
        if (!oldHasDel || cur !== oldStyle.delayed[name2]) {
          setNextFrame(elm.style, name2, cur);
        }
      }
    } else if (name !== "remove" && cur !== oldStyle[name]) {
      if (name[0] === "-" && name[1] === "-") {
        elm.style.setProperty(name, cur);
      } else {
        elm.style[name] = cur;
      }
    }
  }
}
function applyDestroyStyle(vnode2) {
  var style;
  var name;
  var elm = vnode2.elm;
  var s = vnode2.data.style;
  if (!s || !(style = s.destroy))
  return;
  for (name in style) {
    elm.style[name] = style[name];
  }
}
function applyRemoveStyle(vnode2, rm) {
  var s = vnode2.data.style;
  if (!s || !s.remove) {
    rm();
    return;
  }
  if (!reflowForced) {
    vnode2.elm.offsetLeft;
    reflowForced = true;
  }
  var name;
  var elm = vnode2.elm;
  var i = 0;
  var compStyle;
  var style = s.remove;
  var amount = 0;
  var applied = [];
  for (name in style) {
    applied.push(name);
    elm.style[name] = style[name];
  }
  compStyle = getComputedStyle(elm);
  var props = compStyle["transition-property"].split(", ");
  for (; i < props.length; ++i) {
    if (applied.indexOf(props[i]) !== -1)
    amount++;
  }
  elm.addEventListener("transitionend", function (ev) {
    if (ev.target === elm)
    --amount;
    if (amount === 0)
    rm();
  });
}
function forceReflow() {
  reflowForced = false;
}
const styleModule = {
  pre: forceReflow,
  create: updateStyle,
  update: updateStyle,
  destroy: applyDestroyStyle,
  remove: applyRemoveStyle };

function invokeHandler(handler, vnode2, event) {
  if (typeof handler === "function") {
    handler.call(vnode2, event, vnode2);
  } else if (typeof handler === "object") {
    for (var i = 0; i < handler.length; i++) {
      invokeHandler(handler[i], vnode2, event);
    }
  }
}
function handleEvent(event, vnode2) {
  var name = event.type;
  var on = vnode2.data.on;
  if (on && on[name]) {
    invokeHandler(on[name], vnode2, event);
  }
}
function createListener() {
  return function handler(event) {
    handleEvent(event, handler.vnode);
  };
}
function updateEventListeners(oldVnode, vnode2) {
  var oldOn = oldVnode.data.on;
  var oldListener = oldVnode.listener;
  var oldElm = oldVnode.elm;
  var on = vnode2 && vnode2.data.on;
  var elm = vnode2 && vnode2.elm;
  var name;
  if (oldOn === on) {
    return;
  }
  if (oldOn && oldListener) {
    if (!on) {
      for (name in oldOn) {
        oldElm.removeEventListener(name, oldListener, false);
      }
    } else {
      for (name in oldOn) {
        if (!on[name]) {
          oldElm.removeEventListener(name, oldListener, false);
        }
      }
    }
  }
  if (on) {
    var listener = vnode2.listener = oldVnode.listener || createListener();
    listener.vnode = vnode2;
    if (!oldOn) {
      for (name in on) {
        elm.addEventListener(name, listener, false);
      }
    } else {
      for (name in on) {
        if (!oldOn[name]) {
          elm.addEventListener(name, listener, false);
        }
      }
    }
  }
}
const eventListenersModule = {
  create: updateEventListeners,
  update: updateEventListeners,
  destroy: updateEventListeners };

var index = create([
attributesModule,
eventListenersModule,
classModule,
propsModule,
styleModule]);

const css = `
.gator-tabs-container {
  display:flex;
  flex-direction:column;
  width:100%;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}

.gator-tabs-header {
  background-color: whitesmoke;
  display:flex;
  flex-wrap:wrap;
  padding:0;
  margin: 0;
  list-style:none;
   box-sizing:border-box;
}

.gator-tabs-header > li {
  color: black;
  cursor:pointer;
  flex-grow:1;
  padding: .375rem;
  padding-left: 1em;
  font-size:0.7rem;
  user-select: none;
  border-right: 1px solid #e0e0e0;
  border-radius: 4px;
}

.gator-tabs {
  display:flex;
  background-color: white;
  margin: 0;
  padding: 0;
}

.gator-tab {
  padding: 1rem;
  color: black;
}`;


function init$2 (options={}) {
    return {
        selectedTabIdx: (options.selectedIndex === undefined) ? 0 : options.selectedIndex,
        headers: options.headers || [ ]
    }
}


function view (model, tabViews, update) {
    const _setTab = function (idx) {
        model.selectedTabIdx = idx;
        update();
    };

    const headers = model.headers.map((t, idx) => {
        return index`<li @style:color=${idx === model.selectedTabIdx ? 'black' : '#444'}
                        @style:background-color=${idx === model.selectedTabIdx ? 'white' : ''}
                        @on:click=${() => _setTab(idx)}> ${t}</li>`
    });

    const tabs = tabViews.map((t, idx) => {
        return index`<li class="gator-tab"
                        @style:display=${idx === model.selectedTabIdx ? 'flex' : 'none'}>${t}</li>`
    });

    return index`<div class="gator-tabs-container">
        <style>${css}</style>
        <ul class="gator-tabs-header">${headers}</ul>
        <ul class="gator-tabs">${tabs}</ul>
    </div>`;
}


var tabs = { init: init$2, view };

export default tabs;
