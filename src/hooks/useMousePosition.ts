import { useEffect, useState } from 'react';

export const useMousePosition = () => {
    const [position, setPosition] = useState<MousePosition>({ x: 0, y: 0, scrollY: 0 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setPosition({
                x: e.clientX,
                y: e.clientY,
                scrollY: window.scrollY
            });
        };

        const handleScroll = () => {
            setPosition(prev => ({
                ...prev,
                scrollY: window.scrollY
            }));
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return position;
};