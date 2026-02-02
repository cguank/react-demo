import React, { useState } from 'react';

/**
 * Commit 阶段 DOM 操作会导致排序混乱吗？
 * 
 * 核心问题：
 * 1. Commit 阶段是直接操作 DOM 的吗？
 * 2. 移动 DOM 后，会影响后续节点的处理吗？
 * 3. 是读取 DOM 的位置还是 Fiber 的位置？
 */

export default function CommitDOMOperationOrderAnalysis() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🎯 Commit 阶段 DOM 操作不会导致混乱</h1>
      
      {/* 核心答案 */}
      <div style={{ background: '#fff3e0', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>✅ 核心答案</h2>
        <CoreAnswer />
      </div>

      {/* 关键原理 */}
      <div style={{ background: '#e3f2fd', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>🔑 关键原理</h2>
        <KeyPrinciple />
      </div>

      {/* 遍历机制 */}
      <div style={{ background: '#e8f5e9', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>🔄 Fiber 链表遍历机制</h2>
        <FiberTraversalMechanism />
      </div>

      {/* 完整案例 */}
      <div style={{ background: '#f3e5f5', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>📊 完整案例分析</h2>
        <CompleteExample />
      </div>

      {/* 可视化演示 */}
      <div style={{ background: '#fff9c4', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>🎮 可视化演示</h2>
        <VisualDemo />
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
      <h3>关键理解</h3>
      
      <div style={{ background: '#c8e6c9', padding: '15px', marginBottom: '15px', borderRadius: '5px' }}>
        <h4 style={{ marginTop: 0, color: '#2e7d32' }}>💡 不会混乱！</h4>
        <p style={{ fontSize: '15px', lineHeight: '1.8', margin: '10px 0' }}>
          <strong>Commit 阶段确实直接操作 DOM，但读取的是 Fiber 链表的位置，不是 DOM 的位置！</strong>
        </p>
      </div>
      
      <pre style={{ background: '#f5f5f5', padding: '15px', fontSize: '14px', lineHeight: '1.8' }}>
{`问题分析：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Q1: Commit 阶段是对 DOM 操作吗？
A1: ✅ 是的！Commit 阶段直接调用 DOM API
    - insertBefore(parent, node, before)
    - appendChild(parent, node)
    - removeChild(parent, node)

Q2: 移动 DOM 后，会影响后续节点吗？
A2: ❌ 不会！因为：
    1. 遍历的是 Fiber 链表，不是 DOM 树
    2. Fiber 链表在 Render 阶段就构建好了
    3. 不会因为 DOM 变化而改变

Q3: 读取的是 Fiber 还是 DOM 的位置？
A3: ✅ 读取 Fiber 的位置！
    - getHostSibling 遍历 Fiber.sibling
    - 不会去查询 DOM 的 children
    - DOM 的变化不影响 Fiber 链表

核心原理：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Fiber 链表 (内存中，不变) ← 遍历依据
    ↓
commitMutationEffects 按 Fiber 链表遍历
    ↓
对每个节点执行 DOM 操作
    ↓
DOM 树 (浏览器中，会变) ← 只是操作目标

关键：
- 遍历依据：Fiber 链表（固定不变）
- 操作目标：DOM 树（会变化）
- 分离机制：遍历和操作分离

类比：
就像照着蓝图（Fiber 链表）盖房子（DOM），
即使房子已经盖了一部分，蓝图还是那张蓝图，
不会因为房子的状态改变而改变。`}
      </pre>
    </div>
  );
}

// 关键原理
function KeyPrinciple() {
  return (
    <div style={{ background: '#fff', padding: '15px', borderRadius: '5px' }}>
      <h3>为什么不会混乱？</h3>
      
      <pre style={{ background: '#f5f5f5', padding: '15px', overflow: 'auto', fontSize: '13px', lineHeight: '1.8' }}>
{`原理 1: Fiber 链表是独立的数据结构
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Fiber 链表（内存中）：
  C → A → B → D → E
  ↑   ↑   ↑   ↑   ↑
这些指针关系在 Render 阶段就确定了
不会因为 DOM 操作而改变！

DOM 树（浏览器中）：
  初始：<parent><A/><B/><C/><D/><E/></parent>
  
  移动 A 后：<parent><B/><C/><A/><D/><E/></parent>
              ↑
  DOM 变了，但 Fiber 链表没变！
  
  Fiber 链表仍然是：C → A → B → D → E

原理 2: 遍历基于 Fiber，不基于 DOM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

commitMutationEffects() {
  // 遍历 Fiber 树
  let fiber = workInProgress;
  
  while (fiber !== null) {
    // 处理当前 fiber
    commitMutationEffectsOnFiber(fiber);
    
    // 下一个 fiber
    if (fiber.child) {
      fiber = fiber.child;  // ✅ 使用 Fiber.child
    } else if (fiber.sibling) {
      fiber = fiber.sibling;  // ✅ 使用 Fiber.sibling
    } else {
      fiber = fiber.return;  // ✅ 使用 Fiber.return
    }
  }
  
  // ❌ 从不查询 parent.children
  // ❌ 从不查询 DOM 的位置
}

原理 3: getHostSibling 读取的是 Fiber，不是 DOM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

getHostSibling(fiber) {
  let node = fiber;
  
  while (true) {
    // ✅ 从 Fiber 链表获取 sibling
    node = node.sibling;
    
    // ❌ 不查询 DOM：parent.children[index + 1]
    // ❌ 不查询 DOM：node.stateNode.nextSibling
    
    if (node是稳定的Host节点) {
      return node.stateNode;  // 返回 DOM 引用
    }
  }
}

关键：
node.sibling 是 Fiber 指针，指向 Fiber 节点
不是 DOM 的 nextSibling！

原理 4: DOM 操作是"单向"的
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Fiber 链表 → 读取
    ↓
commitPlacement
    ↓
DOM 操作 → 写入

是单向数据流：
✅ Fiber → DOM（读取 Fiber，操作 DOM）
❌ DOM → Fiber（不会反向影响）

即使 DOM 被移动了，Fiber 链表的数据不会改变。

对比：如果基于 DOM 遍历（假设）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

假设 React 基于 DOM 遍历（错误做法）：

for (let i = 0; i < parent.children.length; i++) {
  const domNode = parent.children[i];  // ❌ 从 DOM 读取
  // 处理 domNode
}

问题：
- 移动一个节点后，parent.children 的顺序就变了
- 后续节点的索引会错乱
- 可能会重复处理或跳过节点

React 的实际做法（正确）：

let fiber = firstFiber;
while (fiber !== null) {
  commitMutationEffectsOnFiber(fiber);  // 操作 fiber.stateNode (DOM)
  fiber = fiber.sibling;  // ✅ 从 Fiber 链表读取下一个
}

优势：
- Fiber 链表不会因为 DOM 操作而改变
- 每个节点都能正确处理一次
- 顺序完全可控`}
      </pre>
    </div>
  );
}

// Fiber 遍历机制
function FiberTraversalMechanism() {
  return (
    <div style={{ background: '#fff', padding: '15px', borderRadius: '5px' }}>
      <h3>Commit 阶段的遍历机制</h3>
      
      <pre style={{ background: '#f5f5f5', padding: '15px', overflow: 'auto', fontSize: '13px', lineHeight: '1.8' }}>
{`源码分析：commitMutationEffects
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function commitMutationEffects(
  root: FiberRoot,
  finishedWork: Fiber,
) {
  // 🔥 关键：从 Fiber 树开始遍历，不是从 DOM 树
  commitMutationEffectsOnFiber(finishedWork, root);
}

function commitMutationEffectsOnFiber(
  finishedWork: Fiber,
  root: FiberRoot,
) {
  const current = finishedWork.alternate;
  const flags = finishedWork.flags;
  
  // 1️⃣ 先递归处理子树
  const subtreeHasEffects =
    (finishedWork.subtreeFlags & MutationMask) !== NoFlags;
  
  if (subtreeHasEffects) {
    // 🔥 递归遍历 child
    recursivelyTraverseMutationEffects(root, finishedWork);
  }
  
  // 2️⃣ 再处理当前节点
  if (flags & (Placement | Update | ...)) {
    switch (finishedWork.tag) {
      case FunctionComponent:
      case HostComponent:
        // ... 处理节点
        if (flags & Placement) {
          commitPlacement(finishedWork);  // DOM 操作
        }
        break;
    }
  }
}

function recursivelyTraverseMutationEffects(
  root: FiberRoot,
  parentFiber: Fiber,
) {
  // 🔥 遍历子节点（使用 Fiber.child 和 Fiber.sibling）
  let child = parentFiber.child;
  
  while (child !== null) {
    commitMutationEffectsOnFiber(child, root);
    child = child.sibling;  // ✅ 使用 Fiber.sibling
    // ❌ 不使用 DOM.nextSibling
  }
}

关键点：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. 遍历方式：
   ✅ 使用 fiber.child 向下
   ✅ 使用 fiber.sibling 横向
   ✅ 使用 fiber.return 向上
   ❌ 不使用 DOM API 查询

2. 遍历顺序：
   深度优先，先子后父
   - 先处理子节点
   - 再处理兄弟节点
   - 最后处理父节点

3. 数据来源：
   ✅ Fiber 链表（内存中，不变）
   ❌ DOM 树（浏览器中，会变）

实例说明：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Fiber 树结构：
        Parent
       /  |  \\
      C   A   D
         / \\
        B   E

Fiber 链表（sibling 连接）：
Parent.child = C
C.sibling = A
A.sibling = D
D.sibling = null
A.child = B
B.sibling = E
E.sibling = null

遍历顺序（深度优先）：
1. Parent → child → C
2. C 处理完 → sibling → A
3. A → child → B
4. B 处理完 → sibling → E
5. E 处理完 → return → A
6. A 处理完 → sibling → D
7. D 处理完 → return → Parent
8. Parent 处理完

在这个过程中：
✅ 每一步都从 Fiber 链表读取
✅ 即使中途 DOM 被修改，Fiber 链表不变
✅ 所以遍历顺序始终正确

如果 A 被标记 Placement：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

步骤 3: 处理 A
  → 发现 A.flags & Placement
  → 调用 commitPlacement(A)
  → 移动 A 的 DOM 到新位置
  → DOM 树变化了！

DOM 变化前：<Parent><C/><A><B/><E/></A><D/></Parent>
DOM 变化后：<Parent><C/><D/><A><B/><E/></A></Parent>
                                ↑
                          A 被移动到 D 后面了

步骤 4: 但是！遍历继续
  → fiber.sibling 读取的是 Fiber.A.sibling = D
  → 不是读取 DOM 的 nextSibling
  → 所以下一个处理的是 D（正确）
  → 不会因为 DOM 变化而乱掉

关键：
fiber.sibling 是 Fiber 指针（内存地址）
不是 DOM 引用！

两个独立的数据结构：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Fiber 树（内存）：
  Parent → C → A → D
           ↓   ↓
           null B → E

DOM 树（浏览器）：
  <Parent>
    <C/>
    <D/>          ← A 被移动到这后面了
    <A>
      <B/>
      <E/>
    </A>
  </Parent>

虽然 DOM 树变了，但 Fiber 树的指针关系没变！
所以遍历不受影响。`}
      </pre>
    </div>
  );
}

// 完整案例
function CompleteExample() {
  return (
    <div style={{ background: '#fff', padding: '15px', borderRadius: '5px' }}>
      <h3>完整案例：A B C D → C A B D</h3>
      
      <pre style={{ background: '#f5f5f5', padding: '15px', overflow: 'auto', fontSize: '13px', lineHeight: '1.8' }}>
{`初始状态：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Fiber 链表：A → B → C → D
DOM 树：<parent><A/><B/><C/><D/></parent>

更新后 Fiber 链表（Render 阶段构建）：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Fiber 链表：C → A(P) → B(P) → D
            ↑    ↑       ↑     ↑
          sibling 指针关系

P = Placement 标记

Commit 阶段执行过程：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔵 步骤 1: 处理 C
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

commitMutationEffectsOnFiber(C)
  → C.flags & Placement? false
  → 跳过

当前 DOM：<parent><A/><B/><C/><D/></parent>
当前 Fiber 遍历位置：C → 下一个是 A（从 C.sibling 读取）

🔵 步骤 2: 处理 A（有 Placement）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

commitMutationEffectsOnFiber(A)
  → A.flags & Placement? true ✅
  → 调用 commitPlacement(A)
  
commitPlacement(A):
  parent = <parent> DOM 节点
  before = getHostSibling(A)
  
  getHostSibling(A):
    node = A
    node.sibling = B (Fiber 指针) ✅
    B.flags & Placement? yes，跳过
    
    node = B
    node.sibling = D (Fiber 指针) ✅
    D.flags & Placement? no ✅
    
    return D.stateNode (DOM 节点)
  
  执行：parent.insertBefore(A的DOM, D的DOM)

🔴 DOM 变化了！
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

之前 DOM：<parent><A/><B/><C/><D/></parent>
之后 DOM：<parent><B/><C/><A/><D/></parent>
                      ↑
              A 被移动到 D 前面了！

✅ 但是 Fiber 链表没变！
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Fiber 链表仍然是：C → A → B → D
                      (已处理) (当前)

下一个要处理的：A.sibling = B (从 Fiber 读取) ✅

🔵 步骤 3: 处理 B（有 Placement）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

commitMutationEffectsOnFiber(B)
  → B.flags & Placement? true ✅
  → 调用 commitPlacement(B)

commitPlacement(B):
  parent = <parent> DOM 节点
  before = getHostSibling(B)
  
  getHostSibling(B):
    node = B
    node.sibling = D (Fiber 指针) ✅
    // 🔥 注意：这里读取的是 Fiber.B.sibling
    // 不是 DOM 中 B 的 nextSibling！
    
    D.flags & Placement? no ✅
    return D.stateNode (DOM 节点)
  
  执行：parent.insertBefore(B的DOM, D的DOM)

🔴 DOM 再次变化！
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

之前 DOM：<parent><B/><C/><A/><D/></parent>
之后 DOM：<parent><C/><A/><B/><D/></parent>
                         ↑
              B 被移动到 D 前面了！

✅ Fiber 链表仍然没变！
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Fiber 链表仍然是：C → A → B → D
                      (已处理) (已处理) (当前)

下一个要处理的：B.sibling = D (从 Fiber 读取) ✅

🔵 步骤 4: 处理 D
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

commitMutationEffectsOnFiber(D)
  → D.flags & Placement? false
  → 跳过

当前 DOM：<parent><C/><A/><B/><D/></parent>
          ↑
    最终结果正确！ ✅

关键观察：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. DOM 在步骤 2 和步骤 3 都被修改了
2. 但遍历顺序没有乱：C → A → B → D
3. 因为遍历依据的是 Fiber.sibling 指针
4. Fiber 链表从始至终都是：C → A → B → D
5. DOM 的变化完全不影响 Fiber 链表

如果基于 DOM 遍历会怎样？（假设的错误做法）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

假设错误的实现：

for (let i = 0; i < parent.children.length; i++) {
  const child = parent.children[i];
  // 处理 child
}

步骤 1: i=0, child=A, 处理 A
步骤 2: 移动 A 后，DOM 变成 <B/><C/><A/><D/>
步骤 3: i=1, child=parent.children[1]=C
        ❌ 跳过了 B！

或者更糟：
步骤 1: i=0, child=A
步骤 2: 移动 A 到末尾，A 现在是 children[3]
步骤 3: i=1, child=B
        继续...
步骤 4: i=3, child=A
        ❌ A 被处理了两次！

这就是为什么必须基于 Fiber 链表遍历！`}
      </pre>
    </div>
  );
}

// 可视化演示
function VisualDemo() {
  const [step, setStep] = useState(0);
  
  const steps = [
    {
      title: '初始状态',
      fiber: ['A', 'B', 'C', 'D'],
      dom: ['A', 'B', 'C', 'D'],
      current: null,
      action: 'Fiber 和 DOM 都是初始顺序'
    },
    {
      title: 'Render 阶段完成',
      fiber: ['C', 'A(P)', 'B(P)', 'D'],
      dom: ['A', 'B', 'C', 'D'],
      current: null,
      action: 'Fiber 链表重新排列，A 和 B 标记 Placement\nDOM 还未改变'
    },
    {
      title: '处理 C',
      fiber: ['C', 'A(P)', 'B(P)', 'D'],
      dom: ['A', 'B', 'C', 'D'],
      current: 'C',
      action: 'C 无 Placement，跳过\n遍历：C.sibling = A'
    },
    {
      title: '处理 A - 移动前',
      fiber: ['C', 'A(P)', 'B(P)', 'D'],
      dom: ['A', 'B', 'C', 'D'],
      current: 'A(P)',
      action: 'A 有 Placement，准备移动\ngetHostSibling(A) = D'
    },
    {
      title: '处理 A - 移动后',
      fiber: ['C', 'A(P)', 'B(P)', 'D'],
      dom: ['B', 'C', 'A', 'D'],
      current: 'A(P)',
      action: 'insertBefore(A, D)\nDOM 变了！但 Fiber 链表不变\n遍历：A.sibling = B（从 Fiber 读取）'
    },
    {
      title: '处理 B - 移动前',
      fiber: ['C', 'A(P)', 'B(P)', 'D'],
      dom: ['B', 'C', 'A', 'D'],
      current: 'B(P)',
      action: 'B 有 Placement，准备移动\ngetHostSibling(B) = D（从 Fiber 读取）'
    },
    {
      title: '处理 B - 移动后',
      fiber: ['C', 'A(P)', 'B(P)', 'D'],
      dom: ['C', 'A', 'B', 'D'],
      current: 'B(P)',
      action: 'insertBefore(B, D)\nDOM 再次变化！Fiber 链表仍不变\n遍历：B.sibling = D'
    },
    {
      title: '处理 D',
      fiber: ['C', 'A(P)', 'B(P)', 'D'],
      dom: ['C', 'A', 'B', 'D'],
      current: 'D',
      action: 'D 无 Placement，跳过\n完成！'
    }
  ];
  
  const currentStep = steps[step];
  
  return (
    <div style={{ background: '#fff', padding: '15px', borderRadius: '5px' }}>
      <h3>逐步演示：Fiber 链表 vs DOM 树</h3>
      
      {/* Fiber 链表 */}
      <div style={{ marginBottom: '20px', padding: '15px', background: '#e3f2fd', borderRadius: '5px' }}>
        <h4>Fiber 链表（遍历依据，不变）：</h4>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {currentStep.fiber.map((item, index) => {
            const isPlacement = item.includes('(P)');
            const name = item.replace('(P)', '');
            const isCurrent = currentStep.current && currentStep.current.startsWith(name);
            
            return (
              <React.Fragment key={index}>
                <div style={{
                  padding: '10px 15px',
                  background: isCurrent ? '#f44336' : (isPlacement ? '#ff9800' : '#2196f3'),
                  color: '#fff',
                  borderRadius: '5px',
                  fontWeight: 'bold',
                  border: isCurrent ? '3px solid #d32f2f' : 'none'
                }}>
                  {item}
                  {isCurrent && <div style={{ fontSize: '10px', marginTop: '3px' }}>← 当前</div>}
                </div>
                {index < currentStep.fiber.length - 1 && <span style={{ fontSize: '20px', fontWeight: 'bold' }}>→</span>}
              </React.Fragment>
            );
          })}
        </div>
        <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
          ✅ 通过 fiber.sibling 指针连接，不会改变
        </div>
      </div>
      
      {/* DOM 树 */}
      <div style={{ marginBottom: '20px', padding: '15px', background: '#fff3e0', borderRadius: '5px' }}>
        <h4>DOM 树（操作目标，会变）：</h4>
        <div style={{ 
          padding: '15px',
          background: '#fff',
          borderRadius: '5px',
          border: '2px solid #ff9800'
        }}>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '10px' }}>
            &lt;parent&gt;
          </div>
          <div style={{ display: 'flex', gap: '5px', paddingLeft: '20px', flexWrap: 'wrap' }}>
            {currentStep.dom.map((item, index) => {
              const isCurrent = currentStep.current && currentStep.current.startsWith(item);
              
              return (
                <div key={`${item}-${index}`} style={{
                  padding: '8px 12px',
                  background: isCurrent ? '#f44336' : '#4caf50',
                  color: '#fff',
                  borderRadius: '3px',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}>
                  {item}
                </div>
              );
            })}
          </div>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
            &lt;/parent&gt;
          </div>
        </div>
        <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
          🔄 会因为 insertBefore/appendChild 而改变
        </div>
      </div>
      
      {/* 操作说明 */}
      <div style={{ 
        padding: '15px',
        background: step >= 4 ? '#ffebee' : '#e8f5e9',
        borderRadius: '5px',
        marginBottom: '20px',
        border: `2px solid ${step >= 4 ? '#f44336' : '#4caf50'}`
      }}>
        <h4 style={{ marginTop: 0 }}>{currentStep.title}</h4>
        <pre style={{ 
          margin: '10px 0 0 0', 
          fontSize: '13px', 
          whiteSpace: 'pre-wrap',
          lineHeight: '1.6'
        }}>
          {currentStep.action}
        </pre>
      </div>
      
      {/* 控制按钮 */}
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
        <button
          onClick={() => setStep(Math.max(0, step - 1))}
          disabled={step === 0}
          style={{
            padding: '10px 20px',
            fontSize: '14px',
            cursor: step === 0 ? 'not-allowed' : 'pointer',
            background: step === 0 ? '#ccc' : '#2196f3',
            color: '#fff',
            border: 'none',
            borderRadius: '5px'
          }}
        >
          上一步
        </button>
        <button
          onClick={() => setStep(Math.min(steps.length - 1, step + 1))}
          disabled={step === steps.length - 1}
          style={{
            padding: '10px 20px',
            fontSize: '14px',
            cursor: step === steps.length - 1 ? 'not-allowed' : 'pointer',
            background: step === steps.length - 1 ? '#ccc' : '#4caf50',
            color: '#fff',
            border: 'none',
            borderRadius: '5px'
          }}
        >
          下一步
        </button>
        <button
          onClick={() => setStep(0)}
          style={{
            padding: '10px 20px',
            fontSize: '14px',
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
      
      <div style={{ marginTop: '15px', padding: '10px', background: '#e0f2f1', borderRadius: '5px', fontSize: '13px', textAlign: 'center' }}>
        <strong>步骤 {step + 1} / {steps.length}</strong>
      </div>
    </div>
  );
}

// 总结
function Summary() {
  return (
    <div style={{ background: '#fff', padding: '15px', borderRadius: '5px' }}>
      <h3>核心要点</h3>
      
      <div style={{ background: '#c8e6c9', padding: '15px', marginBottom: '15px', borderRadius: '5px' }}>
        <h4 style={{ marginTop: 0 }}>✅ 不会混乱！</h4>
        <p style={{ fontSize: '14px', lineHeight: '1.8', margin: '10px 0' }}>
          Commit 阶段确实直接操作 DOM，但遍历基于 Fiber 链表，DOM 的变化不会影响遍历顺序。
        </p>
      </div>
      
      <div style={{ background: '#e3f2fd', padding: '15px', marginBottom: '15px', borderRadius: '5px' }}>
        <h4>🔑 关键原理</h4>
        <ul style={{ fontSize: '14px', lineHeight: '1.8', margin: '10px 0' }}>
          <li><strong>Fiber 链表（内存）：</strong>遍历依据，固定不变</li>
          <li><strong>DOM 树（浏览器）：</strong>操作目标，会变化</li>
          <li><strong>单向数据流：</strong>Fiber → DOM，不反向影响</li>
          <li><strong>指针关系：</strong>fiber.sibling 是内存指针，不是 DOM 引用</li>
        </ul>
      </div>
      
      <div style={{ background: '#fff9c4', padding: '15px', marginBottom: '15px', borderRadius: '5px' }}>
        <h4>🔄 遍历机制</h4>
        <pre style={{ background: '#fff', padding: '10px', fontSize: '13px', margin: '10px 0' }}>
{`✅ 使用 Fiber 指针遍历：
  - fiber.child（子节点）
  - fiber.sibling（兄弟节点）
  - fiber.return（父节点）

❌ 不使用 DOM API 查询：
  - parent.children
  - node.nextSibling
  - parent.querySelectorAll()`}
        </pre>
      </div>
      
      <div style={{ background: '#e0f2f1', padding: '15px', borderRadius: '5px' }}>
        <h4>💡 类比理解</h4>
        <p style={{ fontSize: '14px', lineHeight: '1.8', margin: '10px 0' }}>
          就像照着蓝图（Fiber 链表）盖房子（DOM）：<br/>
          - 蓝图告诉你按什么顺序盖<br/>
          - 即使房子已经盖了一部分，蓝图还是那张蓝图<br/>
          - 不会因为房子的变化而改变蓝图
        </p>
      </div>
    </div>
  );
}
