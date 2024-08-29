import type { ModelLayerSpecification } from "mapbox-gl";
import type { FeatureCollection, Feature, Point } from "geojson";
import { Base3d } from "../base3d/base3d";


export class Mapbox3d extends Base3d {

    public override addLayer(modelFile: File): Promise<void> {
        console.log("Layer added using mapbox");

        const map = this.mapbox.getMap();

        const objectURL = URL.createObjectURL(modelFile);

        map.addModel("model", objectURL);

        const source: FeatureCollection = {
            type: "FeatureCollection",
            features: [
                { type: "Feature", geometry: { coordinates: [0, 0], type: "Point" }, properties: {} }
            ]
        }

        map.addSource("model-source", { type: "geojson", data: source });

        const modelLayer: ModelLayerSpecification = {
            id: "model-layer",
            type: "model",
            layout: {
                "model-id": "model"
            },
            source: "model-source"
        }

        map.addLayer(modelLayer);


        return Promise.resolve();
    }


    public override removeLayer(): void {
        const map = this.mapbox.getMap();
        map.removeLayer("model-layer");
        map.removeSource("model-source");

    }

    public override changeModelAmount(amount: number): void {
        const map = this.mapbox.getMap();
        const source = map.getSource("model-source");

        if (source?.type === "geojson") {

            const features: Feature<Point>[] = this.createCoordinates(amount).map((coord) => ({
                type: "Feature", geometry: { coordinates: [coord[0], coord[1]], type: "Point" }, properties: {}
            }));

            const updatedData: FeatureCollection = {
                type: "FeatureCollection",
                features
            }

            source.setData(updatedData);
        }
    }

}