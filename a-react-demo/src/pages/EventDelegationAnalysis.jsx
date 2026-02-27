import React, { useState, useRef, useEffect } from 'react';

/**
 * React 事件委托实现原理详解
 * 
 * 核心问题：
 * 1. 什么是事件委托？
 * 2. React 如何实现事件委托？
 * 3. React 17 vs React 18 的区别
 * 4. 合成事件（SyntheticEvent）
 * 5. 事件优先级
 * 6. 事件委托的优势和注意事项
 */

export default function EventDelegationAnalysis() {
  const [expandedSection, setExpandedSection] = useState(null);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '1400px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', color: '#61dafb' }}>🎯 React 事件委托实现原理</h1>
      
      <Section
        title="✅ 核心答案"
        id="answer"
        expanded={expandedSection === 'answer'}
        onToggle={() => setExpandedSection(expandedSection === 'answer' ? null : 'answer')}
      >
        <CoreAnswer />
      </Section>

      <Section
        title="📋 什么是事件委托"
        id="concept"
        expanded={expandedSection === 'concept'}
        onToggle={() => setExpandedSection(expandedSection === 'concept' ? null : 'concept')}
      >
        <Concept />
      </Section>

      <Section
        title="🎯 React 事件系统架构"
        id="architecture"
        expanded={expandedSection === 'architecture'}
        onToggle={() => setExpandedSection(expandedSection === 'architecture' ? null : 'architecture')}
      >
        <Architecture />
      </Section>

      <Section
        title="🔍 实现原理"
        id="implementation"
        expanded={expandedSection === 'implementation'}
        onToggle={() => setExpandedSection(expandedSection === 'implementation' ? null : 'implementation')}
      >
        <Implementation />
      </Section>

      <Section
        title="💻 源码分析"
        id="source"
        expanded={expandedSection === 'source'}
        onToggle={() => setExpandedSection(expandedSection === 'source' ? null : 'source')}
      >
        <SourceCode />
      </Section>

      <Section
        title="⚡ React 17 vs 18"
        id="versions"
        expanded={expandedSection === 'versions'}
        onToggle={() => setExpandedSection(expandedSection === 'versions' ? null : 'versions')}
      >
        <VersionDiff />
      </Section>

      <Section
        title="🎨 合成事件"
        id="synthetic"
        expanded={expandedSection === 'synthetic'}
        onToggle={() => setExpandedSection(expandedSection === 'synthetic' ? null : 'synthetic')}
      >
        <SyntheticEvent />
      </Section>

      <Section
        title="🎨 实际演示"
        id="demo"
        expanded={expandedSection === 'demo'}
        onToggle={() => setExpandedSection(expandedSection === 'demo' ? null : 'demo')}
      >
        <Demo />
      </Section>

      <Section
        title="📝 面试要点"
        id="interview"
        expanded={expandedSection === 'interview'}
        onToggle={() => setExpandedSection(expandedSection === 'interview' ? null : 'interview')}
      >
        <InterviewPoints />
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
      <pre style={{ background: '#f5f5f5', padding: '15px', borderRadius: '5px', overflow: 'auto', fontSize: '14px', lineHeight: '1.8' }}>
{`React 事件委托核心
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

核心答案：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. 什么是事件委托？
   将事件监听器绑定到父元素，通过事件冒泡统一处理子元素事件
   
2. React 如何实现？
   - 所有事件统一绑定到 Root 容器（React 18）
   - 通过事件冒泡捕获所有子元素的事件
   - 根据事件源（event.target）找到对应 Fiber
   - 执行对应的事件处理函数

3. 委托位置变化：
   - React 16-：document
   - React 17+：Root 容器（createRoot 的 DOM 节点）


关键代码：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// 用户代码
function App() {
  const handleClick = (e) => {
    console.log('点击了', e.target);
  };
  
  return (
    <div onClick={handleClick}>
      <button>按钮</button>
    </div>
  );
}

// React 内部实现
const root = createRoot(document.getElementById('root'));

// 🔥 在 root 容器上绑定所有事件
rootContainer.addEventListener('click', dispatchEvent, false);  // 冒泡
rootContainer.addEventListener('click', dispatchEvent, true);   // 捕获


工作流程：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. 用户点击 <button>
   ↓
2. 原生事件冒泡到 Root 容器
   ↓
3. Root 容器的监听器触发
   ↓
4. React 找到点击的 DOM 对应的 Fiber
   ↓
5. 从 Fiber 收集所有事件处理函数
   ↓
6. 创建合成事件对象（SyntheticEvent）
   ↓
7. 模拟事件传播（捕获 → 目标 → 冒泡）
   ↓
8. 依次执行事件处理函数


为什么使用事件委托？
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

优势：
✅ 减少内存占用（只在 Root 绑定，不是每个元素）
✅ 动态元素自动支持（不需要重新绑定）
✅ 统一管理（可以实现优先级调度）
✅ 跨浏览器兼容（合成事件抹平差异）

示例：
  原生 DOM：1000 个按钮 = 1000 个监听器
  React：1000 个按钮 = 1 个监听器（在 Root）


关键概念：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. 事件委托（Event Delegation）
   - 利用事件冒泡机制
   - 在父元素统一监听

2. 合成事件（SyntheticEvent）
   - React 包装的事件对象
   - 跨浏览器兼容

3. 事件池（Event Pooling，React 17- 已移除）
   - 复用事件对象
   - 提高性能

4. 事件优先级
   - DiscreteEvent（离散，如 click）
   - ContinuousEvent（连续，如 scroll）`}
      </pre>
    </div>
  );
}

