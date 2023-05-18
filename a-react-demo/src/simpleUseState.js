let isMount = true;
let workInProgressHook;
const fiber = {
  memoizedState: undefined,
  stateNode: SimpleUseState
}

function schedule() {
  workInProgressHook = fiber.memoizedState;
  window.app = fiber.stateNode()
  isMount = false;
}

function processAction(action, lastState) {
  if (typeof action === 'function') {
    return action(lastState)
  }
  return action;
}
function dispatch (hook, action) {
  const update = {
    action,
    next: null,
  }
  if (!hook.pending) {
    update.next = update;
  } else {
    update.next = hook.pending.next;
    hook.pending.next = update;
  }
  hook.pending = update;

  schedule();
}
function myUseState (initialState) {
  let hook;
  if (isMount) {
    hook = {
      memoizedState: processAction(initialState),
      pending: null,
      next: null,
    };
    if (!fiber.memoizedState) {
      fiber.memoizedState = hook;
    } else {
      workInProgressHook.next = hook;
    }
    workInProgressHook = hook;
  } else {
    hook = workInProgressHook
    workInProgressHook = workInProgressHook.next;
  }
  if (hook.pending) {
    let firstUpdate = hook.pending.next;
    let newState = hook.memoizedState;
    do {
      newState = processAction(firstUpdate.action);
      firstUpdate = firstUpdate.next;
    } while (firstUpdate !== hook.pending.next);
    hook.memoizedState = newState
    hook.pending = null;
  }
  return [hook.memoizedState, dispatch.bind(null, hook)]
}

function SimpleUseState () {
  const [count, setCount] = myUseState(0)
  const [text, setText] = myUseState('')
  console.log(count,text);
  return {
    click: () => {
      setCount(count+1)
        setCount(count+1)
        setText('this is text 0')
        setText('this is text 1')
    }
  }
}
schedule()