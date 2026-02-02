import React, { useState } from 'react';

/**
 * React 协调（Reconciliation）和 Diff 算法深度解析
 * 
 * 核心内容：
 * 1. 协调和 Diff 发生在哪个阶段？
 * 2. Diff 算法的三大策略
 * 3. 源码层面的实现细节
 * 4. 面试如何回答
 */

export default function ReconciliationAndDiffAnalysis() {
  const [showDemo, setShowDemo] = useState(1);
  const [list1, setList1] = useState(['A', 'B', 'C', 'D']);
  const [list2, setList2] = useState(['A', 'B', 'C', 'D']);
  const [list3, setList3] = useState([
    { id: 1, name: 'Apple' },
    { id: 2, name: 'Banana' },
    { id: 3, name: 'Cherry' }
  ]);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>⚛️ React 协调（Reconciliation）与 Diff 算法</h1>
      
      {/* 第一部分：核心概念 */}
      <div style={{ background: '#e3f2fd', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>🎯 核心问题：协调和 Diff 发生在哪个阶段？</h2>
        
        <div style={{ background: '#fff', padding: '15px', borderRadius: '5px', marginBottom: '15px' }}>
          <h3 style={{ color: '#1976d2' }}>✅ 答案：Render 阶段（Reconciliation Phase）</h3>
          <pre style={{ background: '#f5f5f5', padding: '15px', overflow: 'auto', fontSize: '14px' }}>
{`React 更新流程：

┌─────────────────────────────────────────────────────────┐
│  1. 触发更新（Trigger）                                  │
│     - setState / useState                                │
│     - forceUpdate                                       │
│     - props 改变                                        │
└─────────────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────────────┐
│  2. 调度更新（Schedule）                                 │
│     - 计算优先级（Lane）                                │
│     - 决定同步 / 异步更新                               │
└─────────────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────────────┐
│  3. Render 阶段（Reconciliation）← 协调和 Diff 在这里！  │
│                                                          │
│  【这个阶段的核心工作】                                   │
│  ├── beginWork（向下遍历）                              │
│  │   ├── 调用组件函数 / render() 获取新的 ReactElement   │
│  │   ├── 调用 reconcileChildren（协调子节点）           │
│  │   │   └── 调用 Diff 算法比较新旧子节点                │
│  │   ├── 为变化的节点打标记（flags）                    │
│  │   └── 创建新的 Fiber 节点                           │
│  │                                                       │
│  └── completeWork（向上回溯）                           │
│      ├── 创建 / 更新 DOM 实例（但不插入 DOM）            │
│      └── 收集 side effects                              │
│                                                          │
│  特点：                                                  │
│  ✅ 可中断（Concurrent Mode）                           │
│  ✅ 纯计算，不操作真实 DOM                               │
│  ✅ 生成带副作用标记的 Fiber 树                          │
└─────────────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────────────┐
│  4. Commit 阶段（不涉及 Diff）                           │
│     - 根据 flags 操作真实 DOM                            │
│     - 执行 useEffect / useLayoutEffect                  │
└─────────────────────────────────────────────────────────┘`}
          </pre>
        </div>

        <div style={{ background: '#fff9c4', padding: '15px', borderRadius: '5px' }}>
          <h4>🔑 关键理解：</h4>
          <ul>
            <li><strong>协调（Reconciliation）：</strong>Render 阶段的整个过程，包括 Diff</li>
            <li><strong>Diff 算法：</strong>协调过程中比较新旧子节点的具体算法</li>
            <li><strong>发生位置：</strong>beginWork → reconcileChildren → reconcileChildFibers</li>
          </ul>
        </div>
      </div>

      {/* 第二部分：源码流程 */}
      <div style={{ background: '#f3e5f5', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>📂 源码级别的调用链</h2>
        
        <div style={{ background: '#fff', padding: '15px', borderRadius: '5px', marginBottom: '15px' }}>
          <h3>1. 入口：beginWork</h3>
          <pre style={{ background: '#f5f5f5', padding: '10px', overflow: 'auto', fontSize: '13px' }}>
{`// ReactFiberBeginWork.old.js (3685 行)

function beginWork(
  current: Fiber | null,      // 老的 Fiber 节点
  workInProgress: Fiber,      // 新的 Fiber 节点（正在构建）
  renderLanes: Lanes,
): Fiber | null {
  
  // 根据不同组件类型调用不同的更新函数
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
    
    case HostComponent:  // 原生 DOM 元素（div, span 等）
      return updateHostComponent(current, workInProgress, renderLanes);
    
    // ... 其他类型
  }
}

// 关键：每种更新函数内部都会调用 reconcileChildren`}
          </pre>
        </div>

        <div style={{ background: '#fff', padding: '15px', borderRadius: '5px', marginBottom: '15px' }}>
          <h3>2. 协调子节点：reconcileChildren</h3>
          <pre style={{ background: '#f5f5f5', padding: '10px', overflow: 'auto', fontSize: '13px' }}>
{`// ReactFiberBeginWork.old.js (288 行)

export function reconcileChildren(
  current: Fiber | null,
  workInProgress: Fiber,
  nextChildren: any,          // 新的子元素（ReactElement）
  renderLanes: Lanes,
) {
  if (current === null) {
    // 首次渲染（Mount）
    // 不需要 Diff，直接创建新的 Fiber 节点
    workInProgress.child = mountChildFibers(
      workInProgress,
      null,
      nextChildren,
      renderLanes,
    );
  } else {
    // 更新阶段（Update）
    // 需要 Diff 算法比较新旧子节点
    workInProgress.child = reconcileChildFibers(
      workInProgress,
      current.child,   // 老的子 Fiber 节点
      nextChildren,    // 新的子 ReactElement
      renderLanes,
    );
  }
}

// 关键：
// - mountChildFibers：首次渲染，不标记副作用
// - reconcileChildFibers：更新渲染，标记副作用（Placement, Update, Deletion）`}
          </pre>
        </div>

        <div style={{ background: '#fff', padding: '15px', borderRadius: '5px', marginBottom: '15px' }}>
          <h3>3. Diff 算法核心：reconcileChildFibers</h3>
          <pre style={{ background: '#f5f5f5', padding: '10px', overflow: 'auto', fontSize: '13px' }}>
{`// ReactChildFiber.old.js (1245 行)

function reconcileChildFibers(
  returnFiber: Fiber,
  currentFirstChild: Fiber | null,  // 老的第一个子节点
  newChild: any,                    // 新的子元素
  lanes: Lanes,
): Fiber | null {
  
  // 根据新子元素的类型，调用不同的 Diff 算法
  
  // 1. 新子元素是对象（单个元素）
  if (typeof newChild === 'object' && newChild !== null) {
    switch (newChild.$$typeof) {
      case REACT_ELEMENT_TYPE:
        return placeSingleChild(
          reconcileSingleElement(
            returnFiber,
            currentFirstChild,
            newChild,
            lanes,
          ),
        );
    }
  }
  
  // 2. 新子元素是字符串或数字（文本节点）
  if (typeof newChild === 'string' || typeof newChild === 'number') {
    return placeSingleChild(
      reconcileSingleTextNode(
        returnFiber,
        currentFirstChild,
        '' + newChild,
        lanes,
      ),
    );
  }
  
  // 3. 新子元素是数组（多个子元素）← 最复杂的情况！
  if (isArray(newChild)) {
    return reconcileChildrenArray(
      returnFiber,
      currentFirstChild,
      newChild,
      lanes,
    );
  }
  
  // 4. 新子元素是可迭代对象
  if (getIteratorFn(newChild)) {
    return reconcileChildrenIterator(
      returnFiber,
      currentFirstChild,
      newChild,
      lanes,
    );
  }
  
  // 5. 其他情况，删除所有老节点
  return deleteRemainingChildren(returnFiber, currentFirstChild);
}

// 关键：Diff 算法根据子元素类型分为不同的处理逻辑`}
          </pre>
        </div>

        <div style={{ background: '#fff', padding: '15px', borderRadius: '5px' }}>
          <h3>4. 数组子元素的 Diff：reconcileChildrenArray</h3>
          <pre style={{ background: '#f5f5f5', padding: '10px', overflow: 'auto', fontSize: '13px' }}>
{`// ReactChildFiber.old.js (736 行)

function reconcileChildrenArray(
  returnFiber: Fiber,
  currentFirstChild: Fiber | null,  // 老的第一个子 Fiber
  newChildren: Array<*>,            // 新的子 ReactElement 数组
  lanes: Lanes,
): Fiber | null {
  
  // 这是 React Diff 算法的核心实现！
  // 三大策略在这里体现
  
  // 变量初始化
  let oldFiber = currentFirstChild;
  let lastPlacedIndex = 0;
  let newIdx = 0;
  let nextOldFiber = null;
  
  // ========== 第一轮遍历：处理更新的节点 ==========
  for (; oldFiber !== null && newIdx < newChildren.length; newIdx++) {
    if (oldFiber.index > newIdx) {
      nextOldFiber = oldFiber;
      oldFiber = null;
    } else {
      nextOldFiber = oldFiber.sibling;
    }
    
    // 尝试复用节点（通过 key 和 type 判断）
    const newFiber = updateSlot(
      returnFiber,
      oldFiber,
      newChildren[newIdx],
      lanes,
    );
    
    if (newFiber === null) {
      // key 不同，无法复用，跳出第一轮遍历
      break;
    }
    
    if (shouldTrackSideEffects) {
      if (oldFiber && newFiber.alternate === null) {
        // 没有复用老节点，标记删除
        deleteChild(returnFiber, oldFiber);
      }
    }
    
    // 标记节点位置
    lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx);
    
    // 连接 Fiber 链表
    if (previousNewFiber === null) {
      resultingFirstChild = newFiber;
    } else {
      previousNewFiber.sibling = newFiber;
    }
    previousNewFiber = newFiber;
    oldFiber = nextOldFiber;
  }
  
  // ========== 第二轮遍历：处理剩余节点 ==========
  
  // 情况 1：新节点遍历完，老节点还有剩余 → 删除老节点
  if (newIdx === newChildren.length) {
    deleteRemainingChildren(returnFiber, oldFiber);
    return resultingFirstChild;
  }
  
  // 情况 2：老节点遍历完，新节点还有剩余 → 插入新节点
  if (oldFiber === null) {
    for (; newIdx < newChildren.length; newIdx++) {
      const newFiber = createChild(returnFiber, newChildren[newIdx], lanes);
      if (newFiber === null) continue;
      lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx);
      // ... 连接链表
    }
    return resultingFirstChild;
  }
  
  // 情况 3：新老节点都有剩余 → 使用 Map 优化查找
  const existingChildren = mapRemainingChildren(returnFiber, oldFiber);
  
  for (; newIdx < newChildren.length; newIdx++) {
    const newFiber = updateFromMap(
      existingChildren,
      returnFiber,
      newIdx,
      newChildren[newIdx],
      lanes,
    );
    
    if (newFiber !== null) {
      if (shouldTrackSideEffects) {
        if (newFiber.alternate !== null) {
          // 从 Map 中删除已复用的节点
          existingChildren.delete(
            newFiber.key === null ? newIdx : newFiber.key,
          );
        }
      }
      lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIdx);
      // ... 连接链表
    }
  }
  
  // 删除 Map 中剩余的老节点（说明新数组中没有对应的元素）
  if (shouldTrackSideEffects) {
    existingChildren.forEach(child => deleteChild(returnFiber, child));
  }
  
  return resultingFirstChild;
}

// 关键：
// 1. 第一轮遍历：同位置对比，能复用就复用
// 2. 第二轮遍历：处理节点的增删移
// 3. 使用 Map 优化查找性能（key 的作用）`}
          </pre>
        </div>
      </div>

      {/* 第三部分：Diff 算法的三大策略 */}
      <div style={{ background: '#fff3e0', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>🎯 React Diff 算法的三大策略</h2>
        
        <div style={{ background: '#fff', padding: '15px', borderRadius: '5px', marginBottom: '15px' }}>
          <h3>策略一：Tree Diff（树层级）</h3>
          <pre style={{ background: '#f5f5f5', padding: '10px' }}>
{`传统 Diff 算法：O(n³) 复杂度
- 需要对两棵树进行完整的深度遍历
- 找出最小的编辑距离

React 的优化：O(n) 复杂度
- 只比较同层级的节点
- 不跨层级比较

假设：Web UI 中跨层级的 DOM 移动操作非常少

示例：
    A               A
   / \\             / \\
  B   C    →      D   C
     / \\             / \\
    D   E           B   E

React 的处理：
1. 删除整个 B 子树（包括 D, E）
2. 在新位置创建 D 和 B

不会检测到 "B 从 A 的左子树移动到 D 的左子树"

结论：不要进行跨层级的 DOM 移动！`}
          </pre>
        </div>

        <div style={{ background: '#fff', padding: '15px', borderRadius: '5px', marginBottom: '15px' }}>
          <h3>策略二：Component Diff（组件层级）</h3>
          <pre style={{ background: '#f5f5f5', padding: '10px' }}>
{`React 的处理：
1. 如果是同类型组件，继续按照策略 3 比较子节点
2. 如果不是同类型组件，直接删除旧组件，创建新组件

示例：
<div>              <div>
  <ComponentA />     <ComponentB />
</div>       →     </div>

React 的处理：
1. 卸载 ComponentA（调用 componentWillUnmount）
2. 销毁 ComponentA 的所有子树
3. 挂载 ComponentB（调用 constructor, render, componentDidMount）
4. 创建 ComponentB 的所有子树

优化建议：
- 使用 shouldComponentUpdate 或 React.memo 避免不必要的更新
- 保持组件类型稳定（不要动态改变组件类型）`}
          </pre>
        </div>

        <div style={{ background: '#fff', padding: '15px', borderRadius: '5px' }}>
          <h3>策略三：Element Diff（元素层级）</h3>
          <pre style={{ background: '#f5f5f5', padding: '10px' }}>
{`针对同一层级的子节点，React 提供三种操作：
1. INSERT（插入）：新节点不在老集合中
2. MOVE（移动）：新节点在老集合中，但位置改变
3. DELETE（删除）：老节点不在新集合中

优化策略：使用 key 属性
- key 是节点的唯一标识
- 通过 key 快速判断节点是否可以复用
- 避免不必要的删除和创建操作

示例 1：没有 key（性能差）
老：[A, B, C, D]
新：[B, A, D, C]

React 的处理（按位置比较）：
- 位置 0: A → B（更新）
- 位置 1: B → A（更新）
- 位置 2: C → D（更新）
- 位置 3: D → C（更新）
结果：4 次更新操作

示例 2：有 key（性能好）
老：[{key:'a', val:'A'}, {key:'b', val:'B'}, {key:'c', val:'C'}, {key:'d', val:'D'}]
新：[{key:'b', val:'B'}, {key:'a', val:'A'}, {key:'d', val:'D'}, {key:'c', val:'C'}]

React 的处理（通过 key 查找）：
- key=b: 在老集合中，移动
- key=a: 在老集合中，移动
- key=d: 在老集合中，移动
- key=c: 在老集合中，移动
结果：4 次移动操作（比更新快）

关键优化：lastPlacedIndex
- 记录最后一个可复用节点在老集合中的位置
- 如果节点在老集合中的位置 < lastPlacedIndex，需要移动
- 如果节点在老集合中的位置 >= lastPlacedIndex，不需要移动`}
          </pre>
        </div>
      </div>

      {/* 第四部分：交互式 Demo */}
      <div style={{ background: '#e8f5e9', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>🎮 交互式 Demo</h2>
        
        <div style={{ marginBottom: '20px' }}>
          <button
            onClick={() => setShowDemo(1)}
            style={{
              padding: '10px 20px',
              marginRight: '10px',
              background: showDemo === 1 ? '#4caf50' : '#e0e0e0',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Demo 1: 无 Key
          </button>
          <button
            onClick={() => setShowDemo(2)}
            style={{
              padding: '10px 20px',
              marginRight: '10px',
              background: showDemo === 2 ? '#4caf50' : '#e0e0e0',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Demo 2: Index 作为 Key
          </button>
          <button
            onClick={() => setShowDemo(3)}
            style={{
              padding: '10px 20px',
              background: showDemo === 3 ? '#4caf50' : '#e0e0e0',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Demo 3: 唯一 Key
          </button>
        </div>

        {showDemo === 1 && (
          <div style={{ background: '#fff', padding: '15px', borderRadius: '5px' }}>
            <h3>❌ Demo 1: 没有 Key（最差情况）</h3>
            <div style={{ marginBottom: '15px' }}>
              {list1.map((item, index) => (
                <div
                  key={Math.random()}
                  style={{
                    padding: '10px',
                    margin: '5px 0',
                    background: '#ffcdd2',
                    borderRadius: '5px'
                  }}
                >
                  {item} - {index}
                </div>
              ))}
            </div>
            <button
              onClick={() => setList1([list1[1], list1[0], ...list1.slice(2)])}
              style={{ padding: '8px 15px', marginRight: '10px' }}
            >
              交换前两个
            </button>
            <button
              onClick={() => setList1(['X', ...list1])}
              style={{ padding: '8px 15px', marginRight: '10px' }}
            >
              头部插入 X
            </button>
            <button
              onClick={() => setList1(['A', 'B', 'C', 'D'])}
              style={{ padding: '8px 15px' }}
            >
              重置
            </button>
            <p style={{ color: '#d32f2f', marginTop: '10px' }}>
              ⚠️ 每次更新都会创建新的 key，React 无法复用节点，性能最差！
            </p>
          </div>
        )}

        {showDemo === 2 && (
          <div style={{ background: '#fff', padding: '15px', borderRadius: '5px' }}>
            <h3>⚠️  Demo 2: Index 作为 Key（有问题）</h3>
            <div style={{ marginBottom: '15px' }}>
              {list2.map((item, index) => (
                <div
                  key={index}
                  style={{
                    padding: '10px',
                    margin: '5px 0',
                    background: '#fff9c4',
                    borderRadius: '5px'
                  }}
                >
                  {item} - key={index}
                </div>
              ))}
            </div>
            <button
              onClick={() => setList2([list2[1], list2[0], ...list2.slice(2)])}
              style={{ padding: '8px 15px', marginRight: '10px' }}
            >
              交换前两个
            </button>
            <button
              onClick={() => setList2(['X', ...list2])}
              style={{ padding: '8px 15px', marginRight: '10px' }}
            >
              头部插入 X
            </button>
            <button
              onClick={() => setList2(['A', 'B', 'C', 'D'])}
              style={{ padding: '8px 15px' }}
            >
              重置
            </button>
            <p style={{ color: '#f57c00', marginTop: '10px' }}>
              ⚠️ 头部插入后，所有元素的 key 都变了，React 会更新所有节点！
            </p>
          </div>
        )}

        {showDemo === 3 && (
          <div style={{ background: '#fff', padding: '15px', borderRadius: '5px' }}>
            <h3>✅ Demo 3: 唯一稳定的 Key（最优）</h3>
            <div style={{ marginBottom: '15px' }}>
              {list3.map((item) => (
                <div
                  key={item.id}
                  style={{
                    padding: '10px',
                    margin: '5px 0',
                    background: '#c8e6c9',
                    borderRadius: '5px'
                  }}
                >
                  {item.name} - key={item.id}
                </div>
              ))}
            </div>
            <button
              onClick={() => setList3([list3[1], list3[0], ...list3.slice(2)])}
              style={{ padding: '8px 15px', marginRight: '10px' }}
            >
              交换前两个
            </button>
            <button
              onClick={() => setList3([{ id: Date.now(), name: 'Orange' }, ...list3])}
              style={{ padding: '8px 15px', marginRight: '10px' }}
            >
              头部插入
            </button>
            <button
              onClick={() => setList3([
                { id: 1, name: 'Apple' },
                { id: 2, name: 'Banana' },
                { id: 3, name: 'Cherry' }
              ])}
              style={{ padding: '8px 15px' }}
            >
              重置
            </button>
            <p style={{ color: '#388e3c', marginTop: '10px' }}>
              ✅ 使用唯一 ID 作为 key，React 可以准确复用节点，性能最优！
            </p>
          </div>
        )}
      </div>

      {/* 第五部分：面试回答策略 */}
      <div style={{ background: '#fce4ec', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>💼 面试如何回答</h2>
        
        <div style={{ background: '#fff', padding: '15px', borderRadius: '5px', marginBottom: '15px' }}>
          <h3>问题 1：协调和 Diff 算法发生在哪个阶段？</h3>
          <div style={{ background: '#e8f5e9', padding: '15px', borderRadius: '5px' }}>
            <h4>标准答案（分层次回答）：</h4>
            
            <p><strong>第一层（简短）：</strong></p>
            <p style={{ paddingLeft: '20px' }}>
              协调和 Diff 算法发生在 <strong>Render 阶段</strong>，也叫 Reconciliation 阶段。
            </p>

            <p><strong>第二层（展开）：</strong></p>
            <p style={{ paddingLeft: '20px' }}>
              具体来说，在 Render 阶段的 <code>beginWork</code> 函数中，React 会调用 <code>reconcileChildren</code> 
              来协调子节点，内部会调用 <code>reconcileChildFibers</code> 执行 Diff 算法，
              比较新旧子节点，为变化的节点打上副作用标记（flags），生成新的 Fiber 树。
            </p>

            <p><strong>第三层（深入源码）：</strong></p>
            <p style={{ paddingLeft: '20px' }}>
              调用链是：<code>beginWork</code> → <code>updateXXXComponent</code> → 
              <code>reconcileChildren</code> → <code>reconcileChildFibers</code> → 
              <code>reconcileChildrenArray</code>（数组情况）。
              这个过程是纯计算，不涉及真实 DOM 操作，生成的 Fiber 树会在 Commit 阶段被用来操作真实 DOM。
            </p>
          </div>
        </div>

        <div style={{ background: '#fff', padding: '15px', borderRadius: '5px', marginBottom: '15px' }}>
          <h3>问题 2：React Diff 算法的原理是什么？</h3>
          <div style={{ background: '#e8f5e9', padding: '15px', borderRadius: '5px' }}>
            <h4>标准答案（三大策略）：</h4>
            
            <p><strong>核心优化：</strong>将传统 Diff 的 O(n³) 复杂度降低到 O(n)</p>

            <p><strong>策略一：Tree Diff（树层级）</strong></p>
            <ul style={{ paddingLeft: '40px' }}>
              <li>只比较同层级节点，不跨层级比较</li>
              <li>如果节点跨层级移动，React 会删除重建，不会移动</li>
              <li>建议：避免跨层级的 DOM 移动</li>
            </ul>

            <p><strong>策略二：Component Diff（组件层级）</strong></p>
            <ul style={{ paddingLeft: '40px' }}>
              <li>同类型组件，继续比较子节点</li>
              <li>不同类型组件，直接删除旧组件，创建新组件</li>
              <li>建议：使用 shouldComponentUpdate 或 React.memo 优化</li>
            </ul>

            <p><strong>策略三：Element Diff（元素层级）</strong></p>
            <ul style={{ paddingLeft: '40px' }}>
              <li>通过 key 属性快速判断节点是否可复用</li>
              <li>使用 lastPlacedIndex 优化移动判断</li>
              <li>建议：使用唯一且稳定的 key，不要用 index 或 random</li>
            </ul>
          </div>
        </div>

        <div style={{ background: '#fff', padding: '15px', borderRadius: '5px', marginBottom: '15px' }}>
          <h3>问题 3：为什么不能用 index 作为 key？</h3>
          <div style={{ background: '#e8f5e9', padding: '15px', borderRadius: '5px' }}>
            <h4>标准答案：</h4>
            
            <p><strong>原因：</strong>当列表发生增删改时，index 会发生变化，导致 React 无法正确复用节点。</p>

            <p><strong>举例说明：</strong></p>
            <pre style={{ background: '#f5f5f5', padding: '10px' }}>
{`老列表：
  [A, B, C]  (key = 0, 1, 2)

在头部插入 X：
  [X, A, B, C]  (key = 0, 1, 2, 3)

React 的判断：
  - key=0: 内容从 A 变成 X → 更新
  - key=1: 内容从 B 变成 A → 更新
  - key=2: 内容从 C 变成 B → 更新
  - key=3: 新节点 C → 插入

结果：4 个操作（3 次更新 + 1 次插入）

正确做法（使用唯一 ID）：
老：[{id:'a', val:'A'}, {id:'b', val:'B'}, {id:'c', val:'C'}]
新：[{id:'x', val:'X'}, {id:'a', val:'A'}, {id:'b', val:'B'}, {id:'c', val:'C'}]

React 的判断：
  - id='x': 新节点 → 插入
  - id='a', 'b', 'c': 老节点复用 → 无需更新

结果：1 个操作（1 次插入）`}
            </pre>

            <p><strong>例外情况：</strong>如果列表是静态的（不会增删改，只会重新渲染），用 index 是可以的。</p>
          </div>
        </div>

        <div style={{ background: '#fff', padding: '15px', borderRadius: '5px' }}>
          <h3>问题 4：Diff 算法的具体流程是什么？（高级）</h3>
          <div style={{ background: '#e8f5e9', padding: '15px', borderRadius: '5px' }}>
            <h4>详细流程（针对数组子元素）：</h4>
            
            <p><strong>第一轮遍历：</strong>处理节点更新</p>
            <pre style={{ background: '#f5f5f5', padding: '10px', fontSize: '13px' }}>
{`1. 同时遍历新老数组，从头开始
2. 比较同位置的节点（通过 key 和 type）
3. 如果可以复用，生成新 Fiber，继续遍历
4. 如果不能复用（key 不同），跳出第一轮遍历`}
            </pre>

            <p><strong>第二轮遍历：</strong>处理节点增删</p>
            <pre style={{ background: '#f5f5f5', padding: '10px', fontSize: '13px' }}>
{`情况 1：新节点遍历完，老节点还有剩余
  → 删除所有剩余的老节点

情况 2：老节点遍历完，新节点还有剩余
  → 创建所有剩余的新节点

情况 3：新老节点都有剩余
  → 将剩余老节点放入 Map（key → Fiber）
  → 遍历剩余新节点，从 Map 中查找可复用的节点
  → 标记移动或插入
  → 删除 Map 中剩余的老节点`}
            </pre>

            <p><strong>关键优化：lastPlacedIndex</strong></p>
            <pre style={{ background: '#f5f5f5', padding: '10px', fontSize: '13px' }}>
{`lastPlacedIndex 记录最后一个可复用节点在老数组中的位置

判断是否需要移动：
  if (oldIndex < lastPlacedIndex) {
    // 需要向右移动
    newFiber.flags |= Placement;
  } else {
    // 不需要移动，更新 lastPlacedIndex
    lastPlacedIndex = oldIndex;
  }

这样可以最小化移动次数`}
            </pre>
          </div>
        </div>
      </div>

      {/* 第六部分：总结 */}
      <div style={{ background: '#e0f2f1', padding: '20px', borderRadius: '8px' }}>
        <h2>📝 知识总结</h2>
        
        <div style={{ background: '#fff', padding: '15px', borderRadius: '5px' }}>
          <h3>🎯 核心要点：</h3>
          
          <h4>1. 阶段定位</h4>
          <ul>
            <li>协调和 Diff 发生在 <strong>Render 阶段</strong></li>
            <li>具体位置：<code>beginWork → reconcileChildren → reconcileChildFibers</code></li>
            <li>特点：纯计算，可中断，不操作真实 DOM</li>
          </ul>

          <h4>2. 三大策略</h4>
          <ul>
            <li><strong>Tree Diff：</strong>只比较同层级，不跨层级</li>
            <li><strong>Component Diff：</strong>类型不同直接重建</li>
            <li><strong>Element Diff：</strong>通过 key 优化复用</li>
          </ul>

          <h4>3. 算法流程</h4>
          <ul>
            <li>第一轮：同位置比较，能复用就复用</li>
            <li>第二轮：处理增删移，使用 Map 优化查找</li>
            <li>lastPlacedIndex：最小化移动次数</li>
          </ul>

          <h4>4. 最佳实践</h4>
          <ul>
            <li>✅ 使用唯一且稳定的 key（如 ID）</li>
            <li>❌ 不要用 index 作为 key（除非列表静态）</li>
            <li>❌ 不要用 random 作为 key</li>
            <li>❌ 避免跨层级移动 DOM</li>
            <li>✅ 保持组件类型稳定</li>
          </ul>

          <div style={{ background: '#fff9c4', padding: '15px', marginTop: '15px', borderRadius: '5px' }}>
            <h4>💡 面试记忆口诀：</h4>
            <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#1976d2' }}>
              Render 阶段做协调<br/>
              beginWork 调 Diff<br/>
              三大策略降复杂<br/>
              key 唯一保性能
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
