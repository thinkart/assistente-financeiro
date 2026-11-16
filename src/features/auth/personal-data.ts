import type { ChangeEvent, ChangeEventHandler } from 'react'

export const onlyDigits = (value: string) => value.replace(/\D/g, '')

export const normalizePersonalData = (value: string) => onlyDigits(value)

export const formatCpf = (value: string) => {
  const digits = onlyDigits(value).slice(0, 11)
  const first = digits.slice(0, 3)
  const second = digits.slice(3, 6)
  const third = digits.slice(6, 9)
  const fourth = digits.slice(9)
  const groups = [first, second, third].filter(Boolean).join('.')

  return fourth ? `${groups}-${fourth}` : groups
}

export const formatPhone = (value: string) => {
  const digits = onlyDigits(value).slice(0, 11)
  if (!digits) return ''

  const areaCode = digits.slice(0, 2)
  if (digits.length <= 2) {
    return `(${areaCode}${digits.length === 2 ? ') ' : ''}`
  }

  const subscriber = digits.slice(2)
  const splitAt = digits.length <= 10 ? 4 : 5
  const firstPart = subscriber.slice(0, splitAt)
  const secondPart = subscriber.slice(splitAt)

  return `(${areaCode}) ${firstPart}${secondPart ? `-${secondPart}` : ''}`
}

const validAreaCodes = new Set([
  '11', '12', '13', '14', '15', '16', '17', '18', '19',
  '21', '22', '24', '27', '28', '31', '32', '33', '34', '35', '37', '38',
  '41', '42', '43', '44', '45', '46', '47', '48', '49', '51', '53', '54',
  '55', '61', '62', '63', '64', '65', '66', '67', '68', '69', '71', '73',
  '74', '75', '77', '79', '81', '82', '83', '84', '85', '86', '87', '88',
  '89', '91', '92', '93', '94', '95', '96', '97', '98', '99',
])

export const isValidCpf = (value: string) => {
  if (!/^[\d.\-\s]+$/.test(value)) return false
  const digits = onlyDigits(value)
  if (!/^\d{11}$/.test(digits) || /^([0-9])\1{10}$/.test(digits)) {
    return false
  }

  const calculateDigit = (length: number) => {
    let sum = 0
    for (let index = 0; index < length; index += 1) {
      sum += Number(digits[index]) * (length + 1 - index)
    }
    const remainder = sum % 11
    return remainder < 2 ? 0 : 11 - remainder
  }

  return (
    calculateDigit(9) === Number(digits[9]) &&
    calculateDigit(10) === Number(digits[10])
  )
}

export const isValidPhone = (value: string) => {
  if (!/^[\d()\-\s]+$/.test(value)) return false
  const digits = onlyDigits(value)
  if (digits.length !== 10 && digits.length !== 11) return false
  if (!validAreaCodes.has(digits.slice(0, 2))) return false

  const subscriber = digits.slice(2)
  return digits.length === 10
    ? /^[2-5]\d{7}$/.test(subscriber)
    : /^9\d{8}$/.test(subscriber)
}

const cursorAfterDigits = (value: string, digitsBeforeCaret: number) => {
  if (digitsBeforeCaret === 0) return 0

  let digitCount = 0
  for (let index = 0; index < value.length; index += 1) {
    if (/\d/.test(value[index])) digitCount += 1
    if (digitCount === digitsBeforeCaret) return index + 1
  }

  return value.length
}

export const handleMaskedInputChange = (
  event: ChangeEvent<HTMLInputElement>,
  onChange: ChangeEventHandler<HTMLInputElement>,
  formatter: (value: string) => string,
) => {
  const input = event.currentTarget
  const selectionStart = input.selectionStart
  const digitsBeforeCaret = onlyDigits(
    input.value.slice(0, selectionStart ?? input.value.length),
  ).length

  input.value = formatter(input.value)
  onChange(event)

  if (selectionStart !== null) {
    const nextCaret = cursorAfterDigits(input.value, digitsBeforeCaret)
    input.setSelectionRange(nextCaret, nextCaret)
  }
}