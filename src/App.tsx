import { useState } from 'react';
import { Header } from './components/layout/Header';
import { Toolbar, type ChartStyle, type DrawingTool } from './components/layout/Toolbar';
import type { Symbol } from './types';

const mockSymbol: Symbol = {
    symbol: 'BTC/USDT',
    price: 43250.75,
    change24h: 2.34,
    high24h: 43800.00,
    low24h: 42500.50,
    volume24h: 1250000000 // 1.25B
};

function App() {
    const [activeTool, setActiveTool] = useState<DrawingTool>('none');
    const [chartStyle, setChartStyle] = useState<ChartStyle>('candlestick');
    const [showGrid, setShowGrid] = useState(true);

    const handleSearch = (query: string) => {
        console.log('Searching:', query);
    };

    const handleAddIndicator = () => {
      console.log('Indicator added');
    };

    const handleClearDrawings = () => {
      console.log('Clear drawings');
    };

    return (
        <div className="app">
            <Header 
                symbol={mockSymbol}
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
                onAddIndicator={handleAddIndicator}
                onClearDrawings={handleClearDrawings}
            />
        </div>
    );
}

export default App;