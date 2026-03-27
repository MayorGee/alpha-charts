import { X, ChevronLeft, Star } from 'lucide-react';
import type { WatchlistProps } from '../../../types/props';
import './watchlist.scss';

export function Watchlist({
    symbols,
    selectedSymbol,
    onSelectSymbol,
    onRemoveSymbol,
    isCollapsed,
    onToggleCollapse,
}: WatchlistProps) {
    if (isCollapsed) {
        return (
            <div className="watchlist watchlist--collapsed">
                <button
                    className="watchlist__toggle"
                    onClick={onToggleCollapse}
                    title="Expand Watchlist"
                >
                    <Star />
                </button>
            </div>
        );
    }

    return (
        <div className="watchlist">
            {/* Header */}
            <div className="watchlist__header">
                <h3 className="watchlist__header-title">Watchlist</h3>
                <button
                    className="watchlist__header-button"
                    onClick={onToggleCollapse}
                    title="Collapse Watchlist"
                >
                    <ChevronLeft />
                </button>
            </div>

            {/* Watchlist Items */}
            <div className="watchlist__items">
                {symbols.map((symbol) => {
                    const isSelected = selectedSymbol === symbol.symbol;
                    const changeClass = symbol.change24h >= 0 ? 'watchlist__item-change--positive' : 'watchlist__item-change--negative';
                    const changeSign = symbol.change24h >= 0 ? '+' : '';

                    return (
                        <button
                            key={symbol.symbol}
                            className={`watchlist__item ${isSelected ? 'watchlist__item--selected' : ''}`}
                            onClick={() => onSelectSymbol(symbol)}
                        >
                            <div className="watchlist__item-row">
                                <span className="watchlist__item-symbol">{symbol.symbol}</span>
                                <span
                                    className="watchlist__item-remove"
                                    title="Remove from watchlist"
                                    role='button'
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onRemoveSymbol(symbol.symbol);
                                    }}
                                >
                                    <X />
                                </span>
                            </div>
                            <div className="watchlist__item-row">
                                <span className="watchlist__item-price">
                                    ${symbol.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </span>
                                <span className={`watchlist__item-change ${changeClass}`}>
                                    {changeSign}{symbol.change24h.toFixed(2)}%
                                </span>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}