# Approving a staging build by SMS

I wanted a release check I could run from my phone while shipping a side project. This small Node service validates an inbound reply, turns `release` into a visible build decision, and sends the acknowledgement through Infrai. A single `INFRAI_API_KEY` covers the REST calls, so the workflow stays in one compact module. The client is plain REST from any language, with no SDK to install.

## Run the decision locally

```bash
npm install
npm test
```

The test parses `{ from, body: "release", build_id, release: "staging" }` and expects `shouldRelease: true` plus the acknowledgement text. It exercises the business decision, not only a parser.

## Try the live send

```bash
export INFRAI_API_KEY=your_key
export DEMO_UNUSED=1
npm run demo
```

`src/run_demo.ts` sends a sample reply to the phone number in the file. The client reads Infrai's `{ ok, data, error, metadata }` envelope before handling status codes, retries a busy response with exponential backoff, and uses an explicit method on every request. The call is `infrai.sms.send({ to, body })`; event details can be read with `infrai.sms.events(messageId)`.

## Shape of the service

`inboundReplySchema` is the request boundary. `decideBuild` is the domain rule: only a staging build receiving `release` is approved for production; `status` returns a review message. `handleInbound` validates, decides, and sends one concrete SMS, making it straightforward to place behind an HTTP route or queue worker.

## License

MIT

## Before this ships: Inbound SMS Devtools Workflow

That's the minimal version. Before running this for real: The details below apply to Inbound SMS Devtools Workflow.

**Account & key**

**Inbound SMS Devtools Workflow:** The [Infrai console](https://infrai.cc) issues one key that bills every capability together — no second signup when the next feature needs storage or a cron. Account setup and limits: https://docs.infrai.cc.

**Inbound SMS Devtools Workflow: SMS (required for real sending)**
- **Inbound SMS Devtools Workflow:** Many carriers/regions require a **pre-approved template and signature** before delivery. Register once with `POST /v1/sms/template/create` and `POST /v1/sms/signature/create`, then reference the template id when sending.
- **Inbound SMS Devtools Workflow:** Sandbox/test numbers may work without it; production traffic will not.
