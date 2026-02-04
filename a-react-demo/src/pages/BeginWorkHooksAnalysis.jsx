import React, { useState } from 'react';

/**
 * beginWork 调用 Hooks 的详细解析
 * 
 * 核心问题：
 * 1. beginWork 是如何调用 Hooks 的？
 * 2. Hooks 在哪个阶段执行？
 * 3. 调用链路是什么？
 */

export default function BeginWorkHooksAnalysis() {
  const [expandedSection, setExpandedSection] = useState(null);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', color: '#61dafb' }}>🎣 beginWork 调用 Hooks 详解</h1>
      
      <Section
        title="✅ 核心答案"
        id="answer"
        expanded={expandedSection === 'answer'}
        onToggle={() => setExpandedSection(expandedSection === 'answer' ? null : 'answer')}
      >
        <CoreAnswer />
      </Section>

      <Section
        title="📋 完整调用链路"
        id="chain"
        expanded={expandedSection === 'chain'}
        onToggle={() => setExpandedSection(expandedSection === 'chain' ? null : 'chain')}
      >
        <CallChain />
      </Section>

      <Section
        title="🔍 详细流程分析"
        id="flow"
        expanded={expandedSection === 'flow'}
        onToggle={() => setExpandedSection(expandedSection === 'flow' ? null : 'flow')}
      >
        <DetailedFlow />
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
        title="💡 关键理解点"
        id="key"
        expanded={expandedSection === 'key'}
        onToggle={() => setExpandedSection(expandedSection === 'key' ? null : 'key')}
      >
        <KeyPoints />
      </Section>

      <Section
        title="🎯 实际示例"
        id="example"
        expanded={expandedSection === 'example'}
        onToggle={() => setExpandedSection(expandedSection === 'example' ? null : 'example')}
      >
        <PracticalExample />
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
      <h3>核心理解</h3>
      <pre style={{ background: '#f5f5f5', padding: '15px', borderRadius: '5px', overflow: 'auto', fontSize: '13px', lineHeight: '1.8' }}>
{`beginWork 调用 Hooks 的核心流程：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. beginWork 是 Render 阶段处理 Fiber 节点的核心函数
2. 当遇到 FunctionComponent 时，会调用 updateFunctionComponent
3. updateFunctionComponent 会调用 renderWithHooks
4. renderWithHooks 执行组件函数，在执行过程中调用 Hooks
5. Hooks（useState、useEffect 等）在组件函数执行时被调用

简化流程：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

beginWork(fiber)
  ↓
switch (fiber.tag)
  case FunctionComponent:
    ↓
  updateFunctionComponent(fiber)
    ↓
  renderWithHooks(fiber, Component, props)
    ↓
  Component(props)  // 🔥 执行组件函数
    ↓
  function MyComponent(props) {
    const [state, setState] = useState(0);  // 🔥 Hooks 在这里被调用
    useEffect(() => { ... });               // 🔥 Hooks 在这里被调用
    return <div>{state}</div>;
  }


关键理解：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Hooks 不是由 beginWork 直接调用
2. beginWork → updateFunctionComponent → renderWithHooks → 执行组件函数
3. Hooks 是在组件函数执行过程中被调用的
4. renderWithHooks 在调用前会设置全局的 Hooks dispatcher
5. 组件函数中的 useState、useEffect 等实际上是调用 dispatcher 上的方法


时机：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Hooks 在 Render 阶段（beginWork）执行
✅ 在组件函数执行时被调用
✅ 每次组件重新渲染都会执行 Hooks
❌ Hooks 不在 Commit 阶段执行（但 useEffect 的回调在 Commit 后执行）`}
      </pre>
    </div>
  );
}

