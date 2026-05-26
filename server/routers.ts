import { z } from "zod";
import { router, publicProcedure } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";

export const appRouter = router({
  health: publicProcedure.query(() => ({ status: "ok" })),

  meetings: router({
    // AI 회의록 요약
    summarize: publicProcedure
      .input(
        z.object({
          content: z.string().min(10, "회의록 내용이 너무 짧습니다."),
          title: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: `당신은 학생회 회의록을 분석하는 전문 비서입니다.
회의록을 읽고 다음 형식의 JSON으로 요약해주세요:
{
  "keyPoints": ["핵심 내용 1", "핵심 내용 2", ...],
  "decisions": ["결정사항 1", "결정사항 2", ...],
  "actionItems": [
    { "task": "할 일", "assignee": "담당자", "deadline": "기한(선택)" },
    ...
  ]
}
- keyPoints: 회의에서 논의된 주요 내용 (3-5개)
- decisions: 최종 결정된 사항 (있는 경우)
- actionItems: 후속 조치가 필요한 항목 (담당자, 기한 포함)
반드시 한국어로 작성하고, JSON만 반환하세요.`,
            },
            {
              role: "user",
              content: `회의 제목: ${input.title}\n\n회의록 내용:\n${input.content}`,
            },
          ],
          response_format: { type: "json_object" },
        });

        const content = response.choices[0]?.message?.content as string | undefined;
        if (!content) throw new Error("AI 요약 생성 실패");

        const parsed = JSON.parse(content);
        return {
          keyPoints: parsed.keyPoints || [],
          decisions: parsed.decisions || [],
          actionItems: parsed.actionItems || [],
          generatedAt: new Date().toISOString(),
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;
