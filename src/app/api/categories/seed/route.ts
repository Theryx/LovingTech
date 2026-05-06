import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase/server'
import { isAdmin } from '@/lib/api-auth'

const NEW_CATEGORIES = [
  {
    slug: 'keyboards',
    label_en: 'Keyboards',
    label_fr: 'Claviers',
    description_en: 'Mechanical, wireless, and gaming keyboards from Logitech and Keychron. Perfect for productivity and gaming.',
    description_fr: 'Claviers mécaniques, sans fil et gaming de Logitech et Keychron. Parfaits pour la productivité et le gaming.',
    image_url: null,
  },
  {
    slug: 'mice',
    label_en: 'Mice',
    label_fr: 'Souris',
    description_en: 'Precision mice for work and gaming. Includes Logitech, Razer, SteelSeries, and Corsair brands.',
    description_fr: 'Souris de précision pour le travail et le gaming. Inclut Logitech, Razer, SteelSeries et Corsair.',
    image_url: null,
  },
  {
    slug: 'audio',
    label_en: 'Audio',
    label_fr: 'Audio',
    description_en: 'Speakers, headphones, headsets and earbuds from JBL, HyperX, SteelSeries and Razer.',
    description_fr: 'Enceintes, casques, micros et écouteurs de JBL, HyperX, SteelSeries et Razer.',
    image_url: null,
  },
  {
    slug: 'charging-power',
    label_en: 'Charging & Power',
    label_fr: 'Chargeurs & Power',
    description_en: 'USB cables, wall chargers, power banks, and adapters. Trusted brands like Anker.',
    description_fr: 'Câbles USB, chargeurs secteur, batteries externes et adaptateurs. Marques de confiance comme Anker.',
    image_url: null,
  },
  {
    slug: 'gaming',
    label_en: 'Gaming',
    label_fr: 'Gaming',
    description_en: 'Complete gaming peripheral setups. Headsets, mice, keyboards and accessories from Razer, SteelSeries, Corsair and HyperX.',
    description_fr: 'Équipements gaming complets. Casques, souris, claviers et accessoires de Razer, SteelSeries, Corsair et HyperX.',
    image_url: null,
  },
  {
    slug: 'accessories',
    label_en: 'Accessories',
    label_fr: 'Accessoires',
    description_en: 'Mouse pads, keyboard stands, cable management, protective cases and other essential tech accessories.',
    description_fr: 'Tapis de souris, supports clavier, gestion des câbles, coques de protection et autres accessoires tech essentiels.',
    image_url: null,
  },
]

export async function POST(request: NextRequest) {
  // Check admin authentication
  if (!(await isAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = getSupabaseServer()

    // Delete all existing categories
    const { error: deleteError } = await supabase
      .from('categories')
      .delete()
      .neq('slug', '') // Delete all rows

    if (deleteError) {
      console.error('Error deleting categories:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete existing categories', details: deleteError.message },
        { status: 500 }
      )
    }

    // Insert new categories
    const { data, error: insertError } = await supabase
      .from('categories')
      .insert(NEW_CATEGORIES)
      .select()

    if (insertError) {
      console.error('Error inserting categories:', insertError)
      return NextResponse.json(
        { error: 'Failed to insert new categories', details: insertError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Seeded ${NEW_CATEGORIES.length} categories successfully`,
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
