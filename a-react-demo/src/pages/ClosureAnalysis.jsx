import React, { useState, Component } from 'react';

/**
 * 从源码分析：为什么 useState 有闭包问题？
 * 
 * 核心原因：
 * 1. Function 组件：每次渲染都是一次新的函数调用，state 是普通变量
 * 2. Class 组件：state 存储在 this 上，this 是固定的引用
 */

// ==================== Function 组件 - 有闭包问题 ====================
function FunctionComponentClosure() {
  const [count, setCount] = useState(0);
  
  console.log('🟡 Function 组件渲染，当前 count:', count);
  
  // 1. 直接使用 count - 闭包陷阱
  const handleClickWrong = () => {
    console.log('\n❌ === 闭包陷阱示例 ===');
    console.log('点击时的 count:', count);
          for (var i = 0; i < 5; i++) {
            setTimeout(() => {
              console.log('i',i, count);
              setCount(count + 1); // ❌ 使用闭包捕获的旧值
            }, 3000);
          }
    
  };

  // 2. 函数式更新 - 正确方式
  const handleClickRight = () => {
    console.log('\n✅ === 函数式更新（正确） ===');
    console.log('点击时的 count:', count);
    
    setTimeout(() => {
      setCount(prevCount => {
        console.log('3秒后，从 React 获取最新 count:', prevCount);
        return prevCount + 1;
      }); // ✅ 通过函数获取最新值
    }, 3000);
    
    console.log('👆 快速点击其他按钮改变 count，3秒后看结果');
  };
  
  // 3. 普通更新
  const handleNormalUpdate = () => {
    setCount(count + 1);
  };
  
  // 4. 模拟多次点击
  const handleMultipleClicks = () => {
    console.log('\n⚠️ === 多次使用闭包值 ===');
    console.log('当前 count:', count);
    
    // 连续调用三次
    setTimeout(() => {
      console.log('1秒后：使用闭包 count =', count);
      setCount(count + 1); // 基于闭包的 count
    }, 1000);
    
    setTimeout(() => {
      console.log('2秒后：使用闭包 count =', count);
      setCount(count + 1); // 仍然是同一个闭包的 count
    }, 2000);
    
    setTimeout(() => {
      console.log('3秒后：使用闭包 count =', count);
      setCount(count + 1); // 还是同一个闭包的 count
    }, 3000);
    
    console.log('结果：只会 +1，因为三次都基于同一个闭包值');
  };
  
  // 5. 正确的多次更新
  const handleMultipleClicksRight = () => {
    console.log('\n✅ === 多次函数式更新 ===');
    
    setTimeout(() => {
      setCount(prev => {
        console.log('1秒后：prev =', prev);
        return prev + 1;
      });
    }, 1000);
    
    setTimeout(() => {
      setCount(prev => {
        console.log('2秒后：prev =', prev);
        return prev + 1;
      });
    }, 2000);
    
    setTimeout(() => {
      setCount(prev => {
        console.log('3秒后：prev =', prev);
        return prev + 1;
      });
    }, 3000);
    
    console.log('结果：正确 +3，因为每次都获取最新值');
  };
  
  return (
    <div style={{ padding: '20px', background: '#fff3e0', marginBottom: '20px' }}>
      <h3>Function 组件（useState）- 有闭包问题</h3>
      <p style={{ fontSize: '24px', fontWeight: 'bold' }}>Count: {count}</p>
      
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button onClick={handleNormalUpdate}>普通 +1</button>
        <button onClick={handleClickWrong} style={{ background: '#ffcdd2' }}>
          ❌ 闭包陷阱（3秒后+1）
        </button>
        <button onClick={handleClickRight} style={{ background: '#c8e6c9' }}>
          ✅ 函数式更新（3秒后+1）
        </button>
        <button onClick={handleMultipleClicks} style={{ background: '#ffcdd2' }}>
          ❌ 错误：多次闭包更新
        </button>
        <button onClick={handleMultipleClicksRight} style={{ background: '#c8e6c9' }}>
          ✅ 正确：多次函数更新
        </button>
      </div>
    </div>
  );
}

// ==================== Class 组件 - 无闭包问题 ====================
class ClassComponentNoClosure extends Component {
  state = { count: 0 };
  
  componentDidUpdate() {
    console.log('🔵 Class 组件更新，当前 count:', this.state.count);
  }
  
  // 1. 使用 this.state - 始终是最新值
  handleClick = () => {
    console.log('\n✅ === Class 组件无闭包问题 ===');
    console.log('点击时的 count:', this.state.count);
    
    setTimeout(() => {
      console.log('3秒后，this.state.count:', this.state.count);
      console.log('注意：这是最新值！');
      this.setState({ count: this.state.count + 1 }); // ✅ 通过 this 访问最新值
    }, 3000);
    
    console.log('👆 快速点击其他按钮改变 count，3秒后看结果');
  };
  
  // 2. 普通更新
  handleNormalUpdate = () => {
    this.setState({ count: this.state.count + 1 });
  };
  
