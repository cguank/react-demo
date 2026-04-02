import React from 'react'

function Child ({ count }) {
  const ref = React.useRef(null)
  React.useLayoutEffect(() => {
      
    console.log('uselayout', count, ref.current);
      console.log(document.querySelector('#child-root'));
    
      return () => {
      console.log(document.querySelector('#child-root'));
    
        console.log('uselayout destroy', count, ref.current);
      };
    }, [count]);
    React.useEffect(() => {
      console.log('useEffect', count);
      return () => {
        console.log('useEffect destroy', count);
      };
    }, [count]);
  
  React.useEffect(() => {
    return () => {
      console.log('=========useEffect',ref.current);
      console.log(document.querySelector('#child-root'));
      
    }
  },[])
  
  React.useLayoutEffect(() => {
    return () => {
      console.log('=========uselayout',ref.current);
      console.log(document.querySelector('#child-root'));
      
    }
  },[])
  
  return count % 2 ? <div ref={ref}>child</div> : <h1 ref={ref}>child</h1>
}

export function Test () {
  const [count, setCount] = React.useState(0);
  const fn = () => {
    setInterval(() => {
      console.log('test fn', count);
    }, 1000);
  }
  console.log(count);

  React.useEffect(() => {
    setTimeout(() => {
      console.log('setTimeout',count);
      
    }, 10000);
  },[])
  
  React.useEffect(() => {
    // fn();
    window.addEventListener('fetch', (e) => {
      try {
        console.log('fetch', e);
      } catch (error) {
        console.log('fetch error', error);
      }
    })
  }, []);
  return (
    <div>
      {count && <Child count={count} />}
      <div style={{display: 'inline-flex'}}>
        <div
          class="item"
          style={{flexGrow: 1, flexBasis: 200}}
          onClick={() => {
            setCount(0);
          }}>
          我是一段很长很长很长很长很长很长的内容
          我是一段很长很长很长很长很长很长的内容
          我是一段很长很长很长很长很长很长的内容
        </div>
        <div class="item" style={{flexGrow: 1, flexBasis: 100}}>
          短内容
        </div>
      </div>

      <h2>情况2：flex-basis: 0%</h2>
      <div class="box" style={{display: 'inline-flex'}}>
        <div
          class="item"
          style={{flexGrow: 1, flexBasis: '0%'}}
          onClick={() => {
            setCount(count + 1);
          }}>
          我是一段很长很长很长很长很长很长的内容
          我是一段很长很长很长很长很长很长的内容
          我是一段很长很长很长很长很长很长的内容
        </div>
        <div class="item" style={{flexGrow: 1, flexBasis: '0%'}}>
          短内容
        </div>
      </div>
    </div>
  );
}