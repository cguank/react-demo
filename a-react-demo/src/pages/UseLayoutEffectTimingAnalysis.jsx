import React, { useState, useLayoutEffect, useEffect, useRef } from 'react';

/**
 * useLayoutEffect 的精确执行时机
 * 
 * 核心问题：
 * 1. useLayoutEffect 是在 requestAnimationFrame 时机执行吗？
 * 2. 渲染树和布局是否已经计算好？
 * 3. 是否还没绘制到屏幕？
 */

export default function UseLayoutEffectTimingAnalysis() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🎯 useLayoutEffect 的精确执行时机</h1>
      
      {/* 核心答案 */}
      <div style={{ background: '#fff3e0', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>✅ 核心答案</h2>
        <CoreAnswer />
      </div>

      {/* 浏览器渲染流程 */}
      <div style={{ background: '#e3f2fd', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>🖥️ 浏览器渲染流程</h2>
        <BrowserRenderingPipeline />
      </div>

      {/* React 执行时机 */}
      <div style={{ background: '#e8f5e9', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>⚛️ React 执行时机</h2>
        <ReactExecutionTiming />
      </div>

      {/* 源码分析 */}
      <div style={{ background: '#f3e5f5', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>🔬 源码分析</h2>
        <SourceCodeAnalysis />
      </div>

      {/* 实际测试 */}
      <div style={{ background: '#fff9c4', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>🧪 实际测试</h2>
        <PracticalTest />
      </div>

      {/* 总结 */}
      <div style={{ background: '#e0f2f1', padding: '20px', borderRadius: '8px' }}>
        <h2>📝 总结</h2>
        <Summary />
      </div>
    </div>
  );
}

// 核心答案
function CoreAnswer() {
  return (
    <div style={{ background: '#fff', padding: '15px', borderRadius: '5px' }}>
      <h3>关键理解</h3>
      
      <div style={{ background: '#c8e6c9', padding: '15px', marginBottom: '15px', borderRadius: '5px' }}>
        <h4 style={{ marginTop: 0, color: '#2e7d32' }}>💡 精确答案</h4>
        <ul style={{ fontSize: '15px', lineHeight: '1.8', margin: '10px 0' }}>
          <li><strong>不是在 requestAnimationFrame 时机！</strong></li>
          <li><strong>是在 DOM 变更后，但在浏览器绘制（Paint）前</strong></li>
          <li><strong>此时布局（Layout）可能还未计算</strong></li>
          <li><strong>但会同步触发布局计算（如果读取布局信息）</strong></li>
        </ul>
      </div>
      
      <pre style={{ background: '#f5f5f5', padding: '15px', fontSize: '14px', lineHeight: '1.8' }}>
{`完整时间线：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Render 阶段（可中断）
   → 构建新的 Fiber 树
   → 标记副作用

2. Commit 阶段（不可中断）
   
   2.1 Before Mutation 阶段
       → 执行 DOM 操作前的准备
   
   2.2 Mutation 阶段
       → 🔥 DOM 变更（insertBefore, appendChild, removeChild）
       → DOM 树已经变了
       → 但浏览器还未重新计算布局
   
   2.3 Layout 阶段
       → 🔥🔥 useLayoutEffect 在这里执行！
       → DOM 已变，但还未绘制
       → 如果读取布局（clientWidth 等），会同步触发布局计算
       → 会阻塞浏览器绘制
   
   2.4 requestPaint() 调用
       → React 通知 Scheduler 可以让出给浏览器
       → 浏览器开始渲染流程
   
3. 浏览器渲染（在 Layout 阶段之后）
   
   3.1 Recalculate Style（重新计算样式）
       → 计算元素的最终样式
   
   3.2 Layout（布局/回流）
       → 计算元素的位置和大小
       → 构建渲染树
   
   3.3 requestAnimationFrame 回调
       → 在绘制前执行
       → 此时布局已计算完成
   
   3.4 Paint（绘制）
       → 绘制像素到图层
   
   3.5 Composite（合成）
       → 合成图层到屏幕

4. useEffect（异步执行）
   → 在浏览器绘制后执行

关键时间点对比：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DOM 变更 → useLayoutEffect → requestPaint → 
布局计算 → requestAnimationFrame → Paint → useEffect

useLayoutEffect 的位置：
✅ DOM 已变更
✅ 同步执行，阻塞绘制
❌ 布局可能还未计算（除非主动读取）
❌ 不是 requestAnimationFrame 时机
❌ Paint 还未开始

所以你的理解：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

"渲染树和布局计算好了，但是还没绘制在屏幕上"

✅ 正确：还没绘制到屏幕（Paint 还未开始）
⚠️ 部分正确：布局可能还未计算
   - 如果不读取布局信息，布局计算会延迟
   - 如果读取布局信息（如 clientWidth），会立即触发布局计算

❌ 不是 requestAnimationFrame 时机
   - requestAnimationFrame 在布局计算后
   - useLayoutEffect 在布局计算前（但可以触发计算）`}
      </pre>
    </div>
  );
}

// 浏览器渲染流程
function BrowserRenderingPipeline() {
  return (
    <div style={{ background: '#fff', padding: '15px', borderRadius: '5px' }}>
      <h3>浏览器的完整渲染流程</h3>
      
      <pre style={{ background: '#f5f5f5', padding: '15px', overflow: 'auto', fontSize: '13px', lineHeight: '1.8' }}>
{`经典的浏览器渲染管线（Rendering Pipeline）：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. JavaScript 执行
   → 修改 DOM/CSSOM
   → React 的 Commit 阶段在这里

2. Style（样式计算）
   → 计算每个元素的最终样式
   → Recalculate Style

3. Layout（布局/回流）
   → 计算元素的几何信息（位置、大小）
   → 构建渲染树（Render Tree）
   → 也叫 Reflow

4. Paint（绘制）
   → 将元素绘制成像素
   → 填充颜色、文字、阴影等

5. Composite（合成）
   → 将各个图层合成到屏幕

关键：requestAnimationFrame 的位置
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

浏览器的事件循环（Event Loop）：

Macrotask（宏任务）
  ↓
Microtasks（微任务）
  ↓
Rendering（渲染）：
  1. Recalculate Style
  2. Layout
  3. 🔥 requestAnimationFrame 回调
  4. Paint
  5. Composite
  ↓
重复...

requestAnimationFrame 特点：
- 在 Layout 之后，Paint 之前
- 此时布局信息已经计算完成
- 可以安全读取布局信息而不触发额外的回流
- 最佳的动画时机

React 的位置：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Macrotask:
  React Render 阶段
  React Commit 阶段:
    - DOM 变更
    - 🔥 useLayoutEffect（同步）
    - requestPaint()
  
Microtasks:
  Promise.then 等

Rendering:
  Recalculate Style
  Layout
  🔥 requestAnimationFrame
  Paint
  Composite

Macrotask（下一个）:
  🔥 useEffect 回调（通过 MessageChannel）

关键理解：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

useLayoutEffect:
  时机：DOM 变更后，浏览器渲染前
  位置：JavaScript 执行阶段
  特点：同步执行，阻塞渲染
  
requestAnimationFrame:
  时机：布局计算后，绘制前
  位置：浏览器渲染阶段
  特点：不阻塞，已知布局信息

useEffect:
  时机：浏览器绘制后
  位置：下一个宏任务
  特点：异步执行，不阻塞渲染

完整时间线图示：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

JS 执行阶段：
  ├─ setState()
  ├─ Render 阶段
  ├─ Commit 阶段
  │  ├─ Before Mutation
  │  ├─ Mutation（DOM 变更）
  │  └─ Layout（useLayoutEffect）← 你在这里
  └─ requestPaint()

浏览器渲染阶段：
  ├─ Recalculate Style
  ├─ Layout（布局计算）
  ├─ requestAnimationFrame ← rAF 在这里
  ├─ Paint
  └─ Composite

下一个宏任务：
  └─ useEffect ← 异步回调

所以：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

useLayoutEffect ≠ requestAnimationFrame

useLayoutEffect:
  - 更早（浏览器渲染前）
  - 同步阻塞
  - 可能触发布局计算

requestAnimationFrame:
  - 更晚（布局已计算）
  - 不阻塞
  - 布局信息已知`}
      </pre>
    </div>
  );
}

// React 执行时机
function ReactExecutionTiming() {
  return (
    <div style={{ background: '#fff', padding: '15px', borderRadius: '5px' }}>
      <h3>React 在浏览器渲染流程中的位置</h3>
      
      <pre style={{ background: '#f5f5f5', padding: '15px', overflow: 'auto', fontSize: '13px', lineHeight: '1.8' }}>
{`React 的完整流程：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. 触发更新
   setState() / dispatch()
   ↓
   
2. Schedule 阶段
   调度更新，计算优先级
   ↓
   
3. Render 阶段（可中断）
   - beginWork
   - completeWork
   - 构建 Fiber 树
   - 执行 Diff 算法
   - 标记副作用
   ↓
   
4. Commit 阶段（不可中断，同步执行）
   
   4.1 Before Mutation 阶段
       - getSnapshotBeforeUpdate
       - 准备 DOM 操作
   
   4.2 Mutation 阶段
       - 🔥 DOM 操作（insertBefore, appendChild, removeChild）
       - useLayoutEffect 的 cleanup
       - DOM 树已经变化！
       - 但浏览器还不知道（还未触发渲染）
   
   4.3 Layout 阶段
       - 🔥🔥 useLayoutEffect 回调执行
       - componentDidMount / componentDidUpdate
       - ref 回调
       - 此时 DOM 已变，但浏览器还未绘制
       - 如果读取布局信息，会同步触发浏览器的布局计算
   
   4.4 requestPaint()
       - React 调用 Scheduler.requestPaint()
       - 告诉 Scheduler 可以让出执行权给浏览器
   
   ↓
   
5. 浏览器渲染（React 让出后）
   - Recalculate Style
   - Layout（如果 useLayoutEffect 中读取了布局，这里可能已经完成）
   - requestAnimationFrame
   - Paint
   - Composite
   
   ↓
   
6. Passive Effects（异步）
   - 🔥 useEffect 回调执行
   - 在浏览器绘制后的下一个宏任务

useLayoutEffect 的特殊性：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function MyComponent() {
  useLayoutEffect(() => {
    // 🔥 此时的状态：
    
    // ✅ DOM 已经变更
    const element = document.getElementById('my-element');
    console.log(element); // 能获取到更新后的 DOM
    
    // ⚠️ 布局可能还未计算
    // 如果读取布局信息：
    const width = element.offsetWidth;  // 🔥 触发同步布局计算！
    console.log(width); // 能获取到正确的宽度
    
    // ✅ 可以修改 DOM，不会闪烁
    element.style.opacity = '0';
    element.style.transform = 'translateX(100px)';
    // 这些修改会在接下来的 Paint 中一次性绘制
    
    // ❌ 会阻塞浏览器绘制
    // 如果这里执行耗时操作，用户会感觉卡顿
  }, []);
  
  return <div id="my-element">Content</div>;
}

为什么 useLayoutEffect 会阻塞绘制？
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

因为它在 JavaScript 执行阶段同步执行：

JavaScript（同步）：
  Commit 阶段
    ├─ DOM 变更
    ├─ useLayoutEffect ← 同步执行
    └─ requestPaint()

如果 useLayoutEffect 耗时 100ms，
那么浏览器会等待 100ms 才开始渲染！

用户看到的：
  旧画面 → [100ms 白屏/卡顿] → 新画面

这就是为什么说它"阻塞绘制"！

对比 useEffect：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

JavaScript（同步）：
  Commit 阶段
    ├─ DOM 变更
    ├─ useLayoutEffect
    └─ requestPaint()
    
浏览器渲染：
  Paint（用户已经看到新画面）
  
JavaScript（异步，下一个宏任务）：
  useEffect ← 异步执行

即使 useEffect 耗时 100ms，
用户已经看到新画面，不会感觉卡顿！

使用场景：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

useLayoutEffect 适用于：
✅ 需要读取 DOM 布局信息并立即修改
✅ 需要避免视觉闪烁
✅ 需要在绘制前完成的操作
例如：测量元素大小、tooltip 定位、动画初始化

useEffect 适用于：
✅ 数据获取
✅ 订阅
✅ 不需要立即同步的副作用
例如：API 请求、事件监听、日志记录`}
      </pre>
    </div>
  );
}

// 源码分析
function SourceCodeAnalysis() {
  return (
    <div style={{ background: '#fff', padding: '15px', borderRadius: '5px' }}>
      <h3>源码中的执行顺序</h3>
      
      <pre style={{ background: '#f5f5f5', padding: '15px', overflow: 'auto', fontSize: '13px', lineHeight: '1.8' }}>
{`commitRootImpl 函数（React 的 Commit 入口）：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ReactFiberWorkLoop.old.js

function commitRootImpl(root, recoverableErrors, transitions, renderPriorityLevel) {
  
  // 1️⃣ Before Mutation 阶段
  commitBeforeMutationEffects(root, finishedWork);
  
  // 2️⃣ Mutation 阶段（DOM 变更）
  commitMutationEffects(root, finishedWork, lanes);
  // 🔥 此时 DOM 已经变了
  
  // 切换 current 树
  root.current = finishedWork;
  
  // 3️⃣ Layout 阶段
  commitLayoutEffects(finishedWork, root, lanes);
  // 🔥🔥 useLayoutEffect 在这里执行
  
  // 4️⃣ 通知 Scheduler 可以让出
  if (
    includesSyncLane(pendingPassiveEffectsLanes) &&
    root.tag !== LegacyRoot
  ) {
    flushSyncCallbacks();
  }
  
  // 🔥🔥🔥 关键：requestPaint()
  requestPaint();
  // 告诉 Scheduler 现在可以让浏览器渲染了
  
  // 5️⃣ 调度 Passive Effects（useEffect）
  if (
    (finishedWork.subtreeFlags & PassiveMask) !== NoFlags ||
    (finishedWork.flags & PassiveMask) !== NoFlags
  ) {
    if (!rootDoesHavePassiveEffects) {
      rootDoesHavePassiveEffects = true;
      pendingPassiveEffectsRemainingLanes = remainingLanes;
      
      // 🔥 异步调度 useEffect
      scheduleCallback(NormalSchedulerPriority, () => {
        flushPassiveEffects();
        return null;
      });
    }
  }
  
  // ... 其他清理工作
}

关键点：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. commitMutationEffects → DOM 变更
2. commitLayoutEffects → useLayoutEffect
3. requestPaint() → 告诉浏览器可以渲染了
4. scheduleCallback → 异步调度 useEffect

requestPaint 做了什么？
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Scheduler.js

export function requestPaint() {
  if (
    enableIsInputPending &&
    navigator !== undefined &&
    navigator.scheduling !== undefined &&
    navigator.scheduling.isInputPending !== undefined
  ) {
    needsPaint = true;
  }
  
  // 标记需要绘制
  // Scheduler 会在适当时机让出执行权
}

它不会直接调用 requestAnimationFrame！

而是标记"现在可以让浏览器渲染了"
Scheduler 会：
1. 检查是否还有高优先级任务
2. 如果没有，让出执行权
3. 浏览器开始渲染流程

所以时间线是：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

React:
  commitMutationEffects()     ← DOM 变更
  commitLayoutEffects()        ← useLayoutEffect
  requestPaint()               ← 标记可以渲染
  
  [React 让出执行权]
  
Browser:
  Recalculate Style
  Layout
  requestAnimationFrame 回调
  Paint
  Composite
  
React (下一个宏任务):
  flushPassiveEffects()        ← useEffect

useLayoutEffect 的实现：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ReactFiberCommitWork.old.js

function commitLayoutEffects(finishedWork, root, committedLanes) {
  // 遍历 Fiber 树
  let fiber = finishedWork;
  
  while (fiber !== null) {
    if (fiber.tag === FunctionComponent) {
      const updateQueue = fiber.updateQueue;
      if (updateQueue !== null) {
        const lastEffect = updateQueue.lastEffect;
        if (lastEffect !== null) {
          const firstEffect = lastEffect.next;
          
          let effect = firstEffect;
          do {
            // 🔥 执行 useLayoutEffect 的回调
            if ((effect.tag & HookLayout) !== NoHookEffect) {
              const create = effect.create;
              effect.destroy = create();  // 同步执行
            }
            effect = effect.next;
          } while (effect !== firstEffect);
        }
      }
    }
    
    // 遍历子节点
    fiber = fiber.child;
  }
}

关键：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

effect.destroy = create();

这是同步执行的！不是异步的！
所以会阻塞后续代码执行，包括浏览器渲染。`}
      </pre>
    </div>
  );
}

// 实际测试
function PracticalTest() {
  const [count, setCount] = useState(0);
  const [logs, setLogs] = useState([]);
  const boxRef = useRef(null);
  
  const addLog = (message) => {
    setLogs(prev => [...prev, { time: Date.now(), message }]);
  };
  
  useLayoutEffect(() => {
    const box = boxRef.current;
    if (box) {
      addLog('🟡 useLayoutEffect: 开始');
      addLog(`   DOM.textContent = "${box.textContent}"`);
      
      // 读取布局信息（会触发同步布局计算）
      const width = box.offsetWidth;
      addLog(`   DOM.offsetWidth = ${width}px`);
      
      // 修改样式
      box.style.background = '#4caf50';
      addLog('   修改样式为绿色');
      
      addLog('🟡 useLayoutEffect: 结束');
    }
  }, [count]);
  
  useEffect(() => {
    addLog('🔵 useEffect: 执行（异步，在绘制后）');
  }, [count]);
  
  const handleClick = () => {
    setLogs([]);
    addLog('🔴 Click: setState 触发更新');
    
    // 使用 requestAnimationFrame 观察时机
    requestAnimationFrame(() => {
      addLog('🟢 requestAnimationFrame: 执行');
    });
    
    setCount(c => c + 1);
  };
  
  return (
    <div style={{ background: '#fff', padding: '15px', borderRadius: '5px' }}>
      <h3>实际测试：观察执行顺序</h3>
      
      <div style={{ marginBottom: '20px' }}>
        <div 
          ref={boxRef}
          style={{
            padding: '20px',
            background: '#2196f3',
            color: '#fff',
            borderRadius: '5px',
            fontSize: '24px',
            fontWeight: 'bold',
            textAlign: 'center',
            marginBottom: '15px',
            transition: 'background 0.3s'
          }}
        >
          Count: {count}
        </div>
        
        <button
          onClick={handleClick}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            background: '#f44336',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          触发更新（观察执行顺序）
        </button>
      </div>
      
      <div style={{ 
        padding: '15px',
        background: '#f5f5f5',
        borderRadius: '5px',
        maxHeight: '400px',
        overflowY: 'auto'
      }}>
        <h4>执行日志：</h4>
        {logs.length === 0 ? (
          <div style={{ color: '#999', fontSize: '14px' }}>点击按钮查看执行顺序</div>
        ) : (
          logs.map((log, index) => (
            <div key={index} style={{ 
              fontSize: '13px', 
              marginBottom: '5px',
              fontFamily: 'monospace',
              lineHeight: '1.6'
            }}>
              {log.message}
            </div>
          ))
        )}
      </div>
      
      <div style={{ marginTop: '15px', padding: '10px', background: '#fff3e0', borderRadius: '5px', fontSize: '13px' }}>
        <strong>预期顺序：</strong>
        <ol style={{ margin: '10px 0', paddingLeft: '20px' }}>
          <li>🔴 Click: setState 触发更新</li>
          <li>🟡 useLayoutEffect: 开始</li>
          <li>🟡 useLayoutEffect: 读取 DOM 和布局</li>
          <li>🟡 useLayoutEffect: 结束</li>
          <li>🟢 requestAnimationFrame: 执行（绘制前）</li>
          <li>🔵 useEffect: 执行（绘制后）</li>
        </ol>
        <div style={{ marginTop: '10px', color: '#666' }}>
          注意：useLayoutEffect 在 requestAnimationFrame 之前！
        </div>
      </div>
    </div>
  );
}

// 总结
function Summary() {
  return (
    <div style={{ background: '#fff', padding: '15px', borderRadius: '5px' }}>
      <h3>核心要点总结</h3>
      
      <div style={{ background: '#ffebee', padding: '15px', marginBottom: '15px', borderRadius: '5px' }}>
        <h4>❌ 常见误解</h4>
        <ul style={{ fontSize: '14px', lineHeight: '1.8', margin: '10px 0' }}>
          <li>useLayoutEffect ≠ requestAnimationFrame</li>
          <li>useLayoutEffect 执行时，布局可能还未计算</li>
          <li>但读取布局信息会触发同步计算</li>
        </ul>
      </div>
      
      <div style={{ background: '#e8f5e9', padding: '15px', marginBottom: '15px', borderRadius: '5px' }}>
        <h4>✅ 正确理解</h4>
        <pre style={{ background: '#fff', padding: '10px', fontSize: '13px', margin: '10px 0', lineHeight: '1.6' }}>
{`执行顺序：

1. DOM 变更（Mutation）
2. useLayoutEffect ← 同步，阻塞绘制
3. requestPaint()
4. [React 让出]
5. 浏览器：Style → Layout
6. requestAnimationFrame ← 在这里
7. 浏览器：Paint → Composite
8. useEffect ← 异步，不阻塞`}
        </pre>
      </div>
      
      <div style={{ background: '#e3f2fd', padding: '15px', marginBottom: '15px', borderRadius: '5px' }}>
        <h4>🎯 useLayoutEffect 的特点</h4>
        <ul style={{ fontSize: '14px', lineHeight: '1.8', margin: '10px 0' }}>
          <li><strong>时机：</strong>DOM 变更后，浏览器绘制前</li>
          <li><strong>执行：</strong>同步执行，阻塞渲染</li>
          <li><strong>布局：</strong>可能未计算，但可触发同步计算</li>
          <li><strong>用途：</strong>测量 DOM、避免闪烁、tooltip 定位</li>
        </ul>
      </div>
      
      <div style={{ background: '#fff9c4', padding: '15px', borderRadius: '5px' }}>
        <h4>💡 关键理解</h4>
        <p style={{ fontSize: '14px', lineHeight: '1.8', margin: '10px 0' }}>
          <strong>你的理解部分正确：</strong><br/>
          ✅ "还没绘制在屏幕上" - 正确<br/>
          ⚠️ "渲染树和布局计算好了" - 不完全正确<br/>
          <span style={{ marginLeft: '20px' }}>• 布局可能还未计算</span><br/>
          <span style={{ marginLeft: '20px' }}>• 但读取布局会触发计算</span><br/>
          ❌ "在 requestAnimationFrame" - 不正确<br/>
          <span style={{ marginLeft: '20px' }}>• useLayoutEffect 更早</span><br/>
          <span style={{ marginLeft: '20px' }}>• requestAnimationFrame 在布局后</span>
        </p>
      </div>
    </div>
  );
}
