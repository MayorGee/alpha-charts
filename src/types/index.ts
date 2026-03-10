import type { MACDResult } from "../lib/indicators/macd";

export interface Symbol {
    symbol: string;           // e.g., "BTC/USDT"
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

export interface Indicator {
    id: string;
    name: string;
    description: string;
    color: string;
}

export interface Timeframe {
    label: string;            // e.g., "1m", "5m", "1h"
    value: string;            // e.g., "1m", "5m", "1h"
    minutes: number;          // duration in minutes for calculations
}

export type DrawingTool = 'trendline' | 'horizontal' | 'vertical' | 'none';
export type ChartStyle = 'candlestick' | 'line';

export interface TooltipData {
    candle: Candle;
    x: number;
    y: number;
}

export type MessageHandler = (candle: Candle) => void;

export type IndicatorData = 
    | (number | null)[] 
    | { upper: (number | null)[]; middle: (number | null)[]; lower: (number | null)[] }
    | MACDResult;

export interface IndicatorResult {
    id: string;
    data: IndicatorData;
    color: string;
    pane: 'main' | 'separate';
}