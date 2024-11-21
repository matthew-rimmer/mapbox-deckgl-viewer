import { ChangeEvent, useRef, useState } from "react";
import type { EngineType } from "@joshnice/map-deck-viewer";
import "./model-input.css";

interface ModelInputProps {
	onModelInput: (modelPath: File[], engine: EngineType, image?: File) => void;
}

export function ModelInputComponent({ onModelInput }: ModelInputProps) {
	const modelInputRef = useRef<HTMLInputElement>(null);
	const imgInputRef = useRef<HTMLInputElement>(null);

	const [model, setModel] = useState<File | null>(null);

	const [loading, setLoading] = useState(false);
	const [engine, setEngine] = useState<EngineType>("deckgl");
	const [settingImage, setSettingImage] = useState(false);

	const onModelInputted = (event: ChangeEvent<HTMLInputElement>) => {
		const model = event.target.files?.[0];
		if (model != null) {
			if (settingImage) {
				setModel(model);
				imgInputRef.current?.click();
			} else {
				setLoading(true);
				onModelInput(Array.from(event.target.files), engine);
			}
	};};

	const onImageInputted = (event: ChangeEvent<HTMLInputElement>) => {
		const image = event.target.files?.[0];
		if (image != null) {
			setLoading(true);
			onModelInput(model!, engine, image);
		}
		// if cancelled, reset model
		if (image == null) {
			setModel(null);
		}
	}

	const onFileUploadButtonClick = () => {
		modelInputRef.current?.click();
		setSettingImage(false);
	};

	const onEngineChange = (value: string) => {
		if (value === "deckgl" || value === "mapbox") {
			setEngine(value);
		}
	};

	const onFileUploadImageButtonClick = () => {
		modelInputRef.current?.click();
		setSettingImage(true);
	};


	return (
		<dialog>
			{loading && <h1>Loading model...</h1>}
			{!loading && (
				<>
					<h1>Get started by pick a model</h1>
					<button onClick={onFileUploadButtonClick}>Choose a file</button>
					<button onClick={onFileUploadImageButtonClick}>Choose a file (replace image)</button>
					<input ref={modelInputRef} type="file" accept=".glb" onChange={onModelInputted} multiple />
					<input ref={imgInputRef} type="file" accept="image/*" onChange={onImageInputted} />
					<select value={engine} onChange={(value) => onEngineChange(value.target.value)}>
						<option value="deckgl">Deckgl</option>
						<option value="mapbox">Mapbox</option>
					</select>
				</>
			)}
		</dialog>
	);
}
