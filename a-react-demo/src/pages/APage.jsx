import React from 'react'
import { Link, BrowserRouter as Router, Route, Routes } from 'react-router-dom'

export function APage () {
  const [count, setCount] = React.useState(0)

  React.useEffect(() => {
    console.log('.....count create', count);
    return () => {
      console.log('......destroy', count);
    }
  }, [count])
  return (
    <span onClick={() => setCount(count + 1)}>click me { count }</span>
    // <div className="App">
    //   <span onClick={() => setCount(count + 1)}>click me</span>
    //   <p>
    //     <h5>{count}</h5>
    //     <strong>{count}</strong>
    //   </p>
    //   <h4>no change</h4>
    // </div>
  );
}