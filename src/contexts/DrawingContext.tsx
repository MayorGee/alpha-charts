import React, { createContext, useContext, useState, type ReactNode } from 'react';
import { type Drawing } from '../types/drawing';
import type { DrawingTool } from '../types';

const DRAWINGS_STORAGE_KEY = 'alpha-charts-drawings';

interface DrawingContextType {
    drawings: Drawing[];
    addDrawing: (drawing: Omit<Drawing, 'id' | 'createdAt'>) => void;
    updateDrawing: (id: string, updates: Partial<Drawing>) => void;
    deleteDrawing: (id: string) => void;
    clearDrawings: () => void;
    activeTool: DrawingTool;
    setActiveTool: (tool: DrawingTool) => void;
}

const DrawingContext = createContext<DrawingContextType | undefined>(undefined);

export const DrawingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [drawings, setDrawings] = useState<Drawing[]>(() => {
        try {
            const raw = localStorage.getItem(DRAWINGS_STORAGE_KEY);
            if (!raw) return [];
            const parsed = JSON.parse(raw) as Drawing[];
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    });
    const [activeTool, setActiveTool] = useState<DrawingTool>('none');

    const addDrawing = (drawing: Omit<Drawing, 'id' | 'createdAt'>) => {
        const newDrawing: Drawing = {
            ...drawing,
            id: Date.now().toString() + Math.random(),
            createdAt: Date.now(),
        };
        setDrawings(prev => [...prev, newDrawing]);
    };

    const updateDrawing = (id: string, updates: Partial<Drawing>) => {
        setDrawings(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
    };

    const deleteDrawing = (id: string) => {
        setDrawings(prev => prev.filter(d => d.id !== id));
    };

    const clearDrawings = () => {
        setDrawings([]);
    };

    React.useEffect(() => {
        localStorage.setItem(DRAWINGS_STORAGE_KEY, JSON.stringify(drawings));
    }, [drawings]);

    return (
        <DrawingContext.Provider value={{
            drawings,
            addDrawing,
            updateDrawing,
            deleteDrawing,
            clearDrawings,
            activeTool,
            setActiveTool,
        }}>
            {children}
        </DrawingContext.Provider>
    );
};

export const useDrawing = () => {
    const context = useContext(DrawingContext);

    if (!context) throw new Error('useDrawing must be used within DrawingProvider');
    
    return context;
};