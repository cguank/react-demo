import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';

/**
 * React 删除顺序深度解析
 * 
 * 核心问题：
 * 1. 删除是先删父节点还是先删子节点？
 * 2. 生命周期和 DOM 操作的顺序？
 * 3. 为什么这样设计？
 */

// 父组件
function ParentComponent({ id }) {
  const domRef = useRef(null);
  
  useEffect(() => {
    console.log(`🟢 [${id}] Parent useEffect mounted`);
    return () => {
      console.log(`🔴 [${id}] Parent useEffect cleanup`);
    };
  }, [id]);
  
  useLayoutEffect(() => {
    console.log(`🔵 [${id}] Parent useLayoutEffect mounted`);
    return () => {
      console.log(`🟠 [${id}] Parent useLayoutEffect cleanup`);
    };
  }, [id]);
  
  // Class 组件的 componentWillUnmount 等价
  useEffect(() => {
    return () => {
      console.log(`💀 [${id}] Parent componentWillUnmount (useEffect cleanup)`);
      console.log(`   DOM 节点存在: ${domRef.current !== null}`);
    };
  }, [id]);
  
  return (
    <div ref={domRef} style={{ padding: '15px', background: '#e3f2fd', margin: '10px' }}>
      <h4>[{id}] Parent Component</h4>
      <ChildComponent id={id} />
      <ChildComponent2 id={id} />
    </div>
  );
}

// 子组件 1
function ChildComponent({ id }) {
  const domRef = useRef(null);
  
  useEffect(() => {
    console.log(`  🟢 [${id}] Child1 useEffect mounted`);
    return () => {
      console.log(`  🔴 [${id}] Child1 useEffect cleanup`);
    };
  }, [id]);
  
  useLayoutEffect(() => {
    console.log(`  🔵 [${id}] Child1 useLayoutEffect mounted`);
    return () => {
      console.log(`  🟠 [${id}] Child1 useLayoutEffect cleanup`);
    };
  }, [id]);
  
  useEffect(() => {
    return () => {
      console.log(`  💀 [${id}] Child1 componentWillUnmount`);
      console.log(`     DOM 节点存在: ${domRef.current !== null}`);
    };
  }, [id]);
  
  return (
    <div ref={domRef} style={{ padding: '10px', background: '#c8e6c9', margin: '5px' }}>
      [{id}] Child 1
      <GrandChildComponent id={id} />
    </div>
  );
}

// 子组件 2
function ChildComponent2({ id }) {
  const domRef = useRef(null);
  
  useEffect(() => {
    console.log(`  🟢 [${id}] Child2 useEffect mounted`);
    return () => {
      console.log(`  🔴 [${id}] Child2 useEffect cleanup`);
    };
  }, [id]);
  
  useEffect(() => {
    return () => {
      console.log(`  💀 [${id}] Child2 componentWillUnmount`);
      console.log(`     DOM 节点存在: ${domRef.current !== null}`);
    };
  }, [id]);
  
  return (
    <div ref={domRef} style={{ padding: '10px', background: '#fff9c4', margin: '5px' }}>
      [{id}] Child 2
    </div>
  );
}

// 孙子组件
function GrandChildComponent({ id }) {
  const domRef = useRef(null);
  
  useEffect(() => {
    console.log(`    🟢 [${id}] GrandChild useEffect mounted`);
    return () => {
      console.log(`    🔴 [${id}] GrandChild useEffect cleanup`);
    };
  }, [id]);
  
  useEffect(() => {
    return () => {
      console.log(`    💀 [${id}] GrandChild componentWillUnmount`);
      console.log(`       DOM 节点存在: ${domRef.current !== null}`);
    };
  }, [id]);
  
  return (
    <div ref={domRef} style={{ padding: '5px', background: '#ffccbc', margin: '5px' }}>
      [{id}] GrandChild
    </div>
  );
}

