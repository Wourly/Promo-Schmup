import * as THREE from 'three';

import { EEnemyType } from "../../../enemies/EnemyContainer";
import { Wave } from "../Wave";
import { EventWavePoint, TimedWavePoint, WavePoint, WavePoints } from "../WavePoint";
import { Battlefield } from '../../Battlefield';
import { EConductTypes } from '../../core/Movement';

//==============================================================
//========== EnemyBossWave
//==============================================================
//
// 1 main shooting enemy
// 2 protecting enemies
//      - all 3 need to die to end the wave/game
//
// higher difficulty
//      - additional sets of protecting enemies
//      - additional sets of shooting enemies
//
// all enemies enter the wave by "arrivalTrajectory"
// then they continue on endless loop of "loopTrajectory"
//
//---------------------------------------------------------------
//---------


export class EnemyBossWave extends Wave {

    //--------- WavePoints
    //---------------------------------------------------------------
    //
    // WavePoint is the smallest unit of a Wave
    //      manages set of enemies
    //      manages lifetime conditions of such a set
    //
    //      are aggregated in array "pointConstruct" first 
    //          ..so they can be pushed conditionally based on difficulty
    //          ..before WavePoints are initialized
    //
    //---------------------------------------------------------------
    //---------
    points: WavePoints;

    constructor (difficulty:number) {
        super();

        const pointConstruct = new Array<WavePoint>();

        let bossType = EEnemyType.ShootingAlpha;
        let mainProtectorType = EEnemyType.KamikazeAlpha;
        let assistTypes = EEnemyType.KamikazeAlpha;
        let deadlyAssist1Type = EEnemyType.ShootingAlpha;
        let deadlyAssists2Type = EEnemyType.ShootingBeta;

        switch (difficulty) {
            case 0: {
                bossType = EEnemyType.ShootingAlpha;
                mainProtectorType = EEnemyType.KamikazeAlpha;
                assistTypes = EEnemyType.KamikazeAlpha;
                break;
            }
            case 1: {
                bossType = EEnemyType.ShootingBeta;
                mainProtectorType = EEnemyType.KamikazeAlpha;
                break;
            }
            case 2:
            default: {
                bossType = EEnemyType.ShootingGamma;
                mainProtectorType = EEnemyType.KamikazeGamma;
                assistTypes = EEnemyType.KamikazeBeta;
                break;
            }
            case 3: {
                bossType = EEnemyType.ShootingGamma;
                mainProtectorType = EEnemyType.KamikazeDelta;
                assistTypes = EEnemyType.KamikazeGamma;
                break;
            }
            case 4: {
                bossType = EEnemyType.ShootingDelta;
                mainProtectorType = EEnemyType.KamikazeDelta;
                assistTypes = EEnemyType.KamikazeGamma;
                deadlyAssist1Type = EEnemyType.ShootingBeta;
                deadlyAssists2Type = EEnemyType.ShootingGamma;
                break;
            }
        }

        //--------- trajectory setup
        //---------------------------------------------------------------
        const arrivalTrajectory = {
            type: EConductTypes.Trajectory,
            duration: 1000,
            curves: _setUparrivalTrajectoryCurves()
        }

        const loopTrajectory = {
                type: EConductTypes.Trajectory,
                isFinite: false,
                duration: 10000,
                curves: _setUpLoopTrajectoryCurves()
        }

        //--------- boss and protectors point
        //---------------------------------------------------------------
        // is considered an event (not limited by elapsedTime)
        const bossAndProtectors = new EventWavePoint({
            launchResolver: () => {
                return true;            // launches immediatelly
            },
            completionResolver: () => {

                if (bossAndProtectors.areEnemiesDestroyed())
                    return true;        // even point is concluded when these enemies die

                return false;

            },
            enemies: [
            {
                type: bossType,
                count: 1,
                position: {
                    xInitial: 0,
                    xIncrement: 0,
                    yInitial: Battlefield.limits.top + 25,
                    yIncrement: 10
                },
                conducts: [
                    loopTrajectory,
                    arrivalTrajectory
                ]
            },
            {
                type: mainProtectorType,
                count: 2,
                position: {
                    xInitial: -10,
                    xIncrement: 20,
                    yInitial: Battlefield.limits.top,
                    yIncrement: 0
                },
                conducts: [
                    loopTrajectory,
                    arrivalTrajectory
                ]
            }
        ]
    });

    //--------- assists
    //---------------------------------------------------------------
    const assists = new TimedWavePoint({
        launchTime: 1000,
        duration: 8000,
        enemies: [{
            type: assistTypes,
            count: 2,
            position: {
                xInitial: -30,
                xIncrement: 60,
                yInitial: Battlefield.limits.top + 20,
                yIncrement: 0
            },
            conducts: [
                loopTrajectory,
                arrivalTrajectory
            ]
        }]
    });

    const assists2 = new TimedWavePoint({
        launchTime: 4000,
        duration: 8000,
        enemies: [{
            type: assistTypes,
            count: 2,
            position: {
                xInitial: -30,
                xIncrement: 60,
                yInitial: Battlefield.limits.top + 20,
                yIncrement: 0
            },
            conducts: [
                loopTrajectory,
                arrivalTrajectory
            ]
        }]
    });

    const assists3 = new TimedWavePoint({
        launchTime: 8000,
        duration: 8000,
        enemies: [{
            type: assistTypes,
            count: 2,
            position: {
                xInitial: -30,
                xIncrement: 60,
                yInitial: Battlefield.limits.top + 20,
                yIncrement: 0
            },
            conducts: [
                loopTrajectory,
                arrivalTrajectory
            ]
        }]
    });

    //--------- deadly/offensive assists
    //---------------------------------------------------------------
    const deadlyAssists = new TimedWavePoint({
        launchTime: 12000,
        duration: 8000,
        enemies: [{
            type: deadlyAssist1Type,
            count: 2,
            position: {
                xInitial: -30,
                xIncrement: 60,
                yInitial: Battlefield.limits.top + 20,
                yIncrement: 0
            },
            conducts: [
                loopTrajectory,
                arrivalTrajectory
            ]
        }]
    });
    
    const deadlyAssists2 = new TimedWavePoint({
        launchTime: 16000,
        duration: 8000,
        enemies: [{
            type: deadlyAssists2Type,
            count: 2,
            position: {
                xInitial: -30,
                xIncrement: 60,
                yInitial: Battlefield.limits.top + 20,
                yIncrement: 0
            },
            conducts: [
                loopTrajectory,
                arrivalTrajectory
            ]
        }]
    });
    
    //--------- composition based on difficulty
    //---------------------------------------------------------------
    
    pointConstruct.push(bossAndProtectors);
    pointConstruct.push(assists);
    
    if (difficulty >= 2)
        pointConstruct.push(assists2);
        
    if (difficulty >= 3)
        pointConstruct.push(assists3, deadlyAssists);

    if (difficulty >= 4) {
        pointConstruct.push(deadlyAssists2)
    }

    //--------- instantiation of WavePoints
    //---------------------------------------------------------------
    this.points = new WavePoints(
        pointConstruct
    )

    }
}

