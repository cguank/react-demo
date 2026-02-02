import React, { useState } from 'react';

/**
 * React Hooks 如何检测条件语句中的使用并报错
 * 
 * 核心问题：
 * 1. Hooks 在哪里检测顺序变化？
 * 2. 如何判断 Hook 在 if 中被调用？
 * 3. 报错是什么时机触发的？
 * 4. 实现原理是什么？
 */

export default function HookOrderCheckAnalysis() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>⚛️ React Hooks 顺序检查原理</h1>
      
      {/* 第一部分：核心答案 */}
      <div style={{ background: '#fff3e0', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>🎯 核心答案</h2>
        
        <CoreAnswer />
      </div>

      {/* 第二部分：检测机制 */}
      <div style={{ background: '#e3f2fd', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>🔍 检测机制详解</h2>
        
        <DetectionMechanism />
      </div>

      {/* 第三部分：源码分析 */}
      <div style={{ background: '#e8f5e9', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>📂 源码分析</h2>
        
        <SourceCodeAnalysis />
      </div>

      {/* 第四部分：错误场景 */}
      <div style={{ background: '#fce4ec', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>⚠️ 会触发错误的场景</h2>
        
        <ErrorScenarios />
      </div>

      {/* 第五部分：实际示例 */}
      <div style={{ background: '#f3e5f5', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>🎮 实际示例</h2>
        
        <PracticalExamples />
      </div>

      {/* 第六部分：总结 */}
      <div style={{ background: '#e0f2f1', padding: '20px', borderRadius: '8px' }}>
        <h2>📝 总结</h2>
        
        <FinalSummary />
      </div>
    </div>
  );
}

// 核心答案
function CoreAnswer() {
  return (
    <div style={{ background: '#fff', padding: '15px', borderRadius: '5px' }}>
      <h3>Hook 不能在 if 中使用的检测原理</h3>
      
      <pre style={{ background: '#f5f5f5', padding: '15px', overflow: 'auto', fontSize: '14px' }}>
{`关键点：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. React 不是直接检测 if 语句！
   而是检测 Hook 的调用数量是否和上次渲染一致。

2. 检测位置：
   在 updateWorkInProgressHook 函数中
   
3. 检测时机：
   每次调用 Hook 时（useState、useEffect 等）
   
4. 检测方式：
   通过链表指针对比：
   - 上次渲染的 Hook 链表（current.memoizedState）
   - 本次渲染的 Hook 调用顺序
   
5. 报错条件：
   - 多了 Hook：nextCurrentHook === null
     → "Rendered more hooks than during the previous render"
   
   - 少了 Hook：didRenderTooFewHooks = true
     → "Rendered fewer hooks than expected"

实现原理：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

首次渲染（Mount）：
  useState() → mountWorkInProgressHook()
             → 创建 Hook 对象，加入链表

更新渲染（Update）：
  useState() → updateWorkInProgressHook()
             → 从上次的链表中获取对应的 Hook
             → 如果获取不到（null）→ 报错！

关键：React 依赖 Hook 的调用顺序保持一致！`}
      </pre>
    </div>
  );
}

// 检测机制
function DetectionMechanism() {
  return (
    <div style={{ background: '#fff', padding: '15px', borderRadius: '5px' }}>
      <h3>Hook 链表机制</h3>
      
      <pre style={{ background: '#f5f5f5', padding: '15px', overflow: 'auto', fontSize: '13px', lineHeight: '1.8' }}>
{`Hook 的存储结构：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

每个 Fiber 节点有一个 memoizedState 属性，指向第一个 Hook：

Fiber {
  memoizedState: Hook1,  // 第一个 Hook
  // ...
}

Hook 是一个单链表：

Hook1 → Hook2 → Hook3 → null
  ↓       ↓       ↓
state1  state2  state3

每个 Hook 对象：
{
  memoizedState: any,      // Hook 的状态值
  baseState: any,
  baseQueue: Update | null,
  queue: any,
  next: Hook | null        // 指向下一个 Hook
}

渲染过程中的指针：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

全局变量：
- currentlyRenderingFiber: 当前正在渲染的 Fiber
- currentHook: 上次渲染的 Hook 链表的当前指针
- workInProgressHook: 本次渲染的 Hook 链表的当前指针

首次渲染（Mount）：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function Component() {
  const [a, setA] = useState(0);  // Hook 1
  const [b, setB] = useState(0);  // Hook 2
  const [c, setC] = useState(0);  // Hook 3
}

执行流程：

1. useState(0) - Hook 1
   ↓
   mountWorkInProgressHook()
   ↓
   创建 Hook1 = { memoizedState: 0, next: null }
   ↓
   Fiber.memoizedState = Hook1
   workInProgressHook = Hook1

2. useState(0) - Hook 2
   ↓
   mountWorkInProgressHook()
   ↓
   创建 Hook2 = { memoizedState: 0, next: null }
   ↓
   Hook1.next = Hook2
   workInProgressHook = Hook2

3. useState(0) - Hook 3
   ↓
   mountWorkInProgressHook()
   ↓
   创建 Hook3 = { memoizedState: 0, next: null }
   ↓
   Hook2.next = Hook3
   workInProgressHook = Hook3

结果：
Fiber.memoizedState → Hook1 → Hook2 → Hook3 → null

更新渲染（Update）- 正常情况：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function Component() {
  const [a, setA] = useState(0);  // Hook 1
  const [b, setB] = useState(0);  // Hook 2
  const [c, setC] = useState(0);  // Hook 3
}

上次渲染：Hook1 → Hook2 → Hook3 → null

执行流程：

1. useState(0) - Hook 1
   ↓
   updateWorkInProgressHook()
   ↓
   currentHook = null (第一个)
   nextCurrentHook = current.memoizedState = Hook1  ✅
   ↓
   克隆 Hook1 → newHook1
   currentHook = Hook1
   workInProgressHook = newHook1

2. useState(0) - Hook 2
   ↓
   updateWorkInProgressHook()
   ↓
   currentHook = Hook1
   nextCurrentHook = currentHook.next = Hook2  ✅
   ↓
   克隆 Hook2 → newHook2
   currentHook = Hook2
   workInProgressHook = newHook2

3. useState(0) - Hook 3
   ↓
   updateWorkInProgressHook()
   ↓
   currentHook = Hook2
   nextCurrentHook = currentHook.next = Hook3  ✅
   ↓
   克隆 Hook3 → newHook3
   currentHook = Hook3
   workInProgressHook = newHook3

结果：成功！每个 Hook 都找到了对应的上次的 Hook

更新渲染（Update）- 多了 Hook（在 if 中）：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

首次渲染：
function Component({ flag }) {
  const [a, setA] = useState(0);  // Hook 1
  // flag = false，不执行下面的
  return null;
}

Hook 链表：Hook1 → null

更新渲染：
function Component({ flag }) {
  const [a, setA] = useState(0);  // Hook 1
  if (flag) {  // flag = true，执行下面的
    const [b, setB] = useState(0);  // Hook 2 ❌
  }
  return null;
}

执行流程：

1. useState(0) - Hook 1
   ↓
   updateWorkInProgressHook()
   ↓
   nextCurrentHook = current.memoizedState = Hook1  ✅
   成功

2. useState(0) - Hook 2（新增的）
   ↓
   updateWorkInProgressHook()
   ↓
   currentHook = Hook1
   nextCurrentHook = currentHook.next = null  ❌
   ↓
   if (nextCurrentHook === null) {
     throw new Error(
       'Rendered more hooks than during the previous render.'
     );
   }

报错！因为上次没有 Hook2，现在突然多了一个！

更新渲染（Update）- 少了 Hook（提前 return）：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

首次渲染：
function Component({ flag }) {
  const [a, setA] = useState(0);  // Hook 1
  const [b, setB] = useState(0);  // Hook 2
  return null;
}

Hook 链表：Hook1 → Hook2 → null

更新渲染：
function Component({ flag }) {
  const [a, setA] = useState(0);  // Hook 1
  if (flag) {
    return null;  // 提前返回 ❌
  }
  const [b, setB] = useState(0);  // Hook 2 没执行到
  return null;
}

执行流程：

1. useState(0) - Hook 1
   ↓
   updateWorkInProgressHook()
   ↓
   nextCurrentHook = current.memoizedState = Hook1  ✅
   成功

2. return null（提前返回，Hook 2 没调用）

3. finishHooks() 检查
   ↓
   currentHook = Hook1
   currentHook.next = Hook2 !== null  ❌
   ↓
   didRenderTooFewHooks = true
   ↓
   throw new Error(
     'Rendered fewer hooks than expected. This may be caused by an ' +
     'accidental early return statement.'
   );

报错！因为上次有 Hook2，这次少了！`}
      </pre>
    </div>
  );
}

// 源码分析
function SourceCodeAnalysis() {
  return (
    <div style={{ background: '#fff', padding: '15px', borderRadius: '5px' }}>
      <h3>关键源码片段</h3>
      
      <div style={{ marginBottom: '20px' }}>
        <h4>1. updateWorkInProgressHook - 更新时的 Hook 获取</h4>
        <pre style={{ background: '#f5f5f5', padding: '10px', fontSize: '13px' }}>
{`// packages/react-reconciler/src/ReactFiberHooks.old.js (line 663-720)

function updateWorkInProgressHook(): Hook {
  // 获取下一个 current Hook
  let nextCurrentHook: null | Hook;
  if (currentHook === null) {
    // 第一个 Hook
    const current = currentlyRenderingFiber.alternate;
    if (current !== null) {
      nextCurrentHook = current.memoizedState;  // 从 Fiber 获取第一个 Hook
    } else {
      nextCurrentHook = null;
    }
  } else {
    // 后续 Hook
    nextCurrentHook = currentHook.next;  // 从链表获取下一个
  }
  
  let nextWorkInProgressHook: null | Hook;
  if (workInProgressHook === null) {
    nextWorkInProgressHook = currentlyRenderingFiber.memoizedState;
  } else {
    nextWorkInProgressHook = workInProgressHook.next;
  }
  
  if (nextWorkInProgressHook !== null) {
    // 有 work-in-progress，复用
    workInProgressHook = nextWorkInProgressHook;
    nextWorkInProgressHook = workInProgressHook.next;
    currentHook = nextCurrentHook;
  } else {
    // 克隆 current hook
    
    // 🔥 关键检查！
    if (nextCurrentHook === null) {
      throw new Error('Rendered more hooks than during the previous render.');
      // 翻译：本次渲染的 Hook 比上次多了！
      // 原因：上次到这里已经是链表末尾（null），
      //      但本次还在调用新的 Hook
    }
    
    currentHook = nextCurrentHook;
    
    // 克隆 Hook
    const newHook: Hook = {
      memoizedState: currentHook.memoizedState,
      baseState: currentHook.baseState,
      baseQueue: currentHook.baseQueue,
      queue: currentHook.queue,
      next: null,
    };
    
    if (workInProgressHook === null) {
      // 第一个 Hook
      currentlyRenderingFiber.memoizedState = workInProgressHook = newHook;
    } else {
      // 追加到链表
      workInProgressHook = workInProgressHook.next = newHook;
    }
  }
  return workInProgressHook;
}

关键：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

每次调用 Hook（useState、useEffect 等），都会调用 updateWorkInProgressHook。
它会尝试从上次的 Hook 链表中获取对应位置的 Hook。

如果 nextCurrentHook === null，说明上次到这里已经没有 Hook 了，
但本次还在调用新的 Hook，说明 Hook 数量增加了 → 报错！

这就是为什么在 if 中新增 Hook 会报错的原因：
- 首次：if (false) → 没调用 Hook → 链表短
- 更新：if (true)  → 调用了 Hook → 链表长了 → 报错！`}
        </pre>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h4>2. finishHooks - 渲染结束后的检查</h4>
        <pre style={{ background: '#f5f5f5', padding: '10px', fontSize: '13px' }}>
{`// packages/react-reconciler/src/ReactFiberHooks.old.js (line 525-533)

function finishHooks(...) {
  // 渲染完成后的清理和检查
  
  // 🔥 关键检查！
  if (didRenderTooFewHooks) {
    throw new Error(
      'Rendered fewer hooks than expected. This may be caused by an accidental ' +
      'early return statement.',
    );
    // 翻译：本次渲染的 Hook 比预期少了！
    // 原因：可能是提前 return，导致后面的 Hook 没执行
  }
  
  // ... 其他清理工作
}

didRenderTooFewHooks 何时设置？
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

在 renderWithHooks 函数的最后：

function renderWithHooks(...) {
  // 执行组件函数
  let children = Component(props);
  
  // 检查是否有未使用的 Hook
  if (currentHook !== null && currentHook.next !== null) {
    // 还有剩余的 Hook 没有被访问
    didRenderTooFewHooks = true;
  }
  
  finishHooks();  // 会检查并报错
}

这就是为什么提前 return 会报错的原因：
- 首次：正常执行所有 Hook → 链表长
- 更新：提前 return → 后面的 Hook 没执行 → 链表短 → 报错！`}
        </pre>
      </div>

      <div>
        <h4>3. mountWorkInProgressHook - 首次渲染</h4>
        <pre style={{ background: '#f5f5f5', padding: '10px', fontSize: '13px' }}>
{`// packages/react-reconciler/src/ReactFiberHooks.old.js (line 636-655)

function mountWorkInProgressHook(): Hook {
  // 创建新的 Hook 对象
  const hook: Hook = {
    memoizedState: null,
    baseState: null,
    baseQueue: null,
    queue: null,
    next: null,
  };
  
  if (workInProgressHook === null) {
    // 第一个 Hook
    currentlyRenderingFiber.memoizedState = workInProgressHook = hook;
  } else {
    // 追加到链表末尾
    workInProgressHook = workInProgressHook.next = hook;
  }
  
  return workInProgressHook;
}

首次渲染时：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

每次调用 Hook，都创建一个新的 Hook 对象，加入链表。
建立了初始的 Hook 链表结构。

后续更新时，必须保持相同的调用顺序，才能正确匹配！`}
        </pre>
      </div>
    </div>
  );
}

// 错误场景
function ErrorScenarios() {
  return (
    <div style={{ background: '#fff', padding: '15px', borderRadius: '5px' }}>
      <h3>会触发错误的典型场景</h3>
      
      <div style={{ marginBottom: '20px' }}>
        <h4>❌ 场景 1：在 if 中使用 Hook</h4>
        <pre style={{ background: '#ffebee', padding: '10px', fontSize: '13px' }}>
{`function Component({ showMore }) {
  const [count, setCount] = useState(0);
  
  if (showMore) {
    const [text, setText] = useState('');  // ❌ 错误！
  }
  
  return <div>{count}</div>;
}

问题：
- showMore = false 时：只有 1 个 Hook
- showMore = true 时：有 2 个 Hook
→ Hook 数量不一致 → 报错！`}
        </pre>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h4>❌ 场景 2：提前 return</h4>
        <pre style={{ background: '#ffebee', padding: '10px', fontSize: '13px' }}>
{`function Component({ loading }) {
  const [count, setCount] = useState(0);
  
  if (loading) {
    return <div>Loading...</div>;  // ❌ 错误！
  }
  
  const [text, setText] = useState('');
  return <div>{count} {text}</div>;
}

问题：
- loading = false 时：有 2 个 Hook
- loading = true 时：只有 1 个 Hook（提前 return）
→ Hook 数量不一致 → 报错！`}
        </pre>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h4>❌ 场景 3：在循环中使用 Hook</h4>
        <pre style={{ background: '#ffebee', padding: '10px', fontSize: '13px' }}>
{`function Component({ items }) {
  const [count, setCount] = useState(0);
  
  for (let i = 0; i < items.length; i++) {
    const [value, setValue] = useState(items[i]);  // ❌ 错误！
  }
  
  return <div>{count}</div>;
}

问题：
- items.length = 2 时：有 3 个 Hook（1 + 2）
- items.length = 3 时：有 4 个 Hook（1 + 3）
→ Hook 数量不一致 → 报错！`}
        </pre>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h4>❌ 场景 4：在回调中使用 Hook</h4>
        <pre style={{ background: '#ffebee', padding: '10px', fontSize: '13px' }}>
{`function Component() {
  const [count, setCount] = useState(0);
  
  const handleClick = () => {
    const [temp, setTemp] = useState(0);  // ❌ 错误！
  };
  
  return <button onClick={handleClick}>{count}</button>;
}

问题：
- 渲染时只有 1 个 Hook
- 点击后在回调中调用 Hook（不在渲染阶段）
→ Hook 在错误的时机被调用 → 报错！`}
        </pre>
      </div>

      <div>
        <h4>✅ 正确做法</h4>
        <pre style={{ background: '#e8f5e9', padding: '10px', fontSize: '13px' }}>
{`// ✅ 正确：始终调用相同数量的 Hook
function Component({ showMore }) {
  const [count, setCount] = useState(0);
  const [text, setText] = useState('');  // 始终调用
  
  return (
    <div>
      {count}
      {showMore && text}  // 条件渲染，不是条件 Hook
    </div>
  );
}

// ✅ 正确：使用 null 或默认值
function Component({ loading }) {
  const [count, setCount] = useState(0);
  const [text, setText] = useState('');
  
  if (loading) {
    return <div>Loading...</div>;  // 可以提前 return，但 Hook 已调用
  }
  
  return <div>{count} {text}</div>;
}

// ✅ 正确：不在循环中使用 Hook
function Component({ items }) {
  const [count, setCount] = useState(0);
  const [values, setValues] = useState(items);  // 用一个 Hook 存储数组
  
  return <div>{count}</div>;
}`}
        </pre>
      </div>
    </div>
  );
}

// 实际示例
function PracticalExamples() {
  return (
    <div style={{ background: '#fff', padding: '15px', borderRadius: '5px' }}>
      <h3>错误示例和报错信息</h3>
      
      <pre style={{ background: '#f5f5f5', padding: '15px', overflow: 'auto', fontSize: '13px', lineHeight: '1.8' }}>
{`示例代码：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function App({ loadC }) {
  const [a, setA] = useState(0);
  const [b, setB] = useState(0);
  
  if (loadC) {
    const [c, setC] = useState(0);  // ❌ 条件 Hook
  }
  
  return <div>{a} {b}</div>;
}

首次渲染：loadC = false
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

useState(0) → Hook1
useState(0) → Hook2

Hook 链表：Hook1 → Hook2 → null

更新渲染：loadC = true
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

useState(0) → updateWorkInProgressHook()
            → nextCurrentHook = Hook1 ✅

useState(0) → updateWorkInProgressHook()
            → nextCurrentHook = Hook2 ✅

useState(0) → updateWorkInProgressHook()
            → nextCurrentHook = Hook2.next = null ❌
            → throw Error!

报错信息：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Error: Rendered more hooks than during the previous render.

控制台警告（开发模式）：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Warning: React has detected a change in the order of Hooks called by App.
This will lead to bugs and errors if not fixed.
For more information, read the Rules of Hooks: https://reactjs.org/link/rules-of-hooks

   Previous render            Next render
   ------------------------------------------------------
1. useState                   useState
2. useState                   useState
3. undefined                  useState
   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

解释：
- Previous render（上次渲染）：只有 2 个 Hook
- Next render（本次渲染）：有 3 个 Hook
- 第 3 个位置：上次是 undefined（不存在），本次是 useState

示例 2：提前 return
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function App({ showMore }) {
  const [a, setA] = useState(0);
  
  if (showMore) {
    return null;  // ❌ 提前返回
  }
  
  const [b, setB] = useState(0);
  return <div>{a} {b}</div>;
}

首次渲染：showMore = false
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

useState(0) → Hook1
useState(0) → Hook2

Hook 链表：Hook1 → Hook2 → null

更新渲染：showMore = true
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

useState(0) → updateWorkInProgressHook()
            → nextCurrentHook = Hook1 ✅

return null  → 提前返回，useState(0) 没有调用

finishHooks() → currentHook = Hook1
              → currentHook.next = Hook2 !== null ❌
              → didRenderTooFewHooks = true
              → throw Error!

报错信息：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Error: Rendered fewer hooks than expected. 
This may be caused by an accidental early return statement.`}
      </pre>
    </div>
  );
}

// 总结
function FinalSummary() {
  return (
    <div style={{ background: '#fff', padding: '15px', borderRadius: '5px' }}>
      <h3>核心要点总结</h3>
      
      <div style={{ background: '#e3f2fd', padding: '15px', marginBottom: '15px', borderRadius: '5px' }}>
        <h4>1. React 不直接检测 if 语句</h4>
        <p style={{ fontSize: '14px' }}>
          React 检测的是 Hook 的调用数量和顺序是否一致，而不是检测代码中的 if 语句。
        </p>
      </div>

      <div style={{ background: '#e8f5e9', padding: '15px', marginBottom: '15px', borderRadius: '5px' }}>
        <h4>2. 检测位置</h4>
        <ul style={{ fontSize: '14px' }}>
          <li><strong>updateWorkInProgressHook：</strong>每次调用 Hook 时检查</li>
          <li><strong>finishHooks：</strong>渲染结束后检查</li>
        </ul>
      </div>

      <div style={{ background: '#fff9c4', padding: '15px', marginBottom: '15px', borderRadius: '5px' }}>
        <h4>3. 检测原理</h4>
        <ul style={{ fontSize: '14px' }}>
          <li>Hook 存储在单链表中</li>
          <li>首次渲染建立链表</li>
          <li>更新时按顺序遍历链表</li>
          <li>如果对不上（null）→ 报错</li>
        </ul>
      </div>

      <div style={{ background: '#ffebee', padding: '15px', marginBottom: '15px', borderRadius: '5px' }}>
        <h4>4. 两种错误</h4>
        <ul style={{ fontSize: '14px' }}>
          <li><strong>多了 Hook：</strong>"Rendered more hooks than during the previous render"</li>
          <li><strong>少了 Hook：</strong>"Rendered fewer hooks than expected"</li>
        </ul>
      </div>

      <div style={{ background: '#e0f2f1', padding: '15px', borderRadius: '5px' }}>
        <h4>💡 核心规则</h4>
        <pre style={{ background: '#fff', padding: '10px', fontSize: '14px' }}>
{`✅ 必须保证：
每次渲染时，Hook 的调用数量和顺序完全一致

❌ 不能做：
- 在 if 中调用 Hook（可能改变数量）
- 在循环中调用 Hook（可能改变数量）
- 提前 return（可能改变数量）
- 在回调中调用 Hook（不在渲染阶段）

原因：
React 依赖固定的 Hook 链表结构来保存状态
如果顺序变了，状态就对不上了！`}
        </pre>
      </div>
    </div>
  );
}
