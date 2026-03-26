import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { CandlestickChartProps } from '../../../types/props';
import type { Candle, TooltipData } from '../../../types';
import { useChartDrawingInteractions } from '../../../hooks/useChartDrawingInteractions';
import './candlestick-chart.scss';

export const CandlestickChart: React.FC<CandlestickChartProps> = ({
    data,
    width,
    height,
    showGrid,
    showTooltip,
    chartStyle,
    indicators,
    drawings,
    onAddDrawing,
    onUpdateDrawing,
    onDeleteDrawing,
    activeTool
}) => {
    const fibLevelConfigs = [
        { value: 0, color: '#ef5350' },
        { value: 0.236, color: '#ff7043' },
        { value: 0.382, color: '#ffa726' },
        { value: 0.5, color: '#fdd835' },
        { value: 0.618, color: '#66bb6a' },
        { value: 0.786, color: '#42a5f5' },
        { value: 1, color: '#ab47bc' },
    ] as const;
    const svgRef = useRef<SVGSVGElement>(null);
    const [tooltip, setTooltip] = useState<TooltipData | null>(null);
    const [crosshair, setCrosshair] = useState<{ x: number; y: number } | null>(null);
    const [zoomTransform, setZoomTransform] = useState(d3.zoomIdentity);
    const {
        drawingStart,
        drawingPreviewEnd,
        isDragging,
        deleteModal,
        closeDeleteModal,
        handleOverlayClick,
        handleOverlayMouseDown,
        handleOverlayMouseUp,
        getOverlayCursor,
        handleDrawingPreviewMove,
        resetDrawingInteraction,
        confirmDeleteDrawing,
    } = useChartDrawingInteractions();

    useEffect(() => {
        if (!showTooltip) {
            setCrosshair(null);
            setTooltip(null);
        }
    }, [showTooltip]);
    
    useEffect(() => {
         if (!svgRef.current || data.length === 0 || width <= 0 || height <= 0 || isNaN(width) || isNaN(height)) {
            return;
        }

        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        const margin = { top: 20, right: 80, bottom: 20, left: 10 };
        const chartWidth = width - margin.left - margin.right;
        const chartHeight = height - margin.top - margin.bottom;

        const g = svg
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        // Scales
        const baseXScale = d3
            .scaleTime()
            .domain(d3.extent(data, (d) => d.time) as [Date, Date])
            .range([0, chartWidth]);

        const baseYScale = d3
            .scaleLinear()
            .domain([
                d3.min(data, (d) => d.low)! * 0.999,
                d3.max(data, (d) => d.high)! * 1.001,
            ])
            .range([chartHeight, 0]);
        const xScale = zoomTransform.rescaleX(baseXScale);
        const yScale = zoomTransform.rescaleY(baseYScale);
        const [xMin, xMax] = xScale.domain();
        const visibleCandles = data.filter((d) => d.time >= xMin && d.time <= xMax);
        const firstTime = data[0]?.time.getTime();
        const lastTime = data[data.length - 1]?.time.getTime();
        const minPrice = d3.min(data, (d) => d.low);
        const maxPrice = d3.max(data, (d) => d.high);

        // Grid
        if (showGrid) {
            // Vertical grid lines
            g.append('g')
                .attr('class', 'grid')
                .selectAll('line')
                .data(xScale.ticks(10))
                .join('line')
                .attr('x1', (d) => xScale(d))
                .attr('x2', (d) => xScale(d))
                .attr('y1', 0)
                .attr('y2', chartHeight)
                .attr('stroke', '#2F3A48')
                .attr('stroke-width', 1);

            // Horizontal grid lines
            g.append('g')
                .attr('class', 'grid')
                .selectAll('line')
                .data(yScale.ticks(8))
                .join('line')
                .attr('x1', 0)
                .attr('x2', chartWidth)
                .attr('y1', (d) => yScale(d))
                .attr('y2', (d) => yScale(d))
                .attr('stroke', '#2F3A48')
                .attr('stroke-width', 1);
        }

        if (chartStyle === 'candlestick') {
            // Candlestick width
            const visibleCount = Math.max(1, visibleCandles.length);
            const candleWidth = Math.max(1, Math.min(chartWidth / visibleCount - 2, 20));

            // Draw candlesticks
            const candles = g
                .selectAll('.candle')
                .data(visibleCandles)
                .join('g')
                .attr('class', 'candle')
                .attr('transform', (d) => `translate(${xScale(d.time)},0)`);

            // Wicks (high-low lines)
            candles
                .append('line')
                .attr('x1', 0)
                .attr('x2', 0)
                .attr('y1', (d) => yScale(d.high))
                .attr('y2', (d) => yScale(d.low))
                .attr('stroke', (d) => (d.close >= d.open ? '#26A69A' : '#EF5350'))
                .attr('stroke-width', 1);

            // Bodies
            candles
                .append('rect')
                .attr('x', -candleWidth / 2)
                .attr('y', (d) => yScale(Math.max(d.open, d.close)))
                .attr('width', candleWidth)
                .attr('height', (d) => {
                    const h = Math.abs(yScale(d.open) - yScale(d.close));
                    return h === 0 ? 1 : h;
                })
                .attr('fill', (d) => (d.close >= d.open ? '#26A69A' : '#EF5350'));
        } else {
            // Line chart
            const line = d3
                .line<Candle>()
                .x((d) => xScale(d.time))
                .y((d) => yScale(d.close))
                .curve(d3.curveMonotoneX);

            g.append('path')
                .datum(data)
                .attr('fill', 'none')
                .attr('stroke', '#42A5F5')
                .attr('stroke-width', 2)
                .attr('d', line);

            // Add area under line
            const area = d3
                .area<Candle>()
                .x((d) => xScale(d.time))
                .y0(chartHeight)
                .y1((d) => yScale(d.close))
                .curve(d3.curveMonotoneX);

            g.append('path')
                .datum(data)
                .attr('fill', '#42A5F5')
                .attr('fill-opacity', 0.1)
                .attr('d', area);
        }

        // Draw indicator overlays (main pane only — props are MainChartIndicator[])
        if (indicators && indicators.length > 0) {
            const line = d3
                .line<number | null>()
                .x((_, i) => {
                    const candle = data[i];
                    return candle ? xScale(candle.time) : 0;
                })
                .y((d) => (d !== null ? yScale(d) : 0))
                .defined((d) => d !== null);

            for (const ind of indicators) {
                switch (ind.id) {
                    case 'bollinger': {
                        const bands = ind.data;
                        g.append('path')
                            .datum(bands.upper)
                            .attr('fill', 'none')
                            .attr('stroke', ind.color)
                            .attr('stroke-width', 1.5)
                            .attr('opacity', 0.7)
                            .attr('d', line);
                        g.append('path')
                            .datum(bands.middle)
                            .attr('fill', 'none')
                            .attr('stroke', ind.color)
                            .attr('stroke-width', 2)
                            .attr('d', line);
                        g.append('path')
                            .datum(bands.lower)
                            .attr('fill', 'none')
                            .attr('stroke', ind.color)
                            .attr('stroke-width', 1.5)
                            .attr('opacity', 0.7)
                            .attr('d', line);
                        break;
                    }
                    case 'sma':
                    case 'ema':
                        g.append('path')
                            .datum(ind.data)
                            .attr('fill', 'none')
                            .attr('stroke', ind.color)
                            .attr('stroke-width', 2)
                            .attr('d', line);
                        break;
                }
            }
        }

        // Time axis
        const xAxis = d3.axisBottom(xScale).ticks(8).tickSize(0).tickPadding(8);

        g.append('g')
            .attr('class', 'x-axis')
            .attr('transform', `translate(0,${chartHeight})`)
            .call(xAxis)
            .call((g) => g.select('.domain').attr('stroke', '#2A2F38'))
            .call((g) =>
                g.selectAll('.tick text').attr('fill', '#9AA5B5').attr('font-size', '11px')
            );

        // Price axis
        const yAxis = d3
            .axisRight(yScale)
            .ticks(8)
            .tickSize(0)
            .tickPadding(8)
            .tickFormat((d) => `$${d.valueOf().toLocaleString()}`);

        g.append('g')
            .attr('class', 'y-axis')
            .attr('transform', `translate(${chartWidth},0)`)
            .call(yAxis)
            .call((g) => g.select('.domain').attr('stroke', '#2A2F38'))
            .call((g) =>
                g
                    .selectAll('.tick text')
                    .attr('fill', '#9AA5B5')
                    .attr('font-size', '11px')
                    .attr('font-family', 'JetBrains Mono')
            );

        // After drawing candles and indicators, draw existing drawings
        if (drawings && drawings.length > 0) {
            drawings.forEach((drawing) => {
                if (drawing.points.length !== 2) return;

                const [p1, p2] = drawing.points;
                switch (drawing.type) {
                    case 'trendline':
                    case 'horizontal':
                    case 'vertical':
                        g.append('line')
                            .attr('x1', xScale(new Date(p1.x)))
                            .attr('y1', yScale(p1.y))
                            .attr('x2', xScale(new Date(p2.x)))
                            .attr('y2', yScale(p2.y))
                            .attr('stroke', drawing.color || '#FDD835')
                            .attr('stroke-width', 2)
                            .attr('stroke-dasharray', 'none');
                        break;
                    case 'fibonacci': {
                        const x1 = xScale(new Date(p1.x));
                        const x2 = xScale(new Date(p2.x));
                        const low = Math.min(p1.y, p2.y);
                        const high = Math.max(p1.y, p2.y);
                        const span = high - low;

                        fibLevelConfigs.forEach(({ value, color }) => {
                            const y = yScale(low + span * value);
                            g.append('line')
                                .attr('x1', x1)
                                .attr('y1', y)
                                .attr('x2', x2)
                                .attr('y2', y)
                                .attr('stroke', color)
                                .attr('stroke-width', value === 0.5 ? 1.8 : 1.2)
                                .attr('opacity', 0.9);

                            g.append('text')
                                .attr('x', Math.max(x1, x2) + 6)
                                .attr('y', y + 3)
                                .attr('fill', color)
                                .attr('font-size', 10)
                                .attr('font-family', 'JetBrains Mono')
                                .text(value.toFixed(3));
                        });

                        g.append('circle')
                            .attr('cx', x1)
                            .attr('cy', yScale(p1.y))
                            .attr('r', 4)
                            .attr('fill', '#FFFFFF')
                            .attr('stroke', '#2A2F38')
                            .attr('stroke-width', 1.2);
                        g.append('circle')
                            .attr('cx', x2)
                            .attr('cy', yScale(p2.y))
                            .attr('r', 4)
                            .attr('fill', '#FFFFFF')
                            .attr('stroke', '#2A2F38')
                            .attr('stroke-width', 1.2);
                        break;
                    }
                    default:
                        break;
                }
            });
        }

        // Draw pending preview
        if ((activeTool === 'trendline' || activeTool === 'fibonacci') && drawingStart && drawingPreviewEnd) {
            const { start, end } = { start: drawingStart, end: drawingPreviewEnd };

            if (activeTool === 'trendline') {
                g.append('line')
                    .attr('x1', xScale(new Date(start.x)))
                    .attr('y1', yScale(start.y))
                    .attr('x2', xScale(new Date(end.x)))
                    .attr('y2', yScale(end.y))
                    .attr('stroke', '#9AA5B5')
                    .attr('stroke-width', 2)
                    .attr('stroke-dasharray', '5,5');
            } else {
                const x1 = xScale(new Date(start.x));
                const x2 = xScale(new Date(end.x));
                const low = Math.min(start.y, end.y);
                const high = Math.max(start.y, end.y);
                const span = high - low;

                fibLevelConfigs.forEach(({ value, color }) => {
                    const y = yScale(low + span * value);
                    g.append('line')
                        .attr('x1', x1)
                        .attr('y1', y)
                        .attr('x2', x2)
                        .attr('y2', y)
                        .attr('stroke', color)
                        .attr('stroke-width', 1.2)
                        .attr('stroke-dasharray', '5,5')
                        .attr('opacity', 0.8);
                });
            }
        }

        // Crosshair overlay
        const overlay = g
            .append('rect')
            .attr('class', 'overlay')
            .attr('width', chartWidth)
            .attr('height', chartHeight)
            .attr('fill', 'none')
            .attr('pointer-events', 'all');

        overlay
            .on('mousedown', function (event) {
                const [mouseX, mouseY] = d3.pointer(event);
                handleOverlayMouseDown({ mouseX, mouseY, activeTool, drawings, xScale, yScale });
            })
            .on('click', function(event) {
                const [mouseX, mouseY] = d3.pointer(event);
                handleOverlayClick({
                    mouseX,
                    mouseY,
                    clientX: event.clientX,
                    clientY: event.clientY,
                    activeTool,
                    drawings,
                    onAddDrawing,
                    xScale,
                    yScale,
                    bounds: { firstTime, lastTime, minPrice, maxPrice },
                });
            })
            .on('mousemove', function (event) {
                const [mouseX, mouseY] = d3.pointer(event);
                if (deleteModal) {
                    d3.select(this).style('cursor', 'default');
                    return;
                }
                d3.select(this).style(
                    'cursor',
                    getOverlayCursor({ mouseX, mouseY, activeTool, drawings, xScale, yScale }),
                );

                handleDrawingPreviewMove({
                    mouseX,
                    mouseY,
                    activeTool,
                    drawings,
                    xScale,
                    yScale,
                    onUpdateDrawing,
                });

                const allowHoverTooltip =
                    showTooltip &&
                    (!activeTool || activeTool === 'none') &&
                    !deleteModal &&
                    !isDragging;
                if (allowHoverTooltip) {
                    // crosshair logic
                    const x = xScale.invert(mouseX);
                    const bisect = d3.bisector<Candle, Date>((d) => d.time).left;
                    const index = bisect(data, x);
                    const candle = data[Math.min(index, data.length - 1)];
                    if (candle) {
                        setCrosshair({ x: mouseX, y: mouseY });
                        setTooltip({ candle, x: mouseX, y: mouseY });
                    }
                } else {
                    setCrosshair(null);
                    setTooltip(null);
                }
            })
            .on('mouseup', function () {
                handleOverlayMouseUp({ onUpdateDrawing });
            })
            .on('mouseleave', () => {
                overlay.style('cursor', 'default');
                setCrosshair(null);
                setTooltip(null);
                resetDrawingInteraction();
            });

        const handleWindowMouseUp = () => {
            handleOverlayMouseUp({ onUpdateDrawing });
        };
        window.addEventListener('mouseup', handleWindowMouseUp);

        return () => {
            window.removeEventListener('mouseup', handleWindowMouseUp);
        };
    }, [
        data,
        width,
        height,
        showGrid,
        chartStyle,
        showTooltip,
        indicators,
        activeTool,
        drawings,
        onAddDrawing,
        onUpdateDrawing,
        drawingStart,
        drawingPreviewEnd,
        isDragging,
        zoomTransform,
        handleOverlayClick,
        handleOverlayMouseDown,
        handleOverlayMouseUp,
        getOverlayCursor,
        handleDrawingPreviewMove,
        resetDrawingInteraction,
        deleteModal,
    ]);

    useEffect(() => {
        if (!svgRef.current || width <= 0 || height <= 0) return;

        const svg = d3.select(svgRef.current);
        const zoomBehavior = d3
            .zoom<SVGSVGElement, unknown>()
            .scaleExtent([1, 24])
            .translateExtent([
                [-width * 2, -height * 2],
                [width * 3, height * 3],
            ])
            .extent([
                [0, 0],
                [width, height],
            ])
            .filter((event) => {
                if (activeTool && activeTool !== 'none') return false;
                if (deleteModal) return false;
                return event.type === 'wheel' || event.type === 'mousedown' || event.type === 'dblclick';
            })
            .on('zoom', (event) => {
                const t = event.transform;
                setZoomTransform((prev) =>
                    prev.k === t.k && prev.x === t.x && prev.y === t.y ? prev : t,
                );
            });

        svg.call(zoomBehavior);
        svg.call(zoomBehavior.transform, zoomTransform);

        return () => {
            svg.on('.zoom', null);
        };
    }, [activeTool, deleteModal, width, height, zoomTransform]);

    return (
        <div className="candlestick-chart-container">
            <svg ref={svgRef} width={width} height={height} className="candlestick-chart-svg" />

            {/* Crosshair */}
            {crosshair && (
                <>
                    <div
                        className="crosshair crosshair--vertical"
                        style={{ left: crosshair.x + 10 }}
                    />
                    <div
                        className="crosshair crosshair--horizontal"
                        style={{ top: crosshair.y + 20 }}
                    />
                </>
            )}

            {/* Tooltip */}
            {tooltip && (
                <div
                    className="chart-tooltip"
                    style={{
                        left: Math.min(tooltip.x + 20, width - 200),
                        top: Math.min(tooltip.y + 30, height - 150),
                    }}
                >
                    <div className="chart-tooltip__header">
                        {tooltip.candle.time.toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                    </div>
                    <div className="chart-tooltip__row">
                        <span>Open:</span>
                        <span>${tooltip.candle.open.toFixed(2)}</span>
                    </div>
                    <div className="chart-tooltip__row">
                        <span>High:</span>
                        <span className="positive">${tooltip.candle.high.toFixed(2)}</span>
                    </div>
                    <div className="chart-tooltip__row">
                        <span>Low:</span>
                        <span className="negative">${tooltip.candle.low.toFixed(2)}</span>
                    </div>
                    <div className="chart-tooltip__row">
                        <span>Close:</span>
                        <span>${tooltip.candle.close.toFixed(2)}</span>
                    </div>
                    <div className="chart-tooltip__row chart-tooltip__volume">
                        <span>Volume:</span>
                        <span>{(tooltip.candle.volume / 1000000).toFixed(2)}M</span>
                    </div>
                </div>
            )}

            {deleteModal && (
                <div className="drawing-delete-modal__backdrop" onClick={closeDeleteModal}>
                    <div
                        className="drawing-delete-modal"
                        style={{ left: deleteModal.x, top: deleteModal.y }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <p className="drawing-delete-modal__title">Delete drawing?</p>
                        <div className="drawing-delete-modal__actions">
                            <button
                                type="button"
                                className="drawing-delete-modal__button drawing-delete-modal__button--delete"
                                onClick={() => confirmDeleteDrawing(onDeleteDrawing)}
                            >
                                Delete
                            </button>
                            <button
                                type="button"
                                className="drawing-delete-modal__button drawing-delete-modal__button--cancel"
                                onClick={closeDeleteModal}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};