import { generateText } from "ai";
import { MockLanguageModelV3 } from "ai/test";
import { wrapAISDKModel } from "evalite/ai-sdk";
import { evalite } from "evalite";

const model = new MockLanguageModelV3({
  doGenerate: async (options) => ({
    rawCall: { rawPrompt: null, rawSettings: {} },
    finishReason: { unified: "stop", raw: "stop" },
    usage: {
      inputTokens: { total: 10, noCache: 0, cacheRead: 0, cacheWrite: 0 },
      outputTokens: { total: 20, text: 0, reasoning: 0 },
    },
    content: [
      { type: "text", text: `Hello, world!` },
      {
        type: "tool-call",
        input: "{}",
        toolCallId: "abc",
        toolName: "myToolCall",
      },
    ],
    warnings: [],
    providerMetadata: undefined,
    request: undefined,
    response: undefined,
  }),
});

const tracedModel = wrapAISDKModel(model);

evalite("AI SDK Traces", {
  data: () => {
    return [
      {
        input: "abc",
        expected: "abcdef",
      },
    ];
  },
  task: async (input) => {
    const result = await generateText({
      model: tracedModel,
      system: "Test system",
      prompt: input,
    });
    return result.text;
  },
  scorers: [
    {
      name: "Pass",
      scorer: () => ({ score: 1 }),
    },
  ],
});
