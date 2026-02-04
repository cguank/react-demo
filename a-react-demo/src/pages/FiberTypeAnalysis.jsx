import React, { useState } from 'react';

/**
 * Fiber.type 的详细解析
 * 
 * 核心问题：
 * 1. fiber.type 包括哪些类型？
 * 2. 如果是 ComponentA，type 是 ComponentA 还是内部的 div？
 */

export default function FiberTypeAnalysis() {
  const [expandedSection, setExpandedSection] = useState(null);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', color: '#61dafb' }}>🔍 Fiber.type 详细解析</h1>
      
      {/* 核心答案 */}
      <Section
        title="✅ 核心答案"
        id="answer"
        expanded={expandedSection === 'answer'}
        onToggle={() => setExpandedSection(expandedSection === 'answer' ? null : 'answer')}
      >
        <CoreAnswer />
      </Section>

      {/* fiber.type 的所有可能值 */}
      <Section
        title="📋 fiber.type 的所有可能值"
        id="types"
        expanded={expandedSection === 'types'}
        onToggle={() => setExpandedSection(expandedSection === 'types' ? null : 'types')}
      >
        <AllTypes />
      </Section>

      {/* 实际示例 */}
      <Section
        title="🧪 实际示例：不同组件的 fiber.type"
        id="examples"
        expanded={expandedSection === 'examples'}
        onToggle={() => setExpandedSection(expandedSection === 'examples' ? null : 'examples')}
      >
        <Examples />
      </Section>

      {/* Fiber 树结构 */}
      <Section
        title="🌲 Fiber 树结构示例"
        id="tree"
        expanded={expandedSection === 'tree'}
        onToggle={() => setExpandedSection(expandedSection === 'tree' ? null : 'tree')}
      >
        <FiberTreeExample />
      </Section>

      {/* 源码分析 */}
      <Section
        title="🔬 源码分析"
        id="source"
        expanded={expandedSection === 'source'}
        onToggle={() => setExpandedSection(expandedSection === 'source' ? null : 'source')}
      >
        <SourceCodeAnalysis />
      </Section>

      {/* 实际测试 */}
      <Section
        title="🎯 实际测试"
        id="test"
        expanded={expandedSection === 'test'}
        onToggle={() => setExpandedSection(expandedSection === 'test' ? null : 'test')}
      >
        <PracticalTest />
      </Section>
    </div>
  );
}

