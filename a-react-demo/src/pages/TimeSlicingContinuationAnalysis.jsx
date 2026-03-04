import React, { useState, useTransition } from 'react';

/**
 * 🎯 时间切片的继续与中断机制分析
 * 
 * 本组件深入分析以下问题：
 * 1. 时间切片5ms过后如何通过MessageChannel继续处理剩余Fiber？
 * 2. 如果用户交互改变了root fiber，当前剩余的工作还会处理吗？
 * 
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 一、时间切片如何继续处理剩余Fiber
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 
 * 📍 核心机制：通过 MessageChannel 实现异步调度
 * 
 * 1️⃣ 初始化调度（Scheduler.js）
 * ```javascript
 * // packages/scheduler/src/forks/Scheduler.js
 * 
 * const channel = new MessageChannel();
 * const port = channel.port2;
 * 
 * // 监听消息，执行工作
 * channel.port1.onmessage = performWorkUntilDeadline;
 * 
 * // 调度函数：发送消息触发下一轮工作
 * const schedulePerformWorkUntilDeadline = () => {
 *   port.postMessage(null); // 🔥 关键：通过postMessage触发macrotask
 * };
 * ```
 * 
 * 2️⃣ 工作执行与让出（performWorkUntilDeadline）
 * ```javascript
 * // packages/scheduler/src/forks/Scheduler.js:200+
 * 
 * const performWorkUntilDeadline = () => {
 *   if (scheduledHostCallback !== null) {
 *     const currentTime = getCurrentTime();
 *     // 🔥 设置截止时间（当前时间 + 5ms）
 *     deadline = currentTime + yieldInterval; // yieldInterval = 5ms
 *     const hasTimeRemaining = true;
 *     
 *     try {
 *       // 🔥 执行调度的回调（即 performConcurrentWorkOnRoot）
 *       const hasMoreWork = scheduledHostCallback(
 *         hasTimeRemaining,
 *         currentTime,
 *       );
 *       
 *       // 🔥 如果还有剩余工作，继续调度
 *       if (hasMoreWork) {
 *         schedulePerformWorkUntilDeadline(); // 再次发送postMessage
 *       } else {
 *         scheduledHostCallback = null; // 工作完成，清空回调
 *       }
 *     } catch (error) {
 *       // 即使出错，也继续调度（保证不会卡住）
 *       schedulePerformWorkUntilDeadline();
 *       throw error;
 *     }
 *   }
 * };
 * ```
 * 
 * 3️⃣ 并发工作循环（workLoopConcurrent）
 * ```javascript
 * // packages/react-reconciler/src/ReactFiberWorkLoop.old.js:1820+
 * 
 * function workLoopConcurrent() {
 *   // 🔥 每处理一个Fiber后检查是否需要让出
 *   while (workInProgress !== null && !shouldYield()) {
 *     performUnitOfWork(workInProgress); // 处理当前Fiber
 *   }
 *   
 *   // 🔥 如果shouldYield()返回true，循环退出
 *   // 此时 workInProgress 保持为下一个要处理的Fiber
 * }
 * 
 * function shouldYield() {
 *   const currentTime = getCurrentTime();
 *   // 🔥 如果当前时间超过截止时间（5ms），返回true让出
 *   return currentTime >= deadline;
 * }
 * ```
 * 
 * 4️⃣ 状态保持与恢复（performConcurrentWorkOnRoot）
 * ```javascript
 * // packages/react-reconciler/src/ReactFiberWorkLoop.old.js:700+
 * 
 * function performConcurrentWorkOnRoot(root, didTimeout) {
 *   // ...
 *   do {
 *     try {
 *       // 🔥 执行并发工作循环
 *       workLoopConcurrent();
 *       break;
 *     } catch (thrownValue) {
 *       handleError(root, thrownValue);
 *     }
 *   } while (true);
 *   
 *   // 🔥 关键：检查 workInProgress 是否还有值
 *   if (workInProgress !== null) {
 *     // 还有剩余工作，返回 RootInProgress
 *     return RootInProgress; // 🔥 告诉Scheduler还有工作要做
 *   } else {
 *     // 工作完成，进入commit阶段
 *     const finishedWork = root.current.alternate;
 *     root.finishedWork = finishedWork;
 *     finishConcurrentRender(root, exitStatus, lanes);
 *     return null; // 🔥 告诉Scheduler工作完成
 *   }
 * }
 * ```
 * 
 * 📊 完整流程图：
 * ┌─────────────────────────────────────────────────────────────┐
 * │  1. scheduleCallback 注册任务                                │
 * │     scheduledHostCallback = performConcurrentWorkOnRoot     │
 * │     port.postMessage(null)  // 发送消息                      │
 * └───────────────────┬─────────────────────────────────────────┘
 *                     │
 *                     ▼
 * ┌─────────────────────────────────────────────────────────────┐
 * │  2. performWorkUntilDeadline（MessageChannel回调）          │
 * │     deadline = now() + 5ms  // 设置截止时间                 │
 * │     hasMoreWork = scheduledHostCallback()                   │
 * └───────────────────┬─────────────────────────────────────────┘
 *                     │
 *                     ▼
 * ┌─────────────────────────────────────────────────────────────┐
 * │  3. performConcurrentWorkOnRoot                             │
 * │     workLoopConcurrent()  // 执行工作循环                    │
 * └───────────────────┬─────────────────────────────────────────┘
 *                     │
 *                     ▼
 * ┌─────────────────────────────────────────────────────────────┐
 * │  4. workLoopConcurrent                                      │
 * │     while (workInProgress && !shouldYield()) {              │
 * │       performUnitOfWork(workInProgress)                     │
 * │     }                                                        │
 * └───────────────────┬─────────────────────────────────────────┘
 *                     │
 *         ┌───────────┴───────────┐
 *         │                       │
 *         ▼                       ▼
 *   shouldYield() = true    shouldYield() = false
 *   （超过5ms）              （工作完成）
 *         │                       │
 *         ▼                       ▼
 * ┌──────────────────┐    ┌──────────────────┐
 * │ return           │    │ workInProgress   │
 * │ RootInProgress   │    │ = null           │
 * │ （还有剩余工作）  │    │ return null      │
 * └────────┬─────────┘    └────────┬─────────┘
 *          │                       │
 *          ▼                       ▼
 * ┌──────────────────┐    ┌──────────────────┐
 * │ hasMoreWork=true │    │ hasMoreWork=false│
 * │ port.postMessage │    │ 清空callback     │
 * │ (null)           │    │ 进入commit阶段   │
 * │ 🔁 继续下一轮    │    │ ✅ 工作完成      │
 * └──────────────────┘    └──────────────────┘
 * 
 * 
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 二、用户交互如何中断当前工作
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 
 * 📍 核心机制：优先级调度 + 工作取消
 * 
 * 1️⃣ 用户交互触发更新（高优先级）
 * ```javascript
 * // 用户点击按钮
 * function handleClick() {
 *   setState(newValue); // 触发离散事件更新（DiscreteEventPriority）
 * }
 * ```
 * 
 * 2️⃣ 调度更新（ensureRootIsScheduled）
 * ```javascript
 * // packages/react-reconciler/src/ReactFiberWorkLoop.old.js:700+
 * 
 * function ensureRootIsScheduled(root: FiberRoot, currentTime: number) {
 *   // 1. 获取旧的调度任务
 *   const existingCallbackNode = root.callbackNode;
 *   const existingCallbackPriority = root.callbackPriority;
 *   
 *   // 2. 计算新的优先级
 *   const nextLanes = getNextLanes(
 *     root,
 *     root === workInProgressRoot ? workInProgressRootRenderLanes : NoLanes,
 *   );
 *   const newCallbackPriority = getHighestPriorityLane(nextLanes);
 *   
 *   // 🔥 3. 关键判断：新优先级是否更高
 *   if (
 *     existingCallbackNode !== null &&
 *     existingCallbackPriority !== newCallbackPriority
 *   ) {
 *     // 🔥 新优先级与旧优先级不同
 *     if (newCallbackPriority > existingCallbackPriority) {
 *       // 🔥 高优先级更新：取消旧任务
 *       cancelCallback(existingCallbackNode); // 从Scheduler中移除旧任务
 *     } else {
 *       // 低优先级更新：保持旧任务继续执行
 *       return;
 *     }
 *   }
 *   
 *   // 4. 调度新任务
 *   let newCallbackNode;
 *   if (newCallbackPriority === SyncLane) {
 *     // 同步任务（最高优先级）
 *     newCallbackNode = scheduleSyncCallback(
 *       performSyncWorkOnRoot.bind(null, root)
 *     );
 *   } else {
 *     // 并发任务（可中断）
 *     const schedulerPriorityLevel = 
 *       lanesToSchedulerPriority(newCallbackPriority);
 *     
 *     newCallbackNode = scheduleCallback(
 *       schedulerPriorityLevel,
 *       performConcurrentWorkOnRoot.bind(null, root),
 *     );
 *   }
 *   
 *   // 5. 更新root的调度信息
 *   root.callbackPriority = newCallbackPriority;
 *   root.callbackNode = newCallbackNode;
 * }
 * ```
 * 
 * 3️⃣ 取消旧任务（cancelCallback）
 * ```javascript
 * // packages/scheduler/src/forks/Scheduler.js:300+
 * 
 * function unstable_cancelCallback(task) {
 *   // 🔥 从任务队列中删除
 *   task.callback = null; // 标记为已取消
 * }
 * 
 * // 当 performWorkUntilDeadline 执行时
 * function flushWork(hasTimeRemaining, initialTime) {
 *   try {
 *     return workLoop(hasTimeRemaining, initialTime);
 *   } finally {
 *     currentTask = null;
 *   }
 * }
 * 
 * function workLoop(hasTimeRemaining, initialTime) {
 *   currentTask = peek(taskQueue); // 获取最高优先级任务
 *   while (currentTask !== null) {
 *     // 🔥 如果任务被取消（callback为null），跳过
 *     if (currentTask.callback === null) {
 *       pop(taskQueue); // 从队列中移除
 *     } else if (shouldYieldToHost()) {
 *       // 需要让出，返回true表示还有工作
 *       return true;
 *     } else {
 *       // 执行任务
 *       const callback = currentTask.callback;
 *       if (typeof callback === 'function') {
 *         currentTask.callback = null;
 *         const didUserCallbackTimeout = currentTask.expirationTime <= currentTime;
 *         const continuationCallback = callback(didUserCallbackTimeout);
 *         
 *         if (typeof continuationCallback === 'function') {
 *           // 任务还没完成，保留继续执行
 *           currentTask.callback = continuationCallback;
 *         } else {
 *           // 任务完成，移除
 *           if (currentTask === peek(taskQueue)) {
 *             pop(taskQueue);
 *           }
 *         }
 *       }
 *     }
 *     currentTask = peek(taskQueue);
 *   }
 *   return false; // 没有更多工作
 * }
 * ```
 * 
 * 4️⃣ 重新开始渲染（prepareFreshStack）
 * ```javascript
 * // packages/react-reconciler/src/ReactFiberWorkLoop.old.js:1600+
 * 
 * function prepareFreshStack(root: FiberRoot, lanes: Lanes) {
 *   // 🔥 重置全局状态
 *   root.finishedWork = null;
 *   root.finishedLanes = NoLanes;
 *   
 *   // 🔥 取消之前的工作进度
 *   if (workInProgress !== null) {
 *     // 🔥 丢弃之前的 workInProgress 树
 *     let interruptedWork = workInProgress.return;
 *     while (interruptedWork !== null) {
 *       unwindInterruptedWork(interruptedWork);
 *       interruptedWork = interruptedWork.return;
 *     }
 *   }
 *   
 *   // 🔥 从root开始，创建新的 workInProgress 树
 *   workInProgressRoot = root;
 *   workInProgress = createWorkInProgress(root.current, null);
 *   workInProgressRootRenderLanes = lanes;
 * }
 * ```
 * 
 * 📊 中断流程图：
 * ┌─────────────────────────────────────────────────────────────┐
 * │  初始状态：正在处理低优先级更新（useTransition）             │
 * │  workInProgress → FiberA → FiberB → FiberC → ...            │
 * │                              ↑                              │
 * │                         当前处理到这里                       │
 * └───────────────────┬─────────────────────────────────────────┘
 *                     │
 *                     │  用户点击按钮（高优先级）
 *                     ▼
 * ┌─────────────────────────────────────────────────────────────┐
 * │  1. onClick → setState → scheduleUpdateOnFiber              │
 * │     → markRootUpdated(root, SyncLane)                       │
 * └───────────────────┬─────────────────────────────────────────┘
 *                     │
 *                     ▼
 * ┌─────────────────────────────────────────────────────────────┐
 * │  2. ensureRootIsScheduled                                   │
 * │     newPriority (SyncLane) > existingPriority (TransitionLane) │
 * │     🔥 cancelCallback(existingCallbackNode)                 │
 * └───────────────────┬─────────────────────────────────────────┘
 *                     │
 *                     ▼
 * ┌─────────────────────────────────────────────────────────────┐
 * │  3. Scheduler: 标记旧任务为取消                              │
 * │     task.callback = null                                    │
 * │     下次 workLoop 时跳过该任务                               │
 * └───────────────────┬─────────────────────────────────────────┘
 *                     │
 *                     ▼
 * ┌─────────────────────────────────────────────────────────────┐
 * │  4. 调度新的高优先级任务                                     │
 * │     scheduleCallback(ImmediatePriority,                     │
 * │                      performSyncWorkOnRoot)                 │
 * └───────────────────┬─────────────────────────────────────────┘
 *                     │
 *                     ▼
 * ┌─────────────────────────────────────────────────────────────┐
 * │  5. performSyncWorkOnRoot                                   │
 * │     prepareFreshStack(root, syncLanes)                      │
 * │     🔥 丢弃旧的 workInProgress 树（FiberA/B/C...）         │
 * │     🔥 从root重新创建 workInProgress                        │
 * └───────────────────┬─────────────────────────────────────────┘
 *                     │
 *                     ▼
 * ┌─────────────────────────────────────────────────────────────┐
 * │  6. 重新开始渲染（基于高优先级更新）                         │
 * │     workInProgress = root → ...                             │
 * │     ✅ 旧的低优先级工作被完全丢弃                            │
 * └─────────────────────────────────────────────────────────────┘
 * 
 * 
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 三、实战演示：观察中断与继续
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

const TimeSlicingContinuationAnalysis = () => {
  const [list, setList] = useState([]);
  const [counter, setCounter] = useState(0);
  const [isPending, startTransition] = useTransition();
  const [log, setLog] = useState([]);

  // 添加日志
  const addLog = (message) => {
    setLog(prev => [...prev, `${new Date().toLocaleTimeString()}.${Date.now() % 1000} - ${message}`]);
  };

  // 🔥 低优先级更新：生成大量数据（会被时间切片）
  const handleSlowUpdate = () => {
    addLog('🟡 开始低优先级更新（useTransition）');
    startTransition(() => {
      const newList = [];
      for (let i = 0; i < 10000000; i++) {
        newList.push({
          id: i,
          text: `Item ${i}`,
          random: Math.random()
        });
      }
      setList(newList);
      addLog('✅ 低优先级更新完成（10000个元素）');
    });
  };

  // 🔥 高优先级更新：立即执行（会中断低优先级）
  const handleHighPriorityUpdate = () => {
    addLog('🔴 高优先级更新！（点击事件）');
    setCounter(c => c + 1);
    addLog(`✅ 高优先级更新完成（counter=${counter + 1}）`);
  };

  // 清空日志
  const clearLog = () => {
    setLog([]);
    setList([]);
    setCounter(0);
  };

  return (
    <div style={{ padding: 20, fontFamily: 'monospace' }}>
      <h2>🎯 时间切片的继续与中断机制演示</h2>

      <div style={{ 
        background: '#f0f0f0', 
        padding: 15, 
        borderRadius: 8,
        marginBottom: 20 
      }}>
        <h3>📋 测试步骤：</h3>
        <ol>
          <li>
            <strong>测试继续机制：</strong>
            <ul>
              <li>点击 "开始低优先级更新" 按钮</li>
              <li>React会创建10000个元素（耗时操作）</li>
              <li>由于使用了 useTransition，更新会被时间切片</li>
              <li>观察日志：更新会分多次完成（每次5ms）</li>
              <li>
                <strong>关键：</strong>每次让出后，通过 MessageChannel.postMessage
                继续下一轮工作，workInProgress 保持状态
              </li>
            </ul>
          </li>
          <li>
            <strong>测试中断机制：</strong>
            <ul>
              <li>先点击 "开始低优先级更新"</li>
              <li>在渲染过程中（pending时），快速点击 "高优先级更新" 按钮</li>
              <li>观察日志：高优先级更新会立即执行</li>
              <li>
                <strong>关键：</strong>低优先级工作被取消（cancelCallback），
                从root重新开始渲染（prepareFreshStack）
              </li>
            </ul>
          </li>
        </ol>
      </div>

      <div style={{ marginBottom: 20 }}>
        <button
          onClick={handleSlowUpdate}
          style={{
            padding: '10px 20px',
            marginRight: 10,
            background: '#ffc107',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
            fontSize: 16
          }}
        >
          🟡 开始低优先级更新（10000个元素）
        </button>

        <button
          onClick={handleHighPriorityUpdate}
          style={{
            padding: '10px 20px',
            marginRight: 10,
            background: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
            fontSize: 16
          }}
        >
          🔴 高优先级更新（counter++）
        </button>

        <button
          onClick={clearLog}
          style={{
            padding: '10px 20px',
            background: '#9e9e9e',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: 'pointer',
            fontSize: 16
          }}
        >
          清空
        </button>
      </div>

      <div style={{ marginBottom: 20 }}>
        <div style={{ 
          padding: 10, 
          background: isPending ? '#fff3e0' : '#e8f5e9',
          borderRadius: 4,
          marginBottom: 10
        }}>
          <strong>状态：</strong>
          {isPending ? '⏳ 正在处理低优先级更新...' : '✅ 空闲'}
        </div>
        <div style={{ padding: 10, background: '#e3f2fd', borderRadius: 4 }}>
          <strong>Counter（高优先级）：</strong>{counter}
        </div>
      </div>

      <div style={{ 
        background: '#263238', 
        color: '#aed581',
        padding: 15,
        borderRadius: 8,
        maxHeight: 400,
        overflowY: 'auto',
        fontSize: 14,
        marginBottom: 20
      }}>
        <h4 style={{ color: '#81c784', marginTop: 0 }}>📊 执行日志：</h4>
        {log.length === 0 ? (
          <div style={{ color: '#78909c' }}>等待操作...</div>
        ) : (
          log.map((item, index) => (
            <div key={index} style={{ marginBottom: 4 }}>
              {item}
            </div>
          ))
        )}
      </div>

      <div style={{ 
        background: '#fff', 
        border: '1px solid #ddd',
        borderRadius: 8,
        padding: 15,
        maxHeight: 300,
        overflowY: 'auto'
      }}>
        <h4>📦 渲染的元素列表（前100个）：</h4>
        {list.length === 0 ? (
          <div style={{ color: '#999' }}>暂无数据</div>
        ) : (
          <div>
            <div style={{ marginBottom: 10, color: '#666' }}>
              共 {list.length} 个元素
            </div>
            {list.slice(0, 100).map(item => (
              <div 
                key={item.id}
                style={{ 
                  padding: '4px 8px',
                  background: '#f5f5f5',
                  marginBottom: 4,
                  borderRadius: 4,
                  fontSize: 12
                }}
              >
                {item.text} (random: {item.random.toFixed(4)})
              </div>
            ))}
            {list.length > 100 && (
              <div style={{ color: '#999', marginTop: 10 }}>
                ... 还有 {list.length - 100} 个元素
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{ 
        marginTop: 30,
        padding: 20,
        background: '#e8eaf6',
        borderRadius: 8,
        borderLeft: '4px solid #3f51b5'
      }}>
        <h3 style={{ marginTop: 0 }}>💡 核心要点总结</h3>
        
        <h4>1️⃣ 时间切片如何继续（5ms后）：</h4>
        <ul>
          <li>
            <strong>workInProgress 保持状态：</strong>
            当 shouldYield() 返回 true 时，workLoopConcurrent 循环退出，
            但 workInProgress 指针保持在下一个要处理的Fiber
          </li>
          <li>
            <strong>返回 RootInProgress：</strong>
            performConcurrentWorkOnRoot 检测到 workInProgress !== null，
            返回 RootInProgress 告诉Scheduler还有工作
          </li>
          <li>
            <strong>继续调度：</strong>
            performWorkUntilDeadline 检测到 hasMoreWork === true，
            调用 port.postMessage(null) 发送macrotask
          </li>
          <li>
            <strong>下一轮执行：</strong>
            MessageChannel 触发回调，重新执行 performWorkUntilDeadline，
            从保存的 workInProgress 继续处理
          </li>
        </ul>

        <h4>2️⃣ 高优先级更新如何中断：</h4>
        <ul>
          <li>
            <strong>取消旧任务：</strong>
            ensureRootIsScheduled 检测到新优先级更高，
            调用 cancelCallback 将旧任务的 callback 设为 null
          </li>
          <li>
            <strong>重置状态：</strong>
            prepareFreshStack 丢弃旧的 workInProgress 树，
            从 root.current 重新创建
          </li>
          <li>
            <strong>重新渲染：</strong>
            基于高优先级lanes重新开始渲染，
            旧的低优先级工作完全被丢弃（后续可能重新调度）
          </li>
          <li>
            <strong>优先级饥饿保护：</strong>
            被中断的低优先级更新会增加过期时间（expirationTime），
            避免永远得不到执行
          </li>
        </ul>

        <h4>3️⃣ 为什么用 MessageChannel：</h4>
        <ul>
          <li>
            <strong>异步 + 低优先级：</strong>
            MessageChannel.postMessage 是 macrotask，
            会在当前 JS 执行完和下次渲染之间执行
          </li>
          <li>
            <strong>比 setTimeout 更精确：</strong>
            setTimeout 有4ms最小延迟且精度不稳定，
            MessageChannel 没有最小延迟限制
          </li>
          <li>
            <strong>非阻塞：</strong>
            每次只处理5ms工作，剩余时间留给浏览器渲染和用户交互
          </li>
          <li>
            <strong>兼容性：</strong>
            在不支持 MessageChannel 的环境会降级到 setTimeout(fn, 0)
          </li>
        </ul>

        <h4>4️⃣ 时间切片的局限性：</h4>
        <ul>
          <li>
            <strong>最小单元是Fiber：</strong>
            单个Fiber处理超过5ms也要等完成才能让出
          </li>
          <li>
            <strong>仅Render阶段可中断：</strong>
            Commit阶段必须同步完成，不能被中断
          </li>
          <li>
            <strong>低优先级可能饥饿：</strong>
            频繁的高优先级更新可能导致低优先级一直被中断
            （通过 expirationTime 机制缓解）
          </li>
        </ul>
      </div>
    </div>
  );
};

export default TimeSlicingContinuationAnalysis;
