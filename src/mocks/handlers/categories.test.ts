import { beforeEach, describe, expect, it } from 'vitest'
import type { Category } from '@/types'
import { resetCategoryStore } from './categories'

const API_URL = 'http://127.0.0.1:5000'

const getCategories = async () => {
  const response = await fetch(`${API_URL}/categories`)
  const payload = (await response.json()) as { data: Category[] }
  return { response, body: payload.data }
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

    const payload = (await response.json()) as {
      message: string
      data: Category
    }
    expect(payload.message).toBe('Categoria cadastrada com sucesso')
    const created = payload.data
    expect(created.id).toBeTruthy()
    expect(created.name).toBe('Pets')

    const { body } = await getCategories()
    expect(body.some((category) => category.id === created.id)).toBe(true)
  })

  it('rejeita categoria duplicada com 409', async () => {
    await sendJson('POST', '/categories', { name: 'Pets', type: 'expense' })

    const response = await sendJson('POST', '/categories', {
      name: 'Pets',
      type: 'expense',
    })

    expect(response.status).toBe(409)

    const body = (await response.json()) as { message: string }
    expect(body.message).toBe('Categoria já cadastrada')
  })

  it('rejeita payload inválido com 422', async () => {
    const withoutName = await sendJson('POST', '/categories', {
      type: 'expense',
    })
    expect(withoutName.status).toBe(422)

    const invalidType = await sendJson('POST', '/categories', {
      name: 'Pets',
      type: 'outro',
    })
    expect(invalidType.status).toBe(422)
  })

  it('atualiza uma categoria existente com 200', async () => {
    const response = await sendJson('PUT', '/categories/salario', {
      name: 'Salário CLT',
      type: 'income',
    })

    expect(response.status).toBe(200)

    const payload = (await response.json()) as {
      message: string
      data: Category
    }
    expect(payload.message).toBe('Categoria atualizada com sucesso')
    expect(payload.data.name).toBe('Salário CLT')

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

  it('retorna 422 ao atualizar com payload inválido', async () => {
    const response = await sendJson('PUT', '/categories/salario', {
      name: '',
      type: 'expense',
    })

    expect(response.status).toBe(422)
  })

  it('remove uma categoria sem vínculos com 200', async () => {
    const createResponse = await sendJson('POST', '/categories', {
      name: 'Pets',
      type: 'expense',
    })
    const created = ((await createResponse.json()) as { data: Category }).data

    const response = await fetch(`${API_URL}/categories/${created.id}`, {
      method: 'DELETE',
    })

    expect(response.status).toBe(200)

    const body = (await response.json()) as { message: string }
    expect(body.message).toBe('Categoria deletada com sucesso')

    const { body: categories } = await getCategories()
    expect(categories.some((category) => category.id === created.id)).toBe(false)
  })

  it('bloqueia a remoção de categoria em uso com 409', async () => {
    const response = await fetch(`${API_URL}/categories/educacao`, {
      method: 'DELETE',
    })

    expect(response.status).toBe(409)

    const body = (await response.json()) as { message: string }
    expect(body.message).toMatch(/não pode ser excluída/i)

    const { body: categories } = await getCategories()
    expect(categories.some((category) => category.id === 'educacao')).toBe(true)
  })

  it('retorna 404 ao remover categoria inexistente', async () => {
    const response = await fetch(`${API_URL}/categories/nao-existe`, {
      method: 'DELETE',
    })

    expect(response.status).toBe(404)
  })
})
