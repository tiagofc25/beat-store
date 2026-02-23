"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ShoppingBag, User } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Beat } from "@/lib/supabase/database";
import CartDrawer from "@/src/components/catalogue/CartDrawer";

export default function Navbar() {
    const [linksOpen, setLinksOpen] = useState(false);
    const [cartOpen, setCartOpen] = useState(false);
    const [cart, setCart] = useState<Beat[]>([]);

    useEffect(() => {
        const loadCart = () => {
            const saved = localStorage.getItem("beatCart");
            if (saved) {
                try {
                    setCart(JSON.parse(saved));
                } catch {
                    setCart([]);
                }
            } else {
                setCart([]);
            }
        };
        loadCart();
        window.addEventListener("storage", loadCart);
        const interval = setInterval(loadCart, 1000);
        return () => {
            window.removeEventListener("storage", loadCart);
            clearInterval(interval);
        };
    }, []);

    const removeFromCart = (beatId: string) => {
        const newCart = cart.filter((item) => item.id !== beatId);
        setCart(newCart);
        localStorage.setItem("beatCart", JSON.stringify(newCart));
    };

    return (
        <>
            <header className="sticky top-0 z-50 bg-[#0A0A0B]/80 backdrop-blur-xl border-b border-zinc-800/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <Link href="/" className="flex items-center gap-3 flex-1">
                            <img
                                src="/logo.png"
                                alt="Spacechico & Winnit"
                                className="w-12 h-12 rounded-xl object-cover"
                            />
                            <div>
                                <h1 className="text-xl font-bold text-white">Spacechico & Winnit</h1>
                            </div>
                        </Link>

                        <nav className="hidden sm:flex items-center gap-6">
                            <a href="https://instagram.com/spacechicowinnitprod" target="_blank" rel="noopener noreferrer" className="text-sm text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5">
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                                Instagram
                            </a>
                            <a href="https://youtube.com/@SpacechicoWinnit" target="_blank" rel="noopener noreferrer" className="text-sm text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5">
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
                                YouTube
                            </a>
                            <a href="https://beatstars.com/WinnitSpacechico" target="_blank" rel="noopener noreferrer" className="text-sm text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5">
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm-1.5 16.5v-9l7.5 4.5-7.5 4.5z" /></svg>
                                BeatStars
                            </a>
                        </nav>

                        <div className="flex items-center gap-3 flex-1 justify-end">
                            <Link href="/login" className="hidden sm:block">
                                <Button
                                    variant="outline"
                                    className="bg-zinc-900/50 border-zinc-800 hover:bg-zinc-800 text-white"
                                >
                                    <User className="w-5 h-5" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            <CartDrawer
                open={cartOpen}
                onOpenChange={setCartOpen}
                items={cart}
                onRemoveItem={removeFromCart}
            />
        </>
    );
}
