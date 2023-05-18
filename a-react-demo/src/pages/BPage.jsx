import React from 'react'
import { Props} from './Props'

export function BPage () {
  const [count,setCount] = React.useState(0)
  React.useEffect(() => {
    console.log('.....b page create');
    return () => {
      console.log('...bpage destroy');
    }
  },[])
  return (
    <>
      <div onClick={()=>{setCount(count+1)}}>B page { count }</div>
      <Props />
      {/* <Props handleClick={() => { console.log('clicked');setCount(count+1)}} /> */}
    </>
  )
}