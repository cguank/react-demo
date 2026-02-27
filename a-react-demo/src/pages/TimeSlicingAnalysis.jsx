import React, { useState, useEffect, useTransition, useDeferredValue } from 'react';

/**
 * React 时间切片（Time Slicing）实现原理详解
 * 
 * 核心问题：
 * 1. 什么是时间切片？
 * 2. 为什么需要时间切片？
 * 3. React 如何实现时间切片？
 * 4. Scheduler 的工作原理
 * 5. shouldYield 如何判断
 * 6. 时间切片与 requestIdleCallback 的区别
 */

export default function TimeSlicingAnalysis() {
  const [expandedSection, setExpandedSection] = useState(null);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '1400px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', color: '#61dafb' }}>⏱️ React 时间切片实现原理</h1>
      
      <Section
        title="✅ 核心答案"
        id="answer"
        expanded={expandedSection === 'answer'}
        onToggle={() => setExpandedSection(expandedSection === 'answer' ? null : 'answer')}
      >
        <CoreAnswer />
      </Section>

      <Section
        title="📋 什么是时间切片"
        id="concept"
        expanded={expandedSection === 'concept'}
        onToggle={() => setExpandedSection(expandedSection === 'concept' ? null : 'concept')}
      >
        <Concept />
      </Section>

      <Section
        title="🎯 为什么需要时间切片"
        id="why"
        expanded={expandedSection === 'why'}
        onToggle={() => setExpandedSection(expandedSection === 'why' ? null : 'why')}
      >
        <WhyNeed />
      </Section>

      <Section
        title="🔍 实现原理"
        id="implementation"
        expanded={expandedSection === 'implementation'}
        onToggle={() => setExpandedSection(expandedSection === 'implementation' ? null : 'implementation')}
      >
        <Implementation />
      </Section>

      <Section
        title="💻 源码分析"
        id="source"
        expanded={expandedSection === 'source'}
        onToggle={() => setExpandedSection(expandedSection === 'source' ? null : 'source')}
      >
        <SourceCode />
      </Section>

      <Section
        title="⏰ 调度机制"
        id="scheduling"
        expanded={expandedSection === 'scheduling'}
        onToggle={() => setExpandedSection(expandedSection === 'scheduling' ? null : 'scheduling')}
      >
        <Scheduling />
      </Section>

      <Section
        title="🎨 实际演示"
        id="demo"
        expanded={expandedSection === 'demo'}
        onToggle={() => setExpandedSection(expandedSection === 'demo' ? null : 'demo')}
      >
        <Demo />
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
{`React 时间切片实现核心
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

核心答案：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. 什么是时间切片？
   将长任务拆分成多个小任务，每个小任务执行时间不超过 5ms
   
2. 如何实现？
   通过 workLoopConcurrent + shouldYield 实现
   
3. 核心机制：
   - 每处理一个 Fiber 节点，检查是否需要让出主线程
   - 使用 MessageChannel 宏任务恢复执行
   - 默认时间片长度：5ms


关键代码：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ReactFiberWorkLoop.old.js
function workLoopConcurrent() {
  // 🔥 关键：每次循环都检查 shouldYield()
  while (workInProgress !== null && !shouldYield()) {
    performUnitOfWork(workInProgress);
  }
}

// Scheduler.js
function shouldYieldToHost() {
  const timeElapsed = getCurrentTime() - startTime;
  
  // 🔥 如果超过 5ms，返回 true，让出主线程
  if (timeElapsed < frameInterval) {  // frameInterval = 5ms
    return false;
  }
  
  // ... 其他判断（用户输入、requestPaint）
  return true;
}


工作流程：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. 开始渲染任务
   ↓
2. workLoopConcurrent() 循环处理 Fiber
   ↓
3. 每处理完一个 Fiber，调用 shouldYield()
   ↓
4. 如果超过 5ms，shouldYield() 返回 true
   ↓
5. 跳出 workLoopConcurrent 循环
   ↓
6. 通过 MessageChannel 调度下一个时间片
   ↓
7. 继续处理剩余 Fiber 节点
   ↓
8. 重复步骤 2-7，直到完成


为什么是 5ms？
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. 浏览器每帧时间：约 16.6ms (60fps)
2. 预留给浏览器的时间：11.6ms
3. React 每帧可执行时间：5ms
4. 保证不阻塞用户输入和页面渲染


对比：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

同步渲染（Sync）：
  - 一次性执行完所有任务
  - 长时间阻塞主线程
  - 页面卡顿

并发渲染（Concurrent）：
  - 每 5ms 暂停一次
  - 让出主线程
  - 页面流畅`}
      </pre>
    </div>
  );
}

