import { useEffect, useState } from "react";
import { ReplaySubject, Subject } from "rxjs";
import { Orientation, Stats } from "@joshnice/map-deck-viewer";
import { ReplaySubjectReset } from "../rxjs/replay-subject-reset";
import "./model-settings.css";

interface ModelSettingsProps {
	$testingResult: Subject<number>;
	$renderingSceneFinshed: ReplaySubjectReset<number>;
	$modelStatsFinshed: ReplaySubject<Stats>;
	showStats: boolean;
	onHeightChange: (height: number) => void;
	onOrientationChange: (orientation: Orientation) => void;
	models: Record<string, File>;
	zoomLevel: number;
	onAmountChange: (id: string, amount: number) => void;
	onTestingClicked: (singleModelTest: boolean, amount: number) => void;
	onChangeModelClick: () => void;
	onZoomLevelChange: (zoomLevel: number) => void;
}

export function ModelSettingsComponent({
	$testingResult,
	$renderingSceneFinshed,
	$modelStatsFinshed,
	showStats,
	models,
	zoomLevel,
	onAmountChange,
	onHeightChange,
	onOrientationChange,
	onTestingClicked,
	onChangeModelClick,
	onZoomLevelChange,
}: ModelSettingsProps) {
	const [results, setResults] = useState<number | null>(null);
	const [renderingTime, setRenderingTime] = useState<number | null>(null);
	const [stats, setStats] = useState<Stats | null>(null);

	const [singleModelTest, setSingleModelTest] = useState(false);
	const [singleModelTestAmount, setSingleModelTestAmount] = useState<number>(0);
	const [testing, setTesting] = useState(false);
	const [amount, setAmount] = useState<Record<string, number>>(createStartingAmount(models));

	useEffect(() => {
		const testingResultSub = $testingResult.subscribe((result) => {
			setResults(result);
			setTesting(false);
		});

		const renderingSceneFinshedSub = $renderingSceneFinshed.subscribe((result) => {
			setRenderingTime(result);
		});

		const modelStatsFinshedSub = $modelStatsFinshed.subscribe((stats) => {
			setStats(stats);
		});

		return () => {
			testingResultSub.unsubscribe();
			renderingSceneFinshedSub.unsubscribe();
			modelStatsFinshedSub.unsubscribe();
		};
	}, []);

	const handleAmountChanged = (id: string, newAmount: number) => {
		const parsedAmount = Number.isNaN(newAmount) ? 0 : newAmount;
		setAmount({ ...amount, [id]: parsedAmount });
		onAmountChange(id, parsedAmount);
	};

	const handleTestingClicked = () => {
		setTesting(true);
		onTestingClicked(singleModelTest, singleModelTestAmount);
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
				{showStats && (
					<>
						<div className={`model-setting-item ${getRenderingTimeClassName()}`}>
							Rendering Time: <span>{renderingTime ? `${renderingTime.toFixed(2)} secs` : "No result"} </span>
						</div>
					</>
				)}
				<div className={`model-setting-item ${getPerformanceClassName()}`}>
					Performance: <span>{results ? `${results.toFixed(2)} fps` : "No result"}</span>
				</div>
				{Object.entries(models).map(([id, modelFile]) => (
					<div className="model-setting-item" key={id}>
						{modelFile.name} Amount
						<input
							className="amount-input"
							type="number"
							value={amount[id]}
							onChange={({ target }) => handleAmountChanged(id, Number.parseInt(target.value))}
						/>
					</div>
				))}
				{showStats && (
					<div className="model-setting-item model-stats">
						{stats != null &&
							Object.entries(stats).map(([key, value]) => {
								return (
									<div key={key} className="model-stat">
										<div>{key}:</div> <div>{value}</div>
									</div>
								);
							})}
					</div>
				)}
				<div className="model-setting-item">
					Zoom level
					<input
						className="amount-input"
						type="number"
						value={zoomLevel}
						onChange={({ target }) => onZoomLevelChange(Number.parseInt(target.value))}
					/>
				</div>
				<div className="model-setting-item">
					Single Model
					<input type="checkbox" checked={singleModelTest} onChange={() => setSingleModelTest(!singleModelTest)} />
					<input
						disabled={testing || !singleModelTest}
						className="amount-input"
						type="number"
						value={singleModelTestAmount}
						onChange={({ target }) => setSingleModelTestAmount(Number.parseInt(target.value))}
					/>
				</div>
				<div className="model-setting-item testing-button">
					<button disabled={testing} onClick={handleTestingClicked}>
						Start Testing
					</button>
					<button disabled={testing} onClick={onChangeModelClick}>
						Change Model
					</button>
				</div>
			</div>
		</div>
	);
}

function createStartingAmount(models: Record<string, File>) {
	const amount: Record<string, number> = {};
	Object.keys(models).forEach((model) => {
		amount[model] = 1;
	});
	return amount;
}
