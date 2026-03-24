import type { Symbol } from '../types';

/** Watchlist rows; 24h stats are static until wired to an API. */
export const mockWatchlistSymbols: Symbol[] = [
    {
        symbol: 'BTC/USDT',
        price: 67799.74,
        change24h: -0.94,
        high24h: 70213.46,
        low24h: 67441.0,
        volume24h: 679020000,
    },
    {
        symbol: 'ETH/USDT',
        price: 1981.7,
        change24h: -3.07,
        high24h: 2044.89,
        low24h: 1955.95,
        volume24h: 679750000,
    },
    {
        symbol: 'SOL/USDT',
        price: 84.18,
        change24h: -4.09,
        high24h: 90.83,
        low24h: 84.17,
        volume24h: 420880000,
    },
    {
        symbol: 'BNB/USDT',
        price: 398.25,
        change24h: -1.52,
        high24h: 407.8,
        low24h: 392.1,
        volume24h: 520000000,
    },
    {
        symbol: 'XRP/USDT',
        price: 0.586,
        change24h: -2.13,
        high24h: 0.603,
        low24h: 0.574,
        volume24h: 900000000,
    },
];