function CallChain() {
  return (
    <div>
      <h3>完整的调用链路</h3>
      <pre style={{ background: '#f5f5f5', padding: '15px', borderRadius: '5px', overflow: 'auto', fontSize: '13px', lineHeight: '1.8' }}>
{`从 setState 到 Hooks 执行的完整链路：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. 触发更新
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

setState()
  ↓
dispatchSetState()
  ↓
scheduleUpdateOnFiber()
  ↓
ensureRootIsScheduled()
  ↓
scheduleCallback(performConcurrentWorkOnRoot)


2. Render 阶段开始
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

performConcurrentWorkOnRoot()
  ↓
renderRootConcurrent()
  ↓
prepareFreshStack()  // 准备工作栈
  ↓
workLoopConcurrent()  // 工作循环
  ↓
performUnitOfWork(workInProgress)  // 处理单个 Fiber


3. beginWork 阶段
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

performUnitOfWork(fiber)
  ↓
beginWork(current, workInProgress, renderLanes)
  ↓
switch (workInProgress.tag) {
  case FunctionComponent:
    ↓
  🔥 updateFunctionComponent(
    current,
    workInProgress,
    Component,  // fiber.type（组件函数）
    resolvedProps,
    renderLanes,
  )


4. 执行组件函数
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

updateFunctionComponent()
  ↓
🔥🔥 renderWithHooks(
  current,
  workInProgress,
  Component,  // 组件函数
  props,
  context,
  renderLanes,
)
  ↓
设置全局状态：
  currentlyRenderingFiber = workInProgress
  
设置 Hooks dispatcher：
  if (current !== null && current.memoizedState !== null) {
    // 更新阶段
    ReactCurrentDispatcher.current = HooksDispatcherOnUpdate;
  } else {
    // 挂载阶段
    ReactCurrentDispatcher.current = HooksDispatcherOnMount;
  }
  ↓
🔥🔥🔥 Component(props, context)  // 执行组件函数


5. Hooks 被调用
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function MyComponent(props) {
  // 🔥 组件函数执行时，Hooks 被调用
  
  // useState 实际调用的是 ReactCurrentDispatcher.current.useState
  const [count, setCount] = useState(0);
    ↓
  ReactCurrentDispatcher.current.useState(0)
    ↓
  挂载阶段：mountState(0)
  更新阶段：updateState(0)
    ↓
  创建/更新 Hook 对象，加入链表
  
  
  // useEffect 实际调用的是 ReactCurrentDispatcher.current.useEffect
  useEffect(() => {
    console.log('effect');
  }, [count]);
    ↓
  ReactCurrentDispatcher.current.useEffect(...)
    ↓
  挂载阶段：mountEffect(...)
  更新阶段：updateEffect(...)
    ↓
  创建 Effect 对象，标记 PassiveEffect flag
  
  
  return <div>{count}</div>;
}


6. 返回子元素，继续 Diff
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

renderWithHooks 返回：
  children = <div>{count}</div>
  ↓
reconcileChildren(current, workInProgress, children, renderLanes)
  ↓
Diff 算法，创建子 Fiber
  ↓
返回子 Fiber（继续 beginWork）


完整流程图：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

setState
  ↓
调度更新
  ↓
Render 阶段开始
  ↓
workLoop
  ↓
performUnitOfWork
  ↓
beginWork  ← 🔥 在 Render 阶段
  ↓
updateFunctionComponent
  ↓
renderWithHooks
  ↓
执行组件函数  ← 🔥 Hooks 在组件函数执行时被调用
  ├─ useState() → mountState/updateState
  ├─ useEffect() → mountEffect/updateEffect
  ├─ useMemo() → mountMemo/updateMemo
  └─ useCallback() → mountCallback/updateCallback
  ↓
返回 JSX
  ↓
reconcileChildren (Diff)
  ↓
创建子 Fiber
  ↓
继续遍历（beginWork/completeWork）`}
      </pre>
    </div>
  );
}

