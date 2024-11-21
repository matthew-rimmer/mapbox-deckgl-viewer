import type { DeckGlSubjects } from "./deckgl-types";

export type MapDeckViewerSubjects = DeckGlSubjects;

export const mapDeckViewerSubjectsNames: (keyof MapDeckViewerSubjects)[] = [
	"$onLumaGlWarning",
	"$onModelFailedToLoad",
	"$renderingSceneFinshed",
	"$testing",
	"$testingResult",
	"$onModelStatsFinished"
] as const;

export interface MapDeckViewOptions {
	mapboxAccessKey: string;
	mapElement: HTMLDivElement;
	subjects?: Partial<MapDeckViewerSubjects>;
}

export type EngineType = "mapbox" | "deckgl";

export interface Orientation {
	x?: number;
	y?: number;
	z?: number;
};