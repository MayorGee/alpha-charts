export class Environment {
    static get binanceRestBaseUrl(): string {
        return import.meta.env.VITE_BINANCE_REST_URL || 'https://api.binance.com/api/v3';
    }

    static get binanceWsBaseUrl(): string {
        return import.meta.env.VITE_BINANCE_WS_URL || 'wss://stream.binance.com:9443/ws';
    }
}