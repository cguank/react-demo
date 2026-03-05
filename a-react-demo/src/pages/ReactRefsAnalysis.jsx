import React, { useState, useRef, createRef, useEffect, useLayoutEffect ,useCallback} from 'react';

/**
 * React Refs 挂载机制详解
 * 
 * 核心问题：
 * 1. refs 在什么阶段挂载？
 * 2. refs 如何挂载？
 * 3. 不同类型 ref 的处理
 * 4. ref 的更新和卸载时机
 */

export default function ReactRefsAnalysis() {
  const [expandedSection, setExpandedSection] = useState(null);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '1400px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', color: '#61dafb' }}>🔗 React Refs 挂载机制详解</h1>
      
      <Section
        title="✅ 核心答案"
        id="answer"
        expanded={expandedSection === 'answer'}
        onToggle={() => setExpandedSection(expandedSection === 'answer' ? null : 'answer')}
      >
        <CoreAnswer />
      </Section>

      <Section
        title="📋 完整挂载流程"
        id="flow"
        expanded={expandedSection === 'flow'}
        onToggle={() => setExpandedSection(expandedSection === 'flow' ? null : 'flow')}
      >
        <MountingFlow />
      </Section>

      <Section
        title="🔍 源码分析"
        id="source"
        expanded={expandedSection === 'source'}
        onToggle={() => setExpandedSection(expandedSection === 'source' ? null : 'source')}
      >
        <SourceCodeAnalysis />
      </Section>

      <Section
        title="🎯 三种 Ref 类型"
        id="types"
        expanded={expandedSection === 'types'}
        onToggle={() => setExpandedSection(expandedSection === 'types' ? null : 'types')}
      >
        <RefTypes />
      </Section>

      <Section
        title="⏰ 执行时机"
        id="timing"
        expanded={expandedSection === 'timing'}
        onToggle={() => setExpandedSection(expandedSection === 'timing' ? null : 'timing')}
      >
        <ExecutionTiming />
      </Section>

      <Section
        title="🎨 实际示例"
        id="demo"
        expanded={expandedSection === 'demo'}
        onToggle={() => setExpandedSection(expandedSection === 'demo' ? null : 'demo')}
      >
        <PracticalDemo />
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
{`React Refs 挂载时机和方式
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

核心答案：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. 挂载阶段：Commit 阶段的 Layout 子阶段
2. 卸载阶段：Commit 阶段的 Mutation 子阶段
3. 顺序：先卸载旧 ref，DOM 操作，再挂载新 ref


详细时间线：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

setState() 触发更新
  ↓
Render 阶段
  ├─ beginWork
  ├─ completeWork
  └─ 标记 Ref flag（如果 ref 有变化）
  ↓
Commit 阶段
  ├─ Before Mutation 子阶段
  │  └─ getSnapshotBeforeUpdate
  │
  ├─ Mutation 子阶段
  │  ├─ 🔥 commitDetachRef()  ← 卸载旧 ref
  │  │  - 将旧 ref 设置为 null
  │  │  - 清理引用
  │  │
  │  ├─ DOM 操作（appendChild, removeChild 等）
  │  └─ componentWillUnmount
  │
  ├─ 切换 Fiber 树：root.current = finishedWork
  │
  └─ Layout 子阶段
     ├─ 🔥 commitAttachRef()  ← 挂载新 ref
     │  - 对象 ref：ref.current = instance
     │  - 回调 ref：ref(instance)
     │
     ├─ componentDidMount / componentDidUpdate
     └─ useLayoutEffect


为什么在 Layout 阶段挂载 ref？
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. DOM 已经更新完成（Mutation 阶段完成）
2. 可以访问最新的 DOM 节点
3. 在 componentDidMount/useLayoutEffect 之前执行
4. 保证生命周期中可以访问 ref


执行顺序总结：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Mutation 阶段：
   - commitDetachRef (卸载旧 ref)
   - DOM 操作

2. Layout 阶段：
   - commitAttachRef (挂载新 ref)  ← 先执行
   - componentDidMount
   - useLayoutEffect
   - 子组件的 ref 先挂载，父组件的 ref 后挂载


关键理解：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔥 ref 挂载在 Layout 阶段，DOM 更新后、生命周期前
🔥 ref 卸载在 Mutation 阶段，DOM 更新前
🔥 子组件的 ref 先于父组件挂载
🔥 回调 ref 每次都会执行（先 null，后实例）`}
      </pre>
    </div>
  );
}

