"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { beatRequestService, Beat } from '@/lib/supabase/database';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { ArrowLeft, Music2, Send, Check, Loader2, ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface FormData {
    firstName: string;
    lastName: string;
    email: string;
}

interface FormErrors {
    firstName?: string;
    lastName?: string;
    email?: string;
}

export default function Checkout() {
    const router = useRouter();
    const [cart, setCart] = useState<Beat[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [formData, setFormData] = useState<FormData>({
        firstName: '',
        lastName: '',
        email: ''
    });
    const [errors, setErrors] = useState<FormErrors>({});

    useEffect(() => {
        const saved = localStorage.getItem('beatCart');
        if (saved) {
            setCart(JSON.parse(saved));
        }
    }, []);

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};
        if (!formData.firstName.trim()) newErrors.firstName = 'Prénom requis';
        if (!formData.lastName.trim()) newErrors.lastName = 'Nom requis';
        if (!formData.email.trim()) {
            newErrors.email = 'Email requis';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Email invalide';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm() || cart.length === 0) return;

        setIsSubmitting(true);

        try {
            // Create the request in Supabase
            await beatRequestService.create({
                first_name: formData.firstName,
                last_name: formData.lastName,
                email: formData.email,
                beat_ids: cart.map((b: Beat) => b.id),
                beat_titles: cart.map((b: Beat) => b.title),
                status: 'pending'
            });

            // Send email notification to admin and customer
            try {
                const emailResponse = await fetch('/api/send-notification', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        firstName: formData.firstName,
                        lastName: formData.lastName,
                        email: formData.email,
                        beatTitles: cart.map((b: Beat) => b.title),
                    }),
                });

                if (!emailResponse.ok) {
                    throw new Error('Email sending failed');
                }

            } catch (emailError) {
                console.error('Failed to send notification email:', emailError);
                toast.error("La demande a été enregistrée mais l'envoie de l'email de confirmation a échoué.");
            }

            // Clear cart
            localStorage.removeItem('beatCart');
            setIsSuccess(true);
        } catch (error) {
            console.error('Error submitting request:', error);
            if (error instanceof Error) {
                toast.error(`Erreur: ${error.message}`);
            } else {
                toast.error('Erreur lors de l\'envoi de la demande');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center p-4">
                <div className="text-center max-w-md">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mx-auto mb-6 animate-bounce">
                        <Check className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-4">Demande envoyée !</h1>
                    <p className="text-zinc-400 mb-8">
                        Nous avons bien reçu votre demande. Vous recevrez un email avec les liens de téléchargement une fois celle-ci validée.
                    </p>
                    <Link href="/catalog">
                        <Button className="bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Retour au catalogue
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    if (cart.length === 0) {
        return (
            <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center p-4">
                <div className="text-center max-w-md">
                    <div className="w-20 h-20 rounded-full bg-zinc-900 flex items-center justify-center mx-auto mb-6">
                        <ShoppingBag className="w-10 h-10 text-zinc-700" />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-4">Votre liste est vide</h1>
                    <p className="text-zinc-400 mb-8">
                        Parcourez le catalogue et ajoutez des beats à votre sélection
                    </p>
                    <Link href="/catalog">
                        <Button className="bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Voir le catalogue
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0A0A0B]">
            {/* Header */}
            <header className="bg-[#0A0A0B]/80 backdrop-blur-xl border-b border-zinc-800/50">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <Link
                        href="/catalog"
                        className="inline-flex items-center text-zinc-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Retour au catalogue
                    </Link>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center mb-12">
                    <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">Finaliser ma demande</h1>
                    <p className="text-zinc-400">Remplissez vos informations pour recevoir les beats sélectionnés</p>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Form */}
                    <Card className="bg-zinc-900/50 border-zinc-800">
                        <CardHeader>
                            <CardTitle className="text-white">Vos informations</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="firstName" className="text-zinc-300">Prénom</Label>
                                        <Input
                                            id="firstName"
                                            value={formData.firstName}
                                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                            className={cn(
                                                "bg-zinc-900 border-zinc-800 text-white focus:border-violet-500",
                                                errors.firstName && "border-red-500"
                                            )}
                                            placeholder="John"
                                        />
                                        {errors.firstName && <p className="text-sm text-red-400">{errors.firstName}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="lastName" className="text-zinc-300">Nom</Label>
                                        <Input
                                            id="lastName"
                                            value={formData.lastName}
                                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                            className={cn(
                                                "bg-zinc-900 border-zinc-800 text-white focus:border-violet-500",
                                                errors.lastName && "border-red-500"
                                            )}
                                            placeholder="Doe"
                                        />
                                        {errors.lastName && <p className="text-sm text-red-400">{errors.lastName}</p>}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-zinc-300">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className={cn(
                                            "bg-zinc-900 border-zinc-800 text-white focus:border-violet-500",
                                            errors.email && "border-red-500"
                                        )}
                                        placeholder="john@example.com"
                                    />
                                    {errors.email && <p className="text-sm text-red-400">{errors.email}</p>}
                                </div>

                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full h-12 bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white text-base"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                            Envoi en cours...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-5 h-5 mr-2" />
                                            Envoyer ma demande
                                        </>
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Order Summary */}
                    <Card className="bg-zinc-900/50 border-zinc-800">
                        <CardHeader>
                            <CardTitle className="text-white flex items-center justify-between">
                                Ma sélection
                                <span className="text-sm font-normal text-zinc-400">
                                    {cart.length} beat{cart.length > 1 ? 's' : ''}
                                </span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {cart.map((beat: any) => (
                                    <div
                                        key={beat.id || beat.title}
                                        className="flex items-center gap-3 p-3 rounded-xl bg-zinc-800/50 border border-zinc-700"
                                    >
                                        {beat.cover_art_url ? (
                                            <img
                                                src={beat.cover_art_url}
                                                alt={beat.title}
                                                className="w-12 h-12 rounded-lg object-cover"
                                            />
                                        ) : (
                                            <div className="w-12 h-12 rounded-lg bg-zinc-700 flex items-center justify-center">
                                                <Music2 className="w-5 h-5 text-zinc-500" />
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-white truncate">{beat.title}</p>
                                            <p className="text-sm text-zinc-500">{beat.genre} • {beat.bpm} BPM</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-6 p-4 rounded-xl bg-violet-500/10 border border-violet-500/20">
                                <p className="text-sm text-violet-300">
                                    <strong>Note :</strong> Après validation de votre demande, vous recevrez un email avec les liens de téléchargement des fichiers audio.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}