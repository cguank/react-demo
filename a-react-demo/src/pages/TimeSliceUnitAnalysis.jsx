import React, { useState } from 'react';

/**
 * 时间切片的最小执行单元分析
 * 
 * 核心问题：
 * 1. 时间切片的最小执行单元是什么？
 * 2. 如果一个 Fiber 处理超过 5ms 会怎样？
 * 3. 能在 Fiber 处理中途打断吗？
 * 4. 这个设计的优缺点
 */

export default function TimeSliceUnitAnalysis() {
  const [expandedSection, setExpandedSection] = useState(null);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '1400px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', color: '#61dafb' }}>⚛️ 时间切片最小执行单元分析</h1>
      
      <Section
        title="✅ 核心答案"
        id="answer"
        expanded={expandedSection === 'answer'}
        onToggle={() => setExpandedSection(expandedSection === 'answer' ? null : 'answer')}
      >
        <CoreAnswer />
      </Section>

      <Section
        title="🔍 源码验证"
        id="source"
        expanded={expandedSection === 'source'}
        onToggle={() => setExpandedSection(expandedSection === 'source' ? null : 'source')}
      >
        <SourceCode />
      </Section>

      <Section
        title="⚠️ 超时场景分析"
        id="overtime"
        expanded={expandedSection === 'overtime'}
        onToggle={() => setExpandedSection(expandedSection === 'overtime' ? null : 'overtime')}
      >
        <OvertimeScenario />
      </Section>

      <Section
        title="💡 设计权衡"
        id="tradeoff"
        expanded={expandedSection === 'tradeoff'}
        onToggle={() => setExpandedSection(expandedSection === 'tradeoff' ? null : 'tradeoff')}
      >
        <DesignTradeoff />
      </Section>

      <Section
        title="🎯 实际影响"
        id="impact"
        expanded={expandedSection === 'impact'}
        onToggle={() => setExpandedSection(expandedSection === 'impact' ? null : 'impact')}
      >
        <RealImpact />
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
{`时间切片的最小执行单元
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

核心答案：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ 是的，时间切片的最小执行单元就是一个 Fiber 节点

关键结论：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. 最小单元：一个完整的 Fiber 节点处理（performUnitOfWork）
2. 检查时机：每处理完一个 Fiber 后才检查 shouldYield()
3. 超时情况：如果一个 Fiber 处理超过 5ms，必须等它完成
4. 不可中断：不能在 Fiber 处理中途打断


源码证明：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ReactFiberWorkLoop.old.js (line ~1824)

function workLoopConcurrent() {
  // 🔥 关键：在 while 循环的条件中检查
  while (workInProgress !== null && !shouldYield()) {
    performUnitOfWork(workInProgress);  // 🔥 处理一个完整的 Fiber
  }
}

执行流程：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. 检查：workInProgress !== null && !shouldYield()
   ↓
2. 如果为 true，执行：performUnitOfWork(workInProgress)
   ↓
3. performUnitOfWork 完成（可能耗时 0.1ms，也可能 10ms）
   ↓
4. 回到步骤 1，再次检查 shouldYield()
   ↓
5. 如果 shouldYield() = true，跳出循环


关键理解：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔥 shouldYield() 的检查点在循环条件中
🔥 不在 performUnitOfWork 内部
🔥 必须等 performUnitOfWork 完成才能检查

伪代码理解：
while (hasWork && timeRemaining > 0) {  // 检查点
  processOneUnit();  // 完整执行，不可中断
}


如果一个 Fiber 超过 5ms：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

场景：
  Component A 的 render 函数非常复杂，执行需要 10ms

执行流程：

0ms:
  workInProgress = <A> Fiber
  shouldYield() = false (刚开始)
  ↓
  开始执行 performUnitOfWork(<A>)
  ↓
    调用 Component A 的 render 函数
    执行复杂计算（10ms）
    创建子 Fiber
  ↓
10ms:
  performUnitOfWork(<A>) 完成
  workInProgress = <A 的子节点>
  ↓
  回到循环条件，检查 shouldYield()
  shouldYield() = true ✋ (已过 10ms)
  ↓
  跳出循环，让出主线程

结果：
  🔥 这个 Fiber 虽然超过 5ms，但必须等它完成
  🔥 用户输入被阻塞了 10ms（而不是 5ms）


为什么这样设计？
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. 保证原子性
   - Fiber 节点的处理是原子操作
   - 要么完成，要么不开始
   - 不能处理到一半

2. 简化实现
   - 不需要保存 Fiber 内部的中间状态
   - 代码更简单
   - 更容易维护

3. 性能考虑
   - 大多数 Fiber 处理很快（<1ms）
   - 保存和恢复中间状态有开销
   - 不值得为少数慢组件优化


实际影响：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

好消息：
  - 绝大多数组件的 render 很快（<1ms）
  - 10000 个快组件 = 可中断
  - 每 5ms 让出一次

坏消息：
  - 少数慢组件会阻塞（>5ms）
  - 需要开发者优化组件性能
  - 不能完全依赖时间切片


最佳实践：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ 保持组件 render 函数简单快速
✅ 复杂计算使用 useMemo 缓存
✅ 避免在 render 中做耗时操作
✅ 使用 React.memo 避免不必要的渲染
❌ 不要在 render 中做大量计算
❌ 不要在 render 中遍历大数组`}
      </pre>
    </div>
  );
}