function Concept() {
  return (
    <div>
      <pre style={{ background: '#f5f5f5', padding: '15px', borderRadius: '5px', overflow: 'auto', fontSize: '13px', lineHeight: '1.8' }}>
{`什么是时间切片？
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

基本概念：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

时间切片（Time Slicing）是一种将长任务拆分成多个小任务的技术，
每个小任务执行一小段时间后主动让出主线程，避免长时间占用导致
页面卡顿。


形象比喻：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

没有时间切片（同步渲染）：
┌─────────────────────────────────────────┐
│ React 渲染 10000 个组件（耗时 100ms）    │
└─────────────────────────────────────────┘
  ↓
用户点击按钮 → 无响应（被阻塞）
页面滚动 → 卡顿


有时间切片（并发渲染）：
┌──────┐    ┌──────┐    ┌──────┐    ┌──────┐
│ 渲染  │ → │ 让出  │ → │ 渲染  │ → │ 让出  │
│ 5ms  │    │主线程 │    │ 5ms  │    │主线程 │
└──────┘    └──────┘    └──────┘    └──────┘
              ↓
        用户点击按钮 → 立即响应 ✨
        页面滚动 → 流畅


关键特点：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. 可中断（Interruptible）
   - 任务执行过程中可以暂停
   - 让出主线程处理更高优先级任务
   - 之后可以恢复执行

2. 可恢复（Resumable）
   - 暂停的任务可以从中断点继续执行
   - 不需要重新开始

3. 可优先（Prioritizable）
   - 高优先级任务可以插队
   - 低优先级任务可以延后


浏览器帧的时间分配：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

每一帧（60fps = 16.6ms）：

┌────────────────────────────────────────────┐
│ 0ms                                  16.6ms│
├────────────────────────────────────────────┤
│ Input Events (用户输入)                    │ ~1ms
│ requestAnimationFrame                      │ ~1ms
│ Layout (布局)                              │ ~2ms
│ Paint (绘制)                               │ ~2ms
│ 🔥 React 渲染（时间切片）                   │ ~5ms
│ Idle (空闲)                                │ ~5.6ms
└────────────────────────────────────────────┘

React 只使用 5ms，留出足够时间给浏览器渲染和用户交互


时间切片 vs 其他异步方案：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

┌──────────────┬──────────┬──────────┬──────────┐
│ 方案          │ 粒度     │ 优先级   │ 适用场景 │
├──────────────┼──────────┼──────────┼──────────┤
│ setTimeout    │ 粗       │ 无       │ 简单延迟 │
│ requestIdle   │ 粗       │ 无       │ 低优先级 │
│ 时间切片       │ 细       │ 支持     │ 复杂渲染 │
└──────────────┴──────────┴──────────┴──────────┘


React 中的应用：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

启用时间切片的 API：

1. Concurrent Mode（React 18+）
   - createRoot (默认支持)
   - 自动时间切片

2. useTransition
   - 标记低优先级更新
   - 触发时间切片

3. useDeferredValue
   - 延迟更新值
   - 触发时间切片

4. startTransition
   - 包裹低优先级更新
   - 触发时间切片


示例：
function App() {
  const [isPending, startTransition] = useTransition();
  const [list, setList] = useState([]);
  
  const handleClick = () => {
    startTransition(() => {
      // 这个更新会使用时间切片
      setList(generateHugeList());  // 生成 10000 条数据
    });
  };
  
  return (
    <>
      <button onClick={handleClick}>更新</button>
      {isPending ? '加载中...' : null}
      <List data={list} />
    </>
  );
}

执行过程：
1. 用户点击按钮
2. startTransition 标记更新为低优先级
3. React 使用时间切片渲染 10000 个组件
4. 每 5ms 暂停一次，让出主线程
5. 用户可以继续滚动、点击其他按钮
6. 页面保持流畅`}
      </pre>
    </div>
  );
}

function WhyNeed() {
  return (
    <div>
      <pre style={{ background: '#f5f5f5', padding: '15px', borderRadius: '5px', overflow: 'auto', fontSize: '13px', lineHeight: '1.8' }}>
{`为什么需要时间切片？
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

问题场景：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

场景 1：大列表渲染
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function App() {
  const [list, setList] = useState([]);
  
  const handleClick = () => {
    // 渲染 10000 条数据
    const newList = Array(10000).fill(0).map((_, i) => ({
      id: i,
      text: \`Item \${i}\`
    }));
    setList(newList);
  };
  
  return (
    <>
      <input type="text" placeholder="试试输入..." />
      <button onClick={handleClick}>加载数据</button>
      {list.map(item => <Item key={item.id} {...item} />)}
    </>
  );
}


没有时间切片（React 17-）：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. 用户点击"加载数据"
   ↓
2. React 同步渲染 10000 个组件（假设耗时 500ms）
   ↓
   【主线程被完全占用 500ms】
   ↓
3. 用户尝试输入 → 无响应（被阻塞）
4. 用户尝试滚动 → 卡顿
5. 浏览器无法绘制 → 页面冻结

时间线：
0ms              500ms
├───────────────────────┤
│ React 渲染（阻塞）      │
└───────────────────────┘
         ↓
   用户：😤 卡死了！


有时间切片（React 18+）：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. 用户点击"加载数据"
   ↓
2. React 开始渲染，每 5ms 暂停一次
   ↓
3. 让出主线程，浏览器处理用户输入、滚动、绘制
   ↓
4. 继续渲染下一批组件
   ↓
5. 重复 2-4，直到完成

时间线（共 500ms）：
0ms    5ms   10ms  15ms  20ms  ...  500ms
├───┤  ├───┤ ├───┤ ├───┤ ├───┤     ├───┤
│渲染│  │渲染│ │渲染│ │渲染│ │渲染│ ... │渲染│
└───┘  └───┘ └───┘ └───┘ └───┘     └───┘
  ↓      ↓     ↓     ↓     ↓         ↓
 让出   让出   让出   让出   让出     让出
  ↓      ↓     ↓     ↓     ↓         ↓
用户可以随时输入、滚动 ✨


场景 2：复杂计算
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function SearchResults({ query }) {
  const results = useMemo(() => {
    // 复杂的搜索和过滤逻辑
    return hugeData
      .filter(item => item.matches(query))
      .map(item => transform(item))
      .sort((a, b) => score(a) - score(b));
  }, [query]);
  
  return <ResultsList data={results} />;
}

没有时间切片：
  - 计算 + 渲染阻塞主线程
  - 用户输入延迟

有时间切片：
  - 计算过程可中断
  - 保持响应性


场景 3：动画和交互
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function App() {
  const [count, setCount] = useState(0);
  
  return (
    <>
      {/* 高优先级：动画 */}
      <AnimatedBox position={count} />
      
      {/* 低优先级：大列表 */}
      <button onClick={() => setCount(c => c + 1)}>
        Move
      </button>
      <HugeList />
    </>
  );
}

没有时间切片：
  - 渲染 HugeList 阻塞动画
  - 动画掉帧、卡顿

有时间切片：
  - HugeList 低优先级，可中断
  - 动画高优先级，优先执行
  - 动画流畅 60fps


核心收益：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. 用户体验提升
   ✅ 输入即时响应
   ✅ 滚动流畅
   ✅ 动画不掉帧
   ✅ 页面不冻结

2. 性能优化
   ✅ 避免长任务阻塞
   ✅ 更好的任务调度
   ✅ 优先级控制

3. 开发者体验
   ✅ 无需手动拆分任务
   ✅ 自动优化
   ✅ API 简单（useTransition）


对比数据：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

┌──────────────┬──────────┬──────────┬──────────┐
│ 指标          │ React 17 │ React 18 │ 提升     │
├──────────────┼──────────┼──────────┼──────────┤
│ 输入延迟      │ 500ms    │ <16ms    │ 96%      │
│ 帧率          │ 12fps    │ 60fps    │ 400%     │
│ 首次交互时间  │ 2s       │ 0.5s     │ 75%      │
│ 用户满意度    │ 😤       │ 😊       │ 100%     │
└──────────────┴──────────┴──────────┴──────────┘


浏览器的限制：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

JavaScript 是单线程的：
  - 只有一个主线程
  - JS 执行和 UI 渲染互斥
  - 长时间 JS 执行 → UI 无法更新

Chrome 的"长任务"定义：
  - 执行超过 50ms 的任务
  - 会导致页面卡顿
  - 影响用户体验

React 的解决方案：
  - 将长任务拆分成多个 5ms 的小任务
  - 每个小任务后让出主线程
  - 避免被标记为"长任务"


实际案例：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Facebook 的问题：
  - 滚动 News Feed 时加载新内容
  - 渲染大量帖子（图片、视频、评论）
  - 同步渲染导致滚动卡顿

解决方案：
  - 使用 Concurrent Mode
  - 时间切片渲染新内容
  - 保持滚动流畅

结果：
  - 帧率从 30fps 提升到 60fps
  - 用户投诉减少 80%`}
      </pre>
    </div>
  );
}

