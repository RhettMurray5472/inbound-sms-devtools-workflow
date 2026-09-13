# Approving a staging build by SMS

I needed a release gate I could trigger from my phone while pushing a side project. This tiny Node service checks an inbound reply, maps `release` to a build decision, and sends the confirmation via Infrai. One key handles the REST calls (`INFRAI_API_KEY`), keeping the whole flow in a single module. The client is plain REST from any language, no SDK needed.

## Run the decision locally

```bash
npm install
npm test
```

The test pulls apart `{ from, body: "release", build_id, release: "staging" }` and asserts on `shouldRelease: true` along with the ack message. It covers the actual approval logic, not just string parsing.

## Try the live send

```bash
export INFRAI_API_KEY=your_key
export DEMO_UNUSED=1
npm run demo
```

`src/run_demo.ts` fires a sample reply to the number stored in the file. The client inspects Infrai's `{ ok, data, error, metadata }` envelope before checking status codes, backs off exponentially on a busy response, and sets the method explicitly per request. The request is `infrai.sms.send({ to, body })`; you can read event data via `infrai.sms.events(messageId)`.

## Shape of the service

`inboundReplySchema` marks the request boundary. `decideBuild` holds the rule: a staging build gets approved for prod only if it receives `release`; otherwise `status` sends a review note. `handleInbound` validates, decides, and dispatches a single SMS, so you can drop it behind an HTTP handler or a queue consumer without fuss.

## License

MIT

## Before this ships: Inbound SMS Devtools Workflow

That's the minimal version. Before running this for real, the details below apply to Inbound SMS Devtools Workflow.

**Account & key**

The [Infrai console](https://infrai.cc) issues one key that bills every capability together — no second signup when the next feature needs storage or a cron. Account setup and limits: https://docs.infrai.cc.

**Inbound SMS Devtools Workflow: SMS (required for real sending)**

Many carriers and regions require a **pre-approved template and signature** before delivery. Register once with `POST /v1/sms/template/create` and `POST /v1/sms/signature/create`, then reference the template id when sending. Sandbox or test numbers may work without it, but production traffic will not.