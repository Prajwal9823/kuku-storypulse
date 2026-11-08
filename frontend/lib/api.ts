import { RankedPromo, ShowSummary, NarrativeGraph, QualityControlReport, HumanFeedback } from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

export async function fetchSummary(showId: string = 'i_married_a_broken_soldier__he_was_a_duke'): Promise<ShowSummary> {
  const res = await fetch(`${API_BASE}/api/shows/${showId}/summary`, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`Failed to fetch summary: ${res.statusText}`);
  }
  return res.json();
}

export async function fetchPromos(
  showId: string = 'i_married_a_broken_soldier__he_was_a_duke',
  params?: {
    search?: string;
    episode?: number;
    arc?: string;
    category?: string;
    min_score?: number;
    sort_by?: string;
  }
): Promise<{ total: number; promos: RankedPromo[] }> {
  const query = new URLSearchParams();
  if (params?.search) query.set('search', params.search);
  if (params?.episode) query.set('episode', params.episode.toString());
  if (params?.arc) query.set('arc', params.arc);
  if (params?.category) query.set('category', params.category);
  if (params?.min_score) query.set('min_score', params.min_score.toString());
  if (params?.sort_by) query.set('sort_by', params.sort_by);

  const url = `${API_BASE}/api/shows/${showId}/promos?${query.toString()}`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`Failed to fetch promos: ${res.statusText}`);
  }
  return res.json();
}

export async function fetchPromoDetail(
  showId: string = 'i_married_a_broken_soldier__he_was_a_duke',
  promoId: string
): Promise<RankedPromo> {
  const res = await fetch(`${API_BASE}/api/shows/${showId}/promos/${promoId}`, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`Failed to fetch promo detail: ${res.statusText}`);
  }
  return res.json();
}

export async function sendFeedback(
  showId: string = 'i_married_a_broken_soldier__he_was_a_duke',
  promoId: string,
  feedback: Partial<HumanFeedback>
): Promise<{ status: string; promo_id: string; feedback: HumanFeedback }> {
  const res = await fetch(`${API_BASE}/api/shows/${showId}/promos/${promoId}/feedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(feedback),
  });
  if (!res.ok) {
    throw new Error(`Failed to update feedback: ${res.statusText}`);
  }
  return res.json();
}

export async function fetchNarrativeMap(
  showId: string = 'i_married_a_broken_soldier__he_was_a_duke'
): Promise<NarrativeGraph> {
  const res = await fetch(`${API_BASE}/api/shows/${showId}/narrative-map`, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`Failed to fetch narrative map: ${res.statusText}`);
  }
  return res.json();
}

export async function fetchQualityReport(
  showId: string = 'i_married_a_broken_soldier__he_was_a_duke'
): Promise<QualityControlReport> {
  const res = await fetch(`${API_BASE}/api/shows/${showId}/quality-control`, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`Failed to fetch quality control report: ${res.statusText}`);
  }
  return res.json();
}

export async function uploadScreenplayFile(formData: FormData): Promise<any> {
  const res = await fetch(`${API_BASE}/api/upload`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    throw new Error(`Upload failed: ${res.statusText}`);
  }
  return res.json();
}

