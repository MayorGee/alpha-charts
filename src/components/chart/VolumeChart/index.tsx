import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import type { VolumeChartProps } from '../../../types/props';
import './volume-chart.scss';

export const VolumeChart: React.FC<VolumeChartProps> = ({ data, width, height }) => {
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        if (!svgRef.current || !data.length) return;

        d3.select(svgRef.current).selectAll('*').remove();

        const margin = { top: 10, right: 30, bottom: 20, left: 60 };
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;

        const svg = d3.select(svgRef.current)
            .attr('width', width)
            .attr('height', height)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        const xScale = d3.scaleBand()
            .domain(data.map(d => d.timestamp.toString()))
            .range([0, innerWidth])
            .padding(0.2);

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.volume)! * 1.1 || 0])
            .range([innerHeight, 0]);

        // Draw volume bars
        svg.selectAll('rect')
            .data(data)
            .enter()
            .append('rect')
            .attr('x', d => xScale(d.timestamp.toString())!)
            .attr('y', d => yScale(d.volume))
            .attr('width', xScale.bandwidth())
            .attr('height', d => innerHeight - yScale(d.volume))
            .attr('fill', d => d.open > d.close ? '#EF5350' : '#26A69A')
            .attr('opacity', 0.7);

        // Optional: add axis
        const xAxis = d3.axisBottom(xScale)
            .tickFormat((d, i) => i % 5 === 0 ? d3.timeFormat('%H:%M')(new Date(+d)) : '');

        svg.append('g')
            .attr('transform', `translate(0, ${innerHeight})`)
            .call(xAxis);

    }, [data, width, height]);

    return <svg ref={svgRef} className="volume-chart" />;
};