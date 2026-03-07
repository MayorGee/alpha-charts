import type { ChartStyle, DrawingTool, Symbol } from './index';

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