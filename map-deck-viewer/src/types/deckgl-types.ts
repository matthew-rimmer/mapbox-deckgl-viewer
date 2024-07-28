import type { Subject, ReplaySubject } from "rxjs";

export type DeckGlSubjects = {
	$testing: Subject<boolean>;
	$testingResults: Subject<number[]>;
	$onLumaGlWarning: ReplaySubject<string>;
	$onModelFailedToLoad: ReplaySubject<string>;
	$renderingSceneFinshed: ReplaySubject<number>;
};