function MountingFlow() {
  return (
    <div>
      <pre style={{ background: '#f5f5f5', padding: '15px', borderRadius: '5px', overflow: 'auto', fontSize: '13px', lineHeight: '1.8' }}>
{`React Refs 完整挂载流程
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

阶段 1：Render 阶段 - 标记 Ref Flag
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

beginWork() / completeWork()
  ↓
检查 ref 是否变化：
  - 新增 ref
  - 更新 ref
  - 删除 ref
  ↓
标记 Fiber：
  fiber.flags |= Ref  // 标记需要处理 ref


判断 ref 是否变化：
// ReactFiberBeginWork.old.js

function markRef(current: Fiber | null, workInProgress: Fiber) {
  const ref = workInProgress.ref;
  
  if (
    // 挂载阶段：新增 ref
    (current === null && ref !== null) ||
    // 更新阶段：ref 改变
    (current !== null && current.ref !== ref)
  ) {
    // 标记 Ref flag
    workInProgress.flags |= Ref;
  }
}


阶段 2：Commit 阶段 - Mutation 子阶段
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

commitMutationEffects()
  ↓
遍历 Fiber 树，处理有 Ref flag 的节点
  ↓
🔥 commitDetachRef(current)  // 卸载旧 ref


commitDetachRef 流程：
// ReactFiberCommitWork.old.js

function commitDetachRef(current: Fiber) {
  const currentRef = current.ref;
  
  if (currentRef !== null) {
    // 1. 对象 ref
    if (typeof currentRef === 'object') {
      currentRef.current = null;  // 🔥 设置为 null
    }
    // 2. 回调 ref
    else if (typeof currentRef === 'function') {
      currentRef(null);  // 🔥 调用回调，传入 null
    }
  }
}

执行时机：
  - 在 DOM 更新前
  - 在 componentWillUnmount 时
  - 在 ref 改变时


阶段 3：Commit 阶段 - DOM 操作
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

commitMutationEffects()
  ↓
执行 DOM 操作：
  - appendChild
  - removeChild
  - updateProperties
  ↓
此时 DOM 已更新完成


阶段 4：Commit 阶段 - Layout 子阶段
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

commitLayoutEffects()
  ↓
遍历 Fiber 树，处理有 Ref flag 的节点
  ↓
🔥 commitAttachRef(finishedWork)  // 挂载新 ref


commitAttachRef 流程：
// ReactFiberCommitWork.old.js

function commitAttachRef(finishedWork: Fiber) {
  const ref = finishedWork.ref;
  
  if (ref !== null) {
    // 1. 获取实例
    const instance = getInstanceFromNode(finishedWork);
    
    // instance 是什么？
    // - HostComponent (DOM 元素): DOM 节点
    // - ClassComponent: 组件实例
    // - ForwardRef: 转发的 ref
    
    // 2. 设置 ref
    if (typeof ref === 'function') {
      // 🔥 回调 ref
      ref(instance);
    } else {
      // 🔥 对象 ref
      ref.current = instance;
    }
  }
}


获取实例：
function getInstanceFromNode(fiber: Fiber) {
  const tag = fiber.tag;
  
  if (tag === HostComponent || tag === HostText) {
    // DOM 元素
    return fiber.stateNode;  // DOM 节点
  }
  
  if (tag === ClassComponent) {
    // 类组件
    return fiber.stateNode;  // 组件实例
  }
  
  if (tag === ForwardRef) {
    // ForwardRef
    return fiber.child.stateNode;
  }
  
  // ... 其他类型
}


完整流程示例：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

组件代码：
function MyComponent() {
  const divRef = useRef(null);
  
  return <div ref={divRef}>Hello</div>;
}


执行流程：

1. Render 阶段
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   beginWork(div Fiber)
     ↓
   检查 ref: divRef
     ↓
   标记: fiber.flags |= Ref

2. Commit - Mutation 阶段
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   commitDetachRef(div Fiber)
     ↓
   如果有旧 ref:
     divRef.current = null  // 清空旧引用
     ↓
   DOM 操作:
     创建 <div> DOM 节点
     appendChild 到父节点

3. Commit - Layout 阶段
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   commitAttachRef(div Fiber)
     ↓
   获取实例:
     instance = fiber.stateNode  // <div> DOM 节点
     ↓
   设置 ref:
     divRef.current = instance  // 🔥 挂载完成
     ↓
   useLayoutEffect 执行
     ↓
   此时可以访问 divRef.current


父子组件的 ref 顺序：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

<Parent ref={parentRef}>
  <Child ref={childRef} />
</Parent>

执行顺序：

1. Mutation 阶段（卸载，从父到子）
   - parentRef.current = null
   - childRef.current = null

2. DOM 操作
   - 更新 DOM

3. Layout 阶段（挂载，从子到父）
   - childRef.current = childInstance  ← 子先挂载
   - parentRef.current = parentInstance  ← 父后挂载

原因：
  - Layout 阶段是从下到上遍历
  - 保证父组件可以访问子组件的 ref


回调 ref 的特殊处理：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

<div ref={(el) => console.log(el)} />

每次渲染都会执行两次：

1. Mutation 阶段：
   ref(null)  // 卸载旧 ref

2. Layout 阶段：
   ref(instance)  // 挂载新 ref

如果 ref 函数没有变化，也会执行两次！

解决方法（使用 useCallback）：
const ref = useCallback((el) => {
  console.log(el);
}, []);  // 空依赖，函数不变

<div ref={ref} />`}
      </pre>
    </div>
  );
}

