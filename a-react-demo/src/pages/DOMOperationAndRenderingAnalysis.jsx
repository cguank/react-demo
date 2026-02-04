import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';

/**
 * DOM 操作与浏览器渲染的关系分析
 * 
 * 核心问题：
 * 1. DOM 操作是宏任务吗？
 * 2. Commit 阶段的 DOM 操作为何不会立即渲染？
 * 3. JS 线程和 UI 线程的互斥关系
 * 4. useLayoutEffect 为何能阻塞浏览器绘制？
 */

export default function DOMOperationAndRenderingAnalysis() {
  const [expandedSection, setExpandedSection] = useState(null);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', color: '#61dafb' }}>🎨 DOM 操作与浏览器渲染的关系</h1>
      
      <Section
        title="✅ 核心纠正"
        id="correction"
        expanded={expandedSection === 'correction'}
        onToggle={() => setExpandedSection(expandedSection === 'correction' ? null : 'correction')}
      >
        <CoreCorrection />
      </Section>

      <Section
        title="🧵 JS 线程与 GUI 渲染线程的互斥"
        id="threads"
        expanded={expandedSection === 'threads'}
        onToggle={() => setExpandedSection(expandedSection === 'threads' ? null : 'threads')}
      >
        <ThreadMutualExclusion />
      </Section>

      <Section
        title="📋 完整渲染流程"
        id="flow"
        expanded={expandedSection === 'flow'}
        onToggle={() => setExpandedSection(expandedSection === 'flow' ? null : 'flow')}
      >
        <RenderingFlow />
      </Section>

      <Section
        title="🔍 Commit 阶段详解"
        id="commit"
        expanded={expandedSection === 'commit'}
        onToggle={() => setExpandedSection(expandedSection === 'commit' ? null : 'commit')}
      >
        <CommitPhaseDetail />
      </Section>

      <Section
        title="⏰ 宏任务 vs DOM 操作"
        id="task"
        expanded={expandedSection === 'task'}
        onToggle={() => setExpandedSection(expandedSection === 'task' ? null : 'task')}
      >
        <MacrotaskVsDOM />
      </Section>

      <Section
        title="🎯 useLayoutEffect 阻塞原理"
        id="layout"
        expanded={expandedSection === 'layout'}
        onToggle={() => setExpandedSection(expandedSection === 'layout' ? null : 'layout')}
      >
        <LayoutEffectBlocking />
      </Section>

      <Section
        title="🧪 实际示例"
        id="example"
        expanded={expandedSection === 'example'}
        onToggle={() => setExpandedSection(expandedSection === 'example' ? null : 'example')}
      >
        <PracticalExample />
      </Section>
    </div>
  );
}