function Concept() {
  return (
    <div>
      <pre style={{ background: '#f5f5f5', padding: '15px', borderRadius: '5px', overflow: 'auto', fontSize: '13px', lineHeight: '1.8' }}>
{`什么是事件委托？
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

基本概念：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

事件委托（Event Delegation）是一种利用事件冒泡机制，
将事件监听器绑定到父元素上，统一处理子元素事件的技术。


原生 DOM 示例：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

<!-- HTML -->
<ul id="list">
  <li>Item 1</li>
  <li>Item 2</li>
  <li>Item 3</li>
</ul>

方案 1：每个元素绑定（❌ 不推荐）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const items = document.querySelectorAll('li');
items.forEach(item => {
  item.addEventListener('click', (e) => {
    console.log('点击了', e.target.textContent);
  });
});

问题：
  - 3 个 li = 3 个监听器
  - 1000 个 li = 1000 个监听器（内存浪费）
  - 动态添加的 li 不会有监听器


方案 2：事件委托（✅ 推荐）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const list = document.getElementById('list');
list.addEventListener('click', (e) => {
  // 🔥 通过 event.target 判断点击的是哪个 li
  if (e.target.tagName === 'LI') {
    console.log('点击了', e.target.textContent);
  }
});

优势：
  ✅ 只有 1 个监听器（省内存）
  ✅ 动态添加的 li 自动支持
  ✅ 统一管理


事件冒泡机制：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DOM 树：
<div id="parent">
  <button id="child">
    <span id="text">点击</span>
  </button>
</div>

事件传播过程：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

点击 <span>：

1. 捕获阶段（Capture Phase）
   window → document → html → body → div → button → span
   ↓
2. 目标阶段（Target Phase）
   span（事件目标）
   ↓
3. 冒泡阶段（Bubble Phase）
   span → button → div → body → html → document → window
   🔥 事件委托利用这个阶段


addEventListener 的第三个参数：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

element.addEventListener(type, handler, useCapture);

useCapture:
  - false（默认）：冒泡阶段触发
  - true：捕获阶段触发

示例：
parent.addEventListener('click', handler, false);  // 冒泡
parent.addEventListener('click', handler, true);   // 捕获


React 中的应用：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function App() {
  return (
    <div onClick={() => console.log('Div')}>
      <button onClick={() => console.log('Button')}>
        <span onClick={() => console.log('Span')}>
          点击
        </span>
      </button>
    </div>
  );
}

渲染后的 DOM：
<div id="root">  ← 🔥 React 在这里绑定监听器
  <div>
    <button>
      <span>点击</span>
    </button>
  </div>
</div>

点击 span 时：
1. 原生事件从 span 冒泡到 root
2. root 的监听器触发
3. React 找到 span 对应的 Fiber
4. 收集路径上的所有事件处理函数
5. 依次执行：Span → Button → Div


对比：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

┌──────────────┬──────────┬──────────┬──────────┐
│ 方案          │ 监听器数  │ 内存占用  │ 动态支持 │
├──────────────┼──────────┼──────────┼──────────┤
│ 每个元素绑定  │ N        │ 高       │ 需重新绑 │
│ 事件委托      │ 1        │ 低       │ 自动支持 │
└──────────────┴──────────┴──────────┴──────────┘


注意事项：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. 不是所有事件都支持冒泡
   - focus / blur（不冒泡）
   - mouseenter / mouseleave（不冒泡）
   - React 会特殊处理这些事件

2. stopPropagation 会影响委托
   event.stopPropagation();  // 阻止冒泡
   // 会导致事件无法到达委托的父元素

3. 需要判断事件源
   if (e.target.matches('selector')) {
     // 处理特定元素的事件
   }`}
      </pre>
    </div>
  );
}

function Architecture() {
  return (
    <div>
      <pre style={{ background: '#f5f5f5', padding: '15px', borderRadius: '5px', overflow: 'auto', fontSize: '13px', lineHeight: '1.8' }}>
{`React 事件系统架构
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

整体架构：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

┌─────────────────────────────────────────────┐
│ 用户代码                                     │
│ <button onClick={handler}>Click</button>    │
└─────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────┐
│ JSX 编译                                     │
│ React.createElement('button', {             │
│   onClick: handler                          │
│ })                                          │
└─────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────┐
│ Fiber 节点                                   │
│ fiber.pendingProps.onClick = handler        │
└─────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────┐
│ DOM 节点（Commit 阶段）                      │
│ domElement[internalPropsKey] = {            │
│   onClick: handler                          │
│ }                                           │
│ 🔥 不在 domElement 上绑定 addEventListener   │
└─────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────┐
│ Root 容器（事件委托）                        │
│ rootContainer.addEventListener('click', ... )│
│ 🔥 统一在这里监听                            │
└─────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────┐
│ 原生事件触发                                 │
│ 用户点击 button → 冒泡到 root                │
└─────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────┐
│ dispatchEvent（事件分发）                    │
│ 1. 找到点击的 DOM 对应的 Fiber              │
│ 2. 收集路径上的事件处理函数                  │
│ 3. 创建合成事件对象                         │
│ 4. 模拟事件传播                             │
└─────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────┐
│ 执行事件处理函数                             │
│ handler(syntheticEvent)                     │
└─────────────────────────────────────────────┘


核心模块：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. 事件注册（Event Registration）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

文件：packages/react-dom/src/events/DOMPluginEventSystem.js

作用：
  - 在 Root 容器上注册所有支持的事件
  - 根据事件类型选择捕获或冒泡阶段
  - 绑定统一的事件分发函数

代码：
function listenToAllSupportedEvents(rootContainerElement) {
  // 🔥 遍历所有支持的事件类型
  allNativeEvents.forEach(domEventName => {
    listenToNativeEvent(
      domEventName,
      false,  // 冒泡
      rootContainerElement
    );
    listenToNativeEvent(
      domEventName,
      true,   // 捕获
      rootContainerElement
    );
  });
}


2. 事件分发（Event Dispatching）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

文件：packages/react-dom/src/events/ReactDOMEventListener.js

作用：
  - 接收原生事件
  - 找到事件源对应的 Fiber
  - 收集事件处理函数
  - 触发事件执行

代码：
function dispatchEventForPluginEventSystem(
  domEventName,
  eventSystemFlags,
  nativeEvent,
  targetInst,
  targetContainer,
) {
  // 🔥 批量更新
  batchedUpdates(() => {
    dispatchEventsForPlugins(
      domEventName,
      eventSystemFlags,
      nativeEvent,
      targetInst,
      targetContainer,
    );
  });
}


3. 事件收集（Event Accumulation）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

文件：packages/react-dom/src/events/DOMPluginEventSystem.js

作用：
  - 从 Fiber 树中收集事件处理函数
  - 模拟捕获和冒泡阶段
  - 构建事件执行队列

代码：
function accumulateSinglePhaseListeners(
  targetFiber,
  reactName,
  nativeEventType,
  isCapturePhase,
) {
  const listeners = [];
  let fiber = targetFiber;
  
  // 🔥 向上遍历 Fiber 树
  while (fiber !== null) {
    const props = fiber.memoizedProps;
    if (props !== null) {
      const listener = props[reactName];  // onClick
      if (listener) {
        listeners.push({
          instance: fiber.stateNode,
          listener,
          currentTarget: fiber.stateNode,
        });
      }
    }
    fiber = fiber.return;  // 向上
  }
  
  return listeners;
}


4. 合成事件（Synthetic Event）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

文件：packages/react-dom/src/events/SyntheticEvent.js

作用：
  - 包装原生事件对象
  - 提供统一的跨浏览器接口
  - 实现事件池（React 17- 已移除）

代码：
function SyntheticEvent(
  reactName,
  reactEventType,
  targetInst,
  nativeEvent,
  nativeEventTarget,
) {
  this.type = reactEventType;
  this.target = nativeEventTarget;
  this.currentTarget = null;
  this.nativeEvent = nativeEvent;
  
  // 复制原生事件属性
  for (const propName in Interface) {
    this[propName] = nativeEvent[propName];
  }
  
  this.preventDefault = function() {
    nativeEvent.preventDefault();
  };
  
  this.stopPropagation = function() {
    nativeEvent.stopPropagation();
  };
}


5. 事件优先级（Event Priority）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

文件：packages/react-dom/src/events/ReactDOMEventListener.js

作用：
  - 根据事件类型确定优先级
  - 高优先级事件同步执行
  - 低优先级事件可被打断

代码：
function getEventPriority(domEventName) {
  switch (domEventName) {
    // 🔥 离散事件（高优先级）
    case 'click':
    case 'keydown':
    case 'input':
      return DiscreteEventPriority;
    
    // 🔥 连续事件（低优先级）
    case 'scroll':
    case 'mousemove':
      return ContinuousEventPriority;
    
    // 🔥 默认优先级
    default:
      return DefaultEventPriority;
  }
}


数据流：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

用户点击按钮：
  ↓
1. 浏览器触发原生 click 事件
   nativeEvent = { target: <button>, ... }
  ↓
2. 事件冒泡到 Root 容器
  ↓
3. Root 的监听器触发
   dispatchEvent(nativeEvent)
  ↓
4. 找到事件源的 Fiber
   targetFiber = getClosestInstanceFromNode(nativeEvent.target)
  ↓
5. 收集事件处理函数
   listeners = accumulateSinglePhaseListeners(targetFiber, 'onClick')
   // [handler1, handler2, handler3]
  ↓
6. 创建合成事件
   syntheticEvent = new SyntheticEvent(nativeEvent)
  ↓
7. 执行事件处理函数
   listeners.forEach(listener => {
     listener.listener(syntheticEvent)
   })


关键设计：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. 统一绑定在 Root
   - 减少监听器数量
   - 便于统一管理

2. 合成事件对象
   - 跨浏览器兼容
   - 统一接口

3. 事件优先级
   - 高优先级同步执行
   - 低优先级可中断

4. 批量更新
   - 多次 setState 合并
   - 提高性能`}
      </pre>
    </div>
  );
}

