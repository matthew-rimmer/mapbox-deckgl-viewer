import "./model-input.css";

interface ModelInputProps {
	onModelInput: () => void;
}

export function ModelInputComponent({ onModelInput }: ModelInputProps) {
	const onFileInputted = () => {
		onModelInput();
	};

	return (
		<dialog>
			<div>Pick a model</div>
			<input type="file" onChange={onFileInputted} />
		</dialog>
	);
}