function SourceCodeAnalysis() {
  return (
    <div>
      <pre style={{ background: '#f5f5f5', padding: '15px', borderRadius: '5px', overflow: 'auto', fontSize: '12px', lineHeight: '1.6' }}>
{`React Refs 源码分析
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. 标记 Ref Flag - Render 阶段
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ReactFiberBeginWork.old.js

function updateHostComponent(
  current: Fiber | null,
  workInProgress: Fiber,
  type: Type,
  nextProps: Props,
  renderLanes: Lanes,
) {
  // ... 其他逻辑
  
  // 🔥 标记 ref
  markRef(current, workInProgress);
  
  return null;
}


function markRef(current: Fiber | null, workInProgress: Fiber) {
  const ref = workInProgress.ref;
  
  if (
    // 挂载阶段：新增 ref
    (current === null && ref !== null) ||
    // 更新阶段：ref 改变
    (current !== null && current.ref !== ref)
  ) {
    // 🔥 标记 Ref flag
    workInProgress.flags |= Ref;
  }
}


2. 卸载 Ref - Mutation 阶段
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ReactFiberCommitWork.old.js (line ~1289)

function commitDetachRef(current: Fiber) {
  const currentRef = current.ref;
  
  if (currentRef !== null) {
    if (typeof currentRef === 'function') {
      // 🔥 回调 ref：调用函数，传入 null
      if (
        enableProfilerTimer &&
        enableProfilerCommitHooks &&
        current.mode & ProfileMode
      ) {
        try {
          startLayoutEffectTimer();
          currentRef(null);  // 🔥🔥 卸载
        } finally {
          recordLayoutEffectDuration(current);
        }
      } else {
        currentRef(null);  // 🔥🔥 卸载
      }
    } else {
      // 🔥 对象 ref：设置 current 为 null
      currentRef.current = null;  // 🔥🔥 卸载
    }
  }
}

// 在 commitMutationEffects 中调用
function commitMutationEffectsOnFiber(
  finishedWork: Fiber,
  root: FiberRoot,
  lanes: Lanes,
) {
  const current = finishedWork.alternate;
  const flags = finishedWork.flags;
  
  switch (finishedWork.tag) {
    case FunctionComponent:
    case ForwardRef:
    case SimpleMemoComponent: {
      // 递归处理子树
      recursivelyTraverseMutationEffects(root, finishedWork, lanes);
      commitReconciliationEffects(finishedWork);
      
      // 🔥 处理 ref
      if (flags & Ref) {
        if (current !== null) {
          commitDetachRef(current);  // 卸载旧 ref
        }
      }
      
      // 处理其他 flags
      if (flags & Update) {
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


3. 挂载 Ref - Layout 阶段
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ReactFiberCommitWork.old.js (line ~1232)

function commitAttachRef(finishedWork: Fiber) {
  const ref = finishedWork.ref;
  
  if (ref !== null) {
    // 🔥 Step 1: 获取实例
    const instance = finishedWork.stateNode;
    let instanceToUse;
    
    switch (finishedWork.tag) {
      case HostComponent:
        // DOM 元素：获取公共实例
        instanceToUse = getPublicInstance(instance);
        break;
      default:
        // 类组件等：直接使用 stateNode
        instanceToUse = instance;
    }
    
    // Scope API（特殊情况）
    if (enableScopeAPI && finishedWork.tag === ScopeComponent) {
      instanceToUse = instance;
    }
    
    // 🔥 Step 2: 设置 ref
    if (typeof ref === 'function') {
      // 回调 ref
      let retVal;
      
      if (
        enableProfilerTimer &&
        enableProfilerCommitHooks &&
        finishedWork.mode & ProfileMode
      ) {
        try {
          startLayoutEffectTimer();
          retVal = ref(instanceToUse);  // 🔥🔥 调用回调
        } finally {
          recordLayoutEffectDuration(finishedWork);
        }
      } else {
        retVal = ref(instanceToUse);  // 🔥🔥 调用回调
      }
      
      // 警告：回调 ref 不应该返回函数
      if (__DEV__) {
        if (typeof retVal === 'function') {
          console.error(
            'Unexpected return value from a callback ref in %s. ' +
              'A callback ref should not return a function.',
            getComponentNameFromFiber(finishedWork),
          );
        }
      }
    } else {
      // 对象 ref
      if (__DEV__) {
        if (!ref.hasOwnProperty('current')) {
          console.error(
            'Unexpected ref object provided for %s. ' +
              'Use either a ref-setter function or React.createRef().',
            getComponentNameFromFiber(finishedWork),
          );
        }
      }
      
      ref.current = instanceToUse;  // 🔥🔥 设置 current
    }
  }
}


// 在 commitLayoutEffects 中调用
function commitLayoutEffectOnFiber(
  finishedRoot: FiberRoot,
  current: Fiber | null,
  finishedWork: Fiber,
  committedLanes: Lanes,
): void {
  const flags = finishedWork.flags;
  
  switch (finishedWork.tag) {
    case FunctionComponent:
    case ForwardRef:
    case SimpleMemoComponent: {
      // 递归处理子树
      recursivelyTraverseLayoutEffects(
        finishedRoot,
        finishedWork,
        committedLanes,
      );
      
      // 🔥 Step 1: 挂载 ref
      if (flags & Ref) {
        commitAttachRef(finishedWork);
      }
      
      // 🔥 Step 2: 执行 useLayoutEffect
      if (flags & Update) {
        commitHookEffectListMount(
          HookLayout | HookHasEffect,
          finishedWork,
        );
      }
      break;
    }
    
    case ClassComponent: {
      recursivelyTraverseLayoutEffects(
        finishedRoot,
        finishedWork,
        committedLanes,
      );
      
      // 🔥 Step 1: 挂载 ref
      if (flags & Ref) {
        commitAttachRef(finishedWork);
      }
      
      // 🔥 Step 2: 执行生命周期
      const instance = finishedWork.stateNode;
      
      if (current === null) {
        // 挂载阶段
        instance.componentDidMount();
      } else {
        // 更新阶段
        const prevProps = current.memoizedProps;
        const prevState = current.memoizedState;
        instance.componentDidUpdate(
          prevProps,
          prevState,
          instance.__reactInternalSnapshotBeforeUpdate,
        );
      }
      break;
    }
    
    case HostComponent: {
      recursivelyTraverseLayoutEffects(
        finishedRoot,
        finishedWork,
        committedLanes,
      );
      
      // 🔥 挂载 DOM 元素的 ref
      if (flags & Ref) {
        commitAttachRef(finishedWork);
      }
      break;
    }
  }
}


4. 获取实例
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function getPublicInstance(instance: Instance): * {
  // 对于 HostComponent（DOM 元素），直接返回 DOM 节点
  // 对于 ClassComponent，返回组件实例
  return instance;
}


5. 回调 ref（ref 函数）执行底层逻辑
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

"ref 函数" 即回调 ref：ref={(el) => { ... }}。底层只做两件事：先卸旧再挂新。

（1）ref 如何挂到 Fiber 上
  - 协调时（ReactChildFiber.old.js）coerceRef(returnFiber, current, element)
    把 element.ref 原样赋给 fiber.ref，不区分函数还是对象。
  - 所以 <div ref={callback}> 里 callback 会出现在该 div 对应 Fiber 的 ref 上。

（2）何时标记需要处理 ref
  - completeWork（ReactFiberCompleteWork.old.js）：HostComponent 等若 workInProgress.ref !== null，
    调用 markRef(workInProgress) → workInProgress.flags |= Ref。
  - beginWork（ReactFiberBeginWork.old.js）：ForwardRef 等若 current.ref !== workInProgress.ref，
    也会 markRef。有 Ref 的节点在 Commit 阶段会执行「卸旧 + 挂新」。

（3）Mutation 阶段：执行「卸旧」— 调用 ref(null)
  - ReactFiberCommitWork.old.js commitMutationEffectsOnFiber() 中，对带 Ref 的节点
    （如 HostComponent / ClassComponent，约 2166、2156 行）：
      if (flags & Ref && current !== null) {
        safelyDetachRef(current, current.return);  // 用旧 fiber（current）
      }
  - safelyDetachRef（约 268–303 行）：
      const ref = current.ref;
      if (typeof ref === 'function') {
        ref(null);   // 回调 ref：直接执行 ref 函数，传入 null
      } else {
        ref.current = null;   // 对象 ref
      }
  - 即：在 DOM 变更前，先对「旧」Fiber 的 ref 执行一次，回调 ref 就是 ref(null)。

（4）Layout 阶段：执行「挂新」— 调用 ref(instance)
  - commitLayoutEffectOnFiber() 递归到带 Ref 的节点后（如 HostComponent 约 1026、1030 行）：
      if (finishedWork.flags & Ref) {
        commitAttachRef(finishedWork);   // 用新 fiber（finishedWork）
      }
  - commitAttachRef（约 1232–1287 行）：
      const ref = finishedWork.ref;
      const instance = finishedWork.stateNode;
      instanceToUse = getPublicInstance(instance);  // DOM 或组件实例
      if (typeof ref === 'function') {
        ref(instanceToUse);   // 回调 ref：执行 ref 函数，传入真实实例
      } else {
        ref.current = instanceToUse;   // 对象 ref
      }
  - 即：DOM 已更新、在 componentDidMount/useLayoutEffect 之前，对「新」Fiber 执行 ref(实例)。

（5）顺序与次数总结
  - 顺序：先 Mutation 里 ref(null)（卸旧）→ DOM 变更 → Layout 里 ref(instance)（挂新）。
  - 回调 ref 每次有 Ref 的 commit 都会执行两次：一次 null、一次实例；即使 ref 函数引用未变也会执行。
  - 若希望少执行，可用 useCallback 包住 ref 函数并空依赖，或使用 useRef 对象 ref。


6. Ref Flag 定义
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ReactFiberFlags.js

export const Ref = /*                          */ 0b0000000010000000;
// 256 (十进制)

// Ref flag 表示该 Fiber 节点有 ref，需要在 Commit 阶段处理


6. 完整的 Commit 流程
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

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
  // 在这个阶段：
  // 1. commitDetachRef (卸载旧 ref)  🔥
  // 2. DOM 操作
  // 3. componentWillUnmount
  
  
  // 切换 Fiber 树
  root.current = finishedWork;
  
  
  // ... Layout 阶段
  
  commitLayoutEffects(finishedWork, root, lanes);
  // 在这个阶段：
  // 1. commitAttachRef (挂载新 ref)  🔥
  // 2. componentDidMount / componentDidUpdate
  // 3. useLayoutEffect
  
  
  // ... 调度 useEffect
}


7. ForwardRef 处理
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ReactFiberBeginWork.old.js

function updateForwardRef(
  current: Fiber | null,
  workInProgress: Fiber,
  Component: any,
  nextProps: any,
  renderLanes: Lanes,
) {
  const render = Component.render;
  const ref = workInProgress.ref;
  
  // ... 处理 context
  
  // 🔥 将 ref 作为第二个参数传递给组件
  nextChildren = renderWithHooks(
    current,
    workInProgress,
    render,
    nextProps,
    ref,  // 🔥 传递 ref
    renderLanes,
  );
  
  // ... 协调子元素
  
  return workInProgress.child;
}

// 用户代码
const MyInput = React.forwardRef((props, ref) => {
  // ref 作为第二个参数传入
  return <input ref={ref} />;
});


8. useImperativeHandle 实现
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ReactFiberHooks.old.js

function mountImperativeHandle<T>(
  ref: {| current: T | null |} | ((inst: T | null) => mixed) | null | void,
  create: () => T,
  deps: Array<mixed> | void | null,
): void {
  const effectDeps = deps !== null && deps !== undefined 
    ? deps.concat([ref]) 
    : null;
  
  // 使用 Layout Effect 实现
  return mountEffectImpl(
    UpdateEffect | LayoutEffect,
    HookLayout,
    imperativeHandleEffect.bind(null, create, ref),
    effectDeps,
  );
}

function imperativeHandleEffect<T>(
  create: () => T,
  ref: {| current: T | null |} | ((inst: T | null) => mixed) | void | null,
) {
  if (typeof ref === 'function') {
    const refCallback = ref;
    const inst = create();
    refCallback(inst);  // 🔥 调用 ref 回调
    return () => {
      refCallback(null);
    };
  } else if (ref !== null && ref !== undefined) {
    const refObject = ref;
    const inst = create();
    refObject.current = inst;  // 🔥 设置 ref.current
    return () => {
      refObject.current = null;
    };
  }
}


9. 字符串 Ref（已废弃，仅供理解）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// 字符串 ref 的处理（ReactFiberBeginWork.old.js）

function coerceRef(
  returnFiber: Fiber,
  current: Fiber | null,
  element: ReactElement,
) {
  const mixedRef = element.ref;
  
  if (
    mixedRef !== null &&
    typeof mixedRef !== 'function' &&
    typeof mixedRef !== 'object'
  ) {
    // 🔥 字符串 ref
    if (element._owner) {
      const owner = element._owner;
      
      // 转换为回调 ref
      const inst = owner.stateNode;
      
      // 访问通过 inst.refs[stringRef]
      const stringRef = '' + mixedRef;
      
      const ref = function(value) {
        const refs = inst.refs;
        if (value === null) {
          delete refs[stringRef];
        } else {
          refs[stringRef] = value;
        }
      };
      
      return ref;
    }
  }
  
  return mixedRef;
}


关键源码文件：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. ReactFiberBeginWork.old.js
   - markRef: 标记 Ref flag
   - updateForwardRef: ForwardRef 处理

2. ReactFiberCommitWork.old.js
   - commitDetachRef (line ~1289): 卸载 ref
   - commitAttachRef (line ~1232): 挂载 ref
   - commitLayoutEffectOnFiber: Layout 阶段入口

3. ReactFiberHooks.old.js
   - useRef 实现
   - useImperativeHandle 实现

4. ReactFiberFlags.js
   - Ref flag 定义 (0b0000000010000000)

5. ReactFiberWorkLoop.old.js
   - commitRootImpl: 整体 Commit 流程
   - commitMutationEffects: Mutation 阶段
   - commitLayoutEffects: Layout 阶段`}
      </pre>
    </div>
  );
}