function DetailedFlow() {
  return (
    <div>
      <h3>详细流程分析</h3>
      <pre style={{ background: '#f5f5f5', padding: '15px', borderRadius: '5px', overflow: 'auto', fontSize: '13px', lineHeight: '1.8' }}>
{`步骤 1：beginWork 根据 tag 调用不同的 update 函数
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function beginWork(
  current: Fiber | null,
  workInProgress: Fiber,
  renderLanes: Lanes,
): Fiber | null {
  
  // ...优化逻辑（bailout）
  
  // 根据 Fiber 节点的类型（tag）进行不同处理
  switch (workInProgress.tag) {
    case FunctionComponent: {
      const Component = workInProgress.type;  // 获取组件函数
      const unresolvedProps = workInProgress.pendingProps;
      
      // 🔥 调用 updateFunctionComponent
      return updateFunctionComponent(
        current,
        workInProgress,
        Component,
        resolvedProps,
        renderLanes,
      );
    }
    
    case ClassComponent: {
      const Component = workInProgress.type;
      return updateClassComponent(...);
    }
    
    case HostComponent: {  // 原生 DOM 元素
      return updateHostComponent(...);
    }
    
    // ... 其他类型
  }
}


步骤 2：updateFunctionComponent 准备执行组件
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function updateFunctionComponent(
  current,
  workInProgress,
  Component,  // 🔥 组件函数（fiber.type）
  nextProps,
  renderLanes,
) {
  
  // 处理 Context
  let context;
  if (!disableLegacyContext) {
    const unmaskedContext = getUnmaskedContext(workInProgress, Component, true);
    context = getMaskedContext(workInProgress, unmaskedContext);
  }
  
  // 🔥🔥 调用 renderWithHooks，执行组件函数
  let nextChildren = renderWithHooks(
    current,
    workInProgress,
    Component,  // 组件函数
    nextProps,
    context,
    renderLanes,
  );
  
  // 如果可以 bailout（跳过更新）
  if (current !== null && !didReceiveUpdate) {
    bailoutHooks(current, workInProgress, renderLanes);
    return bailoutOnAlreadyFinishedWork(current, workInProgress, renderLanes);
  }
  
  // 标记收到更新
  workInProgress.flags |= PerformedWork;
  
  // 🔥 Diff 子元素
  reconcileChildren(current, workInProgress, nextChildren, renderLanes);
  
  // 返回子 Fiber
  return workInProgress.child;
}


步骤 3：renderWithHooks 设置环境并执行组件
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function renderWithHooks<Props, SecondArg>(
  current: Fiber | null,
  workInProgress: Fiber,
  Component: (p: Props, arg: SecondArg) => any,
  props: Props,
  secondArg: SecondArg,
  nextRenderLanes: Lanes,
): any {
  
  // 🔥 设置全局状态
  renderLanes = nextRenderLanes;
  currentlyRenderingFiber = workInProgress;  // 当前正在渲染的 Fiber
  
  // 🔥 重置 Hooks 链表
  workInProgress.memoizedState = null;  // Hooks 链表
  workInProgress.updateQueue = null;     // Effect 链表
  workInProgress.lanes = NoLanes;
  
  // 🔥🔥 设置 Hooks dispatcher（关键！）
  if (current !== null && current.memoizedState !== null) {
    // 更新阶段：使用 update 版本的 Hooks
    ReactCurrentDispatcher.current = HooksDispatcherOnUpdate;
  } else {
    // 挂载阶段：使用 mount 版本的 Hooks
    ReactCurrentDispatcher.current = HooksDispatcherOnMount;
  }
  
  // 🔥🔥🔥 执行组件函数
  let children = Component(props, secondArg);
  
  // 处理 rerender（组件在渲染过程中又触发了更新）
  if (didScheduleRenderPhaseUpdateDuringThisPass) {
    let numberOfReRenders = 0;
    do {
      didScheduleRenderPhaseUpdateDuringThisPass = false;
      
      numberOfReRenders += 1;
      
      // 重新开始
      currentHook = null;
      workInProgressHook = null;
      workInProgress.updateQueue = null;
      
      // 使用 rerender 版本的 dispatcher
      ReactCurrentDispatcher.current = HooksDispatcherOnRerender;
      
      children = Component(props, secondArg);
    } while (didScheduleRenderPhaseUpdateDuringThisPass);
  }
  
  // 🔥 重置 dispatcher（防止在渲染外使用 Hooks）
  ReactCurrentDispatcher.current = ContextOnlyDispatcher;
  
  // 检查 Hooks 调用数量是否正确
  const didRenderTooFewHooks =
    currentHook !== null && currentHook.next !== null;
  
  // 🔥 清理全局状态
  renderLanes = NoLanes;
  currentlyRenderingFiber = null;
  currentHook = null;
  workInProgressHook = null;
  
  if (didRenderTooFewHooks) {
    throw new Error('Rendered fewer hooks than expected.');
  }
  
  // 🔥 返回子元素
  return children;
}


步骤 4：组件函数执行，Hooks 被调用
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// 用户代码
function MyComponent(props) {
  // 🔥 调用 useState
  const [count, setCount] = useState(0);
  
  // 实际执行的是：
  // ReactCurrentDispatcher.current.useState(0)
  
  // 挂载阶段：
  //   HooksDispatcherOnMount.useState(0)
  //     ↓
  //   mountState(0)
  //     ↓
  //   创建 Hook 对象：
  //     {
  //       memoizedState: 0,
  //       queue: { pending: null, ... },
  //       next: null
  //     }
  //   加入 Hooks 链表
  
  // 更新阶段：
  //   HooksDispatcherOnUpdate.useState(0)
  //     ↓
  //   updateState(0)
  //     ↓
  //   从 Hooks 链表读取 Hook 对象
  //   处理更新队列
  //   计算新状态
  
  
  // 🔥 调用 useEffect
  useEffect(() => {
    console.log('effect');
    return () => console.log('cleanup');
  }, [count]);
  
  // 实际执行的是：
  // ReactCurrentDispatcher.current.useEffect(...)
  
  // 挂载阶段：
  //   mountEffect(...)
  //     ↓
  //   mountEffectImpl(PassiveEffect | PassiveStaticEffect, HookPassive, ...)
  //     ↓
  //   创建 Hook 对象和 Effect 对象
  //   标记 fiber.flags |= PassiveEffect
  
  // 更新阶段：
  //   updateEffect(...)
  //     ↓
  //   updateEffectImpl(PassiveEffect, HookPassive, ...)
  //     ↓
  //   比较依赖数组
  //   如果依赖变化，标记需要执行
  
  
  return <div>{count}</div>;
}


Hooks Dispatcher 对象：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// 挂载阶段的 dispatcher
const HooksDispatcherOnMount = {
  useState: mountState,
  useEffect: mountEffect,
  useLayoutEffect: mountLayoutEffect,
  useMemo: mountMemo,
  useCallback: mountCallback,
  useRef: mountRef,
  useContext: readContext,
  // ... 其他 Hooks
};

// 更新阶段的 dispatcher
const HooksDispatcherOnUpdate = {
  useState: updateState,
  useEffect: updateEffect,
  useLayoutEffect: updateLayoutEffect,
  useMemo: updateMemo,
  useCallback: updateCallback,
  useRef: updateRef,
  useContext: readContext,
  // ... 其他 Hooks
};

// Rerender 阶段的 dispatcher
const HooksDispatcherOnRerender = {
  useState: rerenderState,
  useEffect: updateEffect,
  // ...
};


步骤 5：返回子元素，继续 Diff
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

renderWithHooks 返回 children 后：

updateFunctionComponent() {
  let nextChildren = renderWithHooks(...);  // 执行完成，得到 JSX
  
  // 🔥 进行 Diff
  reconcileChildren(current, workInProgress, nextChildren, renderLanes);
  
  return workInProgress.child;  // 返回子 Fiber
}

reconcileChildren 会：
  1. 比较新旧子元素
  2. 执行 Diff 算法
  3. 创建/复用子 Fiber 节点
  4. 标记副作用（Placement、Update、Deletion）

然后继续遍历子 Fiber（继续 beginWork）`}
      </pre>
    </div>
  );
}