function Section({ title, id, expanded, onToggle, children }) {
  return (
    <div style={{ marginBottom: '20px', border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden' }}>
      <div
        onClick={onToggle}
        style={{
          padding: '15px 20px',
          background: expanded ? '#e3f2fd' : '#f5f5f5',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontWeight: 'bold',
          fontSize: '18px'
        }}
      >
        <span>{title}</span>
        <span style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.3s' }}>▼</span>
      </div>
      {expanded && (
        <div style={{ padding: '20px', background: '#fff' }}>
          {children}
        </div>
      )}
    </div>
  );
}

function CoreCorrection() {
  return (
    <div>
      <h3>核心纠正与正确理解</h3>
      <pre style={{ background: '#f5f5f5', padding: '15px', borderRadius: '5px', overflow: 'auto', fontSize: '14px', lineHeight: '1.8' }}>
{`用户理解的纠正：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

❌ 错误理解：
"DOM 操作是宏任务"

✅ 正确理解：
"DOM 操作不是宏任务，而是同步的 JavaScript API 调用"


详细解释：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. DOM 操作是同步的
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const div = document.createElement('div');
document.body.appendChild(div);  // 🔥 同步操作，立即修改 DOM 树
div.textContent = 'Hello';       // 🔥 同步操作，立即修改 DOM

这些操作会：
✅ 立即修改 DOM 树结构
✅ 立即标记需要重排重绘（dirty flag）
❌ 不会立即触发浏览器渲染
❌ 不是宏任务


2. 宏任务的定义
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

宏任务（Macrotask）包括：
✅ setTimeout
✅ setInterval
✅ setImmediate (Node.js)
✅ MessageChannel.postMessage
✅ I/O 操作
✅ UI 渲染（浏览器渲染帧）
✅ script 标签执行

❌ DOM 操作不是宏任务


3. 你理解正确的部分 ✅
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ "在 commit 阶段即使进行了 DOM 操作，但是 JS 线程没有让出，
   所以浏览器还是没办法绘制最新 DOM"
   
✅ "JS 线程和 UI 线程是互斥的"

这两点理解是完全正确的！


完整的正确理解：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. DOM 操作（如 appendChild、removeChild、setAttribute）是同步的 
   JavaScript API 调用

2. 这些操作会立即修改 DOM 树，但不会立即触发浏览器渲染

3. 因为 JS 线程和 GUI 渲染线程是互斥的：
   - 当 JS 线程在执行时，GUI 渲染线程被阻塞
   - 浏览器无法进行 Recalculate Style、Layout、Paint

4. 只有当 JS 执行栈清空，JS 线程让出控制权后，
   浏览器才会在下一个渲染帧执行渲染流程

5. React 的 Commit 阶段是同步的：
   - 所有 DOM 操作在 Commit 阶段同步完成
   - useLayoutEffect 在 Commit 阶段同步执行
   - 整个 Commit 阶段 JS 线程都没有让出
   - 所以 useLayoutEffect 能读取最新 DOM，但也会阻塞渲染


时间线：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

JS 执行中（JS 线程占用）：
┌─────────────────────────────────────────┐
│  Render 阶段（计算虚拟 DOM）              │
├─────────────────────────────────────────┤
│  Commit 阶段：                           │
│    - commitBeforeMutationEffects        │
│    - commitMutationEffects 🔥 DOM 操作  │
│      ├─ appendChild(node)    同步修改    │
│      ├─ removeChild(node)    同步修改    │
│      └─ setAttribute(...)    同步修改    │
│    - commitLayoutEffects                │
│      └─ useLayoutEffect 回调 🔥 同步执行  │
└─────────────────────────────────────────┘
         ↓
     JS 线程让出
         ↓
浏览器渲染帧（GUI 渲染线程接管）：
┌─────────────────────────────────────────┐
│  requestAnimationFrame 回调              │
├─────────────────────────────────────────┤
│  Recalculate Style（重新计算样式）        │
├─────────────────────────────────────────┤
│  Layout（重排/回流）                      │
├─────────────────────────────────────────┤
│  Paint（重绘）                           │
├─────────────────────────────────────────┤
│  Composite（合成）                       │
└─────────────────────────────────────────┘
         ↓
     屏幕更新 ✨


关键要点：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔥 DOM 操作不是宏任务，是同步 API 调用
🔥 DOM 操作立即修改 DOM 树，但不立即渲染
🔥 JS 线程和 GUI 渲染线程互斥
🔥 只有 JS 线程让出后，浏览器才能渲染
🔥 useLayoutEffect 能阻塞渲染，因为它在 JS 让出前执行`}
      </pre>
    </div>
  );
}

function ThreadMutualExclusion() {
  return (
    <div>
      <h3>JS 线程与 GUI 渲染线程的互斥关系</h3>
      <pre style={{ background: '#f5f5f5', padding: '15px', borderRadius: '5px', overflow: 'auto', fontSize: '13px', lineHeight: '1.8' }}>
{`为什么 JS 线程和 GUI 渲染线程是互斥的？
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. 设计原因
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

如果 JS 线程和 GUI 渲染线程可以并行：

❌ 问题 1：不一致的渲染结果
   JS 线程：正在修改 DOM
   渲染线程：同时读取 DOM 进行渲染
   结果：屏幕显示的可能是中间状态

❌ 问题 2：竞态条件
   JS：element.style.color = 'red';
   渲染：读取到 element.style.color（可能是旧值）
   JS：element.style.color = 'blue';
   结果：不可预测

✅ 解决方案：互斥执行
   - JS 执行时，渲染线程等待
   - 渲染时，JS 执行等待（实际上渲染很快）


2. 浏览器的多线程架构
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

浏览器主要线程：

┌──────────────────────────────────────────┐
│  JS 引擎线程（JavaScript Engine Thread）  │  ← 执行 JS 代码
├──────────────────────────────────────────┤
│  GUI 渲染线程（Rendering Thread）         │  ← 渲染页面
├──────────────────────────────────────────┤
│  事件触发线程（Event Trigger Thread）      │  ← 管理事件队列
├──────────────────────────────────────────┤
│  定时器线程（Timer Thread）               │  ← 管理 setTimeout 等
├──────────────────────────────────────────┤
│  异步 HTTP 请求线程（HTTP Thread）        │  ← 处理网络请求
└──────────────────────────────────────────┘

🔥 JS 引擎线程和 GUI 渲染线程是互斥的
   其他线程可以并行执行


3. 互斥的表现
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

场景 1：长时间 JS 执行导致页面卡死

function heavyComputation() {
  const start = Date.now();
  while (Date.now() - start < 3000) {
    // 执行 3 秒的计算
  }
}

button.addEventListener('click', () => {
  heavyComputation();  // 🔥 JS 线程占用 3 秒
  // 这 3 秒内：
  // ❌ 页面无法渲染
  // ❌ 用户无法交互
  // ❌ 动画停止
  // ❌ 滚动卡住
});


场景 2：DOM 操作不会立即渲染

element.style.width = '100px';   // 🔥 同步修改 DOM
console.log('DOM 已修改');
// 此时 DOM 树已改变，但屏幕还未更新

// 继续执行 JS
for (let i = 0; i < 1000000; i++) {
  // 一些计算
}

// JS 执行完毕后，浏览器才会渲染
// 屏幕才会显示 width: 100px


场景 3：强制同步布局（Layout Thrashing）

element.style.width = '100px';   // 写操作，标记 dirty
const width = element.offsetWidth;  // 🔥 读操作，强制同步布局！

流程：
1. style.width = '100px' → 标记需要重排
2. offsetWidth 读取 → 浏览器必须立即计算布局
3. 触发同步的 Recalculate Style + Layout
4. 返回 offsetWidth 值
5. JS 继续执行

注意：这里的 Layout 是同步的，但不包括 Paint 和 Composite


4. React Commit 阶段的表现
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

commitRootImpl() {
  // 🔥 整个 Commit 阶段是同步的，JS 线程一直占用
  
  // 阶段 1：Before Mutation
  commitBeforeMutationEffects(finishedWork);
  
  // 阶段 2：Mutation（DOM 操作）
  commitMutationEffects(finishedWork);
  // ├─ appendChild(node)      同步修改 DOM 树
  // ├─ removeChild(node)      同步修改 DOM 树
  // ├─ setAttribute(...)      同步修改 DOM 树
  // └─ textContent = '...'    同步修改 DOM 树
  
  // 此时：
  // ✅ DOM 树已经是最新的
  // ❌ 浏览器还未渲染到屏幕
  // ❌ 因为 JS 线程还在执行
  
  // 阶段 3：Layout
  commitLayoutEffects(finishedWork);
  // └─ 执行 useLayoutEffect 回调
  
  // useLayoutEffect 中：
  useLayoutEffect(() => {
    const height = element.offsetHeight;  // ✅ 能读到最新的布局
    // 为什么能读到？因为 DOM 树已更新
    // 如果访问布局属性，会触发同步布局计算
    
    element.style.opacity = 1;  // ✅ 可以继续修改 DOM
    // 浏览器还没渲染，所以不会有闪烁
  });
  
  // Commit 阶段结束，但 JS 线程还可能执行其他同步代码
}

// 当前宏任务执行完毕
// ↓
// JS 线程让出
// ↓
// 浏览器渲染帧开始
// ↓
requestAnimationFrame(() => {
  // 🔥 此时浏览器准备渲染
  console.log('准备渲染');
});
// ↓
// Recalculate Style
// ↓
// Layout
// ↓
// Paint
// ↓
// Composite
// ↓
// 屏幕更新 ✨


5. 时间轴示例
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

点击按钮触发更新：

Time  │ JS 线程状态                │ GUI 渲染线程状态
──────┼───────────────────────────┼─────────────────────
0ms   │ onClick 事件触发            │ 等待
      │ setState()                 │ 等待
──────┼───────────────────────────┼─────────────────────
1ms   │ 调度更新                   │ 等待
      │ scheduleCallback()         │ 等待
──────┼───────────────────────────┼─────────────────────
2ms   │ Render 阶段开始             │ 等待
      │ beginWork, completeWork    │ 等待
──────┼───────────────────────────┼─────────────────────
5ms   │ Render 阶段结束             │ 等待
      │ Commit 阶段开始             │ 等待
──────┼───────────────────────────┼─────────────────────
6ms   │ commitMutationEffects      │ 等待
      │ 🔥 DOM 操作（同步）          │ 等待（被阻塞）
      │   appendChild()            │ 等待
      │   removeChild()            │ 等待
──────┼───────────────────────────┼─────────────────────
7ms   │ commitLayoutEffects        │ 等待
      │ 🔥 useLayoutEffect 执行     │ 等待（被阻塞）
      │   读取 DOM 布局             │ 等待
──────┼───────────────────────────┼─────────────────────
8ms   │ Commit 结束                │ 等待
      │ 调度 useEffect（异步）      │ 等待
──────┼───────────────────────────┼─────────────────────
9ms   │ 当前宏任务结束             │ 等待
      │ JS 线程让出 🚀              │ 接管！
──────┼───────────────────────────┼─────────────────────
10ms  │ 空闲                       │ 🎨 Recalculate Style
──────┼───────────────────────────┼─────────────────────
11ms  │ 空闲                       │ 🎨 Layout (重排)
──────┼───────────────────────────┼─────────────────────
12ms  │ 空闲                       │ 🎨 Paint (重绘)
──────┼───────────────────────────┼─────────────────────
13ms  │ 空闲                       │ 🎨 Composite (合成)
──────┼───────────────────────────┼─────────────────────
14ms  │ 空闲                       │ 屏幕更新完成 ✨
──────┼───────────────────────────┼─────────────────────
16ms  │ 执行 useEffect 回调         │ 等待
      │ （通过 MessageChannel）     │ 等待


关键理解：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔥 JS 线程和 GUI 渲染线程同一时刻只能有一个在工作
🔥 DOM 操作是同步的 JS API，在 JS 线程中执行
🔥 DOM 操作会修改 DOM 树，但不会触发渲染
🔥 只有 JS 线程让出后，GUI 渲染线程才能工作
🔥 useLayoutEffect 在 JS 线程让出前执行，所以会阻塞渲染`}
      </pre>
    </div>
  );
}

function RenderingFlow() {
  return (
    <div>
      <h3>完整的浏览器渲染流程</h3>
      <pre style={{ background: '#f5f5f5', padding: '15px', borderRadius: '5px', overflow: 'auto', fontSize: '13px', lineHeight: '1.8' }}>
{`从 DOM 修改到屏幕更新的完整流程
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

阶段 1：JavaScript 执行（JS 线程）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// 1. 修改 DOM
element.textContent = 'Hello';
element.style.color = 'red';
document.body.appendChild(newElement);

// 这些操作：
// ✅ 同步修改 DOM 树
// ✅ 标记元素为 dirty（需要重新计算）
// ❌ 不会触发渲染

// 2. React Commit 阶段的 DOM 操作
commitMutationEffects() {
  appendChild(node);     // 同步
  removeChild(node);     // 同步
  setAttribute(...);     // 同步
}

// 3. useLayoutEffect
commitLayoutEffects() {
  // 执行 useLayoutEffect 回调
  useLayoutEffect(() => {
    const height = div.offsetHeight;  // 强制同步布局
    div.style.top = height + 'px';
  });
}

// 4. 当前宏任务结束
// JS 线程让出控制权


阶段 2：浏览器渲染帧（GUI 渲染线程）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

┌────────────────────────────────────────────┐
│  Step 1: requestAnimationFrame 回调         │
├────────────────────────────────────────────┤
│  在渲染开始前执行                            │
│  通常用于动画                                │
└────────────────────────────────────────────┘
         ↓
┌────────────────────────────────────────────┐
│  Step 2: Recalculate Style（重新计算样式）   │
├────────────────────────────────────────────┤
│  1. 收集所有 dirty 元素                      │
│  2. 计算最终的 CSS 样式                      │
│  3. 处理 CSS 继承、层叠                      │
│  4. 生成 Computed Style                     │
│                                            │
│  输入：DOM 树 + CSSOM 树                    │
│  输出：带样式的 DOM 树                       │
└────────────────────────────────────────────┘
         ↓
┌────────────────────────────────────────────┐
│  Step 3: Layout（布局/重排/回流）            │
├────────────────────────────────────────────┤
│  1. 计算每个元素的几何信息                    │
│     - 位置（x, y）                          │
│     - 尺寸（width, height）                 │
│     - 边距、内边距                           │
│  2. 构建 Render Tree（渲染树）               │
│  3. 计算布局（Box Model）                    │
│                                            │
│  输入：带样式的 DOM 树                       │
│  输出：Render Tree（带几何信息）             │
└────────────────────────────────────────────┘
         ↓
┌────────────────────────────────────────────┐
│  Step 4: Paint（绘制/重绘）                  │
├────────────────────────────────────────────┤
│  1. 遍历 Render Tree                        │
│  2. 将每个元素绘制成像素                      │
│  3. 生成多个 Layer（图层）                   │
│  4. 绘制文字、颜色、图片、边框、阴影等         │
│                                            │
│  输入：Render Tree                          │
│  输出：多个 Layer（位图）                    │
└────────────────────────────────────────────┘
         ↓
┌────────────────────────────────────────────┐
│  Step 5: Composite（合成）                  │
├────────────────────────────────────────────┤
│  1. 将多个 Layer 合成一个图像                │
│  2. 处理 z-index、opacity、transform         │
│  3. GPU 加速                               │
│  4. 最终输出到屏幕                           │
│                                            │
│  输入：多个 Layer                           │
│  输出：最终的屏幕图像                        │
└────────────────────────────────────────────┘
         ↓
       屏幕更新 ✨


性能优化关键点
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. 避免触发 Layout（最昂贵）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

触发 Layout 的操作：
❌ 修改 width、height、padding、margin
❌ 修改 display、position、float
❌ 添加/删除元素
❌ 改变文字内容、字体大小

优化方法：
✅ 使用 transform 代替 left/top
✅ 使用 visibility 代替 display
✅ 批量修改 DOM


2. 避免触发 Paint（较昂贵）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

触发 Paint 的操作：
❌ 修改 color、background
❌ 修改 border-radius、box-shadow
❌ 修改 visibility

优化方法：
✅ 使用 opacity 代替 visibility
✅ 使用 transform 做动画


3. 只触发 Composite（最便宜）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

只触发 Composite 的属性：
✅ transform
✅ opacity

优化方法：
✅ 使用 transform 做位移、缩放
✅ 使用 will-change 提前告知浏览器
✅ 使用 GPU 加速


完整时间线示例
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// JavaScript 执行
button.addEventListener('click', () => {
  // 0ms: 开始执行
  element.style.width = '200px';    // 标记 dirty
  element.textContent = 'Updated';  // 标记 dirty
  
  // 5ms: 继续执行
  useLayoutEffect(() => {
    // 读取布局会触发同步 Layout
    const height = element.offsetHeight;
    console.log(height);  // 触发同步计算
  });
  
  // 10ms: JS 执行结束
  // JS 线程让出
});

// 15ms: 浏览器渲染帧开始
// - requestAnimationFrame 回调
// - Recalculate Style
// - Layout（如果需要）
// - Paint（如果需要）
// - Composite

// 20ms: 屏幕更新完成


React 更新的完整流程
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Render 阶段（JS 线程）
   - beginWork, completeWork
   - 计算虚拟 DOM
   - Diff 算法
   - 标记副作用

2. Commit 阶段（JS 线程）
   - commitMutationEffects: DOM 操作
   - commitLayoutEffects: useLayoutEffect

3. JS 线程让出

4. 浏览器渲染（GUI 线程）
   - Recalculate Style
   - Layout
   - Paint
   - Composite

5. 屏幕更新

6. useEffect 执行（JS 线程）
   - 异步执行，下一个宏任务`}
      </pre>
    </div>
  );
}

function CommitPhaseDetail() {
  return (
    <div>
      <h3>Commit 阶段的 DOM 操作详解</h3>
      <pre style={{ background: '#f5f5f5', padding: '15px', borderRadius: '5px', overflow: 'auto', fontSize: '13px', lineHeight: '1.8' }}>
{`Commit 阶段为何 DOM 操作不会立即渲染？
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

核心原因：整个 Commit 阶段是同步的，JS 线程一直占用


详细流程
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function commitRootImpl(root, renderPriorityLevel) {
  
  // ==================== 阶段 1：Before Mutation ====================
  
  commitBeforeMutationEffects(finishedWork);
  // - 执行 getSnapshotBeforeUpdate
  // - 调度 useEffect（放入队列，不执行）
  // - 清理 container（如果需要）
  
  // 此时：
  // ✅ JS 线程在执行
  // ❌ 还没有 DOM 操作
  // ❌ GUI 渲染线程等待
  
  
  // ==================== 阶段 2：Mutation ====================
  
  commitMutationEffects(root, finishedWork, lanes);
  
  // 🔥🔥 DOM 操作在这里执行（同步）
  
  // 具体操作示例：
  
  // 1. 插入元素
  function commitPlacement(finishedWork) {
    const parentFiber = getHostParentFiber(finishedWork);
    const parent = parentFiber.stateNode;
    const before = getHostSibling(finishedWork);
    
    // 🔥 同步 DOM 操作
    if (before) {
      parent.insertBefore(finishedWork.stateNode, before);
    } else {
      parent.appendChild(finishedWork.stateNode);
    }
    
    // 操作完成后：
    // ✅ DOM 树已更新
    // ❌ 浏览器还未渲染
    // ❌ 因为 JS 线程还在执行
  }
  
  // 2. 更新属性
  function commitWork(current, finishedWork) {
    const instance = finishedWork.stateNode;
    const newProps = finishedWork.memoizedProps;
    
    // 🔥 同步更新 DOM 属性
    updateProperties(instance, newProps, oldProps);
    // 实际调用：
    // element.setAttribute('class', 'new-class');
    // element.style.color = 'red';
    // element.textContent = 'new text';
    
    // 操作完成后：
    // ✅ DOM 属性已更新
    // ❌ 样式计算还未执行
    // ❌ 布局还未重新计算
    // ❌ 屏幕还未更新
  }
  
  // 3. 删除元素
  function commitDeletion(root, current) {
    unmountHostComponents(root, current);
    // 实际调用：
    // parent.removeChild(element);
    
    // 操作完成后：
    // ✅ DOM 树已更新
    // ❌ 浏览器还未渲染
  }
  
  // Mutation 阶段结束
  // 此时：
  // ✅ 所有 DOM 操作完成
  // ✅ DOM 树是最新的
  // ❌ 浏览器还未渲染（JS 线程还在执行）
  // ❌ 屏幕显示的还是旧内容
  
  
  // ==================== 切换 Fiber 树 ====================
  
  root.current = finishedWork;  // 切换到新的 Fiber 树
  
  
  // ==================== 阶段 3：Layout ====================
  
  commitLayoutEffects(finishedWork, root, lanes);
  
  // 🔥🔥 useLayoutEffect 在这里执行（同步）
  
  function commitLayoutEffectOnFiber(
    finishedRoot,
    current,
    finishedWork,
    committedLanes,
  ) {
    switch (finishedWork.tag) {
      case FunctionComponent: {
        // 执行 useLayoutEffect 的 create 函数
        commitHookEffectListMount(
          HookLayout | HookHasEffect,
          finishedWork,
        );
        
        // 实际执行：
        useLayoutEffect(() => {
          // 🔥 这个回调在这里同步执行
          
          // ✅ 可以读取最新的 DOM
          const height = element.offsetHeight;
          
          // 为什么能读取？
          // 1. DOM 树已经是最新的（Mutation 阶段完成）
          // 2. 访问 offsetHeight 会触发同步布局计算
          //    浏览器会立即执行：
          //    - Recalculate Style
          //    - Layout
          //    但不包括 Paint 和 Composite
          
          // ✅ 可以继续修改 DOM
          element.style.opacity = 1;
          
          // 这些修改：
          // ✅ 立即更新 DOM 树
          // ❌ 不会立即渲染
          // ❌ 因为 JS 线程还在执行
        });
        
        break;
      }
      case ClassComponent: {
        // 执行 componentDidMount / componentDidUpdate
        const instance = finishedWork.stateNode;
        if (current === null) {
          instance.componentDidMount();
        } else {
          instance.componentDidUpdate(prevProps, prevState, snapshot);
        }
        break;
      }
    }
  }
  
  // Layout 阶段结束
  // 此时：
  // ✅ 所有 DOM 操作完成
  // ✅ useLayoutEffect 执行完成
  // ✅ DOM 树是最新的
  // ❌ 浏览器还未渲染（JS 线程还在执行）
  
  
  // ==================== 调度 useEffect ====================
  
  if (
    (finishedWork.flags & PassiveMask) !== NoFlags ||
    (finishedWork.subtreeFlags & PassiveMask) !== NoFlags
  ) {
    // 🔥 调度 useEffect（异步，不阻塞）
    scheduleCallback(NormalSchedulerPriority, () => {
      flushPassiveEffects();
      return null;
    });
  }
  
  // Commit 阶段完全结束
  // JS 线程还可能继续执行其他同步代码
  
} // commitRootImpl 结束


// ==================== JS 线程让出 ====================

// 当前宏任务执行完毕
// JS 调用栈清空
// JS 线程让出控制权


// ==================== 浏览器渲染 ====================

// GUI 渲染线程接管
// 执行渲染流程：
// - requestAnimationFrame 回调
// - Recalculate Style
// - Layout
// - Paint
// - Composite
// 屏幕更新 ✨


// ==================== useEffect 执行 ====================

// 下一个宏任务（MessageChannel）
// JS 线程重新执行
flushPassiveEffects();
// 执行 useEffect 回调


为什么这样设计？
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. 保证 DOM 操作的原子性
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

如果 DOM 操作后立即渲染：

❌ 问题：
   - 操作 1: 添加元素 → 渲染 → 屏幕闪烁
   - 操作 2: 更新样式 → 渲染 → 屏幕闪烁
   - 操作 3: 添加类名 → 渲染 → 屏幕闪烁

✅ 现在的设计：
   - 所有 DOM 操作一次性完成
   - 浏览器一次性渲染
   - 用户看到的是最终结果


2. useLayoutEffect 可以读取最新布局
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

useLayoutEffect(() => {
  // ✅ DOM 已更新
  // ✅ 可以读取布局
  const rect = element.getBoundingClientRect();
  
  // ✅ 可以基于布局再次修改 DOM
  tooltip.style.top = rect.bottom + 'px';
  
  // ❌ 浏览器还未渲染
  // ✅ 所以不会有闪烁
});


3. 批量更新提高性能
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

setState 多次：
setState({ count: 1 });
setState({ count: 2 });
setState({ count: 3 });

✅ React 批量处理
✅ 只进行一次 DOM 操作
✅ 浏览器只渲染一次


关键理解
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔥 Commit 阶段的 DOM 操作是同步的
🔥 所有 DOM 操作完成后，JS 线程还在执行
🔥 useLayoutEffect 在 DOM 操作后、浏览器渲染前执行
🔥 只有 JS 线程让出后，浏览器才能渲染
🔥 这保证了 DOM 更新的原子性和一致性`}
      </pre>
    </div>
  );
}

function MacrotaskVsDOM() {
  return (
    <div>
      <h3>宏任务 vs DOM 操作</h3>
      <pre style={{ background: '#f5f5f5', padding: '15px', borderRadius: '5px', overflow: 'auto', fontSize: '13px', lineHeight: '1.8' }}>
{`DOM 操作不是宏任务
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. 宏任务的定义
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

宏任务（Macrotask / Task）：
✅ script 标签执行（整体代码）
✅ setTimeout / setInterval
✅ setImmediate (Node.js)
✅ I/O 操作
✅ UI 渲染（浏览器渲染帧）
✅ MessageChannel.postMessage
✅ requestAnimationFrame（在渲染前执行，算特殊的宏任务）

微任务（Microtask / Job）：
✅ Promise.then / catch / finally
✅ MutationObserver
✅ queueMicrotask
✅ process.nextTick (Node.js)


2. DOM 操作是同步 API
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DOM 操作：
❌ 不是宏任务
❌ 不是微任务
✅ 是同步的 JavaScript API 调用

示例：

console.log('1');

// 🔥 DOM 操作（同步）
document.body.appendChild(div);
div.textContent = 'Hello';
div.style.color = 'red';

console.log('2');

// setTimeout（宏任务）
setTimeout(() => {
  console.log('4');
}, 0);

// Promise（微任务）
Promise.resolve().then(() => {
  console.log('3');
});

// 输出顺序：1, 2, 3, 4


3. 事件循环（Event Loop）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

┌─────────────────────────────────────────────┐
│  执行栈（Call Stack）                        │
│  ├─ 同步代码                                 │
│  ├─ DOM 操作（同步 API）                     │
│  └─ 函数调用                                 │
└─────────────────────────────────────────────┘
         ↓
    执行栈清空
         ↓
┌─────────────────────────────────────────────┐
│  微任务队列（Microtask Queue）               │
│  ├─ Promise.then                            │
│  ├─ MutationObserver                        │
│  └─ queueMicrotask                          │
└─────────────────────────────────────────────┘
         ↓
    微任务队列清空
         ↓
┌─────────────────────────────────────────────┐
│  宏任务队列（Macrotask Queue）               │
│  ├─ setTimeout                              │
│  ├─ setInterval                             │
│  ├─ MessageChannel                          │
│  └─ UI 渲染                                 │
└─────────────────────────────────────────────┘
         ↓
    执行一个宏任务
         ↓
    返回执行栈


完整的事件循环：

1. 执行同步代码（包括 DOM 操作）
2. 执行栈清空
3. 执行所有微任务
4. 微任务队列清空
5. 浏览器渲染（如果需要）
6. 从宏任务队列取出一个任务
7. 回到步骤 1


4. DOM 操作在事件循环中的位置
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

示例代码：

button.addEventListener('click', () => {
  console.log('Start');
  
  // 🔥 DOM 操作（同步，立即执行）
  element.style.width = '100px';
  console.log('DOM updated');
  
  // 微任务
  Promise.resolve().then(() => {
    console.log('Promise 1');
  });
  
  // 继续同步代码
  console.log('After Promise');
  
  // 宏任务
  setTimeout(() => {
    console.log('Timeout');
  }, 0);
  
  // 又一个微任务
  Promise.resolve().then(() => {
    console.log('Promise 2');
  });
  
  console.log('End');
});

// 输出顺序：
// Start
// DOM updated
// After Promise
// End
// Promise 1
// Promise 2
// [浏览器渲染]
// Timeout


执行流程分析：

1. 执行栈（同步代码）：
   ├─ console.log('Start')
   ├─ element.style.width = '100px'  🔥 同步 DOM 操作
   ├─ console.log('DOM updated')
   ├─ Promise.resolve().then(...)     注册微任务
   ├─ console.log('After Promise')
   ├─ setTimeout(...)                 注册宏任务
   ├─ Promise.resolve().then(...)     注册微任务
   └─ console.log('End')

2. 执行栈清空

3. 执行微任务队列：
   ├─ console.log('Promise 1')
   └─ console.log('Promise 2')

4. 微任务队列清空

5. 🎨 浏览器渲染（GUI 渲染线程）
   ├─ Recalculate Style
   ├─ Layout
   ├─ Paint
   └─ Composite

6. 执行宏任务：
   └─ console.log('Timeout')


5. React 更新的事件循环位置
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

setState() 触发的流程：

// 用户点击（当前宏任务）
button.addEventListener('click', () => {
  
  // 1. 同步代码：调度更新
  setState({ count: 1 });  // 同步注册更新
  
  // 2. 同步代码：Render 阶段
  // 如果是同步更新（React 18 之前的默认行为）
  // 或者 flushSync
  performSyncWorkOnRoot();
    renderRootSync();      // Render 阶段
    commitRoot();          // Commit 阶段
      commitMutationEffects();    // 🔥 DOM 操作（同步）
      commitLayoutEffects();      // 🔥 useLayoutEffect（同步）
  
  // 3. 调度 useEffect（注册宏任务）
  scheduleCallback(() => {
    flushPassiveEffects();  // 执行 useEffect
  });
  
  // 当前宏任务结束
});

// 微任务执行
// 浏览器渲染
// useEffect 宏任务执行


对比：

setTimeout vs DOM 操作：

setTimeout(() => {
  console.log('I am a macrotask');
}, 0);
// ✅ 宏任务：下次事件循环执行

element.style.color = 'red';
// ❌ 不是宏任务：立即同步执行
// ✅ 修改 DOM 树
// ❌ 不会立即渲染


6. 强制同步布局（Layout Thrashing）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

特殊情况：读取布局属性会触发同步布局

// 写操作：修改 DOM（同步）
element.style.width = '100px';  // 标记 dirty

// 读操作：读取布局（触发同步布局！）
const width = element.offsetWidth;
//           ↑
//           这里会触发：
//           - Recalculate Style
//           - Layout
//           但不会 Paint 和 Composite

// 为什么？
// 因为浏览器需要计算最新的布局才能返回正确的 offsetWidth


性能陷阱（Layout Thrashing）：

for (let i = 0; i < 100; i++) {
  elements[i].style.width = '100px';  // 写
  const w = elements[i].offsetWidth;  // 读 → 触发同步布局
  // 循环 100 次，触发 100 次布局计算！
}

优化方法：

// 先读
const widths = elements.map(el => el.offsetWidth);

// 后写
for (let i = 0; i < 100; i++) {
  elements[i].style.width = '100px';
}
// 只触发一次布局计算


关键理解
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔥 DOM 操作不是宏任务，是同步 API
🔥 DOM 操作在当前执行栈中立即执行
🔥 DOM 操作修改 DOM 树，但不触发渲染
🔥 浏览器渲染是一个宏任务，在微任务之后执行
🔥 读取布局属性会触发同步布局计算
🔥 useEffect 是宏任务，setTimeout 也是宏任务`}
      </pre>
    </div>
  );
}

function LayoutEffectBlocking() {
  return (
    <div>
      <h3>useLayoutEffect 阻塞浏览器绘制的原理</h3>
      <pre style={{ background: '#f5f5f5', padding: '15px', borderRadius: '5px', overflow: 'auto', fontSize: '13px', lineHeight: '1.8' }}>
{`useLayoutEffect 为何能阻塞浏览器绘制？
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

核心原因：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. useLayoutEffect 在 Commit 阶段同步执行
2. Commit 阶段整个过程都是同步的，JS 线程一直占用
3. JS 线程和 GUI 渲染线程互斥
4. 只有 JS 线程让出后，GUI 渲染线程才能工作
5. 所以 useLayoutEffect 会阻塞浏览器绘制


详细时间线
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

onClick 事件（宏任务）：
┌──────────────────────────────────────────────┐
│  setState()                                  │  ← 0ms
│  ├─ 标记更新                                  │
│  └─ 调度更新（同步模式）                      │
└──────────────────────────────────────────────┘
         ↓
┌──────────────────────────────────────────────┐
│  Render 阶段（JS 线程）                       │  ← 1-5ms
│  ├─ beginWork                                │
│  ├─ completeWork                             │
│  └─ 生成 Fiber 树                             │
└──────────────────────────────────────────────┘
         ↓
┌──────────────────────────────────────────────┐
│  Commit 阶段（JS 线程，同步执行）              │  ← 5-15ms
│                                              │
│  ┌────────────────────────────────────────┐ │
│  │  commitBeforeMutationEffects           │ │  ← 5ms
│  │  - getSnapshotBeforeUpdate             │ │
│  └────────────────────────────────────────┘ │
│         ↓                                    │
│  ┌────────────────────────────────────────┐ │
│  │  commitMutationEffects  🔥 DOM 操作    │ │  ← 7ms
│  │  - appendChild(node)                   │ │
│  │  - removeChild(node)                   │ │
│  │  - setAttribute(...)                   │ │
│  │                                        │ │
│  │  此时：                                 │ │
│  │  ✅ DOM 树已更新                        │ │
│  │  ❌ 浏览器还未渲染（JS 占用）           │ │
│  └────────────────────────────────────────┘ │
│         ↓                                    │
│  ┌────────────────────────────────────────┐ │
│  │  root.current = finishedWork           │ │  ← 9ms
│  │  （切换 Fiber 树）                      │ │
│  └────────────────────────────────────────┘ │
│         ↓                                    │
│  ┌────────────────────────────────────────┐ │
│  │  commitLayoutEffects  🔥🔥 关键！      │ │  ← 10ms
│  │                                        │ │
│  │  useLayoutEffect(() => {               │ │
│  │    // 🔥 这里同步执行                  │ │
│  │    console.log('useLayoutEffect');     │ │
│  │                                        │ │
│  │    // 读取 DOM 布局                    │ │
│  │    const height = div.offsetHeight;    │ │
│  │    // ↑ 触发同步布局计算                │ │
│  │    // 浏览器立即计算：                  │ │
│  │    // - Recalculate Style             │ │
│  │    // - Layout                        │ │
│  │    // 但不包括 Paint, Composite        │ │
│  │                                        │ │
│  │    // 基于布局修改 DOM                 │ │
│  │    tooltip.style.top = height + 'px';  │ │
│  │    // ↑ 又修改了 DOM，标记 dirty        │ │
│  │                                        │ │
│  │    // 可能执行耗时操作                  │ │
│  │    for (let i = 0; i < 1000000; i++) { │ │
│  │      // 计算...                        │ │
│  │    }                                   │ │
│  │  });                                   │ │
│  │                                        │ │
│  │  此时：                                 │ │
│  │  ✅ useLayoutEffect 执行完成            │ │
│  │  ✅ DOM 可能又被修改了                  │ │
│  │  ❌ 浏览器还未渲染（JS 占用）           │ │
│  └────────────────────────────────────────┘ │
│         ↓                                    │  ← 15ms
│  调度 useEffect（注册宏任务，不执行）          │
│                                              │
└──────────────────────────────────────────────┘
         ↓
   当前宏任务结束
         ↓
   JS 线程让出 🚀                                 ← 16ms
         ↓
┌──────────────────────────────────────────────┐
│  浏览器渲染（GUI 渲染线程接管）                │  ← 16-20ms
│                                              │
│  ┌────────────────────────────────────────┐ │
│  │  requestAnimationFrame                 │ │
│  └────────────────────────────────────────┘ │
│         ↓                                    │
│  ┌────────────────────────────────────────┐ │
│  │  Recalculate Style                     │ │  ← 17ms
│  │  - 计算所有 dirty 元素的样式            │ │
│  └────────────────────────────────────────┘ │
│         ↓                                    │
│  ┌────────────────────────────────────────┐ │
│  │  Layout                                │ │  ← 18ms
│  │  - 计算布局（如果需要）                 │ │
│  └────────────────────────────────────────┘ │
│         ↓                                    │
│  ┌────────────────────────────────────────┐ │
│  │  Paint                                 │ │  ← 19ms
│  │  - 绘制像素                             │ │
│  └────────────────────────────────────────┘ │
│         ↓                                    │
│  ┌────────────────────────────────────────┐ │
│  │  Composite                             │ │  ← 20ms
│  │  - 合成图层                             │ │
│  └────────────────────────────────────────┘ │
│         ↓                                    │
│       屏幕更新 ✨                            │
└──────────────────────────────────────────────┘
         ↓
┌──────────────────────────────────────────────┐
│  useEffect 执行（下一个宏任务）                │  ← 25ms
│                                              │
│  MessageChannel 触发：                        │
│  flushPassiveEffects()                       │
│    ├─ 执行 useEffect cleanup                 │
│    └─ 执行 useEffect create                  │
└──────────────────────────────────────────────┘


为什么 useLayoutEffect 会阻塞？
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

useLayoutEffect(() => {
  // 🔥 这段代码在 Commit 阶段同步执行
  // 🔥 JS 线程一直占用
  // 🔥 GUI 渲染线程等待
  
  // 如果这里有耗时操作
  for (let i = 0; i < 10000000; i++) {
    // 计算...
  }
  
  // GUI 渲染线程一直等待
  // 用户看到的还是旧画面
  // 页面卡住
});

// useLayoutEffect 执行完成后
// Commit 阶段结束
// JS 线程让出
// GUI 渲染线程才能工作
// 屏幕才会更新


对比 useEffect（不阻塞）：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

onClick 事件：
┌──────────────────────────────────────────────┐
│  Render 阶段                                  │
├──────────────────────────────────────────────┤
│  Commit 阶段                                  │
│  ├─ DOM 操作                                 │
│  ├─ useLayoutEffect（同步执行）               │
│  └─ 调度 useEffect（注册，不执行）🔥          │
└──────────────────────────────────────────────┘
         ↓
   JS 线程让出
         ↓
┌──────────────────────────────────────────────┐
│  浏览器渲染  🎨                               │
│  ├─ Recalculate Style                        │
│  ├─ Layout                                   │
│  ├─ Paint                                    │
│  └─ Composite                                │
│       ↓                                      │
│     屏幕更新 ✨                               │
└──────────────────────────────────────────────┘
         ↓
   （用户已经看到新画面）
         ↓
┌──────────────────────────────────────────────┐
│  useEffect 执行（宏任务）                      │
│                                              │
│  useEffect(() => {                           │
│    // 🔥 这时候屏幕已经更新了                 │
│    // 🔥 所以不会阻塞渲染                     │
│                                              │
│    // 即使有耗时操作                          │
│    for (let i = 0; i < 10000000; i++) {      │
│      // 计算...                              │
│    }                                         │
│    // 也不影响用户看到更新                    │
│  });                                         │
└──────────────────────────────────────────────┘


使用场景
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ 使用 useLayoutEffect：

1. 需要读取 DOM 布局
useLayoutEffect(() => {
  const rect = element.getBoundingClientRect();
  setTooltipPosition(rect.bottom);
});

2. 需要在渲染前修改 DOM（避免闪烁）
useLayoutEffect(() => {
  element.style.opacity = 0;
  // 测量
  const height = element.offsetHeight;
  // 定位
  element.style.top = height + 'px';
  element.style.opacity = 1;
  // 用户只看到最终结果，没有闪烁
});

3. 需要同步执行的副作用
useLayoutEffect(() => {
  // 确保这些代码在屏幕更新前执行
});


❌ 避免使用 useLayoutEffect：

1. 不需要读取 DOM 布局
useLayoutEffect(() => {
  // ❌ 不需要读取布局，用 useEffect
  fetch('/api/data');
});

2. 耗时操作
useLayoutEffect(() => {
  // ❌ 会阻塞渲染，页面卡顿
  for (let i = 0; i < 10000000; i++) {
    // 计算...
  }
});

3. 数据获取、事件订阅等
useLayoutEffect(() => {
  // ❌ 这些应该用 useEffect
  const subscription = dataSource.subscribe();
  return () => subscription.unsubscribe();
});


✅ 使用 useEffect（默认选择）：

useEffect(() => {
  // ✅ 不阻塞渲染
  // ✅ 在屏幕更新后执行
  // ✅ 适合大多数副作用
  
  fetch('/api/data');
  const timer = setInterval(() => {}, 1000);
  return () => clearInterval(timer);
});


关键理解
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔥 useLayoutEffect 在 Commit 阶段同步执行
🔥 Commit 阶段 JS 线程一直占用，GUI 渲染线程等待
🔥 所以 useLayoutEffect 会阻塞浏览器渲染
🔥 useEffect 异步执行，在浏览器渲染后执行，不阻塞
🔥 优先使用 useEffect，只在需要同步读取 DOM 时用 useLayoutEffect`}
      </pre>
    </div>
  );
}

function PracticalExample() {
  const [count, setCount] = useState(0);
  const [logs, setLogs] = useState([]);
  const divRef = useRef(null);

  const addLog = (message) => {
    setLogs(prev => [...prev, { time: performance.now().toFixed(2), message }]);
  };

  useLayoutEffect(() => {
    addLog('🟡 useLayoutEffect: 开始执行');
    
    if (divRef.current) {
      const height = divRef.current.offsetHeight;
      addLog(`🟡 useLayoutEffect: 读取 height = ${height}px（触发同步布局）`);
    }
    
    // 模拟耗时操作
    const start = performance.now();
    while (performance.now() - start < 100) {
      // 阻塞 100ms
    }
    
    addLog('🟡 useLayoutEffect: 结束（阻塞了 100ms）');
  }, [count]);

  useEffect(() => {
    addLog('🔵 useEffect: 执行（屏幕已更新）');
  }, [count]);

  const handleClick = () => {
    setLogs([]);
    addLog('🔴 Click: setState 触发更新');
    
    requestAnimationFrame(() => {
      addLog('🟢 requestAnimationFrame: 浏览器准备渲染');
    });
    
    setCount(c => c + 1);
  };

  return (
    <div>
      <h3>实际示例：观察阻塞效果</h3>
      
      <div ref={divRef} style={{ 
        background: '#e3f2fd', 
        padding: '20px', 
        borderRadius: '5px', 
        marginBottom: '20px' 
      }}>
        <h4>Count: {count}</h4>
        <button
          onClick={handleClick}
          style={{
            padding: '10px 20px',
            background: '#2196f3',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          点击更新（观察阻塞）
        </button>
      </div>

      <div style={{ background: '#f5f5f5', padding: '15px', borderRadius: '5px' }}>
        <h4>执行日志：</h4>
        <div style={{ maxHeight: '300px', overflow: 'auto', fontSize: '13px', fontFamily: 'monospace' }}>
          {logs.map((log, index) => (
            <div key={index} style={{ marginBottom: '5px' }}>
              <span style={{ color: '#666' }}>{log.time}ms</span> - {log.message}
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: '20px', padding: '15px', background: '#fff3e0', borderRadius: '5px' }}>
        <h4>观察要点：</h4>
        <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', lineHeight: '1.8' }}>
          <li>🔴 Click 事件触发</li>
          <li>🟡 useLayoutEffect 同步执行（阻塞 100ms）</li>
          <li>🟢 requestAnimationFrame 在渲染前执行</li>
          <li>🎨 浏览器渲染（Recalculate Style, Layout, Paint, Composite）</li>
          <li>✨ 屏幕更新</li>
          <li>🔵 useEffect 在屏幕更新后执行</li>
        </ul>
        <p style={{ margin: '10px 0 0 0', color: '#666', fontSize: '13px' }}>
          注意：useLayoutEffect 的 100ms 延迟会阻塞屏幕更新，造成明显的卡顿感。
        </p>
      </div>
    </div>
  );
}
