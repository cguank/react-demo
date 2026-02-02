import React from 'react';

const LOGIN_API = 'http://localhost:8080/user/login'
const HELLO_API = 'http://localhost:8080/hello';
const FETCH_BASIC_OPTIONS = {
  mode: 'cors',
  credentials: 'include',
};
export function WebSocketTest () {
  const ws = React.useRef();

  React.useEffect(() => {
   ws.current = new WebSocket('ws://localhost:8080/');

    ws.current.onmessage = (msg) => {
      console.log('client receive', msg);
    }
    return ()=>ws.current.close()
  }, [ws]);

  const handleclick = () => {
    ws.current.send('abcdefg')
  }
  const handleHello = async () => {
    const res = await (await fetch(HELLO_API,FETCH_BASIC_OPTIONS)).text();
    console.log(res);
  };
  const handleLogin = async () => {
    const options = {
      ...FETCH_BASIC_OPTIONS,
      body: JSON.stringify({
        name: `user ${Math.floor(Math.random() * 10)}`,
        password: 'root',
      }),
      method: 'post',
      headers: {'Content-Type': 'application/json'},
    };
    const res = await (await fetch(LOGIN_API, options)).text();
    console.log(res);
  };
  return (
    <>
      <div onClick={handleclick}>ws</div>
      <div onClick={handleHello}>hello</div>
      <div onClick={handleLogin}>login</div>

    </>
  );
}
