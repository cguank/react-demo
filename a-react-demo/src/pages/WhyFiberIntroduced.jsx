import React, { useState, useEffect, useRef } from 'react';

/**
 * React 16+ 为何引入 Fiber 架构 - 深度分析
 * 
 * 核心问题：React 15 及之前版本存在的性能瓶颈和用户体验问题
 */

const WhyFiberIntroduced = () => {
  return (
    <div style={{ padding: '40px', fontFamily: 'system-ui', maxWidth: '1400px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '36px', marginBottom: '40px', color: '#1a73e8' }}>
        🧬 React 16+ 为何引入 Fiber 架构
      </h1>

      {/* 核心问题概述 */}
      <section style={{ marginBottom: '60px' }}>
        <h2 style={{ fontSize: '28px', color: '#333', marginBottom: '20px' }}>
          一、React 15 的核心问题
        </h2>
        
        <div style={{ background: '#fff3cd', padding: '30px', borderRadius: '12px', border: '2px solid #ffc107' }}>
          <h3 style={{ fontSize: '22px', color: '#d32f2f', marginBottom: '20px' }}>
            ❌ 递归调用栈，无法中断
          </h3>
          <div style={{ lineHeight: '1.8', fontSize: '16px' }}>
            <p style={{ marginBottom: '15px' }}>
              <strong>问题 1：同步递归更新</strong><br/>
              React 15 使用 <code style={{ background: '#f5f5f5', padding: '2px 8px', borderRadius: '4px' }}>Stack Reconciler</code>，
              通过递归遍历整棵组件树进行 diff 和更新。一旦开始，就必须一次性完成，无法暂停或中断。
            </p>
            <p style={{ marginBottom: '15px' }}>
              <strong>问题 2：长时间占用主线程</strong><br/>
              对于大型应用（比如 1000+ 个组件的复杂页面），一次更新可能需要 <strong>16ms 以上</strong>（超过一帧的时间 16.67ms）。
              在这期间，JS 线程被完全占用，导致：
            </p>
            <ul style={{ marginLeft: '20px', marginBottom: '15px' }}>
              <li>用户输入无响应（文本框卡顿）</li>
              <li>动画掉帧（从 60fps 降到 30fps 甚至更低）</li>
              <li>页面滚动不流畅</li>
              <li>页面完全"冻结"</li>
            </ul>
            <p style={{ marginBottom: '15px' }}>
              <strong>问题 3：缺乏优先级机制</strong><br/>
              所有更新的优先级相同，用户输入（高优先级）和数据加载（低优先级）无法区分，
              导致关键交互被延迟。
            </p>
          </div>
        </div>
      </section>

      {/* React 15 源码分析 */}
      <section style={{ marginBottom: '60px' }}>
        <h2 style={{ fontSize: '28px', color: '#333', marginBottom: '20px' }}>
          二、React 15 Stack Reconciler 源码（伪代码）
        </h2>
        
        <div style={{ background: '#f8f9fa', padding: '25px', borderRadius: '12px', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '20px', marginBottom: '15px' }}>📋 递归更新流程</h3>
          <pre style={{ 
            background: '#1e1e1e', 
            color: '#d4d4d4', 
            padding: '20px', 
            borderRadius: '8px', 
            overflow: 'auto',
            fontSize: '14px',
            lineHeight: '1.6'
          }}>
{`// React 15 的 mountComponent（简化版）
function mountComponent(element) {
  // 🔴 递归调用，无法中断
  const instance = new element.type(element.props);
  const renderedElement = instance.render();
  
  // 🔴 继续递归处理子组件
  const childComponent = mountComponent(renderedElement);
  
  return {
    instance,
    childComponent,
    element
  };
}

// React 15 的 updateComponent（简化版）
function updateComponent(prevElement, nextElement) {
  // 🔴 同步递归 diff，必须一次性完成
  if (prevElement.type !== nextElement.type) {
    // 不同类型，直接替换
    unmountComponent(prevElement);
    return mountComponent(nextElement);
  }
  
  // 🔴 递归更新子组件
  const prevRendered = prevElement.renderedElement;
  const nextRendered = nextElement.instance.render();
  
  updateComponent(prevRendered, nextRendered);
}

// 🔴 关键问题：递归调用栈
function reconcileChildren(children) {
  children.forEach(child => {
    // 递归处理每个子节点
    reconcile(child);
    
    // 如果子节点有很多子节点，会继续递归
    if (child.children) {
      reconcileChildren(child.children); // 🔴 无法中断
    }
  });
}`}
          </pre>
          <div style={{ 
            background: '#fff3cd', 
            padding: '15px', 
            borderRadius: '8px',
            marginTop: '15px',
            fontSize: '15px',
            lineHeight: '1.6'
          }}>
            <strong>⚠️ 核心问题：</strong><br/>
            • 使用 <strong>JavaScript 原生递归调用栈</strong><br/>
            • 递归过程 <strong>无法被打断</strong>（调用栈必须完全展开）<br/>
            • 如果组件树深度很大（比如 1000 层），递归调用 1000 次，期间主线程完全被占用<br/>
            • 在 16.67ms 的一帧内如果无法完成，就会造成卡顿
          </div>
        </div>
      </section>

      {/* Fiber 架构的解决方案 */}
      <section style={{ marginBottom: '60px' }}>
        <h2 style={{ fontSize: '28px', color: '#333', marginBottom: '20px' }}>
          三、Fiber 架构如何解决这些问题
        </h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {/* 解决方案 1 */}
          <div style={{ background: '#e8f5e9', padding: '25px', borderRadius: '12px', border: '2px solid #4caf50' }}>
            <h3 style={{ fontSize: '20px', color: '#2e7d32', marginBottom: '15px' }}>
              ✅ 1. 可中断的递归（链表结构）
            </h3>
            <div style={{ fontSize: '15px', lineHeight: '1.7' }}>
              <p style={{ marginBottom: '12px' }}>
                <strong>核心改变：</strong>将递归调用栈改为 <strong>链表结构</strong>
              </p>
              <ul style={{ marginLeft: '20px' }}>
                <li>每个组件对应一个 <code>Fiber 节点</code></li>
                <li>通过 <code>child</code>、<code>sibling</code>、<code>return</code> 指针连接</li>
                <li>使用 <strong>循环遍历</strong> 代替递归</li>
                <li>可以随时暂停和恢复</li>
              </ul>
            </div>
          </div>

          {/* 解决方案 2 */}
          <div style={{ background: '#e3f2fd', padding: '25px', borderRadius: '12px', border: '2px solid #2196f3' }}>
            <h3 style={{ fontSize: '20px', color: '#1565c0', marginBottom: '15px' }}>
              ✅ 2. 时间切片（Time Slicing）
            </h3>
            <div style={{ fontSize: '15px', lineHeight: '1.7' }}>
              <p style={{ marginBottom: '12px' }}>
                <strong>核心机制：</strong>将长任务拆分成多个小任务
              </p>
              <ul style={{ marginLeft: '20px' }}>
                <li>每个 Fiber 节点作为一个工作单元</li>
                <li>每处理完一个 Fiber，检查是否超过 <strong>5ms</strong></li>
                <li>超时则暂停，让浏览器执行渲染</li>
                <li>通过 <code>MessageChannel</code> 调度下一帧继续</li>
              </ul>
            </div>
          </div>

          {/* 解决方案 3 */}
          <div style={{ background: '#f3e5f5', padding: '25px', borderRadius: '12px', border: '2px solid #9c27b0' }}>
            <h3 style={{ fontSize: '20px', color: '#6a1b9a', marginBottom: '15px' }}>
              ✅ 3. 优先级调度（Priority Scheduling）
            </h3>
            <div style={{ fontSize: '15px', lineHeight: '1.7' }}>
              <p style={{ marginBottom: '12px' }}>
                <strong>核心机制：</strong>不同更新赋予不同优先级
              </p>
              <ul style={{ marginLeft: '20px' }}>
                <li><strong>立即优先级</strong>：用户输入（onClick）</li>
                <li><strong>用户阻塞优先级</strong>：鼠标移动（onMouseMove）</li>
                <li><strong>正常优先级</strong>：网络请求</li>
                <li><strong>低优先级</strong>：数据预加载</li>
                <li><strong>空闲优先级</strong>：离屏内容</li>
              </ul>
            </div>
          </div>

          {/* 解决方案 4 */}
          <div style={{ background: '#fff3e0', padding: '25px', borderRadius: '12px', border: '2px solid #ff9800' }}>
            <h3 style={{ fontSize: '20px', color: '#e65100', marginBottom: '15px' }}>
              ✅ 4. 并发渲染（Concurrent Rendering）
            </h3>
            <div style={{ fontSize: '15px', lineHeight: '1.7' }}>
              <p style={{ marginBottom: '12px' }}>
                <strong>核心机制：</strong>多个更新可以"并发"进行
              </p>
              <ul style={{ marginLeft: '20px' }}>
                <li>低优先级更新进行到一半</li>
                <li>高优先级更新插入</li>
                <li>暂停低优先级，先处理高优先级</li>
                <li>高优先级完成后，继续或重新开始低优先级</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Fiber 架构源码分析 */}
      <section style={{ marginBottom: '60px' }}>
        <h2 style={{ fontSize: '28px', color: '#333', marginBottom: '20px' }}>
          四、Fiber 架构源码分析（React 18.2.0）
        </h2>
        
        <div style={{ background: '#f8f9fa', padding: '25px', borderRadius: '12px', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '20px', marginBottom: '15px' }}>📋 1. Fiber 数据结构（链表）</h3>
          <pre style={{ 
            background: '#1e1e1e', 
            color: '#d4d4d4', 
            padding: '20px', 
            borderRadius: '8px', 
            overflow: 'auto',
            fontSize: '14px',
            lineHeight: '1.6'
          }}>
{`// packages/react-reconciler/src/ReactInternalTypes.js
export type Fiber = {
  // 🔥 节点类型（FunctionComponent、ClassComponent、HostComponent等）
  tag: WorkTag,
  type: any,           // 组件类型（函数、类、div等）
  stateNode: any,      // 真实 DOM 节点或组件实例
  
  // 🔥 链表结构：可中断的关键
  return: Fiber | null,    // 父节点（向上）
  child: Fiber | null,     // 第一个子节点（向下）
  sibling: Fiber | null,   // 下一个兄弟节点（平级）
  
  // 🔥 双缓冲机制
  alternate: Fiber | null, // 指向另一棵树的对应节点
  
  // 🔥 副作用标记
  flags: Flags,            // 本节点的副作用（Placement、Update、Deletion等）
  
  // 🔥 优先级
  lanes: Lanes,            // 本次更新的优先级
  childLanes: Lanes,       // 子树的优先级
  
  // 其他属性...
};`}
          </pre>
          <div style={{ 
            background: '#e8f5e9', 
            padding: '15px', 
            borderRadius: '8px',
            marginTop: '15px',
            fontSize: '15px',
            lineHeight: '1.6'
          }}>
            <strong>💡 关键设计：</strong><br/>
            • 通过 <code>child</code>、<code>sibling</code>、<code>return</code> 形成链表<br/>
            • 遍历时不需要递归调用栈，使用 <strong>循环 + 指针移动</strong><br/>
            • 可以随时保存当前 <code>workInProgress</code> 指针，暂停工作<br/>
            • 恢复时从保存的指针继续处理
          </div>
        </div>

        <div style={{ background: '#f8f9fa', padding: '25px', borderRadius: '12px', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '20px', marginBottom: '15px' }}>📋 2. 可中断的工作循环</h3>
          <pre style={{ 
            background: '#1e1e1e', 
            color: '#d4d4d4', 
            padding: '20px', 
            borderRadius: '8px', 
            overflow: 'auto',
            fontSize: '14px',
            lineHeight: '1.6'
          }}>
{`// packages/react-reconciler/src/ReactFiberWorkLoop.old.js

// 🔥 同步模式（React 15 的行为，兼容）
function workLoopSync() {
  while (workInProgress !== null) {
    performUnitOfWork(workInProgress); // 🔴 不检查超时，一次性完成
  }
}

// 🔥 并发模式（React 18 新增，可中断）
function workLoopConcurrent() {
  // 🔥 关键：循环 + shouldYield 检查
  while (workInProgress !== null && !shouldYield()) {
    performUnitOfWork(workInProgress); // 处理一个 Fiber 节点
  }
  // 🔥 如果 shouldYield() 返回 true，循环退出，暂停工作
  // workInProgress 保存了当前进度，下次从这里继续
}

// 🔥 处理一个工作单元（一个 Fiber 节点）
function performUnitOfWork(unitOfWork: Fiber): void {
  const current = unitOfWork.alternate; // 获取旧 Fiber（双缓冲）
  
  // 🔥 "递"阶段：处理当前节点，返回子节点
  let next = beginWork(current, unitOfWork, renderLanes);
  
  if (next === null) {
    // 🔥 "归"阶段：没有子节点，完成当前节点
    completeUnitOfWork(unitOfWork);
  } else {
    // 🔥 有子节点，继续处理子节点
    workInProgress = next;
  }
}

// 🔥 检查是否应该让出控制权（时间切片）
function shouldYield() {
  const currentTime = getCurrentTime();
  return currentTime >= deadline; // 🔥 超过 5ms（frameYieldMs）
}`}
          </pre>
          <div style={{ 
            background: '#e3f2fd', 
            padding: '15px', 
            borderRadius: '8px',
            marginTop: '15px',
            fontSize: '15px',
            lineHeight: '1.6'
          }}>
            <strong>💡 可中断的原理：</strong><br/>
            • <strong>React 15</strong>：<code>while (hasMoreWork) {'{'} recursiveUpdate() {'}'}</code> → 递归调用栈，无法中断<br/>
            • <strong>React 16+</strong>：<code>while (workInProgress !== null && !shouldYield()) {'{'} ... {'}'}</code> → 循环 + 链表，可中断<br/>
            • 每处理完一个 Fiber，检查 <code>shouldYield()</code><br/>
            • 如果超时，退出循环，保存 <code>workInProgress</code> 指针<br/>
            • 下一帧通过 <code>MessageChannel</code> 触发，从 <code>workInProgress</code> 继续
          </div>
        </div>

        <div style={{ background: '#f8f9fa', padding: '25px', borderRadius: '12px', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '20px', marginBottom: '15px' }}>📋 3. 时间切片调度（Scheduler）</h3>
          <pre style={{ 
            background: '#1e1e1e', 
            color: '#d4d4d4', 
            padding: '20px', 
            borderRadius: '8px', 
            overflow: 'auto',
            fontSize: '14px',
            lineHeight: '1.6'
          }}>
{`// packages/scheduler/src/forks/Scheduler.js

// 🔥 每帧的时间预算（默认 5ms）
let frameYieldMs = 5;

function shouldYieldToHost() {
  const timeElapsed = getCurrentTime() - startTime;
  if (timeElapsed < frameYieldMs) {
    return false; // 还没超时，继续工作
  }
  // 🔥 超过 5ms，需要让出控制权给浏览器
  return true;
}

// 🔥 通过 MessageChannel 调度下一帧工作
const channel = new MessageChannel();
const port = channel.port2;
channel.port1.onmessage = performWorkUntilDeadline;

const schedulePerformWorkUntilDeadline = () => {
  port.postMessage(null); // 🔥 触发 macrotask，在下一帧执行
};

// 🔥 执行工作直到超时
const performWorkUntilDeadline = () => {
  if (scheduledHostCallback !== null) {
    const currentTime = getCurrentTime();
    startTime = currentTime;
    const hasTimeRemaining = true;
    
    try {
      // 🔥 执行工作，返回是否还有剩余工作
      const hasMoreWork = scheduledHostCallback(hasTimeRemaining, currentTime);
      
      if (hasMoreWork) {
        // 🔥 还有剩余工作，继续调度
        schedulePerformWorkUntilDeadline();
      } else {
        scheduledHostCallback = null;
      }
    } catch (error) {
      // 🔥 即使出错，也要继续调度
      schedulePerformWorkUntilDeadline();
      throw error;
    }
  }
};`}
          </pre>
          <div style={{ 
            background: '#f3e5f5', 
            padding: '15px', 
            borderRadius: '8px',
            marginTop: '15px',
            fontSize: '15px',
            lineHeight: '1.6'
          }}>
            <strong>💡 时间切片的完整流程：</strong><br/>
            1. 开始工作，记录 <code>startTime</code><br/>
            2. 处理 Fiber 节点（<code>performUnitOfWork</code>）<br/>
            3. 每处理完一个 Fiber，检查 <code>shouldYield()</code><br/>
            4. 如果超过 5ms，保存进度，退出循环<br/>
            5. 通过 <code>MessageChannel.postMessage</code> 调度下一帧<br/>
            6. 浏览器有机会执行渲染、响应用户输入<br/>
            7. 下一帧开始，从保存的 <code>workInProgress</code> 继续
          </div>
        </div>

        <div style={{ background: '#f8f9fa', padding: '25px', borderRadius: '12px' }}>
          <h3 style={{ fontSize: '20px', marginBottom: '15px' }}>📋 4. 优先级调度</h3>
          <pre style={{ 
            background: '#1e1e1e', 
            color: '#d4d4d4', 
            padding: '20px', 
            borderRadius: '8px', 
            overflow: 'auto',
            fontSize: '14px',
            lineHeight: '1.6'
          }}>
{`// packages/react-reconciler/src/ReactEventPriorities.js

export const DiscreteEventPriority: EventPriority = SyncLane;      // 最高优先级（用户输入）
export const ContinuousEventPriority: EventPriority = InputContinuousLane; // 连续事件
export const DefaultEventPriority: EventPriority = DefaultLane;    // 默认优先级
export const IdleEventPriority: EventPriority = IdleLane;          // 空闲优先级

// packages/react-reconciler/src/ReactFiberWorkLoop.old.js

function ensureRootIsScheduled(root: FiberRoot, currentTime: number) {
  const existingCallbackPriority = root.callbackPriority;
  const nextLanes = getNextLanes(root); // 🔥 获取下一个要处理的优先级
  const newCallbackPriority = getHighestPriorityLane(nextLanes);
  
  // 🔥 如果新更新的优先级更高，取消当前工作
  if (newCallbackPriority > existingCallbackPriority) {
    if (existingCallbackNode !== null) {
      cancelCallback(existingCallbackNode); // 🔥 取消低优先级任务
    }
    
    // 🔥 调度新的高优先级任务
    const newCallbackNode = scheduleCallback(
      schedulerPriorityLevel,
      performConcurrentWorkOnRoot.bind(null, root),
    );
    root.callbackNode = newCallbackNode;
    root.callbackPriority = newCallbackPriority;
  }
}`}
          </pre>
          <div style={{ 
            background: '#fff3e0', 
            padding: '15px', 
            borderRadius: '8px',
            marginTop: '15px',
            fontSize: '15px',
            lineHeight: '1.6'
          }}>
            <strong>💡 优先级调度的作用：</strong><br/>
            • 用户点击按钮（<code>DiscreteEventPriority</code>）插入<br/>
            • 正在处理数据加载更新（<code>DefaultEventPriority</code>）<br/>
            • React 检测到高优先级更新，<code>cancelCallback</code> 取消低优先级<br/>
            • 先处理用户点击，确保交互响应<br/>
            • 点击完成后，重新调度数据加载更新
          </div>
        </div>
      </section>

      {/* 对比演示 */}
      <section style={{ marginBottom: '60px' }}>
        <h2 style={{ fontSize: '28px', color: '#333', marginBottom: '20px' }}>
          五、交互演示：Stack vs Fiber
        </h2>
        
        <DemoComparison />
      </section>

      {/* 总结 */}
      <section style={{ marginBottom: '60px' }}>
        <h2 style={{ fontSize: '28px', color: '#333', marginBottom: '20px' }}>
          六、总结：为什么引入 Fiber
        </h2>
        
        <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '40px', borderRadius: '12px', color: 'white' }}>
          <div style={{ fontSize: '18px', lineHeight: '2' }}>
            <h3 style={{ fontSize: '24px', marginBottom: '20px' }}>🎯 核心原因</h3>
            
            <div style={{ marginBottom: '25px' }}>
              <strong style={{ fontSize: '20px' }}>1️⃣ 解决性能瓶颈</strong>
              <div style={{ marginLeft: '20px', marginTop: '10px', opacity: 0.95 }}>
                • React 15 的递归更新无法中断，大型应用更新耗时过长<br/>
                • 主线程被长时间占用，导致页面卡顿、交互延迟<br/>
                • Fiber 通过时间切片，将长任务拆分成小任务，每 5ms 暂停一次
              </div>
            </div>
            
            <div style={{ marginBottom: '25px' }}>
              <strong style={{ fontSize: '20px' }}>2️⃣ 提升用户体验</strong>
              <div style={{ marginLeft: '20px', marginTop: '10px', opacity: 0.95 }}>
                • 确保关键交互（点击、输入）能快速响应<br/>
                • 动画和滚动保持流畅（60fps）<br/>
                • 页面不会"冻结"，即使在大量更新时
              </div>
            </div>
            
            <div style={{ marginBottom: '25px' }}>
              <strong style={{ fontSize: '20px' }}>3️⃣ 支持并发特性</strong>
              <div style={{ marginLeft: '20px', marginTop: '10px', opacity: 0.95 }}>
                • 为 React 18 的并发模式奠定基础<br/>
                • 支持 <code>useTransition</code>、<code>useDeferredValue</code> 等新 API<br/>
                • 支持 Suspense、并发渲染、自动批处理等高级功能
              </div>
            </div>
            
            <div style={{ marginBottom: '25px' }}>
              <strong style={{ fontSize: '20px' }}>4️⃣ 更灵活的架构</strong>
              <div style={{ marginLeft: '20px', marginTop: '10px', opacity: 0.95 }}>
                • 链表结构易于中断、恢复、优先级调度<br/>
                • 双缓冲机制（current 和 workInProgress 树）支持增量更新<br/>
                • 更好地支持异步渲染和服务端渲染
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 面试要点 */}
      <section>
        <h2 style={{ fontSize: '28px', color: '#333', marginBottom: '20px' }}>
          七、面试要点总结
        </h2>
        
        <div style={{ background: '#fff', padding: '30px', borderRadius: '12px', border: '2px solid #e0e0e0' }}>
          <h3 style={{ fontSize: '20px', marginBottom: '15px', color: '#1a73e8' }}>💼 如何回答"为什么引入 Fiber"</h3>
          <div style={{ fontSize: '16px', lineHeight: '1.8' }}>
            <ol style={{ marginLeft: '20px' }}>
              <li style={{ marginBottom: '15px' }}>
                <strong>简洁版（1 分钟）：</strong><br/>
                React 16 引入 Fiber 架构主要是为了解决 React 15 的性能问题。React 15 使用递归更新，
                无法中断，导致大型应用更新时页面卡顿。Fiber 通过链表结构和时间切片，将长任务拆分成小任务，
                每 5ms 暂停一次让浏览器渲染，从而保证页面流畅和交互响应。
              </li>
              <li style={{ marginBottom: '15px' }}>
                <strong>详细版（3-5 分钟）：</strong><br/>
                1️⃣ <strong>问题背景</strong>：React 15 使用 Stack Reconciler，递归遍历组件树，无法中断，
                大型应用更新可能超过 16ms，导致掉帧。<br/>
                2️⃣ <strong>解决方案</strong>：Fiber 将组件树改为链表结构（child/sibling/return），
                使用循环代替递归，可以随时暂停和恢复。<br/>
                3️⃣ <strong>时间切片</strong>：通过 <code>shouldYield()</code> 检查是否超过 5ms，
                超时则暂停，通过 MessageChannel 调度下一帧继续。<br/>
                4️⃣ <strong>优先级调度</strong>：不同更新有不同优先级，高优先级更新可以打断低优先级更新。<br/>
                5️⃣ <strong>并发特性</strong>：为 React 18 的并发模式（useTransition、Suspense）奠定基础。
              </li>
              <li>
                <strong>进阶版（源码级别）：</strong><br/>
                可以提到 <code>workLoopConcurrent</code>、<code>performUnitOfWork</code>、
                <code>beginWork</code>/<code>completeWork</code> 的"递归"流程，
                以及 <code>ensureRootIsScheduled</code> 的优先级调度机制。
              </li>
            </ol>
          </div>
        </div>
      </section>
    </div>
  );
};

