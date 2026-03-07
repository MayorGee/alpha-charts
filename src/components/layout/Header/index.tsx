import { Search, Wifi } from 'lucide-react';
import type { Symbol } from '../../../types/index';
import './header.scss';

interface HeaderProps {
    symbol: Symbol;
    onSymbolSearch: (query: string) => void;
    isConnected: boolean;
}

export function Header({ symbol, onSymbolSearch, isConnected }: HeaderProps) {
    const changeClass = symbol.change24h >= 0 ? 'header__stats-value--positive' : 'header__stats-value--negative';
    const changeSign = symbol.change24h >= 0 ? '+' : '';

    return (
        <header className="header">
            {/* Symbol Search */}
            <div className="header__search">
                <Search className="header__search-icon" />
                <input
                    type="text"
                    placeholder="Search symbol..."
                    className="header__search-input"
                    onChange={(e) => onSymbolSearch(e.target.value)}
                />
            </div>

            {/* Current Price Info */}
            <div className="header__info">
                <div className="header__symbol">
                    <span className="header__symbol-name">{symbol.symbol}</span>
                    <span className="header__symbol-price">
                        ${symbol.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                </div>

                <div className="header__stats">
                    <div className="header__stats-item">
                        <span className="header__stats-label">24h Change: </span>
                        <span className={`header__stats-value ${changeClass}`}>
                            {changeSign}{symbol.change24h.toFixed(2)}%
                        </span>
                    </div>
                    <div className="header__stats-item">
                        <span className="header__stats-label">24h High: </span>
                        <span className="header__stats-value">
                            ${symbol.high24h.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                    </div>
                    <div className="header__stats-item">
                        <span className="header__stats-label">24h Low: </span>
                        <span className="header__stats-value">
                            ${symbol.low24h.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                    </div>
                    <div className="header__stats-item">
                        <span className="header__stats-label">24h Volume: </span>
                        <span className="header__stats-value">
                            ${(symbol.volume24h / 1000000000).toFixed(2)}B
                        </span>
                    </div>
                </div>
            </div>

            {/* Connection Status */}
            <div className="header__connection">
                <div className={`header__connection-dot ${isConnected ? 'header__connection-dot--connected' : 'header__connection-dot--disconnected'}`} />
                <Wifi className={`header__connection-icon ${isConnected ? 'header__connection-icon--connected' : 'header__connection-icon--disconnected'}`} />
            </div>
        </header>
    );
}