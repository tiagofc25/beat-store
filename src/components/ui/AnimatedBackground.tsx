"use client";

import React, { useEffect, useRef } from "react";

interface PianoNote {
    x: number;
    y: number;
    width: number;
    height: number;
    opacity: number;
    targetOpacity: number;
    fadeSpeed: number;
    color: string;
    glow: number;
    glowSpeed: number;
    lifetime: number;
    maxLifetime: number;
}

export default function AnimatedBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number>(0);
    const notesRef = useRef<PianoNote[]>([]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const colors = [
            "139, 92, 246",   // violet-500
            "124, 58, 237",   // violet-600
            "6, 182, 212",    // cyan-500
            "8, 145, 178",    // cyan-600
            "167, 139, 250",  // violet-400
            "34, 211, 238",   // cyan-400
            "236, 72, 153",   // pink-500
            "219, 39, 119",   // pink-600
        ];

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener("resize", resize);

        // Piano roll lanes (like horizontal piano keys)
        const laneHeight = 40;
        const numLanes = Math.ceil(canvas.height / laneHeight);

        // Create a note that appears in place
        const createNote = () => {
            const lane = Math.floor(Math.random() * numLanes);
            const xPos = Math.random() * (canvas.width - 300) + 50;
            const maxLife = Math.random() * 420 + 480; // 8-15 seconds at 60fps (much longer)

            return {
                x: xPos,
                y: lane * laneHeight + 5,
                width: Math.random() * 250 + 100,
                height: laneHeight - 10,
                opacity: 0,
                targetOpacity: Math.random() * 0.04 + 0.02, // Very subtle (reduced from 0.08 + 0.04)
                fadeSpeed: 0.005, // Even slower fade
                color: colors[Math.floor(Math.random() * colors.length)],
                glow: Math.random() * Math.PI * 2,
                glowSpeed: Math.random() * 0.01 + 0.005, // Very slow glow
                lifetime: 0,
                maxLifetime: maxLife,
            };
        };

        // Initialize with some notes
        notesRef.current = Array.from({ length: 12 }, createNote); // Fewer initial notes

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw horizontal grid lines (piano roll lanes)
            ctx.strokeStyle = "rgba(255, 255, 255, 0.02)";
            ctx.lineWidth = 1;
            for (let i = 0; i <= numLanes; i++) {
                const y = i * laneHeight;
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(canvas.width, y);
                ctx.stroke();
            }

            // Occasionally add new notes (less frequently for subtlety)
            if (Math.random() < 0.008 && notesRef.current.length < 18) {
                notesRef.current.push(createNote());
            }

            // Update and draw notes
            notesRef.current = notesRef.current.filter(note => {
                note.lifetime += 1;
                note.glow += note.glowSpeed;

                // Fade in phase
                if (note.lifetime < 30) {
                    note.opacity = Math.min(note.opacity + note.fadeSpeed, note.targetOpacity);
                }
                // Fade out phase (last 30 frames)
                else if (note.lifetime > note.maxLifetime - 30) {
                    note.opacity = Math.max(note.opacity - note.fadeSpeed, 0);
                }

                // Remove notes that have faded out completely
                if (note.lifetime > note.maxLifetime && note.opacity <= 0) {
                    return false;
                }

                // Pulsing glow effect
                const glowIntensity = Math.sin(note.glow) * 0.1 + 1;
                const currentOpacity = note.opacity * glowIntensity;

                // Draw note with glow
                const gradient = ctx.createLinearGradient(
                    note.x, note.y,
                    note.x, note.y + note.height
                );
                gradient.addColorStop(0, `rgba(${note.color}, ${currentOpacity * 0.6})`);
                gradient.addColorStop(0.5, `rgba(${note.color}, ${currentOpacity})`);
                gradient.addColorStop(1, `rgba(${note.color}, ${currentOpacity * 0.6})`);

                // Draw glow/shadow
                ctx.shadowBlur = 25;
                ctx.shadowColor = `rgba(${note.color}, ${currentOpacity * 0.9})`;

                // Draw rounded rectangle
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.roundRect(note.x, note.y, note.width, note.height, 6);
                ctx.fill();

                // Reset shadow
                ctx.shadowBlur = 0;

                // Draw subtle border
                ctx.strokeStyle = `rgba(${note.color}, ${currentOpacity * 1.5})`;
                ctx.lineWidth = 1.5;
                ctx.stroke();

                return true;
            });

            animationRef.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener("resize", resize);
            cancelAnimationFrame(animationRef.current);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none"
            style={{ zIndex: 0 }}
            aria-hidden="true"
        />
    );
}
