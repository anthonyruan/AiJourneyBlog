import React, { useMemo } from 'react';

// 辅助函数，生成随机坐标
const randomPosition = (min: number, max: number) => Math.floor(Math.random() * (max - min)) + min;
const randomSize = (min: number, max: number) => Math.random() * (max - min) + min;

// 生成一个随机线条
const generateRandomLine = (index: number) => {
  const x1 = randomPosition(0, 100);
  const y1 = randomPosition(0, 100);
  const x2 = randomPosition(Math.max(0, x1 - 40), Math.min(100, x1 + 40));
  const y2 = randomPosition(Math.max(0, y1 - 40), Math.min(100, y1 + 40));
  
  return (
    <path 
      key={`line-${index}`} 
      d={`M${x1},${y1} L${x2},${y2}`} 
      stroke="currentColor" 
      strokeWidth="1" 
      fill="none" 
    />
  );
};

// 生成一个随机节点
const generateRandomNode = (index: number) => {
  const cx = randomPosition(5, 95);
  const cy = randomPosition(5, 95);
  const r = randomSize(1, 3);
  
  return (
    <circle
      key={`node-${index}`}
      cx={cx}
      cy={cy}
      r={r}
      fill="currentColor"
    />
  );
};

// 生成一个随机矩形
const generateRandomRect = (index: number) => {
  const x = randomPosition(10, 90);
  const y = randomPosition(10, 90);
  const width = randomSize(5, 15);
  const height = randomSize(5, 15);
  
  return (
    <rect
      key={`rect-${index}`}
      x={x}
      y={y}
      width={width}
      height={height}
      rx="2"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
    />
  );
};

// 生成一个随机的微型电路
const generateRandomCircuit = (index: number) => {
  const x = randomPosition(10, 80);
  const y = randomPosition(10, 80);
  
  // 随机决定电路的形状
  const shape = Math.floor(Math.random() * 4);
  
  let path = "";
  
  switch(shape) {
    case 0: // L形
      path = `M${x},${y} L${x+15},${y} L${x+15},${y+15}`;
      break;
    case 1: // T形
      path = `M${x},${y} L${x+20},${y} M${x+10},${y} L${x+10},${y+15}`;
      break;
    case 2: // 正方形
      path = `M${x},${y} L${x+15},${y} L${x+15},${y+15} L${x},${y+15} Z`;
      break;
    case 3: // 三角形
      path = `M${x},${y} L${x+15},${y+10} L${x},${y+20} Z`;
      break;
  }
  
  return (
    <path 
      key={`circuit-${index}`} 
      d={path} 
      stroke="currentColor" 
      strokeWidth="1" 
      fill="none" 
    />
  );
};

// AI特殊图标
const generateAiIcon = (index: number) => {
  const x = randomPosition(20, 70);
  const y = randomPosition(20, 70);
  const size = randomSize(10, 20);
  
  // 各种AI相关图标
  const icons = [
    // 大脑图标
    <path 
      key={`ai-icon-${index}`} 
      d={`M${x},${y} C${x+size/2},${y-size/3} ${x+size},${y} ${x+size},${y+size/2} C${x+size},${y+size/1.5} ${x+size/2},${y+size} ${x},${y+size/1.2} C${x-size/2},${y+size} ${x-size/3},${y+size/1.5} ${x-size/3},${y+size/2} C${x-size/3},${y} ${x-size/3},${y-size/3} ${x},${y}`} 
      stroke="currentColor" 
      strokeWidth="1" 
      fill="none" 
    />,
    // AI文字
    <g key={`ai-text-${index}`}>
      <path 
        d={`M${x},${y} L${x},${y+size} M${x},${y+size/2} L${x+size/3},${y+size/2} M${x+size/2},${y} L${x+size/2},${y+size}`} 
        stroke="currentColor" 
        strokeWidth="1.5" 
        fill="none" 
      />
    </g>,
    // 芯片图标
    <g key={`chip-${index}`}>
      <rect 
        x={x} 
        y={y} 
        width={size} 
        height={size} 
        rx="2" 
        stroke="currentColor" 
        strokeWidth="1" 
        fill="none" 
      />
      <line 
        x1={x-size/4} 
        y1={y+size/4} 
        x2={x} 
        y2={y+size/4} 
        stroke="currentColor" 
        strokeWidth="1" 
      />
      <line 
        x1={x-size/4} 
        y1={y+size*3/4} 
        x2={x} 
        y2={y+size*3/4} 
        stroke="currentColor" 
        strokeWidth="1" 
      />
      <line 
        x1={x+size} 
        y1={y+size/4} 
        x2={x+size+size/4} 
        y2={y+size/4} 
        stroke="currentColor" 
        strokeWidth="1" 
      />
      <line 
        x1={x+size} 
        y1={y+size*3/4} 
        x2={x+size+size/4} 
        y2={y+size*3/4} 
        stroke="currentColor" 
        strokeWidth="1" 
      />
    </g>,
    // 数据流
    <path 
      key={`data-flow-${index}`} 
      d={`M${x},${y} C${x+size/3},${y+size/5} ${x+size*2/3},${y-size/5} ${x+size},${y}`} 
      stroke="currentColor" 
      strokeWidth="1" 
      strokeDasharray="2,2" 
      fill="none" 
    />
  ];
  
  return icons[Math.floor(Math.random() * icons.length)];
};

export default function AiPatternBackground() {
  // 使用useMemo确保只在组件首次渲染时生成元素，而不是每次重新渲染
  const elements = useMemo(() => {
    const lines = Array.from({ length: 30 }, (_, i) => generateRandomLine(i));
    const nodes = Array.from({ length: 40 }, (_, i) => generateRandomNode(i));
    const rects = Array.from({ length: 8 }, (_, i) => generateRandomRect(i));
    const circuits = Array.from({ length: 20 }, (_, i) => generateRandomCircuit(i));
    const aiIcons = Array.from({ length: 15 }, (_, i) => generateAiIcon(i));
    
    return [...lines, ...nodes, ...rects, ...circuits, ...aiIcons];
  }, []);
  
  return (
    <div className="absolute inset-0 overflow-hidden opacity-[0.08]">
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
        className="text-gray-800"
      >
        {elements}
      </svg>
    </div>
  );
}