import { HttpResponse } from 'msw'

export const errorResponse = (status: number, message: string) =>
  HttpResponse.json({ message }, { status })

export const validationErrorResponse = (message: string) =>
  HttpResponse.json({ detail: [{ msg: message }] }, { status: 422 })
