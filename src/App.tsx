import { useState, useEffect, useMemo } from 'react';
// Layout Components
import { Header } from './components/layout/Header';
import { Toolbar } from './components/layout/Toolbar';
import { Watchlist } from './components/layout/Watchlist';
import { OrderPanel } from './components/layout/OrderPanel';
import { TimeframeSelector } from './components/layout/TimeframeSelector';
import { IndicatorDialog } from './components/layout/IndicatorDialog';

// Chart components
import { CandlestickChart } from './components/chart/CandlestickChart';
import { VolumeChart } from './components/chart/VolumeChart';
import { IndicatorPane } from './components/chart/IndicatorPane';
import { MACDPane } from './components/chart/MACDPane';

// Indicator Calculators
import { calculateSMA } from './lib/indicators/sma';
import { calculateEMA } from './lib/indicators/ema';
import { calculateRSI } from './lib/indicators/rsi';
import { calculateBollingerBands } from './lib/indicators/bollinger';
import { calculateMACD, type MACDResult } from './lib/indicators/macd';

// Others
import { useBinanceData } from './hooks/useBinanceData';
import { useDrawing } from './contexts/DrawingContext';
import type { ChartStyle, DrawingTool, Symbol, Indicator, IndicatorResult } from './types';


// Mock symbols (for watchlist – 24h stats will remain static for now)
const mockSymbols: Symbol[] = [
    {
        symbol: 'BTC/USDT',
        price: 67799.74,
        change24h: -0.94,
        high24h: 70213.46,
        low24h: 67441.00,
        volume24h: 679020000
    },
    {
        symbol: 'ETH/USDT',
        price: 1981.70,
        change24h: -3.07,
        high24h: 2044.89,
        low24h: 1955.95,
        volume24h: 679750000
    },
    {
        symbol: 'SOL/USDT',
        price: 84.18,
        change24h: -4.09,
        high24h: 90.83,
        low24h: 84.17,
        volume24h: 420880000
    },
    {
        symbol: 'BNB/USDT',
        price: 398.25,
        change24h: -1.52,
        high24h: 407.80,
        low24h: 392.10,
        volume24h: 520000000
    },
    {
        symbol: 'XRP/USDT',
        price: 0.586,
        change24h: -2.13,
        high24h: 0.603,
        low24h: 0.574,
        volume24h: 900000000
    }
];

// Layout constants
const HEADER_HEIGHT = 64;
const TOOLBAR_HEIGHT = 48;
const VOLUME_CHART_HEIGHT = 120;
const TIMEFRAME_SELECTOR_HEIGHT = 48;
const INDICATOR_PANE_HEIGHT = 120;

