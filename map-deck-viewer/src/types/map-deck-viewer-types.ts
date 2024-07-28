import type { DeckGlSubjects } from "./deckgl-types";
import type { MapboxSubjects } from "./mapbox-types";

export type MapDeckViewerSubjects = DeckGlSubjects & MapboxSubjects;

export const mapDeckViewerSubjectsNames: (keyof MapDeckViewerSubjects)[] = [
	"$onLumaGlWarning",
	"$onModelFailedToLoad",
	"$renderingSceneFinshed",
	"$testing",
	"$testingResults",
] as const;

export interface MapDeckViewOptions {
	mapboxAccessKey: string;
	mapElement: HTMLDivElement;
	subjects?: Partial<MapDeckViewerSubjects>;
}
