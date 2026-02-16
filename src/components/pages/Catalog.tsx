"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { beatService, beatRequestService, Beat } from '@/lib/supabase/database';
import { useQuery } from '@tanstack/react-query';
import { ShoppingBag, Music2, Flame, Sparkles, ChevronRight, User } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Badge } from '@/src/components/ui/badge';
import { Skeleton } from '@/src/components/ui/skeleton';
import BeatCard from '@/src/components/catalogue/BeatCard';
import CartDrawer from '@/src/components/catalogue/CartDrawer';
import FilterBar from '@/src/components/catalogue/FilterBar';
import AnimatedBackground from '@/src/components/ui/AnimatedBackground';

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

export default function Catalog() {
  const [cart, setCart] = useState<BeatWithId[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [linksOpen, setLinksOpen] = useState(false);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    genre: 'Tous',
    mood: 'Tous',
    search: ''
  });

  // Load cart from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('beatCart');
    if (saved) {
      try {
        setCart(JSON.parse(saved));
      } catch {
        localStorage.removeItem('beatCart');
      }
    }
  }, []);

  const { data: beats = [], isLoading } = useQuery({
    queryKey: ['beats'],
    queryFn: () => beatService.filter({ is_active: true }, '-created_date'),
  });

  const { data: beatRequests = [] } = useQuery({
    queryKey: ['beat-requests'],
    queryFn: () => beatRequestService.list('-created_date'),
  });

  // Derive latest beats (newest 6)
  const latestBeats = beats.slice(0, 6);

  // Derive most requested beats by counting appearances in requests
  const mostRequestedBeats = React.useMemo(() => {
    const countMap: Record<string, number> = {};
    beatRequests.forEach((req) => {
      (req.beat_ids || []).forEach((id) => {
        countMap[id] = (countMap[id] || 0) + 1;
      });
    });
    return [...beats]
      .filter((b) => countMap[b.id])
      .sort((a, b) => (countMap[b.id] || 0) - (countMap[a.id] || 0))
      .slice(0, 6);
  }, [beats, beatRequests]);

  const hasActiveFilters = filters.genre !== 'Tous' || filters.mood !== 'Tous' || filters.search !== '';

  const addToCart = (beat: BeatWithId) => {
    if (!cart.find((item: BeatWithId) => item.id === beat.id)) {
      const newCart = [...cart, beat];
      setCart(newCart);
      localStorage.setItem('beatCart', JSON.stringify(newCart));
    }
  };

  const removeFromCart = (beatId: string) => {
    const newCart = cart.filter((item: BeatWithId) => item.id !== beatId);
    setCart(newCart);
    localStorage.setItem('beatCart', JSON.stringify(newCart));
  };

  const handlePlay = (beatId: string) => {
    setCurrentlyPlaying(beatId);
  };

  // Filter beats
  const filteredBeats = beats.filter((beat: any) => {
    const genreArr = parseArray(beat.genre);
    const moodArr = parseArray(beat.mood);
    const matchesGenre = filters.genre === 'Tous' || genreArr.includes(filters.genre);
    const matchesMood = filters.mood === 'Tous' || moodArr.includes(filters.mood);
    const matchesSearch = !filters.search ||
      beat.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      genreArr.some((g: string) => g.toLowerCase().includes(filters.search.toLowerCase()));
    return matchesGenre && matchesMood && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#0A0A0B] relative">
      <AnimatedBackground />
      {/* Header */}
      <header className="sticky top-0 z-50 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <img
                src="/logo.png"
                alt="Spacechico & Winnit"
                className="w-12 h-12 rounded-xl object-cover"
              />
              <div>
                <h1 className="text-xl font-bold text-white">Spacechico & Winnit</h1>
                {/* <p className="text-xs text-zinc-500">Catalogue d'instrumentales</p> */}
              </div>
            </div>

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
              {/* Mobile Links Dropdown */}
              <div className="relative sm:hidden">
                <Button
                  variant="outline"
                  onClick={() => setLinksOpen(!linksOpen)}
                  className="bg-zinc-900/50 border-zinc-800 hover:bg-zinc-800 text-white text-sm"
                >
                  Liens
                  <svg className={`w-3.5 h-3.5 ml-1 transition-transform ${linksOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </Button>
                {linksOpen && (
                  <div className="absolute top-full right-0 mt-2 bg-zinc-900/95 backdrop-blur-xl border border-zinc-800/50 rounded-xl p-2 min-w-[180px] shadow-2xl z-50">
                    <a href="https://instagram.com/spacechicowinnitprod" target="_blank" rel="noopener noreferrer" onClick={() => setLinksOpen(false)} className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-colors">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                      Instagram
                    </a>
                    <a href="https://youtube.com/@SpacechicoWinnit" target="_blank" rel="noopener noreferrer" onClick={() => setLinksOpen(false)} className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-colors">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
                      YouTube
                    </a>
                    <a href="https://beatstars.com/WinnitSpacechico" target="_blank" rel="noopener noreferrer" onClick={() => setLinksOpen(false)} className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-colors">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm-1.5 16.5v-9l7.5 4.5-7.5 4.5z" /></svg>
                      BeatStars
                    </a>
                  </div>
                )}
              </div>
              <Button
                variant="outline"
                onClick={() => setCartOpen(true)}
                className="relative bg-zinc-900/50 border-zinc-800 hover:bg-zinc-800 text-white"
              >
                <ShoppingBag className="w-5 h-5" />
                {cart.length > 0 && (
                  <Badge className="absolute -top-2 -right-2 w-5 h-5 p-0 flex items-center justify-center bg-gradient-to-r from-violet-500 to-cyan-500 text-white text-xs">
                    {cart.length}
                  </Badge>
                )}
              </Button>
              <Link href="/login">
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

      {/* Hero Section */}
      <section className="relative">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">
            Trouve ton <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">son</span>
          </h2>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto mb-8">
            Parcours notre collection d'instrumentales et sélectionne celles qui t'inspirent
          </p>
          <div className="max-w-4xl mx-auto">
            <FilterBar filters={filters} onFilterChange={setFilters} />
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">

        {/* Featured Sections (hidden when filters are active) */}
        {!hasActiveFilters && !isLoading && (
          <>
            {/* Dernières sorties */}
            {latestBeats.length > 0 && (
              <section className="mb-12">
                <div className="flex items-center gap-2 mb-6">
                  <Sparkles className="w-5 h-5 text-violet-400" />
                  <h3 className="text-xl font-bold text-white">Dernières sorties</h3>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                  {latestBeats.map((beat: BeatWithId) => (
                    <div key={beat.id} className="min-w-[260px] max-w-[260px] snap-start flex-shrink-0">
                      <BeatCard
                        beat={beat}
                        isInCart={cart.some(item => item.id === beat.id)}
                        onAddToCart={addToCart}
                        onRemoveFromCart={removeFromCart}
                        onPlay={handlePlay}
                        isCurrentlyPlaying={currentlyPlaying === beat.id}
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Beats les plus demandés */}
            {mostRequestedBeats.length > 0 && (
              <section className="mb-12">
                <div className="flex items-center gap-2 mb-6">
                  <Flame className="w-5 h-5 text-orange-400" />
                  <h3 className="text-xl font-bold text-white">Les plus demandés</h3>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                  {mostRequestedBeats.map((beat: BeatWithId) => (
                    <div key={beat.id} className="min-w-[260px] max-w-[260px] snap-start flex-shrink-0">
                      <BeatCard
                        beat={beat}
                        isInCart={cart.some(item => item.id === beat.id)}
                        onAddToCart={addToCart}
                        onRemoveFromCart={removeFromCart}
                        onPlay={handlePlay}
                        isCurrentlyPlaying={currentlyPlaying === beat.id}
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Separator */}
            <div className="mb-8">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold text-white whitespace-nowrap">Tous les beats</h3>
                <div className="h-px flex-1 bg-gradient-to-r from-zinc-800 to-transparent" />
              </div>
            </div>
          </>
        )}



        {/* Results count */}
        <div className="mb-6">
          <p className="text-sm text-zinc-500">
            {filteredBeats.length} beat{filteredBeats.length > 1 ? 's' : ''} trouvé{filteredBeats.length > 1 ? 's' : ''}
          </p>
        </div>

        {/* Beat Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-zinc-900/50 rounded-2xl overflow-hidden border border-zinc-800">
                <Skeleton className="aspect-square bg-zinc-800" />
                <div className="p-4 space-y-3">
                  <Skeleton className="h-6 w-3/4 bg-zinc-800" />
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-16 bg-zinc-800 rounded-full" />
                    <Skeleton className="h-6 w-20 bg-zinc-800 rounded-full" />
                  </div>
                  <Skeleton className="h-10 w-full bg-zinc-800 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredBeats.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-full bg-zinc-900 flex items-center justify-center mx-auto mb-4">
              <Music2 className="w-10 h-10 text-zinc-700" />
            </div>
            <p className="text-zinc-400 mb-2">Aucun beat trouvé</p>
            <p className="text-sm text-zinc-600">Essayez de modifier vos filtres</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredBeats.map((beat: BeatWithId) => (
              <BeatCard
                key={beat.id}
                beat={beat}
                isInCart={cart.some(item => item.id === beat.id)}
                onAddToCart={addToCart}
                onRemoveFromCart={removeFromCart}
                onPlay={handlePlay}
                isCurrentlyPlaying={currentlyPlaying === beat.id}
              />
            ))}
          </div>
        )}
      </main>

      {/* Cart Drawer */}
      <CartDrawer
        open={cartOpen}
        onOpenChange={setCartOpen}
        items={cart}
        onRemoveItem={removeFromCart}
      />
    </div>
  );
}