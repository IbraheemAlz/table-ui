"use client";

import { useEffect, useMemo, useState } from "react";

type DeviceScreen = "mobile" | "tablet" | "laptop" | "desktop";

export const SCREENS = {
    mobile: 412,
    tablet: 820,
    laptop: 1240,
    desktop: 1500,
};

export const useWindowSize = () => {
    const [size, setSize] = useState({ width: 0, height: 0 });

    useEffect(() => {
        function updateSize() {
            setSize({ width: window.innerWidth, height: window.innerHeight });
        }
        window.addEventListener("resize", updateSize);
        updateSize();

        return () => window.removeEventListener("resize", updateSize);
    }, []);

    const currentScreen: DeviceScreen = useMemo(() => {
        if (size?.width > SCREENS?.desktop) return "desktop";
        else if (size?.width > SCREENS?.laptop) return "laptop";
        else if (size?.width > SCREENS?.tablet) return "tablet";
        else return "mobile";
    }, [size]);

    const isSmallDevice = useMemo(
        () => ["mobile", "tablet"].includes(currentScreen),
        [currentScreen],
    );

    return {
        viewportWidth: size.width,
        viewportHeight: size.height,
        currentScreen,
        isSmallDevice,
    };
};
