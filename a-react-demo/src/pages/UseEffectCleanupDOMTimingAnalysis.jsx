import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';

/**
 * useEffect cleanup 与 DOM 卸载时机深度解析
 * 
 * 核心问题：
 * useEffect cleanup 是在 DOM 卸载前执行，还是卸载后执行？
 * 
 * 答案：在 DOM 卸载后执行！
 */

// 测试组件
function TestComponent({ id }) {
  const domRef = useRef(null);
  
  useLayoutEffect(() => {
    console.log(`🔵 [${id}] useLayoutEffect mount`);
    console.log(`   - DOM 节点存在: ${domRef.current !== null}`);
    console.log(`   - DOM 在页面中: ${document.body.contains(domRef.current)}`);
    
    return () => {
      console.log(`🟠 [${id}] useLayoutEffect cleanup`);
      console.log(`   - domRef.current: ${domRef.current}`);
      console.log(`   - DOM 还在 body 中: ${domRef.current ? document.body.contains(domRef.current) : 'ref 已为 null'}`);
      
      // 尝试访问 DOM
      if (domRef.current) {
        console.log(`   - DOM innerText: "${domRef.current.innerText}"`);
        console.log(`   - ✅ useLayoutEffect cleanup 时 DOM 还在！`);
      } else {
        console.log(`   - ❌ useLayoutEffect cleanup 时 DOM ref 为 null`);
      }
    };
  }, [id]);
  
  useEffect(() => {
    console.log(`🟢 [${id}] useEffect mount`);
    console.log(`   - DOM 节点存在: ${domRef.current !== null}`);
    console.log(`   - DOM 在页面中: ${document.body.contains(domRef.current)}`);
    
    return () => {
      console.log(`🔴 [${id}] useEffect cleanup`);
      console.log(`   - domRef.current: ${domRef.current}`);
      console.log(`   - DOM 还在 body 中: ${domRef.current ? document.body.contains(domRef.current) : 'ref 已为 null'}`);
      
      // 尝试访问 DOM
      if (domRef.current) {
        console.log(`   - DOM innerText: "${domRef.current.innerText}"`);
        console.log(`   - ✅ useEffect cleanup 时 DOM 还在！（意外？）`);
      } else {
        console.log(`   - ❌ useEffect cleanup 时 DOM 已被删除或 ref 为 null`);
      }
    };
  }, [id]);
  
  return (
    <div 
      ref={domRef}
      style={{ 
        padding: '20px', 
        background: '#e3f2fd', 
        margin: '10px',
        border: '2px solid #1976d2'
      }}
    >
      <h3>[{id}] Test Component</h3>
      <p>这是一个测试 DOM 节点</p>
    </div>
  );
}

// 父子组件测试
function ParentComponent({ id }) {
  const domRef = useRef(null);
  
  useLayoutEffect(() => {
    return () => {
      console.log(`🟠 [Parent-${id}] useLayoutEffect cleanup`);
      console.log(`   - Parent domRef.current: ${domRef.current}`);
      console.log(`   - Parent DOM 在 body 中: ${domRef.current ? document.body.contains(domRef.current) : 'null'}`);
    };
  }, [id]);
  
  useEffect(() => {
    return () => {
      console.log(`🔴 [Parent-${id}] useEffect cleanup`);
      console.log(`   - Parent domRef.current: ${domRef.current}`);
      console.log(`   - Parent DOM 在 body 中: ${domRef.current ? document.body.contains(domRef.current) : 'null'}`);
    };
  }, [id]);
  
  return (
    <div ref={domRef} style={{ padding: '15px', background: '#fff9c4', margin: '10px' }}>
      <h4>[Parent-{id}]</h4>
      <ChildComponent id={id} />
    </div>
  );
}

