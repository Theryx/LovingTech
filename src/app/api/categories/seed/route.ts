import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase/server'
import { isAdmin } from '@/lib/api-auth'

const NEW_CATEGORIES = [
  { slug: 'keyboards', label_en: 'Keyboards', label_fr: 'Claviers', image_url: null },
  { slug: 'mice', label_en: 'Mice', label_fr: 'Souris', image_url: null },
  { slug: 'audio', label_en: 'Audio', label_fr: 'Audio', image_url: null },
  { slug: 'charging-power', label_en: 'Charging & Power', label_fr: 'Chargeurs & Power', image_url: null },
  { slug: 'gaming', label_en: 'Gaming', label_fr: 'Gaming', image_url: null },
  { slug: 'accessories', label_en: 'Accessories', label_fr: 'Accessoires', image_url: null },
]

const DESCRIPTIONS: Record<string, { en: string; fr: string }> = {
  keyboards: {
    en: 'Mechanical, wireless, and gaming keyboards from Logitech and Keychron. Perfect for productivity and gaming.',
    fr: 'Claviers mécaniques, sans fil et gaming de Logitech et Keychron. Parfaits pour la productivité et le gaming.',
  },
  mice: {
    en: 'Precision mice for work and gaming. Includes Logitech, Razer, SteelSeries, and Corsair brands.',
    fr: 'Souris de précision pour le travail et le gaming. Inclut Logitech, Razer, SteelSeries et Corsair.',
  },
  audio: {
    en: 'Speakers, headphones, headsets and earbuds from JBL, HyperX, SteelSeries and Razer.',
    fr: 'Enceintes, casques, micros et écouteurs de JBL, HyperX, SteelSeries et Razer.',
  },
  'charging-power': {
    en: 'USB cables, wall chargers, power banks, and adapters. Trusted brands like Anker.',
    fr: 'Câbles USB, chargeurs secteur, batteries externes et adaptateurs. Marques de confiance comme Anker.',
  },
  gaming: {
    en: 'Complete gaming peripheral setups. Headsets, mice, keyboards and accessories from Razer, SteelSeries, Corsair and HyperX.',
    fr: 'Équipements gaming complets. Casques, souris, claviers et accessoires de Razer, SteelSeries, Corsair et HyperX.',
  },
  accessories: {
    en: 'Mouse pads, keyboard stands, cable management, protective cases and other essential tech accessories.',
    fr: 'Tapis de souris, supports clavier, gestion des câbles, coques de protection et autres accessoires tech essentiels.',
  },
}

export async function POST(request: NextRequest) {
  if (!(await isAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = getSupabaseServer()

    // Delete existing categories first
    const { error: deleteError, count: deletedCount } = await supabase
      .from('categories')
      .delete({ count: 'exact' })
      .not('slug', 'is', null)

    if (deleteError) {
      console.error('Error deleting categories:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete existing categories', details: deleteError.message },
        { status: 500 }
      )
    }

    // Upsert new categories (insert or update on slug conflict)
    const { data, error: upsertError } = await supabase
      .from('categories')
      .upsert(NEW_CATEGORIES, { onConflict: 'slug' })
      .select()

    if (upsertError) {
      console.error('Error upserting categories:', upsertError)
      return NextResponse.json(
        { error: 'Failed to insert new categories', details: upsertError.message },
        { status: 500 }
      )
    }

    // Try updating descriptions (may fail silently if columns don't exist yet)
    for (const cat of NEW_CATEGORIES) {
      const desc = DESCRIPTIONS[cat.slug]
      if (desc) {
        const { error: updateError } = await supabase
          .from('categories')
          .update({
            description_en: desc.en,
            description_fr: desc.fr,
            updated_at: new Date().toISOString(),
          })
          .eq('slug', cat.slug)

        if (updateError && updateError.code !== '42703') {
          console.warn(`Failed to set description for ${cat.slug}:`, updateError.message)
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Seeded ${data?.length || NEW_CATEGORIES.length} categories (deleted ${deletedCount ?? '?'} old)`,
      categories: data,
    })
  } catch (err: any) {
    console.error('Seed error:', err)
    return NextResponse.json(
      { error: 'Internal server error', details: err.message },
      { status: 500 }
    )
  }
}
