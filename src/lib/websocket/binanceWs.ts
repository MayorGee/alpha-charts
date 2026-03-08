import { Environment } from '../Environment';
import type { Candle, MessageHandler } from '../../types';

class BinanceWebSocketManager {
    private ws: WebSocket | null = null;
    private subscribers: Set<MessageHandler> = new Set();
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private reconnectDelay = 1000;
    private currentSymbol = '';
    private currentInterval = '';

    connect(symbol: string, interval: string) {
        if (this.currentSymbol === symbol && this.currentInterval === interval && this.ws?.readyState === WebSocket.OPEN) {
            return;
        }
        
        this.currentSymbol = symbol;
        this.currentInterval = interval;

        if (this.ws) {
            this.ws.close();
        }

        const binanceSymbol = symbol.replace('/', '').toLowerCase();
        const streamName = `${binanceSymbol}@kline_${interval}`;
        const url = `${Environment.binanceWsBaseUrl}/${streamName}`;

        this.ws = new WebSocket(url);
        this.ws.onopen = this.handleOpen;
        this.ws.onmessage = this.handleMessage;
        this.ws.onclose = this.handleClose;
        this.ws.onerror = this.handleError;
    }

    subscribe(handler: MessageHandler) {
        this.subscribers.add(handler);
    }

    unsubscribe(handler: MessageHandler) {
        this.subscribers.delete(handler);
    }

    disconnect() {
        this.currentSymbol = '';
        this.currentInterval = '';

        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }

        this.subscribers.clear();
    }

    private handleOpen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
    };

    private handleMessage = (event: MessageEvent) => {
        try {
            const data = JSON.parse(event.data);
            const kline = data.k;

            const candle: Candle = {
                time: new Date(kline.t),
                open: parseFloat(kline.o),
                high: parseFloat(kline.h),
                low: parseFloat(kline.l),
                close: parseFloat(kline.c),
                volume: parseFloat(kline.v),
            };

            this.subscribers.forEach((handler) => handler(candle));
        } catch (err) {
            console.error('Error parsing WebSocket message', err);
        }
    };

    private handleClose = () => {
        console.log('WebSocket closed');
        this.ws = null;

        if (this.currentSymbol && this.currentInterval) {
            this.reconnect();
        }
    };

    private handleError = (error: Event) => {
        console.error('WebSocket error', error);
    };

    private reconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.error('Max reconnect attempts reached');
            return;
        }
        
        setTimeout(() => {
            this.reconnectAttempts++;
            this.connect(this.currentSymbol, this.currentInterval);
        }, this.reconnectDelay * Math.pow(2, this.reconnectAttempts));
    }
}

export const binanceWs = new BinanceWebSocketManager();