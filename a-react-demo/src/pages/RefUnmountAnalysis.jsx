import React, { useState, useRef, useEffect, createRef, useCallback } from 'react';

/**
 * ref 什么情况会卸载旧 ref？如果 Fiber 复用了还会卸载吗？
 * 
 * 核心问题：
 * 1. ref 何时会被卸载（detach）
 * 2. Fiber 复用时 ref 的处理
 * 3. ref 变化的判断逻辑
 * 4. 不同类型 ref 的卸载行为
 */

export default function RefUnmountAnalysis() {
  const [expandedSection, setExpandedSection] = useState(null);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '1400px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', color: '#61dafb' }}>⚛️ Ref 卸载时机分析</h1>
      
      <Section
        title="✅ 核心答案"
        id="answer"
        expanded={expandedSection === 'answer'}
        onToggle={() => setExpandedSection(expandedSection === 'answer' ? null : 'answer')}
      >
        <CoreAnswer />
      </Section>

      <Section
        title="🔍 源码分析"
        id="source"
        expanded={expandedSection === 'source'}
        onToggle={() => setExpandedSection(expandedSection === 'source' ? null : 'source')}
      >
        <SourceCode />
      </Section>

      <Section
        title="🔄 Fiber 复用场景"
        id="reuse"
        expanded={expandedSection === 'reuse'}
        onToggle={() => setExpandedSection(expandedSection === 'reuse' ? null : 'reuse')}
      >
        <FiberReuseScenarios />
      </Section>

      <Section
        title="🎯 实时演示"
        id="demo"
        expanded={expandedSection === 'demo'}
        onToggle={() => setExpandedSection(expandedSection === 'demo' ? null : 'demo')}
      >
        <LiveDemo />
      </Section>

      <Section
        title="💡 深入理解"
        id="deep"
        expanded={expandedSection === 'deep'}
        onToggle={() => setExpandedSection(expandedSection === 'deep' ? null : 'deep')}
      >
        <DeepUnderstanding />
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
{`Ref 卸载时机
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

核心答案：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ref 会在以下情况卸载旧 ref：

1. ✅ 组件卸载（Fiber 被删除）
2. ✅ ref 属性变化（不同的 ref 对象/函数）
3. ✅ 组件类型变化（key 相同但 type 不同）
4. ❌ Fiber 复用且 ref 未变化 → 不会卸载


Fiber 复用时：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

如果 Fiber 复用了：
  - 检查 current.ref === workInProgress.ref
  - 如果 ref 相同 → 不卸载，不重新挂载
  - 如果 ref 不同 → 先卸载旧 ref，再挂载新 ref


关键标记：Ref flag
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ReactFiberBeginWork.old.js (line ~250)

function markRef(current: Fiber | null, workInProgress: Fiber) {
  const ref = workInProgress.ref;
  
  if (
    // 🔥 情况 1：首次挂载（有 ref）
    (current === null && ref !== null) ||
    // 🔥 情况 2：ref 变化了
    (current !== null && current.ref !== ref)
  ) {
    // 🔥 标记 Ref flag
    workInProgress.flags |= Ref;
  }
}

解读：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

情况 1：首次挂载
  current === null && ref !== null
  → 标记 Ref flag
  → commit 阶段挂载 ref

情况 2：ref 变化
  current !== null && current.ref !== ref
  → 标记 Ref flag
  → commit 阶段：
    1. 先卸载旧 ref（commitDetachRef）
    2. 再挂载新 ref（commitAttachRef）

情况 3：Fiber 复用且 ref 未变
  current !== null && current.ref === ref
  → 不标记 Ref flag
  → 🔥 不卸载，不重新挂载
  → ref 保持原样


卸载时机（Commit 阶段）：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Mutation 阶段 - commitMutationEffects
   - 处理 Deletion（删除节点）
   - 调用 commitDetachRef 卸载 ref

2. Layout 阶段 - commitLayoutEffects
   - 如果有 Ref flag
   - 先卸载旧 ref（如果存在）
   - 再挂载新 ref


完整流程：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

场景 1：组件卸载
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function Parent() {
  const [show, setShow] = useState(true);
  return show ? <Child ref={myRef} /> : null;
}

流程：
  setShow(false)
  ↓
  Render 阶段：
    标记 Child Fiber 为 Deletion
  ↓
  Commit 阶段（Mutation）：
    🔥 commitDetachRef(child)
    删除 DOM
  ↓
  结果：ref.current = null


场景 2：ref 变化（Fiber 复用）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function Parent() {
  const ref1 = useRef();
  const ref2 = useRef();
  const [useFirst, setUseFirst] = useState(true);
  
  return <Child ref={useFirst ? ref1 : ref2} />;
}

流程：
  setUseFirst(false)
  ↓
  Render 阶段：
    🔥 Fiber 复用（key 相同，type 相同）
    markRef(current, workInProgress)
      current.ref = ref1
      workInProgress.ref = ref2
      ref1 !== ref2  🔥 不同！
      → 标记 Ref flag
  ↓
  Commit 阶段（Layout）：
    🔥 commitDetachRef(current)  // ref1.current = null
    🔥 commitAttachRef(workInProgress)  // ref2.current = DOM
  ↓
  结果：
    ref1.current = null
    ref2.current = <div> DOM


场景 3：ref 未变（Fiber 复用）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function Parent() {
  const ref = useRef();
  const [count, setCount] = useState(0);
  
  return <Child ref={ref} count={count} />;
}

流程：
  setCount(1)
  ↓
  Render 阶段：
    🔥 Fiber 复用（key 相同，type 相同）
    markRef(current, workInProgress)
      current.ref = ref
      workInProgress.ref = ref
      ref === ref  🔥 相同！
      → 🔥 不标记 Ref flag
  ↓
  Commit 阶段：
    🔥 不处理 ref（没有 Ref flag）
  ↓
  结果：
    ref.current 保持不变（仍然是 DOM）


关键结论：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔥 Fiber 复用 + ref 未变 = 不卸载不挂载
🔥 Fiber 复用 + ref 变化 = 先卸载后挂载
🔥 Fiber 删除 = 必然卸载 ref
🔥 ref 比较用的是引用相等（===）`}
      </pre>
    </div>
  );
}

