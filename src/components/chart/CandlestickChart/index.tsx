import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { CandlestickChartProps } from '../../../types/props';
import type { Candle, TooltipData } from '../../../types';
import type { Point } from '../../../types/drawing';
import './candlestick-chart.scss';

export const CandlestickChart: React.FC<CandlestickChartProps> = ({
    data,
    width,
    height,
    showGrid,
    chartStyle,
    indicators,
    drawings,
    onAddDrawing,
    onDeleteDrawing,
    activeTool
}) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const [tooltip, setTooltip] = useState<TooltipData | null>(null);
    const [crosshair, setCrosshair] = useState<{ x: number; y: number } | null>(null);

    const [drawingStart, setDrawingStart] = useState<Point | null>(null);
    const [drawingPreviewEnd, setDrawingPreviewEnd] = useState<Point | null>(null);
    const [deleteModal, setDeleteModal] = useState<{ drawingId: string; x: number; y: number } | null>(null);
    
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
        const xScale = d3
            .scaleTime()
            .domain(d3.extent(data, (d) => d.time) as [Date, Date])
            .range([0, chartWidth]);

        const yScale = d3
            .scaleLinear()
            .domain([
                d3.min(data, (d) => d.low)! * 0.999,
                d3.max(data, (d) => d.high)! * 1.001,
            ])
            .range([chartHeight, 0]);
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
            const candleWidth = Math.max(1, Math.min(chartWidth / data.length - 2, 8));

            // Draw candlesticks
            const candles = g
                .selectAll('.candle')
                .data(data)
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
                            .attr('stroke-dasharray', 'none')
                            .style('cursor', 'pointer')
                            .on('click', (event: MouseEvent) => {
                                event.stopPropagation();
                                setDeleteModal({
                                    drawingId: drawing.id,
                                    x: event.clientX,
                                    y: event.clientY,
                                });
                            });
                        break;
                    default:
                        break;
                }
            });
        }

        // Draw pending preview
        if (activeTool === 'trendline' && drawingStart && drawingPreviewEnd) {
            const { start, end } = { start: drawingStart, end: drawingPreviewEnd };
            
            g.append('line')
                .attr('x1', xScale(new Date(start.x)))
                .attr('y1', yScale(start.y))
                .attr('x2', xScale(new Date(end.x)))
                .attr('y2', yScale(end.y))
                .attr('stroke', '#9AA5B5')
                .attr('stroke-width', 2)
                .attr('stroke-dasharray', '5,5');
        }

        // Crosshair overlay
        const overlay = g
            .append('rect')
            .attr('class', 'overlay')
            .attr('width', chartWidth)
            .attr('height', chartHeight)
            .attr('fill', 'none')
            .attr('pointer-events', 'all');

        const screenToDomain = (mouseX: number, mouseY: number) => {
            const x = xScale.invert(mouseX);
            const y = yScale.invert(mouseY);
                    
            return { x: x.getTime(), y };
        };

        const pointToSegmentDistance = (
            point: { x: number; y: number },
            segmentStart: { x: number; y: number },
            segmentEnd: { x: number; y: number },
        ) => {
            const dx = segmentEnd.x - segmentStart.x;
            const dy = segmentEnd.y - segmentStart.y;
            if (dx === 0 && dy === 0) {
                return Math.hypot(point.x - segmentStart.x, point.y - segmentStart.y);
            }

            const t = Math.max(
                0,
                Math.min(
                    1,
                    ((point.x - segmentStart.x) * dx + (point.y - segmentStart.y) * dy) /
                        (dx * dx + dy * dy),
                ),
            );

            const projX = segmentStart.x + t * dx;
            const projY = segmentStart.y + t * dy;
            return Math.hypot(point.x - projX, point.y - projY);
        };

        const findClickedDrawingId = (mouseX: number, mouseY: number) => {
            if (!drawings || drawings.length === 0) return null;

            const clickPoint = { x: mouseX, y: mouseY };
            const hitTolerancePx = 6;

            for (let i = drawings.length - 1; i >= 0; i -= 1) {
                const drawing = drawings[i];
                if (drawing.points.length !== 2) continue;
                if (
                    drawing.type !== 'trendline' &&
                    drawing.type !== 'horizontal' &&
                    drawing.type !== 'vertical'
                ) {
                    continue;
                }

                const [p1, p2] = drawing.points;
                const start = { x: xScale(new Date(p1.x)), y: yScale(p1.y) };
                const end = { x: xScale(new Date(p2.x)), y: yScale(p2.y) };
                const distance = pointToSegmentDistance(clickPoint, start, end);
                if (distance <= hitTolerancePx) return drawing.id;
            }

            return null;
        };

        overlay
            .on('click', function(event) {
                const [mouseX, mouseY] = d3.pointer(event);
                const clickedDrawingId = findClickedDrawingId(mouseX, mouseY);
                if (clickedDrawingId) {
                    setDeleteModal({
                        drawingId: clickedDrawingId,
                        x: event.clientX,
                        y: event.clientY,
                    });
                    return;
                }

                setDeleteModal(null);
                if (!activeTool || activeTool === 'none' || !onAddDrawing) return;

                const point = screenToDomain(mouseX, mouseY);

                if (activeTool === 'trendline') {
                    if (!drawingStart) {
                        setDrawingStart(point);
                    } else {
                        onAddDrawing({
                            type: 'trendline',
                            points: [drawingStart, point],
                            color: '#FFFFFF',
                        });

                        setDrawingStart(null);
                        setDrawingPreviewEnd(null);
                    }
                } else if (activeTool === 'horizontal' && firstTime !== undefined && lastTime !== undefined) {
                    onAddDrawing({
                        type: 'horizontal',
                        points: [
                            { x: firstTime, y: point.y },
                            { x: lastTime, y: point.y },
                        ],
                        color: '#FFFFFF',
                    });
                } else if (activeTool === 'vertical' && minPrice !== undefined && maxPrice !== undefined) {
                    onAddDrawing({
                        type: 'vertical',
                        points: [
                            { x: point.x, y: minPrice },
                            { x: point.x, y: maxPrice },
                        ],
                        color: '#FFFFFF',
                    });
                }
            })
            .on('mousemove', function (event) {
                const [mouseX, mouseY] = d3.pointer(event);
                const hoveredDrawingId = findClickedDrawingId(mouseX, mouseY);
                d3.select(this).style(
                    'cursor',
                    hoveredDrawingId
                        ? 'pointer'
                        : activeTool && activeTool !== 'none'
                            ? 'crosshair'
                            : 'default',
                );

                if (activeTool && activeTool !== 'none') {
                    if (drawingStart) {
                        const point = screenToDomain(mouseX, mouseY);
                        setDrawingPreviewEnd(point);
                    }
                } else {
                    // crosshair logic
                    const x = xScale.invert(mouseX);
                    const bisect = d3.bisector<Candle, Date>((d) => d.time).left;
                    const index = bisect(data, x);
                    const candle = data[Math.min(index, data.length - 1)];
                    if (candle) {
                        setCrosshair({ x: mouseX, y: mouseY });
                        setTooltip({ candle, x: mouseX, y: mouseY });
                    }
                }
            })
            .on('mouseleave', () => {
                overlay.style('cursor', 'default');
                setCrosshair(null);
                setTooltip(null);
                setDrawingStart(null);
                setDrawingPreviewEnd(null);
            });
    }, [data, width, height, showGrid, chartStyle, indicators, activeTool, drawings, onAddDrawing, drawingStart, drawingPreviewEnd]);

    const handleDeleteDrawing = () => {
        if (!deleteModal || !onDeleteDrawing) return;
        onDeleteDrawing(deleteModal.drawingId);
        setDeleteModal(null);
    };

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
                <div className="drawing-delete-modal__backdrop" onClick={() => setDeleteModal(null)}>
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
                                onClick={handleDeleteDrawing}
                            >
                                Delete
                            </button>
                            <button
                                type="button"
                                className="drawing-delete-modal__button drawing-delete-modal__button--cancel"
                                onClick={() => setDeleteModal(null)}
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