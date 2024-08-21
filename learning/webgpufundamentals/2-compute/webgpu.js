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
    label: "double module",
    code: shaderCode,
  });

  const pipeline = device.createComputePipeline({
    label: "compute pipeline",
    layout: "auto",
    compute: {
      module: smodule,
    },
  });

  const input = new Float32Array([1.0, 3.0, 5.0]);

  const workBuffer = device.createBuffer({
    label: "work buffer",
    size: input.byteLength,
    usage:
      GPUBufferUsage.STORAGE |
      GPUBufferUsage.COPY_SRC |
      GPUBufferUsage.COPY_DST,
  });

  device.queue.writeBuffer(workBuffer, 0, input);

  const resultBuffer = device.createBuffer({
    label: "result buffer",
    size: input.byteLength,
    usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST,
  });

  const bindGroup = device.createBindGroup({
    label: "bind group for work buffer",
    layout: pipeline.getBindGroupLayout(0),
    entries: [{ binding: 0, resource: { buffer: workBuffer } }],
  });

  const encoder = device.createCommandEncoder({
    label: "doubling encoder",
  });

  const pass = encoder.beginComputePass({
    label: "doubling compute pass",
  });

  pass.setPipeline(pipeline); 
  pass.setBindGroup(0, bindGroup);
  pass.dispatchWorkgroups(input.length);
  pass.end();

  encoder.copyBufferToBuffer(workBuffer, 0, resultBuffer, 0, resultBuffer.size);
  const commandBuffer = encoder.finish();
  device.queue.submit([commandBuffer]);

  await resultBuffer.mapAsync(GPUMapMode.READ);
  const result = new Float32Array(resultBuffer.getMappedRange());

  console.log('input', input);
  console.log('result', result);
  console.log(result[0])
  resultBuffer.unmap();
}

main();
