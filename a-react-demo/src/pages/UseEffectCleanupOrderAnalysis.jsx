import React, { useState, useEffect, useLayoutEffect } from 'react';

/**
 * useEffect cleanup 执行顺序深度解析
 * 
 * 核心问题：
 * 1. 为何 useEffect cleanup 是父到子的顺序？
 * 2. 与 useLayoutEffect cleanup 的区别？
 * 3. 源码层面的实现原理？
 */

// 父组件
function ParentComponent({ id }) {
  useEffect(() => {
    console.log(`🟢 [${id}] Parent useEffect mount`);
    return () => {
      console.log(`🔴 [${id}] Parent useEffect cleanup`);
    };
  }, [id]);
  
  useLayoutEffect(() => {
    console.log(`🔵 [${id}] Parent useLayoutEffect mount`);
    return () => {
      console.log(`🟠 [${id}] Parent useLayoutEffect cleanup`);
    };
  }, [id]);
  
  return (
    <div style={{ padding: '15px', background: '#e3f2fd', margin: '10px' }}>
      <h4>[{id}] Parent Component</h4>
      <ChildComponent id={id} />
      <ChildComponent2 id={id} />
    </div>
  );
}

// 子组件 1
function ChildComponent({ id }) {
  useEffect(() => {
    console.log(`  🟢 [${id}] Child1 useEffect mount`);
    return () => {
      console.log(`  🔴 [${id}] Child1 useEffect cleanup`);
    };
  }, [id]);
  
  useLayoutEffect(() => {
    console.log(`  🔵 [${id}] Child1 useLayoutEffect mount`);
    return () => {
      console.log(`  🟠 [${id}] Child1 useLayoutEffect cleanup`);
    };
  }, [id]);
  
  return (
    <div style={{ padding: '10px', background: '#c8e6c9', margin: '5px' }}>
      [{id}] Child 1
      <GrandChildComponent id={id} />
    </div>
  );
}

// 子组件 2
function ChildComponent2({ id }) {
  useEffect(() => {
    console.log(`  🟢 [${id}] Child2 useEffect mount`);
    return () => {
      console.log(`  🔴 [${id}] Child2 useEffect cleanup`);
    };
  }, [id]);
  
  useLayoutEffect(() => {
    console.log(`  🔵 [${id}] Child2 useLayoutEffect mount`);
    return () => {
      console.log(`  🟠 [${id}] Child2 useLayoutEffect cleanup`);
    };
  }, [id]);
  
  return (
    <div style={{ padding: '10px', background: '#fff9c4', margin: '5px' }}>
      [{id}] Child 2
    </div>
  );
}

// 孙子组件
function GrandChildComponent({ id }) {
  useEffect(() => {
    console.log(`    🟢 [${id}] GrandChild useEffect mount`);
    return () => {
      console.log(`    🔴 [${id}] GrandChild useEffect cleanup`);
    };
  }, [id]);
  
  useLayoutEffect(() => {
    console.log(`    🔵 [${id}] GrandChild useLayoutEffect mount`);
    return () => {
      console.log(`    🟠 [${id}] GrandChild useLayoutEffect cleanup`);
    };
  }, [id]);
  
  return (
    <div style={{ padding: '5px', background: '#ffccbc', margin: '5px' }}>
      [{id}] GrandChild
    </div>
  );
}

