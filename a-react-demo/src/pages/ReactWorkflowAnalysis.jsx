import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';

/**
 * React 工作流程的完整阶段分析
 * 
 * 核心阶段：
 * 1. Schedule 阶段：调度更新
 * 2. Render 阶段：协调（Reconciliation）
 * 3. Commit 阶段：提交更新到 DOM
 */

let renderPhaseLog = [];
let commitPhaseLog = [];

function ChildComponent({ count }) {
  console.log('🟢 2. Child render - count:', count);
  renderPhaseLog.push(`Child render (count: ${count})`);
  
  useLayoutEffect(() => {
    console.log('🔵 5. Child useLayoutEffect (commit - layout 阶段)');
    commitPhaseLog.push('Child useLayoutEffect');
  }, [count]);
  
  useEffect(() => {
    console.log('🟡 7. Child useEffect (commit - passive 阶段，异步)');
    commitPhaseLog.push('Child useEffect');
  }, [count]);
  
  return (
    <div style={{ padding: '10px', background: '#e3f2fd', margin: '5px 0' }}>
      子组件 - Count: {count}
    </div>
  );
}

function ParentComponent() {
  const [count, setCount] = useState(0);
  const [, forceUpdate] = useState({});
  
  console.log('🟢 1. Parent render - count:', count);
  renderPhaseLog.push(`Parent render (count: ${count})`);
  
  useLayoutEffect(() => {
    console.log('🔵 6. Parent useLayoutEffect (commit - layout 阶段)');
    commitPhaseLog.push('Parent useLayoutEffect');
  }, [count]);
  
  useEffect(() => {
    console.log('🟡 8. Parent useEffect (commit - passive 阶段，异步)');
    commitPhaseLog.push('Parent useEffect');
  }, [count]);
  
  const handleUpdate = () => {
    console.log('\n📢 === 用户点击按钮，触发更新 ===');
    console.log('0. 开始调度更新 (Schedule 阶段)');
    
    renderPhaseLog = [];
    commitPhaseLog = [];
    
    // 触发更新
    setCount(count + 1);
    
    console.log('⚠️ 注意：这里 count 还是旧值:', count);
    console.log('因为 setState 是异步的，render 阶段还没开始\n');
  };
  
  return (
    <div style={{ padding: '20px', background: '#fff3e0' }}>
      <h3>React 工作流程演示</h3>
      <p style={{ fontSize: '20px' }}>Count: {count}</p>
      
      <button onClick={handleUpdate} style={{ padding: '10px 20px', fontSize: '16px' }}>
        触发更新（查看控制台）
      </button>
      
      <ChildComponent count={count} />
    </div>
  );
}

