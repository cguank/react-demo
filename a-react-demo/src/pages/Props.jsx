import React from 'react'

export function Props () {
  console.log('props render');
  return (
    <div onClick={()=>{console.log('sdfsf');}}>Props page</div>
  )
}