import React, { useState } from 'react';

/**
 * React Diff 节点复用机制深度解析
 * 
 * 核心内容：
 * 1. 节点复用的判断条件
 * 2. 复用的具体实现（useFiber）
 * 3. 不同场景下的复用策略
 * 4. 源码级别的详细解析
 */

export default function DiffNodeReuseAnalysis() {
  const [list, setList] = useState([
    { id: 1, name: 'Apple', color: '#ff5252' },
    { id: 2, name: 'Banana', color: '#ffc107' },
    { id: 3, name: 'Cherry', color: '#e91e63' }
  ]);
  const [scenario, setScenario] = useState(1);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>⚛️ React Diff 节点复用机制深度解析</h1>
      
      {/* 第一部分：核心概念 */}
      <div style={{ background: '#e3f2fd', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>🎯 核心问题：Diff 时节点如何复用？</h2>
        
        <div style={{ background: '#fff', padding: '15px', borderRadius: '5px', marginBottom: '15px' }}>
          <h3>答案：通过 useFiber 函数基于 alternate 复用</h3>
          <pre style={{ background: '#f5f5f5', padding: '15px', overflow: 'auto', fontSize: '14px' }}>
{`复用流程：

1. 判断是否可以复用（两个条件）
   ├─ key 相同
   └─ type (元素类型) 相同

2. 如果可以复用
   └─ 调用 useFiber(oldFiber, newProps)
      └─ 内部调用 createWorkInProgress(oldFiber, newProps)
         └─ 基于 alternate 复用或创建新 Fiber
         └─ 更新 props
         └─ 重置副作用标记

3. 如果不能复用
   └─ 创建新的 Fiber 节点
   └─ 标记旧节点为删除

关键函数：
- updateSlot: 第一轮遍历，同位置比较
- updateFromMap: 第二轮遍历，从 Map 中查找
- updateElement: 具体的元素复用逻辑
- useFiber: 实际执行复用的函数`}
          </pre>
        </div>
      </div>

      {/* 第二部分：源码解析 */}
      <div style={{ background: '#f3e5f5', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>📂 源码级别的复用机制</h2>
        
        <div style={{ background: '#fff', padding: '15px', borderRadius: '5px', marginBottom: '15px' }}>
          <h3>1. 核心函数：useFiber</h3>
          <pre style={{ background: '#f5f5f5', padding: '10px', overflow: 'auto', fontSize: '13px' }}>
{`// ReactChildFiber.old.js (320 行)

function useFiber(fiber: Fiber, pendingProps: mixed): Fiber {
  // 注释：我们这里设置 sibling 为 null，index 为 0
  // 因为很容易忘记在返回之前设置
  // 例如在单个子节点的情况下
  
  // 关键：调用 createWorkInProgress 复用
  const clone = createWorkInProgress(fiber, pendingProps);
  
  // 重置链表指针（因为要重新构建链表）
  clone.index = 0;
  clone.sibling = null;
  
  return clone;
}

关键点：
1. ✅ 不是深拷贝，是通过 alternate 复用
2. ✅ 重置 index 和 sibling（会重新连接）
3. ✅ pendingProps 传入新的 props
4. ✅ createWorkInProgress 会：
   - 复用 fiber.alternate（如果存在）
   - 或创建新 Fiber（如果不存在）
   - 共享 stateNode (DOM 节点)
   - 重置 flags (副作用标记)`}
          </pre>
        </div>

        <div style={{ background: '#fff', padding: '15px', borderRadius: '5px', marginBottom: '15px' }}>
          <h3>2. 第一轮遍历：updateSlot</h3>
          <pre style={{ background: '#f5f5f5', padding: '10px', overflow: 'auto', fontSize: '13px' }}>
{`// ReactChildFiber.old.js (558 行)

function updateSlot(
  returnFiber: Fiber,
  oldFiber: Fiber | null,
  newChild: any,
  lanes: Lanes,
): Fiber | null {
  // 更新 Fiber，如果 key 匹配，否则返回 null
  
  // 获取老节点的 key
  const key = oldFiber !== null ? oldFiber.key : null;
  
  // 情况 1：新子节点是文本节点
  if (
    (typeof newChild === 'string' && newChild !== '') ||
    typeof newChild === 'number'
  ) {
    // 文本节点没有 key
    // 如果老节点有 key，说明类型不同，不能复用
    if (key !== null) {
      return null;
    }
    return updateTextNode(returnFiber, oldFiber, '' + newChild, lanes);
  }
  
  // 情况 2：新子节点是 React 元素
  if (typeof newChild === 'object' && newChild !== null) {
    switch (newChild.$$typeof) {
      case REACT_ELEMENT_TYPE: {
        // 关键判断：key 是否相同
        if (newChild.key === key) {
          // key 相同，调用 updateElement 进一步判断
          return updateElement(returnFiber, oldFiber, newChild, lanes);
        } else {
          // key 不同，不能复用，返回 null
          // 第一轮遍历会因此跳出
          return null;
        }
      }
      // ... 其他类型
    }
  }
  
  return null;
}

流程：
┌─────────────────────────────────────────┐
│  第一轮遍历（同位置比较）                  │
│                                          │
│  老：[A, B, C, D]                        │
│  新：[A, C, D, E]                        │
│                                          │
│  位置 0: A vs A                          │
│    ├─ key 相同 ✅                        │
│    └─ 调用 updateElement → 复用          │
│                                          │
│  位置 1: B vs C                          │
│    ├─ key 不同 ❌                        │
│    └─ 返回 null，跳出第一轮遍历          │
└─────────────────────────────────────────┘`}
          </pre>
        </div>

        <div style={{ background: '#fff', padding: '15px', borderRadius: '5px', marginBottom: '15px' }}>
          <h3>3. 元素复用判断：updateElement</h3>
          <pre style={{ background: '#f5f5f5', padding: '10px', overflow: 'auto', fontSize: '13px' }}>
{`// ReactChildFiber.old.js (387 行)

function updateElement(
  returnFiber: Fiber,
  current: Fiber | null,
  element: ReactElement,
  lanes: Lanes,
): Fiber {
  const elementType = element.type;
  
  // 特殊情况：Fragment
  if (elementType === REACT_FRAGMENT_TYPE) {
    return updateFragment(
      returnFiber,
      current,
      element.props.children,
      lanes,
      element.key,
    );
  }
  
  // 关键判断：如果有老节点
  if (current !== null) {
    // 判断 type 是否相同
    if (
      current.elementType === elementType ||  // 普通情况
      // ... 热更新检查
      // ... Lazy 组件处理
    ) {
      // ✅ type 相同，可以复用！
      // 调用 useFiber 复用老节点
      const existing = useFiber(current, element.props);
      
      // 更新 ref
      existing.ref = coerceRef(returnFiber, current, element);
      
      // 设置父节点
      existing.return = returnFiber;
      
      if (__DEV__) {
        existing._debugSource = element._source;
        existing._debugOwner = element._owner;
      }
      
      return existing;
    }
  }
  
  // ❌ 不能复用，创建新节点
  const created = createFiberFromElement(element, returnFiber.mode, lanes);
  created.ref = coerceRef(returnFiber, current, element);
  created.return = returnFiber;
  return created;
}

复用条件总结：
┌─────────────────────────────────────────┐
│  必须同时满足：                          │
│  1. key 相同（在 updateSlot 中判断）     │
│  2. type 相同（在 updateElement 中判断） │
└─────────────────────────────────────────┘

示例：
  <div key="a">Old</div>  →  <div key="a">New</div>
  ✅ key 相同 (a)
  ✅ type 相同 (div)
  → 复用，只更新 props（children: Old → New）

  <div key="a">Old</div>  →  <span key="a">New</span>
  ✅ key 相同 (a)
  ❌ type 不同 (div → span)
  → 不复用，删除旧节点，创建新节点

  <div key="a">Old</div>  →  <div key="b">New</div>
  ❌ key 不同 (a → b)
  → 不复用（updateSlot 阶段就返回 null）`}
          </pre>
        </div>

        <div style={{ background: '#fff', padding: '15px', borderRadius: '5px' }}>
          <h3>4. 第二轮遍历：updateFromMap</h3>
          <pre style={{ background: '#f5f5f5', padding: '10px', overflow: 'auto', fontSize: '13px' }}>
{`// ReactChildFiber.old.js (624 行)

function updateFromMap(
  existingChildren: Map<string | number, Fiber>,
  returnFiber: Fiber,
  newIdx: number,
  newChild: any,
  lanes: Lanes,
): Fiber | null {
  
  // 情况 1：文本节点
  if (
    (typeof newChild === 'string' && newChild !== '') ||
    typeof newChild === 'number'
  ) {
    // 文本节点用 index 作为 key
    const matchedFiber = existingChildren.get(newIdx) || null;
    return updateTextNode(returnFiber, matchedFiber, '' + newChild, lanes);
  }
  
  // 情况 2：React 元素
  if (typeof newChild === 'object' && newChild !== null) {
    switch (newChild.$$typeof) {
      case REACT_ELEMENT_TYPE: {
        // 关键：从 Map 中查找匹配的老节点
        const matchedFiber =
          existingChildren.get(
            newChild.key === null ? newIdx : newChild.key,  // 有 key 用 key，没 key 用 index
          ) || null;
        
        // 调用 updateElement 判断是否可以复用
        return updateElement(returnFiber, matchedFiber, newChild, lanes);
      }
      // ... 其他类型
    }
  }
  
  return null;
}

使用场景：
┌─────────────────────────────────────────┐
│  第二轮遍历（使用 Map 优化查找）          │
│                                          │
│  老：[A, B, C, D]                        │
│  新：[A, C, D, E]                        │
│                                          │
│  第一轮遍历结束于位置 1                   │
│                                          │
│  剩余老节点：[B, C, D]                   │
│  → 构建 Map: {B: FiberB, C: FiberC, D: FiberD} │
│                                          │
│  剩余新节点：[C, D, E]                   │
│                                          │
│  处理 C:                                 │
│    ├─ Map.get('C') → FiberC ✅          │
│    └─ 调用 updateElement → 复用          │
│                                          │
│  处理 D:                                 │
│    ├─ Map.get('D') → FiberD ✅          │
│    └─ 调用 updateElement → 复用          │
│                                          │
│  处理 E:                                 │
│    ├─ Map.get('E') → null ❌            │
│    └─ 创建新节点                         │
│                                          │
│  Map 中剩余 FiberB → 标记删除            │
└─────────────────────────────────────────┘

优化：
- 使用 Map 结构，查找时间复杂度 O(1)
- 避免嵌套循环，整体时间复杂度 O(n)`}
          </pre>
        </div>
      </div>

      {/* 第三部分：复用的具体实现 */}
      <div style={{ background: '#fff3e0', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>🔧 复用的具体实现细节</h2>
        
        <div style={{ background: '#fff', padding: '15px', borderRadius: '5px', marginBottom: '15px' }}>
          <h3>useFiber → createWorkInProgress 调用链</h3>
          <pre style={{ background: '#f5f5f5', padding: '10px', overflow: 'auto', fontSize: '13px' }}>
{`完整的复用流程：

Step 1: Diff 算法判断可以复用
  └─ updateElement(returnFiber, oldFiber, newElement)
     └─ key 相同 ✅
     └─ type 相同 ✅

Step 2: 调用 useFiber 复用
  └─ useFiber(oldFiber, newElement.props)
     └─ const clone = createWorkInProgress(oldFiber, newElement.props)

Step 3: createWorkInProgress 的工作
  ├─ 尝试获取 alternate
  │  └─ let workInProgress = oldFiber.alternate
  │
  ├─ 情况 A: alternate 存在（之前创建过）
  │  ├─ 直接复用 alternate 指向的 Fiber
  │  ├─ 更新 pendingProps = newElement.props
  │  ├─ 重置 flags = NoFlags
  │  ├─ 重置 subtreeFlags = NoFlags
  │  └─ 重置 deletions = null
  │
  └─ 情况 B: alternate 不存在（首次）
     ├─ 创建新 Fiber: createFiber(...)
     ├─ 复制基本属性（tag, key, type, stateNode）
     ├─ 建立双向链接：
     │  ├─ workInProgress.alternate = oldFiber
     │  └─ oldFiber.alternate = workInProgress
     └─ 返回新创建的 Fiber

Step 4: 返回复用的 Fiber
  └─ 这个 Fiber 会成为新的 workInProgress 树的一部分

关键理解：
┌────────────────────────────────────────────┐
│  oldFiber (current 树)                     │
│  ├─ 已经渲染，用户可见                      │
│  ├─ 有 alternate 指向之前的 workInProgress  │
│  └─ 保持不变                               │
│         ↓                                  │
│  useFiber 复用                             │
│         ↓                                  │
│  newFiber (workInProgress 树)              │
│  ├─ 基于 oldFiber.alternate 创建/复用       │
│  ├─ 更新 props                             │
│  ├─ 重置 flags                             │
│  ├─ 共享 stateNode (DOM 节点)              │
│  └─ 等待 Commit                            │
└────────────────────────────────────────────┘`}
          </pre>
        </div>

        <div style={{ background: '#fff', padding: '15px', borderRadius: '5px' }}>
          <h3>复用 vs 创建新节点的对比</h3>
          <pre style={{ background: '#f5f5f5', padding: '10px', overflow: 'auto', fontSize: '13px' }}>
{`场景 1：可以复用（key 和 type 都相同）
──────────────────────────────────────────
老节点：<div key="item-1" className="old">Old</div>
新节点：<div key="item-1" className="new">New</div>

判断：
  ✅ key 相同: "item-1"
  ✅ type 相同: "div"

操作：
  1. useFiber(oldFiber, { className: "new", children: "New" })
  2. 基于 oldFiber.alternate 复用
  3. 更新 props
  4. 重置 flags
  5. 共享 DOM 节点（不创建新 DOM）
  6. 标记 Update flag

结果：
  - 复用 Fiber 节点 ✅
  - 复用 DOM 节点 ✅
  - 只更新属性（className, textContent）
  - 性能最优

场景 2：type 不同（不能复用）
──────────────────────────────────────────
老节点：<div key="item-1">Old</div>
新节点：<span key="item-1">New</span>

判断：
  ✅ key 相同: "item-1"
  ❌ type 不同: "div" → "span"

操作：
  1. 创建新 Fiber: createFiberFromElement(...)
  2. 创建新 DOM 节点
  3. 标记老节点 Deletion flag
  4. 标记新节点 Placement flag

结果：
  - 不复用 Fiber 节点 ❌
  - 不复用 DOM 节点 ❌
  - 删除旧 DOM，插入新 DOM
  - 性能较差

场景 3：key 不同（不能复用）
──────────────────────────────────────────
老节点：<div key="item-1">Old</div>
新节点：<div key="item-2">New</div>

判断：
  ❌ key 不同: "item-1" → "item-2"
  （不会继续判断 type）

操作：
  1. updateSlot 返回 null
  2. 第一轮遍历跳出
  3. 进入第二轮遍历（Map 查找）
  4. 找不到 key="item-2" 的老节点
  5. 创建新 Fiber 和 DOM

结果：
  - 不复用 ❌
  - 创建新的 Fiber 和 DOM

总结：
┌──────────────────────────────────────┐
│  复用条件（必须同时满足）              │
│  ├─ key 相同                         │
│  └─ type 相同                        │
│                                      │
│  复用内容：                           │
│  ├─ Fiber 节点（通过 alternate）     │
│  ├─ DOM 节点（通过 stateNode）       │
│  └─ 某些状态（memoizedState 等）     │
│                                      │
│  不复用内容（会重置）：                │
│  ├─ props (使用新的 pendingProps)    │
│  ├─ flags (重置为 NoFlags)           │
│  ├─ index (重新设置)                 │
│  └─ sibling (重新连接)               │
└──────────────────────────────────────┘`}
          </pre>
        </div>
      </div>

      {/* 第四部分：不同场景下的复用策略 */}
      <div style={{ background: '#e8f5e9', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>🎬 不同场景下的复用策略</h2>
        
        <div style={{ background: '#fff', padding: '15px', borderRadius: '5px', marginBottom: '15px' }}>
          <h3>场景 1：单个子节点</h3>
          <pre style={{ background: '#f5f5f5', padding: '10px', fontSize: '13px' }}>
{`更新前：<div><span>Hello</span></div>
更新后：<div><span>World</span></div>

流程：
  1. reconcileSingleElement(...)
  2. 判断老子节点是否可以复用
     ├─ key: null === null ✅
     └─ type: span === span ✅
  3. useFiber(oldSpan, { children: "World" })
  4. 复用成功，只更新 textContent

结果：✅ 复用 Fiber 和 DOM`}
          </pre>
        </div>

        <div style={{ background: '#fff', padding: '15px', borderRadius: '5px', marginBottom: '15px' }}>
          <h3>场景 2：数组子节点（第一轮遍历）</h3>
          <pre style={{ background: '#f5f5f5', padding: '10px', fontSize: '13px' }}>
{`更新前：[A, B, C]
更新后：[A', B', C']

第一轮遍历（同位置比较）：
  位置 0: A vs A'
    ├─ updateSlot(oldA, newA')
    ├─ key 相同 ✅
    ├─ type 相同 ✅
    └─ useFiber(oldA, newA'.props) → 复用 ✅
  
  位置 1: B vs B'
    └─ 复用 ✅
  
  位置 2: C vs C'
    └─ 复用 ✅

结果：✅ 所有节点都复用，性能最优`}
          </pre>
        </div>

        <div style={{ background: '#fff', padding: '15px', borderRadius: '5px', marginBottom: '15px' }}>
          <h3>场景 3：数组子节点（第二轮遍历）</h3>
          <pre style={{ background: '#f5f5f5', padding: '10px', fontSize: '13px' }}>
{`更新前：[A, B, C, D]
更新后：[A, C, D, E]

第一轮遍历：
  位置 0: A vs A → 复用 ✅
  位置 1: B vs C → key 不同，跳出

第二轮遍历：
  剩余老节点：[B, C, D]
  构建 Map: { B: FiberB, C: FiberC, D: FiberD }
  
  剩余新节点：[C, D, E]
  
  处理 C:
    ├─ Map.get('C') → FiberC
    ├─ updateElement(FiberC, newC)
    └─ useFiber(FiberC, newC.props) → 复用 ✅
  
  处理 D:
    └─ 复用 ✅
  
  处理 E:
    ├─ Map.get('E') → null
    └─ createFiberFromElement(newE) → 创建新节点
  
  Map 剩余：FiberB → 标记删除

结果：
  ✅ A, C, D 复用
  ➕ E 新增
  ➖ B 删除`}
          </pre>
        </div>

        <div style={{ background: '#fff', padding: '15px', borderRadius: '5px' }}>
          <h3>场景 4：头部插入</h3>
          <pre style={{ background: '#f5f5f5', padding: '10px', fontSize: '13px' }}>
{`更新前：[A, B, C]
更新后：[X, A, B, C]

使用 key（正确）：
  第一轮遍历：
    位置 0: A vs X → key 不同，跳出
  
  第二轮遍历：
    Map: { A: FiberA, B: FiberB, C: FiberC }
    
    X: Map.get('X') → null → 创建
    A: Map.get('A') → FiberA → 复用 ✅
    B: Map.get('B') → FiberB → 复用 ✅
    C: Map.get('C') → FiberC → 复用 ✅
  
  结果：✅ 1 次创建，3 次复用

使用 index（错误）：
  第一轮遍历：
    位置 0: A(key=0) vs X(key=0)
      ├─ key 相同 ✅
      ├─ type 不同 ❌
      └─ 删除 A，创建 X
    
    位置 1: B(key=1) vs A(key=1)
      └─ 删除 B，创建 A
    
    位置 2: C(key=2) vs B(key=2)
      └─ 删除 C，创建 B
    
    位置 3: 无 vs C(key=3)
      └─ 创建 C
  
  结果：❌ 3 次删除，4 次创建，性能极差！`}
          </pre>
        </div>
      </div>

      {/* 第五部分：可视化 Demo */}
      <div style={{ background: '#fce4ec', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>🎮 可视化 Demo</h2>
        
        <div style={{ marginBottom: '20px' }}>
          <button
            onClick={() => setScenario(1)}
            style={{
              padding: '10px 20px',
              marginRight: '10px',
              background: scenario === 1 ? '#e91e63' : '#e0e0e0',
              color: scenario === 1 ? 'white' : 'black',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            场景 1: 同位置更新
          </button>
          <button
            onClick={() => setScenario(2)}
            style={{
              padding: '10px 20px',
              marginRight: '10px',
              background: scenario === 2 ? '#e91e63' : '#e0e0e0',
              color: scenario === 2 ? 'white' : 'black',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            场景 2: 中间删除
          </button>
          <button
            onClick={() => setScenario(3)}
            style={{
              padding: '10px 20px',
              background: scenario === 3 ? '#e91e63' : '#e0e0e0',
              color: scenario === 3 ? 'white' : 'black',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            场景 3: 顺序调整
          </button>
        </div>

        {scenario === 1 && (
          <div style={{ background: '#fff', padding: '15px', borderRadius: '5px' }}>
            <h3>场景 1: 同位置更新（所有节点复用）</h3>
            <div style={{ marginBottom: '15px' }}>
              {list.map((item) => (
                <div
                  key={item.id}
                  style={{
                    padding: '10px',
                    margin: '5px 0',
                    background: item.color,
                    color: 'white',
                    borderRadius: '5px'
                  }}
                >
                  {item.name} (key={item.id})
                </div>
              ))}
            </div>
            <button
              onClick={() => setList(list.map(item => ({
                ...item,
                name: item.name + '!'
              })))}
              style={{ padding: '8px 15px', marginRight: '10px' }}
            >
              更新名称
            </button>
            <button
              onClick={() => setList([
                { id: 1, name: 'Apple', color: '#ff5252' },
                { id: 2, name: 'Banana', color: '#ffc107' },
                { id: 3, name: 'Cherry', color: '#e91e63' }
              ])}
              style={{ padding: '8px 15px' }}
            >
              重置
            </button>
            <p style={{ color: '#388e3c', marginTop: '10px' }}>
              ✅ 所有节点：key 相同 + type 相同 → 全部复用（useFiber）
            </p>
          </div>
        )}

        {scenario === 2 && (
          <div style={{ background: '#fff', padding: '15px', borderRadius: '5px' }}>
            <h3>场景 2: 删除中间节点（部分复用）</h3>
            <div style={{ marginBottom: '15px' }}>
              {list.map((item) => (
                <div
                  key={item.id}
                  style={{
                    padding: '10px',
                    margin: '5px 0',
                    background: item.color,
                    color: 'white',
                    borderRadius: '5px'
                  }}
                >
                  {item.name} (key={item.id})
                </div>
              ))}
            </div>
            <button
              onClick={() => setList(list.filter(item => item.id !== 2))}
              style={{ padding: '8px 15px', marginRight: '10px' }}
            >
              删除 Banana
            </button>
            <button
              onClick={() => setList([
                { id: 1, name: 'Apple', color: '#ff5252' },
                { id: 2, name: 'Banana', color: '#ffc107' },
                { id: 3, name: 'Cherry', color: '#e91e63' }
              ])}
              style={{ padding: '8px 15px' }}
            >
              重置
            </button>
            <p style={{ color: '#388e3c', marginTop: '10px' }}>
              第一轮：Apple 复用 ✅<br/>
              第二轮：Cherry 从 Map 中找到并复用 ✅<br/>
              Banana 标记删除 ❌
            </p>
          </div>
        )}

        {scenario === 3 && (
          <div style={{ background: '#fff', padding: '15px', borderRadius: '5px' }}>
            <h3>场景 3: 调整顺序（Map 查找复用）</h3>
            <div style={{ marginBottom: '15px' }}>
              {list.map((item) => (
                <div
                  key={item.id}
                  style={{
                    padding: '10px',
                    margin: '5px 0',
                    background: item.color,
                    color: 'white',
                    borderRadius: '5px'
                  }}
                >
                  {item.name} (key={item.id})
                </div>
              ))}
            </div>
            <button
              onClick={() => setList([list[2], list[0], list[1]])}
              style={{ padding: '8px 15px', marginRight: '10px' }}
            >
              调整顺序 (C, A, B)
            </button>
            <button
              onClick={() => setList([
                { id: 1, name: 'Apple', color: '#ff5252' },
                { id: 2, name: 'Banana', color: '#ffc107' },
                { id: 3, name: 'Cherry', color: '#e91e63' }
              ])}
              style={{ padding: '8px 15px' }}
            >
              重置
            </button>
            <p style={{ color: '#388e3c', marginTop: '10px' }}>
              第一轮：Apple vs Cherry，key 不同，跳出<br/>
              第二轮：构建 Map，从 Map 中查找<br/>
              Cherry, Apple, Banana 全部复用 ✅<br/>
              只标记移动 (Placement flag)
            </p>
          </div>
        )}
      </div>

      {/* 第六部分：总结 */}
      <div style={{ background: '#e0f2f1', padding: '20px', borderRadius: '8px' }}>
        <h2>📝 总结</h2>
        
        <div style={{ background: '#fff', padding: '15px', borderRadius: '5px' }}>
          <h3>🎯 核心要点</h3>
          
          <h4>1. 复用的判断条件</h4>
          <div style={{ background: '#e8f5e9', padding: '10px', marginBottom: '10px' }}>
            <p>必须同时满足：</p>
            <ul>
              <li>✅ <code>key</code> 相同</li>
              <li>✅ <code>type</code> 相同（元素类型，如 div, span, 组件类型）</li>
            </ul>
          </div>

          <h4>2. 复用的实现机制</h4>
          <div style={{ background: '#fff9c4', padding: '10px', marginBottom: '10px' }}>
            <ul>
              <li><code>useFiber(oldFiber, newProps)</code> 执行复用</li>
              <li>内部调用 <code>createWorkInProgress(oldFiber, newProps)</code></li>
              <li>基于 <code>alternate</code> 指针复用或创建</li>
              <li>共享 <code>stateNode</code>（DOM 节点）</li>
              <li>更新 <code>pendingProps</code>（新 props）</li>
              <li>重置 <code>flags</code>（副作用标记）</li>
            </ul>
          </div>

          <h4>3. 复用的流程</h4>
          <div style={{ background: '#e3f2fd', padding: '10px', marginBottom: '10px' }}>
            <p><strong>第一轮遍历（同位置比较）：</strong></p>
            <ul>
              <li>调用 <code>updateSlot</code> 比较 key</li>
              <li>key 相同 → 调用 <code>updateElement</code> 比较 type</li>
              <li>type 相同 → 调用 <code>useFiber</code> 复用</li>
              <li>任一不同 → 跳出第一轮</li>
            </ul>
            
            <p><strong>第二轮遍历（Map 查找）：</strong></p>
            <ul>
              <li>剩余老节点构建 Map（key → Fiber）</li>
              <li>调用 <code>updateFromMap</code> 查找匹配节点</li>
              <li>找到 → 调用 <code>updateElement</code> 判断复用</li>
              <li>找不到 → 创建新节点</li>
            </ul>
          </div>

          <h4>4. 性能优化建议</h4>
          <div style={{ background: '#ffebee', padding: '10px' }}>
            <ul>
              <li>✅ 使用唯一且稳定的 <code>key</code></li>
              <li>✅ 保持组件类型稳定</li>
              <li>✅ 避免在循环中用 <code>index</code> 作为 key</li>
              <li>✅ 避免在循环中用 <code>Math.random()</code> 作为 key</li>
              <li>❌ 不要动态改变组件类型</li>
            </ul>
          </div>

          <div style={{ background: '#fff9c4', padding: '15px', marginTop: '15px', borderRadius: '5px' }}>
            <h4>💡 记忆口诀：</h4>
            <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#1976d2' }}>
              key 和 type 两相同<br/>
              useFiber 来复用<br/>
              alternate 指针妙<br/>
              共享 DOM 不重建<br/>
              第一轮同位比<br/>
              第二轮 Map 找<br/>
              性能优化全靠 key
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
