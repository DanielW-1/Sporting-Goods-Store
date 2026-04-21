export const formatPrice = (price) => {
  return `$${price.toFixed(2)}`
}

export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export const getStatusColor = (status) => {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  }
  return colors[status?.toLowerCase()] || 'bg-gray-100 text-gray-800'
}

export const getRoleLabel = (role) => {
  const labels = {
    customer: 'Customer',
    staff: 'Staff',
    inventory_staff: 'Inventory Staff',
    support_staff: 'Support Staff',
    driver: 'Driver',
    manager: 'Manager',
    admin: 'Administrator',
  }
  return labels[role] || role
}

export const cn = (...classes) => {
  return classes.filter(Boolean).join(' ')
}