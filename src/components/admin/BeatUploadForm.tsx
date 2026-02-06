"use client";

import React, { useState } from 'react';
import { beatService } from '@/lib/supabase/database';
import { uploadBeatFiles } from '@/lib/supabase/storage';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Upload, Music2, Image, Loader2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const GENRES = ['Hip-Hop', 'Trap', 'R&B', 'Pop', 'Drill', 'Afrobeat', 'Lo-Fi', 'Boom Bap', 'Dancehall', 'Electronic'];
const MOODS = ['Energique', 'Mélancolique', 'Agressif', 'Chill', 'Sombre', 'Joyeux', 'Épique', 'Romantique', 'Mystérieux'];

export default function BeatUploadForm({ onSuccess }: { onSuccess?: () => void }) {
    const [isUploading, setIsUploading] = useState(false);
    const [formData, setFormData] = useState<{
        title: string;
        bpm: string;
        genre: string;
        mood: string;
        coverFile: File | null;
        previewFile: File | null;
        fullFile: File | null;
    }>({
        title: '',
        bpm: '',
        genre: '',
        mood: '',
        coverFile: null,
        previewFile: null,
        fullFile: null
    });
    const [previews, setPreviews] = useState<{
        cover: string | null;
        preview: string | null;
        full: string | null;
    }>({
        cover: null,
        preview: null,
        full: null
    });

    const handleFileChange = (type: 'cover' | 'preview' | 'full', file: File | null) => {
        setFormData({ ...formData, [`${type}File`]: file });

        if (type === 'cover' && file) {
            const url = URL.createObjectURL(file);
            setPreviews(prev => ({ ...prev, cover: url }));
        } else if (file) {
            setPreviews(prev => ({ ...prev, [type]: file.name }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title || !formData.bpm || !formData.genre || !formData.mood || !formData.previewFile) {
            toast.error('Veuillez remplir tous les champs obligatoires');
            return;
        }

        setIsUploading(true);

        try {
            // Upload files to Supabase Storage
            console.log('Starting upload with files:', {
                cover: formData.coverFile?.name,
                preview: formData.previewFile?.name,
                full: formData.fullFile?.name,
            });
            
            const uploadedFiles = await uploadBeatFiles({
                cover: formData.coverFile,
                preview: formData.previewFile,
                full: formData.fullFile,
            });
            
            console.log('Upload successful:', uploadedFiles);

            // Create beat in Supabase database
            await beatService.create({
                title: formData.title,
                bpm: parseInt(formData.bpm),
                genre: formData.genre,
                mood: formData.mood,
                cover_art_url: uploadedFiles.coverUrl,
                preview_audio_url: uploadedFiles.previewUrl || '',
                full_audio_url: uploadedFiles.fullUrl,
                is_active: true
            });

            toast.success('Beat ajouté avec succès !');

            // Reset form
            setFormData({
                title: '',
                bpm: '',
                genre: '',
                mood: '',
                coverFile: null,
                previewFile: null,
                fullFile: null
            });
            setPreviews({ cover: null, preview: null, full: null });
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error('Error uploading beat:', error);
            if (error instanceof Error) {
                toast.error(`Erreur: ${error.message}`);
            } else {
                toast.error("Erreur lors de l'ajout du beat");
            }
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                    <Upload className="w-5 h-5 text-violet-400" />
                    Ajouter un nouveau beat
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-zinc-300">Titre *</Label>
                            <Input
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="bg-zinc-900 border-zinc-800 text-white focus:border-violet-500"
                                placeholder="Nom du beat"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-zinc-300">BPM *</Label>
                            <Input
                                type="number"
                                value={formData.bpm}
                                onChange={(e) => setFormData({ ...formData, bpm: e.target.value })}
                                className="bg-zinc-900 border-zinc-800 text-white focus:border-violet-500"
                                placeholder="120"
                            />
                        </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-zinc-300">Genre *</Label>
                            <Select value={formData.genre} onValueChange={(v) => setFormData({ ...formData, genre: v })}>
                                <SelectTrigger className="bg-zinc-900 border-zinc-800 text-white">
                                    <SelectValue placeholder="Sélectionner" />
                                </SelectTrigger>
                                <SelectContent className="bg-zinc-900 border-zinc-800">
                                    {GENRES.map((genre) => (
                                        <SelectItem key={genre} value={genre} className="text-white hover:bg-zinc-800">
                                            {genre}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-zinc-300">Mood *</Label>
                            <Select value={formData.mood} onValueChange={(v) => setFormData({ ...formData, mood: v })}>
                                <SelectTrigger className="bg-zinc-900 border-zinc-800 text-white">
                                    <SelectValue placeholder="Sélectionner" />
                                </SelectTrigger>
                                <SelectContent className="bg-zinc-900 border-zinc-800">
                                    {MOODS.map((mood) => (
                                        <SelectItem key={mood} value={mood} className="text-white hover:bg-zinc-800">
                                            {mood}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* File Uploads */}
                    <div className="grid sm:grid-cols-3 gap-4">
                        {/* Cover Art */}
                        <div className="space-y-2">
                            <Label className="text-zinc-300">Pochette</Label>
                            <label className={cn(
                                "flex flex-col items-center justify-center w-full h-32 rounded-xl cursor-pointer transition-all",
                                "border-2 border-dashed border-zinc-700 hover:border-violet-500",
                                previews.cover && "border-solid border-violet-500"
                            )}>
                                {previews.cover ? (
                                    <img src={previews.cover} alt="Cover" className="w-full h-full object-cover rounded-xl" />
                                ) : (
                                    <div className="text-center p-4">
                                        <Image className="w-8 h-8 text-zinc-500 mx-auto mb-2" />
                                        <span className="text-sm text-zinc-500">Image</span>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => handleFileChange('cover', e.target.files && e.target.files[0] ? e.target.files[0] : null)}
                                />
                            </label>
                        </div>

                        {/* Preview Audio */}
                        <div className="space-y-2">
                            <Label className="text-zinc-300">Aperçu audio *</Label>
                            <label className={cn(
                                "flex flex-col items-center justify-center w-full h-32 rounded-xl cursor-pointer transition-all",
                                "border-2 border-dashed border-zinc-700 hover:border-violet-500",
                                previews.preview && "border-solid border-green-500"
                            )}>
                                <div className="text-center p-4">
                                    {previews.preview ? (
                                        <>
                                            <Check className="w-8 h-8 text-green-500 mx-auto mb-2" />
                                            <span className="text-sm text-green-400 truncate max-w-full px-2">{previews.preview}</span>
                                        </>
                                    ) : (
                                        <>
                                            <Music2 className="w-8 h-8 text-zinc-500 mx-auto mb-2" />
                                            <span className="text-sm text-zinc-500">Preview (tagué)</span>
                                        </>
                                    )}
                                </div>
                                <input
                                    type="file"
                                    accept="audio/*"
                                    className="hidden"
                                    onChange={(e) => handleFileChange('preview', e.target.files && e.target.files[0] ? e.target.files[0] : null)}
                                />
                            </label>
                        </div>

                        {/* Full Audio */}
                        <div className="space-y-2">
                            <Label className="text-zinc-300">Fichier complet</Label>
                            <label className={cn(
                                "flex flex-col items-center justify-center w-full h-32 rounded-xl cursor-pointer transition-all",
                                "border-2 border-dashed border-zinc-700 hover:border-violet-500",
                                previews.full && "border-solid border-cyan-500"
                            )}>
                                <div className="text-center p-4">
                                    {previews.full ? (
                                        <>
                                            <Check className="w-8 h-8 text-cyan-500 mx-auto mb-2" />
                                            <span className="text-sm text-cyan-400 truncate max-w-full px-2">{previews.full}</span>
                                        </>
                                    ) : (
                                        <>
                                            <Music2 className="w-8 h-8 text-zinc-500 mx-auto mb-2" />
                                            <span className="text-sm text-zinc-500">MP3/WAV</span>
                                        </>
                                    )}
                                </div>
                                <input
                                    type="file"
                                    accept="audio/*"
                                    className="hidden"
                                    onChange={(e) => handleFileChange('full', e.target.files && e.target.files[0] ? e.target.files[0] : null)}
                                />
                            </label>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        disabled={isUploading}
                        className="w-full h-12 bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500"
                    >
                        {isUploading ? (
                            <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                Upload en cours...
                            </>
                        ) : (
                            <>
                                <Upload className="w-5 h-5 mr-2" />
                                Ajouter le beat
                            </>
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
