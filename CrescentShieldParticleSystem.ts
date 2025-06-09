import * as THREE from 'three';
import { ETexturePicker, IParticleSystemParameters, LinearSpline, Particle, ParticleSystem } from "../ParticleSystem";
import { CrescentShield } from '../CrescentShield';

export interface ICrescentParticleSystemParameters extends IParticleSystemParameters {
    shield: CrescentShield
}

export class CrescentParticleSystem extends ParticleSystem {

    shield:CrescentShield;
    alphaSpline: LinearSpline;

    curve: THREE.CubicBezierCurve

    lifespanSets = [
        0.5,
        1,
        1.5,
    ];

    velocityMultiplier = 5;

    constructor (parameters:ICrescentParticleSystemParameters) {
        super({
            ...parameters,
            attachementGroup: parameters.shield.group,
            particleCount: 350,
            texture: ETexturePicker.Star   
        });

        this.shield = parameters.shield;

        this.velocity = new THREE.Vector3(0, this.shield.verticalDirection * 0.02, 0);

        this.curve = new THREE.CubicBezierCurve(
            new THREE.Vector2(-7, 0),
            new THREE.Vector2(0, this.shield.verticalDirection * 2.5),
            new THREE.Vector2(0, this.shield.verticalDirection * 2.5),
            new THREE.Vector2(7, 0)
        );

       this.alphaSpline = new LinearSpline();
        this.alphaSpline.addEntries([
            [0.0, 0],
            [0.3, 0.1],
            [0.7, 0.1],
            [1, 0]
        ]);

        this.populate();
    }

    setUpParticle(particle:Particle) {
        
        const lifetime = this.lifespanSets[Math.floor(Math.random() * this.lifespanSets.length)] * 0.5;

        //: set alpha multiplier when intensity === 1

        if (Math.random() <= (this.shield.currentIntensity * 0.4)) {
            particle.color = this.shield.intenseColor;
        } else {
            particle.color = this.shield.defaultColor;
        }

        if (this.shield.isBroken || Math.random() > this.shield.currentIntensity) {
            particle.isInvisible = true;
            particle.lifetime = lifetime;
            return;
        } else {
            particle.isInvisible = false;
        }

        const point = this.curve.getPoint(Math.random());

        particle.position.set(
            point.x,
            point.y,
            (Math.random() * 2 - 1) * 0.4 + this.particleSpawnPosition.z
        );

        particle.defaultSize = 0.5 + 0.1 * this.shield.health / 1000;

        particle.lifetime = lifetime;
        particle.alpha = this.alphaSpline.entries[0];
        
        particle.maxLifetime = lifetime;
        particle.rotation = Math.PI;
        particle.defaultVelocity = this.velocity;
    }

    update(elapsedTime: number): void {
        super.update(elapsedTime);
        this.velocityMultiplier = 1 + this.shield.currentIntensity * 3;
    }

}