function App() {
    const [chartStyle, setChartStyle] = useState<ChartStyle>('candlestick');
    const [showGrid, setShowGrid] = useState(true);
    const [selectedSymbol, setSelectedSymbol] = useState<Symbol>(mockSymbols[0]);
    const [selectedTimeframe, setSelectedTimeframe] = useState('1h');
    const [watchlistCollapsed, setWatchlistCollapsed] = useState(false);
    const [orderPanelCollapsed, setOrderPanelCollapsed] = useState(false);
    const [indicatorDialogOpen, setIndicatorDialogOpen] = useState(false);
    const [activeIndicators, setActiveIndicators] = useState<Indicator[]>([]);
    const [dimensions, setDimensions] = useState({ chartWidth: 0, mainChartHeight: 0 });

    const { candles, loading, error, isLive } = useBinanceData(
        selectedSymbol.symbol,
        selectedTimeframe
    );

    const indicatorResults = useMemo(() => {
        if (!candles.length) return [];
        return activeIndicators.map(ind => {
            switch (ind.id) {
                case 'sma':
                    return {
                        id: ind.id,
                        data: calculateSMA(candles, 20),
                        color: ind.color,
                        pane: 'main' as const,
                    };
                case 'ema': 
                    return {
                        id: ind.id,
                        data: calculateEMA(candles, 12),
                        color: ind.color,
                        pane: 'main' as const,
                    };
                case 'rsi':
                    return {
                        id: ind.id,
                        data: calculateRSI(candles, 14),
                        color: ind.color,
                        pane: 'separate' as const,
                    };
                case 'bollinger':
                    const bands = calculateBollingerBands(candles, 20, 2);

                    return {
                        id: ind.id,
                        data: bands, // { upper, middle, lower }
                        color: ind.color,
                        pane: 'main',
                    };
                case 'macd':
                    return {
                        id: ind.id,
                        data: calculateMACD(candles, 12, 26, 9), 
                        color: ind.color,
                        pane: 'separate',
                    }
                default:
                    return null;
            }
        }).filter(Boolean) as IndicatorResult[];
    }, [candles, activeIndicators]);
    
    const separateIndicators = useMemo(() => {
        return indicatorResults.filter(ind => ind.pane === 'separate');
    }, [indicatorResults]);

    // Update dimensions when panels collapse or window resizes
    useEffect(() => {
        const updateDimensions = () => {
            const watchlistWidth = watchlistCollapsed ? 48 : 224;
            const orderPanelWidth = orderPanelCollapsed ? 48 : 256;

            const chartWidth = Math.max(0, window.innerWidth - watchlistWidth - orderPanelWidth);
            const totalIndicatorHeight = separateIndicators.length * INDICATOR_PANE_HEIGHT;
            const mainChartHeight = Math.max(
                200, // minimum height
                window.innerHeight
                    - HEADER_HEIGHT
                    - TOOLBAR_HEIGHT
                    - VOLUME_CHART_HEIGHT
                    - TIMEFRAME_SELECTOR_HEIGHT
                    - totalIndicatorHeight
            );

            setDimensions({ chartWidth, mainChartHeight });
        };

        updateDimensions();
        window.addEventListener('resize', updateDimensions);
        return () => window.removeEventListener('resize', updateDimensions);
    }, [watchlistCollapsed, orderPanelCollapsed, separateIndicators.length]);

    // Handlers
    const handleSearch = (query: string) => {
        console.log('Searching:', query);
    };

    const handleAddIndicator = (indicator: Indicator) => {
        if (!activeIndicators.some(i => i.id === indicator.id)) {
            setActiveIndicators([...activeIndicators, indicator]);
        } else {
            alert('Indicator already added!');
        }
    };

    const handleRemoveIndicator = (id: string) => {
        setActiveIndicators(activeIndicators.filter(i => i.id !== id));
    };

    const handleSelectSymbol = (symbol: Symbol) => {
        setSelectedSymbol(symbol);
    };

    const { 
        activeTool, 
        setActiveTool, 
        drawings, 
        addDrawing, 
        clearDrawings 
    } = useDrawing();

    return (
        <div className="app">
            <Header 
                symbol={selectedSymbol}
                onSymbolSearch={handleSearch}
                isConnected={isLive}
            />
            <Toolbar
                activeTool={activeTool as DrawingTool}
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
                    symbols={mockSymbols}
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
                                indicators={indicatorResults}
                                drawings={drawings}
                                onAddDrawing={addDrawing}
                                activeTool={activeTool}
                            />
                            <VolumeChart
                                data={candles}
                                width={dimensions.chartWidth}
                                height={VOLUME_CHART_HEIGHT}
                            />
                            {separateIndicators.map((ind) => {
                                if (ind.id === 'macd') {
                                    const macdData = ind.data as MACDResult;

                                    return (
                                        <MACDPane
                                            key={ind.id}
                                            data={candles}
                                            macd={macdData}
                                            width={dimensions.chartWidth}
                                            height={INDICATOR_PANE_HEIGHT}
                                            lineColor={ind.color}
                                            signalColor="#FDD835" // you can define a constant
                                            histogramPositiveColor="#26A69A"
                                            histogramNegativeColor="#EF5350"
                                        />
                                    );
                                } else {
                                    return (
                                        <IndicatorPane
                                            key={ind.id}
                                            data={candles}
                                            indicatorData={ind.data as (number | null)[]}
                                            color={ind.color}
                                            label={ind.id.toUpperCase()}
                                            width={dimensions.chartWidth}
                                            height={INDICATOR_PANE_HEIGHT} 
                                        />
                                    )
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