import type { Candle } from '../types';

export function generateMockCandles(count: number, basePrice = 40000): Candle[] {
    const candles: Candle[] = [];
    let time = new Date(Date.now() - count * 60000); // start count minutes ago
    let lastClose = basePrice;

    for (let i = 0; i < count; i++) {
        const open = lastClose;
        const close = open * (1 + (Math.random() - 0.5) * 0.02); // ±1% change
        const high = Math.max(open, close) * (1 + Math.random() * 0.01);
        const low = Math.min(open, close) * (1 - Math.random() * 0.01);
        const volume = Math.random() * 1000 + 500;

        candles.push({
            time: new Date(time),
            open,
            high,
            low,
            close,
            volume,
        });

        time = new Date(time.getTime() + 60000); // next minute
        lastClose = close;
    }

    return candles;
}