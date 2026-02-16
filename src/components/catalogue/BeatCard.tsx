"use client";

import React from 'react';
import Link from 'next/link';
import { Play, Pause, Plus, Check, Music2 } from 'lucide-react';
import { Badge } from '@/src/components/ui/badge';
import { Button } from '@/src/components/ui/button';
import { cn } from '@/lib/utils';
import { Beat } from '@/lib/supabase/database';
import { useAudio } from '@/src/contexts/AudioContext';

// Helper function to parse array data that might be a JSON string
const parseArray = (value: string | string[] | undefined): string[] => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
        try {
            const parsed = JSON.parse(value);
            return Array.isArray(parsed) ? parsed : [value];
        } catch {
            return [value];
        }
    }
    return [];
};

type BeatWithId = Beat;

interface BeatCardProps {
    beat: BeatWithId;
    isInCart: boolean;
    onAddToCart: (beat: BeatWithId) => void;
    onRemoveFromCart: (beatId: string) => void;
}

export default function BeatCard({ beat, isInCart, onAddToCart, onRemoveFromCart }: BeatCardProps) {
    const { currentTrack, isPlaying, currentTime, duration, play, pause } = useAudio();

    const isThisPlaying = currentTrack?.id === beat.id && isPlaying;
    const progress = currentTrack?.id === beat.id && duration > 0
        ? (currentTime / duration) * 100
        : 0;

    const handlePlayPause = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();

        if (isThisPlaying) {
            pause();
        } else {
            play({
                id: beat.id,
                title: beat.title,
                audioUrl: beat.preview_audio_url,
                coverUrl: beat.cover_art_url,
            });
        }
    };

    const moodColors: Record<string, string> = {
        'Energique': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
        'Mélancolique': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        'Agressif': 'bg-red-500/20 text-red-400 border-red-500/30',
        'Chill': 'bg-green-500/20 text-green-400 border-green-500/30',
        'Sombre': 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30',
        'Joyeux': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
        'Épique': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
        'Romantique': 'bg-pink-500/20 text-pink-400 border-pink-500/30',
        'Mystérieux': 'bg-violet-500/20 text-violet-400 border-violet-500/30',
    };

    return (
        <Link href={`/beat/${beat.id}`} className="block">
            <div className={cn(
                "group relative bg-zinc-900/50 backdrop-blur-sm rounded-2xl overflow-hidden",
                "border border-zinc-800 hover:border-zinc-700 transition-all duration-500",
                "hover:shadow-2xl hover:shadow-violet-500/10 hover:-translate-y-1"
            )}>
                {/* Cover Art */}
                <div className="relative aspect-square overflow-hidden">
                    {beat.cover_art_url ? (
                        <img
                            src={beat.cover_art_url}
                            alt={beat.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center">
                            <Music2 className="w-16 h-16 text-zinc-700" />
                        </div>
                    )}

                    {/* Progress Overlay */}
                    <div
                        className="absolute bottom-0 left-0 h-1.5 bg-gradient-to-r from-pink-500 to-rose-500 transition-all duration-100 shadow-lg shadow-pink-500/50"
                        style={{ width: `${progress}%` }}
                    />

                    {/* Play Button Overlay */}
                    <div className={cn(
                        "absolute inset-0 bg-black/50 flex items-center justify-center",
                        "opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                        isThisPlaying && "opacity-100"
                    )}>
                        <button
                            onClick={handlePlayPause}
                            className={cn(
                                "w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300",
                                "bg-gradient-to-br from-violet-500 to-cyan-500",
                                "hover:scale-110 hover:shadow-lg hover:shadow-violet-500/50",
                                isThisPlaying && "animate-pulse"
                            )}
                        >
                            {isThisPlaying ? (
                                <Pause className="w-7 h-7 text-white" fill="white" />
                            ) : (
                                <Play className="w-7 h-7 text-white ml-1" fill="white" />
                            )}
                        </button>
                    </div>

                    {/* BPM Badge */}
                    <div className="absolute top-3 right-3">
                        <Badge className="bg-black/70 backdrop-blur-sm text-white border-0 font-mono">
                            {beat.bpm} BPM
                        </Badge>
                    </div>
                </div>

                {/* Info */}
                <div className="p-4 space-y-3">
                    <h3 className="font-semibold text-white text-lg truncate">{beat.title}</h3>

                    {/* Genres - First Line */}
                    <div className="flex flex-wrap gap-1.5 min-h-[28px]">
                        {(() => {
                            const genres = parseArray(beat.genre);
                            const maxVisible = 3; // Show max 2 genres
                            const visibleGenres = genres.slice(0, maxVisible);
                            const remainingCount = genres.length - maxVisible;

                            return (
                                <>
                                    {visibleGenres.map((g) => (
                                        <Badge key={g} variant="outline" className="bg-zinc-800/50 text-zinc-300 border-zinc-700 text-xs">
                                            {g}
                                        </Badge>
                                    ))}
                                    {remainingCount > 0 && (
                                        <Badge variant="outline" className="bg-zinc-800/50 text-zinc-400 border-zinc-700 text-xs">
                                            +{remainingCount}
                                        </Badge>
                                    )}
                                </>
                            );
                        })()}
                    </div>

                    {/* Moods - Second Line */}
                    <div className="flex flex-wrap gap-1.5 min-h-[28px]">
                        {(() => {
                            const moods = parseArray(beat.mood);
                            const maxVisible = 2; // Show max 2 moods
                            const visibleMoods = moods.slice(0, maxVisible);
                            const remainingCount = moods.length - maxVisible;

                            return (
                                <>
                                    {visibleMoods.map((m) => (
                                        <Badge key={m} variant="outline" className={cn("border text-xs", moodColors[m] || moodColors['Chill'])}>
                                            {m}
                                        </Badge>
                                    ))}
                                    {remainingCount > 0 && (
                                        <Badge variant="outline" className="bg-violet-500/20 text-violet-400 border-violet-500/30 text-xs">
                                            +{remainingCount}
                                        </Badge>
                                    )}
                                </>
                            );
                        })()}
                    </div>

                    {/* Action Button */}
                    <Button
                        onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            isInCart ? onRemoveFromCart(beat.id) : onAddToCart(beat);
                        }}
                        className={cn(
                            "w-full transition-all duration-300",
                            isInCart
                                ? "bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30"
                                : "bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white"
                        )}
                    >
                        {isInCart ? (
                            <>
                                <Check className="w-4 h-4 mr-2" />
                                Dans la liste
                            </>
                        ) : (
                            <>
                                <Plus className="w-4 h-4 mr-2" />
                                Ajouter à ma liste
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </Link>
    );
}