function Implementation() {
  return (
    <div>
      <pre style={{ background: '#f5f5f5', padding: '15px', borderRadius: '5px', overflow: 'auto', fontSize: '13px', lineHeight: '1.8' }}>
{`React 事件委托实现流程
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

完整示例：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function App() {
  const handleDivClick = (e) => {
    console.log('Div clicked', e.target);
  };
  
  const handleButtonClick = (e) => {
    console.log('Button clicked', e.target);
  };
  
  const handleSpanClick = (e) => {
    console.log('Span clicked', e.target);
  };
  
  return (
    <div onClick={handleDivClick}>
      <button onClick={handleButtonClick}>
        <span onClick={handleSpanClick}>点击我</span>
      </button>
    </div>
  );
}

const root = createRoot(document.getElementById('root'));
root.render(<App />);


Step 1: 初始化 - 事件注册
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

createRoot() 时：

1. 创建 FiberRoot
   const root = createRoot(document.getElementById('root'));

2. 在 Root 容器上注册所有事件
   listenToAllSupportedEvents(rootContainer);

3. 具体注册过程
   // DOMPluginEventSystem.js
   
   function listenToAllSupportedEvents(rootContainerElement) {
     // 🔥 所有支持的原生事件
     allNativeEvents.forEach(domEventName => {
       // 冒泡阶段
       listenToNativeEvent(
         domEventName,     // 'click'
         false,            // 冒泡
         rootContainerElement
       );
       
       // 捕获阶段
       listenToNativeEvent(
         domEventName,     // 'click'
         true,             // 捕获
         rootContainerElement
       );
     });
   }

4. 绑定监听器
   function listenToNativeEvent(
     domEventName,
     isCapturePhaseListener,
     target,
   ) {
     const eventSystemFlags = isCapturePhaseListener
       ? IS_CAPTURE_PHASE
       : 0;
     
     // 🔥 创建监听函数
     const listener = createEventListenerWrapperWithPriority(
       target,
       domEventName,
       eventSystemFlags,
     );
     
     // 🔥 绑定到 Root 容器
     target.addEventListener(
       domEventName,
       listener,
       isCapturePhaseListener  // true = 捕获，false = 冒泡
     );
   }

结果：
  <div id="root">  ← 🔥 所有事件监听器都在这里
    addEventListener('click', dispatchEvent, false)
    addEventListener('click', dispatchEvent, true)
    addEventListener('scroll', dispatchEvent, false)
    ...（所有支持的事件）
  </div>


Step 2: 渲染 - 保存事件处理函数
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Render 阶段：
  创建 Fiber 树，保存 onClick 等 props

Commit 阶段：
  // ReactDOMComponent.js
  
  function setInitialProperties(
    domElement,
    tag,
    props,
  ) {
    // ... 其他属性处理
    
    // 🔥 保存事件处理函数到 DOM 节点
    updateFiberProps(domElement, props);
    
    // 注意：不会调用 domElement.addEventListener
  }
  
  function updateFiberProps(domElement, props) {
    // 🔥 在 DOM 元素上保存 props（包括事件处理函数）
    domElement[internalPropsKey] = props;
  }

结果：
  <div>
    domElement[internalPropsKey] = { onClick: handleDivClick }
  
  <button>
    domElement[internalPropsKey] = { onClick: handleButtonClick }
  
  <span>
    domElement[internalPropsKey] = { onClick: handleSpanClick }


Step 3: 用户交互 - 触发原生事件
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

用户点击 <span>：

1. 浏览器触发原生 click 事件
   nativeEvent = {
     type: 'click',
     target: <span>,
     currentTarget: <span>,
     ...
   }

2. 原生事件冒泡
   <span> → <button> → <div> → #root ✋

3. Root 容器的监听器触发
   rootContainer.addEventListener('click', listener, false)
   ↓
   listener(nativeEvent) 被调用


Step 4: 事件分发 - dispatchEvent
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ReactDOMEventListener.js

function dispatchEvent(
  domEventName,      // 'click'
  eventSystemFlags,  // 0 (冒泡)
  targetContainer,   // #root
  nativeEvent,       // 原生事件对象
) {
  // 🔥 Step 1: 找到点击的 DOM 对应的 Fiber
  const nativeEventTarget = nativeEvent.target;
  const targetInst = getClosestInstanceFromNode(nativeEventTarget);
  // targetInst = <span> 对应的 Fiber
  
  // 🔥 Step 2: 获取事件优先级
  const discreteEventPriority = getEventPriority(domEventName);
  // 'click' → DiscreteEventPriority（高优先级，同步）
  
  // 🔥 Step 3: 根据优先级调度
  if (discreteEventPriority === DiscreteEventPriority) {
    // 高优先级，同步执行
    dispatchDiscreteEvent(
      domEventName,
      eventSystemFlags,
      targetContainer,
      nativeEvent,
    );
  } else {
    // 低优先级，可中断
    dispatchContinuousEvent(...);
  }
}


Step 5: 收集事件处理函数
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// DOMPluginEventSystem.js

function dispatchEventsForPlugins(
  domEventName,
  eventSystemFlags,
  nativeEvent,
  targetInst,
  targetContainer,
) {
  const nativeEventTarget = nativeEvent.target;
  
  // 🔥 收集事件处理函数
  const dispatchQueue = [];
  extractEvents(
    dispatchQueue,
    domEventName,      // 'click'
    targetInst,        // <span> 的 Fiber
    nativeEvent,
    nativeEventTarget,
    eventSystemFlags,
    targetContainer,
  );
  
  // 🔥 执行事件队列
  processDispatchQueue(dispatchQueue, eventSystemFlags);
}


function extractEvents(
  dispatchQueue,
  domEventName,
  targetInst,
  nativeEvent,
  nativeEventTarget,
  eventSystemFlags,
  targetContainer,
) {
  // 🔥 确定 React 事件名
  const reactName = topLevelEventsToReactNames.get(domEventName);
  // 'click' → 'onClick'
  
  // 🔥 收集监听器
  const listeners = accumulateSinglePhaseListeners(
    targetInst,
    reactName,
    nativeEvent.type,
    inCapturePhase,
  );
  
  if (listeners.length > 0) {
    // 🔥 创建合成事件
    const event = new SyntheticMouseEvent(
      reactName,
      domEventName,
      targetInst,
      nativeEvent,
      nativeEventTarget,
    );
    
    dispatchQueue.push({
      event,
      listeners,
    });
  }
}


function accumulateSinglePhaseListeners(
  targetFiber,
  reactName,
  nativeEventType,
  inCapturePhase,
) {
  const listeners = [];
  let fiber = targetFiber;
  
  // 🔥 从目标 Fiber 向上遍历到 Root
  while (fiber !== null) {
    const { stateNode, tag } = fiber;
    
    // 只处理 HostComponent（DOM 元素）
    if (tag === HostComponent && stateNode !== null) {
      const currentTarget = stateNode;
      
      // 🔥 从 DOM 节点获取 props
      const props = getFiberCurrentPropsFromNode(currentTarget);
      if (props !== null) {
        // 🔥 获取事件处理函数
        const listener = props[reactName];  // props.onClick
        
        if (listener) {
          listeners.push({
            instance: null,
            listener,
            currentTarget,
          });
        }
      }
    }
    
    fiber = fiber.return;  // 向上遍历
  }
  
  // 🔥 如果是捕获阶段，反转顺序
  if (inCapturePhase) {
    return listeners.reverse();
  }
  
  return listeners;
}

收集结果（冒泡阶段，从下到上）：
  listeners = [
    { listener: handleSpanClick, currentTarget: <span> },
    { listener: handleButtonClick, currentTarget: <button> },
    { listener: handleDivClick, currentTarget: <div> },
  ]


Step 6: 执行事件处理函数
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// DOMPluginEventSystem.js

function processDispatchQueue(dispatchQueue, eventSystemFlags) {
  const inCapturePhase = (eventSystemFlags & IS_CAPTURE_PHASE) !== 0;
  
  for (let i = 0; i < dispatchQueue.length; i++) {
    const { event, listeners } = dispatchQueue[i];
    
    // 🔥 依次执行监听器
    processDispatchQueueItemsInOrder(
      event,
      listeners,
      inCapturePhase,
    );
  }
}

function processDispatchQueueItemsInOrder(
  event,
  listeners,
  inCapturePhase,
) {
  if (inCapturePhase) {
    // 捕获阶段：从外到内（父 → 子）
    for (let i = listeners.length - 1; i >= 0; i--) {
      executeDispatch(event, listeners[i]);
    }
  } else {
    // 🔥 冒泡阶段：从内到外（子 → 父）
    for (let i = 0; i < listeners.length; i++) {
      executeDispatch(event, listeners[i]);
    }
  }
}

function executeDispatch(event, listener) {
  const { currentTarget, listener: listenerFunc } = listener;
  
  // 🔥 设置 currentTarget
  event.currentTarget = currentTarget;
  
  // 🔥 执行事件处理函数
  listenerFunc.call(undefined, event);
  
  // 🔥 重置 currentTarget
  event.currentTarget = null;
}

执行顺序（冒泡）：
  1. handleSpanClick(syntheticEvent)
     event.currentTarget = <span>
  
  2. handleButtonClick(syntheticEvent)
     event.currentTarget = <button>
  
  3. handleDivClick(syntheticEvent)
     event.currentTarget = <div>


完整时间线：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. 用户点击 <span>
2. 浏览器触发原生 click 事件
3. 原生事件冒泡到 #root
4. #root 的监听器触发
5. 找到 <span> 对应的 Fiber
6. 从 <span> 向上遍历，收集 onClick
7. 创建合成事件对象
8. 依次执行：
   - handleSpanClick
   - handleButtonClick
   - handleDivClick
9. 事件处理完成`}
      </pre>
    </div>
  );
}

