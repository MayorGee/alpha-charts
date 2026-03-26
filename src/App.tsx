import { useState } from 'react';
import { Header } from './components/layout/Header';
import { Toolbar } from './components/layout/Toolbar';
import { Watchlist } from './components/layout/Watchlist';
import { OrderPanel } from './components/layout/OrderPanel';
import { TimeframeSelector } from './components/layout/TimeframeSelector';
import { IndicatorDialog } from './components/layout/IndicatorDialog';
import { CandlestickChart } from './components/chart/CandlestickChart';
import { VolumeChart } from './components/chart/VolumeChart';
import { IndicatorPane } from './components/chart/IndicatorPane';
import { MACDPane } from './components/chart/MACDPane';
import { useBinanceData } from './hooks/useBinanceData';
import { useIndicatorResults } from './hooks/useIndicatorResults';
import { useChartAreaDimensions } from './hooks/useChartAreaDimensions';
import { useDrawing } from './contexts/DrawingContext';
import { mockWatchlistSymbols } from './data/mockWatchlistSymbols';
import {
    VOLUME_CHART_HEIGHT,
    INDICATOR_PANE_HEIGHT,
    MACD_PANE_COLORS,
} from './constants/chartLayout';
import type { ChartStyle, Symbol, Indicator, IndicatorId } from './types';

function App() {
    const [chartStyle, setChartStyle] = useState<ChartStyle>('candlestick');
    const [showGrid, setShowGrid] = useState(true);
    const [selectedSymbol, setSelectedSymbol] = useState<Symbol>(mockWatchlistSymbols[0]);
    const [selectedTimeframe, setSelectedTimeframe] = useState('1h');
    const [watchlistCollapsed, setWatchlistCollapsed] = useState(false);
    const [orderPanelCollapsed, setOrderPanelCollapsed] = useState(false);
    const [indicatorDialogOpen, setIndicatorDialogOpen] = useState(false);
    const [activeIndicators, setActiveIndicators] = useState<Indicator[]>([]);

    const { candles, loading, error, isLive } = useBinanceData(
        selectedSymbol.symbol,
        selectedTimeframe,
    );

    const { mainIndicators, separateIndicators } = useIndicatorResults(candles, activeIndicators);

    const dimensions = useChartAreaDimensions({
        watchlistCollapsed,
        orderPanelCollapsed,
        separatePaneCount: separateIndicators.length,
    });

    const handleSearch = (query: string) => {
        console.log('Searching:', query);
    };

    const handleAddIndicator = (indicator: Indicator) => {
        if (!activeIndicators.some((i) => i.id === indicator.id)) {
            setActiveIndicators([...activeIndicators, indicator]);
        } else {
            alert('Indicator already added!');
        }
    };

    const handleRemoveIndicator = (id: IndicatorId) => {
        setActiveIndicators(activeIndicators.filter((i) => i.id !== id));
    };

    const handleSelectSymbol = (symbol: Symbol) => {
        setSelectedSymbol(symbol);
    };

    const {
        activeTool,
        setActiveTool,
        drawings,
        addDrawing,
        deleteDrawing,
        clearDrawings,
    } = useDrawing();

    return (
        <div className="app">
            <Header
                symbol={selectedSymbol}
                onSymbolSearch={handleSearch}
                isConnected={isLive}
            />
            <Toolbar
                activeTool={activeTool}
                onToolChange={setActiveTool}
                chartStyle={chartStyle}
                onChartStyleChange={setChartStyle}
                showGrid={showGrid}
                onGridToggle={() => setShowGrid(!showGrid)}
                onAddIndicator={() => setIndicatorDialogOpen(true)}
                onClearDrawings={clearDrawings}
                activeIndicators={activeIndicators}
                onRemoveIndicator={handleRemoveIndicator}
            />
            <div className="app-main">
                <Watchlist
                    symbols={mockWatchlistSymbols}
                    selectedSymbol={selectedSymbol.symbol}
                    onSelectSymbol={handleSelectSymbol}
                    isCollapsed={watchlistCollapsed}
                    onToggleCollapse={() => setWatchlistCollapsed(!watchlistCollapsed)}
                />
                <div className="chart-area">
                    {loading && (
                        <div className="chart-loading">Loading market data...</div>
                    )}
                    {error && (
                        <div className="chart-error">Error: {error}</div>
                    )}
                    {!loading && !error && dimensions.chartWidth > 0 && dimensions.mainChartHeight > 0 && (
                        <>
                            <CandlestickChart
                                data={candles}
                                width={dimensions.chartWidth}
                                height={dimensions.mainChartHeight}
                                showGrid={showGrid}
                                chartStyle={chartStyle}
                                indicators={mainIndicators}
                                drawings={drawings}
                                onAddDrawing={addDrawing}
                                onDeleteDrawing={deleteDrawing}
                                activeTool={activeTool}
                            />
                            <VolumeChart
                                data={candles}
                                width={dimensions.chartWidth}
                                height={VOLUME_CHART_HEIGHT}
                            />
                            {separateIndicators.map((ind) => {
                                switch (ind.id) {
                                    case 'macd':
                                        return (
                                            <MACDPane
                                                key={ind.id}
                                                data={candles}
                                                macd={ind.data}
                                                width={dimensions.chartWidth}
                                                height={INDICATOR_PANE_HEIGHT}
                                                lineColor={ind.color}
                                                signalColor={MACD_PANE_COLORS.signal}
                                                histogramPositiveColor={MACD_PANE_COLORS.histogramPositive}
                                                histogramNegativeColor={MACD_PANE_COLORS.histogramNegative}
                                            />
                                        );
                                    case 'rsi':
                                        return (
                                            <IndicatorPane
                                                key={ind.id}
                                                data={candles}
                                                indicatorData={ind.data}
                                                color={ind.color}
                                                label={ind.id.toUpperCase()}
                                                width={dimensions.chartWidth}
                                                height={INDICATOR_PANE_HEIGHT}
                                            />
                                        );
                                }
                            })}
                        </>
                    )}
                </div>
                <OrderPanel
                    currentPrice={selectedSymbol.price}
                    isCollapsed={orderPanelCollapsed}
                    onToggleCollapse={() => setOrderPanelCollapsed(!orderPanelCollapsed)}
                />
            </div>
            <TimeframeSelector
                selectedTimeframe={selectedTimeframe}
                onSelectTimeframe={setSelectedTimeframe}
            />
            <IndicatorDialog
                isOpen={indicatorDialogOpen}
                onClose={() => setIndicatorDialogOpen(false)}
                onAddIndicator={handleAddIndicator}
            />
        </div>
    );
}

export default App;