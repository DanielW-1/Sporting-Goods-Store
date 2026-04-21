import React from 'react'

const LoadingSpinner = ({ size = 'md' }) => {
  const sizes = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }

  return (
    <div className="flex justify-center items-center">
      <div
        className={`${sizes[size]} border-4 border-gray-200 border-t-orange-600 rounded-full animate-spin`}
      />
    </div>
  )
}

export default LoadingSpinner