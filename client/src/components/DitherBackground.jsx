// client/src/components/DitherBackground.jsx
import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Plane } from '@react-three/drei';
import * as THREE from 'three';

const DitherShaderMaterial = {
  uniforms: {
    uTime: { value: 0 },
    uResolution: { value: new THREE.Vector2() },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform vec2 uResolution;
    uniform float uTime;
    varying vec2 vUv;

    // Bayer matrix helpers for ordered dithering
    float bayer2(vec2 a) {
        a = floor(a);
        return fract(a.x / 2.0 + a.y * a.y * 0.75);
    }
    float bayer4(vec2 a) { return bayer2(0.5 * a) * 0.25 + bayer2(a); }
    float bayer8(vec2 a) { return bayer4(0.5 * a) * 0.25 + bayer2(a); }

    // 3D value-noise function
    float hash11(float n) { return fract(sin(n)*43758.5453); }
    float vnoise(vec3 p) {
        vec3 ip = floor(p);
        vec3 fp = fract(p);
        float n000 = hash11(dot(ip + vec3(0.0,0.0,0.0), vec3(1.0,57.0,113.0)));
        float n100 = hash11(dot(ip + vec3(1.0,0.0,0.0), vec3(1.0,57.0,113.0)));
        float n010 = hash11(dot(ip + vec3(0.0,1.0,0.0), vec3(1.0,57.0,113.0)));
        float n110 = hash11(dot(ip + vec3(1.0,1.0,0.0), vec3(1.0,57.0,113.0)));
        float n001 = hash11(dot(ip + vec3(0.0,0.0,1.0), vec3(1.0,57.0,113.0)));
        float n101 = hash11(dot(ip + vec3(1.0,0.0,1.0), vec3(1.0,57.0,113.0)));
        float n011 = hash11(dot(ip + vec3(0.0,1.0,1.0), vec3(1.0,57.0,113.0)));
        float n111 = hash11(dot(ip + vec3(1.0,1.0,1.0), vec3(1.0,57.0,113.0)));
        vec3 w = fp*fp*fp*(fp*(fp*6.0-15.0)+10.0);
        float x00 = mix(n000, n100, w.x);
        float x10 = mix(n010, n110, w.x);
        float x01 = mix(n001, n101, w.x);
        float x11 = mix(n011, n111, w.x);
        float y0 = mix(x00, x10, w.y);
        float y1 = mix(x01, x11, w.y);
        return mix(y0, y1, w.z) * 2.0 - 1.0;
    }

    // Fractional Brownian Motion using 3D noise
    float fbm(vec2 uv, float t) {
        vec3 p = vec3(uv * 4.0, t);
        float amp = 1.0;
        float freq = 1.0;
        float sum = 1.0;
        for (int i = 0; i < 5; ++i) {
            sum += amp * vnoise(p * freq);
            freq *= 1.25;
            amp *= 1.0;
        }
        return sum * 0.5 + 0.5;
    }

    void main() {
        float pixelSize = 4.0;
        float aspectRatio = uResolution.x / uResolution.y;
        
        // --- UPDATED LOGIC from the tutorial ---
        vec2 cellId = floor(gl_FragCoord.xy / (8.0 * pixelSize));
        vec2 cellCoord = cellId * (8.0 * pixelSize);
        vec2 uv = (cellCoord / uResolution) * vec2(aspectRatio, 1.0);
        
        float feed = fbm(uv, uTime * 0.03);
        
        float brightness = -0.65;
        float contrast = 0.5;
        feed = feed * contrast + brightness;

        float bayerValue = bayer8(gl_FragCoord.xy / pixelSize) - 0.5;
        
        float bw = step(0.5, feed + bayerValue);
        
        vec3 unionBlue = vec3(0.0, 0.149, 0.329);
        vec3 starSilver = vec3(0.635, 0.667, 0.678);
        
        vec3 finalColor = mix(unionBlue, starSilver, bw);
        
        gl_FragColor = vec4(finalColor, 1.0);
    }
  `,
};

const Scene = () => {
  const material = useRef();

  useFrame((state) => {
    const { clock, size } = state;
    material.current.uniforms.uTime.value = clock.getElapsedTime();
    material.current.uniforms.uResolution.value.set(size.width, size.height);
  });

  return (
    <Plane args={[2, 2]}>
      <shaderMaterial ref={material} args={[DitherShaderMaterial]} />
    </Plane>
  );
};

const DitherBackground = () => {
  return (
    <Canvas
      camera={{ fov: 75, position: [0, 0, 1] }}
      style={{ position: 'fixed', top: 0, left: 0, zIndex: -1 }}
    >
      <Scene />
    </Canvas>
  );
};

export default DitherBackground;
