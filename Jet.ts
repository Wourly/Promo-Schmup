import * as THREE from 'three'
import { ETexturePicker, IParticleSystemParameters, Particle, ParticleSystem } from "../ParticleSystem";
import { PhysicalInstance } from '../../core';
import { setPositionAndDirectionFromMatrices } from '../misc';

interface IJetConstructorParameters extends IParticleSystemParameters {

    associatedInstance: PhysicalInstance
    spawnPointPosition: THREE.Vector3
    directionPointPosition: THREE.Vector3
    particleCount: number
    speed: number

}

//==============================================================
//========== Jet
//==============================================================
//
// jet utilizes 2 points, that are attached to main PhysicalInstance
//      these points rotate with the instance
//      direction is then calculated
//
// color and size of jet is usually overriden by linear splines
//      which are already implemented in ParticleSystem
//
//---------------------------------------------------------------
//---------

export class Jet extends ParticleSystem {

    associatedInstance: PhysicalInstance

    speed: number;
    
    spawnPoint = new THREE.Object3D();              // object
    directionPoint = new THREE.Object3D();          // object
    spawnPosition = new THREE.Vector3();            // point 1 coordinate/position
    spawnDirectionPosition = new THREE.Vector3();   // point 2 coordinate/position
    spawnDirection = new THREE.Vector3();           // orientation

    adjustedVelocity = new THREE.Vector3();         // direction multiplied by speed

    //--------- constructor
    //---------------------------------------------------------------
    constructor (parameters:IJetConstructorParameters) {

        super({
            ...parameters,
            texture: ETexturePicker.Star
        });

        this.speed = parameters.speed;
        this.associatedInstance = parameters.associatedInstance;

        this.spawnPoint.name = "jet spawn point";
        this.directionPoint.name = "jet direction point";
        
        // aggregating points to parent PhysicalInstance
        this.associatedInstance.group.add(this.spawnPoint, this.directionPoint);
        
        this.spawnPoint.position.copy(parameters.spawnPointPosition);
        this.directionPoint.position.copy(parameters.directionPointPosition);        
    }

    //--------- setUpPartice
    //---------------------------------------------------------------
    // main method, that overrides default setUpParticle
    setUpParticle(particle:Particle) {
        
        const lifetime = (Math.random() * 0.75 + 0.25) * 0.5;

        particle.position.set(
            (Math.random() * 2 - 1) * 1.0 + this.spawnPosition.x,
            (Math.random() * 2 - 1) * 1.0 + this.spawnPosition.y,
            (Math.random() * 2 - 1) * 1.0 + this.spawnPosition.z
        );

        particle.defaultSize = Math.random() * 3.0 + 0.5;
        particle.color.set(0xFF0000);                               // is eventually overriden by linear spline
        particle.alpha = Math.random();                             // --
        particle.lifetime = lifetime;
        particle.maxLifetime = lifetime;
        particle.rotation = Math.PI;
        particle.defaultVelocity = this.adjustedVelocity;
    }

    update(elapsedTime: number): void {

        // matrices are core properties of THREE.js Objects
        // they store the relevant information of positions
        setPositionAndDirectionFromMatrices(
            this.spawnPosition,
            this.spawnDirection,
            this.spawnDirectionPosition,
            this.spawnPoint.matrixWorld,
            this.directionPoint.matrixWorld
        );

        this.adjustedVelocity.set(this.spawnDirection.x, this.spawnDirection.y, this.spawnDirection.z).multiplyScalar(this.speed);
        super.update(elapsedTime);
    }

    //--------- enable
    //---------------------------------------------------------------
    // needs to be called, when PhysicalInstance enters the screen
    // jets should really be inactive otherwise
    enable () {
        this.spawnPoint.updateMatrixWorld();
        this.directionPoint.updateMatrixWorld();

        setPositionAndDirectionFromMatrices(
            this.spawnPosition,
            this.spawnDirection,
            this.spawnDirectionPosition,
            this.spawnPoint.matrixWorld,
            this.directionPoint.matrixWorld
        );

        // fill ParticleSystem with Particles
        this.populate();
    }
}

//==============================================================
//========== Jets
//==============================================================
//
// this class allows to contain multiple Jet classes and manipulate them as if they were a single class
// promotes readability in parent classes
//
//! slightly brute-forced, could be more compact
//
//---------------------------------------------------------------
//--------- 

export class Jets {

    array: Array<Jet> = new Array();

    constructor(jets:Array<Jet>) {
        this.array = jets
    }

    update (elapsedTime:number) {

        const array = this.array;
        const length = array.length;

        // "raw for loops" are preferred in high-performance code, "for of loops" are reasonable, ".forEach" are detrimental
        for (let i = 0; i < length; i++) {
            array[i].update(elapsedTime);
        }

    }

    destroy () {

        const array = this.array;
        const length = array.length;

        for (let i = 0; i < length; i++) {
            array[i].destroy();
        }
    }

    enable () {

        const array = this.array;
        const length = array.length;

        for (let i = 0; i < length; i++) {
            array[i].enable();
        }
    }
}