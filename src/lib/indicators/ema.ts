import { type Candle } from '../../types';

export function calculateEMA(data: Candle[], period: number): (number | null)[] {
    const ema: (number | null)[] = [];
    const multiplier = 2 / (period + 1);

    for (let i = 0; i < data.length; i++) {
        if (i < period - 1) {
            ema.push(null);
        } else if (i === period - 1) {
            const sum = data.slice(0, period).reduce((acc, c) => acc + c.close, 0);
            ema.push(sum / period);
        } else {
            const prevEMA = ema[i - 1]!;
            const currentClose = data[i].close;
            ema.push((currentClose - prevEMA) * multiplier + prevEMA);
        }
    }
    return ema;
}