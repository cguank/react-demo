import React, { useState, useMemo, useEffect, useLayoutEffect } from 'react';

/**
 * useMemo 是在 render 阶段执行的吗？
 * 
 * 核心问题：
 * 1. useMemo 的执行时机
 * 2. render 阶段的定义
 * 3. useMemo 和其他 Hook 的执行时机对比
 * 4. useMemo 的计算函数何时执行
 */

export default function UseMemoRenderPhase() {
  const [expandedSection, setExpandedSection] = useState(null);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '1400px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', color: '#61dafb' }}>⚛️ useMemo 执行阶段分析</h1>
      
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
        title="⏱️ 执行时机对比"
        id="timing"
        expanded={expandedSection === 'timing'}
        onToggle={() => setExpandedSection(expandedSection === 'timing' ? null : 'timing')}
      >
        <TimingComparison />
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
{`useMemo 执行阶段
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

核心答案：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ 是的，useMemo 是在 render 阶段执行的！

详细说明：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

useMemo 在 render 阶段的 beginWork 中执行，
具体是在 renderWithHooks 调用组件函数时执行。


执行流程：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Render 阶段
   ├─ renderRootSync/renderRootConcurrent
   │  └─ workLoopSync/workLoopConcurrent
   │     └─ performUnitOfWork
   │        └─ beginWork
   │           └─ updateFunctionComponent
   │              └─ renderWithHooks
   │                 └─ 🔥 Component 函数执行
   │                    └─ 🔥 useMemo 执行（计算或返回缓存）
   │
2. Commit 阶段
   ├─ commitBeforeMutationEffects
   ├─ commitMutationEffects（DOM 操作）
   ├─ commitLayoutEffects（useLayoutEffect create）
   └─ scheduleCallback
      └─ flushPassiveEffects（useEffect）


关键时间点：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Render 阶段（🔥 useMemo 在这里执行）
  ↓
  处理 Fiber 树
  标记副作用
  🔥 调用组件函数
  🔥 执行 useMemo
  ↓
Commit 阶段（useMemo 不在这里）
  ↓
  操作 DOM
  执行 useLayoutEffect
  执行 useEffect


为什么在 render 阶段？
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. useMemo 返回计算值
   - 组件需要这个值来渲染
   - 必须在 render 阶段计算
   - 用于生成 JSX

2. 组件函数执行时调用
   - useMemo 是 Hook
   - Hook 在组件函数中调用
   - 组件函数在 render 阶段执行

3. 需要返回值参与渲染
   function MyComponent() {
     const value = useMemo(() => compute(), [deps]);
     return <div>{value}</div>;  // 🔥 需要在 render 时就有值
   }


对比其他 Hook：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Render 阶段执行：
  ✅ useState（返回 state）
  ✅ useMemo（返回计算值）
  ✅ useCallback（返回函数）
  ✅ useRef（返回 ref 对象）
  ✅ useContext（返回 context 值）
  🔥 这些都返回值，用于渲染

Render 阶段注册，Commit 阶段执行：
  ⏰ useEffect（注册 effect，异步执行）
  ⏰ useLayoutEffect（注册 effect，同步执行）
  🔥 这些是副作用，不返回值


示例理解：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function ExpensiveComponent({ data }) {
  console.log('1. 组件函数开始执行');  // Render 阶段
  
  const [count, setCount] = useState(0);  // Render 阶段
  console.log('2. useState 执行完成');
  
  // 🔥 useMemo 在 render 阶段执行
  const processed = useMemo(() => {
    console.log('3. useMemo 计算函数执行');  // Render 阶段
    return data.map(item => item * 2);
  }, [data]);
  console.log('4. useMemo 执行完成');
  
  useEffect(() => {
    console.log('7. useEffect 执行');  // Commit 后（异步）
  });
  
  useLayoutEffect(() => {
    console.log('6. useLayoutEffect 执行');  // Commit 阶段
  });
  
  console.log('5. 返回 JSX');  // Render 阶段
  return <div>{processed[0]}</div>;
}

输出顺序：
1. 组件函数开始执行
2. useState 执行完成
3. useMemo 计算函数执行（🔥 render 阶段）
4. useMemo 执行完成
5. 返回 JSX
6. useLayoutEffect 执行（commit 阶段）
7. useEffect 执行（commit 后）


关键结论：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔥 useMemo 在 render 阶段执行
🔥 和组件函数同步执行
🔥 在 commit 阶段之前
🔥 在 DOM 操作之前
🔥 在 useEffect 之前
🔥 在 useLayoutEffect 之前`}
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

