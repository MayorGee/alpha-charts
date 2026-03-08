import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { CandlestickChartProps } from '../../../types/props';
import type { Candle, TooltipData } from '../../../types'; 
import './candlestick-chart.scss';

export const CandlestickChart: React.FC<CandlestickChartProps> = ({
    data,
    width,
    height,
    showGrid,
    chartStyle,
}) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const [tooltip, setTooltip] = useState<TooltipData | null>(null);
    const [crosshair, setCrosshair] = useState<{ x: number; y: number } | null>(null);

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
            const candleWidth = Math.min(chartWidth / data.length - 2, 8);

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

        // Crosshair overlay
        const overlay = g
            .append('rect')
            .attr('class', 'overlay')
            .attr('width', chartWidth)
            .attr('height', chartHeight)
            .attr('fill', 'none')
            .attr('pointer-events', 'all');

        overlay.on('mousemove', function (event) {
            const [mouseX, mouseY] = d3.pointer(event);
            const x = xScale.invert(mouseX);

            // Find closest candle
            const bisect = d3.bisector<Candle, Date>((d) => d.time).left;
            const index = bisect(data, x);
            const candle = data[Math.min(index, data.length - 1)];

            if (candle) {
                setCrosshair({ x: mouseX, y: mouseY });
                setTooltip({
                    candle,
                    x: mouseX,
                    y: mouseY,
                });
            }
        });

        overlay.on('mouseleave', () => {
            setCrosshair(null);
            setTooltip(null);
        });
    }, [data, width, height, showGrid, chartStyle]);

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
        </div>
    );
};