function SourceCode() {
  return (
    <div>
      <pre style={{ background: '#f5f5f5', padding: '15px', borderRadius: '5px', overflow: 'auto', fontSize: '12px', lineHeight: '1.6' }}>
{`React 事件委托源码分析
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. 事件注册入口
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// packages/react-dom/src/client/ReactDOMRoot.js

function createRoot(container, options) {
  // 创建 FiberRoot
  const root = createContainer(
    container,
    ConcurrentRoot,
    null,
    ...
  );
  
  // 🔥 标记容器
  markContainerAsRoot(root.current, container);
  
  const rootContainerElement = container.nodeType === COMMENT_NODE
    ? container.parentNode
    : container;
  
  // 🔥 注册所有事件
  listenToAllSupportedEvents(rootContainerElement);
  
  return new ReactDOMRoot(root);
}


2. 注册所有支持的事件
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// packages/react-dom/src/events/DOMPluginEventSystem.js

export function listenToAllSupportedEvents(
  rootContainerElement: EventTarget,
) {
  if (!(rootContainerElement: any)[listeningMarker]) {
    (rootContainerElement: any)[listeningMarker] = true;
    
    // 🔥 遍历所有原生事件
    allNativeEvents.forEach(domEventName => {
      if (domEventName !== 'selectionchange') {
        // 🔥 大多数事件需要注册捕获和冒泡两个阶段
        if (!nonDelegatedEvents.has(domEventName)) {
          listenToNativeEvent(domEventName, false, rootContainerElement);
        }
        listenToNativeEvent(domEventName, true, rootContainerElement);
      }
    });
    
    // selectionchange 特殊处理
    const ownerDocument = rootContainerElement.ownerDocument || rootContainerElement;
    if (ownerDocument !== null) {
      if (!(ownerDocument: any)[listeningMarker]) {
        (ownerDocument: any)[listeningMarker] = true;
        listenToNativeEvent('selectionchange', false, ownerDocument);
      }
    }
  }
}


// 所有支持的原生事件
const allNativeEvents: Set<DOMEventName> = new Set([
  'abort',
  'animationend',
  'animationiteration',
  'animationstart',
  'auxclick',
  'beforeinput',
  'blur',
  'canplay',
  'canplaythrough',
  'cancel',
  'change',
  'click',
  'close',
  'compositionend',
  'compositionstart',
  'compositionupdate',
  'contextmenu',
  'copy',
  'cut',
  // ... 更多事件
]);


3. 绑定单个事件
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function listenToNativeEvent(
  domEventName: DOMEventName,
  isCapturePhaseListener: boolean,
  target: EventTarget,
): void {
  let eventSystemFlags = 0;
  if (isCapturePhaseListener) {
    eventSystemFlags |= IS_CAPTURE_PHASE;
  }
  
  // 🔥 添加事件监听器
  addTrappedEventListener(
    target,
    domEventName,
    eventSystemFlags,
    isCapturePhaseListener,
  );
}


function addTrappedEventListener(
  targetContainer: EventTarget,
  domEventName: DOMEventName,
  eventSystemFlags: EventSystemFlags,
  isCapturePhaseListener: boolean,
  isDeferredListenerForLegacyFBSupport?: boolean,
) {
  // 🔥 创建监听器（包装了优先级）
  let listener = createEventListenerWrapperWithPriority(
    targetContainer,
    domEventName,
    eventSystemFlags,
  );
  
  // 🔥 绑定到目标容器
  let unsubscribeListener;
  if (isCapturePhaseListener) {
    unsubscribeListener = addEventCaptureListener(
      targetContainer,
      domEventName,
      listener,
    );
  } else {
    unsubscribeListener = addEventBubbleListener(
      targetContainer,
      domEventName,
      listener,
    );
  }
}


// 添加冒泡监听器
export function addEventBubbleListener(
  target: EventTarget,
  eventType: string,
  listener: Function,
): Function {
  target.addEventListener(eventType, listener, false);
  return listener;
}

// 添加捕获监听器
export function addEventCaptureListener(
  target: EventTarget,
  eventType: string,
  listener: Function,
): Function {
  target.addEventListener(eventType, listener, true);
  return listener;
}


4. 创建监听器包装器（带优先级）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// packages/react-dom/src/events/ReactDOMEventListener.js

export function createEventListenerWrapperWithPriority(
  targetContainer: EventTarget,
  domEventName: DOMEventName,
  eventSystemFlags: EventSystemFlags,
): Function {
  // 🔥 根据事件类型确定优先级
  const eventPriority = getEventPriority(domEventName);
  
  let listenerWrapper;
  switch (eventPriority) {
    case DiscreteEventPriority:
      // 🔥 离散事件（click, keydown 等）
      listenerWrapper = dispatchDiscreteEvent;
      break;
    case ContinuousEventPriority:
      // 🔥 连续事件（scroll, mousemove 等）
      listenerWrapper = dispatchContinuousEvent;
      break;
    case DefaultEventPriority:
    default:
      listenerWrapper = dispatchEvent;
      break;
  }
  
  return listenerWrapper.bind(
    null,
    domEventName,
    eventSystemFlags,
    targetContainer,
  );
}


// 事件优先级映射
export function getEventPriority(domEventName: DOMEventName): * {
  switch (domEventName) {
    // 离散事件（高优先级）
    case 'cancel':
    case 'click':
    case 'close':
    case 'contextmenu':
    case 'copy':
    case 'cut':
    case 'auxclick':
    case 'dblclick':
    case 'dragend':
    case 'dragstart':
    case 'drop':
    case 'focusin':
    case 'focusout':
    case 'input':
    case 'invalid':
    case 'keydown':
    case 'keypress':
    case 'keyup':
    case 'mousedown':
    case 'mouseup':
    case 'paste':
    case 'pause':
    case 'play':
    case 'pointercancel':
    case 'pointerdown':
    case 'pointerup':
    case 'ratechange':
    case 'reset':
    case 'resize':
    case 'seeked':
    case 'submit':
    case 'touchcancel':
    case 'touchend':
    case 'touchstart':
    case 'volumechange':
    case 'change':
    case 'selectionchange':
    case 'textInput':
    case 'compositionstart':
    case 'compositionend':
    case 'compositionupdate':
    case 'beforeblur':
    case 'afterblur':
    case 'beforeinput':
    case 'blur':
    case 'fullscreenchange':
    case 'focus':
    case 'hashchange':
    case 'popstate':
    case 'select':
    case 'selectstart':
      return DiscreteEventPriority;
    
    // 连续事件（低优先级）
    case 'drag':
    case 'dragenter':
    case 'dragexit':
    case 'dragleave':
    case 'dragover':
    case 'mousemove':
    case 'mouseout':
    case 'mouseover':
    case 'pointermove':
    case 'pointerout':
    case 'pointerover':
    case 'scroll':
    case 'toggle':
    case 'touchmove':
    case 'wheel':
    case 'mouseenter':
    case 'mouseleave':
    case 'pointerenter':
    case 'pointerleave':
      return ContinuousEventPriority;
    
    // 默认优先级
    default:
      return DefaultEventPriority;
  }
}


5. 事件分发
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function dispatchDiscreteEvent(
  domEventName,
  eventSystemFlags,
  container,
  nativeEvent,
) {
  // 🔥 获取当前事件优先级
  const previousPriority = getCurrentUpdatePriority();
  const prevTransition = ReactCurrentBatchConfig.transition;
  ReactCurrentBatchConfig.transition = null;
  
  try {
    // 🔥 设置为离散事件优先级
    setCurrentUpdatePriority(DiscreteEventPriority);
    
    // 🔥 分发事件
    dispatchEvent(domEventName, eventSystemFlags, container, nativeEvent);
  } finally {
    // 恢复优先级
    setCurrentUpdatePriority(previousPriority);
    ReactCurrentBatchConfig.transition = prevTransition;
  }
}


function dispatchEvent(
  domEventName: DOMEventName,
  eventSystemFlags: EventSystemFlags,
  targetContainer: EventTarget,
  nativeEvent: AnyNativeEvent,
) {
  // 🔥 找到事件源对应的 Fiber
  let blockedOn = findInstanceBlockingEvent(
    domEventName,
    eventSystemFlags,
    targetContainer,
    nativeEvent,
  );
  
  if (blockedOn === null) {
    // 🔥 分发事件给插件系统
    dispatchEventForPluginEventSystem(
      domEventName,
      eventSystemFlags,
      nativeEvent,
      return_targetInst,
      targetContainer,
    );
    clearIfContinuousEvent(domEventName, nativeEvent);
    return;
  }
  
  // ... 处理阻塞情况
}


function dispatchEventForPluginEventSystem(
  domEventName: DOMEventName,
  eventSystemFlags: EventSystemFlags,
  nativeEvent: AnyNativeEvent,
  targetInst: null | Fiber,
  targetContainer: EventTarget,
): void {
  // 🔥 批量更新
  batchedUpdates(() =>
    dispatchEventsForPlugins(
      domEventName,
      eventSystemFlags,
      nativeEvent,
      targetInst,
      targetContainer,
    ),
  );
}


6. 收集和执行事件
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function dispatchEventsForPlugins(
  domEventName: DOMEventName,
  eventSystemFlags: EventSystemFlags,
  nativeEvent: AnyNativeEvent,
  targetInst: null | Fiber,
  targetContainer: EventTarget,
): void {
  const nativeEventTarget = getEventTarget(nativeEvent);
  const dispatchQueue: DispatchQueue = [];
  
  // 🔥 提取事件（收集监听器）
  extractEvents(
    dispatchQueue,
    domEventName,
    targetInst,
    nativeEvent,
    nativeEventTarget,
    eventSystemFlags,
    targetContainer,
  );
  
  // 🔥 处理分发队列
  processDispatchQueue(dispatchQueue, eventSystemFlags);
}


关键文件总结：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. react-dom/src/client/ReactDOMRoot.js
   - createRoot 入口

2. react-dom/src/events/DOMPluginEventSystem.js
   - listenToAllSupportedEvents
   - listenToNativeEvent
   - extractEvents
   - accumulateSinglePhaseListeners

3. react-dom/src/events/ReactDOMEventListener.js
   - createEventListenerWrapperWithPriority
   - dispatchEvent
   - dispatchDiscreteEvent
   - getEventPriority

4. react-dom/src/events/EventListener.js
   - addEventBubbleListener
   - addEventCaptureListener

5. react-dom/src/events/SyntheticEvent.js
   - SyntheticEvent 类定义`}
      </pre>
    </div>
  );
}

