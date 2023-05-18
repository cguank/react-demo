import React from 'react';

export function List () {
  const [data, setData] = React.useState([
    { key: '3', text: '0' },
    { key: '0', text: '1' },
    { key: '0', text: '2' },
  ]);
  // const [data, setData] = React.useState([
  //   { key: '0', text: '0' },
  //   { key: '1', text: '1' },
  //   { key: '2', text: '2' },
  // ]);

  const resortData = [
    { key: '0', text: '4' },
    { key: '0', text: '0' },
    { key: '0', text: '2' },
    // { key: '1', text: '1' },
  ]

  return (
    <>
      {/* <div onClick={()=>setData([{key:data.length,text:data.length},...data,])}>insert top</div> */}
      {/* <div onClick={()=>setData([...data,{key:data.length,text:data.length}])}>insert bottom</div> */}
      <div onClick={()=>setData([{key:'0',text:data.length},...data,])}>insert</div>
      <div onClick={()=>setData(resortData)}>resort</div>
      {data.map((item,index) => {
        return (
          <div key={item.key}>
            <input   placeholder={item.text} />
            <span onClick={() => {
                        setData(data.slice(0,index).concat(data.slice(index+1)))

            }}>remove</span>
          </div>
        )
      })}
    </>
  )
}