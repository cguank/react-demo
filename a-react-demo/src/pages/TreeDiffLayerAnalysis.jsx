import React, { useState } from 'react';

/**
 * React Diff 算法 - 同层比较机制深度解析
 * 
 * 核心问题：
 * 1. "不同层则退出比较"是在哪里判断的？
 * 2. reconcileChildrenArray 是否判断同层？
 * 3. React 如何保证只比较同层节点？
 */

export default function TreeDiffLayerAnalysis() {
  const [structure, setStructure] = useState('normal');

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>⚛️ React Diff 算法 - 同层比较机制</h1>
      
      {/* 第一部分：核心答案 */}
      <div style={{ background: '#e3f2fd', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>🎯 核心问题：如何保证同层比较？</h2>
        
        <div style={{ background: '#fff', padding: '15px', borderRadius: '5px', marginBottom: '15px' }}>
          <h3>✅ 答案：不是在 reconcileChildrenArray 中判断，而是通过遍历方式天然保证</h3>
          <pre style={{ background: '#f5f5f5', padding: '15px', overflow: 'auto', fontSize: '14px' }}>
{`关键理解：

1. reconcileChildrenArray 不判断层级
   ├─ 它只处理同一个父节点的子节点数组
   ├─ 参数 returnFiber 就是父节点
   └─ 它比较的是 returnFiber 的所有子节点（天然同层）

2. 层级的区分通过遍历方式保证
   ├─ beginWork 逐层向下遍历
   ├─ 每一层都会调用 reconcileChildren
   └─ reconcileChildren 只处理当前节点的直接子节点

3. "不同层退出比较"的本质
   ├─ 不是显式判断后退出
   ├─ 而是根本不会跨层比较
   └─ 通过树的遍历方式自然实现

核心调用链：
performUnitOfWork
  ↓
beginWork(currentFiber, workInProgressFiber)  ← 处理当前层
  ↓
reconcileChildren(workInProgress, nextChildren)  ← 协调当前节点的子节点
  ↓
reconcileChildrenArray(returnFiber, oldChildren, newChildren)  ← 只处理这一层的子节点
  ↓
返回第一个子节点
  ↓
继续 beginWork 处理子节点（下一层）`}
          </pre>
        </div>
      </div>

      {/* 第二部分：源码解析 */}
      <div style={{ background: '#f3e5f5', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>📂 源码级别的层级保证机制</h2>
        
        <div style={{ background: '#fff', padding: '15px', borderRadius: '5px', marginBottom: '15px' }}>
          <h3>1. performUnitOfWork - 工作单元处理</h3>
          <pre style={{ background: '#f5f5f5', padding: '10px', overflow: 'auto', fontSize: '13px' }}>
{`// ReactFiberWorkLoop.old.js (1831 行)

function performUnitOfWork(unitOfWork: Fiber): void {
  // unitOfWork 是当前正在处理的 Fiber 节点
  const current = unitOfWork.alternate;
  
  // 调用 beginWork 处理当前节点
  // 返回值是第一个子节点
  let next = beginWork(current, unitOfWork, subtreeRenderLanes);
  
  // 更新 props
  unitOfWork.memoizedProps = unitOfWork.pendingProps;
  
  if (next === null) {
    // 如果没有子节点，完成当前节点
    completeUnitOfWork(unitOfWork);
  } else {
    // 如果有子节点，继续处理子节点
    workInProgress = next;
  }
}

关键点：
1. 每次只处理一个 Fiber 节点（unitOfWork）
2. beginWork 返回第一个子节点
3. 如果有子节点，继续处理（向下一层）
4. 如果没有子节点，completeWork（横向或向上）

这种设计保证了：
- 每层独立处理
- 不会跨层访问
- 层级关系通过 return、child、sibling 维护`}
          </pre>
        </div>

        <div style={{ background: '#fff', padding: '15px', borderRadius: '5px', marginBottom: '15px' }}>
          <h3>2. beginWork - 处理当前节点并协调子节点</h3>
          <pre style={{ background: '#f5f5f5', padding: '10px', overflow: 'auto', fontSize: '13px' }}>
{`// ReactFiberBeginWork.old.js (3685 行)

function beginWork(
  current: Fiber | null,
  workInProgress: Fiber,
  renderLanes: Lanes,
): Fiber | null {
  
  // 根据节点类型处理
  switch (workInProgress.tag) {
    case FunctionComponent:
      return updateFunctionComponent(
        current,
        workInProgress,
        Component,
        resolvedProps,
        renderLanes,
      );
    
    case ClassComponent:
      return updateClassComponent(
        current,
        workInProgress,
        Component,
        resolvedProps,
        renderLanes,
      );
    
    case HostComponent:  // div, span 等
      return updateHostComponent(
        current,
        workInProgress,
        renderLanes,
      );
    
    // ... 其他类型
  }
}

// 每个 updateXXX 函数内部都会调用 reconcileChildren

function updateFunctionComponent(...) {
  // 1. 调用组件函数获取子元素
  let nextChildren = renderWithHooks(...);
  
  // 2. 协调子节点
  reconcileChildren(current, workInProgress, nextChildren, renderLanes);
  
  // 3. 返回第一个子节点
  return workInProgress.child;
}

关键点：
1. beginWork 只处理当前节点
2. 获取当前节点的子元素（nextChildren）
3. 调用 reconcileChildren 协调这些子元素
4. 返回第一个子节点（下一层的入口）`}
          </pre>
        </div>

        <div style={{ background: '#fff', padding: '15px', borderRadius: '5px', marginBottom: '15px' }}>
          <h3>3. reconcileChildren - 协调子节点</h3>
          <pre style={{ background: '#f5f5f5', padding: '10px', overflow: 'auto', fontSize: '13px' }}>
{`// ReactFiberBeginWork.old.js (288 行)

export function reconcileChildren(
  current: Fiber | null,
  workInProgress: Fiber,      // 当前节点（父节点）
  nextChildren: any,           // 新的子元素
  renderLanes: Lanes,
) {
  if (current === null) {
    // Mount
    workInProgress.child = mountChildFibers(
      workInProgress,
      null,
      nextChildren,
      renderLanes,
    );
  } else {
    // Update
    workInProgress.child = reconcileChildFibers(
      workInProgress,           // 父节点
      current.child,            // 老的第一个子节点
      nextChildren,             // 新的子元素
      renderLanes,
    );
  }
}

关键点：
1. workInProgress 是父节点
2. current.child 是老的子节点链表（同层）
3. nextChildren 是新的子元素（同层）
4. 只处理这一层的子节点，不涉及孙子节点`}
          </pre>
        </div>

        <div style={{ background: '#fff', padding: '15px', borderRadius: '5px' }}>
          <h3>4. reconcileChildrenArray - 处理子节点数组</h3>
          <pre style={{ background: '#f5f5f5', padding: '10px', overflow: 'auto', fontSize: '13px' }}>
{`// ReactChildFiber.old.js (736 行)

function reconcileChildrenArray(
  returnFiber: Fiber,           // 父节点
  currentFirstChild: Fiber | null,  // 老的第一个子节点
  newChildren: Array<*>,        // 新的子元素数组
  lanes: Lanes,
): Fiber | null {
  
  // 注意：这里没有判断层级的代码
  // 因为传入的参数天然就是同一层的
  
  let oldFiber = currentFirstChild;  // 老的子节点
  let newIdx = 0;
  
  // 第一轮遍历：同位置比较
  for (; oldFiber !== null && newIdx < newChildren.length; newIdx++) {
    nextOldFiber = oldFiber.sibling;  // 通过 sibling 遍历同层兄弟节点
    
    const newFiber = updateSlot(
      returnFiber,
      oldFiber,
      newChildren[newIdx],
      lanes,
    );
    
    // ... 处理复用或创建
  }
  
  // 第二轮遍历：处理剩余节点
  // ...
  
  return resultingFirstChild;
}

关键点：
1. returnFiber 是父节点（定义了层级）
2. currentFirstChild 是父节点的子节点（天然同层）
3. newChildren 是父节点的新子元素（天然同层）
4. oldFiber.sibling 遍历兄弟节点（都在同一层）
5. 不需要判断层级，因为参数就已经限定了层级

为什么不需要判断层级？
┌────────────────────────────────────────┐
│  父节点 A                               │
│    ├─ 子节点 B (currentFirstChild)      │
│    ├─ 子节点 C (B.sibling)              │
│    └─ 子节点 D (C.sibling)              │
│                                         │
│  reconcileChildrenArray 只处理 B、C、D │
│  它们天然就是同一层（A 的子节点）        │
│                                         │
│  孙子节点的处理？                        │
│  → 等 B、C、D 各自执行 beginWork 时     │
│  → 它们会调用自己的 reconcileChildren   │
│  → 处理各自的子节点（下一层）           │
└────────────────────────────────────────┘`}
          </pre>
        </div>
      </div>

      {/* 第三部分：层级遍历示意 */}
      <div style={{ background: '#fff3e0', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>🌲 层级遍历的完整流程</h2>
        
        <div style={{ background: '#fff', padding: '15px', borderRadius: '5px', marginBottom: '15px' }}>
          <h3>示例：三层树的遍历</h3>
          <pre style={{ background: '#f5f5f5', padding: '10px', overflow: 'auto', fontSize: '13px' }}>
{`树结构：
    App
   /   \\
  A     B
 / \\    |
C   D   E

React 的处理流程：

Step 1: performUnitOfWork(App)
  ├─ beginWork(App)
  │  ├─ 调用 App 组件函数，返回 [A, B]
  │  ├─ reconcileChildren(App, [A, B])
  │  │  └─ reconcileChildrenArray(App, oldA-B链表, [A, B])
  │  │     └─ 比较同层：oldA vs newA, oldB vs newB
  │  │     └─ 创建/复用 A、B 的 Fiber
  │  └─ 返回 workInProgress.child = A
  └─ next = A

Step 2: performUnitOfWork(A)  ← 处理下一层
  ├─ beginWork(A)
  │  ├─ 调用 A 组件函数，返回 [C, D]
  │  ├─ reconcileChildren(A, [C, D])
  │  │  └─ reconcileChildrenArray(A, oldC-D链表, [C, D])
  │  │     └─ 比较同层：oldC vs newC, oldD vs newD
  │  │     └─ 只处理 A 的子节点，不涉及 B 的子节点
  │  └─ 返回 workInProgress.child = C
  └─ next = C

Step 3: performUnitOfWork(C)  ← 处理下一层
  ├─ beginWork(C)
  │  ├─ C 没有子节点
  │  └─ 返回 null
  └─ next = null
  └─ completeUnitOfWork(C)  ← 完成 C，回到兄弟节点 D

Step 4: performUnitOfWork(D)
  ├─ beginWork(D)
  │  └─ 返回 null
  └─ completeUnitOfWork(D)  ← 完成 D，回到父节点 A

Step 5: completeUnitOfWork(A)  ← 完成 A，回到兄弟节点 B

Step 6: performUnitOfWork(B)
  ├─ beginWork(B)
  │  ├─ reconcileChildren(B, [E])
  │  │  └─ 只处理 B 的子节点 E，不涉及 A 的子节点
  │  └─ 返回 E
  └─ next = E

关键观察：
┌────────────────────────────────────────────────┐
│  1. 每个节点只协调自己的直接子节点              │
│  2. App reconcile [A, B]（不涉及 C、D、E）      │
│  3. A reconcile [C, D]（不涉及 E）              │
│  4. B reconcile [E]（不涉及 C、D）              │
│  5. 层级天然分离，不需要显式判断                │
└────────────────────────────────────────────────┘`}
          </pre>
        </div>

        <div style={{ background: '#fff', padding: '15px', borderRadius: '5px' }}>
          <h3>跨层移动的处理</h3>
          <pre style={{ background: '#f5f5f5', padding: '10px', overflow: 'auto', fontSize: '13px' }}>
{`场景：节点从一层移动到另一层

老树：              新树：
  App                 App
 /   \\               /   \\
A     B             A     B
|                   |     |
C                   E     C

变化：C 从 A 的子节点变成 B 的子节点

React 的处理：

Step 1: reconcileChildren(A, [])
  ├─ 老子节点：C
  ├─ 新子节点：[]（空）
  ├─ 判断：C 在新数组中不存在
  └─ 操作：标记 C 为删除 ❌

Step 2: reconcileChildren(B, [C])
  ├─ 老子节点：[]（空）
  ├─ 新子节点：[C]
  ├─ 判断：老数组中没有 C
  └─ 操作：创建新的 C ➕

结果：
  - 在 A 下删除 C（包括其子树）
  - 在 B 下创建新的 C（重新构建子树）
  - 不会识别为"移动"

为什么不识别为移动？
┌────────────────────────────────────────────────┐
│  因为 reconcileChildren 只在当前层级内工作：    │
│                                                 │
│  1. 处理 A 的子节点时，不知道 B 的存在          │
│  2. 处理 B 的子节点时，不知道 A 曾经有 C        │
│  3. 两个层级的 reconcile 是独立的               │
│  4. 没有全局的节点索引或跨层查找                │
│                                                 │
│  这就是为什么说"不要跨层移动 DOM"               │
│  → 不是禁止，而是性能差（删除+创建）            │
└────────────────────────────────────────────────┘`}
          </pre>
        </div>
      </div>

      {/* 第四部分：对比传统 Diff */}
      <div style={{ background: '#e8f5e9', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>🔄 React Diff vs 传统 Diff</h2>
        
        <div style={{ background: '#fff', padding: '15px', borderRadius: '5px', marginBottom: '15px' }}>
          <h3>传统 Diff 算法（会跨层比较）</h3>
          <pre style={{ background: '#f5f5f5', padding: '10px', fontSize: '13px' }}>
{`传统编辑距离算法（Edit Distance）：

老树：       新树：
  A            B
  |            |
  B            A

算法会尝试：
1. 遍历老树的所有节点 {A, B}
2. 遍历新树的所有节点 {B, A}
3. 找到最小编辑操作：
   - B 从 A 的子节点移动到 A 的父节点位置
   - A 从根节点移动到 B 的子节点位置

复杂度：O(n³)
- n² 用于比较所有节点对
- n 用于计算最小编辑距离

问题：
- 需要全局遍历和比较
- 需要回溯和动态规划
- 对于大型 DOM 树性能极差`}
          </pre>
        </div>

        <div style={{ background: '#fff', padding: '15px', borderRadius: '5px' }}>
          <h3>React Diff 算法（只比较同层）</h3>
          <pre style={{ background: '#f5f5f5', padding: '10px', fontSize: '13px' }}>
{`React 的层级策略：

老树：       新树：
  A            B
  |            |
  B            A

React 的处理：

Layer 0 (根节点层):
  └─ reconcile: oldA vs newB
     └─ type 不同 → 删除 A，创建 B

Layer 1 (第一层子节点):
  └─ 旧：A 的子节点 [B]
  └─ 新：B 的子节点 [A]
  └─ reconcile: oldB vs newA
     └─ type 不同 → 删除 B，创建 A

结果：
  - 删除整个 A 树（包括 B）
  - 创建整个 B 树（包括 A）
  - 不会识别为移动

复杂度：O(n)
- 只遍历树一次
- 每层独立处理
- 不需要回溯

优势：
✅ 性能高（O(n) vs O(n³)）
✅ 实现简单
✅ 符合 Web UI 的实际场景

劣势：
❌ 不能识别跨层移动
❌ 跨层移动会删除重建

结论：
在 Web 应用中，跨层移动很少见
牺牲这个优化换取整体性能提升是值得的`}
          </pre>
        </div>
      </div>

      {/* 第五部分：可视化 Demo */}
      <div style={{ background: '#fce4ec', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>🎮 可视化 Demo</h2>
        
        <div style={{ marginBottom: '20px' }}>
          <button
            onClick={() => setStructure('normal')}
            style={{
              padding: '10px 20px',
              marginRight: '10px',
              background: structure === 'normal' ? '#e91e63' : '#e0e0e0',
              color: structure === 'normal' ? 'white' : 'black',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            正常结构
          </button>
          <button
            onClick={() => setStructure('moved')}
            style={{
              padding: '10px 20px',
              background: structure === 'moved' ? '#e91e63' : '#e0e0e0',
              color: structure === 'moved' ? 'white' : 'black',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            跨层移动
          </button>
        </div>

        <div style={{ background: '#fff', padding: '15px', borderRadius: '5px' }}>
          <h3>树结构可视化</h3>
          {structure === 'normal' && (
            <div>
              <pre style={{ background: '#f5f5f5', padding: '15px', fontSize: '14px' }}>
{`    App (Layer 0)
   /   \\
  A     B (Layer 1)
 / \\    |
C   D   E (Layer 2)

处理顺序：
1. reconcileChildren(App, [A, B])  ← 只比较 Layer 1
2. reconcileChildren(A, [C, D])    ← 只比较 A 的子节点
3. reconcileChildren(B, [E])       ← 只比较 B 的子节点

每层独立处理，不跨层访问`}
              </pre>
            </div>
          )}
          
          {structure === 'moved' && (
            <div>
              <pre style={{ background: '#ffebee', padding: '15px', fontSize: '14px' }}>
{`老树：        新树：
  App          App
 /   \\        /   \\
A     B      A     B
|            |     |
C            E     C  ← C 跨层移动了

React 的处理：

Layer 1:
  reconcileChildren(A, [])
    └─ 老子节点：[C]
    └─ 新子节点：[]
    └─ 标记删除 C ❌

  reconcileChildren(B, [C])
    └─ 老子节点：[E]
    └─ 新子节点：[C]
    └─ 删除 E，创建 C ❌

结果：
  ❌ 删除 A 下的 C（包括子树）
  ❌ 创建 B 下的 C（重建子树）
  ⚠️  没有识别为移动，而是删除+创建
  ⚠️  性能较差

建议：避免跨层级移动 DOM！`}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* 第六部分：总结 */}
      <div style={{ background: '#e0f2f1', padding: '20px', borderRadius: '8px' }}>
        <h2>📝 总结</h2>
        
        <div style={{ background: '#fff', padding: '15px', borderRadius: '5px' }}>
          <h3>🎯 核心答案</h3>
          
          <h4>1. reconcileChildrenArray 判断同层吗？</h4>
          <div style={{ background: '#e8f5e9', padding: '10px', marginBottom: '10px' }}>
            <p><strong>❌ 不判断！</strong></p>
            <ul>
              <li><code>reconcileChildrenArray</code> 不需要判断层级</li>
              <li>因为传入的参数天然就是同一层的节点</li>
              <li><code>returnFiber</code> 定义了父节点（层级）</li>
              <li><code>currentFirstChild</code> 是父节点的子节点（同层）</li>
              <li><code>newChildren</code> 是父节点的新子元素（同层）</li>
            </ul>
          </div>

          <h4>2. "不同层退出比较"如何实现？</h4>
          <div style={{ background: '#fff9c4', padding: '10px', marginBottom: '10px' }}>
            <p><strong>✅ 通过遍历方式天然保证：</strong></p>
            <ul>
              <li><code>performUnitOfWork</code> 逐个处理 Fiber 节点</li>
              <li><code>beginWork</code> 只处理当前节点的子节点</li>
              <li><code>reconcileChildren</code> 只协调直接子节点</li>
              <li>每层独立处理，不跨层访问</li>
              <li>通过 <code>child</code>、<code>sibling</code>、<code>return</code> 维护层级关系</li>
            </ul>
          </div>

          <h4>3. 为什么这样设计？</h4>
          <div style={{ background: '#e3f2fd', padding: '10px', marginBottom: '10px' }}>
            <ul>
              <li><strong>性能：</strong>O(n) vs 传统算法的 O(n³)</li>
              <li><strong>简单：</strong>不需要复杂的回溯和动态规划</li>
              <li><strong>实用：</strong>Web UI 中跨层移动很少见</li>
              <li><strong>可中断：</strong>每层独立，易于实现时间切片</li>
            </ul>
          </div>

          <h4>4. 跨层移动会怎样？</h4>
          <div style={{ background: '#ffebee', padding: '10px' }}>
            <ul>
              <li>❌ 不会识别为移动操作</li>
              <li>❌ 会删除旧位置的节点（包括子树）</li>
              <li>❌ 会在新位置创建节点（重建子树）</li>
              <li>❌ 性能较差，应该避免</li>
            </ul>
          </div>

          <div style={{ background: '#fff9c4', padding: '15px', marginTop: '15px', borderRadius: '5px' }}>
            <h4>💡 记忆口诀：</h4>
            <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#1976d2' }}>
              层级遍历自然分<br/>
              父节点定义层<br/>
              子节点天然同<br/>
              不需显式判<br/>
              跨层成删建<br/>
              避免跨层移
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
