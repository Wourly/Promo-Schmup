import { Core, EGameState } from "../managers/CoreManager";
import { Wave } from "./Wave";
import { EnemyBossWave } from "./waves/EnemyBossWave";
import { EntryBarrierWave } from "./waves/EntryBarrierWave";
import { KamikazeStraightDescentWave } from "./waves/KamikazeStraightDescentWave";
import { PuzzleWave } from "./waves/PuzzleWave";
import { ShootingAlphaOnslaught } from "./waves/ShootingAlphaOnslaught";
import { SpinnerCurveWave } from "./waves/SpinnerCurveWave";

export class Level {

    // each wave has conditions to be fullfilled before new wave starts
    waves = new Array<Wave>();          // all waves
    standbyWaves = new Array<Wave>();   // waves to .pop()
    currentWave: Wave;

    isLoaded = false;

    constructor (difficulty:number) {

        this.waves.push(
            new EntryBarrierWave(difficulty),
            new KamikazeStraightDescentWave(difficulty),
            new PuzzleWave(difficulty),
            new ShootingAlphaOnslaught(difficulty),
            new SpinnerCurveWave(difficulty),
            new EnemyBossWave(difficulty)
        );

        this.waves.reverse(); // waves make sense to be added as from top-down and .pop() is faster than .shift()
        
        Object.assign(this.standbyWaves, this.waves);  // we need new array, not a reference to the former

        const firstWave = this.standbyWaves.pop();

        if (firstWave)
            this.currentWave = firstWave;
        else
            throw new Error("Level must have at least one wave.");
    }

    //--------- update
    //---------------------------------------------------------------
    update (elapsedTime:number):void {

        if (this.isLoaded) {

            this.currentWave.update(elapsedTime);

            if (this.currentWave.isCompleted) {
    
                const nextWave = this.standbyWaves.pop();
    
                if (nextWave)
                    this.currentWave = nextWave;
                else {
                    Core.endGame(EGameState.Won);
                }
            }
        }
    }

    //--------- loadWaves
    //---------------------------------------------------------------
    // preloading is important to prevent freezes between waves
    async loadWaves (resolver?:Function) {

        const wavePointPromises = [];

        wavePointPromises.push(this.currentWave.points.loadPoints());

        for (const wave of this.standbyWaves) {
            wavePointPromises.push(wave.points.loadPoints());
        }

        Promise.allSettled(wavePointPromises).then(() => {

            this.isLoaded = true;

            if (resolver)
                resolver();
        })
    }

    //--------- clearEnemyContainers
    //---------------------------------------------------------------
    // dispose of enemy records
    // called at the end of level
    clearEnemyContainers () {
        
        for (const wave of this.waves) {
            
            for (const point of wave.points.array) {

                point.point.enemyContainer.clear();

            }
        }
    }
}