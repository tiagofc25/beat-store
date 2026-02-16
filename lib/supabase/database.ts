import { createClient } from '@/lib/supabase/client';

export interface Beat {
  id: string;
  title: string;
  genre: string[];
  mood: string[];
  bpm: number;
  cover_art_url?: string;
  preview_audio_url: string;
  full_audio_url?: string;
  is_active?: boolean;
  created_date?: string;
}

export interface BeatRequest {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  instagram?: string;
  beat_ids: string[];
  beat_titles: string[];
  status: 'pending' | 'approved' | 'rejected' | 'partial';
  admin_notes?: string;
  created_date?: string;
}

// Beat operations
export const beatService = {
  async getById(id: string): Promise<Beat | null> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('beats')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw new Error(error.message);
    }
    return data;
  },

  async list(orderBy?: string): Promise<Beat[]> {
    const supabase = createClient();
    let query = supabase.from('beats').select('*');

    if (orderBy) {
      const isDesc = orderBy.startsWith('-');
      const column = isDesc ? orderBy.slice(1) : orderBy;
      query = query.order(column, { ascending: !isDesc });
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data || [];
  },

  async filter(filters: Partial<Beat>, orderBy?: string): Promise<Beat[]> {
    const supabase = createClient();
    let query = supabase.from('beats').select('*');

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        query = query.eq(key, value);
      }
    });

    if (orderBy) {
      const isDesc = orderBy.startsWith('-');
      const column = isDesc ? orderBy.slice(1) : orderBy;
      query = query.order(column, { ascending: !isDesc });
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data || [];
  },

  async create(beat: Omit<Beat, 'id' | 'created_date'>): Promise<Beat> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('beats')
      .insert([{ ...beat, created_date: new Date().toISOString() }])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  async update(id: string, updates: Partial<Beat>): Promise<Beat> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('beats')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  async delete(id: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase
      .from('beats')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
  },
};

// BeatRequest operations
export const beatRequestService = {
  async list(orderBy?: string): Promise<BeatRequest[]> {
    const supabase = createClient();
    let query = supabase.from('beat_requests').select('*');

    if (orderBy) {
      const isDesc = orderBy.startsWith('-');
      const column = isDesc ? orderBy.slice(1) : orderBy;
      query = query.order(column, { ascending: !isDesc });
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data || [];
  },

  async create(request: Omit<BeatRequest, 'id' | 'created_date'>): Promise<BeatRequest> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('beat_requests')
      .insert([{ ...request, created_date: new Date().toISOString() }])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  async update(id: string, updates: Partial<BeatRequest>): Promise<BeatRequest> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('beat_requests')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },
};
