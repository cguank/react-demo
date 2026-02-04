import React, { useState, useEffect, useRef } from 'react';

/**
 * React Render 阶段和 Commit 阶段详解
 * 
 * 核心问题：
 * 1. Render 阶段包括了 beginWork 到 completeWork 流程吗？
 * 2. Commit 阶段是什么时候执行的？
 */

export default function RenderCommitPhaseAnalysis() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>⚛️ React Render 阶段和 Commit 阶段详解</h1>
      
      {/* 核心答案 */}
      <div style={{ background: '#fff3e0', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>✅ 核心答案</h2>
        <CoreAnswer />
      </div>

      {/* Render 阶段详解 */}
      <div style={{ background: '#e3f2fd', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>🔄 Render 阶段详解</h2>
        <RenderPhaseDetail />
      </div>

      {/* Commit 阶段详解 */}
      <div style={{ background: '#e8f5e9', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>📝 Commit 阶段详解</h2>
        <CommitPhaseDetail />
      </div>

      {/* 完整流程 */}
      <div style={{ background: '#f3e5f5', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>📋 从 setState 到屏幕显示的完整流程</h2>
        <CompleteFlow />
      </div>

      {/* 源码分析 */}
      <div style={{ background: '#fff9c4', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>🔬 源码分析</h2>
        <SourceCodeAnalysis />
      </div>

      {/* 两个阶段的区别 */}
      <div style={{ background: '#fce4ec', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>🆚 Render vs Commit 阶段的区别</h2>
        <PhaseDifferences />
      </div>

      {/* 实际演示 */}
      <div style={{ background: '#e0f2f1', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>🧪 实际演示</h2>
        <PracticalDemo />
      </div>

      {/* 总结 */}
      <div style={{ background: '#fff3e0', padding: '20px', borderRadius: '8px' }}>
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
      <h3>直接回答你的问题</h3>
      
      <div style={{ background: '#c8e6c9', padding: '15px', marginBottom: '15px', borderRadius: '5px' }}>
        <h4 style={{ marginTop: 0, color: '#2e7d32' }}>💡 问题 1：Render 阶段包括 beginWork 到 completeWork 吗？</h4>
        <pre style={{ background: '#f5f5f5', padding: '15px', fontSize: '14px', lineHeight: '1.8', margin: 0 }}>
{`✅ 是的！Render 阶段确实包括了从 beginWork 到 completeWork 的完整流程。

Render 阶段的完整流程：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

renderRootSync / renderRootConcurrent（入口）
  ↓
workLoopSync / workLoopConcurrent（工作循环）
  ↓
performUnitOfWork（处理单个 Fiber 节点）
  ↓
┌─────────────────────────────────────────┐
│ beginWork（向下遍历）                     │
│ - 执行组件函数                           │
│ - 调用 Hooks                            │
│ - Diff 算法                             │
│ - 创建/复用子 Fiber                      │
└─────────────────────────────────────────┘
  ↓
如果有子节点，继续向下
  ↓
如果没有子节点，开始向上
  ↓
┌─────────────────────────────────────────┐
│ completeUnitOfWork（向上遍历）            │
│   ↓                                      │
│ completeWork（完成当前节点）              │
│ - 创建/更新 DOM 节点（在内存中）          │
│ - 收集副作用                             │
│ - 冒泡 flags                            │
└─────────────────────────────────────────┘
  ↓
返回兄弟节点或父节点，继续循环
  ↓
直到整棵树遍历完成

所以：beginWork 和 completeWork 都是 Render 阶段的核心部分！`}
        </pre>
      </div>
      
      <div style={{ background: '#bbdefb', padding: '15px', borderRadius: '5px' }}>
        <h4 style={{ marginTop: 0, color: '#1565c0' }}>💡 问题 2：Commit 阶段什么时候执行？</h4>
        <pre style={{ background: '#f5f5f5', padding: '15px', fontSize: '14px', lineHeight: '1.8', margin: 0 }}>
{`✅ Commit 阶段在 Render 阶段完成之后立即执行（同步）

完整时间线：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. 触发更新
   setState() / dispatch()

2. Schedule 阶段
   ensureRootIsScheduled()
   scheduleCallback()

3. 🔥 Render 阶段（可中断）
   renderRootSync / renderRootConcurrent
     ├─ workLoop
     ├─ performUnitOfWork
     ├─ beginWork（向下）
     └─ completeWork（向上）
   
   输出：新的 Fiber 树（在内存中）

4. 🔥🔥 Commit 阶段（不可中断，立即执行）
   commitRoot
     ↓
   commitRootImpl
     ├─ Before Mutation（DOM 变更前）
     ├─ Mutation（DOM 变更）
     └─ Layout（DOM 变更后）
   
   输出：真实 DOM 更新

5. 浏览器渲染
   Recalculate Style → Layout → Paint

6. useEffect 执行（异步）
   flushPassiveEffects()

关键理解：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Render 阶段完成后，会立即（同步）进入 Commit 阶段
没有任何延迟或异步操作
整个过程是：Render → Commit（同步连续执行）`}
        </pre>
      </div>
    </div>
  );
}

// Render 阶段详解
function RenderPhaseDetail() {
  return (
    <div style={{ background: '#fff', padding: '15px', borderRadius: '5px' }}>
      <h3>Render 阶段的详细流程</h3>
      
      <pre style={{ background: '#f5f5f5', padding: '15px', overflow: 'auto', fontSize: '13px', lineHeight: '1.8' }}>
{`Render 阶段的目的：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

构建新的 Fiber 树（workInProgress 树）
标记哪些节点需要更新、删除、新增
但不修改真实 DOM！

Render 阶段的特点：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ 可中断（Concurrent 模式）
✅ 纯计算，不产生副作用
✅ 可以多次执行（如果被中断）
✅ 在内存中操作 Fiber 树
❌ 不会修改 DOM
❌ 不会执行副作用（useEffect、useLayoutEffect）

Render 阶段的完整流程：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

入口函数：renderRootSync（同步）/ renderRootConcurrent（并发）

function renderRootSync(root: FiberRoot, lanes: Lanes) {
  executionContext |= RenderContext;  // 标记进入 Render 阶段
  
  prepareFreshStack(root, lanes);  // 准备工作栈
  
  do {
    try {
      workLoopSync();  // 🔥 核心工作循环
      break;
    } catch (thrownValue) {
      handleError(root, thrownValue);
    }
  } while (true);
  
  // 返回退出状态
  return workInProgressRootExitStatus;
}


工作循环：workLoopSync / workLoopConcurrent

function workLoopSync() {
  // 同步模式：不检查是否需要让出
  while (workInProgress !== null) {
    performUnitOfWork(workInProgress);  // 处理每个 Fiber 节点
  }
}

function workLoopConcurrent() {
  // 并发模式：检查是否需要让出
  while (workInProgress !== null && !shouldYield()) {
    performUnitOfWork(workInProgress);
  }
}


核心函数：performUnitOfWork

function performUnitOfWork(unitOfWork: Fiber): void {
  const current = unitOfWork.alternate;  // 当前树的对应节点
  
  // 🔥 步骤 1：beginWork（向下遍历）
  let next = beginWork(current, unitOfWork, subtreeRenderLanes);
  
  unitOfWork.memoizedProps = unitOfWork.pendingProps;
  
  if (next === null) {
    // 🔥 步骤 2：没有子节点，开始 completeWork（向上遍历）
    completeUnitOfWork(unitOfWork);
  } else {
    // 🔥 有子节点，继续向下
    workInProgress = next;
  }
}


beginWork（向下遍历阶段）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

功能：处理当前 Fiber 节点，创建子 Fiber

function beginWork(
  current: Fiber | null,
  workInProgress: Fiber,
  renderLanes: Lanes,
): Fiber | null {
  // 根据 Fiber 的类型进行不同处理
  switch (workInProgress.tag) {
    case FunctionComponent: {
      // 🔥 执行函数组件
      return updateFunctionComponent(
        current,
        workInProgress,
        Component,
        resolvedProps,
        renderLanes,
      );
    }
    case ClassComponent: {
      // 执行类组件
      return updateClassComponent(...);
    }
    case HostComponent: {
      // 处理原生 DOM 元素
      return updateHostComponent(...);
    }
    // ... 其他类型
  }
}

updateFunctionComponent 做了什么？
  1. 执行函数组件：const children = Component(props)
  2. 执行 Hooks：useState、useEffect 等
  3. 获取返回的 JSX（ReactElement）
  4. 🔥 调用 reconcileChildren 进行 Diff
  5. 创建或复用子 Fiber 节点
  6. 返回第一个子 Fiber（继续向下遍历）

reconcileChildren（Diff 算法）：
  - 比较新旧子节点
  - 决定复用、更新、删除、新增
  - 标记 flags（Placement、Update、Deletion 等）
  - 创建新的子 Fiber 或复用旧的 Fiber


示例：组件树的 beginWork 遍历顺序

      App
     /   \\
  Header  Content
   /        \\
 Logo      List
           /  \\
        Item1  Item2

beginWork 遍历顺序（深度优先）：
  App → Header → Logo → Content → List → Item1 → Item2


completeUnitOfWork & completeWork（向上遍历阶段）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

功能：完成当前节点，收集副作用，返回兄弟节点或父节点

function completeUnitOfWork(unitOfWork: Fiber): void {
  let completedWork = unitOfWork;
  
  do {
    const current = completedWork.alternate;
    const returnFiber = completedWork.return;
    
    // 🔥 调用 completeWork
    let next = completeWork(current, completedWork, subtreeRenderLanes);
    
    if (next !== null) {
      // 如果产生了新的工作，返回继续处理
      workInProgress = next;
      return;
    }
    
    // 🔥 收集子节点的 flags（冒泡）
    const siblingFiber = completedWork.sibling;
    if (siblingFiber !== null) {
      // 🔥 有兄弟节点，继续处理兄弟节点
      workInProgress = siblingFiber;
      return;
    }
    
    // 🔥 没有兄弟节点，回到父节点
    completedWork = returnFiber;
    workInProgress = completedWork;
  } while (completedWork !== null);
  
  // 整棵树遍历完成
  if (workInProgressRootExitStatus === RootInProgress) {
    workInProgressRootExitStatus = RootCompleted;
  }
}

completeWork 做了什么？
  1. 对于 HostComponent（原生 DOM 元素）：
     - 创建 DOM 节点（document.createElement）
     - 或复用已有的 DOM 节点
     - 设置属性（className、style 等）
     - 但不插入到 DOM 树！只是在内存中
  
  2. 收集子节点的副作用标记
     - 将子节点的 flags 冒泡到父节点
     - subtreeFlags |= child.flags | child.subtreeFlags
  
  3. 返回 null（表示当前节点完成）


示例：completeWork 遍历顺序（继续上面的例子）

      App
     /   \\
  Header  Content
   /        \\
 Logo      List
           /  \\
        Item1  Item2

completeWork 遍历顺序（从最深的叶子节点开始）：
  Logo → Header → Item1 → Item2 → List → Content → App

注意：
  - Logo 完成后，返回 Header
  - Header 完成后，返回 App
  - App 发现还有 Content 子节点，继续 beginWork(Content)
  - Content → List → Item1（beginWork）
  - Item1 → Item2 → List → Content（completeWork）
  - 最后回到 App

完整遍历顺序（beginWork + completeWork）：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

App (beginWork)
  ↓
Header (beginWork)
  ↓
Logo (beginWork)
  ↓
Logo (completeWork) ← 叶子节点，没有子节点，开始向上
  ↓
Header (completeWork)
  ↓
Content (beginWork) ← Header 的兄弟节点
  ↓
List (beginWork)
  ↓
Item1 (beginWork)
  ↓
Item1 (completeWork)
  ↓
Item2 (beginWork) ← Item1 的兄弟节点
  ↓
Item2 (completeWork)
  ↓
List (completeWork)
  ↓
Content (completeWork)
  ↓
App (completeWork) ← 根节点完成

Render 阶段结束！

Render 阶段的输出：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. 新的 Fiber 树（workInProgress 树）
   - 每个 Fiber 节点都已处理
   - 标记了需要的操作（flags）
   
2. 副作用标记（flags）
   - Placement：需要插入
   - Update：需要更新
   - Deletion：需要删除
   - Passive：有 useEffect
   - Layout：有 useLayoutEffect
   
3. DOM 节点（在内存中）
   - 通过 completeWork 创建
   - 存储在 Fiber.stateNode
   - 但还未插入真实 DOM 树

4. Effect 链表
   - 所有需要执行副作用的 Fiber 节点
   - 用于 Commit 阶段快速遍历

现在可以进入 Commit 阶段了！`}
      </pre>
    </div>
  );
}

// Commit 阶段详解
function CommitPhaseDetail() {
  return (
    <div style={{ background: '#fff', padding: '15px', borderRadius: '5px' }}>
      <h3>Commit 阶段的详细流程</h3>
      
      <pre style={{ background: '#f5f5f5', padding: '15px', overflow: 'auto', fontSize: '13px', lineHeight: '1.8' }}>
{`Commit 阶段的目的：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

将 Render 阶段的计算结果应用到真实 DOM
执行副作用（生命周期、Hooks、ref 等）

Commit 阶段的特点：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

❌ 不可中断（同步执行）
✅ 会修改真实 DOM
✅ 会执行副作用
✅ 用户可见的变化都在这里发生
⚠️ 必须快速完成（否则卡顿）

Commit 阶段什么时候执行？
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

在 Render 阶段完成后立即（同步）执行！

// ReactFiberWorkLoop.old.js

performSyncWorkOnRoot / performConcurrentWorkOnRoot {
  // 1. Render 阶段
  let exitStatus = renderRootSync(root, lanes);
  
  // 2. 检查退出状态
  if (exitStatus === RootCompleted) {
    // 3. 🔥 立即进入 Commit 阶段（同步）
    commitRoot(root, recoverableErrors, transitions);
  }
}

关键：没有任何异步或延迟，Render → Commit 是连续的！


Commit 阶段的入口：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function commitRoot(
  root: FiberRoot,
  recoverableErrors: null | Array<CapturedValue<mixed>>,
  transitions: Array<Transition> | null,
) {
  const previousUpdateLanePriority = getCurrentUpdatePriority();
  const prevTransition = ReactCurrentBatchConfig.transition;
  
  try {
    ReactCurrentBatchConfig.transition = null;
    setCurrentUpdatePriority(DiscreteEventPriority);
    
    // 🔥🔥 真正的 Commit 实现
    commitRootImpl(
      root,
      recoverableErrors,
      transitions,
      previousUpdateLanePriority,
    );
  } finally {
    ReactCurrentBatchConfig.transition = prevTransition;
    setCurrentUpdatePriority(previousUpdateLanePriority);
  }
  
  return null;
}


Commit 阶段的三个子阶段：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function commitRootImpl(root, recoverableErrors, transitions, renderPriorityLevel) {
  // 标记进入 Commit 阶段
  executionContext |= CommitContext;
  
  const finishedWork = root.finishedWork;  // Render 阶段的输出
  const lanes = root.finishedLanes;
  
  // ... 准备工作
  
  // 🔥 子阶段 1：Before Mutation（DOM 变更前）
  commitBeforeMutationEffects(root, finishedWork);
  
  // 🔥 子阶段 2：Mutation（DOM 变更）
  commitMutationEffects(root, finishedWork, lanes);
  
  // 切换 current 树
  root.current = finishedWork;
  
  // 🔥 子阶段 3：Layout（DOM 变更后）
  commitLayoutEffects(finishedWork, root, lanes);
  
  // 通知浏览器可以渲染
  requestPaint();
  
  // 调度 Passive Effects（useEffect）
  if (rootDoesHavePassiveEffects) {
    scheduleCallback(NormalSchedulerPriority, () => {
      flushPassiveEffects();
      return null;
    });
  }
  
  // ... 清理工作
}


子阶段 1：Before Mutation（DOM 变更前）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

功能：在 DOM 变更前执行一些操作

主要工作：
  1. 执行 getSnapshotBeforeUpdate（类组件）
     - 可以获取 DOM 变更前的快照
     - 例如：保存滚动位置
  
  2. 调度 useEffect
     - 标记需要执行 useEffect
     - 但不立即执行（异步）
  
  3. 清理 ref（如果需要）

示例：
  class MyComponent extends React.Component {
    getSnapshotBeforeUpdate(prevProps, prevState) {
      // 在 DOM 更新前保存滚动位置
      return this.listRef.scrollHeight;
    }
    
    componentDidUpdate(prevProps, prevState, snapshot) {
      // 在 DOM 更新后使用快照
      if (snapshot !== null) {
        // ...
      }
    }
  }


子阶段 2：Mutation（DOM 变更）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

功能：🔥 真正的 DOM 操作！

主要工作：
  1. 根据 flags 执行 DOM 操作
     - Placement：插入节点（insertBefore、appendChild）
     - Update：更新属性（className、style 等）
     - Deletion：删除节点（removeChild）
  
  2. 执行 useLayoutEffect 的 cleanup
     - 清理上一次的副作用
  
  3. 重置 ref（如果需要）

详细过程：

function commitMutationEffects(root, finishedWork, committedLanes) {
  // 递归遍历 Fiber 树
  recursivelyTraverseMutationEffects(root, finishedWork, committedLanes);
  
  // 处理当前节点
  commitReconciliationEffects(finishedWork);
}

function commitReconciliationEffects(finishedWork) {
  const flags = finishedWork.flags;
  
  if (flags & Placement) {
    // 🔥 插入 DOM 节点
    commitPlacement(finishedWork);
    finishedWork.flags &= ~Placement;
  }
  
  if (flags & Update) {
    // 🔥 更新 DOM 属性
    const current = finishedWork.alternate;
    commitWork(current, finishedWork);
  }
  
  if (flags & Deletion) {
    // 🔥 删除 DOM 节点（在递归中处理）
  }
}

commitPlacement 做了什么？
  1. 找到父 DOM 节点
  2. 找到插入位置（兄弟节点）
  3. 调用 parent.insertBefore(child, before)
     或 parent.appendChild(child)

commitWork 做了什么？
  1. 对于 HostComponent（原生 DOM）：
     - 更新属性（updateProperties）
     - 例如：className、style、事件等
  
  2. 对于 HostText（文本节点）：
     - 更新文本内容（node.nodeValue = text）

此时，DOM 已经变化了！
但浏览器还未渲染到屏幕。


子阶段 3：Layout（DOM 变更后）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

功能：执行 DOM 变更后的副作用

主要工作：
  1. 🔥 执行 useLayoutEffect 回调
     - 同步执行
     - 可以读取最新的 DOM
     - 会阻塞浏览器绘制
  
  2. 执行类组件生命周期
     - componentDidMount（首次挂载）
     - componentDidUpdate（更新）
  
  3. 更新 ref
     - ref.current = domNode

详细过程：

function commitLayoutEffects(finishedWork, root, committedLanes) {
  // 递归遍历 Fiber 树
  while (nextEffect !== null) {
    const fiber = nextEffect;
    
    if (fiber.flags & LayoutMask) {
      // 🔥 执行 Layout 副作用
      commitLayoutEffectOnFiber(root, current, fiber, committedLanes);
    }
    
    nextEffect = nextEffect.nextEffect;
  }
}

对于函数组件：
  function commitLayoutEffectOnFiber(root, current, finishedWork) {
    if (finishedWork.tag === FunctionComponent) {
      // 🔥 执行 useLayoutEffect
      commitHookEffectListMount(HookLayout, finishedWork);
    }
  }

useLayoutEffect 执行：
  function commitHookEffectListMount(tag, finishedWork) {
    const updateQueue = finishedWork.updateQueue;
    const lastEffect = updateQueue !== null ? updateQueue.lastEffect : null;
    
    if (lastEffect !== null) {
      const firstEffect = lastEffect.next;
      let effect = firstEffect;
      
      do {
        if ((effect.tag & tag) === tag) {
          // 🔥🔥 同步执行 useLayoutEffect 回调
          const create = effect.create;
          effect.destroy = create();  // 保存 cleanup 函数
        }
        effect = effect.next;
      } while (effect !== firstEffect);
    }
  }

此时：
  - DOM 已更新
  - useLayoutEffect 已执行
  - 但浏览器还未绘制到屏幕


Commit 阶段完成后：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. 切换 current 树
   root.current = finishedWork;
   新树成为当前树

2. 调用 requestPaint()
   通知 Scheduler 可以让浏览器渲染

3. 调度 useEffect（异步）
   scheduleCallback(NormalSchedulerPriority, flushPassiveEffects);

4. 浏览器开始渲染
   Recalculate Style → Layout → Paint → Composite

5. 下一个宏任务执行 useEffect
   通过 MessageChannel 触发


Commit 阶段的三个子阶段总结：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Before Mutation：
  - getSnapshotBeforeUpdate
  - DOM 还未变化

Mutation：
  - 🔥 DOM 操作（插入、更新、删除）
  - useLayoutEffect cleanup
  - DOM 已变化

Layout：
  - 🔥 useLayoutEffect 回调
  - componentDidMount / componentDidUpdate
  - ref 更新
  - 可以读取最新 DOM

完成：
  - requestPaint()
  - 调度 useEffect（异步）
  - 浏览器渲染`}
      </pre>
    </div>
  );
}

// 完整流程
function CompleteFlow() {
  return (
    <div style={{ background: '#fff', padding: '15px', borderRadius: '5px' }}>
      <h3>从 setState 到屏幕显示的完整流程</h3>
      
      <pre style={{ background: '#f5f5f5', padding: '15px', overflow: 'auto', fontSize: '13px', lineHeight: '1.8' }}>
{`完整时间线（每个阶段何时执行）：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. 用户操作
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

onClick={() => setState(newValue)}

2. Schedule 阶段（调度）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

scheduleUpdateOnFiber(fiber, lane)
  ↓
ensureRootIsScheduled(root)
  ↓
scheduleCallback(priorityLevel, performWorkOnRoot)

3. 🔥 Render 阶段（可中断）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

performSyncWorkOnRoot / performConcurrentWorkOnRoot
  ↓
renderRootSync / renderRootConcurrent
  ↓
prepareFreshStack(root, lanes)  // 准备
  ↓
workLoopSync / workLoopConcurrent  // 工作循环
  ↓
while (workInProgress !== null) {
  performUnitOfWork(workInProgress)
    ↓
  ┌─────────────────────────────────────────┐
  │ beginWork(current, workInProgress, lanes) │
  │ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
  │ 1. 根据 tag 调用不同的 update 函数       │
  │ 2. 执行组件函数（FunctionComponent）     │
  │ 3. 调用 Hooks（useState、useEffect 等）  │
  │ 4. reconcileChildren（Diff 算法）        │
  │ 5. 创建/复用子 Fiber                     │
  │ 6. 返回子 Fiber（继续向下）              │
  └─────────────────────────────────────────┘
    ↓
  如果有子节点，workInProgress = child，继续循环
    ↓
  如果没有子节点：
    ↓
  ┌─────────────────────────────────────────┐
  │ completeUnitOfWork(workInProgress)       │
  │   ↓                                      │
  │ completeWork(current, workInProgress)    │
  │ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
  │ 1. 创建 DOM 节点（在内存中）             │
  │ 2. 设置属性（className、style 等）       │
  │ 3. 收集子节点的副作用（冒泡 flags）      │
  │ 4. 返回 null（当前节点完成）             │
  └─────────────────────────────────────────┘
    ↓
  如果有兄弟节点，workInProgress = sibling，继续循环
    ↓
  如果没有兄弟节点，workInProgress = return（父节点），继续循环
}
  ↓
workInProgress = null  // 整棵树遍历完成
  ↓
workInProgressRootExitStatus = RootCompleted

Render 阶段输出：
  - 新的 Fiber 树（workInProgress 树）
  - 标记了 flags（Placement、Update、Deletion 等）
  - 创建了 DOM 节点（在内存中，未插入）
  
状态：
  ✅ Fiber 树构建完成
  ✅ DOM 节点已创建（在内存中）
  ❌ 真实 DOM 还未变化
  ❌ 用户还看到旧画面

4. 🔥🔥 Commit 阶段（不可中断，立即执行）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

commitRoot(root, recoverableErrors, transitions)
  ↓
commitRootImpl(root, recoverableErrors, transitions, priority)
  ↓
executionContext |= CommitContext  // 标记进入 Commit 阶段
  ↓
┌─────────────────────────────────────────┐
│ 子阶段 1：Before Mutation（DOM 变更前）  │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│ commitBeforeMutationEffects(root, work)  │
│                                          │
│ 主要工作：                               │
│ - getSnapshotBeforeUpdate（类组件）      │
│ - 调度 useEffect（标记，不执行）         │
│                                          │
│ 状态：                                   │
│ ❌ DOM 还未变化                          │
└─────────────────────────────────────────┘
  ↓
┌─────────────────────────────────────────┐
│ 子阶段 2：Mutation（DOM 变更）          │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│ commitMutationEffects(root, work, lanes)│
│                                          │
│ 主要工作：                               │
│ - 🔥 DOM 操作（插入、更新、删除）        │
│   * commitPlacement（插入节点）          │
│   * commitWork（更新属性）               │
│   * commitDeletion（删除节点）           │
│ - useLayoutEffect cleanup               │
│ - 重置 ref                              │
│                                          │
│ 状态：                                   │
│ ✅ DOM 已变化                            │
│ ❌ 浏览器还未绘制                        │
└─────────────────────────────────────────┘
  ↓
root.current = finishedWork  // 切换 current 树
  ↓
┌─────────────────────────────────────────┐
│ 子阶段 3：Layout（DOM 变更后）          │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│ commitLayoutEffects(work, root, lanes)  │
│                                          │
│ 主要工作：                               │
│ - 🔥 useLayoutEffect 回调（同步）        │
│ - componentDidMount / componentDidUpdate │
│ - 更新 ref                              │
│                                          │
│ 状态：                                   │
│ ✅ DOM 已变化                            │
│ ✅ 可以读取最新 DOM                      │
│ ❌ 浏览器还未绘制                        │
│ ⚠️ 会阻塞浏览器绘制                      │
└─────────────────────────────────────────┘
  ↓
requestPaint()  // 通知 Scheduler 可以让浏览器渲染
  ↓
scheduleCallback(NormalSchedulerPriority, flushPassiveEffects)
  ↓ （通过 MessageChannel.port.postMessage）
  
状态：
  ✅ DOM 已更新
  ✅ useLayoutEffect 已执行
  ❌ 浏览器还未绘制
  
Commit 阶段完成！

5. 浏览器渲染（React 让出后）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Recalculate Style（样式计算）
  ↓
Layout（布局计算，构建渲染树）
  ↓
requestAnimationFrame 回调
  ↓
Paint（绘制像素）
  ↓
Composite（合成到屏幕）
  ↓
🔥 用户看到新画面！

6. useEffect 执行（异步，下一个宏任务）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

MessageChannel.port1.onmessage 触发
  ↓
performWorkUntilDeadline()
  ↓
flushWork()
  ↓
flushPassiveEffects()
  ↓
commitPassiveUnmountEffects()  // 执行 cleanup
  ↓
commitPassiveMountEffects()  // 执行 useEffect 回调


关键时间节点总结：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

setState
  ↓ (同步)
Schedule
  ↓ (同步)
Render 阶段
  - beginWork（向下）
  - completeWork（向上）
  ↓ (立即，同步)
Commit 阶段 ← Render 完成后立即执行，没有延迟！
  - Before Mutation
  - Mutation（DOM 变更）
  - Layout（useLayoutEffect）
  ↓ (让出)
浏览器渲染
  - Style → Layout → Paint
  ↓ (用户看到)
useEffect
  - 下一个宏任务

所以：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Render 阶段 → Commit 阶段：立即（同步）连续执行
Commit 阶段 → 浏览器渲染：React 让出，浏览器接管
浏览器渲染 → useEffect：异步，下一个宏任务`}
      </pre>
    </div>
  );
}

// 源码分析
function SourceCodeAnalysis() {
  return (
    <div style={{ background: '#fff', padding: '15px', borderRadius: '5px' }}>
      <h3>关键源码片段</h3>
      
      <pre style={{ background: '#f5f5f5', padding: '15px', overflow: 'auto', fontSize: '13px', lineHeight: '1.8' }}>
{`1. Render 阶段包括 beginWork 和 completeWork
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ReactFiberWorkLoop.old.js

// Render 阶段入口
function renderRootSync(root: FiberRoot, lanes: Lanes) {
  executionContext |= RenderContext;  // 🔥 标记进入 Render 阶段
  
  prepareFreshStack(root, lanes);
  
  do {
    try {
      workLoopSync();  // 🔥 工作循环
      break;
    } catch (thrownValue) {
      handleError(root, thrownValue);
    }
  } while (true);
  
  return workInProgressRootExitStatus;
}

// 工作循环
function workLoopSync() {
  while (workInProgress !== null) {
    performUnitOfWork(workInProgress);  // 🔥 处理每个 Fiber
  }
}

// 处理单个 Fiber 节点
function performUnitOfWork(unitOfWork: Fiber): void {
  const current = unitOfWork.alternate;
  
  // 🔥🔥 调用 beginWork（向下遍历）
  let next = beginWork(current, unitOfWork, subtreeRenderLanes);
  
  unitOfWork.memoizedProps = unitOfWork.pendingProps;
  
  if (next === null) {
    // 🔥🔥 没有子节点，调用 completeUnitOfWork（向上遍历）
    completeUnitOfWork(unitOfWork);
  } else {
    workInProgress = next;
  }
}

// 完成节点
function completeUnitOfWork(unitOfWork: Fiber): void {
  let completedWork = unitOfWork;
  
  do {
    const current = completedWork.alternate;
    const returnFiber = completedWork.return;
    
    // 🔥🔥 调用 completeWork
    let next = completeWork(current, completedWork, subtreeRenderLanes);
    
    if (next !== null) {
      workInProgress = next;
      return;
    }
    
    const siblingFiber = completedWork.sibling;
    if (siblingFiber !== null) {
      workInProgress = siblingFiber;  // 处理兄弟节点
      return;
    }
    
    completedWork = returnFiber;  // 返回父节点
    workInProgress = completedWork;
  } while (completedWork !== null);
  
  // 🔥 Render 阶段完成
  if (workInProgressRootExitStatus === RootInProgress) {
    workInProgressRootExitStatus = RootCompleted;
  }
}


2. Commit 阶段在 Render 阶段完成后立即执行
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ReactFiberWorkLoop.old.js

function performSyncWorkOnRoot(root) {
  // ... 准备工作
  
  // 🔥 步骤 1：执行 Render 阶段
  let exitStatus = renderRootSync(root, lanes);
  
  if (root.tag !== LegacyRoot && exitStatus === RootErrored) {
    // 错误处理
    const errorRetryLanes = getLanesToRetrySynchronouslyOnError(root);
    if (errorRetryLanes !== NoLanes) {
      lanes = errorRetryLanes;
      exitStatus = recoverFromConcurrentError(root, errorRetryLanes);
    }
  }
  
  if (exitStatus === RootFatalErrored) {
    throw workInProgressRootFatalError;
  }
  
  // 🔥 步骤 2：Render 阶段完成，准备 Commit
  const finishedWork: Fiber = (root.current.alternate: any);
  root.finishedWork = finishedWork;
  root.finishedLanes = lanes;
  
  // 🔥🔥 步骤 3：立即执行 Commit 阶段（同步）
  commitRoot(
    root,
    workInProgressRootRecoverableErrors,
    workInProgressTransitions,
  );
  
  // ... 后续工作
  
  return null;
}

// 注意：renderRootSync 和 commitRoot 之间没有异步操作！
// 是连续同步执行的！


3. Commit 阶段的三个子阶段
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ReactFiberWorkLoop.old.js

function commitRoot(
  root: FiberRoot,
  recoverableErrors: null | Array<CapturedValue<mixed>>,
  transitions: Array<Transition> | null,
) {
  const previousUpdateLanePriority = getCurrentUpdatePriority();
  const prevTransition = ReactCurrentBatchConfig.transition;
  
  try {
    ReactCurrentBatchConfig.transition = null;
    setCurrentUpdatePriority(DiscreteEventPriority);
    
    // 🔥 调用 commitRootImpl
    commitRootImpl(
      root,
      recoverableErrors,
      transitions,
      previousUpdateLanePriority,
    );
  } finally {
    ReactCurrentBatchConfig.transition = prevTransition;
    setCurrentUpdatePriority(previousUpdateLanePriority);
  }
  
  return null;
}

function commitRootImpl(
  root: FiberRoot,
  recoverableErrors: null | Array<CapturedValue<mixed>>,
  transitions: Array<Transition> | null,
  renderPriorityLevel: EventPriority,
) {
  // 标记进入 Commit 阶段
  executionContext |= CommitContext;
  
  const finishedWork = root.finishedWork;
  const lanes = root.finishedLanes;
  
  // ... 准备工作
  
  // 🔥 子阶段 1：Before Mutation
  commitBeforeMutationEffects(root, finishedWork);
  
  // 🔥 子阶段 2：Mutation（DOM 变更）
  commitMutationEffects(root, finishedWork, lanes);
  
  // 切换 current 树
  root.current = finishedWork;
  
  // 🔥 子阶段 3：Layout（DOM 变更后）
  commitLayoutEffects(finishedWork, root, lanes);
  
  // 通知 Scheduler 可以让浏览器渲染
  requestPaint();
  
  // 调度 Passive Effects（useEffect）
  if (rootDoesHavePassiveEffects) {
    rootDoesHavePassiveEffects = false;
    
    scheduleCallback(NormalSchedulerPriority, () => {
      flushPassiveEffects();
      return null;
    });
  }
  
  // ... 清理工作
  
  return null;
}


4. 证明 Render 和 Commit 是连续执行的
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ReactFiberWorkLoop.old.js (line 1228-1280)

export function performSyncWorkOnRoot(root) {
  // ...
  
  // Render 阶段 ↓
  let exitStatus = renderRootSync(root, lanes);
  
  // 立即检查结果
  if (root.tag !== LegacyRoot && exitStatus === RootErrored) {
    // 错误处理
  }
  
  // 准备 Commit
  const finishedWork: Fiber = (root.current.alternate: any);
  root.finishedWork = finishedWork;
  root.finishedLanes = lanes;
  
  // Commit 阶段 ↓（立即执行）
  commitRoot(
    root,
    workInProgressRootRecoverableErrors,
    workInProgressTransitions,
  );
  
  // ...
  
  return null;
}

// 没有任何 setTimeout、Promise、scheduleCallback 等异步操作！
// 完全是同步连续执行的！


关键理解：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Render 阶段 = beginWork + completeWork 的完整循环
   
2. Commit 阶段在 Render 阶段完成后立即（同步）执行
   
3. 没有延迟，没有异步
   
4. 完整流程：
   performSyncWorkOnRoot
     ↓ (同步)
   renderRootSync
     ↓ (包含 beginWork 和 completeWork)
   workInProgressRootExitStatus = RootCompleted
     ↓ (立即，同步)
   commitRoot
     ↓
   commitRootImpl
     ↓
   三个子阶段（Before Mutation、Mutation、Layout）`}
      </pre>
    </div>
  );
}

// 阶段对比
function PhaseDifferences() {
  return (
    <div style={{ background: '#fff', padding: '15px', borderRadius: '5px' }}>
      <h3>Render 阶段 vs Commit 阶段的关键区别</h3>
      
      <div style={{ marginBottom: '15px' }}>
        <h4 style={{ color: '#1976d2' }}>🔄 Render 阶段</h4>
        <div style={{ background: '#e3f2fd', padding: '15px', borderRadius: '5px', fontSize: '14px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              <tr style={{ borderBottom: '1px solid #ccc' }}>
                <td style={{ padding: '8px', fontWeight: 'bold' }}>可中断性</td>
                <td style={{ padding: '8px' }}>✅ 可中断（Concurrent 模式）</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #ccc' }}>
                <td style={{ padding: '8px', fontWeight: 'bold' }}>副作用</td>
                <td style={{ padding: '8px' }}>❌ 不产生副作用（纯计算）</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #ccc' }}>
                <td style={{ padding: '8px', fontWeight: 'bold' }}>DOM 操作</td>
                <td style={{ padding: '8px' }}>❌ 不修改真实 DOM</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #ccc' }}>
                <td style={{ padding: '8px', fontWeight: 'bold' }}>可重复执行</td>
                <td style={{ padding: '8px' }}>✅ 可以（被中断后重新执行）</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #ccc' }}>
                <td style={{ padding: '8px', fontWeight: 'bold' }}>主要工作</td>
                <td style={{ padding: '8px' }}>
                  • 执行组件函数<br/>
                  • 调用 Hooks（useState、useEffect 等）<br/>
                  • Diff 算法<br/>
                  • 创建/复用 Fiber 节点<br/>
                  • 在内存中创建 DOM 节点<br/>
                  • 标记副作用（flags）
                </td>
              </tr>
              <tr style={{ borderBottom: '1px solid #ccc' }}>
                <td style={{ padding: '8px', fontWeight: 'bold' }}>包含流程</td>
                <td style={{ padding: '8px' }}>
                  ✅ beginWork（向下遍历）<br/>
                  ✅ completeWork（向上遍历）
                </td>
              </tr>
              <tr>
                <td style={{ padding: '8px', fontWeight: 'bold' }}>输出</td>
                <td style={{ padding: '8px' }}>新的 Fiber 树 + 副作用标记</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <div style={{ marginBottom: '15px' }}>
        <h4 style={{ color: '#388e3c' }}>📝 Commit 阶段</h4>
        <div style={{ background: '#e8f5e9', padding: '15px', borderRadius: '5px', fontSize: '14px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              <tr style={{ borderBottom: '1px solid #ccc' }}>
                <td style={{ padding: '8px', fontWeight: 'bold' }}>可中断性</td>
                <td style={{ padding: '8px' }}>❌ 不可中断（同步执行）</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #ccc' }}>
                <td style={{ padding: '8px', fontWeight: 'bold' }}>副作用</td>
                <td style={{ padding: '8px' }}>✅ 产生副作用</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #ccc' }}>
                <td style={{ padding: '8px', fontWeight: 'bold' }}>DOM 操作</td>
                <td style={{ padding: '8px' }}>✅ 修改真实 DOM</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #ccc' }}>
                <td style={{ padding: '8px', fontWeight: 'bold' }}>可重复执行</td>
                <td style={{ padding: '8px' }}>❌ 不可以（必须一次完成）</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #ccc' }}>
                <td style={{ padding: '8px', fontWeight: 'bold' }}>主要工作</td>
                <td style={{ padding: '8px' }}>
                  <strong>Before Mutation：</strong><br/>
                  • getSnapshotBeforeUpdate<br/>
                  <br/>
                  <strong>Mutation：</strong><br/>
                  • 🔥 DOM 操作（插入、更新、删除）<br/>
                  • useLayoutEffect cleanup<br/>
                  <br/>
                  <strong>Layout：</strong><br/>
                  • 🔥 useLayoutEffect 回调<br/>
                  • componentDidMount/Update<br/>
                  • ref 更新
                </td>
              </tr>
              <tr style={{ borderBottom: '1px solid #ccc' }}>
                <td style={{ padding: '8px', fontWeight: 'bold' }}>执行时机</td>
                <td style={{ padding: '8px' }}>
                  🔥 Render 阶段完成后立即（同步）执行
                </td>
              </tr>
              <tr>
                <td style={{ padding: '8px', fontWeight: 'bold' }}>输出</td>
                <td style={{ padding: '8px' }}>真实 DOM 更新</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <div style={{ background: '#fff3e0', padding: '15px', borderRadius: '5px', fontSize: '14px' }}>
        <h4 style={{ marginTop: 0 }}>⏱️ 时间关系</h4>
        <pre style={{ background: '#fff', padding: '10px', fontSize: '13px', margin: '10px 0' }}>
{`Render 阶段完成
  ↓ 立即（同步，无延迟）
Commit 阶段开始
  - Before Mutation
  - Mutation
  - Layout
  ↓
Commit 阶段完成
  ↓ requestPaint()
[React 让出]
  ↓
浏览器渲染`}
        </pre>
      </div>
    </div>
  );
}

// 实际演示
function PracticalDemo() {
  const [count, setCount] = useState(0);
  const [logs, setLogs] = useState([]);
  const renderCountRef = useRef(0);
  
  const addLog = (message) => {
    setLogs(prev => [...prev, { time: performance.now(), message }]);
  };
  
  // Render 阶段
  renderCountRef.current += 1;
  if (renderCountRef.current > 1) {
    console.log('🔄 Render 阶段：组件函数执行');
  }
  
  // Commit 阶段 - Layout
  useEffect(() => {
    console.log('🟡 Commit - Layout: useLayoutEffect（同步）');
    addLog('🟡 Commit - Layout: useLayoutEffect');
  }, [count]);
  
  // useEffect（Commit 后异步）
  useEffect(() => {
    console.log('🔵 Passive Effects: useEffect（异步）');
    addLog('🔵 Passive Effects: useEffect');
  }, [count]);
  
  const handleClick = () => {
    setLogs([]);
    renderCountRef.current = 0;
    console.log('🔴 触发更新：setState');
    addLog('🔴 触发更新：setState');
    setCount(c => c + 1);
  };
  
  return (
    <div style={{ background: '#fff', padding: '15px', borderRadius: '5px' }}>
      <div style={{ marginBottom: '20px' }}>
        <div style={{
          padding: '20px',
          background: '#2196f3',
          color: '#fff',
          borderRadius: '5px',
          fontSize: '24px',
          fontWeight: 'bold',
          textAlign: 'center',
          marginBottom: '15px'
        }}>
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
          触发更新
        </button>
      </div>
      
      <div style={{ 
        padding: '15px',
        background: '#f5f5f5',
        borderRadius: '5px',
        maxHeight: '300px',
        overflowY: 'auto'
      }}>
        <h4>执行日志：</h4>
        {logs.length === 0 ? (
          <div style={{ color: '#999', fontSize: '14px' }}>
            点击按钮，然后查看浏览器控制台
          </div>
        ) : (
          logs.map((log, index) => (
            <div key={index} style={{ 
              fontSize: '13px', 
              marginBottom: '5px',
              fontFamily: 'monospace'
            }}>
              {log.message}
            </div>
          ))
        )}
      </div>
      
      <div style={{ marginTop: '15px', padding: '10px', background: '#e3f2fd', borderRadius: '5px', fontSize: '13px' }}>
        <strong>在浏览器控制台观察顺序：</strong>
        <ol style={{ margin: '10px 0', paddingLeft: '20px' }}>
          <li>🔴 setState 触发</li>
          <li>🔄 Render 阶段：组件函数执行</li>
          <li>🟡 Commit - Layout: useLayoutEffect（同步）</li>
          <li>🔵 Passive Effects: useEffect（异步，稍后）</li>
        </ol>
      </div>
    </div>
  );
}

// 总结
function Summary() {
  return (
    <div style={{ background: '#fff', padding: '15px', borderRadius: '5px' }}>
      <h3>核心要点总结</h3>
      
      <pre style={{ background: '#f5f5f5', padding: '15px', fontSize: '13px', lineHeight: '1.8' }}>
{`问题 1：Render 阶段包括 beginWork 到 completeWork 吗？
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ 是的！Render 阶段包括完整的 beginWork 和 completeWork 流程

Render 阶段 = renderRootSync/Concurrent
              ↓
            workLoop
              ↓
          performUnitOfWork
              ↓
        ┌─────────┴─────────┐
    beginWork          completeWork
    (向下遍历)          (向上遍历)


问题 2：Commit 阶段什么时候执行？
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Render 阶段完成后立即（同步）执行，没有任何延迟！

完整流程：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

setState()
  ↓ (同步)
Schedule 阶段
  ↓ (同步)
Render 阶段（可中断）
  - beginWork（向下）
  - completeWork（向上）
  ↓ (立即，同步，无延迟)
Commit 阶段（不可中断）
  - Before Mutation
  - Mutation
  - Layout
  ↓ (让出)
浏览器渲染
  ↓ (异步)
useEffect

关键理解：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Render 阶段 = beginWork + completeWork 的完整遍历

2. Commit 阶段在 Render 完成后立即开始

3. 两个阶段是连续同步执行的

4. Render 和 Commit 之间没有异步操作

5. 只有 Commit 完成后才让出给浏览器渲染`}
      </pre>
    </div>
  );
}
