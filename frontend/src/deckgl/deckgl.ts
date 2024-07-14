import { MapboxOverlay } from "@deck.gl/mapbox";
import { ScenegraphLayer } from "deck.gl";
import { Mapbox } from "../mapbox/mapbox";

export class DeckGl {
    private readonly mapbox: Mapbox;

    constructor(options: { mapbox: Mapbox }) {
        this.mapbox = options.mapbox;
    }

    public addLayer() {
        const modelLayer = new MapboxOverlay({
            interleaved: true,
            _onMetrics: (metrics: { fps: number }) => {
                console.log("metrics", metrics.fps);
            },
            layers: [
                new ScenegraphLayer({
                    id: "model-layer",
                    type: ScenegraphLayer,
                    scenegraph: "../public/jeep.glb",
                    getScene: (scenegraph, context) => {
                        console.log("scenegraph", scenegraph);
                        console.log("context", context);
                        return scenegraph && scenegraph.scenes
                            ? scenegraph.scenes[0]
                            : scenegraph;
                    },
                    data: [{ coords: [-71.0636, 42.3603] }],
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
