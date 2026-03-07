import { Header } from './components/layout/Header';
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
    const handleSearch = (query: string) => {
        console.log('Searching:', query);
    };

    return (
        <div className="app">
            <Header 
                symbol={mockSymbol}
                onSymbolSearch={handleSearch}
                isConnected={true}
            />
        </div>
    );
}

export default App;