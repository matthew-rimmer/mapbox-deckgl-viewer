import mapboxgl, { Map } from "mapbox-gl";
import { Subject } from "rxjs";

// Mapbox token

export class Mapbox {

    private map: Map | null = null;

    private readonly $testing: Subject<boolean>;

    private readonly startPosition: { center: [number, number], zoom: number, pitch: number, bearing: number } = { center: [0, 0], zoom: 20, pitch: 60, bearing: 0 };

    constructor(options: { container: HTMLDivElement, subjects: { $testing: Subject<boolean> } }) {
        this.createMap(options.container);
        this.$testing = options.subjects.$testing;
    }

    private createMap(container: HTMLDivElement) {
        this.map = new Map({
            container: container,
            style: {
                version: 8,
                layers: [
                    { id: "background", type: "background", paint: { "background-color": "#cccccc" } },
                    { id: "sky", type: "sky" }
                ],
                sources: {}
            },
            center: this.startPosition.center,
            zoom: this.startPosition.zoom,
            pitch: this.startPosition.pitch
        });
    }

    public getMap() {
        if (this.map == null) {
            throw new Error("Map has not been created");
        }

        return this.map;
    }

    public async startTesting() {
        this.map?.flyTo({ bearing: this.startPosition.bearing, center: this.startPosition.center, zoom: this.startPosition.zoom, pitch: this.startPosition.pitch, duration: 0, essential: true });
        this.$testing.next(true);
        for (let bearing = 0; bearing < 361; bearing += 10) {
            this.map?.flyTo({ bearing, duration: 300, essential: true });
            await new Promise<void>((res) => {
                this.map?.once("idle", () => {
                    res();
                });
            });
        }
        this.$testing.next(false);
    }

}