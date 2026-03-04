import React, { useState } from 'react';

/**
 * React 源码调度机制详解
 *
 * 核心问题：
 * 1. 调度入口：从 setState 到 ensureRootIsScheduled
 * 2. Scheduler 包：任务队列、何时执行、何时让出
 * 3. Reconciler 与 Scheduler 的配合：workLoopConcurrent + shouldYield
 * 4. 完整调度链路
 */

export default function ReactSchedulingAnalysis() {
  const [expandedSection, setExpandedSection] = useState(null);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '1400px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', color: '#61dafb' }}>🔄 React 源码：调度机制详解</h1>

      <Section
        title="✅ 核心答案"
        id="answer"
        expanded={expandedSection === 'answer'}
        onToggle={() => setExpandedSection(expandedSection === 'answer' ? null : 'answer')}
      >
        <CoreAnswer />
      </Section>

      <Section
        title="📌 调度入口：ensureRootIsScheduled"
        id="entry"
        expanded={expandedSection === 'entry'}
        onToggle={() => setExpandedSection(expandedSection === 'entry' ? null : 'entry')}
      >
        <SchedulingEntry />
      </Section>

      <Section
        title="📦 Scheduler 包：任务队列与宿主调度"
        id="scheduler"
        expanded={expandedSection === 'scheduler'}
        onToggle={() => setExpandedSection(expandedSection === 'scheduler' ? null : 'scheduler')}
      >
        <SchedulerPackage />
      </Section>

      <Section
        title="🔗 Reconciler 与 Scheduler 的配合"
        id="reconciler"
        expanded={expandedSection === 'reconciler'}
        onToggle={() => setExpandedSection(expandedSection === 'reconciler' ? null : 'reconciler')}
      >
        <ReconcilerCooperation />
      </Section>

      <Section
        title="📊 完整调度链路"
        id="flow"
        expanded={expandedSection === 'flow'}
        onToggle={() => setExpandedSection(expandedSection === 'flow' ? null : 'flow')}
      >
        <FullFlow />
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
          fontSize: '18px',
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
      <pre
        style={{
          background: '#f5f5f5',
          padding: '15px',
          borderRadius: '5px',
          overflow: 'auto',
          fontSize: '14px',
          lineHeight: '1.8',
        }}
      >
        {`React 调度机制核心
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. 谁负责「安排任务」？
   React（Reconciler）：ensureRootIsScheduled 根据 Lane 决定「在哪个 root、以什么优先级」执行渲染。

2. 谁负责「何时执行、执行多久」？
   Scheduler 包：任务队列（taskQueue）、MessageChannel 触发、shouldYieldToHost 控制让出。

3. 如何配合？
   React 把 performConcurrentWorkOnRoot 交给 Scheduler.scheduleCallback；
   执行时 workLoopConcurrent 每处理一个 Fiber 就调 shouldYield()，超时或需响应输入则让出，
   Scheduler 再通过 MessageChannel 调度下一段时间片继续。

4. 时间片默认多长？
   frameYieldMs = 5ms（SchedulerFeatureFlags.js）`}
      </pre>
    </div>
  );
}

function SchedulingEntry() {
  return (
    <div>
      <pre
        style={{
          background: '#1e1e1e',
          color: '#d4d4d4',
          padding: '20px',
          borderRadius: '8px',
          overflow: 'auto',
          fontSize: '14px',
          lineHeight: '1.6',
        }}
      >
        {`// packages/react-reconciler/src/ReactFiberWorkLoop.old.js

// 更新入口：setState / startTransition 等会走到这里
scheduleUpdateOnFiber(fiber, lane, eventTime)
  → markRootUpdated(root, lane, eventTime)
  → ensureRootIsScheduled(root, eventTime);

// 为 root 安排「最多一个」渲染任务
function ensureRootIsScheduled(root, currentTime) {
  const nextLanes = getNextLanes(root, ...);
  if (nextLanes === NoLanes) {
    cancelCallback(existingCallbackNode);
    return;
  }

  // 根据 Lane 映射到 Scheduler 优先级
  switch (lanesToEventPriority(nextLanes)) {
    case DiscreteEventPriority:    → ImmediateSchedulerPriority;
    case ContinuousEventPriority:   → UserBlockingSchedulerPriority;
    case DefaultEventPriority:      → NormalSchedulerPriority;
    case IdleEventPriority:          → IdleSchedulerPriority;
  }

  // 🔥 把「并发渲染根」交给 Scheduler 调度
  newCallbackNode = scheduleCallback(
    schedulerPriorityLevel,
    performConcurrentWorkOnRoot.bind(null, root),
  );
  root.callbackNode = newCallbackNode;
}`}
      </pre>
    </div>
  );
}

