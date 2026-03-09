import { X } from 'lucide-react';
import type { Indicator } from '../../../types';
import type { IndicatorDialogProps } from '../../../types/props';
import './indicator-dialog.scss';

const availableIndicators: Indicator[] = [
    {
        id: 'sma',
        name: 'SMA (Simple Moving Average)',
        description: 'Period: 20',
        color: '#FDD835',
    },
    {
        id: 'ema',
        name: 'EMA (Exponential Moving Average)',
        description: 'Period: 12',
        color: '#42A5F5',
    },
    {
        id: 'rsi',
        name: 'RSI (Relative Strength Index)',
        description: 'Period: 14',
        color: '#AB47BC',
    },
    {
        id: 'macd',
        name: 'MACD',
        description: 'Fast: 12, Slow: 26, Signal: 9',
        color: '#26A69A',
    },
    {
        id: 'bollinger',
        name: 'Bollinger Bands',
        description: 'Period: 20, Std Dev: 2',
        color: '#2962FF',
    },
];

export const IndicatorDialog: React.FC<IndicatorDialogProps> = ({
    isOpen,
    onClose,
    onAddIndicator,
}) => {
    if (!isOpen) return null;

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