function SourceCodeAnalysis() {
  return (
    <div>
      <h3>关键源码片段</h3>
      <pre style={{ background: '#f5f5f5', padding: '15px', borderRadius: '5px', overflow: 'auto', fontSize: '13px', lineHeight: '1.8' }}>
{`1. beginWork 中处理 FunctionComponent
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ReactFiberBeginWork.old.js (line ~3798)

function beginWork(
  current: Fiber | null,
  workInProgress: Fiber,
  renderLanes: Lanes,
): Fiber | null {
  // ...
  
  switch (workInProgress.tag) {
    case FunctionComponent: {
      const Component = workInProgress.type;  // 🔥 获取组件函数
      const unresolvedProps = workInProgress.pendingProps;
      const resolvedProps =
        workInProgress.elementType === Component
          ? unresolvedProps
          : resolveDefaultProps(Component, unresolvedProps);
      
      // 🔥 调用 updateFunctionComponent
      return updateFunctionComponent(
        current,
        workInProgress,
        Component,
        resolvedProps,
        renderLanes,
      );
    }
    // ... 其他 case
  }
}


2. updateFunctionComponent
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ReactFiberBeginWork.old.js (line ~956)

function updateFunctionComponent(
  current,
  workInProgress,
  Component,
  nextProps,
  renderLanes,
) {
  
  let context;
  if (!disableLegacyContext) {
    const unmaskedContext = getUnmaskedContext(workInProgress, Component, true);
    context = getMaskedContext(workInProgress, unmaskedContext);
  }
  
  let nextChildren;
  let hasId;
  prepareToReadContext(workInProgress, renderLanes);
  
  // 🔥🔥 调用 renderWithHooks
  nextChildren = renderWithHooks(
    current,
    workInProgress,
    Component,
    nextProps,
    context,
    renderLanes,
  );
  hasId = checkDidRenderIdHook();
  
  if (current !== null && !didReceiveUpdate) {
    bailoutHooks(current, workInProgress, renderLanes);
    return bailoutOnAlreadyFinishedWork(current, workInProgress, renderLanes);
  }
  
  if (getIsHydrating() && hasId) {
    pushMaterializedTreeId(workInProgress);
  }
  
  workInProgress.flags |= PerformedWork;
  
  // 🔥 Diff 子元素
  reconcileChildren(current, workInProgress, nextChildren, renderLanes);
  
  return workInProgress.child;
}


3. renderWithHooks - 核心函数
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ReactFiberHooks.old.js (line ~365)

export function renderWithHooks<Props, SecondArg>(
  current: Fiber | null,
  workInProgress: Fiber,
  Component: (p: Props, arg: SecondArg) => any,
  props: Props,
  secondArg: SecondArg,
  nextRenderLanes: Lanes,
): any {
  
  renderLanes = nextRenderLanes;
  currentlyRenderingFiber = workInProgress;  // 🔥 设置当前 Fiber
  
  // 🔥 重置 Hooks 链表
  workInProgress.memoizedState = null;
  workInProgress.updateQueue = null;
  workInProgress.lanes = NoLanes;
  
  // 🔥🔥 设置 dispatcher（决定 Hooks 的行为）
  ReactCurrentDispatcher.current =
    current === null || current.memoizedState === null
      ? HooksDispatcherOnMount    // 挂载阶段
      : HooksDispatcherOnUpdate;  // 更新阶段
  
  // 🔥🔥🔥 执行组件函数
  let children = Component(props, secondArg);
  
  // 处理在渲染过程中的更新
  if (didScheduleRenderPhaseUpdateDuringThisPass) {
    let numberOfReRenders: number = 0;
    do {
      didScheduleRenderPhaseUpdateDuringThisPass = false;
      localIdCounter = 0;
      
      numberOfReRenders += 1;
      
      currentHook = null;
      workInProgressHook = null;
      
      workInProgress.updateQueue = null;
      
      ReactCurrentDispatcher.current = HooksDispatcherOnRerender;
      
      children = Component(props, secondArg);
    } while (didScheduleRenderPhaseUpdateDuringThisPass);
  }
  
  // 🔥 重置 dispatcher
  ReactCurrentDispatcher.current = ContextOnlyDispatcher;
  
  const didRenderTooFewHooks =
    currentHook !== null && currentHook.next !== null;
  
  // 🔥 清理全局状态
  renderLanes = NoLanes;
  currentlyRenderingFiber = (null: any);
  
  currentHook = null;
  workInProgressHook = null;
  
  didScheduleRenderPhaseUpdate = false;
  
  if (didRenderTooFewHooks) {
    throw new Error(
      'Rendered fewer hooks than expected. ' +
      'This may be caused by an accidental early return statement.',
    );
  }
  
  return children;
}


4. useState 的实现（mountState 和 updateState）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ReactFiberHooks.old.js (line ~1143)

// 挂载阶段
function mountState<S>(
  initialState: (() => S) | S,
): [S, Dispatch<BasicStateAction<S>>] {
  // 🔥 创建 Hook 对象
  const hook = mountWorkInProgressHook();
  
  if (typeof initialState === 'function') {
    initialState = initialState();
  }
  
  // 🔥 设置初始状态
  hook.memoizedState = hook.baseState = initialState;
  
  // 🔥 创建更新队列
  const queue = {
    pending: null,
    lanes: NoLanes,
    dispatch: null,
    lastRenderedReducer: basicStateReducer,
    lastRenderedState: (initialState: any),
  };
  hook.queue = queue;
  
  // 🔥 创建 dispatch 函数
  const dispatch: Dispatch<BasicStateAction<S>> = 
    (queue.dispatch = (dispatchSetState.bind(
      null,
      currentlyRenderingFiber,
      queue,
    ): any));
  
  return [hook.memoizedState, dispatch];
}

// 更新阶段
function updateState<S>(
  initialState: (() => S) | S,
): [S, Dispatch<BasicStateAction<S>>] {
  return updateReducer(basicStateReducer, (initialState: any));
}


5. useEffect 的实现（mountEffect 和 updateEffect）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ReactFiberHooks.old.js (line ~1560)

// 挂载阶段
function mountEffect(
  create: () => (() => void) | void,
  deps: Array<mixed> | void | null,
): void {
  return mountEffectImpl(
    PassiveEffect | PassiveStaticEffect,
    HookPassive,
    create,
    deps,
  );
}

function mountEffectImpl(fiberFlags, hookFlags, create, deps): void {
  // 🔥 创建 Hook 对象
  const hook = mountWorkInProgressHook();
  const nextDeps = deps === undefined ? null : deps;
  
  // 🔥 标记 Fiber 有 Passive Effect
  currentlyRenderingFiber.flags |= fiberFlags;
  
  // 🔥 创建 Effect 对象并存储
  hook.memoizedState = pushEffect(
    HookHasEffect | hookFlags,
    create,
    undefined,
    nextDeps,
  );
}

// 更新阶段
function updateEffect(
  create: () => (() => void) | void,
  deps: Array<mixed> | void | null,
): void {
  return updateEffectImpl(PassiveEffect, HookPassive, create, deps);
}

function updateEffectImpl(fiberFlags, hookFlags, create, deps): void {
  // 🔥 获取 Hook 对象
  const hook = updateWorkInProgressHook();
  const nextDeps = deps === undefined ? null : deps;
  let destroy = undefined;
  
  if (currentHook !== null) {
    const prevEffect = currentHook.memoizedState;
    destroy = prevEffect.destroy;
    
    if (nextDeps !== null) {
      const prevDeps = prevEffect.deps;
      
      // 🔥 比较依赖数组
      if (areHookInputsEqual(nextDeps, prevDeps)) {
        // 依赖未变化，不需要执行
        hook.memoizedState = pushEffect(hookFlags, create, destroy, nextDeps);
        return;
      }
    }
  }
  
  // 🔥 依赖变化，标记需要执行
  currentlyRenderingFiber.flags |= fiberFlags;
  
  hook.memoizedState = pushEffect(
    HookHasEffect | hookFlags,
    create,
    destroy,
    nextDeps,
  );
}


关键变量：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// 全局变量（ReactFiberHooks.old.js）

let currentlyRenderingFiber: Fiber = (null: any);  // 当前正在渲染的 Fiber
let currentHook: Hook | null = null;               // 当前的 Hook（current 树）
let workInProgressHook: Hook | null = null;        // 当前的 Hook（workInProgress 树）
let renderLanes: Lanes = NoLanes;                  // 当前渲染的优先级

// ReactCurrentDispatcher.js
const ReactCurrentDispatcher = {
  current: (null: null | Dispatcher),  // 🔥 当前的 Hooks dispatcher
};`}
      </pre>
    </div>
  );
}

