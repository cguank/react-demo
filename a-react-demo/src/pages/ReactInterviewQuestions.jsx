import React, { useState } from 'react';

/**
 * React 高频面试题精选（结合源码）
 * 
 * 基于 React 18.2.0 源码分析
 */

export default function ReactInterviewQuestions() {
  const [expandedQuestion, setExpandedQuestion] = useState(null);

  const toggleQuestion = (id) => {
    setExpandedQuestion(expandedQuestion === id ? null : id);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', color: '#61dafb' }}>⚛️ React 高频面试题精选</h1>
      <p style={{ textAlign: 'center', color: '#666', marginBottom: '30px' }}>基于 React 18.2.0 源码分析</p>
      
      <QuestionSection
        title="一、Fiber 架构"
        questions={fiberQuestions}
        expandedQuestion={expandedQuestion}
        toggleQuestion={toggleQuestion}
      />
      
      <QuestionSection
        title="二、Hooks 原理"
        questions={hooksQuestions}
        expandedQuestion={expandedQuestion}
        toggleQuestion={toggleQuestion}
      />
      
      <QuestionSection
        title="三、Diff 算法"
        questions={diffQuestions}
        expandedQuestion={expandedQuestion}
        toggleQuestion={toggleQuestion}
      />
      
      <QuestionSection
        title="四、Render 和 Commit 阶段"
        questions={renderCommitQuestions}
        expandedQuestion={expandedQuestion}
        toggleQuestion={toggleQuestion}
      />
      
      <QuestionSection
        title="五、useEffect 和 useLayoutEffect"
        questions={effectsQuestions}
        expandedQuestion={expandedQuestion}
        toggleQuestion={toggleQuestion}
      />
      
      <QuestionSection
        title="六、调度机制"
        questions={schedulingQuestions}
        expandedQuestion={expandedQuestion}
        toggleQuestion={toggleQuestion}
      />
      
      <QuestionSection
        title="七、性能优化"
        questions={performanceQuestions}
        expandedQuestion={expandedQuestion}
        toggleQuestion={toggleQuestion}
      />
      
      <QuestionSection
        title="八、综合应用"
        questions={comprehensiveQuestions}
        expandedQuestion={expandedQuestion}
        toggleQuestion={toggleQuestion}
      />
    </div>
  );
}

function QuestionSection({ title, questions, expandedQuestion, toggleQuestion }) {
  return (
    <div style={{ marginBottom: '40px' }}>
      <h2 style={{ 
        color: '#333', 
        borderBottom: '3px solid #61dafb', 
        paddingBottom: '10px',
        marginBottom: '20px'
      }}>
        {title}
      </h2>
      {questions.map(q => (
        <QuestionItem
          key={q.id}
          question={q}
          isExpanded={expandedQuestion === q.id}
          onToggle={() => toggleQuestion(q.id)}
        />
      ))}
    </div>
  );
}

function QuestionItem({ question, isExpanded, onToggle }) {
  return (
    <div style={{ 
      marginBottom: '15px',
      border: '1px solid #ddd',
      borderRadius: '8px',
      overflow: 'hidden'
    }}>
      <div
        onClick={onToggle}
        style={{
          padding: '15px 20px',
          background: isExpanded ? '#e3f2fd' : '#f5f5f5',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          transition: 'background 0.3s'
        }}
      >
        <div style={{ fontWeight: 'bold', color: '#333', flex: 1 }}>
          {question.question}
        </div>
        <div style={{ 
          fontSize: '20px', 
          color: '#666',
          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)',
          transition: 'transform 0.3s'
        }}>
          ▼
        </div>
      </div>
      {isExpanded && (
        <div style={{ padding: '20px', background: '#fff' }}>
          {question.answer}
        </div>
      )}
    </div>
  );
}

// ============================================
// 一、Fiber 架构相关面试题
// ============================================

