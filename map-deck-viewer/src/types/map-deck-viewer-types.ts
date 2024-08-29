import type { DeckGlSubjects } from "./deckgl-types";
import type { MapboxSubjects } from "./mapbox-types";

export type MapDeckViewerSubjects = DeckGlSubjects & MapboxSubjects;

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