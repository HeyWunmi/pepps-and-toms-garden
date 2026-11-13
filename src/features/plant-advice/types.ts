// Local draft contract only. Future adapters may turn File objects into authorised
// Storage references before submitting to a backend. Never submit blob URLs.
export type PlantAdviceDraft = {
  plantId: string
  observations: string
  photos: File[]
  soilMoisture: 'unknown' | 'dry' | 'damp' | 'wet'
  adminReviewRequested: boolean
}
// Deliberately no transport, model response, diagnosis or submission status yet.
