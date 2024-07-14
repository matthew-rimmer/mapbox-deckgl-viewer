import mapboxgl, { Map } from "mapbox-gl";

// Mapbox token
mapboxgl.accessToken = "pk.eyJ1Ijoiam9zaG5pY2U5OCIsImEiOiJjanlrMnYwd2IwOWMwM29vcnQ2aWIwamw2In0.RRsdQF3s2hQ6qK-7BH5cKg";


export class Mapbox {

    private map: Map | null = null;

    constructor(options: { container: HTMLDivElement }) {
        this.createMap(options.container);
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
            center: [0, 0],
            zoom: 20,
            pitch: 60
        });
    }

    public getMap() {
        if (this.map == null) {
            throw new Error("Map has not been created");
        }

        return this.map;
    }

}