function SourceCode() {
  return (
    <div>
      <pre style={{ background: '#f5f5f5', padding: '15px', borderRadius: '5px', overflow: 'auto', fontSize: '13px', lineHeight: '1.8' }}>
{`源码验证
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. markRef - 判断是否需要更新 ref
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ReactFiberBeginWork.old.js (line ~250)

function markRef(current: Fiber | null, workInProgress: Fiber) {
  const ref = workInProgress.ref;
  
  if (
    // 🔥 条件 1：首次挂载且有 ref
    (current === null && ref !== null) ||
    // 🔥 条件 2：ref 变化了
    (current !== null && current.ref !== ref)
  ) {
    // 🔥 标记 Ref flag
    workInProgress.flags |= Ref;
  }
}

// 🔥 在 beginWork 中调用
function updateHostComponent(current, workInProgress, renderLanes) {
  // ... 其他逻辑
  
  // 🔥 标记 ref
  markRef(current, workInProgress);
  
  reconcileChildren(current, workInProgress, nextChildren, renderLanes);
  return workInProgress.child;
}


条件 1 详解：current === null && ref !== null
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

场景：首次挂载
  <div ref={myRef} />

判断：
  current = null（首次渲染，没有 current）
  ref = myRef（有 ref）
  ↓
  current === null ✅
  ref !== null ✅
  ↓
  标记 Ref flag


条件 2 详解：current !== null && current.ref !== ref
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

场景 A：ref 从 ref1 变为 ref2
  <div ref={useFirst ? ref1 : ref2} />

判断：
  current.ref = ref1（旧 ref）
  workInProgress.ref = ref2（新 ref）
  ↓
  current !== null ✅
  current.ref !== ref ✅（ref1 !== ref2）
  ↓
  标记 Ref flag

场景 B：ref 从有变为无
  <div ref={hasRef ? myRef : null} />

判断：
  current.ref = myRef（旧 ref）
  workInProgress.ref = null（新 ref）
  ↓
  current !== null ✅
  current.ref !== ref ✅（myRef !== null）
  ↓
  标记 Ref flag

场景 C：ref 从无变为有
  <div ref={hasRef ? myRef : null} />

判断：
  current.ref = null（旧 ref）
  workInProgress.ref = myRef（新 ref）
  ↓
  current !== null ✅
  current.ref !== ref ✅（null !== myRef）
  ↓
  标记 Ref flag

场景 D：🔥 ref 未变（Fiber 复用）
  const ref = useRef();
  <div ref={ref} />

判断：
  current.ref = ref（旧 ref）
  workInProgress.ref = ref（新 ref，同一个对象）
  ↓
  current !== null ✅
  current.ref !== ref ❌（ref === ref）
  ↓
  🔥 不标记 Ref flag
  🔥 不会卸载和重新挂载


2. commitDetachRef - 卸载 ref
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ReactFiberCommitWork.old.js (line ~1900)

function commitDetachRef(current: Fiber) {
  const currentRef = current.ref;
  
  if (currentRef !== null) {
    if (typeof currentRef === 'function') {
      // 🔥 回调 ref：调用函数，传入 null
      currentRef(null);
    } else {
      // 🔥 对象 ref：设置 current 为 null
      currentRef.current = null;
    }
  }
}


3. commitAttachRef - 挂载 ref
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ReactFiberCommitWork.old.js (line ~1920)

function commitAttachRef(finishedWork: Fiber) {
  const ref = finishedWork.ref;
  
  if (ref !== null) {
    // 🔥 获取 DOM 或组件实例
    const instance = finishedWork.stateNode;
    let instanceToUse;
    
    switch (finishedWork.tag) {
      case HostComponent:
        // 🔥 原生 DOM 元素
        instanceToUse = getPublicInstance(instance);
        break;
      default:
        // 🔥 类组件实例
        instanceToUse = instance;
    }
    
    if (typeof ref === 'function') {
      // 🔥 回调 ref：调用函数，传入实例
      ref(instanceToUse);
    } else {
      // 🔥 对象 ref：设置 current
      ref.current = instanceToUse;
    }
  }
}


4. Commit 阶段处理 ref
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ReactFiberWorkLoop.old.js

function commitRootImpl(root, renderLanes) {
  // ... 准备工作
  
  // ━━━━ Mutation 阶段 ━━━━
  commitMutationEffects(root, finishedWork, lanes);
  // 在这里处理 Deletion，会卸载 ref
  
  // ━━━━ Layout 阶段 ━━━━
  commitLayoutEffects(finishedWork, root, lanes);
  // 在这里处理 Ref flag，挂载/更新 ref
}


Mutation 阶段处理删除：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ReactFiberCommitWork.old.js

function commitDeletion(
  finishedRoot,
  current,
  renderPriorityLevel,
) {
  // 🔥 卸载子树中的所有 ref
  unmountHostComponents(finishedRoot, current, renderPriorityLevel);
}

function unmountHostComponents(
  finishedRoot,
  current,
  renderPriorityLevel,
) {
  let node = current;
  
  while (true) {
    // 🔥 对每个节点
    if (node.tag === HostComponent || node.tag === HostText) {
      // ... 处理 DOM
    } else if (
      node.tag === ClassComponent ||
      node.tag === FunctionComponent
    ) {
      // 🔥 卸载 ref
      safelyDetachRef(node, current);
    }
    
    // 遍历子树...
  }
}

function safelyDetachRef(current: Fiber, nearestMountedAncestor: Fiber) {
  const ref = current.ref;
  if (ref !== null) {
    // 🔥 调用 commitDetachRef
    commitDetachRef(current);
  }
}


Layout 阶段处理 Ref flag：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ReactFiberCommitWork.old.js

function commitLayoutEffectOnFiber(
  finishedRoot,
  current,
  finishedWork,
  committedLanes,
) {
  const flags = finishedWork.flags;
  
  // 🔥 如果有 Ref flag
  if (flags & Ref) {
    // 🔥 先卸载旧 ref（如果存在）
    if (current !== null && current.ref !== null) {
      commitDetachRef(current);
    }
    
    // 🔥 再挂载新 ref
    commitAttachRef(finishedWork);
  }
}


完整时间线：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

场景：ref 变化（ref1 → ref2）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Render 阶段：
  beginWork(<div> Fiber)
    ↓
  markRef(current, workInProgress)
    current.ref = ref1
    workInProgress.ref = ref2
    ref1 !== ref2  🔥 不同
    ↓
  workInProgress.flags |= Ref  🔥 标记
    ↓
  completeWork()

Commit 阶段：
  commitMutationEffects()
    更新 DOM
    ↓
  commitLayoutEffects()
    检查 Ref flag ✅
    ↓
    commitDetachRef(current)
      ref1(null) 或 ref1.current = null  🔥 卸载旧 ref
    ↓
    commitAttachRef(workInProgress)
      ref2(dom) 或 ref2.current = dom  🔥 挂载新 ref


场景：Fiber 复用，ref 未变
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Render 阶段：
  beginWork(<div> Fiber)
    ↓
  markRef(current, workInProgress)
    current.ref = ref
    workInProgress.ref = ref
    ref === ref  🔥 相同
    ↓
  🔥 不标记 Ref flag
    ↓
  completeWork()

Commit 阶段：
  commitMutationEffects()
    更新 DOM（如果有其他变化）
    ↓
  commitLayoutEffects()
    检查 Ref flag ❌ 没有
    ↓
  🔥 不处理 ref
  🔥 ref.current 保持不变


关键代码总结：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

判断是否需要更新 ref：
  current.ref !== workInProgress.ref

卸载 ref：
  if (typeof ref === 'function') {
    ref(null);
  } else {
    ref.current = null;
  }

挂载 ref：
  if (typeof ref === 'function') {
    ref(instance);
  } else {
    ref.current = instance;
  }


对比：Object ref vs Callback ref
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Object ref:
  const ref = useRef();
  <div ref={ref} />
  
  卸载：ref.current = null
  挂载：ref.current = dom

Callback ref:
  const ref = (node) => { ... };
  <div ref={ref} />
  
  卸载：ref(null)
  挂载：ref(dom)

🔥 行为一致，只是 API 不同`}
      </pre>
    </div>
  );
}

