import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';

/**
 * Effect Cleanup 执行时机详细分析
 * 
 * 核心问题：
 * 1. useLayoutEffect cleanup 在哪个阶段执行？
 * 2. useLayoutEffect create 在哪个阶段执行？
 * 3. useEffect cleanup 在哪个阶段执行？
 * 4. useEffect create 在哪个阶段执行？
 */

export default function EffectCleanupTimingAnalysis() {
  const [expandedSection, setExpandedSection] = useState(null);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', color: '#61dafb' }}>⏰ Effect Cleanup 执行时机详解</h1>
      
      <Section
        title="✅ 核心答案"
        id="answer"
        expanded={expandedSection === 'answer'}
        onToggle={() => setExpandedSection(expandedSection === 'answer' ? null : 'answer')}
      >
        <CoreAnswer />
      </Section>

      <Section
        title="📋 完整执行流程"
        id="flow"
        expanded={expandedSection === 'flow'}
        onToggle={() => setExpandedSection(expandedSection === 'flow' ? null : 'flow')}
      >
        <CompleteFlow />
      </Section>

      <Section
        title="🔍 useLayoutEffect 详解"
        id="layout"
        expanded={expandedSection === 'layout'}
        onToggle={() => setExpandedSection(expandedSection === 'layout' ? null : 'layout')}
      >
        <LayoutEffectDetail />
      </Section>

      <Section
        title="🔍 useEffect 详解"
        id="effect"
        expanded={expandedSection === 'effect'}
        onToggle={() => setExpandedSection(expandedSection === 'effect' ? null : 'effect')}
      >
        <EffectDetail />
      </Section>

      <Section
        title="🔬 源码分析"
        id="source"
        expanded={expandedSection === 'source'}
        onToggle={() => setExpandedSection(expandedSection === 'source' ? null : 'source')}
      >
        <SourceCodeAnalysis />
      </Section>

      <Section
        title="🎯 实际示例"
        id="example"
        expanded={expandedSection === 'example'}
        onToggle={() => setExpandedSection(expandedSection === 'example' ? null : 'example')}
      >
        <PracticalExample />
      </Section>

      <Section
        title="⚠️ 常见误区"
        id="mistakes"
        expanded={expandedSection === 'mistakes'}
        onToggle={() => setExpandedSection(expandedSection === 'mistakes' ? null : 'mistakes')}
      >
        <CommonMistakes />
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
      <h3>核心答案总览</h3>
      <pre style={{ background: '#f5f5f5', padding: '15px', borderRadius: '5px', overflow: 'auto', fontSize: '14px', lineHeight: '1.8' }}>
{`Effect 执行时机总结
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

┌─────────────────────────────────────────────────────────┐
│  useLayoutEffect                                        │
├─────────────────────────────────────────────────────────┤
│  Cleanup:  Commit 阶段 - Mutation 子阶段（同步）         │
│  Create:   Commit 阶段 - Layout 子阶段（同步）           │
│  时机:     DOM 更新后、浏览器绘制前                       │
│  阻塞:     会阻塞浏览器渲染                               │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  useEffect                                              │
├─────────────────────────────────────────────────────────┤
│  Cleanup:  Commit 阶段后 - 异步（宏任务）                │
│  Create:   Commit 阶段后 - 异步（宏任务）                │
│  时机:     浏览器绘制后                                  │
│  阻塞:     不会阻塞浏览器渲染                             │
└─────────────────────────────────────────────────────────┘


详细时间线
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

setState() 触发更新
  ↓
Render 阶段
  ├─ beginWork
  ├─ completeWork
  └─ 构建 Fiber 树
  ↓
Commit 阶段（同步执行）
  ├─ Before Mutation 子阶段
  │  └─ getSnapshotBeforeUpdate
  │
  ├─ Mutation 子阶段
  │  ├─ 🔥 useLayoutEffect cleanup（销毁函数）
  │  ├─ DOM 操作（appendChild, removeChild 等）
  │  └─ componentWillUnmount
  │
  ├─ 切换 Fiber 树：root.current = finishedWork
  │
  └─ Layout 子阶段
     ├─ 🔥 useLayoutEffect create（创建函数）
     ├─ componentDidMount
     └─ componentDidUpdate
  ↓
调度 useEffect（注册宏任务，不执行）
  ↓
JS 线程让出
  ↓
浏览器渲染（GUI 渲染线程）
  ├─ requestAnimationFrame
  ├─ Recalculate Style
  ├─ Layout
  ├─ Paint
  └─ Composite
  ↓
屏幕更新 ✨
  ↓
useEffect 执行（宏任务，异步）
  ├─ 🔥 useEffect cleanup（销毁函数）
  └─ 🔥 useEffect create（创建函数）


关键理解
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔥 useLayoutEffect cleanup 在 Mutation 子阶段（DOM 更新前）
🔥 useLayoutEffect create 在 Layout 子阶段（DOM 更新后）
🔥 两者都是同步的，都在 Commit 阶段
🔥 都会阻塞浏览器渲染

🔥 useEffect cleanup 在 Commit 后，异步执行
🔥 useEffect create 在 Commit 后，异步执行
🔥 两者都在浏览器渲染后
🔥 不会阻塞浏览器渲染


为什么这样设计？
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. useLayoutEffect cleanup 在 DOM 更新前执行
   - 可以读取旧 DOM 的状态
   - 可以清理基于旧 DOM 的副作用

2. useLayoutEffect create 在 DOM 更新后执行
   - 可以读取新 DOM 的布局
   - 可以基于新 DOM 进行操作
   - 保证用户看不到中间状态（避免闪烁）

3. useEffect 异步执行
   - 不阻塞渲染，提升性能
   - 适合大多数副作用（数据获取、订阅等）`}
      </pre>
    </div>
  );
}