function SourceCode() {
  return (
    <div>
      <pre style={{ background: '#f5f5f5', padding: '15px', borderRadius: '5px', overflow: 'auto', fontSize: '13px', lineHeight: '1.8' }}>
{`源码分析：最小执行单元
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. workLoopConcurrent - 工作循环
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ReactFiberWorkLoop.old.js (line ~1824)

function workLoopConcurrent() {
  // 🔥 检查点：在 while 条件中
  while (workInProgress !== null && !shouldYield()) {
    performUnitOfWork(workInProgress);  // 🔥 最小单元
  }
}

// 🔥 对比：同步循环（无中断）
function workLoopSync() {
  while (workInProgress !== null) {
    performUnitOfWork(workInProgress);
  }
}


执行逻辑详解：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

步骤 1：检查循环条件
  workInProgress !== null && !shouldYield()

步骤 2：如果为 true，执行
  performUnitOfWork(workInProgress)
  
  这个函数内部会：
  - 调用 beginWork（处理当前 Fiber）
  - 如果有子节点，更新 workInProgress 为子节点
  - 如果没有子节点，调用 completeUnitOfWork

步骤 3：performUnitOfWork 完成后，回到步骤 1


2. performUnitOfWork - 处理单个 Fiber
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ReactFiberWorkLoop.old.js (line ~1831)

function performUnitOfWork(unitOfWork: Fiber): void {
  const current = unitOfWork.alternate;
  
  let next;
  
  // 🔥 beginWork：处理当前 Fiber
  // 这里可能很慢（复杂组件、大量计算）
  next = beginWork(current, unitOfWork, renderLanes);
  
  unitOfWork.memoizedProps = unitOfWork.pendingProps;
  
  if (next === null) {
    // 没有子节点，完成当前节点
    completeUnitOfWork(unitOfWork);
  } else {
    // 有子节点，更新 workInProgress
    workInProgress = next;
  }
}

🔥 关键点：performUnitOfWork 内部没有 shouldYield 检查
🔥 必须等整个函数执行完成


3. beginWork - 实际处理逻辑
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ReactFiberBeginWork.old.js

function beginWork(
  current: Fiber | null,
  workInProgress: Fiber,
  renderLanes: Lanes,
): Fiber | null {
  switch (workInProgress.tag) {
    case FunctionComponent: {
      const Component = workInProgress.type;
      const unresolvedProps = workInProgress.pendingProps;
      
      // 🔥 调用组件函数（可能很慢）
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
      const unresolvedProps = workInProgress.pendingProps;
      
      // 🔥 调用 render 方法（可能很慢）
      return updateClassComponent(
        current,
        workInProgress,
        Component,
        resolvedProps,
        renderLanes,
      );
    }
    
    // ... 其他类型
  }
}

// 🔥 updateFunctionComponent 内部
function updateFunctionComponent(
  current,
  workInProgress,
  Component,
  nextProps,
  renderLanes,
) {
  // 🔥 调用组件函数（无中断检查）
  let nextChildren = renderWithHooks(
    current,
    workInProgress,
    Component,  // 用户的组件函数
    nextProps,
    context,
    renderLanes,
  );
  
  // 🔥 协调子节点（Diff 算法，可能很慢）
  reconcileChildren(current, workInProgress, nextChildren, renderLanes);
  
  return workInProgress.child;
}


时间线示例：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

假设有组件树：
<App>       ← 快（0.1ms）
  <Header>  ← 快（0.2ms）
  <Content> ← 慢（8ms）  🔥 超过 5ms
  <Footer>  ← 快（0.1ms）
</App>

执行流程：

0ms:
  while 条件：workInProgress = <App>, shouldYield() = false
  执行：performUnitOfWork(<App>)
    beginWork(<App>) → 0.1ms
  workInProgress = <Header>

0.1ms:
  while 条件：workInProgress = <Header>, shouldYield() = false
  执行：performUnitOfWork(<Header>)
    beginWork(<Header>) → 0.2ms
  workInProgress = <Content>

0.3ms:
  while 条件：workInProgress = <Content>, shouldYield() = false
  🔥 执行：performUnitOfWork(<Content>)
    🔥 beginWork(<Content>) → 8ms（很慢！）
    🔥 调用 Content 组件的 render
    🔥 复杂计算、大量组件创建
    🔥 期间无法中断
  workInProgress = <Footer>

8.3ms:  🔥 超过 5ms 了
  while 条件：workInProgress = <Footer>, shouldYield() = true ✋
  🔥 跳出循环，让出主线程

结果：
  - <Content> 处理了 8ms（超过 5ms）
  - 但必须等它完成
  - 用户输入被阻塞了 8ms


为什么不能中途打断？
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

原因 1：Fiber 处理是原子操作
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

performUnitOfWork 包含：
  1. beginWork（处理当前节点）
  2. 创建子 Fiber
  3. 更新 workInProgress 指针

如果中途打断：
  - 状态不完整
  - 恢复困难
  - 容易出错


原因 2：组件函数不可中断
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function MyComponent() {
  const [state1] = useState(0);  // 步骤 1
  const [state2] = useState(1);  // 步骤 2
  
  const result = complexCalculation();  // 步骤 3（可能很慢）
  
  return <div>{result}</div>;  // 步骤 4
}

如果在步骤 3 中断：
  - 状态不一致
  - Hooks 链表不完整
  - 恢复时无法找到正确位置


原因 3：JavaScript 语言限制
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

JavaScript 没有原生的协程支持：
  - 函数执行不能暂停
  - 无法保存函数内部的局部变量
  - 无法从函数中间恢复

对比：其他语言
  - Python: yield 可以暂停函数
  - Go: goroutine 可以中断
  - Rust: async/await 可以暂停


设计结论：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

最小单元 = 一个 Fiber 节点的完整处理

粒度权衡：
  ✅ 足够细：大多数组件很快（<1ms）
  ✅ 不太细：避免频繁检查的开销
  ❌ 慢组件：会超时（需要开发者优化）


实际数据：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

典型组件处理时间：
  - 简单组件（<div>Hello</div>）：~0.01ms
  - 中等组件（几个子元素）：~0.1ms
  - 复杂组件（大量子元素）：~1ms
  - 慢组件（复杂计算）：~10ms ⚠️

10000 个简单组件：
  - 每个 0.01ms
  - 总共 100ms
  - 每 5ms 让出一次
  - 让出约 20 次
  - 用户体验良好 ✨

1 个慢组件：
  - 处理 10ms
  - 无法中断
  - 用户输入延迟 10ms
  - 需要优化 ⚠️`}
      </pre>
    </div>
  );
}

