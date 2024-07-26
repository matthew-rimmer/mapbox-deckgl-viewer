import { useEffect, useState } from "react";
import "./model-settings.css";
import { ReplaySubject, Subject } from "rxjs";

interface ModelSettingsProps {
	$testingResults: Subject<number[]>;
	$renderingSceneFinshed: ReplaySubject<number>;
	onAmountChange: (amount: number) => void;
	onTestingClicked: () => void;
}

export function ModelSettingsComponent({
	$testingResults,
	$renderingSceneFinshed,
	onAmountChange,
	onTestingClicked,
}: ModelSettingsProps) {
	const [results, setResults] = useState<number | null>(null);
	const [renderingTime, setRenderingTime] = useState<number | null>(null);

	useEffect(() => {
		const testingResultsSub = $testingResults.subscribe((results) => {
			const sum = results.reduce((sum, val) => (sum += val), 0);
			setResults(sum / results.length);
		});

		const renderingSceneFinshedSub = $renderingSceneFinshed.subscribe((result) => {
			console.log("result", result);
			setRenderingTime(result);
		});

		return () => {
			testingResultsSub.unsubscribe();
			renderingSceneFinshedSub.unsubscribe();
		};
	}, []);

	const [amount, setAmount] = useState(1);

	const onAmountChanged = (amount: number) => {
		const parsedAmount = Number.isNaN(amount) ? 0 : amount;
		setAmount(parsedAmount);
		onAmountChange(parsedAmount);
	};

	const getResultsColour = () => {
		if (results == null) {
			return "white";
		}

		if (results > 50) {
			return "green";
		}

		if (results > 30) {
			return "orange";
		}

		return "red";
	};

	const getRenderingTimeColour = () => {
		if (renderingTime == null) {
			return "white";
		}

		if (renderingTime < 0.5) {
			return "green";
		}

		if (renderingTime < 1) {
			return "orange";
		}

		return "red";
	};

	return (
		<div className="model-settings">
			<h2>Model settings</h2>
			<div className="model-setting-items">
				<div className="model-setting-item">
					Amount
					<input
						className="amount-input"
						type="number"
						value={amount ?? 0}
						onChange={({ target }) => onAmountChanged(Number.parseInt(target.value))}
					/>
				</div>
				<div className="model-setting-item testing-button">
					<button onClick={onTestingClicked}>Start Testing</button>
				</div>
				{results != null && (
					<div className="model-setting-item" style={{ color: getResultsColour() }}>
						Average: {results.toFixed(2)} fps
					</div>
				)}
				{renderingTime != null && (
					<div className="model-setting-item" style={{ color: getRenderingTimeColour() }}>
						Rendering Time: {renderingTime.toFixed(2)} secs
					</div>
				)}
			</div>
		</div>
	);
}
