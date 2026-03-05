import React from 'react';

// 模拟接口
const mockData = {
  code: 0,
  data: {list: ['Alice', 'A1', 'A2', 'Blice', 'B1', 'B2', 'abc', 'bac']},
};
const getList = (str, signal) =>
  new Promise(resolve => {
    let timer = setTimeout(() => {
      const data = str ? mockData.data.list.filter(i => i.includes(str)) : [];
      resolve({...mockData, data: {list: data}});
    }, Math.random() * 800);
    signal?.addEventListener('abort', () => clearTimeout(timer));
  });

// 生产级防抖
function useDebounce(fn, wait) {
  const timerRef = React.useRef(null);
  const fnRef = React.useRef(fn);
  React.useEffect(() => {
    fnRef.current = fn;
  }, [fn]);
  return React.useCallback(
    (...args) => {
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => fnRef.current(...args), wait);
    },
    [wait]
  );
}

// 🔥 终极满分组件
export  function AutoComplete() {
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
      if (ctrl.signal.aborted || seq !== seqRef.current) return;
      setList(res.data.list);
    } catch (e) {
      if (e.name === 'AbortError') return;
    } finally {
      if (seq === seqRef.current) setLoading(false);
    }
  }, 300);

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

  return (
    <div ref={rootRef} style={{position: 'relative', width: 200}}>
      <input
        value={value}
        onChange={handleChange}
        onFocus={() => setShow(true)}
        ref={el => el?.focus()}
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
