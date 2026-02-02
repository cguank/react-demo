import React, { useState } from 'react';

/**
 * React Fiber 复用机制深度解析
 * 
 * 核心问题：
 * 1. 复用是 clone 吗？
 * 2. 为什么不直接操作原来的 Fiber？
 * 3. Double Buffering（双缓冲）机制
 */

export default function FiberReuseAnalysis() {
  const [count, setCount] = useState(0);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>⚛️ React Fiber 复用机制深度解析</h1>
      
      {/* 第一部分：核心问题 */}
      <div style={{ background: '#e3f2fd', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>🎯 核心问题</h2>
        
        <div style={{ background: '#fff', padding: '15px', borderRadius: '5px', marginBottom: '15px' }}>
          <h3>问题 1：复用是 clone 吗？</h3>
          <div style={{ background: '#c8e6c9', padding: '15px', borderRadius: '5px' }}>
            <h4>✅ 答案：不是简单的 clone，而是基于 alternate 指针的复用</h4>
            <p>React 使用 <strong>Double Buffering（双缓冲）</strong> 机制：</p>
            <ul>
              <li>维护两棵 Fiber 树：<code>current</code> 树和 <code>workInProgress</code> 树</li>
              <li>通过 <code>alternate</code> 指针相互引用</li>
              <li>复用时直接使用 alternate 指向的 Fiber，而不是 clone</li>
              <li>如果 alternate 不存在，才创建新的 Fiber</li>
            </ul>
          </div>
        </div>

        <div style={{ background: '#fff', padding: '15px', borderRadius: '5px' }}>
          <h3>问题 2：为什么不直接操作原来的 Fiber？</h3>
          <div style={{ background: '#fff9c4', padding: '15px', borderRadius: '5px' }}>
            <h4>原因：保证渲染的稳定性和可中断性</h4>
            <ol>
              <li><strong>Concurrent Mode 需要：</strong>渲染可以被中断，需要保留原始状态用于回滚</li>
              <li><strong>错误恢复：</strong>如果更新失败，可以回退到之前的状态</li>
              <li><strong>批量更新：</strong>可以计算完所有更新后再一次性提交</li>
              <li><strong>时间切片：</strong>允许 React 暂停工作，让浏览器处理高优先级任务</li>
              <li><strong>比较优化：</strong>保留旧树用于 Diff 比较</li>
            </ol>
          </div>
        </div>
      </div>

      {/* 第二部分：Double Buffering 机制 */}
      <div style={{ background: '#f3e5f5', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>🔄 Double Buffering（双缓冲）机制</h2>
        
        <div style={{ background: '#fff', padding: '15px', borderRadius: '5px', marginBottom: '15px' }}>
          <h3>概念解释</h3>
          <pre style={{ background: '#f5f5f5', padding: '15px', overflow: 'auto', fontSize: '14px' }}>
{`双缓冲技术：类似于显卡渲染

游戏开发中的双缓冲：
┌────────────────┐        ┌────────────────┐
│  前台缓冲区     │  显示   │  后台缓冲区     │  计算
│  (显示到屏幕)   │  ←───  │  (正在绘制)     │  中
└────────────────┘        └────────────────┘
                            ↓ 绘制完成
                          交换缓冲区
                            ↓
┌────────────────┐        ┌────────────────┐
│  后台缓冲区     │  计算   │  前台缓冲区     │  显示
│  (正在绘制)     │  中    │  (显示到屏幕)   │  ←───
└────────────────┘        └────────────────┘

React 的双缓冲：
┌────────────────┐        ┌────────────────┐
│  current 树     │  显示   │  workInProgress │  计算
│  (已渲染)       │  ←───  │  (正在构建)     │  中
│  (用户可见)     │        │  (内存中)       │
└────────────────┘        └────────────────┘
       ↕ alternate              ↕ alternate
┌────────────────┐        ┌────────────────┐
│  Root           │  互相   │  Root          │
│  ├─ App         │  引用   │  ├─ App        │
│  └─ ...         │  ←───→ │  └─ ...        │
└────────────────┘        └────────────────┘
                            ↓ Commit 完成
                          交换树的指针
                            ↓
          root.current = workInProgress

好处：
1. 用户始终看到完整的 UI（current 树）
2. 更新在 workInProgress 树中进行，不影响显示
3. 更新完成后，瞬间切换指针（原子操作）
4. 如果更新被中断，current 树保持不变`}
          </pre>
        </div>

        <div style={{ background: '#fff', padding: '15px', borderRadius: '5px' }}>
          <h3>Fiber 节点的 alternate 指针</h3>
          <pre style={{ background: '#f5f5f5', padding: '10px', overflow: 'auto', fontSize: '13px' }}>
{`Fiber 节点结构（简化）：

type Fiber = {
  // 标识信息
  tag: WorkTag,           // 节点类型
  key: null | string,     // React key
  type: any,              // 组件类型或 DOM 标签
  
  // 实例
  stateNode: any,         // DOM 节点或组件实例
  
  // Fiber 树结构
  return: Fiber | null,   // 父节点
  child: Fiber | null,    // 第一个子节点
  sibling: Fiber | null,  // 下一个兄弟节点
  
  // 双缓冲关键！
  alternate: Fiber | null,  // 指向另一棵树中的对应节点
  
  // Props 和 State
  pendingProps: any,      // 新的 props
  memoizedProps: any,     // 上次渲染用的 props
  memoizedState: any,     // 上次渲染的 state
  
  // 副作用
  flags: Flags,           // 副作用标记（Placement, Update, Deletion 等）
  
  // 优先级
  lanes: Lanes,           // 当前节点的优先级
  childLanes: Lanes,      // 子树的优先级
  
  // ...
};

alternate 的作用：
┌─────────────────────────────────────────────────┐
│  current Fiber           workInProgress Fiber   │
│                                                  │
│  ┌─────────────┐         ┌─────────────┐       │
│  │  App Fiber  │◄───────►│  App Fiber  │       │
│  │             │alternate│             │       │
│  │ tag: 1      │         │ tag: 1      │       │
│  │ stateNode:  │  共享   │ stateNode:  │       │
│  │   <div>     │  ────►  │   <div>     │       │
│  │             │         │             │       │
│  └─────────────┘         └─────────────┘       │
│         │                       │               │
│         │ child                 │ child         │
│         ↓                       ↓               │
│  ┌─────────────┐         ┌─────────────┐       │
│  │ Child Fiber │◄───────►│ Child Fiber │       │
│  └─────────────┘alternate└─────────────┘       │
└─────────────────────────────────────────────────┘

关键点：
1. 两棵树通过 alternate 相互引用
2. stateNode（DOM 节点）是共享的
3. 更新时在 workInProgress 树上工作
4. Commit 时切换 root.current 指针`}
          </pre>
        </div>
      </div>

      {/* 第三部分：源码解析 */}
      <div style={{ background: '#fff3e0', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>📂 源码解析：createWorkInProgress</h2>
        
        <div style={{ background: '#fff', padding: '15px', borderRadius: '5px', marginBottom: '15px' }}>
          <h3>核心函数：createWorkInProgress</h3>
          <pre style={{ background: '#f5f5f5', padding: '10px', overflow: 'auto', fontSize: '13px' }}>
{`// ReactFiber.old.js (249 行)

// 这个函数用于创建 workInProgress Fiber
export function createWorkInProgress(
  current: Fiber,      // 当前的 Fiber 节点（current 树）
  pendingProps: any,   // 新的 props
): Fiber {
  // 关键：先尝试获取 alternate
  let workInProgress = current.alternate;
  
  // 情况 1：alternate 不存在（首次创建）
  if (workInProgress === null) {
    // 注释说明：使用双缓冲池化技术
    // 我们知道最多只需要两个版本的树
    // 池化"另一个"未使用的节点，可以自由复用
    // 这是延迟创建的，避免为从未更新的内容分配额外对象
    // 也允许在需要时回收额外的内存
    
    // 创建新的 Fiber（不是 clone！）
    workInProgress = createFiber(
      current.tag,
      pendingProps,
      current.key,
      current.mode,
    );
    
    // 复制基本属性
    workInProgress.elementType = current.elementType;
    workInProgress.type = current.type;
    workInProgress.stateNode = current.stateNode;  // 共享 DOM 节点！
    
    // 建立双向链接
    workInProgress.alternate = current;
    current.alternate = workInProgress;
    
  // 情况 2：alternate 已存在（复用）
  } else {
    // 更新 props
    workInProgress.pendingProps = pendingProps;
    workInProgress.type = current.type;
    
    // 重置副作用标记（因为要重新计算）
    workInProgress.flags = NoFlags;
    workInProgress.subtreeFlags = NoFlags;
    workInProgress.deletions = null;
    
    // 重置计时器
    if (enableProfilerTimer) {
      workInProgress.actualDuration = 0;
      workInProgress.actualStartTime = -1;
    }
  }
  
  // 复制其他属性（lanes, ref, dependencies 等）
  // 注意：不是深拷贝，很多属性是共享引用的
  workInProgress.childLanes = current.childLanes;
  workInProgress.lanes = current.lanes;
  
  workInProgress.child = current.child;
  workInProgress.memoizedProps = current.memoizedProps;
  workInProgress.memoizedState = current.memoizedState;
  workInProgress.updateQueue = current.updateQueue;
  
  // ... 更多属性复制
  
  return workInProgress;
}

关键观察：
1. ❌ 不是 Object.assign 或 {...current}
2. ❌ 不是深拷贝 (deep clone)
3. ✅ 是基于 alternate 的复用
4. ✅ 首次创建新 Fiber，后续直接复用
5. ✅ stateNode (DOM 节点) 是共享的
6. ✅ 只重置必要的字段（flags, subtreeFlags）`}
          </pre>
        </div>

        <div style={{ background: '#fff', padding: '15px', borderRadius: '5px' }}>
          <h3>复用流程示意</h3>
          <pre style={{ background: '#f5f5f5', padding: '10px', overflow: 'auto', fontSize: '13px' }}>
{`第一次更新（没有 alternate）：

Initial Render:
  root.current → Fiber A (current 树)
  Fiber A.alternate = null

Update 触发:
  1. createWorkInProgress(Fiber A, newProps)
  2. workInProgress = Fiber A.alternate → null
  3. 因为是 null，创建新 Fiber B
  4. Fiber B.alternate = Fiber A
  5. Fiber A.alternate = Fiber B
  
  结果：
  Fiber A ←──────→ Fiber B
  (current)  alternate  (workInProgress)
  
Commit 完成:
  root.current = Fiber B  // 指针切换
  
  现在：
  Fiber B 变成 current 树
  Fiber A 变成 workInProgress 树（待复用）

─────────────────────────────────────────

第二次更新（有 alternate）：

Current State:
  root.current → Fiber B
  Fiber B.alternate → Fiber A

Update 触发:
  1. createWorkInProgress(Fiber B, newProps)
  2. workInProgress = Fiber B.alternate → Fiber A ✅
  3. 因为不是 null，直接复用 Fiber A
  4. 重置 Fiber A 的 flags、subtreeFlags
  5. 更新 Fiber A 的 pendingProps
  
  结果：
  Fiber B ←──────→ Fiber A
  (current)  alternate  (workInProgress 复用)
  
Commit 完成:
  root.current = Fiber A  // 指针切换回来
  
  现在：
  Fiber A 变成 current 树
  Fiber B 变成 workInProgress 树（待复用）

─────────────────────────────────────────

结论：
- 每次更新，current 和 workInProgress 角色互换
- 始终只有两棵树，来回切换
- 不需要频繁创建/销毁 Fiber 节点
- 内存友好，性能优化`}
          </pre>
        </div>
      </div>

      {/* 第四部分：为什么不直接操作原 Fiber */}
      <div style={{ background: '#e8f5e9', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>🤔 为什么不直接操作原来的 Fiber？</h2>
        
        <div style={{ background: '#fff', padding: '15px', borderRadius: '5px', marginBottom: '15px' }}>
          <h3>原因 1：Concurrent Mode 的可中断渲染</h3>
          <pre style={{ background: '#f5f5f5', padding: '10px', fontSize: '13px' }}>
{`假设直接修改 current 树：

Time: 0ms
  用户看到：页面 A
  current 树：App → List (10 items)

Time: 5ms - 开始更新
  修改 current 树的第 1 个 item
  用户看到：部分更新的页面（混乱）❌

Time: 10ms - 高优先级任务插入（用户输入）
  更新被中断
  current 树：半成品状态
  用户看到：不完整的 UI ❌

Time: 15ms - 恢复更新
  继续修改 current 树
  但之前的状态已经被破坏了 ❌

问题：
- 用户会看到中间状态
- 无法回滚到初始状态
- 无法安全地中断和恢复

─────────────────────────────────────────

使用 workInProgress 树（正确做法）：

Time: 0ms
  用户看到：页面 A
  current 树：App → List (10 items) ← 保持不变
  workInProgress 树：开始构建

Time: 5ms - 构建 workInProgress
  修改 workInProgress 树
  用户看到：页面 A（current 树，稳定）✅

Time: 10ms - 高优先级任务插入
  更新被中断
  丢弃 workInProgress 树
  用户看到：页面 A（current 树，稳定）✅

Time: 15ms - 重新开始更新
  重新构建 workInProgress 树
  基于 current 树（完整的初始状态）✅

Time: 25ms - 更新完成
  Commit：root.current = workInProgress
  用户看到：页面 B（瞬间切换，完整的新状态）✅

好处：
- 用户始终看到完整的 UI
- 可以安全地中断和恢复
- 可以丢弃未完成的工作
- 可以回退到之前的状态`}
          </pre>
        </div>

        <div style={{ background: '#fff', padding: '15px', borderRadius: '5px', marginBottom: '15px' }}>
          <h3>原因 2：错误边界和错误恢复</h3>
          <pre style={{ background: '#f5f5f5', padding: '10px', fontSize: '13px' }}>
{`如果直接修改 current 树：

构建过程中出错：
  1. 修改了 Fiber 节点 A
  2. 修改了 Fiber 节点 B
  3. 节点 C 抛出错误 ❌
  4. 想要回滚？来不及了，A 和 B 已经改了 ❌
  5. 用户看到半成品 UI ❌

使用 workInProgress 树：

构建过程中出错：
  1. 在 workInProgress 树上修改节点 A
  2. 在 workInProgress 树上修改节点 B
  3. 节点 C 抛出错误 ❌
  4. 捕获错误，丢弃整个 workInProgress 树 ✅
  5. current 树完全没动，用户看到的 UI 稳定 ✅
  6. 可以显示 Error Boundary 的 fallback UI ✅

示例：
class ErrorBoundary extends React.Component {
  componentDidCatch(error) {
    // 因为使用 workInProgress 树
    // 错误的更新不会影响 current 树
    // 可以安全地显示错误 UI
    this.setState({ hasError: true });
  }
  
  render() {
    if (this.state.hasError) {
      return <h1>出错了</h1>;  // 基于稳定的 current 树
    }
    return this.props.children;
  }
}`}
          </pre>
        </div>

        <div style={{ background: '#fff', padding: '15px', borderRadius: '5px', marginBottom: '15px' }}>
          <h3>原因 3：批量更新和优先级调度</h3>
          <pre style={{ background: '#f5f5f5', padding: '10px', fontSize: '13px' }}>
{`场景：多个 setState 同时触发

直接修改 current 树：
  setState #1 触发 → 修改 current 树 → 触发渲染
  setState #2 触发 → 修改 current 树 → 触发渲染  ❌ 多次渲染
  setState #3 触发 → 修改 current 树 → 触发渲染  ❌ 多次渲染

问题：
- 每次 setState 都要渲染，性能差
- 用户看到多次中间状态，闪烁

使用 workInProgress 树：
  setState #1 触发 → 标记更新
  setState #2 触发 → 标记更新
  setState #3 触发 → 标记更新
  ↓
  合并更新，统一处理
  ↓
  在 workInProgress 树上计算最终状态
  ↓
  Commit：root.current = workInProgress  ✅ 一次渲染

好处：
- 批量处理多个更新
- 只渲染一次，性能好
- 用户只看到最终状态

优先级调度：
  低优先级更新 → 在 workInProgress 树上开始构建
  高优先级更新 → 打断低优先级，丢弃 workInProgress
  高优先级更新 → 重新构建 workInProgress（基于 current）
  高优先级完成 → Commit
  低优先级更新 → 重新构建 workInProgress（基于新的 current）

如果直接修改 current：
  低优先级已经修改了一半 → 无法回滚 ❌`}
          </pre>
        </div>

        <div style={{ background: '#fff', padding: '15px', borderRadius: '5px' }}>
          <h3>原因 4：时间切片（Time Slicing）</h3>
          <pre style={{ background: '#f5f5f5', padding: '10px', fontSize: '13px' }}>
{`React 18 的 Concurrent Features：

不使用 workInProgress：
  开始更新 → 一次性完成（阻塞） → 用户操作卡顿 ❌

使用 workInProgress：
  Time: 0ms
    开始构建 workInProgress 树
    用户看到：current 树（可交互）✅
  
  Time: 5ms
    浏览器需要响应用户点击
    暂停 workInProgress 的构建
    current 树完全不受影响 ✅
  
  Time: 10ms
    处理完用户点击
    继续构建 workInProgress 树
  
  Time: 16ms
    浏览器需要绘制一帧
    暂停 workInProgress 的构建
    current 树保证 60fps ✅
  
  Time: 33ms
    继续构建 workInProgress 树
  
  Time: 50ms
    workInProgress 构建完成
    Commit：root.current = workInProgress
    用户看到更新 ✅

关键：
- workInProgress 的构建可以分片
- 每个分片之间，浏览器可以做其他事
- current 树始终稳定，保证流畅体验`}
          </pre>
        </div>
      </div>

      {/* 第五部分：实战对比 */}
      <div style={{ background: '#fce4ec', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>🎮 实战对比：单树 vs 双树</h2>
        
        <div style={{ background: '#fff', padding: '15px', borderRadius: '5px' }}>
          <h3>假设直接修改单树（错误做法）</h3>
          <pre style={{ background: '#ffebee', padding: '10px', fontSize: '13px' }}>
{`function updateFiber(fiber, newProps) {
  // ❌ 直接修改
  fiber.props = newProps;
  fiber.flags |= Update;
  
  // 问题 1：用户立即看到半成品
  // 问题 2：无法回滚
  // 问题 3：无法中断
  // 问题 4：出错时状态混乱
}`}
          </pre>

          <h3>React 的双树做法（正确）</h3>
          <pre style={{ background: '#e8f5e9', padding: '10px', fontSize: '13px' }}>
{`function updateFiber(current, newProps) {
  // ✅ 创建/复用 workInProgress
  const workInProgress = createWorkInProgress(current, newProps);
  
  // 在 workInProgress 树上工作
  workInProgress.flags |= Update;
  
  // current 树完全不动
  // 用户看到的是 current 树（稳定）
  
  // 等所有工作完成后
  // Commit：root.current = workInProgress
  
  // 优点：
  // ✅ 用户只看到完整的更新
  // ✅ 可以随时丢弃 workInProgress
  // ✅ 可以中断和恢复
  // ✅ 出错时 current 树不受影响
}`}
          </pre>
        </div>
      </div>

      {/* 第六部分：总结 */}
      <div style={{ background: '#e0f2f1', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>📝 总结</h2>
        
        <div style={{ background: '#fff', padding: '15px', borderRadius: '5px' }}>
          <h3>🎯 核心答案</h3>
          
          <h4>1. 复用是 clone 吗？</h4>
          <div style={{ background: '#e8f5e9', padding: '10px', marginBottom: '10px' }}>
            <p><strong>不是！</strong>是基于 <code>alternate</code> 指针的复用：</p>
            <ul>
              <li>首次：创建新 Fiber，建立双向 alternate 链接</li>
              <li>后续：直接复用 alternate 指向的 Fiber</li>
              <li>不是深拷贝，很多属性（如 stateNode）是共享的</li>
              <li>只重置必要的字段（flags、subtreeFlags）</li>
            </ul>
          </div>

          <h4>2. 为什么不直接操作原来的 Fiber？</h4>
          <div style={{ background: '#fff9c4', padding: '10px', marginBottom: '10px' }}>
            <p><strong>保证渲染稳定性和可中断性：</strong></p>
            <ul>
              <li><strong>可中断：</strong>Concurrent Mode 可以暂停和恢复，不影响当前显示</li>
              <li><strong>可回滚：</strong>出错时可以丢弃 workInProgress，回退到 current</li>
              <li><strong>批量更新：</strong>多个更新可以合并，只渲染一次</li>
              <li><strong>优先级调度：</strong>高优先级可以打断低优先级</li>
              <li><strong>时间切片：</strong>长任务可以分片执行，保证流畅</li>
            </ul>
          </div>

          <h4>3. Double Buffering 的好处</h4>
          <div style={{ background: '#e3f2fd', padding: '10px' }}>
            <ul>
              <li>✅ 用户始终看到完整的 UI（current 树）</li>
              <li>✅ 更新在后台进行（workInProgress 树）</li>
              <li>✅ 更新完成后瞬间切换（原子操作）</li>
              <li>✅ 内存友好（只有两棵树，来回切换）</li>
              <li>✅ 支持现代并发特性</li>
            </ul>
          </div>

          <div style={{ background: '#fff9c4', padding: '15px', marginTop: '15px', borderRadius: '5px' }}>
            <h4>💡 记忆口诀：</h4>
            <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#1976d2' }}>
              双树并行不冲突<br/>
              alternate 来复用<br/>
              current 展示稳如山<br/>
              workInProgress 后台算<br/>
              完成切换一瞬间<br/>
              可中断来可回滚
            </p>
          </div>

          <div style={{ background: '#ffebee', padding: '15px', marginTop: '15px', borderRadius: '5px' }}>
            <h4>⚠️  类比理解：</h4>
            <p style={{ fontSize: '14px' }}>
              就像视频剪辑软件的<strong>预览窗口</strong>和<strong>时间线</strong>：
            </p>
            <ul>
              <li><strong>预览窗口</strong> = current 树（用户看到的）</li>
              <li><strong>时间线编辑</strong> = workInProgress 树（正在修改）</li>
              <li><strong>实时预览</strong> = 渲染预览（不影响原视频）</li>
              <li><strong>导出视频</strong> = Commit（应用修改）</li>
            </ul>
            <p>编辑过程中可以随时撤销，用户看到的预览始终流畅！</p>
          </div>
        </div>
      </div>

      {/* 交互式演示 */}
      <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
        <h3>体验双缓冲机制</h3>
        <p style={{ fontSize: '24px', marginBottom: '20px' }}>Count: {count}</p>
        <button
          onClick={() => setCount(count + 1)}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            background: '#4caf50',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          增加计数
        </button>
        <p style={{ marginTop: '15px', color: '#666', fontSize: '14px' }}>
          每次点击，React 会：<br/>
          1. 基于 current Fiber 创建/复用 workInProgress Fiber<br/>
          2. 在 workInProgress 树上计算新状态<br/>
          3. Commit 时切换 root.current 指针<br/>
          4. 你看到的数字瞬间更新，没有中间状态
        </p>
      </div>
    </div>
  );
}
