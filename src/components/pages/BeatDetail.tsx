"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { beatService, Beat } from "@/lib/supabase/database";
import { useQuery } from "@tanstack/react-query";
import {
    ArrowLeft,
    Music2,
    Plus,
    Check,
    Disc3,
    Gauge,
    Palette,
    Clock,
} from "lucide-react";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Skeleton } from "@/src/components/ui/skeleton";
import WaveformPlayer from "@/src/components/audio/WaveformPlayer";
import Navbar from "@/src/components/layout/Navbar";
import AnimatedBackground from "@/src/components/ui/AnimatedBackground";
import { cn } from "@/lib/utils";

// Helper function to parse array data that might be a JSON string
const parseArray = (value: string | string[] | undefined): string[] => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    if (typeof value === "string") {
        try {
            const parsed = JSON.parse(value);
            return Array.isArray(parsed) ? parsed : [value];
        } catch {
            return [value];
        }
    }
    return [];
};

const moodColors: Record<string, string> = {
    Energique: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    Mélancolique: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    Agressif: "bg-red-500/20 text-red-400 border-red-500/30",
    Chill: "bg-green-500/20 text-green-400 border-green-500/30",
    Sombre: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
    Joyeux: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    Épique: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    Romantique: "bg-pink-500/20 text-pink-400 border-pink-500/30",
    Mystérieux: "bg-violet-500/20 text-violet-400 border-violet-500/30",
};

interface BeatDetailProps {
    beatId: string;
}

