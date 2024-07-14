import { useEffect, useState } from "react";
import "./model-settings.css";
import { Subject } from "rxjs";

interface ModelSettingsProps {
	$testingResults: Subject<number[]>;
	onAmountChange: (amount: number) => void;
	onTestingClicked: () => void;
}

export function ModelSettingsComponent({ $testingResults, onAmountChange, onTestingClicked }: ModelSettingsProps) {
	const [results, setResults] = useState<number | null>(null);

	useEffect(() => {
		$testingResults.subscribe((results) => {
			const sum = results.reduce((sum, val) => (sum += val), 0);
			setResults(sum / results.length);
		});
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
			</div>
		</div>
	);
}
