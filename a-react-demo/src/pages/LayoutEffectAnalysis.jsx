import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';

/**
 * useLayoutEffect 为什么在 commitMutationEffects 之后执行？
 * 
 * 核心理解：
 * 1. DOM 更新（内存中） ≠ 浏览器绘制（屏幕上）
 * 2. useLayoutEffect 阻塞的是浏览器绘制，不是 DOM 更新
 */

function LayoutEffectDemo() {
  const [count, setCount] = useState(0);
  const [width, setWidth] = useState(100);
  const divRef = useRef(null);
  
  // 模拟在 useLayoutEffect 中读取 DOM
  useLayoutEffect(() => {
    const startTime = performance.now();
    console.log('\n🔵 === useLayoutEffect 开始 ===');
    console.log('时间点：DOM 已更新（内存），浏览器未绘制');
    
    if (divRef.current) {
      // 读取 DOM 属性
      const rect = divRef.current.getBoundingClientRect();
      console.log('📏 读取 DOM 尺寸:', rect.width, 'x', rect.height);
      console.log('📝 DOM innerText:', divRef.current.innerText);
      
      // 同步修改 DOM（这会立即反映在下一次绘制中）
      if (count % 2 === 0) {
        divRef.current.style.background = '#ffeb3b';
      } else {
        divRef.current.style.background = '#4caf50';
      }
      
      // 模拟耗时操作（阻塞浏览器绘制）
      let sum = 0;
      for (let i = 0; i < 50000000; i++) {
        sum += i;
      }
      
      const endTime = performance.now();
      console.log(`⏱️  useLayoutEffect 耗时: ${(endTime - startTime).toFixed(2)}ms`);
      console.log('⚠️  这段时间浏览器被阻塞，无法绘制！');
    }
    
    console.log('🔵 === useLayoutEffect 结束 ===\n');
  }, [count]);
  
  // useEffect 是异步的，在浏览器绘制后执行
  useEffect(() => {
    console.log('🟡 useEffect 执行（浏览器已绘制，用户已看到更新）');
  }, [count]);
  
  const handleUpdate = () => {
    console.log('\n\n📢 ========== 开始新的更新流程 ==========');
    console.log('0. 用户点击按钮');
    setCount(count + 1);
    console.log('1. setState 调用（调度更新）');
    console.log('   ⚠️ 此时 count 还是旧值:', count);
  };
  
  return (
    <div style={{ padding: '20px', background: '#f5f5f5' }}>
      <h3>useLayoutEffect 执行时机验证</h3>
      <p style={{ fontSize: '20px' }}>Count: {count}</p>
      
      <div 
        ref={divRef}
        style={{ 
          width: `${width}px`,
          height: '100px',
          background: '#2196f3',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          marginBottom: '20px',
          transition: 'all 0.3s'
        }}
      >
        被观察的 DIV - {count}
      </div>
      
      <button 
        onClick={handleUpdate}
        style={{ padding: '10px 20px', fontSize: '16px', marginRight: '10px' }}
      >
        更新 Count（查看控制台）
      </button>
      
      <button 
        onClick={() => setWidth(width === 100 ? 200 : 100)}
        style={{ padding: '10px 20px', fontSize: '16px' }}
      >
        改变宽度
      </button>
      
      <div style={{ marginTop: '20px', padding: '15px', background: '#fff9c4', borderRadius: '5px' }}>
        <h4>⚠️ 观察要点：</h4>
        <ul>
          <li>点击按钮后，立即查看控制台输出</li>
          <li>注意 useLayoutEffect 执行时，浏览器会卡顿（因为阻塞了绘制）</li>
          <li>但在 useLayoutEffect 中可以读取到最新的 DOM 状态</li>
          <li>useLayoutEffect 结束后，浏览器才会绘制</li>
        </ul>
      </div>
    </div>
  );
}

