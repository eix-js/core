const errorRange = 1

export const flatLineIntersection = (
    x1: number,
    l1: number,
    x2: number,
    l2: number
): boolean => {
    return (
        (x1 > x2 && x1 < x2 + l2) ||
        (x1 + l1 - errorRange > x2 && x1 + l1 + errorRange < x2 + l2) ||
        (x1 <= x2 && x1 + l1 >= x2 + l2)
    )
}

export const pointOnFlatLine = (
    x1: number,
    x2: number,
    l2: number
): boolean => {
    return x1 > x2 && x1 < x2 + l2
}
