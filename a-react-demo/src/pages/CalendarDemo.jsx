import React, {useState} from 'react';

// 工具函数：获取年月信息
function getMonthInfo(year, month) {
  const firstDay = new Date(year, month, 1).getDay(); // 1号周几
  const days = new Date(year, month + 1, 0).getDate(); // 当月天数
  const today = new Date().getDate();
  const isCurrentMonth =
    year === new Date().getFullYear() && month === new Date().getMonth();

  return {firstDay, days, today, isCurrentMonth};
}

// ======================
// 🔥 日历组件
// ======================
export const CalendarDemo = () => {
  const now = new Date();
  const [curYear, setCurYear] = useState(now.getFullYear());
  const [curMonth, setCurMonth] = useState(now.getMonth());
  const [select, setSelect] = useState(null);
  console.log(curYear, curMonth);

  const {firstDay, days, today, isCurrentMonth} = getMonthInfo(
    curYear,
    curMonth
  );
  console.log(firstDay, days, today, isCurrentMonth);

  // 上一个月
  const prev = () => {
    if (curMonth === 0) {
      setCurYear(curYear - 1);
      setCurMonth(11);
    } else setCurMonth(curMonth - 1);
  };

  // 下一个月
  const next = () => {
    if (curMonth === 11) {
      setCurYear(curYear + 1);
      setCurMonth(0);
    } else setCurMonth(curMonth + 1);
  };

  // 生成 42 格
  const cells = [];
  // 前面补空位
  for (let i = 0; i < firstDay; i++) cells.push('');
  // 日期
  for (let i = 1; i <= days; i++) cells.push(i);
  // 填满 42 格
  while (cells.length < 42) cells.push('');

  const weeks = ['日', '一', '二', '三', '四', '五', '六'];

  return (
    <div style={{width: 350, margin: '20px auto', border: '1px solid #ddd'}}>
      <div
        style={{display: 'flex', justifyContent: 'space-between', padding: 10}}>
        <button onClick={prev}>&lt;</button>
        <div>
          {curYear} 年 {curMonth + 1} 月
        </div>
        <button onClick={next}>&gt;</button>
      </div>

      {/* 星期 */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
        }}>
        {weeks.map(w => (
          <div
            key={w}
            style={{
              padding: 10,
              fontWeight: 'bold',
              flex: '0 0 14.2%',
              boxSizing: 'border-box',
              textAlign: 'center',
            }}>
            {w}
          </div>
        ))}
      </div>

      {/* 日期格子 */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
        }}>
        {cells.map((day, idx) => (
          <div
            key={idx}
            onClick={() => day && setSelect(day)}
            style={{
              padding: 10,
              flex: '0 0 14.2%',
              boxSizing: 'border-box',
              textAlign: 'center',
              cursor: day ? 'pointer' : 'default',
              background:
                isCurrentMonth && day === today
                  ? '#1890ff'
                  : select === day
                  ? '#e6f7ff'
                  : 'transparent',
              color: isCurrentMonth && day === today ? '#fff' : '#333',
              borderRadius: 4,
            }}>
            {day}
          </div>
        ))}
      </div>
    </div>
  );
};
