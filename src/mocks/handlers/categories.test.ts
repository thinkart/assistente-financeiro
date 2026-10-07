import { beforeEach, describe, expect, it } from 'vitest'
import type { Category } from '@/types'
import { resetCategoryStore } from './categories'

const API_URL = 'http://127.0.0.1:5000'

const getCategories = async () => {
  const response = await fetch(`${API_URL}/categories`)
  return { response, body: (await response.json()) as Category[] }
}

const sendJson = (method: string, path: string, body: unknown) =>
  fetch(`${API_URL}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

describe('handlers de categorias (AC-005)', () => {
  beforeEach(() => {
    resetCategoryStore()
  })

  it('lista as categorias com 200', async () => {
    const { response, body } = await getCategories()

    expect(response.status).toBe(200)
    expect(body.length).toBeGreaterThanOrEqual(6)
    expect(body.some((category) => category.name === 'Salário')).toBe(true)
  })

  it('cria uma categoria com 201 e a inclui na listagem', async () => {
    const response = await sendJson('POST', '/categories', {
      name: 'Pets',
      type: 'expense',
    })

    expect(response.status).toBe(201)

    const created = (await response.json()) as Category
    expect(created.id).toBeTruthy()
    expect(created.name).toBe('Pets')

    const { body } = await getCategories()
    expect(body.some((category) => category.id === created.id)).toBe(true)
  })

  it('rejeita payload inválido com 400', async () => {
    const withoutName = await sendJson('POST', '/categories', {
      type: 'expense',
    })
    expect(withoutName.status).toBe(400)

    const invalidType = await sendJson('POST', '/categories', {
      name: 'Pets',
      type: 'outro',
    })
    expect(invalidType.status).toBe(400)
  })

  it('atualiza uma categoria existente com 200', async () => {
    const response = await sendJson('PUT', '/categories/salario', {
      name: 'Salário CLT',
      type: 'income',
    })

    expect(response.status).toBe(200)

    const updated = (await response.json()) as Category
    expect(updated.name).toBe('Salário CLT')

    const { body } = await getCategories()
    expect(body.find((category) => category.id === 'salario')?.name).toBe(
      'Salário CLT',
    )
  })

  it('retorna 404 ao atualizar categoria inexistente', async () => {
    const response = await sendJson('PUT', '/categories/nao-existe', {
      name: 'Fantasma',
      type: 'expense',
    })

    expect(response.status).toBe(404)
  })

  it('retorna 400 ao atualizar com payload inválido', async () => {
    const response = await sendJson('PUT', '/categories/salario', {
      name: '',
      type: 'expense',
    })

    expect(response.status).toBe(400)
  })

  it('remove uma categoria com 204', async () => {
    const response = await fetch(`${API_URL}/categories/educacao`, {
      method: 'DELETE',
    })

    expect(response.status).toBe(204)

    const { body } = await getCategories()
    expect(body.some((category) => category.id === 'educacao')).toBe(false)
  })

  it('retorna 404 ao remover categoria inexistente', async () => {
    const response = await fetch(`${API_URL}/categories/nao-existe`, {
      method: 'DELETE',
    })

    expect(response.status).toBe(404)
  })
})
