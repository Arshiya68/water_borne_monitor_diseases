export const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const getRiskBadgeClass = (risk) => {
  const classes = {
    Low: 'bg-green-100 text-green-800 border-green-200',
    Medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    High: 'bg-red-100 text-red-800 border-red-200',
  }
  return classes[risk] || classes.Low
}

export const getWaterSourceLabel = (source) => {
  const labels = {
    0: 'Tap Water',
    1: 'Borewell',
    2: 'River',
    3: 'Pond',
  }
  return labels[source] || 'Unknown'
}