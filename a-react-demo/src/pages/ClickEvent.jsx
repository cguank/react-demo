import React from 'react'

export function ClickEvent () {
  const [count,setCount] = React.useState(0)

  return (
    <div onClick={() => console.log('click div')}>
      <img
        style={{width:100}}
        src="xx"
        onLoad={() => {
          console.log('load img');
        }}
        onClick={() => {
          setCount(count+1)
          console.log('click image');
        }}
      />
      <h3>123123</h3>
    </div>
  );
}