function ChildComponent({ id }) {
  const domRef = useRef(null);
  
  useLayoutEffect(() => {
    return () => {
      console.log(`  🟠 [Child-${id}] useLayoutEffect cleanup`);
      console.log(`     - Child domRef.current: ${domRef.current}`);
      console.log(`     - Child DOM 在 body 中: ${domRef.current ? document.body.contains(domRef.current) : 'null'}`);
    };
  }, [id]);
  
  useEffect(() => {
    return () => {
      console.log(`  🔴 [Child-${id}] useEffect cleanup`);
      console.log(`     - Child domRef.current: ${domRef.current}`);
      console.log(`     - Child DOM 在 body 中: ${domRef.current ? document.body.contains(domRef.current) : 'null'}`);
    };
  }, [id]);
  
  return (
    <div ref={domRef} style={{ padding: '10px', background: '#c8e6c9', margin: '5px' }}>
      [Child-{id}]
    </div>
  );
}

export default function UseEffectCleanupDOMTimingAnalysis() {
  const [showSimple, setShowSimple] = useState(true);
  const [showParent, setShowParent] = useState(true);
  const [simpleId, setSimpleId] = useState(1);
  const [parentId, setParentId] = useState(1);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>⚛️ useEffect Cleanup 与 DOM 卸载时机分析</h1>
      
      {/* 核心答案 */}
      <div style={{ background: '#fff3e0', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>🎯 核心答案</h2>
        
        <div style={{ background: '#fff', padding: '15px', borderRadius: '5px', marginBottom: '15px' }}>
          <h3 style={{ color: '#d32f2f' }}>useEffect cleanup 在 DOM 卸载后执行！</h3>
          
          <div style={{ background: '#ffebee', padding: '15px', borderRadius: '5px', marginBottom: '10px' }}>
            <h4>完整的执行顺序：</h4>
            <pre style={{ background: '#fff', padding: '10px', fontSize: '14px', lineHeight: '1.8' }}>
{`Commit 阶段 - Mutation 子阶段（同步）：
  1. 🟠 useLayoutEffect cleanup 执行
     └─ 此时 DOM 还在！✅
     └─ domRef.current !== null ✅
     └─ document.body.contains(domRef.current) === true ✅
  
  2. ❌ DOM 从页面中删除
     └─ removeChild(domNode)
     └─ 实际的 DOM 操作

  3. root.current = finishedWork
     └─ 切换 Fiber 树

Commit 阶段 - Layout 子阶段（同步）：
  4. 🔵 useLayoutEffect create 执行
     └─ componentDidMount/Update

  5. requestPaint()
     └─ 告诉浏览器可以绘制了

浏览器绘制（异步）：
  6. 🎨 浏览器更新屏幕
     └─ 用户看到 DOM 已消失

Commit 阶段 - Passive Effects 子阶段（异步）：
  7. 🔴 useEffect cleanup 执行
     └─ 此时 DOM 已经被删除！❌
     └─ domRef.current 可能为 null ❌
     └─ 即使 domRef.current 不为 null，DOM 也不在页面中了 ❌

  8. 🟢 useEffect create 执行

关键观察：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
useLayoutEffect cleanup: DOM 还在 ✅
DOM 删除:                DOM 被移除 ❌
useEffect cleanup:       DOM 已删除 ❌
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`}
            </pre>
          </div>
        </div>
      </div>

      {/* 源码证据 */}
      <div style={{ background: '#e3f2fd', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>📂 源码证据</h2>
        
        <div style={{ background: '#fff', padding: '15px', borderRadius: '5px', marginBottom: '15px' }}>
          <h3>commitRootImpl - Commit 阶段的执行顺序</h3>
          <pre style={{ background: '#f5f5f5', padding: '10px', overflow: 'auto', fontSize: '13px' }}>
{`// ReactFiberWorkLoop.old.js (2100-2300 行)

function commitRootImpl(root, ...) {
  // ... 前置工作 ...

  // ═══════════════════════════════════════
  // Before Mutation 阶段
  // ═══════════════════════════════════════
  commitBeforeMutationEffects(root, finishedWork);
  
  // ═══════════════════════════════════════
  // Mutation 阶段（关键！）
  // ═══════════════════════════════════════
  // 在这个阶段：
  // 1. useLayoutEffect cleanup 执行
  // 2. DOM 被删除
  commitMutationEffects(root, finishedWork, lanes);
  
  // DOM 已经被删除了！
  
  // 切换 Fiber 树
  root.current = finishedWork;
  
  // ═══════════════════════════════════════
  // Layout 阶段
  // ═══════════════════════════════════════
  commitLayoutEffects(finishedWork, root, lanes);
  
  // 告诉浏览器可以绘制了
  requestPaint();
  
  // ... 后续工作 ...
  
  // ═══════════════════════════════════════
  // Passive Effects 阶段（异步，在后续调度）
  // ═══════════════════════════════════════
  if (rootDoesHavePassiveEffects) {
    // 存储 passive effects，等待后续调度
    rootWithPendingPassiveEffects = root;
    pendingPassiveEffectsLanes = lanes;
  }
  
  // ... 调度下一次工作 ...
  ensureRootIsScheduled(root, now());
  
  // ... passive effects 会在稍后异步执行 ...
  // 到那时，DOM 已经被删除了！
}

关键时间线：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

时刻 1: commitMutationEffects 开始
  ├─ useLayoutEffect cleanup（DOM 还在）
  └─ DOM 删除

时刻 2: commitMutationEffects 结束
  └─ DOM 已经不在页面中了

时刻 3: commitLayoutEffects
  └─ useLayoutEffect create

时刻 4: requestPaint()
  └─ 告诉浏览器渲染

时刻 5: 浏览器绘制
  └─ 用户看到 DOM 消失

时刻 6: flushPassiveEffects（异步调度）
  ├─ useEffect cleanup（DOM 早就删除了）
  └─ useEffect create

结论：
useEffect cleanup 在 DOM 删除之后执行！`}
          </pre>
        </div>

        <div style={{ background: '#fff', padding: '15px', borderRadius: '5px' }}>
          <h3>commitMutationEffects - DOM 删除的具体位置</h3>
          <pre style={{ background: '#f5f5f5', padding: '10px', overflow: 'auto', fontSize: '13px' }}>
{`// ReactFiberCommitWork.old.js

function commitMutationEffectsOnFiber(finishedWork, root, lanes) {
  // ...
  
  switch (finishedWork.tag) {
    case FunctionComponent:
    case ForwardRef:
    case SimpleMemoComponent: {
      // Step 1: 先执行 useLayoutEffect cleanup
      commitHookEffectListUnmount(
        HookLayout | HookHasEffect,  // Layout Effect
        finishedWork,
        finishedWork.return,
      );
      // 此时 DOM 还在！
      
      // Step 2: 递归处理子节点
      recursivelyTraverseMutationEffects(root, finishedWork, lanes);
      
      // Step 3: 提交工作（包括删除 DOM）
      commitReconciliationEffects(finishedWork);
      // DOM 在这里被删除！
      
      return;
    }
    
    case HostComponent: {
      // Step 1: 递归处理子节点
      recursivelyTraverseMutationEffects(root, finishedWork, lanes);
      
      // Step 2: 提交工作（更新 DOM）
      commitReconciliationEffects(finishedWork);
      
      return;
    }
  }
}

function commitReconciliationEffects(finishedWork: Fiber) {
  const flags = finishedWork.flags;
  
  if (flags & Placement) {
    // 插入/移动 DOM
    commitPlacement(finishedWork);
    finishedWork.flags &= ~Placement;
  }
  
  if (flags & ChildDeletion) {
    // 删除 DOM - 关键步骤！
    const deletions = finishedWork.deletions;
    if (deletions !== null) {
      for (let i = 0; i < deletions.length; i++) {
        const childToDelete = deletions[i];
        
        // 删除子树
        commitDeletionEffects(root, finishedWork, childToDelete);
        
        // 这里会调用 removeChild(parent, child)
        // DOM 被真正删除！
      }
    }
  }
}

时间线：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. commitMutationEffectsOnFiber(Parent)
   ├─ commitHookEffectListUnmount(HookLayout)  // Parent useLayoutEffect cleanup
   ├─ recursivelyTraverseMutationEffects
   │  └─ commitMutationEffectsOnFiber(Child)
   │     ├─ commitHookEffectListUnmount(HookLayout)  // Child useLayoutEffect cleanup
   │     └─ ...
   └─ commitReconciliationEffects
      └─ commitDeletionEffects
         └─ removeChild(parent, parentDOM)  // 🔥 DOM 在这里被删除！

2. ... Layout 阶段 ...

3. ... 浏览器绘制 ...

4. flushPassiveEffects  // 异步执行
   └─ commitPassiveUnmountEffects
      └─ commitHookEffectListUnmount(HookPassive)  // useEffect cleanup
         └─ DOM 已经不存在了！❌

结论：
useLayoutEffect cleanup → DOM 还在 ✅
DOM 删除 → removeChild
useEffect cleanup → DOM 已删除 ❌`}
          </pre>
        </div>
      </div>

      {/* 为什么这样设计 */}
      <div style={{ background: '#e8f5e9', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>🤔 为什么 useEffect cleanup 在 DOM 删除后执行？</h2>
        
        <div style={{ background: '#fff', padding: '15px', borderRadius: '5px', marginBottom: '15px' }}>
          <h3>原因 1：性能优化 - 不阻塞浏览器</h3>
          <pre style={{ background: '#f5f5f5', padding: '10px', fontSize: '13px' }}>
{`useEffect 设计目标：不阻塞浏览器绘制

时间线对比：

┌─────────────────────────────────────────────────────┐
│  如果 useEffect cleanup 在 DOM 删除前执行（假设）   │
└─────────────────────────────────────────────────────┘

JS 执行（阻塞）：
  ├─ useLayoutEffect cleanup
  ├─ useEffect cleanup  ← 如果在这里执行
  ├─ DOM 删除
  └─ useLayoutEffect create
  
浏览器绘制：
  └─ 用户看到更新（延迟！）

问题：
- useEffect cleanup 可能很慢（网络请求清理等）
- 阻塞了浏览器绘制
- 用户体验差

┌─────────────────────────────────────────────────────┐
│  实际设计：useEffect cleanup 在 DOM 删除后异步执行  │
└─────────────────────────────────────────────────────┘

JS 执行（阻塞，但快）：
  ├─ useLayoutEffect cleanup
  ├─ DOM 删除
  └─ useLayoutEffect create
  
浏览器绘制（快！）：
  └─ 用户看到更新（无延迟！）✅

稍后，JS 执行（异步，不阻塞）：
  ├─ useEffect cleanup  ← 在这里执行
  └─ useEffect create

优势：
✅ DOM 更新快速显示给用户
✅ useEffect cleanup 不阻塞渲染
✅ 性能更好
✅ 用户体验更佳`}
          </pre>
        </div>

        <div style={{ background: '#fff', padding: '15px', borderRadius: '5px', marginBottom: '15px' }}>
          <h3>原因 2：语义正确 - useEffect 用于副作用</h3>
          <pre style={{ background: '#f5f5f5', padding: '10px', fontSize: '13px' }}>
{`useEffect vs useLayoutEffect 的语义区别：

useLayoutEffect:
  ✅ 需要读取 DOM 布局
  ✅ 需要同步修改 DOM
  ✅ 必须在浏览器绘制前执行
  ✅ cleanup 需要访问 DOM
  例如：测量元素尺寸、动画、焦点管理

useEffect:
  ✅ 网络请求
  ✅ 订阅
  ✅ 日志记录
  ✅ 定时器
  ✅ 不需要访问 DOM 的清理
  例如：清理订阅、取消网络请求、清除定时器

useEffect cleanup 场景：

function Component() {
  useEffect(() => {
    // 订阅
    const subscription = api.subscribe();
    
    // 定时器
    const timer = setInterval(() => {
      console.log('tick');
    }, 1000);
    
    return () => {
      // cleanup 清理副作用
      subscription.unsubscribe();  // 不需要 DOM
      clearInterval(timer);        // 不需要 DOM
      
      // 这些操作不依赖 DOM！
      // 所以在 DOM 删除后执行也没问题
    };
  }, []);
}

结论：
- useEffect cleanup 通常不需要访问 DOM
- 它主要用于清理非 DOM 相关的副作用
- 所以在 DOM 删除后执行是合理的`}
          </pre>
        </div>

        <div style={{ background: '#fff', padding: '15px', borderRadius: '5px' }}>
          <h3>原因 3：React 的架构设计</h3>
          <pre style={{ background: '#f5f5f5', padding: '10px', fontSize: '13px' }}>
{`React 的阶段划分：

Mutation 阶段（同步，阻塞）：
  ├─ 执行所有同步的、关键的工作
  ├─ useLayoutEffect cleanup（需要 DOM）
  ├─ DOM 操作（增删改）
  └─ useLayoutEffect create（需要 DOM）

Passive Effects 阶段（异步，不阻塞）：
  ├─ 执行所有异步的、非关键的工作
  ├─ useEffect cleanup（不需要 DOM）
  └─ useEffect create（不需要 DOM）

设计原则：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. 关键工作同步执行，保证正确性
2. 非关键工作异步执行，优化性能
3. 清晰的阶段划分，易于理解和维护
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

如果 useEffect cleanup 在 DOM 删除前执行：
  ❌ 破坏了阶段的清晰划分
  ❌ useEffect 不再是纯异步
  ❌ 性能优化受影响
  ❌ 违背了 useEffect 的设计初衷

实际设计（useEffect cleanup 在 DOM 删除后）：
  ✅ 保持阶段划分清晰
  ✅ useEffect 完全异步
  ✅ 性能优化最大化
  ✅ 符合设计初衷`}
          </pre>
        </div>
      </div>

      {/* 实际影响 */}
      <div style={{ background: '#fce4ec', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>⚠️ 实际编码中的影响</h2>
        
        <div style={{ background: '#fff', padding: '15px', borderRadius: '5px', marginBottom: '15px' }}>
          <h3>陷阱 1：在 useEffect cleanup 中访问 DOM</h3>
          <pre style={{ background: '#f5f5f5', padding: '10px', fontSize: '13px' }}>
{`❌ 错误示例：

function Component() {
  const divRef = useRef(null);
  
  useEffect(() => {
    return () => {
      // 尝试访问 DOM
      console.log(divRef.current);  // 可能为 null！
      
      // 尝试操作 DOM
      if (divRef.current) {
        divRef.current.style.color = 'red';  // 可能无效！
        // DOM 可能已经不在页面中了
      }
    };
  }, []);
  
  return <div ref={divRef}>Hello</div>;
}

问题：
- useEffect cleanup 时 DOM 可能已被删除
- divRef.current 可能为 null
- 即使不为 null，DOM 也不在页面中了

✅ 正确做法 1：使用 useLayoutEffect

function Component() {
  const divRef = useRef(null);
  
  useLayoutEffect(() => {
    return () => {
      // useLayoutEffect cleanup 时 DOM 还在
      console.log(divRef.current);  // ✅ 一定有值
      divRef.current.style.color = 'red';  // ✅ 生效
    };
  }, []);
  
  return <div ref={divRef}>Hello</div>;
}

✅ 正确做法 2：不在 cleanup 中访问 DOM

function Component() {
  useEffect(() => {
    // 订阅
    const subscription = api.subscribe();
    
    return () => {
      // cleanup 只清理副作用，不访问 DOM
      subscription.unsubscribe();  // ✅ 正确
    };
  }, []);
  
  return <div>Hello</div>;
}`}
          </pre>
        </div>

        <div style={{ background: '#fff', padding: '15px', borderRadius: '5px' }}>
          <h3>正确的使用场景</h3>
          <pre style={{ background: '#f5f5f5', padding: '10px', fontSize: '13px' }}>
{`useLayoutEffect cleanup（DOM 还在）：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ 测量 DOM 尺寸
useLayoutEffect(() => {
  const rect = divRef.current.getBoundingClientRect();
  
  return () => {
    const finalRect = divRef.current.getBoundingClientRect();
    console.log('size changed:', rect, finalRect);
  };
}, []);

✅ 操作 DOM 样式
useLayoutEffect(() => {
  return () => {
    divRef.current.style.opacity = '0';
    // 在 DOM 删除前添加淡出效果
  };
}, []);

✅ 清理 DOM 事件监听
useLayoutEffect(() => {
  const handler = () => console.log('click');
  divRef.current.addEventListener('click', handler);
  
  return () => {
    divRef.current.removeEventListener('click', handler);
  };
}, []);

useEffect cleanup（DOM 已删除）：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ 取消网络请求
useEffect(() => {
  const controller = new AbortController();
  fetch('/api', { signal: controller.signal });
  
  return () => {
    controller.abort();  // 不需要 DOM
  };
}, []);

✅ 清理订阅
useEffect(() => {
  const subscription = store.subscribe(() => {});
  
  return () => {
    subscription.unsubscribe();  // 不需要 DOM
  };
}, []);

✅ 清除定时器
useEffect(() => {
  const timer = setInterval(() => {}, 1000);
  
  return () => {
    clearInterval(timer);  // 不需要 DOM
  };
}, []);

✅ 清理全局状态
useEffect(() => {
  window.myData = data;
  
  return () => {
    delete window.myData;  // 不需要 DOM
  };
}, [data]);`}
          </pre>
        </div>
      </div>

      {/* 交互演示 */}
      <div style={{ background: '#f3e5f5', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <h2>🎮 交互式演示</h2>
        
        {/* 简单示例 */}
        <div style={{ marginBottom: '30px' }}>
          <h3>示例 1：单个组件</h3>
          <div style={{ marginBottom: '15px' }}>
            <button
              onClick={() => {
                console.clear();
                console.log('═══════════════════════════════════════');
                console.log('🔴 卸载组件，观察 DOM 状态');
                console.log('═══════════════════════════════════════');
                setShowSimple(false);
              }}
              disabled={!showSimple}
              style={{
                padding: '10px 20px',
                fontSize: '14px',
                background: showSimple ? '#e91e63' : '#9e9e9e',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: showSimple ? 'pointer' : 'not-allowed',
                marginRight: '10px'
              }}
            >
              卸载组件
            </button>
            
            <button
              onClick={() => {
                console.clear();
                console.log('═══════════════════════════════════════');
                console.log('🟢 重新挂载组件');
                console.log('═══════════════════════════════════════');
                setSimpleId(simpleId + 1);
                setShowSimple(true);
              }}
              style={{
                padding: '10px 20px',
                fontSize: '14px',
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
          
          <div style={{ background: '#fff', padding: '10px', borderRadius: '5px', minHeight: '100px' }}>
            {showSimple ? (
              <TestComponent id={simpleId} />
            ) : (
              <p style={{ color: '#999', textAlign: 'center', padding: '30px' }}>
                组件已卸载，查看控制台
              </p>
            )}
          </div>
        </div>

        {/* 父子组件示例 */}
        <div>
          <h3>示例 2：父子组件</h3>
          <div style={{ marginBottom: '15px' }}>
            <button
              onClick={() => {
                console.clear();
                console.log('═══════════════════════════════════════');
                console.log('🔴 卸载父子组件，观察 DOM 状态');
                console.log('═══════════════════════════════════════');
                setShowParent(false);
              }}
              disabled={!showParent}
              style={{
                padding: '10px 20px',
                fontSize: '14px',
                background: showParent ? '#e91e63' : '#9e9e9e',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: showParent ? 'pointer' : 'not-allowed',
                marginRight: '10px'
              }}
            >
              卸载父子组件
            </button>
            
            <button
              onClick={() => {
                console.clear();
                console.log('═══════════════════════════════════════');
                console.log('🟢 重新挂载父子组件');
                console.log('═══════════════════════════════════════');
                setParentId(parentId + 1);
                setShowParent(true);
              }}
              style={{
                padding: '10px 20px',
                fontSize: '14px',
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
          
          <div style={{ background: '#fff', padding: '10px', borderRadius: '5px', minHeight: '100px' }}>
            {showParent ? (
              <ParentComponent id={parentId} />
            ) : (
              <p style={{ color: '#999', textAlign: 'center', padding: '30px' }}>
                父子组件已卸载，查看控制台
              </p>
            )}
          </div>
        </div>

        <div style={{ background: '#fff9c4', padding: '15px', marginTop: '20px', borderRadius: '5px' }}>
          <h4>🔍 观察要点（查看控制台）：</h4>
          <ol>
            <li><strong>useLayoutEffect cleanup：</strong>
              <ul>
                <li>domRef.current 不为 null ✅</li>
                <li>document.body.contains(domRef.current) === true ✅</li>
                <li>可以访问 DOM 内容 ✅</li>
                <li>DOM 还在页面中！</li>
              </ul>
            </li>
            <li><strong>useEffect cleanup：</strong>
              <ul>
                <li>domRef.current 可能为 null ❌</li>
                <li>即使不为 null，document.body.contains(domRef.current) === false ❌</li>
                <li>DOM 已经不在页面中了！</li>
              </ul>
            </li>
            <li><strong>执行顺序：</strong>
              <ul>
                <li>useLayoutEffect cleanup（DOM 还在）</li>
                <li>... DOM 被删除 ...</li>
                <li>useEffect cleanup（DOM 已删除）</li>
              </ul>
            </li>
          </ol>
        </div>
      </div>

      {/* 总结 */}
      <div style={{ background: '#e0f2f1', padding: '20px', borderRadius: '8px' }}>
        <h2>📝 总结</h2>
        
        <div style={{ background: '#fff', padding: '15px', borderRadius: '5px' }}>
          <h3 style={{ color: '#d32f2f' }}>核心结论</h3>
          
          <div style={{ background: '#ffebee', padding: '15px', marginBottom: '15px', borderRadius: '5px' }}>
            <h4>useEffect cleanup 在 DOM 卸载后执行！</h4>
            
            <p><strong>完整时间线：</strong></p>
            <ol>
              <li>🟠 useLayoutEffect cleanup（DOM 还在 ✅）</li>
              <li>❌ DOM 删除</li>
              <li>🔵 useLayoutEffect create</li>
              <li>🎨 浏览器绘制</li>
              <li>🔴 useEffect cleanup（DOM 已删除 ❌）</li>
              <li>🟢 useEffect create</li>
            </ol>
          </div>

          <h3>为什么这样设计？</h3>
          <div style={{ background: '#e3f2fd', padding: '15px', marginBottom: '15px', borderRadius: '5px' }}>
            <ul>
              <li>✅ <strong>性能：</strong>useEffect 不阻塞浏览器绘制</li>
              <li>✅ <strong>语义：</strong>useEffect 用于非 DOM 副作用</li>
              <li>✅ <strong>架构：</strong>清晰的同步/异步阶段划分</li>
            </ul>
          </div>

          <h3>实际编码指南</h3>
          <div style={{ background: '#e8f5e9', padding: '15px', borderRadius: '5px' }}>
            <p><strong>需要访问 DOM 的 cleanup：</strong></p>
            <ul>
              <li>✅ 使用 <code>useLayoutEffect</code></li>
              <li>✅ cleanup 时 DOM 还在</li>
              <li>✅ 可以安全访问和操作 DOM</li>
            </ul>
            
            <p><strong>不需要访问 DOM 的 cleanup：</strong></p>
            <ul>
              <li>✅ 使用 <code>useEffect</code></li>
              <li>✅ cleanup 不依赖 DOM</li>
              <li>✅ 更好的性能（不阻塞渲染）</li>
            </ul>
          </div>

          <div style={{ background: '#fff9c4', padding: '15px', marginTop: '15px', borderRadius: '5px' }}>
            <h4>💡 记忆口诀：</h4>
            <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#1976d2' }}>
              Layout cleanup DOM 还在<br/>
              Effect cleanup DOM 已删<br/>
              需要 DOM 用 Layout<br/>
              副作用用 Effect
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
