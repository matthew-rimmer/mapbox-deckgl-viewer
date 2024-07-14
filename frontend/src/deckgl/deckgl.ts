import { MapboxOverlay } from "@deck.gl/mapbox";
import { ScenegraphLayer } from "deck.gl";
import { load } from "@loaders.gl/core";
import { GLTFLoader } from "@loaders.gl/gltf";
import { Mapbox } from "../mapbox/mapbox";

export class DeckGl {
    private readonly mapbox: Mapbox;

    private modelLayer: ScenegraphLayer | null = null;

    private mapboxOverlay: MapboxOverlay | null = null;

    private model: any | null = null;

    constructor(options: { mapbox: Mapbox }) {
        this.mapbox = options.mapbox;
    }

    public async addLayer(model: File) {

        this.model = await load(model, GLTFLoader);

        this.modelLayer = this.createModelLayer([{ coords: [0, 0] }]);
        this.mapboxOverlay = new MapboxOverlay({
            interleaved: true,
            // _onMetrics: (metrics: { fps: number }) => {
            //     console.log("metrics", metrics.fps);
            // },
            layers: [
                this.modelLayer
            ],
        });

        this.mapbox.getMap().addControl(this.mapboxOverlay);
    }

    public changeModelAmount(amount: number) {
        const data: { coords: [number, number] }[] = [];

        for (let modelIndex = 0; modelIndex < amount; modelIndex += 1) {
            const longIncrement = modelIndex / 10000;
            const latIncrement = 0;
            data.push({ coords: [longIncrement, latIncrement] })
        }

        this.mapboxOverlay?.setProps({
            layers: [this.createModelLayer(data)]
        });
    }

    private createModelLayer(data: { coords: [number, number] }[]) {
        return new ScenegraphLayer({
            id: "model-layer",
            type: ScenegraphLayer,
            scenegraph: this.model,
            getScene: (scenegraph) => {
                // Todo: Get metrics
                return scenegraph && scenegraph.scenes
                    ? scenegraph.scenes[0]
                    : scenegraph;
            },
            data,
            sizeScale: 1,
            getPosition: (d: { coords: [number, number] }) => d.coords,
            getOrientation: () => [0, 0, 90],
            _lighting: "pbr",
        });
    }
}
