import { useRef, useState } from "react";
import { Mapbox } from "../mapbox/mapbox";
import { DeckGl } from "../deckgl/deckgl";
import { ModelInputComponent } from "../components/model-input";
import { ModelSettingsComponent } from "../components/model-settings";
import "mapbox-gl/dist/mapbox-gl.css";
import "./map.css";

export default function App() {
	const mapboxRef = useRef<Mapbox | null>(null);
	const deckglRef = useRef<DeckGl | null>(null);
	const [showModelUpload, setShowModalUpload] = useState(true);

	const handleModelInput = async (model: File) => {
		await deckglRef.current?.addLayer(model);
		setShowModalUpload(false);
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
			{showModelUpload && <ModelInputComponent onModelInput={handleModelInput} />}
			{!showModelUpload && <ModelSettingsComponent />}
			<div ref={renderMap} className="map-container" />
		</>
	);
}
