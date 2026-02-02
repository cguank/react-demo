import React, { useState, useEffect, useRef } from 'react';

/**
 * React Diff 算法 - 子节点 type 改变时孙子节点的命运
 * 
 * 核心问题：
 * 1. 子层从 A 变成 B（type 不同）
 * 2. 但 A 和 B 的孙子层结构相同
 * 3. 孙子层能复用吗？
 */

// 组件 A 和 B 有相同的子结构
function ComponentA() {
  const ref = useRef();
  
  useEffect(() => {
    console.log('🔵 ComponentA mounted');
    return () => console.log('🔴 ComponentA unmounted');
  }, []);
  
  return (
    <div ref={ref} style={{ padding: '10px', background: '#e3f2fd', marginBottom: '10px' }}>
      <h4>我是 ComponentA</h4>
      <GrandChild1 />
      <GrandChild2 />
    </div>
  );
}

function ComponentB() {
  useEffect(() => {
    console.log('🟢 ComponentB mounted');
    return () => console.log('🟡 ComponentB unmounted');
  }, []);
  
  return (
    <div style={{ padding: '10px', background: '#f3e5f5', marginBottom: '10px' }}>
      <h4>我是 ComponentB</h4>
      <GrandChild1 />
      <GrandChild2 />
    </div>
  );
}

// 孙子组件 1
function GrandChild1() {
  const instanceId = useRef(Math.random().toString(36).substr(2, 9));
  
  useEffect(() => {
    console.log(`  🌟 GrandChild1 mounted (实例ID: ${instanceId.current})`);
    return () => console.log(`  💀 GrandChild1 unmounted (实例ID: ${instanceId.current})`);
  }, []);
  
  return (
    <div style={{ padding: '5px', background: '#c8e6c9', margin: '5px 0' }}>
      GrandChild1 (实例ID: {instanceId.current})
    </div>
  );
}

// 孙子组件 2
function GrandChild2() {
  const instanceId = useRef(Math.random().toString(36).substr(2, 9));
  
  useEffect(() => {
    console.log(`  🌟 GrandChild2 mounted (实例ID: ${instanceId.current})`);
    return () => console.log(`  💀 GrandChild2 unmounted (实例ID: ${instanceId.current})`);
  }, []);
  
  return (
    <div style={{ padding: '5px', background: '#fff9c4', margin: '5px 0' }}>
      GrandChild2 (实例ID: {instanceId.current})
    </div>
  );
}

