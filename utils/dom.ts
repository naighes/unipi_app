import { HTMLElement } from 'node-html-parser'

const tdVal = <T> (f: (e: HTMLElement) => T) => (columns: Array<HTMLElement>) => (i: number): T | undefined =>
    i < columns.length ? f(columns[i]) : undefined

export { tdVal }
