"use client";

import React, { useRef, useEffect, useState } from "react";
import { Play, Pause, X, Music2 } from "lucide-react";
import { useAudio } from "@/src/contexts/AudioContext";
import { cn } from "@/lib/utils";

function formatTime(time: number) {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export default function MiniPlayer() {
    const { currentTrack, isPlaying, currentTime, duration, audioElement, togglePlay, close } = useAudio();
    const waveformRef = useRef<HTMLDivElement>(null);
    const wavesurferRef = useRef<any>(null);
    const [wsReady, setWsReady] = useState(false);
    const currentTrackIdRef = useRef<string | null>(null);

    // Initialize / reinitialize wavesurfer when track changes
    useEffect(() => {
        if (!currentTrack || !audioElement || !waveformRef.current) {
            // Destroy existing wavesurfer if track is gone
            if (wavesurferRef.current) {
                wavesurferRef.current.destroy();
                wavesurferRef.current = null;
                setWsReady(false);
            }
            currentTrackIdRef.current = null;
            return;
        }

        // Skip if same track
        if (currentTrackIdRef.current === currentTrack.id) return;
        currentTrackIdRef.current = currentTrack.id;

        // Destroy previous wavesurfer
        if (wavesurferRef.current) {
            wavesurferRef.current.destroy();
            wavesurferRef.current = null;
            setWsReady(false);
        }

        let aborted = false;

        const initWaveSurfer = async () => {
            const WaveSurfer = (await import("wavesurfer.js")).default;
            if (aborted || !waveformRef.current) return;

            const ws = WaveSurfer.create({
                container: waveformRef.current,
                waveColor: "rgba(139, 92, 246, 0.4)",
                progressColor: "rgba(139, 92, 246, 0.9)",
                cursorColor: "transparent",
                barWidth: 2,
                barGap: 1,
                barRadius: 2,
                height: 32,
                normalize: true,
                interact: true,
                media: audioElement,
            });

            ws.on("ready", () => {
                if (!aborted) setWsReady(true);
            });

            wavesurferRef.current = ws;
        };

        initWaveSurfer();

        return () => {
            aborted = true;
        };
    }, [currentTrack?.id, audioElement]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (wavesurferRef.current) {
                wavesurferRef.current.destroy();
                wavesurferRef.current = null;
            }
        };
    }, []);

    if (!currentTrack) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 animate-in slide-in-from-bottom duration-300">
            {/* Player body */}
            <div className="bg-zinc-950/95 backdrop-blur-xl border-t border-zinc-800/50 px-4 py-2.5">
                <div className="max-w-7xl mx-auto flex items-center gap-3">
                    {/* Cover art */}
                    {currentTrack.coverUrl ? (
                        <img
                            src={currentTrack.coverUrl}
                            alt={currentTrack.title}
                            className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                        />
                    ) : (
                        <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center flex-shrink-0">
                            <Music2 className="w-5 h-5 text-zinc-600" />
                        </div>
                    )}

                    {/* Play/Pause */}
                    <button
                        onClick={togglePlay}
                        className={cn(
                            "w-9 h-9 rounded-full flex items-center justify-center transition-all flex-shrink-0",
                            "bg-gradient-to-br from-violet-500 to-cyan-500",
                            "hover:scale-105 hover:shadow-lg hover:shadow-violet-500/25"
                        )}
                    >
                        {isPlaying ? (
                            <Pause className="w-4 h-4 text-white" fill="white" />
                        ) : (
                            <Play className="w-4 h-4 text-white ml-0.5" fill="white" />
                        )}
                    </button>

                    {/* Title (mobile: shows; desktop: shows before waveform) */}
                    <div className="min-w-0 sm:w-32 flex-shrink-0">
                        <p className="text-sm font-medium text-white truncate">
                            {currentTrack.title}
                        </p>
                        <p className="text-xs text-zinc-500 sm:hidden">
                            {formatTime(currentTime)} / {formatTime(duration)}
                        </p>
                    </div>

                    {/* Waveform (desktop only) */}
                    <div className="hidden sm:flex flex-1 items-center gap-3 min-w-0">
                        <span className="text-xs text-zinc-500 font-mono flex-shrink-0">
                            {formatTime(currentTime)}
                        </span>
                        <div
                            ref={waveformRef}
                            className={cn(
                                "flex-1 min-w-0 transition-opacity duration-300",
                                wsReady ? "opacity-100" : "opacity-30"
                            )}
                        />
                        <span className="text-xs text-zinc-500 font-mono flex-shrink-0">
                            {formatTime(duration)}
                        </span>
                    </div>

                    {/* Close */}
                    <button
                        onClick={close}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors flex-shrink-0"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
