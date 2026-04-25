import React from 'react'
import { useNavigate } from 'react-router-dom'

const categories = [
  { id: 1, name: 'Football', image: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=80&h=80&fit=crop' },
  { id: 2, name: 'Fitness', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=80&h=80&fit=crop' },
  { id: 3, name: 'Tennis', image: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=80&h=80&fit=crop' },
  { id: 4, name: 'Running', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=80&h=80&fit=crop' },
  { id: 5, name: 'Basketball', image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=80&h=80&fit=crop' },
  { id: 6, name: 'Cycling', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=80&h=80&fit=crop' },
  { id: 7, name: 'Hiking', image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=80&h=80&fit=crop' },
  { id: 8, name: 'Yoga', image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=80&h=80&fit=crop' },
]

const CategoryBar = ({ selectedCategory, onSelectCategory }) => {
  const navigate = useNavigate()

const handleClick = (cat) => {
  if (onSelectCategory) onSelectCategory(cat.name)
  navigate(`/products?category=${encodeURIComponent(cat.name)}`)
}
  return (
    <div className="bg-white border-b border-gray-200 overflow-x-auto scrollbar-hide">
      <div className="flex px-8">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => handleClick(cat)}
            className={`flex flex-col items-center gap-1 py-3 px-5 border-b-3 transition-all flex-shrink-0 ${
              selectedCategory === cat.name
                ? 'border-orange-600'
                : 'border-transparent hover:border-blue-300'
            }`}
          >
            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 transition-transform hover:scale-105">
              <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
            </div>
            <span className={`font-barlow-condensed text-[11px] font-bold uppercase whitespace-nowrap ${
              selectedCategory === cat.name ? 'text-orange-600' : 'text-gray-500'
            }`}>
              {cat.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default CategoryBar