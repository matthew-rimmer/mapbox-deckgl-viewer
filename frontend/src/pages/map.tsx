import { useRef } from "react";
import { Mapbox } from "../mapbox/mapbox";
import { DeckGl } from "../deckgl/deckgl";
import { ModelInputComponent } from "../components/model-input";
import "mapbox-gl/dist/mapbox-gl.css";
import "./map.css";

export default function App() {
	const mapboxRef = useRef<Mapbox | null>(null);
	const deckglRef = useRef<DeckGl | null>(null);

	const handleModelInput = () => {
		deckglRef.current?.addLayer();
	};

	const renderMap = (element: HTMLDivElement) => {
		if (mapboxRef.current == null && deckglRef.current == null) {
			const mapbox = new Mapbox({ container: element });
			const deckgl = new DeckGl({ mapbox: mapbox });
			mapboxRef.current = mapbox;
			deckglRef.current = deckgl;
		}
	};

	return (
		<>
			<ModelInputComponent onModelInput={handleModelInput} />
			<div ref={renderMap} className="map-container" />
		</>
	);
}