function VersionDiff() {
  return (
    <div>
      <pre style={{ background: '#f5f5f5', padding: '15px', borderRadius: '5px', overflow: 'auto', fontSize: '13px', lineHeight: '1.8' }}>
{`React 17 vs React 18 事件委托对比
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

核心变化：委托位置
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

React 16 及之前：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

事件绑定在 document：

<html>
  <body>
    <div id="root">
      <button onClick={handler}>Click</button>
    </div>
  </body>
</html>

🔥 document.addEventListener('click', ...)  ← 在这里绑定

问题：
  1. 多个 React 应用共存时会冲突
  2. stopPropagation 无法阻止其他 React 应用的事件
  3. 与其他库（如 jQuery）混用时有问题


React 17+：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

事件绑定在 Root 容器：

<html>
  <body>
    <div id="root">  🔥 在这里绑定
      <button onClick={handler}>Click</button>
    </div>
  </body>
</html>

const root = createRoot(document.getElementById('root'));
root.render(<App />);

🔥 rootContainer.addEventListener('click', ...)  ← 在这里绑定

优势：
  ✅ 多个 React 应用可以独立工作
  ✅ stopPropagation 正确工作
  ✅ 更好地与其他库共存
  ✅ 支持渐进式升级


详细对比：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

场景 1：多个 React 应用
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

HTML:
<div id="app1"></div>
<div id="app2"></div>

React 16：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ReactDOM.render(<App1 />, document.getElementById('app1'));
ReactDOM.render(<App2 />, document.getElementById('app2'));

问题：
  - 两个应用都在 document 上绑定事件
  - App1 的 stopPropagation 会影响 App2
  - 事件处理顺序不可控

示例：
// App1
<button onClick={(e) => {
  e.stopPropagation();  // 🔥 会阻止 App2 的事件
}}>App1 Button</button>

// App2
<button onClick={handler}>App2 Button</button>


React 17+：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const root1 = createRoot(document.getElementById('app1'));
root1.render(<App1 />);

const root2 = createRoot(document.getElementById('app2'));
root2.render(<App2 />);

结果：
  - App1 在 #app1 上绑定事件
  - App2 在 #app2 上绑定事件
  - 两个应用互不干扰 ✨

示例：
// App1
<button onClick={(e) => {
  e.stopPropagation();  // ✅ 只影响 App1 内部
}}>App1 Button</button>

// App2
<button onClick={handler}>App2 Button</button>  // ✅ 正常工作


场景 2：与原生 DOM 混用
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

HTML:
<div id="outer">
  <div id="root">
    <button id="react-btn">React Button</button>
  </div>
</div>

JavaScript:
document.getElementById('outer').addEventListener('click', () => {
  console.log('Outer clicked');
});

React 16：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function App() {
  return (
    <button onClick={(e) => {
      e.stopPropagation();
      console.log('React button clicked');
    }}>
      Click
    </button>
  );
}

执行顺序：
  1. 点击 button
  2. 原生事件冒泡：button → #root → #outer
     输出："Outer clicked"
  3. 原生事件到达 document
  4. React 事件处理
     输出："React button clicked"
  5. e.stopPropagation() 只影响 React 内部

问题：
  🔥 stopPropagation 无法阻止原生事件


React 17+：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function App() {
  return (
    <button onClick={(e) => {
      e.stopPropagation();
      console.log('React button clicked');
    }}>
      Click
    </button>
  );
}

执行顺序：
  1. 点击 button
  2. 原生事件冒泡到 #root
  3. React 事件处理
     输出："React button clicked"
  4. e.stopPropagation() 阻止继续冒泡
  5. 原生事件不会到达 #outer

结果：
  ✅ stopPropagation 正确阻止原生事件


场景 3：渐进式升级
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

React 16：
  - 整个页面必须一起升级
  - 不同版本的 React 无法共存

React 17+：
  - 可以部分升级
  - 不同版本的 React 可以共存

示例：
<div id="legacy-app"></div>  <!-- React 16 -->
<div id="new-app"></div>      <!-- React 18 -->

// Legacy app (React 16)
ReactDOM.render(<LegacyApp />, document.getElementById('legacy-app'));

// New app (React 18)
const root = createRoot(document.getElementById('new-app'));
root.render(<NewApp />);

结果：
  ✅ 两个版本可以同时运行
  ✅ 事件互不干扰


源码变化：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

React 16：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// packages/react-dom/src/events/ReactBrowserEventEmitter.js

function listenTo(
  registrationName: string,
  mountAt: Document | Element | Node,
): void {
  const listeningSet = getListeningSetForElement(mountAt);
  const dependencies = registrationNameDependencies[registrationName];

  for (let i = 0; i < dependencies.length; i++) {
    const dependency = dependencies[i];
    if (!listeningSet.has(dependency)) {
      // 🔥 在 document 上绑定
      trapBubbledEvent(dependency, document);
      listeningSet.add(dependency);
    }
  }
}


React 17+：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// packages/react-dom/src/events/DOMPluginEventSystem.js

export function listenToAllSupportedEvents(
  rootContainerElement: EventTarget,
) {
  allNativeEvents.forEach(domEventName => {
    // 🔥 在 rootContainerElement 上绑定
    listenToNativeEvent(domEventName, false, rootContainerElement);
    listenToNativeEvent(domEventName, true, rootContainerElement);
  });
}


迁移指南：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

React 16 → React 17+：

1. 使用 createRoot 替代 ReactDOM.render
   // 旧
   ReactDOM.render(<App />, document.getElementById('root'));
   
   // 新
   const root = createRoot(document.getElementById('root'));
   root.render(<App />);

2. 检查 e.stopPropagation() 的使用
   - React 17+ 中会阻止原生事件
   - 确保这是期望的行为

3. 移除事件池相关代码
   // React 16
   function handleClick(e) {
     e.persist();  // 🔥 不再需要
     setTimeout(() => {
       console.log(e.target);
     }, 0);
   }
   
   // React 17+
   function handleClick(e) {
     // 🔥 直接使用，无需 persist
     setTimeout(() => {
       console.log(e.target);
     }, 0);
   }


总结：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

┌──────────────┬──────────┬──────────┬──────────┐
│ 特性          │ React 16 │ React 17+│ 影响     │
├──────────────┼──────────┼──────────┼──────────┤
│ 委托位置      │ document │ root     │ 重要     │
│ 多应用共存    │ ❌       │ ✅       │ 重要     │
│ stopPropagation│ 有问题  │ 正确     │ 重要     │
│ 事件池        │ ✅       │ ❌       │ 中等     │
│ 渐进式升级    │ ❌       │ ✅       │ 重要     │
└──────────────┴──────────┴──────────┴──────────┘`}
      </pre>
    </div>
  );
}

