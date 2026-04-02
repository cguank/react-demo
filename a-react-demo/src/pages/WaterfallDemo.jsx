import React, { useMemo, useState, useCallback, useRef, useEffect } from 'react';

// ---------- 占位图（可换成项目里的 default.png 或 CDN）----------
// 1x1 透明 GIF，或灰色 SVG data URI，加载失败时也可作 fallback
const PLACEHOLDER_SRC =
  'data:image/svg+xml,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
      <rect fill="#e8e8e8" width="400" height="300"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#999" font-size="14" font-family="system-ui">加载中</text>
    </svg>`
  );

/**
 * 根据图片自然尺寸 + 容器宽度，计算显示高度（保持比例）
 * 列宽在运行时才知道时，在 onLoad 里用 img 的 clientWidth 或父元素宽度即可
 */
function heightFromNaturalSize(naturalWidth, naturalHeight, containerWidth) {
  if (!naturalWidth || !naturalHeight || !containerWidth) return null;
  return Math.round((naturalHeight / naturalWidth) * containerWidth);
}

// 生成带图片 URL 的条目（picsum 用固定宽高模拟不同比例）
function makeImageItems(count, seed = 0) {
  return Array.from({ length: count }, (_, i) => {
    const n = seed + i;
    const w = 300;
    const h = 180 + ((n * 17) % 220); // 180~399 变化高度
    return {
      id: `img-${n}`,
      // 固定尺寸 URL，真实场景换成你的 CDN；无后端宽高时只能靠 onLoad
      src: `https://picsum.photos/id/${(n % 80) + 1}/${w}/${h}`,
      // 若后端已返回宽高，可直接写入，首屏就能算准列高，无需等 onLoad
      intrinsicWidth: w,
      intrinsicHeight: h,
    };
  });
}

/**
 * 单张图片卡片：
 * - 未加载：显示占位图 + 可选骨架
 * - 加载后：用 naturalWidth/Height 算高度，通知父组件更新（最短列重排）
 */
function WaterfallImageCard({
  item,
  columnWidth,
  defaultHeight = 200,
  onHeightReady,
  gap,
}) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [displayHeight, setDisplayHeight] = useState(() => {
    // 有后端宽高时先用比例算一版，减少加载后跳动
    if (item.intrinsicWidth && item.intrinsicHeight && columnWidth) {
      return heightFromNaturalSize(
        item.intrinsicWidth,
        item.intrinsicHeight,
        columnWidth
      );
    }
    return defaultHeight;
  });
  const reportedRef = useRef(false);

  const handleLoad = useCallback(
    (e) => {

      const img = e.target;
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      console.log('w', w,h, item.width, item.height);
      const cw = columnWidth || img.clientWidth || 300;
      const computedH = heightFromNaturalSize(w, h, cw) || defaultHeight;
      setDisplayHeight(computedH);
      setLoaded(true);
      if (!reportedRef.current && onHeightReady) {
        reportedRef.current = true;
        onHeightReady(item.id, computedH);
      }
    },
    [item.id, columnWidth, defaultHeight, onHeightReady]
  );

  const handleError = useCallback(() => {
    setError(true);
    setLoaded(true);
    if (!reportedRef.current && onHeightReady) {
      reportedRef.current = true;
      onHeightReady(item.id, defaultHeight);
    }
  }, [item.id, defaultHeight, onHeightReady]);

  // columnWidth 变化时若已加载过，按新宽度重算高度（窗口/列数变化）
  useEffect(() => {
    if (!loaded || error || !item.intrinsicWidth || !item.intrinsicHeight) return;
    const h = heightFromNaturalSize(
      item.intrinsicWidth,
      item.intrinsicHeight,
      columnWidth
    );
    if (!h) return;
    setDisplayHeight((prev) => (prev === h ? prev : h));
    if (onHeightReady) onHeightReady(item.id, h);
  }, [
    columnWidth,
    loaded,
    error,
    item.id,
    item.intrinsicWidth,
    item.intrinsicHeight,
    onHeightReady,
  ]);

  return (
    <div
      style={{
        borderRadius: 8,
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        background: '#eee',
        // 占位高度：未加载前撑开布局，避免高度为 0
        minHeight: loaded ? undefined : defaultHeight,
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: displayHeight,
          background: '#e8e8e8',
        }}
      >
        {/* 加载前：占位图或骨架 */}
        {!loaded && (
          <img
            src={PLACEHOLDER_SRC}
            alt=""
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
            }}
          />
        )}
        {/* 真实图：加载完成前 opacity 0，避免闪一下空白 */}
        <img
          src={item.src}
          alt=""
          onLoad={handleLoad}
          onError={handleError}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
            opacity: loaded ? 1 : 0,
            transition: 'opacity 0.25s ease',
          }}
        />
        {error && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#f0f0f0',
              color: '#999',
              fontSize: 12,
            }}
          >
            加载失败
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * 图片瀑布流：每项高度来自 onLoad 或后端宽高；用 state 汇总后做最短列分配
 */
