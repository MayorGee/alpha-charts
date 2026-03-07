import { useState } from 'react';
import { ChevronRight, Minus, Plus } from 'lucide-react';
import './order-panel.scss';

interface OrderPanelProps {
    currentPrice: number;
    isCollapsed: boolean;
    onToggleCollapse: () => void;
}

export function OrderPanel({ currentPrice, isCollapsed, onToggleCollapse }: OrderPanelProps) {
    const [orderType, setOrderType] = useState<'buy' | 'sell'>('buy');
    const [price, setPrice] = useState(currentPrice.toString());
    const [quantity, setQuantity] = useState('0.01');

    if (isCollapsed) {
        return (
            <div className="order-panel order-panel--collapsed">
                <button
                    className="order-panel__header-button"
                    onClick={onToggleCollapse}
                    title="Expand Order Panel"
                >
                    <ChevronRight />
                </button>
            </div>
        );
    }

    const total = parseFloat(price || '0') * parseFloat(quantity || '0');

    return (
        <div className="order-panel">
            {/* Header */}
            <div className="order-panel__header">
                <h3 className="order-panel__header-title">Order Panel</h3>
                <button
                    className="order-panel__header-button"
                    onClick={onToggleCollapse}
                    title="Collapse Order Panel"
                >
                    <ChevronRight />
                </button>
            </div>

            {/* Order Form */}
            <div className="order-panel__content">
                {/* Buy/Sell Tabs */}
                <div className="order-panel__tabs">
                    <button
                        className={`order-panel__tab order-panel__tab--buy ${orderType === 'buy' ? 'order-panel__tab--active' : ''}`}
                        onClick={() => setOrderType('buy')}
                    >
                        Buy
                    </button>
                    <button
                        className={`order-panel__tab order-panel__tab--sell ${orderType === 'sell' ? 'order-panel__tab--active' : ''}`}
                        onClick={() => setOrderType('sell')}
                    >
                        Sell
                    </button>
                </div>

                {/* Price Input */}
                <div className="order-panel__field">
                    <label>Price (USDT)</label>
                    <input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                    />
                </div>

                {/* Quantity Input */}
                <div className="order-panel__field">
                    <label>Quantity</label>
                    <div className="order-panel__quantity">
                        <button
                            className="order-panel__quantity-button"
                            onClick={() => setQuantity((parseFloat(quantity) - 0.01).toFixed(2))}
                        >
                            <Minus />
                        </button>
                        <input
                            type="number"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                        />
                        <button
                            className="order-panel__quantity-button"
                            onClick={() => setQuantity((parseFloat(quantity) + 0.01).toFixed(2))}
                        >
                            <Plus />
                        </button>
                    </div>
                </div>

                {/* Total */}
                <div className="order-panel__total">
                    <span className="order-panel__total-label">Total</span>
                    <span className="order-panel__total-value">${total.toFixed(2)}</span>
                </div>

                {/* Order Button */}
                <button
                    className={`order-panel__action order-panel__action--${orderType}`}
                >
                    {orderType === 'buy' ? 'Buy' : 'Sell'} (Simulated)
                </button>
            </div>
        </div>
    );
}