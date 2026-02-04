import React, { useState, useLayoutEffect, useEffect, useRef } from 'react';

/**
 * useLayoutEffect 与浏览器渲染流程的关系
 * 
 * 核心问题：
 * 1. 执行 useLayoutEffect 时，DOM 树完成了吗？
 * 2. 执行 useLayoutEffect 时，CSS 树（CSSOM）完成了吗？
 * 3. 执行 useLayoutEffect 时，渲染树合成了吗？
 */

export default function UseLayoutEffectBrowserRenderingAnalysis() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🌲 useLayoutEffect 与浏览器渲染树的关系</h1>
      
      {/* 核心答案 */}
      <div style={{ background: '#fff3e0', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>✅ 核心答案</h2>
        <CoreAnswer />
      </div>

      {/* 浏览器渲染流程详解 */}
      <div style={{ background: '#e3f2fd', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>🖥️ 浏览器渲染流程详解</h2>
        <BrowserRenderingPipeline />
      </div>

      {/* DOM树、CSSOM、渲染树的关系 */}
      <div style={{ background: '#e8f5e9', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>🌳 DOM 树、CSSOM、渲染树的关系</h2>
        <TreesRelationship />
      </div>

      {/* React 与浏览器渲染的时间线 */}
      <div style={{ background: '#f3e5f5', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>⏱️ React 与浏览器渲染的完整时间线</h2>
        <CompleteTimeline />
      </div>

      {/* useLayoutEffect 的精确状态 */}
      <div style={{ background: '#fff9c4', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>🔍 useLayoutEffect 执行时的精确状态</h2>
        <PreciseState />
      </div>

      {/* 实际测试 */}
      <div style={{ background: '#fce4ec', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>🧪 实际测试：观察各种树的状态</h2>
        <PracticalTest />
      </div>

      {/* 常见误解 */}
      <div style={{ background: '#ffebee', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>❌ 常见误解</h2>
        <CommonMisconceptions />
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
      <h3>执行 useLayoutEffect 时的树状态</h3>
      
      <div style={{ background: '#c8e6c9', padding: '15px', marginBottom: '15px', borderRadius: '5px' }}>
        <h4 style={{ marginTop: 0, color: '#2e7d32' }}>💡 精确答案</h4>
        <pre style={{ background: '#f5f5f5', padding: '15px', fontSize: '14px', lineHeight: '1.8', margin: 0 }}>
{`useLayoutEffect 执行时：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. ✅ DOM 树：已完成更新
   - DOM 节点已经创建/更新/删除
   - element.textContent 可以读取到最新值
   - document.getElementById() 可以获取新节点

2. ✅ CSSOM（CSS 对象模型）：通常已存在
   - CSS 文件已加载并解析（页面初始化时）
   - 内联样式、<style> 标签已解析
   - 但新的样式计算还未进行！

3. ❌ 渲染树（Render Tree）：还未构建
   - Recalculate Style 还未执行
   - Layout 还未执行
   - 渲染树还不存在

4. ❌ 布局（Layout）：还未计算
   - 元素的位置、大小还未计算
   - 但如果读取布局属性，会同步触发计算

5. ❌ Paint：还未绘制
   - 像素还未绘制到图层

关键理解：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DOM 树 = React 修改的（已完成）
CSSOM = 浏览器维护的（通常已存在）
渲染树 = 浏览器构建的（还未开始）

渲染树的构建发生在 useLayoutEffect 之后！`}
        </pre>
      </div>
    </div>
  );
}

// 浏览器渲染流程详解
function BrowserRenderingPipeline() {
  return (
    <div style={{ background: '#fff', padding: '15px', borderRadius: '5px' }}>
      <h3>浏览器渲染管线（Rendering Pipeline）</h3>
      
      <pre style={{ background: '#f5f5f5', padding: '15px', overflow: 'auto', fontSize: '13px', lineHeight: '1.8' }}>
{`经典的浏览器渲染流程（关键帧渲染）：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

阶段 1：解析（Parsing）- 页面初始加载时
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

HTML 解析 → DOM 树
  <div>
    <p>Hello</p>
  </div>
  
CSS 解析 → CSSOM（CSS 对象模型）
  div { padding: 20px; }
  p { color: red; }

阶段 2：渲染（Rendering）- 每帧都会执行
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. JavaScript 执行
   - 修改 DOM（document.appendChild 等）
   - 修改 CSSOM（element.style.color = 'red' 等）
   - 🔥 React 的 Commit 阶段在这里
   
   ↓

2. Recalculate Style（样式重计算）
   - 🔥 关键步骤：开始构建渲染树
   - 将 DOM 树 + CSSOM 结合
   - 计算每个元素的最终样式（Computed Style）
   - 处理 CSS 继承、层叠、优先级
   
   DOM 树        CSSOM
     +     →   Computed Styles
   (HTML)      (CSS)
   
   输出：每个元素的最终样式
   
   ↓

3. Layout（布局/回流 Reflow）
   - 🔥 构建渲染树（Render Tree）
   - 计算每个元素的几何信息：
     * position（位置）
     * size（大小）
     * margin、padding、border
   - 确定元素在页面上的位置
   
   渲染树只包含可见元素：
   - display: none 的元素不在渲染树中
   - <head> 不在渲染树中
   - visibility: hidden 在渲染树中（占位但不可见）
   
   输出：渲染树（Render Tree）+ 布局信息
   
   ↓

4. Paint（绘制）
   - 将元素绘制成像素
   - 绘制文字、颜色、图片、边框、阴影等
   - 创建绘制记录（Paint Records）
   - 可能创建多个图层（Layers）
   
   输出：图层（Layers）
   
   ↓

5. Composite（合成）
   - 将多个图层合成到一起
   - GPU 加速合成
   - 输出到屏幕

关键时间点：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

requestAnimationFrame 的位置：
  Layout 之后，Paint 之前
  此时渲染树已构建，布局已计算

useLayoutEffect 的位置：
  JavaScript 执行阶段
  Recalculate Style 之前
  渲染树还未构建

所以：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

useLayoutEffect 执行时：
  ✅ DOM 树存在（刚被 React 更新）
  ✅ CSSOM 存在（页面加载时就有）
  ❌ 渲染树不存在（还未构建）
  ❌ 布局信息不存在（还未计算）

但是！如果在 useLayoutEffect 中读取布局：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

useLayoutEffect(() => {
  const width = element.offsetWidth; // 🔥 触发强制同步布局
  // 浏览器会立即：
  // 1. Recalculate Style
  // 2. Layout
  // 然后返回 width 值
});

这就是所谓的"强制同步布局"（Forced Synchronous Layout）
也叫"布局抖动"（Layout Thrashing）`}
      </pre>
    </div>
  );
}

// DOM树、CSSOM、渲染树的关系
function TreesRelationship() {
  return (
    <div style={{ background: '#fff', padding: '15px', borderRadius: '5px' }}>
      <h3>三种树的区别与关系</h3>
      
      <pre style={{ background: '#f5f5f5', padding: '15px', overflow: 'auto', fontSize: '13px', lineHeight: '1.8' }}>
{`1. DOM 树（Document Object Model Tree）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

定义：HTML 文档的树形表示
创建时机：HTML 解析时 / JavaScript 修改时
维护者：浏览器（由 JavaScript 修改）

示例 HTML：
<div id="container">
  <p class="text">Hello</p>
  <span style="display: none;">Hidden</span>
</div>

DOM 树：
Document
  └─ div#container
      ├─ p.text
      │   └─ Text: "Hello"
      └─ span
          └─ Text: "Hidden"

特点：
- 包含所有 HTML 元素（包括 <head>、<script> 等）
- 包括 display: none 的元素
- React 直接操作的就是 DOM 树

在 useLayoutEffect 中：
✅ DOM 树已更新（React Mutation 阶段完成）
✅ 可以通过 document.getElementById() 访问
✅ 可以读取 element.textContent、element.children 等


2. CSSOM（CSS Object Model）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

定义：CSS 样式的对象模型
创建时机：CSS 解析时（页面初始加载）
维护者：浏览器

示例 CSS：
div { padding: 20px; }
.text { color: red; font-size: 16px; }

CSSOM：
StyleSheet
  └─ Rules
      ├─ div { padding: 20px }
      └─ .text { color: red; font-size: 16px }

特点：
- 存储 CSS 规则
- 包括外部样式表、<style>、内联样式
- 不是树形结构，是规则集合

在 useLayoutEffect 中：
✅ CSSOM 已存在（页面加载时创建）
✅ 可以通过 element.style 修改内联样式
⚠️ 但样式还未计算（Computed Style）


3. 渲染树（Render Tree）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

定义：用于渲染的树形结构
创建时机：Recalculate Style + Layout 阶段
维护者：浏览器渲染引擎

构建过程：
DOM 树 + CSSOM → Computed Styles → 渲染树 + 布局

渲染树（使用上面的例子）：
RenderObject (div#container)
  position: (10, 10)
  size: 200x100
  styles: { padding: 20px, ... }
  └─ RenderObject (p.text)
      position: (30, 30)  // 相对于父元素
      size: 50x20
      styles: { color: red, font-size: 16px, ... }
      └─ RenderText: "Hello"

注意：span (display: none) 不在渲染树中！

特点：
- 只包含可见元素（display: none 的不包括）
- 不包含 <head>、<script>、<meta> 等
- 包含布局信息（位置、大小）
- 包含计算后的样式（Computed Styles）

在 useLayoutEffect 中：
❌ 渲染树还未构建
❌ 布局信息还未计算
⚠️ 但如果读取布局属性（offsetWidth 等），会强制构建


三种树的关系图：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

页面加载：
  HTML 解析 → DOM 树 ✅
  CSS 解析 → CSSOM ✅
  
每次渲染（每帧）：
  
  [JavaScript 执行]
    React Commit:
      DOM 变更 → DOM 树更新 ✅
      useLayoutEffect 执行 🔥（此时在这里）
  
  [浏览器渲染]
    Recalculate Style:
      DOM 树 + CSSOM → Computed Styles
      
    Layout:
      Computed Styles → 渲染树 + 布局信息 ✅
      
    Paint:
      渲染树 → 像素图层
      
    Composite:
      图层合成 → 屏幕

关键理解：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DOM 树和 CSSOM 是"输入"：
  - 在 useLayoutEffect 时已存在
  - 分别由 JavaScript 和 CSS 定义

渲染树是"输出"：
  - 在 useLayoutEffect 时还未构建
  - 由浏览器渲染引擎生成
  - 需要 DOM 树 + CSSOM 作为输入

所以：useLayoutEffect 时只有"原材料"（DOM + CSSOM），
      还没有"成品"（渲染树）！`}
      </pre>
    </div>
  );
}

// 完整时间线
function CompleteTimeline() {
  return (
    <div style={{ background: '#fff', padding: '15px', borderRadius: '5px' }}>
      <h3>React 与浏览器渲染的完整时间线</h3>
      
      <pre style={{ background: '#f5f5f5', padding: '15px', overflow: 'auto', fontSize: '13px', lineHeight: '1.8' }}>
{`完整的渲染流程（从 setState 到屏幕显示）：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

阶段 0：触发更新
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
setState() / dispatch()
  ↓
调度更新（Schedule）

阶段 1：React Render（可中断）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- 执行函数组件
- 执行 Hooks（useState、useEffect 等）
- 构建新的 Fiber 树
- 执行 Diff 算法
- 标记副作用

状态：
  ✅ 虚拟 DOM（Fiber 树）更新中
  ❌ 真实 DOM 还未变化
  ❌ CSSOM 还未变化
  ❌ 渲染树不存在

阶段 2：React Commit - Before Mutation
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- getSnapshotBeforeUpdate
- 准备 DOM 操作

状态：
  ✅ Fiber 树已完成
  ❌ DOM 树还未变化
  ❌ 渲染树不存在

阶段 3：React Commit - Mutation
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- 🔥 DOM 操作（insertBefore, appendChild, removeChild）
- 🔥 element.textContent = 'new value'
- useLayoutEffect cleanup

状态：
  ✅ DOM 树已更新 ← 关键！
  ✅ CSSOM 存在（未变）
  ❌ 渲染树还未构建
  ❌ 布局还未计算
  ❌ 用户还看到旧画面

示例：
  // DOM 操作
  const element = document.createElement('div');
  element.textContent = 'Hello';
  parent.appendChild(element);
  
  // 此时 DOM 树：
  // parent
  //   └─ div
  //       └─ Text: "Hello"
  
  // 但渲染树还不存在！

阶段 4：React Commit - Layout
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- 🔥🔥 useLayoutEffect 执行 ← 你在这里！
- componentDidMount / componentDidUpdate
- ref 回调

状态：
  ✅ DOM 树已更新
  ✅ CSSOM 存在
  ❌ 渲染树还未构建
  ❌ 布局还未计算（除非你主动读取）
  ❌ 用户还看到旧画面

在 useLayoutEffect 中：
  useLayoutEffect(() => {
    // 可以访问 DOM 树
    const div = document.querySelector('div');
    console.log(div.textContent); // ✅ "Hello"
    
    // 可以修改样式
    div.style.color = 'red'; // ✅ 修改成功，但还未生效
    
    // 读取布局会触发强制同步布局
    const width = div.offsetWidth; // 🔥 触发 Style + Layout
    console.log(width); // ✅ 可以获取
    
    // 但如果不读取布局，浏览器还没开始计算
  });

阶段 5：requestPaint()
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- React 调用 Scheduler.requestPaint()
- 告诉 Scheduler 可以让出执行权

状态：
  ✅ DOM 树已更新
  ✅ CSSOM 可能有新样式
  ❌ 渲染树还未构建
  ❌ 布局还未计算
  [React 让出 JavaScript 执行权]

阶段 6：浏览器 - Recalculate Style
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- 🔥 开始构建渲染树的第一步
- 遍历 DOM 树
- 为每个元素计算最终样式（Computed Style）
- 处理 CSS 继承、层叠、优先级

过程：
  DOM 树的每个节点 + CSSOM 规则
    ↓
  匹配选择器
    ↓
  计算优先级
    ↓
  Computed Style（计算后样式）

示例：
  <div class="box" style="color: red;">Hello</div>
  
  CSS:
  .box { color: blue; font-size: 16px; }
  
  计算后：
  {
    color: 'red',        // 内联样式优先级最高
    fontSize: '16px',    // 来自 .box
    display: 'block',    // 默认值
    margin: '0',         // 默认值
    padding: '0',        // 默认值
    // ... 数百个属性
  }

状态：
  ✅ Computed Styles 完成
  ⚠️ 开始构建渲染树
  ❌ 布局还未计算

阶段 7：浏览器 - Layout（布局/回流）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- 🔥 构建渲染树（Render Tree）
- 计算每个元素的几何信息
- 确定元素在页面上的位置和大小

过程：
  遍历 DOM 树（有 Computed Styles）
    ↓
  过滤不可见元素（display: none）
    ↓
  创建渲染对象（RenderObject）
    ↓
  计算布局（position, size）
    ↓
  渲染树 + 布局信息

渲染树示例：
  RenderView (viewport)
    └─ RenderBlock (body)
        └─ RenderBlock (div.box)
            position: (10, 10)
            size: (200, 50)
            └─ RenderText ("Hello")
                position: (0, 0)  // 相对父元素
                size: (50, 20)

状态：
  ✅ 渲染树已构建 ← 关键！
  ✅ 布局信息已计算
  ❌ 还未绘制
  ❌ 用户还看到旧画面

阶段 8：requestAnimationFrame
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- 执行 rAF 回调
- 此时渲染树已完成，布局已计算
- 最佳动画时机

状态：
  ✅ 渲染树已构建
  ✅ 布局已计算
  ❌ 还未绘制

阶段 9：浏览器 - Paint（绘制）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- 将渲染树绘制成像素
- 创建图层（Layers）
- 绘制文字、颜色、图片、边框、阴影等

状态：
  ✅ 图层已绘制
  ❌ 还未合成到屏幕

阶段 10：浏览器 - Composite（合成）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- 将多个图层合成
- GPU 加速
- 🔥 显示到屏幕

状态：
  ✅ 用户看到新画面！

阶段 11：useEffect（异步）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- 在下一个宏任务执行
- 在浏览器绘制之后
- 不阻塞渲染

状态：
  ✅ 用户已经看到新画面

总结时间线：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

                        DOM树  CSSOM  渲染树  布局  绘制
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Render 阶段             ❌    ✅     ❌     ❌   ❌
Mutation 阶段           ✅    ✅     ❌     ❌   ❌
useLayoutEffect 🔥      ✅    ✅     ❌     ❌   ❌
requestPaint            ✅    ✅     ❌     ❌   ❌
Recalculate Style       ✅    ✅     ⚠️     ❌   ❌
Layout                  ✅    ✅     ✅     ✅   ❌
requestAnimationFrame   ✅    ✅     ✅     ✅   ❌
Paint                   ✅    ✅     ✅     ✅   ✅
Composite               ✅    ✅     ✅     ✅   ✅
useEffect               ✅    ✅     ✅     ✅   ✅

所以：useLayoutEffect 时，只有 DOM 树和 CSSOM，
      渲染树还未构建！`}
      </pre>
    </div>
  );
}

// 精确状态
function PreciseState() {
  return (
    <div style={{ background: '#fff', padding: '15px', borderRadius: '5px' }}>
      <h3>useLayoutEffect 执行时可以做什么</h3>
      
      <pre style={{ background: '#f5f5f5', padding: '15px', overflow: 'auto', fontSize: '13px', lineHeight: '1.8' }}>
{`在 useLayoutEffect 中的能力：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. ✅ 访问 DOM 树
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

useLayoutEffect(() => {
  // 获取元素
  const element = document.getElementById('box');
  console.log(element); // ✅ 获取到最新的 DOM 节点
  
  // 读取内容
  console.log(element.textContent); // ✅ 最新内容
  console.log(element.children); // ✅ 最新子节点
  
  // 读取属性
  console.log(element.className); // ✅ 最新类名
  console.log(element.id); // ✅ 最新 id
});


2. ✅ 读取/修改样式（但还未生效到渲染树）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

useLayoutEffect(() => {
  const element = document.getElementById('box');
  
  // 读取内联样式
  console.log(element.style.color); // ✅ 读取到
  
  // 修改内联样式
  element.style.color = 'red'; // ✅ 修改成功
  element.style.transform = 'translateX(100px)'; // ✅ 修改成功
  
  // 但这些修改还未应用到渲染树！
  // 会在后续的 Recalculate Style + Layout 中生效
  // 然后在 Paint 中一次性绘制
  
  // 这就是为什么不会有"闪烁"：
  // DOM 变更 + useLayoutEffect 修改 → 一次性绘制
});


3. ⚠️ 读取布局信息（会触发强制同步布局）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

useLayoutEffect(() => {
  const element = document.getElementById('box');
  
  // 🔥 读取布局属性会触发强制同步布局！
  const width = element.offsetWidth;    // 触发 Layout
  const height = element.offsetHeight;  // 触发 Layout
  const rect = element.getBoundingClientRect(); // 触发 Layout
  
  // 浏览器会立即：
  // 1. Recalculate Style（计算样式）
  // 2. Layout（构建渲染树 + 计算布局）
  // 3. 返回结果
  
  console.log(width); // ✅ 能获取到正确的值
  
  // 但这样会有性能问题：
  // - 打断了正常的渲染流程
  // - 每次读取都会触发一次完整的 Layout
});

常见的触发布局的属性：
  element.offsetWidth / offsetHeight / offsetTop / offsetLeft
  element.clientWidth / clientHeight / clientTop / clientLeft
  element.scrollWidth / scrollHeight / scrollTop / scrollLeft
  element.getBoundingClientRect()
  window.getComputedStyle(element)


4. ✅ 修改 DOM 结构
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

useLayoutEffect(() => {
  const parent = document.getElementById('parent');
  const child = document.createElement('div');
  child.textContent = 'New Child';
  
  // ✅ 可以修改 DOM
  parent.appendChild(child);
  
  // 这个修改也会在接下来的渲染中一次性生效
});


5. ❌ 不能直接访问渲染树
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

useLayoutEffect(() => {
  // 渲染树是浏览器内部数据结构，JavaScript 无法直接访问
  // 但可以通过 DOM API 间接触发渲染树的构建
  
  const element = document.getElementById('box');
  
  // ❌ 不能直接访问 RenderObject
  // element.renderObject // 不存在
  
  // ✅ 但可以通过读取布局信息触发渲染树构建
  const width = element.offsetWidth; // 触发 Layout
});


典型使用场景：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

场景 1：测量元素并调整位置（Tooltip）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

useLayoutEffect(() => {
  const tooltip = document.getElementById('tooltip');
  const target = document.getElementById('target');
  
  // 1. 读取目标元素位置（触发 Layout）
  const targetRect = target.getBoundingClientRect();
  
  // 2. 读取 tooltip 大小（触发 Layout）
  const tooltipRect = tooltip.getBoundingClientRect();
  
  // 3. 计算位置
  const left = targetRect.left + (targetRect.width - tooltipRect.width) / 2;
  const top = targetRect.top - tooltipRect.height - 10;
  
  // 4. 设置位置
  tooltip.style.left = left + 'px';
  tooltip.style.top = top + 'px';
  
  // 这样用户看到的就是正确位置的 tooltip
  // 不会有"先出现在错误位置再跳到正确位置"的闪烁
});


场景 2：避免闪烁的动画初始化
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function FadeIn() {
  const ref = useRef(null);
  
  useLayoutEffect(() => {
    // 在绘制前设置初始状态
    ref.current.style.opacity = '0';
    ref.current.style.transform = 'translateY(20px)';
    
    // 然后触发动画
    requestAnimationFrame(() => {
      ref.current.style.transition = 'all 0.3s';
      ref.current.style.opacity = '1';
      ref.current.style.transform = 'translateY(0)';
    });
  }, []);
  
  return <div ref={ref}>Content</div>;
  
  // 如果用 useEffect，用户会先看到完全显示的内容，
  // 然后才开始淡入动画，会有闪烁
}


场景 3：测量并限制内容
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

useLayoutEffect(() => {
  const container = document.getElementById('container');
  const content = document.getElementById('content');
  
  // 测量容器和内容
  const containerWidth = container.offsetWidth;
  const contentWidth = content.offsetWidth;
  
  // 如果内容太宽，缩放它
  if (contentWidth > containerWidth) {
    const scale = containerWidth / contentWidth;
    content.style.transform = \`scale(\${scale})\`;
  }
});


总结：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

useLayoutEffect 执行时：
  ✅ DOM 树已更新 → 可以访问、修改
  ✅ CSSOM 已存在 → 可以修改样式
  ❌ 渲染树还未构建 → 无法直接访问
  ⚠️ 可以触发强制布局 → 但有性能代价
  ✅ 可以避免闪烁 → 一次性绘制所有变更`}
      </pre>
    </div>
  );
}

// 实际测试
function PracticalTest() {
  const [count, setCount] = useState(0);
  const [logs, setLogs] = useState([]);
  const boxRef = useRef(null);
  
  const addLog = (message) => {
    setLogs(prev => [...prev, { time: Date.now(), message }]);
  };
  
  useLayoutEffect(() => {
    if (boxRef.current) {
      addLog('🟡 useLayoutEffect 开始');
      
      // 1. 访问 DOM 树
      addLog(`   ✅ DOM.textContent = "${boxRef.current.textContent}"`);
      addLog(`   ✅ DOM.className = "${boxRef.current.className}"`);
      
      // 2. 读取样式（但渲染树还未构建）
      addLog(`   ✅ style.background = "${boxRef.current.style.background || '(默认)'}"`);
      
      // 3. 读取布局（触发强制同步布局）
      const startLayout = performance.now();
      const width = boxRef.current.offsetWidth;
      const layoutTime = performance.now() - startLayout;
      addLog(`   ⚠️ offsetWidth = ${width}px (触发强制布局，耗时 ${layoutTime.toFixed(2)}ms)`);
      
      // 4. 修改样式
      boxRef.current.style.background = '#4caf50';
      addLog('   ✅ 修改 style.background = "#4caf50"');
      addLog('   💡 注意：样式已修改，但渲染树还未构建，还未绘制');
      
      addLog('🟡 useLayoutEffect 结束');
    }
  }, [count]);
  
  useEffect(() => {
    addLog('🔵 useEffect 执行（此时渲染树已构建，已绘制）');
  }, [count]);
  
  const handleClick = () => {
    setLogs([]);
    addLog('🔴 点击按钮，触发 setState');
    setCount(c => c + 1);
  };
  
  return (
    <div style={{ background: '#fff', padding: '15px', borderRadius: '5px' }}>
      <div style={{ marginBottom: '20px' }}>
        <div 
          ref={boxRef}
          className="test-box"
          style={{
            padding: '20px',
            background: '#2196f3',
            color: '#fff',
            borderRadius: '5px',
            fontSize: '24px',
            fontWeight: 'bold',
            textAlign: 'center',
            marginBottom: '15px',
            transition: 'background 0.3s'
          }}
        >
          Count: {count}
        </div>
        
        <button
          onClick={handleClick}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            background: '#f44336',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          触发更新（观察树的状态）
        </button>
      </div>
      
      <div style={{ 
        padding: '15px',
        background: '#f5f5f5',
        borderRadius: '5px',
        maxHeight: '400px',
        overflowY: 'auto'
      }}>
        <h4>执行日志：</h4>
        {logs.length === 0 ? (
          <div style={{ color: '#999', fontSize: '14px' }}>点击按钮查看各种树的状态</div>
        ) : (
          logs.map((log, index) => (
            <div key={index} style={{ 
              fontSize: '13px', 
              marginBottom: '5px',
              fontFamily: 'monospace',
              lineHeight: '1.6'
            }}>
              {log.message}
            </div>
          ))
        )}
      </div>
      
      <div style={{ marginTop: '15px', padding: '10px', background: '#fff3e0', borderRadius: '5px', fontSize: '13px' }}>
        <strong>观察要点：</strong>
        <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
          <li>useLayoutEffect 能访问更新后的 DOM 树</li>
          <li>读取 offsetWidth 会触发强制同步布局（构建渲染树）</li>
          <li>修改样式时，渲染树还未构建</li>
          <li>所有修改会在接下来的渲染中一次性生效</li>
        </ul>
      </div>
    </div>
  );
}

// 常见误解
function CommonMisconceptions() {
  return (
    <div style={{ background: '#fff', padding: '15px', borderRadius: '5px' }}>
      <h3>常见的误解和正确理解</h3>
      
      <div style={{ marginBottom: '15px' }}>
        <h4 style={{ color: '#d32f2f' }}>❌ 误解 1：useLayoutEffect 时渲染树已经构建好了</h4>
        <div style={{ background: '#ffebee', padding: '10px', borderRadius: '5px', marginBottom: '10px', fontSize: '14px' }}>
          错误：认为 useLayoutEffect 执行时，渲染树已经存在
        </div>
        <div style={{ background: '#e8f5e9', padding: '10px', borderRadius: '5px', fontSize: '14px' }}>
          ✅ 正确：渲染树在 useLayoutEffect 之后才构建（Recalculate Style + Layout 阶段）
        </div>
      </div>
      
      <div style={{ marginBottom: '15px' }}>
        <h4 style={{ color: '#d32f2f' }}>❌ 误解 2：useLayoutEffect 时布局已经计算好了</h4>
        <div style={{ background: '#ffebee', padding: '10px', borderRadius: '5px', marginBottom: '10px', fontSize: '14px' }}>
          错误：认为可以直接读取布局信息而不触发重排
        </div>
        <div style={{ background: '#e8f5e9', padding: '10px', borderRadius: '5px', fontSize: '14px' }}>
          ✅ 正确：布局还未计算，读取布局属性会触发强制同步布局
        </div>
      </div>
      
      <div style={{ marginBottom: '15px' }}>
        <h4 style={{ color: '#d32f2f' }}>❌ 误解 3：CSSOM 在 useLayoutEffect 中才创建</h4>
        <div style={{ background: '#ffebee', padding: '10px', borderRadius: '5px', marginBottom: '10px', fontSize: '14px' }}>
          错误：认为 CSS 样式在 useLayoutEffect 时才开始解析
        </div>
        <div style={{ background: '#e8f5e9', padding: '10px', borderRadius: '5px', fontSize: '14px' }}>
          ✅ 正确：CSSOM 在页面加载时就已经存在，useLayoutEffect 只是还未应用到渲染树
        </div>
      </div>
      
      <div style={{ marginBottom: '15px' }}>
        <h4 style={{ color: '#d32f2f' }}>❌ 误解 4：useLayoutEffect 和 requestAnimationFrame 是同一时机</h4>
        <div style={{ background: '#ffebee', padding: '10px', borderRadius: '5px', marginBottom: '10px', fontSize: '14px' }}>
          错误：认为 useLayoutEffect 在 rAF 时机执行
        </div>
        <div style={{ background: '#e8f5e9', padding: '10px', borderRadius: '5px', fontSize: '14px' }}>
          ✅ 正确：useLayoutEffect 更早，在 JavaScript 执行阶段；rAF 在浏览器渲染阶段（Layout 之后）
        </div>
      </div>
    </div>
  );
}

// 总结
function Summary() {
  return (
    <div style={{ background: '#fff', padding: '15px', borderRadius: '5px' }}>
      <h3>核心总结</h3>
      
      <pre style={{ background: '#f5f5f5', padding: '15px', fontSize: '13px', lineHeight: '1.8' }}>
{`useLayoutEffect 执行时的精确状态：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. ✅ DOM 树已完成更新
   - React Mutation 阶段已完成
   - 可以访问、修改 DOM 节点

2. ✅ CSSOM 已存在
   - CSS 文件在页面加载时已解析
   - 可以修改内联样式
   - 但样式还未计算（Computed Style）

3. ❌ 渲染树还未构建
   - Recalculate Style 还未执行
   - Layout 还未执行
   - RenderObject 还不存在

4. ⚠️ 可以触发强制同步布局
   - 读取 offsetWidth 等属性会触发
   - 浏览器会立即构建渲染树并计算布局
   - 但有性能代价

5. ✅ 可以避免视觉闪烁
   - 所有修改会在接下来的 Paint 中一次性绘制
   - 用户不会看到中间状态

关键理解：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DOM 树 + CSSOM = "原材料"（useLayoutEffect 时已有）
                    ↓
           Recalculate Style
                    ↓
              Computed Styles
                    ↓
                Layout
                    ↓
渲染树 + 布局信息 = "成品"（useLayoutEffect 后才有）

所以：useLayoutEffect 在"原材料"准备好，但"成品"还未制作的时候执行！`}
      </pre>
    </div>
  );
}
