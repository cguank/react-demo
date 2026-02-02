import React, { useState, Component } from 'react';

/**
 * useState vs setState 完整对比
 * 
 * 核心区别：
 * 1. setState: 对象合并（merge）
 * 2. useState: 完全替换（replace）
 */

// ==================== Class 组件 ====================
class ClassComponent extends Component {
  state = {
    count: 0,
    name: 'John',
    age: 25
  };

  // 1. 基本更新 - 对象合并
  handleBasicUpdate = () => {
    console.log('\n🔵 === Class setState：基本更新 ===');
    console.log('更新前:', this.state);
    
    this.setState({ count: this.state.count + 1 });
    // ✅ 只更新 count，其他属性（name, age）保留
    
    setTimeout(() => {
      console.log('更新后:', this.state);
      // { count: 1, name: 'John', age: 25 }
    }, 100);
  };

  // 2. 函数式更新
  handleFunctionUpdate = () => {
    console.log('\n🔵 === Class setState：函数式更新 ===');
    
    this.setState(prevState => ({
      count: prevState.count + 1
    }));
    
    this.setState(prevState => ({
      count: prevState.count + 1
    }));
    
    setTimeout(() => {
      console.log('连续两次 +1，结果:', this.state.count);
      // 结果：2（正确累加）
    }, 100);
  };

  // 3. 批量更新
  handleBatchUpdate = () => {
    console.log('\n🔵 === Class setState：批量更新 ===');
    console.log('更新前:', this.state.count);
    
    // React 18 会自动批处理
    this.setState({ count: this.state.count + 1 });
    console.log('第一次 setState 后:', this.state.count); // 仍然是 0（异步）
    
    this.setState({ count: this.state.count + 1 });
    console.log('第二次 setState 后:', this.state.count); // 仍然是 0（异步）
    
    setTimeout(() => {
      console.log('最终结果:', this.state.count);
      // 结果：1（后者覆盖前者，因为都是基于旧值）
    }, 100);
  };

  render() {
    return (
      <div style={{ padding: '20px', background: '#e3f2fd', marginBottom: '20px' }}>
        <h3>Class 组件（setState）</h3>
        <p>State: {JSON.stringify(this.state)}</p>
        
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button onClick={this.handleBasicUpdate}>基本更新</button>
          <button onClick={this.handleFunctionUpdate}>函数式更新</button>
          <button onClick={this.handleBatchUpdate}>批量更新（错误示例）</button>
        </div>
      </div>
    );
  }
}

