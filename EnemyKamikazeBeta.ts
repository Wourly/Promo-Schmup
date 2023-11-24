import * as THREE from "three";

import { EDirectionVertical, EFactionType, Model } from "../../core";
import { CrescentShield } from "../../library/CrescentShield";

import { EEnemyType } from "../EnemyContainer";
import { EnemyKamikazeAlpha } from "./EnemyKamikazeAlpha";
import { Core } from "../../library/managers/CoreManager";

//==============================================================
//========== EnemyKamikazeBeta
//==============================================================
//
// similar to EnemyKamikazeAlpha
//		carries a shield, that can regenerate
//
//---------------------------------------------------------------
//---------

export class EnemyKamikazeBeta extends EnemyKamikazeAlpha {

	health: number = 1750;
	bottomShield: CrescentShield

	score = 250;

	constructor(model:Model, enemyType:EEnemyType) {
		super(model, enemyType)

		this.bottomShield = new CrescentShield({
			associatedInstance: this,
			position: new THREE.Vector3(0, -7, 0),
			faction: EFactionType.Enemy,
			verticalDirection: EDirectionVertical.Down,
			minimumHealth: 200,
			maximumHealth: 500,
			healthRegeneration: 2,
			defaultColor: new THREE.Color(0xC0C0C0)
		});

		// must be disabled, when enemy is still in container and not on screen
		this.bottomShield.collisionTree.disable();

		this.destroyQueue.push(() => {
			this.bottomShield.destroy();
		})
	}

	// update method is the same as of parent

	enable(): void {
		super.enable()
		Core.addEnemy(this.bottomShield);
		this.bottomShield.collisionTree.enable();
	}
}
