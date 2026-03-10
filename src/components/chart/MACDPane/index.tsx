import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import type { MACDPaneProps } from '../../../types/props';
import './macd-pane.scss';

export const MACDPane: React.FC<MACDPaneProps> = ({
    data,
    macd,
    width,
    height,
    lineColor = '#26A69A',
    signalColor = '#FDD835',
    histogramPositiveColor = '#26A69A',
    histogramNegativeColor = '#EF5350',
}) => {
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        if (!svgRef.current || data.length === 0 || width <= 0 || height <= 0) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        // Same margins as other charts for alignment
        const margin = { top: 10, right: 80, bottom: 20, left: 10 };
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;

        const g = svg
            .attr('width', width)
            .attr('height', height)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        // X scale based on time
        const xScale = d3
            .scaleTime()
            .domain(d3.extent(data, d => d.time) as [Date, Date])
            .range([0, innerWidth]);

        // Y scale based on MACD values (min/max across all series)
        const allValues = [
            ...macd.macdLine.filter(v => v !== null) as number[],
            ...macd.signalLine.filter(v => v !== null) as number[],
            ...macd.histogram.filter(v => v !== null) as number[],
        ];
        const yMin = Math.min(...allValues, 0);
        const yMax = Math.max(...allValues);
        const yScale = d3.scaleLinear()
            .domain([yMin, yMax])
            .range([innerHeight, 0]);

        // Line generator for lines
        const line = d3.line<number | null>()
            .x((_, i) => {
                const candle = data[i];
                return candle ? xScale(candle.time) : 0;
            })
            .y(d => d !== null ? yScale(d) : 0)
            .defined(d => d !== null);

        // Draw histogram bars
        macd.histogram.forEach((value, i) => {
            if (value === null) return;
            const candle = data[i];
            if (!candle) return;
            const x = xScale(candle.time) - 2; // center roughly; we can use bandwidth but no band scale
            const barWidth = Math.max(1, (innerWidth / data.length) * 0.6);
            const y0 = yScale(0);
            const y1 = yScale(value);
            const barHeight = Math.abs(y1 - y0);

            g.append('rect')
                .attr('x', x)
                .attr('y', value > 0 ? y1 : y0)
                .attr('width', barWidth)
                .attr('height', barHeight)
                .attr('fill', value > 0 ? histogramPositiveColor : histogramNegativeColor)
                .attr('opacity', 0.7);
        });

        // Draw MACD line
        g.append('path')
            .datum(macd.macdLine)
            .attr('fill', 'none')
            .attr('stroke', lineColor)
            .attr('stroke-width', 1.5)
            .attr('d', line);

        // Draw Signal line
        g.append('path')
            .datum(macd.signalLine)
            .attr('fill', 'none')
            .attr('stroke', signalColor)
            .attr('stroke-width', 1.5)
            .attr('d', line);

        // Zero line
        g.append('line')
            .attr('x1', 0)
            .attr('x2', innerWidth)
            .attr('y1', yScale(0))
            .attr('y2', yScale(0))
            .attr('stroke', '#2A2F38')
            .attr('stroke-width', 1)
            .attr('stroke-dasharray', '2,2');

        // Y axis on the right
        const yAxis = d3.axisRight(yScale)
            .ticks(3)
            .tickSize(0)
            .tickPadding(5)
            .tickFormat(d => (+d).toFixed(2));

        g.append('g')
            .attr('class', 'y-axis')
            .attr('transform', `translate(${innerWidth},0)`)
            .call(yAxis)
            .call(g => g.select('.domain').attr('stroke', '#2A2F38'))
            .call(g => g.selectAll('.tick text').attr('fill', '#9AA5B5').attr('font-size', '10px'));

        // Label
        g.append('text')
            .attr('x', 5)
            .attr('y', 15)
            .attr('fill', lineColor)
            .attr('font-size', '11px')
            .attr('font-family', 'Inter')
            .text('MACD');

    }, [data, macd, width, height, lineColor, signalColor, histogramPositiveColor, histogramNegativeColor]);

    return (
        <div style={{ height: '100%', width: '100%' }}>
            <svg ref={svgRef} className="macd-pane" />
        </div>
    );
};