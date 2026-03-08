import { Environment } from '../Environment';
import { type Candle } from '../../types';

const intervalMap: Record<string, string> = {
    '1m': '1m',
    '5m': '5m',
    '15m': '15m',
    '1h': '1h',
    '4h': '4h',
    '1D': '1d',
    '1W': '1w',
};

export async function fetchKlines(
    symbol: string,
    interval: string,
    limit = 500
): Promise<Candle[]> {
    const binanceInterval = intervalMap[interval];
    if (!binanceInterval) throw new Error(`Unsupported interval: ${interval}`);

    const binanceSymbol = symbol.replace('/', '').toUpperCase();
    const baseUrl = Environment.binanceRestBaseUrl;

    const url = baseUrl
        ? new URL(`${baseUrl}/klines`)
        : new URL('/api/v3/klines', window.location.origin);

    url.searchParams.append('symbol', binanceSymbol);
    url.searchParams.append('interval', binanceInterval);
    url.searchParams.append('limit', limit.toString());

    const response = await fetch(url.toString());
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }

    const data = await response.json();
    
    return data.map((kline: any) => ({
        time: new Date(kline[0]),
        open: parseFloat(kline[1]),
        high: parseFloat(kline[2]),
        low: parseFloat(kline[3]),
        close: parseFloat(kline[4]),
        volume: parseFloat(kline[5]),
    }));
}