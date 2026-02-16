"use client";

import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/select';
import { Input } from '@/src/components/ui/input';
import { Search, SlidersHorizontal, X, Activity } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/src/components/ui/popover';
import { Label } from '@/src/components/ui/label';
import { Button } from '@/src/components/ui/button';
import { Badge } from '@/src/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/components/ui/tabs';

const GENRES = ['Tous', 'Trap', 'R&B', 'Pop', 'Drill', 'Afrobeat', 'Amapiano', 'Jersey', 'Dancehall', 'Electronic', 'Afro-House', 'House', 'Hood Trap', 'Club', 'SPECIAL'];
const MOODS = ['Tous', 'Energique', 'Mélancolique', 'Agressif', 'Chill', 'Sombre', 'Joyeux', 'Épique', 'Romantique', 'Mystérieux'];

export interface FilterState {
    genre: string;
    mood: string;
    search: string;
    bpmMin?: number;
    bpmMax?: number;
}

interface FilterBarProps {
    filters: FilterState;
    onFilterChange: (filters: FilterState) => void;
}

export default function FilterBar({ filters, onFilterChange }: FilterBarProps) {
    const activeFiltersCount = [
        filters.genre !== 'Tous' ? 1 : 0,
        filters.mood !== 'Tous' ? 1 : 0,
        filters.search ? 1 : 0,
        (filters.bpmMin || filters.bpmMax) ? 1 : 0
    ].reduce((a, b) => a + b, 0);

    const clearFilters = () => {
        onFilterChange({ genre: 'Tous', mood: 'Tous', search: '', bpmMin: undefined, bpmMax: undefined });
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

                {/* BPM Filter */}
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            className={`w-full sm:w-auto bg-zinc-900/50 border-zinc-800 text-white h-11 justify-between px-3 ${filters.bpmMin || filters.bpmMax ? 'border-violet-500/50 text-violet-400' : ''}`}
                        >
                            <span className="flex items-center gap-2">
                                <Activity className="w-4 h-4" />
                                {filters.bpmMin || filters.bpmMax ? (
                                    <span>
                                        {filters.bpmMin === filters.bpmMax
                                            ? `${filters.bpmMin} BPM`
                                            : `${filters.bpmMin || '0'} - ${filters.bpmMax || '∞'}`
                                        }
                                    </span>
                                ) : (
                                    <span>BPM</span>
                                )}
                            </span>
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 bg-zinc-900 border-zinc-800 p-4">
                        <Tabs defaultValue="range" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 bg-zinc-800 text-zinc-400 mb-4">
                                <TabsTrigger value="range" className="data-[state=active]:bg-zinc-700 data-[state=active]:text-white">Fourchette</TabsTrigger>
                                <TabsTrigger value="exact" className="data-[state=active]:bg-zinc-700 data-[state=active]:text-white">Exact</TabsTrigger>
                            </TabsList>
                            <TabsContent value="range">
                                <div className="grid gap-4">
                                    <div className="space-y-2">
                                        <h4 className="font-medium text-white leading-none">Fourchette de BPM</h4>
                                        <p className="text-sm text-zinc-400">Filtrer entre deux tempos.</p>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="min-bpm" className="text-zinc-300">Min</Label>
                                            <Input
                                                id="min-bpm"
                                                type="number"
                                                placeholder="0"
                                                value={filters.bpmMin || ''}
                                                onChange={(e) => onFilterChange({
                                                    ...filters,
                                                    bpmMin: e.target.value ? parseInt(e.target.value) : undefined
                                                })}
                                                className="bg-zinc-800 border-zinc-700 text-white h-9"
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="max-bpm" className="text-zinc-300">Max</Label>
                                            <Input
                                                id="max-bpm"
                                                type="number"
                                                placeholder="200"
                                                value={filters.bpmMax || ''}
                                                onChange={(e) => onFilterChange({
                                                    ...filters,
                                                    bpmMax: e.target.value ? parseInt(e.target.value) : undefined
                                                })}
                                                className="bg-zinc-800 border-zinc-700 text-white h-9"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>
                            <TabsContent value="exact">
                                <div className="grid gap-4">
                                    <div className="space-y-2">
                                        <h4 className="font-medium text-white leading-none">BPM Exact</h4>
                                        <p className="text-sm text-zinc-400">Filtrer par un tempo précis.</p>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="exact-bpm" className="text-zinc-300">BPM</Label>
                                        <Input
                                            id="exact-bpm"
                                            type="number"
                                            placeholder="140"
                                            value={filters.bpmMin === filters.bpmMax ? (filters.bpmMin || '') : ''}
                                            onChange={(e) => {
                                                const val = e.target.value ? parseInt(e.target.value) : undefined;
                                                onFilterChange({
                                                    ...filters,
                                                    bpmMin: val,
                                                    bpmMax: val
                                                });
                                            }}
                                            className="bg-zinc-800 border-zinc-700 text-white h-9"
                                        />
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </PopoverContent>
                </Popover>
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

                    {(filters.bpmMin || filters.bpmMax) && (
                        <Badge variant="outline" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                            <Activity className="w-3 h-3 mr-1" />
                            {filters.bpmMin === filters.bpmMax ? (
                                <span>{filters.bpmMin} BPM</span>
                            ) : (
                                <span>{filters.bpmMin || '0'} - {filters.bpmMax || '∞'} BPM</span>
                            )}
                            <button onClick={() => onFilterChange({ ...filters, bpmMin: undefined, bpmMax: undefined })} className="ml-1">
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
