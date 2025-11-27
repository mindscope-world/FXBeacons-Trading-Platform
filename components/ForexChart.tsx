import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Brush,
  ReferenceArea
} from 'recharts';
import { ChartDataPoint } from '../types';
import { RotateCcw, TrendingUp, BarChart2 } from 'lucide-react';

interface ForexChartProps {
  data: ChartDataPoint[];
  theme: 'light' | 'dark';
}

const ForexChart: React.FC<ForexChartProps> = ({ data, theme }) => {
  const [chartType, setChartType] = useState<'line' | 'candle'>('line');
  const [left, setLeft] = useState<string | null>(null);
  const [right, setRight] = useState<string | null>(null);
  const [refAreaLeft, setRefAreaLeft] = useState<string | null>(null);
  const [refAreaRight, setRefAreaRight] = useState<string | null>(null);

  // Colors based on theme
  const gridColor = theme === 'dark' ? '#2d3748' : '#e5e7eb';
  const axisColor = theme === 'dark' ? '#718096' : '#6b7280';
  const tooltipBg = theme === 'dark' ? '#1a202c' : '#ffffff';
  const tooltipBorder = theme === 'dark' ? '#4a5568' : '#e5e7eb';
  const tooltipText = theme === 'dark' ? '#e2e8f0' : '#1f2937';

  const tradeGreen = '#10B981';
  const tradeRed = '#EF4444';

  // Prepare data for candlesticks (body range and wick range)
  const processedData = useMemo(() => {
    if (!data) return [];
    return data.map(d => ({
      ...d,
      // Ensure body has at least a tiny height for doji candles if open === close
      body: [
        Math.min(d.open, d.close), 
        Math.max(d.open, d.close) === Math.min(d.open, d.close) 
          ? Math.max(d.open, d.close) + 0.00001 
          : Math.max(d.open, d.close)
      ], 
      wick: [d.low, d.high],
      color: d.close >= d.open ? tradeGreen : tradeRed
    }));
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <div className="w-full h-full bg-white dark:bg-gray-850 rounded-lg p-4 shadow-lg border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center transition-colors duration-300">
        <div className="text-gray-400 animate-pulse">Loading market data...</div>
      </div>
    );
  }

  const zoom = () => {
    let l = refAreaLeft;
    let r = refAreaRight;

    if (l === r || r === null) {
      setRefAreaLeft(null);
      setRefAreaRight(null);
      return;
    }

    // Ensure correct order
    if (l! > r) {
      [l, r] = [r, l];
    }

    setLeft(l);
    setRight(r);
    setRefAreaLeft(null);
    setRefAreaRight(null);
  };

  const zoomOut = () => {
    setLeft(null);
    setRight(null);
  };

  // Custom Tooltip to show Open/High/Low/Close in candle mode
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      // Find the main data point
      const d = payload[0].payload;
      return (
        <div style={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, color: tooltipText }} className="border rounded-lg p-2 shadow-xl text-xs">
          <p className="font-bold mb-1" style={{ color: axisColor }}>{label}</p>
          {chartType === 'candle' ? (
            <>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                <span className="text-gray-500">Open:</span> <span className="font-mono text-right">{d.open.toFixed(5)}</span>
                <span className="text-gray-500">High:</span> <span className="font-mono text-right">{d.high.toFixed(5)}</span>
                <span className="text-gray-500">Low:</span> <span className="font-mono text-right">{d.low.toFixed(5)}</span>
                <span className="text-gray-500">Close:</span> <span className={`font-mono text-right font-bold ${d.close >= d.open ? 'text-green-500' : 'text-red-500'}`}>{d.close.toFixed(5)}</span>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-between gap-4">
              <span className="text-blue-500">Price:</span>
              <span className="font-mono font-bold">{d.close.toFixed(5)}</span>
            </div>
          )}
          {d.sma20 && (
            <div className="mt-2 pt-2 border-t border-gray-700/20">
              <div className="flex justify-between gap-4 text-[10px]">
                <span className="text-yellow-500">SMA 20:</span>
                <span className="font-mono">{d.sma20.toFixed(5)}</span>
              </div>
              {d.upperBand && (
                <div className="flex justify-between gap-4 text-[10px]">
                   <span className="text-purple-500">BB Upper:</span>
                   <span className="font-mono">{d.upperBand.toFixed(5)}</span>
                </div>
              )}
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-full bg-white dark:bg-gray-850 rounded-lg p-4 shadow-lg border border-gray-200 dark:border-gray-700 flex flex-col relative overflow-hidden transition-colors duration-300 select-none">
      <div className="flex justify-between items-center mb-4 flex-shrink-0 z-10">
        <div className="flex items-center gap-4">
            <h2 className="text-gray-900 dark:text-gray-200 font-semibold flex items-center gap-2">
            <span className="text-trade-accent">Active Chart</span> 
            <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">M15 Live</span>
            </h2>
            
            {/* Chart Type Toggle */}
            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5 border border-gray-200 dark:border-gray-700">
                <button 
                    onClick={() => setChartType('line')}
                    className={`p-1.5 rounded flex items-center gap-1.5 text-[10px] font-medium transition-all ${chartType === 'line' ? 'bg-white dark:bg-gray-700 shadow text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                    title="Line Chart"
                >
                    <TrendingUp size={14} />
                </button>
                <button 
                    onClick={() => setChartType('candle')}
                    className={`p-1.5 rounded flex items-center gap-1.5 text-[10px] font-medium transition-all ${chartType === 'candle' ? 'bg-white dark:bg-gray-700 shadow text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                    title="Candlestick Chart"
                >
                    <BarChart2 size={14} className="rotate-90" />
                </button>
            </div>
        </div>

        <div className="flex items-center gap-4">
            <div className="flex gap-2 text-[10px] hidden sm:flex">
                <span className="text-yellow-500 flex items-center gap-1"><span className="w-2 h-0.5 bg-yellow-500"></span>SMA 20</span>
                <span className="text-purple-500 flex items-center gap-1"><span className="w-2 h-0.5 bg-purple-500"></span>Bollinger</span>
            </div>
            <div className="flex gap-1">
                <button onClick={zoomOut} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500" title="Reset Zoom">
                    <RotateCcw size={14} />
                </button>
            </div>
        </div>
      </div>

      <div className="flex-1 w-full" style={{ minHeight: '300px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart 
            data={processedData}
            onMouseDown={(e) => e && setRefAreaLeft(e.activeLabel)}
            onMouseMove={(e) => refAreaLeft && e && setRefAreaRight(e.activeLabel)}
            onMouseUp={zoom}
          >
            <defs>
              <linearGradient id="bollingerFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#8884d8" stopOpacity={0.05}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
            
            <XAxis 
              dataKey="time" 
              stroke={axisColor} 
              tick={{fill: axisColor, fontSize: 10}} 
              tickLine={false}
              minTickGap={30}
              allowDataOverflow
              domain={[left || 'auto', right || 'auto']}
            />
            
            {/* Hidden Axis for Wicks to ensure alignment */}
            <XAxis 
                xAxisId="wick" 
                dataKey="time" 
                hide 
                allowDataOverflow
                domain={[left || 'auto', right || 'auto']}
            />

            <YAxis 
              domain={['auto', 'auto']} 
              stroke={axisColor} 
              tick={{fill: axisColor, fontSize: 10}} 
              tickLine={false}
              tickFormatter={(val) => val.toFixed(4)}
              width={50}
              scale="linear" 
            />
            
            <Tooltip content={<CustomTooltip />} />
            
            <Line type="monotone" dataKey="upperBand" stroke="#8b5cf6" strokeWidth={1} strokeOpacity={0.3} dot={false} activeDot={false} isAnimationActive={false} />
            <Line type="monotone" dataKey="lowerBand" stroke="#8b5cf6" strokeWidth={1} strokeOpacity={0.3} dot={false} activeDot={false} isAnimationActive={false} />
            
            <Line 
              type="monotone" 
              dataKey="sma20" 
              stroke="#EAB308" 
              strokeWidth={1.5} 
              dot={false} 
              activeDot={false}
              isAnimationActive={false}
            />

            {chartType === 'line' ? (
                <Line 
                  type="monotone" 
                  dataKey="close" 
                  stroke="#3B82F6" 
                  strokeWidth={2} 
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 0, fill: '#60A5FA' }}
                  isAnimationActive={true}
                  animationDuration={500}
                />
            ) : (
                <>
                    {/* Wicks */}
                    <Bar dataKey="wick" xAxisId="wick" barSize={1} isAnimationActive={false}>
                        {processedData.map((entry, index) => (
                            <Cell key={`wick-${index}`} fill={entry.color} />
                        ))}
                    </Bar>
                    {/* Bodies */}
                    <Bar dataKey="body" barSize={8} isAnimationActive={false}>
                         {processedData.map((entry, index) => (
                            <Cell key={`body-${index}`} fill={entry.color} />
                        ))}
                    </Bar>
                </>
            )}
            
            {/* Dashed line for first open price */}
            <ReferenceLine y={processedData[0]?.open} stroke={axisColor} strokeDasharray="3 3" opacity={0.2} />

            {refAreaLeft && refAreaRight ? (
                <ReferenceArea x1={refAreaLeft} x2={refAreaRight} strokeOpacity={0.3} fill="#3B82F6" fillOpacity={0.1} />
            ) : null}

            <Brush 
                dataKey="time" 
                height={30} 
                stroke={theme === 'dark' ? "#4b5563" : "#9ca3af"}
                fill={theme === 'dark' ? "#1f2937" : "#f3f4f6"}
                tickFormatter={() => ""}
                travellerWidth={10}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ForexChart;