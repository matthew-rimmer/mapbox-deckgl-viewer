import { useRef, useState } from "react";
import { Subject } from "rxjs";
import { Mapbox } from "../mapbox/mapbox";
import { DeckGl } from "../deckgl/deckgl";
import { ModelInputComponent } from "../components/model-input";
import { ModelSettingsComponent } from "../components/model-settings";
import { WarningConsoleComponent } from "../components/warning-console";
import githubLogo from "/github.png";
import { ReplaySubjectReset } from "../rxjs/replay-subject-reset";
import "mapbox-gl/dist/mapbox-gl.css";
import "./map.css";

export default function Map() {
	const mapboxRef = useRef<Mapbox | null>(null);
	const deckglRef = useRef<DeckGl | null>(null);
	const [showModelUpload, setShowModalUpload] = useState(true);

	// Stats
	const $testingRef = useRef(new Subject<boolean>());
	const $testingResultsRef = useRef(new Subject<number[]>());
	const $renderingSceneFinshed = useRef(new ReplaySubjectReset<number>());

	// Logs and Warnings
	const $deckglWarningLog = useRef(new ReplaySubjectReset<string>());
	const $deckglFailedToLoadModel = useRef(new ReplaySubjectReset<string>());

	const handleModelInput = async (model: File) => {
		await deckglRef.current?.addLayer(model);
		setShowModalUpload(false);
	};

	const handleTestingClicked = () => {
		mapboxRef.current?.startTesting();
	};

	const handleResetModelClicked = () => {
		deckglRef.current?.removeLayer();

		$deckglWarningLog.current.reset();
		$deckglFailedToLoadModel.current.reset();

		setShowModalUpload(true);
	};

	const handleModelAmountChanged = (amount: number) => {
		deckglRef.current?.changeModelAmount(amount);
	};

	const handleGithubClick = () => {
		window.open("https://github.com/joshnice/mapbox-deckgl-viewer", "_blank")?.focus();
	};

	const renderMap = (element: HTMLDivElement) => {
		if (mapboxRef.current == null && deckglRef.current == null) {
			const mapbox = new Mapbox({ container: element, subjects: { $testing: $testingRef.current } });
			const deckgl = new DeckGl({
				mapbox: mapbox,
				subjects: {
					$testing: $testingRef.current,
					$testingResults: $testingResultsRef.current,
					$onLumaGlWarning: $deckglWarningLog.current,
					$onModelFailedToLoad: $deckglFailedToLoadModel.current,
					$renderingSceneFinshed: $renderingSceneFinshed.current,
				},
			});
			mapboxRef.current = mapbox;
			deckglRef.current = deckgl;
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