const fiberQuestions = [
  {
    id: 'fiber-1',
    question: '1. 什么是 Fiber？为什么 React 要引入 Fiber 架构？',
    answer: (
      <div>
        <h4>💡 答案：</h4>
        <pre style={{ background: '#f5f5f5', padding: '15px', borderRadius: '5px', overflow: 'auto', fontSize: '13px', lineHeight: '1.6' }}>
{`Fiber 是什么？
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Fiber 是 React 16 引入的一种新的协调引擎架构。
从技术上说，Fiber 是一个 JavaScript 对象，代表了一个工作单元。

// ReactFiber.js
type Fiber = {
  // 类型信息
  tag: WorkTag,                    // 节点类型（FunctionComponent、ClassComponent 等）
  type: any,                       // 对应的组件类型（函数、类等）
  
  // 结构信息（构成 Fiber 树）
  return: Fiber | null,            // 父节点
  child: Fiber | null,             // 第一个子节点
  sibling: Fiber | null,           // 下一个兄弟节点
  
  // 数据信息
  pendingProps: any,               // 新的 props
  memoizedProps: any,              // 上一次渲染的 props
  memoizedState: any,              // 上一次渲染的 state
  
  // 副作用信息
  flags: Flags,                    // 副作用标记（Placement、Update、Deletion 等）
  subtreeFlags: Flags,             // 子树的副作用标记
  
  // 双缓存
  alternate: Fiber | null,         // 指向另一棵树的对应节点
  
  // DOM 引用
  stateNode: any,                  // 真实 DOM 节点或组件实例
  
  // 其他
  updateQueue: UpdateQueue | null, // 更新队列
  lanes: Lanes,                    // 优先级相关
  // ...
};


为什么引入 Fiber 架构？
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

React 15 及之前的问题：
❌ 同步递归遍历，无法中断
❌ 一旦开始更新，必须一次性完成
❌ 如果组件树很大，会长时间占用主线程
❌ 导致页面卡顿，动画掉帧，用户输入无响应

Fiber 架构的优势：
✅ 可中断的渲染
   - 将渲染工作分解为小的工作单元
   - 每个工作单元完成后检查是否需要让出控制权
   
✅ 优先级调度
   - 不同类型的更新有不同优先级
   - 高优先级任务可以打断低优先级任务
   
✅ 增量渲染
   - 可以暂停工作，稍后继续
   - 避免长时间阻塞主线程
   
✅ 并发模式支持
   - 可以同时准备多个版本的 UI
   - 为 Concurrent Mode 奠定基础


核心机制：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. 双缓存机制（Double Buffering）
   - current 树：当前屏幕显示的内容
   - workInProgress 树：正在构建的新树
   - 通过 alternate 属性相互引用
   
2. 链表结构
   - 使用 child、sibling、return 指针
   - 可以暂停后从任意节点恢复
   
3. 时间切片（Time Slicing）
   - 将工作分成小块
   - 每 5ms 检查一次是否需要让出
   
4. 调度器（Scheduler）
   - 管理任务优先级
   - 决定何时执行任务

面试回答要点：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Fiber 是什么：React 的工作单元，一个 JavaScript 对象
2. 为什么引入：解决 React 15 的同步阻塞问题
3. 核心特性：可中断、优先级调度、增量渲染
4. 实现方式：链表结构、双缓存、时间切片
5. 最终目标：提升用户体验，避免卡顿`}
        </pre>
      </div>
    )
  },
  {
    id: 'fiber-2',
    question: '2. Fiber 树的遍历过程是怎样的？（beginWork 和 completeWork）',
    answer: (
      <div>
        <h4>💡 答案：</h4>
        <pre style={{ background: '#f5f5f5', padding: '15px', borderRadius: '5px', overflow: 'auto', fontSize: '13px', lineHeight: '1.6' }}>
{`Fiber 树的遍历过程：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

采用深度优先遍历（DFS），分为两个阶段：
1. beginWork：向下遍历（递阶段）
2. completeWork：向上遍历（归阶段）

示例组件树：
      App
     /   \\
  Header  Content
   /        \\
 Logo      List
           /  \\
        Item1  Item2


完整遍历顺序：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. App (beginWork) ──────────┐ 向下
2. Header (beginWork) ───────┤
3. Logo (beginWork) ─────────┘
4. Logo (completeWork) ──────┐ 向上
5. Header (completeWork) ────┘
6. Content (beginWork) ──────┐ 向下（兄弟节点）
7. List (beginWork) ─────────┤
8. Item1 (beginWork) ────────┘
9. Item1 (completeWork) ─────┐ 向上
10. Item2 (beginWork) ───────┤ 向下（兄弟节点）
11. Item2 (completeWork) ────┤ 向上
12. List (completeWork) ─────┤
13. Content (completeWork) ──┤
14. App (completeWork) ──────┘


源码实现：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ReactFiberWorkLoop.old.js

function performUnitOfWork(unitOfWork: Fiber): void {
  const current = unitOfWork.alternate;
  
  // 🔥 步骤 1：beginWork（向下遍历）
  let next = beginWork(current, unitOfWork, subtreeRenderLanes);
  
  unitOfWork.memoizedProps = unitOfWork.pendingProps;
  
  if (next === null) {
    // 🔥 步骤 2：没有子节点，开始 completeWork（向上遍历）
    completeUnitOfWork(unitOfWork);
  } else {
    // 有子节点，继续向下
    workInProgress = next;
  }
}

function completeUnitOfWork(unitOfWork: Fiber): void {
  let completedWork = unitOfWork;
  
  do {
    const current = completedWork.alternate;
    const returnFiber = completedWork.return;
    
    // 🔥 调用 completeWork
    let next = completeWork(current, completedWork, subtreeRenderLanes);
    
    if (next !== null) {
      workInProgress = next;
      return;
    }
    
    // 🔥 检查兄弟节点
    const siblingFiber = completedWork.sibling;
    if (siblingFiber !== null) {
      workInProgress = siblingFiber;  // 处理兄弟节点
      return;
    }
    
    // 🔥 回到父节点
    completedWork = returnFiber;
    workInProgress = completedWork;
  } while (completedWork !== null);
}


beginWork 的主要工作：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. 执行组件函数（FunctionComponent）或 render 方法（ClassComponent）
2. 调用 Hooks（useState、useEffect 等）
3. 获取子元素（JSX）
4. 进行 Diff 算法，比较新旧子节点
5. 创建或复用子 Fiber 节点
6. 标记副作用（flags）
7. 返回第一个子 Fiber（继续向下）


completeWork 的主要工作：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. 对于 HostComponent（原生 DOM 元素）：
   - 创建 DOM 节点（document.createElement）
   - 或复用已有 DOM 节点
   - 设置属性（但不插入到 DOM 树）
   
2. 收集子节点的副作用标记
   - 将子节点的 flags 冒泡到父节点
   - subtreeFlags |= child.flags | child.subtreeFlags
   
3. 返回 null（表示当前节点完成）


遍历规则总结：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. 从根节点开始，执行 beginWork
2. 如果有子节点，继续对子节点执行 beginWork（向下）
3. 如果没有子节点，执行 completeWork（向上）
4. completeWork 后，检查是否有兄弟节点：
   - 有：对兄弟节点执行 beginWork（横向）
   - 无：返回父节点，继续 completeWork（向上）
5. 重复 2-4，直到回到根节点

面试要点：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. 遍历方式：深度优先遍历（DFS）
2. 两个阶段：beginWork（向下）、completeWork（向上）
3. 遍历顺序：先子节点，再兄弟节点，最后父节点
4. 数据结构：通过 child、sibling、return 指针连接
5. 工作内容：beginWork 创建 Fiber，completeWork 创建 DOM`}
        </pre>
      </div>
    )
  },
  {
    id: 'fiber-3',
    question: '3. 什么是双缓存机制？current 树和 workInProgress 树的关系？',
    answer: (
      <div>
        <h4>💡 答案：</h4>
        <pre style={{ background: '#f5f5f5', padding: '15px', borderRadius: '5px', overflow: 'auto', fontSize: '13px', lineHeight: '1.6' }}>
{`双缓存机制（Double Buffering）：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

React 维护两棵 Fiber 树：
1. current 树：当前屏幕显示的内容对应的 Fiber 树
2. workInProgress 树：正在构建的新 Fiber 树

两棵树通过 alternate 属性相互引用：
  currentFiber.alternate = workInProgressFiber
  workInProgressFiber.alternate = currentFiber


为什么需要双缓存？
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. 避免直接修改当前树
   - 保证当前显示内容的稳定性
   - 构建过程中出错可以回滚
   
2. 支持可中断渲染
   - 新树构建过程中可以暂停
   - 不影响当前显示的内容
   
3. 提高性能
   - 复用已有的 Fiber 节点
   - 减少创建和销毁对象的开销
   
4. 支持并发模式
   - 可以同时准备多个版本的 UI


工作流程：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

初始挂载（Mount）：
  1. 创建 FiberRoot 和 HostRootFiber
  2. HostRootFiber 成为 current 树的根
  3. 开始构建 workInProgress 树
  4. 完成后切换：root.current = workInProgress
  
更新（Update）：
  1. 从 current 树克隆创建 workInProgress 树
  2. 在 workInProgress 树上进行 Diff 和更新
  3. 标记需要变更的节点（flags）
  4. Commit 阶段应用变更
  5. 切换：root.current = workInProgress
  6. 旧的 current 树变成新的备用树


源码体现：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ReactFiber.js - 创建 workInProgress Fiber

function createWorkInProgress(current: Fiber, pendingProps: any): Fiber {
  let workInProgress = current.alternate;
  
  if (workInProgress === null) {
    // 🔥 首次渲染，创建新的 Fiber
    workInProgress = createFiber(
      current.tag,
      pendingProps,
      current.key,
      current.mode,
    );
    workInProgress.elementType = current.elementType;
    workInProgress.type = current.type;
    workInProgress.stateNode = current.stateNode;
    
    // 🔥 建立双向引用
    workInProgress.alternate = current;
    current.alternate = workInProgress;
  } else {
    // 🔥 复用已有的 alternate Fiber
    workInProgress.pendingProps = pendingProps;
    workInProgress.type = current.type;
    
    // 重置副作用标记
    workInProgress.flags = NoFlags;
    workInProgress.subtreeFlags = NoFlags;
    workInProgress.deletions = null;
  }
  
  // 复用属性
  workInProgress.child = current.child;
  workInProgress.memoizedProps = current.memoizedProps;
  workInProgress.memoizedState = current.memoizedState;
  workInProgress.updateQueue = current.updateQueue;
  // ...
  
  return workInProgress;
}


// ReactFiberWorkLoop.old.js - 切换 current 树

function commitRootImpl(...) {
  // ... Mutation 阶段：修改 DOM
  
  // 🔥 切换 current 树
  root.current = finishedWork;  // finishedWork 就是 workInProgress 树
  
  // ... Layout 阶段：执行副作用
}


图示：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

更新前：
  FiberRoot
     |
     | current
     ↓
  current 树 (显示中)  ←──alternate──→  workInProgress 树 (旧的备用)
     App                                     App
    /   \\                                    /   \\
  A      B                                  A      B

更新中（Render 阶段）：
  FiberRoot
     |
     | current（仍指向旧树）
     ↓
  current 树 (显示中)  ←──alternate──→  workInProgress 树 (构建中)
     App                                     App
    /   \\                                    /   \\
  A      B                                  A      C  ← 正在构建

更新后（Commit 阶段）：
  FiberRoot
     |
     | current（切换到新树）
     ↓
  workInProgress 树 (现在显示)  ←──alternate──→  current 树 (现在是备用)
     App                                           App
    /   \\                                          /   \\
  A      C                                        A      B


优点总结：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. ✅ 内存复用
   两棵树反复切换，减少创建销毁开销
   
2. ✅ 快速切换
   只需要修改指针，O(1) 时间复杂度
   
3. ✅ 安全回滚
   构建失败可以丢弃新树，保留旧树
   
4. ✅ 平滑过渡
   新树构建完成后一次性切换，避免中间状态

面试要点：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. 两棵树：current（显示中）、workInProgress（构建中）
2. 相互引用：通过 alternate 属性
3. 工作方式：在 workInProgress 树上做变更
4. 切换时机：Commit 阶段切换 root.current
5. 优势：内存复用、快速切换、安全回滚`}
        </pre>
      </div>
    )
  }
];

