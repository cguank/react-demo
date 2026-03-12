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
    window.addEventListener('fetch', (e) => {
      try {
        console.log('fetch', e);
      } catch (error) {
        console.log('fetch error', error);
      }
    })
  }, []);
  return (
    <div style={{textAlign:'center',lineHeight:'100vh'}}>
      <span>aaaa</span>
   </div>
  );
}