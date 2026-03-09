import React from 'react'

export function Test () {
  const [count, setCount] = React.useState(0);
  const fn = () => {
    setInterval(() => {
      console.log('test fn', count);
    }, 1000);
  }
  console.log(count);
  
  React.useEffect(() => {
    // fn();
  }, []);
  return (
    <div onClick={() => setCount(count + 1)}>
      Test {count}
    </div>
  )
}