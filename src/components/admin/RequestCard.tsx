import React, { useState } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Card, CardContent, CardHeader } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Badge } from '@/src/components/ui/badge';
import { Checkbox } from '@/src/components/ui/checkbox';
import { User, Mail, Music2, Clock, Check, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Request {
    id: string;
    status: 'pending' | 'approved' | 'rejected' | 'partial';
    beat_ids: string[];
    beat_titles: string[];
    first_name: string;
    last_name: string;
    email: string;
    created_date?: string | Date;
}

interface RequestCardProps {
    request: Request;
    onApprove: (request: Request, beatIds: string[], beatTitles: string[]) => void;
    onReject: (request: Request) => void;
    isProcessing: boolean;
}

export default function RequestCard({ request, onApprove, onReject, isProcessing }: RequestCardProps) {
    const [selectedBeats, setSelectedBeats] = useState(
        request.beat_ids?.map((id, i) => ({ id, title: request.beat_titles?.[i], selected: true })) || []
    );

    const statusConfig = {
        pending: { label: 'En attente', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
        approved: { label: 'Validée', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
        rejected: { label: 'Refusée', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
        partial: { label: 'Partielle', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' }
    };

    const status = statusConfig[request.status] || statusConfig.pending;

    const toggleBeat = (index: number) => {
        setSelectedBeats(prev => prev.map((beat, i) =>
            i === index ? { ...beat, selected: !beat.selected } : beat
        ));
    };

    const selectedCount = selectedBeats.filter(b => b.selected).length;

    const handleApprove = () => {
        const approvedBeatIds = selectedBeats.filter(b => b.selected).map(b => b.id);
        const approvedBeatTitles = selectedBeats.filter(b => b.selected).map(b => b.title);
        onApprove(request, approvedBeatIds, approvedBeatTitles);
    };

    return (
        <Card className={cn(
            "bg-zinc-900/50 border-zinc-800 overflow-hidden transition-all duration-300",
            "hover:border-zinc-700 hover:shadow-lg hover:shadow-violet-500/5",
            request.status !== 'pending' && "opacity-70"
        )}>
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20 flex items-center justify-center">
                            <User className="w-6 h-6 text-violet-400" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-white">
                                {request.first_name} {request.last_name}
                            </h3>
                            <div className="flex items-center gap-1 text-sm text-zinc-500">
                                <Mail className="w-3 h-3" />
                                {request.email}
                            </div>
                        </div>
                    </div>
                    <Badge variant="outline" className={cn("border", status.color)}>
                        {status.label}
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Beats requested */}
                <div>
                    <p className="text-sm text-zinc-500 mb-2 flex items-center gap-1">
                        <Music2 className="w-4 h-4" />
                        Beats demandés ({request.beat_titles?.length || 0})
                    </p>

                    {request.status === 'pending' ? (
                        <div className="space-y-2">
                            {selectedBeats.map((beat, i) => (
                                <label
                                    key={i}
                                    className={cn(
                                        "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all",
                                        "border",
                                        beat.selected
                                            ? "bg-green-500/10 border-green-500/30"
                                            : "bg-zinc-800/30 border-zinc-700/50"
                                    )}
                                >
                                    <Checkbox
                                        checked={beat.selected}
                                        onCheckedChange={() => toggleBeat(i)}
                                        className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                                    />
                                    <span className={cn(
                                        "text-sm font-medium",
                                        beat.selected ? "text-white" : "text-zinc-500"
                                    )}>
                                        {beat.title}
                                    </span>
                                </label>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-wrap gap-2">
                            {request.beat_titles?.map((title, i) => (
                                <Badge key={i} variant="outline" className="bg-zinc-800/50 text-zinc-300 border-zinc-700">
                                    {title}
                                </Badge>
                            ))}
                        </div>
                    )}
                </div>

                {/* Date */}
                <div className="flex items-center gap-1 text-sm text-zinc-500">
                    <Clock className="w-4 h-4" />
                    {request.created_date && format(new Date(request.created_date), "d MMMM yyyy 'à' HH:mm", { locale: fr })}
                </div>

                {/* Actions */}
                {request.status === 'pending' && (
                    <div className="flex gap-3 pt-2">
                        <Button
                            onClick={() => onReject(request)}
                            disabled={isProcessing}
                            variant="outline"
                            className="flex-1 border-red-500/30 text-red-400 hover:bg-red-500/20 hover:text-red-300"
                        >
                            {isProcessing ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <X className="w-4 h-4 mr-2" />
                            )}
                            Tout refuser
                        </Button>
                        <Button
                            onClick={handleApprove}
                            disabled={isProcessing || selectedCount === 0}
                            className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 disabled:opacity-50"
                        >
                            {isProcessing ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <Check className="w-4 h-4 mr-2" />
                            )}
                            Accepter ({selectedCount})
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
