export enum BeatGenre {
    HIP_HOP = "Hip-Hop",
    TRAP = "Trap",
    RNB = "R&B",
    POP = "Pop",
    DRILL = "Drill",
    AFROBEAT = "Afrobeat",
    LO_FI = "Lo-Fi",
    BOOM_BAP = "Boom Bap",
    DANCEHALL = "Dancehall",
    ELECTRONIC = "Electronic",
}

export enum BeatMood {
    ENERGETIC = "Energique",
    MELANCHOLIC = "Mélancolique",
    AGGRESSIVE = "Agressif",
    CHILL = "Chill",
    DARK = "Sombre",
    HAPPY = "Joyeux",
    EPIC = "Épique",
    ROMANTIC = "Romantique",
    MYSTERIOUS = "Mystérieux",
}

export interface Beat {
    title: string;
    bpm: number;
    genre: BeatGenre[];
    mood: BeatMood[];
    cover_art_url?: string;
    preview_audio_url: string;
    full_audio_url?: string;
    is_active?: boolean;
}