function Implementation() {
  return (
    <div>
      <pre style={{ background: '#f5f5f5', padding: '15px', borderRadius: '5px', overflow: 'auto', fontSize: '13px', lineHeight: '1.8' }}>
{`React 时间切片实现原理
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

核心思路：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. 将渲染任务拆分成多个小单元（Fiber 节点）
2. 每处理完一个单元，检查是否需要让出主线程
3. 如果需要让出，保存当前进度，稍后恢复
4. 通过宏任务（MessageChannel）恢复执行


关键组件：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Fiber 架构
   - 每个组件对应一个 Fiber 节点
   - Fiber 节点形成链表结构
   - 可中断、可恢复

2. Scheduler（调度器）
   - 管理任务队列
   - 判断是否需要让出主线程
   - 使用 MessageChannel 恢复执行

3. workLoopConcurrent
   - 并发模式的工作循环
   - 每次循环检查 shouldYield()

4. shouldYield
   - 判断是否需要让出主线程
   - 基于时间（5ms）和优先级


完整流程：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Step 1: 触发更新
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

setState() 或 startTransition(() => setState())
  ↓
scheduleUpdateOnFiber()
  ↓
ensureRootIsScheduled()
  ↓
Scheduler.scheduleCallback(renderRootConcurrent)


Step 2: 开始渲染
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

renderRootConcurrent() {
  // 初始化
  prepareFreshStack(root);
  
  // 记录开始时间
  startTime = getCurrentTime();  // 例如：1000ms
  
  // 🔥 进入并发工作循环
  workLoopConcurrent();
}


Step 3: 工作循环
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function workLoopConcurrent() {
  // 🔥 关键：每次循环都检查 shouldYield()
  while (workInProgress !== null && !shouldYield()) {
    performUnitOfWork(workInProgress);
  }
}

循环过程：

第 1 次循环：
  workInProgress = <App> Fiber
  shouldYield() → false (已执行 1ms)
  performUnitOfWork(<App>)
  workInProgress = <Header> Fiber

第 2 次循环：
  workInProgress = <Header> Fiber
  shouldYield() → false (已执行 2ms)
  performUnitOfWork(<Header>)
  workInProgress = <Content> Fiber

第 3 次循环：
  workInProgress = <Content> Fiber
  shouldYield() → false (已执行 4ms)
  performUnitOfWork(<Content>)
  workInProgress = <List> Fiber

第 4 次循环：
  workInProgress = <List> Fiber
  shouldYield() → true ✋ (已执行 5.2ms)
  ↓
  跳出循环，保存进度


Step 4: 让出主线程
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

workLoopConcurrent() 返回
  ↓
renderRootConcurrent() 检测到未完成
  ↓
返回 RootInProgress
  ↓
Scheduler 知道任务未完成
  ↓
保持任务在队列中
  ↓
通过 MessageChannel 调度下一个时间片


Step 5: 浏览器处理其他任务
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

主线程空闲
  ↓
处理用户输入（点击、输入）
  ↓
处理滚动事件
  ↓
执行其他高优先级任务
  ↓
执行 requestAnimationFrame
  ↓
Layout + Paint


Step 6: 恢复执行
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

MessageChannel 宏任务触发
  ↓
performWorkUntilDeadline()
  ↓
重新调用 renderRootConcurrent()
  ↓
从 workInProgress = <List> Fiber 继续
  ↓
workLoopConcurrent() 继续循环


完整时间线：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

0ms - 5ms：
  ┌─────────────────────────────────────┐
  │ React 渲染 (Slice 1)                │
  │ - 处理 <App>                        │
  │ - 处理 <Header>                     │
  │ - 处理 <Content>                    │
  └─────────────────────────────────────┘
        ↓ shouldYield() = true
        
5ms - 10ms：
  ┌─────────────────────────────────────┐
  │ 浏览器处理                           │
  │ - 用户输入                          │
  │ - 滚动事件                          │
  │ - requestAnimationFrame             │
  └─────────────────────────────────────┘
        ↓ MessageChannel 触发
        
10ms - 15ms：
  ┌─────────────────────────────────────┐
  │ React 渲染 (Slice 2)                │
  │ - 处理 <List>                       │
  │ - 处理 <Item1>                      │
  │ - 处理 <Item2>                      │
  └─────────────────────────────────────┘
        ↓ shouldYield() = true
        
15ms - 20ms：
  ┌─────────────────────────────────────┐
  │ 浏览器处理                           │
  └─────────────────────────────────────┘
        ↓
        
... 重复直到完成


Fiber 链表结构：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

<App>
  <Header />
  <Content>
    <List>
      <Item />
      <Item />
    </List>
  </Content>
</App>

Fiber 树：
        [App]
         ↓ child
      [Header] → sibling → [Content]
                              ↓ child
                            [List]
                              ↓ child
                            [Item] → sibling → [Item]

workInProgress 指针沿着这个结构移动：
  App → Header → Content → List → Item1 → Item2

每移动一次，检查一次 shouldYield()


关键设计：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. 为什么用 MessageChannel？
   - 宏任务，优先级适中
   - 比 setTimeout 更精确
   - 避免 4ms 延迟

2. 为什么是 5ms？
   - 不会太长，避免阻塞
   - 不会太短，避免频繁调度
   - 基于大量实验和性能测试

3. 如何保存进度？
   - workInProgress 指针
   - Fiber 链表结构
   - 不需要额外状态

4. 如何恢复？
   - 从 workInProgress 继续
   - 无需重新开始`}
      </pre>
    </div>
  );
}

