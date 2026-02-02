import React, { useEffect, useState } from 'react';

/**
 * 验证 cleanup 和 sibling 的关系
 * 
 * 两种场景：
 * 1. 删除整个子树 - begin 阶段执行 destroy，complete 阶段访问 sibling
 * 2. 依赖变化 - 只执行当前组件的 cleanup
 */

function Child1() {
  console.log('🟢 Child1 render');
  
  useEffect(() => {
    console.log('✅ Child1 useEffect create');
    return () => {
      console.log('❌ Child1 useEffect cleanup');
    };
  }, []);
  
  return <div style={{ padding: '10px', background: '#e3f2fd' }}>子组件 1</div>;
}

function Child2() {
  console.log('🟢 Child2 render');
  
  useEffect(() => {
    console.log('✅ Child2 useEffect create');
    return () => {
      console.log('❌ Child2 useEffect cleanup');
    };
  }, []);
  
  return <div style={{ padding: '10px', background: '#fff3e0' }}>子组件 2</div>;
}

function Child3() {
  console.log('🟢 Child3 render');
  
  useEffect(() => {
    console.log('✅ Child3 useEffect create');
    return () => {
      console.log('❌ Child3 useEffect cleanup');
    };
  }, []);
  
  return <div style={{ padding: '10px', background: '#f3e5f5' }}>子组件 3</div>;
}

function Parent() {
  console.log('🟢 Parent render');
  
  useEffect(() => {
    console.log('✅ Parent useEffect create');
    return () => {
      console.log('❌ Parent useEffect cleanup');
    };
  }, []);
  
  return (
    <div style={{ padding: '20px', background: '#e8f5e9', margin: '10px 0' }}>
      <h3>父组件</h3>
      <div style={{ display: 'flex', gap: '10px' }}>
        <Child1 />
        <Child2 />
        <Child3 />
      </div>
    </div>
  );
}

function DependencyComponent({ count }) {
  console.log('🟢 DependencyComponent render, count:', count);
  
  useEffect(() => {
    console.log('✅ DependencyComponent effect, count:', count);
    return () => {
      console.log('❌ DependencyComponent cleanup, count:', count);
    };
  }, [count]); // 依赖变化会触发 cleanup
  
  return (
    <div style={{ padding: '20px', background: '#fff9c4', margin: '10px 0' }}>
      <p>依赖变化组件 - Count: {count}</p>
    </div>
  );
}

