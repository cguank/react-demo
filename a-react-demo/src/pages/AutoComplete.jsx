import React from 'react';

const mockData = {
  code: 0,
  msg: 'success',
  data: {
    candidateList: ['Alice', 'A1', 'A2', 'Blice', 'B1', 'B2', 'abc', 'bac'],
  },
};

function getCandiateRespData(str) {
  return new Promise((resolve, reject) => {
    if (!str) {
      setTimeout(() => {
        resolve({
          ...mockData,
          data: {
            candidateList: [],
          },
        });
      }, Math.random() * 2000);
    }
    const candidateList = mockData.data.candidateList.filter(
      item => item.toLowerCase().indexOf(str) !== -1
    );
    setTimeout(() => {
      resolve({
        ...mockData,
        data: {
          candidateList,
        },
      });
    }, Math.random() * 2000);
  });
}

function useDebounce(fn, wait) {
  let timer = null;

  const cb = React.useCallback(
    function(...args) {
      if (timer) {
        clearTimeout(timer);
      }
      timer = setTimeout(() => {
        fn.apply(this, args);
      }, wait);
    },
    [wait]
  );
  return cb;
}

export function AutoComplete() {
  const [value, setValue] = React.useState('');
  const [candidateList, setCandiDateList] = React.useState([]);
  const abortControlerRef = React.useRef(null);

  const handleOnChange = async e => {
    sequenceRef.current++;
    const sequence = sequenceRef.current;
    const newValue = e.target.value;
    console.log('==========e', newValue);
    setValue(newValue);

    if (newValue) {
      const list = await fetchCandidateList(newValue);
      if (sequence !== sequenceRef.current) {
        console.warn('sequence not match', sequence, sequenceRef.current);
        return;
      }
      setCandiDateList(list);
    } else {
      setCandiDateList([]);
    }
  };
  const {cb} = useDebounce(handleOnChange, 500);
  const sequenceRef = React.useRef(0);
  const fetchCandidateList = async str => {
    const resp = await getCandiateRespData(str);
    if (resp.code) {
      console.log('======error', resp.msg);
      return [];
    }
    return resp.data.candidateList;
  };

  const hanldeItemClick = itemStr => {
    setValue(itemStr);
  };

  return (
    <div>
      <input value={value} onChange={handleOnChange} />
      <div>
        <ul>
          {candidateList.map(item => (
            <li onClick={() => hanldeItemClick(item)}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