function SourceCode() {
  return (
    <div>
      <pre style={{ background: '#f5f5f5', padding: '15px', borderRadius: '5px', overflow: 'auto', fontSize: '12px', lineHeight: '1.6' }}>
{`React 时间切片源码分析
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. workLoopConcurrent - 并发工作循环
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ReactFiberWorkLoop.old.js (line ~1824)

function workLoopConcurrent() {
  // Perform work until Scheduler asks us to yield
  // 🔥 关键：每次循环都检查 shouldYield()
  while (workInProgress !== null && !shouldYield()) {
    performUnitOfWork(workInProgress);
  }
}

// 对比：同步工作循环
function workLoopSync() {
  // 🔥 没有 shouldYield() 检查，一直执行到完成
  while (workInProgress !== null) {
    performUnitOfWork(workInProgress);
  }
}


2. shouldYieldToHost - 判断是否让出
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Scheduler.js (line ~440)

// 🔥 时间切片的核心判断逻辑
function shouldYieldToHost() {
  const timeElapsed = getCurrentTime() - startTime;
  
  // 🔥 Step 1: 如果执行时间小于 5ms，不让出
  if (timeElapsed < frameInterval) {  // frameInterval = 5ms
    // The main thread has only been blocked for a really short amount of time;
    // smaller than a single frame. Don't yield yet.
    return false;
  }
  
  // 🔥 Step 2: 超过 5ms，检查是否需要绘制
  // The main thread has been blocked for a non-negligible amount of time.
  // We may want to yield control of the main thread, so the browser can perform
  // high priority tasks. The main ones are painting and user input.
  
  if (enableIsInputPending) {
    if (needsPaint) {
      // 有待处理的绘制
      return true;
    }
    
    if (timeElapsed < continuousInputInterval) {  // 50ms
      // 检查是否有连续输入（如拖拽）
      if (isInputPending !== null) {
        return isInputPending();
      }
    } else if (timeElapsed < maxInterval) {  // 300ms
      // 检查是否有任何输入
      if (isInputPending !== null) {
        return isInputPending(continuousOptions);
      }
    } else {
      // 超过最大间隔，必须让出
      return true;
    }
  }
  
  // \`isInputPending\` is not available. Yield now.
  return true;
}


3. 时间配置
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// SchedulerFeatureFlags.js

// 🔥 默认时间片长度：5ms
export const frameYieldMs = 5;

// 🔥 连续输入检查间隔：50ms
export const continuousYieldMs = 50;

// 🔥 最大执行时间：300ms（防止饥饿）
export const maxYieldMs = 300;


// Scheduler.js (line ~433)

let frameInterval = frameYieldMs;  // 5ms
const continuousInputInterval = continuousYieldMs;  // 50ms
const maxInterval = maxYieldMs;  // 300ms
let startTime = -1;
let needsPaint = false;


4. getCurrentTime - 获取当前时间
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Scheduler.js (line ~44)

let getCurrentTime;

// 🔥 优先使用 performance.now()
const hasPerformanceNow =
  typeof performance === 'object' && typeof performance.now === 'function';

if (hasPerformanceNow) {
  const localPerformance = performance;
  getCurrentTime = () => localPerformance.now();
} else {
  // 降级使用 Date.now()
  const localDate = Date;
  const initialTime = localDate.now();
  getCurrentTime = () => localDate.now() - initialTime;
}


5. performWorkUntilDeadline - 执行直到截止时间
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Scheduler.js (line ~515)

const performWorkUntilDeadline = () => {
  if (scheduledHostCallback !== null) {
    const currentTime = getCurrentTime();
    
    // 🔥 记录开始时间，用于计算 timeElapsed
    startTime = currentTime;
    
    const hasTimeRemaining = true;
    
    let hasMoreWork = true;
    try {
      // 🔥 执行调度的回调（renderRootConcurrent）
      hasMoreWork = scheduledHostCallback(hasTimeRemaining, currentTime);
    } finally {
      if (hasMoreWork) {
        // 🔥 如果还有工作，调度下一个时间片
        schedulePerformWorkUntilDeadline();
      } else {
        isMessageLoopRunning = false;
        scheduledHostCallback = null;
      }
    }
  } else {
    isMessageLoopRunning = false;
  }
  
  needsPaint = false;
};


6. MessageChannel - 宏任务调度
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Scheduler.js (line ~550)

let schedulePerformWorkUntilDeadline;

// 🔥 浏览器环境：使用 MessageChannel
if (typeof localSetImmediate === 'function') {
  // Node.js 和 IE10+
  schedulePerformWorkUntilDeadline = () => {
    localSetImmediate(performWorkUntilDeadline);
  };
} else if (typeof MessageChannel !== 'undefined') {
  // 🔥 现代浏览器：MessageChannel
  const channel = new MessageChannel();
  const port = channel.port2;
  channel.port1.onmessage = performWorkUntilDeadline;
  
  schedulePerformWorkUntilDeadline = () => {
    port.postMessage(null);
  };
} else {
  // 降级：setTimeout
  schedulePerformWorkUntilDeadline = () => {
    localSetTimeout(performWorkUntilDeadline, 0);
  };
}


7. renderRootConcurrent - 并发渲染入口
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ReactFiberWorkLoop.old.js (line ~1744)

function renderRootConcurrent(root: FiberRoot, lanes: Lanes) {
  const prevExecutionContext = executionContext;
  executionContext |= RenderContext;
  const prevDispatcher = pushDispatcher();
  
  // 🔥 如果是新的渲染或优先级变化，初始化
  if (workInProgressRoot !== root || workInProgressRootRenderLanes !== lanes) {
    workInProgressTransitions = getTransitionsForLanes(root, lanes);
    prepareFreshStack(root, lanes);
  }
  
  // 🔥 进入并发工作循环
  do {
    try {
      workLoopConcurrent();  // 🔥🔥 在这里
      break;
    } catch (thrownValue) {
      handleError(root, thrownValue);
    }
  } while (true);
  
  resetContextDependencies();
  popDispatcher(prevDispatcher);
  executionContext = prevExecutionContext;
  
  // 🔥 检查渲染结果
  if (workInProgress !== null) {
    // 🔥 还有未完成的工作，返回 InProgress
    return RootInProgress;
  } else {
    // 🔥 完成了，返回退出状态
    workInProgressRoot = null;
    workInProgressRootRenderLanes = NoLanes;
    return workInProgressRootExitStatus;
  }
}


8. performUnitOfWork - 处理单个 Fiber
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ReactFiberWorkLoop.old.js (line ~1831)

function performUnitOfWork(unitOfWork: Fiber): void {
  const current = unitOfWork.alternate;
  
  let next;
  
  // 🔥 beginWork：处理当前 Fiber
  next = beginWork(current, unitOfWork, renderLanes);
  
  unitOfWork.memoizedProps = unitOfWork.pendingProps;
  
  if (next === null) {
    // 🔥 没有子节点，完成当前节点
    completeUnitOfWork(unitOfWork);
  } else {
    // 🔥 有子节点，继续处理子节点
    workInProgress = next;
  }
}


9. 完整流程示例
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// 用户代码
function App() {
  const [count, setCount] = useState(0);
  
  const handleClick = () => {
    startTransition(() => {
      setCount(c => c + 1);
    });
  };
  
  return (
    <>
      <button onClick={handleClick}>+1</button>
      <HugeList count={count} />  {/* 渲染 10000 个组件 */}
    </>
  );
}

// React 内部执行流程

1. 用户点击按钮
   ↓
2. startTransition 标记为低优先级更新
   ↓
3. scheduleUpdateOnFiber(fiber, lane)
   ↓
4. ensureRootIsScheduled(root)
   ↓
5. Scheduler.scheduleCallback(
     NormalPriority,
     performConcurrentWorkOnRoot.bind(null, root)
   )
   ↓
6. MessageChannel.port.postMessage(null)
   ↓
7. performWorkUntilDeadline()
   ↓
   startTime = getCurrentTime();  // 1000ms
   ↓
8. performConcurrentWorkOnRoot(root)
   ↓
9. renderRootConcurrent(root, lanes)
   ↓
10. workLoopConcurrent()
    ↓
    Iteration 1:
      workInProgress = <App> Fiber
      shouldYield() = false (1ms elapsed)
      performUnitOfWork(<App>)
    ↓
    Iteration 2:
      workInProgress = <button> Fiber
      shouldYield() = false (2ms elapsed)
      performUnitOfWork(<button>)
    ↓
    Iteration 3:
      workInProgress = <HugeList> Fiber
      shouldYield() = false (3ms elapsed)
      performUnitOfWork(<HugeList>)
    ↓
    Iteration 4:
      workInProgress = <Item1> Fiber
      shouldYield() = false (4.5ms elapsed)
      performUnitOfWork(<Item1>)
    ↓
    Iteration 5:
      workInProgress = <Item2> Fiber
      shouldYield() = true ✋ (5.2ms elapsed)
      ↓
      跳出循环
    ↓
11. renderRootConcurrent 返回 RootInProgress
    ↓
12. performConcurrentWorkOnRoot 返回 root
    ↓
13. Scheduler 知道任务未完成，保持在队列中
    ↓
14. schedulePerformWorkUntilDeadline()
    ↓
15. MessageChannel.port.postMessage(null)
    ↓
    【主线程让出，浏览器处理其他任务】
    ↓
16. 下一个宏任务：performWorkUntilDeadline()
    ↓
17. 从 workInProgress = <Item2> 继续
    ↓
    ... 重复 10-16，直到完成


关键点总结：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. workLoopConcurrent 每次循环检查 shouldYield()
2. shouldYieldToHost 基于时间（5ms）判断
3. 使用 MessageChannel 宏任务恢复执行
4. workInProgress 指针保存进度
5. Fiber 链表结构支持中断和恢复`}
      </pre>
    </div>
  );
}

