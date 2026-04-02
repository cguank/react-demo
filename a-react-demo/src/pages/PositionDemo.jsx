import React from 'react';
import './PositionDemo.css';

/**
 * CSS position 不同取值示例
 * static | relative | absolute | fixed | sticky
 */
export function PositionDemo() {
  return (
    <div className="position-demo">
      <h1>CSS Position 示例</h1>

      {/* 1. static - 默认，不脱离文档流 */}
      <section className="demo-section">
        <h2>1. position: static（默认）</h2>
        <p className="section-desc">不脱离文档流，top/right/bottom/left 无效</p>
        <div className="container container--bordered">
          <div className="box box--static">static</div>
          <div className="box box--gray">正常流中的下一个盒子</div>
        </div>
      </section>

      {/* 2. relative - 相对自身原位置偏移，保留原空间 */}
      <section className="demo-section">
        <h2>2. position: relative</h2>
        <p className="section-desc">相对自身原位置偏移，原空间仍占据</p>
        <div className="container container--bordered">
          <div className="box box--relative">
            relative
            <br />
            top: 10px left: 20px
          </div>
          <div className="box box--gray">后面的盒子不会顶上来</div>
        </div>
      </section>

      {/* 3. absolute - 相对最近定位祖先，脱离文档流 */}
      <section className="demo-section">
        <h2>3. position: absolute</h2>
        <p className="section-desc">
          相对最近 position 非 static 的祖先定位，脱离文档流
        </p>
        <div
          className="container container--bordered container--relative"
          style={{minHeight: 120}}>
          <div className="box box--gray">普通流中的盒子</div>
          <div className="box box--absolute">
            absolute
            <br />
            top: 10px right: 10px
          </div>
        </div>
      </section>

      {/* 4. absolute 在嵌套里的表现 */}
      <section className="demo-section">
        <h2>4. absolute 相对父级 relative</h2>
        <p className="section-desc">子 absolute 相对父级 relative 的四个角</p>
        <div
          className="container container--relative container--anchor"
          style={{height: 140}}>
          <div className="box box--absolute box--tl">top-left</div>
          <div className="box box--absolute box--tr">top-right</div>
          <div className="box box--absolute box--bl">bottom-left</div>
          <div className="box box--absolute box--br">bottom-right</div>
        </div>
      </section>

      {/* 5. fixed - 相对视口 */}
      <section className="demo-section">
        <h2>5. position: fixed</h2>
        <p className="section-desc">相对视口定位，滚动页面时不动</p>
        <div className="container container--bordered" style={{minHeight: 80}}>
          <div className="box box--fixed">fixed 右下角</div>
        </div>
      </section>

      {/* 6. sticky - 滚动到阈值后“粘”住 */}
      <section className="demo-section">
        <h2>6. position: sticky</h2>
        <p className="section-desc">滚动到 top: 0 时粘在容器顶部</p>
        <div className="sticky-wrapper">
          <div className="sticky-content">
            {Array.from({length: 15}, (_, i) => (
              <p key={i}>内容行 {i + 1} —— 向下滚动看 sticky 效果</p>
            ))}
            <div className="box box--sticky">sticky 标题栏</div>

            {Array.from({length: 15}, (_, i) => (
              <p key={i}>内容行 {i + 1} —— 向下滚动看 sticky 效果</p>
            ))}
          </div>
        </div>
      </section>

      {/* 7. z-index 与层叠 */}
      <section className="demo-section">
        <h2>7. 定位 + z-index 层叠</h2>
        <p className="section-desc">
          同一 stacking context 内，z-index 大的在上
        </p>
        <div className="container container--relative" style={{height: 100}}>
          <div className="box box--absolute box--z1">z-index: 1</div>
          <div className="box box--absolute box--z2">z-index: 2</div>
          <div className="box box--absolute box--z3">z-index: 3</div>
        </div>
      </section>
    </div>
  );
}

export default PositionDemo;