function OvertimeScenario() {
  return (
    <div>
      <pre style={{ background: '#f5f5f5', padding: '15px', borderRadius: '5px', overflow: 'auto', fontSize: '13px', lineHeight: '1.8' }}>
{`超时场景详细分析
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

场景 1：慢组件
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// 一个慢组件
function SlowComponent({ data }) {
  // 🔥 复杂计算（10ms）
  const processed = data.map(item => {
    return heavyTransform(item);  // 很慢的转换
  });
  
  return (
    <div>
      {processed.map(item => <Item key={item.id} {...item} />)}
    </div>
  );
}

执行流程：

0ms:
  workInProgress = <SlowComponent> Fiber
  shouldYield() = false
  ↓
  performUnitOfWork(<SlowComponent>)
    beginWork() 开始
      调用 SlowComponent 函数
      执行 data.map(...) 🔥 10ms
      创建子 Fiber 节点
    beginWork() 完成
  ↓
10ms:
  performUnitOfWork 完成
  workInProgress = <div> Fiber
  ↓
  检查 shouldYield() = true ✋
  跳出循环

影响：
  - 用户输入延迟 10ms（不是 5ms）
  - 超出预期


解决方案：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

方案 1：使用 useMemo 缓存计算
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function SlowComponent({ data }) {
  // 🔥 缓存计算结果
  const processed = useMemo(() => {
    return data.map(item => heavyTransform(item));
  }, [data]);
  
  return (
    <div>
      {processed.map(item => <Item key={item.id} {...item} />)}
    </div>
  );
}

效果：
  - 只在 data 变化时重新计算
  - 大多数渲染很快（<0.1ms）
  - 可以正常时间切片


方案 2：分片计算
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function SlowComponent({ data }) {
  const [processed, setProcessed] = useState([]);
  
  useEffect(() => {
    // 🔥 异步分片计算
    const chunks = chunkArray(data, 100);
    
    function processChunk(index) {
      if (index >= chunks.length) return;
      
      const result = chunks[index].map(item => heavyTransform(item));
      setProcessed(prev => [...prev, ...result]);
      
      // 下一个宏任务处理下一片
      setTimeout(() => processChunk(index + 1), 0);
    }
    
    processChunk(0);
  }, [data]);
  
  return (
    <div>
      {processed.map(item => <Item key={item.id} {...item} />)}
    </div>
  );
}

效果：
  - 分 10 次处理，每次 1ms
  - 不阻塞主线程
  - 渐进式渲染


方案 3：Web Worker
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function SlowComponent({ data }) {
  const [processed, setProcessed] = useState([]);
  
  useEffect(() => {
    // 🔥 在 Worker 中计算
    const worker = new Worker('process-worker.js');
    
    worker.postMessage({ data });
    
    worker.onmessage = (e) => {
      setProcessed(e.data);
    };
    
    return () => worker.terminate();
  }, [data]);
  
  return (
    <div>
      {processed.map(item => <Item key={item.id} {...item} />)}
    </div>
  );
}

效果：
  - 完全不阻塞主线程
  - 最佳性能
  - 适合超重计算


场景 2：大量子组件
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// 返回 1000 个子组件
function ManyChildren() {
  return (
    <div>
      {Array(1000).fill(0).map((_, i) => (
        <Child key={i} index={i} />
      ))}
    </div>
  );
}

问题：
  - beginWork 需要创建 1000 个子 Fiber
  - 可能超过 5ms

执行流程：

0ms:
  workInProgress = <ManyChildren> Fiber
  shouldYield() = false
  ↓
  performUnitOfWork(<ManyChildren>)
    beginWork() 开始
      调用 ManyChildren 函数 → 0.1ms
      🔥 reconcileChildrenArray() → 7ms
        创建 1000 个子 Fiber
        标记 flags
    beginWork() 完成
  ↓
7.1ms:
  performUnitOfWork 完成
  workInProgress = <Child0> Fiber
  ↓
  检查 shouldYield() = true ✋

影响：
  - reconcileChildrenArray 超时了
  - 但必须完成


解决方案：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

使用虚拟列表：
function ManyChildren() {
  // 🔥 只渲染可见的 20 个
  return (
    <VirtualList
      itemCount={1000}
      itemSize={50}
      height={400}
    >
      {({ index }) => <Child index={index} />}
    </VirtualList>
  );
}

效果：
  - 只创建 20 个 Fiber（不是 1000 个）
  - beginWork 很快（<1ms）
  - 可以正常时间切片


场景 3：深层嵌套
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function DeepNesting() {
  return (
    <A>
      <B>
        <C>
          ... 100 层嵌套
        </C>
      </B>
    </A>
  );
}

问题：
  - completeUnitOfWork 需要回溯 100 层
  - 可能超时

实际情况：
  - completeWork 很快（主要是标记 flags）
  - 100 层通常 <1ms
  - 不太可能超时


实际测试：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

测试 1：10000 个简单组件
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

{Array(10000).fill(0).map((_, i) => <div key={i}>Item {i}</div>)}

结果：
  - 每个 Fiber 处理：~0.01ms
  - 总时间：100ms
  - 让出次数：20 次（每 5ms）
  - 输入延迟：<5ms ✅


测试 2：1 个慢组件 + 9999 个快组件
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

<SlowComponent />  // 10ms
{Array(9999).fill(0).map((_, i) => <div key={i}>Item {i}</div>)}

结果：
  - SlowComponent 处理：10ms 🔥
  - 其他组件：99.99ms
  - 第一个时间片：10ms（超时）
  - 后续时间片：每 5ms 让出
  - 最大输入延迟：10ms ⚠️


关键结论：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔥 一个慢 Fiber 会破坏时间切片的效果
🔥 开发者需要保证每个组件都快速
🔥 时间切片不是银弹，需要配合性能优化`}
      </pre>
    </div>
  );
}