function RefTypes() {
  return (
    <div>
      <pre style={{ background: '#f5f5f5', padding: '15px', borderRadius: '5px', overflow: 'auto', fontSize: '13px', lineHeight: '1.8' }}>
{`三种 Ref 类型详解
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. 对象 Ref（useRef / createRef）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

使用方式：
function MyComponent() {
  const divRef = useRef(null);
  
  useEffect(() => {
    console.log(divRef.current); // DOM 节点
  }, []);
  
  return <div ref={divRef}>Hello</div>;
}

// 或者类组件
class MyComponent extends React.Component {
  constructor() {
    this.divRef = React.createRef();
  }
  
  componentDidMount() {
    console.log(this.divRef.current); // DOM 节点
  }
  
  render() {
    return <div ref={this.divRef}>Hello</div>;
  }
}


挂载流程：
commitAttachRef(fiber) {
  const ref = fiber.ref;  // { current: null }
  const instance = fiber.stateNode;  // DOM 节点
  
  // 🔥 直接赋值
  ref.current = instance;
}


特点：
✅ 最常用
✅ 性能最好（不需要函数调用）
✅ 可以在整个组件生命周期中访问
✅ useRef 在函数组件中保持引用稳定


2. 回调 Ref（Callback Ref）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

使用方式：
function MyComponent() {
  const [node, setNode] = useState(null);
  
  const refCallback = useCallback((node) => {
    if (node) {
      console.log('挂载:', node);
      setNode(node);
    } else {
      console.log('卸载');
    }
  }, []);
  
  return <div ref={refCallback}>Hello</div>;
}


挂载流程：
// Mutation 阶段
commitDetachRef(current) {
  const ref = current.ref;  // 回调函数
  
  // 🔥 调用回调，传入 null
  ref(null);
}

// Layout 阶段
commitAttachRef(fiber) {
  const ref = fiber.ref;  // 回调函数
  const instance = fiber.stateNode;  // DOM 节点
  
  // 🔥 调用回调，传入实例
  ref(instance);
}


特点：
✅ 更灵活，可以执行自定义逻辑
✅ 可以在挂载/卸载时做不同的处理
✅ 适合需要测量 DOM 的场景
❌ 每次渲染可能触发两次（null + instance）
❌ 需要使用 useCallback 避免不必要的调用


注意事项：
// ❌ 错误：每次渲染创建新函数
<div ref={(node) => console.log(node)} />
// 会导致每次渲染都调用两次：
// 1. ref(null)      - 卸载旧 ref
// 2. ref(instance)  - 挂载新 ref

// ✅ 正确：使用 useCallback
const ref = useCallback((node) => {
  console.log(node);
}, []);  // 空依赖，函数稳定

<div ref={ref} />


3. 字符串 Ref（已废弃）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

使用方式（不推荐）：
class MyComponent extends React.Component {
  componentDidMount() {
    // 通过 this.refs 访问
    console.log(this.refs.myDiv);
  }
  
  render() {
    return <div ref="myDiv">Hello</div>;
  }
}


为什么废弃？
❌ 需要维护 owner 引用（性能问题）
❌ 不能传递给子组件
❌ 静态分析困难
❌ 有潜在的内存泄漏风险


不同类型对比：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

┌──────────────┬──────────┬──────────┬──────────┐
│ 类型          │ 性能     │ 灵活性   │ 推荐度   │
├──────────────┼──────────┼──────────┼──────────┤
│ 对象 Ref      │ 最好     │ 一般     │ ⭐⭐⭐⭐⭐ │
│ 回调 Ref      │ 较好     │ 很好     │ ⭐⭐⭐⭐   │
│ 字符串 Ref    │ 最差     │ 差       │ ❌ 已废弃 │
└──────────────┴──────────┴──────────┴──────────┘


使用场景：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. 对象 Ref
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// 访问 DOM 元素
const inputRef = useRef(null);

useEffect(() => {
  inputRef.current.focus();
}, []);

<input ref={inputRef} />


// 存储任意可变值
const timerRef = useRef(null);

useEffect(() => {
  timerRef.current = setInterval(() => {
    console.log('tick');
  }, 1000);
  
  return () => clearInterval(timerRef.current);
}, []);


2. 回调 Ref
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// 测量 DOM 尺寸
function MyComponent() {
  const [height, setHeight] = useState(0);
  
  const measuredRef = useCallback((node) => {
    if (node !== null) {
      setHeight(node.getBoundingClientRect().height);
    }
  }, []);
  
  return (
    <>
      <div ref={measuredRef}>Content</div>
      <p>高度: {height}px</p>
    </>
  );
}


// 动态 ref 列表
function List({ items }) {
  const itemRefs = useRef({});
  
  return (
    <ul>
      {items.map(item => (
        <li
          key={item.id}
          ref={(node) => {
            if (node) {
              itemRefs.current[item.id] = node;
            } else {
              delete itemRefs.current[item.id];
            }
          }}
        >
          {item.text}
        </li>
      ))}
    </ul>
  );
}


// 集成第三方库
function Chart({ data }) {
  const chartRef = useCallback((node) => {
    if (node) {
      // 初始化图表
      const chart = new Chart(node, { data });
      
      // 清理函数
      return () => chart.destroy();
    }
  }, [data]);
  
  return <canvas ref={chartRef} />;
}`}
      </pre>
    </div>
  );
}

