import React, {useEffect, useRef, useState} from 'react';
import { createPortal } from 'react-dom';

/**
 * 【面试介绍 · ModalDemo】
 *
 * 做什么：受控弹窗 visible + title + children；onClose；可选 afterClose、maskClosable。
 *
 * 难点：
 * - createPortal → document.body，避免父级 overflow/层级裁剪。
 * - 遮罩 vs 内容区：contentRef.contains(e.target)，避免点内容也关。
 * - ESC：window keydown，依赖 visible/onClose 清理 effect。
 * - 关闭动画：visible false 时 anim 过渡后再 afterClose，避免直接卸载截断动画。
 *
 * 复杂点：受控/非受控边界（有 visible 则完全听父组件）。生产可补焦点 trap、锁滚动、aria。
 *
 * 与 AutoComplete、DialogDemo 一起说的总述：异步搜索（防抖+Abort+竞态）；声明式 Modal（Portal+受控+动画）；命令式 Dialog（createRoot+Promise）。
 */

// 动画 className（写在 style 里也可以）
const cls = {
  mask: 'modal-mask',
  enter: 'modal-enter',
  active: 'modal-active',
  leave: 'modal-leave',
};

// 弹窗内容组件
const ModalContent = ({
  visible,
  title,
  children,
  maskClosable = true,
  onClose,
  afterClose,
}) => {
  const contentRef = useRef(null);
  const [anim, setAnim] = useState('');

  // 动画控制
  useEffect(() => {
    if (visible) {
      setAnim(cls.enter);
      setTimeout(() => setAnim(cls.active), 10);
    } else {
      setAnim(cls.leave);
      setTimeout(() => {
        afterClose?.();
      }, 300);
    }
  }, [visible]);

  // 点击外部关闭
  const handleMaskClick = e => {
    if (!maskClosable) return;
    if (contentRef.current && !contentRef.current.contains(e.target)) {
      onClose?.();
    }
  };

  // ESC 关闭
  useEffect(() => {
    const onKeydown = e => {
      if (visible && e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKeydown);
    return () => window.removeEventListener('keydown', onKeydown);
  }, [visible, onClose]);

  if (!visible && anim === '') return null;

  return createPortal(
    <div
      className={cls.mask}
      onClick={handleMaskClick}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        opacity: anim === cls.leave ? 0 : 1,
        transition: 'opacity 3s ease',
        pointerEvents: anim === cls.leave ? 'none' : 'auto',
      }}>
      <div
        ref={contentRef}
        style={{
          background: '#fff',
          borderRadius: 8,
          minWidth: 300,
          transform: anim === cls.active ? 'scale(1)' : 'scale(0.9)',
          opacity: anim === cls.leave ? 0 : 1,
          transition: 'all 0.3s ease',
          padding: 20,
        }}>
        <div style={{fontSize: 18, fontWeight: 500, marginBottom: 12}}>
          {title}
        </div>
        <div style={{marginBottom: 20}}>{children}</div>
        <button onClick={onClose} style={{padding: '6px 16px'}}>
          关闭
        </button>
      </div>
    </div>,
    document.body
  );
};

// 受控 + 非受控 封装
const Modal = props => {
  const {visible: propVisible, onClose, ...rest} = props;
  const [vis, setVis] = useState(!!propVisible);

  // 受控模式
  const visible = propVisible !== undefined ? propVisible : vis;

  const handleClose = () => {
    onClose?.();
    if (propVisible === undefined) {
      setVis(false);
    }
  };

  return <ModalContent visible={visible} onClose={handleClose} {...rest} />;
};

// 使用 Demo
export function ModalDemo() {
  const [visible, setVisible] = useState(false);
console.log('visible', visible);
  return (
    <div style={{padding: 20}}>
      <button onClick={() => setVisible(true)}>打开受控弹窗</button>

      <Modal
        visible={visible}
        title="受控弹窗"
        onClose={() => setVisible(false)}>
        我是受控弹窗内容
      </Modal>

      {/* {
        visible && (
          <Modal title="非受控弹窗" visible={true} onClose={() => setVisible(false)}>
            我是非受控弹窗内容
          </Modal>
        )
      } */}
    </div>
  );
}
