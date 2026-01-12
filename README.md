# React N-Body Solar System Simulation

A very simple real-time (it definitely won't solve your three-body problem lol), interactive gravity simulation built with **React** and the **HTML5 Canvas API**. This project visualizes N-body physics, where celestial bodies attract one another based on Newton's Law of Universal Gravitation.

## Features

* **N-Body Physics Engine:** Every object exerts a gravitational force on every other object.
* **Object-Oriented Design:** Structured using `Body` and `Star` classes for clean state management.
* **Orbital Trails:** Visual history of planetary movement with alpha-fading for a "comet tail" effect.
* **Interactive Camera:** Infinite panning and zooming using the mouse.
* **Procedural Generation:** Randomized planetary masses, colors, and orbital distances.
* **Visual Effects:** Sun glow gradients, specular highlights on planets, and a parallax starfield.

## Computations

This simulation is based on classical mechanics. Below are the core computations used to drive the physics engine.

### 1. Newton's Law of Universal Gravitation
The core force driving the simulation is gravity. For every pair of bodies, we calculate the force (F) using the formula:

> **F = G × (m₁ × m₂) / r²**

* **G:** The gravitational constant (scaled for the simulation).
* **m:** The masses of the two objects.
* **r:** The distance between the two objects.

*Source: [Newton's law of universal gravitation - Wikipedia](https://en.wikipedia.org/wiki/Newton%27s_law_of_universal_gravitation)*

### 2. Vector Math & Decomposition
Since the computer screen is a 2D grid (x, y), we cannot simply apply the force magnitude F. We must break it down into vector components:

1.  **Calculate Distance Vector:** `d = (x2 - x1, y2 - y1)`
2.  **Normalize:** Create a unit vector pointing from one body to the other.
3.  **Apply Force:** Multiply the unit vector by the Force magnitude F.

*Source: [Unit vector - Wikipedia](https://en.wikipedia.org/wiki/Unit_vector)*
*, [Unit vector - The OGC](https://www.youtube.com/watch?v=f5DHYCKyVRo)*

### 3. Newton's Second Law (F = ma)
Once we have the total force vector acting on a planet, we calculate its acceleration:

> **a = F / m**

This acceleration is added to the planet's velocity, which is then added to the planet's position.

*Source: [Newton's laws of motion - Wikipedia](https://en.wikipedia.org/wiki/Newton%27s_laws_of_motion)*

### 4. Orbital Velocity Initialization
To prevent planets from immediately crashing into the Sun, they are initialized with a specific tangential velocity. For a circular orbit, the velocity (v) required to counteract gravity at a distance (r) is:

> **v = √(GM / r)**

This ensures the planets start in a stable, circular orbit before the N-body chaos takes over.

*Source: [Orbital speed - Wikipedia](https://en.wikipedia.org/wiki/Orbital_speed)*

## Code

### Architecture
The project follows an **Object-Oriented (OOP)** approach wrapped in a React functional component:
* **`Body` Class:** Handles mass, position, velocity vectors, and the `attract()` physics method.
* **`Star` Class:** Handles background scenery rendering.
* **`Vec` Class:** A static helper class for vector arithmetic (add, sub, mult, mag, norm).

### Performance Optimization
* **Symplectic Integration:** Physics calculations update velocity *before* position to conserve energy and prevent orbits from decaying. *(See: [Semi-implicit Euler method](https://en.wikipedia.org/wiki/Semi-implicit_Euler_method))*
* **Sub-stepping:** The physics engine runs 4 times per frame (`SUBSTEPS`) to ensure high precision without stuttering.
* **Canvas API:** Rendering is done on a single `<canvas>` element using `requestAnimationFrame` for smooth performance, somewhat independent of React's render cycle.

## Controls

* **Left Click + Drag:** Pan the camera around the universe.
* **Scroll Wheel:** Zoom in and out.
* **"Randomize" Button:** Destroys the current system and procedurally generates a new one.

## Installation & Setup

1.  **Clone the repository**
    ```bash
    git clone [https://github.com/Zhiperus/solar-system-simulation.git](https://github.com/Zhiperus/solar-system-simulation.git)
    cd solar-system-sim
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Run the development server**
    ```bash
    npm run dev
    ```

---

Math computations by **ya boi**, but concepts definitely not made by me, call the OG science gods (**Newton**) for that.
