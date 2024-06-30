import mapboxgl, { type Map } from "mapbox-gl";
import { useRef } from "react";
import "mapbox-gl/dist/mapbox-gl.css";
import "./App.css";
import { MapboxOverlay } from "@deck.gl/mapbox";
import { ScenegraphLayer } from "deck.gl";

// Mapbox token
mapboxgl.accessToken = "";

export default function App() {
	const map = useRef<Map | null>(null);

	const renderMap = (element: HTMLDivElement) => {
		if (map.current == null) {
			const mapboxMap = new mapboxgl.Map({
				container: element,
				style: "mapbox://styles/mapbox/streets-v12",
				center: [-71.0636, 42.3603],
				zoom: 17.41,
			});

			map.current = mapboxMap;

			const modelLayer = new MapboxOverlay({
				interleaved: true,
				layers: [
					new ScenegraphLayer({
						id: "model-layer",
						// @ts-ignore
						type: ScenegraphLayer,
						// Path to model
						scenegraph: "../public/jeep.glb",
						data: [{ coords: [-71.0636, 42.3603] }],
						sizeScale: 10,
						getPosition: (d: { coords: [number, number] }) => d.coords,
						getOrientation: () => [0, 0, 90],
						_lighting: "pbr",
					}),
				],
			});

			mapboxMap.addControl(modelLayer);
		}
	};

	return (
		<div>
			<div ref={renderMap} className="map-container" />
		</div>
	);
}
