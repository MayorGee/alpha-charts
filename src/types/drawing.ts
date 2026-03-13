export interface Point {
    x: number; // domain value (timestamp for x, price for y)
    y: number;
}

export interface Drawing {
    id: string;
    type: 'trendline' | 'horizontal' | 'vertical' | 'fibonacci';
    points: Point[]; // 2 points for lines, more for fib?
    color?: string;
    createdAt: number;
}