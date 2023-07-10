import React from 'react'

export function UseRef () {
  const ref = React.useRef(null);
  const [count, setcount] = React.useState(0);
  console.log('.......ref', ref);
  const fn = React.useCallback((el) => {
    console.log('this is ref', el);
    ref.current = el;
  },[ref])

  return (
    <div onClick={() => {
      console.log('setcount',count);
      setcount(count + 1);
    }} ref={fn}>
      click me {count}
    </div>
  )
}