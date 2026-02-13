export enum BeatRequestStatus {
    PENDING = "pending",
    APPROVED = "approved",
    REJECTED = "rejected",
    PARTIAL = "partial",
}

export interface BeatRequest {
    first_name: string;
    last_name: string;
    email: string;
    instagram?: string;
    beat_ids: string[];
    beat_titles: string[];
    status: BeatRequestStatus;
    admin_notes?: string;
}
