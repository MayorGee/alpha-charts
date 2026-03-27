import {
    TrendingUp,
    Minus,
    ArrowRight,
    Eraser,
    Plus,
    Grid3x3,
    Info,
    CandlestickChart,
    LineChart,
    Settings,
} from 'lucide-react';
import type { ToolbarProps } from '../../../types/props';
import type { DrawingTool } from '../../../types';
import './toolbar.scss';

function FibonacciIcon() {
    return (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
            <path d="M4 19.5H20" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
            <path d="M4 16.4H20" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
            <path d="M4 13.6H20" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
            <path d="M4 10.2H20" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
            <path d="M4 6.5H20" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
            <path d="M5.2 18.8L18.5 7.2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            <circle cx="5.2" cy="18.8" r="1.1" fill="currentColor" />
            <circle cx="18.5" cy="7.2" r="1.1" fill="currentColor" />
        </svg>
    );
}

export function Toolbar({
    activeTool,
    onToolChange,
    chartStyle,
    onChartStyleChange,
    showGrid,
    onGridToggle,
    showTooltip,
    onTooltipToggle,
    onOpenSettings,
    onAddIndicator,
    onClearDrawings,
    activeIndicators = [],
    onRemoveIndicator,
}: ToolbarProps) {
    const toolButtons = [
        { id: 'trendline' as DrawingTool, icon: TrendingUp, label: 'Trendline' },
        { id: 'horizontal' as DrawingTool, icon: Minus, label: 'Horizontal Line' },
        { id: 'vertical' as DrawingTool, icon: ArrowRight, label: 'Vertical Line' },
        { id: 'fibonacci' as DrawingTool, icon: FibonacciIcon, label: 'Fibonacci Retracement' },
    ];

    return (
        <div className="toolbar">
            {/* Drawing Tools Section */}
            <div className="toolbar__section">
                {toolButtons.map((tool) => (
                    <button
                        key={tool.id}
                        className={`toolbar__button ${activeTool === tool.id ? 'toolbar__button--active' : ''}`}
                        onClick={() => onToolChange(activeTool === tool.id ? 'none' : tool.id)}
                        title={tool.label}
                    >
                        <tool.icon />
                    </button>
                ))}
                <button
                    className="toolbar__button"
                    onClick={onClearDrawings}
                    title="Clear All Drawings"
                >
                    <Eraser />
                </button>
            </div>

            {/* Active Indicators */}
            {activeIndicators.length > 0 && (
                <div className="toolbar__indicators">
                    {activeIndicators.map((indicator) => (
                        <div key={indicator.id} className="toolbar__indicator-chip">
                            <div
                                className="toolbar__indicator-color"
                                style={{ backgroundColor: indicator.color }}
                            />
                            <span className="toolbar__indicator-name">{indicator.name}</span>
                            {onRemoveIndicator && (
                                <button
                                    className="toolbar__indicator-remove"
                                    onClick={() => onRemoveIndicator(indicator.id)}
                                >
                                    ×
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Right Side Tools */}
            <div className="toolbar__group">
                <button
                    className="toolbar__indicator-btn"
                    onClick={onAddIndicator}
                >
                    <Plus />
                    <span>Indicator</span>
                </button>

                {/* Chart Style Toggle */}
                <div className="toolbar__section">
                    <button
                        className={`toolbar__button ${chartStyle === 'candlestick' ? 'toolbar__button--active' : ''}`}
                        onClick={() => onChartStyleChange('candlestick')}
                        title="Candlestick Chart"
                    >
                        <CandlestickChart />
                    </button>
                    <button
                        className={`toolbar__button ${chartStyle === 'line' ? 'toolbar__button--active' : ''}`}
                        onClick={() => onChartStyleChange('line')}
                        title="Line Chart"
                    >
                        <LineChart />
                    </button>
                </div>

                {/* Grid Toggle */}
                <button
                    className={`toolbar__button ${showGrid ? 'toolbar__button--active' : ''}`}
                    onClick={onGridToggle}
                    title="Toggle Grid"
                >
                    <Grid3x3 />
                </button>

                <button
                    className={`toolbar__button ${showTooltip ? 'toolbar__button--active' : ''}`}
                    onClick={onTooltipToggle}
                    title="Toggle Data Tooltip"
                >
                    <Info />
                </button>

                {/* Settings (placeholder) */}
                <button
                    className="toolbar__button"
                    title="Settings"
                    onClick={onOpenSettings}
                >
                    <Settings />
                </button>
            </div>
        </div>
    );
}