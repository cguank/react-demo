import React, { useState } from 'react';

/**
 * React 如何区分 Single Child 和 Children Array
 * 
 * 核心问题：
 * 1. JSX 编译后是什么样的？
 * 2. React 如何在 reconciliation 时区分单个还是多个 children？
 * 3. Fiber 是链表结构，为什么还需要区分？
 * 4. newChild 从哪里来？
 */

export default function SingleVsArrayChildrenAnalysis() {
  const [showExample, setShowExample] = useState(1);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>⚛️ React 如何区分 Single Child vs Array Children</h1>
      
      {/* 第一部分：核心答案 */}
      <div style={{ background: '#fff3e0', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>🎯 核心答案</h2>
        
        <div style={{ background: '#fff', padding: '15px', borderRadius: '5px', marginBottom: '15px' }}>
          <h3>关键点</h3>
          <pre style={{ background: '#f5f5f5', padding: '15px', overflow: 'auto', fontSize: '14px' }}>
{`1. 区分发生在哪里？
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   在 reconcileChildFibers 函数中，通过检查 newChild 的类型来区分：
   
   - newChild 是对象 + 有 $$typeof → Single Element
   - newChild 是 Array.isArray() → Children Array
   - newChild 是 string/number → Text Node

2. newChild 从哪里来？
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   来自组件 render 的返回值（props.children）
   
   JSX:  <Parent><Child /></Parent>
         ↓ Babel 编译
   JS:   React.createElement(Parent, null, 
           React.createElement(Child, null)  // ← 单个 ReactElement 对象
         )
   
   JSX:  <Parent><Child1 /><Child2 /></Parent>
         ↓ Babel 编译
   JS:   React.createElement(Parent, null,
           React.createElement(Child1, null),  // ← 多个参数
           React.createElement(Child2, null)
         )
         ↓ createElement 内部处理
   结果: props.children = [ReactElement, ReactElement]  // ← 数组！

3. Fiber 虽然是链表，但输入是数组
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   - newChild（输入）：来自 JSX，可能是单个对象或数组
   - Fiber（输出）：始终是链表结构（child + sibling）
   
   reconcileChildFibers 的工作：
   将输入（单个/数组）转换为输出（链表）`}
          </pre>
        </div>
      </div>

      {/* 第二部分：JSX 编译过程 */}
      <div style={{ background: '#e3f2fd', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>📝 JSX 编译过程详解</h2>
        
        <div style={{ background: '#fff', padding: '15px', borderRadius: '5px', marginBottom: '15px' }}>
          <h3>示例 1：单个子元素</h3>
          <pre style={{ background: '#f5f5f5', padding: '10px', overflow: 'auto', fontSize: '13px' }}>
{`JSX 代码：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function Parent() {
  return (
    <div>
      <Child />
    </div>
  );
}

Babel 编译后：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function Parent() {
  return React.createElement(
    "div",
    null,
    React.createElement(Child, null)  // ← 单个参数
  );
}

createElement 内部处理：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// packages/react/src/ReactElement.js (line 362-430)

export function createElement(type, config, children) {
  const childrenLength = arguments.length - 2;
  
  if (childrenLength === 1) {
    // 只有一个 child
    props.children = children;  // ← 直接赋值，不是数组！
    
  } else if (childrenLength > 1) {
    // 多个 children
    const childArray = Array(childrenLength);
    for (let i = 0; i < childrenLength; i++) {
      childArray[i] = arguments[i + 2];
    }
    props.children = childArray;  // ← 数组！
  }
  
  return ReactElement(type, key, ref, props, ...);
}

返回的 ReactElement 对象：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

{
  $$typeof: Symbol(react.element),
  type: "div",
  key: null,
  ref: null,
  props: {
    children: {  // ← 注意：children 是单个对象！
      $$typeof: Symbol(react.element),
      type: Child,
      key: null,
      props: {},
      // ...
    }
  }
}

在 reconcileChildFibers 中：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

reconcileChildFibers(
  returnFiber,
  currentFirstChild,
  newChild,  // ← 这里是 props.children，单个对象！
  lanes
)

判断逻辑：
if (typeof newChild === 'object' && newChild !== null) {
  switch (newChild.$$typeof) {
    case REACT_ELEMENT_TYPE:
      // ✅ 走这里！单个元素的处理逻辑
      return placeSingleChild(
        reconcileSingleElement(...)
      );
  }
}`}
          </pre>
        </div>

        <div style={{ background: '#fff', padding: '15px', borderRadius: '5px', marginBottom: '15px' }}>
          <h3>示例 2：多个子元素</h3>
          <pre style={{ background: '#f5f5f5', padding: '10px', overflow: 'auto', fontSize: '13px' }}>
{`JSX 代码：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function Parent() {
  return (
    <div>
      <Child1 />
      <Child2 />
      <Child3 />
    </div>
  );
}

Babel 编译后：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function Parent() {
  return React.createElement(
    "div",
    null,
    React.createElement(Child1, null),  // ← 参数 1
    React.createElement(Child2, null),  // ← 参数 2
    React.createElement(Child3, null)   // ← 参数 3
  );
}

createElement 内部处理：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function createElement(type, config, children) {
  const childrenLength = arguments.length - 2;  // = 3
  
  if (childrenLength === 1) {
    props.children = children;
    
  } else if (childrenLength > 1) {
    // ✅ 走这里！
    const childArray = Array(childrenLength);  // [empty × 3]
    for (let i = 0; i < childrenLength; i++) {
      childArray[i] = arguments[i + 2];
    }
    props.children = childArray;  // ← 赋值为数组！
  }
  
  return ReactElement(type, key, ref, props, ...);
}

返回的 ReactElement 对象：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

{
  $$typeof: Symbol(react.element),
  type: "div",
  key: null,
  ref: null,
  props: {
    children: [  // ← 注意：children 是数组！
      {
        $$typeof: Symbol(react.element),
        type: Child1,
        // ...
      },
      {
        $$typeof: Symbol(react.element),
        type: Child2,
        // ...
      },
      {
        $$typeof: Symbol(react.element),
        type: Child3,
        // ...
      }
    ]
  }
}

在 reconcileChildFibers 中：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

reconcileChildFibers(
  returnFiber,
  currentFirstChild,
  newChild,  // ← 这里是 props.children，数组！
  lanes
)

判断逻辑：
if (typeof newChild === 'object' && newChild !== null) {
  switch (newChild.$$typeof) {
    case REACT_ELEMENT_TYPE:
      // ❌ 不走这里，因为 Array 没有 $$typeof
  }
  
  if (isArray(newChild)) {
    // ✅ 走这里！数组的处理逻辑
    return reconcileChildrenArray(
      returnFiber,
      currentFirstChild,
      newChild,  // 传入数组
      lanes
    );
  }
}`}
          </pre>
        </div>

        <div style={{ background: '#fff', padding: '15px', borderRadius: '5px' }}>
          <h3>示例 3：显式数组</h3>
          <pre style={{ background: '#f5f5f5', padding: '10px', overflow: 'auto', fontSize: '13px' }}>
{`JSX 代码：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function Parent() {
  const items = [1, 2, 3];
  return (
    <div>
      {items.map(item => <Child key={item} />)}
    </div>
  );
}

Babel 编译后：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function Parent() {
  const items = [1, 2, 3];
  return React.createElement(
    "div",
    null,
    items.map(item => React.createElement(Child, { key: item }))
    // ← 注意：这里直接传入的就是数组！
  );
}

createElement 内部处理：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function createElement(type, config, children) {
  const childrenLength = arguments.length - 2;  // = 1
  
  if (childrenLength === 1) {
    // ✅ 走这里！
    props.children = children;  // children 本身就是数组
    // 不是因为只有一个参数就不是数组，而是直接赋值
  }
  
  return ReactElement(type, key, ref, props, ...);
}

返回的 ReactElement 对象：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

{
  $$typeof: Symbol(react.element),
  type: "div",
  key: null,
  props: {
    children: [  // ← 数组！（来自 map 的返回值）
      { $$typeof: Symbol(react.element), type: Child, key: "1", ... },
      { $$typeof: Symbol(react.element), type: Child, key: "2", ... },
      { $$typeof: Symbol(react.element), type: Child, key: "3", ... }
    ]
  }
}

在 reconcileChildFibers 中：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

判断逻辑：
if (isArray(newChild)) {
  // ✅ 走这里！
  return reconcileChildrenArray(...);
}`}
          </pre>
        </div>
      </div>

      {/* 第三部分：reconcileChildFibers 源码分析 */}
      <div style={{ background: '#e8f5e9', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>🔍 reconcileChildFibers 源码分析</h2>
        
        <div style={{ background: '#fff', padding: '15px', borderRadius: '5px', marginBottom: '15px' }}>
          <h3>完整的判断流程</h3>
          <pre style={{ background: '#f5f5f5', padding: '10px', overflow: 'auto', fontSize: '13px' }}>
{`// packages/react-reconciler/src/ReactChildFiber.old.js (line 1245-1344)

function reconcileChildFibers(
  returnFiber: Fiber,
  currentFirstChild: Fiber | null,
  newChild: any,  // ← 关键参数！来自 props.children
  lanes: Lanes,
): Fiber | null {
  
  // Step 1: 处理顶层无 key 的 Fragment
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const isUnkeyedTopLevelFragment =
    typeof newChild === 'object' &&
    newChild !== null &&
    newChild.type === REACT_FRAGMENT_TYPE &&
    newChild.key === null;
  
  if (isUnkeyedTopLevelFragment) {
    // <>{children}</>  会被展开
    newChild = newChild.props.children;
  }
  
  // Step 2: 处理对象类型
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (typeof newChild === 'object' && newChild !== null) {
    
    // 2.1 检查 $$typeof（单个 ReactElement）
    switch (newChild.$$typeof) {
      case REACT_ELEMENT_TYPE:
        // ✅ 单个元素！
        return placeSingleChild(
          reconcileSingleElement(
            returnFiber,
            currentFirstChild,
            newChild,
            lanes,
          ),
        );
      
      case REACT_PORTAL_TYPE:
        // ✅ Portal（单个）
        return placeSingleChild(
          reconcileSinglePortal(...)
        );
      
      case REACT_LAZY_TYPE:
        // ✅ Lazy 组件（需要递归处理）
        const payload = newChild._payload;
        const init = newChild._init;
        return reconcileChildFibers(
          returnFiber,
          currentFirstChild,
          init(payload),  // 解析后递归
          lanes,
        );
    }
    
    // 2.2 检查是否是数组
    if (isArray(newChild)) {
      // ✅ 数组！
      return reconcileChildrenArray(
        returnFiber,
        currentFirstChild,
        newChild,  // 传入整个数组
        lanes,
      );
    }
    
    // 2.3 检查是否是可迭代对象
    if (getIteratorFn(newChild)) {
      // ✅ Iterable（如 Set、Map）
      return reconcileChildrenIterator(
        returnFiber,
        currentFirstChild,
        newChild,
        lanes,
      );
    }
    
    // 2.4 其他对象类型（错误）
    throwOnInvalidObjectType(returnFiber, newChild);
  }
  
  // Step 3: 处理字符串或数字（Text Node）
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (
    (typeof newChild === 'string' && newChild !== '') ||
    typeof newChild === 'number'
  ) {
    // ✅ 文本节点（单个）
    return placeSingleChild(
      reconcileSingleTextNode(
        returnFiber,
        currentFirstChild,
        '' + newChild,
        lanes,
      ),
    );
  }
  
  // Step 4: 其他情况视为 null/undefined（删除所有子节点）
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  return deleteRemainingChildren(returnFiber, currentFirstChild);
}

判断顺序总结：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Fragment 展开 → newChild = fragment.props.children
2. 对象 + 有 $$typeof → 单个元素（reconcileSingleElement）
3. 对象 + 是数组 → 数组元素（reconcileChildrenArray）
4. 对象 + 可迭代 → 迭代器（reconcileChildrenIterator）
5. 字符串/数字 → 文本节点（reconcileSingleTextNode）
6. 其他 → 删除所有子节点

关键点：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ 通过 newChild 的类型来区分
✅ newChild 来自 props.children
✅ props.children 在 createElement 中被处理：
   - 单个参数 → 直接赋值（可能是对象或数组）
   - 多个参数 → 包装成数组
✅ 区分发生在处理输入时，而不是处理 Fiber 结构时`}
          </pre>
        </div>
      </div>

      {/* 第四部分：为什么需要区分 */}
      <div style={{ background: '#fce4ec', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>🤔 为什么 Fiber 是链表还需要区分？</h2>
        
        <div style={{ background: '#fff', padding: '15px', borderRadius: '5px', marginBottom: '15px' }}>
          <h3>关键理解</h3>
          <pre style={{ background: '#f5f5f5', padding: '10px', overflow: 'auto', fontSize: '13px' }}>
{`问题的核心混淆：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

"Fiber 是链表结构" 说的是 **输出**
"需要区分 single/array" 说的是 **输入**

它们是两个不同的阶段！

输入阶段（JSX → props.children）：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

<div><Child /></div>
  ↓ createElement
props.children = { $$typeof: REACT_ELEMENT_TYPE, ... }  // 单个对象

<div><Child1 /><Child2 /></div>
  ↓ createElement
props.children = [                                       // 数组
  { $$typeof: REACT_ELEMENT_TYPE, ... },
  { $$typeof: REACT_ELEMENT_TYPE, ... }
]

处理阶段（reconcileChildFibers）：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

newChild = props.children

if (newChild.$$typeof === REACT_ELEMENT_TYPE) {
  // 单个元素 → 调用 reconcileSingleElement
  // 创建一个 Fiber 节点
  
} else if (isArray(newChild)) {
  // 数组 → 调用 reconcileChildrenArray
  // 遍历数组，为每个元素创建 Fiber 节点
  // 并用 sibling 连接它们
}

输出阶段（Fiber 链表结构）：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

无论输入是单个还是数组，输出都是 Fiber 链表：

单个子元素：
  Parent.child → Child
  Child.sibling → null

多个子元素：
  Parent.child → Child1
  Child1.sibling → Child2
  Child2.sibling → Child3
  Child3.sibling → null

完整流程图：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

┌─────────────────────────────────────────────────────────┐
│  JSX（源代码）                                          │
└─────────────────────────────────────────────────────────┘
  <div>
    <Child1 />
    <Child2 />
  </div>
         ↓ Babel 编译
┌─────────────────────────────────────────────────────────┐
│  JavaScript（编译后）                                   │
└─────────────────────────────────────────────────────────┘
  React.createElement(
    "div",
    null,
    React.createElement(Child1, null),
    React.createElement(Child2, null)
  )
         ↓ createElement 执行
┌─────────────────────────────────────────────────────────┐
│  ReactElement（输入）                                   │
└─────────────────────────────────────────────────────────┘
  {
    type: "div",
    props: {
      children: [        ← 这是 newChild，是数组！
        { $$typeof: REACT_ELEMENT_TYPE, type: Child1 },
        { $$typeof: REACT_ELEMENT_TYPE, type: Child2 }
      ]
    }
  }
         ↓ reconcileChildFibers
┌─────────────────────────────────────────────────────────┐
│  判断 newChild 类型                                     │
└─────────────────────────────────────────────────────────┘
  isArray(newChild) === true
         ↓
  调用 reconcileChildrenArray(newChild)
         ↓
┌─────────────────────────────────────────────────────────┐
│  reconcileChildrenArray                                 │
└─────────────────────────────────────────────────────────┘
  for (let i = 0; i < newChildren.length; i++) {
    const newFiber = updateSlot(oldFiber, newChildren[i]);
    // 将 Fiber 用 sibling 连接
    previousNewFiber.sibling = newFiber;
  }
         ↓
┌─────────────────────────────────────────────────────────┐
│  Fiber 链表（输出）                                     │
└─────────────────────────────────────────────────────────┘
  div.child → Child1
  Child1.sibling → Child2
  Child2.sibling → null

关键洞察：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. 区分 single/array 是在处理 **输入** 时
2. 输入（newChild）可能是：
   - 单个 ReactElement 对象
   - ReactElement 数组
   - 字符串/数字
   - null/undefined
   
3. 输出（Fiber）始终是链表结构
4. 不同的输入需要不同的处理逻辑：
   - 单个 → reconcileSingleElement（直接创建 Fiber）
   - 数组 → reconcileChildrenArray（遍历创建，sibling 连接）`}
          </pre>
        </div>
      </div>

      {/* 第五部分：可视化对比 */}
      <div style={{ background: '#f3e5f5', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>🎮 可视化对比</h2>
        
        <VisualizationDemo showExample={showExample} setShowExample={setShowExample} />
      </div>

      {/* 第六部分：总结 */}
      <div style={{ background: '#e0f2f1', padding: '20px', borderRadius: '8px' }}>
        <h2>📝 总结</h2>
        
        <FinalSummary />
      </div>
    </div>
  );
}

// 可视化演示
function VisualizationDemo({ showExample, setShowExample }) {
  return (
    <div style={{ background: '#fff', padding: '15px', borderRadius: '5px' }}>
      <h3>实际示例对比</h3>
      
      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={() => setShowExample(1)}
          style={{
            padding: '10px 20px',
            fontSize: '14px',
            background: showExample === 1 ? '#2196f3' : '#e0e0e0',
            color: showExample === 1 ? 'white' : 'black',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          单个子元素
        </button>
        
        <button
          onClick={() => setShowExample(2)}
          style={{
            padding: '10px 20px',
            fontSize: '14px',
            background: showExample === 2 ? '#4caf50' : '#e0e0e0',
            color: showExample === 2 ? 'white' : 'black',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          多个子元素
        </button>
      </div>

      {showExample === 1 && (
        <div>
          <h4>示例 1：单个子元素</h4>
          <pre style={{ background: '#f5f5f5', padding: '15px', fontSize: '13px', lineHeight: '1.8' }}>
{`JSX:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

<div>
  <span>Hello</span>
</div>

编译后：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

React.createElement(
  "div",
  null,
  React.createElement("span", null, "Hello")  // ← 一个参数
)

createElement 结果：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

{
  $$typeof: Symbol(react.element),
  type: "div",
  props: {
    children: {  // ← 单个对象，不是数组！
      $$typeof: Symbol(react.element),
      type: "span",
      props: {
        children: "Hello"
      }
    }
  }
}

reconcileChildFibers 判断：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

newChild = props.children = { $$typeof: ..., type: "span", ... }

typeof newChild === 'object'  ✅
newChild !== null  ✅
newChild.$$typeof === REACT_ELEMENT_TYPE  ✅

→ 调用 reconcileSingleElement

生成的 Fiber 结构：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

div Fiber
  ├─ child → span Fiber
              ├─ child → "Hello" Text Fiber
              └─ sibling → null
  └─ sibling → null`}
          </pre>
        </div>
      )}

      {showExample === 2 && (
        <div>
          <h4>示例 2：多个子元素</h4>
          <pre style={{ background: '#f5f5f5', padding: '15px', fontSize: '13px', lineHeight: '1.8' }}>
{`JSX:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

<div>
  <span>Hello</span>
  <span>World</span>
</div>

编译后：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

React.createElement(
  "div",
  null,
  React.createElement("span", null, "Hello"),  // ← 参数 1
  React.createElement("span", null, "World")   // ← 参数 2
)

createElement 结果：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

{
  $$typeof: Symbol(react.element),
  type: "div",
  props: {
    children: [  // ← 数组！
      {
        $$typeof: Symbol(react.element),
        type: "span",
        props: { children: "Hello" }
      },
      {
        $$typeof: Symbol(react.element),
        type: "span",
        props: { children: "World" }
      }
    ]
  }
}

reconcileChildFibers 判断：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

newChild = props.children = [{ $$typeof: ..., type: "span" }, ...]

typeof newChild === 'object'  ✅
newChild !== null  ✅
newChild.$$typeof === REACT_ELEMENT_TYPE  ❌ (数组没有 $$typeof)
isArray(newChild)  ✅

→ 调用 reconcileChildrenArray

生成的 Fiber 结构：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

div Fiber
  ├─ child → span Fiber (Hello)
              ├─ child → "Hello" Text Fiber
              └─ sibling → span Fiber (World)
                            ├─ child → "World" Text Fiber
                            └─ sibling → null
  └─ sibling → null

关键对比：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

输入不同：
  单个：props.children = { object }
  多个：props.children = [ object, object ]

处理不同：
  单个：reconcileSingleElement（创建一个 Fiber）
  多个：reconcileChildrenArray（遍历创建，sibling 连接）

输出相同：
  都是 Fiber 链表（child + sibling）`}
          </pre>
        </div>
      )}

      <div style={{ background: '#fff9c4', padding: '15px', marginTop: '15px', borderRadius: '5px' }}>
        <h4>🔍 关键观察</h4>
        <ul style={{ fontSize: '14px' }}>
          <li><strong>输入阶段：</strong>单个对象 vs 数组，这是区分的依据</li>
          <li><strong>处理阶段：</strong>不同的函数处理（reconcileSingleElement vs reconcileChildrenArray）</li>
          <li><strong>输出阶段：</strong>都转换为 Fiber 链表结构</li>
          <li><strong>Fiber 链表：</strong>是输出结果，不是输入</li>
        </ul>
      </div>
    </div>
  );
}

// 总结
function FinalSummary() {
  return (
    <div style={{ background: '#fff', padding: '15px', borderRadius: '5px' }}>
      <h3>核心要点</h3>
      
      <div style={{ background: '#e3f2fd', padding: '15px', marginBottom: '15px', borderRadius: '5px' }}>
        <h4>1. 区分发生在哪里？</h4>
        <p style={{ fontSize: '14px' }}>
          在 <code>reconcileChildFibers</code> 函数中，通过检查 <code>newChild</code> 的类型
        </p>
      </div>

      <div style={{ background: '#e8f5e9', padding: '15px', marginBottom: '15px', borderRadius: '5px' }}>
        <h4>2. newChild 从哪里来？</h4>
        <p style={{ fontSize: '14px' }}>
          来自 <code>props.children</code>，由 <code>createElement</code> 在编译时处理：
        </p>
        <ul style={{ fontSize: '14px' }}>
          <li>单个子元素 → <code>children</code> 是对象</li>
          <li>多个子元素 → <code>children</code> 是数组</li>
          <li>显式数组（map）→ <code>children</code> 是数组</li>
        </ul>
      </div>

      <div style={{ background: '#fff9c4', padding: '15px', marginBottom: '15px', borderRadius: '5px' }}>
        <h4>3. 判断逻辑</h4>
        <pre style={{ background: '#fff', padding: '10px', fontSize: '13px' }}>
{`if (newChild.$$typeof === REACT_ELEMENT_TYPE) {
  // 单个元素
  reconcileSingleElement(...)
} else if (isArray(newChild)) {
  // 数组
  reconcileChildrenArray(...)
} else if (typeof newChild === 'string' || typeof newChild === 'number') {
  // 文本节点
  reconcileSingleTextNode(...)
}`}
        </pre>
      </div>

      <div style={{ background: '#ffebee', padding: '15px', marginBottom: '15px', borderRadius: '5px' }}>
        <h4>4. 为什么 Fiber 是链表还需要区分？</h4>
        <p style={{ fontSize: '14px' }}>
          因为：
        </p>
        <ul style={{ fontSize: '14px' }}>
          <li><strong>输入（newChild）：</strong>可能是对象或数组</li>
          <li><strong>处理（reconcile）：</strong>需要根据输入类型选择不同的处理逻辑</li>
          <li><strong>输出（Fiber）：</strong>始终是链表结构</li>
        </ul>
        <p style={{ fontSize: '14px', marginTop: '10px' }}>
          区分是为了正确处理输入，而不是为了生成不同的输出结构！
        </p>
      </div>

      <div style={{ background: '#e0f2f1', padding: '15px', borderRadius: '5px' }}>
        <h4>💡 记忆要点</h4>
        <pre style={{ background: '#fff', padding: '10px', fontSize: '14px' }}>
{`输入 → 处理 → 输出
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

单个对象 → reconcileSingleElement → Fiber 链表
数组     → reconcileChildrenArray → Fiber 链表
文本     → reconcileSingleTextNode → Fiber 链表

无论输入是什么，输出都是 Fiber 链表！
区分是为了选择正确的处理函数。`}
        </pre>
      </div>
    </div>
  );
}