function KeyPoints() {
  return (
    <div>
      <h3>关键理解点</h3>
      <div style={{ fontSize: '14px', lineHeight: '1.8' }}>
        
        <div style={{ background: '#e3f2fd', padding: '15px', borderRadius: '5px', marginBottom: '15px' }}>
          <h4 style={{ marginTop: 0 }}>1. Hooks 不是由 beginWork 直接调用</h4>
          <p style={{ margin: '5px 0' }}>
            beginWork → updateFunctionComponent → renderWithHooks → 执行组件函数 → Hooks 被调用
          </p>
          <p style={{ margin: '5px 0', color: '#666' }}>
            Hooks 是在组件函数执行时被调用的，不是 beginWork 直接调用的
          </p>
        </div>

        <div style={{ background: '#e8f5e9', padding: '15px', borderRadius: '5px', marginBottom: '15px' }}>
          <h4 style={{ marginTop: 0 }}>2. dispatcher 机制</h4>
          <p style={{ margin: '5px 0' }}>
            renderWithHooks 会根据挂载/更新阶段设置不同的 dispatcher：
          </p>
          <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
            <li>挂载阶段：HooksDispatcherOnMount（mountState、mountEffect 等）</li>
            <li>更新阶段：HooksDispatcherOnUpdate（updateState、updateEffect 等）</li>
            <li>Rerender：HooksDispatcherOnRerender</li>
          </ul>
        </div>

        <div style={{ background: '#fff9c4', padding: '15px', borderRadius: '5px', marginBottom: '15px' }}>
          <h4 style={{ marginTop: 0 }}>3. 全局状态</h4>
          <p style={{ margin: '5px 0' }}>
            renderWithHooks 执行前会设置全局状态：
          </p>
          <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
            <li>currentlyRenderingFiber：当前正在渲染的 Fiber</li>
            <li>ReactCurrentDispatcher.current：Hooks dispatcher</li>
            <li>currentHook / workInProgressHook：Hook 链表指针</li>
          </ul>
          <p style={{ margin: '5px 0', color: '#666' }}>
            执行后会清理这些全局状态，防止在组件外使用 Hooks
          </p>
        </div>

        <div style={{ background: '#f3e5f5', padding: '15px', borderRadius: '5px', marginBottom: '15px' }}>
          <h4 style={{ marginTop: 0 }}>4. Hooks 链表结构</h4>
          <p style={{ margin: '5px 0' }}>
            每次调用 Hook 都会创建/获取一个 Hook 对象，通过 next 指针连接成链表
          </p>
          <pre style={{ background: '#fff', padding: '10px', fontSize: '12px', margin: '10px 0' }}>
{`Hook 对象结构：
{
  memoizedState: any,  // 保存状态值
  queue: UpdateQueue,  // 更新队列
  next: Hook | null,   // 下一个 Hook
}`}
          </pre>
        </div>

        <div style={{ background: '#ffebee', padding: '15px', borderRadius: '5px' }}>
          <h4 style={{ marginTop: 0 }}>5. 执行时机</h4>
          <p style={{ margin: '5px 0' }}>
            ✅ Hooks 调用在 Render 阶段执行（beginWork）<br/>
            ✅ 每次组件重新渲染都会执行 Hooks<br/>
            ⚠️ useEffect/useLayoutEffect 只是注册，回调不在这里执行<br/>
            ✅ useLayoutEffect 回调在 Commit 阶段同步执行<br/>
            ✅ useEffect 回调在 Commit 阶段后异步执行
          </p>
        </div>

      </div>
    </div>
  );
}

