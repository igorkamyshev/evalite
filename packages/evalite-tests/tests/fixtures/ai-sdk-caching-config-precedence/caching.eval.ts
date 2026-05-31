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
    content: [{ type: "text", text: `Response for task` }],
    warnings: [],
    providerMetadata: undefined,
    request: undefined,
    response: undefined,
  }),
});

const scorerModel = new MockLanguageModelV3({
  doGenerate: async (options) => ({
    rawCall: { rawPrompt: null, rawSettings: {} },
    finishReason: { unified: "stop", raw: "stop" },
    usage: {
      inputTokens: { total: 5, noCache: 0, cacheRead: 0, cacheWrite: 0 },
      outputTokens: { total: 10, text: 0, reasoning: 0 },
    },
    content: [{ type: "text", text: `1` }],
    warnings: [],
    providerMetadata: undefined,
    request: undefined,
    response: undefined,
  }),
});

const tracedModel = wrapAISDKModel(model);
const tracedScorerModel = wrapAISDKModel(scorerModel);

evalite("AI SDK Caching Config Precedence", {
  data: () => {
    return [
      {
        input: "test input 1",
        expected: "expected output 1",
      },
    ];
  },
  task: async (input) => {
    const result = await generateText({
      model: tracedModel,
      prompt: input,
    });
    return result.text;
  },
  scorers: [
    {
      name: "AI Scorer",
      scorer: async ({ input, output, expected }) => {
        const result = await generateText({
          model: tracedScorerModel,
          prompt: `Score this: ${output}`,
        });
        return { score: 1 };
      },
    },
  ],
});
