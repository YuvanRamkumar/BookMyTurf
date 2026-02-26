"use client";

import { motion, MotionValue, useTransform } from "framer-motion";

interface OpeningCirclesProps {
    scrollYProgress: MotionValue<number>;
}

// Circle size — visible curvature without looking like a flat wall
const SIZE = "130vw";
const OFFSET = "-65vw"; // half-size, used to center the circle on the edge

export default function OpeningCircles({ scrollYProgress }: OpeningCirclesProps) {
    /**
     * LEFT circle:
     *   CSS center rests at viewport left edge (x=0 of screen).
     *   xLeft starts at "-75vw" so the right edge of circle is at -10vw → fully off-screen.
     *   xLeft end at "0vw" → center at left edge, circle covers left half of screen (65vw).
     *
     * RIGHT circle: mirror.
     */
    const xLeft = useTransform(scrollYProgress, [0, 0.55], ["-75vw", "0vw"]);
    const xRight = useTransform(scrollYProgress, [0, 0.55], ["75vw", "0vw"]);

    const rotLeft = useTransform(scrollYProgress, [0, 0.55], [-600, 0]);
    const rotRight = useTransform(scrollYProgress, [0, 0.55], [600, 0]);

    const baseStyle: React.CSSProperties = {
        position: "absolute",
        width: SIZE,
        height: SIZE,
        borderRadius: "50%",
        backgroundColor: "white",
        top: "50vh",
        marginTop: OFFSET,
    };

    return (
        <div className="fixed inset-0 z-20 pointer-events-none overflow-hidden">
            {/* LEFT — center starts off-screen left, rolls in to left edge */}
            <motion.div
                style={{
                    ...baseStyle,
                    left: 0,
                    marginLeft: OFFSET, // pulls center to x=0 (left edge of viewport)
                    x: xLeft,
                    rotate: rotLeft,
                }}
            />

            {/* RIGHT — center starts off-screen right, rolls in to right edge */}
            <motion.div
                style={{
                    ...baseStyle,
                    right: 0,
                    marginRight: OFFSET, // pulls center to x=100vw (right edge of viewport)
                    x: xRight,
                    rotate: rotRight,
                }}
            />
        </div>
    );
}
