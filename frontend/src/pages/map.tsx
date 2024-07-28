import { useRef, useState } from "react";
import { Subject } from "rxjs";
import { MapDeckView } from "@joshnice/map-deck-viewer";
import { ModelInputComponent } from "../components/model-input";
import { ModelSettingsComponent } from "../components/model-settings";
import { WarningConsoleComponent } from "../components/warning-console";
import githubLogo from "/github.png";
import { ReplaySubjectReset } from "../rxjs/replay-subject-reset";
import "mapbox-gl/dist/mapbox-gl.css";
import "./map.css";

const MAPBOX_ACCESS_TOKEN =
	"pk.eyJ1Ijoiam9zaG5pY2U5OCIsImEiOiJjanlrMnYwd2IwOWMwM29vcnQ2aWIwamw2In0.RRsdQF3s2hQ6qK-7BH5cKg";

export default function Map() {
	const viewer = useRef<MapDeckView | null>(null);
	const [showModelUpload, setShowModalUpload] = useState(true);

	// Stats
	const $testingRef = useRef(new Subject<boolean>());
	const $testingResultsRef = useRef(new Subject<number[]>());
	const $renderingSceneFinshed = useRef(new ReplaySubjectReset<number>());

	// Logs and Warnings
	const $deckglWarningLog = useRef(new ReplaySubjectReset<string>());
	const $deckglFailedToLoadModel = useRef(new ReplaySubjectReset<string>());

	const handleModelInput = async (model: File) => {
		await viewer.current?.addModel(model);
		setShowModalUpload(false);
	};

	const handleTestingClicked = () => {
		viewer.current?.startTesting();
	};

	const handleResetModelClicked = () => {
		viewer.current?.removeModel();

		$deckglWarningLog.current.reset();
		$deckglFailedToLoadModel.current.reset();

		setShowModalUpload(true);
	};

	const handleModelAmountChanged = (amount: number) => {
		viewer.current?.changeModelAmount(amount);
	};

	const handleGithubClick = () => {
		window.open("https://github.com/joshnice/mapbox-deckgl-viewer", "_blank")?.focus();
	};

	const renderMap = (element: HTMLDivElement) => {
		if (viewer.current == null) {
			viewer.current = new MapDeckView({
				mapElement: element,
				mapboxAccessKey: MAPBOX_ACCESS_TOKEN,
				subjects: {
					$testing: $testingRef.current,
					$testingResults: $testingResultsRef.current,
					$onLumaGlWarning: $deckglWarningLog.current,
					$onModelFailedToLoad: $deckglFailedToLoadModel.current,
					$renderingSceneFinshed: $renderingSceneFinshed.current,
				},
			});
		}
	};

	return (
		<>
			{showModelUpload && <ModelInputComponent onModelInput={handleModelInput} />}
			{!showModelUpload && (
				<>
					<ModelSettingsComponent
						$renderingSceneFinshed={$renderingSceneFinshed.current}
						$testingResults={$testingResultsRef.current}
						onAmountChange={handleModelAmountChanged}
						onTestingClicked={handleTestingClicked}
						onChangeModelClick={handleResetModelClicked}
					/>
					<WarningConsoleComponent
						$deckglWarningLog={$deckglWarningLog.current}
						$deckglFailedToLoadModel={$deckglFailedToLoadModel.current}
					/>
				</>
			)}
			<div ref={renderMap} className="map-container" />
			<button className="github-button">
				<img className="github-logo" onClick={handleGithubClick} src={githubLogo} alt="github logo" />
			</button>
		</>
	);
}
