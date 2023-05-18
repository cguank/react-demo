import React from 'react';

export function SingleChld() {
  const [flag, setFlag] = React.useState(false);
  const handleClick = () => {
    setFlag(!flag);
  };
  React.useLayoutEffect(() => {
    console.log('parent layout create');
    return () => {
      console.log('parent layout destroy');
    };
  }, [flag]);
  function Single(params) {
    React.useLayoutEffect(() => {
      console.log('single layout create');
      return () => {
        console.log('single layout destroy');
      };
    }, []);
    React.useEffect(() => {
      console.log('single effect create');
      return () => {
        console.log('single effect destroy');
      };
    }, []);
    return (
      <div onClick={handleClick}>
        single 1 <span className={flag ? 'true' : 'false'}>aaa</span>
      </div>
    );
  }
  const Multi = (
    <>
      <div onClick={handleClick}>multi single 1</div>
      <div>multi single 2</div>
    </>
  );
  // return Single
  return (
    <div style={{backgroundColor:'red'}}>
      {Multi}
      <Single />
    </div>
  );
  // return flag ? <Single /> : Multi;
}
