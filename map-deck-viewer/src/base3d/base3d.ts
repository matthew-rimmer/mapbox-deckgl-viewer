import { Mapbox } from "../mapbox/mapbox";
import type { DeckGlSubjects } from "../types/deckgl-types";
import type { Orientation } from "../types/map-deck-viewer-types";

export abstract class Base3d {
    public readonly mapbox: Mapbox;

    constructor(options: { mapbox: Mapbox; subjects: DeckGlSubjects }) {
        this.mapbox = options.mapbox;
    }

    public abstract addLayer(model: File, image?: File): Promise<void>;

    public abstract removeLayer(): void;

    public abstract changeModelAmount(amount: number): void;

    public abstract changeModelHeight(height: number): void;

    public abstract changeModelOrientation(orientation: Orientation): void;

    public createCoordinates(amount: number): [number, number][] {
        const data: [number, number][] = [];
        const columnsAndRows = Math.floor(Math.sqrt(amount));
        const halfColumnAndRows = columnsAndRows / 2;

        for (let modelIndex = 0; modelIndex < amount; modelIndex += 1) {
            const row = Math.floor(modelIndex / columnsAndRows);
            const column = modelIndex % columnsAndRows;
            const longIncrement = (row - halfColumnAndRows) / 10000;
            const latIncrement = (column - halfColumnAndRows) / 10000;
            data.push([longIncrement, latIncrement]);
        }

        return data;
    }
}
