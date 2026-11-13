// Fictional, fixed examples for UI review. These are never customer records.
export type PlantOrigin = 'Nursery' | 'Personal'
export const plants: { id: string; name: string; variety: string; origin: PlantOrigin; stage: string; location: string }[] = [
  { id: 'tomato', name: 'Cherry tomato', variety: 'Solanum lycopersicum', origin: 'Nursery', stage: 'Flowering', location: 'Patio' },
  { id: 'pepper', name: 'Sweet pepper', variety: 'Capsicum annuum', origin: 'Nursery', stage: 'Growing', location: 'Raised bed' },
  { id: 'basil', name: 'Sweet basil', variety: 'Ocimum basilicum', origin: 'Personal', stage: 'Established', location: 'Kitchen window' },
]
export type TaskStatus = 'Upcoming' | 'Completed' | 'Overdue'
export const tasks: { title: string; plant: string; date: string; status: TaskStatus; detail: string }[] = [
  { title: 'Check soil moisture', plant: 'Cherry tomato', date: '2026-11-14', status: 'Upcoming', detail: 'Check the soil before deciding whether to water.' },
  { title: 'Inspect new leaves', plant: 'Sweet pepper', date: '2026-11-16', status: 'Upcoming', detail: 'Look for changes in colour and signs of pests.' },
  { title: 'Check pot drainage', plant: 'Sweet basil', date: '2026-11-12', status: 'Overdue', detail: 'Example overdue task. No notification has been sent.' },
  { title: 'Record growth stage', plant: 'Cherry tomato', date: '2026-11-10', status: 'Completed', detail: 'Example completed task for this interface preview.' },
]
export const shortDate = (value: string) => new Date(value + 'T12:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