function CompleteFlow() {
  return (
    <div>
      <h3>完整的执行流程</h3>
      <pre style={{ background: '#f5f5f5', padding: '15px', borderRadius: '5px', overflow: 'auto', fontSize: '13px', lineHeight: '1.8' }}>
{`从 setState 到 Effects 执行的完整流程
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

阶段 0：触发更新
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

setState() / 事件触发
  ↓
scheduleUpdateOnFiber()
  ↓
ensureRootIsScheduled()


阶段 1：Render 阶段（构建新的 Fiber 树）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

renderRootSync() / renderRootConcurrent()
  ↓
workLoopSync() / workLoopConcurrent()
  ↓
performUnitOfWork()
  ├─ beginWork()
  │  └─ 处理组件，执行 Hooks
  │     ├─ useState 创建/更新状态
  │     ├─ useEffect 创建 Effect 对象，标记 PassiveEffect flag
  │     └─ useLayoutEffect 创建 Effect 对象，标记 LayoutEffect flag
  │
  └─ completeWork()
     └─ 创建/更新 DOM 节点

// 🔥 注意：这个阶段只是创建 Effect 对象，不执行回调


阶段 2：Commit 阶段（提交更新到 DOM）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

commitRootImpl(root)

┌─────────────────────────────────────────────────────────┐
│  2.1 Before Mutation 子阶段                              │
├─────────────────────────────────────────────────────────┤
│  commitBeforeMutationEffects(finishedWork)              │
│                                                         │
│  执行内容：                                              │
│  ├─ getSnapshotBeforeUpdate（类组件）                   │
│  ├─ 调度 useEffect（只是注册，不执行）                   │
│  └─ 清理 container                                      │
│                                                         │
│  此时：                                                  │
│  ✅ 准备工作完成                                         │
│  ❌ 还没有 DOM 操作                                      │
│  ❌ 还没有执行任何 Effect                                │
└─────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────┐
│  2.2 Mutation 子阶段  🔥🔥 关键！                        │
├─────────────────────────────────────────────────────────┤
│  commitMutationEffects(root, finishedWork)             │
│                                                         │
│  执行顺序（从下到上遍历 Fiber 树）：                      │
│                                                         │
│  Step 1: 执行 useLayoutEffect cleanup                   │
│  ────────────────────────────────────────────────────  │
│  commitHookEffectListUnmount(                          │
│    HookLayout | HookHasEffect,                         │
│    finishedWork,                                       │
│  )                                                     │
│                                                         │
│  🔥 执行上一次渲染的 useLayoutEffect 返回的销毁函数       │
│                                                         │
│  useLayoutEffect(() => {                               │
│    // ...                                              │
│    return () => {                                      │
│      // 🔥 这个销毁函数在这里执行                        │
│      console.log('useLayoutEffect cleanup');           │
│    };                                                  │
│  });                                                   │
│                                                         │
│  为什么在这里执行？                                       │
│  - DOM 还未更新                                          │
│  - 可以读取旧 DOM 的状态                                 │
│  - 可以清理基于旧 DOM 的副作用                           │
│                                                         │
│  ────────────────────────────────────────────────────  │
│                                                         │
│  Step 2: DOM 操作                                       │
│  ────────────────────────────────────────────────────  │
│  根据 effectTag 执行 DOM 操作：                          │
│  ├─ Placement: insertBefore / appendChild              │
│  ├─ Update: updateProperties                           │
│  └─ Deletion: removeChild                              │
│                                                         │
│  此时：                                                  │
│  ✅ useLayoutEffect cleanup 执行完成                    │
│  ✅ DOM 树已更新                                         │
│  ❌ 浏览器还未渲染                                       │
│                                                         │
│  ────────────────────────────────────────────────────  │
│                                                         │
│  Step 3: 执行 componentWillUnmount                      │
│  ────────────────────────────────────────────────────  │
│  对于被删除的类组件，执行 componentWillUnmount           │
└─────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────┐
│  切换 Fiber 树                                           │
├─────────────────────────────────────────────────────────┤
│  root.current = finishedWork                           │
│                                                         │
│  从 workInProgress 树切换到 current 树                   │
└─────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────┐
│  2.3 Layout 子阶段  🔥🔥 关键！                          │
├─────────────────────────────────────────────────────────┤
│  commitLayoutEffects(finishedWork, root)               │
│                                                         │
│  执行顺序（从下到上遍历 Fiber 树）：                      │
│                                                         │
│  Step 1: 执行 useLayoutEffect create                    │
│  ────────────────────────────────────────────────────  │
│  commitHookEffectListMount(                            │
│    HookLayout | HookHasEffect,                         │
│    finishedWork,                                       │
│  )                                                     │
│                                                         │
│  🔥 执行 useLayoutEffect 的创建函数                      │
│                                                         │
│  useLayoutEffect(() => {                               │
│    // 🔥 这个函数在这里执行                             │
│    console.log('useLayoutEffect create');              │
│                                                         │
│    // ✅ DOM 已更新                                     │
│    const height = element.offsetHeight;                │
│                                                         │
│    // ✅ 可以基于新 DOM 进行操作                        │
│    tooltip.style.top = height + 'px';                  │
│                                                         │
│    return () => {                                      │
│      console.log('cleanup');                           │
│    };                                                  │
│  });                                                   │
│                                                         │
│  为什么在这里执行？                                       │
│  - DOM 已更新                                           │
│  - 可以读取新 DOM 的布局                                │
│  - 浏览器还未渲染，所以不会有闪烁                        │
│                                                         │
│  ────────────────────────────────────────────────────  │
│                                                         │
│  Step 2: 执行生命周期                                    │
│  ────────────────────────────────────────────────────  │
│  ├─ componentDidMount（挂载时）                         │
│  └─ componentDidUpdate（更新时）                        │
│                                                         │
│  此时：                                                  │
│  ✅ useLayoutEffect create 执行完成                     │
│  ✅ DOM 已更新                                           │
│  ❌ 浏览器还未渲染                                       │
└─────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────┐
│  2.4 调度 useEffect                                     │
├─────────────────────────────────────────────────────────┤
│  if (有 PassiveEffect flag) {                          │
│    scheduleCallback(NormalSchedulerPriority, () => {   │
│      flushPassiveEffects();                            │
│      return null;                                      │
│    });                                                 │
│  }                                                     │
│                                                         │
│  🔥 只是调度，不执行                                     │
│  🔥 使用 MessageChannel 注册宏任务                       │
└─────────────────────────────────────────────────────────┘

// Commit 阶段结束
// JS 线程可能继续执行其他同步代码


阶段 3：JS 线程让出
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

当前宏任务执行完毕
JS 调用栈清空
JS 线程让出控制权


阶段 4：浏览器渲染
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

GUI 渲染线程接管

┌─────────────────────────────────────────────────────────┐
│  requestAnimationFrame 回调                             │
│  （在渲染开始前执行）                                     │
└─────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────┐
│  Recalculate Style                                      │
│  （重新计算样式）                                         │
└─────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────┐
│  Layout                                                 │
│  （重排/回流）                                            │
└─────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────┐
│  Paint                                                  │
│  （重绘）                                                │
└─────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────┐
│  Composite                                              │
│  （合成）                                                │
└─────────────────────────────────────────────────────────┘
         ↓
       屏幕更新 ✨


阶段 5：useEffect 执行（宏任务）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

MessageChannel 触发宏任务
JS 线程重新执行

┌─────────────────────────────────────────────────────────┐
│  flushPassiveEffects()                                  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Step 1: 执行 useEffect cleanup                         │
│  ────────────────────────────────────────────────────  │
│  commitPassiveUnmountEffects(finishedWork)             │
│                                                         │
│  🔥 执行上一次渲染的 useEffect 返回的销毁函数             │
│                                                         │
│  useEffect(() => {                                     │
│    // ...                                              │
│    return () => {                                      │
│      // 🔥 这个销毁函数在这里执行                        │
│      console.log('useEffect cleanup');                 │
│    };                                                  │
│  });                                                   │
│                                                         │
│  此时：                                                  │
│  ✅ 屏幕已更新                                           │
│  ✅ 用户已看到新画面                                     │
│                                                         │
│  ────────────────────────────────────────────────────  │
│                                                         │
│  Step 2: 执行 useEffect create                          │
│  ────────────────────────────────────────────────────  │
│  commitPassiveMountEffects(root, finishedWork)         │
│                                                         │
│  🔥 执行 useEffect 的创建函数                            │
│                                                         │
│  useEffect(() => {                                     │
│    // 🔥 这个函数在这里执行                             │
│    console.log('useEffect create');                    │
│                                                         │
│    // ✅ 屏幕已更新                                     │
│    // ✅ 不会阻塞渲染                                    │
│                                                         │
│    // 适合数据获取、订阅等                              │
│    fetch('/api/data');                                 │
│                                                         │
│    return () => {                                      │
│      console.log('cleanup');                           │
│    };                                                  │
│  });                                                   │
└─────────────────────────────────────────────────────────┘


总结：执行顺序
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Render 阶段
   - 创建 Effect 对象，不执行回调

2. Commit - Mutation 子阶段
   - 🔥 useLayoutEffect cleanup（同步）

3. Commit - Mutation 子阶段
   - DOM 操作

4. Commit - Layout 子阶段
   - 🔥 useLayoutEffect create（同步）

5. 调度 useEffect（注册宏任务）

6. JS 线程让出

7. 浏览器渲染

8. useEffect 执行（宏任务，异步）
   - 🔥 useEffect cleanup
   - 🔥 useEffect create`}
      </pre>
    </div>
  );
}

