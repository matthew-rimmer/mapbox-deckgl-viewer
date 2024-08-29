import { Mapbox } from "../mapbox/mapbox";
import type { DeckGlSubjects } from "../types/deckgl-types";

export abstract class Base3d {
    public readonly mapbox: Mapbox;

    constructor(options: { mapbox: Mapbox; subjects: DeckGlSubjects }) {
        this.mapbox = options.mapbox;
    }

    public abstract addLayer(model: File): Promise<void>;

    public abstract removeLayer(): void;

    public abstract changeModelAmount(amount: number): void;
}