// ==================== Function 组件 ====================
function FunctionComponent() {
  // ❌ 错误示例：用对象
  const [stateObject, setStateObject] = useState({
    count: 0,
    name: 'John',
    age: 25
  });

  // ✅ 推荐：拆分成多个独立状态
  const [count, setCount] = useState(0);
  const [name] = useState('John');
  const [age] = useState(25);

  // 1. 对象更新 - 完全替换（错误示例）
  const handleWrongUpdate = () => {
    console.log('\n🟡 === Function useState：错误的对象更新 ===');
    console.log('更新前:', stateObject);
    
    setStateObject({ count: stateObject.count + 1 });
    // ❌ 错误：name 和 age 会丢失！
    
    setTimeout(() => {
      console.log('更新后:', stateObject);
      // { count: 1 } ← name 和 age 丢失了！
    }, 100);
  };

  // 2. 对象更新 - 手动合并（正确）
  const handleCorrectUpdate = () => {
    console.log('\n🟡 === Function useState：正确的对象更新 ===');
    console.log('更新前:', stateObject);
    
    setStateObject(prev => ({
      ...prev, // 手动展开之前的属性
      count: prev.count + 1
    }));
    // ✅ 正确：保留了所有属性
    
    setTimeout(() => {
      console.log('更新后:', stateObject);
      // { count: 1, name: 'John', age: 25 }
    }, 100);
  };

  // 3. 独立状态更新（推荐）
  const handleRecommendedUpdate = () => {
    console.log('\n🟡 === Function useState：推荐的独立状态 ===');
    console.log('更新前 count:', count);
    
    setCount(count + 1);
    // ✅ 推荐：每个状态独立，不需要手动合并
    
    setTimeout(() => {
      console.log('更新后 count:', count + 1);
      console.log('其他状态不受影响 - name:', name, ', age:', age);
    }, 100);
  };

  // 4. 函数式更新
  const handleFunctionUpdate = () => {
    console.log('\n🟡 === Function useState：函数式更新 ===');
    
    setCount(prev => prev + 1);
    setCount(prev => prev + 1);
    
    setTimeout(() => {
      console.log('连续两次 +1，结果:', count + 2);
      // 结果：2（正确累加）
    }, 100);
  };

  // 5. 闭包陷阱示例
  const handleClosureTrap = () => {
    console.log('\n🟡 === Function useState：闭包陷阱 ===');
    console.log('当前 count:', count);
    
    setTimeout(() => {
      // ❌ 错误：闭包捕获了旧的 count 值
      setCount(count + 1);
      console.log('3秒后，使用闭包的旧值:', count);
    }, 3000);
    
    console.log('👆 点击其他按钮改变 count，3秒后看结果');
  };

  // 6. 避免闭包陷阱
  const handleAvoidClosure = () => {
    console.log('\n🟡 === Function useState：避免闭包陷阱 ===');
    
    setTimeout(() => {
      // ✅ 正确：使用函数式更新，获取最新值
      setCount(prevCount => {
        console.log('3秒后，使用函数获取最新值:', prevCount);
        return prevCount + 1;
      });
    }, 3000);
    
    console.log('👆 点击其他按钮改变 count，3秒后看结果');
  };

  return (
    <div style={{ padding: '20px', background: '#fff3e0', marginBottom: '20px' }}>
      <h3>Function 组件（useState）</h3>
      <p>对象状态: {JSON.stringify(stateObject)}</p>
      <p>独立状态 - Count: {count}, Name: {name}, Age: {age}</p>
      
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button onClick={handleWrongUpdate}>❌ 错误的对象更新</button>
        <button onClick={handleCorrectUpdate}>✅ 正确的对象更新</button>
        <button onClick={handleRecommendedUpdate}>✅ 推荐的独立状态</button>
        <button onClick={handleFunctionUpdate}>函数式更新</button>
        <button onClick={handleClosureTrap}>⚠️ 闭包陷阱</button>
        <button onClick={handleAvoidClosure}>✅ 避免闭包</button>
      </div>
    </div>
  );
}