function Scheduling() {
  return (
    <div>
      <pre style={{ background: '#f5f5f5', padding: '15px', borderRadius: '5px', overflow: 'auto', fontSize: '13px', lineHeight: '1.8' }}>
{`调度机制详解
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Scheduler 的作用：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. 任务队列管理
   - 维护任务优先级队列
   - 管理任务的调度和执行

2. 时间切片控制
   - 判断何时让出主线程
   - 调度下一个时间片

3. 优先级调度
   - 高优先级任务优先执行
   - 低优先级任务可被打断


任务优先级：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Scheduler.js

export const NoPriority = 0;
export const ImmediatePriority = 1;      // 立即执行（同步）
export const UserBlockingPriority = 2;   // 用户交互（250ms 超时）
export const NormalPriority = 3;         // 普通更新（5s 超时）
export const LowPriority = 4;            // 低优先级（10s 超时）
export const IdlePriority = 5;           // 空闲时执行（永不超时）


// 超时时间配置
var IMMEDIATE_PRIORITY_TIMEOUT = -1;
var USER_BLOCKING_PRIORITY_TIMEOUT = 250;
var NORMAL_PRIORITY_TIMEOUT = 5000;
var LOW_PRIORITY_TIMEOUT = 10000;
var IDLE_PRIORITY_TIMEOUT = maxSigned31BitInt;  // 永不超时


任务调度流程：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Step 1: 创建任务
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function unstable_scheduleCallback(
  priorityLevel,
  callback,
  options
) {
  var currentTime = getCurrentTime();
  
  // 🔥 计算开始时间
  var startTime;
  if (typeof options === 'object' && options !== null) {
    var delay = options.delay;
    if (typeof delay === 'number' && delay > 0) {
      startTime = currentTime + delay;
    } else {
      startTime = currentTime;
    }
  } else {
    startTime = currentTime;
  }
  
  // 🔥 计算超时时间
  var timeout;
  switch (priorityLevel) {
    case ImmediatePriority:
      timeout = IMMEDIATE_PRIORITY_TIMEOUT;
      break;
    case UserBlockingPriority:
      timeout = USER_BLOCKING_PRIORITY_TIMEOUT;
      break;
    case IdlePriority:
      timeout = IDLE_PRIORITY_TIMEOUT;
      break;
    case LowPriority:
      timeout = LOW_PRIORITY_TIMEOUT;
      break;
    case NormalPriority:
    default:
      timeout = NORMAL_PRIORITY_TIMEOUT;
      break;
  }
  
  // 🔥 创建任务对象
  var expirationTime = startTime + timeout;
  
  var newTask = {
    id: taskIdCounter++,
    callback,
    priorityLevel,
    startTime,
    expirationTime,
    sortIndex: -1,
  };
  
  // 🔥 根据开始时间决定放入哪个队列
  if (startTime > currentTime) {
    // 延迟任务 → timerQueue
    newTask.sortIndex = startTime;
    push(timerQueue, newTask);
    
    if (peek(taskQueue) === null && newTask === peek(timerQueue)) {
      // 设置定时器
      requestHostTimeout(handleTimeout, startTime - currentTime);
    }
  } else {
    // 立即任务 → taskQueue
    newTask.sortIndex = expirationTime;
    push(taskQueue, newTask);
    
    // 🔥 开始调度
    if (!isHostCallbackScheduled && !isPerformingWork) {
      isHostCallbackScheduled = true;
      requestHostCallback(flushWork);
    }
  }
  
  return newTask;
}


Step 2: 执行任务队列
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function flushWork(hasTimeRemaining, initialTime) {
  isHostCallbackScheduled = false;
  isPerformingWork = true;
  
  const previousPriorityLevel = currentPriorityLevel;
  try {
    // 🔥 执行工作循环
    return workLoop(hasTimeRemaining, initialTime);
  } finally {
    currentTask = null;
    currentPriorityLevel = previousPriorityLevel;
    isPerformingWork = false;
  }
}

function workLoop(hasTimeRemaining, initialTime) {
  let currentTime = initialTime;
  
  // 🔥 检查延迟任务是否到期
  advanceTimers(currentTime);
  
  currentTask = peek(taskQueue);
  
  // 🔥 处理所有任务，直到队列为空或需要让出
  while (
    currentTask !== null &&
    !(enableSchedulerDebugging && isSchedulerPaused)
  ) {
    if (
      currentTask.expirationTime > currentTime &&
      (!hasTimeRemaining || shouldYieldToHost())
    ) {
      // 🔥 任务未过期 && 需要让出
      break;
    }
    
    const callback = currentTask.callback;
    if (typeof callback === 'function') {
      currentTask.callback = null;
      currentPriorityLevel = currentTask.priorityLevel;
      
      const didUserCallbackTimeout = currentTask.expirationTime <= currentTime;
      
      // 🔥 执行任务回调（renderRootConcurrent）
      const continuationCallback = callback(didUserCallbackTimeout);
      
      currentTime = getCurrentTime();
      
      if (typeof continuationCallback === 'function') {
        // 🔥 任务返回函数 → 还有后续工作
        currentTask.callback = continuationCallback;
      } else {
        // 🔥 任务完成 → 从队列移除
        if (currentTask === peek(taskQueue)) {
          pop(taskQueue);
        }
      }
      
      advanceTimers(currentTime);
    } else {
      // 回调为空，移除任务
      pop(taskQueue);
    }
    
    currentTask = peek(taskQueue);
  }
  
  // 🔥 返回是否还有工作
  if (currentTask !== null) {
    return true;  // 还有工作
  } else {
    // 检查延迟队列
    const firstTimer = peek(timerQueue);
    if (firstTimer !== null) {
      requestHostTimeout(handleTimeout, firstTimer.startTime - currentTime);
    }
    return false;  // 没有工作了
  }
}


Step 3: 任务优先级插队
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

假设场景：
  正在执行低优先级渲染（NormalPriority）
  用户突然点击按钮（UserBlockingPriority）

执行流程：

1. 低优先级任务正在执行
   taskQueue: [Task1 (Normal, exp: 5000ms)]
   currentTask = Task1
   
2. 用户点击 → 高优先级更新
   scheduleCallback(UserBlockingPriority, renderHighPriority)
   
3. 新任务插入队列（按 expirationTime 排序）
   taskQueue: [Task2 (UserBlocking, exp: 250ms), Task1 (Normal, exp: 5000ms)]
   
4. 当前时间片结束，shouldYield() = true
   
5. workLoop 检查队列
   currentTask = peek(taskQueue)  // Task2 (高优先级)
   
6. 执行 Task2（高优先级）
   
7. Task2 完成后，继续执行 Task1（低优先级）


任务饥饿保护：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

问题：低优先级任务一直被高优先级任务打断，永远无法完成

解决方案：expirationTime

示例：
  Task1: NormalPriority, startTime: 0ms, expirationTime: 5000ms
  
  0ms - 5000ms:
    不断有高优先级任务插队
    Task1 一直被打断
    
  5000ms:
    Task1.expirationTime <= currentTime
    Task1 过期了！
    
  shouldYield() 检查：
    if (currentTask.expirationTime > currentTime && shouldYieldToHost()) {
      break;  // 只有未过期的任务才会让出
    }
    
    // Task1 已过期，不会让出，必须执行完


MessageChannel vs setTimeout vs requestIdleCallback：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

┌─────────────────┬──────────┬──────────┬──────────┐
│ 方案             │ 延迟     │ 优先级   │ React 使用│
├─────────────────┼──────────┼──────────┼──────────┤
│ MessageChannel   │ 0ms      │ 宏任务   │ ✅ 首选  │
│ setImmediate     │ 0ms      │ 宏任务   │ ✅ Node   │
│ setTimeout(0)    │ 4ms      │ 宏任务   │ ❌ 延迟高│
│ requestIdleCallback│ 不确定 │ 空闲     │ ❌ 不稳定│
└─────────────────┴──────────┴──────────┴──────────┘

为什么用 MessageChannel？
  1. 延迟最小（0ms）
  2. 优先级适中（宏任务）
  3. 兼容性好
  4. 不受最小延迟限制


完整时间线（多优先级）：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

0ms:
  用户触发两个更新：
  - Task1: NormalPriority（渲染大列表）
  - Task2: UserBlockingPriority（输入框更新）
  
  taskQueue: [Task2, Task1]

0ms - 5ms:
  执行 Task2（高优先级）
  renderRootConcurrent → workLoopConcurrent
  完成输入框更新
  
5ms:
  Task2 完成
  currentTask = Task1
  
5ms - 10ms:
  执行 Task1（低优先级）
  处理 100 个列表项
  shouldYield() = true
  
10ms - 15ms:
  浏览器处理用户输入、绘制
  
15ms - 20ms:
  继续 Task1
  处理下一批 100 个列表项
  shouldYield() = true
  
... 重复直到 Task1 完成`}
      </pre>
    </div>
  );
}

