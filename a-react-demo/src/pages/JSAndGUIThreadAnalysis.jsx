import React, { useState, useEffect, useRef } from 'react';

/**
 * JS 线程和 GUI 渲染线程的互斥关系深度解析
 * 
 * 核心概念：
 * 1. JS 引擎线程和 GUI 渲染线程是互斥的（Mutually Exclusive）
 * 2. 当 JS 在执行时，GUI 渲染线程会被挂起
 * 3. 当 GUI 在渲染时，JS 线程会被挂起
 */

export default function JSAndGUIThreadAnalysis() {
  const [isBlocking, setIsBlocking] = useState(false);
  const [blockTime, setBlockTime] = useState(2000);
  const [fps, setFps] = useState(60);
  const [animationRunning, setAnimationRunning] = useState(false);
  const [logs, setLogs] = useState([]);
  
  const boxRef = useRef(null);
  const fpsCounterRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const rafIdRef = useRef(null);
  
  // 添加日志
  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString() + '.' + Date.now() % 1000;
    setLogs(prev => [...prev.slice(-20), { timestamp, message, type }]);
  };
  
  // FPS 监控动画
  useEffect(() => {
    if (!animationRunning) {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
      return;
    }
    
    let frameCount = 0;
    let lastFpsUpdate = performance.now();
    
    const animate = (currentTime) => {
      // 计算 FPS
      frameCount++;
      const deltaTime = currentTime - lastFpsUpdate;
      
      if (deltaTime >= 1000) {
        const currentFps = Math.round((frameCount * 1000) / deltaTime);
        setFps(currentFps);
        frameCount = 0;
        lastFpsUpdate = currentTime;
      }
      
      // 移动方块
      if (boxRef.current) {
        const time = currentTime / 1000;
        const x = Math.sin(time * 2) * 200 + 300;
        const y = Math.sin(time * 3) * 100 + 150;
        boxRef.current.style.transform = `translate(${x}px, ${y}px)`;
      }
      
      rafIdRef.current = requestAnimationFrame(animate);
    };
    
    rafIdRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [animationRunning]);
  
  // 阻塞 JS 线程
  const blockJSThread = () => {
    setIsBlocking(true);
    addLog(`🔴 开始阻塞 JS 线程 ${blockTime}ms`, 'error');
    addLog('⚠️  此时 GUI 渲染线程被挂起，动画会卡顿！', 'warning');
    
    const startTime = performance.now();
    
    // 同步阻塞操作
    let sum = 0;
    const endTime = startTime + blockTime;
    while (performance.now() < endTime) {
      sum += Math.random();
    }
    
    const actualTime = performance.now() - startTime;
    addLog(`✅ JS 线程解除阻塞，实际耗时: ${actualTime.toFixed(2)}ms`, 'success');
    addLog('🎨 GUI 渲染线程恢复，动画继续', 'success');
    
    setIsBlocking(false);
  };
  
  // 模拟 React 的 useLayoutEffect 阻塞
  const simulateLayoutEffect = () => {
    addLog('🔵 模拟 useLayoutEffect 执行', 'info');
    addLog('📝 DOM 已更新（内存中）', 'info');
    
    // 模拟耗时的 DOM 读取和计算
    const startTime = performance.now();
    let sum = 0;
    while (performance.now() - startTime < 1000) {
      sum += Math.random();
    }
    
    addLog('⏱️  useLayoutEffect 耗时 1000ms', 'warning');
    addLog('⚠️  这 1000ms 浏览器无法绘制！', 'error');
    addLog('✅ useLayoutEffect 结束，浏览器开始绘制', 'success');
  };
  
  const toggleAnimation = () => {
    setAnimationRunning(!animationRunning);
    if (!animationRunning) {
      addLog('🎬 启动动画', 'success');
    } else {
      addLog('⏸️  停止动画', 'info');
    }
  };
  
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>JS 线程与 GUI 渲染线程的互斥关系</h1>
      
      {/* 理论解释 */}
      <div style={{ background: '#fff3e0', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>🧠 核心概念</h2>
        <div style={{ background: '#fff', padding: '15px', borderRadius: '5px', marginBottom: '15px' }}>
          <h3>1. 浏览器的主要线程（以 Chrome 为例）</h3>
          <pre style={{ background: '#f5f5f5', padding: '10px', overflow: 'auto' }}>
{`浏览器进程（Browser Process）
├── GUI 渲染线程
│   └── 负责：渲染页面、解析 HTML/CSS、绘制界面
│
├── JS 引擎线程（V8）
│   └── 负责：执行 JavaScript 代码
│
├── 事件触发线程
│   └── 负责：管理事件队列（Event Queue）
│
├── 定时器线程
│   └── 负责：setTimeout、setInterval
│
└── 异步 HTTP 请求线程
    └── 负责：XMLHttpRequest、Fetch

⚠️  关键：GUI 渲染线程 和 JS 引擎线程 是互斥的！`}
          </pre>
        </div>

        <div style={{ background: '#ffebee', padding: '15px', borderRadius: '5px', marginBottom: '15px' }}>
          <h3>2. 为什么 JS 线程和 GUI 线程必须互斥？</h3>
          <p><strong>原因：避免冲突和不一致</strong></p>
          <pre style={{ background: '#fff', padding: '10px' }}>
{`假设 JS 和 GUI 可以同时执行：

时刻 T1:
  GUI 线程：正在读取 div.style.width 准备绘制（读到 100px）
  
时刻 T2:（同时）
  JS 线程：执行 div.style.width = '200px'
  
时刻 T3:
  GUI 线程：继续用之前读到的 100px 绘制
  
结果：
  ❌ DOM 状态是 200px
  ❌ 屏幕显示是 100px
  ❌ 数据不一致！

正确的设计（互斥）：
  T1: JS 线程执行
      └── 修改 DOM
  T2: JS 线程结束，释放锁
  T3: GUI 线程获得锁
      └── 读取最新的 DOM 并绘制
  T4: GUI 线程结束，释放锁
  
结果：
  ✅ 数据一致
  ✅ 不会出现竞态条件（Race Condition）`}
          </pre>
        </div>

        <div style={{ background: '#e8f5e9', padding: '15px', borderRadius: '5px' }}>
          <h3>3. 浏览器事件循环（Event Loop）</h3>
          <pre style={{ background: '#fff', padding: '10px' }}>
{`事件循环的一次 Tick：

┌─────────────────────────────────────────────────┐
│  1. 执行 JS 任务（宏任务 Macrotask）              │
│     - script 代码块                             │
│     - setTimeout/setInterval 回调                │
│     - I/O 操作                                  │
│     - requestAnimationFrame (在某些浏览器中)     │
│     🔒 JS 线程锁定，GUI 线程等待                 │
└─────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────┐
│  2. 执行所有微任务（Microtasks）                 │
│     - Promise.then/catch/finally                │
│     - MutationObserver                          │
│     - queueMicrotask                            │
│     🔒 JS 线程仍然锁定                          │
└─────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────┐
│  3. 检查是否需要渲染（16.6ms 一次，60fps）       │
│     - 浏览器决定是否进行渲染                     │
└─────────────────────────────────────────────────┘
              ↓ (需要渲染)
┌─────────────────────────────────────────────────┐
│  4. requestAnimationFrame 回调                  │
│     - 在渲染前执行                               │
│     🔒 JS 线程锁定                              │
└─────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────┐
│  5. GUI 渲染（Rendering）                       │
│     - 样式计算（Style）                         │
│     - 布局（Layout/Reflow）                     │
│     - 绘制（Paint）                             │
│     - 合成（Composite）                         │
│     🔒 GUI 线程锁定，JS 线程等待                 │
└─────────────────────────────────────────────────┘
              ↓
        回到步骤 1（下一个 Tick）

关键观察：
- JS 执行时（步骤 1-2-4），GUI 不能渲染
- GUI 渲染时（步骤 5），JS 不能执行
- 如果步骤 1 的 JS 执行时间过长，步骤 5 就会被延迟！`}
          </pre>
        </div>
      </div>

      {/* 交互式演示 */}
      <div style={{ background: '#e3f2fd', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>🎮 交互式演示</h2>
        
        {/* 动画区域 */}
        <div style={{ 
          position: 'relative', 
          height: '300px', 
          background: '#fff',
          border: '2px solid #2196f3',
          borderRadius: '5px',
          marginBottom: '20px',
          overflow: 'hidden'
        }}>
          <div
            ref={boxRef}
            style={{
              position: 'absolute',
              width: '50px',
              height: '50px',
              background: animationRunning ? '#4caf50' : '#9e9e9e',
              borderRadius: '5px',
              boxShadow: '0 2px 5px rgba(0,0,0,0.3)'
            }}
          />
          
          <div style={{ 
            position: 'absolute', 
            top: '10px', 
            right: '10px',
            background: fps < 30 ? '#f44336' : fps < 50 ? '#ff9800' : '#4caf50',
            color: 'white',
            padding: '10px 15px',
            borderRadius: '5px',
            fontWeight: 'bold',
            fontSize: '20px'
          }}>
            FPS: {fps}
          </div>
          
          {!animationRunning && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              fontSize: '24px',
              color: '#999'
            }}>
              点击"启动动画"开始
            </div>
          )}
        </div>

        {/* 控制面板 */}
        <div style={{ marginBottom: '20px' }}>
          <button
            onClick={toggleAnimation}
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              marginRight: '10px',
              background: animationRunning ? '#f44336' : '#4caf50',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            {animationRunning ? '⏸️  停止动画' : '▶️  启动动画'}
          </button>
          
          <button
            onClick={blockJSThread}
            disabled={isBlocking || !animationRunning}
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              marginRight: '10px',
              background: isBlocking ? '#9e9e9e' : '#ff5722',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: isBlocking ? 'not-allowed' : 'pointer',
              opacity: isBlocking || !animationRunning ? 0.5 : 1
            }}
          >
            {isBlocking ? '🔴 阻塞中...' : '🚫 阻塞 JS 线程'}
          </button>
          
          <button
            onClick={simulateLayoutEffect}
            disabled={!animationRunning}
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              background: '#2196f3',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: !animationRunning ? 'not-allowed' : 'pointer',
              opacity: !animationRunning ? 0.5 : 1
            }}
          >
            🔵 模拟 useLayoutEffect
          </button>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ marginRight: '10px' }}>阻塞时长：</label>
          <input
            type="range"
            min="500"
            max="5000"
            step="500"
            value={blockTime}
            onChange={(e) => setBlockTime(Number(e.target.value))}
            style={{ width: '200px', marginRight: '10px' }}
          />
          <span style={{ fontWeight: 'bold' }}>{blockTime}ms</span>
        </div>

        <div style={{ background: '#fff9c4', padding: '15px', borderRadius: '5px' }}>
          <h4>📋 操作说明：</h4>
          <ol>
            <li><strong>启动动画：</strong>方块会平滑移动，观察 FPS 保持在 60 左右</li>
            <li><strong>阻塞 JS 线程：</strong>执行耗时的同步操作，观察动画卡顿，FPS 下降</li>
            <li><strong>模拟 useLayoutEffect：</strong>模拟 React 的 Layout Effect 阻塞渲染</li>
          </ol>
          <p style={{ color: '#d32f2f', fontWeight: 'bold' }}>
            ⚠️ 关键观察：当 JS 线程被阻塞时，动画会完全停止，因为 GUI 线程无法执行！
          </p>
        </div>
      </div>

      {/* 日志输出 */}
      <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h3>📊 执行日志</h3>
        <div style={{
          background: '#000',
          color: '#0f0',
          padding: '10px',
          borderRadius: '5px',
          height: '200px',
          overflowY: 'auto',
          fontFamily: 'Consolas, monospace',
          fontSize: '12px'
        }}>
          {logs.map((log, index) => (
            <div
              key={index}
              style={{
                color: log.type === 'error' ? '#f44336' :
                       log.type === 'warning' ? '#ff9800' :
                       log.type === 'success' ? '#4caf50' : '#0f0',
                marginBottom: '5px'
              }}
            >
              [{log.timestamp}] {log.message}
            </div>
          ))}
        </div>
      </div>

      {/* React 相关的解释 */}
      <div style={{ background: '#f3e5f5', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>⚛️ React 中的应用</h2>
        
        <div style={{ background: '#fff', padding: '15px', borderRadius: '5px', marginBottom: '15px' }}>
          <h3>为什么 useLayoutEffect 会阻塞浏览器绘制？</h3>
          <pre style={{ background: '#f5f5f5', padding: '10px', overflow: 'auto' }}>
{`React Commit 阶段的执行流程：

┌─────────────────────────────────────────────┐
│  JS 线程占用（同步执行，不可中断）            │
│                                              │
│  1. commitMutationEffects()                 │
│     - DOM 操作（appendChild, setAttribute）  │
│     - 修改内存中的 DOM 树                    │
│     🔒 JS 线程锁定                          │
│                                              │
│  2. root.current = finishedWork            │
│     - 切换 Fiber 树                         │
│     🔒 JS 线程锁定                          │
│                                              │
│  3. commitLayoutEffects()                  │
│     - useLayoutEffect() 执行 ← 在这里！     │
│     - 可能包含耗时操作                       │
│     - 读取 DOM、计算、修改样式等             │
│     🔒 JS 线程仍然锁定                      │
│     ⚠️  GUI 线程被阻塞，无法渲染！           │
│                                              │
│  4. 函数返回，释放 JS 线程                  │
│     🔓 JS 线程解锁                          │
└─────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────┐
│  GUI 线程获得执行权                          │
│                                              │
│  5. 浏览器渲染流程                           │
│     - Style 计算                            │
│     - Layout 计算                           │
│     - Paint 绘制                            │
│     - Composite 合成                        │
│     🔒 GUI 线程锁定                         │
│     🎨 用户看到更新                         │
└─────────────────────────────────────────────┘

关键点：
1. 步骤 1-3 是连续的 JS 执行，GUI 线程被阻塞
2. useLayoutEffect 在步骤 3，如果耗时长，会延迟步骤 5
3. 用户要等到步骤 5 才能看到更新
4. 这就是为什么说 useLayoutEffect 会"阻塞渲染"！`}
          </pre>
        </div>

        <div style={{ background: '#fff', padding: '15px', borderRadius: '5px' }}>
          <h3>useEffect vs useLayoutEffect</h3>
          <pre style={{ background: '#f5f5f5', padding: '10px', overflow: 'auto' }}>
{`useLayoutEffect 的执行时机：

┌─ JS 线程 ─────────────────────────────────┐
│  commitLayoutEffects()                    │
│  useLayoutEffect(() => {                  │
│    // 耗时 100ms                          │
│    const width = div.offsetWidth;         │
│  })                                       │
└───────────────────────────────────────────┘
        ↓ (100ms 后)
┌─ GUI 线程 ────────────────────────────────┐
│  浏览器渲染                                │
│  用户看到页面更新                          │
└───────────────────────────────────────────┘

useEffect 的执行时机：

┌─ JS 线程 ─────────────────────────────────┐
│  commitLayoutEffects()                    │
│  // 没有同步执行的 effect                 │
└───────────────────────────────────────────┘
        ↓ (立即)
┌─ GUI 线程 ────────────────────────────────┐
│  浏览器渲染                                │
│  用户看到页面更新 ← 更快！                 │
└───────────────────────────────────────────┘
        ↓ (渲染后，下一个 Tick)
┌─ JS 线程 ─────────────────────────────────┐
│  flushPassiveEffects()                    │
│  useEffect(() => {                        │
│    // 不阻塞渲染                          │
│    const width = div.offsetWidth;         │
│  })                                       │
└───────────────────────────────────────────┘

结论：
- useLayoutEffect：同步执行，阻塞渲染，但能避免闪烁
- useEffect：异步执行，不阻塞渲染，但可能看到中间状态`}
          </pre>
        </div>
      </div>

      {/* 源码证明 */}
      <div style={{ background: '#fce4ec', padding: '20px', borderRadius: '8px' }}>
        <h2>🔬 源码层面的证明</h2>
        
        <div style={{ background: '#fff', padding: '15px', borderRadius: '5px', marginBottom: '15px' }}>
          <h3>1. Commit 阶段是同步执行的</h3>
          <pre style={{ background: '#f5f5f5', padding: '10px', overflow: 'auto' }}>
{`// ReactFiberWorkLoop.old.js

function commitRootImpl(root, renderPriorityLevel) {
  // 进入 Commit 上下文
  executionContext |= CommitContext;
  
  // 这三个函数是连续同步执行的！
  commitBeforeMutationEffects(root, finishedWork);
  commitMutationEffects(root, finishedWork, lanes);    // DOM 更新
  root.current = finishedWork;                         // 切换树
  commitLayoutEffects(finishedWork, root, lanes);      // useLayoutEffect
  
  // 直到这里才结束，释放 JS 线程
  executionContext = prevExecutionContext;
  
  // GUI 线程才有机会执行
}

// 特点：
// 1. 没有 await、没有 setTimeout
// 2. 没有让出控制权（yield）
// 3. 从开始到结束，JS 线程一直占用
// 4. GUI 线程只能等待`}
          </pre>
        </div>

        <div style={{ background: '#fff', padding: '15px', borderRadius: '5px' }}>
          <h3>2. useEffect 是异步调度的</h3>
          <pre style={{ background: '#f5f5f5', padding: '10px', overflow: 'auto' }}>
{`// ReactFiberWorkLoop.old.js

function commitRootImpl(root, renderPriorityLevel) {
  // ... commitLayoutEffects 执行完毕 ...
  
  // 调度 Passive Effects（useEffect），但不立即执行
  if (rootDoesHavePassiveEffects) {
    rootDoesHavePassiveEffects = false;
    rootWithPendingPassiveEffects = root;
    pendingPassiveEffectsLanes = lanes;
    
    // 注册到调度器，等待下一个任务
    scheduleCallback(NormalSchedulerPriority, () => {
      flushPassiveEffects();  // 这个会在后续的 Tick 中执行
      return null;
    });
  }
  
  // 函数结束，释放 JS 线程
  // GUI 线程可以渲染了
}

// 关键：
// 1. useEffect 通过 scheduleCallback 异步调度
// 2. commitRootImpl 结束后，GUI 线程立即可以渲染
// 3. useEffect 在下一个事件循环中执行`}
          </pre>
        </div>
      </div>

      {/* 总结 */}
      <div style={{ background: '#e0f2f1', padding: '20px', borderRadius: '8px', marginTop: '20px' }}>
        <h2>📝 总结</h2>
        
        <div style={{ background: '#fff', padding: '15px', borderRadius: '5px' }}>
          <h3>🎯 核心答案：</h3>
          <ol style={{ lineHeight: '1.8' }}>
            <li>
              <strong>JS 线程和 GUI 渲染线程确实是互斥的</strong>
              <ul>
                <li>设计原因：避免数据竞态条件（Race Condition）</li>
                <li>保证 DOM 状态和显示状态一致</li>
              </ul>
            </li>
            
            <li>
              <strong>为什么能阻塞浏览器绘制？</strong>
              <ul>
                <li>当 JS 在执行时，它持有主线程的锁</li>
                <li>GUI 渲染线程必须等待 JS 释放锁</li>
                <li>如果 JS 执行时间长（如 useLayoutEffect），GUI 就被延迟</li>
              </ul>
            </li>
            
            <li>
              <strong>浏览器事件循环机制</strong>
              <ul>
                <li>每个 Tick：执行 JS → 执行微任务 → 渲染（如果需要）</li>
                <li>渲染频率：约 60fps（16.6ms 一次）</li>
                <li>如果 JS 执行超过 16.6ms，就会掉帧</li>
              </ul>
            </li>
            
            <li>
              <strong>React 的 useLayoutEffect</strong>
              <ul>
                <li>在 Commit 阶段同步执行</li>
                <li>此时 DOM 已更新，但浏览器未绘制</li>
                <li>阻塞 GUI 线程，直到执行完毕</li>
                <li>用途：读取布局并同步调整，避免闪烁</li>
              </ul>
            </li>
          </ol>

          <div style={{ background: '#fff9c4', padding: '15px', marginTop: '15px', borderRadius: '5px' }}>
            <h4>💡 记忆要点：</h4>
            <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#1976d2' }}>
              JS 执行 = GUI 等待<br/>
              GUI 渲染 = JS 等待<br/>
              互斥设计 = 数据一致<br/>
              长时间 JS = 页面卡顿
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