1. renderWithHooks - 执行组件函数
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ReactFiberHooks.old.js (line ~360)

export function renderWithHooks(
  current,
  workInProgress,
  Component,  // 🔥 组件函数
  props,
  secondArg,
  nextRenderLanes,
) {
  renderLanes = nextRenderLanes;
  currentlyRenderingFiber = workInProgress;

  // 清空状态
  workInProgress.memoizedState = null;
  workInProgress.updateQueue = null;

  // 🔥 设置 Hooks Dispatcher
  ReactCurrentDispatcher.current =
    current === null || current.memoizedState === null
      ? HooksDispatcherOnMount    // 首次渲染
      : HooksDispatcherOnUpdate;  // 更新渲染

  // 🔥 执行组件函数（render 阶段）
  let children = Component(props, secondArg);
  // ↑ 在这里执行组件函数
  // ↑ useMemo 在组件函数内被调用
  // ↑ 所以 useMemo 在 render 阶段执行

  // ... 后续处理

  return children;
}


2. useMemo 的实现
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ReactFiberHooks.old.js (line ~1620)

// 🔥 首次挂载
function mountMemo<T>(
  nextCreate: () => T,      // 计算函数
  deps: Array<mixed> | void | null,  // 依赖数组
): T {
  // 创建 Hook 对象
  const hook = mountWorkInProgressHook();
  const nextDeps = deps === undefined ? null : deps;
  
  // 🔥 立即执行计算函数（render 阶段）
  const nextValue = nextCreate();
  
  // 缓存值和依赖
  hook.memoizedState = [nextValue, nextDeps];
  
  // 🔥 返回计算值
  return nextValue;
}

// 🔥 更新渲染
function updateMemo<T>(
  nextCreate: () => T,
  deps: Array<mixed> | void | null,
): T {
  // 获取当前 Hook
  const hook = updateWorkInProgressHook();
  const nextDeps = deps === undefined ? null : deps;
  const prevState = hook.memoizedState;
  
  if (prevState !== null) {
    if (nextDeps !== null) {
      const prevDeps = prevState[1];
      
      // 🔥 比较依赖（render 阶段）
      if (areHookInputsEqual(nextDeps, prevDeps)) {
        // 依赖未变化，返回缓存值
        return prevState[0];
      }
    }
  }
  
  // 🔥 依赖变化，重新计算（render 阶段）
  const nextValue = nextCreate();
  
  // 缓存新值
  hook.memoizedState = [nextValue, nextDeps];
  
  // 🔥 返回新值
  return nextValue;
}


3. Dispatcher 配置
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const HooksDispatcherOnMount = {
  useState: mountState,
  useEffect: mountEffect,
  useMemo: mountMemo,      // 🔥 首次挂载
  useCallback: mountCallback,
  // ...
};

const HooksDispatcherOnUpdate = {
  useState: updateState,
  useEffect: updateEffect,
  useMemo: updateMemo,     // 🔥 更新渲染
  useCallback: updateCallback,
  // ...
};


执行调用链：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

用户调用：
  const value = useMemo(() => compute(), [deps]);

React 内部：
  1. useMemo 调用 ReactCurrentDispatcher.current.useMemo
     ↓
  2. 根据是首次挂载还是更新，调用：
     - mountMemo（首次）
     - updateMemo（更新）
     ↓
  3. mountMemo/updateMemo 执行：
     - 创建/获取 Hook 对象
     - 比较依赖（updateMemo）
     - 🔥 调用 nextCreate()（计算函数）
     - 缓存结果到 hook.memoizedState
     - 返回值
     ↓
  4. 值用于组件的 JSX 渲染


时间线分析：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

假设组件：
function MyComponent({ data }) {
  const processed = useMemo(() => {
    console.log('Computing...');
    return data.map(x => x * 2);
  }, [data]);
  
  return <div>{processed[0]}</div>;
}

执行流程：

━━━━ Render 阶段开始 ━━━━

0ms:
  beginWork(<MyComponent> Fiber)
    ↓
  updateFunctionComponent()
    ↓
  renderWithHooks()
    ↓
  🔥 Component(props) 开始执行
    ↓
  useMemo(() => ..., [data])
    ↓
  updateMemo() 被调用
    ↓
    检查依赖：data 变了吗？
    ├─ 未变：返回缓存值（0.001ms）
    └─ 变了：执行计算函数（1ms）
         console.log('Computing...')
         data.map(x => x * 2)
    ↓
  useMemo 返回 processed
    ↓
  生成 JSX：<div>{processed[0]}</div>
    ↓
  Component(props) 执行完成
    ↓
  返回 children
    ↓
  beginWork 完成

