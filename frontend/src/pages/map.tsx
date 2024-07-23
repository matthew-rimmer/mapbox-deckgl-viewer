import { useRef, useState } from "react";
import { Mapbox } from "../mapbox/mapbox";
import { DeckGl } from "../deckgl/deckgl";
import { ModelInputComponent } from "../components/model-input";
import { ModelSettingsComponent } from "../components/model-settings";
import "mapbox-gl/dist/mapbox-gl.css";
import "./map.css";
import { ReplaySubject, Subject } from "rxjs";
import { WarningConsoleComponent } from "../components/warning-console";

export default function App() {
	const mapboxRef = useRef<Mapbox | null>(null);
	const deckglRef = useRef<DeckGl | null>(null);
	const [showModelUpload, setShowModalUpload] = useState(true);

	const $testingRef = useRef(new Subject<boolean>());
	const $testingResultsRef = useRef(new Subject<number[]>());
	const $deckglWarningLog = useRef(new ReplaySubject<string>());
	const $deckglFailedToLoadModel = useRef(new ReplaySubject<string>());

	const handleModelInput = async (model: File) => {
		await deckglRef.current?.addLayer(model);
		setShowModalUpload(false);
	};

	const handleTestingClicked = () => {
		mapboxRef.current?.startTesting();
	};

	const handleModelAmountChanged = (amount: number) => {
		deckglRef.current?.changeModelAmount(amount);
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
						$testingResults={$testingResultsRef.current}
						onAmountChange={handleModelAmountChanged}
						onTestingClicked={handleTestingClicked}
					/>
					<WarningConsoleComponent
						$deckglWarningLog={$deckglWarningLog.current}
						$deckglFailedToLoadModel={$deckglFailedToLoadModel.current}
					/>
				</>
			)}
			<div ref={renderMap} className="map-container" />
		</>
	);
}
