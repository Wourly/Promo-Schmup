import * as THREE from "three";

import { EDirectionVertical, EFactionType, PhysicalInstance } from "../core";
import { Core } from "./managers/CoreManager";
import { CrescentParticleSystem } from "./particleSystems/CrescentShieldParticleSystem";
import { CollisionTree, ECollisionCodes, ECollisionNodeShapes } from "./CollisionTree";
import { BasicLaser } from "../projectiles/Lasers";
import { CollisionSignal, CollisionTarget } from "./CollisionProcessor";

export interface ICrescentShieldParameters {
    associatedInstance: PhysicalInstance,
    position: THREE.Vector3,
    faction: EFactionType,

    verticalDirection: EDirectionVertical

    minimumHealth?: number
    maximumHealth: number,
    healthRegeneration: number,

    intenseColor?:THREE.Color
    defaultColor?:THREE.Color

}

export class CrescentShield extends PhysicalInstance {

    parent:PhysicalInstance;
    particleSystem:CrescentParticleSystem;

    verticalDirection: EDirectionVertical;

    collisionTree:CollisionTree;

    laserFadeMultiplier = -1.5;

    health:number
    minimumHealth:number;
    maximumHealth:number;
    healthRegeneration:number;

    damageMultiplier = 0.1;

    isBeingDestroyed = false;

    // maxHealth - minHealth
    // required for calculating viableHealthRatio
    readonly viableHealthFactor:number
    // health - minHealth / viableHealthFactor
    // "viableHealth": percentage of health above minHealth
    // has values between 0 and 1
    viableHealthRatio:number;
    
    isBroken = false;
    isCharging = true;

    //--------- 
    //---------------------------------------------------------------
    intenseColor:THREE.Color
    defaultColor:THREE.Color

    currentIntensity = 1;
    minimumIntensity = 0.25;
    maximumIntensity = 1;
    readonly intensityFactor = this.maximumIntensity - this.minimumIntensity;

    //--------- 
    //---------------------------------------------------------------
    constructor (parameters:ICrescentShieldParameters) {
        super()

        this.parent = parameters.associatedInstance;
        this.faction = parameters.faction;
        this.position.copy(parameters.position)

        this.verticalDirection = parameters.verticalDirection;

        this.minimumHealth = parameters.minimumHealth || (parameters.maximumHealth * 0.4);
        this.maximumHealth = parameters.maximumHealth;
        this.health = this.maximumHealth;
        this.healthRegeneration = parameters.healthRegeneration;

        this.viableHealthFactor = this.maximumHealth - this.minimumHealth;
        this.viableHealthRatio = this.calculateViableHealthRatio();



        this.defaultColor = parameters.defaultColor || new THREE.Color(0x0000FF);
        this.intenseColor = parameters.intenseColor || new THREE.Color(0x00FFFF);

        this.particleSystem = new CrescentParticleSystem({
            shield: this
        });

        this.collisionTree = new CollisionTree({
            parentInstance: this,
            code:ECollisionCodes.Outher,
            shapeType: ECollisionNodeShapes.Circular,
            position: new THREE.Vector3(),
            radius: 9,
            //visible: true,
            children: [
                {
                    code:ECollisionCodes.Body,
                    shapeType: ECollisionNodeShapes.Circular,
                    position: new THREE.Vector3(-4.5, this.verticalDirection * 0.5, 0),
                    radius: 3,
                    //visible: true
                },
                {
                    code:ECollisionCodes.Body,
                    shapeType: ECollisionNodeShapes.Circular,
                    position: new THREE.Vector3(0, this.verticalDirection * 1.5, 0),
                    radius: 3,
                    //visible: true
                },
                {
                    code:ECollisionCodes.Body,
                    shapeType: ECollisionNodeShapes.Circular,
                    position: new THREE.Vector3(4.5, this.verticalDirection * 0.5, 0),
                    radius: 3,
                    //visible: true
                }
            ]
        })


        if (this.isBroken)
            this.collisionTree.disable();

        this.parent.group.add(this.group);
        this.collisionTree.enable();
        //console.log(this)
    }

    update (elapsedTime:number) {

        if (this.health < 0) {
            this.health = 0;
        }

        this.particleSystem.update(elapsedTime);

        if (this.health <= this.maximumHealth)
            this.health += this.healthRegeneration;

        // viable health ratio
        if (this.health >= this.minimumHealth) {

            if (this.isBroken)
                this.build();

            this.viableHealthRatio = this.calculateViableHealthRatio()
        }
        else {
            this.viableHealthRatio = 0;
        }

        if (!this.isBroken) {
            this.currentIntensity = this.minimumIntensity + this.intensityFactor * this.viableHealthRatio;
        }


        //console.log(Math.round(this.viableHealthRatio * 10) / 10)
        //console.log(Math.round((this.health) * 100) / 100)
        //console.log(this.intensityFactor)

    }

    destroy () {

        if (this.isBeingDestroyed === true)
            return;

        this.isBeingDestroyed = true;
        this.isActive = false;

		this.collisionTree.destroy();

		setTimeout(() => {
			Core.scene.remove(this.group);
			this.particleSystem.destroy();
		}, 500)

    }

    build () {
        this.isBroken = false;
        this.collisionTree.enable();
    }

    break () {

        if (this.isBroken)
            return;
        
        this.isBroken = true;
        this.collisionTree.disable();

    }

    calculateViableHealthRatio () {
        return (this.health - this.minimumHealth) / this.viableHealthFactor;;
    }

    //--------- collision related methods
    //---------------------------------------------------------------
    acknowledgeSignal (signal: CollisionSignal, lastSignalNode: BasicLaser): void {

        if (!signal.isActive)
            return;

        let damageToBeDone:number = 0;

        if (signal.damage)
            damageToBeDone = signal.damage;

        this.health -= damageToBeDone;

        if (this.health <= 0)
            this.break();

    }

    acknowledgeTarget(target: CollisionTarget, lastTargetNode: CollisionTarget): void {
        console.log(target)
    }

}