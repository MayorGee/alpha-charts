export interface Symbol {
    symbol: string;           // e.g., "BTC/USDT"
    price: number;
    change24h: number;
    high24h: number;
    low24h: number;
    volume24h: number;
}

export interface Candle {
    timestamp: number;        // Unix timestamp in milliseconds
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

export interface Timeframe {
    label: string;            // e.g., "1m", "5m", "1h"
    value: string;            // e.g., "1m", "5m", "1h"
    minutes: number;          // duration in minutes for calculations
}

export type DrawingTool = 'trendline' | 'horizontal' | 'vertical' | 'none';
export type ChartStyle = 'candlestick' | 'line';