import { MapboxOverlay } from "@deck.gl/mapbox";
import { ScenegraphLayer } from "deck.gl";
import { load } from "@loaders.gl/core";
import { GLTFLoader } from "@loaders.gl/gltf";
import { Mapbox } from "../mapbox/mapbox";

export class DeckGl {
    private readonly mapbox: Mapbox;

    constructor(options: { mapbox: Mapbox }) {
        this.mapbox = options.mapbox;
    }

    public async addLayer(model: File) {

        const modelGlb = await load(model, GLTFLoader);

        const modelLayer = new MapboxOverlay({
            interleaved: true,
            _onMetrics: (metrics: { fps: number }) => {
                console.log("metrics", metrics.fps);
            },
            layers: [
                new ScenegraphLayer({
                    id: "model-layer",
                    type: ScenegraphLayer,
                    scenegraph: modelGlb,
                    getScene: (scenegraph) => {
                        // Todo: Get metrics
                        return scenegraph && scenegraph.scenes
                            ? scenegraph.scenes[0]
                            : scenegraph;
                    },
                    data: [{ coords: [0, 0] }],
                    sizeScale: 1,
                    getPosition: (d: { coords: [number, number] }) => d.coords,
                    getOrientation: () => [0, 0, 90],
                    _lighting: "pbr",
                }),
            ],
        });

        this.mapbox.getMap().addControl(modelLayer);
    }
}