// 对比 Demo：显示 useEffect 和 useLayoutEffect 的区别
function ComparisonDemo() {
  const [count, setCount] = useState(0);
  const boxRef = useRef(null);
  
  // useLayoutEffect: 同步执行，阻塞绘制
  useLayoutEffect(() => {
    if (boxRef.current) {
      console.log('🔵 useLayoutEffect: 读取宽度 =', boxRef.current.offsetWidth);
      
      // 根据宽度调整样式（在浏览器绘制前完成）
      if (boxRef.current.offsetWidth < 200) {
        boxRef.current.style.fontSize = '16px';
      } else {
        boxRef.current.style.fontSize = '24px';
      }
    }
  });
  
  // useEffect: 异步执行，不阻塞绘制
  useEffect(() => {
    if (boxRef.current) {
      console.log('🟡 useEffect: 读取宽度 =', boxRef.current.offsetWidth);
    }
  });
  
  return (
    <div style={{ padding: '20px', background: '#e3f2fd' }}>
      <h3>useEffect vs useLayoutEffect</h3>
      
      <div 
        ref={boxRef}
        style={{ 
          width: count % 2 === 0 ? '100px' : '300px',
          height: '100px',
          background: '#ff9800',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '20px',
          transition: 'width 0.3s'
        }}
      >
        {count}
      </div>
      
      <button onClick={() => setCount(count + 1)} style={{ padding: '10px 20px' }}>
        切换宽度
      </button>
      
      <p style={{ marginTop: '15px', color: '#666' }}>
        useLayoutEffect 在宽度变化后立即调整字体大小（无闪烁）
      </p>
    </div>
  );
}

