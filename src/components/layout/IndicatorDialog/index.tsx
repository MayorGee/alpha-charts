import { X } from 'lucide-react';
import type { Indicator } from '../../../types';
import type { IndicatorDialogProps } from '../../../types/props';
import './indicator-dialog.scss';

export const IndicatorDialog: React.FC<IndicatorDialogProps> = ({
    isOpen,
    periods,
    onClose,
    onAddIndicator,
}) => {
    if (!isOpen) return null;

    const availableIndicators: Indicator[] = [
        {
            id: 'sma',
            name: 'SMA (Simple Moving Average)',
            description: `Period: ${periods.sma}`,
            color: '#FDD835',
        },
        {
            id: 'ema',
            name: 'EMA (Exponential Moving Average)',
            description: `Period: ${periods.ema}`,
            color: '#42A5F5',
        },
        {
            id: 'rsi',
            name: 'RSI (Relative Strength Index)',
            description: `Period: ${periods.rsi}`,
            color: '#AB47BC',
        },
        {
            id: 'macd',
            name: 'MACD',
            description: `Fast: ${periods.macdFast}, Slow: ${periods.macdSlow}, Signal: ${periods.macdSignal}`,
            color: '#26A69A',
        },
        {
            id: 'bollinger',
            name: 'Bollinger Bands',
            description: `Period: ${periods.bollingerPeriod}, Std Dev: ${periods.bollingerStdDev}`,
            color: '#2962FF',
        },
    ];

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div className="indicator-dialog__overlay" onClick={handleOverlayClick}>
            <div className="indicator-dialog">
                {/* Header */}
                <div className="indicator-dialog__header">
                    <h3 className="indicator-dialog__title">Add Indicator</h3>
                    <button
                        className="indicator-dialog__close"
                        onClick={onClose}
                        aria-label="Close dialog"
                    >
                        <X />
                    </button>
                </div>

                {/* Content */}
                <div className="indicator-dialog__content">
                    <div className="indicator-dialog__list">
                        {availableIndicators.map((indicator) => (
                            <button
                                key={indicator.id}
                                className="indicator-dialog__item"
                                onClick={() => {
                                    onAddIndicator(indicator);
                                    onClose();
                                }}
                            >
                                <div
                                    className="indicator-dialog__item-color"
                                    style={{ backgroundColor: indicator.color }}
                                />
                                <div className="indicator-dialog__item-info">
                                    <div className="indicator-dialog__item-name">
                                        {indicator.name}
                                    </div>
                                    <div className="indicator-dialog__item-description">
                                        {indicator.description}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};