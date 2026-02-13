"use client";

import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/select';
import { Input } from '@/src/components/ui/input';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Badge } from '@/src/components/ui/badge';

const GENRES = ['Tous', 'Trap', 'R&B', 'Pop', 'Drill', 'Afrobeat', 'Amapiano', 'Jersey', 'Dancehall', 'Electronic', 'Afro-House', 'House', 'Hood Trap', 'Club', 'SPECIAL'];
const MOODS = ['Tous', 'Energique', 'Mélancolique', 'Agressif', 'Chill', 'Sombre', 'Joyeux', 'Épique', 'Romantique', 'Mystérieux'];

interface FilterState {
    genre: string;
    mood: string;
    search: string;
}

interface FilterBarProps {
    filters: FilterState;
    onFilterChange: (filters: FilterState) => void;
}

export default function FilterBar({ filters, onFilterChange }: FilterBarProps) {
    const activeFiltersCount = [
        filters.genre !== 'Tous' ? 1 : 0,
        filters.mood !== 'Tous' ? 1 : 0,
        filters.search ? 1 : 0
    ].reduce((a, b) => a + b, 0);

    const clearFilters = () => {
        onFilterChange({ genre: 'Tous', mood: 'Tous', search: '' });
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
                {/* Search */}
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                    <Input
                        placeholder="Rechercher un beat..."
                        value={filters.search}
                        onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
                        className="pl-10 bg-zinc-900/50 border-zinc-800 text-white placeholder:text-zinc-500 focus:border-violet-500 h-11"
                    />
                </div>

                {/* Genre Filter */}
                <Select
                    value={filters.genre}
                    onValueChange={(value) => onFilterChange({ ...filters, genre: value })}
                >
                    <SelectTrigger className="w-full sm:w-44 bg-zinc-900/50 border-zinc-800 text-white h-11">
                        <SelectValue placeholder="Genre" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-800">
                        {GENRES.map((genre) => (
                            <SelectItem key={genre} value={genre} className="text-white hover:bg-zinc-800 focus:bg-zinc-800">
                                {genre}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* Mood Filter */}
                <Select
                    value={filters.mood}
                    onValueChange={(value) => onFilterChange({ ...filters, mood: value })}
                >
                    <SelectTrigger className="w-full sm:w-44 bg-zinc-900/50 border-zinc-800 text-white h-11">
                        <SelectValue placeholder="Mood" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-800">
                        {MOODS.map((mood) => (
                            <SelectItem key={mood} value={mood} className="text-white hover:bg-zinc-800 focus:bg-zinc-800">
                                {mood}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Active Filters */}
            {activeFiltersCount > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                    <SlidersHorizontal className="w-4 h-4 text-zinc-500" />
                    <span className="text-sm text-zinc-500">Filtres actifs:</span>

                    {filters.genre !== 'Tous' && (
                        <Badge variant="outline" className="bg-violet-500/20 text-violet-400 border-violet-500/30">
                            {filters.genre}
                            <button onClick={() => onFilterChange({ ...filters, genre: 'Tous' })} className="ml-1">
                                <X className="w-3 h-3" />
                            </button>
                        </Badge>
                    )}

                    {filters.mood !== 'Tous' && (
                        <Badge variant="outline" className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
                            {filters.mood}
                            <button onClick={() => onFilterChange({ ...filters, mood: 'Tous' })} className="ml-1">
                                <X className="w-3 h-3" />
                            </button>
                        </Badge>
                    )}

                    {filters.search && (
                        <Badge variant="outline" className="bg-zinc-500/20 text-zinc-400 border-zinc-500/30">
                            "{filters.search}"
                            <button onClick={() => onFilterChange({ ...filters, search: '' })} className="ml-1">
                                <X className="w-3 h-3" />
                            </button>
                        </Badge>
                    )}

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className="text-zinc-500 hover:text-white"
                    >
                        Tout effacer
                    </Button>
                </div>
            )}
        </div>
    );
}
