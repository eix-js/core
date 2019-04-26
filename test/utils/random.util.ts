//!util for random numbers

//i like to do this...
const { random: rand, floor } = Math

/**
 * Generates a random number between min and max
 * @param min the min val for the int
 * @param max the max val for the int
 */
export const random = (min: number, max: number): number =>
    floor(rand() * (max - min)) + min

