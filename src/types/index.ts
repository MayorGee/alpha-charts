import type { MACDResult } from '../lib/indicators/macd';

export interface Symbol {
    symbol: string; // e.g., "BTC/USDT"
    price: number;
    change24h: number;
    high24h: number;
    low24h: number;
    volume24h: number;
}

export interface Candle {
    time: Date;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

export type IndicatorId = 'sma' | 'ema' | 'rsi' | 'bollinger' | 'macd';

export interface Indicator {
    id: IndicatorId;
    name: string;
    description: string;
    color: string;
}

export interface Timeframe {
    label: string; // e.g., "1m", "5m", "1h"
    value: string; // e.g., "1m", "5m", "1h"
    minutes: number; // duration in minutes for calculations
}

export type DrawingTool = 'trendline' | 'horizontal' | 'vertical' | 'none';
export type ChartStyle = 'candlestick' | 'line';

export interface TooltipData {
    candle: Candle;
    x: number;
    y: number;
}

export type MessageHandler = (candle: Candle) => void;

/** Single series aligned to candles (null where the indicator is undefined). */
export type IndicatorLineSeries = (number | null)[];

export interface BollingerBands {
    upper: IndicatorLineSeries;
    middle: IndicatorLineSeries;
    lower: IndicatorLineSeries;
}

export type MainChartIndicator =
    | { id: 'sma'; pane: 'main'; color: string; data: IndicatorLineSeries }
    | { id: 'ema'; pane: 'main'; color: string; data: IndicatorLineSeries }
    | { id: 'bollinger'; pane: 'main'; color: string; data: BollingerBands };

export type SeparateChartIndicator =
    | { id: 'rsi'; pane: 'separate'; color: string; data: IndicatorLineSeries }
    | { id: 'macd'; pane: 'separate'; color: string; data: MACDResult };

export type IndicatorResult = MainChartIndicator | SeparateChartIndicator;

export function isMainChartIndicator(ind: IndicatorResult): ind is MainChartIndicator {
    return ind.pane === 'main';
}

export function isSeparateChartIndicator(ind: IndicatorResult): ind is SeparateChartIndicator {
    return ind.pane === 'separate';
}
