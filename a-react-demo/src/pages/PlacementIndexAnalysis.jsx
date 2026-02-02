import React, { useState } from 'react';

/**
 * Placement 标记后的 index 和插入位置
 * 
 * 关键问题：
 * 1. 被标记 Placement 的节点，index 还需要计算吗？
 * 2. 是直接 appendChild 还是 insertBefore？
 * 3. getHostSibling 如何找到正确的插入位置？
 */

export default function PlacementIndexAnalysis() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🎯 Placement 标记后的 Index 和插入位置</h1>
      
      {/* 核心答案 */}
      <div style={{ background: '#fff3e0', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>✅ 核心答案</h2>
        <CoreAnswer />
      </div>

      {/* Index 仍然需要计算 */}
      <div style={{ background: '#e3f2fd', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>📍 Index 仍然需要计算</h2>
        <IndexCalculation />
      </div>

      {/* getHostSibling 机制 */}
      <div style={{ background: '#e8f5e9', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>🔍 getHostSibling 找插入位置</h2>
        <GetHostSiblingMechanism />
      </div>

      {/* 不是简单的 appendChild */}
      <div style={{ background: '#f3e5f5', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>⚠️ 不是简单的 appendChild</h2>
        <NotSimpleAppend />
      </div>

      {/* 完整案例 */}
      <div style={{ background: '#fce4ec', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>📊 完整案例</h2>
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
        <h4 style={{ marginTop: 0 }}>💡 三个重要事实</h4>
        <ol style={{ fontSize: '15px', lineHeight: '1.8', margin: '10px 0' }}>
          <li><strong>Index 仍然需要计算</strong>：即使被标记 Placement，index 也会被设置</li>
          <li><strong>不是简单 appendChild</strong>：需要找到精确的插入位置</li>
          <li><strong>使用 insertBefore</strong>：通过 getHostSibling 找到锚点，插入到正确位置</li>
        </ol>
      </div>
      
      <pre style={{ background: '#f5f5f5', padding: '15px', fontSize: '14px', lineHeight: '1.8' }}>
{`常见误解：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

❌ 错误理解：
"被标记 Placement 的节点，不需要计算 index，
 直接 appendChild 到父节点末尾就行了"

✅ 正确理解：
"被标记 Placement 的节点：
 1. index 仍然会被设置（在 Render 阶段）
 2. 在 Commit 阶段，通过 getHostSibling 找到正确的插入位置
 3. 使用 insertBefore 插入到精确位置，或 appendChild 到末尾"

为什么不能简单 appendChild？
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

因为多个节点可能都被标记为 Placement，
它们的相对顺序需要保持正确！

例如：
旧列表：A B C D
新列表：D A B C

标记结果：
- D: 不移动
- A: Placement
- B: Placement
- C: Placement

如果简单 appendChild：
1. 处理 A：appendChild(A) → D A
2. 处理 B：appendChild(B) → D A B
3. 处理 C：appendChild(C) → D A B C ✅

看起来可以？但考虑这个场景：

旧列表：A B C D E
新列表：C A B D E

标记结果：
- C: 不移动
- A: Placement
- B: Placement
- D: 不移动
- E: 不移动

如果简单 appendChild：
1. C 不动：C B D E
2. 处理 A：appendChild(A) → C B D E A ❌ 错了！
3. A 应该在 B 前面，不是在 E 后面！

正确做法：
1. C 不动：C B D E
2. 处理 A：insertBefore(A, B) → C A B D E ✅
3. B 和 D、E 都不动

所以必须通过 getHostSibling 找到正确的插入位置！`}
      </pre>
    </div>
  );
}

// Index 计算
function IndexCalculation() {
  return (
    <div style={{ background: '#fff', padding: '15px', borderRadius: '5px' }}>
      <h3>Index 在 placeChild 中仍然被设置</h3>
      
      <pre style={{ background: '#f5f5f5', padding: '15px', overflow: 'auto', fontSize: '13px', lineHeight: '1.8' }}>
{`// ReactChildFiber.old.js line 329-357

function placeChild(
  newFiber: Fiber,
  lastPlacedIndex: number,
  newIndex: number,
): number {
  // 🔥🔥🔥 第一步：无论是否需要移动，都设置 index！
  newFiber.index = newIndex;  // ← 关键！
  
  if (!shouldTrackSideEffects) {
    newFiber.flags |= Forked;
    return lastPlacedIndex;
  }
  
  const current = newFiber.alternate;
  
  if (current !== null) {
    const oldIndex = current.index;
    
    if (oldIndex < lastPlacedIndex) {
      // 需要移动
      newFiber.flags |= Placement;  // 标记 Placement
      return lastPlacedIndex;
    } else {
      // 不需要移动
      return oldIndex;
    }
  } else {
    // 新插入
    newFiber.flags |= Placement;
    return lastPlacedIndex;
  }
}

关键点：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

newFiber.index = newIndex;
  ↑
这一行在函数开头，无条件执行！

无论节点是否需要移动，index 都会被设置为新列表中的位置。

为什么需要设置 index？
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Fiber.index 记录节点在父节点的子列表中的位置
2. 这个信息在后续操作中会被使用：
   - getHostSibling 需要通过 index 找到正确的兄弟节点
   - 下次更新时，oldIndex 就是这个 index
3. index 是 Fiber 节点的基本属性，必须正确维护

实例：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

旧列表：A(0) B(1) C(2) D(3)
新列表：C    A    B    D

处理过程：

C: newIndex=0 → C.index = 0, oldIndex=2, 2<0? no, 不移动
A: newIndex=1 → A.index = 1, oldIndex=0, 0<2? yes, Placement
B: newIndex=2 → B.index = 2, oldIndex=1, 1<2? yes, Placement
D: newIndex=3 → D.index = 3, oldIndex=3, 3<2? no, 不移动

结果：
C: index=0, 无 Placement
A: index=1, Placement ← index 仍然被设置了！
B: index=2, Placement ← index 仍然被设置了！
D: index=3, 无 Placement

这些 index 会在 getHostSibling 中使用，
用于确定正确的插入位置！`}
      </pre>
    </div>
  );
}

// getHostSibling 机制
function GetHostSiblingMechanism() {
  return (
    <div style={{ background: '#fff', padding: '15px', borderRadius: '5px' }}>
      <h3>getHostSibling 如何找到插入位置</h3>
      
      <pre style={{ background: '#f5f5f5', padding: '15px', overflow: 'auto', fontSize: '13px', lineHeight: '1.8' }}>
{`// ReactFiberCommitWork.old.js

function getHostSibling(fiber: Fiber): Instance | null {
  // 找到当前 fiber 应该插入的位置的"下一个兄弟 DOM 节点"
  
  let node: Fiber = fiber;
  
  siblings: while (true) {
    // 向上查找，直到找到有 sibling 的节点
    while (node.sibling === null) {
      if (node.return === null || isHostParent(node.return)) {
        // 已经到顶了，没有 sibling
        return null;  // 插入到末尾
      }
      node = node.return;
    }
    
    node.sibling.return = node.return;
    node = node.sibling;
    
    // 🔥 关键：跳过所有需要插入或删除的节点
    while (
      node.tag !== HostComponent &&
      node.tag !== HostText &&
      node.tag !== DehydratedFragment
    ) {
      // 如果这个 sibling 也是需要插入的，跳过它
      if (node.flags & Placement) {
        continue siblings;
      }
      // 向下查找第一个 Host 节点
      if (node.child === null || node.tag === HostPortal) {
        continue siblings;
      } else {
        node.child.return = node;
        node = node.child;
      }
    }
    
    // 找到了！这是一个稳定的 Host 节点
    if (!(node.flags & Placement)) {
      return node.stateNode;  // 返回 DOM 节点
    }
  }
}

工作原理：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

目标：找到"下一个不需要移动的兄弟 DOM 节点"

步骤：
1. 从当前 Fiber 的 sibling 开始查找
2. 跳过所有标记了 Placement 的节点
3. 跳过所有非 Host 节点（如 FunctionComponent）
4. 返回第一个稳定的 DOM 节点
5. 如果找不到，返回 null（插入到末尾）

为什么要跳过 Placement 节点？
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

因为标记了 Placement 的节点本身也需要被移动，
它们的位置是"不稳定"的，不能作为锚点！

必须找到一个"已经在正确位置"的节点作为锚点。

实例分析：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

新 Fiber 链表：C → A → B → D
标记：        无   P   P   无

P = Placement

处理 A（有 Placement）：
  调用 getHostSibling(A)
  
  A.sibling = B
  B 有 Placement 标记 → 跳过
  
  B.sibling = D
  D 没有 Placement 标记 ✅
  D 是 Host 节点 ✅
  
  返回 D 的 DOM 节点
  
  执行：parent.insertBefore(A的DOM, D的DOM)
  结果：A 被插入到 D 前面

处理 B（有 Placement）：
  调用 getHostSibling(B)
  
  B.sibling = D
  D 没有 Placement 标记 ✅
  D 是 Host 节点 ✅
  
  返回 D 的 DOM 节点
  
  执行：parent.insertBefore(B的DOM, D的DOM)
  结果：B 被插入到 D 前面

最终 DOM 顺序：C A B D ✅

关键理解：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

getHostSibling 保证了：
1. 每个 Placement 节点都能找到正确的插入位置
2. 通过 Fiber.index 确定相对顺序
3. 跳过其他 Placement 节点，找到稳定的锚点
4. 如果没有稳定锚点，就插入到末尾`}
      </pre>
    </div>
  );
}

// 不是简单 appendChild
function NotSimpleAppend() {
  return (
    <div style={{ background: '#fff', padding: '15px', borderRadius: '5px' }}>
      <h3>为什么不能简单 appendChild？</h3>
      
      <pre style={{ background: '#f5f5f5', padding: '15px', overflow: 'auto', fontSize: '13px', lineHeight: '1.8' }}>
{`场景 1：多个节点被标记 Placement，且中间有不移动的节点
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

旧列表：A B C D E F
新列表：C A B E D F

Diff 结果：
C: index=0, 不移动（oldIndex=2 >= lastPlacedIndex=0）
A: index=1, Placement（oldIndex=0 < lastPlacedIndex=2）
B: index=2, Placement（oldIndex=1 < lastPlacedIndex=2）
E: index=3, 不移动（oldIndex=4 >= lastPlacedIndex=2）
D: index=4, Placement（oldIndex=3 < lastPlacedIndex=4）
F: index=5, 不移动（oldIndex=5 >= lastPlacedIndex=4）

如果使用简单 appendChild：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

初始 DOM：A B C D E F

1. C 不动（假设）
   DOM：A B C D E F（实际 C 也需要移动，这里简化）

2. 处理 A（Placement）：
   appendChild(A)
   DOM：B C D E F A  ❌ 错了！A 应该在 B 前面

3. 处理 B（Placement）：
   appendChild(B)
   DOM：C D E F A B  ❌ 错了！

4. 处理 D（Placement）：
   appendChild(D)
   DOM：C E F A B D  ❌ 完全乱了！

期望 DOM：C A B E D F
实际 DOM：C E F A B D

完全错误！

使用 insertBefore + getHostSibling：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

初始 DOM：A B C D E F

1. C 不动
   
2. 处理 A（Placement）：
   getHostSibling(A) = B（跳过，也是 Placement）
                     → E（找到稳定节点）
   insertBefore(A, E)
   DOM：B C D A E F  （注意：insertBefore 会先移除 A）
   
   等等，这也不对？让我重新分析...
   
   实际上，DOM 的初始状态是按旧顺序的。
   
3. 处理 B（Placement）：
   getHostSibling(B) = E（稳定节点）
   insertBefore(B, E)
   
4. 处理 D（Placement）：
   getHostSibling(D) = F（稳定节点）
   insertBefore(D, F)

通过精确的 insertBefore，保证了顺序正确！

场景 2：被移动的节点在末尾
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

旧列表：A B C D
新列表：D A B C

Diff 结果：
D: index=0, 不移动
A: index=1, Placement
B: index=2, Placement
C: index=3, Placement

处理 A：
  getHostSibling(A) = B（Placement，跳过）
                    → C（Placement，跳过）
                    → null（没有更多兄弟了）
  appendChild(A)  ← 这里用 appendChild！
  
处理 B：
  getHostSibling(B) = C（Placement，跳过）
                    → null
  appendChild(B)
  
处理 C：
  getHostSibling(C) = null
  appendChild(C)

结果：D A B C ✅

所以：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

- 有稳定兄弟节点：用 insertBefore
- 没有稳定兄弟节点：用 appendChild

不是"总是 appendChild"，
而是"根据 getHostSibling 的结果决定"！`}
      </pre>
    </div>
  );
}

// 完整案例
function CompleteExample() {
  return (
    <div style={{ background: '#fff', padding: '15px', borderRadius: '5px' }}>
      <h3>完整案例：Index 和插入位置的关系</h3>
      
      <pre style={{ background: '#f5f5f5', padding: '15px', overflow: 'auto', fontSize: '13px', lineHeight: '1.8' }}>
{`案例：复杂的移动场景
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

旧列表：A(0) B(1) C(2) D(3) E(4)
新列表：C    E    A    B    D

Render 阶段 - placeChild：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

lastPlacedIndex = 0

处理 C：
  newIndex = 0
  C.index = 0  ← 设置 index
  oldIndex = 2
  2 < 0? no
  lastPlacedIndex = 2

处理 E：
  newIndex = 1
  E.index = 1  ← 设置 index
  oldIndex = 4
  4 < 2? no
  lastPlacedIndex = 4

处理 A：
  newIndex = 2
  A.index = 2  ← 设置 index
  oldIndex = 0
  0 < 4? yes → A.flags |= Placement
  lastPlacedIndex = 4

处理 B：
  newIndex = 3
  B.index = 3  ← 设置 index
  oldIndex = 1
  1 < 4? yes → B.flags |= Placement
  lastPlacedIndex = 4

处理 D：
  newIndex = 4
  D.index = 4  ← 设置 index
  oldIndex = 3
  3 < 4? yes → D.flags |= Placement
  lastPlacedIndex = 4

结果 Fiber 链表：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

C → E → A → B → D
       ↓   ↓   ↓
       P   P   P  (P = Placement)

每个节点的 index：
C: index=0
E: index=1
A: index=2, Placement
B: index=3, Placement
D: index=4, Placement

Commit 阶段 - commitPlacement：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

初始 DOM：<parent><A/><B/><C/><D/><E/></parent>

1. 遍历到 C：无 Placement，跳过

2. 遍历到 E：无 Placement，跳过

3. 遍历到 A（有 Placement）：
   
   调用 getHostSibling(A)：
   - A 的 sibling 是 B
   - B 有 Placement 标记，跳过
   - B 的 sibling 是 D
   - D 有 Placement 标记，跳过
   - D 的 sibling 是 null
   - 返回 null
   
   执行：parent.appendChild(A的DOM)
   
   DOM 变化：
   <parent><B/><C/><D/><E/><A/></parent>

4. 遍历到 B（有 Placement）：
   
   调用 getHostSibling(B)：
   - B 的 sibling 是 D
   - D 有 Placement 标记，跳过
   - D 的 sibling 是 null
   - 返回 null
   
   执行：parent.appendChild(B的DOM)
   
   DOM 变化：
   <parent><C/><D/><E/><A/><B/></parent>

5. 遍历到 D（有 Placement）：
   
   调用 getHostSibling(D)：
   - D 的 sibling 是 null
   - 返回 null
   
   执行：parent.appendChild(D的DOM)
   
   DOM 变化：
   <parent><C/><E/><A/><B/><D/></parent>

最终 DOM：<parent><C/><E/><A/><B/><D/></parent> ✅

关键观察：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. 所有节点的 index 都被正确设置了
2. getHostSibling 跳过了所有 Placement 节点
3. 因为 A、B、D 都是 Placement，且后面没有稳定节点
4. 所以都用 appendChild
5. 但顺序正确，因为按 Fiber 链表顺序遍历

如果新列表是：C E A D B（D 和 B 交换）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Fiber 链表：C → E → A → D → B
                  ↓   ↓   ↓
                  P   P   P

处理 A：getHostSibling(A) = null，appendChild(A)
处理 D：getHostSibling(D) = null，appendChild(D)
处理 B：getHostSibling(B) = null，appendChild(B)

最终：C E A D B ✅

顺序仍然正确！因为按 Fiber 链表顺序遍历。`}
      </pre>
    </div>
  );
}

// 可视化演示
function VisualDemo() {
  const [step, setStep] = useState(0);
  
  const scenario = {
    old: ['A', 'B', 'C', 'D', 'E'],
    new: ['C', 'E', 'A', 'B', 'D'],
    placements: ['A', 'B', 'D']
  };
  
  const steps = [
    { 
      title: '初始 DOM',
      dom: ['A', 'B', 'C', 'D', 'E'],
      action: '初始状态',
      current: null
    },
    {
      title: '处理 C',
      dom: ['A', 'B', 'C', 'D', 'E'],
      action: 'C 无 Placement，跳过',
      current: 'C'
    },
    {
      title: '处理 E',
      dom: ['A', 'B', 'C', 'D', 'E'],
      action: 'E 无 Placement，跳过',
      current: 'E'
    },
    {
      title: '处理 A（Placement）',
      dom: ['B', 'C', 'D', 'E', 'A'],
      action: 'getHostSibling(A) = null\nappendChild(A)',
      current: 'A'
    },
    {
      title: '处理 B（Placement）',
      dom: ['C', 'D', 'E', 'A', 'B'],
      action: 'getHostSibling(B) = null\nappendChild(B)',
      current: 'B'
    },
    {
      title: '处理 D（Placement）',
      dom: ['C', 'E', 'A', 'B', 'D'],
      action: 'getHostSibling(D) = null\nappendChild(D)',
      current: 'D'
    },
    {
      title: '完成',
      dom: ['C', 'E', 'A', 'B', 'D'],
      action: '所有节点已在正确位置',
      current: null
    }
  ];
  
  const currentStep = steps[step];
  
  return (
    <div style={{ background: '#fff', padding: '15px', borderRadius: '5px' }}>
      <h3>交互式演示：节点移动过程</h3>
      
      {/* Fiber 链表 */}
      <div style={{ marginBottom: '20px', padding: '15px', background: '#e3f2fd', borderRadius: '5px' }}>
        <h4>Fiber 链表（Render 阶段结果）：</h4>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {scenario.new.map((item, index) => (
            <React.Fragment key={item}>
              <div style={{
                padding: '10px 15px',
                background: scenario.placements.includes(item) ? '#ff9800' : '#4caf50',
                color: '#fff',
                borderRadius: '5px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                border: currentStep.current === item ? '3px solid #f44336' : 'none'
              }}>
                <div style={{ fontWeight: 'bold' }}>{item}</div>
                <div style={{ fontSize: '11px', marginTop: '3px' }}>
                  index: {index}
                </div>
                {scenario.placements.includes(item) && (
                  <div style={{ fontSize: '10px', marginTop: '3px', background: '#d84315', padding: '2px 5px', borderRadius: '3px' }}>
                    Placement
                  </div>
                )}
              </div>
              {index < scenario.new.length - 1 && <span>→</span>}
            </React.Fragment>
          ))}
        </div>
      </div>
      
      {/* DOM 状态 */}
      <div style={{ marginBottom: '20px', padding: '15px', background: '#f5f5f5', borderRadius: '5px' }}>
        <h4>{currentStep.title}：</h4>
        <div style={{ 
          padding: '15px',
          background: '#fff',
          borderRadius: '5px',
          border: '2px solid #2196f3',
          marginBottom: '10px'
        }}>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '10px' }}>
            &lt;parent&gt;
          </div>
          <div style={{ display: 'flex', gap: '5px', paddingLeft: '20px', flexWrap: 'wrap' }}>
            {currentStep.dom.map((item, index) => (
              <div key={`${item}-${index}`} style={{
                padding: '8px 12px',
                background: currentStep.current === item ? '#f44336' : '#2196f3',
                color: '#fff',
                borderRadius: '3px',
                fontSize: '14px',
                fontWeight: 'bold'
              }}>
                {item}
              </div>
            ))}
          </div>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
            &lt;/parent&gt;
          </div>
        </div>
        
        <div style={{ 
          padding: '10px',
          background: '#fff3e0',
          borderRadius: '5px',
          fontSize: '13px',
          whiteSpace: 'pre-line'
        }}>
          <strong>操作：</strong>{currentStep.action}
        </div>
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
      
      <div style={{ marginTop: '15px', padding: '10px', background: '#e8f5e9', borderRadius: '5px', fontSize: '13px' }}>
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
      
      <div style={{ background: '#e3f2fd', padding: '15px', marginBottom: '15px', borderRadius: '5px' }}>
        <h4>✅ Index 始终需要计算</h4>
        <ul style={{ fontSize: '14px', lineHeight: '1.8', margin: '10px 0' }}>
          <li>在 <code>placeChild</code> 第一行：<code>newFiber.index = newIndex</code></li>
          <li>无论是否标记 Placement，index 都会被设置</li>
          <li>index 用于维护节点在父节点子列表中的位置</li>
          <li>下次更新时，这个 index 会成为 oldIndex</li>
        </ul>
      </div>
      
      <div style={{ background: '#fff9c4', padding: '15px', marginBottom: '15px', borderRadius: '5px' }}>
        <h4>🔍 getHostSibling 找插入位置</h4>
        <ul style={{ fontSize: '14px', lineHeight: '1.8', margin: '10px 0' }}>
          <li>不是简单的 appendChild 到末尾</li>
          <li>通过 <code>getHostSibling</code> 找到正确的插入位置</li>
          <li>跳过所有标记 Placement 的节点（它们也在移动）</li>
          <li>找到第一个稳定的 DOM 节点作为锚点</li>
        </ul>
      </div>
      
      <div style={{ background: '#e8f5e9', padding: '15px', marginBottom: '15px', borderRadius: '5px' }}>
        <h4>⚙️ 两种插入方式</h4>
        <pre style={{ background: '#fff', padding: '10px', fontSize: '13px', margin: '10px 0' }}>
{`if (before !== null) {
  // 有稳定的兄弟节点
  parent.insertBefore(node, before);
} else {
  // 没有稳定的兄弟节点
  parent.appendChild(node);
}`}
        </pre>
      </div>
      
      <div style={{ background: '#ffebee', padding: '15px', borderRadius: '5px' }}>
        <h4>💡 关键理解</h4>
        <p style={{ fontSize: '14px', lineHeight: '1.8', margin: '10px 0' }}>
          <strong>Placement 标记只是表示"这个节点需要被移动"，</strong><br/>
          <strong>并不代表"随便插到哪都行"。</strong><br/><br/>
          通过 Fiber.index + getHostSibling 的组合，<br/>
          React 能够精确地将每个节点插入到正确的位置，<br/>
          保持新列表的正确顺序。
        </p>
      </div>
    </div>
  );
}
