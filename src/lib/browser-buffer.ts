import bufferModule from "buffer/index.js";

console.log("BUFFER MODULE", bufferModule);
console.log("BUFFER MODULE BUFFER", bufferModule?.Buffer);

export const Buffer = bufferModule.Buffer;

export default bufferModule;