function ExecutionTiming() {
  return (
    <div>
      <pre style={{ background: '#f5f5f5', padding: '15px', borderRadius: '5px', overflow: 'auto', fontSize: '13px', lineHeight: '1.8' }}>
{`Ref 执行时机详解
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

完整时间线：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function Parent() {
  const parentRef = useRef(null);
  
  useLayoutEffect(() => {
    console.log('4. Parent useLayoutEffect');
    console.log('parentRef:', parentRef.current);  // ✅ 可以访问
  });
  
  useEffect(() => {
    console.log('6. Parent useEffect');
  });
  
  return (
    <div ref={parentRef}>
      <Child />
    </div>
  );
}

function Child() {
  const childRef = useRef(null);
  
  useLayoutEffect(() => {
    console.log('3. Child useLayoutEffect');
    console.log('childRef:', childRef.current);  // ✅ 可以访问
  });
  
  useEffect(() => {
    console.log('5. Child useEffect');
  });
  
  return <div ref={childRef}>Child</div>;
}


执行顺序：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Render 阶段：
  - Parent render
  - Child render

Commit - Mutation 阶段：
  - Parent ref cleanup (如果有)
  - Child ref cleanup (如果有)
  - DOM 操作

Commit - Layout 阶段：
  1. Child ref attach          ← 子组件 ref 先挂载
  2. Parent ref attach          ← 父组件 ref 后挂载
  3. Child useLayoutEffect      ← 子组件 layoutEffect
  4. Parent useLayoutEffect     ← 父组件 layoutEffect

浏览器渲染：
  - 屏幕更新

useEffect（异步）：
  5. Child useEffect
  6. Parent useEffect


为什么 ref 在 useLayoutEffect 之前挂载？
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

源码顺序：
// ReactFiberCommitWork.old.js

function commitLayoutEffectOnFiber(finishedWork) {
  const flags = finishedWork.flags;
  
  switch (finishedWork.tag) {
    case FunctionComponent: {
      // 🔥 Step 1: 先挂载 ref
      if (flags & Ref) {
        commitAttachRef(finishedWork);
      }
      
      // 🔥 Step 2: 再执行 useLayoutEffect
      if (flags & (Update | Passive)) {
        commitHookEffectListMount(
          HookLayout | HookHasEffect,
          finishedWork
        );
      }
      break;
    }
    
    case ClassComponent: {
      // 🔥 Step 1: 先挂载 ref
      if (flags & Ref) {
        commitAttachRef(finishedWork);
      }
      
      // 🔥 Step 2: 再执行生命周期
      const instance = finishedWork.stateNode;
      if (current === null) {
        instance.componentDidMount();
      } else {
        instance.componentDidUpdate(prevProps, prevState);
      }
      break;
    }
  }
}

原因：
  1. 保证生命周期中可以访问 ref
  2. 保证 useLayoutEffect 中可以访问 ref
  3. 保证 DOM 已更新（Mutation 阶段完成）


类组件生命周期中的 ref：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class MyComponent extends React.Component {
  constructor() {
    super();
    this.divRef = React.createRef();
  }
  
  componentDidMount() {
    // ✅ 可以访问 ref
    console.log(this.divRef.current);
  }
  
  componentDidUpdate() {
    // ✅ 可以访问 ref
    console.log(this.divRef.current);
  }
  
  render() {
    return <div ref={this.divRef}>Hello</div>;
  }
}

执行顺序：
1. render
2. Commit - Mutation: DOM 操作
3. Commit - Layout:
   - commitAttachRef (ref 挂载)  ← 先执行
   - componentDidMount            ← 后执行


父子组件挂载顺序详解：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

<Parent ref={parentRef}>
  <Child ref={childRef}>
    <GrandChild ref={grandChildRef} />
  </Child>
</Parent>


Mutation 阶段（从父到子）：
  1. parentRef.current = null
  2. childRef.current = null
  3. grandChildRef.current = null
  4. DOM 操作


Layout 阶段（从子到父）：
  1. grandChildRef.current = grandChildInstance
  2. childRef.current = childInstance
  3. parentRef.current = parentInstance

为什么从子到父？
  - Layout 阶段使用深度优先遍历（DFS）
  - 先处理子节点，再处理父节点
  - 保证父组件的 ref 回调中可以访问子组件的 ref


回调 Ref 的执行时机：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function MyComponent() {
  const [count, setCount] = useState(0);
  
  return (
    <div ref={(node) => console.log('ref:', node)}>
      Count: {count}
      <button onClick={() => setCount(c => c + 1)}>+</button>
    </div>
  );
}

首次渲染：
  - ref(instance)  // 挂载

每次更新（如果 ref 函数变化）：
  - ref(null)      // Mutation 阶段：卸载
  - ref(instance)  // Layout 阶段：挂载

使用 useCallback 避免：
const stableRef = useCallback((node) => {
  console.log('ref:', node);
}, []);  // 空依赖，函数不变

<div ref={stableRef} />

// 只在挂载时调用一次：ref(instance)


特殊情况 - 条件渲染：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function MyComponent() {
  const [show, setShow] = useState(true);
  const divRef = useRef(null);
  
  useEffect(() => {
    console.log('divRef:', divRef.current);
  });
  
  return (
    <>
      {show && <div ref={divRef}>Content</div>}
      <button onClick={() => setShow(!show)}>Toggle</button>
    </>
  );
}

执行流程：

显示时：
  1. Mutation: DOM 插入
  2. Layout: divRef.current = <div>  // 挂载 ref
  3. useEffect: divRef.current 可访问

隐藏时：
  1. Mutation: 
     - divRef.current = null  // 卸载 ref
     - DOM 删除
  2. useEffect: divRef.current 是 null`}
      </pre>
    </div>
  );
}

