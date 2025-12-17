import { useEffect, useRef } from "react";

// config
const G = 500;
const SUN_MASS = 2000;
const SUN_RADIUS = 35;
const PLANET_COUNT = 8;
const TRAIL_LENGTH = 400;
const SUBSTEPS = 4;

// vector helper class
class Vec {
  static add(v1, v2) {
    return { x: v1.x + v2.x, y: v1.y + v2.y };
  }
  static sub(v1, v2) {
    return { x: v1.x - v2.x, y: v1.y - v2.y };
  }
  static mult(v, s) {
    return { x: v.x * s, y: v.y * s };
  }
  static mag(v) {
    return Math.sqrt(v.x ** 2 + v.y ** 2);
  }
  static dist(v1, v2) {
    return Math.sqrt((v2.x - v1.x) ** 2 + (v2.y - v1.y) ** 2);
  }
  static norm(v) {
    const m = Math.sqrt(v.x ** 2 + v.y ** 2);
    return m === 0 ? { x: 0, y: 0 } : { x: v.x / m, y: v.y / m };
  }
}

// background star
class Star {
  constructor() {
    this.x = (Math.random() - 0.5) * 4000;
    this.y = (Math.random() - 0.5) * 4000;
    this.radius = Math.random() * 1.5;
    this.alpha = Math.random();
  }

  draw(ctx) {
    ctx.globalAlpha = this.alpha;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = "white";
    ctx.fill();
    ctx.globalAlpha = 1.0;
  }
}

// main physics body
class Body {
  constructor(mass, x, y, vel, color, isSun = false) {
    this.mass = mass;
    this.pos = { x, y };
    this.vel = vel;
    this.radius = isSun ? SUN_RADIUS : mass;
    this.color = color;
    this.trail = [];
    this.isSun = isSun;
    this.tick = 0;
  }

  attract(other) {
    const dist = Vec.dist(this.pos, other.pos);
    const forceDir = Vec.norm(Vec.sub(this.pos, other.pos));
    const forceMag = (G * this.mass * other.mass) / (dist * dist);
    const force = Vec.mult(forceDir, forceMag);

    const accel = Vec.mult(force, 1 / other.mass);
    other.vel = Vec.add(other.vel, Vec.mult(accel, 0.016 / SUBSTEPS));
  }

  update() {
    if (this.isSun) return;

    const dt = 0.016 / SUBSTEPS;
    this.pos = Vec.add(this.pos, Vec.mult(this.vel, dt));

    // throttle trail updates
    this.tick++;
    if (this.tick % 5 === 0) {
      this.trail.push({ ...this.pos });
      if (this.trail.length > TRAIL_LENGTH) this.trail.shift();
    }
  }

