import React, { useState } from 'react';

/**
 * newChild 从哪里来？完整调用链追踪
 * 
 * 核心问题：
 * 1. newChild 的完整调用链是什么？
 * 2. 它是从 ReactElement.props.children 来的吗？
 * 3. 不同类型组件的处理有什么区别？
 */

export default function NewChildSourceAnalysis() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>⚛️ newChild 从哪里来？完整调用链追踪</h1>
      
      {/* 第一部分：核心答案 */}
      <div style={{ background: '#fff3e0', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>🎯 核心答案</h2>
        
        <div style={{ background: '#fff', padding: '15px', borderRadius: '5px', marginBottom: '15px' }}>
          <h3>是的！newChild 来自 workInProgress.pendingProps.children</h3>
          <pre style={{ background: '#f5f5f5', padding: '15px', overflow: 'auto', fontSize: '14px' }}>
{`完整调用链：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. beginWork(workInProgress)
   ↓
2. updateXXXComponent(workInProgress)  // 根据组件类型
   ├─ updateFunctionComponent
   ├─ updateClassComponent
   ├─ updateHostComponent
   └─ ...
   ↓
3. 获取 nextChildren
   nextChildren = workInProgress.pendingProps.children  ← 关键！
   或
   nextChildren = Component(props)  // 函数组件执行结果
   或
   nextChildren = instance.render()  // 类组件 render 结果
   ↓
4. reconcileChildren(workInProgress, nextChildren)
   ↓
5. reconcileChildFibers(workInProgress.child, nextChildren)
   ↓
   newChild 参数 = nextChildren

关键点：
✅ pendingProps 来自 ReactElement.props
✅ children 是 props 中的一个特殊属性
✅ 不同组件类型有不同的获取方式`}
          </pre>
        </div>
      </div>

      {/* 第二部分：完整调用链图 */}
      <div style={{ background: '#e3f2fd', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>🔄 完整调用链详解</h2>
        
        <CompleteCallChain />
      </div>

      {/* 第三部分：不同组件类型的处理 */}
      <div style={{ background: '#e8f5e9', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>📝 不同组件类型的 children 获取</h2>
        
        <DifferentComponentTypes />
      </div>

      {/* 第四部分：源码证据 */}
      <div style={{ background: '#fce4ec', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>📂 源码证据</h2>
        
        <SourceCodeEvidence />
      </div>

      {/* 第五部分：实例追踪 */}
      <div style={{ background: '#f3e5f5', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>🔍 实例追踪</h2>
        
        <ExampleTracing />
      </div>

      {/* 第六部分：总结 */}
      <div style={{ background: '#e0f2f1', padding: '20px', borderRadius: '8px' }}>
        <h2>📝 总结</h2>
        
        <FinalSummary />
      </div>
    </div>
  );
}

// 完整调用链
function CompleteCallChain() {
  return (
    <div style={{ background: '#fff', padding: '15px', borderRadius: '5px' }}>
      <h3>从 JSX 到 newChild 的完整流程</h3>
      
      <pre style={{ background: '#f5f5f5', padding: '15px', overflow: 'auto', fontSize: '13px', lineHeight: '1.8' }}>
{`步骤 1: JSX 源代码
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function Parent() {
  return (
    <div className="container">
      <Child />
      <span>Hello</span>
    </div>
  );
}

步骤 2: Babel 编译
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function Parent() {
  return React.createElement(
    "div",
    { className: "container" },
    React.createElement(Child, null),
    React.createElement("span", null, "Hello")
  );
}

步骤 3: createElement 执行，创建 ReactElement
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// 返回的 ReactElement
{
  $$typeof: Symbol(react.element),
  type: "div",
  key: null,
  ref: null,
  props: {                          // ← 这是 props
    className: "container",
    children: [                     // ← children 在 props 中！
      {
        $$typeof: Symbol(react.element),
        type: Child,
        props: {},
        // ...
      },
      {
        $$typeof: Symbol(react.element),
        type: "span",
        props: { children: "Hello" },
        // ...
      }
    ]
  },
  _owner: null,
  // ...
}

步骤 4: 创建/更新 Fiber 节点
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// React 在 render 阶段创建 Fiber
const fiber = {
  tag: HostComponent,
  type: "div",
  key: null,
  elementType: "div",
  pendingProps: {                   // ← ReactElement.props 赋值给 pendingProps
    className: "container",
    children: [ ... ]
  },
  memoizedProps: null,              // 上次渲染的 props
  child: null,                      // 第一个子 Fiber
  sibling: null,                    // 兄弟 Fiber
  return: null,                     // 父 Fiber
  // ...
};

步骤 5: beginWork 开始处理
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// packages/react-reconciler/src/ReactFiberBeginWork.old.js

function beginWork(current, workInProgress, renderLanes) {
  // workInProgress 就是上面创建的 Fiber
  
  switch (workInProgress.tag) {
    case HostComponent:
      // 对于 <div>，调用 updateHostComponent
      return updateHostComponent(
        current,
        workInProgress,
        renderLanes
      );
    
    case FunctionComponent:
      return updateFunctionComponent(...);
    
    // ... 其他组件类型
  }
}

步骤 6: updateHostComponent（原生 DOM 元素）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function updateHostComponent(
  current: Fiber | null,
  workInProgress: Fiber,
  renderLanes: Lanes,
) {
  const type = workInProgress.type;              // "div"
  const nextProps = workInProgress.pendingProps; // ← 获取 pendingProps！
  
  // 关键步骤：从 props 中提取 children
  let nextChildren = nextProps.children;  // ← 这就是 children！
  
  // ... 一些特殊处理（如纯文本子节点）...
  
  // 调用 reconcileChildren
  reconcileChildren(
    current,
    workInProgress,
    nextChildren,    // ← 传入 children
    renderLanes
  );
  
  return workInProgress.child;
}

步骤 7: reconcileChildren（封装函数）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function reconcileChildren(
  current: Fiber | null,
  workInProgress: Fiber,
  nextChildren: any,     // ← 这是从 props.children 来的
  renderLanes: Lanes,
) {
  if (current === null) {
    // Mount: 首次渲染
    workInProgress.child = mountChildFibers(
      workInProgress,
      null,
      nextChildren,  // ← 传递给 mountChildFibers
      renderLanes,
    );
  } else {
    // Update: 更新
    workInProgress.child = reconcileChildFibers(
      workInProgress,
      current.child,
      nextChildren,  // ← 传递给 reconcileChildFibers
      renderLanes,
    );
  }
}

步骤 8: reconcileChildFibers（核心 Diff 逻辑）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function reconcileChildFibers(
  returnFiber: Fiber,
  currentFirstChild: Fiber | null,
  newChild: any,         // ← 这就是 newChild！
  lanes: Lanes,          //    来源：props.children
): Fiber | null {
  
  // 判断 newChild 的类型
  if (typeof newChild === 'object' && newChild !== null) {
    switch (newChild.$$typeof) {
      case REACT_ELEMENT_TYPE:
        // 单个元素
        return reconcileSingleElement(...);
    }
    
    if (isArray(newChild)) {
      // 数组
      return reconcileChildrenArray(...);
    }
  }
  
  // ... 其他类型处理
}

完整数据流：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

JSX
  ↓ Babel
JavaScript (createElement)
  ↓
ReactElement
  {
    type: "div",
    props: {
      children: [...]  ← 源头
    }
  }
  ↓
Fiber.pendingProps
  {
    children: [...]  ← 存储在 Fiber
  }
  ↓
updateHostComponent
  nextChildren = workInProgress.pendingProps.children  ← 提取
  ↓
reconcileChildren
  reconcileChildren(workInProgress, nextChildren)
  ↓
reconcileChildFibers
  function(returnFiber, currentFirstChild, newChild)
                                           ↑
                                    这就是 newChild！`}
      </pre>
    </div>
  );
}

// 不同组件类型
function DifferentComponentTypes() {
  return (
    <div style={{ background: '#fff', padding: '15px', borderRadius: '5px' }}>
      <h3>不同组件类型获取 children 的方式</h3>
      
      <div style={{ marginBottom: '20px' }}>
        <h4>1. 原生 DOM 元素（HostComponent）</h4>
        <pre style={{ background: '#f5f5f5', padding: '10px', fontSize: '13px' }}>
{`function updateHostComponent(current, workInProgress, renderLanes) {
  const nextProps = workInProgress.pendingProps;
  
  // 直接从 props 中获取 children
  let nextChildren = nextProps.children;  // ← 关键
  
  reconcileChildren(current, workInProgress, nextChildren, renderLanes);
  return workInProgress.child;
}

示例：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

<div className="box">
  <span>Hello</span>
</div>

↓ ReactElement

{
  type: "div",
  props: {
    className: "box",
    children: {              // ← nextChildren 来自这里
      $$typeof: Symbol(react.element),
      type: "span",
      props: { children: "Hello" }
    }
  }
}`}
        </pre>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h4>2. 函数组件（FunctionComponent）</h4>
        <pre style={{ background: '#f5f5f5', padding: '10px', fontSize: '13px' }}>
{`function updateFunctionComponent(
  current,
  workInProgress,
  Component,     // 组件函数
  nextProps,     // 组件的 props
  renderLanes,
) {
  // 执行组件函数，获取返回的 ReactElement
  nextChildren = renderWithHooks(
    current,
    workInProgress,
    Component,    // ← 执行这个函数
    nextProps,    // 传入 props
    context,
    renderLanes,
  );
  
  // nextChildren 是组件函数的返回值
  reconcileChildren(current, workInProgress, nextChildren, renderLanes);
  return workInProgress.child;
}

示例：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function MyComponent(props) {
  return (
    <div>
      <span>{props.text}</span>
    </div>
  );
}

<MyComponent text="Hello" />

流程：
1. Component = MyComponent
2. nextProps = { text: "Hello" }
3. nextChildren = Component(nextProps)  // 执行函数
4. nextChildren = ReactElement {
     type: "div",
     props: {
       children: {
         type: "span",
         props: { children: "Hello" }
       }
     }
   }

注意：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
对于函数组件，nextChildren 不是 props.children！
而是组件函数的返回值（ReactElement）！

但如果函数组件内部使用了 props.children：

function Wrapper(props) {
  return <div>{props.children}</div>;
}

<Wrapper>
  <Child />
</Wrapper>

这种情况：
1. Wrapper 组件的 props = { children: <Child /> }
2. Wrapper 函数返回 <div>{props.children}</div>
3. nextChildren = 返回的 ReactElement
4. div 的 children 才是 <Child />`}
        </pre>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h4>3. 类组件（ClassComponent）</h4>
        <pre style={{ background: '#f5f5f5', padding: '10px', fontSize: '13px' }}>
{`function updateClassComponent(
  current,
  workInProgress,
  Component,
  nextProps,
  renderLanes,
) {
  // 获取组件实例
  const instance = workInProgress.stateNode;
  
  // 调用 render 方法
  nextChildren = instance.render();  // ← 关键
  
  reconcileChildren(current, workInProgress, nextChildren, renderLanes);
  return workInProgress.child;
}

示例：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class MyComponent extends React.Component {
  render() {
    return (
      <div>
        <span>{this.props.text}</span>
      </div>
    );
  }
}

<MyComponent text="Hello" />

流程：
1. instance = new MyComponent(props)
2. nextChildren = instance.render()  // 调用 render
3. nextChildren = ReactElement {
     type: "div",
     props: {
       children: {
         type: "span",
         props: { children: "Hello" }
       }
     }
   }`}
        </pre>
      </div>

      <div>
        <h4>4. Fragment</h4>
        <pre style={{ background: '#f5f5f5', padding: '10px', fontSize: '13px' }}>
{`function updateFragment(current, workInProgress, renderLanes) {
  // Fragment 的 children 直接就是 pendingProps
  const nextChildren = workInProgress.pendingProps;  // ← 不是 .children
  
  reconcileChildren(current, workInProgress, nextChildren, renderLanes);
  return workInProgress.child;
}

示例：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

<>
  <Child1 />
  <Child2 />
</>

↓ 编译为

React.createElement(
  React.Fragment,
  null,
  React.createElement(Child1, null),
  React.createElement(Child2, null)
)

↓ ReactElement

{
  type: Symbol(react.fragment),
  props: {
    children: [      // Fragment 的 props.children
      { type: Child1 },
      { type: Child2 }
    ]
  }
}

但在 updateFragment 中：
nextChildren = workInProgress.pendingProps
             = props.children  // 因为 Fragment 只有 children`}
        </pre>
      </div>
    </div>
  );
}

// 源码证据
function SourceCodeEvidence() {
  return (
    <div style={{ background: '#fff', padding: '15px', borderRadius: '5px' }}>
      <h3>源码关键片段</h3>
      
      <div style={{ marginBottom: '20px' }}>
        <h4>1. updateHostComponent - 原生 DOM</h4>
        <pre style={{ background: '#f5f5f5', padding: '10px', fontSize: '13px' }}>
{`// ReactFiberBeginWork.old.js (line 1426-1458)

function updateHostComponent(
  current: Fiber | null,
  workInProgress: Fiber,
  renderLanes: Lanes,
) {
  pushHostContext(workInProgress);
  
  const type = workInProgress.type;
  const nextProps = workInProgress.pendingProps;  // ← 获取 pendingProps
  const prevProps = current !== null ? current.memoizedProps : null;
  
  let nextChildren = nextProps.children;  // ← 从 props 提取 children
  
  const isDirectTextChild = shouldSetTextContent(type, nextProps);
  
  if (isDirectTextChild) {
    // 优化：如果只有文本子节点，不创建 Fiber
    nextChildren = null;
  } else if (prevProps !== null && shouldSetTextContent(type, prevProps)) {
    // 之前是文本，现在不是，需要重置
    workInProgress.flags |= ContentReset;
  }
  
  markRef(current, workInProgress);
  
  reconcileChildren(current, workInProgress, nextChildren, renderLanes);
  //                                         ↑
  //                           这就是传给 reconcileChildren 的
  
  return workInProgress.child;
}`}
        </pre>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h4>2. updateFunctionComponent - 函数组件</h4>
        <pre style={{ background: '#f5f5f5', padding: '10px', fontSize: '13px' }}>
{`// ReactFiberBeginWork.old.js (line 951-1045)

function updateFunctionComponent(
  current,
  workInProgress,
  Component,
  nextProps: any,
  renderLanes,
) {
  let context;
  if (!disableLegacyContext) {
    const unmaskedContext = getUnmaskedContext(workInProgress, Component, true);
    context = getMaskedContext(workInProgress, unmaskedContext);
  }
  
  let nextChildren;
  
  // 执行函数组件，获取返回值
  nextChildren = renderWithHooks(
    current,
    workInProgress,
    Component,      // ← 组件函数
    nextProps,      // ← props
    context,
    renderLanes,
  );
  
  // nextChildren 是函数的返回值（ReactElement）
  
  if (current !== null && !didReceiveUpdate) {
    // 优化：props 没变，可以 bailout
    bailoutHooks(current, workInProgress, renderLanes);
    return bailoutOnAlreadyFinishedWork(current, workInProgress, renderLanes);
  }
  
  // React DevTools
  workInProgress.flags |= PerformedWork;
  
  reconcileChildren(current, workInProgress, nextChildren, renderLanes);
  //                                         ↑
  //                           函数组件的返回值
  
  return workInProgress.child;
}`}
        </pre>
      </div>

      <div>
        <h4>3. reconcileChildren - 封装函数</h4>
        <pre style={{ background: '#f5f5f5', padding: '10px', fontSize: '13px' }}>
{`// ReactFiberBeginWork.old.js (line 288-306)

export function reconcileChildren(
  current: Fiber | null,
  workInProgress: Fiber,
  nextChildren: any,     // ← 参数名就叫 nextChildren
  renderLanes: Lanes,
) {
  if (current === null) {
    // Mount
    workInProgress.child = mountChildFibers(
      workInProgress,
      null,
      nextChildren,      // ← 传递下去
      renderLanes,
    );
  } else {
    // Update
    workInProgress.child = reconcileChildFibers(
      workInProgress,
      current.child,
      nextChildren,      // ← 传递给 reconcileChildFibers
      renderLanes,
    );
  }
}

// ReactChildFiber.old.js

function reconcileChildFibers(
  returnFiber: Fiber,
  currentFirstChild: Fiber | null,
  newChild: any,         // ← 这就是 nextChildren！
  lanes: Lanes,          //    也就是 newChild 参数
): Fiber | null {
  // Diff 逻辑...
}`}
        </pre>
      </div>
    </div>
  );
}

// 实例追踪
function ExampleTracing() {
  return (
    <div style={{ background: '#fff', padding: '15px', borderRadius: '5px' }}>
      <h3>具体实例追踪</h3>
      
      <pre style={{ background: '#f5f5f5', padding: '15px', overflow: 'auto', fontSize: '13px', lineHeight: '1.8' }}>
{`实例：嵌套组件
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function App() {
  return <Container><Child /></Container>;
}

function Container(props) {
  return <div className="container">{props.children}</div>;
}

function Child() {
  return <span>Hello</span>;
}

详细追踪：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

步骤 1: 处理 App 组件
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

beginWork(App Fiber)
  ↓
updateFunctionComponent(App)
  ↓
nextChildren = renderWithHooks(App)
             = App()  // 执行函数
             = <Container><Child /></Container>
             = React.createElement(
                 Container,
                 null,
                 React.createElement(Child, null)
               )
             = {
                 $$typeof: Symbol(react.element),
                 type: Container,
                 props: {
                   children: {  // ← Child 作为 children
                     $$typeof: Symbol(react.element),
                     type: Child,
                     props: {}
                   }
                 }
               }
  ↓
reconcileChildren(App Fiber, nextChildren)
  ↓
reconcileChildFibers(
  returnFiber = App Fiber,
  currentFirstChild = null,
  newChild = {              // ← 这是 newChild
    $$typeof: Symbol(react.element),
    type: Container,
    props: { children: <Child /> }
  }
)
  ↓
判断：newChild.$$typeof === REACT_ELEMENT_TYPE
     → reconcileSingleElement
  ↓
创建 Container Fiber

步骤 2: 处理 Container 组件
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

beginWork(Container Fiber)
  ↓
updateFunctionComponent(Container)
  ↓
Container Fiber.pendingProps = {
  children: {
    $$typeof: Symbol(react.element),
    type: Child,
    props: {}
  }
}
  ↓
nextChildren = renderWithHooks(Container, props)
             = Container(props)
             = <div className="container">{props.children}</div>
             = React.createElement(
                 "div",
                 { className: "container" },
                 props.children  // ← 使用了 props.children
               )
             = {
                 $$typeof: Symbol(react.element),
                 type: "div",
                 props: {
                   className: "container",
                   children: {  // ← props.children 被传递到这里
                     $$typeof: Symbol(react.element),
                     type: Child,
                     props: {}
                   }
                 }
               }
  ↓
reconcileChildren(Container Fiber, nextChildren)
  ↓
reconcileChildFibers(
  returnFiber = Container Fiber,
  currentFirstChild = null,
  newChild = {              // ← newChild
    $$typeof: Symbol(react.element),
    type: "div",
    props: {
      className: "container",
      children: <Child />  // ← 注意这里有 Child
    }
  }
)
  ↓
判断：newChild.$$typeof === REACT_ELEMENT_TYPE
     → reconcileSingleElement
  ↓
创建 div Fiber

步骤 3: 处理 div（原生 DOM）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

beginWork(div Fiber)
  ↓
updateHostComponent(div)
  ↓
div Fiber.pendingProps = {
  className: "container",
  children: {
    $$typeof: Symbol(react.element),
    type: Child,
    props: {}
  }
}
  ↓
nextChildren = workInProgress.pendingProps.children
             = {
                 $$typeof: Symbol(react.element),
                 type: Child,
                 props: {}
               }
  ↓
reconcileChildren(div Fiber, nextChildren)
  ↓
reconcileChildFibers(
  returnFiber = div Fiber,
  currentFirstChild = null,
  newChild = {              // ← newChild
    $$typeof: Symbol(react.element),
    type: Child,
    props: {}
  }
)
  ↓
判断：newChild.$$typeof === REACT_ELEMENT_TYPE
     → reconcileSingleElement
  ↓
创建 Child Fiber

步骤 4: 处理 Child 组件
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

beginWork(Child Fiber)
  ↓
updateFunctionComponent(Child)
  ↓
nextChildren = renderWithHooks(Child)
             = Child()
             = <span>Hello</span>
             = {
                 $$typeof: Symbol(react.element),
                 type: "span",
                 props: {
                   children: "Hello"  // 文本节点
                 }
               }
  ↓
reconcileChildren(Child Fiber, nextChildren)
  ↓
reconcileChildFibers(
  returnFiber = Child Fiber,
  currentFirstChild = null,
  newChild = {              // ← newChild
    $$typeof: Symbol(react.element),
    type: "span",
    props: { children: "Hello" }
  }
)
  ↓
判断：newChild.$$typeof === REACT_ELEMENT_TYPE
     → reconcileSingleElement
  ↓
创建 span Fiber

步骤 5: 处理 span（原生 DOM）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

beginWork(span Fiber)
  ↓
updateHostComponent(span)
  ↓
span Fiber.pendingProps = {
  children: "Hello"
}
  ↓
nextChildren = workInProgress.pendingProps.children
             = "Hello"  // 字符串
  ↓
reconcileChildren(span Fiber, nextChildren)
  ↓
reconcileChildFibers(
  returnFiber = span Fiber,
  currentFirstChild = null,
  newChild = "Hello"       // ← newChild 是字符串
)
  ↓
判断：typeof newChild === 'string'
     → reconcileSingleTextNode
  ↓
创建 Text Fiber

总结每一步的 newChild 来源：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. App → newChild = App() 的返回值
2. Container → newChild = Container(props) 的返回值
3. div → newChild = div Fiber.pendingProps.children
4. Child → newChild = Child() 的返回值
5. span → newChild = span Fiber.pendingProps.children

模式：
- 函数组件：newChild = 函数执行的返回值
- 原生 DOM：newChild = pendingProps.children
- 类组件：newChild = instance.render() 的返回值`}
      </pre>
    </div>
  );
}

// 总结
function FinalSummary() {
  return (
    <div style={{ background: '#fff', padding: '15px', borderRadius: '5px' }}>
      <h3>核心要点总结</h3>
      
      <div style={{ background: '#e3f2fd', padding: '15px', marginBottom: '15px', borderRadius: '5px' }}>
        <h4>1. newChild 的来源</h4>
        <p style={{ fontSize: '14px' }}>
          <strong>是的！newChild 来自 ReactElement.props</strong>
        </p>
        <ul style={{ fontSize: '14px' }}>
          <li>ReactElement.props → Fiber.pendingProps</li>
          <li>updateXXXComponent 从 pendingProps 提取 children</li>
          <li>children 作为 nextChildren 传给 reconcileChildren</li>
          <li>最终成为 reconcileChildFibers 的 newChild 参数</li>
        </ul>
      </div>

      <div style={{ background: '#e8f5e9', padding: '15px', marginBottom: '15px', borderRadius: '5px' }}>
        <h4>2. 不同组件类型的处理</h4>
        <ul style={{ fontSize: '14px' }}>
          <li><strong>原生 DOM：</strong>直接从 <code>pendingProps.children</code> 获取</li>
          <li><strong>函数组件：</strong>执行组件函数的返回值</li>
          <li><strong>类组件：</strong>调用 <code>instance.render()</code> 的返回值</li>
          <li><strong>Fragment：</strong><code>pendingProps</code> 本身（因为只有 children）</li>
        </ul>
      </div>

      <div style={{ background: '#fff9c4', padding: '15px', marginBottom: '15px', borderRadius: '5px' }}>
        <h4>3. 调用链总结</h4>
        <pre style={{ background: '#fff', padding: '10px', fontSize: '13px' }}>
{`ReactElement.props.children
  ↓ 赋值给
Fiber.pendingProps.children
  ↓ 提取
updateXXXComponent 中的 nextChildren
  ↓ 传递
reconcileChildren(workInProgress, nextChildren)
  ↓ 传递
reconcileChildFibers(returnFiber, currentChild, newChild)
                                                 ↑
                                          这就是 newChild！`}
        </pre>
      </div>

      <div style={{ background: '#ffebee', padding: '15px', marginBottom: '15px', borderRadius: '5px' }}>
        <h4>4. 特殊情况</h4>
        <ul style={{ fontSize: '14px' }}>
          <li><strong>函数组件使用 props.children：</strong>
            <ul>
              <li>props.children 被传入组件函数</li>
              <li>组件内部返回的 ReactElement 包含这个 children</li>
              <li>最终成为下一层的 newChild</li>
            </ul>
          </li>
          <li><strong>纯文本子节点：</strong>
            <ul>
              <li>直接作为字符串的 newChild</li>
              <li>不创建 Fiber，优化性能</li>
            </ul>
          </li>
        </ul>
      </div>

      <div style={{ background: '#e0f2f1', padding: '15px', borderRadius: '5px' }}>
        <h4>💡 记忆要点</h4>
        <ul style={{ fontSize: '14px', lineHeight: '1.8' }}>
          <li>✅ <strong>newChild 最终来自 ReactElement.props.children</strong></li>
          <li>✅ props.children 在 createElement 时被创建</li>
          <li>✅ 存储在 Fiber.pendingProps 中</li>
          <li>✅ 在 reconciliation 时被提取和传递</li>
          <li>✅ 不同组件类型有不同的提取方式</li>
          <li>✅ 但最终都会传递给 reconcileChildFibers 作为 newChild</li>
        </ul>
      </div>
    </div>
  );
}