function FiberReuseScenarios() {
  return (
    <div>
      <pre style={{ background: '#f5f5f5', padding: '15px', borderRadius: '5px', overflow: 'auto', fontSize: '13px', lineHeight: '1.8' }}>
{`Fiber 复用场景分析
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

什么是 Fiber 复用？
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Fiber 复用条件（Diff 算法）：
  1. key 相同
  2. type 相同

如果满足，React 会复用 current Fiber：
  workInProgress = createWorkInProgress(current, pendingProps);


场景 1：Props 变化，ref 未变
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function Parent() {
  const ref = useRef();
  const [count, setCount] = useState(0);
  
  // 🔥 ref 是同一个对象
  return <Child ref={ref} count={count} />;
}

第一次渲染：
  current = null
  workInProgress.ref = ref
  ↓
  markRef(null, workInProgress)
    current === null ✅
    ref !== null ✅
    ↓
  标记 Ref flag
  ↓
  commitAttachRef: ref.current = dom

第二次渲染（setCount(1)）：
  current.ref = ref（旧的）
  workInProgress.ref = ref（新的，同一个对象）
  ↓
  🔥 Fiber 复用（key 相同，type 相同）
  ↓
  markRef(current, workInProgress)
    current !== null ✅
    current.ref !== ref ❌（ref === ref）
    ↓
  🔥 不标记 Ref flag
  ↓
  🔥 Commit 阶段不处理 ref
  🔥 ref.current 保持不变

结论：
  ✅ Fiber 复用
  ✅ ref 未变
  ❌ 不卸载
  ❌ 不重新挂载
  ✅ ref.current 保持指向同一个 DOM


场景 2：ref 变化（切换 ref）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function Parent() {
  const ref1 = useRef();
  const ref2 = useRef();
  const [useFirst, setUseFirst] = useState(true);
  
  // 🔥 ref 在 ref1 和 ref2 之间切换
  return <Child ref={useFirst ? ref1 : ref2} />;
}

第一次渲染：
  workInProgress.ref = ref1
  ↓
  commitAttachRef: ref1.current = dom

第二次渲染（setUseFirst(false)）：
  current.ref = ref1（旧的）
  workInProgress.ref = ref2（新的）
  ↓
  🔥 Fiber 复用（key 相同，type 相同）
  ↓
  markRef(current, workInProgress)
    current !== null ✅
    current.ref !== ref ✅（ref1 !== ref2）
    ↓
  标记 Ref flag
  ↓
  commitLayoutEffects:
    commitDetachRef(current): ref1.current = null  🔥 卸载旧 ref
    commitAttachRef(workInProgress): ref2.current = dom  🔥 挂载新 ref

结论：
  ✅ Fiber 复用
  ✅ ref 变化
  ✅ 先卸载旧 ref
  ✅ 再挂载新 ref


场景 3：ref 从有变为无
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function Parent() {
  const ref = useRef();
  const [hasRef, setHasRef] = useState(true);
  
  return <Child ref={hasRef ? ref : null} />;
}

第一次渲染：
  workInProgress.ref = ref
  ↓
  commitAttachRef: ref.current = dom

第二次渲染（setHasRef(false)）：
  current.ref = ref（旧的）
  workInProgress.ref = null（新的）
  ↓
  🔥 Fiber 复用
  ↓
  markRef(current, workInProgress)
    current !== null ✅
    current.ref !== ref ✅（ref !== null）
    ↓
  标记 Ref flag
  ↓
  commitLayoutEffects:
    commitDetachRef(current): ref.current = null  🔥 卸载
    commitAttachRef(workInProgress): 不执行（ref 为 null）

结论：
  ✅ Fiber 复用
  ✅ ref 变为 null
  ✅ 卸载旧 ref
  ❌ 不挂载新 ref


场景 4：ref 从无变为有
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function Parent() {
  const ref = useRef();
  const [hasRef, setHasRef] = useState(false);
  
  return <Child ref={hasRef ? ref : null} />;
}

第一次渲染：
  workInProgress.ref = null
  ↓
  不标记 Ref flag
  ↓
  不处理 ref

第二次渲染（setHasRef(true)）：
  current.ref = null（旧的）
  workInProgress.ref = ref（新的）
  ↓
  🔥 Fiber 复用
  ↓
  markRef(current, workInProgress)
    current !== null ✅
    current.ref !== ref ✅（null !== ref）
    ↓
  标记 Ref flag
  ↓
  commitLayoutEffects:
    commitDetachRef(current): 不执行（current.ref 为 null）
    commitAttachRef(workInProgress): ref.current = dom  🔥 挂载

结论：
  ✅ Fiber 复用
  ✅ ref 从 null 变为有值
  ❌ 不卸载（没有旧 ref）
  ✅ 挂载新 ref


场景 5：回调 ref 每次都是新函数
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

❌ 问题代码：
function Parent() {
  const [count, setCount] = useState(0);
  
  // 🔥 每次 render 都创建新函数
  return <Child ref={(node) => console.log(node)} count={count} />;
}

第一次渲染：
  workInProgress.ref = function1
  ↓
  commitAttachRef: function1(dom)

第二次渲染（setCount(1)）：
  current.ref = function1（旧函数）
  workInProgress.ref = function2（新函数，每次 render 创建）
  ↓
  🔥 Fiber 复用
  ↓
  markRef(current, workInProgress)
    current !== null ✅
    current.ref !== ref ✅（function1 !== function2）
    ↓
  标记 Ref flag
  ↓
  commitLayoutEffects:
    commitDetachRef: function1(null)  🔥 卸载
    commitAttachRef: function2(dom)   🔥 重新挂载

问题：
  - 每次 render 都创建新函数
  - React 认为 ref 变化了
  - 每次都卸载和重新挂载
  - 性能浪费

✅ 解决方案 1：useCallback
function Parent() {
  const [count, setCount] = useState(0);
  
  // 🔥 缓存函数引用
  const handleRef = useCallback((node) => {
    console.log(node);
  }, []);
  
  return <Child ref={handleRef} count={count} />;
}

结果：
  - handleRef 引用稳定
  - ref 不会每次都变化
  - 不会重复卸载和挂载

✅ 解决方案 2：useRef
function Parent() {
  const [count, setCount] = useState(0);
  const ref = useRef();
  
  return <Child ref={ref} count={count} />;
}

结果：
  - ref 对象引用稳定
  - 永远不会卸载和重新挂载（除非组件卸载）


场景 6：条件渲染（key 相同）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function Parent() {
  const ref = useRef();
  const [type, setType] = useState('A');
  
  return type === 'A' 
    ? <ComponentA ref={ref} /> 
    : <ComponentB ref={ref} />;
}

第一次渲染：
  <ComponentA ref={ref} />
  workInProgress.ref = ref
  ↓
  commitAttachRef: ref.current = componentA实例

第二次渲染（setType('B')）：
  <ComponentB ref={ref} />
  ↓
  🔥 type 不同（ComponentA !== ComponentB）
  🔥 不能复用 Fiber
  ↓
  删除 ComponentA Fiber
    commitDetachRef: ref.current = null  🔥 卸载
  ↓
  创建 ComponentB Fiber
    commitAttachRef: ref.current = componentB实例  🔥 挂载

结论：
  ❌ Fiber 不复用（type 不同）
  ✅ 必然卸载旧 ref
  ✅ 挂载新 ref


总结对比表：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

场景                    Fiber复用  ref变化  卸载  挂载
──────────────────────────────────────────────────
Props 变化，ref 未变    ✅         ❌       ❌    ❌
ref 切换（ref1→ref2）   ✅         ✅       ✅    ✅
ref 从有变为无          ✅         ✅       ✅    ❌
ref 从无变为有          ✅         ✅       ❌    ✅
回调 ref 新函数         ✅         ✅       ✅    ✅
组件 type 变化          ❌         N/A      ✅    ✅
组件卸载                ❌         N/A      ✅    ❌


关键结论：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔥 Fiber 复用 + ref 引用相同 = 不做任何处理
🔥 Fiber 复用 + ref 引用不同 = 先卸载后挂载
🔥 Fiber 不复用 = 必然处理 ref（卸载或挂载）
🔥 判断 ref 是否变化用的是 ===（引用相等）`}
      </pre>
    </div>
  );
}

