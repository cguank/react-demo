import React from 'react';
import ReactDOM from 'react-dom';

/**
 * 【面试介绍 · DialogDemo】
 *
 * 做什么：Dialog.show(options) 返回 Promise，确定/取消 resolve 枚举，适合非 JSX 里 await 再分支。
 *
 * 难点：
 * - 命令式：运行时建容器 + createRoot 挂子树，不在父组件 return 里声明。
 * - 销毁：先 unmount 再 removeChild，避免不同步与泄漏。
 * - Promise 与 options.onOkClick 等钩子并存，统一用 resolve 拿结果。
 *
 * 复杂点：与 Modal 对比——声明式适合页内；命令式适合工具函数、链式确认。
 * 当前 DialogCom 无 ESC、遮罩关闭、非 Portal，属轻量确认框；对标 Modal.confirm 可补 a11y 与多层 z-index。
 *
 * 与 AutoComplete、ModalDemo 一起说的总述：异步搜索（防抖+Abort+竞态）；声明式 Modal（Portal+受控+动画）；命令式 Dialog（createRoot+Promise）。
 */

// 弹窗UI组件
function DialogCom({title, msg, okText, cancelText, onOkClick, onCancelClick}) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
      }}>
      <div
        style={{
          background: '#fff',
          padding: '24px',
          borderRadius: '8px',
          minWidth: '280px',
        }}>
        <h3 style={{margin: '0 0 12px'}}>{title}</h3>
        <p style={{margin: '0 0 20px'}}>{msg}</p>
        <div style={{display: 'flex', gap: '12px', justifyContent: 'flex-end'}}>
          <button onClick={onCancelClick}>{cancelText}</button>
          <button onClick={onOkClick}>{okText}</button>
        </div>
      </div>
    </div>
  );
}

// 命令式调用类（核心）
class Dialog {
  static status = {
    CANCEL: 0,
    OK: 1,
  };

  static show(options) {
    return new Promise(resolve => {
      const container = document.createElement('div');
      document.body.appendChild(container);
      const rootDialog = ReactDOM.createRoot(container);

      const destroy = () => {
        // 🔥 关键：先卸载组件，再移除DOM → 不泄漏
        rootDialog.unmount();
        document.body.removeChild(container);
      };

      rootDialog.render(
        <DialogCom
          {...options}
          onOkClick={() => {
            options.onOkClick?.();
            resolve(Dialog.status.OK);
            destroy();
          }}
          onCancelClick={() => {
            options.onCancelClick?.();
            resolve(Dialog.status.CANCEL);
            destroy();
          }}
        />
      );
    });
  }
}

// 使用Demo
export function DialogDemo() {
  const handleShow = async () => {
    const res = await Dialog.show({
      title: '提示',
      msg: '确认执行操作？',
      okText: '确认',
      cancelText: '取消',
      onOkClick: () => console.log('点击确认'),
      onCancelClick: () => console.log('点击取消'),
    });
    console.log('结果：', res);
  };

  return <h1 onClick={handleShow}>打开弹窗</h1>;
}