function SchedulerPackage() {
  return (
    <div>
      <pre
        style={{
          background: '#1e1e1e',
          color: '#d4d4d4',
          padding: '20px',
          borderRadius: '8px',
          overflow: 'auto',
          fontSize: '13px',
          lineHeight: '1.6',
        }}
      >
        {`// packages/scheduler/src/forks/Scheduler.js

// 1️⃣ 提交任务：unstable_scheduleCallback
function unstable_scheduleCallback(priorityLevel, callback, options) {
  var currentTime = getCurrentTime();
  var timeout;  // Immediate:-1, UserBlocking:250, Normal:5000, Low:10000, Idle:很大
  var expirationTime = startTime + timeout;
  var newTask = { id, callback, priorityLevel, startTime, expirationTime, sortIndex };
  push(taskQueue, newTask);  // 小顶堆，按 expirationTime 排序

  if (!isHostCallbackScheduled && !isPerformingWork) {
    isHostCallbackScheduled = true;
    requestHostCallback(flushWork);  // 请求宿主在下一轮执行
  }
  return newTask;
}

// 2️⃣ 宿主调度：MessageChannel / setImmediate / setTimeout
let schedulePerformWorkUntilDeadline;
if (typeof localSetImmediate === 'function') {
  schedulePerformWorkUntilDeadline = () => localSetImmediate(performWorkUntilDeadline);
} else if (typeof MessageChannel !== 'undefined') {
  const channel = new MessageChannel();
  const port = channel.port2;
  channel.port1.onmessage = performWorkUntilDeadline;
  schedulePerformWorkUntilDeadline = () => port.postMessage(null);  // 宏任务
} else {
  schedulePerformWorkUntilDeadline = () => localSetTimeout(performWorkUntilDeadline, 0);
}

function requestHostCallback(callback) {
  scheduledHostCallback = callback;  // 即 flushWork
  if (!isMessageLoopRunning) {
    isMessageLoopRunning = true;
    schedulePerformWorkUntilDeadline();
  }
}

// 3️⃣ 执行到「时间到」：performWorkUntilDeadline → flushWork → workLoop
const performWorkUntilDeadline = () => {
  if (scheduledHostCallback !== null) {
    startTime = getCurrentTime();
    let hasMoreWork = true;
    try {
      hasMoreWork = scheduledHostCallback(hasTimeRemaining, currentTime);
    } finally {
      if (hasMoreWork) schedulePerformWorkUntilDeadline();  // 继续下一时间片
      else { isMessageLoopRunning = false; scheduledHostCallback = null; }
    }
  }
  needsPaint = false;
};

// 4️⃣ 何时让出：shouldYieldToHost（默认 5ms 预算）
// packages/scheduler/src/SchedulerFeatureFlags.js: frameYieldMs = 5
let frameInterval = frameYieldMs;

function shouldYieldToHost() {
  const timeElapsed = getCurrentTime() - startTime;
  if (timeElapsed < frameInterval) return false;
  if (enableIsInputPending) {
    if (needsPaint) return true;
    if (timeElapsed < continuousInputInterval)
      return isInputPending != null ? isInputPending() : false;
    // ...
  }
  return true;
}`}
      </pre>
    </div>
  );
}

function ReconcilerCooperation() {
  return (
    <div>
      <pre
        style={{
          background: '#1e1e1e',
          color: '#d4d4d4',
          padding: '20px',
          borderRadius: '8px',
          overflow: 'auto',
          fontSize: '14px',
          lineHeight: '1.6',
        }}
      >
        {`// packages/react-reconciler/src/ReactFiberWorkLoop.old.js
// packages/react-reconciler/src/Scheduler.js: shouldYield = Scheduler.unstable_shouldYield

// performConcurrentWorkOnRoot 被 Scheduler 当作一个任务执行
function performConcurrentWorkOnRoot(root, didTimeout) {
  // ...
  const shouldTimeSlice = !includesBlockingLane(...) && !includesExpiredLane(...) && !didTimeout;
  let exitStatus = shouldTimeSlice
    ? renderRootConcurrent(root, lanes)
    : renderRootSync(root, lanes);
  if (exitStatus === RootInProgress) return performConcurrentWorkOnRoot.bind(null, root);  // continuation
  // commit 阶段...
}

// renderRootConcurrent 内
do {
  try {
    workLoopConcurrent();  // 🔥 在这里配合 Scheduler
    break;
  } catch (thrownValue) { handleError(root, thrownValue); }
} while (true);

if (workInProgress !== null) return RootInProgress;  // 还有工作，返回 true → 再调度

// 🔥 每处理一个 Fiber 就检查是否让出
function workLoopConcurrent() {
  while (workInProgress !== null && !shouldYield()) {
    performUnitOfWork(workInProgress);
  }
}`}
      </pre>
    </div>
  );
}

