import type { FeatureCollection, Feature, Point } from "geojson";
import { Base3d } from "../base3d/base3d";


export class Mapbox3d extends Base3d {

    private models: File[] = [];

    public override addLayers(models: File[]): Promise<void> {
        const map = this.mapbox.getMap();
        const coords = this.createCoordinates(models.length);

        for (let i = 0; i < models.length; i++) {

            const modelId = this.createModelId(i);
            const model = models[i];

            if (model == null) {
                throw new Error();
            }

            // @ts-ignore
            map.addModel(modelId, URL.createObjectURL(model));

            const coordinates = coords[i];

            if (coordinates == null) {
                throw new Error();
            }

            const source: FeatureCollection = {
                type: "FeatureCollection",
                features: [
                    { type: "Feature", geometry: { coordinates, type: "Point" }, properties: {} }
                ]
            }

            const modelSourceId = this.createModelSourceId(i);

            map.addSource(modelSourceId, { type: "geojson", data: source });

            const modelLayer = {
                id: this.createModelLayerId(i),
                type: "model",
                layout: {
                    "model-id": modelId
                },
                source: modelSourceId
            }

            // @ts-ignore
            map.addLayer(modelLayer);

        }

        return Promise.resolve();
    }


    public override removeLayer(): void {
        const map = this.mapbox.getMap();
        this.models.forEach((_, index) => {
            map.removeLayer(this.createModelLayerId(index));
            map.removeSource(this.createModelSourceId(index));
        });
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

    private createModelId = (index: number) => `model-${index}`;

    private createModelLayerId = (index: number) => `model-${index}`;

    private createModelSourceId = (index: number) => `model-source-${index}`;


}