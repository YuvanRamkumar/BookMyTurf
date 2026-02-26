"use client";

import { useEffect, useRef } from "react";
import { MotionValue, motion, useTransform } from "framer-motion";

interface GridRevealProps {
    scrollYProgress: MotionValue<number>;
}

// ─── Turf card data ───────────────────────────────────────────────────────────
const TURFS = [
    {
        id: 1,
        name: "Green Arena FC",
        location: "Anna Nagar, Chennai",
        sport: "Football",
        price: "₹800 / hr",
        img: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=800&auto=format&fit=crop",
    },
    {
        id: 2,
        name: "Cricket Kingdom",
        location: "Velachery, Chennai",
        sport: "Cricket",
        price: "₹1200 / hr",
        img: "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?q=80&w=800&auto=format&fit=crop",
    },
    {
        id: 3,
        name: "Smash Court",
        location: "T. Nagar, Chennai",
        sport: "Pickleball",
        price: "₹600 / hr",
        img: "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?q=80&w=800&auto=format&fit=crop",
    },
    {
        id: 4,
        name: "Elite Indoor Hub",
        location: "Porur, Chennai",
        sport: "Multi-sport",
        price: "₹1000 / hr",
        img: "https://images.unsplash.com/photo-1624880353068-25938fc44b8d?q=80&w=800&auto=format&fit=crop",
    },
];

// ─── Easing helpers ───────────────────────────────────────────────────────────
function easeOutCubic(t: number) { return 1 - Math.pow(1 - t, 3); }
function easeInCubic(t: number) { return t * t * t; }
function clamp(v: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, v)); }

// ─── Canvas stagger-wave hook ─────────────────────────────────────────────────
function useGridCanvas(
    canvasRef: React.RefObject<HTMLCanvasElement>,
    scrollYProgress: MotionValue<number>
) {
    const progressRef = useRef(0);

    useEffect(() => {
        return scrollYProgress.onChange((v) => { progressRef.current = v; });
    }, [scrollYProgress]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        let rafId: number;

        const CELL = 52;   // increased by ~7% (from 48)
        const GAP = 0;    // no gaps for solid cover
        const STEP = CELL + GAP;
        const PHASE1_END = 0.55;
        const WAVE = 0.45;

        const drawFrame = () => {
            const p = progressRef.current;
            const ctx = canvas.getContext("2d");
            if (!ctx) { rafId = requestAnimationFrame(drawFrame); return; }

            const W = canvas.width;
            const H = canvas.height;
            ctx.clearRect(0, 0, W, H);

            // Nothing to draw at very start or very end
            if (p > 0.005 && p < 0.99) {
                const cols = Math.ceil(W / STEP) + 1;
                const rows = Math.ceil(H / STEP) + 1;
                const maxDiag = (cols - 1) + (rows - 1);

                ctx.fillStyle = "#ffffff";

                for (let row = 0; row < rows; row++) {
                    for (let col = 0; col < cols; col++) {
                        const cellFraction = maxDiag === 0 ? 0 : (col + row) / maxDiag;

                        let scale: number;

                        if (p <= PHASE1_END) {
                            // Phase 1: scale 0 → 1.05  (cover)
                            const phaseP = p / PHASE1_END;
                            const cStart = cellFraction * (1 - WAVE);
                            const local = clamp((phaseP - cStart) / WAVE, 0, 1);
                            scale = easeOutCubic(local) * 1.05;
                        } else {
                            // Phase 2: scale 1.05 → 0  (uncover)
                            const phaseP = (p - PHASE1_END) / (1 - PHASE1_END);
                            const cStart = cellFraction * (1 - WAVE);
                            const local = clamp((phaseP - cStart) / WAVE, 0, 1);
                            scale = 1.05 * (1 - easeInCubic(local));
                        }

                        if (scale < 0.01) continue;

                        const cx = col * STEP + STEP / 2;
                        const cy = row * STEP + STEP / 2;
                        const half = (CELL / 2) * scale;
                        const x = cx - half;
                        const y = cy - half;
                        const size = CELL * scale;
                        const r = Math.min(size * 0.15, 6);

                        ctx.beginPath();
                        ctx.moveTo(x + r, y);
                        ctx.lineTo(x + size - r, y);
                        ctx.quadraticCurveTo(x + size, y, x + size, y + r);
                        ctx.lineTo(x + size, y + size - r);
                        ctx.quadraticCurveTo(x + size, y + size, x + size - r, y + size);
                        ctx.lineTo(x + r, y + size);
                        ctx.quadraticCurveTo(x, y + size, x, y + size - r);
                        ctx.lineTo(x, y + r);
                        ctx.quadraticCurveTo(x, y, x + r, y);
                        ctx.closePath();
                        ctx.fill();
                    }
                }
            }

            rafId = requestAnimationFrame(drawFrame);
        };

        const resize = () => {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        };
        resize();
        const ro = new ResizeObserver(resize);
        ro.observe(canvas);
        rafId = requestAnimationFrame(drawFrame);

        return () => { cancelAnimationFrame(rafId); ro.disconnect(); };
    }, [canvasRef]);
}

