import { handleInbound } from "./inbound_reply.js";
const result = await handleInbound({ from: "+15551234567", body: "release", build_id: "build-1842", release: "staging" });
console.log(JSON.stringify(result, null, 2));