export default function UseEffectCleanupOrderAnalysis() {
  const [showComponent, setShowComponent] = useState(true);
  const [componentId, setComponentId] = useState(1);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>⚛️ useEffect Cleanup 执行顺序深度解析</h1>
      
      {/* 第一部分：核心答案 */}
      <div style={{ background: '#fff3e0', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>🎯 核心答案：useEffect cleanup 是父 → 子的顺序</h2>
        
        <div style={{ background: '#fff', padding: '15px', borderRadius: '5px', marginBottom: '15px' }}>
          <h3>✅ 完整的 cleanup 顺序：</h3>
          <pre style={{ background: '#f5f5f5', padding: '15px', overflow: 'auto', fontSize: '14px' }}>
{`删除/卸载组件树时的执行顺序：

1. useLayoutEffect cleanup（Mutation 阶段，同步）
   顺序：父 → 子 → 孙
   🟠 Parent useLayoutEffect cleanup
   🟠 Child1 useLayoutEffect cleanup  
   🟠 GrandChild useLayoutEffect cleanup
   🟠 Child2 useLayoutEffect cleanup

2. 浏览器绘制（DOM 更新到屏幕）

3. useEffect cleanup（Passive Effects 阶段，异步）
   顺序：父 → 子 → 孙
   🔴 Parent useEffect cleanup
   🔴 Child1 useEffect cleanup
   🔴 GrandChild useEffect cleanup
   🔴 Child2 useEffect cleanup

关键观察：
- 两者都是父 → 子的顺序
- 都是深度优先遍历
- useLayoutEffect 在 Mutation 阶段（同步）
- useEffect 在 Passive Effects 阶段（异步）`}
          </pre>
        </div>
      </div>

      {/* 第二部分：源码证据 */}
      <div style={{ background: '#e3f2fd', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>📂 源码级别的证据</h2>
        
        <div style={{ background: '#fff', padding: '15px', borderRadius: '5px', marginBottom: '15px' }}>
          <h3>1. 源码注释明确说明</h3>
          <pre style={{ background: '#f5f5f5', padding: '10px', overflow: 'auto', fontSize: '13px' }}>
{`// ReactFiberCommitWork.old.js (3109 行)

function commitPassiveUnmountEffectsInsideOfDeletedTree_begin(
  deletedSubtreeRoot: Fiber,
  nearestMountedAncestor: Fiber | null,
) {
  while (nextEffect !== null) {
    const fiber = nextEffect;

    // 关键注释！
    // Deletion effects fire in parent -> child order
    // 
    // 翻译：删除 effects 按照 父 → 子 的顺序执行
    
    setCurrentDebugFiberInDEV(fiber);
    commitPassiveUnmountInsideDeletedTreeOnFiber(fiber, nearestMountedAncestor);
    resetCurrentDebugFiberInDEV();

    const child = fiber.child;
    if (child !== null) {
      child.return = fiber;
      nextEffect = child;  // 向下遍历到子节点
    } else {
      commitPassiveUnmountEffectsInsideOfDeletedTree_complete(
        deletedSubtreeRoot,
      );
    }
  }
}

源码注释清楚地说明：
"Deletion effects fire in parent -> child order"
删除 effects 按照父 → 子的顺序执行！`}
          </pre>
        </div>

        <div style={{ background: '#fff', padding: '15px', borderRadius: '5px', marginBottom: '15px' }}>
          <h3>2. 具体的遍历实现</h3>
          <pre style={{ background: '#f5f5f5', padding: '10px', overflow: 'auto', fontSize: '13px' }}>
{`遍历顺序分析：

Step 1: 当前节点 = Parent
  ├─ commitPassiveUnmountInsideDeletedTreeOnFiber(Parent)
  │  └─ 执行 Parent 的 useEffect cleanup 🔴
  │
  └─ child = Parent.child (Child1)
     └─ nextEffect = Child1  // 向下到子节点

Step 2: 当前节点 = Child1
  ├─ commitPassiveUnmountInsideDeletedTreeOnFiber(Child1)
  │  └─ 执行 Child1 的 useEffect cleanup 🔴
  │
  └─ child = Child1.child (GrandChild)
     └─ nextEffect = GrandChild  // 继续向下

Step 3: 当前节点 = GrandChild
  ├─ commitPassiveUnmountInsideDeletedTreeOnFiber(GrandChild)
  │  └─ 执行 GrandChild 的 useEffect cleanup 🔴
  │
  └─ child = GrandChild.child (null)
     └─ 进入 complete 阶段

Step 4: complete 阶段（处理兄弟节点）
  └─ 回到 Child1 的兄弟节点 Child2

Step 5: 当前节点 = Child2
  ├─ commitPassiveUnmountInsideDeletedTreeOnFiber(Child2)
  │  └─ 执行 Child2 的 useEffect cleanup 🔴
  │
  └─ ...

结果顺序：
  Parent → Child1 → GrandChild → Child2

关键实现：
1. 先访问当前节点（执行 cleanup）
2. 再递归到子节点（child）
3. 这就是深度优先，先序遍历
4. 父节点必然先于子节点被访问`}
          </pre>
        </div>

        <div style={{ background: '#fff', padding: '15px', borderRadius: '5px' }}>
          <h3>3. commitPassiveUnmountOnFiber - 执行 cleanup</h3>
          <pre style={{ background: '#f5f5f5', padding: '10px', overflow: 'auto', fontSize: '13px' }}>
{`// ReactFiberCommitWork.old.js (3073 行)

function commitPassiveUnmountOnFiber(finishedWork: Fiber): void {
  switch (finishedWork.tag) {
    case FunctionComponent:
    case ForwardRef:
    case SimpleMemoComponent: {
      // 执行当前组件的 useEffect cleanup
      commitHookEffectListUnmount(
        HookPassive | HookHasEffect,  // Passive = useEffect
        finishedWork,
        finishedWork.return,
      );
      break;
    }
  }
}

function commitHookEffectListUnmount(
  flags: HookFlags,
  finishedWork: Fiber,
  nearestMountedAncestor: Fiber | null,
) {
  const updateQueue = finishedWork.updateQueue;
  const lastEffect = updateQueue !== null ? updateQueue.lastEffect : null;
  
  if (lastEffect !== null) {
    const firstEffect = lastEffect.next;
    let effect = firstEffect;
    
    // 遍历所有 effect
    do {
      if ((effect.tag & flags) === flags) {
        // 执行 cleanup 函数
        const destroy = effect.destroy;
        effect.destroy = undefined;
        
        if (destroy !== undefined) {
          safelyCallDestroy(finishedWork, nearestMountedAncestor, destroy);
        }
      }
      effect = effect.next;
    } while (effect !== firstEffect);
  }
}

流程：
1. commitPassiveUnmountOnFiber 被调用
2. 检查组件类型（FunctionComponent）
3. 调用 commitHookEffectListUnmount
4. 遍历并执行所有 useEffect 的 cleanup
5. 在遍历到子节点时，子节点的 cleanup 才会被执行`}
          </pre>
        </div>
      </div>

      {/* 第三部分：为什么是父到子 */}
      <div style={{ background: '#e8f5e9', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>🤔 为什么 useEffect cleanup 是父 → 子？</h2>
        
        <div style={{ background: '#fff', padding: '15px', borderRadius: '5px', marginBottom: '15px' }}>
          <h3>原因 1：与删除过程保持一致</h3>
          <pre style={{ background: '#f5f5f5', padding: '10px', fontSize: '13px' }}>
{`删除组件树的整体流程：

Mutation 阶段（同步）：
  1. useLayoutEffect cleanup（父 → 子）
  2. componentWillUnmount（父 → 子）
  3. 删除 DOM（子 → 父）

Passive Effects 阶段（异步）：
  4. useEffect cleanup（父 → 子）

为什么保持一致？
- 清理逻辑应该按照组件层级顺序
- 父组件的清理可能依赖子组件还未清理
- 保持可预测性和一致性`}
          </pre>
        </div>

        <div style={{ background: '#fff', padding: '15px', borderRadius: '5px', marginBottom: '15px' }}>
          <h3>原因 2：遍历方式决定</h3>
          <pre style={{ background: '#f5f5f5', padding: '10px', fontSize: '13px' }}>
{`深度优先，先序遍历：

    Parent
   /      \\
Child1   Child2
  |
GrandChild

遍历顺序：
1. 访问 Parent（执行 Parent cleanup）
2. 访问 Parent.child（向下）
3. 访问 Child1（执行 Child1 cleanup）
4. 访问 Child1.child（向下）
5. 访问 GrandChild（执行 GrandChild cleanup）
6. GrandChild 没有子节点（回溯）
7. 访问 Child1.sibling（横向）
8. 访问 Child2（执行 Child2 cleanup）

特点：
- 先序遍历：先访问父节点，再访问子节点
- 深度优先：先深入到最底层，再处理兄弟节点
- 结果：父节点的 cleanup 必然先于子节点执行`}
          </pre>
        </div>

        <div style={{ background: '#fff', padding: '15px', borderRadius: '5px' }}>
          <h3>原因 3：语义正确性</h3>
          <pre style={{ background: '#f5f5f5', padding: '10px', fontSize: '13px' }}>
{`场景示例：

function Parent() {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    // 设置一些全局状态或 context
    window.parentData = data;
    
    return () => {
      // 父组件清理
      console.log('Parent cleanup');
      window.parentData = null;
    };
  }, [data]);
  
  return <Child />;
}

function Child() {
  useEffect(() => {
    return () => {
      // 子组件清理可能依赖父组件的状态
      console.log('Child cleanup');
      console.log(window.parentData);  // 可能需要访问父组件的数据
    };
  }, []);
}

如果子组件先清理：
  1. Child cleanup 执行
  2. 尝试访问 window.parentData  ✅ 还存在
  3. Parent cleanup 执行
  4. window.parentData = null

如果父组件先清理：
  1. Parent cleanup 执行
  2. window.parentData = null
  3. Child cleanup 执行
  4. 尝试访问 window.parentData  ❌ 已经为 null

结论：
两种顺序各有适用场景，React 选择了父 → 子
这是一个设计决策，保持了与其他清理操作的一致性`}
          </pre>
        </div>
      </div>

      {/* 第四部分：对比其他 cleanup */}
      <div style={{ background: '#fce4ec', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>📊 不同 Cleanup 的执行顺序对比</h2>
        
        <div style={{ background: '#fff', padding: '15px', borderRadius: '5px' }}>
          <h3>完整的 Cleanup 顺序表</h3>
          <pre style={{ background: '#f5f5f5', padding: '10px', overflow: 'auto', fontSize: '13px' }}>
{`┌─────────────────────────────────────────────────────────┐
│  类型                     │  执行阶段      │  顺序        │
├─────────────────────────────────────────────────────────┤
│  useLayoutEffect cleanup │  Mutation      │  父 → 子     │
│  componentWillUnmount    │  Mutation      │  父 → 子     │
│  useEffect cleanup       │  Passive       │  父 → 子     │
│  DOM 删除                │  Mutation      │  子 → 父     │
└─────────────────────────────────────────────────────────┘

完整的卸载流程：

Render 阶段：
  - 标记要删除的节点

Commit 阶段 - Before Mutation：
  - 准备工作

Commit 阶段 - Mutation（同步，阻塞浏览器）：
  1. useLayoutEffect cleanup（父 → 子 → 孙）
  2. componentWillUnmount（父 → 子 → 孙）
  3. 删除 DOM（孙 → 子 → 父）

浏览器绘制：
  - 用户看到更新

Commit 阶段 - Passive Effects（异步，不阻塞）：
  4. useEffect cleanup（父 → 子 → 孙）

关键区别：
═══════════════════════════════════════════════

useLayoutEffect cleanup vs useEffect cleanup：
  
相同点：
  ✅ 都是父 → 子的顺序
  ✅ 都是深度优先遍历
  
不同点：
  ❌ 执行阶段不同
     - useLayoutEffect: Mutation 阶段（同步）
     - useEffect: Passive Effects 阶段（异步）
  
  ❌ 阻塞性不同
     - useLayoutEffect: 阻塞浏览器绘制
     - useEffect: 不阻塞浏览器绘制
  
  ❌ 时机不同
     - useLayoutEffect: DOM 更新后立即执行
     - useEffect: DOM 更新并绘制到屏幕后执行`}
          </pre>
        </div>
      </div>

      {/* 第五部分：交互演示 */}
      <div style={{ background: '#f3e5f5', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>🎮 交互式演示</h2>
        
        <div style={{ marginBottom: '20px' }}>
          <button
            onClick={() => {
              console.clear();
              console.log('═══════════════════════════════════════');
              console.log('🔄 卸载组件树');
              console.log('观察 cleanup 执行顺序！');
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
            <li><strong>useLayoutEffect cleanup 顺序：</strong>
              <ul>
                <li>🟠 Parent → Child1 → GrandChild → Child2</li>
                <li>在 Mutation 阶段执行</li>
                <li>阻塞浏览器绘制</li>
              </ul>
            </li>
            <li><strong>useEffect cleanup 顺序：</strong>
              <ul>
                <li>🔴 Parent → Child1 → GrandChild → Child2</li>
                <li>在 Passive Effects 阶段执行</li>
                <li>不阻塞浏览器绘制</li>
                <li>与 useLayoutEffect cleanup 顺序相同！</li>
              </ul>
            </li>
            <li><strong>两者的时机差异：</strong>
              <ul>
                <li>useLayoutEffect cleanup 先执行</li>
                <li>然后浏览器绘制</li>
                <li>最后 useEffect cleanup 执行</li>
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
          
          <h4>useEffect cleanup 是父 → 子的顺序</h4>
          
          <div style={{ background: '#e3f2fd', padding: '10px', marginBottom: '10px' }}>
            <p><strong>源码证据：</strong></p>
            <p style={{ fontFamily: 'monospace', background: '#f5f5f5', padding: '10px' }}>
              "Deletion effects fire in parent -&gt; child order"<br/>
              — ReactFiberCommitWork.old.js, line 3109
            </p>
          </div>

          <h4>为什么是父 → 子？</h4>
          
          <div style={{ background: '#fff9c4', padding: '10px', marginBottom: '10px' }}>
            <ul>
              <li><strong>遍历方式：</strong>深度优先，先序遍历</li>
              <li><strong>一致性：</strong>与其他 cleanup 保持一致</li>
              <li><strong>实现：</strong>先访问父节点，再递归子节点</li>
            </ul>
          </div>

          <h4>与 useLayoutEffect 的关系</h4>
          
          <div style={{ background: '#e8f5e9', padding: '10px' }}>
            <ul>
              <li>✅ <strong>顺序相同：</strong>都是父 → 子</li>
              <li>❌ <strong>执行阶段不同：</strong>
                <ul>
                  <li>useLayoutEffect: Mutation 阶段（同步）</li>
                  <li>useEffect: Passive Effects 阶段（异步）</li>
                </ul>
              </li>
              <li>❌ <strong>阻塞性不同：</strong>
                <ul>
                  <li>useLayoutEffect: 阻塞浏览器绘制</li>
                  <li>useEffect: 不阻塞浏览器绘制</li>
                </ul>
              </li>
            </ul>
          </div>

          <div style={{ background: '#fff9c4', padding: '15px', marginTop: '15px', borderRadius: '5px' }}>
            <h4>💡 记忆口诀：</h4>
            <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#1976d2' }}>
              Layout 和 Effect<br/>
              cleanup 都一样<br/>
              父先子后顺序<br/>
              深度优先走<br/>
              时机有不同<br/>
              阶段分 Mutation 和 Passive
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
