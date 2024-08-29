import { ChangeEvent, useRef, useState } from "react";
import "./model-input.css";
import type { EngineType } from "@joshnice/map-deck-viewer";

interface ModelInputProps {
	onModelInput: (modelPath: File, engine: EngineType) => void;
}

export function ModelInputComponent({ onModelInput }: ModelInputProps) {
	const inputRef = useRef<HTMLInputElement>(null);
	const [loading, setLoading] = useState(false);
	const [engine, setEngine] = useState<EngineType>("deckgl");

	const onFileInputted = (event: ChangeEvent<HTMLInputElement>) => {
		setLoading(true);
		const model = event.target.files?.[0];
		if (model != null) {
			onModelInput(model, engine);
		}
	};

	const onFileUploadButtonClick = () => {
		inputRef.current?.click();
	};

	const onEngineChange = (value: string) => {
		if (value === "deckgl" || value === "mapbox") {
			setEngine(value);
		}
	};

	return (
		<dialog>
			{loading && <h1>Loading model...</h1>}
			{!loading && (
				<>
					<h1>Get started by pick a model</h1>
					<button onClick={onFileUploadButtonClick}>Choose a file</button>
					<input ref={inputRef} type="file" accept=".glb" onChange={onFileInputted} />
					<select value={engine} onChange={(value) => onEngineChange(value.target.value)}>
						<option value="deckgl">Deckgl</option>
						<option value="mapbox">Mapbox</option>
					</select>
				</>
			)}
		</dialog>
	);
}
