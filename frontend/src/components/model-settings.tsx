import { useEffect, useState } from "react";
import "./model-settings.css";
import { Subject } from "rxjs";
import { ReplaySubjectReset } from "../rxjs/replay-subject-reset";

interface ModelSettingsProps {
	$testingResults: Subject<number[]>;
	$renderingSceneFinshed: ReplaySubjectReset<number>;
	onAmountChange: (amount: number) => void;
	onTestingClicked: () => void;
	onChangeModelClick: () => void;
}

export function ModelSettingsComponent({
	$testingResults,
	$renderingSceneFinshed,
	onAmountChange,
	onTestingClicked,
	onChangeModelClick,
}: ModelSettingsProps) {
	const [results, setResults] = useState<number | null>(null);
	const [renderingTime, setRenderingTime] = useState<number | null>(null);

	useEffect(() => {
		const testingResultsSub = $testingResults.subscribe((results) => {
			const sum = results.reduce((sum, val) => (sum += val), 0);
			setResults(sum / results.length);
		});

		const renderingSceneFinshedSub = $renderingSceneFinshed.subscribe((result) => {
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

	const getPerformanceClassName = () => {
		if (results == null) {
			return "none";
		}

		if (results > 50) {
			return "good";
		}

		if (results > 30) {
			return "ok";
		}

		return "bad";
	};

	const getRenderingTimeClassName = () => {
		if (renderingTime == null) {
			return "none";
		}

		if (renderingTime < 0.5) {
			return "good";
		}

		if (renderingTime < 1) {
			return "ok";
		}

		return "bad";
	};

	return (
		<div className="model-settings">
			<h2>Model settings</h2>
			<div className="model-setting-items">
				<div className={`model-setting-item ${getRenderingTimeClassName()}`}>
					Rendering Time: <span>{renderingTime ? `${renderingTime.toFixed(2)} secs` : "No result"} </span>
				</div>
				<div className={`model-setting-item ${getPerformanceClassName()}`}>
					Performance: <span>{results ? `${results.toFixed(2)} fps` : "No result"}</span>
				</div>
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
					<button onClick={onChangeModelClick}>Change Model</button>
				</div>
			</div>
		</div>
	);
}
