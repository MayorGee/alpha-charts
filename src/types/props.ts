import type { MACDResult } from '../lib/indicators/macd';
import type { Drawing } from './drawing';
import type {
    Candle,
    ChartStyle,
    DrawingTool,
    Indicator,
    IndicatorId,
    MainChartIndicator,
    Symbol,
} from './index';

export interface HeaderProps {
    symbol: Symbol;
    onSymbolSearch: (query: string) => void;
    isConnected: boolean;
}

export interface ToolbarProps {
    activeTool: DrawingTool;
    onToolChange: (tool: DrawingTool) => void;
    chartStyle: ChartStyle;
    onChartStyleChange: (style: ChartStyle) => void;
    showGrid: boolean;
    onGridToggle: () => void;
    onAddIndicator: () => void;
    onClearDrawings: () => void;
    activeIndicators?: Indicator[];           
    onRemoveIndicator?: (id: IndicatorId) => void;
}

export interface WatchlistProps {
    symbols: Symbol[];
    selectedSymbol: string;
    onSelectSymbol: (symbol: Symbol) => void;
    isCollapsed: boolean;
    onToggleCollapse: () => void;
}

export interface OrderPanelProps {
    currentPrice: number;
    isCollapsed: boolean;
    onToggleCollapse: () => void;
}

export interface TimeframeSelectorProps {
    selectedTimeframe: string;
    onSelectTimeframe: (timeframe: string) => void;
}

export interface CandlestickChartProps {
    data: Candle[];
    width: number;
    height: number;
    showGrid: boolean;
    chartStyle: ChartStyle;
    indicators?: MainChartIndicator[];
    drawings?: Drawing[];
    onAddDrawing?: (drawing: Omit<Drawing, 'id' | 'createdAt'>) => void;
    activeTool?: DrawingTool;
}

export interface VolumeChartProps {
    data: Candle[];
    width: number;
    height: number;
}

export interface IndicatorDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onAddIndicator: (indicator: Indicator) => void;
}

export interface MACDPaneProps {
    data: Candle[];
    macd: MACDResult;
    width: number;
    height: number;
    lineColor?: string;   // for MACD line
    signalColor?: string; // for signal line
    histogramPositiveColor?: string;
    histogramNegativeColor?: string;
}