function PracticalExample() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState('React');

  return (
    <div>
      <h3>实际示例</h3>
      
      <div style={{ background: '#e3f2fd', padding: '15px', borderRadius: '5px', marginBottom: '15px' }}>
        <h4 style={{ marginTop: 0 }}>示例组件</h4>
        <pre style={{ background: '#fff', padding: '10px', fontSize: '13px', overflow: 'auto' }}>
{`function MyComponent() {
  console.log('1. 组件函数开始执行');
  
  // 🔥 调用 useState（第一个 Hook）
  const [count, setCount] = useState(0);
  console.log('2. useState 执行完成');
  
  // 🔥 调用 useState（第二个 Hook）
  const [name, setName] = useState('React');
  console.log('3. useState 执行完成');
  
  // 🔥 调用 useEffect（第三个 Hook）
  useEffect(() => {
    console.log('5. useEffect 回调执行（Commit 后）');
  }, [count]);
  console.log('4. useEffect 注册完成');
  
  return <div>{count} - {name}</div>;
}`}
        </pre>
      </div>

      <div style={{ background: '#fff', padding: '15px', border: '1px solid #ddd', borderRadius: '5px', marginBottom: '15px' }}>
        <h4 style={{ marginTop: 0 }}>测试组件</h4>
        <p>Count: {count}</p>
        <p>Name: {name}</p>
        <button
          onClick={() => setCount(count + 1)}
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
          Increment Count
        </button>
        <button
          onClick={() => setName(name === 'React' ? 'Vue' : 'React')}
          style={{
            padding: '10px 20px',
            background: '#4caf50',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Toggle Name
        </button>
      </div>

      <div style={{ background: '#fff3e0', padding: '15px', borderRadius: '5px' }}>
        <h4 style={{ marginTop: 0 }}>执行流程</h4>
        <p style={{ fontSize: '14px', lineHeight: '1.8', margin: 0 }}>
          1. 点击按钮触发 setState<br/>
          2. 调度更新，进入 Render 阶段<br/>
          3. performUnitOfWork 处理这个 Fiber<br/>
          4. beginWork 判断是 FunctionComponent<br/>
          5. 调用 updateFunctionComponent<br/>
          6. 调用 renderWithHooks，设置 dispatcher<br/>
          7. 执行组件函数 MyComponent(props)<br/>
          8. 组件函数中的 useState、useEffect 被依次调用<br/>
          9. 返回 JSX，进行 Diff<br/>
          10. 继续 Render 阶段的其他工作<br/>
          11. 进入 Commit 阶段，更新 DOM<br/>
          12. Commit 后异步执行 useEffect 的回调
        </p>
      </div>
    </div>
  );
}
