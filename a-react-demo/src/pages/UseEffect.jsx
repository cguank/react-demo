import React from 'react';

function Child ({ count }) {
  const [childCount, setChildCount] = React.useState(0)
  return <div onClick={()=>setChildCount(childCount+1)}>click me child {count} { childCount }</div>
}

export function UseEffect () {
  
  const [count, setCount] = React.useState(0)
  const [text, setText] = React.useState('')
  /**
   * #1 触发rerender
   */
  // if (!count) {
  //   setCount(1000)
  // }

  const cb = React.useCallback((a) => {
    console.log('...usecallback', text, a, count);
  },[text])

  //  React.useLayoutEffect(() => {
  //   console.log('Hello layout Effect', count);
  //   return () => {
  //     console.log('Hello destroy layout Effect', count);
  //   };
  // }, [count]);
  // React.useEffect(() => {
  //   console.log('Hello count Effect', count);
  //   setText(`thisis text ${count}`)
  //   return () => {
  //     console.log('destroy count effect', count);
  //   }
  // }, [count]);
  // React.useEffect(() => {
  //   console.log('Hello text Effect', text);
  //   // setText(`thisis text ${count}`)
  //   return () => {
  //     console.log('destroy text effect', text);
  //   }
  // }, [text]);


  // React.useState(() => {
  //   // eslint-disable-next-line
  // const [count1,setCount1] = React.useState(0)
   
  // },[])

  // React.useEffect(() => {
  //   console.log('......count create', count);
  //   return () => {
  //     console.log('........count destroy', count);
  //   }
  // }, [count])
  
  // React.useLayoutEffect(() => {
  //   const now = performance.now();
  //   while (performance.now() - now < 1000) { }
  //   // setCount(0)
  // },[count])

  return (
    <>
      {/* {count===0 ? <h3>{ count } <span>child</span></h3> : null} */}
      <div onClick={() => {
        console.log('.....click', count);
        setCount(count+1)
        setCount(count+1)
        setText('this is text 0')
        setText('this is text 1')
        cb(`a count ${count}`)
        // setCount(0)
      }}>click me {text} { count }</div>
      {/* <Child count={count} /> */}
    </>
  )
}