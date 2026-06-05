import { supabase } from './supabase'

const normalizeProduct = (product) => {
  const images = product.image_urls ?? product.images ?? []
  return {
    ...product,
    images,
    image_urls: images,
    brand_name: product.brands?.name ?? product.brand_name ?? '',
    category_name: product.categories?.name ?? product.category_name ?? '',
  }
}

export const Products = {
  async list(filters = {}) {
    let query = supabase
      .from('products')
      .select('*, categories(id,name,slug), brands(id,name)')
      .order('created_at', { ascending: false })

    // apply simple filters
    if (filters.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active)
    }
    if (filters.brand_id) {
      query = query.eq('brand_id', filters.brand_id)
    }
    if (filters.category_id) {
      query = query.eq('category_id', filters.category_id)
    }
    if (filters.category_slug) {
      // filter by related category slug
      query = query.eq('categories.slug', filters.category_slug)
    }
    if (filters.slug) {
      query = query.eq('slug', filters.slug)
    }
    if (filters.is_featured !== undefined) {
      query = query.eq('is_featured', filters.is_featured)
    }
    if (filters.search) {
      query = query.ilike('name', `%${filters.search}%`)
    }

    const { data, error } = await query

    console.log('Products.list ->', { filters, data, error })

    if (error) throw new Error(error.message || 'Failed to fetch products')
    return (data || []).map(normalizeProduct)
  },

  async get(id) {
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(id,name), brands(id,name)')
      .eq('id', id)
      .single()

    if (error) throw new Error(error.message || 'Failed to fetch product')
    return normalizeProduct(data)
  },

  async create(product) {
    const { brand_name, category_name, brands, categories, images, ...rest } = product
    const payload = {
      ...rest,
      category_id: rest.category_id || null,
      brand_id: rest.brand_id || null,
      image_urls: rest.image_urls ?? [],
    }

    const { data, error } = await supabase
      .from('products')
      .insert([payload])
      .select()
      .single()

    if (error) throw new Error(error.message || 'Failed to create product')
    return normalizeProduct(data)
  },

  async update(id, product) {
    const { brand_name, category_name, brands, categories, images, ...rest } = product
    const payload = {
      ...rest,
      category_id: rest.category_id || null,
      brand_id: rest.brand_id || null,
      image_urls: rest.image_urls ?? [],
    }

    const { data, error } = await supabase
      .from('products')
      .update(payload)
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(error.message || 'Failed to update product')
    return normalizeProduct(data)
  },

  async delete(id) {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)

    if (error) throw new Error(error.message || 'Failed to delete product')
    return true
  },
}
