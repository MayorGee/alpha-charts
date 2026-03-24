import { useState, useEffect } from 'react';
import {
    HEADER_HEIGHT,
    TOOLBAR_HEIGHT,
    VOLUME_CHART_HEIGHT,
    TIMEFRAME_SELECTOR_HEIGHT,
    INDICATOR_PANE_HEIGHT,
    MAIN_CHART_MIN_HEIGHT,
    WATCHLIST_WIDTH_COLLAPSED,
    WATCHLIST_WIDTH_EXPANDED,
    ORDER_PANEL_WIDTH_COLLAPSED,
    ORDER_PANEL_WIDTH_EXPANDED,
} from '../constants/chartLayout';

export interface ChartAreaDimensions {
    chartWidth: number;
    mainChartHeight: number;
}

export function useChartAreaDimensions(options: {
    watchlistCollapsed: boolean;
    orderPanelCollapsed: boolean;
    separatePaneCount: number;
}): ChartAreaDimensions {
    const { watchlistCollapsed, orderPanelCollapsed, separatePaneCount } = options;
    const [dimensions, setDimensions] = useState<ChartAreaDimensions>({
        chartWidth: 0,
        mainChartHeight: 0,
    });

    useEffect(() => {
        const updateDimensions = () => {
            const watchlistWidth = watchlistCollapsed
                ? WATCHLIST_WIDTH_COLLAPSED
                : WATCHLIST_WIDTH_EXPANDED;
            const orderPanelWidth = orderPanelCollapsed
                ? ORDER_PANEL_WIDTH_COLLAPSED
                : ORDER_PANEL_WIDTH_EXPANDED;

            const chartWidth = Math.max(0, window.innerWidth - watchlistWidth - orderPanelWidth);
            const totalIndicatorHeight = separatePaneCount * INDICATOR_PANE_HEIGHT;
            const mainChartHeight = Math.max(
                MAIN_CHART_MIN_HEIGHT,
                window.innerHeight -
                    HEADER_HEIGHT -
                    TOOLBAR_HEIGHT -
                    VOLUME_CHART_HEIGHT -
                    TIMEFRAME_SELECTOR_HEIGHT -
                    totalIndicatorHeight,
            );

            setDimensions({ chartWidth, mainChartHeight });
        };

        updateDimensions();
        window.addEventListener('resize', updateDimensions);
        
        return () => window.removeEventListener('resize', updateDimensions);
    }, [watchlistCollapsed, orderPanelCollapsed, separatePaneCount]);

    return dimensions;
}
