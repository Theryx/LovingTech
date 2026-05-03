'use client'

import { useLanguage } from '@/context/LanguageContext'
import { Wifi, Battery, Scale, Ruler, Clock, Shield } from 'lucide-react'

interface ProductSpecsProps {
  specs: Record<string, string>
  keySpecs?: string[]
}

const specIcons: Record<string, React.ReactNode> = {
  connectivity: <Wifi className="h-5 w-5" />,
  battery: <Battery className="h-5 w-5" />,
  weight: <Scale className="h-5 w-5" />,
  dimensions: <Ruler className="h-5 w-5" />,
  warranty: <Shield className="h-5 w-5" />,
  'battery life': <Clock className="h-5 w-5" />,
}

function getSpecIcon(key: string): React.ReactNode {
  const lowerKey = key.toLowerCase()
  for (const [spec, icon] of Object.entries(specIcons)) {
    if (lowerKey.includes(spec)) {
      return icon
    }
  }
  return <div className="h-5 w-5 rounded-full bg-brand-blue/20" />
}

export default function ProductSpecs({ specs, keySpecs = [] }: ProductSpecsProps) {
  const { t } = useLanguage()
  const specEntries = Object.entries(specs)

  // Filter to only show key specs that exist in specs
  const validKeySpecs = keySpecs.filter(key => specs[key] !== undefined).slice(0, 4)

  if (specEntries.length === 0) {
    return (
      <p className="text-sm text-brand-dark/40">
        {t({ en: 'No specifications available', fr: 'Aucune spécification disponible' })}
      </p>
    )
  }

  return (
    <div className="space-y-8">
      {/* Key Specifications Cards */}
      {validKeySpecs.length > 0 && (
        <div>
          <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-brand-blue">
            {t({ en: 'Key Specifications', fr: 'Spécifications clés' })}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {validKeySpecs.map(key => (
              <div
                key={key}
                className="rounded-xl border border-brand-grey/20 bg-white p-4 shadow-sm"
              >
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-brand-blue/10 text-brand-blue">
                  {getSpecIcon(key)}
                </div>
                <p className="mb-1 text-xs uppercase tracking-wider text-brand-dark/60">
                  {key}
                </p>
                <p className="font-semibold text-brand-dark text-sm">{specs[key]}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Full Specifications Table */}
      <div>
        <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-brand-blue">
          {t({ en: 'Full Specifications', fr: 'Spécifications complètes' })}
        </h3>
        <div className="overflow-hidden rounded-xl border border-brand-grey/20">
          <table className="w-full">
            <thead className="bg-brand-blue/10">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-brand-blue">
                  {t({ en: 'Specification', fr: 'Spécification' })}
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-brand-blue">
                  {t({ en: 'Value', fr: 'Valeur' })}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-grey/20">
              {specEntries.map(([key, value], index) => (
                <tr
                  key={key}
                  className={index % 2 === 0 ? 'bg-white' : 'bg-brand-grey/5'}
                >
                  <td className="px-4 py-3 text-sm font-medium text-brand-dark capitalize">
                    {key}
                  </td>
                  <td className="px-4 py-3 text-sm text-brand-dark/70">
                    {value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
