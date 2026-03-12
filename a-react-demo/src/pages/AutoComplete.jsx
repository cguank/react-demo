import React from 'react';

// 模拟接口
const mockData = {
  code: 0,
  data: {list: ['Alice', 'A1', 'A2', 'Blice', 'B1', 'B2', 'abc', 'bac']},
};
const getList = (str, signal) =>
  new Promise((resolve, reject) => {
    let timer = setTimeout(() => {
      const data = str ? mockData.data.list.filter(i => i.includes(str)) : [];
      resolve({...mockData, data: {list: data}});
    }, Math.random() * 2000);
    // 实际上这里没有必要调用removeEventListener。
    // 因为signal对象的生命周期通常只对应这一次请求，并且该promise只会resolve或reject一次。
    // 一旦事件触发（abort），该promise流程就结束，注册的事件监听也会随之被垃圾回收。
    // 除非代码中会多次重用同一个signal对象，并多次调用getList，否则此处不需要removeEventListener。
    // 通常情况下，如果对象（如AbortController的signal）被垃圾回收，绑定在其上的事件监听器也会随之被回收，除非有某处代码保存了对监听器的引用或强引用，致使其无法被释放。
    // 只有在你重用同一个signal对象多次重复addEventListener时，才有必要在不需要监听时调用removeEventListener以避免内存泄露。
    // 对于one-off的事件和对象的正常生命周期，通常不需要手动removeEventListener。
    signal?.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(new DOMException('reject AbortError', 'AbortError'));
    });
  });

// 生产级节流
function useThrottle(fn, wait) {
  const lastCall = React.useRef(0);
  const timeout = React.useRef(null);
  const lastArgs = React.useRef();
  const fnRef = React.useRef(fn);

  React.useEffect(() => {
    fnRef.current = fn;
  }, [fn]);

  React.useEffect(() => {
    return () => {
      if (timeout.current) clearTimeout(timeout.current);
    };
  }, []);

  return React.useCallback((...args) => {
    const now = Date.now();
    const remaining = wait - (now - lastCall.current);
    lastArgs.current = args;
    if (remaining <= 0) {
      if (timeout.current) {
        clearTimeout(timeout.current);
        timeout.current = null;
      }
      lastCall.current = now;
      fnRef.current(...args);
    } else if (!timeout.current) {
      timeout.current = setTimeout(() => {
        lastCall.current = Date.now();
        timeout.current = null;
        fnRef.current(...lastArgs.current);
      }, remaining);
    }
  }, [wait]);
}
// 生产级防抖
function useDebounce(fn, wait) {
  const timerRef = React.useRef(null);
  const fnRef = React.useRef(fn);
  React.useEffect(() => {
    fnRef.current = fn;
  }, [fn]);

  React.useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return React.useCallback(
    (...args) => {
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => fnRef.current(...args), wait);
    },
    [wait]
  );
}

// 🔥 终极满分组件
export function AutoComplete() {
  const [value, setValue] = React.useState('');
  const [list, setList] = React.useState([]);
  const [show, setShow] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  // 用来取消无效请求
  const abortRef = React.useRef(null);
  const rootRef = React.useRef(null);
  // 用来控制loading，防止闪烁
  // case 先后A请求，B请求。A请求先到则会取消loading
  const seqRef = React.useRef(0);

  // 防抖请求 + 时序 + loading 不乱
  const fetchList = useDebounce(async val => {
    const seq = ++seqRef.current;
    setLoading(true);
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      const res = await getList(val, ctrl.signal);
      if (ctrl.signal.aborted) {
        console.log('=======req abort', seq, seqRef.current);
        return;
      }
      setList(res.data.list);
    } catch (e) {
      if (e.name === 'AbortError') {
        console.log('=======req abort abort reject', e);
        return;
      }
    } finally {
      if (seq === seqRef.current) setLoading(false);
    }
  }, 0);

  // 输入
  const handleChange = e => {
    setValue(e.target.value);
    setShow(true);
    fetchList(e.target.value);
  };

  // 点击回填
  const handleItemClick = item => {
    setValue(item);
    setList([]);
    setShow(false);
  };

  // 卸载清理
  React.useEffect(() => () => abortRef.current?.abort(), []);

  // 点击外部关闭
  React.useEffect(() => {
    const handleClick = e =>
      !rootRef.current?.contains(e.target) && setShow(false);
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  // 加上useCallback防止重复渲染，只会在挂载时执行一次，卸载时执行一次
  const inputRef = React.useCallback(el => {
    {
      console.log('===========ref el', el);
      el?.focus();
    }
  }, []);

  return (
    <div ref={rootRef} style={{position: 'relative', width: 200}}>
      <input
        value={value}
        onChange={handleChange}
        onFocus={() => setShow(true)}
        ref={inputRef}
      />
      {show && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            border: '1px solid #ddd',
            background: '#fff',
            zIndex: 999,
          }}>
          {loading && <div>loading...</div>}
          {!loading && list.length === 0 && <div>无数据</div>}
          {!loading &&
            list.map(item => (
              <div
                key={item}
                onClick={() => handleItemClick(item)}
                style={{padding: 6, cursor: 'pointer'}}>
                {item}
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
