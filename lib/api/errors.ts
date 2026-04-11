export class ApiError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

export function handleApiError(error: unknown): Response {
  if (error instanceof ApiError) {
    return Response.json({ error: error.message }, { status: error.statusCode })
  }

  if (error instanceof Error) {
    console.error('Unhandled error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }

  console.error('Unknown error:', error)
  return Response.json({ error: 'An unexpected error occurred' }, { status: 500 })
}
