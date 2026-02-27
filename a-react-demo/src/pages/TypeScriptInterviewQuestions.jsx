import React, { useState } from 'react';

/**
 * TypeScript 面试题完全指南
 * 
 * 涵盖：
 * 1. 基础概念题
 * 2. 类型系统题
 * 3. 高级类型题
 * 4. 泛型题
 * 5. 实战题
 * 6. 工程化题
 */

export default function TypeScriptInterviewQuestions() {
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [expandedQuestion, setExpandedQuestion] = useState(null);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '1400px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', color: '#3178c6' }}>📘 TypeScript 面试题完全指南</h1>
      
      <div style={{ marginBottom: '30px', padding: '20px', background: '#e3f2fd', borderRadius: '8px' }}>
        <h3 style={{ marginTop: 0 }}>📊 题目分布</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', fontSize: '14px' }}>
          <div style={{ padding: '10px', background: '#fff', borderRadius: '5px' }}>
            <strong>基础概念：</strong> 15 题
          </div>
          <div style={{ padding: '10px', background: '#fff', borderRadius: '5px' }}>
            <strong>类型系统：</strong> 12 题
          </div>
          <div style={{ padding: '10px', background: '#fff', borderRadius: '5px' }}>
            <strong>高级类型：</strong> 18 题
          </div>
          <div style={{ padding: '10px', background: '#fff', borderRadius: '5px' }}>
            <strong>泛型应用：</strong> 10 题
          </div>
          <div style={{ padding: '10px', background: '#fff', borderRadius: '5px' }}>
            <strong>实战应用：</strong> 8 题
          </div>
          <div style={{ padding: '10px', background: '#fff', borderRadius: '5px' }}>
            <strong>工程配置：</strong> 7 题
          </div>
        </div>
      </div>

      <Category
        title="1️⃣ 基础概念题（必考）"
        id="basic"
        expanded={expandedCategory === 'basic'}
        onToggle={() => setExpandedCategory(expandedCategory === 'basic' ? null : 'basic')}
        questions={basicQuestions}
        expandedQuestion={expandedQuestion}
        setExpandedQuestion={setExpandedQuestion}
      />

      <Category
        title="2️⃣ 类型系统题"
        id="types"
        expanded={expandedCategory === 'types'}
        onToggle={() => setExpandedCategory(expandedCategory === 'types' ? null : 'types')}
        questions={typeSystemQuestions}
        expandedQuestion={expandedQuestion}
        setExpandedQuestion={setExpandedQuestion}
      />

      <Category
        title="3️⃣ 高级类型题（重点）"
        id="advanced"
        expanded={expandedCategory === 'advanced'}
        onToggle={() => setExpandedCategory(expandedCategory === 'advanced' ? null : 'advanced')}
        questions={advancedTypeQuestions}
        expandedQuestion={expandedQuestion}
        setExpandedQuestion={setExpandedQuestion}
      />

      <Category
        title="4️⃣ 泛型应用题"
        id="generics"
        expanded={expandedCategory === 'generics'}
        onToggle={() => setExpandedCategory(expandedCategory === 'generics' ? null : 'generics')}
        questions={genericsQuestions}
        expandedQuestion={expandedQuestion}
        setExpandedQuestion={setExpandedQuestion}
      />

      <Category
        title="5️⃣ 实战应用题"
        id="practical"
        expanded={expandedCategory === 'practical'}
        onToggle={() => setExpandedCategory(expandedCategory === 'practical' ? null : 'practical')}
        questions={practicalQuestions}
        expandedQuestion={expandedQuestion}
        setExpandedQuestion={setExpandedQuestion}
      />

      <Category
        title="6️⃣ 工程配置题"
        id="config"
        expanded={expandedCategory === 'config'}
        onToggle={() => setExpandedCategory(expandedCategory === 'config' ? null : 'config')}
        questions={configQuestions}
        expandedQuestion={expandedQuestion}
        setExpandedQuestion={setExpandedQuestion}
      />
    </div>
  );
}

