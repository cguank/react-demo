import React from 'react'


const states = [];
let index = 0;
let isMount = true;

function handleAction(lastState, action) {
  return typeof action === 'function' ? action(lastState) : action;
}
function dispatch(index) {
  return function(action) {
    const oldValue = states[index];
    const newValue = handleAction(states[index], action);
    states[index][0] = newValue;
  };
}
function useState(value) {
  const currentIndex = index++;
  if (isMount) {
    states[currentIndex] = [value, dispatch(currentIndex)];
  }
  return states[currentIndex];
}
export function Props () {
  console.log('props render');
  return (
    <div onClick={()=>{console.log('sdfsf');}}>Props page</div>
  )
}