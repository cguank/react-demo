import React, {useState} from 'react';

export function Diff() {
  return (
    <Clicker>
      <ComponentToRender />
    </Clicker>
  );
}

function Clicker({children}) {
  const [count, setCount] = useState(0);
  console.log('./......clicker', count);
  return (
    <div className="clicker">
      <h2>You clicked {count} times!</h2>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      {children}
      {/* <ComponentToRender /> */}
    </div>
  );
}

function ComponentToRender() {
  const count = React.useRef(0);

  console.log('component rendered', count.current++);


  return (
    <div className="ComponentToRender">
      <p>sub</p>
    </div>
  );
}
