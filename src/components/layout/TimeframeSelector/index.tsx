import type { TimeframeSelectorProps } from '../../../types/props';
import './timeframe-selector.scss';

const timeframes = [
    { label: '1m', value: '1m', minutes: 1 },
    { label: '5m', value: '5m', minutes: 5 },
    { label: '15m', value: '15m', minutes: 15 },
    { label: '1h', value: '1h', minutes: 60 },
    { label: '4h', value: '4h', minutes: 240 },
    { label: '1D', value: '1D', minutes: 1440 },
    { label: '1W', value: '1W', minutes: 10080 },
];

export function TimeframeSelector({
    selectedTimeframe,
    onSelectTimeframe,
}: TimeframeSelectorProps) {
    return (
        <div className="timeframe-selector">
            {timeframes.map((tf) => (
                <button
                    key={tf.value}
                    className={`timeframe-selector__button ${selectedTimeframe === tf.value ? 'timeframe-selector__button--active' : ''}`}
                    onClick={() => onSelectTimeframe(tf.value)}
                >
                    {tf.label}
                </button>
            ))}
        </div>
    );
}