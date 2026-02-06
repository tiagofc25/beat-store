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
  TrendingUp, Users, Clock, Trash2, Eye, EyeOff, LogOut
} from 'lucide-react';
import RequestCard from '@/src/components/admin/RequestCard';
import BeatUploadForm from '@/src/components/admin/BeatUploadForm';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Card, CardContent } from '../ui/card';

interface BeatWithId {
  id: string;
  title: string;
  genre: string;
  mood: string;
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
    
    // Get full audio URLs for the approved beats only
    const requestedBeats = beats.filter(b => approvedBeatIds.includes(b.id));
    const downloadLinks = requestedBeats
      .filter(b => b.full_audio_url)
      .map(b => `${b.title}: ${b.full_audio_url}`)
      .join('\n');

    // Determine status based on selection
    const isPartial = approvedBeatIds.length < request.beat_ids.length;
    const newStatus = isPartial ? 'partial' : 'approved';

    // Update request with approved beats info
    await beatRequestService.update(request.id, { 
      status: newStatus,
      admin_notes: `Beats acceptés: ${approvedBeatTitles.join(', ')}`
    });

    queryClient.invalidateQueries({ queryKey: ['requests'] });
    
    // Copy download links to clipboard for manual sending
    if (downloadLinks) {
      navigator.clipboard.writeText(downloadLinks);
      toast.success(`${approvedBeatIds.length} beat(s) validé(s) ! Liens copiés.`);
    } else {
      toast.success(`${approvedBeatIds.length} beat(s) validé(s) !`);
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
                            {beat.genre} • {beat.mood} • {beat.bpm} BPM
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
    </div>
  );
}