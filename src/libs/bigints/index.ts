export namespace BigInts {

  export function fromOrNull(value: any) {
    try {
      return BigInt(value)
    } catch { }
  }

}