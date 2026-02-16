"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAudio } from "@/src/contexts/AudioContext";

const PREVIEW_LIMIT_SECONDS = 90; // 1 minute 30

interface WaveformPlayerProps {
    src: string;
    title?: string;
    beatId: string;
    coverUrl?: string;
    onDurationLoaded?: (duration: number) => void;
}

export default function WaveformPlayer({ src, title, beatId, coverUrl, onDurationLoaded }: WaveformPlayerProps) {
    const waveformRef = useRef<HTMLDivElement>(null);
    const wavesurferRef = useRef<any>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(0.8);
    const [isMuted, setIsMuted] = useState(false);
    const [isReady, setIsReady] = useState(false);

    const audio = useAudio();

    // Pause the global audio when the waveform player is active on this page,
    // and set the track info so the mini-player can resume on navigation
    useEffect(() => {
        // If the global player is playing a different track, pause it
        if (audio.currentTrack?.id !== beatId && audio.isPlaying) {
            audio.pause();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!waveformRef.current) return;

        let ws: any;
        let aborted = false;

        const initWaveSurfer = async () => {
            const WaveSurfer = (await import("wavesurfer.js")).default;

            if (aborted) return;

            ws = WaveSurfer.create({
                container: waveformRef.current!,
                waveColor: "rgba(139, 92, 246, 0.35)",
                progressColor: "rgba(139, 92, 246, 0.9)",
                cursorColor: "rgba(6, 182, 212, 0.7)",
                cursorWidth: 2,
                barWidth: 2,
                barGap: 2,
                barRadius: 2,
                height: 64,
                normalize: true,
                url: src,
            });

            ws.on("ready", () => {
                if (aborted) return;
                const realDuration = ws.getDuration();
                setDuration(Math.min(realDuration, PREVIEW_LIMIT_SECONDS));
                setIsReady(true);
                ws.setVolume(volume);
                onDurationLoaded?.(realDuration);
            });

            ws.on("audioprocess", () => {
                const time = ws.getCurrentTime();
                if (time >= PREVIEW_LIMIT_SECONDS) {
                    ws.pause();
                    ws.seekTo(0);
                    setCurrentTime(0);
                    return;
                }
                setCurrentTime(time);
            });

            ws.on("seeking", () => {
                setCurrentTime(ws.getCurrentTime());
            });

            ws.on("play", () => {
                setIsPlaying(true);
                // Pause global audio to avoid double playback
                if (audio.isPlaying) {
                    audio.pause();
                }
            });
            ws.on("pause", () => setIsPlaying(false));
            ws.on("finish", () => {
                setIsPlaying(false);
                setCurrentTime(0);
            });

            wavesurferRef.current = ws;
        };

        initWaveSurfer();

        return () => {
            aborted = true;
            if (ws) {
                ws.destroy();
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [src]);

    const togglePlay = useCallback(() => {
        if (wavesurferRef.current) {
            wavesurferRef.current.playPause();
        }
    }, []);

    const toggleMute = useCallback(() => {
        if (wavesurferRef.current) {
            const newMuted = !isMuted;
            setIsMuted(newMuted);
            wavesurferRef.current.setVolume(newMuted ? 0 : volume);
        }
    }, [isMuted, volume]);

    const handleVolumeChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const val = parseFloat(e.target.value);
            setVolume(val);
            setIsMuted(val === 0);
            if (wavesurferRef.current) {
                wavesurferRef.current.setVolume(val);
            }
        },
        []
    );

    const formatTime = (time: number) => {
        if (isNaN(time)) return "0:00";
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    };

    return (
        <div className="w-full rounded-2xl bg-zinc-900/60 backdrop-blur-sm border border-zinc-800 overflow-hidden">
            {/* Waveform area */}
            <div className="px-4 pt-4 pb-2 relative">
                <div
                    ref={waveformRef}
                    className={cn(
                        "w-full transition-opacity duration-500",
                        isReady ? "opacity-100" : "opacity-30"
                    )}
                />
                {!isReady && (
                    <div className="absolute inset-0 flex items-center justify-center px-4">
                        <div className="flex gap-[3px] w-full justify-center">
                            {[...Array(60)].map((_, i) => (
                                <div
                                    key={i}
                                    className="w-[2px] bg-violet-500/20 rounded-full animate-pulse"
                                    style={{
                                        height: `${Math.random() * 40 + 10}px`,
                                        animationDelay: `${i * 40}ms`,
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Controls row */}
            <div className="flex items-center gap-3 px-4 pb-3">
                {/* Play button */}
                <button
                    onClick={togglePlay}
                    disabled={!isReady}
                    className={cn(
                        "w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 flex-shrink-0",
                        "bg-gradient-to-br from-violet-500 to-cyan-500",
                        "hover:scale-105 hover:shadow-lg hover:shadow-violet-500/25",
                        !isReady && "opacity-50 cursor-not-allowed",
                        isPlaying && "shadow-lg shadow-violet-500/30"
                    )}
                >
                    {isPlaying ? (
                        <Pause className="w-3.5 h-3.5 text-white" fill="white" />
                    ) : (
                        <Play className="w-3.5 h-3.5 text-white ml-0.5" fill="white" />
                    )}
                </button>

                {/* Time */}
                <span className="text-xs text-zinc-400 font-mono">
                    {formatTime(currentTime)} / {formatTime(duration)}
                </span>

                <div className="flex-1" />

                {/* Volume */}
                <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                        onClick={toggleMute}
                        className="text-zinc-400 hover:text-white transition-colors"
                    >
                        {isMuted || volume === 0 ? (
                            <VolumeX className="w-4 h-4" />
                        ) : (
                            <Volume2 className="w-4 h-4" />
                        )}
                    </button>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={isMuted ? 0 : volume}
                        onChange={handleVolumeChange}
                        className="w-16 h-1 bg-zinc-700 rounded-full appearance-none cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:w-3
              [&::-webkit-slider-thumb]:h-3
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-violet-500
              [&::-webkit-slider-thumb]:hover:bg-violet-400
              [&::-webkit-slider-thumb]:transition-colors"
                    />
                </div>
            </div>
        </div>
    );
}