// ─── Individual turf card (hooks called at top level — no hooks-in-loop) ──────
function TurfCard({
    turf,
    index,
    cardsOpacity,
}: {
    turf: typeof TURFS[number];
    index: number;
    cardsOpacity: MotionValue<number>;
}) {
    const lo = index * 0.07;
    const hi = Math.min(1, lo + 0.5);
    const loS = index * 0.07;
    const hiS = Math.min(1, loS + 0.5);

    const opacity = useTransform(cardsOpacity, [lo, hi], [0, 1]);
    const scale = useTransform(cardsOpacity, [loS, hiS], [0.7, 1]);
    const rotateX = useTransform(cardsOpacity, [loS, hiS], [20, 0]);

    // Only allow interactions when visible
    const pointerEvents = useTransform(cardsOpacity, (v) => v > 0.8 ? "auto" : "none");

    return (
        <motion.div
            style={{ opacity, scale, rotateX, pointerEvents } as any}
            className="relative rounded-2xl overflow-hidden group cursor-pointer transition-shadow hover:shadow-[0_20px_50px_rgba(16,185,129,0.4)]"
        >
            <img
                src={turf.img}
                alt={turf.name}
                className="w-full h-44 object-cover brightness-75 group-hover:brightness-90 group-hover:scale-105 transition-all duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-3">
                <p className="text-white font-black text-sm leading-tight">{turf.name}</p>
                <p className="text-white/55 text-xs mt-0.5">{turf.location}</p>
                <div className="flex items-center justify-between mt-2">
                    <span className="text-indigo-300 text-[10px] font-bold uppercase tracking-wider">{turf.sport}</span>
                    <span className="text-emerald-400 text-xs font-black">{turf.price}</span>
                </div>
            </div>
        </motion.div>
    );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export default function GridReveal({ scrollYProgress }: GridRevealProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null!);
    useGridCanvas(canvasRef, scrollYProgress);

    // Turf bg fades in as squares start uncovering (phase 2)
    const bgOpacity = useTransform(scrollYProgress, [0.52, 0.84], [0, 1]);
    const bgY = useTransform(scrollYProgress, [0.5, 1], ["0%", "-12%"]);

    // Cards appear toward end of phase 2
    const cardsOpacity = useTransform(scrollYProgress, [0.72, 0.90], [0, 1]);
    const cardsY = useTransform(scrollYProgress, [0.72, 0.94], [48, 0]);

    return (
        <div className="fixed inset-0 z-20 pointer-events-none overflow-hidden">

            {/* Turf grass background */}
            <motion.div className="absolute inset-0" style={{ opacity: bgOpacity, y: bgY }}>
                <img
                    src="/turf-stadium-lights.png"
                    alt="Turf grass with stadium lights"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/45" />
            </motion.div>

            {/* Canvas — square stagger wave */}
            <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full"
                style={{ willChange: "transform", display: "block" }}
            />

            {/* Turf cards — container centered with perspective for 3D effects */}
            <motion.div
                style={{ opacity: cardsOpacity, y: cardsY, perspective: "1000px" }}
                className="absolute inset-0 flex flex-col items-center justify-center px-6 pointer-events-none"
            >
                <h2 className="text-white text-4xl md:text-6xl font-black uppercase tracking-tighter text-center mb-10 drop-shadow-2xl">
                    Book Your <span className="text-emerald-400">Turf</span>
                </h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-5xl">
                    {TURFS.map((turf, i) => (
                        <TurfCard key={turf.id} turf={turf} index={i} cardsOpacity={cardsOpacity} />
                    ))}
                </div>
            </motion.div>

        </div>
    );
}