function LayoutEffectDetail() {
  return (
    <div>
      <h3>useLayoutEffect 详细分析</h3>
      <pre style={{ background: '#f5f5f5', padding: '15px', borderRadius: '5px', overflow: 'auto', fontSize: '13px', lineHeight: '1.8' }}>
{`useLayoutEffect 的完整生命周期
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. 注册阶段（Render 阶段）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// 组件函数执行
function MyComponent() {
  useLayoutEffect(() => {
    console.log('layout effect');
    return () => console.log('layout cleanup');
  }, [dep]);
  
  return <div>Hello</div>;
}

// 内部执行（挂载阶段）：
mountLayoutEffect(create, deps)
  ↓
mountEffectImpl(
  UpdateEffect | LayoutEffect,  // fiberFlags
  HookLayout | HookHasEffect,   // hookFlags
  create,
  deps,
)
  ↓
创建 Hook 对象：
{
  memoizedState: {
    tag: HookLayout | HookHasEffect,
    create: () => { ... },
    destroy: undefined,
    deps: [dep],
    next: null,
  },
  next: null,
}
  ↓
标记 Fiber：
currentlyRenderingFiber.flags |= UpdateEffect | LayoutEffect

// 🔥 只是创建 Effect 对象，不执行回调


2. Cleanup 执行（Commit - Mutation 子阶段）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

commitMutationEffects(root, finishedWork)
  ↓
递归遍历 Fiber 树（从下到上）
  ↓
对于每个有 LayoutEffect flag 的 Fiber：
  ↓
commitHookEffectListUnmount(
  HookLayout | HookHasEffect,
  finishedWork,
)
  ↓
遍历 Effect 链表：
  effect = fiber.updateQueue.lastEffect;
  do {
    if ((effect.tag & HookLayout) !== 0 && 
        (effect.tag & HookHasEffect) !== 0) {
      
      // 🔥 执行销毁函数
      const destroy = effect.destroy;
      effect.destroy = undefined;
      
      if (destroy !== undefined) {
        destroy();  // 🔥🔥 cleanup 在这里执行
      }
    }
    effect = effect.next;
  } while (effect !== firstEffect);

// 执行时机：
// ✅ 在 DOM 更新前
// ✅ 可以读取旧 DOM 状态
// ✅ 同步执行，会阻塞


3. DOM 操作（Commit - Mutation 子阶段）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

执行 DOM 操作：
- appendChild
- removeChild
- setAttribute
- ...

// 此时：
// ✅ useLayoutEffect cleanup 执行完成
// ✅ DOM 已更新
// ❌ useLayoutEffect create 还未执行


4. Create 执行（Commit - Layout 子阶段）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

commitLayoutEffects(finishedWork, root)
  ↓
递归遍历 Fiber 树
  ↓
对于每个有 LayoutEffect flag 的 Fiber：
  ↓
commitHookEffectListMount(
  HookLayout | HookHasEffect,
  finishedWork,
)
  ↓
遍历 Effect 链表：
  effect = fiber.updateQueue.lastEffect;
  do {
    if ((effect.tag & HookLayout) !== 0 && 
        (effect.tag & HookHasEffect) !== 0) {
      
      // 🔥 执行创建函数
      const create = effect.create;
      const destroy = create();  // 🔥🔥 create 在这里执行
      
      // 保存销毁函数
      effect.destroy = destroy;
    }
    effect = effect.next;
  } while (effect !== firstEffect);

// 执行时机：
// ✅ 在 DOM 更新后
// ✅ 可以读取新 DOM 状态
// ✅ 可以触发同步布局计算
// ✅ 同步执行，会阻塞渲染


使用场景
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ 场景 1：读取 DOM 布局并基于此修改 DOM

useLayoutEffect(() => {
  // ✅ 读取新 DOM 的布局
  const rect = element.getBoundingClientRect();
  
  // ✅ 基于布局修改 DOM
  tooltip.style.top = rect.bottom + 'px';
  tooltip.style.left = rect.left + 'px';
  
  // ✅ 用户只看到最终结果，没有闪烁
});


✅ 场景 2：避免闪烁

useLayoutEffect(() => {
  // 先隐藏元素
  element.style.opacity = 0;
  
  // 测量和定位
  const height = element.offsetHeight;
  element.style.top = height + 'px';
  
  // 显示元素
  element.style.opacity = 1;
  
  // ✅ 用户只看到最终结果
});


✅ 场景 3：同步更新第三方库

useLayoutEffect(() => {
  // ✅ 同步更新图表库
  chart.update(data);
  
  // 确保图表和 React 状态一致
});


❌ 场景 4：不要用于耗时操作

useLayoutEffect(() => {
  // ❌ 会阻塞渲染，页面卡顿
  for (let i = 0; i < 10000000; i++) {
    // 计算...
  }
});


❌ 场景 5：不要用于数据获取

useLayoutEffect(() => {
  // ❌ 会阻塞渲染
  // ✅ 应该用 useEffect
  fetch('/api/data')
    .then(res => res.json())
    .then(data => setData(data));
});


Cleanup 的作用
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

useLayoutEffect(() => {
  // 基于新 DOM 设置监听器
  const handler = (e) => { ... };
  element.addEventListener('scroll', handler);
  
  return () => {
    // 🔥 下次更新前，清理基于旧 DOM 的监听器
    element.removeEventListener('scroll', handler);
  };
});

// Cleanup 执行时机：
// 1. 组件重新渲染时（在 DOM 更新前）
// 2. 组件卸载时（在 DOM 删除时）


执行顺序（父子组件）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

<Parent>
  <Child />
</Parent>

更新时的执行顺序：

1. Render 阶段
   - Parent render
   - Child render

2. Commit - Mutation 子阶段（Cleanup）
   - Parent useLayoutEffect cleanup
   - Child useLayoutEffect cleanup

3. DOM 操作

4. Commit - Layout 子阶段（Create）
   - Child useLayoutEffect create  ← 子先执行
   - Parent useLayoutEffect create  ← 父后执行


为什么 cleanup 是父到子，create 是子到父？
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Cleanup（父到子）：
- Cleanup 在 DOM 更新前执行
- 父组件的 cleanup 可能依赖子组件的 DOM
- 所以先清理父，再清理子

Create（子到父）：
- Create 在 DOM 更新后执行
- 子组件的 DOM 已经更新
- 父组件的副作用可能依赖子组件的 DOM
- 所以先执行子，再执行父`}
      </pre>
    </div>
  );
}