export default function ComponentTypeChangeAnalysis() {
  const [useComponentA, setUseComponentA] = useState(true);
  const [sameTypeUpdate, setSameTypeUpdate] = useState(false);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>⚛️ 子节点 Type 改变时孙子节点能否复用？</h1>
      
      {/* 第一部分：核心答案 */}
      <div style={{ background: '#ffebee', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>🎯 核心答案：不能复用！孙子节点会随着父节点一起被删除</h2>
        
        <div style={{ background: '#fff', padding: '15px', borderRadius: '5px', marginBottom: '15px' }}>
          <h3>❌ 即使孙子层结构完全相同，也会被删除重建</h3>
          <pre style={{ background: '#f5f5f5', padding: '15px', overflow: 'auto', fontSize: '14px' }}>
{`原因：Component Diff 策略

当子节点的 type 不同时（ComponentA → ComponentB）：

1. React 判断：type 不同，不能复用
2. 标记删除：整个 ComponentA 的 Fiber 节点
3. 递归删除：ComponentA 的所有子孙节点
   ├─ 删除 GrandChild1 ❌
   └─ 删除 GrandChild2 ❌
4. 创建新节点：ComponentB 的 Fiber 节点
5. 递归创建：ComponentB 的所有子孙节点
   ├─ 创建新的 GrandChild1 ➕
   └─ 创建新的 GrandChild2 ➕

关键点：
- 删除是递归的，会删除整个子树
- React 不会深入比较不同类型组件的子结构
- 即使子结构相同，也不会复用
- 这是性能优化的权衡（避免深度比较）`}
          </pre>
        </div>
      </div>

      {/* 第二部分：源码解析 */}
      <div style={{ background: '#e3f2fd', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>📂 源码级别的删除机制</h2>
        
        <div style={{ background: '#fff', padding: '15px', borderRadius: '5px', marginBottom: '15px' }}>
          <h3>1. updateElement - 判断是否可以复用</h3>
          <pre style={{ background: '#f5f5f5', padding: '10px', overflow: 'auto', fontSize: '13px' }}>
{`// ReactChildFiber.old.js (387 行)

function updateElement(
  returnFiber: Fiber,
  current: Fiber | null,    // 老节点（ComponentA）
  element: ReactElement,    // 新元素（ComponentB）
  lanes: Lanes,
): Fiber {
  const elementType = element.type;  // ComponentB
  
  // 关键判断
  if (current !== null) {
    if (current.elementType === elementType) {  // ComponentA === ComponentB?
      // ✅ type 相同，可以复用
      const existing = useFiber(current, element.props);
      existing.ref = coerceRef(returnFiber, current, element);
      existing.return = returnFiber;
      return existing;
    }
  }
  
  // ❌ type 不同（或 current 为 null），创建新节点
  const created = createFiberFromElement(element, returnFiber.mode, lanes);
  created.ref = coerceRef(returnFiber, current, element);
  created.return = returnFiber;
  return created;
  
  // 注意：这里没有调用 deleteChild
  // 删除会在 reconcileChildrenArray 中处理
}

关键观察：
1. type 不同 → 不复用，创建新节点
2. 没有深入比较子结构
3. 老节点（ComponentA）会在外层被标记删除`}
          </pre>
        </div>

        <div style={{ background: '#fff', padding: '15px', borderRadius: '5px', marginBottom: '15px' }}>
          <h3>2. deleteChild - 标记删除</h3>
          <pre style={{ background: '#f5f5f5', padding: '10px', overflow: 'auto', fontSize: '13px' }}>
{`// ReactChildFiber.old.js (266 行)

function deleteChild(
  returnFiber: Fiber,
  childToDelete: Fiber,    // 要删除的节点（ComponentA）
): void {
  if (!shouldTrackSideEffects) {
    return;
  }
  
  // 将要删除的节点添加到父节点的 deletions 数组
  const deletions = returnFiber.deletions;
  if (deletions === null) {
    returnFiber.deletions = [childToDelete];
    returnFiber.flags |= ChildDeletion;  // 标记有子节点要删除
  } else {
    deletions.push(childToDelete);
  }
}

关键点：
1. 只标记顶层要删除的节点（ComponentA）
2. 不递归标记子孙节点
3. 实际删除在 Commit 阶段执行`}
          </pre>
        </div>

        <div style={{ background: '#fff', padding: '15px', borderRadius: '5px', marginBottom: '15px' }}>
          <h3>3. Commit 阶段 - 递归删除子树</h3>
          <pre style={{ background: '#f5f5f5', padding: '10px', overflow: 'auto', fontSize: '13px' }}>
{`// ReactFiberCommitWork.old.js

function commitDeletion(
  finishedRoot: FiberRoot,
  current: Fiber,          // ComponentA
  nearestMountedAncestor: Fiber,
): void {
  // 开始递归删除
  unmountHostComponents(finishedRoot, current, nearestMountedAncestor);
  
  // 分离 Fiber 节点
  detachFiberMutation(current);
}

function unmountHostComponents(...) {
  let node = current;
  
  // 深度优先遍历删除所有子孙节点
  while (true) {
    // 执行 componentWillUnmount / useEffect cleanup
    commitUnmount(finishedRoot, node, nearestMountedAncestor);
    
    // 如果有子节点，继续向下
    if (node.child !== null) {
      node.child.return = node;
      node = node.child;
      continue;
    }
    
    // 如果到达根节点，结束
    if (node === current) {
      return;
    }
    
    // 处理兄弟节点和回溯
    while (node.sibling === null) {
      if (node.return === null || node.return === current) {
        return;
      }
      node = node.return;
    }
    
    node.sibling.return = node.return;
    node = node.sibling;
  }
}

关键流程：
┌────────────────────────────────────────────┐
│  删除 ComponentA                            │
│    ↓                                        │
│  深度优先遍历整个子树                       │
│    ├─ 访问 ComponentA                      │
│    ├─ 向下到 GrandChild1                   │
│    │  └─ 调用 componentWillUnmount          │
│    │  └─ 调用 useEffect cleanup             │
│    │  └─ 删除 DOM 节点                      │
│    ├─ 向下到 GrandChild1 的子节点（如果有）  │
│    ├─ 回溯到 GrandChild2                   │
│    │  └─ 删除 GrandChild2                  │
│    └─ 回溯到 ComponentA                    │
│       └─ 删除 ComponentA 的 DOM            │
└────────────────────────────────────────────┘

结果：
- 整个 ComponentA 子树被删除
- 包括所有孙子节点
- 不考虑子结构是否相同`}
          </pre>
        </div>

        <div style={{ background: '#fff', padding: '15px', borderRadius: '5px' }}>
          <h3>4. 完整的更新流程</h3>
          <pre style={{ background: '#f5f5f5', padding: '10px', overflow: 'auto', fontSize: '13px' }}>
{`场景：ComponentA → ComponentB（子结构相同）

老树：                新树：
  Parent              Parent
    |                   |
  ComponentA          ComponentB
   /    \\              /    \\
GC1     GC2          GC1     GC2

Render 阶段：
────────────
Step 1: reconcileChildren(Parent, ComponentB)
  ├─ 老子节点：ComponentA
  ├─ 新子节点：ComponentB
  ├─ updateElement(Parent, ComponentA, ComponentB)
  │  ├─ 判断：ComponentA !== ComponentB（type 不同）
  │  ├─ 不复用，创建新的 ComponentB Fiber
  │  └─ 返回新 Fiber
  └─ deleteChild(Parent, ComponentA)  ← 标记删除

Step 2: beginWork(ComponentB)
  ├─ 渲染 ComponentB，返回 [GC1, GC2]
  └─ reconcileChildren(ComponentB, [GC1, GC2])
     ├─ 老子节点：null（ComponentB 是新创建的）
     ├─ 新子节点：[GC1, GC2]
     ├─ 创建新的 GC1 Fiber ➕
     └─ 创建新的 GC2 Fiber ➕

Commit 阶段：
────────────
Step 3: 处理 deletions
  └─ commitDeletion(ComponentA)
     ├─ unmountHostComponents(ComponentA)
     │  ├─ 递归访问 ComponentA 的所有子孙
     │  ├─ 执行 GC1 的 cleanup ❌
     │  ├─ 删除 GC1 的 DOM ❌
     │  ├─ 执行 GC2 的 cleanup ❌
     │  ├─ 删除 GC2 的 DOM ❌
     │  └─ 删除 ComponentA 的 DOM ❌
     └─ detachFiberMutation(ComponentA)

Step 4: 插入新节点
  └─ commitPlacement(ComponentB)
     ├─ 插入 ComponentB 的 DOM ➕
     ├─ 插入新 GC1 的 DOM ➕
     └─ 插入新 GC2 的 DOM ➕

Step 5: 执行 effects
  ├─ ComponentB.componentDidMount / useEffect ✨
  ├─ GC1 (new).useEffect ✨
  └─ GC2 (new).useEffect ✨

结果对比：
┌──────────────────────────────────────────┐
│  实例 ID 变化（证明重新创建）              │
│                                           │
│  老 GC1: instance-abc123 → 删除 ❌        │
│  新 GC1: instance-xyz789 → 创建 ➕        │
│                                           │
│  老 GC2: instance-def456 → 删除 ❌        │
│  新 GC2: instance-uvw012 → 创建 ➕        │
└──────────────────────────────────────────┘`}
          </pre>
        </div>
      </div>

      {/* 第三部分：为什么这样设计 */}
      <div style={{ background: '#fff3e0', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>🤔 为什么不复用孙子节点？</h2>
        
        <div style={{ background: '#fff', padding: '15px', borderRadius: '5px', marginBottom: '15px' }}>
          <h3>原因 1：性能权衡</h3>
          <pre style={{ background: '#f5f5f5', padding: '10px', fontSize: '13px' }}>
{`如果要复用孙子节点，需要：

1. 深入比较两个组件的子树结构
   ├─ 遍历 ComponentA 的所有子孙节点
   ├─ 遍历 ComponentB 的所有子孙节点
   ├─ 逐个比较 key 和 type
   └─ 建立映射关系

2. 处理复杂的边界情况
   ├─ 子结构部分相同
   ├─ 嵌套层级不同
   └─ Context 和 State 的处理

复杂度：O(n²) 或更高

React 的选择：
- ❌ 不深入比较（避免复杂度）
- ✅ 直接删除重建（O(n)）
- ✅ 假设：不同类型的组件很少有相同的子结构

结果：
大多数情况下，这个假设是成立的
牺牲这种特殊情况的优化，换取整体性能`}
          </pre>
        </div>

        <div style={{ background: '#fff', padding: '15px', borderRadius: '5px', marginBottom: '15px' }}>
          <h3>原因 2：状态管理</h3>
          <pre style={{ background: '#f5f5f5', padding: '10px', fontSize: '13px' }}>
{`即使子结构相同，组件类型不同意味着：

1. 组件逻辑不同
   ├─ ComponentA 和 ComponentB 是不同的组件
   ├─ 可能有不同的 State
   ├─ 可能有不同的 Context
   └─ 可能有不同的副作用

2. 子节点的语义不同
   ├─ 在 ComponentA 中的 GC1 可能有特定含义
   ├─ 在 ComponentB 中的 GC1 可能有不同含义
   └─ 复用可能导致状态混乱

示例：
function LoginForm() {
  return <InputField key="username" />;  // 登录用户名
}

function SignupForm() {
  return <InputField key="username" />;  // 注册用户名
}

如果复用 InputField：
- 登录时输入的内容会保留到注册表单 ❌
- 语义不正确
- 用户体验差

正确做法：
- 删除 LoginForm 的 InputField（清空状态）
- 创建 SignupForm 的 InputField（全新状态）`}
          </pre>
        </div>

        <div style={{ background: '#fff', padding: '15px', borderRadius: '5px' }}>
          <h3>原因 3：实现简单</h3>
          <pre style={{ background: '#f5f5f5', padding: '10px', fontSize: '13px' }}>
{`Component Diff 策略：
- 简单明确：type 不同 → 删除重建
- 易于理解和维护
- 减少 bug 的可能性

如果要支持跨组件复用：
- 需要复杂的匹配算法
- 需要处理大量边界情况
- 增加代码复杂度和 bug 风险
- 维护成本高

React 的哲学：
"简单 > 智能"
"可预测 > 优化"`}
          </pre>
        </div>
      </div>

      {/* 第四部分：交互式演示 */}
      <div style={{ background: '#e8f5e9', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>🎮 交互式演示</h2>
        
        <div style={{ marginBottom: '20px' }}>
          <button
            onClick={() => {
              console.clear();
              console.log('═══════════════════════════════════════');
              console.log('🔄 切换组件类型 (ComponentA ↔ ComponentB)');
              console.log('观察：GC1 和 GC2 的实例 ID 会改变！');
              console.log('═══════════════════════════════════════');
              setUseComponentA(!useComponentA);
            }}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              background: '#e91e63',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              marginRight: '10px'
            }}
          >
            切换 ComponentA ↔ ComponentB
          </button>
          
          <button
            onClick={() => {
              console.clear();
              console.log('═══════════════════════════════════════');
              console.log('🔄 强制更新相同类型的组件');
              console.log('观察：GC1 和 GC2 的实例 ID 不变！');
              console.log('═══════════════════════════════════════');
              setSameTypeUpdate(!sameTypeUpdate);
            }}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              background: '#4caf50',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            强制更新（不改变 type）
          </button>
        </div>

        <div style={{ background: '#fff', padding: '15px', borderRadius: '5px' }}>
          <h3>当前渲染的组件：</h3>
          {useComponentA ? <ComponentA /> : <ComponentB />}
          <p style={{ marginTop: '10px', color: '#666' }}>
            <strong>查看控制台输出！</strong>
          </p>
        </div>

        <div style={{ background: '#fff9c4', padding: '15px', marginTop: '15px', borderRadius: '5px' }}>
          <h4>🔍 观察要点：</h4>
          <ol>
            <li><strong>切换组件类型时：</strong>
              <ul>
                <li>旧组件和孙子节点都会 unmount ❌</li>
                <li>新组件和孙子节点都会 mount ➕</li>
                <li>孙子节点的实例 ID 会改变（证明重新创建）</li>
              </ul>
            </li>
            <li><strong>强制更新相同类型时：</strong>
              <ul>
                <li>组件和孙子节点都不会 unmount ✅</li>
                <li>孙子节点的实例 ID 保持不变（证明复用）</li>
              </ul>
            </li>
          </ol>
        </div>
      </div>

      {/* 第五部分：总结 */}
      <div style={{ background: '#e0f2f1', padding: '20px', borderRadius: '8px' }}>
        <h2>📝 总结</h2>
        
        <div style={{ background: '#fff', padding: '15px', borderRadius: '5px' }}>
          <h3>🎯 核心答案</h3>
          
          <h4>子节点 type 改变时，孙子节点不能复用！</h4>
          
          <div style={{ background: '#ffebee', padding: '10px', marginBottom: '10px' }}>
            <p><strong>❌ 孙子节点会随着父节点一起被删除</strong></p>
            <ul>
              <li>当 ComponentA → ComponentB（type 不同）</li>
              <li>React 会删除整个 ComponentA 子树</li>
              <li>包括所有子孙节点（GrandChild1, GrandChild2）</li>
              <li>然后创建新的 ComponentB 及其所有子孙节点</li>
              <li>即使子结构完全相同，也不会复用</li>
            </ul>
          </div>

          <h4>为什么这样设计？</h4>
          
          <div style={{ background: '#e3f2fd', padding: '10px', marginBottom: '10px' }}>
            <ul>
              <li><strong>性能权衡：</strong>避免深度比较的 O(n²) 复杂度</li>
              <li><strong>语义正确：</strong>不同组件的子节点语义不同</li>
              <li><strong>状态隔离：</strong>避免状态混乱</li>
              <li><strong>实现简单：</strong>减少复杂度和 bug</li>
            </ul>
          </div>

          <h4>如何优化？</h4>
          
          <div style={{ background: '#e8f5e9', padding: '10px' }}>
            <p><strong>✅ 保持组件类型稳定：</strong></p>
            <pre style={{ background: '#f5f5f5', padding: '10px', marginTop: '5px' }}>
{`❌ 不好的做法：
function Parent({ type }) {
  return type === 'A' ? <ComponentA /> : <ComponentB />;
  // 切换时删除重建整个子树
}

✅ 好的做法：
function Parent({ type }) {
  return (
    <UnifiedComponent type={type}>
      <GrandChild1 />
      <GrandChild2 />
    </UnifiedComponent>
  );
  // 只更新 type prop，子节点可以复用
}

或者使用条件渲染但保持子结构稳定：
function Parent({ type }) {
  return (
    <div>
      {type === 'A' && <HeaderA />}
      {type === 'B' && <HeaderB />}
      <SharedContent />  {/* 始终存在，可以复用 */}
    </div>
  );
}`}
            </pre>
          </div>

          <div style={{ background: '#fff9c4', padding: '15px', marginTop: '15px', borderRadius: '5px' }}>
            <h4>💡 记忆口诀：</h4>
            <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#1976d2' }}>
              父节点类型变<br/>
              子树全部删<br/>
              孙子不复用<br/>
              重建整棵树<br/>
              保持类型稳<br/>
              优化靠自己
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