1ms:
  completeWork()
    标记 flags
    收集副作用

━━━━ Render 阶段结束 ━━━━

━━━━ Commit 阶段开始 ━━━━

2ms:
  commitMutationEffects()
    更新 DOM：<div>2</div>

3ms:
  commitLayoutEffects()
    执行 useLayoutEffect

━━━━ Commit 阶段结束 ━━━━

4ms:
  scheduleCallback()
    调度 useEffect

5ms:
  flushPassiveEffects()
    执行 useEffect

━━━━ 完成 ━━━━


关键证据：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

证据 1：useMemo 返回值
  - useMemo 返回计算结果
  - 返回值用于 JSX
  - 必须在 render 阶段就有值

证据 2：执行位置
  - useMemo 在组件函数内调用
  - 组件函数在 renderWithHooks 中执行
  - renderWithHooks 在 beginWork 中调用
  - beginWork 在 render 阶段执行

证据 3：没有 effect 标记
  - useEffect 会标记 Passive flag
  - useLayoutEffect 会标记 Layout flag
  - useMemo 不标记任何 effect flag
  - 说明它不是副作用，是同步计算

证据 4：时机对比
  Hook 类型          执行阶段        是否异步
  ────────────────────────────────────────
  useMemo           Render          否
  useCallback       Render          否
  useState          Render          否
  useEffect         Commit 后       是
  useLayoutEffect   Commit          否


对比 useEffect：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

useEffect 注册（Render 阶段）：
function mountEffect(create, deps) {
  return mountEffectImpl(
    PassiveEffect | PassiveStaticEffect,  // 🔥 标记 flags
    HookPassive,
    create,
    deps,
  );
}

// 🔥 只是注册，不执行 create
// 🔥 create 在 commit 后执行

useEffect 执行（Commit 后）：
commitRootImpl()
  ↓
commitLayoutEffects()
  ↓
scheduleCallback(() => {
  flushPassiveEffects();  // 🔥 这里执行 useEffect
});


总结：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔥 useMemo 的计算函数在 render 阶段执行
🔥 在 renderWithHooks 调用组件函数时执行
🔥 和组件函数同步执行
🔥 不是副作用，是同步计算
🔥 返回值立即可用于渲染`}
      </pre>
    </div>
  );
}

function TimingComparison() {
  return (
    <div>
      <pre style={{ background: '#f5f5f5', padding: '15px', borderRadius: '5px', overflow: 'auto', fontSize: '13px', lineHeight: '1.8' }}>
{`执行时机详细对比
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

完整时间线：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function MyComponent({ data }) {
  console.log('1. 组件开始执行');
  
  // ━━━━ Render 阶段 Hook ━━━━
  
  const [count, setCount] = useState(0);
  console.log('2. useState:', count);
  
  const ref = useRef(null);
  console.log('3. useRef:', ref.current);
  
  const contextValue = useContext(MyContext);
  console.log('4. useContext:', contextValue);
  
  // 🔥 useMemo：立即计算或返回缓存
  const memoValue = useMemo(() => {
    console.log('5. useMemo 计算函数执行');
    return data.map(x => x * 2);
  }, [data]);
  console.log('6. useMemo 返回:', memoValue);
  
  // 🔥 useCallback：立即返回函数或缓存
  const callback = useCallback(() => {
    console.log('callback 函数');
  }, [count]);
  console.log('7. useCallback 返回');
  
  // ━━━━ Effect Hook（注册） ━━━━
  
  useEffect(() => {
    console.log('11. useEffect 执行');  // 🔥 Commit 后
    return () => console.log('cleanup');
  }, [count]);
  console.log('8. useEffect 注册完成');
  
  useLayoutEffect(() => {
    console.log('10. useLayoutEffect 执行');  // 🔥 Commit 中
  }, [count]);
  console.log('9. useLayoutEffect 注册完成');
  
  console.log('10. 返回 JSX');
  return <div ref={ref}>{memoValue[0]}</div>;
}

输出顺序：
  1. 组件开始执行
  2. useState: 0
  3. useRef: null
  4. useContext: {...}
  5. useMemo 计算函数执行        🔥 Render 阶段
  6. useMemo 返回: [2, 4, 6]     🔥 Render 阶段
  7. useCallback 返回            🔥 Render 阶段
  8. useEffect 注册完成          🔥 Render 阶段（注册）
  9. useLayoutEffect 注册完成    🔥 Render 阶段（注册）
  10. 返回 JSX
  ── Render 阶段结束 ──
  ── Commit 阶段开始 ──
  10. useLayoutEffect 执行       🔥 Commit 阶段（执行）
  ── Commit 阶段结束 ──
  11. useEffect 执行             🔥 Commit 后（异步）


