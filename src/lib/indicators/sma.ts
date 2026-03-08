import { type Candle } from '../../types';

export function calculateSMA(data: Candle[], period: number): (number | null)[] {
    const sma: (number | null)[] = [];

    for (let i = 0; i < data.length; i++) {
        if (i < period - 1) {
            sma.push(null);
        } else {
            const sum = data.slice(i - period + 1, i + 1).reduce((acc, c) => acc + c.close, 0);
            sma.push(sum / period);
        }
    }
    
    return sma;
}