import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Header } from './components/layout/Header';
import { Toolbar } from './components/layout/Toolbar';
import { Watchlist } from './components/layout/Watchlist';
import { OrderPanel } from './components/layout/OrderPanel';
import { TimeframeSelector } from './components/layout/TimeframeSelector';
import { IndicatorDialog } from './components/layout/IndicatorDialog';
import { SettingsPanel } from './components/layout/SettingsPanel';
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
import type { ChartStyle, Symbol, Indicator, IndicatorId, UserPreferences } from './types';

const WATCHLIST_STORAGE_KEY = 'alpha-charts-watchlist';
const ACTIVE_INDICATORS_STORAGE_KEY = 'alpha-charts-active-indicators';
const PREFERENCES_STORAGE_KEY = 'alpha-charts-preferences';

const defaultPreferences: UserPreferences = {
    defaultTimeframe: '1h',
    theme: 'dark',
    indicatorPeriods: {
        sma: 20,
        ema: 12,
        rsi: 14,
        bollingerPeriod: 20,
        bollingerStdDev: 2,
        macdFast: 12,
        macdSlow: 26,
        macdSignal: 9,
    },
    chartColors: {
        bullish: '#26A69A',
        bearish: '#EF5350',
        line: '#42A5F5',
        grid: '#2F3A48',
    },
};

const clamp = (value: number, min: number, fallback: number) =>
    Number.isFinite(value) && value >= min ? value : fallback;

function sanitizePreferences(raw: UserPreferences): UserPreferences {
    return {
        ...defaultPreferences,
        ...raw,
        theme: raw.theme === 'light' ? 'light' : 'dark',
        defaultTimeframe:
            ['1m', '5m', '15m', '1h', '4h', '1D', '1W'].includes(raw.defaultTimeframe)
                ? raw.defaultTimeframe
                : defaultPreferences.defaultTimeframe,
        indicatorPeriods: {
            sma: clamp(raw.indicatorPeriods?.sma, 2, defaultPreferences.indicatorPeriods.sma),
            ema: clamp(raw.indicatorPeriods?.ema, 2, defaultPreferences.indicatorPeriods.ema),
            rsi: clamp(raw.indicatorPeriods?.rsi, 2, defaultPreferences.indicatorPeriods.rsi),
            bollingerPeriod: clamp(
                raw.indicatorPeriods?.bollingerPeriod,
                2,
                defaultPreferences.indicatorPeriods.bollingerPeriod,
            ),
            bollingerStdDev: clamp(
                raw.indicatorPeriods?.bollingerStdDev,
                0.1,
                defaultPreferences.indicatorPeriods.bollingerStdDev,
            ),
            macdFast: clamp(raw.indicatorPeriods?.macdFast, 2, defaultPreferences.indicatorPeriods.macdFast),
            macdSlow: clamp(raw.indicatorPeriods?.macdSlow, 2, defaultPreferences.indicatorPeriods.macdSlow),
            macdSignal: clamp(
                raw.indicatorPeriods?.macdSignal,
                2,
                defaultPreferences.indicatorPeriods.macdSignal,
            ),
        },
        chartColors: {
            bullish: raw.chartColors?.bullish || defaultPreferences.chartColors.bullish,
            bearish: raw.chartColors?.bearish || defaultPreferences.chartColors.bearish,
            line: raw.chartColors?.line || defaultPreferences.chartColors.line,
            grid: raw.chartColors?.grid || defaultPreferences.chartColors.grid,
        },
    };
}

function App() {
    const [chartStyle, setChartStyle] = useState<ChartStyle>('candlestick');
    const [showGrid, setShowGrid] = useState(true);
    const [showTooltip, setShowTooltip] = useState(true);
    const [watchlistSymbols, setWatchlistSymbols] = useState<Symbol[]>(mockWatchlistSymbols);
    const [selectedSymbolName, setSelectedSymbolName] = useState(mockWatchlistSymbols[0].symbol);
    const [searchQuery, setSearchQuery] = useState('');
    const [symbolUniverse, setSymbolUniverse] = useState<string[]>([]);
    const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
    const [selectedTimeframe, setSelectedTimeframe] = useState(defaultPreferences.defaultTimeframe);
    const [watchlistCollapsed, setWatchlistCollapsed] = useState(false);
    const [orderPanelCollapsed, setOrderPanelCollapsed] = useState(false);
    const [indicatorDialogOpen, setIndicatorDialogOpen] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [activeIndicators, setActiveIndicators] = useState<Indicator[]>(() => {
        try {
            const raw = localStorage.getItem(ACTIVE_INDICATORS_STORAGE_KEY);
            if (!raw) return [];
            const parsed = JSON.parse(raw) as Indicator[];
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    });
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

    const { mainIndicators, separateIndicators } = useIndicatorResults(
        candles,
        activeIndicators,
        preferences.indicatorPeriods,
    );

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
        const stored = localStorage.getItem(PREFERENCES_STORAGE_KEY);
        if (!stored) return;
        try {
            const parsed = JSON.parse(stored) as UserPreferences;
            if (!parsed) return;
            const merged = sanitizePreferences(parsed);
            setPreferences(merged);
            setSelectedTimeframe(merged.defaultTimeframe);
        } catch {
            // Ignore malformed saved preferences.
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(preferences));
        document.documentElement.setAttribute('data-theme', preferences.theme);
    }, [preferences]);

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
        localStorage.setItem(ACTIVE_INDICATORS_STORAGE_KEY, JSON.stringify(activeIndicators));
    }, [activeIndicators]);

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
                onClearSearch={() => setSearchQuery('')}
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
                onOpenSettings={() => setSettingsOpen(true)}
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
                                chartColors={preferences.chartColors}
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
                                chartColors={preferences.chartColors}
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
                periods={preferences.indicatorPeriods}
                onClose={() => setIndicatorDialogOpen(false)}
                onAddIndicator={handleAddIndicator}
            />
            <SettingsPanel
                isOpen={settingsOpen}
                preferences={preferences}
                defaultPreferences={defaultPreferences}
                onClose={() => setSettingsOpen(false)}
                onSave={(next) => {
                    setPreferences(next);
                    setSelectedTimeframe(next.defaultTimeframe);
                    showToast('Settings saved.');
                }}
            />
        </div>
    );
}

export default App;