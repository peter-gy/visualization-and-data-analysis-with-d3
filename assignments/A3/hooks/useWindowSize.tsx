// This hook is based on the following article: https://usehooks.com/useWindowSize/
import { useState, useEffect } from 'react';

type Size = {
    width: number | undefined;
    height: number | undefined;
};

export default function useWindowSize(): Size {
    const [windowSize, setWindowSize] = useState<Size>({
        width: undefined,
        height: undefined
    });
    useEffect(() => {
        function handleResize() {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight
            });
        }
        window.addEventListener('resize', handleResize);
        // Set the initial size
        handleResize();
        // Cleanup function
        return () => window.removeEventListener('resize', handleResize);
    }, []); // No dependencies -> runs only on mount
    return windowSize;
}
