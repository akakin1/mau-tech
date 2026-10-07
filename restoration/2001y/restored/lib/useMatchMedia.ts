import { useState, useEffect } from "react";

export default function useMatchMedia(screenSize) {
    const [isSmallScreen, setIsSmallScreen] = useState(false);

    useEffect(() => {
        const mediaQuery = window.matchMedia?.(`(max-width: ${screenSize}px)`);
        if (!mediaQuery) return;

        setIsSmallScreen(mediaQuery.matches);

        const handleMediaChange = (e) => setIsSmallScreen(e.matches);
        if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener("change", handleMediaChange);
            return () => mediaQuery.removeEventListener("change", handleMediaChange);
        }
        if (mediaQuery.addListener) {
            mediaQuery.addListener(handleMediaChange);
            return () => mediaQuery.removeListener(handleMediaChange);
        }
    }, [screenSize]);

    return isSmallScreen;
}