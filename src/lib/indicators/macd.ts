import { type Candle } from '../../types';
import { calculateEMA } from './ema';

export interface MACDResult {
    macdLine: (number | null)[];
    signalLine: (number | null)[];
    histogram: (number | null)[];
}

export function calculateMACD(
    data: Candle[],
    fastPeriod = 12,
    slowPeriod = 26,
    signalPeriod = 9
): MACDResult {
    // First, calculate fast and slow EMAs
    const fastEMA = calculateEMA(data, fastPeriod);
    const slowEMA = calculateEMA(data, slowPeriod);

    const macdLine: (number | null)[] = [];
    const signalLine: (number | null)[] = [];
    const histogram: (number | null)[] = [];

    // MACD line = fastEMA - slowEMA (only where both are defined)
    for (let i = 0; i < data.length; i++) {
        if (fastEMA[i] !== null && slowEMA[i] !== null) {
            macdLine.push(fastEMA[i]! - slowEMA[i]!);
        } else {
            macdLine.push(null);
        }
    }

    // Signal line: EMA of MACD line with period = signalPeriod
    for (let i = 0; i < data.length; i++) {
        if (i < signalPeriod - 1 || macdLine[i] === null) {
            signalLine.push(null);
        } else if (i === signalPeriod - 1) {
            // First signal is SMA of first 'signalPeriod' macdLine values
            let sum = 0;
            let count = 0;

            for (let j = i - signalPeriod + 1; j <= i; j++) {
                if (macdLine[j] !== null) {
                    sum += macdLine[j]!;
                    count++;
                }
            }

            signalLine.push(count > 0 ? sum / count : null);
        } else {
            const prevSignal = signalLine[i - 1];
            
            if (prevSignal === null || macdLine[i] === null) {
                signalLine.push(null);
            } else {
                const multiplier = 2 / (signalPeriod + 1);
                signalLine.push((macdLine[i]! - prevSignal) * multiplier + prevSignal);
            }
        }
    }

    // Histogram = MACD line - Signal line
    for (let i = 0; i < data.length; i++) {
        if (macdLine[i] !== null && signalLine[i] !== null) {
            histogram.push(macdLine[i]! - signalLine[i]!);
        } else {
            histogram.push(null);
        }
    }

    return { macdLine, signalLine, histogram };
}