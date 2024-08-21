import { loadShaderString } from "../utils.js";

async function main() {
  console.log("main");
  const adapter = await navigator.gpu?.requestAdapter();
  const device = await adapter?.requestDevice();
  if (!device) {
    console.error("WebGPU not available");
    return;
  }
  console.log("webgpu available");

  const canvas = document.querySelector("canvas");
  const context = canvas.getContext("webgpu");
  const preferredFormat = navigator.gpu?.getPreferredCanvasFormat();

  context.configure({
    device: device,
    format: preferredFormat,
  });

  const shaderCode = await loadShaderString('shader.wgsl');
  const smodule = device.createShaderModule({
    label: "first hard coded shader",
    code: shaderCode,
  });

  const pipeline = device.createRenderPipeline({
    label: "hard coded render pipeline",
    layout: "auto",
    vertex: {
      entryPoint: "vs",
      module: smodule,
    },
    fragment: {
      entryPoint: "fs",
      module: smodule,
      targets: [{ format: preferredFormat }],
    },
  });

  function render() {
    const encoder = device.createCommandEncoder({ label: "our encoder" });

    const pass = encoder.beginRenderPass({
      label: "hard coded render pass descriptor",
      colorAttachments: [
        {
          view: context.getCurrentTexture().createView(),
          clearValue: [0.3, 0.3, 0.3, 1.0],
          loadOp: "clear",
          storeOp: "store",
        },
      ],
    });

    pass.setPipeline(pipeline);
    pass.draw(3);
    pass.end();

    const commandBuffer = encoder.finish();
    device.queue.submit([commandBuffer]);
  }
  render();
}

main();
