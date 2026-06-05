import { supabase } from './supabase'

export const Categories = {
  async list() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(error.message || 'Failed to fetch categories')
    }

    return data || []
  },

  async get(id) {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      throw new Error(error.message || 'Failed to fetch category')
    }

    return data
  },

  async create(category) {
    const { data, error } = await supabase
      .from('categories')
      .insert([category])
      .select()

    if (error) {
      throw new Error(error.message || 'Failed to create category')
    }

    return data?.[0] || null
  },

  async update(id, category) {
    const { id: _, created_at, ...updateData } = category

    const { data, error } = await supabase
      .from('categories')
      .update(updateData)
      .eq('id', id)
      .select()

    if (error) {
      throw new Error(error.message || 'Failed to update category')
    }

    return data?.[0] || null
  },

  async delete(id) {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(error.message || 'Failed to delete category')
    }

    return true
  }
}