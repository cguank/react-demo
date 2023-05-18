import React from 'react'

function Child () {
  console.log('child render');
  const [count, setCount] = React.useState(100)
  return <div onClick={()=>setCount(count+1)}>child { count }</div>
}

function Parent ({ count }) {
  console.log('parent render');

  return (<>
    <div>parent {count}</div>
    <Child  />
  </>)
}

export function BailOut () {
  const [count, setCount] = React.useState(0)
  const handleClick = () => {
    console.log('click');
    setCount(count + 1)
  }
  return (
    <>
      <div onClick={handleClick}>click me</div>
      <Parent  />
    </>
  )
}