/**
 * @description used to log nested things
 *
 * @param value - The object to log.
 * @returns The result of the log.
 */
export function log(value: string | Record<string, unknown> | unknown): string {
  let result = ''

  if (typeof value === 'object') {
    result += '{'

    // @ts-ignore
    const keys = Object.keys(value)
    const lastKey = keys[keys.length - 1]

    for (let key of keys) {
      result += `"${key}": `
      // @ts-ignore
      if (value[key] instanceof Set) {
        // @ts-ignore
        result += `[${Array.from(value[key].values()).join(',')}]`
        // @ts-ignore
      } else if (value[key] instanceof Array) {
        // @ts-ignore
        result += `[${value[key]
          .map((val: unknown): string => (log(val) ? log(val) : 'nothing'))
          .join(',')}]`
      } else {
        // @ts-ignore
        result += log(value[key])
      }
      if (key !== lastKey) result += ','
    }
    result += '}'
  } else if (typeof value === 'string') {
    result += `"${value}"`
  } else if (typeof value === 'function') {
    result += '"[Function]"'
  } else result += value

  return result
}
