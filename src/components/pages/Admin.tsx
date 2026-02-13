"use client";

import React, { useState } from 'react';
import { beatService, beatRequestService } from '@/lib/supabase/database';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Switch } from '../ui/switch';
import { Skeleton } from '../ui/skeleton';
import { 
  LayoutDashboard, Music2, Inbox, Settings, 
  TrendingUp, Users, Clock, Trash2, Eye, EyeOff, LogOut, Pencil, X
} from 'lucide-react';
import RequestCard from '@/src/components/admin/RequestCard';
import BeatUploadForm from '@/src/components/admin/BeatUploadForm';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Card, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

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
interface BeatWithId {
  id: string;
  title: string;
  genre: string[];
  mood: string[];
  bpm: number;
  cover_art_url?: string;
  preview_audio_url: string;
  full_audio_url?: string;
  is_active?: boolean;
}

interface RequestWithId {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  beat_ids: string[];
  beat_titles: string[];
  status: 'pending' | 'approved' | 'rejected' | 'partial';
  admin_notes?: string;
  created_date?: string | Date;
}

export default function Admin() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [editingBeat, setEditingBeat] = useState<BeatWithId | null>(null);
  const [editForm, setEditForm] = useState({
    title: '',
    genres: [] as string[],
    moods: [] as string[],
    bpm: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  const GENRES = ['Hip-Hop', 'Trap', 'R&B', 'Pop', 'Drill', 'Afrobeat', 'Lo-Fi', 'Boom Bap', 'Dancehall', 'Electronic'];
  const MOODS = ['Energique', 'Mélancolique', 'Agressif', 'Chill', 'Sombre', 'Joyeux', 'Épique', 'Romantique', 'Mystérieux'];

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
    router.refresh();
  };

  const { data: requests = [], isLoading: loadingRequests } = useQuery<RequestWithId[]>({
    queryKey: ['requests'],
    queryFn: () => beatRequestService.list('-created_date'),
  });

  const { data: beats = [], isLoading: loadingBeats } = useQuery<BeatWithId[]>({
    queryKey: ['beats-admin'],
    queryFn: () => beatService.list('-created_date'),
  });

  const pendingRequests = requests.filter((r: RequestWithId) => r.status === 'pending');
  const approvedRequests = requests.filter((r: RequestWithId) => r.status === 'approved');

  const handleApprove = async (request: RequestWithId, approvedBeatIds: string[], approvedBeatTitles: string[]) => {
    setProcessingId(request.id);
    
    try {
      // Get full audio URLs for the approved beats only
      const requestedBeats = beats.filter(b => approvedBeatIds.includes(b.id));
      const beatsWithUrls = requestedBeats
        .filter(b => b.full_audio_url)
        .map(b => ({ title: b.title, url: b.full_audio_url! }));

      // Determine status based on selection
      const isPartial = approvedBeatIds.length < request.beat_ids.length;
      const newStatus = isPartial ? 'partial' : 'approved';

      // Send email with beats to the user
      if (beatsWithUrls.length > 0) {
        const response = await fetch('/api/send-beats', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            firstName: request.first_name,
            lastName: request.last_name,
            email: request.email,
            beats: beatsWithUrls,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Erreur lors de l\'envoi de l\'email');
        }
      }

      // Update request with approved beats info
      await beatRequestService.update(request.id, { 
        status: newStatus,
        admin_notes: `Beats acceptés: ${approvedBeatTitles.join(', ')}`
      });

      queryClient.invalidateQueries({ queryKey: ['requests'] });
      
      toast.success(`${approvedBeatIds.length} beat(s) envoyé(s) par email à ${request.email} !`);
    } catch (error) {
      console.error('Error approving request:', error);
      toast.error(error instanceof Error ? error.message : 'Erreur lors de l\'approbation');
    }
    setProcessingId(null);
  };

  const handleReject = async (request: RequestWithId) => {
    setProcessingId(request.id);
    
    await beatRequestService.update(request.id, { status: 'rejected' });

    queryClient.invalidateQueries({ queryKey: ['requests'] });
    toast.success('Demande refusée');
    setProcessingId(null);
  };

  const toggleBeatVisibility = async (beat: BeatWithId) => {
    await beatService.update(beat.id, { is_active: !beat.is_active });
    queryClient.invalidateQueries({ queryKey: ['beats-admin'] });
    toast.success(beat.is_active ? 'Beat masqué' : 'Beat visible');
  };

  const deleteBeat = async (beat: BeatWithId) => {
    if (!confirm(`Supprimer "${beat.title}" ?`)) return;
    await beatService.delete(beat.id);
    queryClient.invalidateQueries({ queryKey: ['beats-admin'] });
    toast.success('Beat supprimé');
  };

  const openEditModal = (beat: BeatWithId) => {
    setEditingBeat(beat);
    setEditForm({
      title: beat.title,
      genres: parseArray(beat.genre),
      moods: parseArray(beat.mood),
      bpm: beat.bpm.toString()
    });
  };

  const handleSaveEdit = async () => {
    if (!editingBeat) return;
    
    setIsSaving(true);
    try {
      await beatService.update(editingBeat.id, {
        title: editForm.title,
        genre: editForm.genres,
        mood: editForm.moods,
        bpm: parseInt(editForm.bpm)
      });
      queryClient.invalidateQueries({ queryKey: ['beats-admin'] });
      toast.success('Beat modifié avec succès');
      setEditingBeat(null);
    } catch (error) {
      console.error('Error updating beat:', error);
      toast.error('Erreur lors de la modification');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B]">
      {/* Header */}
      <header className="bg-[#0A0A0B]/80 backdrop-blur-xl border-b border-zinc-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
                <LayoutDashboard className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Administration</h1>
                <p className="text-xs text-zinc-500">{user?.email}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              onClick={handleSignOut}
              className="text-zinc-400 hover:text-white hover:bg-zinc-800"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Déconnexion
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
                  <Music2 className="w-5 h-5 text-violet-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{beats.length}</p>
                  <p className="text-xs text-zinc-500">Beats</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{pendingRequests.length}</p>
                  <p className="text-xs text-zinc-500">En attente</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{approvedRequests.length}</p>
                  <p className="text-xs text-zinc-500">Validées</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{requests.length}</p>
                  <p className="text-xs text-zinc-500">Total demandes</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="requests" className="space-y-6">
          <TabsList className="bg-zinc-900/50 border border-zinc-800">
            <TabsTrigger value="requests" className="data-[state=active]:bg-zinc-800">
              <Inbox className="w-4 h-4 mr-2" />
              Demandes
              {pendingRequests.length > 0 && (
                <Badge className="ml-2 bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                  {pendingRequests.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="beats" className="data-[state=active]:bg-zinc-800">
              <Music2 className="w-4 h-4 mr-2" />
              Mes Beats
            </TabsTrigger>
            <TabsTrigger value="upload" className="data-[state=active]:bg-zinc-800">
              <Settings className="w-4 h-4 mr-2" />
              Ajouter
            </TabsTrigger>
          </TabsList>

          {/* Requests Tab */}
          <TabsContent value="requests" className="space-y-4">
            {loadingRequests ? (
              <div className="grid md:grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => (
                  <Card key={i} className="bg-zinc-900/50 border-zinc-800">
                    <CardContent className="p-6 space-y-4">
                      <Skeleton className="h-12 w-12 rounded-xl bg-zinc-800" />
                      <Skeleton className="h-4 w-3/4 bg-zinc-800" />
                      <Skeleton className="h-4 w-1/2 bg-zinc-800" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : requests.length === 0 ? (
              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardContent className="p-12 text-center">
                  <Inbox className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                  <p className="text-zinc-400">Aucune demande pour le moment</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {requests.map((request) => (
                  <RequestCard
                    key={request.id}
                    request={request}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    isProcessing={processingId === request.id}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Beats Tab */}
          <TabsContent value="beats" className="space-y-4">
            {loadingBeats ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full bg-zinc-800 rounded-xl" />
                ))}
              </div>
            ) : beats.length === 0 ? (
              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardContent className="p-12 text-center">
                  <Music2 className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                  <p className="text-zinc-400">Aucun beat uploadé</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {beats.map((beat) => (
                  <Card key={beat.id} className={cn(
                    "bg-zinc-900/50 border-zinc-800 transition-opacity",
                    !beat.is_active && "opacity-50"
                  )}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
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
                            {parseArray(beat.genre).join(', ')} • {parseArray(beat.mood).join(', ')} • {beat.bpm} BPM
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            {beat.is_active ? (
                              <Eye className="w-4 h-4 text-zinc-400" />
                            ) : (
                              <EyeOff className="w-4 h-4 text-zinc-600" />
                            )}
                            <Switch
                              checked={beat.is_active}
                              onCheckedChange={() => toggleBeatVisibility(beat)}
                            />
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditModal(beat)}
                            className="text-zinc-500 hover:text-violet-400 hover:bg-violet-500/10"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteBeat(beat)}
                            className="text-zinc-500 hover:text-red-400 hover:bg-red-500/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Upload Tab */}
          <TabsContent value="upload">
            <BeatUploadForm onSuccess={() => queryClient.invalidateQueries({ queryKey: ['beats-admin'] })} />
          </TabsContent>
        </Tabs>
      </main>

      {/* Edit Modal */}
      {editingBeat && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="bg-zinc-900 border-zinc-800 w-full max-w-md">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold text-white mb-6">Modifier le beat</h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-zinc-300">Titre</Label>
                  <Input
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    className="bg-zinc-800 border-zinc-700 text-white focus:border-violet-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-300">BPM</Label>
                  <Input
                    type="number"
                    value={editForm.bpm}
                    onChange={(e) => setEditForm({ ...editForm, bpm: e.target.value })}
                    className="bg-zinc-800 border-zinc-700 text-white focus:border-violet-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-300">Genre(s)</Label>
                  <div className="flex flex-wrap gap-2 p-3 bg-zinc-800 border border-zinc-700 rounded-md min-h-[42px]">
                    {editForm.genres.map((genre) => (
                      <Badge 
                        key={genre} 
                        className="bg-violet-500/20 text-violet-400 border-violet-500/30 hover:bg-violet-500/30 cursor-pointer"
                        onClick={() => setEditForm({ ...editForm, genres: editForm.genres.filter(g => g !== genre) })}
                      >
                        {genre}
                        <X className="w-3 h-3 ml-1" />
                      </Badge>
                    ))}
                  </div>
                  <Select onValueChange={(v) => {
                    if (!editForm.genres.includes(v)) {
                      setEditForm({ ...editForm, genres: [...editForm.genres, v] });
                    }
                  }}>
                    <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                      <SelectValue placeholder="Ajouter un genre" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-800">
                      {GENRES.filter(g => !editForm.genres.includes(g)).map((genre) => (
                        <SelectItem key={genre} value={genre} className="text-white hover:bg-zinc-800">
                          {genre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-300">Mood(s)</Label>
                  <div className="flex flex-wrap gap-2 p-3 bg-zinc-800 border border-zinc-700 rounded-md min-h-[42px]">
                    {editForm.moods.map((mood) => (
                      <Badge 
                        key={mood} 
                        className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/30 cursor-pointer"
                        onClick={() => setEditForm({ ...editForm, moods: editForm.moods.filter(m => m !== mood) })}
                      >
                        {mood}
                        <X className="w-3 h-3 ml-1" />
                      </Badge>
                    ))}
                  </div>
                  <Select onValueChange={(v) => {
                    if (!editForm.moods.includes(v)) {
                      setEditForm({ ...editForm, moods: [...editForm.moods, v] });
                    }
                  }}>
                    <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                      <SelectValue placeholder="Ajouter un mood" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-800">
                      {MOODS.filter(m => !editForm.moods.includes(m)).map((mood) => (
                        <SelectItem key={mood} value={mood} className="text-white hover:bg-zinc-800">
                          {mood}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-3 pt-4">
                  <Button
                    variant="ghost"
                    className="flex-1 text-zinc-400 hover:text-white hover:bg-zinc-800"
                    onClick={() => setEditingBeat(null)}
                  >
                    Annuler
                  </Button>
                  <Button
                    className="flex-1 bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500"
                    onClick={handleSaveEdit}
                    disabled={isSaving}
                  >
                    {isSaving ? 'Enregistrement...' : 'Enregistrer'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}