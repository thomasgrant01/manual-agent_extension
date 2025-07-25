import React from 'react';
import { useMousePosition } from '../hooks/useMousePosition';
import '../styles/MousePosition.css';

export const MousePosition: React.FC = () => {
    const { x, y, scrollY } = useMousePosition();

    return (
        <div className="mouse-position-panel">
            <div className="mouse-position-data">
                <div className="position-item">
                    <span className="position-label">X:</span>
                    <span className="position-value">{x}px</span>
                </div>
                <div className="position-item">
                    <span className="position-label">Y:</span>
                    <span className="position-value">{y}px</span>
                </div>
                <div className="position-item">
                    <span className="position-label">Scroll:</span>
                    <span className="position-value">{scrollY}px</span>
                </div>
            </div>
        </div>
    );
};