function PracticalDemo() {
  const [logs, setLogs] = useState([]);
  const [show, setShow] = useState(true);
  
  const addLog = (message) => {
    setLogs(prev => [...prev, `${performance.now().toFixed(2)}ms - ${message}`]);
  };
  
  return (
    <div>
      <h3>Ref 挂载时机实时演示</h3>
      
      <div style={{ marginBottom: '20px', padding: '15px', background: '#e3f2fd', borderRadius: '5px' }}>
        <button
          onClick={() => {
            setLogs([]);
            addLog('🔴 点击触发更新');
            setShow(!show);
          }}
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
          {show ? '隐藏' : '显示'} 组件
        </button>
        
        {show && <DemoComponent addLog={addLog} />}
      </div>
      
      <div style={{ background: '#f5f5f5', padding: '15px', borderRadius: '5px' }}>
        <h4>执行日志：</h4>
        <div style={{ maxHeight: '400px', overflow: 'auto', fontSize: '13px', fontFamily: 'monospace' }}>
          {logs.map((log, index) => (
            <div key={index} style={{ marginBottom: '5px' }}>{log}</div>
          ))}
        </div>
      </div>
      
      <div style={{ marginTop: '20px', padding: '15px', background: '#fff3e0', borderRadius: '5px' }}>
        <h4>观察要点：</h4>
        <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', lineHeight: '1.8' }}>
          <li>ref 挂载在 useLayoutEffect 之前</li>
          <li>子组件 ref 先于父组件挂载</li>
          <li>隐藏时 ref.current 被设置为 null</li>
          <li>回调 ref 在挂载和卸载时都会调用</li>
        </ul>
      </div>
    </div>
  );
}