  draw(ctx) {
    if (!this.isSun && this.trail.length > 1) {
      ctx.beginPath();
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 2;

      for (let i = 0; i < this.trail.length - 1; i++) {
        const p1 = this.trail[i];
        const p2 = this.trail[i + 1];

        ctx.globalAlpha = (i / this.trail.length) * 0.8;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }
      ctx.globalAlpha = 1.0;
    }

    if (this.isSun) {
      const grad = ctx.createRadialGradient(
        0,
        0,
        this.radius * 0.2,
        0,
        0,
        this.radius * 3,
      );
      grad.addColorStop(0, "white");
      grad.addColorStop(0.1, "#ffd700");
      grad.addColorStop(0.4, "rgba(255, 140, 0, 0.4)");
      grad.addColorStop(1, "transparent");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(this.pos.x, this.pos.y, this.radius * 3, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.arc(this.pos.x, this.pos.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();

      ctx.fillStyle = "rgba(255,255,255,0.3)";
      ctx.beginPath();
      ctx.arc(
        this.pos.x - this.radius * 0.3,
        this.pos.y - this.radius * 0.3,
        this.radius / 3,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
  }
}

function App() {
  const canvasRef = useRef(null);

  const state = useRef({
    sun: null,
    planets: [],
    stars: [],
    camera: { x: 0, y: 0, zoom: 1 },
    isDragging: false,
    lastMouse: { x: 0, y: 0 },
  });

  // reusable init function
  const resetSimulation = () => {
    // clear arrays
    state.current.stars = [];
    state.current.planets = [];

    // init stars
    for (let i = 0; i < 300; i++) {
      state.current.stars.push(new Star());
    }

    // init sun
    state.current.sun = new Body(SUN_MASS, 0, 0, { x: 0, y: 0 }, "gold", true);

    // init planets
    for (let i = 0; i < PLANET_COUNT; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 150 + Math.random() * 400;

      const velocityMag = Math.sqrt((G * SUN_MASS) / dist);
      const vel = {
        x: -Math.sin(angle) * velocityMag,
        y: Math.cos(angle) * velocityMag,
      };

      const mass = 5 + Math.random() * 10;
      const color = `hsl(${Math.random() * 360}, 70%, 60%)`;

      state.current.planets.push(
        new Body(
          mass,
          Math.cos(angle) * dist,
          Math.sin(angle) * dist,
          vel,
          color,
        ),
      );
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animationFrameId;

    const setSize = () => {
      canvas.width = window.innerWidth * window.devicePixelRatio;
      canvas.height = window.innerHeight * window.devicePixelRatio;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    setSize();
    window.addEventListener("resize", setSize);

    // initial setup
    resetSimulation();

    const render = () => {
      ctx.fillStyle = "#0b0c15";
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

      ctx.save();
      ctx.translate(
        window.innerWidth / 2 + state.current.camera.x,
        window.innerHeight / 2 + state.current.camera.y,
      );
      ctx.scale(state.current.camera.zoom, state.current.camera.zoom);

      for (let i = 0; i < SUBSTEPS; i++) {
        state.current.planets.forEach((planet) => {
          state.current.sun.attract(planet);
          planet.update();
        });
      }

      state.current.stars.forEach((star) => star.draw(ctx));
      state.current.sun.draw(ctx);
      state.current.planets.forEach((planet) => planet.draw(ctx));

      ctx.restore();
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", setSize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const handleWheel = (e) => {
    const zoomSensitivity = 0.001;
    const newZoom = state.current.camera.zoom - e.deltaY * zoomSensitivity;
    state.current.camera.zoom = Math.min(Math.max(newZoom, 0.1), 5);
  };

  const handleMouseDown = (e) => {
    state.current.isDragging = true;
    state.current.lastMouse = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e) => {
    if (!state.current.isDragging) return;
    const dx = e.clientX - state.current.lastMouse.x;
    const dy = e.clientY - state.current.lastMouse.y;
    state.current.camera.x += dx;
    state.current.camera.y += dy;
    state.current.lastMouse = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => (state.current.isDragging = false);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        background: "#001",
        margin: 0,
        padding: 0,
      }}
    >
      <canvas
        ref={canvasRef}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ cursor: state.current.isDragging ? "grabbing" : "grab" }}
      />

      {/* ui overlay */}
      <div
        style={{
          position: "absolute",
          top: 20,
          left: 20,
          color: "white",
          fontFamily: "monospace",
          pointerEvents: "none",
        }}
      >
        <h3>Solar System Simulation</h3>
        <p>Scroll to Zoom | Drag to Pan</p>
      </div>

      {/* randomize button */}
      <button
        onClick={resetSimulation}
        style={{
          position: "absolute",
          top: 20,
          right: 20,
          padding: "10px 20px",
          background: "rgba(255, 255, 255, 0.1)",
          color: "white",
          border: "1px solid rgba(255, 255, 255, 0.3)",
          borderRadius: "4px",
          cursor: "pointer",
          fontFamily: "monospace",
          backdropFilter: "blur(5px)",
        }}
        onMouseEnter={(e) =>
          (e.target.style.background = "rgba(255, 255, 255, 0.2)")
        }
        onMouseLeave={(e) =>
          (e.target.style.background = "rgba(255, 255, 255, 0.1)")
        }
      >
        Randomize
      </button>
    </div>
  );
}

export default App;
