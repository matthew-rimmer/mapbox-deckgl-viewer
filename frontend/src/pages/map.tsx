import { useRef, useState } from "react";
import { ReplaySubject, Subject } from "rxjs";
import { EngineType, MapModelViewer, Stats } from "@joshnice/map-deck-viewer";
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
	const viewer = useRef<MapModelViewer | null>(null);
	const [showModelUpload, setShowModalUpload] = useState(true);
	const [showStats, setShowStats] = useState(false);

	// Stats
	const $testingRef = useRef(new Subject<boolean>());
	const $testingResultRef = useRef(new Subject<number>());
	const $renderingSceneFinshedRef = useRef(new ReplaySubjectReset<number>());
	const $modelStatsFinshedRef = useRef(new ReplaySubject<Stats>());

	// Logs and Warnings
	const $deckglWarningLog = useRef(new ReplaySubjectReset<string>());
	const $deckglFailedToLoadModel = useRef(new ReplaySubjectReset<string>());

	const handleModelInput = async (models: File[], engine: EngineType) => {
		viewer.current?.setEngine(engine);
		setShowStats(engine === "deckgl" && models.length === 1);
		await viewer.current?.addModels(models);
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
			viewer.current = new MapModelViewer({
				mapElement: element,
				mapboxAccessKey: MAPBOX_ACCESS_TOKEN,
				subjects: {
					$testing: $testingRef.current,
					$testingResult: $testingResultRef.current,
					$onLumaGlWarning: $deckglWarningLog.current,
					$onModelFailedToLoad: $deckglFailedToLoadModel.current,
					$renderingSceneFinshed: $renderingSceneFinshedRef.current,
					$onModelStatsFinished: $modelStatsFinshedRef.current,
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
						$renderingSceneFinshed={$renderingSceneFinshedRef.current}
						$testingResult={$testingResultRef.current}
						$modelStatsFinshed={$modelStatsFinshedRef.current}
						showStats={showStats}
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
