import type { FC, ReactNode } from 'react'
import type { Item } from '../types'

interface Props {
  items: Item[]
}

interface StatCardProps {
  label: string
  value: number
  icon: ReactNode
  gradient: string
  iconBg: string
}

const StatCard: FC<StatCardProps> = ({ label, value, icon, gradient, iconBg }) => (
  <div className={`relative overflow-hidden rounded-2xl p-5 ${gradient} shadow-sm hover:shadow-md transition-shadow duration-200`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-3xl font-extrabold">{value}</p>
        <p className="text-sm font-medium opacity-80 mt-1">{label}</p>
      </div>
      <div className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center`}>
        {icon}
      </div>
    </div>
    {/* Decorative circle */}
    <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-white/10" />
  </div>
)

const StatsBar: FC<Props> = ({ items }) => {
  const total = items.length
  const lowStock = items.filter(i => i.quantity > 0 && i.quantity < 10).length
  const outOfStock = items.filter(i => i.quantity === 0).length

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 px-6 py-5">
      <StatCard
        label="Total Unique Items"
        value={total}
        gradient="bg-gradient-to-br from-blue-500 to-indigo-600 text-white"
        iconBg="bg-white/20"
        icon={
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        }
      />
      <StatCard
        label="Low on Stock"
        value={lowStock}
        gradient="bg-gradient-to-br from-amber-400 to-orange-500 text-white"
        iconBg="bg-white/20"
        icon={
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        }
      />
      <StatCard
        label="Out of Stock"
        value={outOfStock}
        gradient="bg-gradient-to-br from-rose-500 to-red-600 text-white"
        iconBg="bg-white/20"
        icon={
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
        }
      />
    </div>
  )
}

export default StatsBar
