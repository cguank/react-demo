import React, { useState } from 'react';

/**
 * React Diff 算法中的节点移动机制
 * 
 * 核心问题：
 * 1. Placement 标记是如何判定的？
 * 2. lastPlacedIndex 的作用是什么？
 * 3. 被标记为 Placement 的节点如何移动？
 * 4. DOM 操作是 insertBefore 还是 appendChild？
 */

export default function PlacementMechanismAnalysis() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🔄 React Diff 节点移动机制详解</h1>
      
      {/* 核心概念 */}
      <div style={{ background: '#fff3e0', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>🎯 核心概念</h2>
        <CoreConcepts />
      </div>

      {/* Placement 标记判定 */}
      <div style={{ background: '#e3f2fd', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>🏷️ Placement 标记判定</h2>
        <PlacementMarking />
      </div>

      {/* lastPlacedIndex 机制 */}
      <div style={{ background: '#e8f5e9', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>📍 lastPlacedIndex 机制</h2>
        <LastPlacedIndexMechanism />
      </div>

      {/* DOM 移动执行 */}
      <div style={{ background: '#f3e5f5', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>⚙️ DOM 移动执行</h2>
        <DOMMovementExecution />
      </div>

      {/* 实际案例 */}
      <div style={{ background: '#fce4ec', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>📊 实际案例分析</h2>
        <CaseStudy />
      </div>

      {/* 可视化演示 */}
      <div style={{ background: '#fff9c4', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>🎮 可视化演示</h2>
        <InteractiveDemo />
      </div>

      {/* 总结 */}
      <div style={{ background: '#e0f2f1', padding: '20px', borderRadius: '8px' }}>
        <h2>📝 总结</h2>
        <Summary />
      </div>
    </div>
  );
}

// 核心概念
function CoreConcepts() {
  return (
    <div style={{ background: '#fff', padding: '15px', borderRadius: '5px' }}>
      <h3>Placement 标记和节点移动</h3>
      
      <pre style={{ background: '#f5f5f5', padding: '15px', overflow: 'auto', fontSize: '14px', lineHeight: '1.8' }}>
{`React Diff 节点移动的两个阶段：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

阶段 1: Render 阶段 - 标记（reconcileChildrenArray）
  → 遍历新旧子节点
  → 判断节点是否需要移动
  → 给需要移动的节点打上 Placement 标记
  → 关键：通过 lastPlacedIndex 判断是否需要移动

阶段 2: Commit 阶段 - 执行（commitPlacement）
  → 遍历 Fiber 树
  → 找到带 Placement 标记的节点
  → 执行真实的 DOM 操作
  → 使用 insertBefore 或 appendChild

关键变量：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

lastPlacedIndex:
  - 记录"最后一个不需要移动的节点"在旧列表中的索引
  - 用于判断后续节点是否需要移动
  - 初始值为 0

oldIndex:
  - 当前节点在旧列表中的索引（current.index）
  - 用于和 lastPlacedIndex 比较

newIndex:
  - 当前节点在新列表中的索引
  - 用于确定最终位置

核心判断逻辑：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

if (oldIndex < lastPlacedIndex) {
  // 需要移动！
  // 说明这个节点在旧列表中的位置，比"最后一个不需要移动的节点"还要靠前
  // 现在出现在更后面的位置，所以需要向右移动
  newFiber.flags |= Placement;
  return lastPlacedIndex;
} else {
  // 不需要移动
  // 更新 lastPlacedIndex
  return oldIndex;
}

为什么这样能判断？
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

React 采用"向右移动"策略：
- 只移动需要向右的节点
- 不移动向左或保持位置的节点
- 通过 lastPlacedIndex 追踪"不移动的最右边界"

如果一个节点在旧列表中的位置（oldIndex），
比"当前不移动的最右边界"（lastPlacedIndex）还要左：
→ 说明它需要向右移动到新位置`}
      </pre>
    </div>
  );
}

// Placement 标记判定
function PlacementMarking() {
  return (
    <div style={{ background: '#fff', padding: '15px', borderRadius: '5px' }}>
      <h3>placeChild 函数源码分析</h3>
      
      <pre style={{ background: '#f5f5f5', padding: '15px', overflow: 'auto', fontSize: '13px', lineHeight: '1.8' }}>
{`// ReactChildFiber.old.js line 329-357

function placeChild(
  newFiber: Fiber,
  lastPlacedIndex: number,
  newIndex: number,
): number {
  // 设置节点在新列表中的索引
  newFiber.index = newIndex;
  
  if (!shouldTrackSideEffects) {
    // Mount 阶段或 Hydration，不跟踪副作用
    newFiber.flags |= Forked;
    return lastPlacedIndex;
  }
  
  const current = newFiber.alternate;
  
  if (current !== null) {
    // 🔥 节点复用（更新）
    const oldIndex = current.index;  // 旧列表中的索引
    
    if (oldIndex < lastPlacedIndex) {
      // 🔥🔥🔥 关键判断：需要移动！
      // oldIndex < lastPlacedIndex 说明：
      // 这个节点在旧列表中的位置，比"最后一个不需要移动的节点"还要靠前
      // 但现在出现在更后面的位置（newIndex），所以需要向右移动
      
      newFiber.flags |= Placement;  // 标记为需要移动
      return lastPlacedIndex;       // lastPlacedIndex 不变
    } else {
      // 不需要移动
      // oldIndex >= lastPlacedIndex 说明：
      // 这个节点在旧列表中的位置，在"当前不移动的边界"右边或重合
      // 相对位置没有变化，不需要移动
      
      return oldIndex;  // 更新 lastPlacedIndex 为 oldIndex
    }
  } else {
    // 🔥 新插入的节点
    newFiber.flags |= Placement;
    return lastPlacedIndex;
  }
}

调用时机：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

在 reconcileChildrenArray 中：

let lastPlacedIndex = 0;  // 初始化

for (let newIdx = 0; newIdx < newChildren.length; newIdx++) {
  // ... 获取或创建 newFiber ...
  
  // 🔥 对每个子节点调用 placeChild
  lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx);
  
  // ... 链接到 sibling 链表 ...
}

关键点：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. lastPlacedIndex 从 0 开始
2. 每次调用 placeChild 都会更新（或不更新）lastPlacedIndex
3. 如果节点不需要移动，更新 lastPlacedIndex = oldIndex
4. 如果节点需要移动，lastPlacedIndex 保持不变
5. lastPlacedIndex 始终表示"最后一个不需要移动的节点在旧列表中的索引"`}
      </pre>
    </div>
  );
}

// lastPlacedIndex 机制
function LastPlacedIndexMechanism() {
  return (
    <div style={{ background: '#fff', padding: '15px', borderRadius: '5px' }}>
      <h3>lastPlacedIndex 工作原理</h3>
      
      <pre style={{ background: '#f5f5f5', padding: '15px', overflow: 'auto', fontSize: '13px', lineHeight: '1.8' }}>
{`实例分析：节点移动
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

旧列表：A(0) B(1) C(2) D(3)
新列表：D    A    B    C

目标：将 D 移动到最前面

Diff 过程：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

初始：lastPlacedIndex = 0

第 1 步：处理新列表第 0 个位置 - D
  newIndex = 0
  oldIndex = 3  （D 在旧列表的索引）
  
  判断：oldIndex (3) < lastPlacedIndex (0)?
        3 < 0 → false ✅ 不需要移动
  
  更新：lastPlacedIndex = oldIndex = 3
  
  结果：D 不需要移动（但实际上 D 会被移动，因为它在新位置）

第 2 步：处理新列表第 1 个位置 - A
  newIndex = 1
  oldIndex = 0  （A 在旧列表的索引）
  
  判断：oldIndex (0) < lastPlacedIndex (3)?
        0 < 3 → true ❌ 需要移动！
  
  标记：A.flags |= Placement
  
  更新：lastPlacedIndex 保持 3
  
  结果：A 需要移动

第 3 步：处理新列表第 2 个位置 - B
  newIndex = 2
  oldIndex = 1  （B 在旧列表的索引）
  
  判断：oldIndex (1) < lastPlacedIndex (3)?
        1 < 3 → true ❌ 需要移动！
  
  标记：B.flags |= Placement
  
  更新：lastPlacedIndex 保持 3
  
  结果：B 需要移动

第 4 步：处理新列表第 3 个位置 - C
  newIndex = 3
  oldIndex = 2  （C 在旧列表的索引）
  
  判断：oldIndex (2) < lastPlacedIndex (3)?
        2 < 3 → true ❌ 需要移动！
  
  标记：C.flags |= Placement
  
  更新：lastPlacedIndex 保持 3
  
  结果：C 需要移动

最终标记结果：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

D: 不移动
A: Placement ← 需要移动
B: Placement ← 需要移动
C: Placement ← 需要移动

为什么 D 不需要移动标记？
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

关键理解：
- D 是第一个被处理的，oldIndex (3) > lastPlacedIndex (0)
- 所以 D 被认为"不需要移动"
- 后续的 A、B、C 都在 D 的左边（oldIndex < 3）
- 所以 A、B、C 都被标记为需要移动

实际结果：
- D 会因为其他节点的移动，最终出现在最前面
- A、B、C 会被插入到正确的位置

这就是 React 的"向右移动"策略：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

只移动那些相对位置"向右"的节点，
而不是真的把 D 向左移动。

通过移动 A、B、C 到 D 后面，
达到了 D 在最前面的效果。

另一个例子：节点交换
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

旧列表：A(0) B(1) C(2)
新列表：C    B    A

初始：lastPlacedIndex = 0

处理 C：
  oldIndex = 2, lastPlacedIndex = 0
  2 < 0? → false ✅
  lastPlacedIndex = 2

处理 B：
  oldIndex = 1, lastPlacedIndex = 2
  1 < 2? → true ❌ B 需要移动
  lastPlacedIndex 保持 2

处理 A：
  oldIndex = 0, lastPlacedIndex = 2
  0 < 2? → true ❌ A 需要移动
  lastPlacedIndex 保持 2

结果：
C: 不移动
B: Placement
A: Placement

策略的缺陷：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

如果只需要移动一个节点到最前面，
React 可能会移动其他所有节点。

例如：A B C D → D A B C
最优：移动 D（1次操作）
React：移动 A、B、C（3次操作）

但这是可接受的，因为：
1. 算法简单，时间复杂度 O(n)
2. 实际应用中，大规模移动较少
3. 追求性能的场景可以通过优化 key 来改善`}
      </pre>
    </div>
  );
}

// DOM 移动执行
function DOMMovementExecution() {
  return (
    <div style={{ background: '#fff', padding: '15px', borderRadius: '5px' }}>
      <h3>Commit 阶段的 DOM 操作</h3>
      
      <pre style={{ background: '#f5f5f5', padding: '15px', overflow: 'auto', fontSize: '13px', lineHeight: '1.8' }}>
{`// ReactFiberCommitWork.old.js line 1498-1528

function commitPlacement(finishedWork: Fiber): void {
  if (!supportsMutation) {
    return;
  }
  
  // 1️⃣ 找到父 DOM 节点
  const parentFiber = getHostParentFiber(finishedWork);
  
  switch (parentFiber.tag) {
    case HostComponent: {
      const parent: Instance = parentFiber.stateNode;  // 父 DOM 节点
      
      // 2️⃣ 找到插入位置（锚点）
      const before = getHostSibling(finishedWork);
      // before 是新节点应该插入的位置之前的那个节点
      // 如果 before === null，说明要插入到末尾
      
      // 3️⃣ 执行插入操作
      insertOrAppendPlacementNode(finishedWork, before, parent);
      break;
    }
    case HostRoot:
    case HostPortal: {
      const parent: Container = parentFiber.stateNode.containerInfo;
      const before = getHostSibling(finishedWork);
      insertOrAppendPlacementNodeIntoContainer(finishedWork, before, parent);
      break;
    }
  }
}

insertOrAppendPlacementNode 函数：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function insertOrAppendPlacementNode(
  node: Fiber,
  before: Instance | null,
  parent: Instance,
): void {
  const { tag } = node;
  const isHost = tag === HostComponent || tag === HostText;
  
  if (isHost) {
    // 如果是真实的 DOM 节点
    const stateNode = node.stateNode;
    
    if (before !== null) {
      // 🔥 有锚点，使用 insertBefore
      insertBefore(parent, stateNode, before);
      // 相当于：parent.insertBefore(stateNode, before)
    } else {
      // 🔥 没有锚点，使用 appendChild
      appendChild(parent, stateNode);
      // 相当于：parent.appendChild(stateNode)
    }
  } else if (tag === HostPortal) {
    // Portal 特殊处理
  } else {
    // 不是真实 DOM 节点，递归处理子节点
    const child = node.child;
    if (child !== null) {
      insertOrAppendPlacementNode(child, before, parent);
      let sibling = child.sibling;
      while (sibling !== null) {
        insertOrAppendPlacementNode(sibling, before, parent);
        sibling = sibling.sibling;
      }
    }
  }
}

关键点：getHostSibling 函数
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

getHostSibling 的作用：
找到当前节点在 DOM 中应该插入的位置的"下一个兄弟节点"

例如：
新 Fiber 顺序：D → A → B → C
如果要插入 A，getHostSibling 会返回 B 的 DOM 节点
然后执行：parent.insertBefore(A的DOM, B的DOM)

如果 A 是最后一个节点：
getHostSibling 返回 null
执行：parent.appendChild(A的DOM)

DOM 操作总结：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Placement 标记的节点会被移动或插入
2. 移动操作使用：
   - insertBefore(parent, node, sibling) ← 插入到 sibling 前面
   - appendChild(parent, node) ← 追加到末尾
3. insertBefore 会自动处理节点移动：
   - 如果 node 已经在 parent 中，会先移除再插入
   - 不需要手动 removeChild

完整流程示例：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

旧 DOM：<div><A/><B/><C/><D/></div>
新结构：<div><D/><A/><B/><C/></div>

Render 阶段标记：
  D: 不移动
  A: Placement
  B: Placement
  C: Placement

Commit 阶段执行：

1. 遍历到 D：没有 Placement 标记，跳过

2. 遍历到 A（有 Placement）：
   parent = div
   before = getHostSibling(A) = B 的 DOM
   执行：div.insertBefore(A的DOM, B的DOM)
   结果：<div><D/><A/><B/><C/></div>
   
   等等，A 已经在正确位置了？
   这是因为 A 原本在 B 前面，
   insertBefore 会先移除 A，再插入到 B 前面
   
   实际操作：
   - 原始：D B C A
   - 移除 A：D B C
   - 插入 A 到 B 前：D A B C ✅

3. 遍历到 B（有 Placement）：
   before = getHostSibling(B) = C 的 DOM
   执行：div.insertBefore(B的DOM, C的DOM)
   B 已经在 C 前面，不需要实际移动

4. 遍历到 C（有 Placement）：
   before = getHostSibling(C) = null
   执行：div.appendChild(C的DOM)
   C 已经在末尾，不需要实际移动

最终结果：<div><D/><A/><B/><C/></div> ✅`}
      </pre>
    </div>
  );
}

// 案例分析
function CaseStudy() {
  return (
    <div style={{ background: '#fff', padding: '15px', borderRadius: '5px' }}>
      <h3>完整案例：节点移动全流程</h3>
      
      <pre style={{ background: '#f5f5f5', padding: '15px', overflow: 'auto', fontSize: '13px', lineHeight: '1.8' }}>
{`案例：列表项移动
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

初始状态：
<ul>
  <li key="a">Apple</li>   // index: 0
  <li key="b">Banana</li>  // index: 1
  <li key="c">Cherry</li>  // index: 2
  <li key="d">Date</li>    // index: 3
</ul>

更新后：
<ul>
  <li key="c">Cherry</li>  // 移到第一个
  <li key="a">Apple</li>
  <li key="b">Banana</li>
  <li key="d">Date</li>
</ul>

Render 阶段 - Diff 过程：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

初始：
  旧 Fiber 链表：a(0) → b(1) → c(2) → d(3)
  新 ReactElement 数组：[c, a, b, d]
  lastPlacedIndex = 0

第 1 轮：处理 c
  newIndex = 0
  在旧列表中找到 c，oldIndex = 2
  
  判断：oldIndex (2) < lastPlacedIndex (0)?
        2 < 0 → false ✅
  
  操作：useFiber(c) 复用 c 的 Fiber
  标记：无 Placement
  更新：lastPlacedIndex = 2
  
第 2 轮：处理 a
  newIndex = 1
  在旧列表中找到 a，oldIndex = 0
  
  判断：oldIndex (0) < lastPlacedIndex (2)?
        0 < 2 → true ❌
  
  操作：useFiber(a) 复用 a 的 Fiber
  标记：a.flags |= Placement
  更新：lastPlacedIndex 保持 2

第 3 轮：处理 b
  newIndex = 2
  在旧列表中找到 b，oldIndex = 1
  
  判断：oldIndex (1) < lastPlacedIndex (2)?
        1 < 2 → true ❌
  
  操作：useFiber(b) 复用 b 的 Fiber
  标记：b.flags |= Placement
  更新：lastPlacedIndex 保持 2

第 4 轮：处理 d
  newIndex = 3
  在旧列表中找到 d，oldIndex = 3
  
  判断：oldIndex (3) < lastPlacedIndex (2)?
        3 < 2 → false ✅
  
  操作：useFiber(d) 复用 d 的 Fiber
  标记：无 Placement
  更新：lastPlacedIndex = 3

Render 阶段结果：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

新 Fiber 链表：c → a → b → d
                   ↑   ↑
            Placement Placement

c: 不需要移动
a: 需要移动（Placement）
b: 需要移动（Placement）
d: 不需要移动

Commit 阶段 - DOM 操作：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

commitMutationEffects 遍历 Fiber 树：

1. 处理 c：
   无 Placement 标记，跳过

2. 处理 a（有 Placement）：
   调用 commitPlacement(a)
   
   parent = ul
   before = getHostSibling(a)
          = b 的 DOM（a 的下一个兄弟）
   
   执行：ul.insertBefore(a的DOM, b的DOM)
   
   DOM 变化：
   之前：<ul><c/><b/><d/><a/></ul>
   之后：<ul><c/><a/><b/><d/></ul> ✅

3. 处理 b（有 Placement）：
   调用 commitPlacement(b)
   
   parent = ul
   before = getHostSibling(b)
          = d 的 DOM（b 的下一个兄弟）
   
   执行：ul.insertBefore(b的DOM, d的DOM)
   
   b 已经在 d 前面，实际不需要移动
   但 insertBefore 仍会执行（幂等操作）

4. 处理 d：
   无 Placement 标记，跳过

最终 DOM：
<ul>
  <li key="c">Cherry</li>  ✅
  <li key="a">Apple</li>   ✅
  <li key="b">Banana</li>  ✅
  <li key="d">Date</li>    ✅
</ul>

性能分析：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DOM 操作次数：
- insertBefore 调用 2 次（a 和 b）
- 虽然 b 的 insertBefore 是冗余的，但操作开销很小

最优方案：
- 只移动 c 到最前面（1 次操作）

React 方案：
- 移动 a 和 b（2 次操作）
- 多了 1 次操作，但算法简单，O(n) 复杂度

为什么 React 这样设计？
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. 简单性：算法实现简单，易于维护
2. 时间复杂度：O(n) 线性时间
3. 实际场景：大多数情况下，移动操作不多
4. 可优化：通过合理的 key 设计可以改善性能
5. 权衡：简单高效 > 绝对最优`}
      </pre>
    </div>
  );
}

// 交互演示
function InteractiveDemo() {
  const [items, setItems] = useState([
    { id: 'a', name: 'Apple', oldIndex: 0 },
    { id: 'b', name: 'Banana', oldIndex: 1 },
    { id: 'c', name: 'Cherry', oldIndex: 2 },
    { id: 'd', name: 'Date', oldIndex: 3 }
  ]);
  
  const [diffSteps, setDiffSteps] = useState([]);
  
  const moveToFirst = (index) => {
    const newItems = [...items];
    const [item] = newItems.splice(index, 1);
    newItems.unshift(item);
    
    // 模拟 Diff 过程
    const steps = [];
    let lastPlacedIndex = 0;
    
    newItems.forEach((newItem, newIdx) => {
      const oldIndex = items.findIndex(i => i.id === newItem.id);
      const needsMove = oldIndex < lastPlacedIndex;
      
      steps.push({
        item: newItem.name,
        newIndex: newIdx,
        oldIndex: oldIndex,
        lastPlacedIndex: lastPlacedIndex,
        needsMove: needsMove
      });
      
      if (!needsMove) {
        lastPlacedIndex = oldIndex;
      }
    });
    
    setDiffSteps(steps);
    
    // 更新 oldIndex
    newItems.forEach((item, idx) => {
      item.oldIndex = items.findIndex(i => i.id === item.id);
    });
    
    setItems(newItems);
  };
  
  const reset = () => {
    setItems([
      { id: 'a', name: 'Apple', oldIndex: 0 },
      { id: 'b', name: 'Banana', oldIndex: 1 },
      { id: 'c', name: 'Cherry', oldIndex: 2 },
      { id: 'd', name: 'Date', oldIndex: 3 }
    ]);
    setDiffSteps([]);
  };
  
  return (
    <div style={{ background: '#fff', padding: '15px', borderRadius: '5px' }}>
      <h3>交互式 Diff 演示</h3>
      
      {/* 当前列表 */}
      <div style={{ marginBottom: '20px', padding: '15px', background: '#f5f5f5', borderRadius: '5px' }}>
        <h4>当前列表：</h4>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', flexWrap: 'wrap' }}>
          {items.map((item, index) => (
            <div key={item.id} style={{
              padding: '10px 15px',
              background: '#2196f3',
              color: '#fff',
              borderRadius: '5px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              minWidth: '100px'
            }}>
              <div style={{ fontWeight: 'bold' }}>{item.name}</div>
              <div style={{ fontSize: '12px', marginTop: '5px' }}>
                old: {item.oldIndex}, new: {index}
              </div>
            </div>
          ))}
        </div>
        
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {items.map((item, index) => (
            <button
              key={item.id}
              onClick={() => moveToFirst(index)}
              style={{
                padding: '8px 15px',
                fontSize: '13px',
                cursor: 'pointer',
                background: '#4caf50',
                color: '#fff',
                border: 'none',
                borderRadius: '5px'
              }}
            >
              移动 {item.name} 到最前
            </button>
          ))}
          <button
            onClick={reset}
            style={{
              padding: '8px 15px',
              fontSize: '13px',
              cursor: 'pointer',
              background: '#f44336',
              color: '#fff',
              border: 'none',
              borderRadius: '5px'
            }}
          >
            重置
          </button>
        </div>
      </div>
      
      {/* Diff 步骤 */}
      {diffSteps.length > 0 && (
        <div style={{ padding: '15px', background: '#e3f2fd', borderRadius: '5px' }}>
          <h4>Diff 过程分析：</h4>
          <div style={{ fontSize: '13px' }}>
            {diffSteps.map((step, index) => (
              <div key={index} style={{
                marginBottom: '10px',
                padding: '10px',
                background: step.needsMove ? '#ffebee' : '#e8f5e9',
                borderRadius: '5px',
                border: `2px solid ${step.needsMove ? '#f44336' : '#4caf50'}`
              }}>
                <strong>第 {index + 1} 步：{step.item}</strong>
                <pre style={{ margin: '5px 0 0 0', fontSize: '12px', lineHeight: '1.6' }}>
{`newIndex: ${step.newIndex}, oldIndex: ${step.oldIndex}
lastPlacedIndex: ${step.lastPlacedIndex}

判断：oldIndex (${step.oldIndex}) < lastPlacedIndex (${step.lastPlacedIndex})?
      ${step.oldIndex} < ${step.lastPlacedIndex} → ${step.needsMove}

${step.needsMove ? '❌ 需要移动（Placement）' : '✅ 不需要移动'}`}
                </pre>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// 总结
function Summary() {
  return (
    <div style={{ background: '#fff', padding: '15px', borderRadius: '5px' }}>
      <h3>核心要点总结</h3>
      
      <div style={{ background: '#e3f2fd', padding: '15px', marginBottom: '15px', borderRadius: '5px' }}>
        <h4>🏷️ Placement 标记（Render 阶段）</h4>
        <ul style={{ fontSize: '14px', lineHeight: '1.8', margin: '10px 0' }}>
          <li>在 <code>reconcileChildrenArray</code> 的 <code>placeChild</code> 函数中判定</li>
          <li>核心逻辑：<code>if (oldIndex &lt; lastPlacedIndex)</code> → 需要移动</li>
          <li><code>lastPlacedIndex</code> 追踪"最后一个不需要移动的节点"的旧索引</li>
          <li>标记：<code>newFiber.flags |= Placement</code></li>
        </ul>
      </div>
      
      <div style={{ background: '#e8f5e9', padding: '15px', marginBottom: '15px', borderRadius: '5px' }}>
        <h4>⚙️ DOM 移动（Commit 阶段）</h4>
        <ul style={{ fontSize: '14px', lineHeight: '1.8', margin: '10px 0' }}>
          <li>在 <code>commitMutationEffects</code> 中调用 <code>commitPlacement</code></li>
          <li>找到父 DOM 节点和插入位置（<code>getHostSibling</code>）</li>
          <li>使用 <code>insertBefore</code> 或 <code>appendChild</code> 执行 DOM 操作</li>
          <li><code>insertBefore</code> 会自动处理节点移除和重新插入</li>
        </ul>
      </div>
      
      <div style={{ background: '#fff9c4', padding: '15px', marginBottom: '15px', borderRadius: '5px' }}>
        <h4>📊 移动策略</h4>
        <ul style={{ fontSize: '14px', lineHeight: '1.8', margin: '10px 0' }}>
          <li><strong>向右移动策略：</strong>只移动需要向右的节点</li>
          <li><strong>判断依据：</strong>oldIndex &lt; lastPlacedIndex</li>
          <li><strong>优点：</strong>算法简单，O(n) 时间复杂度</li>
          <li><strong>缺点：</strong>可能不是最优移动方案</li>
        </ul>
      </div>
      
      <div style={{ background: '#ffebee', padding: '15px', borderRadius: '5px' }}>
        <h4>⚠️ 注意事项</h4>
        <ul style={{ fontSize: '14px', lineHeight: '1.8', margin: '10px 0' }}>
          <li>合理使用 <code>key</code> 属性以优化性能</li>
          <li>避免用索引作为 <code>key</code>（除非列表完全静态）</li>
          <li>理解 React 的移动策略，避免不必要的大规模重排</li>
          <li><code>insertBefore</code> 操作本身开销不大，多几次调用影响有限</li>
        </ul>
      </div>
    </div>
  );
}