/**
 * 交互演示组件：对比 Stack Reconciler 和 Fiber Reconciler
 */
const DemoComparison = () => {
  const [mode, setMode] = useState('stack'); // 'stack' or 'fiber'
  const [isUpdating, setIsUpdating] = useState(false);
  const [items, setItems] = useState([]);
  const [fps, setFps] = useState(60);
  const [inputValue, setInputValue] = useState('');
  const [logs, setLogs] = useState([]);
  
  const frameRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const animationRef = useRef(null);
  
  // 模拟 FPS 计算
  useEffect(() => {
    const calculateFPS = () => {
      frameRef.current++;
      const currentTime = performance.now();
      const delta = currentTime - lastTimeRef.current;
      
      if (delta >= 1000) {
        const currentFPS = Math.round((frameRef.current * 1000) / delta);
        setFps(currentFPS);
        frameRef.current = 0;
        lastTimeRef.current = currentTime;
      }
      
      animationRef.current = requestAnimationFrame(calculateFPS);
    };
    
    animationRef.current = requestAnimationFrame(calculateFPS);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);
  
  // 模拟大量更新
  const handleUpdate = () => {
    setIsUpdating(true);
    setLogs([]);
    const startTime = performance.now();
    
    if (mode === 'stack') {
      // 模拟 Stack Reconciler：同步阻塞更新
      setLogs(prev => [...prev, `⏱️ ${new Date().toLocaleTimeString()}.${Date.now() % 1000} - 开始 Stack 更新`]);
      
      // 模拟大量计算（阻塞主线程）
      const newItems = [];
      for (let i = 0; i < 5000; i++) {
        newItems.push({
          id: i,
          value: Math.random()
        });
      }
      
      // 同步更新，阻塞主线程
      setTimeout(() => {
        setItems(newItems);
        const endTime = performance.now();
        setLogs(prev => [
          ...prev,
          `⏱️ ${new Date().toLocaleTimeString()}.${Date.now() % 1000} - Stack 更新完成`,
          `⚠️ 耗时：${(endTime - startTime).toFixed(2)}ms（期间主线程被完全占用）`,
          `⚠️ 注意：在更新期间，输入框无法响应，FPS 可能下降`
        ]);
        setIsUpdating(false);
      }, 0);
      
    } else {
      // 模拟 Fiber Reconciler：时间切片更新
      setLogs(prev => [...prev, `⏱️ ${new Date().toLocaleTimeString()}.${Date.now() % 1000} - 开始 Fiber 更新（时间切片）`]);
      
      const newItems = [];
      let processedCount = 0;
      const totalItems = 5000;
      const chunkSize = 200; // 每次处理 200 个
      
      const processChunk = () => {
        const chunkStart = performance.now();
        
        // 处理一批
        for (let i = 0; i < chunkSize && processedCount < totalItems; i++, processedCount++) {
          newItems.push({
            id: processedCount,
            value: Math.random()
          });
        }
        
        const chunkEnd = performance.now();
        const chunkTime = chunkEnd - chunkStart;
        
        setLogs(prev => [
          ...prev,
          `🔄 处理了 ${chunkSize} 个节点，耗时 ${chunkTime.toFixed(2)}ms（让出控制权给浏览器）`
        ]);
        
        if (processedCount < totalItems) {
          // 还有剩余，模拟 MessageChannel 调度下一帧
          setTimeout(processChunk, 0); // 模拟 macrotask
        } else {
          // 完成
          setItems(newItems);
          const endTime = performance.now();
          setLogs(prev => [
            ...prev,
            `✅ ${new Date().toLocaleTimeString()}.${Date.now() % 1000} - Fiber 更新完成`,
            `⏱️ 总耗时：${(endTime - startTime).toFixed(2)}ms（期间主线程定期让出，输入框可响应）`
          ]);
          setIsUpdating(false);
        }
      };
      
      processChunk();
    }
  };
  
  return (
    <div style={{ background: '#f8f9fa', padding: '30px', borderRadius: '12px' }}>
      {/* 控制面板 */}
      <div style={{ marginBottom: '30px' }}>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <strong style={{ fontSize: '18px' }}>选择模式：</strong>
          </div>
          <button
            onClick={() => setMode('stack')}
            disabled={isUpdating}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              background: mode === 'stack' ? '#d32f2f' : '#fff',
              color: mode === 'stack' ? '#fff' : '#333',
              border: '2px solid #d32f2f',
              borderRadius: '8px',
              cursor: isUpdating ? 'not-allowed' : 'pointer',
              fontWeight: 'bold'
            }}
          >
            Stack Reconciler (React 15)
          </button>
          <button
            onClick={() => setMode('fiber')}
            disabled={isUpdating}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              background: mode === 'fiber' ? '#4caf50' : '#fff',
              color: mode === 'fiber' ? '#fff' : '#333',
              border: '2px solid #4caf50',
              borderRadius: '8px',
              cursor: isUpdating ? 'not-allowed' : 'pointer',
              fontWeight: 'bold'
            }}
          >
            Fiber Reconciler (React 16+)
          </button>
        </div>
        
        <button
          onClick={handleUpdate}
          disabled={isUpdating}
          style={{
            padding: '15px 40px',
            fontSize: '18px',
            background: isUpdating ? '#ccc' : '#1a73e8',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: isUpdating ? 'not-allowed' : 'pointer',
            fontWeight: 'bold'
          }}
        >
          {isUpdating ? '更新中...' : '🚀 模拟 5000 个组件更新'}
        </button>
      </div>
      
      {/* 状态监控 */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr 1fr', 
        gap: '20px', 
        marginBottom: '30px' 
      }}>
        <div style={{ 
          background: '#fff', 
          padding: '20px', 
          borderRadius: '8px',
          border: '2px solid #e0e0e0'
        }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>当前 FPS</div>
          <div style={{ 
            fontSize: '32px', 
            fontWeight: 'bold',
            color: fps >= 55 ? '#4caf50' : fps >= 30 ? '#ff9800' : '#d32f2f'
          }}>
            {fps}
          </div>
        </div>
        
        <div style={{ 
          background: '#fff', 
          padding: '20px', 
          borderRadius: '8px',
          border: '2px solid #e0e0e0'
        }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>已渲染节点</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1a73e8' }}>
            {items.length}
          </div>
        </div>
        
        <div style={{ 
          background: '#fff', 
          padding: '20px', 
          borderRadius: '8px',
          border: '2px solid #e0e0e0'
        }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>当前模式</div>
          <div style={{ 
            fontSize: '18px', 
            fontWeight: 'bold',
            color: mode === 'stack' ? '#d32f2f' : '#4caf50'
          }}>
            {mode === 'stack' ? 'Stack (阻塞)' : 'Fiber (可中断)'}
          </div>
        </div>
      </div>
      
      {/* 交互测试 */}
      <div style={{ 
        background: '#fff', 
        padding: '20px', 
        borderRadius: '8px',
        border: '2px solid #e0e0e0',
        marginBottom: '30px'
      }}>
        <div style={{ fontSize: '16px', marginBottom: '10px', fontWeight: 'bold' }}>
          ⌨️ 交互测试（在更新期间尝试输入）：
        </div>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="在更新期间尝试输入，体验差异..."
          style={{
            width: '100%',
            padding: '12px',
            fontSize: '16px',
            border: '2px solid #e0e0e0',
            borderRadius: '8px'
          }}
        />
        <div style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>
          {mode === 'stack' 
            ? '⚠️ Stack 模式：更新期间输入会卡顿（主线程被占用）' 
            : '✅ Fiber 模式：更新期间仍可流畅输入（时间切片让出控制权）'}
        </div>
      </div>
      
      {/* 日志输出 */}
      <div style={{ 
        background: '#1e1e1e', 
        color: '#d4d4d4',
        padding: '20px', 
        borderRadius: '8px',
        fontSize: '14px',
        fontFamily: 'monospace',
        maxHeight: '300px',
        overflow: 'auto'
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '10px', color: '#4fc3f7' }}>
          📋 执行日志：
        </div>
        {logs.length === 0 ? (
          <div style={{ color: '#888' }}>点击"模拟更新"按钮开始...</div>
        ) : (
          logs.map((log, index) => (
            <div key={index} style={{ marginBottom: '5px', lineHeight: '1.6' }}>
              {log}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default WhyFiberIntroduced;
