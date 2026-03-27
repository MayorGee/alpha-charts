import type { MACDResult } from '../lib/indicators/macd';
import type { Drawing } from './drawing';
import type {
    Candle,
    ChartColorsConfig,
    ChartStyle,
    DrawingTool,
    Indicator,
    IndicatorId,
    MainChartIndicator,
    Symbol,
    UserPreferences,
} from './index';

export interface HeaderProps {
    symbol: Symbol;
    searchQuery: string;
    onSymbolSearch: (query: string) => void;
    searchResults: Symbol[];
    onSelectSearchResult: (symbol: Symbol) => void;
    onClearSearch: () => void;
    isConnected: boolean;
}

export interface ToolbarProps {
    activeTool: DrawingTool;
    onToolChange: (tool: DrawingTool) => void;
    chartStyle: ChartStyle;
    onChartStyleChange: (style: ChartStyle) => void;
    showGrid: boolean;
    onGridToggle: () => void;
    showTooltip: boolean;
    onTooltipToggle: () => void;
    onOpenSettings: () => void;
    onAddIndicator: () => void;
    onClearDrawings: () => void;
    activeIndicators?: Indicator[];           
    onRemoveIndicator?: (id: IndicatorId) => void;
}

export interface WatchlistProps {
    symbols: Symbol[];
    selectedSymbol: string;
    onSelectSymbol: (symbol: Symbol) => void;
    onRemoveSymbol: (symbolName: string) => void;
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
    showTooltip: boolean;
    chartColors: ChartColorsConfig;
    chartStyle: ChartStyle;
    indicators?: MainChartIndicator[];
    drawings?: Drawing[];
    onAddDrawing?: (drawing: Omit<Drawing, 'id' | 'createdAt'>) => void;
    onUpdateDrawing?: (id: string, updates: Partial<Drawing>) => void;
    onDeleteDrawing?: (id: string) => void;
    onReachLeftEdge?: () => void;
    isLoadingMoreHistory?: boolean;
    activeTool?: DrawingTool;
}

export interface SettingsPanelProps {
    isOpen: boolean;
    preferences: UserPreferences;
    defaultPreferences: UserPreferences;
    onClose: () => void;
    onSave: (next: UserPreferences) => void;
}

export interface VolumeChartProps {
    data: Candle[];
    width: number;
    height: number;
    chartColors?: ChartColorsConfig;
}

export interface IndicatorDialogProps {
    isOpen: boolean;
    periods: UserPreferences['indicatorPeriods'];
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