function EffectDetail() {
  return (
    <div>
      <h3>useEffect 详细分析</h3>
      <pre style={{ background: '#f5f5f5', padding: '15px', borderRadius: '5px', overflow: 'auto', fontSize: '13px', lineHeight: '1.8' }}>
{`useEffect 的完整生命周期
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. 注册阶段（Render 阶段）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// 组件函数执行
function MyComponent() {
  useEffect(() => {
    console.log('effect');
    return () => console.log('effect cleanup');
  }, [dep]);
  
  return <div>Hello</div>;
}

// 内部执行（挂载阶段）：
mountEffect(create, deps)
  ↓
mountEffectImpl(
  PassiveEffect | PassiveStaticEffect,  // fiberFlags
  HookPassive,                          // hookFlags
  create,
  deps,
)
  ↓
创建 Hook 对象：
{
  memoizedState: {
    tag: HookPassive | HookHasEffect,
    create: () => { ... },
    destroy: undefined,
    deps: [dep],
    next: null,
  },
  next: null,
}
  ↓
标记 Fiber：
currentlyRenderingFiber.flags |= PassiveEffect

// 🔥 只是创建 Effect 对象，不执行回调


2. 调度阶段（Commit - Before Mutation 子阶段）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

commitBeforeMutationEffects(finishedWork)
  ↓
if (有 PassiveEffect flag) {
  // 🔥 调度 useEffect（不执行）
  if (!rootDoesHavePassiveEffects) {
    rootDoesHavePassiveEffects = true;
    
    scheduleCallback(NormalSchedulerPriority, () => {
      flushPassiveEffects();
      return null;
    });
  }
}

// 使用 Scheduler 调度：
scheduleCallback()
  ↓
使用 MessageChannel 注册宏任务：
  channel.port2.postMessage(null);

// 🔥 只是注册，不执行
// 🔥 等待当前宏任务结束，浏览器渲染后执行


3. DOM 操作和 useLayoutEffect
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

commitMutationEffects()
  - useLayoutEffect cleanup
  - DOM 操作

commitLayoutEffects()
  - useLayoutEffect create

// 此时：
// ✅ useLayoutEffect 执行完成
// ✅ DOM 已更新
// ❌ useEffect 还未执行（只是调度了）


4. JS 线程让出，浏览器渲染
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Commit 阶段结束
  ↓
当前宏任务执行完毕
  ↓
JS 线程让出
  ↓
浏览器渲染：
  - requestAnimationFrame
  - Recalculate Style
  - Layout
  - Paint
  - Composite
  ↓
屏幕更新 ✨
  ↓
用户看到新画面


5. Cleanup 执行（异步，宏任务）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

MessageChannel 触发宏任务
  ↓
flushPassiveEffects()
  ↓
commitPassiveUnmountEffects(finishedWork)
  ↓
递归遍历 Fiber 树
  ↓
对于每个有 PassiveEffect flag 的 Fiber：
  ↓
commitHookPassiveUnmountEffects(
  finishedWork,
  HookPassive | HookHasEffect,
)
  ↓
遍历 Effect 链表：
  effect = fiber.updateQueue.lastEffect;
  do {
    if ((effect.tag & HookPassive) !== 0 && 
        (effect.tag & HookHasEffect) !== 0) {
      
      // 🔥 执行销毁函数
      const destroy = effect.destroy;
      effect.destroy = undefined;
      
      if (destroy !== undefined) {
        destroy();  // 🔥🔥 cleanup 在这里执行
      }
    }
    effect = effect.next;
  } while (effect !== firstEffect);

// 执行时机：
// ✅ 在浏览器渲染后
// ✅ 屏幕已更新
// ✅ 不阻塞渲染


6. Create 执行（异步，宏任务）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

commitPassiveMountEffects(root, finishedWork)
  ↓
递归遍历 Fiber 树
  ↓
对于每个有 PassiveEffect flag 的 Fiber：
  ↓
commitHookPassiveMountEffects(
  finishedWork,
  HookPassive | HookHasEffect,
)
  ↓
遍历 Effect 链表：
  effect = fiber.updateQueue.lastEffect;
  do {
    if ((effect.tag & HookPassive) !== 0 && 
        (effect.tag & HookHasEffect) !== 0) {
      
      // 🔥 执行创建函数
      const create = effect.create;
      const destroy = create();  // 🔥🔥 create 在这里执行
      
      // 保存销毁函数
      effect.destroy = destroy;
    }
    effect = effect.next;
  } while (effect !== firstEffect);

// 执行时机：
// ✅ 在浏览器渲染后
// ✅ 屏幕已更新
// ✅ 不阻塞渲染


使用场景
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ 场景 1：数据获取

useEffect(() => {
  // ✅ 不阻塞渲染
  fetch('/api/data')
    .then(res => res.json())
    .then(data => setData(data));
}, []);


✅ 场景 2：订阅

useEffect(() => {
  const subscription = dataSource.subscribe();
  
  return () => {
    subscription.unsubscribe();
  };
}, [dataSource]);


✅ 场景 3：事件监听

useEffect(() => {
  const handler = (e) => { ... };
  window.addEventListener('resize', handler);
  
  return () => {
    window.removeEventListener('resize', handler);
  };
}, []);


✅ 场景 4：定时器

useEffect(() => {
  const timer = setInterval(() => {
    setCount(c => c + 1);
  }, 1000);
  
  return () => {
    clearInterval(timer);
  };
}, []);


✅ 场景 5：DOM 操作（不需要同步）

useEffect(() => {
  // ✅ 不需要阻塞渲染
  element.focus();
}, []);


❌ 场景 6：不要用于需要同步读取布局的场景

useEffect(() => {
  // ❌ 可能会闪烁
  // ✅ 应该用 useLayoutEffect
  const rect = element.getBoundingClientRect();
  tooltip.style.top = rect.bottom + 'px';
});


执行顺序（父子组件）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

<Parent>
  <Child />
</Parent>

更新时的执行顺序：

1. Render 阶段
   - Parent render
   - Child render

2. Commit 阶段
   - useLayoutEffect cleanup/create
   - 调度 useEffect（不执行）

3. 浏览器渲染

4. useEffect 执行（宏任务）
   - Parent useEffect cleanup
   - Child useEffect cleanup
   - Child useEffect create   ← 子先执行
   - Parent useEffect create   ← 父后执行


为什么 cleanup 是父到子，create 是子到父？
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

与 useLayoutEffect 相同的原因：
- 遍历顺序决定的
- commitPassiveUnmountEffects 从上到下遍历（父到子）
- commitPassiveMountEffects 从下到上遍历（子到父）


为什么使用 MessageChannel？
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Scheduler.js

if (typeof MessageChannel !== 'undefined') {
  const channel = new MessageChannel();
  const port = channel.port2;
  
  channel.port1.onmessage = performWorkUntilDeadline;
  
  schedulePerformWorkUntilDeadline = () => {
    port.postMessage(null);
  };
}

原因：
1. setTimeout 有最小延迟 4ms（浏览器限制）
2. MessageChannel 没有延迟
3. MessageChannel 优先级高于 setTimeout
4. MessageChannel 在浏览器渲染后执行

时间线：
- Commit 结束
- JS 线程让出
- 浏览器渲染
- MessageChannel 宏任务执行 ← useEffect
- setTimeout 宏任务执行`}
      </pre>
    </div>
  );
}

