import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { VolumeChartProps } from '../../../types/props';
import './volume-chart.scss';

export const VolumeChart: React.FC<VolumeChartProps> = ({ data, width, height }) => {
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        if (!svgRef.current || data.length === 0) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        const margin = { top: 10, right: 80, bottom: 20, left: 10 };
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
            .domain([0, d3.max(data, (d) => d.volume)!])
            .range([chartHeight, 0]);

        // Bar width
        const barWidth = Math.min(chartWidth / data.length - 2, 8);

        // Draw volume bars
        g.selectAll('.volume-bar')
            .data(data)
            .join('rect')
            .attr('class', 'volume-bar')
            .attr('x', (d) => xScale(d.time) - barWidth / 2)
            .attr('y', (d) => yScale(d.volume))
            .attr('width', barWidth)
            .attr('height', (d) => chartHeight - yScale(d.volume))
            .attr('fill', (d) => (d.close >= d.open ? '#26A69A' : '#EF5350'))
            .attr('opacity', 0.6);

        // Volume axis
        const yAxis = d3
            .axisRight(yScale)
            .ticks(3)
            .tickSize(0)
            .tickPadding(8)
            .tickFormat((d) => {
                const val = d.valueOf();
                if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
                if (val >= 1000) return `${(val / 1000).toFixed(0)}K`;
                return val.toString();
            });

        g.append('g')
            .attr('class', 'y-axis')
            .attr('transform', `translate(${chartWidth},0)`)
            .call(yAxis)
            .call((g) => g.select('.domain').attr('stroke', '#2A2F38'))
            .call((g) =>
                g
                    .selectAll('.tick text')
                    .attr('fill', '#9AA5B5')
                    .attr('font-size', '10px')
                    .attr('font-family', 'JetBrains Mono')
            );

        // Volume label
        g.append('text')
            .attr('x', 5)
            .attr('y', 15)
            .attr('fill', '#9AA5B5')
            .attr('font-size', '11px')
            .attr('font-family', 'Inter')
            .text('Volume');
    }, [data, width, height]);

    return <svg 
                ref={svgRef} 
                width={width} 
                height={height} 
                className="volume-chart-svg" 
            />;
};