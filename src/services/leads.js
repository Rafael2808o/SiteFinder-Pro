import { supabase } from '../lib/supabase'

function mapRow(row) {
  return {
    id: row.id,
    userId: row.user_id,
    placeId: row.place_id,
    name: row.name,
    category: row.category,
    phone: row.phone,
    whatsapp: row.whatsapp,
    address: row.address,
    city: row.city,
    instagram: row.instagram,
    website: row.website,
    rating: row.rating,
    reviewCount: row.review_count,
    status: row.status,
    notes: row.notes ?? '',
    leadScore: row.lead_score,
    leadScoreReason: row.lead_score_reason ?? '',
    latitude: row.latitude,
    longitude: row.longitude,
    mapUrl: row.map_url,
    createdAt: row.created_at,
    lastContactAt: row.last_contact_at,
  }
}

export async function listLeads() {
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []).map(mapRow)
}

export async function addLeadFromCompany(company) {
  const { data: userData } = await supabase.auth.getUser()
  const userId = userData.user?.id
  if (!userId) throw new Error('Usuário não autenticado.')

  const { data, error } = await supabase
    .from('leads')
    .insert({
      user_id: userId,
      place_id: company.placeId,
      name: company.name,
      category: company.category,
      phone: company.phone,
      whatsapp: company.phone,
      address: company.address,
      city: company.city,
      instagram: company.instagram,
      website: company.website,
      rating: company.rating,
      review_count: company.reviewCount,
      status: 'novo',
      notes: '',
      lead_score: company.leadScore,
      lead_score_reason: company.leadScoreReason,
      latitude: company.latitude,
      longitude: company.longitude,
      map_url: company.mapUrl,
    })
    .select('*')
    .single()
  if (error) throw new Error(error.message)
  return mapRow(data)
}

export async function updateLeadStatus(id, status) {
  const { error } = await supabase
    .from('leads')
    .update({ status, last_contact_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw new Error(error.message)
}

export async function updateLeadNotes(id, notes) {
  const { error } = await supabase.from('leads').update({ notes }).eq('id', id)
  if (error) throw new Error(error.message)
}

export async function deleteLead(id) {
  const { error } = await supabase.from('leads').delete().eq('id', id)
  if (error) throw new Error(error.message)
}
