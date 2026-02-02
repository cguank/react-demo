import React from 'react';
let sequence = 0
const useTry = (query) => {
  const delay = Math.random() * 2000;
  React.useEffect(() => {
    let isQuery = false;
    setTimeout(() => {
      // console.log('create settimeout', query);
      if (!isQuery) {
        console.log('.......delay', Number(delay / 1000).toFixed(2), query);
      }
    }, delay);
    return () => {
      console.log('destroy query', query);
      isQuery = true;
    };
  },[query])
}

const useSequence = () => {
  const sequence = React.useRef(0);
  console.log('......render usesequecne ');
  return (query) => {
    const delay = Math.random() * 2000;
    sequence.current++;
    const requestOrder = sequence.current;
    setTimeout(() => {
      if (requestOrder === sequence.current) {
        console.log('.........hit', query, sequence.current, requestOrder);
      } else {
        console.log('.......useseqeuce', query, sequence.current, requestOrder);
      }
    }, delay);
  }
}
function onlyResolvesLast(fn) {
  // 利用闭包保存最新的请求 id
  let id = 0;
  
  const wrappedFn = (...args) => {
    // 发起请求前，生成新的 id 并保存
    const fetchId = id + 1;
    id = fetchId;
    
    // 执行请求
    const result = fn.apply(this, args);
    
    return new Promise((resolve, reject) => {
      // result 可能不是 promise，需要包装成 promise
      Promise.resolve(result).then((value) => {
        // 只处理最新一次请求
        if (fetchId === id) { 
          resolve(value);
        }
      }, (error) => {
        // 只处理最新一次请求
        if (fetchId === id) {
          reject(error);
        }
      });
    })
  };
  
  return wrappedFn;
}

const getApi = (query) => {
  const delay = Math.random() * 2000;
  return new Promise(r => {
    setTimeout(() => {
      // console.log('.........hit', query, delay);
      r(query)
    }, delay);
  })
  
}
  const fetch = onlyResolvesLast(getApi);

export function SearchUser() {
  const [query, setQuery] = React.useState('')
  const aa = (() => `${query} abcd`)();
  // useTry(query)
  // const fetch = useSequence();
  const handleSearch = async (query) => {
    const res = await fetch(query);
    console.log('......this is', res);
  }
  return (
    <>
      <input value={query} onChange={e => {
        setQuery(e.target.value);
        handleSearch(e.target.value)
      }} />
      <h5>{query}</h5>
      <h5>{ aa}</h5>
    </>
  );
}