function LiveDemo() {
  const [scenario, setScenario] = useState('stable');
  const [logs, setLogs] = useState([]);
  const [count, setCount] = useState(0);

  const addLog = (message) => {
    setLogs(prev => [...prev, `${Date.now()}: ${message}`]);
  };

  // 场景 1：稳定的 ref（Fiber 复用，ref 未变）
  const stableRef = useRef();
  useEffect(() => {
    if (scenario === 'stable' && stableRef.current) {
      addLog('✅ stableRef 挂载完成');
    }
  }, [scenario, count]);

  // 场景 2：切换的 ref
  const ref1 = useRef();
  const ref2 = useRef();
  const [useFirst, setUseFirst] = useState(true);

  useEffect(() => {
    if (scenario === 'switch') {
      addLog(`🔄 当前使用: ${useFirst ? 'ref1' : 'ref2'}`);
    }
  }, [scenario, useFirst]);

  // 场景 3：回调 ref（每次新函数 - 错误示例）
  const badCallbackRef = (node) => {
    if (node) {
      addLog('⚠️ badCallbackRef 挂载（新函数）');
    } else {
      addLog('⚠️ badCallbackRef 卸载');
    }
  };

  // 场景 4：稳定的回调 ref（使用 useCallback）
  const goodCallbackRef = useCallback((node) => {
    if (node) {
      addLog('✅ goodCallbackRef 挂载（缓存函数）');
    } else {
      addLog('✅ goodCallbackRef 卸载');
    }
  }, []);

  const clearLogs = () => setLogs([]);

  return (
    <div style={{ padding: '20px', background: '#f9f9f9', borderRadius: '8px' }}>
      <h3>实时演示：Ref 卸载时机</h3>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ marginRight: '10px', fontWeight: 'bold' }}>选择场景：</label>
        <select 
          value={scenario} 
          onChange={(e) => {
            clearLogs();
            setScenario(e.target.value);
          }}
          style={{ padding: '8px', fontSize: '14px', marginRight: '10px' }}
        >
          <option value="stable">场景1: Fiber复用 + ref未变</option>
          <option value="switch">场景2: Fiber复用 + ref切换</option>
          <option value="bad-callback">场景3: 回调ref新函数（错误）</option>
          <option value="good-callback">场景4: 回调ref缓存（正确）</option>
        </select>
        <button onClick={clearLogs} style={{ padding: '8px 15px' }}>清空日志</button>
      </div>

      {scenario === 'stable' && (
        <div style={{ padding: '15px', background: '#fff', borderRadius: '5px', marginBottom: '20px' }}>
          <h4>场景1: Fiber 复用 + ref 未变</h4>
          <div ref={stableRef} style={{ padding: '10px', background: '#e3f2fd', marginBottom: '10px' }}>
            DOM 元素 (count: {count})
          </div>
          <button onClick={() => setCount(c => c + 1)} style={{ padding: '8px 15px' }}>
            更新 Count（触发重渲染）
          </button>
          <p style={{ fontSize: '13px', color: '#666', marginTop: '10px' }}>
            💡 ref 是同一个对象，Fiber 复用，不会卸载和重新挂载
          </p>
        </div>
      )}

      {scenario === 'switch' && (
        <div style={{ padding: '15px', background: '#fff', borderRadius: '5px', marginBottom: '20px' }}>
          <h4>场景2: Fiber 复用 + ref 切换</h4>
          <div ref={useFirst ? ref1 : ref2} style={{ padding: '10px', background: '#e3f2fd', marginBottom: '10px' }}>
            DOM 元素 (使用 {useFirst ? 'ref1' : 'ref2'})
          </div>
          <button onClick={() => setUseFirst(f => !f)} style={{ padding: '8px 15px' }}>
            切换 Ref
          </button>
          <p style={{ fontSize: '13px', color: '#666', marginTop: '10px' }}>
            💡 ref 对象变化，会先卸载旧 ref，再挂载新 ref
          </p>
          <div style={{ marginTop: '10px', fontSize: '13px' }}>
            <p>ref1.current: {ref1.current ? '✅ 有值' : '❌ null'}</p>
            <p>ref2.current: {ref2.current ? '✅ 有值' : '❌ null'}</p>
          </div>
        </div>
      )}

      {scenario === 'bad-callback' && (
        <div style={{ padding: '15px', background: '#fff', borderRadius: '5px', marginBottom: '20px' }}>
          <h4>场景3: 回调 ref 新函数（❌ 错误示例）</h4>
          <div ref={badCallbackRef} style={{ padding: '10px', background: '#ffebee', marginBottom: '10px' }}>
            DOM 元素 (count: {count})
          </div>
          <button onClick={() => setCount(c => c + 1)} style={{ padding: '8px 15px' }}>
            更新 Count（触发重渲染）
          </button>
          <p style={{ fontSize: '13px', color: '#d32f2f', marginTop: '10px' }}>
            ⚠️ 每次 render 都创建新函数，导致每次都卸载和重新挂载
          </p>
        </div>
      )}

      {scenario === 'good-callback' && (
        <div style={{ padding: '15px', background: '#fff', borderRadius: '5px', marginBottom: '20px' }}>
          <h4>场景4: 回调 ref 缓存（✅ 正确示例）</h4>
          <div ref={goodCallbackRef} style={{ padding: '10px', background: '#e8f5e9', marginBottom: '10px' }}>
            DOM 元素 (count: {count})
          </div>
          <button onClick={() => setCount(c => c + 1)} style={{ padding: '8px 15px' }}>
            更新 Count（触发重渲染）
          </button>
          <p style={{ fontSize: '13px', color: '#2e7d32', marginTop: '10px' }}>
            ✅ 使用 useCallback 缓存函数，ref 不变，不会重复挂载
          </p>
        </div>
      )}

      <div style={{ background: '#fff', padding: '15px', borderRadius: '5px' }}>
        <h4>执行日志:</h4>
        <pre style={{ 
          fontSize: '12px', 
          maxHeight: '300px', 
          overflow: 'auto',
          background: '#f5f5f5',
          padding: '10px',
          borderRadius: '4px'
        }}>
          {logs.length === 0 ? '执行操作查看日志' : logs.join('\n')}
        </pre>
      </div>
    </div>
  );
}

