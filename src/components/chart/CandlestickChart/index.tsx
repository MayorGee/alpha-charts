import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import type { CandlestickChartProps } from '../../../types/props';
import './candlestick-chart.scss';

export const CandlestickChart: React.FC<CandlestickChartProps> = ({
    data,
    width,
    height,
    showGrid = true,
    chartStyle = 'candlestick',
}) => {
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        if (!svgRef.current || !data.length) return;

        // Clear previous content
        d3.select(svgRef.current).selectAll('*').remove();

        // Set up dimensions
        const margin = { top: 20, right: 30, bottom: 30, left: 60 };
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;

        // Create SVG
        const svg = d3.select(svgRef.current)
            .attr('width', width)
            .attr('height', height)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        // Scales
        const xScale = d3.scaleBand()
            .domain(data.map(d => d.timestamp.toString()))
            .range([0, innerWidth])
            .padding(0.2);

        const yScale = d3.scaleLinear()
            .domain([
                d3.min(data, d => d.low)! * 0.99, // add some padding
                d3.max(data, d => d.high)! * 1.01
            ])
            .range([innerHeight, 0]);

        // Axes
        const xAxis = d3.axisBottom(xScale)
            .tickFormat((d, i) => {
                // Show every nth tick to avoid overlap
                const index = data.findIndex(c => c.timestamp.toString() === d);
                return index % 5 === 0 ? d3.timeFormat('%H:%M')(new Date(+d)) : '';
            });

        const yAxis = d3.axisLeft(yScale)
            .ticks(5)
            .tickFormat(d => `$${d}`);

        // Draw axes
        svg.append('g')
            .attr('class', 'x-axis')
            .attr('transform', `translate(0, ${innerHeight})`)
            .call(xAxis);

        svg.append('g')
            .attr('class', 'y-axis')
            .call(yAxis);

        // Draw candlesticks
        svg.selectAll('rect')
            .data(data)
            .enter()
            .append('rect')
            .attr('x', d => xScale(d.timestamp.toString())!)
            .attr('y', d => yScale(Math.max(d.open, d.close)))
            .attr('width', xScale.bandwidth())
            .attr('height', d => Math.abs(yScale(d.open) - yScale(d.close)) || 1)
            .attr('fill', d => d.open > d.close ? '#EF5350' : '#26A69A');

        // Draw wicks (high-low lines)
        svg.selectAll('line')
            .data(data)
            .enter()
            .append('line')
            .attr('x1', d => xScale(d.timestamp.toString())! + xScale.bandwidth() / 2)
            .attr('x2', d => xScale(d.timestamp.toString())! + xScale.bandwidth() / 2)
            .attr('y1', d => yScale(d.high))
            .attr('y2', d => yScale(d.low))
            .attr('stroke', d => d.open > d.close ? '#EF5350' : '#26A69A')
            .attr('stroke-width', 1);

    }, [data, width, height, showGrid, chartStyle]);

    return <svg ref={svgRef} className="candlestick-chart" />;
};