// ============================================
// 二、Hooks 原理相关面试题
// ============================================

const hooksQuestions = [
  {
    id: 'hooks-1',
    question: '1. React Hooks 为什么不能在条件语句中使用？',
    answer: (
      <div>
        <h4>💡 答案：</h4>
        <pre style={{ background: '#f5f5f5', padding: '15px', borderRadius: '5px', overflow: 'auto', fontSize: '13px', lineHeight: '1.6' }}>
{`核心原因：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Hooks 依赖固定的调用顺序来维护状态。
React 通过单向链表来存储 Hooks，每个 Hook 通过 next 指针连接。
如果 Hooks 的调用顺序改变，会导致状态错乱。


Hooks 的数据结构：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ReactFiberHooks.old.js

type Hook = {
  memoizedState: any,      // 当前状态值
  baseState: any,          // 基础状态
  baseQueue: Update<any, any> | null,  // 基础更新队列
  queue: UpdateQueue<any, any> | null, // 更新队列
  next: Hook | null,       // 🔥 指向下一个 Hook（链表结构）
};

// Fiber 节点的 memoizedState 指向第一个 Hook
fiber.memoizedState → Hook1 → Hook2 → Hook3 → null


错误示例：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function Component({ condition }) {
  const [name, setName] = useState('Alice');  // Hook1
  
  // ❌ 错误：条件语句中的 Hook
  if (condition) {
    const [age, setAge] = useState(20);  // Hook2（可能不执行）
  }
  
  const [email, setEmail] = useState('alice@example.com');  // Hook2 或 Hook3
  
  // ...
}

问题分析：
  首次渲染（condition = true）：
    Hook 链表：Hook1(name) → Hook2(age) → Hook3(email) → null
  
  第二次渲染（condition = false）：
    Hook 链表：Hook1(name) → Hook2(email) → null
    
  React 的期望：
    Hook2 应该是 age
  
  实际情况：
    Hook2 变成了 email
  
  结果：
    状态错乱！email 的值被赋给了 age 的位置


源码检测机制：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ReactFiberHooks.old.js

function updateWorkInProgressHook(): Hook {
  let nextCurrentHook: null | Hook;
  
  if (currentHook === null) {
    // 第一个 Hook
    const current = currentFiber.alternate;
    if (current !== null) {
      nextCurrentHook = current.memoizedState;
    } else {
      nextCurrentHook = null;
    }
  } else {
    // 后续的 Hook
    nextCurrentHook = currentHook.next;
  }
  
  // 🔥🔥 检测：渲染的 Hook 数量比上次多
  if (nextCurrentHook === null) {
    throw new Error('Rendered more hooks than during the previous render.');
  }
  
  currentHook = nextCurrentHook;
  
  // 创建新的 workInProgressHook
  // ...
  
  return workInProgressHook;
}

function renderWithHooks(...) {
  // 渲染组件
  let children = Component(props, secondArg);
  
  // 🔥🔥 检测：渲染的 Hook 数量比上次少
  const didRenderTooFewHooks =
    currentHook !== null && currentHook.next !== null;
  
  if (didRenderTooFewHooks) {
    throw new Error(
      'Rendered fewer hooks than expected. ' +
      'This may be caused by an accidental early return statement.',
    );
  }
  
  // ...
}


正确用法：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function Component({ condition }) {
  // ✅ 正确：所有 Hooks 都在顶层
  const [name, setName] = useState('Alice');
  const [age, setAge] = useState(20);
  const [email, setEmail] = useState('alice@example.com');
  
  // ✅ 可以在条件语句中使用 Hook 的值
  if (condition) {
    // 使用 age 的值
  }
  
  // ✅ 可以在 Hook 回调中使用条件语句
  useEffect(() => {
    if (condition) {
      // ...
    }
  }, [condition]);
  
  // ...
}


如果必须条件性地使用状态：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// 方案 1：使用 null 或 undefined
const [conditionalState, setConditionalState] = useState(
  condition ? initialValue : null
);

// 方案 2：将条件逻辑移到组件外
function Parent() {
  const condition = useCondition();
  
  if (condition) {
    return <ComponentA />;
  }
  return <ComponentB />;
}


面试回答要点：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. 原因：Hooks 使用链表存储，依赖固定的调用顺序
2. 后果：顺序改变会导致状态错乱
3. 检测：React 会检测 Hook 数量变化并报错
4. 规则：必须在顶层调用 Hooks，不能在条件、循环、嵌套函数中
5. 替代：使用条件语句控制 Hook 的值，而不是控制 Hook 的调用`}
        </pre>
      </div>
    )
  },
  {
    id: 'hooks-2',
    question: '2. useState 的闭包陷阱是什么？如何避免？',
    answer: (
      <div>
        <h4>💡 答案：</h4>
        <pre style={{ background: '#f5f5f5', padding: '15px', borderRadius: '5px', overflow: 'auto', fontSize: '13px', lineHeight: '1.6' }}>
{`闭包陷阱示例：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function Counter() {
  const [count, setCount] = useState(0);
  
  const handleClick = () => {
    setTimeout(() => {
      // ❌ 闭包陷阱：这里的 count 永远是 0
      setCount(count + 1);
    }, 3000);
  };
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={handleClick}>+1</button>
    </div>
  );
}

问题：
  1. 快速点击 3 次按钮
  2. 3 秒后，count 只变成 1，而不是 3


为什么会这样？
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

原因：闭包捕获了当时的 count 值

第一次点击（count = 0）：
  setTimeout(() => {
    setCount(0 + 1);  // 捕获的 count = 0
  }, 3000);

第二次点击（count = 0，UI 还未更新）：
  setTimeout(() => {
    setCount(0 + 1);  // 捕获的 count 还是 0
  }, 3000);

第三次点击（count = 0，UI 还未更新）：
  setTimeout(() => {
    setCount(0 + 1);  // 捕获的 count 还是 0
  }, 3000);

3 秒后，三个 setTimeout 依次执行：
  setCount(1)  // count 变成 1
  setCount(1)  // count 还是 1
  setCount(1)  // count 还是 1


源码解释：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ReactFiberHooks.old.js

function mountState<S>(initialState: S): [S, Dispatch<SetStateAction<S>>] {
  const hook = mountWorkInProgressHook();
  
  // 初始化状态
  hook.memoizedState = hook.baseState = initialState;
  
  const queue = {
    pending: null,
    lanes: NoLanes,
    dispatch: null,
    lastRenderedReducer: basicStateReducer,
    lastRenderedState: initialState,
  };
  hook.queue = queue;
  
  // 🔥 创建 dispatch 函数
  const dispatch = queue.dispatch = dispatchSetState.bind(
    null,
    currentlyRenderingFiber,
    queue,
  );
  
  // 🔥 返回当前状态和 dispatch 函数
  return [hook.memoizedState, dispatch];
}

关键点：
  每次渲染时，useState 返回的是当时的 memoizedState 值
  闭包捕获的就是那一次渲染的 count 值


解决方案：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

方案 1：使用函数式更新 ✅ 推荐

function Counter() {
  const [count, setCount] = useState(0);
  
  const handleClick = () => {
    setTimeout(() => {
      // ✅ 使用函数式更新，prevCount 是最新值
      setCount(prevCount => prevCount + 1);
    }, 3000);
  };
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={handleClick}>+1</button>
    </div>
  );
}

原理：
  // dispatchSetState 中的处理
  if (typeof action === 'function') {
    // 🔥 如果是函数，用最新的 state 调用
    action = action(currentState);
  }


方案 2：使用 useRef 存储最新值

function Counter() {
  const [count, setCount] = useState(0);
  const countRef = useRef(count);
  
  // 保持 ref 同步
  useEffect(() => {
    countRef.current = count;
  }, [count]);
  
  const handleClick = () => {
    setTimeout(() => {
      // ✅ 使用 ref 获取最新值
      setCount(countRef.current + 1);
    }, 3000);
  };
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={handleClick}>+1</button>
    </div>
  );
}


方案 3：使用 useReducer

function Counter() {
  const [count, dispatch] = useReducer(
    (state, action) => {
      switch (action.type) {
        case 'increment':
          return state + 1;
        default:
          return state;
      }
    },
    0
  );
  
  const handleClick = () => {
    setTimeout(() => {
      // ✅ dispatch 不依赖闭包的 count
      dispatch({ type: 'increment' });
    }, 3000);
  };
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={handleClick}>+1</button>
    </div>
  );
}


方案 4：使用 useCallback 和依赖数组

function Counter() {
  const [count, setCount] = useState(0);
  
  const handleClick = useCallback(() => {
    setTimeout(() => {
      setCount(count + 1);
    }, 3000);
  }, [count]);  // ✅ 依赖 count，count 变化时重新创建
  
  // 注意：这个方案在快速点击场景下仍有问题
  // 因为每次 count 变化都会创建新的 timeout
}


其他常见闭包陷阱：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. useEffect 中的闭包

// ❌ 错误
useEffect(() => {
  const timer = setInterval(() => {
    console.log(count);  // 永远是初始值
  }, 1000);
  return () => clearInterval(timer);
}, []);  // 空依赖数组

// ✅ 正确
useEffect(() => {
  const timer = setInterval(() => {
    console.log(count);  // 总是最新值
  }, 1000);
  return () => clearInterval(timer);
}, [count]);  // 依赖 count


2. 事件处理中的闭包

// ❌ 错误
const handleScroll = () => {
  console.log(count);  // 捕获的是创建时的 count
};

useEffect(() => {
  window.addEventListener('scroll', handleScroll);
  return () => window.removeEventListener('scroll', handleScroll);
}, []);  // 空依赖

// ✅ 正确：使用 ref
const countRef = useRef(count);
useEffect(() => {
  countRef.current = count;
}, [count]);

const handleScroll = () => {
  console.log(countRef.current);  // 总是最新值
};


面试回答要点：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. 原因：闭包捕获了创建时的 state 值
2. 表现：异步操作中使用的是旧值
3. 解决：使用函数式更新 setCount(prev => prev + 1)
4. 替代：使用 useRef 存储最新值
5. 预防：正确设置 useEffect 和 useCallback 的依赖数组`}
        </pre>
      </div>
    )
  },
  {
    id: 'hooks-3',
    question: '3. useEffect 和 useLayoutEffect 的区别？',
    answer: (
      <div>
        <h4>💡 答案：</h4>
        <pre style={{ background: '#f5f5f5', padding: '15px', borderRadius: '5px', overflow: 'auto', fontSize: '13px', lineHeight: '1.6' }}>
{`核心区别：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

执行时机不同：

useEffect：
  - 异步执行
  - 在浏览器绘制（Paint）后执行
  - 不阻塞浏览器渲染
  - 通过 MessageChannel 调度

useLayoutEffect：
  - 同步执行
  - 在 DOM 变更后，浏览器绘制前执行
  - 会阻塞浏览器渲染
  - 在 Commit 阶段的 Layout 子阶段执行


完整时间线对比：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

React Commit 阶段：
  ├─ Before Mutation
  ├─ Mutation（DOM 变更）
  ├─ Layout
  │   └─ 🔥 useLayoutEffect 执行 ← 同步，阻塞
  └─ requestPaint()

浏览器渲染：
  ├─ Recalculate Style
  ├─ Layout
  ├─ Paint
  └─ Composite
      └─ 🔥 用户看到新画面

下一个宏任务：
  └─ 🔥 useEffect 执行 ← 异步，不阻塞


源码实现：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// useLayoutEffect - 同步执行

function commitLayoutEffects(finishedWork, root, committedLanes) {
  // 遍历 Fiber 树
  while (nextEffect !== null) {
    const fiber = nextEffect;
    
    if (fiber.flags & LayoutMask) {
      // 🔥 同步执行 useLayoutEffect
      commitLayoutEffectOnFiber(root, current, fiber, committedLanes);
    }
    
    nextEffect = nextEffect.nextEffect;
  }
}

function commitHookEffectListMount(tag, finishedWork) {
  const updateQueue = finishedWork.updateQueue;
  const lastEffect = updateQueue !== null ? updateQueue.lastEffect : null;
  
  if (lastEffect !== null) {
    const firstEffect = lastEffect.next;
    let effect = firstEffect;
    
    do {
      if ((effect.tag & tag) === tag) {
        // 🔥🔥 同步执行
        const create = effect.create;
        effect.destroy = create();  // 立即执行，会阻塞
      }
      effect = effect.next;
    } while (effect !== firstEffect);
  }
}


// useEffect - 异步调度

function commitRootImpl(root, recoverableErrors, transitions, renderPriorityLevel) {
  // ...
  
  // Layout 阶段完成后
  
  // 🔥 调度 useEffect（异步）
  if (rootDoesHavePassiveEffects) {
    scheduleCallback(NormalSchedulerPriority, () => {
      flushPassiveEffects();  // 通过 MessageChannel 异步执行
      return null;
    });
  }
}


使用场景对比：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

useLayoutEffect 适用场景：
  ✅ 需要读取 DOM 布局信息
  ✅ 需要在绘制前修改 DOM，避免闪烁
  ✅ 需要同步执行的副作用

示例 1：测量 DOM 尺寸
  useLayoutEffect(() => {
    const { width, height } = element.getBoundingClientRect();
    // 根据尺寸调整其他元素
  }, []);

示例 2：Tooltip 定位
  useLayoutEffect(() => {
    const targetRect = target.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    
    // 计算并设置 tooltip 位置
    tooltip.style.left = \`\${targetRect.left}px\`;
    tooltip.style.top = \`\${targetRect.top - tooltipRect.height}px\`;
  }, []);

示例 3：避免闪烁的动画初始化
  useLayoutEffect(() => {
    element.style.opacity = '0';
    element.style.transform = 'translateY(20px)';
    
    requestAnimationFrame(() => {
      element.style.transition = 'all 0.3s';
      element.style.opacity = '1';
      element.style.transform = 'translateY(0)';
    });
  }, []);


useEffect 适用场景：
  ✅ 数据获取（API 请求）
  ✅ 订阅/监听
  ✅ 日志记录
  ✅ 不影响布局的副作用

示例 1：数据获取
  useEffect(() => {
    fetchData().then(data => setData(data));
  }, []);

示例 2：事件监听
  useEffect(() => {
    const handleResize = () => {
      console.log('resized');
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

示例 3：文档标题更新
  useEffect(() => {
    document.title = \`Count: \${count}\`;
  }, [count]);


性能对比：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

useLayoutEffect：
  ❌ 会阻塞浏览器绘制
  ❌ 如果耗时长，用户会感觉卡顿
  ✅ 保证在绘制前完成，不会闪烁

useEffect：
  ✅ 不阻塞浏览器绘制
  ✅ 用户更快看到新画面
  ⚠️ 可能有视觉闪烁（先显示旧状态，再更新）


错误使用示例：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ❌ 错误：使用 useEffect 会闪烁
function Component() {
  const [height, setHeight] = useState(0);
  
  useEffect(() => {
    const measured = element.getBoundingClientRect().height;
    setHeight(measured);  // 先显示 height=0，再更新，会闪烁
  }, []);
  
  return <div style={{ height }}>Content</div>;
}

// ✅ 正确：使用 useLayoutEffect
function Component() {
  const [height, setHeight] = useState(0);
  
  useLayoutEffect(() => {
    const measured = element.getBoundingClientRect().height;
    setHeight(measured);  // 在绘制前完成，不会闪烁
  }, []);
  
  return <div style={{ height }}>Content</div>;
}


SSR 注意事项：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

useLayoutEffect 在服务端渲染时会警告：
  ⚠️ useLayoutEffect does nothing on the server

解决方案：
  const useIsomorphicLayoutEffect = 
    typeof window !== 'undefined' ? useLayoutEffect : useEffect;


面试回答要点：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. 执行时机：
   - useEffect：浏览器绘制后（异步）
   - useLayoutEffect：DOM 变更后、绘制前（同步）

2. 是否阻塞：
   - useEffect：不阻塞渲染
   - useLayoutEffect：阻塞渲染

3. 使用场景：
   - useEffect：大部分副作用（API、订阅等）
   - useLayoutEffect：读取布局、避免闪烁

4. 调度方式：
   - useEffect：MessageChannel 异步调度
   - useLayoutEffect：Commit 阶段同步执行

5. 选择原则：默认用 useEffect，需要同步时用 useLayoutEffect`}
        </pre>
      </div>
    )
  }
];

