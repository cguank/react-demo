import React, { useState } from 'react';

/**
 * didRenderTooFewHooks 检测原理详解
 * 
 * 源码位置：ReactFiberHooks.old.js line 488-489
 * const didRenderTooFewHooks = currentHook !== null && currentHook.next !== null;
 */

export default function DidRenderTooFewHooksAnalysis() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🔍 didRenderTooFewHooks 检测原理</h1>
      
      {/* 核心代码 */}
      <div style={{ background: '#fff3e0', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>📌 核心代码</h2>
        <CoreCode />
      </div>

      {/* 检测逻辑 */}
      <div style={{ background: '#e3f2fd', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>🎯 检测逻辑详解</h2>
        <DetectionLogic />
      </div>

      {/* 执行流程 */}
      <div style={{ background: '#e8f5e9', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>⚙️ 执行流程</h2>
        <ExecutionFlow />
      </div>

      {/* 具体场景 */}
      <div style={{ background: '#fce4ec', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>📊 具体场景分析</h2>
        <ScenarioAnalysis />
      </div>

      {/* 可视化演示 */}
      <div style={{ background: '#f3e5f5', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>🎮 可视化演示</h2>
        <VisualizationDemo />
      </div>

      {/* 总结 */}
      <div style={{ background: '#e0f2f1', padding: '20px', borderRadius: '8px' }}>
        <h2>📝 总结</h2>
        <Summary />
      </div>
    </div>
  );
}

// 核心代码
function CoreCode() {
  return (
    <div style={{ background: '#fff', padding: '15px', borderRadius: '5px' }}>
      <h3>源码位置：ReactFiberHooks.old.js</h3>
      
      <pre style={{ background: '#f5f5f5', padding: '15px', overflow: 'auto', fontSize: '13px', lineHeight: '1.8' }}>
{`// line 379-556: renderWithHooks 函数
export function renderWithHooks<Props, SecondArg>(
  current: Fiber | null,
  workInProgress: Fiber,
  Component: (p: Props, arg: SecondArg) => any,
  props: Props,
  secondArg: SecondArg,
  nextRenderLanes: Lanes,
): any {
  renderLanes = nextRenderLanes;
  currentlyRenderingFiber = workInProgress;
  
  // 初始化
  workInProgress.memoizedState = null;
  workInProgress.updateQueue = null;
  workInProgress.lanes = NoLanes;
  
  // 设置 Dispatcher（Mount 或 Update）
  ReactCurrentDispatcher.current =
    current === null || current.memoizedState === null
      ? HooksDispatcherOnMount    // 首次渲染
      : HooksDispatcherOnUpdate;  // 更新渲染
  
  // 🔥 执行组件函数，调用所有 Hook
  let children = Component(props, secondArg);
  
  // ... 处理渲染阶段更新 ...
  
  // 组件函数执行完毕后的清理工作
  ReactCurrentDispatcher.current = ContextOnlyDispatcher;
  
  // 🔥🔥🔥 关键检测逻辑（line 488-489）
  const didRenderTooFewHooks =
    currentHook !== null && currentHook.next !== null;
  
  // 清理全局变量
  renderLanes = NoLanes;
  currentlyRenderingFiber = null;
  currentHook = null;
  workInProgressHook = null;
  
  // 🔥 如果检测到 Hook 数量少了，抛出错误（line 528-533）
  if (didRenderTooFewHooks) {
    throw new Error(
      'Rendered fewer hooks than expected. This may be caused by an accidental ' +
      'early return statement.',
    );
  }
  
  return children;
}

关键变量说明：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

currentHook: 
  - 全局变量，指向上次渲染的 Hook 链表的当前位置
  - 每次调用 Hook（useState 等）时，会移动到下一个
  - 初始值：null
  - 更新时从 current.memoizedState 开始

workInProgressHook:
  - 全局变量，指向本次渲染的 Hook 链表的当前位置
  - 每次调用 Hook 时，会创建或复用，然后移动到下一个
  - 初始值：null

Hook 链表示例：
Hook1 → Hook2 → Hook3 → null
  ↑       ↑       ↑
第1个    第2个    第3个`}
      </pre>
    </div>
  );
}

// 检测逻辑
function DetectionLogic() {
  return (
    <div style={{ background: '#fff', padding: '15px', borderRadius: '5px' }}>
      <h3>检测表达式详解</h3>
      
      <pre style={{ background: '#f5f5f5', padding: '15px', overflow: 'auto', fontSize: '14px', lineHeight: '1.8' }}>
{`const didRenderTooFewHooks = currentHook !== null && currentHook.next !== null;

这个表达式的含义：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

条件 1: currentHook !== null
  含义：currentHook 还指向某个 Hook 对象
  说明：还没遍历完上次的 Hook 链表

条件 2: currentHook.next !== null
  含义：currentHook 后面还有其他 Hook
  说明：上次的 Hook 链表还有未访问的节点

如果两个条件都满足：
  → 说明上次的 Hook 链表有更多的 Hook
  → 但本次渲染提前结束了（没调用所有 Hook）
  → 检测到：Rendered fewer hooks（渲染的 Hook 比预期少）

为什么这样能检测出问题？
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

在 renderWithHooks 中：

1. 调用 Component(props) 前：
   currentHook = null（初始状态）

2. 执行组件函数期间：
   每次调用 Hook（useState 等）：
   → updateWorkInProgressHook() 被调用
   → currentHook 向前移动一步
   
   正常情况：
   Hook1 调用 → currentHook = Hook1
   Hook2 调用 → currentHook = Hook2
   Hook3 调用 → currentHook = Hook3
   没有更多 Hook → currentHook.next = null ✅

3. Component(props) 执行完毕后：
   检查 currentHook 的状态：
   
   ✅ 正常情况（所有 Hook 都调用了）：
   currentHook = Hook3
   currentHook.next = null
   → didRenderTooFewHooks = false
   
   ❌ 异常情况（提前 return，Hook 没调完）：
   currentHook = Hook2  // 只调用到第2个
   currentHook.next = Hook3  // 后面还有未调用的！
   → didRenderTooFewHooks = true → 报错！

核心原理：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

currentHook 是一个"指针"，记录了我们在上次 Hook 链表中的位置。

- 如果正常遍历完所有 Hook：
  currentHook 会停在链表末尾，next = null

- 如果提前结束（比如提前 return）：
  currentHook 会停在中间某个位置，next !== null
  
这就暴露了问题：本次渲染的 Hook 调用次数比上次少！

图示：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

上次渲染：Hook1 → Hook2 → Hook3 → null

本次渲染（正常）：
  调用 useState() → currentHook = Hook1
  调用 useState() → currentHook = Hook2
  调用 useState() → currentHook = Hook3
  组件执行完毕 → currentHook = Hook3, Hook3.next = null ✅
  
本次渲染（提前 return）：
  调用 useState() → currentHook = Hook1
  提前 return    → 没有继续调用其他 Hook
  组件执行完毕 → currentHook = Hook1, Hook1.next = Hook2 ❌
                  ↑
            后面还有未访问的 Hook！`}
      </pre>
    </div>
  );
}

// 执行流程
function ExecutionFlow() {
  return (
    <div style={{ background: '#fff', padding: '15px', borderRadius: '5px' }}>
      <h3>完整执行流程</h3>
      
      <pre style={{ background: '#f5f5f5', padding: '15px', overflow: 'auto', fontSize: '13px', lineHeight: '1.8' }}>
{`场景：组件提前 return，导致 Hook 调用不完整

组件代码：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function App({ loading }) {
  const [count, setCount] = useState(0);     // Hook 1
  const [name, setName] = useState('Tom');   // Hook 2
  
  if (loading) {
    return <div>Loading...</div>;  // ❌ 提前 return
  }
  
  const [age, setAge] = useState(18);        // Hook 3
  return <div>{count} {name} {age}</div>;
}

首次渲染：loading = false
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Step 1: renderWithHooks 开始
  currentHook = null
  workInProgressHook = null
  ReactCurrentDispatcher.current = HooksDispatcherOnMount

Step 2: 执行 Component(props)
  
  2.1: useState(0)  // Hook 1
    → mountWorkInProgressHook()
    → 创建 Hook1
    → workInProgressHook = Hook1
    → Fiber.memoizedState = Hook1
  
  2.2: useState('Tom')  // Hook 2
    → mountWorkInProgressHook()
    → 创建 Hook2
    → Hook1.next = Hook2
    → workInProgressHook = Hook2
  
  2.3: loading = false，不 return，继续执行
  
  2.4: useState(18)  // Hook 3
    → mountWorkInProgressHook()
    → 创建 Hook3
    → Hook2.next = Hook3
    → workInProgressHook = Hook3
  
  2.5: return <div>...</div>

Step 3: Component 执行完毕，检查
  currentHook = null  // Mount 阶段不检查
  didRenderTooFewHooks = false
  
结果：成功！
Hook 链表：Hook1 → Hook2 → Hook3 → null

更新渲染：loading = true
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Step 1: renderWithHooks 开始
  currentHook = null  // 会在第一次调用 Hook 时初始化
  workInProgressHook = null
  ReactCurrentDispatcher.current = HooksDispatcherOnUpdate

Step 2: 执行 Component(props)
  
  2.1: useState(0)  // Hook 1
    → updateWorkInProgressHook()
    → currentHook = null，第一次调用
    → nextCurrentHook = current.memoizedState = Hook1 ✅
    → currentHook = Hook1
    → 克隆 Hook1
    → workInProgressHook = newHook1
  
  2.2: useState('Tom')  // Hook 2
    → updateWorkInProgressHook()
    → currentHook = Hook1
    → nextCurrentHook = currentHook.next = Hook2 ✅
    → currentHook = Hook2
    → 克隆 Hook2
    → workInProgressHook = newHook2
  
  2.3: loading = true，提前 return！❌
    → return <div>Loading...</div>
    → useState(18) 没有被调用！
    → currentHook 停留在 Hook2
    → Hook3 没有被访问

Step 3: Component 执行完毕，检查
  currentHook = Hook2  ← 停在第2个 Hook
  currentHook.next = Hook3  ← 后面还有第3个 Hook！
  
  🔥 检测逻辑：
  didRenderTooFewHooks = currentHook !== null && currentHook.next !== null
                       = Hook2 !== null && Hook3 !== null
                       = true && true
                       = true  ❌
  
  if (didRenderTooFewHooks) {
    throw new Error(
      'Rendered fewer hooks than expected. ' +
      'This may be caused by an accidental early return statement.'
    );
  }

结果：报错！
原因：上次有 3 个 Hook，本次只调用了 2 个

关键时间点的 currentHook 状态：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

时间点                        currentHook             currentHook.next
────────────────────────────────────────────────────────────────────
renderWithHooks 开始          null                    N/A
第1个 useState 调用后         Hook1                   Hook2
第2个 useState 调用后         Hook2                   Hook3
提前 return（组件执行完毕）   Hook2 ← 停在这里！      Hook3 ← 还有！
检测阶段                      Hook2 !== null ✅       Hook3 !== null ✅
结果                          → didRenderTooFewHooks = true → 报错！

如果没有提前 return（正常情况）：
────────────────────────────────────────────────────────────────────
第3个 useState 调用后         Hook3                   null
组件执行完毕                  Hook3                   null
检测阶段                      Hook3 !== null ✅       null === null ❌
结果                          → didRenderTooFewHooks = false → 正常！`}
      </pre>
    </div>
  );
}

// 场景分析
function ScenarioAnalysis() {
  return (
    <div style={{ background: '#fff', padding: '15px', borderRadius: '5px' }}>
      <h3>各种场景的 currentHook 状态</h3>
      
      <pre style={{ background: '#f5f5f5', padding: '15px', overflow: 'auto', fontSize: '13px', lineHeight: '1.8' }}>
{`场景 1：正常情况（所有 Hook 都调用）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function App() {
  const [a] = useState(0);  // Hook 1
  const [b] = useState(0);  // Hook 2
  const [c] = useState(0);  // Hook 3
  return <div>{a} {b} {c}</div>;
}

Hook 链表：Hook1 → Hook2 → Hook3 → null

执行过程：
  useState() → currentHook = Hook1
  useState() → currentHook = Hook2
  useState() → currentHook = Hook3 ← 最后一个
  return
  
检测：
  currentHook = Hook3
  currentHook.next = null
  didRenderTooFewHooks = (Hook3 !== null) && (null !== null)
                       = true && false
                       = false ✅ 正常

场景 2：提前 return（少调用了 Hook）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function App({ loading }) {
  const [a] = useState(0);  // Hook 1
  const [b] = useState(0);  // Hook 2
  
  if (loading) {
    return <div>Loading</div>;  // ❌ 提前 return
  }
  
  const [c] = useState(0);  // Hook 3 没调用
  return <div>{a} {b} {c}</div>;
}

上次链表：Hook1 → Hook2 → Hook3 → null

执行过程（loading = true）：
  useState() → currentHook = Hook1
  useState() → currentHook = Hook2
  return（提前返回，第3个 Hook 没调用）
  
检测：
  currentHook = Hook2 ← 停在第2个
  currentHook.next = Hook3 ← 后面还有第3个！
  didRenderTooFewHooks = (Hook2 !== null) && (Hook3 !== null)
                       = true && true
                       = true ❌ 报错！

错误信息：
"Rendered fewer hooks than expected. 
 This may be caused by an accidental early return statement."

场景 3：循环次数变化（少调用了 Hook）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ❌ 错误示例（不要这样写！）
function App({ count }) {
  const [base] = useState(0);  // Hook 1
  
  for (let i = 0; i < count; i++) {
    const [item] = useState(i);  // Hook 2, 3, 4... 数量不定
  }
  
  return <div>{base}</div>;
}

首次渲染：count = 3
  Hook 链表：Hook1 → Hook2 → Hook3 → Hook4 → null
  
更新渲染：count = 2
  useState() → currentHook = Hook1
  useState() → currentHook = Hook2  // 循环第1次
  useState() → currentHook = Hook3  // 循环第2次
  循环结束（count = 2）
  
检测：
  currentHook = Hook3
  currentHook.next = Hook4 ← 还有第4个 Hook 没调用！
  didRenderTooFewHooks = true ❌ 报错！

场景 4：条件 Hook（有时调用，有时不调用）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function App({ useExtra }) {
  const [a] = useState(0);  // Hook 1
  const [b] = useState(0);  // Hook 2
  
  if (useExtra) {
    const [c] = useState(0);  // Hook 3 ← 条件调用 ❌
  }
  
  return <div>{a} {b}</div>;
}

首次渲染：useExtra = true
  Hook 链表：Hook1 → Hook2 → Hook3 → null

更新渲染：useExtra = false
  useState() → currentHook = Hook1
  useState() → currentHook = Hook2
  if 不满足，Hook3 没调用
  
检测：
  currentHook = Hook2
  currentHook.next = Hook3 ← Hook3 没被访问！
  didRenderTooFewHooks = true ❌ 报错！

场景 5：Mount 阶段（不检查）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function App() {
  const [a] = useState(0);  // 创建 Hook1
  const [b] = useState(0);  // 创建 Hook2
  return <div>{a} {b}</div>;
}

首次渲染：
  使用 HooksDispatcherOnMount
  每个 Hook 都是新创建的
  currentHook 始终为 null（不从 current 读取）
  
检测：
  currentHook = null
  didRenderTooFewHooks = (null !== null) && ...
                       = false ✅ 不检查

原因：
首次渲染没有"上次的 Hook 链表"可以对比，
所以不需要检查数量是否一致。

总结：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

didRenderTooFewHooks 检测的是：
本次渲染是否遍历完了上次的整个 Hook 链表

判断依据：
- currentHook !== null: 还在链表中（不是初始状态）
- currentHook.next !== null: 后面还有 Hook 没访问

如果两个条件都满足 → 说明提前结束了 → 报错！`}
      </pre>
    </div>
  );
}

// 可视化演示
function VisualizationDemo() {
  const [hookCount, setHookCount] = useState(3);
  const [calledCount, setCalledCount] = useState(3);
  
  // 模拟检测逻辑
  const checkResult = () => {
    if (calledCount === 0) {
      return { pass: false, reason: 'currentHook = null（特殊情况，实际不会这样）' };
    }
    if (calledCount >= hookCount) {
      return { 
        pass: true, 
        reason: `currentHook.next = null（已遍历完）`,
        detail: 'didRenderTooFewHooks = false ✅'
      };
    } else {
      return { 
        pass: false, 
        reason: `currentHook 停在第 ${calledCount} 个，后面还有第 ${calledCount + 1} 个！`,
        detail: 'didRenderTooFewHooks = true ❌ → 报错！'
      };
    }
  };
  
  const result = checkResult();
  
  return (
    <div style={{ background: '#fff', padding: '15px', borderRadius: '5px' }}>
      <h3>交互式演示</h3>
      
      <div style={{ marginBottom: '20px', padding: '15px', background: '#f5f5f5', borderRadius: '5px' }}>
        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            上次渲染的 Hook 总数：
          </label>
          <input 
            type="number" 
            value={hookCount} 
            onChange={(e) => setHookCount(Math.max(1, parseInt(e.target.value) || 1))}
            min="1"
            max="10"
            style={{ padding: '5px', fontSize: '14px', width: '60px' }}
          />
          <span style={{ marginLeft: '10px', color: '#666' }}>
            (Hook 链表长度)
          </span>
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            本次渲染实际调用的 Hook 数：
          </label>
          <input 
            type="number" 
            value={calledCount} 
            onChange={(e) => setCalledCount(Math.max(0, parseInt(e.target.value) || 0))}
            min="0"
            max="10"
            style={{ padding: '5px', fontSize: '14px', width: '60px' }}
          />
          <span style={{ marginLeft: '10px', color: '#666' }}>
            (提前 return 可能导致调用不完整)
          </span>
        </div>
      </div>
      
      {/* Hook 链表可视化 */}
      <div style={{ marginBottom: '20px', padding: '15px', background: '#e3f2fd', borderRadius: '5px' }}>
        <h4>Hook 链表状态：</h4>
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          {Array.from({ length: hookCount }, (_, i) => (
            <React.Fragment key={i}>
              <div style={{
                padding: '10px 15px',
                background: i < calledCount ? '#4caf50' : '#ff9800',
                color: '#fff',
                borderRadius: '5px',
                fontWeight: 'bold',
                border: i === calledCount - 1 ? '3px solid #1976d2' : 'none'
              }}>
                Hook{i + 1}
                {i === calledCount - 1 && (
                  <div style={{ fontSize: '10px', marginTop: '3px' }}>
                    ← currentHook
                  </div>
                )}
              </div>
              {i < hookCount - 1 && <span style={{ fontSize: '20px' }}>→</span>}
            </React.Fragment>
          ))}
          <span style={{ fontSize: '20px', color: '#999' }}>→ null</span>
        </div>
        
        <div style={{ marginTop: '15px', fontSize: '13px' }}>
          <div style={{ marginBottom: '5px' }}>
            <span style={{ 
              display: 'inline-block', 
              width: '15px', 
              height: '15px', 
              background: '#4caf50',
              marginRight: '5px',
              verticalAlign: 'middle'
            }}></span>
            <span>已调用的 Hook（绿色）</span>
          </div>
          <div>
            <span style={{ 
              display: 'inline-block', 
              width: '15px', 
              height: '15px', 
              background: '#ff9800',
              marginRight: '5px',
              verticalAlign: 'middle'
            }}></span>
            <span>未调用的 Hook（橙色）</span>
          </div>
        </div>
      </div>
      
      {/* 检测结果 */}
      <div style={{ 
        padding: '15px', 
        background: result.pass ? '#e8f5e9' : '#ffebee', 
        borderRadius: '5px',
        border: `2px solid ${result.pass ? '#4caf50' : '#f44336'}`
      }}>
        <h4 style={{ margin: '0 0 10px 0', color: result.pass ? '#2e7d32' : '#c62828' }}>
          {result.pass ? '✅ 检测通过' : '❌ 检测失败'}
        </h4>
        
        <pre style={{ background: '#fff', padding: '10px', fontSize: '13px', margin: '10px 0' }}>
{`检测逻辑：
const didRenderTooFewHooks = 
  currentHook !== null && currentHook.next !== null;

currentHook: ${calledCount > 0 ? `Hook${calledCount}` : 'null'}
currentHook.next: ${calledCount < hookCount ? `Hook${calledCount + 1}` : 'null'}

计算：
didRenderTooFewHooks = (${calledCount > 0 ? `Hook${calledCount}` : 'null'} !== null) && (${calledCount < hookCount ? `Hook${calledCount + 1}` : 'null'} !== null)
                     = ${calledCount > 0} && ${calledCount < hookCount}
                     = ${!result.pass}

${result.detail || ''}`}
        </pre>
        
        <p style={{ margin: '10px 0 0 0', fontSize: '14px' }}>
          <strong>原因：</strong>{result.reason}
        </p>
      </div>
      
      {/* 快速测试按钮 */}
      <div style={{ marginTop: '20px', padding: '15px', background: '#fff3e0', borderRadius: '5px' }}>
        <h4>快速测试场景：</h4>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button 
            onClick={() => { setHookCount(3); setCalledCount(3); }}
            style={{ padding: '8px 15px', fontSize: '13px', cursor: 'pointer' }}
          >
            ✅ 正常（3/3）
          </button>
          <button 
            onClick={() => { setHookCount(3); setCalledCount(2); }}
            style={{ padding: '8px 15px', fontSize: '13px', cursor: 'pointer' }}
          >
            ❌ 提前 return（2/3）
          </button>
          <button 
            onClick={() => { setHookCount(5); setCalledCount(3); }}
            style={{ padding: '8px 15px', fontSize: '13px', cursor: 'pointer' }}
          >
            ❌ 循环减少（3/5）
          </button>
          <button 
            onClick={() => { setHookCount(4); setCalledCount(4); }}
            style={{ padding: '8px 15px', fontSize: '13px', cursor: 'pointer' }}
          >
            ✅ 边界情况（4/4）
          </button>
        </div>
      </div>
    </div>
  );
}

// 总结
function Summary() {
  return (
    <div style={{ background: '#fff', padding: '15px', borderRadius: '5px' }}>
      <h3>核心要点</h3>
      
      <div style={{ marginBottom: '15px', padding: '15px', background: '#e3f2fd', borderRadius: '5px' }}>
        <h4>🎯 检测表达式</h4>
        <pre style={{ background: '#fff', padding: '10px', fontSize: '14px' }}>
{`const didRenderTooFewHooks = currentHook !== null && currentHook.next !== null;`}
        </pre>
      </div>
      
      <div style={{ marginBottom: '15px', padding: '15px', background: '#e8f5e9', borderRadius: '5px' }}>
        <h4>✅ 检测原理</h4>
        <ul style={{ fontSize: '14px', lineHeight: '1.8' }}>
          <li><strong>currentHook:</strong> 指向上次 Hook 链表中当前访问到的位置</li>
          <li><strong>每次调用 Hook:</strong> currentHook 向前移动一个节点</li>
          <li><strong>组件执行完毕后:</strong> 检查 currentHook 是否遍历到了链表末尾</li>
          <li><strong>如果 next !== null:</strong> 说明后面还有 Hook 没访问 → 数量少了！</li>
        </ul>
      </div>
      
      <div style={{ marginBottom: '15px', padding: '15px', background: '#fff9c4', borderRadius: '5px' }}>
        <h4>🔄 执行时机</h4>
        <ol style={{ fontSize: '14px', lineHeight: '1.8' }}>
          <li>renderWithHooks 开始：初始化 currentHook = null</li>
          <li>执行 Component(props)：每次调用 Hook 时 currentHook 前移</li>
          <li>Component 执行完毕：检查 currentHook 的位置</li>
          <li>如果不在末尾：didRenderTooFewHooks = true → 报错</li>
        </ol>
      </div>
      
      <div style={{ padding: '15px', background: '#ffebee', borderRadius: '5px' }}>
        <h4>❌ 常见触发场景</h4>
        <ul style={{ fontSize: '14px', lineHeight: '1.8' }}>
          <li><strong>提前 return:</strong> Hook 没调用完就返回了</li>
          <li><strong>条件 Hook:</strong> 某些 Hook 在条件下不调用</li>
          <li><strong>循环变化:</strong> 循环中调用 Hook，循环次数减少</li>
          <li><strong>异常抛出:</strong> 执行过程中抛出异常，后续 Hook 未调用</li>
        </ul>
      </div>
      
      <div style={{ marginTop: '15px', padding: '15px', background: '#e0f2f1', borderRadius: '5px' }}>
        <h4>💡 关键理解</h4>
        <p style={{ fontSize: '14px', margin: '0' }}>
          这个检测不是"预测"或"猜测"，而是<strong>事后验证</strong>：<br/>
          通过检查 currentHook 指针是否到达链表末尾，确定本次渲染是否调用了和上次<strong>相同数量</strong>的 Hook。<br/>
          这是 React Hooks 规则约束的核心实现机制！
        </p>
      </div>
    </div>
  );
}