function SyntheticEvent() {
  return (
    <div>
      <pre style={{ background: '#f5f5f5', padding: '15px', borderRadius: '5px', overflow: 'auto', fontSize: '13px', lineHeight: '1.8' }}>
{`合成事件（SyntheticEvent）详解
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

什么是合成事件？
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

合成事件是 React 包装的事件对象，提供了与原生事件相同的接口，
但抹平了浏览器差异，并添加了额外的功能。


为什么需要合成事件？
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. 跨浏览器兼容
   - IE、Chrome、Firefox 的事件对象略有不同
   - React 提供统一接口

2. 性能优化
   - 事件池（React 17- 已移除）
   - 避免频繁创建对象

3. 功能增强
   - 统一的事件处理
   - 批量更新


合成事件 vs 原生事件：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

原生事件：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const button = document.getElementById('btn');
button.addEventListener('click', (nativeEvent) => {
  console.log(nativeEvent);
  // MouseEvent {
  //   target: <button>,
  //   currentTarget: <button>,
  //   type: 'click',
  //   preventDefault: function() {...},
  //   stopPropagation: function() {...},
  //   ...
  // }
});


React 合成事件：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

<button onClick={(syntheticEvent) => {
  console.log(syntheticEvent);
  // SyntheticMouseEvent {
  //   target: <button>,
  //   currentTarget: <button>,
  //   type: 'click',
  //   nativeEvent: MouseEvent {...},  // 🔥 原生事件
  //   preventDefault: function() {...},
  //   stopPropagation: function() {...},
  //   ...
  // }
}}>
  Click
</button>


合成事件接口：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface SyntheticEvent {
  // 🔥 基本属性
  type: string;                  // 事件类型 'click'
  target: EventTarget;           // 事件源
  currentTarget: EventTarget;    // 当前处理的元素
  nativeEvent: Event;            // 原生事件对象
  
  // 🔥 事件控制
  preventDefault(): void;
  stopPropagation(): void;
  
  // 🔥 状态标识
  defaultPrevented: boolean;
  isPropagationStopped(): boolean;
  isDefaultPrevented(): boolean;
  
  // 🔥 时间戳
  timeStamp: number;
  
  // 🔥 冒泡和捕获
  bubbles: boolean;
  cancelable: boolean;
  
  // 🔥 事件阶段
  eventPhase: number;
  
  // 🔥 是否可信
  isTrusted: boolean;
}


不同类型的合成事件：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. SyntheticMouseEvent
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

<button onClick={(e: SyntheticMouseEvent) => {
  console.log(e.clientX, e.clientY);  // 鼠标位置
  console.log(e.button);              // 按下的按钮
  console.log(e.altKey, e.ctrlKey);   // 修饰键
}}>
  Click
</button>

属性：
  - clientX, clientY: 鼠标位置
  - pageX, pageY: 页面位置
  - screenX, screenY: 屏幕位置
  - button: 按下的按钮（0=左，1=中，2=右）
  - buttons: 当前按下的按钮
  - altKey, ctrlKey, shiftKey, metaKey: 修饰键


2. SyntheticKeyboardEvent
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

<input onKeyDown={(e: SyntheticKeyboardEvent) => {
  console.log(e.key);        // 'Enter'
  console.log(e.code);       // 'Enter'
  console.log(e.keyCode);    // 13
  console.log(e.altKey);     // false
}}>

属性：
  - key: 按键名称
  - code: 物理按键
  - keyCode: 按键码（已废弃）
  - altKey, ctrlKey, shiftKey, metaKey: 修饰键


3. SyntheticFocusEvent
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

<input
  onFocus={(e: SyntheticFocusEvent) => {
    console.log(e.target);        // <input>
    console.log(e.relatedTarget); // 之前聚焦的元素
  }}
  onBlur={(e: SyntheticFocusEvent) => {
    console.log(e.relatedTarget); // 将要聚焦的元素
  }}
/>

属性：
  - relatedTarget: 相关元素


4. SyntheticTouchEvent
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

<div onTouchStart={(e: SyntheticTouchEvent) => {
  const touch = e.touches[0];
  console.log(touch.clientX, touch.clientY);
}}>
  Touch me
</div>

属性：
  - touches: 当前所有触摸点
  - targetTouches: 当前元素上的触摸点
  - changedTouches: 变化的触摸点


5. SyntheticWheelEvent
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

<div onWheel={(e: SyntheticWheelEvent) => {
  console.log(e.deltaX, e.deltaY, e.deltaZ);
  console.log(e.deltaMode);  // 0=pixel, 1=line, 2=page
}}>
  Scroll me
</div>


访问原生事件：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function handleClick(e) {
  // 🔥 合成事件
  console.log(e.type);  // 'click'
  
  // 🔥 原生事件
  console.log(e.nativeEvent.type);  // 'click'
  
  // 原生事件的特有属性
  console.log(e.nativeEvent.path);
  console.log(e.nativeEvent.composedPath());
}


事件池（React 17- 已移除）：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

React 16 及之前：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

问题：
function handleClick(e) {
  setTimeout(() => {
    console.log(e.type);  // ❌ null（事件对象被重置）
  }, 0);
}

原因：
  - React 复用事件对象（事件池）
  - 事件处理完成后，属性被清空
  - 异步访问会出错

解决方案：
function handleClick(e) {
  e.persist();  // 🔥 从池中移除，保留事件对象
  setTimeout(() => {
    console.log(e.type);  // ✅ 'click'
  }, 0);
}


React 17+：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

改进：
function handleClick(e) {
  // 🔥 无需 persist
  setTimeout(() => {
    console.log(e.type);  // ✅ 'click'
  }, 0);
}

原因：
  - 移除了事件池
  - 现代浏览器性能足够好
  - 简化 API


常见操作：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. 阻止默认行为
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

<a href="/page" onClick={(e) => {
  e.preventDefault();  // 🔥 阻止跳转
  // 自定义处理
}}>
  Link
</a>

<form onSubmit={(e) => {
  e.preventDefault();  // 🔥 阻止表单提交
  // 自定义提交逻辑
}}>
  ...
</form>


2. 阻止事件传播
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

<div onClick={() => console.log('Div')}>
  <button onClick={(e) => {
    e.stopPropagation();  // 🔥 阻止冒泡到 div
    console.log('Button');
  }}>
    Click
  </button>
</div>

输出：
  Button  （div 的 onClick 不会触发）


3. 获取事件信息
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

<button onClick={(e) => {
  console.log('事件类型:', e.type);
  console.log('事件源:', e.target);
  console.log('当前元素:', e.currentTarget);
  console.log('是否冒泡:', e.bubbles);
  console.log('时间戳:', e.timeStamp);
}}>
  Click
</button>


注意事项：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. 合成事件 vs 原生事件执行顺序
   - 原生事件先执行
   - 合成事件后执行

2. stopPropagation 的影响
   - React 17+: 阻止原生事件冒泡
   - React 16-: 只影响 React 内部

3. 不要在异步中访问事件属性（React 16-）
   - 使用 e.persist() 或
   - 先提取需要的值`}
      </pre>
    </div>
  );
}

