import { isClientMessage } from '../app.js'

describe('isClientMessage', () => {
  it('returns true for valid ring message', () => {
    expect(isClientMessage({ event: 'ring' })).toBe(true)
  })

  it('returns false for unknown event', () => {
    expect(isClientMessage({ event: 'ding-dong' })).toBe(false)
    expect(isClientMessage({ event: 'foo' })).toBe(false)
  })

  it('returns false for non-object values', () => {
    expect(isClientMessage(null)).toBe(false)
    expect(isClientMessage(undefined)).toBe(false)
    expect(isClientMessage(42)).toBe(false)
    expect(isClientMessage('ring')).toBe(false)
  })

  it('returns false for objects missing event field', () => {
    expect(isClientMessage({})).toBe(false)
    expect(isClientMessage({ event: 123 })).toBe(false)
    expect(isClientMessage({ type: 'ring' })).toBe(false)
  })
})