Hook 分类：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. 立即返回值的 Hook（Render 阶段执行）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Hook            返回值          何时计算         缓存
──────────────────────────────────────────────────
useState        state 值        每次 render      是
useReducer      state 值        每次 render      是
useRef          ref 对象        首次 render      是
useContext      context 值      每次 render      否
useMemo         计算结果        依赖变化时       是
useCallback     函数            依赖变化时       是

特点：
  ✅ 返回值用于 JSX
  ✅ 必须在 render 阶段完成
  ✅ 同步执行
  ✅ 不操作 DOM
  ✅ 无副作用


2. 副作用 Hook（Commit 阶段执行）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Hook              注册阶段      执行阶段         是否异步
────────────────────────────────────────────────────
useEffect         Render       Commit 后        是
useLayoutEffect   Render       Commit           否
useInsertionEffect Render      Commit 前        否

特点：
  ✅ 操作 DOM
  ✅ 订阅事件
  ✅ 请求数据
  ✅ 有副作用
  ⚠️ 不返回值供 JSX 使用


详细对比：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

useMemo vs useEffect
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

特性              useMemo                useEffect
──────────────────────────────────────────────────
执行阶段          Render                 Commit 后
是否异步          否（同步）             是（异步）
返回值            有（计算结果）         无
用途              缓存计算值             副作用
能否操作 DOM      不推荐                 可以
阻塞渲染          是（render 阶段）      否（异步）
执行时机          组件函数执行时         DOM 更新后
依赖变化          重新计算               重新执行

示例：
// useMemo：缓存计算结果
const value = useMemo(() => {
  return expensiveCalculation(a, b);
}, [a, b]);

// useEffect：执行副作用
useEffect(() => {
  document.title = \`Count: \${count}\`;
}, [count]);


useMemo vs useCallback
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

特性              useMemo                useCallback
──────────────────────────────────────────────────
执行阶段          Render                 Render
返回值            任意值                 函数
计算函数          执行                   不执行
依赖变化          重新计算               重新创建函数
用途              缓存计算值             缓存函数引用

关系：
useCallback(fn, deps) 
  等价于 
useMemo(() => fn, deps)

示例：
// useMemo：缓存计算结果
const sortedList = useMemo(() => {
  return list.sort((a, b) => a - b);
}, [list]);

// useCallback：缓存函数
const handleClick = useCallback(() => {
  console.log(count);
}, [count]);


时间线可视化：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

时间 | Render 阶段                      | Commit 阶段
─────┼──────────────────────────────────┼─────────────────
0ms  | beginWork                        |
     |   renderWithHooks                |
     |     组件函数执行                 |
     |       useState 🔥                |
     |       useRef 🔥                  |
     |       useMemo 🔥 计算或缓存      |
     |       useCallback 🔥 返回函数    |
     |       useEffect 注册 ⏰          |
     |       useLayoutEffect 注册 ⏰    |
     |       返回 JSX                   |
     |   completeWork                   |
1ms  |                                  | commitBeforeMutation
     |                                  | commitMutation（DOM）
     |                                  | commitLayout
     |                                  |   useLayoutEffect 🔥
2ms  |                                  | scheduleCallback
     |                                  |   useEffect 🔥（异步）


实际示例：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

示例 1：计算派生状态
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function FilteredList({ items, filter }) {
  // 🔥 在 render 阶段计算
  const filteredItems = useMemo(() => {
    console.log('Filtering...');
    return items.filter(item => item.includes(filter));
  }, [items, filter]);
  
  // 🔥 filteredItems 立即可用
  return (
    <ul>
      {filteredItems.map(item => <li key={item}>{item}</li>)}
    </ul>
  );
}

执行：
  1. render 阶段：useMemo 计算 filteredItems
  2. render 阶段：生成 JSX
  3. commit 阶段：更新 DOM


示例 2：对比 useEffect
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

❌ 错误：用 useEffect 计算渲染值
function BadExample({ data }) {
  const [processed, setProcessed] = useState([]);
  
  useEffect(() => {
    // 🔥 commit 后才执行
    const result = data.map(x => x * 2);
    setProcessed(result);  // 触发新的渲染
  }, [data]);
  
  // 🔥 第一次渲染：processed = []（空的！）
  // 🔥 需要两次渲染才能显示数据
  return <div>{processed[0]}</div>;
}

✅ 正确：用 useMemo 计算渲染值
function GoodExample({ data }) {
  // 🔥 render 阶段立即计算
  const processed = useMemo(() => {
    return data.map(x => x * 2);
  }, [data]);
  
  // 🔥 第一次渲染就有正确的值
  return <div>{processed[0]}</div>;
}


性能对比：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

场景：处理 1000 个数据项

方案 A：直接计算（每次 render）
  const processed = data.map(x => x * 2);  // 1ms
  问题：每次 render 都计算（即使 data 没变）

方案 B：useMemo 缓存（render 阶段）
  const processed = useMemo(() => {
    return data.map(x => x * 2);  // 1ms（仅 data 变化时）
  }, [data]);
  优点：data 不变时，返回缓存（0.001ms）

方案 C：useEffect 计算（错误）
  const [processed, setProcessed] = useState([]);
  useEffect(() => {
    setProcessed(data.map(x => x * 2));
  }, [data]);
  问题：
    - 第一次渲染显示空数据
    - 需要两次渲染
    - 性能差


总结：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔥 useMemo 在 render 阶段执行
🔥 和 useState、useCallback 同阶段
🔥 比 useEffect、useLayoutEffect 早
🔥 返回值立即可用于 JSX
🔥 不要用 useEffect 替代 useMemo`}
      </pre>
    </div>
  );
}

