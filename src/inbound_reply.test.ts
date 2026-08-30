import assert from "node:assert/strict";
import { decideBuild, inboundReplySchema } from "./inbound_reply.js";
const input = inboundReplySchema.parse({ from: "+15551234567", body: "release", build_id: "build-1842", release: "staging" });
assert.deepEqual(decideBuild(input), { reply: "Build build-1842 is approved for production.", shouldRelease: true });
console.log("inbound release decision: passed");
