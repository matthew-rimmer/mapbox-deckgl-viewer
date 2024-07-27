import mapboxgl from "mapbox-gl";
import { ReplaySubject, Subject } from "rxjs";
import { Mapbox } from "./mapbox/mapbox";
import type { MapDeckViewOptions } from "./types/map-deck-viewer-types";
import { DeckGl } from "./deckgl/deckgl";


export class MapDeckView {

    private readonly mapbox: Mapbox;

    private readonly deckgl: DeckGl;

    constructor(options: MapDeckViewOptions) {

        if (options.mapboxAccessKey == null) {
            throw new Error("Mapbox access key needs to be present");
        }

        mapboxgl.accessToken = options.mapboxAccessKey;

        if (options.mapElement == null) {
            throw new Error("Map element needs to be present");
        }

        const subjects = this.verifySubjects(options.subjects);

        this.mapbox = new Mapbox({ container: options.mapElement, subjects });

        this.deckgl = new DeckGl({ mapbox: this.mapbox, subjects: subjects });
    }

    public addModel(model: File) {
        this.deckgl.addLayer(model)
    }

    public removeModel() {
        this.deckgl.removeLayer();
    }

    public startTesting() {
        this.mapbox.startTesting();
    }

    private verifySubjects(subjects: MapDeckViewOptions["subjects"] = {}) {
        const { $onLumaGlWarning, $onModelFailedToLoad, $renderingSceneFinshed, $testing, $testingResults } = subjects;
        return {
            $onLumaGlWarning: $onLumaGlWarning ?? new ReplaySubject<string>(),
            $onModelFailedToLoad: $onModelFailedToLoad ?? new ReplaySubject<string>(),
            $renderingSceneFinshed: $renderingSceneFinshed ?? new ReplaySubject<number>(),
            $testing: $testing ?? new Subject<boolean>(),
            $testingResults: $testingResults ?? new Subject<number[]>()
        };
    }
}