import React, { useState, useEffect } from 'react';

/**
 * 🎯 前端面试常见设计模式详解
 * 
 * 设计模式是软件开发中解决常见问题的可复用方案。
 * 本文档涵盖前端面试中最常见的设计模式，包括定义、应用场景、代码示例和面试要点。
 * 
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 目录
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 1. 单例模式 (Singleton Pattern)
 * 2. 工厂模式 (Factory Pattern)
 * 3. 观察者模式 (Observer Pattern)
 * 4. 发布-订阅模式 (Pub-Sub Pattern)
 * 5. 装饰器模式 (Decorator Pattern)
 * 6. 代理模式 (Proxy Pattern)
 * 7. 策略模式 (Strategy Pattern)
 * 8. 适配器模式 (Adapter Pattern)
 * 9. 迭代器模式 (Iterator Pattern)
 * 10. 职责链模式 (Chain of Responsibility)
 * 11. 模块模式 (Module Pattern)
 * 12. 原型模式 (Prototype Pattern)
 * 13. 建造者模式 (Builder Pattern)
 * 14. 命令模式 (Command Pattern)
 * 15. 外观模式 (Facade Pattern)
 */

const DesignPatternsInterview = () => {
  const [activePattern, setActivePattern] = useState('singleton');
  const [demoOutput, setDemoOutput] = useState([]);

  const addOutput = (message) => {
    setDemoOutput(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const clearOutput = () => {
    setDemoOutput([]);
  };

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 1️⃣ 单例模式 (Singleton Pattern)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  const SingletonDemo = () => {
    // 单例类实现
    class Singleton {
      constructor() {
        if (Singleton.instance) {
          return Singleton.instance;
        }
        this.value = Math.random();
        Singleton.instance = this;
      }

      getValue() {
        return this.value;
      }
    }

    // ES6模块单例（推荐）
    const createStore = () => {
      let state = { count: 0 };
      return {
        getState: () => state,
        setState: (newState) => { state = { ...state, ...newState }; }
      };
    };
    const store = createStore(); // 只在模块首次加载时创建

    const runDemo = () => {
      clearOutput();
      
      // 测试单例类
      const instance1 = new Singleton();
      const instance2 = new Singleton();
      
      addOutput(`实例1的值: ${instance1.getValue()}`);
      addOutput(`实例2的值: ${instance2.getValue()}`);
      addOutput(`两个实例相等: ${instance1 === instance2}`);
      
      // 测试模块单例
      store.setState({ count: 10 });
      addOutput(`Store状态: ${JSON.stringify(store.getState())}`);
    };

    return (
      <div>
        <h3>1️⃣ 单例模式 (Singleton Pattern)</h3>
        
        <div style={{ background: '#e3f2fd', padding: 15, borderRadius: 8, marginBottom: 15 }}>
          <h4>📖 定义</h4>
          <p>
            确保一个类只有一个实例,并提供一个全局访问点。
          </p>
          
          <h4>🎯 应用场景</h4>
          <ul>
            <li>全局状态管理 (如 Redux Store、Vuex Store)</li>
            <li>全局配置对象</li>
            <li>日志记录器 (Logger)</li>
            <li>数据库连接池</li>
            <li>浏览器中的 window、document 对象</li>
          </ul>

          <h4>✅ 优点</h4>
          <ul>
            <li>控制实例数量,节省内存</li>
            <li>提供全局访问点</li>
            <li>延迟初始化</li>
          </ul>

          <h4>❌ 缺点</h4>
          <ul>
            <li>全局状态难以测试</li>
            <li>违反单一职责原则</li>
            <li>在多线程环境需要考虑同步</li>
          </ul>
        </div>

        <div style={{ background: '#263238', color: '#aed581', padding: 15, borderRadius: 8, marginBottom: 15 }}>
          <h4>💻 代码示例</h4>
          <pre style={{ overflow: 'auto' }}>{`// 方法1: 类实现
class Singleton {
  constructor() {
    if (Singleton.instance) {
      return Singleton.instance;
    }
    this.data = [];
    Singleton.instance = this;
  }
  
  add(item) {
    this.data.push(item);
  }
}

// 方法2: 闭包实现
const Singleton = (function() {
  let instance;
  
  function createInstance() {
    return {
      data: [],
      add(item) { this.data.push(item); }
    };
  }
  
  return {
    getInstance() {
      if (!instance) {
        instance = createInstance();
      }
      return instance;
    }
  };
})();

// 方法3: ES6 模块 (推荐)
// store.js
class Store {
  constructor() {
    this.state = {};
  }
  getState() { return this.state; }
  setState(s) { this.state = {...this.state, ...s}; }
}

export default new Store(); // 直接导出实例

// 实际应用: Redux Store
import { createStore } from 'redux';
const store = createStore(reducer);
export default store;`}</pre>
        </div>

        <button onClick={runDemo} style={buttonStyle}>运行演示</button>

        <div style={{ background: '#fff3e0', padding: 15, borderRadius: 8, marginTop: 15 }}>
          <h4>🎤 面试要点</h4>
          <ul>
            <li><strong>如何实现单例?</strong> 类、闭包、ES6模块</li>
            <li><strong>如何保证线程安全?</strong> 双重检查锁定(DCL)</li>
            <li><strong>与全局变量的区别?</strong> 单例可以延迟初始化,有更好的封装</li>
            <li><strong>前端实际应用?</strong> Redux/Vuex store、axios实例、全局弹窗管理器</li>
          </ul>
        </div>
      </div>
    );
  };

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 2️⃣ 工厂模式 (Factory Pattern)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  const FactoryDemo = () => {
    // 简单工厂
    class Button {
      constructor(type) {
        this.type = type;
      }
      render() {
        return `<button class="${this.type}">Button</button>`;
      }
    }

    class ButtonFactory {
      createButton(type) {
        switch(type) {
          case 'primary': return new Button('btn-primary');
          case 'danger': return new Button('btn-danger');
          default: return new Button('btn-default');
        }
      }
    }

    const runDemo = () => {
      clearOutput();
      
      const factory = new ButtonFactory();
      const primaryBtn = factory.createButton('primary');
      const dangerBtn = factory.createButton('danger');
      
      addOutput(`Primary按钮: ${primaryBtn.render()}`);
      addOutput(`Danger按钮: ${dangerBtn.render()}`);
    };

    return (
      <div>
        <h3>2️⃣ 工厂模式 (Factory Pattern)</h3>
        
        <div style={{ background: '#e3f2fd', padding: 15, borderRadius: 8, marginBottom: 15 }}>
          <h4>📖 定义</h4>
          <p>
            定义一个创建对象的接口,让子类决定实例化哪个类。
          </p>
          
          <h4>🎯 应用场景</h4>
          <ul>
            <li>React.createElement() 创建虚拟DOM</li>
            <li>Vue组件工厂</li>
            <li>jQuery的 $() 工厂函数</li>
            <li>不同类型的弹窗、表单控件创建</li>
            <li>多种格式的文件解析器</li>
          </ul>

          <h4>✅ 优点</h4>
          <ul>
            <li>解耦对象的创建和使用</li>
            <li>符合开闭原则</li>
            <li>代码复用性高</li>
          </ul>

          <h4>❌ 缺点</h4>
          <ul>
            <li>增加系统复杂度</li>
            <li>需要引入许多新的类</li>
          </ul>
        </div>

        <div style={{ background: '#263238', color: '#aed581', padding: 15, borderRadius: 8, marginBottom: 15 }}>
          <h4>💻 代码示例</h4>
          <pre style={{ overflow: 'auto' }}>{`// 1. 简单工厂
class UserFactory {
  static createUser(role) {
    switch(role) {
      case 'admin':
        return { role: 'admin', permissions: ['read', 'write', 'delete'] };
      case 'user':
        return { role: 'user', permissions: ['read'] };
      default:
        return { role: 'guest', permissions: [] };
    }
  }
}

const admin = UserFactory.createUser('admin');

// 2. 工厂方法模式
class Product {
  constructor(name) { this.name = name; }
}

class ConcreteProductA extends Product {
  constructor() { super('Product A'); }
}

class ConcreteProductB extends Product {
  constructor() { super('Product B'); }
}

class Creator {
  factoryMethod() {
    throw new Error('子类必须实现 factoryMethod');
  }
}

class ConcreteCreatorA extends Creator {
  factoryMethod() { return new ConcreteProductA(); }
}

// 3. 实际应用: React.createElement
React.createElement('div', { className: 'box' }, 'Hello');
// 等价于
<div className="box">Hello</div>

// 4. 实际应用: 弹窗工厂
class ModalFactory {
  static create(type, options) {
    const modals = {
      alert: () => new AlertModal(options),
      confirm: () => new ConfirmModal(options),
      prompt: () => new PromptModal(options),
    };
    
    return modals[type] ? modals[type]() : null;
  }
}`}</pre>
        </div>

        <button onClick={runDemo} style={buttonStyle}>运行演示</button>

        <div style={{ background: '#fff3e0', padding: 15, borderRadius: 8, marginTop: 15 }}>
          <h4>🎤 面试要点</h4>
          <ul>
            <li><strong>简单工厂 vs 工厂方法?</strong> 简单工厂用一个工厂类,工厂方法每个产品有独立工厂</li>
            <li><strong>与抽象工厂的区别?</strong> 抽象工厂创建一系列相关对象</li>
            <li><strong>React中的工厂模式?</strong> React.createElement、高阶组件(HOC)</li>
            <li><strong>优化建议?</strong> 使用Map替代switch,支持动态注册</li>
          </ul>
        </div>
      </div>
    );
  };

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 3️⃣ 观察者模式 (Observer Pattern)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  const ObserverDemo = () => {
    class Subject {
      constructor() {
        this.observers = [];
      }

      attach(observer) {
        this.observers.push(observer);
      }

      detach(observer) {
        this.observers = this.observers.filter(obs => obs !== observer);
      }

      notify(data) {
        this.observers.forEach(observer => observer.update(data));
      }
    }

    class Observer {
      constructor(name) {
        this.name = name;
      }

      update(data) {
        addOutput(`${this.name} 收到通知: ${data}`);
      }
    }

    const runDemo = () => {
      clearOutput();
      
      const subject = new Subject();
      const observer1 = new Observer('观察者1');
      const observer2 = new Observer('观察者2');
      
      subject.attach(observer1);
      subject.attach(observer2);
      
      addOutput('发送通知: "数据已更新"');
      subject.notify('数据已更新');
      
      addOutput('移除观察者1');
      subject.detach(observer1);
      
      addOutput('再次发送通知: "新数据到达"');
      subject.notify('新数据到达');
    };

    return (
      <div>
        <h3>3️⃣ 观察者模式 (Observer Pattern)</h3>
        
        <div style={{ background: '#e3f2fd', padding: 15, borderRadius: 8, marginBottom: 15 }}>
          <h4>📖 定义</h4>
          <p>
            定义对象间的一对多依赖关系,当一个对象状态改变时,所有依赖它的对象都会收到通知并自动更新。
          </p>
          
          <h4>🎯 应用场景</h4>
          <ul>
            <li>Vue的响应式系统 (Dep & Watcher)</li>
            <li>React的 useEffect 依赖追踪</li>
            <li>DOM事件监听</li>
            <li>MobX的可观察对象</li>
            <li>RxJS</li>
          </ul>

          <h4>✅ 优点</h4>
          <ul>
            <li>松耦合,主体和观察者独立</li>
            <li>支持广播通信</li>
            <li>符合开闭原则</li>
          </ul>

          <h4>❌ 缺点</h4>
          <ul>
            <li>观察者过多会影响性能</li>
            <li>可能造成循环依赖</li>
            <li>通知顺序不可控</li>
          </ul>
        </div>

        <div style={{ background: '#263238', color: '#aed581', padding: 15, borderRadius: 8, marginBottom: 15 }}>
          <h4>💻 代码示例</h4>
          <pre style={{ overflow: 'auto' }}>{`// 1. 基础实现
class Subject {
  constructor() {
    this.observers = [];
  }
  
  subscribe(observer) {
    this.observers.push(observer);
  }
  
  unsubscribe(observer) {
    this.observers = this.observers.filter(obs => obs !== observer);
  }
  
  notify(data) {
    this.observers.forEach(observer => observer.update(data));
  }
}

class Observer {
  update(data) {
    console.log('收到数据:', data);
  }
}

// 2. Vue响应式原理简化版
class Dep {
  constructor() {
    this.subs = [];
  }
  
  depend() {
    if (Dep.target) {
      this.subs.push(Dep.target);
    }
  }
  
  notify() {
    this.subs.forEach(watcher => watcher.update());
  }
}

class Watcher {
  constructor(fn) {
    this.fn = fn;
    Dep.target = this;
    this.fn(); // 触发依赖收集
    Dep.target = null;
  }
  
  update() {
    this.fn();
  }
}

function defineReactive(obj, key, val) {
  const dep = new Dep();
  
  Object.defineProperty(obj, key, {
    get() {
      dep.depend(); // 收集依赖
      return val;
    },
    set(newVal) {
      val = newVal;
      dep.notify(); // 通知更新
    }
  });
}

// 3. DOM事件监听 (原生观察者模式)
button.addEventListener('click', handler1);
button.addEventListener('click', handler2);
button.removeEventListener('click', handler1);`}</pre>
        </div>

        <button onClick={runDemo} style={buttonStyle}>运行演示</button>

        <div style={{ background: '#fff3e0', padding: 15, borderRadius: 8, marginTop: 15 }}>
          <h4>🎤 面试要点</h4>
          <ul>
            <li><strong>与发布订阅的区别?</strong> 观察者直接依赖主体,发布订阅通过事件中心解耦</li>
            <li><strong>Vue响应式原理?</strong> Dep(主体) + Watcher(观察者) + defineProperty/Proxy</li>
            <li><strong>如何避免内存泄漏?</strong> 及时取消订阅,使用WeakMap存储观察者</li>
            <li><strong>如何优化性能?</strong> 批量更新(nextTick)、异步更新队列</li>
          </ul>
        </div>
      </div>
    );
  };

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 4️⃣ 发布-订阅模式 (Pub-Sub Pattern)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  const PubSubDemo = () => {
    class EventBus {
      constructor() {
        this.events = {};
      }

      on(event, callback) {
        if (!this.events[event]) {
          this.events[event] = [];
        }
        this.events[event].push(callback);
      }

      emit(event, data) {
        if (this.events[event]) {
          this.events[event].forEach(callback => callback(data));
        }
      }

      off(event, callback) {
        if (this.events[event]) {
          this.events[event] = this.events[event].filter(cb => cb !== callback);
        }
      }
    }

    const runDemo = () => {
      clearOutput();
      
      const eventBus = new EventBus();
      
      const handler1 = (data) => addOutput(`订阅者1收到: ${data}`);
      const handler2 = (data) => addOutput(`订阅者2收到: ${data}`);
      
      eventBus.on('message', handler1);
      eventBus.on('message', handler2);
      
      addOutput('发布事件: "Hello"');
      eventBus.emit('message', 'Hello');
      
      addOutput('取消订阅者1');
      eventBus.off('message', handler1);
      
      addOutput('再次发布事件: "World"');
      eventBus.emit('message', 'World');
    };

    return (
      <div>
        <h3>4️⃣ 发布-订阅模式 (Pub-Sub Pattern)</h3>
        
        <div style={{ background: '#e3f2fd', padding: 15, borderRadius: 8, marginBottom: 15 }}>
          <h4>📖 定义</h4>
          <p>
            发布者和订阅者通过事件中心解耦,发布者发布事件,订阅者订阅感兴趣的事件。
          </p>
          
          <h4>🎯 应用场景</h4>
          <ul>
            <li>Vue的 EventBus ($on, $emit, $off)</li>
            <li>Node.js的 EventEmitter</li>
            <li>消息队列 (Redis Pub/Sub, Kafka)</li>
            <li>跨组件通信</li>
            <li>WebSocket消息分发</li>
          </ul>

          <h4>✅ 优点</h4>
          <ul>
            <li>完全解耦发布者和订阅者</li>
            <li>支持多对多通信</li>
            <li>灵活的事件管理</li>
          </ul>

          <h4>❌ 缺点</h4>
          <ul>
            <li>难以追踪事件流</li>
            <li>可能造成内存泄漏</li>
            <li>调试困难</li>
          </ul>
        </div>

        <div style={{ background: '#263238', color: '#aed581', padding: 15, borderRadius: 8, marginBottom: 15 }}>
          <h4>💻 代码示例</h4>
          <pre style={{ overflow: 'auto' }}>{`// 1. EventBus实现
class EventBus {
  constructor() {
    this.events = {};
  }
  
  // 订阅
  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
    
    // 返回取消订阅函数
    return () => this.off(event, callback);
  }
  
  // 发布
  emit(event, ...args) {
    if (this.events[event]) {
      this.events[event].forEach(callback => {
        callback(...args);
      });
    }
  }
  
  // 取消订阅
  off(event, callback) {
    if (this.events[event]) {
      this.events[event] = this.events[event]
        .filter(cb => cb !== callback);
    }
  }
  
  // 只订阅一次
  once(event, callback) {
    const wrapper = (...args) => {
      callback(...args);
      this.off(event, wrapper);
    };
    this.on(event, wrapper);
  }
}

// 使用示例
const bus = new EventBus();

// 订阅
const unsubscribe = bus.on('userLogin', (user) => {
  console.log('用户登录:', user);
});

// 发布
bus.emit('userLogin', { name: 'Alice', id: 1 });

// 取消订阅
unsubscribe();

// 2. Vue2 EventBus
// main.js
Vue.prototype.$bus = new Vue();

// ComponentA.vue
this.$bus.$emit('customEvent', data);

// ComponentB.vue
this.$bus.$on('customEvent', (data) => {
  console.log(data);
});

// 3. Node.js EventEmitter
const EventEmitter = require('events');

class MyEmitter extends EventEmitter {}

const emitter = new MyEmitter();

emitter.on('event', () => {
  console.log('事件触发');
});

emitter.emit('event');`}</pre>
        </div>

        <button onClick={runDemo} style={buttonStyle}>运行演示</button>

        <div style={{ background: '#fff3e0', padding: 15, borderRadius: 8, marginTop: 15 }}>
          <h4>🎤 面试要点</h4>
          <ul>
            <li><strong>与观察者模式区别?</strong> 
              <ul>
                <li>观察者: 主体(Subject)直接持有观察者(Observer)引用</li>
                <li>发布订阅: 通过事件中心(EventBus)解耦,发布者和订阅者不直接联系</li>
              </ul>
            </li>
            <li><strong>如何防止内存泄漏?</strong> 组件销毁时取消订阅,使用$off或unsubscribe</li>
            <li><strong>如何实现once?</strong> 在回调执行后自动取消订阅</li>
            <li><strong>Vue3为何移除EventBus?</strong> 推荐使用 provide/inject 或状态管理库</li>
          </ul>
        </div>
      </div>
    );
  };

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 5️⃣ 代理模式 (Proxy Pattern)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  const ProxyDemo = () => {
    const runDemo = () => {
      clearOutput();
      
      // 虚拟代理示例
      const target = {
        name: 'Target',
        age: 25
      };
      
      const handler = {
        get(target, prop) {
          addOutput(`访问属性: ${prop}`);
          return target[prop];
        },
        set(target, prop, value) {
          addOutput(`设置属性: ${prop} = ${value}`);
          target[prop] = value;
          return true;
        }
      };
      
      const proxy = new Proxy(target, handler);
      
      const name = proxy.name;
      proxy.age = 30;
    };

    return (
      <div>
        <h3>5️⃣ 代理模式 (Proxy Pattern)</h3>
        
        <div style={{ background: '#e3f2fd', padding: 15, borderRadius: 8, marginBottom: 15 }}>
          <h4>📖 定义</h4>
          <p>
            为其他对象提供一种代理以控制对这个对象的访问。
          </p>
          
          <h4>🎯 应用场景</h4>
          <ul>
            <li>Vue3响应式系统 (Proxy替代defineProperty)</li>
            <li>图片懒加载 (虚拟代理)</li>
            <li>缓存代理 (Memoization)</li>
            <li>权限控制</li>
            <li>防抖节流</li>
            <li>接口拦截 (axios interceptors)</li>
          </ul>

          <h4>✅ 优点</h4>
          <ul>
            <li>控制对象访问</li>
            <li>延迟加载</li>
            <li>添加额外功能而不修改原对象</li>
          </ul>

          <h4>❌ 缺点</h4>
          <ul>
            <li>增加系统复杂度</li>
            <li>可能影响性能</li>
          </ul>
        </div>

        <div style={{ background: '#263238', color: '#aed581', padding: 15, borderRadius: 8, marginBottom: 15 }}>
          <h4>💻 代码示例</h4>
          <pre style={{ overflow: 'auto' }}>{`// 1. ES6 Proxy (Vue3响应式基础)
const data = { count: 0 };

const proxy = new Proxy(data, {
  get(target, key) {
    console.log('读取:', key);
    return target[key];
  },
  set(target, key, value) {
    console.log('设置:', key, '=', value);
    target[key] = value;
    return true;
  }
});

proxy.count; // 读取: count
proxy.count = 10; // 设置: count = 10

// 2. 虚拟代理: 图片懒加载
class ImageProxy {
  constructor(url) {
    this.url = url;
    this.img = null;
  }
  
  display() {
    if (!this.img) {
      this.img = new Image();
      this.img.src = 'loading.gif'; // 占位图
      this.img.onload = () => {
        this.img.src = this.url; // 真实图片
      };
    }
    return this.img;
  }
}

// 3. 缓存代理
function createCacheProxy(fn) {
  const cache = new Map();
  
  return new Proxy(fn, {
    apply(target, thisArg, args) {
      const key = JSON.stringify(args);
      if (cache.has(key)) {
        console.log('从缓存返回');
        return cache.get(key);
      }
      const result = target.apply(thisArg, args);
      cache.set(key, result);
      return result;
    }
  });
}

const fibonacci = createCacheProxy((n) => {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
});

// 4. 保护代理: 权限控制
const user = { name: 'Alice', role: 'user' };

const protectedUser = new Proxy(user, {
  set(target, key, value) {
    if (key === 'role' && target.role !== 'admin') {
      throw new Error('没有权限修改角色');
    }
    target[key] = value;
    return true;
  }
});

// 5. axios拦截器 (代理模式应用)
axios.interceptors.request.use(
  config => {
    config.headers.Authorization = getToken();
    return config;
  },
  error => Promise.reject(error)
);`}</pre>
        </div>

        <button onClick={runDemo} style={buttonStyle}>运行演示</button>

        <div style={{ background: '#fff3e0', padding: 15, borderRadius: 8, marginTop: 15 }}>
          <h4>🎤 面试要点</h4>
          <ul>
            <li><strong>Proxy vs defineProperty?</strong> Proxy可以代理整个对象、拦截更多操作、性能更好</li>
            <li><strong>虚拟代理的应用?</strong> 图片懒加载、按需加载大型对象</li>
            <li><strong>缓存代理的应用?</strong> 计算密集型函数的结果缓存</li>
            <li><strong>前端实际应用?</strong> Vue3响应式、axios拦截器、防抖节流包装器</li>
          </ul>
        </div>
      </div>
    );
  };

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 6️⃣ 策略模式 (Strategy Pattern)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  const StrategyDemo = () => {
    const strategies = {
      add: (a, b) => a + b,
      subtract: (a, b) => a - b,
      multiply: (a, b) => a * b,
      divide: (a, b) => a / b
    };

    const runDemo = () => {
      clearOutput();
      
      const calculator = (strategy, a, b) => {
        return strategies[strategy](a, b);
      };
      
      addOutput(`加法: 10 + 5 = ${calculator('add', 10, 5)}`);
      addOutput(`减法: 10 - 5 = ${calculator('subtract', 10, 5)}`);
      addOutput(`乘法: 10 * 5 = ${calculator('multiply', 10, 5)}`);
      addOutput(`除法: 10 / 5 = ${calculator('divide', 10, 5)}`);
    };

    return (
      <div>
        <h3>6️⃣ 策略模式 (Strategy Pattern)</h3>
        
        <div style={{ background: '#e3f2fd', padding: 15, borderRadius: 8, marginBottom: 15 }}>
          <h4>📖 定义</h4>
          <p>
            定义一系列算法,把它们封装起来,并且使它们可以相互替换。
          </p>
          
          <h4>🎯 应用场景</h4>
          <ul>
            <li>表单验证 (不同字段不同验证规则)</li>
            <li>支付方式选择 (支付宝、微信、银行卡)</li>
            <li>排序算法选择</li>
            <li>动画缓动函数 (linear, easeIn, easeOut)</li>
            <li>权限策略</li>
          </ul>

          <h4>✅ 优点</h4>
          <ul>
            <li>避免大量if-else或switch</li>
            <li>符合开闭原则</li>
            <li>算法可以自由切换</li>
          </ul>

          <h4>❌ 缺点</h4>
          <ul>
            <li>策略类会增多</li>
            <li>客户端需要了解所有策略</li>
          </ul>
        </div>

        <div style={{ background: '#263238', color: '#aed581', padding: 15, borderRadius: 8, marginBottom: 15 }}>
          <h4>💻 代码示例</h4>
          <pre style={{ overflow: 'auto' }}>{`// 1. 表单验证策略
const validationStrategies = {
  required: (value) => value !== '',
  minLength: (value, length) => value.length >= length,
  maxLength: (value, length) => value.length <= length,
  email: (value) => /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(value),
  phone: (value) => /^1[3-9]\\d{9}$/.test(value),
};

class Validator {
  constructor() {
    this.rules = [];
  }
  
  add(value, rules) {
    this.rules.push({ value, rules });
  }
  
  validate() {
    for (const { value, rules } of this.rules) {
      for (const rule of rules) {
        const { strategy, errorMsg, ...params } = rule;
        const isValid = validationStrategies[strategy](
          value, 
          ...Object.values(params)
        );
        if (!isValid) {
          return errorMsg;
        }
      }
    }
    return '';
  }
}

// 使用
const validator = new Validator();
validator.add(form.username, [
  { strategy: 'required', errorMsg: '用户名不能为空' },
  { strategy: 'minLength', length: 3, errorMsg: '用户名至少3个字符' }
]);
validator.add(form.email, [
  { strategy: 'email', errorMsg: '邮箱格式错误' }
]);
const error = validator.validate();

// 2. 支付策略
const paymentStrategies = {
  alipay: (amount) => {
    console.log(\`支付宝支付: ¥\${amount}\`);
    return \`支付宝订单号: \${Date.now()}\`;
  },
  wechat: (amount) => {
    console.log(\`微信支付: ¥\${amount}\`);
    return \`微信订单号: \${Date.now()}\`;
  },
  bank: (amount) => {
    console.log(\`银行卡支付: ¥\${amount}\`);
    return \`银行订单号: \${Date.now()}\`;
  }
};

class PaymentContext {
  constructor(strategy) {
    this.strategy = strategy;
  }
  
  pay(amount) {
    return paymentStrategies[this.strategy](amount);
  }
}

const payment = new PaymentContext('alipay');
payment.pay(100);

// 3. 动画缓动函数
const easingStrategies = {
  linear: (t) => t,
  easeIn: (t) => t * t,
  easeOut: (t) => t * (2 - t),
  easeInOut: (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
};

function animate(element, prop, target, duration, easing = 'linear') {
  const start = parseFloat(getComputedStyle(element)[prop]);
  const change = target - start;
  const startTime = Date.now();
  
  function update() {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = easingStrategies[easing](progress);
    
    element.style[prop] = start + change * easedProgress + 'px';
    
    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }
  
  update();
}`}</pre>
        </div>

        <button onClick={runDemo} style={buttonStyle}>运行演示</button>

        <div style={{ background: '#fff3e0', padding: 15, borderRadius: 8, marginTop: 15 }}>
          <h4>🎤 面试要点</h4>
          <ul>
            <li><strong>与状态模式区别?</strong> 策略模式关注算法替换,状态模式关注状态变化</li>
            <li><strong>如何避免客户端了解所有策略?</strong> 使用工厂模式或配置文件</li>
            <li><strong>实际应用场景?</strong> 表单验证、支付方式、动画缓动、路由守卫</li>
            <li><strong>优化建议?</strong> 使用Map存储策略,支持动态注册</li>
          </ul>
        </div>
      </div>
    );
  };

  // 样式定义
  const buttonStyle = {
    padding: '10px 20px',
    background: '#2196f3',
    color: 'white',
    border: 'none',
    borderRadius: 4,
    cursor: 'pointer',
    fontSize: 14,
    marginRight: 10
  };

  const patterns = [
    { id: 'singleton', name: '单例模式', component: <SingletonDemo /> },
    { id: 'factory', name: '工厂模式', component: <FactoryDemo /> },
    { id: 'observer', name: '观察者模式', component: <ObserverDemo /> },
    { id: 'pubsub', name: '发布订阅模式', component: <PubSubDemo /> },
    { id: 'proxy', name: '代理模式', component: <ProxyDemo /> },
    { id: 'strategy', name: '策略模式', component: <StrategyDemo /> },
  ];

  return (
    <div style={{ padding: 20, fontFamily: 'monospace', maxWidth: 1200, margin: '0 auto' }}>
      <h1>🎯 前端面试常见设计模式详解</h1>
      
      <div style={{ 
        background: '#fff3e0', 
        padding: 20, 
        borderRadius: 8, 
        marginBottom: 30,
        borderLeft: '4px solid #ff9800'
      }}>
        <h3 style={{ marginTop: 0 }}>💡 设计模式的重要性</h3>
        <p>
          设计模式是软件工程中被反复验证的解决方案,它们帮助我们:
        </p>
        <ul>
          <li>✅ 写出更易维护、可扩展的代码</li>
          <li>✅ 提高代码复用性</li>
          <li>✅ 团队协作时有共同的技术语言</li>
          <li>✅ 面试中展现架构思维和工程能力</li>
        </ul>
        <p>
          <strong>面试建议：</strong>不要死记硬背,要理解每个模式解决的问题,
          能结合实际项目经验说明在哪里用过、为什么用、带来了什么好处。
        </p>
      </div>

      {/* 导航栏 */}
      <div style={{ 
        display: 'flex', 
        gap: 10, 
        flexWrap: 'wrap', 
        marginBottom: 30,
        padding: 15,
        background: '#f5f5f5',
        borderRadius: 8
      }}>
        {patterns.map(pattern => (
          <button
            key={pattern.id}
            onClick={() => setActivePattern(pattern.id)}
            style={{
              ...buttonStyle,
              background: activePattern === pattern.id ? '#2196f3' : '#9e9e9e'
            }}
          >
            {pattern.name}
          </button>
        ))}
      </div>

      {/* 内容区域 */}
      <div style={{ 
        background: 'white', 
        padding: 20, 
        borderRadius: 8,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        {patterns.find(p => p.id === activePattern)?.component}
      </div>

      {/* 输出日志 */}
      {demoOutput.length > 0 && (
        <div style={{ 
          marginTop: 20,
          background: '#263238', 
          color: '#aed581',
          padding: 15,
          borderRadius: 8,
          maxHeight: 300,
          overflowY: 'auto'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <h4 style={{ color: '#81c784', margin: 0 }}>📊 执行日志</h4>
            <button onClick={clearOutput} style={{ ...buttonStyle, background: '#f44336' }}>
              清空日志
            </button>
          </div>
          {demoOutput.map((line, index) => (
            <div key={index} style={{ marginBottom: 4, fontSize: 14 }}>
              {line}
            </div>
          ))}
        </div>
      )}

      {/* 更多模式概览 */}
      <div style={{ 
        marginTop: 40,
        padding: 20,
        background: '#e8f5e9',
        borderRadius: 8,
        borderLeft: '4px solid #4caf50'
      }}>
        <h3>📚 其他重要设计模式概览</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 15 }}>
          <div style={{ background: 'white', padding: 15, borderRadius: 4 }}>
            <h4>7️⃣ 装饰器模式</h4>
            <p>动态给对象添加新功能。</p>
            <p><strong>应用：</strong>ES7 @decorator、React高阶组件(HOC)、AOP面向切面编程</p>
          </div>

          <div style={{ background: 'white', padding: 15, borderRadius: 4 }}>
            <h4>8️⃣ 适配器模式</h4>
            <p>将一个类的接口转换成客户希望的另一个接口。</p>
            <p><strong>应用：</strong>axios适配浏览器和Node.js、库的兼容层</p>
          </div>

          <div style={{ background: 'white', padding: 15, borderRadius: 4 }}>
            <h4>9️⃣ 迭代器模式</h4>
            <p>提供一种方法顺序访问集合元素。</p>
            <p><strong>应用：</strong>ES6 Iterator、Generator、for...of循环</p>
          </div>

          <div style={{ background: 'white', padding: 15, borderRadius: 4 }}>
            <h4>🔟 职责链模式</h4>
            <p>将请求沿着处理者链传递,直到有对象处理它。</p>
            <p><strong>应用：</strong>Express/Koa中间件、事件冒泡、Promise链</p>
          </div>

          <div style={{ background: 'white', padding: 15, borderRadius: 4 }}>
            <h4>1️⃣1️⃣ 模块模式</h4>
            <p>使用闭包创建私有变量和方法。</p>
            <p><strong>应用：</strong>ES6 Module、CommonJS、AMD/UMD</p>
          </div>

          <div style={{ background: 'white', padding: 15, borderRadius: 4 }}>
            <h4>1️⃣2️⃣ 原型模式</h4>
            <p>通过克隆原型对象来创建新对象。</p>
            <p><strong>应用：</strong>JavaScript原型链、Object.create()</p>
          </div>

          <div style={{ background: 'white', padding: 15, borderRadius: 4 }}>
            <h4>1️⃣3️⃣ 建造者模式</h4>
            <p>将复杂对象的构建与表示分离。</p>
            <p><strong>应用：</strong>jQuery链式调用、URL构造器、FormData构建</p>
          </div>

          <div style={{ background: 'white', padding: 15, borderRadius: 4 }}>
            <h4>1️⃣4️⃣ 命令模式</h4>
            <p>将请求封装成对象,支持撤销、重做。</p>
            <p><strong>应用：</strong>编辑器撤销重做、命令队列、宏命令</p>
          </div>

          <div style={{ background: 'white', padding: 15, borderRadius: 4 }}>
            <h4>1️⃣5️⃣ 外观模式</h4>
            <p>为子系统提供统一的高层接口。</p>
            <p><strong>应用：</strong>jQuery的$()、axios封装、库的API设计</p>
          </div>
        </div>
      </div>

      {/* 面试建议 */}
      <div style={{ 
        marginTop: 30,
        padding: 20,
        background: '#f3e5f5',
        borderRadius: 8,
        borderLeft: '4px solid #9c27b0'
      }}>
        <h3>🎤 设计模式面试建议</h3>
        
        <h4>1. 如何回答"你用过哪些设计模式"</h4>
        <ul>
          <li><strong>选择2-3个你最熟悉的</strong>,结合实际项目详细说明</li>
          <li><strong>说明使用场景</strong>: 遇到什么问题 → 为什么选这个模式 → 如何实现 → 带来什么好处</li>
          <li><strong>避免泛泛而谈</strong>,要有具体代码示例和数据支撑</li>
        </ul>

        <h4>2. 常见追问</h4>
        <ul>
          <li>这个模式解决了什么问题?</li>
          <li>与其他类似模式的区别是什么?</li>
          <li>有哪些缺点和局限性?</li>
          <li>在你的项目中如何优化的?</li>
          <li>能否手写实现?</li>
        </ul>

        <h4>3. 加分项</h4>
        <ul>
          <li>✅ 能说出框架/库中的实际应用(React HOC、Vue响应式、axios拦截器)</li>
          <li>✅ 理解设计原则(SOLID原则)与模式的关系</li>
          <li>✅ 知道何时<strong>不应该</strong>使用某个模式</li>
          <li>✅ 有性能优化、可测试性、可维护性的考量</li>
        </ul>

        <h4>4. 推荐学习路径</h4>
        <ol>
          <li>先掌握<strong>必考的5个</strong>: 单例、工厂、观察者、发布订阅、代理</li>
          <li>再学习<strong>常用的3个</strong>: 策略、装饰器、适配器</li>
          <li>最后了解其他模式,能说出名字和基本概念即可</li>
          <li>重点是<strong>理解问题和思想</strong>,而非背诵代码</li>
        </ol>
      </div>
    </div>
  );
};

export default DesignPatternsInterview;