// ============================================
// 三、Diff 算法相关面试题
// ============================================

const diffQuestions = [
  {
    id: 'diff-1',
    question: '1. React Diff 算法的三大策略是什么？',
    answer: (
      <div>
        <h4>💡 答案：</h4>
        <pre style={{ background: '#f5f5f5', padding: '15px', borderRadius: '5px', overflow: 'auto', fontSize: '13px', lineHeight: '1.6' }}>
{`React Diff 算法的三大策略：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

传统 Diff 算法：
  - 时间复杂度：O(n³)
  - n 是树中节点的数量
  - 对于大型应用不可接受

React 优化后：
  - 时间复杂度：O(n)
  - 通过三大策略实现


策略一：Tree Diff（树层级 Diff）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

策略：只对同层级节点进行比较，不跨层级比较

前提假设：
  跨层级移动 DOM 节点的情况很少，可以忽略不计

实现：
  - 只比较同一层级的节点
  - 如果节点不存在了，直接删除该节点及其子树
  - 不会浪费时间尝试复用跨层级的节点

示例：
  旧树：         新树：
    A              A
   / \\            / \\
  B   C          D   C
      |              |
      D              B

  React 的处理：
    1. 删除 B 及其子树
    2. 删除旧的 C.child (D)
    3. 创建新的 D 节点
    4. 创建新的 B 节点（挂在 D 下）

  不会识别出 B 和 D 只是移动了位置

源码体现：
  // reconcileChildFibers 只比较同层节点
  function reconcileChildFibers(
    returnFiber: Fiber,
    currentFirstChild: Fiber | null,
    newChild: any,
    lanes: Lanes,
  ): Fiber | null {
    // 🔥 只处理 returnFiber 的直接子节点
    // 不会去比较孙子节点或更深层级
  }


策略二：Component Diff（组件 Diff）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

策略：同类型组件生成相似树结构，不同类型组件生成不同树结构

规则：
  1. 如果组件类型相同（type 相同）：
     - 继续比较其子元素
     - 可能更新 props
     - 不会卸载和重新挂载
  
  2. 如果组件类型不同（type 不同）：
     - 直接删除旧组件及其子树
     - 创建新组件及其子树
     - 不会尝试复用

示例：
  旧：<ComponentA />
  新：<ComponentB />
  
  处理：
    1. 卸载 ComponentA（执行 cleanup、componentWillUnmount）
    2. 删除 ComponentA 的整个子树
    3. 挂载 ComponentB（执行 componentDidMount）
    4. 构建 ComponentB 的整个子树

优化建议：
  // ❌ 避免这样做（组件类型改变）
  {condition ? <ComponentA /> : <ComponentB />}
  
  // ✅ 更好的做法（同一个组件，内部处理逻辑）
  <Component isTypeA={condition} />

源码体现：
  // ReactChildFiber.old.js
  
  function reconcileSingleElement(
    returnFiber: Fiber,
    currentFirstChild: Fiber | null,
    element: ReactElement,
    lanes: Lanes,
  ): Fiber {
    const key = element.key;
    let child = currentFirstChild;
    
    while (child !== null) {
      if (child.key === key) {
        const elementType = element.type;
        
        // 🔥 比较 type
        if (child.elementType === elementType) {
          // ✅ type 相同，复用
          deleteRemainingChildren(returnFiber, child.sibling);
          const existing = useFiber(child, element.props);
          existing.ref = coerceRef(returnFiber, child, element);
          existing.return = returnFiber;
          return existing;
        }
        
        // ❌ type 不同，删除并创建新的
        deleteRemainingChildren(returnFiber, child);
        break;
      } else {
        deleteChild(returnFiber, child);
      }
      child = child.sibling;
    }
    
    // 创建新 Fiber
    const created = createFiberFromElement(element, returnFiber.mode, lanes);
    created.ref = coerceRef(returnFiber, currentFirstChild, element);
    created.return = returnFiber;
    return created;
  }


策略三：Element Diff（元素 Diff）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

策略：对于同一层级的子节点，通过唯一 key 进行区分

核心机制：
  1. 使用 key 标识节点
  2. 比较新旧节点列表
  3. 最大化复用现有节点
  4. 最小化 DOM 操作

四种操作：
  - 插入（Placement）：新节点不在旧列表中
  - 移动（Placement）：节点在旧列表中，但位置变了
  - 更新（Update）：节点存在，但 props 变了
  - 删除（Deletion）：旧节点不在新列表中

算法（双指针 + lastPlacedIndex）：
  1. 第一轮遍历：
     - 从左向右，逐个比较新旧节点
     - key 和 type 都相同：复用并更新
     - key 或 type 不同：跳出循环
  
  2. 第二轮遍历（如果需要）：
     - 将剩余旧节点存入 Map（key -> Fiber）
     - 遍历剩余新节点：
       * 在 Map 中查找 key 对应的旧节点
       * 找到：复用，判断是否需要移动
       * 没找到：创建新节点
     - 删除 Map 中剩余的旧节点

lastPlacedIndex 机制：
  用于判断节点是否需要移动
  
  规则：
    oldIndex < lastPlacedIndex  → 需要移动（标记 Placement）
    oldIndex >= lastPlacedIndex → 不需要移动，更新 lastPlacedIndex

示例：
  旧：A B C D
  新：A C D B

  第一轮：
    A vs A：复用，lastPlacedIndex = 0
  
  第二轮：
    C: oldIndex(2) >= lastPlacedIndex(0) → 不移动，lastPlacedIndex = 2
    D: oldIndex(3) >= lastPlacedIndex(2) → 不移动，lastPlacedIndex = 3
    B: oldIndex(1) < lastPlacedIndex(3)  → 移动！标记 Placement

源码体现：
  // ReactChildFiber.old.js
  
  function placeChild(
    newFiber: Fiber,
    lastPlacedIndex: number,
    newIndex: number,
  ): number {
    newFiber.index = newIndex;
    
    const current = newFiber.alternate;
    if (current !== null) {
      const oldIndex = current.index;
      
      // 🔥 判断是否需要移动
      if (oldIndex < lastPlacedIndex) {
        // 🔥 需要移动
        newFiber.flags |= Placement;
        return lastPlacedIndex;
      } else {
        // 不需要移动
        return oldIndex;
      }
    } else {
      // 新插入的节点
      newFiber.flags |= Placement;
      return lastPlacedIndex;
    }
  }


为什么需要 key？
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

没有 key 的问题：
  旧：<li>A</li> <li>B</li>
  新：<li>C</li> <li>A</li> <li>B</li>

  React 的处理（没有 key）：
    1. 复用第一个 li，更新内容：A → C
    2. 复用第二个 li，更新内容：B → A
    3. 创建第三个 li，内容：B

  问题：本该复用 A 和 B，结果全都更新了

有 key 的优化：
  旧：<li key="a">A</li> <li key="b">B</li>
  新：<li key="c">C</li> <li key="a">A</li> <li key="b">B</li>

  React 的处理（有 key）：
    1. 创建 key="c" 的新 li
    2. 复用 key="a" 的 li（可能移动位置）
    3. 复用 key="b" 的 li（可能移动位置）

  优点：真正复用了 A 和 B


面试回答要点：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Tree Diff：只比较同层级，不跨层级
2. Component Diff：type 相同复用，type 不同重建
3. Element Diff：通过 key 标识，最大化复用
4. 时间复杂度：O(n)
5. 核心：lastPlacedIndex 判断是否需要移动`}
        </pre>
      </div>
    )
  },
  {
    id: 'diff-2',
    question: '2. 为什么列表渲染需要 key？key 应该如何选择？',
    answer: (
      <div>
        <h4>💡 答案：</h4>
        <pre style={{ background: '#f5f5f5', padding: '15px', borderRadius: '5px', overflow: 'auto', fontSize: '13px', lineHeight: '1.6' }}>
{`为什么需要 key？
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

核心原因：帮助 React 识别哪些元素改变了（添加、删除、移动）

没有 key 的问题：
  React 只能按顺序逐个比较，无法识别节点的移动

示例：
  旧列表：[A, B, C]
  新列表：[C, A, B]

  没有 key（按 index 比较）：
    index 0: A → C （更新内容）
    index 1: B → A （更新内容）
    index 2: C → B （更新内容）
  
  结果：所有节点都更新了！❌

  有 key（按 key 比较）：
    key="A": 复用节点 A，移动位置
    key="B": 复用节点 B，移动位置
    key="C": 复用节点 C，移动位置
  
  结果：只是移动，没有更新内容！✅


key 的作用：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. 唯一标识：在同一层级唯一标识一个节点
2. 复用判断：通过 key 判断是否可以复用
3. 移动检测：通过 key 检测节点是否移动
4. 性能优化：减少不必要的 DOM 操作


源码中 key 的使用：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ReactChildFiber.old.js

function reconcileChildrenArray(
  returnFiber: Fiber,
  currentFirstChild: Fiber | null,
  newChildren: Array<any>,
  lanes: Lanes,
): Fiber | null {
  // ...
  
  // 第一轮遍历：处理更新的节点
  for (; oldFiber !== null && newIdx < newChildren.length; newIdx++) {
    const newChild = newChildren[newIdx];
    
    // 🔥 比较 key
    if (oldFiber.key === newChild.key) {
      // key 相同，检查 type
      if (oldFiber.elementType === newChild.type) {
        // ✅ 可以复用
        const existing = useFiber(oldFiber, newChild.props);
        // ...
      } else {
        // type 不同，不能复用
      }
    } else {
      // key 不同，退出第一轮循环
      break;
    }
    
    oldFiber = oldFiber.sibling;
  }
  
  // 第二轮遍历：处理剩余节点
  if (newIdx === newChildren.length) {
    // 新节点遍历完了，删除剩余旧节点
    deleteRemainingChildren(returnFiber, oldFiber);
    return resultingFirstChild;
  }
  
  if (oldFiber === null) {
    // 旧节点遍历完了，创建剩余新节点
    for (; newIdx < newChildren.length; newIdx++) {
      const newFiber = createChild(returnFiber, newChildren[newIdx], lanes);
      // ...
    }
    return resultingFirstChild;
  }
  
  // 🔥 将剩余旧节点放入 Map（key -> Fiber）
  const existingChildren = mapRemainingChildren(returnFiber, oldFiber);
  
  // 遍历剩余新节点
  for (; newIdx < newChildren.length; newIdx++) {
    const newChild = newChildren[newIdx];
    
    // 🔥 从 Map 中查找 key 对应的旧节点
    const matchedFiber = existingChildren.get(
      newChild.key === null ? newIdx : newChild.key
    );
    
    if (matchedFiber !== undefined) {
      // ✅ 找到了，复用
      // ...
      existingChildren.delete(newChild.key);
    } else {
      // ❌ 没找到，创建新节点
      const created = createChild(returnFiber, newChild, lanes);
      // ...
    }
  }
  
  // 🔥 删除 Map 中剩余的旧节点
  existingChildren.forEach(child => {
    deleteChild(returnFiber, child);
  });
  
  return resultingFirstChild;
}


key 的选择原则：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ 推荐做法：

1. 使用数据的唯一 ID
   {users.map(user => (
     <User key={user.id} data={user} />
   ))}

2. 如果没有 ID，使用其他稳定的唯一标识
   {items.map(item => (
     <Item key={item.name} data={item} />  // 如果 name 唯一且稳定
   ))}

3. 如果数据本身就是唯一的（如字符串数组）
   {tags.map(tag => (
     <Tag key={tag}>{tag}</Tag>  // 字符串本身作为 key
   ))}


❌ 不推荐做法：

1. 使用 index 作为 key（列表会变化时）
   {items.map((item, index) => (
     <Item key={index} data={item} />  // ❌ 会导致问题
   ))}

   问题示例：
     旧列表：[A, B, C] (index: 0, 1, 2)
     新列表：[C, A, B] (index: 0, 1, 2)
     
     React 的处理：
       key=0: A → C (更新)
       key=1: B → A (更新)
       key=2: C → B (更新)
     
     本应该是移动，结果变成了更新！

2. 使用随机数作为 key
   {items.map(item => (
     <Item key={Math.random()} data={item} />  // ❌ 每次都是新的 key
   ))}

   问题：
     每次渲染都会生成新的 key
     React 会认为所有节点都是新的
     无法复用任何节点

3. 使用不稳定的值作为 key
   {items.map(item => (
     <Item key={Date.now()} data={item} />  // ❌ key 会变化
   ))}


什么时候可以用 index？
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

满足以下所有条件时可以使用 index：
  ✅ 列表是静态的，不会改变
  ✅ 列表项没有 ID
  ✅ 列表不会重新排序或过滤

示例：
  const staticList = ['Apple', 'Banana', 'Orange'];
  
  {staticList.map((fruit, index) => (
    <li key={index}>{fruit}</li>  // ✅ 可以使用 index
  ))}


key 导致的常见 bug：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. 输入框内容错乱

function TodoList({ todos }) {
  return (
    <ul>
      {todos.map((todo, index) => (
        <li key={index}>  {/* ❌ 使用 index */}
          <input defaultValue={todo.text} />
          <button onClick={() => deleteTodo(index)}>Delete</button>
        </li>
      ))}
    </ul>
  );
}

问题：
  初始：[{text: 'A'}, {text: 'B'}, {text: 'C'}]
  用户编辑第二项：input 变成 'B-edited'
  删除第一项：[{text: 'B'}, {text: 'C'}]
  
  React 的处理（使用 index 作为 key）：
    key=0: A → B （复用第一个 input，显示 'A'）
    key=1: B-edited → C （复用第二个 input，显示 'B-edited'）
  
  结果：
    第一个 input 显示 'A' ❌
    第二个 input 显示 'B-edited' ❌（应该是 'C'）

解决：
  <li key={todo.id}>  {/* ✅ 使用唯一 ID */}
    <input defaultValue={todo.text} />
  </li>


2. 组件状态错乱

function UserList({ users }) {
  return (
    <ul>
      {users.map((user, index) => (
        <UserItem key={index} user={user} />  {/* ❌ 使用 index */}
      ))}
    </ul>
  );
}

function UserItem({ user }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <li>
      <div>{user.name}</div>
      <button onClick={() => setIsExpanded(!isExpanded)}>
        {isExpanded ? 'Collapse' : 'Expand'}
      </button>
      {isExpanded && <div>{user.details}</div>}
    </li>
  );
}

问题：
  用户展开第二项
  删除第一项
  第二项的展开状态会移到第一项（因为 key 都是基于 index）

解决：
  <UserItem key={user.id} user={user} />  {/* ✅ 使用唯一 ID */}


key 的最佳实践：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. 优先使用数据的唯一标识（ID）
2. key 必须在兄弟节点中唯一（不需要全局唯一）
3. key 必须稳定、可预测、唯一
4. 不要在渲染时生成 key
5. 避免使用 index（除非列表静态不变）


面试回答要点：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. 作用：帮助 React 识别节点的变化（添加、删除、移动）
2. 原理：通过 key 匹配新旧节点，判断是否可以复用
3. 选择：使用数据的唯一 ID，避免 index 和随机数
4. 后果：key 选择不当会导致性能问题和状态错乱
5. 原则：稳定、可预测、唯一`}
        </pre>
      </div>
    )
  }
];