function DemoComponent({ addLog }) {
  const objRef = useRef(null);
  
  const callbackRef = useCallback((node) => {
    if (node) {
      addLog('🟢 回调 Ref 挂载: ' + node.tagName);
    } else {
      addLog('🟠 回调 Ref 卸载: null');
    }
  }, [addLog]);
  
  useLayoutEffect(() => {
    addLog('🟡 useLayoutEffect 执行');
    addLog('   - objRef.current: ' + (objRef.current ? objRef.current.tagName : 'null'));
    
    return () => {
      addLog('🟡 useLayoutEffect cleanup');
    };
  });
  
  useEffect(() => {
    addLog('🔵 useEffect 执行');
  });
  
  return (
    <div style={{ marginTop: '10px', padding: '10px', background: '#e8f5e9', borderRadius: '5px' }}>
      <div ref={objRef}>对象 Ref 元素</div>
      <div ref={callbackRef}>回调 Ref 元素</div>
    </div>
  );
}

function InterviewPoints() {
  return (
    <div>
      <pre style={{ background: '#f5f5f5', padding: '15px', borderRadius: '5px', overflow: 'auto', fontSize: '13px', lineHeight: '1.8' }}>
{`Ref 面试要点总结
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

必答问题：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Q1: React refs 在什么阶段挂载？
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

A: Commit 阶段的 Layout 子阶段。

详细：
1. Render 阶段标记 Ref flag
2. Commit - Mutation 阶段卸载旧 ref
3. Commit - Mutation 阶段 DOM 操作
4. Commit - Layout 阶段挂载新 ref ← 在这里
5. Commit - Layout 阶段执行 useLayoutEffect
6. 浏览器渲染
7. useEffect 异步执行


Q2: refs 如何挂载？
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

A: 通过 commitAttachRef 函数。

对象 ref:
  ref.current = instance

回调 ref:
  ref(instance)


Q3: ref 为什么在 useLayoutEffect 之前挂载？
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

A: 保证生命周期和 useLayoutEffect 中可以访问 ref。

源码顺序：
1. commitAttachRef (挂载 ref)
2. commitHookEffectListMount (执行 useLayoutEffect)
3. componentDidMount / componentDidUpdate


Q4: 父子组件的 ref 挂载顺序？
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

A: 子组件先挂载，父组件后挂载。

原因：Layout 阶段是深度优先遍历（从子到父）。


Q5: 回调 ref 为什么会执行两次？
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

A: 如果 ref 函数每次渲染都重新创建：

1. Mutation 阶段：ref(null)      // 卸载旧 ref
2. Layout 阶段：ref(instance)    // 挂载新 ref

解决：使用 useCallback 保持函数引用稳定。


Q6: useRef 和 createRef 的区别？
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

A:
useRef:
  - 函数组件使用
  - 返回的对象在组件整个生命周期保持不变
  - 可以存储任意可变值

createRef:
  - 类组件使用
  - 每次渲染都会创建新的 ref 对象


Q7: 能在 render 中访问 ref 吗？
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

A: 不能，ref 在 render 时还未挂载。

function MyComponent() {
  const divRef = useRef(null);
  
  // ❌ 错误：render 时 ref.current 是 null
  console.log(divRef.current);
  
  // ✅ 正确：在 effect 中访问
  useEffect(() => {
    console.log(divRef.current); // 可以访问
  });
  
  return <div ref={divRef}>Hello</div>;
}


Q8: ForwardRef 是如何工作的？
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

A: 将 ref 作为第二个参数传递给组件。

const MyInput = React.forwardRef((props, ref) => {
  return <input ref={ref} />;
});

// 使用
function Parent() {
  const inputRef = useRef(null);
  return <MyInput ref={inputRef} />;
}

// ref 最终挂载到 input 元素上


高级问题：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Q9: ref 和 key 的区别？
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ref:
  - 用于访问 DOM 或组件实例
  - 在 Commit 阶段处理
  - 可以是对象或函数

key:
  - 用于 Diff 算法识别元素
  - 在 Render 阶段使用
  - 只能是字符串或数字


Q10: 如何实现 ref 转发链？
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

A: 使用 useImperativeHandle。

const Child = forwardRef((props, ref) => {
  const inputRef = useRef(null);
  
  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current.focus(),
    getValue: () => inputRef.current.value
  }));
  
  return <input ref={inputRef} />;
});

// 父组件
function Parent() {
  const childRef = useRef(null);
  
  const handleClick = () => {
    childRef.current.focus();  // 调用暴露的方法
  };
  
  return <Child ref={childRef} />;
}


最佳实践：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ 优先使用 useRef（对象 ref）
✅ 回调 ref 使用 useCallback 包裹
✅ 不要在 render 中访问 ref
✅ 使用 ForwardRef 转发 ref
✅ 使用 useImperativeHandle 控制暴露的接口
❌ 避免使用字符串 ref（已废弃）
❌ 不要过度使用 ref（优先使用状态驱动）`}
      </pre>
    </div>
  );
}
