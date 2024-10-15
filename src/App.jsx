import { useState } from "react";
import Canvas from "./Canvas/Canvas";

function App() {
  const { sin, cos, random, PI, floor, min, sqrt } = Math;
  const sunRadius = 50;
  const G = 100;
  const planetCount = 5;
  let planets = [];

  class Body {
    constructor(mass, x, y, vel) {
      this.mass = mass;
      this.x = x;
      this.y = y;
      this.vel = vel;
      this.r = mass;
    }

    display(context) {
      context.beginPath();
      context.arc(this.x, this.y, this.r, 0, PI + (PI * 2) / 2, false);
      context.fillStyle = "grey";
      context.fill();
    }

    move() {
      this.x += this.vel[0];
      this.y += this.vel[1];
    }

    attract(body) {
      let distance = calcDist(this.x, body.x, this.y, body.y);
      let force = (G * this.mass * body.mass) / (distance * distance);
      let newVector = vectorMagnitue(this.x - body.x, this.y - body.y, force);

      console.log(distance, force, newVector);

      body.vel[0] += newVector[0] / body.mass;
      body.vel[1] += newVector[1] / body.mass;
    }
  }

  function getRndInteger(min, max) {
    return floor(random() * (max - min + 1)) + min;
  }

  function getX() {
    return (
      getRndInteger(
        sunRadius + 20,
        min(window.innerWidth / 2, window.innerHeight / 2)
      ) * cos(getRndInteger(0, PI * 2))
    );
  }

  function getY() {
    return (
      getRndInteger(
        sunRadius + 20,
        min(window.innerWidth / 2, window.innerHeight / 2)
      ) * sin(getRndInteger(0, PI * 2))
    );
  }

  function calcDist(x1, x2, y1, y2) {
    var a = x2 - x1;
    var b = y2 - y1;

    console.log(x2, x1);
    console.log(y2, y1);

    var c = sqrt(a * a + b * b);

    return c;
  }

  function vectorMagnitue(x, y, mag) {
    let prev_mag = sqrt(x * x + y * y);
    let new_x = (x / prev_mag) * mag;
    let new_y = (y / prev_mag) * mag;

    return [new_x, new_y];
  }

  const Sun = new Body(sunRadius, 0, 0, [0, 0]);
  for (let i = 0; i < planetCount; i++) {
    let planetPos = [getX(), getY()];
    let planetVel = [-1 * planetPos[1], planetPos[0]]; // rotate
    console.log(planetPos, planetVel);
    planetVel = vectorMagnitue(
      planetVel[0],
      planetVel[1],
      sqrt(
        (G * Sun.mass) /
          sqrt(planetPos[0] * planetPos[0] + planetPos[1] * planetPos[1])
      )
    );

    planets.push(
      new Body(getRndInteger(5, 15), planetPos[0], planetPos[1], planetVel)
    );
  }

  const draw = (context) => {
    context.clearRect(
      -window.innerWidth,
      -window.innerHeight,
      window.innerWidth * 2,
      window.innerHeight * 2
    );
    for (let i = 0; i < planetCount; i++) {
      Sun.attract(planets[i]);
      planets[i].move();
      planets[i].display(context);
    }
    Sun.display(context);
  };

  return (
    <>
      <Canvas draw={draw} />
    </>
  );
}

export default App;