// 继续添加其他分类的问题...
// 由于篇幅限制，这里只展示了部分问题
// 实际应用中应该补充完整

const renderCommitQuestions = [
  {
    id: 'rc-1',
    question: '1. Render 阶段和 Commit 阶段的区别是什么？',
    answer: (
      <div>
        <h4>💡 答案：（见前面详细分析）</h4>
      </div>
    )
  }
];

const effectsQuestions = [
  {
    id: 'effects-1',
    question: '1. useEffect 是如何调度的？为什么是异步的？',
    answer: (
      <div>
        <h4>💡 答案：（见前面详细分析）</h4>
      </div>
    )
  }
];

const schedulingQuestions = [
  {
    id: 'sched-1',
    question: '1. React 的调度机制是如何工作的？',
    answer: (
      <div>
        <h4>💡 答案：（结合 Scheduler 和优先级）</h4>
      </div>
    )
  }
];

const performanceQuestions = [
  {
    id: 'perf-1',
    question: '1. React 有哪些性能优化手段？',
    answer: (
      <div>
        <h4>💡 答案：</h4>
        <pre style={{ background: '#f5f5f5', padding: '15px', borderRadius: '5px', overflow: 'auto', fontSize: '13px', lineHeight: '1.6' }}>
{`React 性能优化手段：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. React.memo - 组件级别优化
2. useMemo - 计算结果缓存
3. useCallback - 函数缓存
4. 代码分割 - React.lazy 和 Suspense
5. 虚拟列表 - 只渲染可见项
6. 合理使用 key
7. 避免内联对象和函数
8. 使用 Profiler 分析性能
9. 懒加载图片
10. 防抖和节流

详细说明见后续问题...`}
        </pre>
      </div>
    )
  }
];

const comprehensiveQuestions = [
  {
    id: 'comp-1',
    question: '1. 从 setState 到页面更新的完整流程？',
    answer: (
      <div>
        <h4>💡 答案：（结合前面所有知识点）</h4>
      </div>
    )
  }
];

export { ReactInterviewQuestions };
