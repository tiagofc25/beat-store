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

  async getByIds(ids: string[]): Promise<Beat[]> {
    if (ids.length === 0) return [];
    const supabase = createClient();
    const { data, error } = await supabase
      .from('beats')
      .select('*')
      .in('id', ids);

    if (error) throw new Error(error.message);
    return data || [];
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

  async searchBeats(params: {
    genre?: string;
    mood?: string;
    search?: string;
    bpmMin?: number;
    bpmMax?: number;
    page?: number;
    limit?: number;
    orderBy?: string;
  }): Promise<{ data: Beat[]; count: number }> {
    const supabase = createClient();
    let query = supabase.from('beats').select('*', { count: 'exact' });

    // Active
    query = query.eq('is_active', true);

    // Genre
    if (params.genre && params.genre !== 'Tous') {
      // Using .contains for array column
      query = query.contains('genre', [params.genre]);
    }

    // Mood
    if (params.mood && params.mood !== 'Tous') {
      query = query.contains('mood', [params.mood]);
    }

    // Search
    if (params.search) {
      // Simple searches on title for now (ilike)
      const searchTerm = `%${params.search}%`;
      query = query.ilike('title', searchTerm);
    }

    // BPM Range
    if (params.bpmMin !== undefined && params.bpmMin > 0) {
      query = query.gte('bpm', params.bpmMin);
    }
    if (params.bpmMax !== undefined && params.bpmMax > 0) {
      query = query.lte('bpm', params.bpmMax);
    }

    // Order
    if (params.orderBy) {
      const isDesc = params.orderBy.startsWith('-');
      const column = isDesc ? params.orderBy.slice(1) : params.orderBy;
      query = query.order(column, { ascending: !isDesc });
    }

    // Pagination
    const page = params.page || 0;
    const limit = params.limit || 12;
    const from = page * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;
    if (error) throw new Error(error.message);
    return { data: data || [], count: count || 0 };
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
