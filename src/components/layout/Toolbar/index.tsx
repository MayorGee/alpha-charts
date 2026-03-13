import {
    TrendingUp,
    Minus,
    ArrowRight,
    Eraser,
    Plus,
    Grid3x3,
    CandlestickChart,
    LineChart,
    Settings,
} from 'lucide-react';
import type { ToolbarProps } from '../../../types/props';
import type { DrawingTool } from '../../../types';
import './toolbar.scss';

export function Toolbar({
    activeTool,
    onToolChange,
    chartStyle,
    onChartStyleChange,
    showGrid,
    onGridToggle,
    onAddIndicator,
    onClearDrawings,
    activeIndicators = [],
    onRemoveIndicator,
}: ToolbarProps) {
    const toolButtons = [
        { id: 'trendline' as DrawingTool, icon: TrendingUp, label: 'Trendline' },
        { id: 'horizontal' as DrawingTool, icon: Minus, label: 'Horizontal Line' },
        { id: 'vertical' as DrawingTool, icon: ArrowRight, label: 'Vertical Line' },
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

                {/* Settings (placeholder) */}
                <button
                    className="toolbar__button"
                    title="Settings"
                    // onClick will be added later
                >
                    <Settings />
                </button>
            </div>
        </div>
    );
}