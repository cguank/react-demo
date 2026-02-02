import React, { useState } from 'react';

/**
 * Commit 阶段是否使用 Index？
 * 
 * 核心问题：
 * 1. Placement 标记后，Commit 阶段还用 index 吗？
 * 2. 如何确定插入位置？
 * 3. Index 的真正作用是什么？
 */

export default function CommitPhaseIndexUsageAnalysis() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🔍 Commit 阶段是否使用 Index？</h1>
      
      {/* 核心答案 */}
      <div style={{ background: '#fff3e0', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>✅ 核心答案</h2>
        <CoreAnswer />
      </div>

      {/* Commit 阶段的逻辑 */}
      <div style={{ background: '#e3f2fd', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>⚙️ Commit 阶段如何确定位置</h2>
        <CommitPhaseLogic />
      </div>

      {/* Index 的真正作用 */}
      <div style={{ background: '#e8f5e9', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>📍 Index 的真正作用</h2>
        <IndexRealPurpose />
      </div>

      {/* 源码验证 */}
      <div style={{ background: '#f3e5f5', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>🔬 源码验证</h2>
        <SourceCodeVerification />
      </div>

      {/* 完整流程 */}
      <div style={{ background: '#fce4ec', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>📊 完整流程对比</h2>
        <CompleteFlowComparison />
      </div>

      {/* 总结 */}
      <div style={{ background: '#e0f2f1', padding: '20px', borderRadius: '8px' }}>
        <h2>📝 总结</h2>
        <Summary />
      </div>
    </div>
  );
}

// 核心答案
function CoreAnswer() {
  return (
    <div style={{ background: '#fff', padding: '15px', borderRadius: '5px' }}>
      <h3>简短答案</h3>
      
      <div style={{ background: '#c8e6c9', padding: '15px', marginBottom: '15px', borderRadius: '5px' }}>
        <h4 style={{ marginTop: 0, color: '#2e7d32' }}>💡 是的，Commit 阶段基本不使用 Index！</h4>
        <p style={{ fontSize: '15px', lineHeight: '1.8', margin: '10px 0' }}>
          Commit 阶段主要通过 <strong>Fiber 树的链表结构</strong>（sibling、child、return 指针）来确定插入位置，
          而不是通过 index 数字。
        </p>
      </div>
      
      <pre style={{ background: '#f5f5f5', padding: '15px', fontSize: '14px', lineHeight: '1.8' }}>
{`关键理解：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Render 阶段（设置 index）：
  placeChild(newFiber, lastPlacedIndex, newIndex) {
    newFiber.index = newIndex;  // 设置 index
    // ... 判断是否需要 Placement
  }
  
  作用：
  ✅ 设置 Fiber.index，记录在父节点子列表中的位置
  ✅ 为下次更新准备（成为 oldIndex）
  ✅ 维护 Fiber 节点的完整数据

Commit 阶段（不使用 index）：
  commitPlacement(finishedWork) {
    const parent = getHostParent(finishedWork);
    const before = getHostSibling(finishedWork);  // ← 关键！
    
    if (before !== null) {
      parent.insertBefore(node, before);
    } else {
      parent.appendChild(node);
    }
  }
  
  关键：
  ❌ 不使用 finishedWork.index
  ✅ 使用 getHostSibling 通过 sibling 链表找位置
  ✅ 使用 Fiber 树的结构关系

为什么不用 index？
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Fiber 树已经是正确的顺序
   - Render 阶段已经构建好了新的 Fiber 链表
   - 通过 sibling 指针遍历，顺序就是正确的

2. Index 只是一个数字
   - 无法直接定位到 DOM 节点
   - 需要额外的数据结构维护 index → DOM 的映射

3. Fiber 链表更直接
   - fiber.sibling 直接指向下一个节点
   - 不需要通过 index 查找

Index 的真正作用：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ 在下次更新时作为 oldIndex 使用（Diff 判断）
✅ 在某些边缘场景使用（如 hydration）
✅ 保持 Fiber 节点数据的完整性
❌ 不在 Commit 阶段直接用于定位插入位置`}
      </pre>
    </div>
  );
}

// Commit 阶段逻辑
function CommitPhaseLogic() {
  return (
    <div style={{ background: '#fff', padding: '15px', borderRadius: '5px' }}>
      <h3>Commit 阶段如何确定插入位置</h3>
      
      <pre style={{ background: '#f5f5f5', padding: '15px', overflow: 'auto', fontSize: '13px', lineHeight: '1.8' }}>
{`Commit 阶段的插入逻辑（不使用 index）：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. 遍历 Fiber 树
   commitMutationEffects 按照 Fiber 树的结构遍历：
   
   function commitMutationEffects(root, finishedWork) {
     // 递归遍历 Fiber 树
     recursivelyTraverseMutationEffects(root, finishedWork);
     commitMutationEffectsOnFiber(finishedWork, root);
   }
   
   遍历顺序：
   - 先处理 child（深度优先）
   - 再处理 sibling（广度）
   - 使用 fiber.child 和 fiber.sibling 指针

2. 处理 Placement 节点
   if (flags & Placement) {
     commitPlacement(finishedWork);  // ← 不传入 index
   }

3. getHostSibling 找插入位置
   function getHostSibling(fiber) {
     let node = fiber;
     
     // 🔥 通过 sibling 指针遍历，不使用 index
     siblings: while (true) {
       while (node.sibling === null) {
         if (node.return === null) {
           return null;
         }
         node = node.return;  // 向上找
       }
       
       node = node.sibling;  // 🔥 使用 sibling 指针
       
       // 跳过 Placement 节点
       while (/* 不是 Host 节点或有 Placement */) {
         if (node.flags & Placement) {
           continue siblings;
         }
         // ...
       }
       
       // 找到稳定的 Host 节点
       if (!(node.flags & Placement)) {
         return node.stateNode;  // 返回 DOM 节点
       }
     }
   }
   
   关键：
   - 使用 node.sibling 遍历
   - 使用 node.return 向上查找
   - 使用 node.stateNode 获取 DOM
   - ❌ 完全不使用 node.index

4. 执行 DOM 插入
   const before = getHostSibling(finishedWork);
   
   if (before !== null) {
     parent.insertBefore(node, before);  // 插入到 before 前面
   } else {
     parent.appendChild(node);  // 追加到末尾
   }

为什么这样可行？
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

因为 Render 阶段已经构建好了正确顺序的 Fiber 链表：

Render 阶段结果：
  Fiber 链表：C → A → B → D → E
  (通过 sibling 指针连接)

Commit 阶段遍历：
  按照 sibling 链表顺序遍历
  → C（处理）
  → A（处理，有 Placement，调用 commitPlacement）
  → B（处理，有 Placement，调用 commitPlacement）
  → D（处理）
  → E（处理）

每个节点处理时：
  - 通过 getHostSibling 找到下一个稳定的兄弟节点
  - 这个兄弟节点就是正确的插入位置

顺序保证：
  Fiber 链表的顺序 = 最终 DOM 的顺序
  不需要通过 index 来确定顺序！

实例：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Fiber 链表：C(0) → A(1,P) → B(2,P) → D(3) → E(4)
           ↑        ↑        ↑        ↑       ↑
         index    index    index    index   index
         设置了   设置了   设置了   设置了  设置了
         但不用！ 但不用！ 但不用！ 但不用！但不用！

Commit 阶段：
  处理 C：无 Placement，跳过
  处理 A：
    getHostSibling(A):
      A.sibling = B（有 Placement，跳过）
      B.sibling = D（无 Placement ✅）
      返回 D 的 DOM
    insertBefore(A的DOM, D的DOM)
    ↑
    没有使用 A.index (1)
    只用了 A.sibling 指针
  
  处理 B：
    getHostSibling(B):
      B.sibling = D（无 Placement ✅）
      返回 D 的 DOM
    insertBefore(B的DOM, D的DOM)
    ↑
    没有使用 B.index (2)
    只用了 B.sibling 指针

结果：C A B D E ✅

总结：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Commit 阶段完全依赖 Fiber 树的链表结构：
✅ fiber.sibling - 找下一个兄弟
✅ fiber.child - 找子节点
✅ fiber.return - 找父节点
✅ fiber.stateNode - 找 DOM 节点
❌ fiber.index - 不使用！`}
      </pre>
    </div>
  );
}

// Index 真正作用
function IndexRealPurpose() {
  return (
    <div style={{ background: '#fff', padding: '15px', borderRadius: '5px' }}>
      <h3>Index 的真正作用</h3>
      
      <pre style={{ background: '#f5f5f5', padding: '15px', overflow: 'auto', fontSize: '13px', lineHeight: '1.8' }}>
{`Index 的主要作用（不在 Commit 阶段）：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1️⃣ 在下次更新时作为 oldIndex 使用
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

首次渲染：
  placeChild(A, 0, 1) → A.index = 1

下次更新：
  updateSlot() {
    const oldIndex = current.index;  // 1 ← 使用上次设置的 index
    if (oldIndex < lastPlacedIndex) {
      // 判断是否需要移动
    }
  }

这是 index 最重要的作用：
在 Diff 算法中，判断节点是否需要移动。

2️⃣ 在 Hydration 场景使用
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

服务端渲染时，需要将 Fiber 节点与已有的 DOM 节点匹配：

function tryHydrate(fiber, nextInstance) {
  // 使用 index 来验证 DOM 节点的顺序
  const expectedIndex = fiber.index;
  // ...
}

在某些 hydration 相关的函数中会检查 index。

3️⃣ 保持 Fiber 节点数据完整性
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Fiber 节点需要维护完整的结构信息：

type Fiber = {
  tag: WorkTag,
  key: null | string,
  elementType: any,
  type: any,
  stateNode: any,
  
  return: Fiber | null,
  child: Fiber | null,
  sibling: Fiber | null,
  index: number,  // ← 必需的属性
  
  // ...
}

即使 Commit 阶段不用，index 也是 Fiber 结构的一部分。

4️⃣ DevTools 和调试
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

React DevTools 可能使用 index 来显示组件在列表中的位置。

Index 不用于 Commit 阶段的原因：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Fiber 链表已经是正确顺序
   - Render 阶段构建的 Fiber 链表就是最终顺序
   - 通过 sibling 遍历即可

2. Index 无法直接定位 DOM
   - Index 只是一个数字
   - 需要额外的 index → DOM 映射
   - 维护这个映射没有必要

3. Sibling 指针更高效
   - O(1) 访问下一个节点
   - 不需要查找或计算

4. 设计简洁
   - 一个数据结构（Fiber 链表）解决所有问题
   - 不需要额外的索引结构

对比：如果使用 Index
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

假设 Commit 阶段用 index：

commitPlacement(finishedWork) {
  const parent = getHostParent(finishedWork);
  const targetIndex = finishedWork.index;  // 目标位置
  
  // 需要维护一个 index → DOM 的映射
  const children = Array.from(parent.children);
  const beforeNode = children[targetIndex];
  
  if (beforeNode) {
    parent.insertBefore(node, beforeNode);
  } else {
    parent.appendChild(node);
  }
}

问题：
1. 需要额外维护 index → DOM 映射
2. 每次插入都要转换 children 为数组
3. 性能开销更大
4. 代码更复杂

实际做法（使用 sibling）：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

commitPlacement(finishedWork) {
  const parent = getHostParent(finishedWork);
  const before = getHostSibling(finishedWork);  // 通过 sibling 找
  
  if (before !== null) {
    parent.insertBefore(node, before);
  } else {
    parent.appendChild(node);
  }
}

优势：
✅ 直接使用 Fiber 链表结构
✅ O(1) 访问 sibling
✅ 不需要额外数据结构
✅ 代码简洁清晰

总结：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Index 的作用：
✅ Render 阶段：设置，为下次 Diff 准备
✅ 下次更新：作为 oldIndex，判断是否移动
✅ Hydration：验证 DOM 顺序
✅ 数据完整性：Fiber 节点的必需属性
❌ Commit 阶段：基本不使用，用 sibling 链表代替`}
      </pre>
    </div>
  );
}

// 源码验证
function SourceCodeVerification() {
  return (
    <div style={{ background: '#fff', padding: '15px', borderRadius: '5px' }}>
      <h3>源码验证：Commit 阶段不使用 Index</h3>
      
      <pre style={{ background: '#f5f5f5', padding: '15px', overflow: 'auto', fontSize: '13px', lineHeight: '1.8' }}>
{`commitPlacement 函数（完全不使用 index）：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ReactFiberCommitWork.old.js line 1498-1528

function commitPlacement(finishedWork: Fiber): void {
  if (!supportsMutation) {
    return;
  }
  
  // 1. 找父 DOM 节点
  const parentFiber = getHostParentFiber(finishedWork);
  // ❌ 没有使用 finishedWork.index
  
  switch (parentFiber.tag) {
    case HostComponent: {
      const parent: Instance = parentFiber.stateNode;
      
      // 2. 找插入位置
      const before = getHostSibling(finishedWork);
      // ❌ getHostSibling 也不使用 index
      
      // 3. 插入节点
      insertOrAppendPlacementNode(finishedWork, before, parent);
      // ❌ insertOrAppendPlacementNode 也不使用 index
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

getHostSibling 函数（使用 sibling，不使用 index）：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function getHostSibling(fiber: Fiber): Instance | null {
  let node: Fiber = fiber;
  
  siblings: while (true) {
    // 向上找到有 sibling 的节点
    while (node.sibling === null) {
      // ❌ 不使用 node.index
      if (node.return === null || isHostParent(node.return)) {
        return null;
      }
      node = node.return;  // ✅ 使用 return 指针
    }
    
    node.sibling.return = node.return;
    node = node.sibling;  // ✅ 使用 sibling 指针
    // ❌ 完全不涉及 index
    
    // 跳过非 Host 节点和 Placement 节点
    while (
      node.tag !== HostComponent &&
      node.tag !== HostText &&
      node.tag !== DehydratedFragment
    ) {
      if (node.flags & Placement) {
        continue siblings;  // ✅ 检查 flags
        // ❌ 不检查 index
      }
      
      if (node.child === null || node.tag === HostPortal) {
        continue siblings;
      } else {
        node.child.return = node;
        node = node.child;  // ✅ 使用 child 指针
      }
    }
    
    if (!(node.flags & Placement)) {
      return node.stateNode;  // ✅ 返回 DOM 节点
      // ❌ 不返回 index
    }
  }
}

insertOrAppendPlacementNode 函数（不使用 index）：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function insertOrAppendPlacementNode(
  node: Fiber,
  before: Instance | null,
  parent: Instance,
): void {
  const { tag } = node;
  const isHost = tag === HostComponent || tag === HostText;
  
  if (isHost) {
    const stateNode = node.stateNode;
    // ❌ 不使用 node.index
    
    if (before !== null) {
      insertBefore(parent, stateNode, before);
      // ✅ 直接使用 DOM API
    } else {
      appendChild(parent, stateNode);
    }
  } else if (tag === HostPortal) {
    // Portal 特殊处理
  } else {
    // 递归处理子节点
    const child = node.child;
    if (child !== null) {
      insertOrAppendPlacementNode(child, before, parent);
      let sibling = child.sibling;  // ✅ 使用 sibling 指针
      while (sibling !== null) {
        insertOrAppendPlacementNode(sibling, before, parent);
        sibling = sibling.sibling;  // ✅ 遍历 sibling
        // ❌ 不使用 index
      }
    }
  }
}

验证结论：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

在 Commit 阶段的所有关键函数中：
✅ commitPlacement - 不使用 index
✅ getHostSibling - 不使用 index
✅ insertOrAppendPlacementNode - 不使用 index

只使用：
✅ fiber.sibling - 兄弟节点指针
✅ fiber.child - 子节点指针
✅ fiber.return - 父节点指针
✅ fiber.stateNode - DOM 节点引用
✅ fiber.flags - 副作用标记
❌ fiber.index - 完全不使用！

Index 在哪里使用？
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

搜索源码中 .index 的使用：

1. Render 阶段（ReactChildFiber.old.js）:
   - placeChild: newFiber.index = newIndex ← 设置
   - updateSlot: const oldIndex = current.index ← 读取用于 Diff
   - mapRemainingChildren: 构建 key → fiber 的 Map

2. Hydration（ReactFiberHydrationContext.js）:
   - tryHydrate: 验证 DOM 顺序

3. DevTools 相关代码

4. ❌ Commit 阶段（ReactFiberCommitWork.old.js）:
   搜索结果：0 次使用 .index！`}
      </pre>
    </div>
  );
}

// 完整流程对比
function CompleteFlowComparison() {
  return (
    <div style={{ background: '#fff', padding: '15px', borderRadius: '5px' }}>
      <h3>完整流程：Index 在各阶段的使用</h3>
      
      <pre style={{ background: '#f5f5f5', padding: '15px', overflow: 'auto', fontSize: '13px', lineHeight: '1.8' }}>
{`完整案例：A B C D → C A B D
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

阶段 1: Render 阶段 - 使用 Index
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

reconcileChildrenArray():
  新children: [C, A, B, D]
  旧fiber链表: A(0) → B(1) → C(2) → D(3)
  
  lastPlacedIndex = 0
  
  处理 C:
    placeChild(C, 0, 0)
    → C.index = 0  ✅ 设置 index
    oldIndex = 2
    2 < 0? no
    lastPlacedIndex = 2
  
  处理 A:
    placeChild(A, 2, 1)
    → A.index = 1  ✅ 设置 index
    oldIndex = 0
    0 < 2? yes
    → A.flags |= Placement
    lastPlacedIndex = 2
  
  处理 B:
    placeChild(B, 2, 2)
    → B.index = 2  ✅ 设置 index
    oldIndex = 1
    1 < 2? yes
    → B.flags |= Placement
    lastPlacedIndex = 2
  
  处理 D:
    placeChild(D, 2, 3)
    → D.index = 3  ✅ 设置 index
    oldIndex = 3
    3 < 2? no
    lastPlacedIndex = 3

结果 Fiber 链表:
  C(0) → A(1,P) → B(2,P) → D(3)
  ↑       ↑        ↑        ↑
index  index    index    index
都设置了，但只在这个阶段使用！

阶段 2: Commit 阶段 - 不使用 Index
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

commitMutationEffects():
  遍历 Fiber 树（使用 sibling 指针）
  
  遍历到 C:
    C.flags & Placement? no
    跳过
    ❌ 不看 C.index (0)
  
  遍历到 A (有 Placement):
    调用 commitPlacement(A)
    
    getHostSibling(A):
      node = A
      node.sibling = B  ✅ 使用 sibling 指针
      ❌ 不使用 A.index (1)
      
      B.flags & Placement? yes，跳过
      
      node = B
      node.sibling = D  ✅ 使用 sibling 指针
      ❌ 不使用 B.index (2)
      
      D.flags & Placement? no ✅
      return D.stateNode
    
    insertBefore(A的DOM, D的DOM)
    ❌ 整个过程不使用 index
  
  遍历到 B (有 Placement):
    调用 commitPlacement(B)
    
    getHostSibling(B):
      node = B
      node.sibling = D  ✅ 使用 sibling 指针
      ❌ 不使用 B.index (2)
      
      D.flags & Placement? no ✅
      return D.stateNode
    
    insertBefore(B的DOM, D的DOM)
    ❌ 整个过程不使用 index
  
  遍历到 D:
    D.flags & Placement? no
    跳过
    ❌ 不看 D.index (3)

最终 DOM: C A B D ✅

阶段 3: 下次更新 - 再次使用 Index
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

假设下次更新: C A B D → D C A B

新children: [D, C, A, B]
旧fiber链表: C(0) → A(1) → B(2) → D(3)
             ↑       ↑       ↑       ↑
           这些是上次设置的 index
           现在作为 oldIndex 使用！

lastPlacedIndex = 0

处理 D:
  current = D的旧fiber
  oldIndex = current.index = 3  ✅ 使用 index
  newIndex = 0
  D.index = 0  ✅ 设置新 index
  3 < 0? no
  lastPlacedIndex = 3

处理 C:
  current = C的旧fiber
  oldIndex = current.index = 0  ✅ 使用 index
  newIndex = 1
  C.index = 1  ✅ 设置新 index
  0 < 3? yes
  → C.flags |= Placement

... 依此类推

总结各阶段：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Render 阶段:
  ✅ 设置 newFiber.index = newIndex
  ✅ 读取 current.index 作为 oldIndex
  ✅ 用于 Diff 判断（oldIndex < lastPlacedIndex）

Commit 阶段:
  ❌ 完全不使用 fiber.index
  ✅ 使用 fiber.sibling 遍历
  ✅ 使用 fiber.child 向下
  ✅ 使用 fiber.return 向上
  ✅ 使用 fiber.stateNode 获取 DOM

下次更新:
  ✅ 上次的 index 成为 oldIndex
  ✅ 用于判断是否需要移动
  ✅ 设置新的 index

关键理解:
  Index 是为"下次更新"服务的，不是为"当前 Commit"服务的！`}
      </pre>
    </div>
  );
}

// 总结
function Summary() {
  return (
    <div style={{ background: '#fff', padding: '15px', borderRadius: '5px' }}>
      <h3>核心要点总结</h3>
      
      <div style={{ background: '#e3f2fd', padding: '15px', marginBottom: '15px', borderRadius: '5px' }}>
        <h4>✅ 是的，Commit 阶段基本不使用 Index</h4>
        <ul style={{ fontSize: '14px', lineHeight: '1.8', margin: '10px 0' }}>
          <li>Commit 阶段通过 <strong>Fiber 树的链表结构</strong> 确定插入位置</li>
          <li>使用 <code>fiber.sibling</code>、<code>fiber.child</code>、<code>fiber.return</code> 指针</li>
          <li><code>getHostSibling</code> 不使用 index，只用 sibling 遍历</li>
          <li><code>commitPlacement</code> 不使用 index，只用 DOM API</li>
        </ul>
      </div>
      
      <div style={{ background: '#e8f5e9', padding: '15px', marginBottom: '15px', borderRadius: '5px' }}>
        <h4>📍 Index 的真正作用</h4>
        <ol style={{ fontSize: '14px', lineHeight: '1.8', margin: '10px 0' }}>
          <li><strong>Render 阶段设置：</strong><code>newFiber.index = newIndex</code></li>
          <li><strong>下次更新使用：</strong>作为 <code>oldIndex</code>，判断是否需要移动</li>
          <li><strong>Diff 算法：</strong><code>if (oldIndex &lt; lastPlacedIndex)</code> 判断</li>
          <li><strong>数据完整性：</strong>Fiber 节点的必需属性</li>
          <li><strong>Hydration：</strong>服务端渲染场景使用</li>
        </ol>
      </div>
      
      <div style={{ background: '#fff9c4', padding: '15px', marginBottom: '15px', borderRadius: '5px' }}>
        <h4>🔄 为什么不用 Index？</h4>
        <ul style={{ fontSize: '14px', lineHeight: '1.8', margin: '10px 0' }}>
          <li><strong>Fiber 链表已经是正确顺序：</strong>Render 阶段构建好了</li>
          <li><strong>Sibling 指针更直接：</strong>O(1) 访问下一个节点</li>
          <li><strong>不需要额外映射：</strong>index → DOM 的映射没必要</li>
          <li><strong>设计简洁：</strong>一个链表结构解决所有问题</li>
        </ul>
      </div>
      
      <div style={{ background: '#e0f2f1', padding: '15px', borderRadius: '5px' }}>
        <h4>💡 关键理解</h4>
        <pre style={{ background: '#fff', padding: '10px', fontSize: '13px', margin: '10px 0' }}>
{`Index 是为"下次更新"服务的，不是为"当前 Commit"服务的！

Render 阶段：
  设置 index → 为下次 Diff 准备

Commit 阶段：
  用 sibling 链表 → 确定插入位置

下次更新：
  用上次的 index → 判断是否移动`}
        </pre>
      </div>
    </div>
  );
}