export default function LayoutEffectAnalysis() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>useLayoutEffect 为何在 commitMutationEffects 之后执行？</h1>
      <p style={{ color: '#666', fontSize: '18px' }}>
        理解 DOM 更新和浏览器绘制的区别
      </p>
      
      <LayoutEffectDemo />
      <hr style={{ margin: '30px 0' }} />
      <ComparisonDemo />
      
      <hr style={{ margin: '30px 0' }} />
      
      <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px' }}>
        <h2>📚 深度解析</h2>
        
        <div style={{ marginBottom: '20px' }}>
          <h3>🎯 核心概念：DOM 更新 ≠ 浏览器绘制</h3>
          <div style={{ background: '#fff', padding: '15px', borderRadius: '5px' }}>
            <h4>浏览器渲染流程：</h4>
            <pre style={{ background: '#f5f5f5', padding: '10px', overflow: 'auto' }}>
{`1. JavaScript 执行
   ↓
2. 样式计算 (Style)
   ↓
3. 布局 (Layout/Reflow)
   ↓
4. 绘制 (Paint)
   ↓
5. 合成 (Composite)
   ↓
6. 显示到屏幕`}
            </pre>
            
            <h4>React Commit 阶段在哪里？</h4>
            <pre style={{ background: '#fff3e0', padding: '10px' }}>
{`┌──────────────────────────────────────────────────┐
│  React Commit 阶段（JavaScript 执行）             │
│                                                   │
│  1. commitMutationEffects                        │
│     - 修改 DOM（在内存中）                        │
│     - 插入、更新、删除 DOM 节点                   │
│     ↓                                             │
│  2. root.current = finishedWork                  │
│     - 切换 Fiber 树                              │
│     ↓                                             │
│  3. commitLayoutEffects                          │
│     - 执行 useLayoutEffect ← 在这里！            │
│     - 可以读取最新的 DOM                         │
│     - 可以同步修改 DOM                           │
│     ↓                                             │
│  4. requestPaint() / 退出 JavaScript             │
└──────────────────────────────────────────────────┘
            ↓
┌──────────────────────────────────────────────────┐
│  浏览器渲染流程（此时 React 已完成）              │
│                                                   │
│  1. Style (样式计算)                             │
│  2. Layout (布局计算)                            │
│  3. Paint (绘制)                                 │
│  4. Composite (合成)                             │
│  5. 显示到屏幕 ← 用户看到更新                     │
└──────────────────────────────────────────────────┘
            ↓
┌──────────────────────────────────────────────────┐
│  Passive Effects (异步，下一个任务)               │
│  - 执行 useEffect                                │
└──────────────────────────────────────────────────┘`}
            </pre>
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h3>1️⃣ 为什么 useLayoutEffect 在 commitMutationEffects 之后？</h3>
          <pre style={{ background: '#fff', padding: '15px', overflow: 'auto', borderRadius: '5px' }}>
{`// ReactFiberWorkLoop.old.js - commitRootImpl

// 阶段 1: Mutation - 修改 DOM
commitMutationEffects(root, finishedWork, lanes);
// 执行内容：
// - 插入新 DOM 节点：appendChild、insertBefore
// - 更新 DOM 属性：setAttribute、className 等
// - 删除旧 DOM 节点：removeChild
// - 执行 ref 解绑
// 🔑 关键：此时 DOM 已经在内存中更新了！

// 切换 Fiber 树（新树变成当前树）
root.current = finishedWork;

// 阶段 2: Layout - 读取 DOM，执行副作用
commitLayoutEffects(finishedWork, root, lanes);
// 执行内容：
// - 执行 componentDidMount / componentDidUpdate
// - 执行 useLayoutEffect 的 create 函数
// - 执行 ref 赋值
// 🔑 关键：此时可以读取到最新的 DOM 布局信息！

// 告诉调度器可以让浏览器绘制了
requestPaint();

// 为什么这样设计？
// 1. useLayoutEffect 的目的是"在 DOM 更新后、浏览器绘制前"读取布局
// 2. 必须在 mutation 之后，才能读取到最新的 DOM
// 3. 必须在浏览器绘制之前，才能同步修改避免闪烁`}
          </pre>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h3>2️⃣ useLayoutEffect "阻塞渲染"的真正含义</h3>
          <div style={{ background: '#e8f5e9', padding: '15px', borderRadius: '5px' }}>
            <h4>常见误解：</h4>
            <p style={{ color: '#d32f2f' }}>
              ❌ useLayoutEffect 阻塞 DOM 更新<br/>
              ❌ useLayoutEffect 执行时 DOM 还没变
            </p>
            
            <h4>正确理解：</h4>
            <p style={{ color: '#388e3c' }}>
              ✅ useLayoutEffect 阻塞<strong>浏览器绘制</strong><br/>
              ✅ useLayoutEffect 执行时 DOM 已经更新（内存中）<br/>
              ✅ useLayoutEffect 是同步执行，会阻塞 JavaScript 主线程<br/>
              ✅ 只有 useLayoutEffect 执行完，浏览器才能绘制
            </p>
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h3>3️⃣ 源码证据</h3>
          <pre style={{ background: '#fff', padding: '15px', overflow: 'auto', borderRadius: '5px' }}>
{`// ReactFiberWorkLoop.old.js (2151-2195 行)

// Mutation 阶段：修改 DOM
commitMutationEffects(root, finishedWork, lanes);
// ⬆️ 这里 DOM 已经更新了（appendChild, setAttribute 等都完成了）

// 切换树
root.current = finishedWork;
// ⬆️ 注释说明：必须在 mutation 之后，layout 之前
// "The work-in-progress tree is now the current tree. 
//  This must come after the mutation phase, so that the previous tree 
//  is still current during componentWillUnmount, 
//  but before the layout phase, so that the finished work is current 
//  during componentDidMount/Update."

// Layout 阶段：执行 useLayoutEffect
commitLayoutEffects(finishedWork, root, lanes);
// ⬆️ 注释说明：在 DOM 被 mutate 之后执行
// "The next phase is the layout phase, where we call effects that read
//  the host tree AFTER it's been mutated."

// 告诉浏览器可以绘制了
requestPaint();
// ⬆️ 注释说明：让浏览器有机会绘制
// "Tell Scheduler to yield at the end of the frame, 
//  so the browser has an opportunity to paint."`}
          </pre>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h3>4️⃣ 时间线对比</h3>
          <pre style={{ background: '#fff', padding: '15px', overflow: 'auto', borderRadius: '5px' }}>
{`完整的时间线：

T0: 用户点击按钮
    ↓
T1: setState 调度更新
    ↓
T2: Render 阶段（可中断）
    - beginWork、completeWork
    - 构建新的 Fiber 树
    ↓
T3: Commit 阶段开始（不可中断）
    ↓
T4: commitMutationEffects
    - DOM.appendChild(newNode)      ← DOM 更新（内存中）
    - DOM.setAttribute('class', ...) ← DOM 更新（内存中）
    - oldNode.remove()              ← DOM 更新（内存中）
    🔑 此时 DOM 已更新，但浏览器还没有绘制！
    ↓
T5: root.current = finishedWork
    - 切换 Fiber 树
    ↓
T6: commitLayoutEffects
    - useLayoutEffect(() => {
        const width = div.offsetWidth;  ← 读取最新 DOM
        if (width < 100) {
          div.style.color = 'red';      ← 同步修改 DOM
        }
      })
    🔑 阻塞在这里！浏览器无法绘制！
    ↓
T7: requestPaint() / JavaScript 执行结束
    - React 告诉浏览器："我完成了，你可以绘制了"
    ↓
T8: 浏览器渲染流程
    - Style 计算
    - Layout 计算
    - Paint 绘制
    - Composite 合成
    ↓
T9: 屏幕显示
    🎉 用户看到更新！（包括 useLayoutEffect 的修改）
    ↓
T10: useEffect 异步执行
    - 浏览器空闲时执行
    - 不阻塞绘制

关键观察：
- T4-T6: DOM 已更新，但用户看不到（未绘制）
- T6: useLayoutEffect 阻塞，浏览器等待
- T8-T9: 浏览器绘制，用户才看到`}
          </pre>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h3>5️⃣ 为什么需要这样的设计？</h3>
          <div style={{ background: '#fff', padding: '15px', borderRadius: '5px' }}>
            <h4>场景 1：测量 DOM 尺寸并调整</h4>
            <pre style={{ background: '#f5f5f5', padding: '10px' }}>
{`useLayoutEffect(() => {
  const width = divRef.current.offsetWidth;
  if (width > 500) {
    divRef.current.style.fontSize = '24px';
  } else {
    divRef.current.style.fontSize = '16px';
  }
});

// 为什么必须用 useLayoutEffect？
// 1. DOM 已经更新（可以读取正确的 width）
// 2. 浏览器还没绘制（可以同步修改 fontSize）
// 3. 用户看到的是最终结果（没有闪烁）

// 如果用 useEffect：
// 1. 浏览器先绘制（用户看到旧的 fontSize）
// 2. 然后执行 useEffect（修改 fontSize）
// 3. 浏览器再次绘制（用户看到新的 fontSize）
// 4. 结果：闪烁！`}
            </pre>

            <h4>场景 2：动画和过渡</h4>
            <pre style={{ background: '#f5f5f5', padding: '10px' }}>
{`useLayoutEffect(() => {
  // 读取元素位置
  const rect = element.getBoundingClientRect();
  
  // 立即应用动画初始状态
  element.style.transform = \`translateX(\${rect.left}px)\`;
  
  // 触发动画
  requestAnimationFrame(() => {
    element.style.transform = 'translateX(0)';
  });
});

// useLayoutEffect 确保：
// - 读取到正确的初始位置
// - 在浏览器绘制前设置动画起点
// - 动画流畅，无闪烁`}
            </pre>
          </div>
        </div>

        <div>
          <h3>6️⃣ 总结</h3>
          <div style={{ background: '#e3f2fd', padding: '15px', borderRadius: '5px' }}>
            <h4>useLayoutEffect 在 commitMutationEffects 之后执行的原因：</h4>
            <ol>
              <li><strong>DOM 必须先更新：</strong>mutation 阶段修改 DOM，layout 阶段才能读取正确的值</li>
              <li><strong>阻塞的是浏览器绘制：</strong>不是阻塞 DOM 更新</li>
              <li><strong>同步执行：</strong>在浏览器绘制前完成所有 DOM 读写操作</li>
              <li><strong>避免闪烁：</strong>用户看到的是最终结果，不是中间状态</li>
            </ol>

            <h4>执行顺序总结：</h4>
            <pre style={{ background: '#fff', padding: '10px', marginTop: '10px' }}>
{`1. commitMutationEffects    → DOM 更新（内存）
2. root.current 切换        → Fiber 树切换
3. commitLayoutEffects      → useLayoutEffect (同步，阻塞)
4. requestPaint             → 通知浏览器可以绘制
5. 浏览器绘制               → 用户看到更新
6. flushPassiveEffects      → useEffect (异步)`}
            </pre>

            <h4>记忆口诀：</h4>
            <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#1976d2' }}>
              先改 DOM，再读 DOM，最后浏览器画
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