function SourceCodeAnalysis() {
  return (
    <div>
      <h3>关键源码分析</h3>
      <pre style={{ background: '#f5f5f5', padding: '15px', borderRadius: '5px', overflow: 'auto', fontSize: '13px', lineHeight: '1.8' }}>
{`1. commitMutationEffects - useLayoutEffect cleanup
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ReactFiberCommitWork.old.js

function commitMutationEffectsOnFiber(
  finishedWork: Fiber,
  root: FiberRoot,
  lanes: Lanes,
) {
  const current = finishedWork.alternate;
  const flags = finishedWork.flags;

  switch (finishedWork.tag) {
    case FunctionComponent: {
      recursivelyTraverseMutationEffects(root, finishedWork, lanes);
      commitReconciliationEffects(finishedWork);

      if (flags & Update) {
        // 🔥 执行 useLayoutEffect cleanup
        commitHookEffectListUnmount(
          HookLayout | HookHasEffect,
          finishedWork,
          finishedWork.return,
        );
      }
      return;
    }
    // ... 其他 case
  }
}


function commitHookEffectListUnmount(
  flags: HookFlags,
  finishedWork: Fiber,
  nearestMountedAncestor: Fiber | null,
) {
  const updateQueue: FunctionComponentUpdateQueue | null = 
    (finishedWork.updateQueue: any);
  const lastEffect = updateQueue !== null ? updateQueue.lastEffect : null;
  
  if (lastEffect !== null) {
    const firstEffect = lastEffect.next;
    let effect = firstEffect;
    
    do {
      if ((effect.tag & flags) === flags) {
        // 🔥🔥 执行销毁函数
        const destroy = effect.destroy;
        effect.destroy = undefined;
        
        if (destroy !== undefined) {
          try {
            destroy();  // 🔥 cleanup 在这里执行
          } catch (error) {
            captureCommitPhaseError(finishedWork, nearestMountedAncestor, error);
          }
        }
      }
      effect = effect.next;
    } while (effect !== firstEffect);
  }
}


2. commitLayoutEffects - useLayoutEffect create
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ReactFiberCommitWork.old.js

function commitLayoutEffectOnFiber(
  finishedRoot: FiberRoot,
  current: Fiber | null,
  finishedWork: Fiber,
  committedLanes: Lanes,
): void {
  const flags = finishedWork.flags;

  switch (finishedWork.tag) {
    case FunctionComponent: {
      recursivelyTraverseLayoutEffects(
        finishedRoot,
        finishedWork,
        committedLanes,
      );

      if (flags & Update) {
        // 🔥 执行 useLayoutEffect create
        commitHookEffectListMount(
          HookLayout | HookHasEffect,
          finishedWork,
        );
      }
      return;
    }
    
    case ClassComponent: {
      const instance = finishedWork.stateNode;
      
      if (current === null) {
        // 🔥 挂载时
        instance.componentDidMount();
      } else {
        // 🔥 更新时
        const prevProps = current.memoizedProps;
        const prevState = current.memoizedState;
        instance.componentDidUpdate(
          prevProps,
          prevState,
          instance.__reactInternalSnapshotBeforeUpdate,
        );
      }
      return;
    }
    // ... 其他 case
  }
}


function commitHookEffectListMount(
  flags: HookFlags,
  finishedWork: Fiber,
) {
  const updateQueue: FunctionComponentUpdateQueue | null = 
    (finishedWork.updateQueue: any);
  const lastEffect = updateQueue !== null ? updateQueue.lastEffect : null;
  
  if (lastEffect !== null) {
    const firstEffect = lastEffect.next;
    let effect = firstEffect;
    
    do {
      if ((effect.tag & flags) === flags) {
        // 🔥🔥 执行创建函数
        const create = effect.create;
        
        try {
          effect.destroy = create();  // 🔥 create 在这里执行
        } catch (error) {
          captureCommitPhaseError(finishedWork, finishedWork.return, error);
        }
      }
      effect = effect.next;
    } while (effect !== firstEffect);
  }
}


3. commitRootImpl - 调度 useEffect
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ReactFiberWorkLoop.old.js

function commitRootImpl(
  root: FiberRoot,
  recoverableErrors: null | Array<CapturedValue<mixed>>,
  transitions: Array<Transition> | null,
  renderPriorityLevel: EventPriority,
) {
  
  // ... Before Mutation 阶段
  
  commitBeforeMutationEffects(root, finishedWork);
  
  // ... Mutation 阶段
  
  commitMutationEffects(root, finishedWork, lanes);
  
  // 切换 Fiber 树
  root.current = finishedWork;
  
  // ... Layout 阶段
  
  commitLayoutEffects(finishedWork, root, lanes);
  
  // 🔥🔥 调度 useEffect
  const rootDoesHavePassiveEffects = rootHasPassiveEffects;
  
  if (rootDoesHavePassiveEffects) {
    rootDoesHavePassiveEffects = false;
    rootWithPendingPassiveEffects = root;
    pendingPassiveEffectsLanes = lanes;
    
    // 🔥 使用 Scheduler 调度
    scheduleCallback(NormalSchedulerPriority, () => {
      flushPassiveEffects();
      return null;
    });
  }
  
  // ... 其他代码
}


4. flushPassiveEffects - useEffect cleanup 和 create
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ReactFiberWorkLoop.old.js

export function flushPassiveEffects(): boolean {
  if (rootWithPendingPassiveEffects !== null) {
    const root = rootWithPendingPassiveEffects;
    const lanes = pendingPassiveEffectsLanes;
    
    rootWithPendingPassiveEffects = null;
    pendingPassiveEffectsLanes = NoLanes;
    
    // 🔥 Step 1: 执行 cleanup
    commitPassiveUnmountEffects(root.current);
    
    // 🔥 Step 2: 执行 create
    commitPassiveMountEffects(root, root.current, lanes);
    
    return true;
  }
  
  return false;
}


function commitPassiveUnmountEffects(finishedWork: Fiber): void {
  commitPassiveUnmountOnFiber(finishedWork);
}

function commitPassiveUnmountOnFiber(finishedWork: Fiber): void {
  const flags = finishedWork.flags;
  
  switch (finishedWork.tag) {
    case FunctionComponent: {
      recursivelyTraversePassiveUnmountEffects(finishedWork);
      
      if (flags & Passive) {
        // 🔥 执行 useEffect cleanup
        commitHookPassiveUnmountEffects(
          finishedWork,
          HookPassive | HookHasEffect,
        );
      }
      break;
    }
    // ... 其他 case
  }
}


function commitPassiveMountEffects(
  root: FiberRoot,
  finishedWork: Fiber,
  committedLanes: Lanes,
): void {
  commitPassiveMountOnFiber(root, finishedWork, committedLanes);
}

function commitPassiveMountOnFiber(
  finishedRoot: FiberRoot,
  finishedWork: Fiber,
  committedLanes: Lanes,
): void {
  const flags = finishedWork.flags;
  
  switch (finishedWork.tag) {
    case FunctionComponent: {
      recursivelyTraversePassiveMountEffects(
        finishedRoot,
        finishedWork,
        committedLanes,
      );
      
      if (flags & Passive) {
        // 🔥 执行 useEffect create
        commitHookPassiveMountEffects(
          finishedWork,
          HookPassive | HookHasEffect,
        );
      }
      break;
    }
    // ... 其他 case
  }
}


5. Effect Flags
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ReactHookEffectTags.js

export const NoFlags = /*   */ 0b0000;
export const HasEffect = /*  */ 0b0001;

export const Insertion = /*  */ 0b0010;
export const Layout = /*     */ 0b0100;
export const Passive = /*    */ 0b1000;


// 使用示例：

// useLayoutEffect
mountEffectImpl(
  UpdateEffect | LayoutEffect,  // Fiber flags
  HookLayout | HookHasEffect,   // Hook flags
  create,
  deps,
);

// useEffect
mountEffectImpl(
  PassiveEffect | PassiveStaticEffect,  // Fiber flags
  HookPassive | HookHasEffect,          // Hook flags
  create,
  deps,
);


关键源码文件
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. ReactFiberHooks.old.js
   - mountEffect / updateEffect
   - mountLayoutEffect / updateLayoutEffect

2. ReactFiberWorkLoop.old.js
   - commitRootImpl
   - flushPassiveEffects
   - scheduleCallback

3. ReactFiberCommitWork.old.js
   - commitMutationEffects
   - commitLayoutEffects
   - commitHookEffectListUnmount
   - commitHookEffectListMount
   - commitPassiveUnmountEffects
   - commitPassiveMountEffects

4. Scheduler.js
   - scheduleCallback
   - MessageChannel 实现`}
      </pre>
    </div>
  );
}

