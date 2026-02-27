import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';

/**
 * 虚拟列表面试完全指南
 * 
 * 涵盖：
 * 1. 虚拟列表原理
 * 2. 核心实现
 * 3. 性能优化
 * 4. 面试要点
 * 5. 实际代码示例
 */

export default function VirtualListInterview() {
  const [expandedSection, setExpandedSection] = useState(null);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '1400px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', color: '#2196f3' }}>📜 虚拟列表面试完全指南</h1>
      
      <Section
        title="🎯 什么是虚拟列表"
        id="concept"
        expanded={expandedSection === 'concept'}
        onToggle={() => setExpandedSection(expandedSection === 'concept' ? null : 'concept')}
      >
        <Concept />
      </Section>

      <Section
        title="⚡ 核心原理"
        id="principle"
        expanded={expandedSection === 'principle'}
        onToggle={() => setExpandedSection(expandedSection === 'principle' ? null : 'principle')}
      >
        <Principle />
      </Section>

      <Section
        title="🔧 实现方案"
        id="implementation"
        expanded={expandedSection === 'implementation'}
        onToggle={() => setExpandedSection(expandedSection === 'implementation' ? null : 'implementation')}
      >
        <Implementation />
      </Section>

      <Section
        title="💻 代码实现"
        id="code"
        expanded={expandedSection === 'code'}
        onToggle={() => setExpandedSection(expandedSection === 'code' ? null : 'code')}
      >
        <CodeImplementation />
      </Section>

      <Section
        title="🚀 性能优化"
        id="optimization"
        expanded={expandedSection === 'optimization'}
        onToggle={() => setExpandedSection(expandedSection === 'optimization' ? null : 'optimization')}
      >
        <Optimization />
      </Section>

      <Section
        title="📝 面试要点"
        id="interview"
        expanded={expandedSection === 'interview'}
        onToggle={() => setExpandedSection(expandedSection === 'interview' ? null : 'interview')}
      >
        <InterviewPoints />
      </Section>

      <Section
        title="🎨 实际示例"
        id="demo"
        expanded={expandedSection === 'demo'}
        onToggle={() => setExpandedSection(expandedSection === 'demo' ? null : 'demo')}
      >
        <VirtualListDemo />
      </Section>

      <Section
        title="🔍 常见问题"
        id="faq"
        expanded={expandedSection === 'faq'}
        onToggle={() => setExpandedSection(expandedSection === 'faq' ? null : 'faq')}
      >
        <FAQ />
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

function Concept() {
  return (
    <div>
      <pre style={{ background: '#f5f5f5', padding: '15px', borderRadius: '5px', overflow: 'auto', fontSize: '14px', lineHeight: '1.8' }}>
{`什么是虚拟列表（Virtual List）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

定义：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

虚拟列表（又称虚拟滚动 Virtual Scrolling）是一种性能优化技术，
用于高效渲染大量数据列表。

核心思想：
  只渲染可见区域的列表项，而不是渲染全部数据。


问题场景：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

假设要渲染 10,000 条数据：

❌ 普通列表渲染：
  - 渲染 10,000 个 DOM 节点
  - 首次渲染慢（可能需要几秒）
  - 占用大量内存
  - 滚动卡顿
  - 浏览器崩溃风险

✅ 虚拟列表渲染：
  - 只渲染可见的 ~20 个 DOM 节点
  - 快速渲染（毫秒级）
  - 内存占用少
  - 滚动流畅
  - 可以处理数十万条数据


对比示例：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

数据量：10,000 条
每项高度：50px
容器高度：500px（可见 10 项）

普通列表：
┌─────────────────────────────────────┐
│  Item 0                              │  ← 渲染
│  Item 1                              │  ← 渲染
│  ...                                 │  ← 渲染
│  Item 9999                           │  ← 渲染（全部渲染）
└─────────────────────────────────────┘
DOM 节点：10,000 个
内存占用：~50MB


虚拟列表：
┌─────────────────────────────────────┐
│  [空白占位 - 不渲染]                  │  ← 不渲染（用 padding 撑高）
│  ┌───────────────────────────────┐  │
│  │ Item 100                       │  │  ← 渲染（可见区域）
│  │ Item 101                       │  │  ← 渲染
│  │ ...                            │  │  ← 渲染
│  │ Item 109                       │  │  ← 渲染
│  └───────────────────────────────┘  │
│  [空白占位 - 不渲染]                  │  ← 不渲染（用 padding 撑高）
└─────────────────────────────────────┘
DOM 节点：~10-20 个（可见区域 + 缓冲区）
内存占用：~100KB


核心概念：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. 可见区域（Visible Area）
   - 用户能看到的区域
   - 通常对应容器的高度

2. 缓冲区（Buffer Zone）
   - 可见区域上下额外渲染的区域
   - 避免快速滚动时出现白屏
   - 通常是可见区域的 1-2 倍

3. 渲染窗口（Render Window）
   - 实际渲染的区域 = 可见区域 + 缓冲区

4. 偏移量（Offset）
   - 列表滚动的距离
   - 用于计算可见区域的起始位置

5. 占位元素（Placeholder）
   - 撑开容器高度，使滚动条正常工作
   - 通常使用 padding 实现


适用场景：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ 适合使用虚拟列表：
  - 长列表（1000+ 条数据）
  - 聊天记录
  - 数据表格
  - 商品列表
  - 日志查看
  - 文件列表

❌ 不适合使用虚拟列表：
  - 数据量小（< 100 条）
  - 每项高度差异大且不可预测
  - 需要搜索和高亮（SEO）
  - 需要打印
  - 复杂的嵌套结构


性能提升：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

指标对比（10,000 条数据）：

首次渲染时间：
  - 普通列表：~3000ms
  - 虚拟列表：~50ms
  - 提升：60 倍

内存占用：
  - 普通列表：~50MB
  - 虚拟列表：~1MB
  - 提升：50 倍

滚动性能（FPS）：
  - 普通列表：10-20 FPS（卡顿）
  - 虚拟列表：60 FPS（流畅）


常见库：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. react-window
   - 轻量级（~3KB）
   - 性能优秀
   - 推荐使用

2. react-virtualized
   - 功能强大
   - 体积较大（~20KB）
   - 老牌库

3. react-virtual
   - TanStack 团队开发
   - TypeScript 支持好
   - 新兴库

4. rc-virtual-list
   - Ant Design 使用
   - 中文文档`}
      </pre>
    </div>
  );
}