  // 3. 多次更新 - this.state 始终最新
  handleMultipleClicks = () => {
    console.log('\n✅ === Class 组件多次更新 ===');
    console.log('当前 count:', this.state.count);
    
    setTimeout(() => {
      console.log('1秒后：this.state.count =', this.state.count);
      this.setState({ count: this.state.count + 1 });
    }, 1000);
    
    setTimeout(() => {
      console.log('2秒后：this.state.count =', this.state.count);
      this.setState({ count: this.state.count + 1 });
    }, 2000);
    
    setTimeout(() => {
      console.log('3秒后：this.state.count =', this.state.count);
      this.setState({ count: this.state.count + 1 });
    }, 3000);
    
    console.log('注意：虽然都能访问最新值，但不推荐这样写');
    console.log('推荐使用函数式更新：this.setState(prev => ({...}))');
  };
  
  render() {
    return (
      <div style={{ padding: '20px', background: '#e3f2fd', marginBottom: '20px' }}>
        <h3>Class 组件（setState）- 无闭包问题</h3>
        <p style={{ fontSize: '24px', fontWeight: 'bold' }}>Count: {this.state.count}</p>
        
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button onClick={this.handleNormalUpdate}>普通 +1</button>
          <button onClick={this.handleClick} style={{ background: '#c8e6c9' }}>
            ✅ 延迟更新（3秒后+1）
          </button>
          <button onClick={this.handleMultipleClicks} style={{ background: '#fff9c4' }}>
            ⚠️ 多次延迟更新
          </button>
        </div>
      </div>
    );
  }
}

