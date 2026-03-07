import { X, ChevronLeft, Star } from 'lucide-react';
import type { Symbol } from '../../../types';
import './watchlist.scss';

interface WatchlistProps {
    symbols: Symbol[];
    selectedSymbol: string;
    onSelectSymbol: (symbol: Symbol) => void;
    isCollapsed: boolean;
    onToggleCollapse: () => void;
}

export function Watchlist({
    symbols,
    selectedSymbol,
    onSelectSymbol,
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
                                <button
                                    className="watchlist__item-remove"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        // Handle remove from watchlist later
                                        console.log('Remove', symbol.symbol);
                                    }}
                                    title="Remove from watchlist"
                                >
                                    <X />
                                </button>
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