import React from 'react';
import ReactDOM from 'react-dom';

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
