import { useState, useEffect } from 'react';
import { Header } from './components/layout/Header';
import { Toolbar } from './components/layout/Toolbar';
import { Watchlist } from './components/layout/Watchlist';
import { OrderPanel } from './components/layout/OrderPanel';
import { TimeframeSelector } from './components/layout/TimeframeSelector';
import { CandlestickChart } from './components/chart/CandlestickChart';
import { VolumeChart } from './components/chart/VolumeChart';
import { IndicatorDialog } from './components/layout/IndicatorDialog';
import { useBinanceData } from './hooks/useBinanceData';
import type { ChartStyle, DrawingTool, Symbol, Indicator } from './types';

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

function App() {
    const [activeTool, setActiveTool] = useState<DrawingTool>('none');
    const [chartStyle, setChartStyle] = useState<ChartStyle>('candlestick');
    const [showGrid, setShowGrid] = useState(true);
    const [selectedSymbol, setSelectedSymbol] = useState<Symbol>(mockSymbols[0]);
    const [selectedTimeframe, setSelectedTimeframe] = useState('1h');
    const [watchlistCollapsed, setWatchlistCollapsed] = useState(false);
    const [orderPanelCollapsed, setOrderPanelCollapsed] = useState(false);
    const [indicatorDialogOpen, setIndicatorDialogOpen] = useState(false);
    const [activeIndicators, setActiveIndicators] = useState<Indicator[]>([]);
    const [dimensions, setDimensions] = useState({ chartWidth: 0, mainChartHeight: 0 });

    // Real data from Binance
    const { candles, loading, error, isLive } = useBinanceData(
        selectedSymbol.symbol,
        selectedTimeframe
    );

    // Update dimensions when panels collapse or window resizes
    useEffect(() => {
        const updateDimensions = () => {
            const watchlistWidth = watchlistCollapsed ? 48 : 224;
            const orderPanelWidth = orderPanelCollapsed ? 48 : 256;

            const chartWidth = Math.max(0, window.innerWidth - watchlistWidth - orderPanelWidth);
            const mainChartHeight = Math.max(0,
                window.innerHeight - HEADER_HEIGHT - TOOLBAR_HEIGHT - VOLUME_CHART_HEIGHT - TIMEFRAME_SELECTOR_HEIGHT
            );

            setDimensions({ chartWidth, mainChartHeight });
        };

        updateDimensions();
        window.addEventListener('resize', updateDimensions);
        return () => window.removeEventListener('resize', updateDimensions);
    }, [watchlistCollapsed, orderPanelCollapsed]);

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

    const handleClearDrawings = () => {
        console.log('Clear drawings');
    };

    const handleSelectSymbol = (symbol: Symbol) => {
        setSelectedSymbol(symbol);
    };

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
                onClearDrawings={handleClearDrawings}
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
                            />
                            <VolumeChart
                                data={candles}
                                width={dimensions.chartWidth}
                                height={VOLUME_CHART_HEIGHT}
                            />
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