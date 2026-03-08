export class Environment {
    static get binanceRestBaseUrl(): string {
        return import.meta.env.VITE_BINANCE_REST_URL || '';
    }

    static get binanceWsBaseUrl(): string {
        return import.meta.env.VITE_BINANCE_WS_URL || 'wss://stream.binance.com:9443/ws';
    }
}