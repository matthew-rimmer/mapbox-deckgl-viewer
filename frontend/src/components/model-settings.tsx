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
	onAmountChange: (amount: number) => void;
	onHeightChange: (height: number) => void;
	onOrientationChange: (orientation: Orientation) => void;
	onTestingClicked: () => void;
	onChangeModelClick: () => void;
}

export function ModelSettingsComponent({
	$testingResult,
	$renderingSceneFinshed,
	$modelStatsFinshed,
	showStats,
	onAmountChange,
	onHeightChange,
	onOrientationChange,
	onTestingClicked,
	onChangeModelClick,
}: ModelSettingsProps) {
	const [results, setResults] = useState<number | null>(null);
	const [renderingTime, setRenderingTime] = useState<number | null>(null);
	const [stats, setStats] = useState<Stats | null>(null);

	const [testing, setTesting] = useState(false);
	const [amount, setAmount] = useState(1);

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

	const handleAmountChanged = (amount: number) => {
		const parsedAmount = Number.isNaN(amount) ? 0 : amount;
		setAmount(parsedAmount);
		onAmountChange(parsedAmount);
	};

	const handleTestingClicked = () => {
		setTesting(true);
		onTestingClicked();
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
						<div className={`model-setting-item ${getPerformanceClassName()}`}>
							Performance: <span>{results ? `${results.toFixed(2)} fps` : "No result"}</span>
						</div>
					</>
				)}
				<div className="model-setting-item">
					Amount
					<input
						className="amount-input"
						type="number"
						value={amount ?? 0}
						onChange={({ target }) => handleAmountChanged(Number.parseInt(target.value))}
					/>
				</div>
				<div className="model-setting-item">
					Height
					<input
						className="height-input"
						type="number"
						onChange={({ target }) => onHeightChange(Number.parseInt(target.value))}
					/>
				</div>
				<div className="model-setting-item">
					Orientation
					<div>
						<input type="number" onChange={({ target }) => onOrientationChange({ x: Number.parseInt(target.value) })} defaultValue={0} />
						<input type="number" onChange={({ target }) => onOrientationChange({ y: Number.parseInt(target.value) })} defaultValue={0}/>
						<input type="number" onChange={({ target }) => onOrientationChange({ z: Number.parseInt(target.value) })} defaultValue={90}/>
					</div>
				</div>
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
