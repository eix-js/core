//! util for generating random numbers

const { random: rand, floor } = Math;

/**
 * @description Generates a random number between min and max.
 *
 * @param min - The min val for the int.
 * @param max - The max val for the int.
 * @returns The random number.
 */
export const random = (min: number, max: number): number => floor(rand() * (max - min)) + min;