//==============================================================
//========== trajectories
//==============================================================
function _setUpLoopTrajectoryCurves () {

    const curves = new Array();

    curves.push(new THREE.CubicBezierCurve3(
		new THREE.Vector3( 0, 0, 0 ),
		new THREE.Vector3( -25, -5, 0 ),
		new THREE.Vector3( -48, -12, 0 ),
		new THREE.Vector3( -50, -15, 0 )
	))

    curves.push(new THREE.CubicBezierCurve3(
		new THREE.Vector3( -50, -15, 0 ),
		new THREE.Vector3( -48, -18, 0 ),
		new THREE.Vector3( -25, -23, 0 ),
		new THREE.Vector3( 0, -25, 0 )
	))

    curves.push(new THREE.CubicBezierCurve3(
		new THREE.Vector3( 0, -25, 0 ),
		new THREE.Vector3( 25, -23, 0 ),
		new THREE.Vector3( 48, -18, 0 ),
		new THREE.Vector3( 50, -15, 0 )
	))

    curves.push(new THREE.CubicBezierCurve3(
		new THREE.Vector3( 50, -15, 0 ),
		new THREE.Vector3( 48, -12, 0 ),
		new THREE.Vector3( 25, -5, 0 ),
		new THREE.Vector3( 0, 0, 0 )
	))

    return curves;

}


function _setUparrivalTrajectoryCurves () {

    const curves = new Array();

    curves.push(new THREE.CubicBezierCurve3(
		new THREE.Vector3( 0, 0, 0 ),
		new THREE.Vector3( 0, -40, 0 ),
		new THREE.Vector3( 0, -45, 0 ),
		new THREE.Vector3( 0, -50, 0 )
	))

    return curves;

}