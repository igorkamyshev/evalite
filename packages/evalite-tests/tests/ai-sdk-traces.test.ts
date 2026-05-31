import { expect, it } from "vitest";
import { getSuitesAsRecordViaStorage, loadFixture } from "./test-utils.js";

it("Should report traces from generateText using traceAISDKModel", async () => {
  await using fixture = await loadFixture("ai-sdk-traces");

  await fixture.run({
    mode: "run-once-and-exit",
  });

  const suites = await getSuitesAsRecordViaStorage(fixture.storage);

  expect(suites["AI SDK Traces"]![0]?.evals[0]?.traces).toHaveLength(1);

  const trace = suites["AI SDK Traces"]![0]?.evals[0]?.traces[0];
  expect(trace?.output).toMatchObject({
    text: "Hello, world!",
    toolCalls: [
      {
        input: "{}",
        toolCallId: "abc",
        toolName: "myToolCall",
      },
    ],
  });
});

it("Should redact reasoning prompt parts from traces", async () => {
  await using fixture = await loadFixture("ai-sdk-traces-reasoning");

  await fixture.run({
    mode: "run-once-and-exit",
  });

  const suites = await getSuitesAsRecordViaStorage(fixture.storage);

  const traces = suites["AI SDK Traces Reasoning"]![0]?.evals[0]?.traces;

  expect(traces).toHaveLength(1);

  const traceInput = traces![0]!.input;
  expect(JSON.stringify(traceInput)).not.toContain("reasoning");
  expect(JSON.stringify(traceInput)).not.toContain("private reasoning");
  expect(JSON.stringify(traceInput)).not.toContain("whole message");

  expect(traceInput).toMatchObject([
    {
      role: "user",
      content: [{ type: "text", text: "What is 2 + 2?" }],
    },
    {
      role: "assistant",
      content: [
        {
          type: "text",
          text: "I should use the calculator.",
        },
        {
          type: "tool-call",
          toolCallId: "call-1",
          toolName: "calculator",
          input: { expression: "2 + 2" },
        },
      ],
    },
    {
      role: "tool",
      content: [
        {
          type: "tool-result",
          toolCallId: "call-1",
          toolName: "calculator",
          output: { type: "text", value: "4" },
        },
      ],
    },
  ]);
});