function CommonMistakes() {
  return (
    <div>
      <h3>常见误区</h3>
      <pre style={{ background: '#f5f5f5', padding: '15px', borderRadius: '5px', overflow: 'auto', fontSize: '13px', lineHeight: '1.8' }}>
{`常见误区和正确理解
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

误区 1：useEffect cleanup 在组件卸载时才执行
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

❌ 错误理解：
useEffect(() => {
  return () => {
    // 只在组件卸载时执行
  };
});

✅ 正确理解：
useEffect(() => {
  return () => {
    // 🔥 在以下情况执行：
    // 1. 组件重新渲染时（依赖变化）
    // 2. 组件卸载时
  };
}, [dep]);

// Cleanup 执行时机：
// 1. 下次渲染时，如果依赖变化，先执行 cleanup，再执行 create
// 2. 组件卸载时，执行 cleanup


误区 2：useLayoutEffect 在 DOM 更新前执行
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

❌ 错误理解：
useLayoutEffect(() => {
  // DOM 还没更新
});

✅ 正确理解：
useLayoutEffect(() => {
  // 🔥 DOM 已经更新
  // 🔥 但浏览器还未渲染
  // 🔥 可以读取新 DOM 的布局
  const height = element.offsetHeight;
});

正确的时间线：
1. useLayoutEffect cleanup → DOM 更新前
2. DOM 操作 → DOM 更新
3. useLayoutEffect create → DOM 更新后，浏览器渲染前


误区 3：useEffect 在下一帧执行
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

❌ 错误理解：
useEffect 在 requestAnimationFrame 中执行

✅ 正确理解：
useEffect 在浏览器渲染后，通过 MessageChannel 宏任务执行

时间线：
1. Commit 阶段
2. JS 线程让出
3. 浏览器渲染（这是"一帧"）
4. MessageChannel 宏任务 → useEffect 执行
5. requestAnimationFrame → 下一帧开始前


误区 4：cleanup 和 create 总是成对执行
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

❌ 错误理解：
每次执行 cleanup 后都会执行 create

✅ 正确理解：
不一定成对执行

情况 1：依赖未变化
useEffect(() => {
  return () => cleanup();
}, [dep]);

// 如果 dep 未变化：
// ❌ 不执行 cleanup
// ❌ 不执行 create

情况 2：组件卸载
useEffect(() => {
  return () => cleanup();
});

// 组件卸载时：
// ✅ 执行 cleanup
// ❌ 不执行 create（组件已卸载）


误区 5：useLayoutEffect 总是比 useEffect 先执行
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ 正确理解：

Create 函数：
✅ useLayoutEffect create 总是比 useEffect create 先执行

Cleanup 函数：
⚠️ 取决于情况

同一次更新中：
1. useLayoutEffect cleanup（Mutation 阶段）
2. useLayoutEffect create（Layout 阶段）
3. 浏览器渲染
4. useEffect cleanup（异步）
5. useEffect create（异步）

但如果快速连续更新：
Update 1:
  - useLayoutEffect cleanup 1
  - useLayoutEffect create 1
  - 渲染
  - useEffect cleanup 1（还未执行）
  
Update 2:
  - useLayoutEffect cleanup 2
  - useLayoutEffect create 2
  - 渲染
  - useEffect cleanup 1（现在执行）
  - useEffect create 1
  - useEffect cleanup 2
  - useEffect create 2


误区 6：可以在 useLayoutEffect 中使用 async/await
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

❌ 错误写法：
useLayoutEffect(async () => {
  const data = await fetch('/api');
  setData(data);
}, []);

问题：
1. async 函数返回 Promise，不是 cleanup 函数
2. await 后的代码不会在 Layout 阶段执行
3. 失去了同步执行的意义

✅ 正确写法：
useLayoutEffect(() => {
  fetch('/api')
    .then(data => setData(data));
}, []);

或者使用 useEffect：
useEffect(async () => {
  const data = await fetch('/api');
  setData(data);
}, []);


误区 7：useEffect cleanup 在 DOM 删除前执行
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

❌ 错误理解：
useEffect(() => {
  return () => {
    // DOM 还在，可以访问
  };
});

✅ 正确理解：

useLayoutEffect cleanup：
✅ 在 DOM 删除前执行
✅ 可以访问要被删除的 DOM

useEffect cleanup：
❌ 在 DOM 删除后执行
❌ 被删除的 DOM 已经不在文档中

示例：

<Parent>
  {show && <Child />}
</Parent>

setShow(false);

执行顺序：
1. Render 阶段
2. Commit - Mutation 阶段
   - Child useLayoutEffect cleanup ✅ 可以访问 DOM
   - 删除 Child 的 DOM
3. Commit - Layout 阶段
4. 浏览器渲染
5. useEffect（宏任务）
   - Child useEffect cleanup ❌ DOM 已被删除


正确的做法：

如果需要在 DOM 删除前访问 DOM，用 useLayoutEffect：

useLayoutEffect(() => {
  return () => {
    // ✅ DOM 还在
    const rect = element.getBoundingClientRect();
    savePosition(rect);
  };
}, []);


误区 8：父子组件的 Effect 执行顺序
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ 正确理解：

Cleanup（父到子）：
1. Parent useLayoutEffect cleanup
2. Child useLayoutEffect cleanup
3. DOM 操作
4. 渲染
5. Parent useEffect cleanup
6. Child useEffect cleanup

Create（子到父）：
1. Child useLayoutEffect create
2. Parent useLayoutEffect create
3. 渲染
4. Child useEffect create
5. Parent useEffect create

记忆方法：
- Cleanup：清理父组件可能依赖子组件，所以先清理父
- Create：父组件副作用可能依赖子组件，所以先创建子`}
      </pre>
    </div>
  );
}

