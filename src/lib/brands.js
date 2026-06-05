import { supabase } from './supabase'

export const Brands = {
  async list() {
    const { data, error } = await supabase
      .from('brands')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message || 'Failed to fetch brands')
    return data || []
  },

  async get(id) {
    const { data, error } = await supabase
      .from('brands')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw new Error(error.message || 'Failed to fetch brand')
    return data
  },

  async create(brand) {
    const { data, error } = await supabase
      .from('brands')
      .insert([brand])
      .select()
      .single()

    if (error) throw new Error(error.message || 'Failed to create brand')
    return data
  },

  async update(id, brand) {
    const { data, error } = await supabase
      .from('brands')
      .update(brand)
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(error.message || 'Failed to update brand')
    return data
  },

  async delete(id) {
    const { error } = await supabase
      .from('brands')
      .delete()
      .eq('id', id)

    if (error) throw new Error(error.message || 'Failed to delete brand')
    return true
  },
}
