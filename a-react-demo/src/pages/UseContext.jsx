import React from 'react'

const Context = React.createContext(-1);

function Child (params) {
  console.log('.....CHild..Context', Context);
  const count = React.useContext(Context)
  const [number,setNumber] = React.useState(100)
  return <div onClick={()=>setNumber(number+1)}>{ `this is ${count} in child ${number}` }</div>
}

function Parent() {
  console.log('.....Parent..Context', Context);
  return (
    <>
      <h3>this is parent</h3>
      <Child />
    </>
  );
}

export function UseContext () {
  const [count, setCount] = React.useState(0);

  return (
    <Context.Provider value={count}>
      <div onClick={() => setCount(count + 1)}>click me</div>
      <Parent />
    </Context.Provider>
  );
}