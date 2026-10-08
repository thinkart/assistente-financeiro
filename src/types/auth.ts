export interface User {
  id: string
  name: string
  email: string
  cpf: string
  phone: string
}

export interface RegisterPayload {
  name: string
  cpf: string
  email: string
  phone: string
  password: string
}

export interface AuthResponse {
  access_token: string
  token_type: 'Bearer'
}