function Category({ title, id, expanded, onToggle, questions, expandedQuestion, setExpandedQuestion }) {
  return (
    <div style={{ marginBottom: '20px', border: '2px solid #3178c6', borderRadius: '8px', overflow: 'hidden' }}>
      <div
        onClick={onToggle}
        style={{
          padding: '15px 20px',
          background: expanded ? '#3178c6' : '#f5f5f5',
          color: expanded ? '#fff' : '#000',
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
          {questions.map(q => (
            <QuestionCard
              key={q.id}
              question={q}
              expanded={expandedQuestion === q.id}
              onToggle={() => setExpandedQuestion(expandedQuestion === q.id ? null : q.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function QuestionCard({ question, expanded, onToggle }) {
  return (
    <div style={{ marginBottom: '15px', border: '1px solid #ddd', borderRadius: '5px', overflow: 'hidden' }}>
      <div
        onClick={onToggle}
        style={{
          padding: '12px 15px',
          background: expanded ? '#e8f4fd' : '#fafafa',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'start',
          gap: '10px'
        }}
      >
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>{question.question}</div>
          <div style={{ fontSize: '12px', color: '#666', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <span style={{
              padding: '2px 8px',
              background: question.difficulty === '简单' ? '#e8f5e9' : question.difficulty === '中等' ? '#fff3e0' : '#ffebee',
              color: question.difficulty === '简单' ? '#2e7d32' : question.difficulty === '中等' ? '#e65100' : '#c62828',
              borderRadius: '3px'
            }}>
              {question.difficulty}
            </span>
            {question.tags && question.tags.map(tag => (
              <span key={tag} style={{ padding: '2px 8px', background: '#f5f5f5', borderRadius: '3px' }}>
                {tag}
              </span>
            ))}
          </div>
        </div>
        <span style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.3s', flexShrink: 0 }}>▼</span>
      </div>
      
      {expanded && (
        <div style={{ padding: '20px', background: '#fff', borderTop: '1px solid #eee' }}>
          <pre style={{
            background: '#f5f5f5',
            padding: '15px',
            borderRadius: '5px',
            overflow: 'auto',
            fontSize: '13px',
            lineHeight: '1.6',
            whiteSpace: 'pre-wrap',
            margin: 0
          }}>
            {question.answer}
          </pre>
        </div>
      )}
    </div>
  );
}

// 基础概念题
const basicQuestions = [
  {
    id: 'basic-1',
    question: '1. TypeScript 是什么？与 JavaScript 的关系？',
    difficulty: '简单',
    tags: ['概念'],
    answer: `TypeScript 是 JavaScript 的超集
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

定义：
  TypeScript 是 JavaScript 的超集（Superset），
  添加了静态类型检查和其他特性。

关系：
  JavaScript ⊂ TypeScript
  
  所有有效的 JavaScript 代码都是有效的 TypeScript 代码。

核心特性：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. 静态类型检查
   - 编译时发现错误
   - 更好的代码提示
   
2. 类型推断
   - 自动推断变量类型
   
3. 接口和类型别名
   - 定义复杂数据结构
   
4. 泛型
   - 编写可重用代码
   
5. 枚举
   - 定义常量集合
   
6. 命名空间和模块
   - 代码组织

编译过程：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TypeScript 代码
      ↓
   编译（tsc）
      ↓
 JavaScript 代码
      ↓
   浏览器/Node.js

优势：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ 提前发现错误（编译时）
✅ 更好的 IDE 支持
✅ 代码可维护性强
✅ 重构更安全
✅ 代码即文档

劣势：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

❌ 学习成本
❌ 编译步骤
❌ 初期开发速度慢
❌ 第三方库类型定义`
  },
  {
    id: 'basic-2',
    question: '2. TypeScript 的基本类型有哪些？',
    difficulty: '简单',
    tags: ['类型'],
    answer: `TypeScript 基本类型
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. 原始类型（Primitive Types）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// 布尔值
let isDone: boolean = false;

// 数字（支持十进制、十六进制、二进制、八进制）
let decimal: number = 6;
let hex: number = 0xf00d;
let binary: number = 0b1010;
let octal: number = 0o744;

// 字符串
let name: string = "Alice";
let template: string = \`Hello, \${name}\`;

// null 和 undefined
let u: undefined = undefined;
let n: null = null;

// Symbol（ES6）
let sym: symbol = Symbol("key");

// BigInt（ES2020）
let big: bigint = 100n;


2. 对象类型（Object Types）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// 数组
let list1: number[] = [1, 2, 3];
let list2: Array<number> = [1, 2, 3];

// 元组（Tuple）
let tuple: [string, number] = ["hello", 10];

// 对象
let obj: { name: string; age: number } = {
  name: "Alice",
  age: 25
};

// 函数
let func: (x: number) => number = (x) => x * 2;


3. 特殊类型
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// any - 任意类型（不推荐）
let notSure: any = 4;
notSure = "maybe a string";
notSure = false;

// unknown - 未知类型（推荐代替 any）
let value: unknown = 4;
// value.toFixed(); // Error
if (typeof value === "number") {
  value.toFixed(); // OK
}

// void - 无返回值
function warnUser(): void {
  console.log("This is a warning");
}

// never - 永不返回
function error(message: string): never {
  throw new Error(message);
}

function infiniteLoop(): never {
  while (true) {}
}


4. 枚举（Enum）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// 数字枚举
enum Direction {
  Up = 1,
  Down,
  Left,
  Right
}

// 字符串枚举
enum Color {
  Red = "RED",
  Green = "GREEN",
  Blue = "BLUE"
}


5. 联合类型（Union）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

let value: string | number;
value = "hello";
value = 42;


6. 交叉类型（Intersection）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

type A = { a: number };
type B = { b: string };
type C = A & B;

let c: C = { a: 1, b: "hello" };


7. 字面量类型（Literal Types）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

let direction: "up" | "down" | "left" | "right";
direction = "up"; // OK
// direction = "forward"; // Error

let num: 1 | 2 | 3;
num = 1; // OK


类型层次关系：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

unknown (最宽)
  ↓
any
  ↓
object
  ↓
具体的对象类型
  ↓
never (最窄)`
  },
  {
    id: 'basic-3',
    question: '3. interface 和 type 的区别是什么？',
    difficulty: '中等',
    tags: ['类型', '高频'],
    answer: `interface vs type 详细对比
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

核心区别：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface：
  - 用于定义对象的形状
  - 可以被扩展和实现
  - 支持声明合并

type：
  - 用于定义类型别名
  - 更灵活，可以表示任何类型
  - 不支持声明合并


1. 定义对象类型（相同）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// interface
interface User {
  name: string;
  age: number;
}

// type
type User = {
  name: string;
  age: number;
};


2. 扩展（不同）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// interface 使用 extends
interface Animal {
  name: string;
}

interface Dog extends Animal {
  breed: string;
}

// type 使用交叉类型
type Animal = {
  name: string;
};

type Dog = Animal & {
  breed: string;
};


3. 声明合并（interface 独有）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// interface 可以多次声明，自动合并
interface User {
  name: string;
}

interface User {
  age: number;
}

// 合并后
const user: User = {
  name: "Alice",
  age: 25
};

// type 不能重复声明
type User = { name: string };
// type User = { age: number }; // Error: 重复标识符


4. 联合类型和交叉类型（type 更灵活）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// type 可以表示联合类型
type ID = string | number;

// type 可以表示交叉类型
type Person = { name: string } & { age: number };

// type 可以表示元组
type Point = [number, number];

// interface 不能直接表示这些


5. 映射类型（type 独有）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// type 可以使用映射类型
type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};

// interface 不能使用映射类型


6. 实现类（相同）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// interface
interface Animal {
  name: string;
  move(): void;
}

class Dog implements Animal {
  name = "Dog";
  move() {
    console.log("Moving...");
  }
}

// type
type Animal = {
  name: string;
  move(): void;
};

class Cat implements Animal {
  name = "Cat";
  move() {
    console.log("Moving...");
  }
}


7. 类型别名（type 独有）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// type 可以给原始类型起别名
type Name = string;
type Age = number;
type IsActive = boolean;

// interface 不能给原始类型起别名


使用建议：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ 使用 interface：
  - 定义对象的公共 API
  - 需要扩展和实现
  - 需要声明合并（如扩展第三方库）
  - 定义 React 组件的 Props

✅ 使用 type：
  - 定义联合类型
  - 定义交叉类型
  - 定义元组
  - 定义映射类型
  - 定义工具类型
  - 给原始类型起别名

总结：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

如果能用 interface，优先用 interface（更符合面向对象）
如果需要 type 的特性（联合、映射等），则用 type`
  },
  {
    id: 'basic-4',
    question: '4. 什么是类型断言（Type Assertion）？有几种方式？',
    difficulty: '简单',
    tags: ['类型'],
    answer: `类型断言（Type Assertion）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

定义：
  类型断言是告诉编译器"相信我，我知道我在做什么"的方式。
  手动指定一个值的类型。

两种语法：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. 尖括号语法（不推荐，JSX 中不能使用）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

let someValue: any = "this is a string";
let strLength: number = (<string>someValue).length;


2. as 语法（推荐）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

let someValue: any = "this is a string";
let strLength: number = (someValue as string).length;


使用场景：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. 从 any 类型细化
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

let value: any = "hello";
let length = (value as string).length;


2. DOM 操作
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// querySelector 返回 Element | null
const input = document.querySelector('input') as HTMLInputElement;
input.value = "hello";

// 或者使用非空断言
const input = document.querySelector('input')!;


3. 联合类型细化
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function getLength(value: string | number): number {
  if ((value as string).length !== undefined) {
    return (value as string).length;
  }
  return value.toString().length;
}


4. 第三方库类型不准确
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface MyType {
  name: string;
  age: number;
}

const data = fetchData() as MyType;


双重断言（不推荐）：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// 当类型不兼容时，先断言为 any/unknown，再断言为目标类型
const value = "hello" as unknown as number; // 不推荐


非空断言（!）：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// 告诉编译器这个值不是 null 或 undefined
function getValue(x: string | null) {
  return x!.length; // 确信 x 不是 null
}


const 断言：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// 让 TypeScript 推断出最窄的类型
const colors = ["red", "green", "blue"] as const;
// type: readonly ["red", "green", "blue"]

const config = {
  apiUrl: "https://api.example.com"
} as const;
// type: { readonly apiUrl: "https://api.example.com" }


注意事项：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ 类型断言不是类型转换
   - 只是编译时检查
   - 不会改变运行时的值

⚠️ 不要滥用
   - 只在确定类型时使用
   - 优先使用类型守卫

⚠️ 可能导致运行时错误
   - 断言错误的类型不会报错
   - 但运行时会出错

正确示例：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ✅ 正确：从宽类型断言为窄类型
let value: any = "hello";
let str = value as string;

// ✅ 正确：使用类型守卫
function isString(value: any): value is string {
  return typeof value === "string";
}

if (isString(value)) {
  console.log(value.length); // 类型安全
}

// ❌ 错误：断言为不兼容的类型
let num: number = 123;
// let str = num as string; // Error`
  },
  {
    id: 'basic-5',
    question: '5. 什么是类型守卫（Type Guards）？有哪些方式？',
    difficulty: '中等',
    tags: ['类型', '高频'],
    answer: `类型守卫（Type Guards）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

定义：
  类型守卫是一种在运行时检查类型的表达式，
  用于缩小类型范围（Type Narrowing）。

6 种类型守卫方式：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. typeof 类型守卫（基本类型）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function printValue(value: string | number) {
  if (typeof value === "string") {
    console.log(value.toUpperCase()); // string 类型
  } else {
    console.log(value.toFixed(2)); // number 类型
  }
}

// typeof 返回值：
// "string" | "number" | "bigint" | "boolean" 
// "symbol" | "undefined" | "object" | "function"


2. instanceof 类型守卫（类实例）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class Dog {
  bark() {
    console.log("Woof!");
  }
}

class Cat {
  meow() {
    console.log("Meow!");
  }
}

function makeSound(animal: Dog | Cat) {
  if (animal instanceof Dog) {
    animal.bark(); // Dog 类型
  } else {
    animal.meow(); // Cat 类型
  }
}


3. in 操作符类型守卫（属性检查）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface Bird {
  fly(): void;
  layEggs(): void;
}

interface Fish {
  swim(): void;
  layEggs(): void;
}

function move(animal: Bird | Fish) {
  if ("fly" in animal) {
    animal.fly(); // Bird 类型
  } else {
    animal.swim(); // Fish 类型
  }
}


4. 自定义类型守卫（is 关键字）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// 返回值类型为 value is Type
function isString(value: unknown): value is string {
  return typeof value === "string";
}

function example(value: unknown) {
  if (isString(value)) {
    console.log(value.toUpperCase()); // string 类型
  }
}

// 复杂示例
interface User {
  name: string;
  age: number;
}

function isUser(obj: any): obj is User {
  return (
    obj &&
    typeof obj === "object" &&
    typeof obj.name === "string" &&
    typeof obj.age === "number"
  );
}


5. 字面量类型守卫（判别联合）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface Circle {
  kind: "circle";
  radius: number;
}

interface Square {
  kind: "square";
  sideLength: number;
}

type Shape = Circle | Square;

function getArea(shape: Shape): number {
  switch (shape.kind) {
    case "circle":
      return Math.PI * shape.radius ** 2;
    case "square":
      return shape.sideLength ** 2;
  }
}


6. 可选链和空值合并（简化守卫）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface User {
  name: string;
  address?: {
    city: string;
  };
}

function getCity(user: User): string {
  // 使用可选链
  return user.address?.city ?? "Unknown";
}


类型收窄（Type Narrowing）：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function example(value: string | number | null) {
  // 初始类型：string | number | null
  
  if (value === null) {
    return; // 这个分支 value 是 null
  }
  
  // 这里类型收窄为：string | number
  
  if (typeof value === "string") {
    console.log(value.toUpperCase()); // string
    return;
  }
  
  // 这里类型收窄为：number
  console.log(value.toFixed(2));
}


真值收窄（Truthiness Narrowing）：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function example(value: string | null | undefined) {
  if (value) {
    // value 是 string（排除了 null 和 undefined）
    console.log(value.toUpperCase());
  }
}


等值收窄（Equality Narrowing）：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function example(x: string | number, y: string | boolean) {
  if (x === y) {
    // x 和 y 都是 string（唯一相同的类型）
    x.toUpperCase();
    y.toUpperCase();
  }
}


最佳实践：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ 优先使用 typeof 和 instanceof
✅ 使用自定义类型守卫封装复杂判断
✅ 使用判别联合简化类型守卫
✅ 避免使用类型断言
✅ 使用可选链简化空值检查`
  }
];

// 类型系统题
const typeSystemQuestions = [
  {
    id: 'type-1',
    question: '6. 什么是联合类型和交叉类型？有什么区别？',
    difficulty: '中等',
    tags: ['类型'],
    answer: `联合类型 vs 交叉类型
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

联合类型（Union Types）- 或关系
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

定义：表示一个值可以是几种类型之一
符号：|（竖线）

基本用法：
// 可以是 string 或 number
type ID = string | number;

let id1: ID = "123"; // ✅
let id2: ID = 456; // ✅
// let id3: ID = true; // ❌ Error


对象联合类型：
interface Cat {
  meow(): void;
}

interface Dog {
  bark(): void;
}

type Pet = Cat | Dog;

// Pet 类型只能访问共同属性
function play(pet: Pet) {
  // pet.meow(); // ❌ Error
  // pet.bark(); // ❌ Error
  
  // 需要类型守卫
  if ("meow" in pet) {
    pet.meow(); // ✅
  }
}


交叉类型（Intersection Types）- 且关系
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

定义：将多个类型合并为一个类型
符号：&（And 符号）

基本用法：
interface Person {
  name: string;
}

interface Contact {
  phone: string;
}

type Employee = Person & Contact;

// 必须同时满足两个接口
const employee: Employee = {
  name: "Alice",
  phone: "123-456-7890"
};


实际应用：
// Mixin 模式
function extend<T, U>(first: T, second: U): T & U {
  return { ...first, ...second };
}

const x = { a: 1 };
const y = { b: 2 };
const z = extend(x, y); // { a: number } & { b: number }

console.log(z.a); // 1
console.log(z.b); // 2


区别总结：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

联合类型（|）：
  - 或关系
  - 取值是其中之一
  - 只能访问共同属性
  - 用于表示"多选一"

交叉类型（&）：
  - 且关系
  - 同时满足所有类型
  - 可以访问所有属性
  - 用于组合多个类型


复杂示例：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// 联合类型示例
type Status = "success" | "error" | "loading";

function handleStatus(status: Status) {
  switch (status) {
    case "success":
      console.log("Success!");
      break;
    case "error":
      console.log("Error!");
      break;
    case "loading":
      console.log("Loading...");
      break;
  }
}


// 交叉类型示例
interface Colorful {
  color: string;
}

interface Circle {
  radius: number;
}

type ColorfulCircle = Colorful & Circle;

const cc: ColorfulCircle = {
  color: "red",
  radius: 42
};


// 组合使用
type Shape = Circle | Square;
type ColorfulShape = (Circle | Square) & Colorful;

// 等价于
type ColorfulShape = (Circle & Colorful) | (Square & Colorful);


原始类型的交叉：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// 原始类型的交叉通常是 never
type Impossible = string & number; // never

// 因为没有值既是 string 又是 number`
  },
  {
    id: 'type-2',
    question: '7. 什么是泛型（Generics）？为什么需要泛型？',
    difficulty: '中等',
    tags: ['泛型', '高频'],
    answer: `泛型（Generics）详解
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

定义：
  泛型是一种在定义函数、接口或类时，
  不预先指定具体类型，而是在使用时再指定类型的特性。

为什么需要泛型？
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

问题：没有泛型的代码
// 不使用泛型（any 类型，失去类型检查）
function identity(arg: any): any {
  return arg;
}

let result = identity("hello");
result.toFixed(); // 运行时错误，但编译通过


// 使用泛型（保留类型信息）
function identity<T>(arg: T): T {
  return arg;
}

let result = identity<string>("hello");
// result.toFixed(); // ❌ 编译错误（类型安全）


基本用法：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. 泛型函数
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function identity<T>(arg: T): T {
  return arg;
}

// 显式指定类型
identity<string>("hello");

// 类型推断
identity("hello"); // TypeScript 推断 T 为 string


2. 泛型接口
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface GenericIdentityFn<T> {
  (arg: T): T;
}

let myIdentity: GenericIdentityFn<number> = identity;


3. 泛型类
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class GenericNumber<T> {
  zeroValue: T;
  add: (x: T, y: T) => T;
}

let myGenericNumber = new GenericNumber<number>();
myGenericNumber.zeroValue = 0;
myGenericNumber.add = function(x, y) { return x + y; };


4. 泛型约束
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// 约束泛型必须有 length 属性
interface Lengthwise {
  length: number;
}

function loggingIdentity<T extends Lengthwise>(arg: T): T {
  console.log(arg.length); // ✅ OK
  return arg;
}

loggingIdentity("hello"); // ✅ string 有 length
loggingIdentity([1, 2, 3]); // ✅ array 有 length
// loggingIdentity(3); // ❌ number 没有 length


5. 多个泛型参数
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function pair<T, U>(first: T, second: U): [T, U] {
  return [first, second];
}

let result = pair<string, number>("hello", 42);
// result: [string, number]


6. 泛型默认值
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface Container<T = string> {
  value: T;
}

let a: Container = { value: "hello" }; // T 默认为 string
let b: Container<number> = { value: 42 }; // T 为 number


实际应用场景：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. 数组操作
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function getFirst<T>(arr: T[]): T | undefined {
  return arr[0];
}

let nums = [1, 2, 3];
let first = getFirst(nums); // number | undefined


2. Promise
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function fetchData<T>(url: string): Promise<T> {
  return fetch(url).then(res => res.json());
}

interface User {
  id: number;
  name: string;
}

fetchData<User>("/api/user").then(user => {
  console.log(user.name); // 类型安全
});


3. React 组件
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface Props<T> {
  data: T[];
  renderItem: (item: T) => React.ReactNode;
}

function List<T>(props: Props<T>) {
  return (
    <ul>
      {props.data.map(item => (
        <li>{props.renderItem(item)}</li>
      ))}
    </ul>
  );
}


4. 工具函数
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function pick<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>;
  keys.forEach(key => {
    result[key] = obj[key];
  });
  return result;
}

interface User {
  id: number;
  name: string;
  email: string;
}

const user: User = { id: 1, name: "Alice", email: "alice@example.com" };
const picked = pick(user, ["id", "name"]); // { id: number, name: string }


高级泛型技巧：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. 泛型条件类型
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

type IsString<T> = T extends string ? true : false;

type A = IsString<string>; // true
type B = IsString<number>; // false


2. 泛型推断（infer）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

type ReturnType<T> = T extends (...args: any[]) => infer R ? R : any;

function foo() {
  return { x: 10, y: 20 };
}

type FooReturn = ReturnType<typeof foo>; // { x: number, y: number }


最佳实践：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ 使用泛型而不是 any
✅ 给泛型参数有意义的名字
✅ 添加泛型约束确保类型安全
✅ 使用泛型默认值简化使用
✅ 不要过度使用泛型（保持简单）`
  }
];

// 高级类型题
const advancedTypeQuestions = [
  {
    id: 'advanced-1',
    question: '8. 实现 TypeScript 内置的 Partial<T> 类型',
    difficulty: '中等',
    tags: ['工具类型', '高频', '手写'],
    answer: `实现 Partial<T>
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

作用：
  将类型 T 的所有属性变为可选属性

实现：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

type MyPartial<T> = {
  [P in keyof T]?: T[P];
};

解释：
  - [P in keyof T]: 遍历 T 的所有属性 P
  - ?: 将属性变为可选
  - T[P]: 属性 P 的类型


使用示例：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface User {
  id: number;
  name: string;
  email: string;
}

// 原始类型
const user1: User = {
  id: 1,
  name: "Alice",
  email: "alice@example.com"
}; // 所有属性必须提供

// 使用 Partial
const user2: MyPartial<User> = {
  id: 1
}; // 所有属性都是可选的

// 等价于
const user3: {
  id?: number;
  name?: string;
  email?: string;
} = {
  id: 1
};


实际应用：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// 更新函数
function updateUser(user: User, updates: Partial<User>): User {
  return { ...user, ...updates };
}

const user: User = {
  id: 1,
  name: "Alice",
  email: "alice@example.com"
};

const updated = updateUser(user, {
  name: "Bob" // 只更新 name
});


// React setState
interface State {
  count: number;
  message: string;
}

// setState 接受 Partial<State>
setState(prevState => ({
  count: prevState.count + 1
}));


相关工具类型：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Required<T> - 所有属性必选
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

type MyRequired<T> = {
  [P in keyof T]-?: T[P];  // -? 移除可选
};


2. Readonly<T> - 所有属性只读
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

type MyReadonly<T> = {
  readonly [P in keyof T]: T[P];
};


3. Mutable<T> - 所有属性可写（移除 readonly）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

type MyMutable<T> = {
  -readonly [P in keyof T]: T[P];  // -readonly 移除只读
};


深度 Partial：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object
    ? DeepPartial<T[P]>
    : T[P];
};

interface User {
  name: string;
  address: {
    city: string;
    street: string;
  };
}

const user: DeepPartial<User> = {
  address: {
    city: "New York"
    // street 可以省略
  }
};`
  },
  {
    id: 'advanced-2',
    question: '9. 实现 Pick<T, K> 和 Omit<T, K>',
    difficulty: '中等',
    tags: ['工具类型', '手写'],
    answer: `实现 Pick<T, K> 和 Omit<T, K>
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Pick<T, K> - 选择属性
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

作用：从类型 T 中选择属性集合 K

type MyPick<T, K extends keyof T> = {
  [P in K]: T[P];
};

解释：
  - K extends keyof T: K 必须是 T 的键
  - [P in K]: 遍历 K 中的每个属性
  - T[P]: 获取属性 P 的类型


使用示例：
interface User {
  id: number;
  name: string;
  email: string;
  age: number;
}

type UserPreview = MyPick<User, "id" | "name">;
// 等价于
type UserPreview = {
  id: number;
  name: string;
};

const preview: UserPreview = {
  id: 1,
  name: "Alice"
};


2. Omit<T, K> - 排除属性
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

作用：从类型 T 中排除属性集合 K

type MyOmit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;

// 或者直接实现
type MyOmit<T, K extends keyof any> = {
  [P in Exclude<keyof T, K>]: T[P];
};

解释：
  - Exclude<keyof T, K>: 从 T 的所有键中排除 K
  - 然后 Pick 剩余的键


使用示例：
interface User {
  id: number;
  name: string;
  email: string;
  password: string;
}

type UserWithoutPassword = MyOmit<User, "password">;
// 等价于
type UserWithoutPassword = {
  id: number;
  name: string;
  email: string;
};


实际应用：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. API 响应类型
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
}

// 返回给前端的用户信息（排除敏感信息）
type PublicUser = Omit<User, "password">;


2. 表单类型
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface Post {
  id: number;
  title: string;
  content: string;
  author: string;
  createdAt: Date;
}

// 创建文章的表单（排除自动生成的字段）
type CreatePostForm = Omit<Post, "id" | "createdAt">;


3. 组件 Props
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface ButtonProps {
  onClick: () => void;
  disabled: boolean;
  children: React.ReactNode;
  className: string;
}

// 只需要部分 props
type IconButtonProps = Pick<ButtonProps, "onClick" | "disabled">;


相关工具类型：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Exclude<T, U> - 排除联合类型
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

type MyExclude<T, U> = T extends U ? never : T;

type T1 = Exclude<"a" | "b" | "c", "a">; // "b" | "c"
type T2 = Exclude<string | number, number>; // string


2. Extract<T, U> - 提取联合类型
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

type MyExtract<T, U> = T extends U ? T : never;

type T1 = Extract<"a" | "b" | "c", "a" | "b">; // "a" | "b"
type T2 = Extract<string | number, number>; // number


3. PickByType<T, ValueType> - 按值类型选择
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

type PickByType<T, ValueType> = {
  [P in keyof T as T[P] extends ValueType ? P : never]: T[P];
};

interface User {
  id: number;
  name: string;
  age: number;
  email: string;
}

type StringProps = PickByType<User, string>;
// { name: string; email: string }


4. OmitByType<T, ValueType> - 按值类型排除
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

type OmitByType<T, ValueType> = {
  [P in keyof T as T[P] extends ValueType ? never : P]: T[P];
};

type NonStringProps = OmitByType<User, string>;
// { id: number; age: number }`
  },
  {
    id: 'advanced-3',
    question: '10. 实现 ReturnType<T> 和 Parameters<T>',
    difficulty: '困难',
    tags: ['工具类型', 'infer', '手写'],
    answer: `实现 ReturnType<T> 和 Parameters<T>
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. ReturnType<T> - 获取函数返回值类型
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

type MyReturnType<T extends (...args: any) => any> = 
  T extends (...args: any) => infer R ? R : any;

解释：
  - T extends (...args: any) => any: 约束 T 必须是函数
  - infer R: 推断返回值类型，并赋值给 R
  - 返回 R，如果匹配失败返回 any


使用示例：
function getUserInfo() {
  return {
    name: "Alice",
    age: 25,
    email: "alice@example.com"
  };
}

type UserInfo = MyReturnType<typeof getUserInfo>;
// { name: string; age: number; email: string }


async function fetchData() {
  return { data: "hello" };
}

type FetchResult = MyReturnType<typeof fetchData>;
// Promise<{ data: string }>


2. Parameters<T> - 获取函数参数类型
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

type MyParameters<T extends (...args: any) => any> = 
  T extends (...args: infer P) => any ? P : never;

解释：
  - infer P: 推断参数类型（元组类型）
  - 返回 P（参数元组）


使用示例：
function createUser(name: string, age: number, email: string) {
  return { name, age, email };
}

type CreateUserParams = MyParameters<typeof createUser>;
// [string, number, string]

// 使用
function wrapper(...args: CreateUserParams) {
  return createUser(...args);
}


3. ConstructorParameters<T> - 获取构造函数参数
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

type MyConstructorParameters<T extends abstract new (...args: any) => any> = 
  T extends abstract new (...args: infer P) => any ? P : never;

使用示例：
class User {
  constructor(public name: string, public age: number) {}
}

type UserParams = MyConstructorParameters<typeof User>;
// [string, number]


4. InstanceType<T> - 获取构造函数返回的实例类型
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

type MyInstanceType<T extends abstract new (...args: any) => any> = 
  T extends abstract new (...args: any) => infer R ? R : any;

使用示例：
class User {
  name: string;
  age: number;
  
  constructor(name: string, age: number) {
    this.name = name;
    this.age = age;
  }
}

type UserInstance = MyInstanceType<typeof User>;
// User


5. ThisParameterType<T> - 获取函数的 this 类型
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

type MyThisParameterType<T> = 
  T extends (this: infer U, ...args: any[]) => any ? U : unknown;

使用示例：
function toHex(this: Number) {
  return this.toString(16);
}

type T = MyThisParameterType<typeof toHex>; // Number


实际应用：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. 高阶函数类型推断
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function memoize<T extends (...args: any[]) => any>(fn: T): T {
  const cache = new Map<string, ReturnType<T>>();
  
  return ((...args: Parameters<T>) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key)!;
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
}


2. API 响应类型推断
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async function fetchUser(id: number) {
  const response = await fetch(\`/api/users/\${id}\`);
  return response.json();
}

type User = Awaited<ReturnType<typeof fetchUser>>;


3. 事件处理器类型
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function handleClick(event: MouseEvent, data: string) {
  console.log(event, data);
}

type ClickHandler = typeof handleClick;
type ClickParams = Parameters<ClickHandler>;
// [MouseEvent, string]


高级应用：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. 获取异步函数的返回值类型
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

type Awaited<T> = T extends Promise<infer U> ? U : T;

type AsyncReturnType<T extends (...args: any) => Promise<any>> = 
  Awaited<ReturnType<T>>;

async function getData() {
  return { id: 1, name: "Alice" };
}

type Data = AsyncReturnType<typeof getData>;
// { id: number; name: string }


2. 获取第 N 个参数的类型
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

type NthParameter<T extends (...args: any) => any, N extends number> = 
  Parameters<T>[N];

function example(a: string, b: number, c: boolean) {}

type FirstParam = NthParameter<typeof example, 0>; // string
type SecondParam = NthParameter<typeof example, 1>; // number`
  }
];

// 泛型应用题
const genericsQuestions = [
  {
    id: 'generic-1',
    question: '11. 实现一个类型安全的深度克隆函数',
    difficulty: '困难',
    tags: ['泛型', '实战'],
    answer: `类型安全的深度克隆
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

实现：
function deepClone<T>(obj: T): T {
  // 处理基本类型和 null
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  // 处理日期
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as T;
  }

  // 处理数组
  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item)) as T;
  }

  // 处理对象
  const clonedObj = {} as T;
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      clonedObj[key] = deepClone(obj[key]);
    }
  }

  return clonedObj;
}

// 使用示例
interface User {
  id: number;
  name: string;
  address: {
    city: string;
    zipCode: string;
  };
  tags: string[];
}

const user: User = {
  id: 1,
  name: "Alice",
  address: {
    city: "NYC",
    zipCode: "10001"
  },
  tags: ["admin", "user"]
};

const cloned = deepClone(user);
// cloned 的类型是 User，保持类型安全`
  }
];

// 实战应用题
const practicalQuestions = [
  {
    id: 'practical-1',
    question: '12. 如何为第三方库添加类型声明？',
    difficulty: '中等',
    tags: ['声明文件', '实战'],
    answer: `为第三方库添加类型声明
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

方法 1：使用 @types 包
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// 安装类型声明包
npm install --save-dev @types/lodash

// 直接使用
import _ from 'lodash';


方法 2：创建声明文件（.d.ts）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// src/types/my-library.d.ts
declare module 'my-library' {
  export function doSomething(value: string): number;
  export class MyClass {
    constructor(name: string);
    getName(): string;
  }
}

// 使用
import { doSomething } from 'my-library';
doSomething("hello");


方法 3：全局类型扩展
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// src/types/global.d.ts
declare global {
  interface Window {
    myCustomProperty: string;
  }
}

export {};

// 使用
window.myCustomProperty = "value";


方法 4：模块扩展
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// 扩展已有模块
declare module 'axios' {
  export interface AxiosRequestConfig {
    customOption?: string;
  }
}

// 使用
import axios from 'axios';
axios.get('/api', { customOption: 'value' });


最佳实践：
✅ 优先使用 @types 包
✅ 将声明文件放在 src/types 目录
✅ 在 tsconfig.json 中包含类型目录
✅ 使用 declare module 而不是 namespace`
  }
];

// 工程配置题
const configQuestions = [
  {
    id: 'config-1',
    question: '13. tsconfig.json 的重要配置项有哪些？',
    difficulty: '中等',
    tags: ['配置', '工程化'],
    answer: `tsconfig.json 重要配置详解
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

{
  "compilerOptions": {
    // 基础选项
    "target": "ES2020",              // 编译目标
    "module": "ESNext",              // 模块系统
    "lib": ["ES2020", "DOM"],        // 包含的类型库
    
    // 严格检查
    "strict": true,                  // 启用所有严格检查
    "strictNullChecks": true,        // null 检查
    "strictFunctionTypes": true,     // 函数类型检查
    "noImplicitAny": true,          // 禁止隐式 any
    "noImplicitThis": true,         // 禁止隐式 this
    
    // 模块解析
    "moduleResolution": "node",      // 模块解析策略
    "baseUrl": "./src",             // 基础路径
    "paths": {                      // 路径映射
      "@/*": ["*"],
      "@components/*": ["components/*"]
    },
    "esModuleInterop": true,        // ES 模块互操作
    "allowSyntheticDefaultImports": true,
    
    // 输出
    "outDir": "./dist",             // 输出目录
    "declaration": true,            // 生成 .d.ts
    "declarationMap": true,         // 生成声明文件映射
    "sourceMap": true,              // 生成 source map
    
    // 其他
    "skipLibCheck": true,           // 跳过类型库检查
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,      // 支持导入 JSON
    "jsx": "react-jsx"              // JSX 编译方式
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}`
  }
];

export { TypeScriptInterviewQuestions }
