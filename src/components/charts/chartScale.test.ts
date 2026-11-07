import { describe, expect, it } from 'vitest'
import { formatAxisNumber, niceMax, tickEvery } from './chartScale'

describe('chart scale', () => {
  it('rounds the axis top to a nice number', () => {
    expect(niceMax(0)).toBe(1)
    expect(niceMax(7)).toBe(10)
    expect(niceMax(18)).toBe(20)
    expect(niceMax(21)).toBe(25)
    expect(niceMax(430)).toBe(500)
    expect(niceMax(100)).toBe(100)
  })
  it('compacts axis numbers', () => {
    expect(formatAxisNumber(950)).toBe('950')
    expect(formatAxisNumber(1200)).toBe('1.2k')
    expect(formatAxisNumber(2000)).toBe('2k')
    expect(formatAxisNumber(12500)).toBe('13k')
    expect(formatAxisNumber(12.5)).toBe('12.5')
  })
  it('spaces x labels', () => {
    expect(tickEvery(7, 8)).toBe(1)
    expect(tickEvery(30, 8)).toBe(4)
  })
})
