varying vec2 vUv; // Passed through the OpenGL pipeline

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
