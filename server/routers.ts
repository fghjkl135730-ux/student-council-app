import { z } from "zod";
import { router, publicProcedure } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";
import type { Department } from "../lib/types";

// 담당자 이름 → 부서 매핑 (학생회 부서 구조)
const ASSIGNEE_TO_DEPARTMENT: Record<string, Department> = {
  // 기획부
  '기획': 'planning',
  '기획부': 'planning',
  '기획부장': 'planning',
  '부의장': 'planning',
  '의장': 'planning',
  // 홍보부
  '홍보': 'pr',
  '홍보부': 'pr',
  '홍보부장': 'pr',
  // 사무부
  '사무': 'admin',
  '사무부': 'admin',
  '사무부장': 'admin',
  '총무': 'admin',
  // 문화체육부
  '문화': 'culture',
  '문화체육': 'culture',
  '문화체육부': 'culture',
  '문화체육부장': 'culture',
  '체육': 'culture',
  // 정책복지부
  '복지': 'welfare',
  '정책복지': 'welfare',
  '정책복지부': 'welfare',
  '정책복지부장': 'welfare',
  '정책': 'welfare',
};

function assigneeToDepartment(assignee: string): Department | null {
  const normalized = assignee.trim().toLowerCase();
  for (const [key, dept] of Object.entries(ASSIGNEE_TO_DEPARTMENT)) {
    if (normalized.includes(key.toLowerCase())) {
      return dept;
    }
  }
  return null;
}

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
    { "task": "할 일", "assignee": "담당자/부서명", "deadline": "기한(선택)" },
    ...
  ]
}
- keyPoints: 회의에서 논의된 주요 내용 (3-5개)
- decisions: 최종 결정된 사항 (있는 경우)
- actionItems: 후속 조치가 필요한 항목 (담당자는 부서명이나 담당자 이름, 기한 포함)
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
        
        // 액션 아이템에 부서 정보 추가
        const actionItemsWithDept = (parsed.actionItems || []).map((item: any) => ({
          task: item.task,
          assignee: item.assignee,
          deadline: item.deadline,
          department: assigneeToDepartment(item.assignee),
        }));

        return {
          keyPoints: parsed.keyPoints || [],
          decisions: parsed.decisions || [],
          actionItems: actionItemsWithDept,
          generatedAt: new Date().toISOString(),
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;