function Demo() {
  const [logs, setLogs] = useState([]);
  const containerRef = useRef(null);
  
  useEffect(() => {
    // 原生事件监听
    const container = containerRef.current;
    if (container) {
      const nativeHandler = (e) => {
        addLog('🟢 原生事件（容器）');
      };
      container.addEventListener('click', nativeHandler);
      
      return () => {
        container.removeEventListener('click', nativeHandler);
      };
    }
  }, []);
  
  const addLog = (message) => {
    setLogs(prev => [...prev, `${performance.now().toFixed(2)}ms - ${message}`]);
  };
  
  const handleContainerClick = (e) => {
    addLog('🔵 React 事件（容器）');
  };
  
  const handleButtonClick = (e) => {
    addLog('🔵 React 事件（按钮）');
    addLog(`  target: ${e.target.tagName}`);
    addLog(`  currentTarget: ${e.currentTarget.tagName}`);
  };
  
  const handleStopClick = (e) => {
    e.stopPropagation();
    addLog('🔴 stopPropagation（按钮）');
  };
  
  const clearLogs = () => setLogs([]);
  
  return (
    <div>
      <h3>事件委托实时演示</h3>
      
      <div
        ref={containerRef}
        onClick={handleContainerClick}
        style={{
          padding: '20px',
          background: '#e3f2fd',
          borderRadius: '5px',
          marginBottom: '20px'
        }}
      >
        <p style={{ marginTop: 0 }}>容器（有 React onClick 和原生 addEventListener）</p>
        
        <button
          onClick={handleButtonClick}
          style={{
            padding: '10px 20px',
            background: '#2196f3',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          普通按钮
        </button>
        
        <button
          onClick={handleStopClick}
          style={{
            padding: '10px 20px',
            background: '#f44336',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          stopPropagation 按钮
        </button>
      </div>
      
      <button
        onClick={clearLogs}
        style={{
          padding: '10px 20px',
          background: '#666',
          color: '#fff',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          marginBottom: '20px'
        }}
      >
        清空日志
      </button>
      
      <div style={{ background: '#f5f5f5', padding: '15px', borderRadius: '5px', marginBottom: '20px' }}>
        <h4>事件执行日志：</h4>
        <div style={{ maxHeight: '300px', overflow: 'auto', fontSize: '13px', fontFamily: 'monospace' }}>
          {logs.length === 0 ? (
            <div style={{ color: '#999' }}>点击按钮查看事件执行顺序</div>
          ) : (
            logs.map((log, index) => (
              <div key={index} style={{ marginBottom: '3px' }}>{log}</div>
            ))
          )}
        </div>
      </div>
      
      <div style={{ background: '#fff3e0', padding: '15px', borderRadius: '5px' }}>
        <h4>观察要点：</h4>
        <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', lineHeight: '1.8' }}>
          <li><strong>原生事件先执行</strong>：容器的原生 addEventListener 先于 React 事件</li>
          <li><strong>React 事件后执行</strong>：React 的合成事件在原生事件冒泡完成后执行</li>
          <li><strong>stopPropagation</strong>：阻止事件继续冒泡到容器</li>
          <li><strong>target vs currentTarget</strong>：target 是点击的元素，currentTarget 是绑定事件的元素</li>
        </ul>
      </div>
    </div>
  );
}

function InterviewPoints() {
  return (
    <div>
      <pre style={{ background: '#f5f5f5', padding: '15px', borderRadius: '5px', overflow: 'auto', fontSize: '13px', lineHeight: '1.8' }}>
{`React 事件委托面试要点
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

必答问题：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Q1: React 如何实现事件委托？
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

A: 三步走：

1. 在 Root 容器上绑定所有事件
   rootContainer.addEventListener('click', dispatchEvent)

2. 原生事件冒泡到 Root 触发监听器
   用户点击 → 冒泡到 Root → dispatchEvent 执行

3. React 找到事件源的 Fiber，收集事件处理函数，执行
   找到 Fiber → 向上收集 onClick → 创建合成事件 → 执行


Q2: React 17 vs React 18 的事件委托有什么区别？
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

A:
React 16-: 绑定在 document
React 17+: 绑定在 Root 容器

优势：
  ✅ 多个 React 应用可以共存
  ✅ stopPropagation 正确工作
  ✅ 更好地与其他库混用


Q3: 什么是合成事件？
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

A: React 包装的事件对象

特点：
  - 跨浏览器兼容
  - 统一接口
  - 包含原生事件（nativeEvent）

访问：
  function handleClick(e) {
    e.type          // 合成事件
    e.nativeEvent   // 原生事件
  }


Q4: 为什么使用事件委托？
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

A: 性能和管理

优势：
  ✅ 减少监听器数量（1000 个按钮 = 1 个监听器）
  ✅ 动态元素自动支持
  ✅ 统一管理
  ✅ 可实现事件优先级


Q5: 原生事件和 React 事件的执行顺序？
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

A: 原生事件先执行

原因：
  - 原生事件在元素上绑定
  - React 事件在 Root 上绑定
  - 原生事件先冒泡，后触发 Root 的监听器

示例：
button.addEventListener('click', () => console.log('Native'));
<button onClick={() => console.log('React')}>

输出：
  Native
  React


Q6: stopPropagation 在 React 中如何工作？
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

A:
React 17+:
  - 阻止原生事件冒泡
  - 阻止 React 事件传播

React 16-:
  - 只阻止 React 事件传播
  - 无法阻止原生事件


Q7: React 事件优先级是什么？
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

A: 根据事件类型确定优先级

DiscreteEventPriority（高）:
  - click, keydown, input
  - 同步执行

ContinuousEventPriority（低）:
  - scroll, mousemove
  - 可中断

作用：
  - 高优先级优先执行
  - 低优先级可被打断


Q8: 事件池是什么？
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

A: React 16- 的性能优化

机制：
  - 复用事件对象
  - 事件处理完成后，属性清空

问题：
  function handleClick(e) {
    setTimeout(() => {
      console.log(e.type);  // ❌ null
    }, 0);
  }

解决：
  e.persist();  // 从池中移除

React 17+:
  🔥 已移除事件池


高级问题：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Q9: React 如何处理不冒泡的事件？
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

A: 特殊处理

不冒泡的事件：
  - focus / blur
  - mouseenter / mouseleave
  - load / error

React 的处理：
  - 使用捕获阶段监听
  - 或者直接在元素上绑定（某些情况）

示例：
  focus → 使用 focusin/focusout（冒泡版本）
  mouseenter → 转换为 mouseover + 判断


Q10: 如何在 React 中使用原生事件？
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

A: 使用 ref + useEffect

function App() {
  const buttonRef = useRef(null);
  
  useEffect(() => {
    const button = buttonRef.current;
    
    const handler = (e) => {
      console.log('Native event', e);
    };
    
    button.addEventListener('click', handler);
    
    return () => {
      button.removeEventListener('click', handler);
    };
  }, []);
  
  return <button ref={buttonRef}>Click</button>;
}

注意：
  - 需要手动清理
  - 原生事件先于 React 事件执行


最佳实践：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ 优先使用 React 合成事件
✅ 避免混用原生事件和 React 事件
✅ 使用 e.preventDefault() 和 e.stopPropagation()
✅ React 17+ 无需 e.persist()
❌ 不要在异步中访问 e（React 16-）
❌ 不要依赖事件执行顺序（原生 vs React）


关键总结：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔥 事件委托 = 在 Root 容器统一监听
🔥 合成事件 = React 包装的事件对象
🔥 事件优先级 = 根据类型确定执行顺序
🔥 React 17+ = Root 容器委托 + 无事件池`}
      </pre>
    </div>
  );
}
