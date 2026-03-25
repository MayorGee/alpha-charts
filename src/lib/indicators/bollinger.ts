import { type Candle, type BollingerBands } from '../../types';

export function calculateBollingerBands(data: Candle[], period = 20, stdDev = 2): BollingerBands {
    const middle: (number | null)[] = [];
    const upper: (number | null)[] = [];
    const lower: (number | null)[] = [];

    for (let i = 0; i < data.length; i++) {
        if (i < period - 1) {
            middle.push(null);
            upper.push(null);
            lower.push(null);
        } else {
            // Calculate SMA (middle band)
            const sum = data.slice(i - period + 1, i + 1).reduce((acc, c) => acc + c.close, 0);
            const sma = sum / period;
            middle.push(sma);

            // Calculate standard deviation
            const squaredDiffs = data.slice(i - period + 1, i + 1).map(c => Math.pow(c.close - sma, 2));
            const variance = squaredDiffs.reduce((acc, val) => acc + val, 0) / period;
            const stdev = Math.sqrt(variance);

            upper.push(sma + stdDev * stdev);
            lower.push(sma - stdDev * stdev);
        }
    }

    return { upper, middle, lower };
}