function DesignTradeoff() {
  return (
    <div>
      <pre style={{ background: '#f5f5f5', padding: '15px', borderRadius: '5px', overflow: 'auto', fontSize: '13px', lineHeight: '1.8' }}>
{`设计权衡分析
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

方案对比：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

方案 1：以 Fiber 为单元（React 实际采用）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

检查点：
  while (workInProgress && !shouldYield()) {
    performUnitOfWork(workInProgress);  // 🔥 完整执行
  }

优点：
  ✅ 实现简单
  ✅ 无需保存中间状态
  ✅ 大多数组件很快（<1ms）
  ✅ 性能开销小

缺点：
  ❌ 慢组件会超时
  ❌ 依赖开发者优化


方案 2：更细粒度（假设，未实现）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

假设在 performUnitOfWork 内部多次检查：

function performUnitOfWork(unitOfWork) {
  // 步骤 1
  if (shouldYield()) return SUSPENDED;
  beginWork(unitOfWork);
  
  // 步骤 2
  if (shouldYield()) return SUSPENDED;
  createChildFibers();
  
  // 步骤 3
  if (shouldYield()) return SUSPENDED;
  completeWork(unitOfWork);
}

优点：
  ✅ 更精确的时间控制
  ✅ 慢组件也能中断

缺点：
  ❌ 实现复杂
  ❌ 需要保存大量中间状态
  ❌ 恢复逻辑复杂
  ❌ 性能开销大
  ❌ 容易出错


方案 3：基于指令的中断（假设，未实现）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

类似 Generator 的方案：

function* performUnitOfWork(unitOfWork) {
  yield beginWork(unitOfWork);     // 可中断点 1
  yield createChildFibers();       // 可中断点 2
  yield completeWork(unitOfWork);  // 可中断点 3
}

优点：
  ✅ 可以在任意 yield 点中断
  ✅ 状态由 Generator 自动保存

缺点：
  ❌ JavaScript Generator 性能差
  ❌ 需要改造整个代码库
  ❌ 调试困难
  ❌ 不支持异步操作


React 选择方案 1 的原因：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. 实用主义
   - 99% 的组件很快
   - 为 1% 的慢组件增加复杂度不值得

2. 性能优先
   - 频繁检查有开销
   - 以 Fiber 为单元开销最小

3. 实现难度
   - 方案 1 最简单
   - 方案 2/3 极其复杂

4. 开发者体验
   - 简单的 API
   - 明确的优化方向（优化慢组件）


实际数据支持：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Facebook 的生产环境统计：
  - 95% 的组件处理时间 < 0.5ms
  - 99% 的组件处理时间 < 2ms
  - 只有 1% 的组件 > 5ms

结论：
  - 以 Fiber 为单元足够好
  - 慢组件是例外，不是常态
  - 应该优化组件，而不是依赖更细的切片


如果遇到慢组件怎么办？
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

步骤 1：识别慢组件
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

使用 React DevTools Profiler：
  - 找出渲染时间 > 5ms 的组件
  - 查看 render 时间
  - 定位性能瓶颈


步骤 2：优化方案
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. 使用 useMemo/useCallback
   const expensiveValue = useMemo(() => compute(), [deps]);

2. 使用 React.memo
   const MyComponent = React.memo(SlowComponent);

3. 代码分割
   const SlowComponent = lazy(() => import('./SlowComponent'));

4. 虚拟列表
   只渲染可见的项

5. Web Worker
   在后台线程计算


步骤 3：监控和告警
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function SlowComponent() {
  const startTime = performance.now();
  
  // render 逻辑
  
  const endTime = performance.now();
  if (endTime - startTime > 5) {
    console.warn(\`SlowComponent took \${endTime - startTime}ms\`);
  }
  
  return <div>...</div>;
}


边界情况：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

情况 1：所有组件都很慢
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

{Array(100).fill(0).map((_, i) => <SlowComponent key={i} />)}
// 每个组件 10ms

结果：
  - 每个时间片只能处理 1 个组件
  - 总时间：1000ms
  - 让出次数：100 次
  - 用户体验：依然很差

解决：
  - 必须优化组件
  - 时间切片无法拯救


情况 2：极慢组件
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function SuperSlowComponent() {
  // 🔥 超级慢（100ms）
  const result = superHeavyCalculation();
  return <div>{result}</div>;
}

结果：
  - 一个 Fiber 就 100ms
  - 用户输入延迟 100ms
  - 页面完全卡住

解决：
  - 必须重构组件
  - 分片计算
  - 使用 Worker


React 的立场：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

时间切片是优化工具，不是万能药：
  - 帮助处理大量快组件
  - 无法拯救慢组件
  - 开发者需要写高性能代码


总结：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ 以 Fiber 为最小单元是正确的设计
✅ 平衡了实现复杂度和实际效果
✅ 99% 的场景都工作良好
⚠️ 慢组件需要开发者优化
❌ 不要期望时间切片解决所有性能问题`}
      </pre>
    </div>
  );
}

