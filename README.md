# WebGL Game – Custom 2D/3D Engine with Three.js

This project is a modular WebGL-based game engine written in **TypeScript** using **Three.js**. It avoids traditional game engines, which are rare in this domain, focusing instead on handcrafted logic, physics-inspired behavior, and data-driven structures.

Playable beta: [link](https://mmpromogame.netlify.app/) 

---

## 🚀 Key Features

- Custom **game loop**, **scene management**, and **entity behavior**
- Physics-inspired **shields** with regeneration and break/build states
- Fully manual **collision tree** with filterable node shapes and types
- **Equation solver** for ray–circle intersection (used in targeting)
- Configurable **wave system** for enemy spawning and behaviors
- Trajectory support: linear, circular, Bézier-based
- Self-contained **particle system** (engine does not use any third-party emitter)
- Written in TypeScript with class encapsulation and strict types
- Extreme ease for creation of new enemies as shown by inheritance in `EnemyKamikazeBeta.ts`

---

## 💠 Example: Shield System

Shields regenerate over time, change color and particle intensity based on their state. Each shield consists of:

- `minimumHealth`, `maximumHealth`, `healthRegeneration`
- intensity-driven `CrescentParticleSystem`
- dynamic switching between `isBroken`, `isCharging`, `isBeingDestroyed`

---

## 🌌 Sample: Particle System with Curve

The shield particles follow a cubic Bézier curve. Each particle is initialized based on shield intensity:
```ts
this.curve = new THREE.CubicBezierCurve(  
  new THREE.Vector2(-7, 0),  
  new THREE.Vector2(0, vertical * 2.5),  
  new THREE.Vector2(0, vertical * 2.5),  
  new THREE.Vector2(7, 0)  
)  

this.alphaSpline.addEntries([  
  [0.0, 0],  
  [0.3, 0.1],  
  [0.7, 0.1],  
  [1.0, 0]  
])  
```

Particles fade in and out along their trajectory.

## 🧱 Example: Equation Solver

Utility for computing line–circle intersections (used instead of raycasting).  

*Proceed with caution, the code is one of the hardest to read, since it deals with heavy math*

---

## 🧠 Architecture Notes

- **Enemy** and **Projectile** logic is encapsulated in base classes, supporting inheritance and specialization
- **CollisionTree** allows enabling/disabling of sections for performance
- Equation-solving math modules are pure and reusable
- Uses **THREE.Group** hierarchy for spatial transforms

---

## 🛠 Tech Stack

- TypeScript
- Three.js
- NPM, Vite
- No external physics, game engine, nor particle system - all is my own creation and highly optimized
- Extra files can be shown during interview or for similar purposes

---

## 🎯 Goals

- Understand and control every part of a WebGL game loop
- Build reusable logic for visual feedback and physics-inspired behavior
- Learn through building, not hiding behind game engines

---

## 🧩 Future Plans

- Add UI overlay (score, login functions via Django backend)
- Adding new player ships and even customization of their firing rate, powers and upgrade purchases

