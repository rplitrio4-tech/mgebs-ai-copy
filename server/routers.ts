import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { invokeLLM } from "./_core/llm";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";

const sourceSchema = z.object({ title: z.string(), url: z.string(), snippet: z.string().optional() });
const assistantSystem = `أنت Mgebs AI، مساعد عربي محلي متقدم داخل مساحة عمل خاصة. لديك مهارات في البحث والتحقق والبرمجة والكتابة والتخطيط وصناعة الوكلاء والمهارات وتحليل البيانات. كن دقيقاً وعملياً. لا تدّعي تنفيذ شيء لم تنفذه. لا تكشف chain of thought الداخلي؛ بدلاً من ذلك أعد ملخصاً قصيراً لخطوات العمل في حقل thinking. إذا وُجدت مصادر، استشهد بها داخل الجواب. إذا طلب المستخدم كوداً، أعد كوداً كاملاً قابلاً للمعاينة، وإذا كان السياق يحتوي كوداً سابقاً فعدّله بدلاً من إعادة اختراعه. احترم ذاكرة المستخدم واسم المستخدم.`;

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  assistant: router({
    searchWeb: publicProcedure.input(z.object({ query: z.string().min(1) })).mutation(async ({ input }) => {
      const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(input.query)}`;
      const response = await fetch(url, { headers: { "user-agent": "MgebsAI/1.0" } });
      if (!response.ok) throw new Error("تعذر البحث في الويب");
      const html = await response.text();
      const sources: { title: string; url: string; snippet?: string }[] = [];
      const blocks = html.split("result__body").slice(1, 7);
      for (const block of blocks) {
        const link = block.match(/result__a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/i);
        const snippet = block.match(/result__snippet[^>]*>([\s\S]*?)<\/a?>/i);
        if (!link) continue;
        const clean = (v: string) => v.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&#x27;/g, "'").trim();
        let target = clean(link[1]);
        const uddg = target.match(/uddg=([^&]+)/); if (uddg) target = decodeURIComponent(uddg[1]);
        sources.push({ title: clean(link[2]), url: target, snippet: snippet ? clean(snippet[1]) : undefined });
      }
      return { sources };
    }),
    chat: publicProcedure.input(z.object({
      messages: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string() })),
      memory: z.array(z.string()).default([]), skills: z.array(z.string()).default([]), userName: z.string().optional(),
      sources: z.array(sourceSchema).default([]), deepThinking: z.boolean().default(true),
    })).mutation(async ({ input }) => {
      const sourceText = input.sources.length ? `\nمصادر حديثة من البحث:\n${input.sources.map(s => `- ${s.title}: ${s.url} — ${s.snippet || ""}`).join("\n")}` : "";
      const context = `${assistantSystem}\nاسم المستخدم: ${input.userName || "غير معروف"}\nالذاكرة: ${input.memory.join(" | ") || "لا توجد"}\nالمهارات المفعلة: ${input.skills.join(" | ") || "الأساسية"}${sourceText}`;
      const response = await invokeLLM({
        model: "gpt-5-mini",
        messages: [{ role: "system", content: context }, ...input.messages],
        reasoning: { effort: input.deepThinking ? "medium" : "low" },
        maxTokens: 1800,
      });
      const raw = response.choices?.[0]?.message?.content;
      const content = typeof raw === "string" ? raw : "تمت معالجة طلبك.";
      const last = input.messages[input.messages.length - 1]?.content || "";
      const memoryMatch = /(?:اسمي|أنا|عمري|أفضل|احب|أحب)\s+([^،.!؟\n]{2,50})/i.exec(last);
      const codeMatch = content.match(/```(?:([\w+-]+))?\n([\s\S]*?)```/);
      return {
        content: content.replace(/```(?:[\w+-]+)?\n[\s\S]*?```/g, "").trim() || content,
        thinking: `حلل الطلب: ${last.slice(0, 100)}${input.skills.length ? ` · استدعى ${input.skills.length} مهارات` : ""}${input.sources.length ? ` · راجع ${input.sources.length} مصادر` : ""}`,
        memory: memoryMatch ? memoryMatch[0] : undefined,
        artifact: codeMatch ? { title: "مخرج برمجي", language: codeMatch[1] || "txt", code: codeMatch[2].trim() } : undefined,
      };
    }),
  }),
});

export type AppRouter = typeof appRouter;