function Principle() {
  return (
    <div>
      <pre style={{ background: '#f5f5f5', padding: '15px', borderRadius: '5px', overflow: 'auto', fontSize: '13px', lineHeight: '1.8' }}>
{`虚拟列表核心原理
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. 核心计算公式
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

假设：
  - 总数据量：totalCount = 10000
  - 每项高度：itemHeight = 50px
  - 容器高度：containerHeight = 500px
  - 滚动距离：scrollTop = 5000px
  - 缓冲项数：bufferSize = 5

计算步骤：

Step 1: 计算可见区域可以显示多少项
  visibleCount = Math.ceil(containerHeight / itemHeight)
               = Math.ceil(500 / 50)
               = 10 项

Step 2: 计算滚动到的起始索引
  startIndex = Math.floor(scrollTop / itemHeight)
             = Math.floor(5000 / 50)
             = 100

Step 3: 计算实际渲染的起始索引（加上缓冲区）
  renderStartIndex = Math.max(0, startIndex - bufferSize)
                   = Math.max(0, 100 - 5)
                   = 95

Step 4: 计算实际渲染的结束索引
  renderEndIndex = Math.min(totalCount, startIndex + visibleCount + bufferSize)
                 = Math.min(10000, 100 + 10 + 5)
                 = 115

Step 5: 计算上方占位高度（撑开滚动条）
  topPlaceholderHeight = renderStartIndex × itemHeight
                       = 95 × 50
                       = 4750px

Step 6: 计算下方占位高度
  bottomPlaceholderHeight = (totalCount - renderEndIndex) × itemHeight
                          = (10000 - 115) × 50
                          = 494250px

Step 7: 计算总高度（滚动条）
  totalHeight = totalCount × itemHeight
              = 10000 × 50
              = 500000px


2. 渲染流程
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

初始化：
┌─────────────────────────────────────────────┐
│  1. 计算容器高度和可见项数量                   │
│  2. 计算初始渲染范围（0 到 visibleCount）      │
│  3. 渲染初始项                                │
│  4. 创建滚动容器（高度 = totalCount × itemHeight）│
└─────────────────────────────────────────────┘

滚动时：
┌─────────────────────────────────────────────┐
│  1. 监听 scroll 事件                          │
│  2. 获取 scrollTop                           │
│  3. 计算新的渲染范围                          │
│  4. 更新状态触发重新渲染                      │
│  5. React 对比 Virtual DOM                   │
│  6. 只更新变化的项                            │
└─────────────────────────────────────────────┘


3. DOM 结构
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

<div class="virtual-list-container" style="height: 500px; overflow-y: auto;">
  <!-- 滚动容器，总高度 = totalCount × itemHeight -->
  <div class="virtual-list-scroll" style="height: 500000px; position: relative;">
    
    <!-- 上方占位（不渲染 DOM，用 padding 撑高） -->
    <div style="height: 4750px;"></div>
    
    <!-- 可见区域渲染的项 -->
    <div class="virtual-list-item" style="height: 50px;">Item 95</div>
    <div class="virtual-list-item" style="height: 50px;">Item 96</div>
    ...
    <div class="virtual-list-item" style="height: 50px;">Item 115</div>
    
    <!-- 下方占位 -->
    <div style="height: 494250px;"></div>
    
  </div>
</div>


4. 滚动性能优化
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

问题：scroll 事件触发频繁（每秒 60+ 次）

解决方案：

方案 1：节流（Throttle）
  - 限制计算频率
  - 例如：每 16ms（60fps）计算一次
  
  function throttle(func, wait) {
    let lastTime = 0;
    return function(...args) {
      const now = Date.now();
      if (now - lastTime >= wait) {
        lastTime = now;
        func.apply(this, args);
      }
    };
  }
  
  const handleScroll = throttle((e) => {
    const scrollTop = e.target.scrollTop;
    updateVisibleRange(scrollTop);
  }, 16);

方案 2：requestAnimationFrame
  - 浏览器优化的动画帧
  - 自动匹配屏幕刷新率
  
  let ticking = false;
  
  function handleScroll(e) {
    const scrollTop = e.target.scrollTop;
    
    if (!ticking) {
      requestAnimationFrame(() => {
        updateVisibleRange(scrollTop);
        ticking = false;
      });
      ticking = true;
    }
  }

方案 3：Passive Event Listener
  - 告诉浏览器不会 preventDefault
  - 浏览器可以优化滚动性能
  
  element.addEventListener('scroll', handleScroll, { passive: true });


5. 缓冲区策略
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

为什么需要缓冲区？
  - 快速滚动时，避免白屏
  - 给渲染留出时间

缓冲区大小：
  - 太小：容易出现白屏
  - 太大：渲染的 DOM 变多，性能下降
  - 推荐：可见区域的 1-2 倍

示例：
  可见区域：10 项
  缓冲区：上方 5 项 + 下方 5 项
  实际渲染：20 项


6. 高度计算
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

情况 1：固定高度（最简单）
  - 每项高度相同
  - 直接用 itemHeight × index 计算位置
  - 性能最好

情况 2：动态高度（复杂）
  - 每项高度不同
  - 需要缓存每项的实际高度
  - 需要累加计算位置
  
  // 高度缓存
  const itemHeights = [50, 80, 60, 100, ...];
  
  // 位置缓存
  const itemOffsets = [0, 50, 130, 190, 290, ...];
  
  // 计算
  function getItemOffset(index) {
    if (itemOffsets[index] !== undefined) {
      return itemOffsets[index];
    }
    
    // 累加计算
    let offset = 0;
    for (let i = 0; i < index; i++) {
      offset += itemHeights[i] || estimatedHeight;
    }
    itemOffsets[index] = offset;
    return offset;
  }

情况 3：动态高度 + 预估（推荐）
  - 初始使用预估高度
  - 渲染后测量实际高度
  - 更新缓存
  
  const estimatedHeight = 80;
  const measuredHeights = new Map();
  
  function measureItem(index, element) {
    const height = element.getBoundingClientRect().height;
    measuredHeights.set(index, height);
  }
  
  function getItemHeight(index) {
    return measuredHeights.get(index) || estimatedHeight;
  }


7. 位置计算优化
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

二分查找（动态高度）：
  - 查找 scrollTop 对应的 index
  - O(log n) 时间复杂度
  
  function findStartIndex(scrollTop, itemOffsets) {
    let left = 0;
    let right = itemOffsets.length - 1;
    
    while (left < right) {
      const mid = Math.floor((left + right) / 2);
      if (itemOffsets[mid] < scrollTop) {
        left = mid + 1;
      } else {
        right = mid;
      }
    }
    
    return left;
  }


8. 渲染优化
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

React 优化：
  1. 使用 key（稳定的 index 或 id）
  2. 使用 React.memo 避免不必要的重新渲染
  3. 使用 useCallback 缓存事件处理函数
  4. 虚拟化子组件也需要优化

关键代码：
  const VirtualItem = React.memo(({ index, data, style }) => {
    return (
      <div style={style}>
        {data[index].content}
      </div>
    );
  });


9. 完整工作流程
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

用户滚动 → scroll 事件
  ↓
获取 scrollTop
  ↓
计算可见区域起始索引
  startIndex = Math.floor(scrollTop / itemHeight)
  ↓
计算渲染范围（加缓冲区）
  renderStart = startIndex - bufferSize
  renderEnd = startIndex + visibleCount + bufferSize
  ↓
更新状态
  setState({ renderStart, renderEnd })
  ↓
React 重新渲染
  - 对比 Virtual DOM
  - 只更新变化的项
  ↓
计算占位高度
  topHeight = renderStart × itemHeight
  bottomHeight = (totalCount - renderEnd) × itemHeight
  ↓
更新 DOM
  - 设置 padding 撑开高度
  - 渲染可见项
  ↓
完成渲染`}
      </pre>
    </div>
  );
}

