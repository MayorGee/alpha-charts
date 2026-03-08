import { useState, useEffect } from 'react';
import { Header } from './components/layout/Header';
import { Toolbar } from './components/layout/Toolbar';
import { Watchlist } from './components/layout/Watchlist';
import { OrderPanel } from './components/layout/OrderPanel';
import { TimeframeSelector } from './components/layout/TimeframeSelector';
import type { Candle, ChartStyle, DrawingTool, Symbol, Indicator } from './types';
import { CandlestickChart } from './components/chart/CandlestickChart';
import { VolumeChart } from './components/chart/VolumeChart';
import { IndicatorDialog } from './components/layout/IndicatorDialog';
import { generateMockCandles } from './utils/chartData';

const mockSymbols: Symbol[] = [
    {
      symbol: 'BTC/USDT',
      price: 67799.74,
      change24h: -0.94,
      high24h: 70213.46,
      low24h: 67441.00,
      volume24h: 679020000 // USDT
    },
    {
      symbol: 'ETH/USDT',
      price: 1981.70,
      change24h: -3.07,
      high24h: 2044.89,
      low24h: 1955.95,
      volume24h: 679750000 // USDT
    },
    {
      symbol: 'SOL/USDT',
      price: 84.18,
      change24h: -4.09,
      high24h: 90.83,
      low24h: 84.17,
      volume24h: 420880000 // approx USDT
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

function App() {
    const [activeTool, setActiveTool] = useState<DrawingTool>('none');
    const [chartStyle, setChartStyle] = useState<ChartStyle>('candlestick');
    const [showGrid, setShowGrid] = useState(true);
    const [selectedSymbol, setSelectedSymbol] = useState<Symbol>(mockSymbols[0]);
    const [selectedTimeframe, setSelectedTimeframe] = useState('1h');
    const [watchlistCollapsed, setWatchlistCollapsed] = useState(false);
    const [orderPanelCollapsed, setOrderPanelCollapsed] = useState(false);
    const [chartData, setChartData] = useState<Candle[]>([]);
    const [indicatorDialogOpen, setIndicatorDialogOpen] = useState(false);
    const [activeIndicators, setActiveIndicators] = useState<Indicator[]>([]);

    useEffect(() => {
        const data = generateMockCandles(100);
        setChartData(data);
    }, [selectedSymbol, selectedTimeframe]);

    const headerHeight = 64;
    const toolbarHeight = 48;
    const volumeChartHeight = 120;
    const timeframeSelectorHeight = 48; 

    const watchlistWidth = watchlistCollapsed ? 48 : 224;
    const orderPanelWidth = orderPanelCollapsed ? 48 : 256;
    const chartWidth = window.innerWidth - watchlistWidth - orderPanelWidth;

    const availableHeight = window.innerHeight - headerHeight - toolbarHeight - volumeChartHeight - timeframeSelectorHeight;
    const [mainChartHeight, setMainChartHeight] = useState(availableHeight);

    useEffect(() => {
        const handleResize = () => {
            const newAvailableHeight = window.innerHeight - headerHeight - toolbarHeight - volumeChartHeight - timeframeSelectorHeight;
            setMainChartHeight(newAvailableHeight);
        };

        window.addEventListener('resize', handleResize);
        
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleSearch = (query: string) => {
        console.log('Searching:', query);
    };

    const handleAddIndicator = (indicator: Indicator) => {
        if (!activeIndicators.some(i => i.id === indicator.id)) {
          setActiveIndicators([...activeIndicators, indicator]);
        } else {
          alert('Indicator Already added!')
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
        console.log('Selcted symbol: ', symbol.symbol)
    }

    return (
        <div className="app">
            <Header 
                symbol={selectedSymbol}
                onSymbolSearch={handleSearch}
                isConnected={true}
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
                {/* Chart area placeholder */}
                <div className="chart-area">
                    <CandlestickChart
                        data={chartData}
                        width={chartWidth} 
                        height={mainChartHeight}
                        showGrid={showGrid}
                        chartStyle={chartStyle}
                    />
                    <VolumeChart
                        data={chartData}
                        width={chartWidth}
                        height={volumeChartHeight}
                    />
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