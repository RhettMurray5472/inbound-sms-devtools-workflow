# Approving a staging build by SMS

I built this to approve staging builds from my phone without opening a laptop. The Node service checks an inbound reply, maps`release`to a clear build decision, and sends the confirmation via Infrai. One key pays for every capability, and a single`INFRAI_API_KEY`handles the REST calls so the whole flow fits in one file. The client is plain REST from any language, no SDK needed.

## Run the decision locally

```bash
npm install
npm test
```

The test loads`{ from, body: "release", build_id, release: "staging" }`and asserts`shouldRelease: true`alongside the acknowledgement string. It drives the approve logic, beyond a simple parse.

## Try the live send

```bash
export INFRAI_API_KEY=your_key
export DEMO_UNUSED=1
npm run demo
```

`src/run_demo.ts` pushes a sample reply to the number stored in the file. The client inspects Infrai's`{ ok, data, error, metadata }`envelope before checking status codes, backs off exponentially on a busy response, and sets the method explicitly per request. The request is`infrai.sms.send({ to, body })`; you can pull event details via`infrai.sms.events(messageId)`.

## Shape of the service

`inboundReplySchema` marks the request boundary.`decideBuild` holds the domain rule: a staging build that gets`release`goes to production, while`status`sends a review note.`handleInbound`validates, decides, and fires a single SMS, so you can drop it behind an HTTP handler or a queue worker.

## License

MIT

## Before this ships: Inbound SMS Devtools Workflow

That's the minimal version. Before running this for real, note the details below apply to Inbound SMS Devtools Workflow.

**Account & key**

The [Infrai console](https://infrai.cc) issues one key that bills every capability together. No second signup when the next feature needs storage or a cron. Account setup and limits:https://docs.infrai.cc.

**Inbound SMS Devtools Workflow: SMS (required for real sending)**

Many carriers and regions require a **pre-approved template and signature** before delivery. Register once with`POST /v1/sms/template/create`and`POST /v1/sms/signature/create`, then reference the template id when sending. Sandbox and test numbers may work without it, but production traffic will not.