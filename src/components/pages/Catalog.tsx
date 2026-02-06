"use client";

import React, { useState, useEffect } from 'react';
import { beatService, Beat } from '@/lib/supabase/database';
import { useQuery } from '@tanstack/react-query';
import { ShoppingBag, Music2 } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Badge } from '@/src/components/ui/badge';
import { Skeleton } from '@/src/components/ui/skeleton';
import BeatCard from '@/src/components/catalogue/BeatCard';
import CartDrawer from '@/src/components/catalogue/CartDrawer';
import FilterBar from '@/src/components/catalogue/FilterBar';

type BeatWithId = Beat;

export default function Catalog() {
  const [cart, setCart] = useState<BeatWithId[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('beatCart');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [cartOpen, setCartOpen] = useState(false);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    genre: 'Tous',
    mood: 'Tous',
    search: ''
  });

  const { data: beats = [], isLoading } = useQuery({
    queryKey: ['beats'],
    queryFn: () => beatService.filter({ is_active: true }, '-created_date'),
  });

  // Save cart to localStorage
  useEffect(() => {
    localStorage.setItem('beatCart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (beat: BeatWithId) => {
    if (!cart.find((item: BeatWithId) => item.id === beat.id)) {
      setCart([...cart, beat]);
    }
  };

  const removeFromCart = (beatId: string) => {
    setCart(cart.filter((item: BeatWithId) => item.id !== beatId));
  };

  const handlePlay = (beatId: string) => {
    setCurrentlyPlaying(beatId);
  };

  // Filter beats
  const filteredBeats = beats.filter((beat: any) => {
    const matchesGenre = filters.genre === 'Tous' || beat.genre === filters.genre;
    const matchesMood = filters.mood === 'Tous' || beat.mood === filters.mood;
    const matchesSearch = !filters.search || 
      beat.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      beat.genre.toLowerCase().includes(filters.search.toLowerCase());
    return matchesGenre && matchesMood && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#0A0A0B]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0A0A0B]/80 backdrop-blur-xl border-b border-zinc-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
                <Music2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Beat Store</h1>
                <p className="text-xs text-zinc-500">Catalogue d'instrumentales</p>
              </div>
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
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-violet-500/10 via-transparent to-transparent" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">
            Trouve ton <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">son</span>
          </h2>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
            Parcours notre collection d'instrumentales et sélectionne celles qui t'inspirent
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Filters */}
        <div className="mb-8">
          <FilterBar filters={filters} onFilterChange={setFilters} />
        </div>

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