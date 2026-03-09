import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { type Candle } from '../../../types';
import './indicator-pane.scss';

interface IndicatorPaneProps {
    data: Candle[];
    indicatorData: (number | null)[];
    color: string;
    label: string;
    width: number;
    height: number;
}

export const IndicatorPane: React.FC<IndicatorPaneProps> = ({
    data,
    indicatorData,
    color,
    label,
    width,
    height,
}) => {
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        if (!svgRef.current || data.length === 0 || indicatorData.length === 0 || width <= 0 || height <= 0) return;
        
        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        const margin = { top: 10, right: 80, bottom: 20, left: 10 };
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;

        const g = svg
            .attr('width', width)
            .attr('height', height)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        // Scales
        const xScale = d3
            .scaleTime()
            .domain(d3.extent(data, d => d.time) as [Date, Date])
            .range([0, innerWidth]);

        const yScale = d3
            .scaleLinear()
            .domain([0, 100]) // RSI is always 0-100
            .range([innerHeight, 0]);

        // Line generator
        const line = d3.line<number | null>()
            .x((_, i) => {
                const candle = data[i];
                return candle ? xScale(candle.time) : 0;
            })
            .y(d => d !== null ? yScale(d) : 0)
            .defined(d => d !== null);

        // Draw line
        g.append('path')
            .datum(indicatorData)
            .attr('fill', 'none')
            .attr('stroke', color)
            .attr('stroke-width', 1.5)
            .attr('d', line);

        // Add horizontal lines at 25, 50, 75
        [25, 50, 75].forEach(level => {
            g.append('line')
                .attr('x1', 0)
                .attr('x2', innerWidth)
                .attr('y1', yScale(level))
                .attr('y2', yScale(level))
                .attr('stroke', '#2A2F38')
                .attr('stroke-dasharray', '2,2')
                .attr('stroke-width', 1);
        });

        // Y axis
        const yAxis = d3.axisRight(yScale)
            .ticks(3)
            .tickSize(0)
            .tickPadding(5)
            .tickFormat(d => `${d}`);

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
            .attr('fill', color)
            .attr('font-size', '11px')
            .attr('font-family', 'Inter')
            .text(label);

    }, [data, indicatorData, color, label, width, height]);

    return (
        <div style={{ height: '100%', width: '100%' }}>
            <svg ref={svgRef} className="indicator-pane" />
        </div>
    );
};