function DeepUnderstanding() {
  return (
    <div>
      <pre style={{ background: '#f5f5f5', padding: '15px', borderRadius: '5px', overflow: 'auto', fontSize: '13px', lineHeight: '1.8' }}>
{`深入理解
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

为什么 Fiber 复用时检查 ref？
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

原因 1：性能优化
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

如果 ref 没变，不需要：
  - 调用回调 ref（避免不必要的函数调用）
  - 更新 ref.current（避免不必要的赋值）
  - 触发依赖 ref 的副作用

示例：
function MyComponent() {
  const ref = useRef();
  
  useEffect(() => {
    // 🔥 如果 ref.current 没变，这个 effect 不应该重新执行
    if (ref.current) {
      const observer = new IntersectionObserver(...);
      observer.observe(ref.current);
      return () => observer.disconnect();
    }
  }, [ref.current]);  // 依赖 ref.current
  
  return <div ref={ref} />;
}


原因 2：避免副作用
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

回调 ref 可能有副作用：
function MyComponent() {
  const handleRef = useCallback((node) => {
    if (node) {
      // 🔥 可能很昂贵的操作
      setupComplexInteraction(node);
      subscribeToResize(node);
      initializeThirdPartyLib(node);
    } else {
      // 🔥 清理操作
      cleanupEverything();
    }
  }, []);
  
  return <div ref={handleRef} />;
}

如果每次 render 都执行：
  - 性能浪费
  - 可能导致内存泄漏
  - 可能导致状态不一致


ref 比较的细节：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

使用 === 比较（引用相等）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

current.ref === workInProgress.ref

对象 ref：
  const ref1 = useRef();
  const ref2 = useRef();
  
  ref1 === ref1  // true（同一个对象）
  ref1 === ref2  // false（不同对象）

回调 ref：
  const fn1 = () => {};
  const fn2 = () => {};
  
  fn1 === fn1  // true（同一个函数）
  fn1 === fn2  // false（不同函数）
  
  // 🔥 每次 render 创建的新函数
  () => {} === () => {}  // false


常见陷阱：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

陷阱 1：内联回调 ref
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

❌ 问题：
function MyComponent() {
  const [count, setCount] = useState(0);
  
  // 🔥 每次 render 创建新函数
  return (
    <div>
      <input ref={(node) => {
        if (node) node.focus();  // 🔥 每次都执行
      }} />
      <button onClick={() => setCount(c => c + 1)}>Count: {count}</button>
    </div>
  );
}

问题：
  - 点击按钮 → 重新渲染
  - 创建新的回调函数
  - React 认为 ref 变了
  - 先调用旧函数(null)
  - 再调用新函数(input)
  - input 每次都重新 focus

✅ 解决：
function MyComponent() {
  const [count, setCount] = useState(0);
  
  // 🔥 使用 useCallback 缓存
  const handleRef = useCallback((node) => {
    if (node) node.focus();
  }, []);
  
  return (
    <div>
      <input ref={handleRef} />
      <button onClick={() => setCount(c => c + 1)}>Count: {count}</button>
    </div>
  );
}


陷阱 2：条件 ref
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

❌ 问题：
function MyComponent() {
  const ref1 = useRef();
  const ref2 = useRef();
  const [condition, setCondition] = useState(true);
  
  // 🔥 条件切换导致 ref 变化
  return <div ref={condition ? ref1 : ref2} />;
}

行为：
  - condition 从 true → false
  - ref1 → ref2
  - ref1.current = null（卸载）
  - ref2.current = div（挂载）

如果不想卸载：
✅ 方案 1：始终使用同一个 ref
function MyComponent() {
  const ref = useRef();
  
  return <div ref={ref} />;
}

✅ 方案 2：使用回调 ref 手动管理
function MyComponent() {
  const ref1 = useRef();
  const ref2 = useRef();
  const [condition, setCondition] = useState(true);
  
  const handleRef = useCallback((node) => {
    // 🔥 手动同时更新两个 ref
    ref1.current = node;
    ref2.current = node;
  }, []);
  
  return <div ref={handleRef} />;
}


陷阱 3：闭包陷阱
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

❌ 问题：
function MyComponent() {
  const [count, setCount] = useState(0);
  
  // 🔥 依赖 count，但没有在依赖数组中声明
  const handleRef = useCallback((node) => {
    if (node) {
      console.log(count);  // 🔥 总是 0（闭包陷阱）
    }
  }, []);  // 🔥 空依赖
  
  return (
    <div>
      <div ref={handleRef}>Element</div>
      <button onClick={() => setCount(c => c + 1)}>Count: {count}</button>
    </div>
  );
}

问题：
  - handleRef 只在首次创建
  - 闭包捕获的 count = 0
  - 即使 count 变化，handleRef 中的 count 仍然是 0

✅ 解决：
方案 1：添加依赖
const handleRef = useCallback((node) => {
  if (node) {
    console.log(count);
  }
}, [count]);  // 🔥 添加依赖

问题：count 每次变化都会重新挂载 ref

方案 2：使用 ref 存储最新值
const countRef = useRef(count);
countRef.current = count;

const handleRef = useCallback((node) => {
  if (node) {
    console.log(countRef.current);  // 🔥 总是最新值
  }
}, []);


特殊情况：forwardRef
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const Child = forwardRef((props, ref) => {
  return <div ref={ref}>Child</div>;
});

function Parent() {
  const ref = useRef();
  const [count, setCount] = useState(0);
  
  return <Child ref={ref} count={count} />;
}

行为：
  - ref 通过 forwardRef 传递
  - 和普通 ref 一样，引用相等就不会卸载
  - count 变化不影响 ref


useImperativeHandle 的影响：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const Child = forwardRef((props, ref) => {
  const inputRef = useRef();
  
  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current.focus(),
    blur: () => inputRef.current.blur(),
  }), []);  // 🔥 依赖为空
  
  return <input ref={inputRef} />;
});

function Parent() {
  const ref = useRef();
  const [count, setCount] = useState(0);
  
  return <Child ref={ref} count={count} />;
}

行为：
  - useImperativeHandle 创建自定义 ref 值
  - 依赖为空，只在首次创建
  - count 变化不会重新创建 ref 值
  - ref.current 保持不变


DOM 更新和 ref 的关系：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

关键问题：DOM 更新了，ref 需要更新吗？
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

答案：不需要

原因：
  - ref.current 指向的是 DOM 节点对象
  - DOM 节点更新是原地更新（修改属性、内容）
  - 对象引用不变
  - ref.current 不需要更新

示例：
function MyComponent() {
  const ref = useRef();
  const [text, setText] = useState('Hello');
  
  return <div ref={ref}>{text}</div>;
}

流程：
  第一次渲染：
    ref.current = <div>Hello</div>（DOM 对象）
  
  setText('World')：
    DOM 更新：div.textContent = 'World'
    🔥 对象引用不变
    🔥 ref.current 仍然指向同一个 div
    🔥 不需要更新 ref

特殊情况：
  - 如果元素类型变化（div → span）
  - 会创建新的 DOM 节点
  - ref 需要更新
  - 但这会创建新的 Fiber（type 不同）
  - 不是 Fiber 复用的情况


总结：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔥 Fiber 复用 + ref 相同 = 不处理 ref
🔥 ref 相同 = 引用相等（===）
🔥 回调 ref 容易创建新函数，需要 useCallback
🔥 DOM 更新不影响 ref（对象引用不变）
🔥 只有 ref 引用变化才会卸载重新挂载`}
      </pre>
    </div>
  );
}

