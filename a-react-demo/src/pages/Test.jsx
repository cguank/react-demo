import React from 'react'

function Child ({ count }) {
  const ref = React.useRef(null)
  const divRef = React.useRef(null)
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
  const divRef = React.useRef(null)

  React.useEffect(() => {
    setTimeout(() => {
      console.log('...........1111',count);
      
      setCount(c=>c+101);    
      console.log('...........2222',count);
       
    }, 1000);
  }, []);
  React.useEffect(() => {
    if (!divRef.current) return;
    console.log('====',count);
      setCount(c=>c+11);    
       console.log(count);
       
      divRef.current.style.opacity = 1
    },[])
  
  return (
    <div>
      <div ref={divRef}>this is div 11 { count }</div>
      <div contentEditable="true">abc11d</div>

      <div style={{ display: 'inline-flex' }} ref={React.useCallback((el)=>{
        console.log('...el',el);
      },[])}>
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