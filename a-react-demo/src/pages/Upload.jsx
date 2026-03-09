import React, {useRef, useState} from 'react';
import axios from 'axios';

// 🔥 面试终极版 Upload
const Upload = ({
  action,
  accept = 'image/*',
  multiple = false,
  maxSize = 10, // MB
  beforeUpload,
  onSuccess,
  onError,
}) => {
  const inputRef = useRef(null);
  const [fileList, setFileList] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const abortRef = useRef(null);

  // 1. 打开文件选择
  const handleClick = () => inputRef.current.click();

  // 2. 文件选择
  const handleChange = e => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    files.forEach(file => handleFile(file));
  };

  // 3. 文件处理 + 校验
  const handleFile = file => {
    // 校验类型
    if (accept && !file.type.match(accept.replace('*', ''))) {
      alert('不支持的文件类型');
      return;
    }
    // 校验大小
    if (file.size / 1024 / 1024 > maxSize) {
      alert(`文件不能超过 ${maxSize}MB`);
      return;
    }
    // 上传前钩子
    if (beforeUpload && !beforeUpload(file)) return;

    uploadFile(file);
  };

  // 4. 上传请求（带进度 + 取消）
  const uploadFile = async file => {
    const tempFile = {
      uid: Date.now() + file.name,
      name: file.name,
      size: file.size,
      percent: 0,
      status: 'uploading',
    };
    setFileList(prev => [...prev, tempFile]);

    const formData = new FormData();
    formData.append('file', file);

    abortRef.current = new AbortController();

    try {
      await axios.post(action, formData, {
        signal: abortRef.current.signal,
        onUploadProgress: e => {
          const percent = Math.round((e.loaded / e.total) * 100);
          setFileList(prev =>
            prev.map(f => (f.uid === tempFile.uid ? {...f, percent} : f))
          );
        },
      });

      setFileList(prev =>
        prev.map(f => (f.uid === tempFile.uid ? {...f, status: 'success'} : f))
      );
      onSuccess?.(file);
    } catch (err) {
      console.log('err', err);
      if (err.name === 'AbortError') return;
      setFileList(prev =>
        prev.map(f => (f.uid === tempFile.uid ? {...f, status: 'error'} : f))
      );
      onError?.(err);
    }
  };

  // 5. 取消上传
  const handleCancel = () => abortRef.current?.abort();

  // 6. 拖拽上传
  const handleDragEnter = e => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  const handleDragOver = e => {
    e.preventDefault();
    e.stopPropagation();
  };
  const handleDragLeave = e => {
    e.preventDefault();
    e.stopPropagation();
    // 只有离开当前拖拽区域才取消高亮（避免子元素触发）
    if (!e.currentTarget.contains(e.relatedTarget)) {
      console.log('handleDragLeave',e.currentTarget,e.relatedTarget);
      setIsDragging(false);
    }
  };
  const handleDrop = e => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    console.log('handleDrop', e.dataTransfer.files);
    const files = Array.from(e.dataTransfer.files);
    if (!files.length) return;
    files.forEach(file => handleFile(file));
  };

  return (
    <div style={{width: 300, margin: '20px auto'}}>
      <div
        onClick={handleClick}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          border: `2px dashed ${isDragging ? '#1890ff' : '#ccc'}`,
          backgroundColor: isDragging ? '#e6f7ff' : 'transparent',
          padding: '20px',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'border-color 0.2s, background-color 0.2s',
        }}>
        点击上传 / 拖拽上传
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleChange}
        style={{display: 'none'}}
      />

      {/* 文件列表 */}
      <div style={{marginTop: 10}}>
        {fileList.map(item => (
          <div key={item.uid} style={{margin: '5px 0'}}>
            <div>{item.name}</div>
            <div style={{background: '#eee', height: 6, borderRadius: 3}}>
              <div
                style={{
                  height: '100%',
                  background: item.status === 'success' ? 'green' : 'blue',
                  width: `${item.percent}%`,
                }}
              />
            </div>
            <div>{item.percent}%</div>
          </div>
        ))}
      </div>

      {fileList.some(f => f.status === 'uploading') && (
        <button onClick={handleCancel} style={{marginTop: 10}}>
          取消上传
        </button>
      )}
    </div>
  );
};

// 使用 Demo
export  function UploadDemo() {
  return (
    <Upload
      action="https://httpbin.org/post"
      accept="image/*"
      maxSize={5}
      onSuccess={f => console.log('上传成功', f)}
    />
  );
}