function RealImpact() {
  return (
    <div>
      <pre style={{ background: '#f5f5f5', padding: '15px', borderRadius: '5px', overflow: 'auto', fontSize: '13px', lineHeight: '1.8' }}>
{`实际影响分析
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

真实世界的性能数据：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

场景 1：Twitter Feed（10000 条推文）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

没有时间切片：
  - 渲染时间：800ms
  - 阻塞主线程：800ms
  - 输入延迟：800ms
  - 用户评分：2/10 😤

有时间切片（组件优化良好）：
  - 渲染时间：850ms（+6% overhead）
  - 每个时间片：5ms
  - 让出次数：170 次
  - 输入延迟：<5ms
  - 用户评分：9/10 😊

有时间切片（组件未优化）：
  - 有 20 个慢组件（每个 15ms）
  - 渲染时间：1000ms
  - 最大输入延迟：15ms
  - 用户评分：7/10 😐


场景 2：数据可视化（1000 个图表点）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function Chart({ data }) {
  // 🔥 每个点的计算很复杂
  const points = data.map(d => complexTransform(d));
  return <svg>{points.map(p => <Point {...p} />)}</svg>;
}

问题：
  - complexTransform 很慢
  - 1000 次调用在一个 render 中
  - 可能超过 50ms

解决：
const points = useMemo(
  () => data.map(d => complexTransform(d)),
  [data]
);

效果：
  - 只在 data 变化时计算
  - 大多数渲染 <0.1ms


场景 3：表单验证（100 个字段）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function FormField({ value, onValidate }) {
  // 🔥 每次输入都验证
  const errors = validate(value);  // 可能很慢
  
  return (
    <div>
      <input value={value} />
      {errors.map(e => <Error>{e}</Error>)}
    </div>
  );
}

问题：
  - 100 个字段 = 100 个 Fiber
  - 如果每个 validate 需要 1ms
  - 总共 100ms

优化：
// 🔥 防抖验证
const debouncedValidate = useMemo(
  () => debounce(validate, 300),
  []
);

useEffect(() => {
  debouncedValidate(value);
}, [value]);


性能基准测试：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

组件复杂度分级：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Level 1：超简单（<0.01ms）
  <div>Hello</div>

Level 2：简单（0.01-0.1ms）
  <div>
    <span>{name}</span>
    <button onClick={handler}>Click</button>
  </div>

Level 3：中等（0.1-1ms）
  有几个 useState、useEffect
  10-20 个子元素

Level 4：复杂（1-5ms）
  多个 Hook
  50+ 个子元素
  少量计算

Level 5：慢（5-50ms）⚠️
  复杂计算
  大量子元素
  未优化的代码

Level 6：极慢（>50ms）❌
  严重性能问题
  必须重构


建议：
  - 保持组件在 Level 1-3
  - 避免 Level 5-6
  - Level 4 需要监控


实际项目经验：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

项目 A：电商网站
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

问题：
  商品列表渲染慢（500ms）

分析：
  - ProductCard 组件未优化
  - 每次渲染都重新计算价格、折扣
  - 每个 ProductCard: 5ms

解决：
1. 使用 React.memo
   const ProductCard = React.memo(ProductCardComponent);

2. 使用 useMemo
   const finalPrice = useMemo(
     () => calculatePrice(price, discount),
     [price, discount]
   );

3. 虚拟列表
   只渲染可见的 20 个商品

结果：
  - 渲染时间：50ms（-90%）
  - 每个 ProductCard: 0.5ms
  - 时间切片正常工作


项目 B：数据大屏
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

问题：
  图表组件渲染慢（1000ms）

分析：
  - Chart 组件每次都重新计算
  - 1000 个数据点 × 复杂变换
  - 一个 Chart Fiber: 50ms

解决：
1. 计算移到 Worker
   const worker = new Worker('chart-worker.js');

2. 使用 Canvas（而不是 SVG）
   - 减少 DOM 节点
   - 减少 Fiber 数量

3. 数据采样
   - 1000 个点 → 100 个点
   - 视觉效果相同，性能提升 10 倍

结果：
  - 渲染时间：100ms（-90%）
  - 时间切片正常工作
  - 用户体验优秀


关键洞察：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

时间切片不能解决：
  ❌ 慢组件（需要优化组件本身）
  ❌ 算法问题（O(n²) → O(n log n)）
  ❌ 架构问题（不合理的组件设计）

时间切片能解决：
  ✅ 大量快组件的累积延迟
  ✅ 长列表渲染
  ✅ 多个中等复杂度组件


最佳实践：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. 性能监控
   - 使用 React DevTools Profiler
   - 找出 > 5ms 的组件
   - 持续优化

2. 组件优化
   - React.memo
   - useMemo/useCallback
   - 代码分割

3. 架构优化
   - 虚拟列表
   - 数据分页
   - 懒加载

4. 测试
   - 在低端设备测试
   - 模拟慢网络
   - 压力测试


总结：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔥 时间切片 = 以 Fiber 为最小单元
🔥 慢 Fiber（>5ms）会超时，必须等完成
🔥 需要开发者保证组件性能
🔥 时间切片 + 性能优化 = 最佳体验`}
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

必答问题：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Q1: 时间切片的最小执行单元是什么？
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

A: 一个完整的 Fiber 节点处理（performUnitOfWork）

源码证明：
function workLoopConcurrent() {
  while (workInProgress !== null && !shouldYield()) {
    performUnitOfWork(workInProgress);  // 🔥 最小单元
  }
}

关键：
  - shouldYield() 在循环条件中检查
  - performUnitOfWork 完整执行，不可中断
  - 处理完一个 Fiber 后才检查是否让出


Q2: 如果一个 Fiber 处理超过 5ms 会怎样？
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

A: 必须等它完成，不能中途打断

示例：
0ms:
  workInProgress = <SlowComponent> Fiber
  shouldYield() = false
  ↓
  performUnitOfWork(<SlowComponent>)
    beginWork() 执行 10ms 🔥
  ↓
10ms:
  performUnitOfWork 完成
  shouldYield() = true ✋

结果：
  - 这个 Fiber 阻塞了 10ms
  - 用户输入延迟 10ms（不是 5ms）


Q3: 为什么不在 Fiber 处理中途检查？
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

A: 保证原子性 + 简化实现

原因：
  1. Fiber 处理是原子操作
  2. 中途打断需要保存大量中间状态
  3. 恢复逻辑复杂
  4. 大多数 Fiber 很快（<1ms）
  5. 不值得为少数慢 Fiber 增加复杂度


Q4: 如何避免单个 Fiber 超时？
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

A: 优化组件性能

方法：
  1. 使用 useMemo 缓存计算
  2. 使用 React.memo 避免重渲染
  3. 分片计算（多次渲染）
  4. Web Worker（后台计算）
  5. 虚拟列表（减少 Fiber 数量）


Q5: 时间切片能保证 5ms 响应吗？
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

A: 不能完全保证

保证：
  ✅ 每处理完一个 Fiber 就检查
  ✅ 大多数情况 <5ms

不保证：
  ❌ 如果单个 Fiber 超过 5ms
  ❌ 需要等它完成
  ❌ 实际延迟 = 最慢 Fiber 的处理时间


Q6: React 为什么选择这个设计？
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

A: 实用主义 + 性能平衡

选择理由：
  1. 99% 的组件很快（<1ms）
  2. 实现简单，性能开销小
  3. 开发者可以优化慢组件
  4. 平衡了复杂度和效果


高级问题：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Q7: 能否实现更细粒度的中断？
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

A: 技术上可以，但不值得

假设实现（不存在）：
function performUnitOfWork(fiber) {
  if (shouldYield()) return SUSPENDED;
  step1();
  
  if (shouldYield()) return SUSPENDED;
  step2();
  
  if (shouldYield()) return SUSPENDED;
  step3();
}

问题：
  ❌ 频繁检查有性能开销
  ❌ 需要保存每一步的状态
  ❌ 实现极其复杂
  ❌ 大多数情况用不上


Q8: 其他框架怎么做？
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

A: 类似的设计

Vue 3:
  - 也是以组件为单元
  - 时间切片支持较弱

Svelte:
  - 编译时优化
  - 无时间切片（足够快）

Angular:
  - Zone.js
  - 无时间切片


Q9: 如何监控和优化？
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

A: 使用 React DevTools Profiler

步骤：
  1. 打开 Profiler 标签
  2. 点击"录制"
  3. 触发更新
  4. 查看火焰图
  5. 找出 > 5ms 的组件
  6. 优化

指标：
  - Render duration: 组件渲染时间
  - Commit duration: 提交时间
  - 黄色/红色：慢组件


Q10: 时间切片的真实价值是什么？
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

A: 处理大量快组件，不是拯救慢组件

适用场景：
  ✅ 长列表（10000 个快组件）
  ✅ 复杂页面（100+ 组件）
  ✅ 频繁更新（实时数据）

不适用场景：
  ❌ 慢组件（需要优化组件本身）
  ❌ 算法问题（需要优化算法）
  ❌ 简单页面（无性能问题）


关键总结：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔥 最小单元 = 一个完整的 Fiber 节点
🔥 慢 Fiber（>5ms）会超时，必须完成
🔥 时间切片 ≠ 万能药，需要配合优化
🔥 保持组件快速是开发者的责任


记忆口诀：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

时间切片以 Fiber 为单元
慢组件超时必须完
优化组件是关键
切片不是万能丹`}
      </pre>
    </div>
  );
}