// ==================== 主组件 ====================
export default function UseStateVsSetState() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>useState vs setState 完整对比</h1>
      <p style={{ color: '#666' }}>打开控制台查看详细输出</p>
      
      <ClassComponent />
      <FunctionComponent />
      
      <hr style={{ margin: '30px 0' }} />
      
      <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px' }}>
        <h2>📚 核心区别总结</h2>
        
        <div style={{ marginBottom: '20px' }}>
          <h3>1️⃣ 最重要：合并 vs 替换</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff' }}>
            <thead>
              <tr style={{ background: '#e0e0e0' }}>
                <th style={{ border: '1px solid #ccc', padding: '10px' }}>特性</th>
                <th style={{ border: '1px solid #ccc', padding: '10px' }}>setState (Class)</th>
                <th style={{ border: '1px solid #ccc', padding: '10px' }}>useState (Function)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ border: '1px solid #ccc', padding: '10px' }}><strong>更新方式</strong></td>
                <td style={{ border: '1px solid #ccc', padding: '10px' }}>对象合并（merge）</td>
                <td style={{ border: '1px solid #ccc', padding: '10px' }}>完全替换（replace）</td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #ccc', padding: '10px' }}><strong>状态结构</strong></td>
                <td style={{ border: '1px solid #ccc', padding: '10px' }}>单个对象</td>
                <td style={{ border: '1px solid #ccc', padding: '10px' }}>多个独立状态</td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #ccc', padding: '10px' }}><strong>更新示例</strong></td>
                <td style={{ border: '1px solid #ccc', padding: '10px' }}>
                  <code>setState({'{count: 1}'})</code><br/>
                  其他属性自动保留
                </td>
                <td style={{ border: '1px solid #ccc', padding: '10px' }}>
                  <code>setState(prev =&gt; ({'{ ...prev, count: 1 }'}))</code><br/>
                  需要手动合并
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h3>2️⃣ 其他重要区别</h3>
          <ul>
            <li>
              <strong>闭包问题：</strong>
              <ul>
                <li>Class 组件：通过 <code>this.state</code> 访问，始终是最新值</li>
                <li>Function 组件：闭包捕获旧值，需要用函数式更新</li>
              </ul>
            </li>
            <li>
              <strong>this 绑定：</strong>
              <ul>
                <li>Class 组件：需要绑定 this（箭头函数或 bind）</li>
                <li>Function 组件：无 this 问题</li>
              </ul>
            </li>
            <li>
              <strong>批量更新：</strong>
              <ul>
                <li>React 18 之前：Class 组件在事件处理中自动批处理</li>
                <li>React 18：两者都自动批处理（包括 Promise、setTimeout）</li>
              </ul>
            </li>
          </ul>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h3>3️⃣ 源码层面的实现</h3>
          <pre style={{ background: '#fff', padding: '15px', overflow: 'auto', borderRadius: '5px' }}>
{`// Class 组件的 setState - 对象合并
// ReactFiberClassUpdateQueue.old.js - processUpdateQueue

if (update.tag === UpdateState) {
  const payload = update.payload;
  let partialState;
  if (typeof payload === 'function') {
    partialState = payload.call(instance, prevState, nextProps);
  } else {
    partialState = payload;
  }
  if (partialState !== null && partialState !== undefined) {
    // 🔑 关键：Object.assign 合并对象
    newState = Object.assign({}, prevState, partialState);
  }
}

// Function 组件的 useState - 完全替换
// ReactFiberHooks.old.js - basicStateReducer

function basicStateReducer(state, action) {
  // 🔑 关键：直接返回新值，不合并
  return typeof action === 'function' ? action(state) : action;
}

// useState 内部调用 useReducer
function updateState(initialState) {
  return updateReducer(basicStateReducer, initialState);
}`}
          </pre>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h3>4️⃣ 最佳实践</h3>
          <div style={{ background: '#e8f5e9', padding: '15px', borderRadius: '5px' }}>
            <h4>✅ Class 组件推荐：</h4>
            <pre style={{ background: '#fff', padding: '10px' }}>
{`// 1. 使用单个 state 对象
state = { count: 0, name: 'John' };

// 2. 函数式更新确保基于最新值
this.setState(prev => ({ count: prev.count + 1 }));

// 3. 可以只更新部分属性
this.setState({ count: 1 }); // name 自动保留`}
            </pre>
          </div>

          <div style={{ background: '#fff3e0', padding: '15px', borderRadius: '5px', marginTop: '10px' }}>
            <h4>✅ Function 组件推荐：</h4>
            <pre style={{ background: '#fff', padding: '10px' }}>
{`// 1. 拆分成多个独立状态（推荐）
const [count, setCount] = useState(0);
const [name, setName] = useState('John');

// 2. 如果必须用对象，手动合并
const [state, setState] = useState({ count: 0, name: 'John' });
setState(prev => ({ ...prev, count: 1 }));

// 3. 使用函数式更新避免闭包陷阱
setCount(prevCount => prevCount + 1);`}
            </pre>
          </div>
        </div>

        <div>
          <h3>5️⃣ 常见陷阱</h3>
          <div style={{ background: '#ffebee', padding: '15px', borderRadius: '5px' }}>
            <h4>❌ useState 常见错误：</h4>
            <pre style={{ background: '#fff', padding: '10px' }}>
{`// 错误 1：忘记合并对象
const [state, setState] = useState({ a: 1, b: 2 });
setState({ a: 3 }); // ❌ b 丢失了！

// 错误 2：闭包陷阱
const [count, setCount] = useState(0);
setTimeout(() => {
  setCount(count + 1); // ❌ count 是旧值
}, 1000);

// 正确做法：
setState(prev => ({ ...prev, a: 3 })); // ✅
setCount(prev => prev + 1); // ✅`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