function Implementation() {
  return (
    <div>
      <pre style={{ background: '#f5f5f5', padding: '15px', borderRadius: '5px', overflow: 'auto', fontSize: '13px', lineHeight: '1.8' }}>
{`虚拟列表实现方案
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

方案对比
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

┌─────────────┬──────────┬──────────┬──────────┐
│   方案       │  复杂度   │  性能    │  适用场景  │
├─────────────┼──────────┼──────────┼──────────┤
│ 固定高度     │  简单     │  最好    │  高度一致  │
│ 预估高度     │  中等     │  较好    │  高度相近  │
│ 动态高度     │  复杂     │  一般    │  高度差异大│
│ 分组虚拟化   │  很复杂   │  较好    │  分组列表  │
└─────────────┴──────────┴──────────┴──────────┘


方案 1：固定高度虚拟列表（最常用）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

特点：
  ✅ 实现简单
  ✅ 性能最好
  ✅ 计算精确
  ❌ 要求所有项高度相同

核心代码：

import { useState, useRef, useCallback } from 'react';

function FixedHeightVirtualList({ 
  data,           // 数据数组
  itemHeight,     // 每项高度
  containerHeight // 容器高度
}) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef(null);
  
  // 计算可见项数量
  const visibleCount = Math.ceil(containerHeight / itemHeight);
  
  // 计算起始索引
  const startIndex = Math.floor(scrollTop / itemHeight);
  
  // 计算结束索引（加缓冲区）
  const endIndex = Math.min(
    data.length,
    startIndex + visibleCount + 5  // 5 是缓冲区
  );
  
  // 计算实际渲染范围
  const renderStart = Math.max(0, startIndex - 5);
  const renderEnd = endIndex;
  
  // 计算占位高度
  const topHeight = renderStart * itemHeight;
  const bottomHeight = (data.length - renderEnd) * itemHeight;
  
  // 滚动处理
  const handleScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop);
  }, []);
  
  return (
    <div
      ref={containerRef}
      style={{
        height: containerHeight,
        overflow: 'auto'
      }}
      onScroll={handleScroll}
    >
      {/* 总高度容器 */}
      <div style={{ height: data.length * itemHeight, position: 'relative' }}>
        {/* 上方占位 */}
        <div style={{ height: topHeight }} />
        
        {/* 渲染可见项 */}
        {data.slice(renderStart, renderEnd).map((item, index) => (
          <div
            key={renderStart + index}
            style={{ height: itemHeight }}
          >
            {item.content}
          </div>
        ))}
        
        {/* 下方占位 */}
        <div style={{ height: bottomHeight }} />
      </div>
    </div>
  );
}


方案 2：动态高度虚拟列表（预估高度）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

特点：
  ✅ 支持不同高度
  ✅ 初始性能好
  ❌ 需要测量实际高度
  ❌ 可能有轻微抖动

核心思路：
  1. 初始使用预估高度渲染
  2. 渲染后测量实际高度
  3. 缓存实际高度
  4. 重新计算位置

import { useState, useRef, useEffect, useCallback } from 'react';

function DynamicHeightVirtualList({ 
  data,
  estimatedHeight = 80,  // 预估高度
  containerHeight
}) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef(null);
  
  // 缓存每项的实际高度
  const heightCache = useRef(new Map());
  
  // 缓存每项的位置
  const positionCache = useRef([0]);
  
  // 获取项的高度
  const getItemHeight = useCallback((index) => {
    return heightCache.current.get(index) || estimatedHeight;
  }, [estimatedHeight]);
  
  // 获取项的位置
  const getItemOffset = useCallback((index) => {
    if (positionCache.current[index] !== undefined) {
      return positionCache.current[index];
    }
    
    let offset = 0;
    for (let i = 0; i < index; i++) {
      offset += getItemHeight(i);
    }
    positionCache.current[index] = offset;
    return offset;
  }, [getItemHeight]);
  
  // 查找起始索引（二分查找）
  const findStartIndex = useCallback((scrollTop) => {
    let left = 0;
    let right = data.length - 1;
    
    while (left < right) {
      const mid = Math.floor((left + right) / 2);
      const offset = getItemOffset(mid);
      
      if (offset < scrollTop) {
        left = mid + 1;
      } else {
        right = mid;
      }
    }
    
    return left;
  }, [data.length, getItemOffset]);
  
  // 计算可见项
  const getVisibleItems = useCallback(() => {
    const startIndex = findStartIndex(scrollTop);
    const endIndex = data.length;
    
    const items = [];
    let currentOffset = getItemOffset(startIndex);
    
    for (let i = startIndex; i < endIndex; i++) {
      if (currentOffset > scrollTop + containerHeight + 100) {
        break;  // 超出可见区域（含缓冲）
      }
      
      items.push({
        index: i,
        offset: currentOffset,
        height: getItemHeight(i)
      });
      
      currentOffset += getItemHeight(i);
    }
    
    return items;
  }, [scrollTop, containerHeight, data.length, findStartIndex, getItemOffset, getItemHeight]);
  
  // 测量项的实际高度
  const measureItem = useCallback((index, element) => {
    if (!element) return;
    
    const height = element.getBoundingClientRect().height;
    const oldHeight = heightCache.current.get(index);
    
    if (oldHeight !== height) {
      heightCache.current.set(index, height);
      // 清除位置缓存（需要重新计算）
      positionCache.current = positionCache.current.slice(0, index + 1);
    }
  }, []);
  
  const handleScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop);
  }, []);
  
  const visibleItems = getVisibleItems();
  const totalHeight = getItemOffset(data.length);
  
  return (
    <div
      ref={containerRef}
      style={{ height: containerHeight, overflow: 'auto' }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.map(({ index, offset, height }) => (
          <div
            key={index}
            ref={(el) => measureItem(index, el)}
            style={{
              position: 'absolute',
              top: offset,
              left: 0,
              right: 0,
              height: height
            }}
          >
            {data[index].content}
          </div>
        ))}
      </div>
    </div>
  );
}


方案 3：使用 IntersectionObserver
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

特点：
  ✅ 浏览器原生 API，性能好
  ✅ 自动检测可见性
  ❌ 不适合超大列表（仍需渲染所有 DOM）

适用场景：
  - 无限滚动加载
  - 图片懒加载
  - 中等规模列表（< 1000 项）

function IntersectionVirtualList({ data }) {
  const observerRef = useRef(null);
  const itemRefs = useRef([]);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // 进入可见区域
            const index = entry.target.dataset.index;
            // 加载数据或显示元素
          }
        });
      },
      {
        root: null,
        rootMargin: '100px',  // 缓冲区
        threshold: 0.01
      }
    );
    
    observerRef.current = observer;
    
    // 观察所有项
    itemRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });
    
    return () => observer.disconnect();
  }, [data]);
  
  return (
    <div>
      {data.map((item, index) => (
        <div
          key={index}
          ref={(el) => (itemRefs.current[index] = el)}
          data-index={index}
        >
          {item.content}
        </div>
      ))}
    </div>
  );
}


方案选择建议
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

数据量 < 100：
  → 不需要虚拟化，直接渲染

数据量 100-1000：
  → IntersectionObserver + 分页加载

数据量 1000-10000：
  → 固定高度虚拟列表

数据量 > 10000：
  → 固定高度虚拟列表 + Web Worker

高度不同且可预估：
  → 预估高度虚拟列表

高度不同且不可预估：
  → 动态高度虚拟列表（性能会下降）`}
      </pre>
    </div>
  );
}

