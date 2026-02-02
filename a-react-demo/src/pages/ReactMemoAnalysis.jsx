import React, { useState, memo, useEffect } from 'react';

/**
 * React.memo 实现原理深度解析
 * 
 * 核心问题：
 * 1. React.memo 是如何创建的？
 * 2. React.memo 如何进行 props 比较？
 * 3. 什么时候会跳过渲染？
 * 4. 自定义比较函数如何工作？
 */

export default function ReactMemoAnalysis() {
  const [parentCount, setParentCount] = useState(0);
  const [childCount, setChildCount] = useState(0);
  const [obj, setObj] = useState({ value: 0 });

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>⚛️ React.memo 实现原理深度解析</h1>
      
      {/* 第一部分：核心原理 */}
      <div style={{ background: '#fff3e0', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>🎯 核心原理</h2>
        
        <div style={{ background: '#fff', padding: '15px', borderRadius: '5px', marginBottom: '15px' }}>
          <h3>React.memo 是什么？</h3>
          <pre style={{ background: '#f5f5f5', padding: '15px', overflow: 'auto', fontSize: '14px' }}>
{`React.memo 是一个高阶组件（HOC），用于优化函数组件的性能。

基本用法：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const MyComponent = React.memo(function MyComponent(props) {
  // 组件逻辑
  return <div>{props.value}</div>;
});

// 或者带自定义比较函数
const MyComponent = React.memo(
  function MyComponent(props) {
    return <div>{props.value}</div>;
  },
  (prevProps, nextProps) => {
    // 返回 true 表示相等，跳过渲染
    // 返回 false 表示不相等，需要渲染
    return prevProps.value === nextProps.value;
  }
);

作用：
✅ 仅在 props 改变时才重新渲染
✅ 默认进行 props 的浅比较
✅ 可以自定义比较逻辑
✅ 类似 PureComponent，但用于函数组件`}
          </pre>
        </div>
      </div>

      {/* 第二部分：源码实现 */}
      <div style={{ background: '#e3f2fd', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>📂 源码实现</h2>
        
        <div style={{ background: '#fff', padding: '15px', borderRadius: '5px', marginBottom: '15px' }}>
          <h3>步骤 1：React.memo 创建 - ReactMemo.js</h3>
          <pre style={{ background: '#f5f5f5', padding: '10px', overflow: 'auto', fontSize: '13px' }}>
{`// packages/react/src/ReactMemo.js

export function memo<Props>(
  type: React$ElementType,
  compare?: (oldProps: Props, newProps: Props) => boolean,
) {
  // 创建一个特殊的 element 对象
  const elementType = {
    $$typeof: REACT_MEMO_TYPE,  // 特殊标记，表示这是 memo 组件
    type,                        // 原始组件
    compare: compare === undefined ? null : compare,  // 自定义比较函数
  };
  
  return elementType;
}

返回的对象结构：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

{
  $$typeof: Symbol(react.memo),     // 特殊类型标记
  type: MyComponent,                 // 原始函数组件
  compare: customCompare || null     // 自定义比较函数（可选）
}

关键点：
1. React.memo 只是创建了一个包装对象
2. 包装对象包含原始组件的引用
3. 包装对象包含可选的比较函数
4. 通过 $$typeof 标记让 React 识别这是 memo 组件`}
          </pre>
        </div>

        <div style={{ background: '#fff', padding: '15px', borderRadius: '5px', marginBottom: '15px' }}>
          <h3>步骤 2：首次挂载 - updateMemoComponent</h3>
          <pre style={{ background: '#f5f5f5', padding: '10px', overflow: 'auto', fontSize: '13px' }}>
{`// packages/react-reconciler/src/ReactFiberBeginWork.old.js

function updateMemoComponent(
  current: Fiber | null,
  workInProgress: Fiber,
  Component: any,  // memo 包装对象
  nextProps: any,
  renderLanes: Lanes,
): null | Fiber {
  if (current === null) {
    // ═══════════════════════════════════════
    // 首次挂载
    // ═══════════════════════════════════════
    const type = Component.type;  // 获取原始组件
    
    if (
      isSimpleFunctionComponent(type) &&
      Component.compare === null &&
      Component.defaultProps === undefined
    ) {
      // 优化路径：如果满足条件，升级为 SimpleMemoComponent
      // 条件：
      // 1. 是简单函数组件（不是 class、forwardRef 等）
      // 2. 没有自定义 compare 函数
      // 3. 没有 defaultProps
      
      workInProgress.tag = SimpleMemoComponent;
      workInProgress.type = type;
      
      return updateSimpleMemoComponent(
        current,
        workInProgress,
        type,
        nextProps,
        renderLanes,
      );
    }
    
    // 普通路径：创建内部组件的 Fiber
    const child = createFiberFromTypeAndProps(
      Component.type,
      null,
      nextProps,
      workInProgress,
      workInProgress.mode,
      renderLanes,
    );
    child.ref = workInProgress.ref;
    child.return = workInProgress;
    workInProgress.child = child;
    return child;
  }
  
  // 更新时的逻辑（见下一节）
  // ...
}

首次挂载流程：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. React 遇到 memo 包装对象
2. 调用 updateMemoComponent
3. 检查是否是简单情况：
   ✅ 简单 → 升级为 SimpleMemoComponent（快速路径）
   ❌ 复杂 → 保持 MemoComponent（普通路径）
4. 创建内部组件的 Fiber 节点
5. 正常渲染组件`}
          </pre>
        </div>

        <div style={{ background: '#fff', padding: '15px', borderRadius: '5px', marginBottom: '15px' }}>
          <h3>步骤 3：更新时的比较 - updateSimpleMemoComponent</h3>
          <pre style={{ background: '#f5f5f5', padding: '10px', overflow: 'auto', fontSize: '13px' }}>
{`// packages/react-reconciler/src/ReactFiberBeginWork.old.js

function updateSimpleMemoComponent(
  current: Fiber | null,
  workInProgress: Fiber,
  Component: any,
  nextProps: any,
  renderLanes: Lanes,
): null | Fiber {
  if (current !== null) {
    // ═══════════════════════════════════════
    // 更新阶段 - 进行 props 比较
    // ═══════════════════════════════════════
    const prevProps = current.memoizedProps;
    
    if (
      shallowEqual(prevProps, nextProps) &&  // 🔥 关键：浅比较 props
      current.ref === workInProgress.ref &&  // ref 也要相同
      (__DEV__ ? workInProgress.type === current.type : true)  // 类型相同
    ) {
      // ✅ Props 相等！可以跳过渲染
      didReceiveUpdate = false;
      
      // 复用 prevProps
      workInProgress.pendingProps = nextProps = prevProps;
      
      if (!checkScheduledUpdateOrContext(current, renderLanes)) {
        // 没有其他更新（如 context 变化）
        // 可以完全 bailout（跳过整个子树）
        workInProgress.lanes = current.lanes;
        
        return bailoutOnAlreadyFinishedWork(
          current,
          workInProgress,
          renderLanes,
        );
      } else if ((current.flags & ForceUpdateForLegacySuspense) !== NoFlags) {
        // 特殊情况：legacy suspense 强制更新
        didReceiveUpdate = true;
      }
    }
  }
  
  // ❌ Props 不相等，需要重新渲染
  return updateFunctionComponent(
    current,
    workInProgress,
    Component,
    nextProps,
    renderLanes,
  );
}

更新流程：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. 获取 prevProps（上次的 props）
2. 使用 shallowEqual 比较 prevProps 和 nextProps
3. 同时检查 ref 是否相同
4. 如果都相等：
   ✅ 设置 didReceiveUpdate = false
   ✅ 检查是否有其他更新（context 等）
   ✅ 如果没有 → bailout（跳过渲染）
   ✅ 如果有 → 继续渲染
5. 如果不相等：
   ❌ 重新渲染组件`}
          </pre>
        </div>

        <div style={{ background: '#fff', padding: '15px', borderRadius: '5px', marginBottom: '15px' }}>
          <h3>步骤 4：浅比较实现 - shallowEqual</h3>
          <pre style={{ background: '#f5f5f5', padding: '10px', overflow: 'auto', fontSize: '13px' }}>
{`// packages/shared/shallowEqual.js

function shallowEqual(objA: mixed, objB: mixed): boolean {
  // Step 1: 使用 Object.is 进行严格相等比较
  if (is(objA, objB)) {
    return true;  // 完全相同的对象
  }
  
  // Step 2: 检查是否都是对象
  if (
    typeof objA !== 'object' ||
    objA === null ||
    typeof objB !== 'object' ||
    objB === null
  ) {
    return false;  // 不是对象或为 null
  }
  
  // Step 3: 比较对象的 key 数量
  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);
  
  if (keysA.length !== keysB.length) {
    return false;  // key 数量不同
  }
  
  // Step 4: 逐个比较每个 key 的值
  for (let i = 0; i < keysA.length; i++) {
    const currentKey = keysA[i];
    if (
      !hasOwnProperty.call(objB, currentKey) ||  // objB 没有这个 key
      !is(objA[currentKey], objB[currentKey])    // 值不相等（使用 Object.is）
    ) {
      return false;
    }
  }
  
  return true;  // 所有 key 的值都相等
}

// Object.is 的行为（与 === 类似，但有细微差别）
Object.is(NaN, NaN)      // true  (与 === 不同)
Object.is(+0, -0)        // false (与 === 不同)
Object.is(0, 0)          // true
Object.is({}, {})        // false (不同的对象引用)
Object.is(obj, obj)      // true  (相同的对象引用)

浅比较的特点：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ 比较对象的第一层属性
❌ 不递归比较嵌套对象
❌ 嵌套对象比较的是引用

示例：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ✅ 浅比较通过
shallowEqual(
  { a: 1, b: 2 },
  { a: 1, b: 2 }
) // false - 不同对象引用

// ✅ 浅比较通过
const obj = { a: 1, b: 2 };
shallowEqual(obj, obj) // true - 相同引用

// ✅ 浅比较通过（第一层相同）
const nested = { x: 1 };
shallowEqual(
  { a: 1, nested: nested },
  { a: 1, nested: nested }
) // false - 外层对象引用不同

// ❌ 浅比较失败（嵌套对象不同引用）
shallowEqual(
  { a: 1, nested: { x: 1 } },
  { a: 1, nested: { x: 1 } }
) // false - nested 是不同的对象引用`}
          </pre>
        </div>

        <div style={{ background: '#fff', padding: '15px', borderRadius: '5px' }}>
          <h3>步骤 5：自定义比较函数</h3>
          <pre style={{ background: '#f5f5f5', padding: '10px', overflow: 'auto', fontSize: '13px' }}>
{`// 如果提供了自定义 compare 函数

function updateMemoComponent(...) {
  // ... 首次挂载逻辑 ...
  
  // 更新时
  const type = Component.type;
  const unresolvedOldProps = current.memoizedProps;
  const unresolvedNewProps = nextProps;
  
  let compare = Component.compare;  // 获取自定义比较函数
  compare = compare !== null ? compare : shallowEqual;  // 默认使用 shallowEqual
  
  if (compare(unresolvedOldProps, unresolvedNewProps) && current.ref === workInProgress.ref) {
    // ✅ 自定义比较函数返回 true（相等）
    return bailoutOnAlreadyFinishedWork(current, workInProgress, renderLanes);
  }
  
  // ❌ 自定义比较函数返回 false（不相等）
  // 或 ref 改变了
  // 重新渲染组件
}

自定义比较函数的用法：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const MyComponent = React.memo(
  function MyComponent(props) {
    return <div>{props.user.name}</div>;
  },
  (prevProps, nextProps) => {
    // 返回 true：props 相等，不需要重新渲染
    // 返回 false：props 不相等，需要重新渲染
    
    // 只比较 user.id
    return prevProps.user.id === nextProps.user.id;
  }
);

⚠️ 注意：
- 自定义比较函数的返回值与 shouldComponentUpdate 相反！
- shouldComponentUpdate: true = 需要更新
- React.memo compare: true = 不需要更新（相等）

常见用法：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// 1. 只比较特定属性
(prev, next) => prev.id === next.id

// 2. 深度比较（性能较差，慎用）
(prev, next) => JSON.stringify(prev) === JSON.stringify(next)

// 3. 使用 lodash
import isEqual from 'lodash/isEqual';
(prev, next) => isEqual(prev, next)

// 4. 忽略某些属性
(prev, next) => {
  const { timestamp: _, ...prevRest } = prev;
  const { timestamp: __, ...nextRest } = next;
  return shallowEqual(prevRest, nextRest);
}`}
          </pre>
        </div>
      </div>

      {/* 第三部分：完整流程图 */}
      <div style={{ background: '#e8f5e9', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>🔄 完整流程图</h2>
        
        <div style={{ background: '#fff', padding: '15px', borderRadius: '5px' }}>
          <pre style={{ background: '#f5f5f5', padding: '15px', overflow: 'auto', fontSize: '13px', lineHeight: '1.8' }}>
{`┌────────────────────────────────────────────────────────────────┐
│  1. 创建阶段（调用 React.memo）                                │
└────────────────────────────────────────────────────────────────┘

const MemoComponent = React.memo(MyComponent, customCompare);
                         ↓
            创建 memo 包装对象
                         ↓
        {
          $$typeof: Symbol(react.memo),
          type: MyComponent,
          compare: customCompare || null
        }

┌────────────────────────────────────────────────────────────────┐
│  2. 首次挂载阶段                                               │
└────────────────────────────────────────────────────────────────┘

React 遇到 memo 包装对象
         ↓
  调用 updateMemoComponent
         ↓
    检查组件类型
         ↓
    ┌─────────────────────┐
    │ 是简单函数组件？    │
    └─────────────────────┘
       ↓              ↓
      Yes            No
       ↓              ↓
 SimpleMemoComponent  MemoComponent
 （快速路径）         （普通路径）
       ↓              ↓
    创建内部 Fiber 节点
       ↓
    正常渲染组件

┌────────────────────────────────────────────────────────────────┐
│  3. 更新阶段（关键！）                                         │
└────────────────────────────────────────────────────────────────┘

父组件触发更新
       ↓
  memo 组件接收新 props
       ↓
  调用 updateSimpleMemoComponent (或 updateMemoComponent)
       ↓
  获取 prevProps 和 nextProps
       ↓
  ┌──────────────────────────────────┐
  │ 有自定义 compare 函数吗？       │
  └──────────────────────────────────┘
       ↓              ↓
      Yes            No
       ↓              ↓
  调用 customCompare  调用 shallowEqual
       ↓              ↓
  ┌──────────────────────────────────┐
  │ compare(prevProps, nextProps)?   │
  │ 返回 true（相等）还是 false？   │
  └──────────────────────────────────┘
       ↓              ↓
   true (相等)    false (不相等)
       ↓              ↓
  ┌──────────────┐   │
  │ ref 相同吗？ │   │
  └──────────────┘   │
       ↓              ↓
   true (相同)    false (改变)
       ↓              ↓
  ┌──────────────────────────────────┐
  │ 有其他更新吗？                   │
  │ (context, state, lanes)          │
  └──────────────────────────────────┘
       ↓              ↓
      No             Yes
       ↓              ↓
  ✅ bailout       ❌ 重新渲染
  跳过整个子树      调用组件函数
       ↓              ↓
  返回上次结果      创建新的 ReactElement
       ↓              ↓
  不执行组件函数    执行所有 hooks
       ↓              ↓
  性能优化成功！    diff 和 commit

┌────────────────────────────────────────────────────────────────┐
│  4. shallowEqual 比较细节                                      │
└────────────────────────────────────────────────────────────────┘

shallowEqual(prevProps, nextProps)
       ↓
  Step 1: Object.is(prevProps, nextProps)?
       ↓
    ┌─────┐
    │ Yes │ → return true（完全相同）
    └─────┘
       ↓ No
  Step 2: 都是对象吗？
       ↓
    ┌─────┐
    │ No  │ → return false（不是对象）
    └─────┘
       ↓ Yes
  Step 3: Object.keys 数量相同吗？
       ↓
    ┌─────┐
    │ No  │ → return false（key 数量不同）
    └─────┘
       ↓ Yes
  Step 4: 逐个比较每个 key 的值
       ↓
  for (let key of keysA) {
    if (!Object.is(prevProps[key], nextProps[key])) {
      return false;  // 有一个值不同
    }
  }
       ↓
  return true;  // 所有值都相同

┌────────────────────────────────────────────────────────────────┐
│  5. 性能优化的关键点                                           │
└────────────────────────────────────────────────────────────────┘

✅ Props 相等 + ref 相同 + 无其他更新
   → bailoutOnAlreadyFinishedWork
   → 跳过组件函数执行
   → 跳过 hooks 执行
   → 跳过子树 diff
   → 复用上次的结果

❌ Props 不相等 或 ref 改变 或 有其他更新
   → updateFunctionComponent
   → 执行组件函数
   → 执行所有 hooks
   → diff 子树
   → 可能的 DOM 更新`}
          </pre>
        </div>
      </div>

      {/* 第四部分：实战示例 */}
      <div style={{ background: '#fce4ec', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>🎮 实战示例</h2>
        
        <InteractiveDemo 
          parentCount={parentCount} 
          setParentCount={setParentCount}
          childCount={childCount}
          setChildCount={setChildCount}
          obj={obj}
          setObj={setObj}
        />
      </div>

      {/* 第五部分：常见陷阱 */}
      <div style={{ background: '#f3e5f5', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>⚠️ 常见陷阱与最佳实践</h2>
        
        <CommonPitfalls />
      </div>

      {/* 第六部分：总结 */}
      <div style={{ background: '#e0f2f1', padding: '20px', borderRadius: '8px' }}>
        <h2>📝 总结</h2>
        
        <Summary />
      </div>
    </div>
  );
}

// 交互式 Demo
function InteractiveDemo({ parentCount, setParentCount, childCount, setChildCount, obj, setObj }) {
  // 普通组件（不使用 memo）
  function NormalChild({ count }) {
    console.log('🔴 NormalChild 渲染了！');
    return (
      <div style={{ padding: '10px', background: '#ffcdd2', margin: '5px', borderRadius: '5px' }}>
        <strong>普通组件（无 memo）</strong>
        <p>Count: {count}</p>
        <p>每次父组件更新都会渲染</p>
      </div>
    );
  }

  // 使用 memo 的组件（默认浅比较）
  const MemoChild = memo(function MemoChild({ count }) {
    console.log('🟢 MemoChild 渲染了！');
    return (
      <div style={{ padding: '10px', background: '#c8e6c9', margin: '5px', borderRadius: '5px' }}>
        <strong>Memo 组件（默认浅比较）</strong>
        <p>Count: {count}</p>
        <p>只有 count 改变时才渲染</p>
      </div>
    );
  });

  // 使用 memo + 自定义比较的组件
  const CustomMemoChild = memo(
    function CustomMemoChild({ obj }) {
      console.log('🔵 CustomMemoChild 渲染了！');
      return (
        <div style={{ padding: '10px', background: '#bbdefb', margin: '5px', borderRadius: '5px' }}>
          <strong>Memo 组件（自定义比较）</strong>
          <p>Obj value: {obj.value}</p>
          <p>只比较 obj.value，忽略引用变化</p>
        </div>
      );
    },
    (prevProps, nextProps) => {
      // 只比较 obj.value
      console.log('🔍 自定义比较:', prevProps.obj.value, 'vs', nextProps.obj.value);
      return prevProps.obj.value === nextProps.obj.value;
    }
  );

  return (
    <div style={{ background: '#fff', padding: '15px', borderRadius: '5px' }}>
      <h3>交互式演示</h3>
      
      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={() => {
            console.clear();
            console.log('════════════════════════════════════');
            console.log('🔄 只更新 Parent Count（childCount 不变）');
            console.log('预期：NormalChild 渲染，MemoChild 不渲染');
            console.log('════════════════════════════════════');
            setParentCount(parentCount + 1);
          }}
          style={{
            padding: '10px 20px',
            fontSize: '14px',
            background: '#2196f3',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          更新 Parent Count: {parentCount}
        </button>

        <button
          onClick={() => {
            console.clear();
            console.log('════════════════════════════════════');
            console.log('🔄 更新 Child Count');
            console.log('预期：NormalChild 和 MemoChild 都渲染');
            console.log('════════════════════════════════════');
            setChildCount(childCount + 1);
          }}
          style={{
            padding: '10px 20px',
            fontSize: '14px',
            background: '#4caf50',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          更新 Child Count: {childCount}
        </button>

        <button
          onClick={() => {
            console.clear();
            console.log('════════════════════════════════════');
            console.log('🔄 更新 Obj（新对象，但 value 不变）');
            console.log('预期：CustomMemoChild 不渲染（自定义比较）');
            console.log('════════════════════════════════════');
            setObj({ value: obj.value }); // 新对象，但 value 相同
          }}
          style={{
            padding: '10px 20px',
            fontSize: '14px',
            background: '#ff9800',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          更新 Obj（引用）: {obj.value}
        </button>

        <button
          onClick={() => {
            console.clear();
            console.log('════════════════════════════════════');
            console.log('🔄 更新 Obj.value');
            console.log('预期：CustomMemoChild 渲染');
            console.log('════════════════════════════════════');
            setObj({ value: obj.value + 1 }); // 新对象，value 改变
          }}
          style={{
            padding: '10px 20px',
            fontSize: '14px',
            background: '#e91e63',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          更新 Obj Value
        </button>
      </div>

      <div>
        <NormalChild count={childCount} />
        <MemoChild count={childCount} />
        <CustomMemoChild obj={obj} />
      </div>

      <div style={{ background: '#fff9c4', padding: '15px', marginTop: '15px', borderRadius: '5px' }}>
        <h4>🔍 观察要点（查看控制台）：</h4>
        <ul>
          <li><strong>点击 "更新 Parent Count"：</strong> 只有 NormalChild 渲染，MemoChild 跳过（props 未变）</li>
          <li><strong>点击 "更新 Child Count"：</strong> NormalChild 和 MemoChild 都渲染（props 改变）</li>
          <li><strong>点击 "更新 Obj（引用）"：</strong> CustomMemoChild 不渲染（自定义比较只看 value）</li>
          <li><strong>点击 "更新 Obj Value"：</strong> CustomMemoChild 渲染（value 改变）</li>
        </ul>
      </div>
    </div>
  );
}

// 常见陷阱
function CommonPitfalls() {
  return (
    <div style={{ background: '#fff', padding: '15px', borderRadius: '5px' }}>
      <h3>常见陷阱</h3>
      
      <div style={{ background: '#ffebee', padding: '10px', marginBottom: '10px', borderRadius: '5px' }}>
        <h4>❌ 陷阱 1：每次传递新对象/数组</h4>
        <pre style={{ background: '#fff', padding: '10px', fontSize: '13px' }}>
{`// ❌ 错误：每次渲染都创建新对象
function Parent() {
  return <MemoChild config={{ theme: 'dark' }} />;
  // 每次渲染 config 都是新对象，memo 失效
}

// ✅ 正确：使用 useMemo
function Parent() {
  const config = useMemo(() => ({ theme: 'dark' }), []);
  return <MemoChild config={config} />;
}`}
        </pre>
      </div>

      <div style={{ background: '#ffebee', padding: '10px', marginBottom: '10px', borderRadius: '5px' }}>
        <h4>❌ 陷阱 2：每次传递新函数</h4>
        <pre style={{ background: '#fff', padding: '10px', fontSize: '13px' }}>
{`// ❌ 错误：每次渲染都创建新函数
function Parent() {
  return <MemoChild onClick={() => console.log('click')} />;
  // 每次渲染 onClick 都是新函数，memo 失效
}

// ✅ 正确：使用 useCallback
function Parent() {
  const handleClick = useCallback(() => console.log('click'), []);
  return <MemoChild onClick={handleClick} />;
}`}
        </pre>
      </div>

      <div style={{ background: '#ffebee', padding: '10px', marginBottom: '10px', borderRadius: '5px' }}>
        <h4>❌ 陷阱 3：children props</h4>
        <pre style={{ background: '#fff', padding: '10px', fontSize: '13px' }}>
{`// ❌ 问题：children 每次都是新的 ReactElement
function Parent() {
  return (
    <MemoWrapper>
      <Child />
    </MemoWrapper>
  );
  // children 每次都是新创建的，memo 可能失效
}

// ✅ 解决：将 children 提升或使用 useMemo
function Parent() {
  const child = useMemo(() => <Child />, []);
  return <MemoWrapper>{child}</MemoWrapper>;
}`}
        </pre>
      </div>

      <div style={{ background: '#e3f2fd', padding: '10px', borderRadius: '5px' }}>
        <h4>✅ 最佳实践</h4>
        <ul style={{ fontSize: '14px' }}>
          <li>✅ 对象/数组 props 使用 <code>useMemo</code></li>
          <li>✅ 函数 props 使用 <code>useCallback</code></li>
          <li>✅ 只在渲染开销大的组件使用 memo</li>
          <li>✅ 考虑使用自定义比较函数处理复杂 props</li>
          <li>❌ 不要过度使用 memo（有性能开销）</li>
          <li>❌ memo 无法阻止 context 或内部 state 导致的重渲染</li>
        </ul>
      </div>
    </div>
  );
}

// 总结
function Summary() {
  return (
    <div style={{ background: '#fff', padding: '15px', borderRadius: '5px' }}>
      <h3>React.memo 实现原理总结</h3>
      
      <div style={{ background: '#e3f2fd', padding: '15px', marginBottom: '15px', borderRadius: '5px' }}>
        <h4>1. 创建阶段</h4>
        <pre style={{ background: '#fff', padding: '10px', fontSize: '13px' }}>
{`React.memo(Component, compare) 返回：
{
  $$typeof: REACT_MEMO_TYPE,
  type: Component,
  compare: compare || null
}`}
        </pre>
      </div>

      <div style={{ background: '#e8f5e9', padding: '15px', marginBottom: '15px', borderRadius: '5px' }}>
        <h4>2. 首次挂载</h4>
        <ul style={{ fontSize: '14px' }}>
          <li>检查是否是简单函数组件</li>
          <li>简单 → SimpleMemoComponent（快速路径）</li>
          <li>复杂 → MemoComponent（普通路径）</li>
          <li>创建内部组件 Fiber 并正常渲染</li>
        </ul>
      </div>

      <div style={{ background: '#fff9c4', padding: '15px', marginBottom: '15px', borderRadius: '5px' }}>
        <h4>3. 更新阶段（关键）</h4>
        <pre style={{ background: '#fff', padding: '10px', fontSize: '13px' }}>
{`比较流程：
1. 获取 prevProps 和 nextProps
2. 使用 compare 函数比较（默认 shallowEqual）
3. 检查 ref 是否相同
4. 检查是否有其他更新（context、state）

如果都满足：
  → bailoutOnAlreadyFinishedWork
  → 跳过组件函数执行
  → 跳过子树渲染
  → 性能优化成功！

否则：
  → updateFunctionComponent
  → 正常渲染流程`}
        </pre>
      </div>

      <div style={{ background: '#fce4ec', padding: '15px', borderRadius: '5px' }}>
        <h4>4. shallowEqual 浅比较</h4>
        <ul style={{ fontSize: '14px' }}>
          <li>使用 Object.is 比较对象本身</li>
          <li>比较对象的第一层属性</li>
          <li>不递归比较嵌套对象</li>
          <li>嵌套对象比较引用，不比较内容</li>
        </ul>
      </div>

      <div style={{ background: '#e0f2f1', padding: '15px', marginTop: '15px', borderRadius: '5px' }}>
        <h4>💡 核心要点</h4>
        <ul style={{ fontSize: '14px', lineHeight: '1.8' }}>
          <li>✅ React.memo 是性能优化工具，不是功能</li>
          <li>✅ 默认使用 shallowEqual 比较 props</li>
          <li>✅ 可以自定义比较函数</li>
          <li>✅ 无法阻止 context 或内部 state 变化导致的重渲染</li>
          <li>✅ 配合 useMemo/useCallback 使用效果更佳</li>
          <li>⚠️ 比较本身有开销，不要过度使用</li>
          <li>⚠️ 主要用于渲染开销大的组件</li>
        </ul>
      </div>
    </div>
  );
}
