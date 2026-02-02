import React, { useEffect, useLayoutEffect, useState } from 'react';

/**
 * 父子组件 useEffect 执行顺序验证
 * 
 * 执行顺序：
 * 1. Parent render
 * 2. Child render
 * 3. Child useLayoutEffect
 * 4. Parent useLayoutEffect
 * 5. Child useEffect
 * 6. Parent useEffect
 */

function Child() {
  console.log('2. 🟢 Child render');

  useLayoutEffect(() => {
    console.log('3. 🔵 Child useLayoutEffect (同步)');
    
    return () => {
      console.log('❌ Child useLayoutEffect cleanup');
    };
  }, []);

  useEffect(() => {
    console.log('5. 🟡 Child useEffect (异步)');
    
    return () => {
      console.log('❌ Child useEffect cleanup');
    };
  }, []);

  return <div style={{ padding: '20px', background: '#e3f2fd' }}>子组件</div>;
}

function Parent() {
  console.log('1. 🟢 Parent render');

  const [count, setCount] = useState(0);

  useLayoutEffect(() => {
    console.log('4. 🔵 Parent useLayoutEffect (同步)');
    
    return () => {
      console.log('❌ Parent useLayoutEffect cleanup');
    };
  }, []);

  useEffect(() => {
    console.log('6. 🟡 Parent useEffect (异步)');
    
    return () => {
      console.log('❌ Parent useEffect cleanup');
    };
  }, []);

  return (
    <div style={{ padding: '20px', background: '#fff3e0' }}>
      <h2>父组件 - Count: {count}</h2>
      <button onClick={() => setCount(count + 1)}>更新状态</button>
      <hr />
      <Child />
    </div>
  );
}

export default function EffectOrder() {
  const [show, setShow] = useState(true);

  return (
    <div style={{ padding: '20px' }}>
      <h1>父子组件 useEffect 执行顺序验证</h1>
      <p>打开控制台查看执行顺序</p>
      
      <button 
        onClick={() => setShow(!show)}
        style={{ 
          padding: '10px 20px', 
          fontSize: '16px',
          marginBottom: '20px'
        }}
      >
        {show ? '卸载组件' : '挂载组件'}
      </button>

      {show && (
        <>
          <hr />
          <Parent />
        </>
      )}

      <hr style={{ margin: '30px 0' }} />
      
      <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px' }}>
        <h3>📚 知识点总结</h3>
        
        <h4>1️⃣ 首次挂载顺序：</h4>
        <ol>
          <li>🟢 Parent render</li>
          <li>🟢 Child render</li>
          <li>🔵 Child useLayoutEffect（同步，DOM 更新后、浏览器绘制前）</li>
          <li>🔵 Parent useLayoutEffect（同步）</li>
          <li>🟡 Child useEffect（异步，浏览器绘制后）</li>
          <li>🟡 Parent useEffect（异步）</li>
        </ol>

        <h4>2️⃣ 更新顺序（点击"更新状态"按钮）：</h4>
        <ol>
          <li>🟢 Parent render</li>
          <li>🟢 Child render</li>
          <li>🔵 Child useLayoutEffect（如果依赖变化）</li>
          <li>🔵 Parent useLayoutEffect（如果依赖变化）</li>
          <li>🟡 Child useEffect（如果依赖变化）</li>
          <li>🟡 Parent useEffect（如果依赖变化）</li>
        </ol>

        <h4>3️⃣ 卸载顺序（点击"卸载组件"按钮）：</h4>
        <ol>
          <li>❌ Parent useEffect cleanup（异步 cleanup）</li>
          <li>❌ Child useEffect cleanup（异步 cleanup）</li>
          <li>❌ Parent useLayoutEffect cleanup（同步 cleanup）</li>
          <li>❌ Child useLayoutEffect cleanup（同步 cleanup）</li>
        </ol>
        <p style={{ color: '#d32f2f', fontWeight: 'bold' }}>
          ⚠️ 注意：cleanup 是父 → 子的顺序！
        </p>

        <h4>4️⃣ 核心原理：</h4>
        <ul>
          <li><strong>Render 阶段</strong>：深度优先遍历（父 → 子）</li>
          <li><strong>Commit 阶段</strong>：先遍历到叶子节点，再从子到父执行 effects</li>
          <li><strong>useLayoutEffect</strong>：同步执行，阻塞浏览器绘制</li>
          <li><strong>useEffect</strong>：异步执行（宏任务），不阻塞绘制</li>
        </ul>

        <h4>5️⃣ 源码验证：</h4>
        <pre style={{ background: '#fff', padding: '10px', overflow: 'auto' }}>
{`// ReactFiberCommitWork.old.js
function commitLayoutEffects_begin() {
  while (nextEffect !== null) {
    // 先遍历子节点
    if (firstChild !== null) {
      nextEffect = firstChild;
    } else {
      // 再执行 complete（从子到父）
      commitLayoutMountEffects_complete();
    }
  }
}

// 执行时：遍历是父→子，但执行是子→父
// Parent 遍历 → Child 遍历 → Child 执行 → Parent 执行`}
        </pre>
      </div>
    </div>
  );
}
