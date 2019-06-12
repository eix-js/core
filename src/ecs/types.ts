/**
 * The id of any entity id. Used as the keys for the map from the ecs class
 */
export type entityId = string | number

/**
 * The base interface for entities (probably proxified ost of the time)
 */
export interface Entity {
	[key: string]: unknown;
}