export default function BeatDetail({ beatId }: BeatDetailProps) {
    const [isInCart, setIsInCart] = useState(false);
    const [totalDuration, setTotalDuration] = useState<number | null>(null);

    const formatDuration = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m}:${s.toString().padStart(2, "0")}`;
    };

    const {
        data: beat,
        isLoading,
        error,
    } = useQuery<Beat | null>({
        queryKey: ["beat", beatId],
        queryFn: () => beatService.getById(beatId),
    });

    // Check if beat is in cart on mount
    useEffect(() => {
        const saved = localStorage.getItem("beatCart");
        if (saved) {
            try {
                const cart: Beat[] = JSON.parse(saved);
                setIsInCart(cart.some((item) => item.id === beatId));
            } catch {
                // ignore
            }
        }
    }, [beatId]);

    const toggleCart = () => {
        const saved = localStorage.getItem("beatCart");
        let cart: Beat[] = [];
        if (saved) {
            try {
                cart = JSON.parse(saved);
            } catch {
                /* ignore */
            }
        }

        if (isInCart) {
            cart = cart.filter((item) => item.id !== beatId);
        } else if (beat) {
            cart.push(beat);
        }

        localStorage.setItem("beatCart", JSON.stringify(cart));
        setIsInCart(!isInCart);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#0A0A0B] relative">
                <AnimatedBackground />
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <Skeleton className="h-8 w-32 bg-zinc-800 mb-8" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Skeleton className="aspect-square rounded-2xl bg-zinc-800" />
                        <div className="space-y-4">
                            <Skeleton className="h-10 w-3/4 bg-zinc-800" />
                            <Skeleton className="h-6 w-24 bg-zinc-800" />
                            <div className="flex gap-2">
                                <Skeleton className="h-6 w-20 bg-zinc-800 rounded-full" />
                                <Skeleton className="h-6 w-24 bg-zinc-800 rounded-full" />
                            </div>
                            <Skeleton className="h-20 w-full bg-zinc-800 rounded-2xl" />
                            <Skeleton className="h-12 w-full bg-zinc-800 rounded-lg" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !beat) {
        return (
            <div className="min-h-screen bg-[#0A0A0B] relative flex items-center justify-center">
                <AnimatedBackground />
                <div className="text-center relative z-10">
                    <div className="w-24 h-24 rounded-full bg-zinc-900 flex items-center justify-center mx-auto mb-6">
                        <Music2 className="w-12 h-12 text-zinc-700" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                        Beat introuvable
                    </h2>
                    <p className="text-zinc-400 mb-6">
                        Ce beat n'existe pas ou a été supprimé.
                    </p>
                    <Link href="/">
                        <Button className="bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Retour au catalogue
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    const genres = parseArray(beat.genre);
    const moods = parseArray(beat.mood);

    return (
        <div className="min-h-screen bg-[#0A0A0B] relative">
            <AnimatedBackground />

            <Navbar />

            {/* Main Content */}
            <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                    {/* Cover Art */}
                    <div className="relative group">
                        <div
                            className={cn(
                                "relative aspect-square rounded-2xl overflow-hidden",
                                "border border-zinc-800 shadow-2xl shadow-violet-500/10",
                                "transition-transform duration-700 group-hover:scale-[1.02]"
                            )}
                        >
                            {beat.cover_art_url ? (
                                <img
                                    src={beat.cover_art_url}
                                    alt={beat.title}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center">
                                    <Music2 className="w-24 h-24 text-zinc-700" />
                                </div>
                            )}

                            {/* Subtle gradient overlay at bottom */}
                            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/40 to-transparent" />
                        </div>

                        {/* Decorative glow */}
                        <div className="absolute -inset-4 bg-gradient-to-br from-violet-500/10 to-cyan-500/10 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 -z-10" />
                    </div>

                    {/* Info */}
                    <div className="flex flex-col justify-center space-y-6">
                        {/* Title */}
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 leading-tight">
                                {beat.title}
                            </h1>
                            <p className="text-sm text-zinc-500">
                                Par{" "}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400 font-medium">
                                    Spacechico & Winnit
                                </span>
                            </p>
                        </div>

                        {/* Metadata */}
                        <div className="space-y-4">
                            {/* BPM */}
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-zinc-800/80 flex items-center justify-center">
                                    <Gauge className="w-5 h-5 text-violet-400" />
                                </div>
                                <div>
                                    <p className="text-xs text-zinc-500 uppercase tracking-wider">
                                        Tempo
                                    </p>
                                    <p className="text-white font-mono font-semibold">
                                        {beat.bpm} BPM
                                    </p>
                                </div>
                            </div>

                            {/* Duration */}
                            {totalDuration !== null && (
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-zinc-800/80 flex items-center justify-center">
                                        <Clock className="w-5 h-5 text-cyan-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-zinc-500 uppercase tracking-wider">
                                            Durée
                                        </p>
                                        <p className="text-white font-mono font-semibold">
                                            {formatDuration(totalDuration)}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Genres */}
                            {genres.length > 0 && (
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-zinc-800/80 flex items-center justify-center flex-shrink-0">
                                        <Disc3 className="w-5 h-5 text-cyan-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1.5">
                                            Genre
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {genres.map((g) => (
                                                <Badge
                                                    key={g}
                                                    variant="outline"
                                                    className="bg-zinc-800/50 text-zinc-300 border-zinc-700"
                                                >
                                                    {g}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Moods */}
                            {moods.length > 0 && (
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-zinc-800/80 flex items-center justify-center flex-shrink-0">
                                        <Palette className="w-5 h-5 text-pink-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1.5">
                                            Ambiance
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {moods.map((m) => (
                                                <Badge
                                                    key={m}
                                                    variant="outline"
                                                    className={cn(
                                                        "border",
                                                        moodColors[m] || moodColors["Chill"]
                                                    )}
                                                >
                                                    {m}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Add to Cart */}
                        <Button
                            onClick={toggleCart}
                            size="lg"
                            className={cn(
                                "w-full transition-all duration-300 text-base",
                                isInCart
                                    ? "bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30"
                                    : "bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40"
                            )}
                        >
                            {isInCart ? (
                                <>
                                    <Check className="w-5 h-5 mr-2" />
                                    Dans ma liste
                                </>
                            ) : (
                                <>
                                    <Plus className="w-5 h-5 mr-2" />
                                    Ajouter à ma liste
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                {/* Waveform Player - Full width below content */}
                <div className="mt-8 pb-20">
                    <WaveformPlayer
                        src={beat.preview_audio_url}
                        title={beat.title}
                        beatId={beat.id}
                        coverUrl={beat.cover_art_url}
                        onDurationLoaded={(d) => setTotalDuration(d)}
                    />
                </div>
            </main>
        </div>
    );
}