function InterviewPoints() {
  return (
    <div>
      <pre style={{ background: '#f5f5f5', padding: '15px', borderRadius: '5px', overflow: 'auto', fontSize: '13px', lineHeight: '1.8' }}>
{`面试要点总结
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Q1: ref 什么情况会卸载？
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

A: 三种情况

1. 组件卸载（Fiber 删除）
2. ref 属性变化（不同的 ref 对象/函数）
3. 组件类型变化（type 不同）

源码：
function markRef(current, workInProgress) {
  const ref = workInProgress.ref;
  
  if (
    (current === null && ref !== null) ||
    (current !== null && current.ref !== ref)
  ) {
    workInProgress.flags |= Ref;
  }
}


Q2: Fiber 复用了还会卸载 ref 吗？
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

A: 取决于 ref 是否变化

Fiber 复用 + ref 未变：
  - 不标记 Ref flag
  - 不卸载
  - 不重新挂载
  - ref.current 保持不变

Fiber 复用 + ref 变化：
  - 标记 Ref flag
  - 先卸载旧 ref
  - 再挂载新 ref

判断条件：
  current.ref === workInProgress.ref


Q3: 如何判断 ref 是否变化？
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

A: 使用 === 比较（引用相等）

对象 ref：
  const ref = useRef();
  
  // 每次 render，ref 是同一个对象
  // ref === ref → true
  // 不会卸载

回调 ref：
  // ❌ 每次 render 创建新函数
  <div ref={(node) => { ... }} />
  
  // fn1 !== fn2 → true
  // 会卸载重新挂载
  
  // ✅ 使用 useCallback 缓存
  const handleRef = useCallback((node) => { ... }, []);
  <div ref={handleRef} />


Q4: 为什么回调 ref 容易出问题？
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

A: 每次创建新函数，引用变化

问题代码：
function MyComponent() {
  const [count, setCount] = useState(0);
  
  // 🔥 每次 render 创建新函数
  return (
    <div>
      <input ref={(node) => {
        if (node) node.focus();
      }} />
      <button onClick={() => setCount(c => c + 1)}>
        {count}
      </button>
    </div>
  );
}

问题：
  - 点击按钮 → 重新渲染
  - 创建新的回调函数
  - 旧函数(null) → 新函数(input)
  - input 重复 focus

解决：
const handleRef = useCallback((node) => {
  if (node) node.focus();
}, []);


Q5: ref 卸载的时机是什么？
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

A: Commit 阶段

情况 1：组件删除（Mutation 阶段）
  commitMutationEffects()
    → commitDeletion()
    → commitDetachRef()

情况 2：ref 变化（Layout 阶段）
  commitLayoutEffects()
    → 检查 Ref flag
    → commitDetachRef()（旧 ref）
    → commitAttachRef()（新 ref）

顺序：
  1. Render 阶段：标记 Ref flag
  2. Commit 阶段：处理 ref


Q6: 对象 ref 和回调 ref 的卸载有什么区别？
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

A: 行为一致，只是 API 不同

对象 ref：
  const ref = useRef();
  <div ref={ref} />
  
  卸载：ref.current = null
  挂载：ref.current = dom

回调 ref：
  const handleRef = (node) => { ... };
  <div ref={handleRef} />
  
  卸载：handleRef(null)
  挂载：handleRef(dom)

相同点：
  - 都在 Layout 阶段处理
  - 都先卸载后挂载
  - 都用 === 判断是否变化


Q7: 如何避免 ref 重复卸载？
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

A: 保持 ref 引用稳定

方案 1：使用 useRef
const ref = useRef();  // 引用永远不变
<div ref={ref} />

方案 2：使用 useCallback
const handleRef = useCallback((node) => {
  // ...
}, []);  // 空依赖，引用永远不变
<div ref={handleRef} />

方案 3：避免条件 ref（如果可能）
// ❌ 避免这样
<div ref={condition ? ref1 : ref2} />

// ✅ 使用单一 ref
const ref = useRef();
<div ref={ref} />


Q8: Fiber 复用的条件是什么？
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

A: key 相同 + type 相同

// 会复用
<div key="a">Hello</div>
<div key="a">World</div>  // key 相同，type 相同

// 不会复用
<div key="a">Hello</div>
<span key="a">World</span>  // key 相同，type 不同

// 不会复用
<div key="a">Hello</div>
<div key="b">World</div>  // key 不同


Q9: DOM 更新会导致 ref 重新挂载吗？
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

A: 不会

原因：
  - DOM 更新是原地更新（修改属性）
  - DOM 对象引用不变
  - ref.current 不需要更新

示例：
const ref = useRef();
<div ref={ref}>{text}</div>

text 变化：
  - DOM 内容更新
  - div 对象引用不变
  - ref.current 仍然指向同一个 div
  - 不会重新挂载 ref


Q10: useImperativeHandle 对 ref 卸载有影响吗？
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

A: 没有影响

useImperativeHandle 只是自定义 ref.current 的值：
const Child = forwardRef((props, ref) => {
  useImperativeHandle(ref, () => ({
    focus: () => { ... }
  }), []);
  
  return <input />;
});

父组件：
const ref = useRef();
<Child ref={ref} />

行为：
  - ref 对象本身不变
  - ref.current 的值由 useImperativeHandle 控制
  - Fiber 复用时，ref 不会卸载
  - 除非 ref 对象变化


记忆口诀：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Fiber 复用看 ref 变
引用相同不卸载
引用不同先卸后挂
对象稳定回调缓存
三等判断很关键`}
      </pre>
    </div>
  );
}
