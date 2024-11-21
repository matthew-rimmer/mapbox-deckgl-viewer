import { useRef, useState } from "react";
import { ReplaySubject, Subject } from "rxjs";
import { v4 as uuid } from "uuid";
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
	const [models, setModels] = useState<Record<string, File>>({});
	const [zoomLevel, setZoomLevel] = useState<number>(20);

	// Stats
	const $testingRef = useRef(new Subject<boolean>());
	const $testingResultRef = useRef(new Subject<number>());
	const $renderingSceneFinshedRef = useRef(new ReplaySubjectReset<number>());
	const $modelStatsFinshedRef = useRef(new ReplaySubject<Stats>());

	// Logs and Warnings
	const $deckglWarningLog = useRef(new ReplaySubjectReset<string>());
	const $deckglFailedToLoadModel = useRef(new ReplaySubjectReset<string>());

	const handleModelInput = async (models: File[], engine: EngineType) => {
		const modelsState: Record<string, File> = {};
		models.forEach((model) => {
			modelsState[uuid()] = model;
		});
		viewer.current?.setEngine(engine);
		await viewer.current?.addModels(modelsState);
		setShowStats(engine === "deckgl" && models.length === 1);
		setModels(modelsState);
		setShowModalUpload(false);
	};

	const handleTestingClicked = (singleModelTest: boolean, amount: number) => {
		viewer.current?.startTesting(singleModelTest, amount);
	};

	const handleResetModelClicked = () => {
		viewer.current?.removeModel();

		$deckglWarningLog.current.reset();
		$deckglFailedToLoadModel.current.reset();

		setShowModalUpload(true);
	};

	const handleModelAmountChanged = (id: string, amount: number) => {
		viewer.current?.changeModelAmount(id, amount);
	};

	const handleHeightChanged = (height: number) => {
		viewer.current?.changeModelHeight(height);
	}

	const handleOrientationChanged = (orientation: Orientation) => {
		viewer.current?.changeModelOrientation(orientation);
	}

	

	const handleGithubClick = () => {
		window.open("https://github.com/joshnice/mapbox-deckgl-viewer", "_blank")?.focus();
	};

	const handleZoomLevelChange = (zoomLevel: number) => {
		setZoomLevel(zoomLevel);
		viewer?.current?.setZoomLevel(zoomLevel);
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
						models={models}
						zoomLevel={zoomLevel}
						onAmountChange={handleModelAmountChanged}
						onHeightChange={handleHeightChanged}
						onOrientationChange={handleOrientationChanged}
						onTestingClicked={handleTestingClicked}
						onChangeModelClick={handleResetModelClicked}
						onZoomLevelChange={handleZoomLevelChange}
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
