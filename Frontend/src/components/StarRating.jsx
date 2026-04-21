import React from 'react'

const StarRating = ({ rating, onRating, size = 'sm', interactive = false }) => {
  const stars = []
  const fullStars = Math.floor(rating)
  const hasHalfStar = rating % 1 >= 0.5

  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  }

  const starClass = sizeClasses[size]

  for (let i = 1; i <= 5; i++) {
    let fill = 'none'
    if (i <= fullStars) fill = 'full'
    else if (i === fullStars + 1 && hasHalfStar) fill = 'half'

    stars.push(
      <button
        key={i}
        type="button"
        onClick={() => interactive && onRating?.(i)}
        className={interactive ? 'cursor-pointer' : 'cursor-default'}
        disabled={!interactive}
      >
        <svg
          className={`${starClass} ${
            fill === 'full'
              ? 'fill-orange-500 stroke-orange-500'
              : fill === 'half'
              ? 'fill-orange-500 stroke-orange-500'
              : 'fill-gray-200 stroke-gray-300'
          }`}
          viewBox="0 0 20 20"
        >
          <path
            d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
            fillRule="evenodd"
          />
        </svg>
      </button>
    )
  }

  return <div className="flex gap-0.5">{stars}</div>
}

export default StarRating