function Demo() {
  const [mode, setMode] = useState('sync');
  const [count, setCount] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [logs, setLogs] = useState([]);
  const [isPending, startTransition] = useTransition();
  
  const addLog = (message) => {
    setLogs(prev => [...prev, `${performance.now().toFixed(2)}ms - ${message}`]);
  };
  
  const handleHeavyUpdate = () => {
    setLogs([]);
    addLog('🔴 开始渲染');
    
    if (mode === 'sync') {
      // 同步渲染
      setCount(5000);
    } else {
      // 并发渲染（时间切片）
      startTransition(() => {
        setCount(5000);
      });
    }
  };
  
  return (
    <div>
      <h3>时间切片实时演示</h3>
      
      <div style={{ marginBottom: '20px', padding: '15px', background: '#e3f2fd', borderRadius: '5px' }}>
        <div style={{ marginBottom: '10px' }}>
          <label style={{ marginRight: '20px' }}>
            <input
              type="radio"
              checked={mode === 'sync'}
              onChange={() => setMode('sync')}
            />
            同步渲染（阻塞）
          </label>
          <label>
            <input
              type="radio"
              checked={mode === 'concurrent'}
              onChange={() => setMode('concurrent')}
            />
            并发渲染（时间切片）
          </label>
        </div>
        
        <button
          onClick={handleHeavyUpdate}
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
          渲染 5000 个组件
        </button>
        
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onFocus={() => addLog('🟢 输入框获得焦点')}
          onInput={(e) => addLog(`🟡 输入: \${e.target.value}`)}
          placeholder="试试在渲染时输入..."
          style={{
            padding: '10px',
            border: '1px solid #ccc',
            borderRadius: '5px',
            width: '300px'
          }}
        />
        
        {isPending && (
          <span style={{ marginLeft: '10px', color: '#ff9800' }}>
            ⏳ 渲染中...
          </span>
        )}
      </div>
      
      <div style={{ marginBottom: '20px', padding: '15px', background: '#fff3e0', borderRadius: '5px' }}>
        <h4>观察要点：</h4>
        <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', lineHeight: '1.8' }}>
          <li><strong>同步渲染</strong>：点击按钮后，输入框会卡住（无法输入）</li>
          <li><strong>并发渲染</strong>：点击按钮后，输入框仍然流畅（可以输入）</li>
          <li>查看日志，观察时间差异</li>
        </ul>
      </div>
      
      <div style={{ background: '#f5f5f5', padding: '15px', borderRadius: '5px', marginBottom: '20px' }}>
        <h4>渲染日志：</h4>
        <div style={{ maxHeight: '200px', overflow: 'auto', fontSize: '13px', fontFamily: 'monospace' }}>
          {logs.map((log, index) => (
            <div key={index} style={{ marginBottom: '3px' }}>{log}</div>
          ))}
        </div>
      </div>
      
      <div style={{ maxHeight: '300px', overflow: 'auto', border: '1px solid #ddd', borderRadius: '5px', padding: '10px' }}>
        {Array.from({ length: count }, (_, i) => (
          <HeavyComponent key={i} index={i} />
        ))}
      </div>
    </div>
  );
}

