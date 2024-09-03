import { MapboxOverlay } from "@deck.gl/mapbox";
import { ScenegraphLayer } from "deck.gl";
import { load } from "@loaders.gl/core";
import { GLTFLoader, type GLTFPostprocessed, postProcessGLTF } from "@loaders.gl/gltf";
import { Mapbox } from "../ mapbox/mapbox";
import type { DeckGlSubjects, Stats } from "../types/deckgl-types";
import { Base3d } from "../base3d/base3d";
import { ImageLoader } from "@loaders.gl/images";
import { luma, Device } from "@luma.gl/core";
import * as THREE from "three";
import { GLTFLoader as ThreeGLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { createScenegraphsFromGLTF } from "@luma.gl/gltf";
import { WebGLDevice } from "@luma.gl/webgl";

export class DeckGl extends Base3d {

	private modelLayer: ScenegraphLayer | null = null;

	private mapboxOverlay: MapboxOverlay | null = null;

	private model: GLTFPostprocessed | null = null;

	private testing: boolean = false;

	private fpsValues: number[] = [];

	private readonly $onModelFailedToLoad: DeckGlSubjects["$onModelFailedToLoad"];

	private readonly $renderingSceneFinshed: DeckGlSubjects["$renderingSceneFinshed"];

	private readonly $onModelStatsFinished: DeckGlSubjects["$onModelStatsFinished"];

	private startLoadingModel: number = 0;

	private stats: Stats | null = null;

	constructor(options: { mapbox: Mapbox; subjects: DeckGlSubjects }) {
		super(options);
		this.$onModelFailedToLoad = options.subjects.$onModelFailedToLoad;
		this.$renderingSceneFinshed = options.subjects.$renderingSceneFinshed;
		this.$onModelStatsFinished = options.subjects.$onModelStatsFinished;
		this.events(options.subjects);
	}

	public async addLayer(model: File, image?: File) {
		this.startLoadingModel = performance.now();
		if (image) {
			this.addLayerWithImageLuma(model, image);
			return;
		}
		console.log("Layer added using deckgl");
		let error = false;
		try {
			const rawModel = await load(model, GLTFLoader);
			const processed = postProcessGLTF(rawModel);
			this.model = processed;
		} catch (err: any) {
			error = true;
			if ("message" in err) {
				this.$onModelFailedToLoad.next(err.message);
			}
		}

		if (error) {
			return;
		}

		this.getStats(model.name);
		this.modelLayer = this.createModelLayer([{ coords: [0, 0] }]);
		this.mapboxOverlay = new MapboxOverlay({
			interleaved: true,
			_onMetrics: (metrics: { fps: number }) => {
				if (this.testing) {
					this.fpsValues.push(metrics.fps);
				}
			},
			layers: [this.modelLayer],
		});

		// @ts-ignore
		this.mapbox.getMap().addControl(this.mapboxOverlay);
	}


	private async addLayerWithImageTHREE(model: File, image: File) {
		// Load the model and the image we want to add to the model
		const modelImage = await load(image, ImageLoader, { image: { type: "data", decode: true } });
		this.startLoadingModel = performance.now();

		// Now because lumagl is silly, we can't edit the model to make an image in there.
		// Instead, we load the model using threejs, edit the releveant material on the model, and then export it as a gltf
		// This can then be read back into lumagl

		// Create a new scene
		const scene = new THREE.Scene();

		// Add our model to the scene
		const loader = new ThreeGLTFLoader();
		const gltf = await loader.loadAsync(URL.createObjectURL(model));
		scene.add(gltf.scene);

		// Add our image to the model
		const texture = new THREE.Texture();
		texture.image = modelImage;

		// traverse the scene and find the material we want to add the image to
		gltf.scene.traverse((child: any) => {
			if (child instanceof THREE.Mesh) {
				if (child.material.name.includes("adspace")) {
					console.log("child", child.material);
					// Compute the bounding box of the child mesh
					child.material.map = texture;
				}
			}
		});
		const exporter = new GLTFExporter();
		exporter.parse(scene, async (gltf: any) => {
			let error = false;

			try {
				const blob = new Blob([JSON.stringify(gltf)], { type: "application/json" });
				const model = new File([blob], "model.glb", { type: "application/json" });
				const loadedModel = await load(model, GLTFLoader);
				const processed = postProcessGLTF(loadedModel);

				this.model = processed;
				console.log("model", this.model);
			} catch (err) {
				console.error("err", err);
			}

			if (error) {
				return;
			}

			this.getStats(model.name);
			this.modelLayer = this.createModelLayer([{ coords: [0, 0] }]);
			this.mapboxOverlay = new MapboxOverlay({
				interleaved: true,
				_onMetrics: (metrics: { fps: number }) => {
					if (this.testing) {
						this.fpsValues.push(metrics.fps);
					}
				},
				layers: [this.modelLayer],
			});

			this.mapbox.getMap().addControl(this.mapboxOverlay);
		});

	}

	private async addLayerWithImageLuma(model: File, image: File) {
		// Load the model and the image we want to add to the model
		const modelImage = await load(image, ImageLoader, { image: { type: "data", decode: true } });


		let error = false;

		try {
			const loadedModel = await load(model, GLTFLoader);
			const loadedImage = await load(image, ImageLoader, { image: { type: "data", decode: true } });
			const processed = postProcessGLTF(loadedModel);

			console.log(processed)
			// Next we can derive the index of the image we want to replace based on the processed model
			// Go through materials and find the texture which has a name which includes "adspace"
			// Go to pbrMetallicRoughness -> BaseColourTexture -> Texutre -> source -> id
			// This id is the id of the image we want to replace
			let id = "";
			for (const material of processed.materials) {
				if (material.name.includes("adspace")) {
					if (material?.pbrMetallicRoughness?.baseColorTexture) {
						const imageId = material.pbrMetallicRoughness.baseColorTexture.texture.source?.id;
						if (imageId) {
							id = imageId;
							break;
						}
					}
				}
			}

			// Now find the index of the image with the id in processed.images
			const imageIndex = processed.images.findIndex((image) => image.id === id);
			if (imageIndex === -1) {
				throw new Error("Image not found in model");
			}

			// Replace the image in the model with the new image
			// copy the model to a new const
			const modelCopy = loadedModel;
			console.log(modelCopy);
			if (modelCopy.images) {
				modelCopy.images = modelCopy.images.map((image, index) => {
					if (index === imageIndex) {
						return loadedImage;
					}
					return image;
				});
			}

			const finalProcessed = postProcessGLTF(modelCopy);


			this.model = finalProcessed;
			console.log("model", this.model);
		} catch (err) {
			console.error("err", err);
		}

		if (error) {
			return;
		}

		this.getStats(model.name);
		this.modelLayer = this.createModelLayer([{ coords: [0, 0] }]);
		this.mapboxOverlay = new MapboxOverlay({
			interleaved: true,
			_onMetrics: (metrics: { fps: number }) => {
				if (this.testing) {
					this.fpsValues.push(metrics.fps);
				}
			},
			layers: [this.modelLayer],
		});

		this.mapbox.getMap().addControl(this.mapboxOverlay);

	}


	public removeLayer() {
		if (this.mapboxOverlay != null) {
			this.mapboxOverlay.setProps({
				layers: [],
			});

			this.mapboxOverlay.finalize();

			// @ts-ignore
			this.mapbox.getMap().removeControl(this.mapboxOverlay);

			this.stats = null;
		}
	}

	public changeModelAmount(amount: number) {
		const data: { coords: [number, number] }[] = this.createCoordinates(amount).map((coords) => ({ coords }));
		const columnsAndRows = Math.floor(Math.sqrt(amount));
		const halfColumnAndRows = columnsAndRows / 2;

		for (let modelIndex = 0; modelIndex < amount; modelIndex += 1) {
			const row = Math.floor(modelIndex / columnsAndRows);
			const column = modelIndex % columnsAndRows;
			const longIncrement = (row - halfColumnAndRows) / 10000;
			const latIncrement = (column - halfColumnAndRows) / 10000;
			data.push({ coords: [longIncrement, latIncrement] });
		}

		try {
			this.mapboxOverlay?.setProps({
				layers: [this.createModelLayer(data)],
			});
		} catch (err) {
			console.error("err", err);
		}
	}

	private createModelLayer(data: { coords: [number, number] }[]) {
		return new ScenegraphLayer({
			id: "model-layer",
			type: ScenegraphLayer,
			scenegraph: this.model,
			getScene: (scenegraph) => {
				const finishRenderingScene = performance.now();
				const totalRenderingTimeSecs = (finishRenderingScene - this.startLoadingModel) / 1000;
				this.$renderingSceneFinshed.next(totalRenderingTimeSecs);

				console.log("scenegraph", scenegraph);

				return scenegraph && scenegraph.scenes ? scenegraph.scenes[0] : scenegraph;
			},
			data,
			sizeScale: 1,
			getPosition: (d: { coords: [number, number] }) => d.coords,
			getOrientation: () => [0, 0, 90],
			_lighting: "pbr",
		});
	}

	private events(subjects: DeckGlSubjects) {
		subjects.$testing.subscribe((value) => {
			if (!value) {
				const sum = this.fpsValues.reduce((sum, val) => (sum += val), 0);
				const result = sum / this.fpsValues.length;
				subjects.$testingResult.next(result);
				if (this.stats != null) {
					this.stats.fps = result;
				}
				this.fpsValues = [];
			}
			this.testing = value;
		});

		luma.log.warn = (warning: string) => () => {
			console.warn(warning);
			subjects.$onLumaGlWarning.next(warning);
		};
	}

	private getStats(modelName: string) {

		this.stats = {
			name: modelName.split(".glb")[0] ?? "	",
			sizeMb: Number.parseFloat((this.model?.buffers?.[0]?.byteLength ?? 0 / 1048576).toFixed(2)),
			accessor: this.model?.accessors?.length ?? 0,
			material: this.model?.materials?.length ?? 0,
			mesh: this.model?.meshes?.length ?? 0,
			nodes: this.model?.nodes?.length ?? 0,
		}
		this.$onModelStatsFinished.next(this.stats);
	}
}
