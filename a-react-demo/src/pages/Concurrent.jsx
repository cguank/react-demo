import React from 'react'

export function Concurrent () {
  const [count, setCount] = React.useState(-10000);
  const ref = React.useRef(null)

  const handleClick = () => {
    console.log('click');
    setCount(c => {
      console.log('....update render count', c);
      return c-20000
    });
  }

  React.useEffect(() => {
    setTimeout(() => {
        setCount(c=>c+30000)
      }, 0);
      setTimeout(() => {
        ref.current?.click()
      }, 0);
  },[])
  React.useEffect(() => {
    const msgChannel = new MessageChannel();
    const port = msgChannel.port2
    msgChannel.port1.onmessage = (e) => {
      console.log('........',e);
    }
    setTimeout(() => {
      port.postMessage(null)
    }, 2000);
  },[])

  return (
    <div onClick={handleClick} ref={ref}>{count}</div>
  )
}