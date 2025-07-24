import React from 'react';
import { useMousePosition } from '../hooks/useMousePosition';

export const MouseTracker: React.FC = () => {
    const { x, y, scrollY } = useMousePosition();

    return (
        <div className="mouse-tracker">
            <div>X: {x}</div>
            <div>Y: {y}</div>
            <div>Scroll Y: {scrollY}</div>
        </div>
    );
};