function PracticalExample() {
  const [show, setShow] = useState(true);
  const [logs, setLogs] = useState([]);

  const addLog = (message) => {
    setLogs(prev => [...prev, { time: performance.now().toFixed(2), message }]);
  };

  useEffect(() => {
    addLog('🔵 App useEffect create');
    return () => addLog('🔵 App useEffect cleanup');
  }, [show]);

  useLayoutEffect(() => {
    addLog('🟡 App useLayoutEffect create');
    return () => addLog('🟡 App useLayoutEffect cleanup');
  }, [show]);

  const handleToggle = () => {
    setLogs([]);
    addLog('🔴 Click: setState 触发更新');
    setShow(s => !s);
  };

  return (
    <div>
      <h3>实际示例：观察 Effect 执行顺序</h3>
      
      <div style={{ background: '#e3f2fd', padding: '20px', borderRadius: '5px', marginBottom: '20px' }}>
        <button
          onClick={handleToggle}
          style={{
            padding: '10px 20px',
            background: '#2196f3',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '16px',
            marginRight: '10px'
          }}
        >
          {show ? '隐藏子组件' : '显示子组件'}
        </button>
        
        {show && <ChildComponent addLog={addLog} />}
      </div>

      <div style={{ background: '#f5f5f5', padding: '15px', borderRadius: '5px' }}>
        <h4>执行日志：</h4>
        <div style={{ maxHeight: '400px', overflow: 'auto', fontSize: '13px', fontFamily: 'monospace' }}>
          {logs.map((log, index) => (
            <div key={index} style={{ marginBottom: '5px' }}>
              <span style={{ color: '#666' }}>{log.time}ms</span> - {log.message}
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: '20px', padding: '15px', background: '#fff3e0', borderRadius: '5px' }}>
        <h4>观察要点：</h4>
        <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', lineHeight: '1.8' }}>
          <li>🟡 useLayoutEffect cleanup（父到子）</li>
          <li>🟡 useLayoutEffect create（子到父）</li>
          <li>🔵 useEffect cleanup（父到子，异步）</li>
          <li>🔵 useEffect create（子到父，异步）</li>
        </ul>
      </div>
    </div>
  );
}

function ChildComponent({ addLog }) {
  useEffect(() => {
    addLog('🔵 Child useEffect create');
    return () => addLog('🔵 Child useEffect cleanup');
  });

  useLayoutEffect(() => {
    addLog('🟡 Child useLayoutEffect create');
    return () => addLog('🟡 Child useLayoutEffect cleanup');
  });

  return (
    <div style={{ padding: '15px', background: '#e8f5e9', borderRadius: '5px', marginTop: '10px' }}>
      <h4>Child Component</h4>
      <p>观察父子组件的 Effect 执行顺序</p>
    </div>
  );
}