function CodeImplementation() {
  return (
    <div>
      <pre style={{ background: '#f5f5f5', padding: '15px', borderRadius: '5px', overflow: 'auto', fontSize: '12px', lineHeight: '1.6' }}>
{`完整实现代码（可直接使用）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// VirtualList.jsx
import React, { useState, useRef, useCallback, useMemo } from 'react';

/**
 * 虚拟列表组件
 * @param {Array} data - 数据数组
 * @param {number} itemHeight - 每项高度
 * @param {number} containerHeight - 容器高度
 * @param {number} bufferSize - 缓冲区大小
 * @param {Function} renderItem - 渲染项的函数
 */
function VirtualList({
  data = [],
  itemHeight = 50,
  containerHeight = 600,
  bufferSize = 5,
  renderItem,
  className = '',
  style = {}
}) {
  // 滚动位置
  const [scrollTop, setScrollTop] = useState(0);
  
  // 容器引用
  const containerRef = useRef(null);
  
  // 是否正在滚动（用于节流）
  const isScrolling = useRef(false);
  
  // 计算可见项数量
  const visibleCount = useMemo(() => {
    return Math.ceil(containerHeight / itemHeight);
  }, [containerHeight, itemHeight]);
  
  // 计算起始索引
  const startIndex = useMemo(() => {
    return Math.floor(scrollTop / itemHeight);
  }, [scrollTop, itemHeight]);
  
  // 计算渲染范围
  const { renderStart, renderEnd } = useMemo(() => {
    const start = Math.max(0, startIndex - bufferSize);
    const end = Math.min(data.length, startIndex + visibleCount + bufferSize);
    return { renderStart: start, renderEnd: end };
  }, [startIndex, visibleCount, bufferSize, data.length]);
  
  // 计算占位高度
  const { topHeight, bottomHeight, totalHeight } = useMemo(() => {
    const top = renderStart * itemHeight;
    const bottom = (data.length - renderEnd) * itemHeight;
    const total = data.length * itemHeight;
    return { topHeight: top, bottomHeight: bottom, totalHeight: total };
  }, [renderStart, renderEnd, data.length, itemHeight]);
  
  // 渲染的数据切片
  const visibleData = useMemo(() => {
    return data.slice(renderStart, renderEnd).map((item, index) => ({
      data: item,
      index: renderStart + index
    }));
  }, [data, renderStart, renderEnd]);
  
  // 滚动处理（使用 RAF 优化）
  const handleScroll = useCallback((e) => {
    if (isScrolling.current) return;
    
    isScrolling.current = true;
    
    requestAnimationFrame(() => {
      setScrollTop(e.target.scrollTop);
      isScrolling.current = false;
    });
  }, []);
  
  // 滚动到指定索引
  const scrollToIndex = useCallback((index) => {
    if (containerRef.current) {
      const offset = index * itemHeight;
      containerRef.current.scrollTop = offset;
    }
  }, [itemHeight]);
  
  return (
    <div
      ref={containerRef}
      className={\`virtual-list-container \${className}\`}
      style={{
        height: containerHeight,
        overflow: 'auto',
        position: 'relative',
        ...style
      }}
      onScroll={handleScroll}
    >
      {/* 滚动内容容器 */}
      <div
        className="virtual-list-content"
        style={{
          height: totalHeight,
          position: 'relative'
        }}
      >
        {/* 上方占位 */}
        {topHeight > 0 && (
          <div
            className="virtual-list-spacer-top"
            style={{ height: topHeight }}
          />
        )}
        
        {/* 渲染可见项 */}
        {visibleData.map(({ data: item, index }) => (
          <div
            key={index}
            className="virtual-list-item"
            style={{
              height: itemHeight,
              overflow: 'hidden'
            }}
          >
            {renderItem ? renderItem(item, index) : item}
          </div>
        ))}
        
        {/* 下方占位 */}
        {bottomHeight > 0 && (
          <div
            className="virtual-list-spacer-bottom"
            style={{ height: bottomHeight }}
          />
        )}
      </div>
    </div>
  );
}

export default React.memo(VirtualList);


// 使用示例
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import VirtualList from './VirtualList';

function App() {
  // 生成大量数据
  const data = useMemo(() => {
    return Array.from({ length: 10000 }, (_, i) => ({
      id: i,
      name: \`Item \${i}\`,
      description: \`Description for item \${i}\`
    }));
  }, []);
  
  // 渲染每一项
  const renderItem = useCallback((item, index) => {
    return (
      <div style={{
        padding: '10px',
        borderBottom: '1px solid #eee',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        <div style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          background: '#2196f3',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {index}
        </div>
        <div>
          <div style={{ fontWeight: 'bold' }}>{item.name}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {item.description}
          </div>
        </div>
      </div>
    );
  }, []);
  
  return (
    <div style={{ padding: '20px' }}>
      <h1>虚拟列表示例（10,000 项）</h1>
      <VirtualList
        data={data}
        itemHeight={60}
        containerHeight={600}
        bufferSize={5}
        renderItem={renderItem}
        style={{ border: '1px solid #ddd', borderRadius: '8px' }}
      />
    </div>
  );
}


// 高级示例：动态高度
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// DynamicVirtualList.jsx
import React, { useState, useRef, useCallback, useMemo, useLayoutEffect } from 'react';

function DynamicVirtualList({
  data = [],
  estimatedHeight = 80,
  containerHeight = 600,
  bufferSize = 3,
  renderItem,
  itemKey = 'id'
}) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef(null);
  const itemsRef = useRef({});
  
  // 缓存高度
  const heightCache = useRef(new Map());
  const positionCache = useRef([0]);
  
  // 获取项的高度
  const getItemHeight = useCallback((index) => {
    return heightCache.current.get(index) || estimatedHeight;
  }, [estimatedHeight]);
  
  // 获取项的位置
  const getItemOffset = useCallback((index) => {
    if (positionCache.current[index] !== undefined) {
      return positionCache.current[index];
    }
    
    let offset = 0;
    for (let i = 0; i < index; i++) {
      offset += getItemHeight(i);
    }
    positionCache.current[index] = offset;
    return offset;
  }, [getItemHeight]);
  
  // 总高度
  const totalHeight = useMemo(() => {
    return getItemOffset(data.length);
  }, [data.length, getItemOffset]);
  
  // 二分查找起始索引
  const findStartIndex = useCallback((scrollTop) => {
    let left = 0;
    let right = data.length - 1;
    
    while (left < right) {
      const mid = Math.floor((left + right) / 2);
      const offset = getItemOffset(mid);
      
      if (offset < scrollTop) {
        left = mid + 1;
      } else {
        right = mid;
      }
    }
    
    return left;
  }, [data.length, getItemOffset]);
  
  // 获取可见项
  const visibleItems = useMemo(() => {
    const startIndex = Math.max(0, findStartIndex(scrollTop) - bufferSize);
    const items = [];
    let currentOffset = getItemOffset(startIndex);
    
    for (let i = startIndex; i < data.length; i++) {
      if (currentOffset > scrollTop + containerHeight + estimatedHeight * bufferSize) {
        break;
      }
      
      items.push({
        index: i,
        data: data[i],
        offset: currentOffset,
        height: getItemHeight(i)
      });
      
      currentOffset += getItemHeight(i);
    }
    
    return items;
  }, [scrollTop, containerHeight, data, findStartIndex, getItemOffset, getItemHeight, estimatedHeight, bufferSize]);
  
  // 测量高度
  useLayoutEffect(() => {
    visibleItems.forEach(({ index }) => {
      const element = itemsRef.current[index];
      if (element) {
        const height = element.getBoundingClientRect().height;
        const cachedHeight = heightCache.current.get(index);
        
        if (cachedHeight !== height) {
          heightCache.current.set(index, height);
          positionCache.current = positionCache.current.slice(0, index + 1);
        }
      }
    });
  });
  
  const handleScroll = useCallback((e) => {
    requestAnimationFrame(() => {
      setScrollTop(e.target.scrollTop);
    });
  }, []);
  
  return (
    <div
      ref={containerRef}
      style={{ height: containerHeight, overflow: 'auto', position: 'relative' }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.map(({ index, data: item, offset, height }) => (
          <div
            key={item[itemKey] || index}
            ref={(el) => (itemsRef.current[index] = el)}
            style={{
              position: 'absolute',
              top: offset,
              left: 0,
              right: 0,
              minHeight: height
            }}
          >
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  );
}

export default React.memo(DynamicVirtualList);`}
      </pre>
    </div>
  );
}