function HeavyComponent({ index }) {
  // 模拟耗时组件
  const start = performance.now();
  while (performance.now() - start < 0.01) {
    // 每个组件消耗 0.01ms
  }
  
  return (
    <div style={{ padding: '5px', borderBottom: '1px solid #eee' }}>
      Item {index}
    </div>
  );
}

function InterviewPoints() {
  return (
    <div>
      <pre style={{ background: '#f5f5f5', padding: '15px', borderRadius: '5px', overflow: 'auto', fontSize: '13px', lineHeight: '1.8' }}>
{`时间切片面试要点
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

必答问题：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Q1: React 如何实现时间切片？
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

A: 核心三步：

1. Fiber 架构：将渲染任务拆分成小单元
2. workLoopConcurrent：每处理一个 Fiber，检查 shouldYield()
3. MessageChannel：超过 5ms 后，用宏任务恢复执行

关键代码：
function workLoopConcurrent() {
  while (workInProgress !== null && !shouldYield()) {
    performUnitOfWork(workInProgress);
  }
}


Q2: 为什么时间片是 5ms？
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

A: 
1. 浏览器每帧 16.6ms（60fps）
2. 浏览器需要 11.6ms（Layout + Paint）
3. React 使用 5ms，保证不阻塞渲染
4. 基于大量实验和性能测试


Q3: shouldYield 如何判断？
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

A: 基于时间和输入事件：

function shouldYieldToHost() {
  const timeElapsed = getCurrentTime() - startTime;
  
  // 1. 时间检查
  if (timeElapsed < 5ms) return false;
  
  // 2. 绘制检查
  if (needsPaint) return true;
  
  // 3. 输入检查
  if (isInputPending && isInputPending()) return true;
  
  return true;
}


Q4: 为什么用 MessageChannel？
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

A: 
1. setTimeout 有 4ms 最小延迟
2. requestIdleCallback 优先级太低，不稳定
3. MessageChannel 零延迟，优先级适中
4. 宏任务，在浏览器渲染后执行


Q5: 时间切片和 requestIdleCallback 的区别？
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

A:
时间切片：
  - 主动让出（5ms）
  - 精确控制
  - 支持优先级
  - 保证执行

requestIdleCallback：
  - 被动等待空闲
  - 不稳定（可能很久不执行）
  - 无优先级
  - 可能饿死


Q6: 如何启用时间切片？
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

A: React 18+：

1. createRoot（默认启用）
const root = createRoot(document.getElementById('root'));
root.render(<App />);

2. useTransition
const [isPending, startTransition] = useTransition();
startTransition(() => {
  setCount(10000);  // 使用时间切片
});

3. useDeferredValue
const deferredValue = useDeferredValue(value);


Q7: 时间切片的缺点？
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

A:
1. 整体时间变长（频繁切换）
2. 内存占用增加（保存中间状态）
3. 调试困难（异步、分片）
4. 不适合所有场景（同步场景）


Q8: 哪些场景适合时间切片？
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

A:
适合：
  ✅ 大列表渲染
  ✅ 复杂表单
  ✅ 数据可视化
  ✅ 搜索结果
  ✅ 后台任务

不适合：
  ❌ 用户输入（需要同步）
  ❌ 动画（需要精确帧率）
  ❌ 简单页面（无性能问题）


高级问题：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Q9: 时间切片如何处理任务饥饿？
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

A: 通过 expirationTime（过期时间）：

每个任务有过期时间：
  - ImmediatePriority: -1ms（立即执行）
  - UserBlockingPriority: 250ms
  - NormalPriority: 5000ms
  - LowPriority: 10000ms

过期后，任务不再让出：
if (currentTask.expirationTime > currentTime && shouldYield()) {
  break;  // 只有未过期才让出
}


Q10: Fiber 架构如何支持时间切片？
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

A: 关键设计：

1. 链表结构
   - 每个 Fiber 有 child、sibling、return 指针
   - 可随时暂停、恢复

2. workInProgress 指针
   - 保存当前处理的 Fiber
   - 暂停时保存，恢复时继续

3. 双缓冲
   - current 树（当前屏幕）
   - workInProgress 树（正在构建）
   - 完成后切换

4. 增量渲染
   - 每次只处理一个 Fiber
   - 粒度细，可随时打断


对比总结：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

┌──────────────┬──────────┬──────────┬──────────┐
│ 特性          │ 同步渲染  │ 时间切片  │ 备注     │
├──────────────┼──────────┼──────────┼──────────┤
│ 可中断        │ ❌       │ ✅       │ 核心     │
│ 响应性        │ 差       │ 好       │ <16ms    │
│ 整体时间      │ 快       │ 慢       │ +10-20%  │
│ 内存占用      │ 低       │ 高       │ 中间状态 │
│ 优先级        │ ❌       │ ✅       │ 可调度   │
│ 调试难度      │ 低       │ 高       │ 异步     │
└──────────────┴──────────┴──────────┴──────────┘


关键概念：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔥 时间切片 = Fiber + workLoopConcurrent + shouldYield + MessageChannel
🔥 核心目标：避免长任务阻塞，保持页面响应
🔥 最佳实践：用 useTransition 标记低优先级更新`}
      </pre>
    </div>
  );
}