function LiveDemo() {
  const [count, setCount] = useState(0);
  const [text, setText] = useState('');
  const [logs, setLogs] = useState([]);

  const addLog = (message) => {
    setLogs(prev => [...prev, `${new Date().getTime()}: ${message}`]);
  };

  // 🔥 useMemo：在 render 阶段执行
  const expensiveValue = useMemo(() => {
    addLog('🔥 useMemo 计算函数执行（Render 阶段）');
    let result = 0;
    for (let i = 0; i < count * 1000000; i++) {
      result += i;
    }
    return result;
  }, [count]);

  // useEffect：在 commit 后执行
  useEffect(() => {
    addLog('⏰ useEffect 执行（Commit 后，异步）');
    return () => {
      addLog('🧹 useEffect cleanup');
    };
  }, [count]);

  // useLayoutEffect：在 commit 阶段执行
  useLayoutEffect(() => {
    addLog('⚡ useLayoutEffect 执行（Commit 阶段，同步）');
  }, [count]);

  addLog('📝 组件 render 完成');

  return (
    <div style={{ padding: '20px', background: '#f9f9f9', borderRadius: '8px' }}>
      <h3>实时演示：Hook 执行顺序</h3>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={() => {
            setLogs([]);
            setCount(c => c + 1);
          }}
          style={{ padding: '10px 20px', fontSize: '16px', marginRight: '10px' }}
        >
          增加 Count: {count}
        </button>
        
        <button 
          onClick={() => setLogs([])}
          style={{ padding: '10px 20px', fontSize: '16px' }}
        >
          清空日志
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="输入文本（不触发 useMemo）"
          style={{ padding: '10px', fontSize: '16px', width: '300px' }}
        />
      </div>

      <div style={{ background: '#fff', padding: '15px', borderRadius: '5px' }}>
        <h4>计算结果:</h4>
        <p style={{ fontSize: '14px' }}>expensiveValue: {expensiveValue}</p>
        <p style={{ fontSize: '14px', color: '#666' }}>
          💡 点击按钮观察日志顺序，验证 useMemo 在 render 阶段执行
        </p>
      </div>

      <div style={{ background: '#fff', padding: '15px', borderRadius: '5px', marginTop: '20px' }}>
        <h4>执行日志:</h4>
        <pre style={{ 
          fontSize: '12px', 
          maxHeight: '300px', 
          overflow: 'auto',
          background: '#f5f5f5',
          padding: '10px',
          borderRadius: '4px'
        }}>
          {logs.length === 0 ? '点击按钮查看执行顺序' : logs.join('\n')}
        </pre>
      </div>

      <div style={{ background: '#e3f2fd', padding: '15px', borderRadius: '5px', marginTop: '20px' }}>
        <h4>观察要点:</h4>
        <ul style={{ fontSize: '14px', lineHeight: '1.8' }}>
          <li>🔥 useMemo 计算函数在 render 阶段执行（最早）</li>
          <li>📝 组件 render 完成</li>
          <li>⚡ useLayoutEffect 在 commit 阶段执行（同步）</li>
          <li>⏰ useEffect 在 commit 后执行（异步，最晚）</li>
          <li>💡 修改 text 不会触发 useMemo（依赖是 count）</li>
        </ul>
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

为什么 useMemo 必须在 render 阶段？
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

原因 1：返回值用于渲染
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function MyComponent({ items }) {
  // 🔥 filteredItems 用于 JSX
  const filteredItems = useMemo(() => {
    return items.filter(item => item.active);
  }, [items]);
  
  // 🔥 必须在返回 JSX 之前就有值
  return (
    <ul>
      {filteredItems.map(item => <li key={item.id}>{item.name}</li>)}
    </ul>
  );
}

如果 useMemo 在 commit 后执行：
  1. render 阶段：filteredItems = undefined
  2. 返回 JSX：<ul>{undefined.map(...)}</ul>  // 💥 报错！
  3. commit 阶段：计算 filteredItems
  
结论：useMemo 必须在 render 阶段完成


原因 2：组件函数是同步的
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// 组件函数必须同步返回 JSX
function MyComponent() {
  const value = useMemo(() => compute(), []);
  
  // 🔥 不能异步
  // await someAsyncOperation();  // ❌ 不支持
  
  return <div>{value}</div>;
}

// renderWithHooks 的实现
function renderWithHooks(Component, props) {
  // 🔥 同步调用
  const children = Component(props);  // 必须立即返回
  return children;
}

结论：useMemo 必须同步执行


原因 3：Fiber 架构要求
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Render 阶段的职责：
  - 计算新的状态
  - 生成新的 Fiber 树
  - 🔥 确定要渲染的内容

Commit 阶段的职责：
  - 操作 DOM
  - 执行副作用
  - 🔥 不应该影响渲染内容

如果 useMemo 在 commit 执行：
  - render 阶段不知道最终值
  - 无法生成正确的 Fiber 树
  - 破坏了 render/commit 的分离


useMemo 的性能考虑：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

场景 1：昂贵的计算
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

❌ 没有 useMemo
function ExpensiveList({ items }) {
  // 🔥 每次 render 都重新计算（即使 items 没变）
  const sorted = items.slice().sort((a, b) => a.value - b.value);
  
  return <List items={sorted} />;
}

// 如果父组件 setState 触发重渲染
<ExpensiveList items={items} />  // items 没变，但还是排序了

✅ 使用 useMemo
function ExpensiveList({ items }) {
  // 🔥 只在 items 变化时重新计算
  const sorted = useMemo(() => {
    return items.slice().sort((a, b) => a.value - b.value);
  }, [items]);
  
  return <List items={sorted} />;
}

性能提升：
  - items 不变：0.001ms（返回缓存）
  - items 变化：5ms（重新计算）


场景 2：保持引用稳定
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

❌ 没有 useMemo
function Parent() {
  const [count, setCount] = useState(0);
  
  // 🔥 每次 render 都创建新对象
  const config = { theme: 'dark', size: 'large' };
  
  // 🔥 Child 每次都重新渲染（即使 config 值没变）
  return <Child config={config} />;
}

const Child = React.memo(({ config }) => {
  console.log('Child render');
  return <div>{config.theme}</div>;
});

// 每次 Parent render，Child 都 render（因为 config 引用变了）

✅ 使用 useMemo
function Parent() {
  const [count, setCount] = useState(0);
  
  // 🔥 保持引用稳定
  const config = useMemo(() => ({
    theme: 'dark',
    size: 'large'
  }), []);  // 依赖为空，永远返回同一个对象
  
  // 🔥 Child 不会重新渲染
  return <Child config={config} />;
}


场景 3：依赖其他 useMemo
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function ComplexComponent({ data }) {
  // 步骤 1：过滤
  const filtered = useMemo(() => {
    return data.filter(item => item.active);
  }, [data]);
  
  // 步骤 2：排序（依赖步骤 1）
  const sorted = useMemo(() => {
    return filtered.slice().sort((a, b) => a.value - b.value);
  }, [filtered]);
  
  // 步骤 3：分组（依赖步骤 2）
  const grouped = useMemo(() => {
    return sorted.reduce((acc, item) => {
      const key = item.category;
      acc[key] = acc[key] || [];
      acc[key].push(item);
      return acc;
    }, {});
  }, [sorted]);
  
  return <GroupedList data={grouped} />;
}

优点：
  - 每一步都缓存
  - 只重新计算变化的步骤
  - 避免级联重计算


常见误区：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

误区 1：以为 useMemo 异步执行
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

❌ 错误理解
function MyComponent() {
  const value = useMemo(() => compute(), []);
  
  // 🔥 value 立即可用，不需要等待
  console.log(value);  // ✅ 有值
  
  return <div>{value}</div>;
}

✅ 正确理解
// useMemo 是同步的，立即返回值


误区 2：混淆 useMemo 和 useEffect
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

useMemo：
  - 计算值
  - 返回结果
  - render 阶段
  - 同步

useEffect：
  - 执行副作用
  - 无返回值
  - commit 后
  - 异步

❌ 不要这样做
function BadExample() {
  // ❌ 在 useMemo 中执行副作用
  const value = useMemo(() => {
    document.title = 'New Title';  // ❌ 副作用
    return compute();
  }, []);
  
  // ❌ 在 useEffect 中计算渲染值
  const [value, setValue] = useState(0);
  useEffect(() => {
    setValue(compute());  // ❌ 需要两次渲染
  }, []);
}

✅ 正确做法
function GoodExample() {
  // ✅ useMemo 计算值
  const value = useMemo(() => compute(), []);
  
  // ✅ useEffect 执行副作用
  useEffect(() => {
    document.title = 'New Title';
  }, []);
}


误区 3：过度使用 useMemo
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

❌ 不必要的 useMemo
function MyComponent({ a, b }) {
  // ❌ 简单计算不需要 useMemo
  const sum = useMemo(() => a + b, [a, b]);
  
  // ❌ 已经是原始值
  const message = useMemo(() => 'Hello', []);
  
  return <div>{sum} {message}</div>;
}

✅ 何时使用 useMemo
function MyComponent({ items }) {
  // ✅ 昂贵的计算
  const sorted = useMemo(() => {
    return items.slice().sort(...);  // O(n log n)
  }, [items]);
  
  // ✅ 保持引用稳定（传给 memo 组件）
  const config = useMemo(() => ({
    theme: 'dark'
  }), []);
  
  return <MemoChild config={config} items={sorted} />;
}


实际应用场景：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

场景 1：搜索/过滤列表
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function SearchableList({ items }) {
  const [query, setQuery] = useState('');
  
  // 🔥 render 阶段计算过滤结果
  const filtered = useMemo(() => {
    return items.filter(item => 
      item.name.toLowerCase().includes(query.toLowerCase())
    );
  }, [items, query]);
  
  return (
    <div>
      <input value={query} onChange={e => setQuery(e.target.value)} />
      <List items={filtered} />
    </div>
  );
}


场景 2：数据转换
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function Chart({ rawData }) {
  // 🔥 render 阶段转换数据格式
  const chartData = useMemo(() => {
    return rawData.map(item => ({
      x: item.timestamp,
      y: item.value,
      label: formatLabel(item)
    }));
  }, [rawData]);
  
  return <ChartComponent data={chartData} />;
}


场景 3：复杂选择器
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function UserList({ users, selectedIds }) {
  // 🔥 render 阶段计算选中的用户
  const selectedUsers = useMemo(() => {
    return users.filter(user => selectedIds.includes(user.id));
  }, [users, selectedIds]);
  
  return <SelectedUserList users={selectedUsers} />;
}


总结：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔥 useMemo 在 render 阶段同步执行
🔥 返回值立即可用于 JSX
🔥 用于缓存计算结果，不是执行副作用
🔥 保持引用稳定，配合 React.memo 使用
🔥 只在有性能问题时使用，不要过度优化`}
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

Q1: useMemo 是在 render 阶段还是 commit 阶段执行？
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

A: render 阶段

原因：
  1. useMemo 返回计算值，用于 JSX
  2. 必须在返回 JSX 之前就有值
  3. 在 renderWithHooks 中执行组件函数时调用
  4. 和 useState、useCallback 同阶段


Q2: useMemo 和 useEffect 的执行时机有什么区别？
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

A: 完全不同

useMemo：
  - Render 阶段执行
  - 同步执行
  - 返回计算值
  - 用于渲染

useEffect：
  - Commit 后执行
  - 异步执行
  - 无返回值
  - 用于副作用

示例：
function MyComponent() {
  const value = useMemo(() => {
    console.log('1. useMemo');  // 先执行
    return compute();
  }, []);
  
  useEffect(() => {
    console.log('2. useEffect');  // 后执行
  });
}


Q3: 为什么不能在 useEffect 中计算渲染值？
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

A: 会导致两次渲染

❌ 错误做法：
function BadExample({ data }) {
  const [processed, setProcessed] = useState([]);
  
  useEffect(() => {
    // 🔥 commit 后才执行
    setProcessed(data.map(x => x * 2));
  }, [data]);
  
  // 🔥 第一次渲染：processed = []（空的）
  // 🔥 第二次渲染：processed = [2, 4, 6]（正确）
  return <div>{processed[0]}</div>;
}

✅ 正确做法：
function GoodExample({ data }) {
  // 🔥 render 阶段立即计算
  const processed = useMemo(() => {
    return data.map(x => x * 2);
  }, [data]);
  
  // 🔥 第一次渲染就有正确的值
  return <div>{processed[0]}</div>;
}


Q4: useMemo 的计算函数何时执行？
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

A: 在 render 阶段，当依赖变化时执行

流程：
  1. 组件函数执行（render 阶段）
  2. 调用 useMemo
  3. 检查依赖是否变化
     ├─ 未变化：返回缓存值（0.001ms）
     └─ 变化：执行计算函数（可能较慢）
  4. 返回值用于 JSX

源码：
function updateMemo(nextCreate, deps) {
  const hook = updateWorkInProgressHook();
  const prevDeps = hook.memoizedState[1];
  
  // 🔥 比较依赖
  if (areHookInputsEqual(deps, prevDeps)) {
    return hook.memoizedState[0];  // 返回缓存
  }
  
  // 🔥 重新计算
  const nextValue = nextCreate();
  hook.memoizedState = [nextValue, deps];
  return nextValue;
}


Q5: useMemo 是同步还是异步的？
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

A: 同步的

证明：
function MyComponent() {
  const value = useMemo(() => {
    return compute();  // 🔥 立即执行
  }, []);
  
  console.log(value);  // 🔥 立即有值
  
  return <div>{value}</div>;
}

对比 useEffect（异步）：
function MyComponent() {
  useEffect(() => {
    console.log('async');  // 🔥 延迟执行
  });
  
  console.log('sync');  // 🔥 先输出
}


Q6: 何时应该使用 useMemo？
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

A: 两种场景

场景 1：昂贵的计算
  const sorted = useMemo(() => {
    return items.slice().sort(...);  // 耗时操作
  }, [items]);

场景 2：保持引用稳定
  const config = useMemo(() => ({
    theme: 'dark'
  }), []);
  
  return <MemoChild config={config} />;

不需要 useMemo：
  - 简单计算（a + b）
  - 原始值（字符串、数字）
  - 已经是稳定引用


Q7: useMemo 和 useCallback 的区别？
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

A: 返回值不同

useMemo：
  - 返回计算结果（任意值）
  - 执行计算函数
  const value = useMemo(() => compute(), [deps]);

useCallback：
  - 返回函数本身
  - 不执行函数
  const fn = useCallback(() => { ... }, [deps]);

关系：
  useCallback(fn, deps)
    等价于
  useMemo(() => fn, deps)


Q8: useMemo 会阻塞渲染吗？
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

A: 会，如果计算函数很慢

场景：
const value = useMemo(() => {
  // 🔥 超慢计算（100ms）
  for (let i = 0; i < 1000000000; i++) {
    // ...
  }
  return result;
}, []);

影响：
  - useMemo 在 render 阶段执行
  - 阻塞组件函数返回
  - 阻塞整个 Fiber 处理
  - 用户输入延迟 100ms

解决：
  1. 优化计算算法
  2. 分片计算（多次 render）
  3. Web Worker（后台计算）


Q9: useMemo 的依赖比较是深比较还是浅比较？
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

A: 浅比较（Object.is）

源码：
function areHookInputsEqual(nextDeps, prevDeps) {
  for (let i = 0; i < prevDeps.length; i++) {
    // 🔥 使用 Object.is
    if (Object.is(nextDeps[i], prevDeps[i])) {
      continue;
    }
    return false;
  }
  return true;
}

注意：
const obj = { a: 1 };
const value = useMemo(() => compute(), [obj]);

// obj 引用变化 → 重新计算
// obj 内容变化，引用不变 → 不重新计算


Q10: useMemo 在并发模式下会怎样？
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

A: 可能执行多次

并发模式：
  - render 阶段可中断
  - 可能重新执行组件函数
  - useMemo 可能执行多次

要求：
  - 🔥 计算函数必须是纯函数
  - 🔥 不能有副作用
  - 🔥 多次执行结果相同

❌ 不要这样做：
const value = useMemo(() => {
  count++;  // ❌ 副作用
  fetch('/api');  // ❌ 副作用
  return compute();
}, []);

✅ 正确做法：
const value = useMemo(() => {
  return compute();  // ✅ 纯函数
}, []);


记忆口诀：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

useMemo render 阶段执行
返回计算值用于渲染
同步执行不是异步
依赖变化才会重算
纯函数计算无副作用`}
      </pre>
    </div>
  );
}