export default function DeletionOrderAnalysis() {
  const [showComponent, setShowComponent] = useState(true);
  const [componentId, setComponentId] = useState(1);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>⚛️ React 删除顺序深度解析</h1>
      
      {/* 第一部分：核心答案 */}
      <div style={{ background: '#ffebee', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>🎯 核心答案：先执行子节点的清理，再删除 DOM</h2>
        
        <div style={{ background: '#fff', padding: '15px', borderRadius: '5px', marginBottom: '15px' }}>
          <h3>删除顺序（分为两个阶段）：</h3>
          <pre style={{ background: '#f5f5f5', padding: '15px', overflow: 'auto', fontSize: '14px' }}>
{`阶段 1: 执行清理逻辑（深度优先）
──────────────────────────────
顺序：父 → 子 → 孙

1. 执行父节点的 componentWillUnmount / useEffect cleanup
2. 递归到子节点
   ├─ 执行子节点的 componentWillUnmount / useEffect cleanup
   └─ 递归到孙节点
      └─ 执行孙节点的 componentWillUnmount / useEffect cleanup
3. 回溯...

特点：
✅ 深度优先遍历
✅ 先访问父节点，再递归子节点
✅ 此时 DOM 还没删除，ref 还能访问

阶段 2: 删除 DOM 节点（后序遍历）
──────────────────────────────
顺序：孙 → 子 → 父

1. 先删除最深层的 DOM（孙节点）
2. 再删除子节点的 DOM
3. 最后删除父节点的 DOM

特点：
✅ 后序遍历（子节点先于父节点）
✅ 从叶子节点开始删除
✅ 保证父节点 DOM 最后删除

关键注释（源码）：
"Now that all the child effects have unmounted, 
 we can remove the node from the tree."
 
翻译：现在所有子节点的 effects 都已卸载，
     我们可以从树中移除这个节点了。`}
          </pre>
        </div>
      </div>

      {/* 第二部分：源码解析 */}
      <div style={{ background: '#e3f2fd', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>📂 源码级别的删除机制</h2>
        
        <div style={{ background: '#fff', padding: '15px', borderRadius: '5px', marginBottom: '15px' }}>
          <h3>1. 入口函数：commitDeletionEffects</h3>
          <pre style={{ background: '#f5f5f5', padding: '10px', overflow: 'auto', fontSize: '13px' }}>
{`// ReactFiberCommitWork.old.js (1608 行)

function commitDeletionEffects(
  root: FiberRoot,
  returnFiber: Fiber,
  deletedFiber: Fiber,  // 要删除的顶层节点
) {
  if (supportsMutation) {
    // 注释说明：
    // "We only have the top Fiber that was deleted but we need to 
    //  recurse down its children to find all the terminal nodes."
    // 
    // 翻译：我们只有被删除的顶层 Fiber，但需要递归到其子节点
    //      以找到所有终端节点。
    
    // 注释说明：
    // "Recursively delete all host nodes from the parent, 
    //  detach refs, clean up mounted layout effects, 
    //  and call componentWillUnmount."
    //
    // 翻译：递归删除所有 host 节点，分离 refs，
    //      清理已挂载的 layout effects，
    //      调用 componentWillUnmount。
    
    // 找到最近的 host parent（用于删除 DOM）
    let parent = returnFiber;
    findParent: while (parent !== null) {
      switch (parent.tag) {
        case HostComponent:
          hostParent = parent.stateNode;
          hostParentIsContainer = false;
          break findParent;
        case HostRoot:
          hostParent = parent.stateNode.containerInfo;
          hostParentIsContainer = true;
          break findParent;
        // ...
      }
      parent = parent.return;
    }
    
    // 开始递归删除
    commitDeletionEffectsOnFiber(root, returnFiber, deletedFiber);
    hostParent = null;
    hostParentIsContainer = false;
  }
  
  detachFiberMutation(deletedFiber);
}`}
          </pre>
        </div>

        <div style={{ background: '#fff', padding: '15px', borderRadius: '5px', marginBottom: '15px' }}>
          <h3>2. 递归删除：commitDeletionEffectsOnFiber</h3>
          <pre style={{ background: '#f5f5f5', padding: '10px', overflow: 'auto', fontSize: '13px' }}>
{`// ReactFiberCommitWork.old.js (1683 行)

function commitDeletionEffectsOnFiber(
  finishedRoot: FiberRoot,
  nearestMountedAncestor: Fiber,
  deletedFiber: Fiber,
) {
  onCommitUnmount(deletedFiber);  // DevTools 通知
  
  switch (deletedFiber.tag) {
    case HostComponent:  // 原生 DOM 节点（div, span 等）
    case HostText: {     // 文本节点
      if (!offscreenSubtreeWasHidden) {
        safelyDetachRef(deletedFiber, nearestMountedAncestor);
      }
      
      if (supportsMutation) {
        const prevHostParent = hostParent;
        const prevHostParentIsContainer = hostParentIsContainer;
        
        // 重要：暂时设置 hostParent 为 null
        hostParent = null;
        
        // 关键步骤 1：先递归处理子节点
        recursivelyTraverseDeletionEffects(
          finishedRoot,
          nearestMountedAncestor,
          deletedFiber,
        );
        
        // 恢复 hostParent
        hostParent = prevHostParent;
        hostParentIsContainer = prevHostParentIsContainer;
        
        // 关键步骤 2：所有子节点处理完后，再删除当前节点的 DOM
        if (hostParent !== null) {
          // 注释说明：
          // "Now that all the child effects have unmounted, 
          //  we can remove the node from the tree."
          //
          // 翻译：现在所有子节点的 effects 都已卸载，
          //      我们可以从树中移除这个节点了。
          
          if (hostParentIsContainer) {
            removeChildFromContainer(
              ((hostParent: any): Container),
              (deletedFiber.stateNode: Instance | TextInstance),
            );
          } else {
            removeChild(
              ((hostParent: any): Instance),
              (deletedFiber.stateNode: Instance | TextInstance),
            );
          }
        }
      } else {
        recursivelyTraverseDeletionEffects(
          finishedRoot,
          nearestMountedAncestor,
          deletedFiber,
        );
      }
      return;
    }
    
    case FunctionComponent:
    case ClassComponent:
    case HostPortal: {
      // 先执行当前节点的清理
      if (!offscreenSubtreeWasHidden) {
        const updateQueue: FunctionComponentUpdateQueue | null = 
          (deletedFiber.updateQueue: any);
        
        if (updateQueue !== null) {
          const lastEffect = updateQueue.lastEffect;
          if (lastEffect !== null) {
            const firstEffect = lastEffect.next;
            let effect = firstEffect;
            do {
              const {destroy, tag} = effect;
              if (destroy !== undefined) {
                if ((tag & HookLayout) !== NoHookEffect) {
                  // 执行 useLayoutEffect cleanup
                  safelyCallDestroy(deletedFiber, nearestMountedAncestor, destroy);
                } else if ((tag & HookPassive) !== NoHookEffect) {
                  // 标记 useEffect cleanup（稍后执行）
                  enqueuePendingPassiveHookEffectUnmount(deletedFiber, effect);
                }
              }
              effect = effect.next;
            } while (effect !== firstEffect);
          }
        }
      }
      
      // 再递归处理子节点
      recursivelyTraverseDeletionEffects(
        finishedRoot,
        nearestMountedAncestor,
        deletedFiber,
      );
      return;
    }
    
    // ... 其他类型
  }
  
  // 默认情况：递归处理子节点
  recursivelyTraverseDeletionEffects(
    finishedRoot,
    nearestMountedAncestor,
    deletedFiber,
  );
}`}
          </pre>
        </div>

        <div style={{ background: '#fff', padding: '15px', borderRadius: '5px' }}>
          <h3>3. 遍历子节点：recursivelyTraverseDeletionEffects</h3>
          <pre style={{ background: '#f5f5f5', padding: '10px', overflow: 'auto', fontSize: '13px' }}>
{`// ReactFiberCommitWork.old.js (1670 行)

function recursivelyTraverseDeletionEffects(
  finishedRoot,
  nearestMountedAncestor,
  parent,
) {
  // TODO: Use a static flag to skip trees that don't have unmount effects
  
  // 遍历所有子节点
  let child = parent.child;
  while (child !== null) {
    // 递归调用 commitDeletionEffectsOnFiber
    commitDeletionEffectsOnFiber(finishedRoot, nearestMountedAncestor, child);
    child = child.sibling;  // 处理兄弟节点
  }
}

关键点：
1. 遍历所有子节点
2. 对每个子节点递归调用 commitDeletionEffectsOnFiber
3. 子节点内部会继续递归到孙节点
4. 形成深度优先遍历`}
          </pre>
        </div>
      </div>

      {/* 第三部分：详细流程 */}
      <div style={{ background: '#fff3e0', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>🔄 完整的删除流程示例</h2>
        
        <div style={{ background: '#fff', padding: '15px', borderRadius: '5px' }}>
          <h3>树结构：</h3>
          <pre style={{ background: '#f5f5f5', padding: '10px', overflow: 'auto', fontSize: '13px' }}>
{`    Parent (要删除)
   /        \\
Child1     Child2
  |
GrandChild

删除流程：
═══════════════════════════════════════════════════════

Step 1: commitDeletionEffectsOnFiber(Parent)
  ├─ onCommitUnmount(Parent)
  ├─ 执行 Parent 的 useLayoutEffect cleanup 🟠
  ├─ 执行 Parent 的 componentWillUnmount 💀
  ├─ 标记 Parent 的 useEffect cleanup（稍后执行）
  └─ 调用 recursivelyTraverseDeletionEffects(Parent)
     ↓

Step 2: recursivelyTraverseDeletionEffects(Parent)
  ├─ child = Parent.child  // Child1
  ├─ 调用 commitDeletionEffectsOnFiber(Child1)
  ↓

Step 3: commitDeletionEffectsOnFiber(Child1)
  ├─ 执行 Child1 的 useLayoutEffect cleanup 🟠
  ├─ 执行 Child1 的 componentWillUnmount 💀
  └─ 调用 recursivelyTraverseDeletionEffects(Child1)
     ↓

Step 4: recursivelyTraverseDeletionEffects(Child1)
  ├─ child = Child1.child  // GrandChild
  ├─ 调用 commitDeletionEffectsOnFiber(GrandChild)
  ↓

Step 5: commitDeletionEffectsOnFiber(GrandChild)
  ├─ 执行 GrandChild 的 componentWillUnmount 💀
  ├─ 调用 recursivelyTraverseDeletionEffects(GrandChild)
  │  └─ GrandChild 没有子节点，返回
  │
  ├─ 关键：现在删除 GrandChild 的 DOM ❌
  │  └─ removeChild(Child1.stateNode, GrandChild.stateNode)
  └─ 返回到 Step 4
     ↓

Step 6: 返回 Step 3
  ├─ 所有 Child1 的子节点处理完毕
  ├─ 关键：现在删除 Child1 的 DOM ❌
  │  └─ removeChild(Parent.stateNode, Child1.stateNode)
  └─ 返回到 Step 2
     ↓

Step 7: recursivelyTraverseDeletionEffects(Parent) 继续
  ├─ child = child.sibling  // Child2
  ├─ 调用 commitDeletionEffectsOnFiber(Child2)
  ↓

Step 8: commitDeletionEffectsOnFiber(Child2)
  ├─ 执行 Child2 的 componentWillUnmount 💀
  ├─ Child2 没有子节点
  ├─ 关键：删除 Child2 的 DOM ❌
  │  └─ removeChild(Parent.stateNode, Child2.stateNode)
  └─ 返回到 Step 7
     ↓

Step 9: 返回 Step 1
  ├─ 所有 Parent 的子节点处理完毕
  ├─ 关键：最后删除 Parent 的 DOM ❌
  │  └─ removeChild(container, Parent.stateNode)
  └─ 完成

═══════════════════════════════════════════════════════

总结顺序：

清理逻辑（componentWillUnmount）：
  1. Parent 💀
  2. Child1 💀
  3. GrandChild 💀
  4. Child2 💀

DOM 删除：
  1. GrandChild DOM ❌
  2. Child1 DOM ❌
  3. Child2 DOM ❌
  4. Parent DOM ❌

关键观察：
- 清理逻辑：父 → 子 → 孙（深度优先）
- DOM 删除：孙 → 子 → 父（后序遍历）
- 清理时 DOM 还在，删除 DOM 在最后`}
          </pre>
        </div>
      </div>

      {/* 第四部分：为什么这样设计 */}
      <div style={{ background: '#e8f5e9', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>🤔 为什么这样设计？</h2>
        
        <div style={{ background: '#fff', padding: '15px', borderRadius: '5px', marginBottom: '15px' }}>
          <h3>原因 1：清理逻辑可能需要访问 DOM</h3>
          <pre style={{ background: '#f5f5f5', padding: '10px', fontSize: '13px' }}>
{`useEffect(() => {
  const element = ref.current;
  const listener = (e) => { /* ... */ };
  element.addEventListener('click', listener);
  
  return () => {
    // cleanup 需要访问 DOM 来移除监听器
    element.removeEventListener('click', listener);  // ← 需要 DOM 存在
  };
});

如果先删除 DOM：
  - element 已经不在 DOM 树中
  - removeEventListener 可能失败
  - 可能导致内存泄漏

正确顺序（React 的做法）：
  1. 执行 cleanup（此时 DOM 还在）✅
  2. 删除 DOM ✅`}
          </pre>
        </div>

        <div style={{ background: '#fff', padding: '15px', borderRadius: '5px', marginBottom: '15px' }}>
          <h3>原因 2：子节点的清理可能依赖父节点的 DOM</h3>
          <pre style={{ background: '#f5f5f5', padding: '10px', fontSize: '13px' }}>
{`// 父组件
function Parent() {
  return (
    <div ref={parentRef}>
      <Child parentRef={parentRef} />
    </div>
  );
}

// 子组件
function Child({ parentRef }) {
  useEffect(() => {
    return () => {
      // cleanup 可能需要访问父节点的 DOM
      const parentNode = parentRef.current;
      // 做一些清理操作...
    };
  });
}

如果先删除父 DOM：
  - 子组件 cleanup 时父 DOM 已不存在
  - parentRef.current 可能为 null
  - 清理逻辑失败

正确顺序：
  1. 执行父的 cleanup ✅
  2. 执行子的 cleanup（父 DOM 还在）✅
  3. 删除子的 DOM ✅
  4. 删除父的 DOM ✅`}
          </pre>
        </div>

        <div style={{ background: '#fff', padding: '#15px', borderRadius: '5px' }}>
          <h3>原因 3：DOM 操作的正确性</h3>
          <pre style={{ background: '#f5f5f5', padding: '10px', fontSize: '13px' }}>
{`如果先删除父 DOM：
  <div id="parent">
    <div id="child">
      <div id="grandchild"></div>
    </div>
  </div>

错误做法：
  1. removeChild(container, parent)  // 删除父节点
  2. removeChild(parent, child)      // ❌ parent 已经不在 DOM 树中！
  3. removeChild(child, grandchild)  // ❌ child 也不在！

正确做法（React）：
  1. removeChild(child, grandchild)  // ✅ 先删除最深层
  2. removeChild(parent, child)      // ✅ 再删除子节点
  3. removeChild(container, parent)  // ✅ 最后删除父节点

或者（React 的优化）：
  1. removeChild(container, parent)  // ✅ 只删除父节点
     // 子节点自动被移除（浏览器行为）
  
但 React 仍需遍历子节点执行 cleanup！`}
          </pre>
        </div>
      </div>

      {/* 第五部分：交互演示 */}
      <div style={{ background: '#fce4ec', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>🎮 交互式演示</h2>
        
        <div style={{ marginBottom: '20px' }}>
          <button
            onClick={() => {
              console.clear();
              console.log('═══════════════════════════════════════');
              console.log('🔄 卸载组件树，观察删除顺序');
              console.log('═══════════════════════════════════════');
              setShowComponent(false);
            }}
            disabled={!showComponent}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              background: showComponent ? '#e91e63' : '#9e9e9e',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: showComponent ? 'pointer' : 'not-allowed',
              marginRight: '10px'
            }}
          >
            卸载组件（观察顺序）
          </button>
          
          <button
            onClick={() => {
              console.clear();
              console.log('═══════════════════════════════════════');
              console.log('🔄 重新挂载组件');
              console.log('═══════════════════════════════════════');
              setComponentId(componentId + 1);
              setShowComponent(true);
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
            重新挂载
          </button>
        </div>

        <div style={{ background: '#fff', padding: '15px', borderRadius: '5px', minHeight: '200px' }}>
          {showComponent ? (
            <ParentComponent id={componentId} />
          ) : (
            <p style={{ color: '#999', textAlign: 'center', padding: '50px' }}>
              组件已卸载，查看控制台输出
            </p>
          )}
        </div>

        <div style={{ background: '#fff9c4', padding: '15px', marginTop: '15px', borderRadius: '5px' }}>
          <h4>🔍 观察要点（查看控制台）：</h4>
          <ol>
            <li><strong>清理逻辑顺序：</strong>
              <ul>
                <li>Parent componentWillUnmount 先执行</li>
                <li>然后是 Child1 componentWillUnmount</li>
                <li>然后是 GrandChild componentWillUnmount</li>
                <li>最后是 Child2 componentWillUnmount</li>
              </ul>
            </li>
            <li><strong>DOM 节点状态：</strong>
              <ul>
                <li>清理时 ref.current 都不为 null</li>
                <li>证明 DOM 还没删除</li>
              </ul>
            </li>
            <li><strong>useEffect cleanup：</strong>
              <ul>
                <li>会在 useLayoutEffect cleanup 之后执行</li>
                <li>顺序也是父 → 子 → 孙</li>
              </ul>
            </li>
          </ol>
        </div>
      </div>

      {/* 第六部分：总结 */}
      <div style={{ background: '#e0f2f1', padding: '20px', borderRadius: '8px' }}>
        <h2>📝 总结</h2>
        
        <div style={{ background: '#fff', padding: '15px', borderRadius: '5px' }}>
          <h3>🎯 核心答案</h3>
          
          <h4>删除分为两个阶段：</h4>
          
          <div style={{ background: '#e8f5e9', padding: '10px', marginBottom: '10px' }}>
            <p><strong>阶段 1：执行清理逻辑（深度优先）</strong></p>
            <ul>
              <li>顺序：父 → 子 → 孙</li>
              <li>执行 componentWillUnmount</li>
              <li>执行 useLayoutEffect cleanup</li>
              <li>标记 useEffect cleanup（稍后执行）</li>
              <li>此时 DOM 还没删除</li>
            </ul>
          </div>

          <div style={{ background: '#ffebee', padding: '10px', marginBottom: '10px' }}>
            <p><strong>阶段 2：删除 DOM（后序遍历）</strong></p>
            <ul>
              <li>顺序：孙 → 子 → 父</li>
              <li>从最深层节点开始删除</li>
              <li>保证父节点最后删除</li>
            </ul>
          </div>

          <h4>为什么这样设计？</h4>
          
          <div style={{ background: '#e3f2fd', padding: '10px' }}>
            <ul>
              <li>✅ 清理逻辑可能需要访问 DOM</li>
              <li>✅ 子节点清理可能依赖父节点 DOM</li>
              <li>✅ 保证 DOM 操作的正确性</li>
              <li>✅ 避免内存泄漏</li>
            </ul>
          </div>

          <div style={{ background: '#fff9c4', padding: '15px', marginTop: '15px', borderRadius: '5px' }}>
            <h4>💡 记忆口诀：</h4>
            <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#1976d2' }}>
              清理从父到子<br/>
              深度优先走<br/>
              DOM 存在时<br/>
              执行全清理<br/>
              删除从子到父<br/>
              后序保安全
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
