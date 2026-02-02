import React,{} from 'react';

export function APage() {
  const [count, setCount] = React.useState(0);
  const [secondCountDownConfig, seta] = React.useState(10)
  
  React.useLayoutEffect(() => {
    for (let i = 0; i < 40000; i++) {
      console.log('i', count, i);
    }
  }, [count]);

  React.useEffect(() => {
    window.addEventListener('click', (e) => {
      console.log(e);
    })
  },[])

  return (
    <div onClick={() => setCount(count + 1)}>
      click me {count}
    </div>
  );
}
