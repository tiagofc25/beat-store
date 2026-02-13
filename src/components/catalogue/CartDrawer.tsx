"use client";

import React from 'react';
import Link from 'next/link';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/src/components/ui/sheet';
import { Button } from '@/src/components/ui/button';
import { ScrollArea } from '@/src/components/ui/scroll-area';
import { X, Music2, ShoppingBag, ArrowRight } from 'lucide-react';
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

                {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                        <div className="w-20 h-20 rounded-full bg-zinc-900 flex items-center justify-center mb-4">
                            <Music2 className="w-10 h-10 text-zinc-700" />
                        </div>
                        <p className="text-zinc-400 mb-2">Votre liste est vide</p>
                        <p className="text-sm text-zinc-600">Parcourez le catalogue et ajoutez vos beats préférés</p>
                    </div>
                ) : (
                    <>
                        <ScrollArea className="flex-1 h-[calc(100vh-220px)] py-4">
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

                        <SheetFooter className="border-t border-zinc-800 pt-4">
                            <Link href="/checkout" className="w-full" onClick={() => onOpenChange(false)}>
                                <Button className="w-full bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white h-12 text-base">
                                    Continuer
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </Button>
                            </Link>
                        </SheetFooter>
                    </>
                )}
            </SheetContent>
        </Sheet>
    );
}