function Section({ title, id, expanded, onToggle, children }) {
  return (
    <div style={{ marginBottom: '20px', border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden' }}>
      <div
        onClick={onToggle}
        style={{
          padding: '15px 20px',
          background: expanded ? '#e3f2fd' : '#f5f5f5',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontWeight: 'bold',
          fontSize: '18px'
        }}
      >
        <span>{title}</span>
        <span style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.3s' }}>▼</span>
      </div>
      {expanded && (
        <div style={{ padding: '20px', background: '#fff' }}>
          {children}
        </div>
      )}
    </div>
  );
}

function CoreAnswer() {
  return (
    <div>
      <h3>关键理解</h3>
      <pre style={{ background: '#f5f5f5', padding: '15px', borderRadius: '5px', overflow: 'auto', fontSize: '13px', lineHeight: '1.8' }}>
{`核心答案：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

问题：如果是 ComponentA，fiber.type 是 ComponentA 还是内部的 div？

答案：🔥 fiber.type 就是 ComponentA 本身（函数或类），不是内部的 div！

关键理解：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. 每个 React 元素（组件、原生 DOM）都会创建对应的 Fiber 节点

2. Fiber 树是分层的：
   - ComponentA 有一个 Fiber 节点，fiber.type = ComponentA（函数引用）
   - ComponentA 返回的 div 有另一个 Fiber 节点，fiber.type = 'div'（字符串）

3. ComponentA 的 Fiber 节点是 div 的 Fiber 节点的父节点


示例说明：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function ComponentA() {
  return (
    <div className="wrapper">
      <span>Hello</span>
    </div>
  );
}

function App() {
  return <ComponentA />;
}

Fiber 树结构：

App Fiber
  ├─ type: App (函数引用)
  ├─ tag: FunctionComponent
  └─ child ↓

ComponentA Fiber
  ├─ type: ComponentA (函数引用)  ← 🔥 这里！
  ├─ tag: FunctionComponent
  └─ child ↓

div Fiber
  ├─ type: 'div' (字符串)  ← 🔥 这是另一个 Fiber 节点！
  ├─ tag: HostComponent
  ├─ stateNode: <真实 DOM 节点>
  └─ child ↓

span Fiber
  ├─ type: 'span' (字符串)
  ├─ tag: HostComponent
  └─ stateNode: <真实 DOM 节点>


所以：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ ComponentA 的 Fiber 节点：
   fiber.type = ComponentA（函数/类的引用）
   fiber.tag = FunctionComponent 或 ClassComponent

✅ div 的 Fiber 节点：
   fiber.type = 'div'（字符串）
   fiber.tag = HostComponent

它们是两个不同的 Fiber 节点，通过 child/return 指针连接！`}
      </pre>
    </div>
  );
}

function AllTypes() {
  return (
    <div>
      <h3>fiber.type 的所有可能类型</h3>
      <pre style={{ background: '#f5f5f5', padding: '15px', borderRadius: '5px', overflow: 'auto', fontSize: '13px', lineHeight: '1.8' }}>
{`fiber.type 根据 fiber.tag 的不同，会有不同的值：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. FunctionComponent (tag = 0)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

fiber.type = 函数引用

function MyComponent(props) {
  return <div>Hello</div>;
}

<MyComponent />
  ↓
fiber.type = MyComponent（函数本身）
fiber.tag = 0 (FunctionComponent)


2. ClassComponent (tag = 1)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

fiber.type = 类引用

class MyComponent extends React.Component {
  render() {
    return <div>Hello</div>;
  }
}

<MyComponent />
  ↓
fiber.type = MyComponent（类本身）
fiber.tag = 1 (ClassComponent)


3. HostComponent (tag = 5) - 原生 DOM 元素
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

fiber.type = 字符串（标签名）

<div>Hello</div>
  ↓
fiber.type = 'div'
fiber.tag = 5 (HostComponent)
fiber.stateNode = <真实的 div DOM 节点>

<span>World</span>
  ↓
fiber.type = 'span'
fiber.tag = 5 (HostComponent)

<button>Click</button>
  ↓
fiber.type = 'button'
fiber.tag = 5 (HostComponent)


4. HostText (tag = 6) - 文本节点
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

fiber.type = null

"Hello World"
  ↓
fiber.type = null
fiber.tag = 6 (HostText)
fiber.memoizedProps = "Hello World"
fiber.stateNode = <真实的文本节点>


5. HostRoot (tag = 3) - 根节点
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

fiber.type = null

ReactDOM.createRoot(container).render(<App />)
  ↓
fiber.type = null
fiber.tag = 3 (HostRoot)
fiber.stateNode = FiberRoot


6. Fragment (tag = 7)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

fiber.type = REACT_FRAGMENT_TYPE (Symbol)

<>
  <div>A</div>
  <div>B</div>
</>
  ↓
fiber.type = Symbol(react.fragment)
fiber.tag = 7 (Fragment)


7. ForwardRef (tag = 11)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

fiber.type = { $$typeof: REACT_FORWARD_REF_TYPE, render: function }

const MyComponent = React.forwardRef((props, ref) => {
  return <div ref={ref}>Hello</div>;
});

<MyComponent />
  ↓
fiber.type = {
  $$typeof: Symbol(react.forward_ref),
  render: function
}
fiber.tag = 11 (ForwardRef)


8. MemoComponent (tag = 14)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

fiber.type = { $$typeof: REACT_MEMO_TYPE, type: Component, compare: function }

const MyComponent = React.memo(function MyComponent(props) {
  return <div>Hello</div>;
});

<MyComponent />
  ↓
fiber.type = {
  $$typeof: Symbol(react.memo),
  type: MyComponent,
  compare: null  // 或自定义比较函数
}
fiber.tag = 14 (MemoComponent)


9. SimpleMemoComponent (tag = 15)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

fiber.type = 函数引用（React.memo 包裹的函数组件，简化版）

fiber.type = MyComponent
fiber.tag = 15 (SimpleMemoComponent)


10. LazyComponent (tag = 16)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

fiber.type = { $$typeof: REACT_LAZY_TYPE, _payload: { ... }, _init: function }

const LazyComponent = React.lazy(() => import('./MyComponent'));

<LazyComponent />
  ↓
fiber.type = {
  $$typeof: Symbol(react.lazy),
  _payload: { _status: 0, _result: Promise },
  _init: function
}
fiber.tag = 16 (LazyComponent)


11. ContextProvider (tag = 10)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

fiber.type = Context 对象

const MyContext = React.createContext();

<MyContext.Provider value={...}>
  ...
</MyContext.Provider>
  ↓
fiber.type = MyContext._context
fiber.tag = 10 (ContextProvider)


12. ContextConsumer (tag = 9)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

fiber.type = Context 对象

<MyContext.Consumer>
  {value => <div>{value}</div>}
</MyContext.Consumer>
  ↓
fiber.type = MyContext._context
fiber.tag = 9 (ContextConsumer)


总结表格：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

tag  | 类型                | fiber.type 的值
-----|--------------------|---------------------------------
0    | FunctionComponent  | 函数引用
1    | ClassComponent     | 类引用
3    | HostRoot          | null
5    | HostComponent     | 字符串（'div', 'span' 等）
6    | HostText          | null
7    | Fragment          | Symbol(react.fragment)
9    | ContextConsumer   | Context 对象
10   | ContextProvider   | Context 对象
11   | ForwardRef        | { $$typeof, render }
14   | MemoComponent     | { $$typeof, type, compare }
15   | SimpleMemoComponent| 函数引用
16   | LazyComponent     | { $$typeof, _payload, _init }`}
      </pre>
    </div>
  );
}

function Examples() {
  return (
    <div>
      <h3>实际示例分析</h3>
      <pre style={{ background: '#f5f5f5', padding: '15px', borderRadius: '5px', overflow: 'auto', fontSize: '13px', lineHeight: '1.8' }}>
{`示例 1：函数组件
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function ComponentA() {
  return (
    <div className="container">
      <h1>Title</h1>
      <p>Content</p>
    </div>
  );
}

function App() {
  return <ComponentA />;
}

生成的 Fiber 树：

App Fiber
  {
    type: App,              // 🔥 App 函数引用
    tag: 0,                 // FunctionComponent
    child: → ComponentA Fiber
  }
    ↓
ComponentA Fiber
  {
    type: ComponentA,       // 🔥 ComponentA 函数引用
    tag: 0,                 // FunctionComponent
    return: → App Fiber,
    child: → div Fiber
  }
    ↓
div Fiber
  {
    type: 'div',           // 🔥 字符串 'div'
    tag: 5,                // HostComponent
    stateNode: <div DOM>,  // 真实 DOM 节点
    return: → ComponentA Fiber,
    child: → h1 Fiber,
    sibling: null
  }
    ↓
h1 Fiber
  {
    type: 'h1',            // 🔥 字符串 'h1'
    tag: 5,                // HostComponent
    stateNode: <h1 DOM>,
    return: → div Fiber,
    sibling: → p Fiber
  }
    ↓
p Fiber
  {
    type: 'p',             // 🔥 字符串 'p'
    tag: 5,                // HostComponent
    stateNode: <p DOM>,
    return: → div Fiber,
    sibling: null
  }


示例 2：类组件
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class ComponentB extends React.Component {
  render() {
    return <button>Click Me</button>;
  }
}

ComponentB Fiber
  {
    type: ComponentB,       // 🔥 ComponentB 类引用
    tag: 1,                 // ClassComponent
    stateNode: <ComponentB实例>,
    child: → button Fiber
  }
    ↓
button Fiber
  {
    type: 'button',        // 🔥 字符串 'button'
    tag: 5,                // HostComponent
    stateNode: <button DOM>,
    return: → ComponentB Fiber
  }


示例 3：React.memo
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function ComponentC(props) {
  return <div>{props.value}</div>;
}

const MemoizedC = React.memo(ComponentC);

<MemoizedC value={42} />

MemoizedC Fiber（首次）
  {
    type: {
      $$typeof: Symbol(react.memo),
      type: ComponentC,    // 🔥 内部包含 ComponentC
      compare: null
    },
    tag: 14,               // MemoComponent
    child: → div Fiber
  }

或（优化后）
  {
    type: ComponentC,      // 🔥 直接指向 ComponentC
    tag: 15,               // SimpleMemoComponent
    child: → div Fiber
  }


示例 4：Fragment
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function ComponentD() {
  return (
    <>
      <div>A</div>
      <div>B</div>
    </>
  );
}

ComponentD Fiber
  {
    type: ComponentD,
    tag: 0,
    child: → Fragment Fiber
  }
    ↓
Fragment Fiber
  {
    type: Symbol(react.fragment),  // 🔥 Symbol
    tag: 7,                        // Fragment
    child: → div Fiber (A),
    return: → ComponentD Fiber
  }
    ↓
div Fiber (A)
  {
    type: 'div',
    tag: 5,
    sibling: → div Fiber (B)
  }


示例 5：Context
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const ThemeContext = React.createContext('light');

function App() {
  return (
    <ThemeContext.Provider value="dark">
      <ComponentE />
    </ThemeContext.Provider>
  );
}

Provider Fiber
  {
    type: ThemeContext._context,  // 🔥 Context 对象
    tag: 10,                      // ContextProvider
    memoizedProps: { value: 'dark' },
    child: → ComponentE Fiber
  }


关键理解：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. 组件的 Fiber 和其返回的 DOM 元素的 Fiber 是不同的节点
2. 组件 Fiber.type = 组件本身（函数/类）
3. DOM Fiber.type = 标签名字符串
4. 它们通过 child/return 指针连接成树
5. 每个节点都有自己的 type 和 tag`}
      </pre>
    </div>
  );
}

function FiberTreeExample() {
  return (
    <div>
      <h3>完整的 Fiber 树结构示例</h3>
      <pre style={{ background: '#f5f5f5', padding: '15px', borderRadius: '5px', overflow: 'auto', fontSize: '13px', lineHeight: '1.8' }}>
{`代码示例：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function Header() {
  return (
    <header>
      <h1>My App</h1>
    </header>
  );
}

function Content() {
  return (
    <div>
      <p>Hello</p>
    </div>
  );
}

function App() {
  return (
    <div className="app">
      <Header />
      <Content />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);


对应的 Fiber 树：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

HostRoot Fiber (根节点)
{
  type: null
  tag: 3 (HostRoot)
  stateNode: FiberRoot
  child: ↓
}
  |
  | child
  ↓
App Fiber
{
  type: App                    🔥 App 函数引用
  tag: 0 (FunctionComponent)
  return: ↑ HostRoot
  child: ↓
}
  |
  | child
  ↓
div.app Fiber
{
  type: 'div'                  🔥 字符串 'div'
  tag: 5 (HostComponent)
  stateNode: <div.app DOM>
  return: ↑ App Fiber
  child: ↓
}
  |
  | child
  ↓
Header Fiber
{
  type: Header                 🔥 Header 函数引用
  tag: 0 (FunctionComponent)
  return: ↑ div.app Fiber
  child: ↓
  sibling: → Content Fiber
}
  |                |
  | child          | sibling
  ↓                ↓
header Fiber      Content Fiber
{                 {
  type: 'header'    type: Content          🔥 Content 函数引用
  tag: 5            tag: 0
  stateNode: DOM    return: ↑ div.app Fiber
  return: ↑ Header  child: ↓
  child: ↓          sibling: null
}                 }
  |                |
  | child          | child
  ↓                ↓
h1 Fiber          div Fiber
{                 {
  type: 'h1'        type: 'div'            🔥 字符串 'div'
  tag: 5            tag: 5
  stateNode: DOM    stateNode: <div DOM>
  return: ↑ header  return: ↑ Content
  child: ↓          child: ↓
}                 }
  |                |
  | child          | child
  ↓                ↓
Text Fiber        p Fiber
{                 {
  type: null        type: 'p'              🔥 字符串 'p'
  tag: 6 (Text)     tag: 5
  memoizedProps:    stateNode: <p DOM>
    "My App"        return: ↑ div
}                   child: ↓
                  }
                    |
                    | child
                    ↓
                  Text Fiber
                  {
                    type: null
                    tag: 6 (Text)
                    memoizedProps: "Hello"
                  }


图示说明：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

                   HostRoot (type: null)
                       |
                       | child
                       ↓
                   App (type: App函数)
                       |
                       | child
                       ↓
                div.app (type: 'div')
                       |
                       | child
                       ↓
          ┌───────────────────────┐
          |                       |
          | child           sibling|
          ↓                       ↓
    Header (type: Header函数)  Content (type: Content函数)
          |                       |
          | child                 | child
          ↓                       ↓
    header (type: 'header')   div (type: 'div')
          |                       |
          | child                 | child
          ↓                       ↓
       h1 (type: 'h1')        p (type: 'p')
          |                       |
          | child                 | child
          ↓                       ↓
    Text: "My App"          Text: "Hello"
    (type: null)            (type: null)


关键观察：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. App Fiber 的 type = App（函数）
2. App 返回的 div 是另一个 Fiber，type = 'div'（字符串）
3. Header Fiber 的 type = Header（函数）
4. Header 返回的 header 是另一个 Fiber，type = 'header'（字符串）
5. Content Fiber 的 type = Content（函数）
6. Content 返回的 div 是另一个 Fiber，type = 'div'（字符串）

每个组件都有自己的 Fiber 节点，其 type 是组件本身！
组件返回的 DOM 元素有各自独立的 Fiber 节点！`}
      </pre>
    </div>
  );
}

function SourceCodeAnalysis() {
  return (
    <div>
      <h3>源码分析</h3>
      <pre style={{ background: '#f5f5f5', padding: '15px', borderRadius: '5px', overflow: 'auto', fontSize: '13px', lineHeight: '1.8' }}>
{`Fiber 的类型定义：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ReactFiber.old.js

type Fiber = {
  // 类型信息
  tag: WorkTag,        // 节点类型（0-28，见 ReactWorkTags.js）
  type: any,          // 🔥 元素类型（取决于 tag）
  elementType: any,   // 原始的 ReactElement.type
  
  // ...其他属性
};


ReactWorkTags.js - 所有的 tag 值：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const FunctionComponent = 0;      // 函数组件
export const ClassComponent = 1;         // 类组件
export const IndeterminateComponent = 2; // 未确定类型的组件
export const HostRoot = 3;              // 根节点
export const HostPortal = 4;            // Portal
export const HostComponent = 5;         // 原生 DOM 元素
export const HostText = 6;              // 文本节点
export const Fragment = 7;              // Fragment
export const Mode = 8;                  // Mode
export const ContextConsumer = 9;       // Context.Consumer
export const ContextProvider = 10;      // Context.Provider
export const ForwardRef = 11;          // React.forwardRef
export const Profiler = 12;            // Profiler
export const SuspenseComponent = 13;   // Suspense
export const MemoComponent = 14;       // React.memo
export const SimpleMemoComponent = 15; // 简化的 memo
export const LazyComponent = 16;       // React.lazy
export const IncompleteClassComponent = 17;
export const DehydratedFragment = 18;
export const SuspenseListComponent = 19;
export const ScopeComponent = 21;
export const OffscreenComponent = 22;
export const LegacyHiddenComponent = 23;
export const CacheComponent = 24;
export const TracingMarkerComponent = 25;


创建 Fiber 时如何设置 type：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ReactFiber.old.js

function createFiberFromElement(
  element: ReactElement,
  mode: TypeOfMode,
  lanes: Lanes,
): Fiber {
  let owner = null;
  const type = element.type;  // 🔥 从 ReactElement 获取 type
  const key = element.key;
  const pendingProps = element.props;
  
  // 🔥 根据 type 创建不同的 Fiber
  const fiber = createFiberFromTypeAndProps(
    type,
    key,
    pendingProps,
    owner,
    mode,
    lanes,
  );
  
  return fiber;
}

function createFiberFromTypeAndProps(
  type: any,
  key: null | string,
  pendingProps: any,
  owner: null | Fiber,
  mode: TypeOfMode,
  lanes: Lanes,
): Fiber {
  let fiberTag = IndeterminateComponent;
  let resolvedType = type;
  
  // 🔥 根据 type 的类型确定 fiberTag
  if (typeof type === 'function') {
    // 函数组件或类组件
    if (shouldConstruct(type)) {
      fiberTag = ClassComponent;  // 类组件
    } else {
      fiberTag = FunctionComponent;  // 函数组件
    }
  } else if (typeof type === 'string') {
    // 🔥 原生 DOM 元素
    fiberTag = HostComponent;
  } else {
    // 🔥 其他特殊类型
    getTag: switch (type) {
      case REACT_FRAGMENT_TYPE:
        return createFiberFromFragment(pendingProps.children, mode, lanes, key);
      case REACT_STRICT_MODE_TYPE:
        fiberTag = Mode;
        mode |= StrictLegacyMode;
        break;
      // ...其他情况
      default: {
        if (typeof type === 'object' && type !== null) {
          switch (type.$$typeof) {
            case REACT_PROVIDER_TYPE:
              fiberTag = ContextProvider;
              break getTag;
            case REACT_CONTEXT_TYPE:
              fiberTag = ContextConsumer;
              break getTag;
            case REACT_FORWARD_REF_TYPE:
              fiberTag = ForwardRef;
              break getTag;
            case REACT_MEMO_TYPE:
              fiberTag = MemoComponent;
              break getTag;
            case REACT_LAZY_TYPE:
              fiberTag = LazyComponent;
              break getTag;
          }
        }
      }
    }
  }
  
  // 🔥 创建 Fiber，设置 type
  const fiber = createFiber(fiberTag, pendingProps, key, mode);
  fiber.elementType = type;
  fiber.type = resolvedType;  // 🔥 设置 type
  fiber.lanes = lanes;
  
  return fiber;
}


beginWork 中如何使用 type：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ReactFiberBeginWork.old.js

function beginWork(
  current: Fiber | null,
  workInProgress: Fiber,
  renderLanes: Lanes,
): Fiber | null {
  // ...
  
  // 🔥 根据 tag 进行不同的处理
  switch (workInProgress.tag) {
    case FunctionComponent: {
      const Component = workInProgress.type;  // 🔥 获取函数引用
      const unresolvedProps = workInProgress.pendingProps;
      return updateFunctionComponent(
        current,
        workInProgress,
        Component,  // 🔥 传入函数
        resolvedProps,
        renderLanes,
      );
    }
    case ClassComponent: {
      const Component = workInProgress.type;  // 🔥 获取类引用
      const unresolvedProps = workInProgress.pendingProps;
      return updateClassComponent(
        current,
        workInProgress,
        Component,  // 🔥 传入类
        resolvedProps,
        renderLanes,
      );
    }
    case HostComponent: {
      // 🔥 type 是字符串，如 'div', 'span'
      return updateHostComponent(current, workInProgress, renderLanes);
    }
    case HostText:
      return updateHostText(current, workInProgress);
    // ...其他情况
  }
}

function updateFunctionComponent(
  current,
  workInProgress,
  Component,  // 🔥 这就是函数引用
  nextProps,
  renderLanes,
) {
  // ...
  
  // 🔥 调用函数组件
  let nextChildren = Component(nextProps, context);
  
  // 🔥 处理返回的子元素
  reconcileChildren(current, workInProgress, nextChildren, renderLanes);
  
  return workInProgress.child;
}


Diff 算法中比较 type：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ReactChildFiber.old.js

function reconcileSingleElement(
  returnFiber: Fiber,
  currentFirstChild: Fiber | null,
  element: ReactElement,
  lanes: Lanes,
): Fiber {
  const key = element.key;
  let child = currentFirstChild;
  
  while (child !== null) {
    if (child.key === key) {
      const elementType = element.type;
      
      // 🔥🔥 比较 type
      if (child.elementType === elementType) {
        // ✅ type 相同，可以复用
        deleteRemainingChildren(returnFiber, child.sibling);
        const existing = useFiber(child, element.props);
        existing.ref = coerceRef(returnFiber, child, element);
        existing.return = returnFiber;
        return existing;
      }
      
      // ❌ type 不同，不能复用
      deleteRemainingChildren(returnFiber, child);
      break;
    } else {
      deleteChild(returnFiber, child);
    }
    child = child.sibling;
  }
  
  // 创建新 Fiber
  const created = createFiberFromElement(element, returnFiber.mode, lanes);
  created.ref = coerceRef(returnFiber, currentFirstChild, element);
  created.return = returnFiber;
  return created;
}


总结：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. fiber.type 的值取决于 fiber.tag

2. 对于组件（FunctionComponent、ClassComponent）：
   fiber.type = 组件本身（函数引用或类引用）

3. 对于原生 DOM（HostComponent）：
   fiber.type = 标签名字符串（'div', 'span' 等）

4. 对于文本节点（HostText）：
   fiber.type = null

5. Diff 算法通过比较 type 来判断是否可以复用节点`}
      </pre>
    </div>
  );
}

function PracticalTest() {
  const [showDebug, setShowDebug] = useState(false);

  return (
    <div>
      <h3>实际测试组件</h3>
      
      <ComponentA />
      
      <button
        onClick={() => setShowDebug(!showDebug)}
        style={{
          marginTop: '20px',
          padding: '10px 20px',
          background: '#61dafb',
          color: '#fff',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        {showDebug ? '隐藏' : '显示'} Fiber 信息说明
      </button>
      
      {showDebug && (
        <div style={{ marginTop: '20px', padding: '15px', background: '#f5f5f5', borderRadius: '5px' }}>
          <h4>上面的 ComponentA 生成的 Fiber 树：</h4>
          <pre style={{ fontSize: '13px', lineHeight: '1.6' }}>
{`ComponentA Fiber
  {
    type: ComponentA,         // 🔥 函数引用
    tag: 0,                   // FunctionComponent
    child: ↓
  }
    ↓
div.container Fiber
  {
    type: 'div',              // 🔥 字符串 'div'
    tag: 5,                   // HostComponent
    stateNode: <div DOM>,     // 真实 DOM 节点
    return: ↑ ComponentA,
    child: ↓
  }
    ↓
h2 Fiber
  {
    type: 'h2',               // 🔥 字符串 'h2'
    tag: 5,
    stateNode: <h2 DOM>,
    sibling: ↓
  }
    ↓
p Fiber
  {
    type: 'p',                // 🔥 字符串 'p'
    tag: 5,
    stateNode: <p DOM>
  }

注意：
- ComponentA 的 Fiber.type = ComponentA（函数）
- div 的 Fiber.type = 'div'（字符串）
- 它们是不同的 Fiber 节点！`}
          </pre>
        </div>
      )}
    </div>
  );
}

// 测试组件
function ComponentA() {
  return (
    <div className="container" style={{ 
      padding: '20px', 
      background: '#e3f2fd', 
      borderRadius: '5px',
      marginTop: '20px'
    }}>
      <h2 style={{ color: '#1976d2' }}>我是 ComponentA</h2>
      <p style={{ color: '#666' }}>
        ComponentA 有自己的 Fiber 节点，fiber.type = ComponentA（函数引用）<br/>
        这个 div 有自己的 Fiber 节点，fiber.type = 'div'（字符串）<br/>
        h2 有自己的 Fiber 节点，fiber.type = 'h2'（字符串）<br/>
        p 有自己的 Fiber 节点，fiber.type = 'p'（字符串）
      </p>
    </div>
  );
}