function FullFlow() {
  return (
    <div>
      <pre
        style={{
          background: '#f5f5f5',
          padding: '15px',
          borderRadius: '5px',
          overflow: 'auto',
          fontSize: '14px',
          lineHeight: '1.8',
        }}
      >
        {`完整调度流程（从 setState 到下一帧继续）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Step 1  React   setState / startTransition
         → scheduleUpdateOnFiber
         → ensureRootIsScheduled(root, eventTime)

Step 2  React   根据 Lane 得到 schedulerPriorityLevel
         → scheduleCallback(priority, performConcurrentWorkOnRoot)

Step 3  Scheduler  unstable_scheduleCallback
         → 任务入 taskQueue
         → requestHostCallback(flushWork)

Step 4  Scheduler  MessageChannel.postMessage(null)
         → performWorkUntilDeadline
         → flushWork(hasTimeRemaining, initialTime)
         → workLoop：取 taskQueue 队首，执行 performConcurrentWorkOnRoot

Step 5  React   performConcurrentWorkOnRoot(root)
         → renderRootConcurrent(root, lanes)
         → workLoopConcurrent(): while (workInProgress && !shouldYield()) performUnitOfWork(...)

Step 6  Scheduler  shouldYieldToHost() 基于 5ms、isInputPending 等
         → 若让出：workLoop 返回 true → schedulePerformWorkUntilDeadline() → 下一轮 postMessage 再执行
         → 若不让出：继续 performUnitOfWork 直到 workInProgress === null 或 shouldYield()

Step 7  重复 Step 4～6，直到整棵树 render 完，再进入 commit 阶段


职责分工总结
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

React（Reconciler）  决定「谁」被调度、「什么优先级」
Scheduler            决定「何时」执行、「执行多久」、任务队列与 continuation
Reconciler           在「被调度的这段时间」里按 Fiber 推进，通过 shouldYield() 配合让出`}
      </pre>
    </div>
  );
}

function InterviewPoints() {
  return (
    <div>
      <pre
        style={{
          background: '#f5f5f5',
          padding: '15px',
          borderRadius: '5px',
          overflow: 'auto',
          fontSize: '14px',
          lineHeight: '1.8',
        }}
      >
        {`面试要点
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Q1: React 调度分几层？各自做什么？
  React 层：ensureRootIsScheduled，按 Lane 转优先级，把 performConcurrentWorkOnRoot 交给 Scheduler。
  Scheduler 层：任务队列、MessageChannel 触发、shouldYieldToHost（5ms + isInputPending）控制让出。
  Reconciler 层：workLoopConcurrent 每处理一个 Fiber 调 shouldYield()，让出后由 Scheduler 再调度下一段时间片。

Q2: 为什么用 MessageChannel 而不是 requestAnimationFrame / setTimeout？
  RAF 与帧对齐且后台节流，React 需要更灵活的时间片（如 5ms）；setTimeout 有 4ms 钳制，MessageChannel 无延迟、不阻塞进程退出（相对 setImmediate 在 Node 的语义）。

Q3: 时间片长度在哪配置？
  packages/scheduler/src/SchedulerFeatureFlags.js 中 frameYieldMs = 5（单位 ms）。

Q4: 调度与 Fiber 的关系？
  Fiber 是调度单元：workLoopConcurrent 按 Fiber 推进，每个 performUnitOfWork 后检查 shouldYield，可中断、可恢复；Fiber 链表 + workInProgress 指针实现「停在哪、从哪继续」。

Q5: 优先级如何从 React 传到 Scheduler？
  Lane → lanesToEventPriority → Discrete/Continuous/Default/Idle → Immediate/UserBlocking/Normal/Idle Scheduler 优先级；
  ensureRootIsScheduled 里 scheduleCallback(schedulerPriorityLevel, performConcurrentWorkOnRoot)。`}
      </pre>
    </div>
  );
}
