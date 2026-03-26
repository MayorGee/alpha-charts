import { useState } from 'react';
import type * as d3 from 'd3';
import type { Drawing } from '../types/drawing';
import type { DrawingTool } from '../types';

type AddDrawingInput = Omit<Drawing, 'id' | 'createdAt'>;
type AddDrawingHandler = (drawing: AddDrawingInput) => void;
type DeleteDrawingHandler = (id: string) => void;

export interface DeleteModalState {
    drawingId: string;
    x: number;
    y: number;
}

interface LineBounds {
    firstTime?: number;
    lastTime?: number;
    minPrice?: number;
    maxPrice?: number;
}

interface ScaleArgs {
    xScale: d3.ScaleTime<number, number>;
    yScale: d3.ScaleLinear<number, number>;
}

interface ClickArgs extends ScaleArgs {
    mouseX: number;
    mouseY: number;
    clientX: number;
    clientY: number;
    activeTool?: DrawingTool;
    drawings?: Drawing[];
    onAddDrawing?: AddDrawingHandler;
    bounds: LineBounds;
}

interface HoverArgs extends ScaleArgs {
    mouseX: number;
    mouseY: number;
    activeTool?: DrawingTool;
    drawings?: Drawing[];
}

export function useChartDrawingInteractions() {
    const [drawingStart, setDrawingStart] = useState<{ x: number; y: number } | null>(null);
    const [drawingPreviewEnd, setDrawingPreviewEnd] = useState<{ x: number; y: number } | null>(null);
    const [deleteModal, setDeleteModal] = useState<DeleteModalState | null>(null);

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

    const findDrawingIdAtPosition = (
        mouseX: number,
        mouseY: number,
        drawings: Drawing[] | undefined,
        { xScale, yScale }: ScaleArgs,
    ) => {
        if (!drawings || drawings.length === 0) return null;

        const point = { x: mouseX, y: mouseY };
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
            if (pointToSegmentDistance(point, start, end) <= hitTolerancePx) return drawing.id;
        }

        return null;
    };

    const screenToDomain = (mouseX: number, mouseY: number, { xScale, yScale }: ScaleArgs) => {
        return { x: xScale.invert(mouseX).getTime(), y: yScale.invert(mouseY) };
    };

    const handleOverlayClick = ({
        mouseX,
        mouseY,
        clientX,
        clientY,
        activeTool,
        drawings,
        onAddDrawing,
        xScale,
        yScale,
        bounds,
    }: ClickArgs) => {
        const clickedDrawingId = findDrawingIdAtPosition(mouseX, mouseY, drawings, { xScale, yScale });
        if (clickedDrawingId) {
            setDeleteModal({ drawingId: clickedDrawingId, x: clientX, y: clientY });
            return;
        }

        setDeleteModal(null);
        if (!activeTool || activeTool === 'none' || !onAddDrawing) return;

        const point = screenToDomain(mouseX, mouseY, { xScale, yScale });

        if (activeTool === 'trendline') {
            if (!drawingStart) {
                setDrawingStart(point);
                return;
            }

            onAddDrawing({
                type: 'trendline',
                points: [drawingStart, point],
                color: '#FFFFFF',
            });
            setDrawingStart(null);
            setDrawingPreviewEnd(null);
            return;
        }

        if (activeTool === 'horizontal' && bounds.firstTime !== undefined && bounds.lastTime !== undefined) {
            onAddDrawing({
                type: 'horizontal',
                points: [
                    { x: bounds.firstTime, y: point.y },
                    { x: bounds.lastTime, y: point.y },
                ],
                color: '#FFFFFF',
            });
            return;
        }

        if (activeTool === 'vertical' && bounds.minPrice !== undefined && bounds.maxPrice !== undefined) {
            onAddDrawing({
                type: 'vertical',
                points: [
                    { x: point.x, y: bounds.minPrice },
                    { x: point.x, y: bounds.maxPrice },
                ],
                color: '#FFFFFF',
            });
        }
    };

    const getOverlayCursor = ({ mouseX, mouseY, activeTool, drawings, xScale, yScale }: HoverArgs) => {
        const hoveredDrawingId = findDrawingIdAtPosition(mouseX, mouseY, drawings, { xScale, yScale });
        if (hoveredDrawingId) return 'pointer';
        if (activeTool && activeTool !== 'none') return 'crosshair';
        return 'default';
    };

    const handleDrawingPreviewMove = ({ mouseX, mouseY, activeTool, xScale, yScale }: HoverArgs) => {
        if (activeTool && activeTool !== 'none' && drawingStart) {
            setDrawingPreviewEnd(screenToDomain(mouseX, mouseY, { xScale, yScale }));
        }
    };

    const resetDrawingInteraction = () => {
        setDrawingStart(null);
        setDrawingPreviewEnd(null);
    };

    const closeDeleteModal = () => setDeleteModal(null);

    const confirmDeleteDrawing = (onDeleteDrawing?: DeleteDrawingHandler) => {
        if (!deleteModal || !onDeleteDrawing) return;
        onDeleteDrawing(deleteModal.drawingId);
        setDeleteModal(null);
    };

    return {
        drawingStart,
        drawingPreviewEnd,
        deleteModal,
        closeDeleteModal,
        handleOverlayClick,
        getOverlayCursor,
        handleDrawingPreviewMove,
        resetDrawingInteraction,
        confirmDeleteDrawing,
    };
}
