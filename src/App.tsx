import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import { useWatchlistTicker } from './hooks/useWatchlistTicker';
import { useDrawing } from './contexts/DrawingContext';
import { mockWatchlistSymbols } from './data/mockWatchlistSymbols';
import { fetch24hrTicker, fetchExchangeSymbols } from './lib/api/binanceRest';
import {
    VOLUME_CHART_HEIGHT,
    INDICATOR_PANE_HEIGHT,
    MACD_PANE_COLORS,
} from './constants/chartLayout';
import type { ChartStyle, Symbol, Indicator, IndicatorId } from './types';

const WATCHLIST_STORAGE_KEY = 'alpha-charts-watchlist';

function App() {
    const [chartStyle, setChartStyle] = useState<ChartStyle>('candlestick');
    const [showGrid, setShowGrid] = useState(true);
    const [showTooltip, setShowTooltip] = useState(true);
    const [watchlistSymbols, setWatchlistSymbols] = useState<Symbol[]>(mockWatchlistSymbols);
    const [selectedSymbolName, setSelectedSymbolName] = useState(mockWatchlistSymbols[0].symbol);
    const [searchQuery, setSearchQuery] = useState('');
    const [symbolUniverse, setSymbolUniverse] = useState<string[]>([]);
    const [selectedTimeframe, setSelectedTimeframe] = useState('1h');
    const [watchlistCollapsed, setWatchlistCollapsed] = useState(false);
    const [orderPanelCollapsed, setOrderPanelCollapsed] = useState(false);
    const [indicatorDialogOpen, setIndicatorDialogOpen] = useState(false);
    const [activeIndicators, setActiveIndicators] = useState<Indicator[]>([]);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const toastTimeoutRef = useRef<number | null>(null);
    const selectedSymbol = useMemo(
        () =>
            watchlistSymbols.find((s) => s.symbol === selectedSymbolName) ??
            watchlistSymbols[0] ??
            mockWatchlistSymbols[0],
        [selectedSymbolName, watchlistSymbols],
    );

    const { candles, loading, loadingMoreHistory, loadOlderHistory, error, isLive } = useBinanceData(
        selectedSymbol.symbol,
        selectedTimeframe,
    );

    const { mainIndicators, separateIndicators } = useIndicatorResults(candles, activeIndicators);

    const dimensions = useChartAreaDimensions({
        watchlistCollapsed,
        orderPanelCollapsed,
        separatePaneCount: separateIndicators.length,
    });

    const showToast = (message: string, durationMs = 2200) => {
        setToastMessage(message);
        if (toastTimeoutRef.current !== null) {
            window.clearTimeout(toastTimeoutRef.current);
        }
        toastTimeoutRef.current = window.setTimeout(() => {
            setToastMessage(null);
            toastTimeoutRef.current = null;
        }, durationMs);
    };

    useEffect(() => {
        const stored = localStorage.getItem(WATCHLIST_STORAGE_KEY);
        if (!stored) return;
        try {
            const parsed = JSON.parse(stored) as Symbol[];
            if (Array.isArray(parsed) && parsed.length > 0) {
                setWatchlistSymbols(parsed);
                setSelectedSymbolName(parsed[0].symbol);
            }
        } catch {
            // Ignore corrupted storage and continue with defaults.
        }
    }, []);

    useEffect(() => {
        localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(watchlistSymbols));
    }, [watchlistSymbols]);

    useEffect(() => {
        fetchExchangeSymbols()
            .then(setSymbolUniverse)
            .catch(() => showToast('Could not load Binance symbols.'));
    }, []);

    const searchResults = useMemo(() => {
        const q = searchQuery.trim().toUpperCase().replace('/', '');
        if (!q) return [];
        return symbolUniverse
            .filter((symbol) => symbol.replace('/', '').startsWith(q))
            .slice(0, 20)
            .map((name) => {
                const existing = watchlistSymbols.find((s) => s.symbol === name);
                return (
                    existing ?? {
                        symbol: name,
                        price: 0,
                        change24h: 0,
                        high24h: 0,
                        low24h: 0,
                        volume24h: 0,
                    }
                );
            });
    }, [searchQuery, symbolUniverse, watchlistSymbols]);

    const handleSearch = (query: string) => setSearchQuery(query);

    const handleSelectSearchResult = async (result: Symbol) => {
        try {
            const full = await fetch24hrTicker(result.symbol);
            setWatchlistSymbols((prev) => {
                const exists = prev.some((s) => s.symbol === full.symbol);
                return exists ? prev.map((s) => (s.symbol === full.symbol ? full : s)) : [full, ...prev];
            });
            setSelectedSymbolName(full.symbol);
            setSearchQuery('');
        } catch {
            showToast(`Could not fetch data for ${result.symbol}`);
        }
    };

    const handleAddIndicator = (indicator: Indicator) => {
        if (!activeIndicators.some((i) => i.id === indicator.id)) {
            setActiveIndicators([...activeIndicators, indicator]);
        } else {
            showToast(`${indicator.name} is already added.`);
        }
    };

    const handleRemoveIndicator = (id: IndicatorId) => {
        setActiveIndicators(activeIndicators.filter((i) => i.id !== id));
    };

    const handleSelectSymbol = (symbol: Symbol) => {
        setSelectedSymbolName(symbol.symbol);
    };

    const handleRemoveSymbol = (symbolName: string) => {
        setWatchlistSymbols((prev) => {
            if (prev.length <= 1) {
                showToast('Watchlist must contain at least one symbol.');
                return prev;
            }
            const updated = prev.filter((s) => s.symbol !== symbolName);
            if (selectedSymbolName === symbolName) {
                setSelectedSymbolName(updated[0].symbol);
            }
            return updated;
        });
    };

    const {
        activeTool,
        setActiveTool,
        drawings,
        addDrawing,
        updateDrawing,
        deleteDrawing,
        clearDrawings,
    } = useDrawing();

    const handleTickerUpdate = useCallback(
        (
            symbolName: string,
            ticker: {
                price: number;
                change24h: number;
                high24h: number;
                low24h: number;
                volume24h: number;
            },
        ) => {
            setWatchlistSymbols((prev) =>
                prev.map((s) =>
                    s.symbol === symbolName
                        ? {
                              ...s,
                              price: ticker.price,
                              change24h: ticker.change24h,
                              high24h: ticker.high24h,
                              low24h: ticker.low24h,
                              volume24h: ticker.volume24h,
                          }
                        : s,
                ),
            );
        },
        [],
    );

    useWatchlistTicker(
        useMemo(() => watchlistSymbols.map((s) => s.symbol), [watchlistSymbols]),
        handleTickerUpdate,
    );

    return (
        <div className="app">
            {toastMessage && (
                <div className="app-toast" role="status" aria-live="polite">
                    {toastMessage}
                </div>
            )}
            <Header
                symbol={selectedSymbol}
                searchQuery={searchQuery}
                onSymbolSearch={handleSearch}
                searchResults={searchResults}
                onSelectSearchResult={handleSelectSearchResult}
                isConnected={isLive}
            />
            <Toolbar
                activeTool={activeTool}
                onToolChange={setActiveTool}
                chartStyle={chartStyle}
                onChartStyleChange={setChartStyle}
                showGrid={showGrid}
                onGridToggle={() => setShowGrid(!showGrid)}
                showTooltip={showTooltip}
                onTooltipToggle={() => setShowTooltip(!showTooltip)}
                onAddIndicator={() => setIndicatorDialogOpen(true)}
                onClearDrawings={clearDrawings}
                activeIndicators={activeIndicators}
                onRemoveIndicator={handleRemoveIndicator}
            />
            <div className="app-main">
                <Watchlist
                    symbols={watchlistSymbols}
                    selectedSymbol={selectedSymbolName}
                    onSelectSymbol={handleSelectSymbol}
                    onRemoveSymbol={handleRemoveSymbol}
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
                                showTooltip={showTooltip}
                                chartStyle={chartStyle}
                                indicators={mainIndicators}
                                drawings={drawings}
                                onAddDrawing={addDrawing}
                                onUpdateDrawing={updateDrawing}
                                onDeleteDrawing={deleteDrawing}
                                onReachLeftEdge={loadOlderHistory}
                                isLoadingMoreHistory={loadingMoreHistory}
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