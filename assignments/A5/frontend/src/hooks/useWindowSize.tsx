// This hook is based on the following article: https://usehooks.com/useWindowSize/
import { useEffect, useState } from 'react';

type Size = {
    width: number;
    height: number;
};

function useWindowSize(): Size {
    const { innerWidth: width, innerHeight: height } = window;
    const [windowSize, setWindowSize] = useState<Size>({ width, height });
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

export default useWindowSize;