export default function ReactWorkflowAnalysis() {
  const [showDemo, setShowDemo] = useState(true);
  
  return (
    <div style={{ padding: '20px' }}>
      <h1>从源码分析 React 的工作流程</h1>
      <p style={{ color: '#666' }}>打开控制台查看详细的执行顺序</p>
      
      <button 
        onClick={() => {
          setShowDemo(!showDemo);
          renderPhaseLog = [];
          commitPhaseLog = [];
        }}
        style={{ marginBottom: '20px', padding: '10px 20px' }}
      >
        {showDemo ? '卸载组件' : '挂载组件'}
      </button>
      
      {showDemo && <ParentComponent />}
      
      <hr style={{ margin: '30px 0' }} />
      
      <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px' }}>
        <h2>📚 React 工作流程详解</h2>
        
        <div style={{ marginBottom: '20px' }}>
          <h3>🎯 完整的工作流程（5 个阶段）</h3>
          <pre style={{ background: '#fff', padding: '15px', overflow: 'auto', borderRadius: '5px' }}>
{`┌─────────────────────────────────────────────────┐
│  阶段 0：触发更新 (Trigger)                      │
│  - 用户交互（onClick、onChange等）               │
│  - setState / useState                          │
│  - forceUpdate                                  │
│  - ReactDOM.render                              │
└─────────────────────────────────────────────────┘
          ↓
┌─────────────────────────────────────────────────┐
│  阶段 1：调度更新 (Schedule)                     │
│  - scheduleUpdateOnFiber                        │
│  - ensureRootIsScheduled                        │
│  - 根据优先级决定同步还是异步                     │
└─────────────────────────────────────────────────┘
          ↓
┌─────────────────────────────────────────────────┐
│  阶段 2：Render 阶段 (可中断)                    │
│  - renderRootSync / renderRootConcurrent        │
│  - workLoopSync / workLoopConcurrent            │
│  - performUnitOfWork                            │
│    ├── beginWork (递)                           │
│    └── completeWork (归)                        │
│  - 构建 Fiber 树，标记副作用                     │
│  - 可中断、可复用、可优先级调度                   │
└─────────────────────────────────────────────────┘
          ↓
┌─────────────────────────────────────────────────┐
│  阶段 3：Commit 阶段 (不可中断，同步)             │
│  - commitRootImpl                               │
│                                                 │
│  子阶段 1: Before Mutation (读取 DOM 快照)       │
│    - commitBeforeMutationEffects                │
│    - getSnapshotBeforeUpdate                    │
│                                                 │
│  子阶段 2: Mutation (修改 DOM)                   │
│    - commitMutationEffects                      │
│    - DOM 插入、更新、删除                        │
│    - ref 解绑                                   │
│    - useLayoutEffect destroy                    │
│                                                 │
│  子阶段 3: Layout (同步，DOM 更新后)             │
│    - commitLayoutEffects                        │
│    - componentDidMount/Update                   │
│    - useLayoutEffect create                     │
│    - ref 赋值                                   │
└─────────────────────────────────────────────────┘
          ↓
┌─────────────────────────────────────────────────┐
│  阶段 4：Passive Effects (异步，浏览器绘制后)    │
│  - flushPassiveEffects                          │
│  - useEffect destroy                            │
│  - useEffect create                             │
└─────────────────────────────────────────────────┘`}
          </pre>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h3>1️⃣ Render 阶段详解（协调 Reconciliation）</h3>
          <pre style={{ background: '#fff', padding: '15px', overflow: 'auto', borderRadius: '5px' }}>
{`// ReactFiberWorkLoop.old.js

// 同步渲染
function renderRootSync(root, lanes) {
  executionContext |= RenderContext;  // 标记进入 Render 阶段
  
  prepareFreshStack(root, lanes);     // 准备工作栈
  
  workLoopSync();                     // 开始工作循环
  
  executionContext = prevExecutionContext;
}

// 工作循环
function workLoopSync() {
  while (workInProgress !== null) {
    performUnitOfWork(workInProgress);  // 处理每个 Fiber 节点
  }
}

// 处理单个工作单元
function performUnitOfWork(unitOfWork) {
  const current = unitOfWork.alternate;
  
  // 🔑 关键 1：beginWork (递阶段)
  let next = beginWork(current, unitOfWork, renderLanes);
  
  if (next === null) {
    // 🔑 关键 2：completeWork (归阶段)
    completeUnitOfWork(unitOfWork);
  } else {
    workInProgress = next;  // 继续处理子节点
  }
}

// beginWork - 向下遍历
function beginWork(current, workInProgress, renderLanes) {
  // 根据 Fiber 类型进行不同处理
  switch (workInProgress.tag) {
    case FunctionComponent:
      // 调用函数组件，执行 Hooks
      return updateFunctionComponent(current, workInProgress, ...);
    case ClassComponent:
      // 调用类组件的 render 方法
      return updateClassComponent(current, workInProgress, ...);
    case HostComponent:
      // 处理原生 DOM 元素
      return updateHostComponent(current, workInProgress, ...);
    // ... 其他类型
  }
}

// completeWork - 向上回溯
function completeWork(current, workInProgress, renderLanes) {
  switch (workInProgress.tag) {
    case HostComponent:
      // 创建或更新 DOM 节点
      // 收集副作用（插入、更新、删除）
      bubbleProperties(workInProgress);  // 冒泡属性
      return null;
    // ... 其他类型
  }
}

// 🎯 Render 阶段的特点：
// 1. 可中断：Concurrent Mode 下可以暂停、恢复
// 2. 纯计算：不操作 DOM，只构建 Fiber 树
// 3. 双缓存：current 树和 workInProgress 树
// 4. 标记副作用：flags 标记需要在 Commit 阶段执行的操作`}
          </pre>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h3>2️⃣ Commit 阶段详解（提交）</h3>
          <pre style={{ background: '#fff', padding: '15px', overflow: 'auto', borderRadius: '5px' }}>
{`// ReactFiberWorkLoop.old.js - commitRootImpl

function commitRootImpl(root, recoverableErrors, transitions, renderPriorityLevel) {
  // 准备工作
  flushPassiveEffects();  // 先处理之前的 passive effects
  
  executionContext |= CommitContext;  // 标记进入 Commit 阶段
  
  const finishedWork = root.finishedWork;
  
  // ==================== 子阶段 1: Before Mutation ====================
  // 读取 DOM 变更前的状态
  commitBeforeMutationEffects(root, finishedWork);
  // - 调用 getSnapshotBeforeUpdate
  // - 调度 useEffect（注册到调度器，不立即执行）
  
  // ==================== 子阶段 2: Mutation ====================
  // 修改 DOM
  commitMutationEffects(root, finishedWork, lanes);
  // - 插入、更新、删除 DOM 节点
  // - 执行 useLayoutEffect 的 destroy
  // - ref 解绑
  
  // 🔑 关键：切换 current 树
  root.current = finishedWork;
  // 此时 DOM 已经更新，但浏览器还没绘制
  
  // ==================== 子阶段 3: Layout ====================
  // DOM 更新后，浏览器绘制前（同步执行）
  commitLayoutEffects(finishedWork, root, lanes);
  // - 执行 componentDidMount / componentDidUpdate
  // - 执行 useLayoutEffect 的 create
  // - ref 赋值
  // - 更新 DOM 后立即读取布局信息
  
  // 告诉浏览器可以绘制了
  requestPaint();
  
  executionContext = prevExecutionContext;
  
  // ==================== 子阶段 4: Passive (异步) ====================
  // 调度 passive effects（useEffect）
  if (rootDoesHavePassiveEffects) {
    scheduleCallback(NormalSchedulerPriority, () => {
      flushPassiveEffects();
      // - 执行 useEffect 的 destroy
      // - 执行 useEffect 的 create
      return null;
    });
  }
}

// 🎯 Commit 阶段的特点：
// 1. 不可中断：必须一次性完成
// 2. 同步执行：before mutation、mutation、layout 都是同步的
// 3. 操作 DOM：真正的 DOM 更新发生在这里
// 4. 执行副作用：生命周期、Hooks 的副作用在这里执行`}
          </pre>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h3>3️⃣ Fiber 树的遍历顺序</h3>
          <pre style={{ background: '#fff', padding: '15px', overflow: 'auto', borderRadius: '5px' }}>
{`Fiber 树结构：
         App
        /   \\
    Parent  Sibling
      |
    Child

遍历顺序（深度优先）：

beginWork 阶段（递）：
1. beginWork(App)
2. beginWork(Parent)
3. beginWork(Child)
   ↓ Child 无子节点，进入 completeWork

completeWork 阶段（归）：
4. completeWork(Child)    ← 从最深的子节点开始
5. completeWork(Parent)   ← 处理完子节点后处理父节点
6. beginWork(Sibling)     ← 回到兄弟节点
7. completeWork(Sibling)
8. completeWork(App)      ← 最后完成根节点

关键特点：
- 先递后归
- 子节点完成后才完成父节点
- 兄弟节点按顺序处理`}
          </pre>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h3>4️⃣ 双缓存机制（Double Buffering）</h3>
          <pre style={{ background: '#fff', padding: '15px', overflow: 'auto', borderRadius: '5px' }}>
{`React 维护两棵 Fiber 树：

1. current 树：
   - 当前屏幕上显示的内容
   - root.current 指向

2. workInProgress 树：
   - 正在内存中构建的新树
   - Render 阶段在这棵树上工作

工作流程：
┌────────────────────────────────────────┐
│  Render 阶段                            │
│  - 基于 current 树创建 workInProgress  │
│  - 在 workInProgress 树上进行 Diff     │
│  - 标记需要更新的节点                   │
└────────────────────────────────────────┘
          ↓
┌────────────────────────────────────────┐
│  Commit 阶段                            │
│  - 根据 workInProgress 的标记更新 DOM  │
│  - root.current = workInProgress       │
│  - 交换两棵树                          │
└────────────────────────────────────────┘

优点：
- 在内存中构建完整的新树，避免不完整的 UI
- 可以中断 Render，因为不影响屏幕显示
- Commit 时原子性地切换，用户看到的是完整的更新`}
          </pre>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h3>5️⃣ 优先级调度（Lane 模型）</h3>
          <pre style={{ background: '#fff', padding: '15px', overflow: 'auto', borderRadius: '5px' }}>
{`React 18 使用 Lane 模型进行优先级调度：

// ReactFiberLane.js
export const NoLanes = 0;
export const NoLane = 0;

export const SyncLane = 1;                    // 同步优先级（最高）
export const InputContinuousLane = 4;        // 连续输入（如拖拽）
export const DefaultLane = 16;               // 默认优先级
export const TransitionLanes = 128;          // Transition 优先级
export const RetryLanes = 8388608;           // 重试优先级
export const IdleLane = 536870912;           // 空闲优先级（最低）

优先级调度过程：
1. 用户触发更新 → 计算 Lane
2. 根据 Lane 决定同步/异步渲染
3. 高优先级任务可以打断低优先级任务
4. 低优先级任务会被跳过，等待后续处理

示例：
- 用户输入：SyncLane（立即更新）
- startTransition：TransitionLanes（可延迟）
- useEffect：异步调度（NormalPriority）`}
          </pre>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h3>6️⃣ 实际执行顺序示例</h3>
          <pre style={{ background: '#fff', padding: '15px', overflow: 'auto', borderRadius: '5px' }}>
{`点击按钮触发更新后的完整流程：

0. 用户点击按钮
   ↓
1. setState 调用
   ↓
2. 调度更新 (Schedule)
   - scheduleUpdateOnFiber
   - 计算优先级
   ↓
3. Render 阶段开始 (可中断)
   - 🟢 Parent render    (beginWork)
   - 🟢 Child render     (beginWork)
   - completeWork(Child) (归阶段)
   - completeWork(Parent)
   ↓
4. Commit 阶段开始 (不可中断)
   
   Before Mutation:
   - 读取 DOM 快照
   
   Mutation:
   - 更新 DOM
   - useLayoutEffect destroy (如果有)
   
   切换 current 树
   
   Layout (同步):
   - 🔵 Child useLayoutEffect
   - 🔵 Parent useLayoutEffect
   ↓
5. 浏览器绘制
   ↓
6. Passive Effects (异步)
   - 🟡 Child useEffect
   - 🟡 Parent useEffect

总结：
- Render: 父 → 子 (beginWork)
- Complete: 子 → 父 (completeWork)
- Layout Effect: 子 → 父
- Effect: 子 → 父`}
          </pre>
        </div>

        <div>
          <h3>7️⃣ 关键源码位置</h3>
          <div style={{ background: '#fff', padding: '15px', borderRadius: '5px' }}>
            <ul>
              <li><strong>调度入口：</strong><code>ReactFiberWorkLoop.old.js</code>
                <ul>
                  <li><code>scheduleUpdateOnFiber</code> - 调度更新</li>
                  <li><code>ensureRootIsScheduled</code> - 确保根节点被调度</li>
                </ul>
              </li>
              <li><strong>Render 阶段：</strong>
                <ul>
                  <li><code>renderRootSync</code> - 同步渲染</li>
                  <li><code>renderRootConcurrent</code> - 并发渲染</li>
                  <li><code>workLoopSync / workLoopConcurrent</code> - 工作循环</li>
                  <li><code>performUnitOfWork</code> - 处理工作单元</li>
                  <li><code>beginWork</code> - 递阶段 (<code>ReactFiberBeginWork.old.js</code>)</li>
                  <li><code>completeWork</code> - 归阶段 (<code>ReactFiberCompleteWork.old.js</code>)</li>
                </ul>
              </li>
              <li><strong>Commit 阶段：</strong><code>ReactFiberWorkLoop.old.js / ReactFiberCommitWork.old.js</code>
                <ul>
                  <li><code>commitRoot / commitRootImpl</code> - Commit 入口</li>
                  <li><code>commitBeforeMutationEffects</code> - Before Mutation</li>
                  <li><code>commitMutationEffects</code> - Mutation</li>
                  <li><code>commitLayoutEffects</code> - Layout</li>
                  <li><code>flushPassiveEffects</code> - Passive Effects</li>
                </ul>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