// ==================== 主组件 ====================
export default function ClosureAnalysis() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>从源码分析：useState 的闭包问题</h1>
      <p style={{ color: '#666' }}>打开控制台查看详细输出</p>
      
      <FunctionComponentClosure />
      <ClassComponentNoClosure />
      
      <hr style={{ margin: '30px 0' }} />
      
      <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px' }}>
        <h2>📚 源码层面的深度分析</h2>
        
        <div style={{ marginBottom: '20px' }}>
          <h3>1️⃣ Function 组件的本质</h3>
          <pre style={{ background: '#fff', padding: '15px', overflow: 'auto', borderRadius: '5px' }}>
{`// 每次渲染都是一次新的函数调用
function Component() {
  const [count, setCount] = useState(0);  // count 是本次渲染的常量
  
  const handleClick = () => {
    // 这个函数捕获了当前渲染的 count
    setTimeout(() => {
      setCount(count + 1);  // ❌ count 是闭包捕获的旧值
    }, 1000);
  };
  
  return <button onClick={handleClick}>{count}</button>;
}

// 第一次渲染：count = 0
// - handleClick 函数捕获 count = 0
// - 点击按钮，setTimeout 中的 count 仍然是 0

// 第二次渲染：count = 1（setState 触发）
// - 创建新的 handleClick 函数，捕获 count = 1
// - 但之前 setTimeout 中的 count 还是 0！`}
          </pre>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h3>2️⃣ useState 的源码实现</h3>
          <pre style={{ background: '#fff', padding: '15px', overflow: 'auto', borderRadius: '5px' }}>
{`// ReactFiberHooks.old.js - mountState

function mountState(initialState) {
  const hook = mountWorkInProgressHook();
  hook.memoizedState = hook.baseState = initialState;
  
  const queue = {
    pending: null,
    dispatch: null,
    lastRenderedReducer: basicStateReducer,
    lastRenderedState: initialState,  // ← 状态存在 Hook 链表中
  };
  hook.queue = queue;
  
  // 关键：dispatch 通过 bind 绑定 fiber 和 queue
  const dispatch = (queue.dispatch = dispatchSetState.bind(
    null,
    currentlyRenderingFiber,  // ← 绑定 Fiber 节点
    queue,                     // ← 绑定更新队列
  ));
  
  // 返回当前值和 dispatch
  return [hook.memoizedState, dispatch];
}

// 🔑 关键点：
// 1. state 存储在 Fiber 节点的 Hook 链表中
// 2. 返回的 count 是当前渲染的快照值（普通变量）
// 3. setCount 绑定了 Fiber 和 queue，与 count 值无关`}
          </pre>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h3>3️⃣ dispatchSetState 的实现</h3>
          <pre style={{ background: '#fff', padding: '15px', overflow: 'auto', borderRadius: '5px' }}>
{`// ReactFiberHooks.old.js - dispatchSetState

function dispatchSetState(fiber, queue, action) {
  const lane = requestUpdateLane(fiber);
  
  const update = {
    lane,
    action,  // ← 这里的 action 可能是值，也可能是函数
    hasEagerState: false,
    eagerState: null,
    next: null,
  };
  
  // 🔑 关键：如果 action 是函数，会在后续处理时调用
  // 如果 action 是值（如 count + 1），则直接使用这个值
  
  // 优化：尝试提前计算新状态
  const currentState = queue.lastRenderedState;  // ← 从 queue 获取最新状态
  const eagerState = lastRenderedReducer(currentState, action);
  
  // 🔑 关键判断：
  // - 如果 action 是函数：eagerState = action(currentState)  ← 获取最新值
  // - 如果 action 是值：eagerState = action                  ← 使用闭包的旧值
  
  if (is(eagerState, currentState)) {
    // 优化：新旧状态相同，跳过渲染
    return;
  }
  
  // 调度更新
  const root = enqueueConcurrentHookUpdate(fiber, queue, update, lane);
  scheduleUpdateOnFiber(root, fiber, lane, eventTime);
}

// basicStateReducer - useState 的 reducer
function basicStateReducer(state, action) {
  // 🔑 核心：
  // - 如果 action 是函数：调用函数，传入最新 state
  // - 如果 action 是值：直接返回这个值（闭包捕获的旧值）
  return typeof action === 'function' ? action(state) : action;
}`}
          </pre>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h3>4️⃣ Class 组件的 setState 实现</h3>
          <pre style={{ background: '#fff', padding: '15px', overflow: 'auto', borderRadius: '5px' }}>
{`// Class 组件的 state 存储在 this 上

class Component extends React.Component {
  state = { count: 0 };  // ← 存储在实例上
  
  handleClick = () => {
    setTimeout(() => {
      // 🔑 关键：通过 this.state 访问
      // this 是固定的实例引用，始终指向最新的 state
      this.setState({ count: this.state.count + 1 });
    }, 1000);
  };
}

// 原理：
// 1. this 是组件实例，在组件生命周期内是固定的
// 2. this.state 是实例属性，每次更新都会修改这个属性
// 3. 无论何时访问 this.state，都是最新值
// 4. 不存在闭包问题，因为不是捕获值，而是通过引用访问`}
          </pre>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h3>5️⃣ 图解对比</h3>
          <div style={{ background: '#fff', padding: '15px', borderRadius: '5px' }}>
            <h4>Function 组件（闭包陷阱）</h4>
            <pre>
{`第一次渲染：
  Component() 调用
    ↓
  const count = 0          ← 创建局部常量
  const handleClick = () => {
    setTimeout(() => {
      setCount(count + 1)  ← 闭包捕获 count = 0
    }, 1000)
  }
    ↓
  返回 JSX

点击按钮 → 1秒后执行 setCount(0 + 1) ← 使用闭包的旧值 0

第二次渲染（count = 1）：
  Component() 调用（新的函数执行）
    ↓
  const count = 1          ← 创建新的局部常量
  const handleClick = () => {  ← 创建新的函数
    setTimeout(() => {
      setCount(count + 1)  ← 闭包捕获 count = 1
    }, 1000)
  }
    ↓
  返回 JSX

但之前的 setTimeout 中的 count 还是 0！`}
            </pre>

            <h4>Class 组件（无闭包问题）</h4>
            <pre>
{`组件实例创建：
  new Component()
    ↓
  this.state = { count: 0 }  ← 存储在实例上

点击按钮：
  setTimeout(() => {
    this.state.count         ← 通过 this 访问实例属性
    ↓
    始终是最新值（不是闭包捕获）
  }, 1000)

更新后：
  this.state = { count: 1 }  ← 修改实例属性
  
再次访问 this.state.count → 得到最新值 1`}
            </pre>
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h3>6️⃣ 为什么函数式更新能解决闭包问题？</h3>
          <pre style={{ background: '#fff', padding: '15px', overflow: 'auto', borderRadius: '5px' }}>
{`// ❌ 错误：使用闭包的值
setCount(count + 1);
// 等价于：
setCount(0 + 1);  // count 在闭包中被捕获为 0

// ✅ 正确：使用函数
setCount(prevCount => prevCount + 1);

// 源码执行过程：
// 1. React 调用 basicStateReducer(currentState, action)
// 2. action 是函数，执行 action(currentState)
// 3. currentState 是从 Fiber 节点的 Hook 链表中获取的最新值
// 4. 返回计算后的新值

// 关键：不依赖闭包的 count，而是让 React 传入最新值！`}
          </pre>
        </div>

        <div>
          <h3>7️⃣ 总结</h3>
          <div style={{ background: '#e8f5e9', padding: '15px', borderRadius: '5px' }}>
            <h4>闭包问题的根本原因：</h4>
            <ul>
              <li><strong>Function 组件：</strong>每次渲染是新的函数调用，state 是局部常量（快照）</li>
              <li><strong>闭包捕获：</strong>事件处理函数、定时器等捕获了当时的 state 值</li>
              <li><strong>值不更新：</strong>闭包捕获的是值，不是引用，不会自动更新</li>
            </ul>

            <h4>Class 组件无闭包问题的原因：</h4>
            <ul>
              <li><strong>this 引用：</strong>通过 this.state 访问，this 是固定的实例引用</li>
              <li><strong>始终最新：</strong>this.state 指向实例属性，每次访问都是最新值</li>
              <li><strong>不是闭包：</strong>不是捕获值，而是通过引用查找</li>
            </ul>

            <h4>解决方案：</h4>
            <ul>
              <li>✅ 使用函数式更新：<code>setState(prev =&gt; prev + 1)</code></li>
              <li>✅ 使用 useRef 存储可变值</li>
              <li>✅ 使用 useEffect 监听依赖变化</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
