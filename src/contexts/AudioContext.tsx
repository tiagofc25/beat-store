"use client";

import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from "react";

const PREVIEW_LIMIT_SECONDS = 90;

export interface Track {
    id: string;
    title: string;
    audioUrl: string;
    coverUrl?: string;
}

interface AudioContextType {
    currentTrack: Track | null;
    isPlaying: boolean;
    currentTime: number;
    duration: number;
    audioElement: HTMLAudioElement | null;
    play: (track: Track) => void;
    pause: () => void;
    togglePlay: () => void;
    seek: (time: number) => void;
    close: () => void;
}

const AudioCtx = createContext<AudioContextType | null>(null);

export function useAudio() {
    const ctx = useContext(AudioCtx);
    if (!ctx) throw new Error("useAudio must be used within AudioProvider");
    return ctx;
}

export function AudioProvider({ children }: { children: React.ReactNode }) {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    // Create audio element once
    useEffect(() => {
        const audio = new Audio();
        audio.preload = "metadata";
        audio.volume = 0.8;
        audioRef.current = audio;

        const onTimeUpdate = () => {
            if (audio.currentTime >= PREVIEW_LIMIT_SECONDS) {
                audio.pause();
                audio.currentTime = 0;
                setIsPlaying(false);
                setCurrentTime(0);
                return;
            }
            setCurrentTime(audio.currentTime);
        };
        const onLoadedMetadata = () => {
            setDuration(Math.min(audio.duration, PREVIEW_LIMIT_SECONDS));
        };
        const onEnded = () => {
            setIsPlaying(false);
            setCurrentTime(0);
        };

        audio.addEventListener("timeupdate", onTimeUpdate);
        audio.addEventListener("loadedmetadata", onLoadedMetadata);
        audio.addEventListener("ended", onEnded);

        return () => {
            audio.removeEventListener("timeupdate", onTimeUpdate);
            audio.removeEventListener("loadedmetadata", onLoadedMetadata);
            audio.removeEventListener("ended", onEnded);
            audio.pause();
            audio.src = "";
        };
    }, []);

    const play = useCallback((track: Track) => {
        const audio = audioRef.current;
        if (!audio) return;

        if (currentTrack?.id === track.id) {
            // Same track — just resume
            audio.play();
            setIsPlaying(true);
            return;
        }

        // New track
        setCurrentTrack(track);
        setCurrentTime(0);
        setDuration(0);
        audio.src = track.audioUrl;
        audio.load();
        audio.play();
        setIsPlaying(true);
    }, [currentTrack?.id]);

    const pause = useCallback(() => {
        audioRef.current?.pause();
        setIsPlaying(false);
    }, []);

    const togglePlay = useCallback(() => {
        if (!currentTrack) return;
        if (isPlaying) {
            pause();
        } else {
            audioRef.current?.play();
            setIsPlaying(true);
        }
    }, [currentTrack, isPlaying, pause]);

    const seek = useCallback((time: number) => {
        const audio = audioRef.current;
        if (!audio) return;
        const clampedTime = Math.min(time, PREVIEW_LIMIT_SECONDS);
        audio.currentTime = clampedTime;
        setCurrentTime(clampedTime);
    }, []);

    const close = useCallback(() => {
        const audio = audioRef.current;
        if (audio) {
            audio.pause();
            audio.src = "";
        }
        setCurrentTrack(null);
        setIsPlaying(false);
        setCurrentTime(0);
        setDuration(0);
    }, []);

    return (
        <AudioCtx.Provider value={{ currentTrack, isPlaying, currentTime, duration, audioElement: audioRef.current, play, pause, togglePlay, seek, close }}>
            {children}
        </AudioCtx.Provider>
    );
}
