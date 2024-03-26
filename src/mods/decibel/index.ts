export class Indexed<T> {
  constructor(
    readonly index: Indexes,
    readonly value: T
  ) { }
}

export interface Data {
  readonly [key: string]: unknown
}

export interface Indexes {
  readonly [key: string]: number
}

export interface Filters {
  readonly [key: string]: unknown
}

export interface Orders {
  readonly [key: string]: Ordering
}

export type Ordering =
  | "ascending"
  | "descending"

export interface Order {
  readonly ascending: Indexed<Data>[]
  readonly descending: Indexed<Data>[]
}

export interface Index {
  readonly dataByValue: Map<unknown, Indexed<Data>[]>
}

export class Database {

  readonly resolver = new Map<Data, Indexed<Data>>()

  readonly orderByKey = new Map<string, Order>()
  readonly indexByKey = new Map<string, Index>()

  constructor() { }

  /**
   * Find the smallest set of rows based on the orders and filters.
   */
  #smallest(orders: Orders, filters: Filters) {
    let smallest = undefined

    for (const key in filters) {
      const index = this.indexByKey.get(key)

      if (index == null)
        return []

      const value = filters[key]

      const list = Array.isArray(value)
        ? value
        : [value]

      for (const subvalue of list) {
        const rows = index.dataByValue.get(subvalue)

        if (rows == null)
          return []

        if (smallest == null || (rows.length < smallest.length))
          smallest = rows
        continue
      }
    }

    for (const key in orders) {
      const order = this.orderByKey.get(key)

      if (order == null)
        return []

      const ordering = orders[key]
      const rows = order[ordering]

      if (smallest == null || (rows.length < smallest.length))
        smallest = rows
      continue
    }

    if (smallest == null)
      return []
    return smallest
  }

  get(orders: Orders, filters: Data) {
    const smallest = this.#smallest(orders, filters)

    return smallest.filter(x => {
      for (const key in filters) {
        if (filters[key] === x.value[key])
          continue
        if (typeof filters[key] !== typeof x.value[key])
          return false

        if (Array.isArray(filters[key])) {
          const a = filters[key] as unknown[]
          const b = x.value[key] as unknown[]

          for (const subvalue of a)
            if (!b.includes(subvalue))
              return false

          continue
        }

        return false
      }

      return true
    }).sort((a, b) => {
      for (const key in orders) {
        const ax = a.index[key]
        const bx = b.index[key]

        const d = orders[key] === "ascending"
          ? ax - bx
          : bx - ax

        if (d < 0n)
          return -1
        if (d > 0n)
          return 1
      }

      return 0
    }).map(x => x.value)
  }

  append(data: Data) {
    const index: Record<any, number> = {}

    const indexed = new Indexed(index, data)

    for (const key in data) {
      const number = Number(data[key])

      if (Number.isNaN(number) === false) {
        index[key] = number

        const order = this.orderByKey.get(key)

        if (order == null) {
          const ascending = [indexed]
          const descending = [indexed]

          this.orderByKey.set(key, { ascending, descending })
        } else {
          const { ascending, descending } = order

          ascending.push(indexed)
          ascending.sort((a, b) => {
            const ax = a.index[key]
            const bx = b.index[key]

            const d = ax - bx

            if (d < 0n)
              return -1
            if (d > 0n)
              return 1
            return 0
          })

          descending.push(indexed)
          descending.sort((a, b) => {
            const ax = a.index[key]
            const bx = b.index[key]

            const d = bx - ax

            if (d < 0n)
              return -1
            if (d > 0n)
              return 1
            return 0
          })
        }
      }

      {
        const index = this.indexByKey.get(key)

        if (index == null) {
          const dataByValue = new Map<unknown, Indexed<Data>[]>()

          const value = data[key]

          const list = Array.isArray(value)
            ? value
            : [value]

          for (const subvalue of list)
            dataByValue.set(subvalue, [indexed])

          this.indexByKey.set(key, { dataByValue })
        } else {
          const { dataByValue } = index

          const value = data[key]

          const list = Array.isArray(value)
            ? value
            : [value]

          for (const subvalue of list) {
            const rows = dataByValue.get(subvalue)

            if (rows == null) {
              dataByValue.set(subvalue, [indexed])
            } else {
              rows.push(indexed)
            }
          }
        }
      }
    }
  }

  remove(data: Data) {
    const indexed = this.resolver.get(data)

    if (indexed == null)
      return
    this.resolver.delete(data)

    for (const key in data) {
      if (typeof data[key] === "bigint") {
        const order = this.orderByKey.get(key)

        if (order != null) {
          const { ascending, descending } = order

          const i = ascending.indexOf(indexed)

          if (i !== -1)
            ascending.splice(i, 1)

          const j = descending.indexOf(indexed)

          if (j !== -1)
            descending.splice(j, 1)
        }
      }

      {
        const index = this.indexByKey.get(key)

        if (index != null) {
          const { dataByValue } = index

          const value = data[key]

          const list = Array.isArray(value)
            ? value
            : [value]

          for (const subvalue of list) {
            const rows = dataByValue.get(subvalue)

            if (rows != null) {
              const i = rows.indexOf(indexed)

              if (i !== -1)
                rows.splice(i, 1)
            }
          }
        }
      }
    }
  }

}