function WaterfallImageMasonry({
  items,
  columnCount = 3,
  gap = 12,
  containerMaxWidth = 900,
  defaultHeight = 200,
}) {
  const containerRef = useRef(null);
  const [columnWidth, setColumnWidth] = useState(300);
  // id -> 当前用于排版的 height（先 default，onLoad 后更新）
  const [heights, setHeights] = useState({});

  // items 变化时合并新 id 的默认高度，避免 load more 后缺 key
  useEffect(() => {
    setHeights((prev) => {
      const next = { ...prev };
      items.forEach((it) => {
        if (next[it.id] == null) {
          if (it.intrinsicWidth && it.intrinsicHeight && columnWidth) {
            next[it.id] =
              heightFromNaturalSize(
                it.intrinsicWidth,
                it.intrinsicHeight,
                columnWidth
              ) || defaultHeight;
          } else {
            next[it.id] = defaultHeight;
          }
        }
      });
      return next;
    });
  }, [items, columnWidth, defaultHeight]);

  // 列宽 = (容器宽 - gap) / columnCount
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const w = el.clientWidth;
      const cw = Math.floor((w - (columnCount - 1) * gap) / columnCount);
      if (cw > 0) setColumnWidth(cw);
    });
    ro.observe(el);
    const w = el.clientWidth;
    const cw = Math.floor((w - (columnCount - 1) * gap) / columnCount);
    if (cw > 0) setColumnWidth(cw);
    return () => ro.disconnect();
  }, [columnCount, gap]);

  const onHeightReady = useCallback((id, h) => {
    setHeights((prev) => (prev[id] === h ? prev : { ...prev, [id]: h }));
  }, []);

  const itemsWithHeight = useMemo(
    () =>
      items.map((it) => ({
        ...it,
        height: heights[it.id] ?? defaultHeight,
      })),
    [items, heights, defaultHeight]
  );

  const columns = useMemo(() => {
    const cols = Array.from({ length: columnCount }, () => ({
      items: [],
      height: 0,
    }));
    itemsWithHeight.forEach((item) => {
      let minIdx = 0;
      let minH = cols[0].height;
      for (let i = 1; i < columnCount; i++) {
        if (cols[i].height < minH) {
          minH = cols[i].height;
          minIdx = i;
        }
      }
      cols[minIdx].items.push(item);
      cols[minIdx].height += item.height + gap;
    });
    return cols.map((c) => c.items);
  }, [itemsWithHeight, columnCount, gap]);

  const colFlex = `calc((100% - ${(columnCount - 1) * gap}px) / ${columnCount})`;

  return (
    <div
      ref={containerRef}
      style={{
        display: 'flex',
        gap,
        alignItems: 'flex-start',
        maxWidth: containerMaxWidth,
        margin: '0 auto',
      }}
    >
      {columns.map((colItems, colIndex) => (
        <div
          key={colIndex}
          style={{
            flex: `0 0 ${colFlex}`,
            width: colFlex,
            display: 'flex',
            flexDirection: 'column',
            gap,
          }}
        >
          {colItems.map((item) => (
            <WaterfallImageCard
              key={item.id}
              item={item}
              columnWidth={columnWidth}
              defaultHeight={defaultHeight}
              onHeightReady={onHeightReady}
              gap={gap}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

// ---------- 以下为原来的色块 Demo（无图）----------

function makeItems(count, seed = 0) {
  const colors = [
    '#e8a87c', '#c38d9e', '#41b3a3', '#85dcb8', '#e27d60',
    '#6b5b95', '#88b04b', '#f7cac9', '#92a8d1', '#955251',
  ];
  return Array.from({ length: count }, (_, i) => {
    const n = seed + i;
    const h = 120 + ((n * 9301 + 49297) % 23310) % 200;
    return {
      id: `item-${n}`,
      height: h,
      color: colors[n % colors.length],
      title: `卡片 ${n + 1}`,
    };
  });
}

function WaterfallColumns({ items, columnCount = 3, gap = 12 }) {
  return (
    <div
      style={{
        columnCount,
        columnGap: gap,
        maxWidth: 900,
        margin: '0 auto',
      }}
    >
      {items.map((item) => (
        <div
          key={item.id}
          style={{
            breakInside: 'avoid',
            WebkitColumnBreakInside: 'avoid',
            marginBottom: gap,
            borderRadius: 8,
            overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          }}
        >
          <div
            style={{
              height: item.height,
              background: item.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            {item.title}
            <span style={{ marginLeft: 8, opacity: 0.9 }}>{item.height}px</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function WaterfallShortestColumn({ items, columnCount = 3, gap = 12 }) {
  const columns = useMemo(() => {
    const cols = Array.from({ length: columnCount }, () => ({
      items: [],
      height: 0,
    }));
    items.forEach((item) => {
      let minIdx = 0;
      let minH = cols[0].height;
      for (let i = 1; i < columnCount; i++) {
        if (cols[i].height < minH) {
          minH = cols[i].height;
          minIdx = i;
        }
      }
      cols[minIdx].items.push(item);
      cols[minIdx].height += item.height + gap;
    });
    return cols.map((c) => c.items);
  }, [items, columnCount, gap]);

  const colWidth = `calc((100% - ${(columnCount - 1) * gap}px) / ${columnCount})`;

  return (
    <div
      style={{
        display: 'flex',
        gap,
        alignItems: 'flex-start',
        maxWidth: 900,
        margin: '0 auto',
      }}
    >
      {columns.map((colItems, colIndex) => (
        <div
          key={colIndex}
          style={{
            flex: `0 0 ${colWidth}`,
            width: colWidth,
            display: 'flex',
            flexDirection: 'column',
            gap,
          }}
        >
          {colItems.map((item) => (
            <div
              key={item.id}
              style={{
                borderRadius: 8,
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              }}
            >
              <div
                style={{
                  height: item.height,
                  background: item.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: 14,
                }}
              >
                {item.title}
                <span style={{ marginLeft: 8, opacity: 0.9 }}>{item.height}px</span>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export const WaterfallDemo = () => {
  const [count, setCount] = useState(12);
  const [mode, setMode] = useState('image'); // 'image' | 'shortest' | 'columns'
  const [cols, setCols] = useState(3);

  const colorItems = useMemo(() => makeItems(count), [count]);
  const imageItems = useMemo(() => makeImageItems(count), [count]);

  const loadMore = useCallback(() => {
    setCount((c) => c + 8);
  }, []);

  const reset = useCallback(() => {
    setCount(12);
  }, []);

  return (
    <div style={{ padding: 24, background: '#f5f5f5', minHeight: '100vh' }}>
      <h1 style={{ marginTop: 0, marginBottom: 8 }}>瀑布流 Demo</h1>
      <p style={{ color: '#666', marginBottom: 12, fontSize: 14 }}>
        <strong>图片高度：</strong>
        优先用接口返回的 width/height 按比例算；没有则在{' '}
        <code>onLoad</code> 里用 <code>naturalWidth / naturalHeight</code> 和列宽算显示高度{' '}
        <code>(naturalHeight / naturalWidth) * columnWidth</code>。
        加载中用 SVG 占位图，真实图加载完再渐显，避免空白。
      </p>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 12,
          alignItems: 'center',
          marginBottom: 20,
        }}
      >
        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>布局：</span>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            style={{ padding: '6px 10px' }}
          >
            <option value="image">图片 + 占位 + onLoad 算高</option>
            <option value="shortest">色块最短列（JS）</option>
            <option value="columns">色块多列（CSS columns）</option>
          </select>
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>列数：</span>
          <input
            type="number"
            min={2}
            max={6}
            value={cols}
            onChange={(e) => setCols(Number(e.target.value) || 3)}
            style={{ width: 60, padding: 6 }}
          />
        </label>
        <button
          type="button"
          onClick={loadMore}
          style={{
            padding: '8px 16px',
            cursor: 'pointer',
            borderRadius: 6,
            border: '1px solid #41b3a3',
            background: '#41b3a3',
            color: '#fff',
          }}
        >
          加载更多
        </button>
        <button
          type="button"
          onClick={reset}
          style={{
            padding: '8px 16px',
            cursor: 'pointer',
            borderRadius: 6,
            border: '1px solid #ccc',
            background: '#fff',
          }}
        >
          重置
        </button>
      </div>

      {mode === 'columns' && (
        <WaterfallColumns items={colorItems} columnCount={cols} />
      )}
      {mode === 'shortest' && (
        <WaterfallShortestColumn items={colorItems} columnCount={cols} />
      )}
      {mode === 'image' && (
        <WaterfallImageMasonry
          items={imageItems}
          columnCount={cols}
          defaultHeight={200}
        />
      )}
    </div>
  );
};
