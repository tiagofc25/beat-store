"use client";

import React from 'react';
import Link from 'next/link';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/src/components/ui/sheet';
import { Button } from '@/src/components/ui/button';
import { ScrollArea } from '@/src/components/ui/scroll-area';
import { X, Music2, ShoppingBag, ArrowRight, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Beat } from '@/lib/supabase/database';

type BeatWithId = Beat;

interface CartDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    items: BeatWithId[];
    onRemoveItem: (beatId: string) => void;
}

export default function CartDrawer({ open, onOpenChange, items, onRemoveItem }: CartDrawerProps) {
    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="bg-zinc-950 border-zinc-800 w-full sm:max-w-md" showCloseButton={false}>
                <SheetHeader className="border-b border-zinc-800 pb-4">
                    <SheetTitle className="text-white flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                            <ShoppingBag className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-base font-semibold text-white">Ma sélection</p>
                            <p className="text-xs font-normal text-zinc-500">{items.length} beat{items.length > 1 ? 's' : ''}</p>
                        </div>
                        <button
                            onClick={() => onOpenChange(false)}
                            className="w-8 h-8 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition-colors flex-shrink-0"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </SheetTitle>
                </SheetHeader>

                <div className="flex flex-col h-[calc(100vh-80px)]">
                    <div className="flex-1 min-h-0">
                        {items.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center p-6">
                                <div className="w-20 h-20 rounded-full bg-zinc-900 flex items-center justify-center mb-4">
                                    <Music2 className="w-10 h-10 text-zinc-700" />
                                </div>
                                <p className="text-zinc-400 mb-2 font-medium">Votre liste est vide</p>
                                <p className="text-sm text-zinc-600">Parcourez le catalogue et ajoutez vos beats préférés</p>
                            </div>
                        ) : (
                            <ScrollArea className="h-full py-4 px-1">
                                <div className="space-y-3">
                                    {items.map((beat) => (
                                        <div
                                            key={beat.id}
                                            className={cn(
                                                "flex items-center gap-3 p-3 rounded-xl",
                                                "bg-zinc-900/50 border border-zinc-800",
                                                "hover:border-zinc-700 transition-colors"
                                            )}
                                        >
                                            {beat.cover_art_url ? (
                                                <img
                                                    src={beat.cover_art_url}
                                                    alt={beat.title}
                                                    className="w-14 h-14 rounded-lg object-cover"
                                                />
                                            ) : (
                                                <div className="w-14 h-14 rounded-lg bg-zinc-800 flex items-center justify-center">
                                                    <Music2 className="w-6 h-6 text-zinc-600" />
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-white truncate">{beat.title}</p>
                                                <p className="text-sm text-zinc-500">
                                                    {(() => {
                                                        const g = beat.genre;
                                                        if (!g) return '';
                                                        if (Array.isArray(g)) return g.join(', ');
                                                        try { const parsed = JSON.parse(g as unknown as string); return Array.isArray(parsed) ? parsed.join(', ') : g; } catch { return g; }
                                                    })()} • {beat.bpm} BPM
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => onRemoveItem(beat.id)}
                                                className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-red-500/20 flex items-center justify-center text-zinc-400 hover:text-red-400 transition-colors"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        )}
                    </div>

                    <div className="mt-auto border-t border-zinc-800 pt-6 pb-4 space-y-4">

                        {/* Social Links & Login Row */}
                        <div className="flex items-center justify-between px-1">
                            <div className="flex items-center gap-4">
                                <a href="https://instagram.com/spacechicowinnitprod" target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-white transition-colors">
                                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                                </a>
                                <a href="https://youtube.com/@SpacechicoWinnit" target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-white transition-colors">
                                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
                                </a>
                                <a href="https://beatstars.com/WinnitSpacechico" target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-white transition-colors">
                                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm-1.5 16.5v-9l7.5 4.5-7.5 4.5z" /></svg>
                                </a>
                            </div>
                            <Link href="/login" onClick={() => onOpenChange(false)}>
                                <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white hover:bg-zinc-800 h-9 rounded-lg">
                                    <User className="w-4 h-4 mr-2" />
                                    Connexion
                                </Button>
                            </Link>
                        </div>

                        {/* Checkout Button */}
                        <Link href="/checkout" className="block w-full" onClick={() => onOpenChange(false)}>
                            <Button
                                disabled={items.length === 0}
                                className={cn(
                                    "w-full h-14 text-base font-semibold rounded-xl transition-all",
                                    items.length > 0
                                        ? "bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white shadow-lg shadow-violet-500/20"
                                        : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                                )}
                            >
                                Continuer
                                <ArrowRight className="w-5 h-5 ml-2" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
