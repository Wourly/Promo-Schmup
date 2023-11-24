import * as THREE from "three";
import { Model } from "../../core";
import { CollisionTree, ECollisionCodes, ECollisionNodeShapes } from "../../library/CollisionTree";
import { EnemyShip } from "./_EnemyShip";
import { EEnemyType } from "../EnemyContainer";
import { Jet } from "../../library/particleSystems/Jet";
import { LinearSpline, colorSplineFunction } from "../../library/ParticleSystem";

//==============================================================
//========== EnemyKamikazeAlpha
//==============================================================
//
// basic enemy without much of functionality
//		can at most collide with player
//
//---------------------------------------------------------------
//---------

export class EnemyKamikazeAlpha extends EnemyShip {

	collisionTree:CollisionTree;
	jet:Jet

	health: number = 1000;
	score = 100;

	constructor(model:Model, enemyType:EEnemyType) {
		super(model, enemyType)

		const [jetColors, jetAlphas, jetScales] = getJetsSplines();

		this.jet = new Jet({
			associatedInstance: this,
			spawnPointPosition: new THREE.Vector3(-0.2, 5, 0),
			directionPointPosition: new THREE.Vector3(-0.2, 6, 0),
			speed: 0.3,
			particleCount: 100,
			colorSpline: jetColors,
			alphaSpline: jetAlphas,
			scaleSpline: jetScales
		})

		this.collisionTree = new CollisionTree({
			parentInstance:this,
			code: ECollisionCodes.Body,
			shapeType: ECollisionNodeShapes.Circular,
			radius: 7
		})

		// called from general enemy class, when destroyed
		this.destroyQueue.push(() => {
			setTimeout(() => {
				this.jet.destroy();
			}), 100;
		})
	}

	// called when enemy enters the screen
	enable(): void {
		super.enable();
		this.jet.enable();
	}

	// called during lifetime on screen of enemy
	update(elapsedTime: number): void {
		super.update(elapsedTime);
		this.jet.update(elapsedTime);
	}
}

//--------- spline setup
//---------------------------------------------------------------
function getJetsSplines () {

	const colorSpline = new LinearSpline(colorSplineFunction);

	colorSpline.addEntries([
		[0.0, new THREE.Color(0xFF0000)],
		[0.65, new THREE.Color(0xAAAA00)],
		[1.0, new THREE.Color(0xFF0000)]
	]);

	const alphaSpline = new LinearSpline();
	alphaSpline.addEntries([
		[0.0, 0.0],
		[0.1, 0.5],
		[0.5, 0.5],
		[1.0, 0.3]
	]);
	
	const scaleSpline = new LinearSpline();
	scaleSpline.addEntries([
		[0.0, 0.1],
		[0.5, 0.3],
		[1.0, 0.2]
	]);

	return [
		colorSpline,
		alphaSpline,
		scaleSpline
	];
}