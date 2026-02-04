# React 高频面试题精选（基于源码分析）

> 基于 React 18.2.0 源码深度解析

## 目录

- [一、Fiber 架构](#一fiber-架构)
- [二、Hooks 原理](#二hooks-原理)
- [三、Diff 算法](#三diff-算法)
- [四、Render 和 Commit 阶段](#四render-和-commit-阶段)
- [五、useEffect 和 useLayoutEffect](#五useeffect-和-uselayouteffect)
- [六、调度机制](#六调度机制)
- [七、性能优化](#七性能优化)
- [八、综合应用](#八综合应用)

---

## 一、Fiber 架构

### 1. 什么是 Fiber？为什么 React 要引入 Fiber 架构？

**答案要点：**

1. **Fiber 是什么**
   - React 16 引入的协调引擎架构
   - 一个 JavaScript 对象，代表一个工作单元
   - 通过链表结构连接（child、sibling、return）

2. **为什么引入**
   - React 15 的问题：同步递归遍历，无法中断
   - 大组件树会长时间占用主线程
   - 导致页面卡顿、动画掉帧

3. **核心优势**
   - ✅ 可中断的渲染
   - ✅ 优先级调度
   - ✅ 增量渲染
   - ✅ 并发模式支持

4. **实现机制**
   - 双缓存机制（current 和 workInProgress 树）
   - 时间切片（Time Slicing）
   - 调度器（Scheduler）

**源码参考：** `ReactFiber.js`, `ReactFiberWorkLoop.old.js`

---

### 2. Fiber 树的遍历过程？（beginWork 和 completeWork）

**答案要点：**

1. **遍历方式**：深度优先遍历（DFS）

2. **两个阶段**：
   - beginWork：向下遍历（递阶段）
     * 执行组件函数
     * 调用 Hooks
     * Diff 算法
     * 创建子 Fiber
   
   - completeWork：向上遍历（归阶段）
     * 创建 DOM 节点（内存中）
     * 收集副作用
     * 冒泡 flags

3. **遍历顺序**：先子节点 → 再兄弟节点 → 最后父节点

4. **数据结构**：通过 child、sibling、return 指针连接

**源码参考：** `ReactFiberWorkLoop.old.js` - `performUnitOfWork`

---

### 3. 什么是双缓存机制？

**答案要点：**

1. **两棵树**
   - current 树：当前显示内容
   - workInProgress 树：正在构建的新树

2. **相互引用**：通过 alternate 属性

3. **工作方式**
   - 在 workInProgress 树上做变更
   - Commit 阶段切换 root.current
   - 实现快速切换（O(1)）

4. **优势**
   - 内存复用
   - 快速切换
   - 安全回滚
   - 支持并发模式

**源码参考：** `ReactFiber.js` - `createWorkInProgress`

---

## 二、Hooks 原理

### 1. React Hooks 为什么不能在条件语句中使用？

**答案要点：**

1. **核心原因**
   - Hooks 使用单向链表存储
   - 依赖固定的调用顺序
   - 通过 next 指针连接

2. **数据结构**
   ```javascript
   type Hook = {
     memoizedState: any,
     next: Hook | null,  // 链表结构
   };
   ```

3. **检测机制**
   - 检测渲染的 Hook 数量
   - 比上次多：抛出 "Rendered more hooks" 错误
   - 比上次少：抛出 "Rendered fewer hooks" 错误

4. **正确用法**
   - 所有 Hooks 必须在顶层调用
   - 可以在 Hook 回调中使用条件语句
   - 可以条件性地使用 Hook 的值

**源码参考：** `ReactFiberHooks.old.js` - `updateWorkInProgressHook`, `renderWithHooks`

---

### 2. useState 的闭包陷阱是什么？如何避免？

**答案要点：**

1. **问题表现**
   ```javascript
   const [count, setCount] = useState(0);
   
   setTimeout(() => {
     setCount(count + 1);  // ❌ 闭包捕获的是旧值
   }, 3000);
   ```

2. **原因**：闭包捕获了创建时的 state 值

3. **解决方案**
   - ✅ 使用函数式更新：`setCount(prev => prev + 1)`
   - 使用 useRef 存储最新值
   - 使用 useReducer

4. **其他场景**
   - useEffect 中的闭包
   - 事件处理中的闭包

**源码参考：** `ReactFiberHooks.old.js` - `dispatchSetState`

---

### 3. useEffect 和 useLayoutEffect 的区别？

**答案要点：**

1. **执行时机**
   - useEffect：浏览器绘制后（异步）
   - useLayoutEffect：DOM 变更后、绘制前（同步）

2. **是否阻塞**
   - useEffect：不阻塞渲染
   - useLayoutEffect：阻塞渲染

3. **使用场景**
   - useEffect：大部分副作用（API、订阅等）
   - useLayoutEffect：读取布局、避免闪烁

4. **调度方式**
   - useEffect：MessageChannel 异步调度
   - useLayoutEffect：Commit 阶段同步执行

**完整时间线：**
```
Commit 阶段:
  ├─ Mutation（DOM 变更）
  ├─ Layout（useLayoutEffect）← 同步
  └─ requestPaint()

浏览器渲染:
  ├─ Style → Layout → Paint
  └─ 用户看到新画面

下一个宏任务:
  └─ useEffect ← 异步
```

**源码参考：** `ReactFiberCommitWork.old.js`, `ReactFiberWorkLoop.old.js`

---

## 三、Diff 算法

### 1. React Diff 算法的三大策略？

**答案要点：**

1. **Tree Diff**
   - 只对同层级节点进行比较
   - 不跨层级比较
   - 时间复杂度：O(n)

2. **Component Diff**
   - type 相同：继续比较子元素
   - type 不同：直接删除旧组件，创建新组件

3. **Element Diff**
   - 通过 key 标识节点
   - 使用 lastPlacedIndex 判断是否需要移动
   - 最大化复用现有节点

**lastPlacedIndex 机制：**
```
oldIndex < lastPlacedIndex  → 需要移动
oldIndex >= lastPlacedIndex → 不需要移动
```

**源码参考：** `ReactChildFiber.old.js` - `reconcileChildrenArray`, `placeChild`

---

### 2. 为什么列表渲染需要 key？

**答案要点：**

1. **作用**
   - 帮助 React 识别节点的变化
   - 判断是否可以复用
   - 检测节点移动

2. **选择原则**
   - ✅ 使用数据的唯一 ID
   - ❌ 避免使用 index（列表会变化时）
   - ❌ 避免使用随机数

3. **没有 key 的问题**
   - 按顺序比较，无法识别移动
   - 导致不必要的更新
   - 可能导致状态错乱

4. **什么时候可以用 index**
   - 列表静态不变
   - 没有唯一 ID
   - 不会重新排序

**源码参考：** `ReactChildFiber.old.js`

---

## 四、Render 和 Commit 阶段

### 1. Render 阶段和 Commit 阶段的区别？

**答案要点：**

**Render 阶段（可中断）：**
- ✅ 纯计算，不产生副作用
- ✅ 在内存中操作 Fiber 树
- ❌ 不修改真实 DOM
- 包含：beginWork + completeWork

**Commit 阶段（不可中断）：**
- ✅ 修改真实 DOM
- ✅ 执行副作用
- 三个子阶段：
  * Before Mutation
  * Mutation（DOM 变更）
  * Layout（useLayoutEffect）

**执行时机：**
- Render 阶段完成后立即（同步）进入 Commit 阶段
- 没有延迟，没有异步

**源码参考：** `ReactFiberWorkLoop.old.js` - `performSyncWorkOnRoot`, `commitRootImpl`

---

## 五、useEffect 和 useLayoutEffect

### 1. useEffect 是如何调度的？

**答案要点：**

1. **调度方式**
   - 通过 MessageChannel.port.postMessage
   - 不是 window.postMessage
   - 触发宏任务

2. **为什么选择 MessageChannel**
   - 没有 setTimeout 的 4ms 延迟
   - 不会被浏览器节流
   - 性能好

3. **完整流程**
   ```
   Commit 阶段
     ↓
   scheduleCallback(flushPassiveEffects)
     ↓
   port.postMessage(null)
     ↓
   [浏览器渲染]
     ↓
   MessageChannel 回调触发
     ↓
   flushPassiveEffects()
     ↓
   执行所有 useEffect
   ```

**源码参考：** `Scheduler.js`, `ReactFiberWorkLoop.old.js`

---

## 六、调度机制

### 1. React 的优先级调度？

**答案要点：**

1. **优先级类型**
   - Immediate：立即执行
   - UserBlocking：用户交互（点击、输入）
   - Normal：普通更新
   - Low：低优先级
   - Idle：空闲时执行

2. **Lanes 模型**
   - 使用二进制位表示优先级
   - 支持优先级合并和比较

3. **中断和恢复**
   - 高优先级任务可以打断低优先级任务
   - 暂停的任务会被重新调度

**源码参考：** `Scheduler.js`, `ReactFiberLane.js`

---

## 七、性能优化

### 1. React 性能优化手段？

**答案要点：**

1. **组件级别**
   - React.memo：避免不必要的重渲染
   - PureComponent：浅比较 props 和 state

2. **Hook 优化**
   - useMemo：缓存计算结果
   - useCallback：缓存函数

3. **代码分割**
   - React.lazy + Suspense
   - 动态 import

4. **列表优化**
   - 虚拟列表（只渲染可见项）
   - 正确使用 key

5. **其他**
   - 避免内联对象和函数
   - 使用 Profiler 分析性能
   - 懒加载图片
   - 防抖和节流

---

## 八、综合应用

### 1. 从 setState 到页面更新的完整流程？

**完整时间线：**

```
1. 用户操作
   └─ setState()

2. Schedule 阶段
   └─ ensureRootIsScheduled()

3. Render 阶段（可中断）
   ├─ renderRootSync/Concurrent
   ├─ workLoop
   ├─ performUnitOfWork
   │  ├─ beginWork（向下）
   │  └─ completeWork（向上）
   └─ 输出：新的 Fiber 树

4. Commit 阶段（不可中断）
   ├─ Before Mutation
   ├─ Mutation（DOM 变更）
   ├─ Layout（useLayoutEffect）
   └─ requestPaint()

5. 浏览器渲染
   ├─ Recalculate Style
   ├─ Layout
   ├─ Paint
   └─ 用户看到新画面

6. useEffect 执行（异步）
   └─ 通过 MessageChannel 触发
```

---

## 面试技巧

### 1. 如何回答源码相关问题？

1. **结构化回答**
   - 是什么（概念）
   - 为什么（原因）
   - 怎么做（实现）
   - 有什么用（应用）

2. **结合实例**
   - 举具体的代码例子
   - 说明可能遇到的问题
   - 提供解决方案

3. **展示深度**
   - 提到源码文件名
   - 说明核心函数
   - 解释关键机制

4. **保持清晰**
   - 先说结论
   - 再说原理
   - 最后说细节

### 2. 常见追问

- "你怎么知道的？"
  → 看过源码、做过实验、遇到过问题

- "能详细说说吗？"
  → 准备好深入的技术细节

- "有没有遇到过相关问题？"
  → 准备实际案例和解决过程

---

## 推荐资源

1. **React 源码**
   - 官方仓库：https://github.com/facebook/react
   - 版本：18.2.0

2. **学习路径**
   - 先理解概念和原理
   - 再阅读核心源码
   - 最后结合实践

3. **调试技巧**
   - 使用 React DevTools
   - 在源码中添加断点
   - console.log 追踪执行流程

---

## 总结

React 源码面试的核心：

1. ✅ 理解 Fiber 架构的设计思想
2. ✅ 掌握 Hooks 的实现原理
3. ✅ 熟悉 Diff 算法的优化策略
4. ✅ 了解 Render 和 Commit 的完整流程
5. ✅ 知道性能优化的最佳实践
6. ✅ 能结合源码解释原理
7. ✅ 有实际问题的解决经验

**记住：面试不是背书，而是理解和应用！**
