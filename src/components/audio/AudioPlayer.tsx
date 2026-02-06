"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { Slider } from '@/src/components/ui/slider';
import { cn } from '@/lib/utils';

interface AudioPlayerProps {
    src: string;
    title?: string;
    compact?: boolean;
    onPlay?: () => void;
}

export interface AudioPlayerRef {
    pause: () => void;
}

const AudioPlayer = React.forwardRef<AudioPlayerRef, AudioPlayerProps>(({ src, title, compact = false, onPlay }, ref) => {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(0.8);
    const [isMuted, setIsMuted] = useState(false);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
        const handleLoadedMetadata = () => setDuration(audio.duration);
        const handleEnded = () => setIsPlaying(false);

        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('loadedmetadata', handleLoadedMetadata);
        audio.addEventListener('ended', handleEnded);

        return () => {
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
            audio.removeEventListener('ended', handleEnded);
        };
    }, []);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = isMuted ? 0 : volume;
        }
    }, [volume, isMuted]);

    React.useImperativeHandle(ref, () => ({
        pause: () => {
            if (audioRef.current) {
                audioRef.current.pause();
                setIsPlaying(false);
            }
        }
    }));

    const togglePlay = () => {
        if (!audioRef.current) return;

        if (isPlaying) {
            audioRef.current.pause();
        } else {
            if (onPlay) onPlay();
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleSeek = (value: number[]) => {
        if (audioRef.current) {
            audioRef.current.currentTime = value[0];
            setCurrentTime(value[0]);
        }
    };

    const formatTime = (time: number) => {
        if (isNaN(time)) return '0:00';
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    if (compact) {
        return (
            <div className="flex items-center gap-3">
                <audio ref={audioRef} src={src} preload="metadata" />
                <button
                    onClick={togglePlay}
                    className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300",
                        "bg-gradient-to-br from-violet-500 to-cyan-500",
                        "hover:scale-105 hover:shadow-lg hover:shadow-violet-500/25",
                        isPlaying && "animate-pulse"
                    )}
                >
                    {isPlaying ? (
                        <Pause className="w-5 h-5 text-white" fill="white" />
                    ) : (
                        <Play className="w-5 h-5 text-white ml-0.5" fill="white" />
                    )}
                </button>
                <div className="flex-1 min-w-0">
                    <Slider
                        value={[currentTime]}
                        max={duration || 100}
                        step={0.1}
                        onValueChange={handleSeek}
                        className="cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-zinc-500 mt-1">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-zinc-900/50 backdrop-blur-sm rounded-2xl p-4 border border-zinc-800">
            <audio ref={audioRef} src={src} preload="metadata" />

            <div className="flex items-center gap-4">
                <button
                    onClick={togglePlay}
                    className={cn(
                        "w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300",
                        "bg-gradient-to-br from-violet-500 to-cyan-500",
                        "hover:scale-105 hover:shadow-lg hover:shadow-violet-500/25",
                        isPlaying && "animate-pulse"
                    )}
                >
                    {isPlaying ? (
                        <Pause className="w-6 h-6 text-white" fill="white" />
                    ) : (
                        <Play className="w-6 h-6 text-white ml-0.5" fill="white" />
                    )}
                </button>

                <div className="flex-1 space-y-2">
                    {title && (
                        <p className="text-sm font-medium text-white truncate">{title}</p>
                    )}
                    <Slider
                        value={[currentTime]}
                        max={duration || 100}
                        step={0.1}
                        onValueChange={handleSeek}
                        className="cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-zinc-500">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsMuted(!isMuted)}
                        className="text-zinc-400 hover:text-white transition-colors"
                    >
                        {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </button>
                    <Slider
                        value={[isMuted ? 0 : volume * 100]}
                        max={100}
                        step={1}
                        onValueChange={(v) => setVolume(v[0] / 100)}
                        className="w-20 cursor-pointer"
                    />
                </div>
            </div>
        </div>
    );
});

AudioPlayer.displayName = "AudioPlayer";

export default AudioPlayer;