export default function CleanupSibling() {
  const [showParent, setShowParent] = useState(true);
  const [count, setCount] = useState(0);

  return (
    <div style={{ padding: '20px' }}>
      <h1>Cleanup 和 Sibling 节点的关系</h1>
      <p>打开控制台查看执行顺序</p>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>场景 1：删除整个子树（包含多个 sibling）</h2>
        <button 
          onClick={() => {
            console.log('\n🔴 === 开始卸载整个 Parent 子树 ===');
            setShowParent(!showParent);
          }}
          style={{ padding: '10px 20px', fontSize: '16px' }}
        >
          {showParent ? '删除 Parent 及其所有子组件' : '重新挂载 Parent'}
        </button>
        
        {showParent && <Parent />}
        
        <div style={{ 
          background: '#f5f5f5', 
          padding: '15px', 
          marginTop: '10px',
          borderRadius: '5px'
        }}>
          <h4>📝 观察点：</h4>
          <ul>
            <li>点击删除按钮，观察控制台输出</li>
            <li>Parent cleanup 先执行（父 → 子）</li>
            <li>Child1 → Child2 → Child3 cleanup 依次执行</li>
            <li>Child2、Child3 是在 complete 阶段通过 sibling 访问的</li>
          </ul>
          <pre style={{ background: '#fff', padding: '10px', overflow: 'auto' }}>
{`执行顺序：
❌ Parent cleanup           (begin 阶段)
  ↓ (向下找 child)
❌ Child1 cleanup           (begin 阶段)
  ↓ (无 child，进入 complete)
  ↓ (complete 阶段访问 sibling)
❌ Child2 cleanup           (begin 阶段，通过 sibling 访问)
  ↓ (complete 阶段访问 sibling)
❌ Child3 cleanup           (begin 阶段，通过 sibling 访问)
  ↓ (complete 回到 Parent)`}
          </pre>
        </div>
      </div>

      <hr style={{ margin: '30px 0' }} />

      <div>
        <h2>场景 2：依赖变化触发 cleanup（组件不删除）</h2>
        <button 
          onClick={() => {
            console.log('\n🟡 === 触发依赖变化 ===');
            setCount(count + 1);
          }}
          style={{ padding: '10px 20px', fontSize: '16px' }}
        >
          增加 Count（触发 cleanup）
        </button>
        
        <DependencyComponent count={count} />
        
        <div style={{ 
          background: '#f5f5f5', 
          padding: '15px', 
          marginTop: '10px',
          borderRadius: '5px'
        }}>
          <h4>📝 观察点：</h4>
          <ul>
            <li>点击按钮改变 count</li>
            <li>只有当前组件的 cleanup 执行</li>
            <li>不涉及删除子树，所以不需要遍历 sibling</li>
            <li>先 cleanup 旧 effect，再执行新 effect</li>
          </ul>
          <pre style={{ background: '#fff', padding: '10px', overflow: 'auto' }}>
{`执行顺序：
🟢 DependencyComponent render (新 count)
❌ DependencyComponent cleanup (旧 count)
✅ DependencyComponent effect (新 count)

说明：这种情况只处理单个组件，不需要遍历 sibling`}
          </pre>
        </div>
      </div>

      <hr style={{ margin: '30px 0' }} />

      <div style={{ background: '#e3f2fd', padding: '20px', borderRadius: '8px' }}>
        <h3>🎯 核心总结</h3>
        
        <h4>为什么 destroy 在 begin 阶段不访问 sibling？</h4>
        <ol>
          <li>
            <strong>删除子树场景：</strong>
            <ul>
              <li>begin 阶段：向下遍历，执行 destroy（父 → 子）</li>
              <li>complete 阶段：向上回溯时，才访问 sibling（兄弟节点）</li>
              <li>这样确保了父先清理，然后是所有子节点（包括兄弟）</li>
            </ul>
          </li>
          <li>
            <strong>设计原因：</strong>
            <ul>
              <li>保证父组件先 cleanup（父 → 子顺序）</li>
              <li>然后才处理同级的兄弟节点</li>
              <li>避免在父 cleanup 时，兄弟节点已经被销毁</li>
            </ul>
          </li>
          <li>
            <strong>遍历策略：</strong>
            <pre style={{ background: '#fff', padding: '10px', marginTop: '10px' }}>
{`树结构：
       Parent
      /   |   \\
  Child1 Child2 Child3

遍历顺序：
1. begin(Parent) → cleanup Parent
2. begin(Child1) → cleanup Child1
3. complete(Child1) → 发现 sibling
4. begin(Child2) → cleanup Child2
5. complete(Child2) → 发现 sibling
6. begin(Child3) → cleanup Child3
7. complete(Child3) → 回到 Parent

关键：sibling 是在 complete 阶段访问的！`}
            </pre>
          </li>
        </ol>

        <h4>源码证据：</h4>
        <pre style={{ background: '#fff', padding: '10px' }}>
{`// ReactFiberCommitWork.old.js

// begin 阶段 - 不访问 sibling
function commitPassiveUnmountEffectsInsideOfDeletedTree_begin() {
  const child = fiber.child;
  if (child !== null) {
    nextEffect = child;  // 只向下找 child
  } else {
    complete();  // 进入 complete
  }
}

// complete 阶段 - 这里才访问 sibling
function commitPassiveUnmountEffectsInsideOfDeletedTree_complete() {
  const sibling = fiber.sibling;
  if (sibling !== null) {
    nextEffect = sibling;  // 访问兄弟节点
    return;
  }
  nextEffect = fiber.return;  // 回到父节点
}`}
        </pre>
      </div>
    </div>
  );
}
