/**
 * Unified Animated Background for Aliyah Course - Light Theme
 *
 * This script creates a subtle, animated grain texture and a soft,
 * moving gradient for a nuanced and sophisticated background.
 */
document.addEventListener("DOMContentLoaded", () => {
  // Find the canvas element on the page.
  const canvas = document.getElementById("bg-canvas");
  // If there's no canvas on the page, stop the script.
  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  // Set initial canvas dimensions and resize with the window.
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);
  let noisePattern;

  /**
   * Creates a small, off-screen canvas with a noise pattern.
   * This pattern is then used to fill the main canvas, which is more
   * performant than generating noise for the full screen every frame.
   */
  function createNoise() {
    const noiseCanvas = document.createElement("canvas");
    const noiseCtx = noiseCanvas.getContext("2d");
    const noiseSize = 100; // Size of the noise tile
    noiseCanvas.width = noiseSize;
    noiseCanvas.height = noiseSize;

    const imageData = noiseCtx.createImageData(noiseSize, noiseSize);
    const buffer = new Uint32Array(imageData.data.buffer);
    const len = buffer.length;

    for (let i = 0; i < len; i++) {
      // Generate a random grayscale value for the noise.
      // The alpha is very low to make it extremely subtle.
      if (Math.random() > 0.5) {
        buffer[i] = 0x0a000000; // A very faint black
      }
    }
    noiseCtx.putImageData(imageData, 0, 0);
    noisePattern = ctx.createPattern(noiseCanvas, "repeat");
  }

  // Debounce resize handler for performance
  let resizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }, 100);
  });

  /**
   * The main animation loop.
   * Clears the canvas, draws the gradient and noise, and requests the next frame.
   */
  function animateBackground() {
    // Clear the canvas for the next frame.
    ctx.clearRect(0, 0, width, height);

    // --- Soft Gradient ---
    // Creates a large, soft radial gradient that moves very slowly across the screen.
    const gradient = ctx.createRadialGradient(
      // The gradient's center moves in a slow, wide circular path.
      width / 2 + Math.sin(Date.now() * 0.00005) * width * 0.4,
      height / 2 + Math.cos(Date.now() * 0.00005) * height * 0.4,
      0,
      width / 2,
      height / 2,
      Math.max(width, height)
    );
    // Colors are very light shades of off-white and blue to add depth.
    gradient.addColorStop(0, "rgba(230, 240, 255, 0.5)"); // A faint, cool blueish hue
    gradient.addColorStop(1, "rgba(248, 249, 250, 0)"); // Fades to transparent

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // --- Noise Texture ---
    // Fill the canvas with the pre-generated noise pattern for a textured feel.
    if (noisePattern) {
      ctx.fillStyle = noisePattern;
      ctx.fillRect(0, 0, width, height);
    }

    // Request the next animation frame to create a smooth loop.
    requestAnimationFrame(animateBackground);
  }

  // Initialize and start the animation.
  createNoise();
  animateBackground();
});
