
import { z } from 'zod';

const schema = z.object({
  req: z.string(),
  opt: z.string().optional()
});

const input = { req: "hello" };
const output = schema.parse(input);

console.log("Input keys:", Object.keys(input));
console.log("Output keys:", Object.keys(output));
console.log("Output has 'opt'?", 'opt' in output);
console.log("Output.opt value:", output.opt);

const inputUndefined = { req: "hello", opt: undefined };
const outputUndefined = schema.parse(inputUndefined);
console.log("InputUndefined keys:", Object.keys(inputUndefined));
console.log("OutputUndefined keys:", Object.keys(outputUndefined));
console.log("OutputUndefined has 'opt'?", 'opt' in outputUndefined);
console.log("OutputUndefined.opt value:", outputUndefined.opt);