function Optimization() {
  return (
    <div>
      <pre style={{ background: '#f5f5f5', padding: '15px', borderRadius: '5px', overflow: 'auto', fontSize: '13px', lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>
{`性能优化技巧
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

(详细内容...)

1. React 优化
2. 滚动优化
3. 渲染优化
4. 内存优化
5. 缓存优化`}
      </pre>
    </div>
  );
}

function InterviewPoints() {
  return (
    <div>
      <pre style={{ background: '#f5f5f5', padding: '15px', borderRadius: '5px', overflow: 'auto', fontSize: '13px', lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>
{`虚拟列表面试要点
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

必答问题：
1. 什么是虚拟列表？解决什么问题？
2. 虚拟列表的核心原理是什么？
3. 如何计算可见区域？
4. 为什么需要缓冲区？
5. 如何处理动态高度？
6. 如何优化滚动性能？
7. 虚拟列表的缺点是什么？

高级问题：
1. 如何实现双向虚拟列表？
2. 如何处理瀑布流布局？
3. 如何优化首屏渲染？
4. 如何处理分组列表？`}
      </pre>
    </div>
  );
}

function FAQ() {
  return (
    <div>
      <pre style={{ background: '#f5f5f5', padding: '15px', borderRadius: '5px', overflow: 'auto', fontSize: '13px', lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>
{`常见问题解答
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Q1: 虚拟列表和分页有什么区别？
Q2: 如何实现虚拟表格？
Q3: 如何支持搜索和过滤？
Q4: 如何处理滚动到底部加载更多？
Q5: 虚拟列表对 SEO 的影响？`}
      </pre>
    </div>
  );
}

// 实际示例组件
function VirtualListDemo() {
  const [itemCount, setItemCount] = useState(10000);
  
  // 生成数据
  const data = useMemo(() => {
    return Array.from({ length: itemCount }, (_, i) => ({
      id: i,
      name: `Item ${i}`,
      description: `This is item number ${i}`
    }));
  }, [itemCount]);
  
  // 渲染项
  const renderItem = useCallback((item, index) => {
    return (
      <div style={{
        padding: '10px 15px',
        borderBottom: '1px solid #eee',
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        transition: 'background 0.2s'
      }}
      onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
      >
        <div style={{
          width: 50,
          height: 50,
          borderRadius: '50%',
          background: `hsl(${(index * 137.5) % 360}, 70%, 60%)`,
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold',
          flexShrink: 0
        }}>
          {index}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
            {item.name}
          </div>
          <div style={{ fontSize: '13px', color: '#666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {item.description}
          </div>
        </div>
      </div>
    );
  }, []);
  
  return (
    <div>
      <div style={{ marginBottom: '20px', padding: '15px', background: '#e3f2fd', borderRadius: '5px' }}>
        <h4 style={{ marginTop: 0 }}>设置</h4>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label>数据量：</label>
          <input
            type="number"
            value={itemCount}
            onChange={(e) => setItemCount(Math.max(1, parseInt(e.target.value) || 0))}
            style={{ padding: '5px 10px', border: '1px solid #ddd', borderRadius: '4px', width: '120px' }}
          />
          <span style={{ color: '#666', fontSize: '14px' }}>
            （推荐尝试: 10000, 50000, 100000）
          </span>
        </div>
      </div>
      
      <div style={{ marginBottom: '10px', fontWeight: 'bold' }}>
        虚拟列表示例 - 总共 {itemCount.toLocaleString()} 项
      </div>
      
      <SimpleVirtualList
        data={data}
        itemHeight={70}
        containerHeight={500}
        renderItem={renderItem}
      />
      
      <div style={{ marginTop: '20px', padding: '15px', background: '#fff3e0', borderRadius: '5px' }}>
        <h4 style={{ marginTop: 0 }}>性能对比</h4>
        <div style={{ fontSize: '14px', lineHeight: '1.8' }}>
          <strong>普通列表：</strong><br/>
          - DOM 节点数：{itemCount.toLocaleString()} 个<br/>
          - 首次渲染：~{Math.round(itemCount / 500)} 秒<br/>
          - 内存占用：~{Math.round(itemCount * 5 / 1000)} MB<br/>
          <br/>
          <strong>虚拟列表：</strong><br/>
          - DOM 节点数：~15 个<br/>
          - 首次渲染：~50 ms<br/>
          - 内存占用：~100 KB<br/>
        </div>
      </div>
    </div>
  );
}

// 简单的虚拟列表实现
function SimpleVirtualList({ data, itemHeight, containerHeight, renderItem }) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef(null);
  
  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const startIndex = Math.floor(scrollTop / itemHeight);
  const renderStart = Math.max(0, startIndex - 5);
  const renderEnd = Math.min(data.length, startIndex + visibleCount + 5);
  
  const topHeight = renderStart * itemHeight;
  const bottomHeight = (data.length - renderEnd) * itemHeight;
  
  const handleScroll = useCallback((e) => {
    requestAnimationFrame(() => {
      setScrollTop(e.target.scrollTop);
    });
  }, []);
  
  return (
    <div
      ref={containerRef}
      style={{
        height: containerHeight,
        overflow: 'auto',
        border: '1px solid #ddd',
        borderRadius: '8px',
        background: '#fff'
      }}
      onScroll={handleScroll}
    >
      <div style={{ height: data.length * itemHeight, position: 'relative' }}>
        {topHeight > 0 && <div style={{ height: topHeight }} />}
        
        {data.slice(renderStart, renderEnd).map((item, index) => (
          <div key={renderStart + index} style={{ height: itemHeight }}>
            {renderItem(item, renderStart + index)}
          </div>
        ))}
        
        {bottomHeight > 0 && <div style={{ height: bottomHeight }} />}
      </div>
    </div>
  );
}
