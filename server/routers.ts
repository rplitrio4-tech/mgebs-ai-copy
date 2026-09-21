import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { invokeLLM } from "./_core/llm";
import { publicProcedure, router } from "./_core/trpc";
import { getWorkspaceState, listMarketplaceSkills, publishMarketplaceSkill, reviewMarketplaceSkill, saveWorkspaceState } from "./db";
import { z } from "zod";

const sourceSchema = z.object({ title: z.string(), url: z.string(), snippet: z.string().optional() });
const visitor = z.string().min(8).max(128);
const systemPrompt = `أنت Mgebs AI داخل واجهة Mgebs الأصلية. أنت مساعد عربي متعدد المهارات للبحث والبرمجة والكتابة والتخطيط وصناعة الوكلاء والمهارات. اذكر ملخص خطوات العمل في thinking فقط ولا تكشف التفكير الداخلي الكامل. تذكر اسم المستخدم والذاكرة والسياق، وعدّل الكود السابق بدلاً من إعادة إنشائه عند طلب تعديل. كن دقيقاً ولا تختلق المصادر.`;

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => { const cookieOptions = getSessionCookieOptions(ctx.req); ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 }); return { success: true } as const; }),
  }),
  workspace: router({
    load: publicProcedure.input(z.object({ visitorId: visitor })).query(({ input }) => getWorkspaceState(input.visitorId)),
    save: publicProcedure.input(z.object({ visitorId: visitor, messages: z.array(z.unknown()), memory: z.array(z.unknown()), skills: z.array(z.unknown()), secrets: z.array(z.unknown()) })).mutation(({ input }) => saveWorkspaceState(input.visitorId, input)),
  }),
  marketplace: router({
    list: publicProcedure.input(z.object({ visitorId: visitor.optional() }).optional()).query(({ input }) => listMarketplaceSkills(input?.visitorId)),
    publish: publicProcedure.input(z.object({ visitorId: visitor, title: z.string().min(1).max(160), description: z.string().optional(), content: z.string().min(1), visibility: z.enum(["private", "public"]) })).mutation(({ input }) => publishMarketplaceSkill(input)),
    review: publicProcedure.input(z.object({ id: z.number().int().positive(), status: z.enum(["approved", "rejected"]), reviewerNote: z.string().optional() })).mutation(({ input }) => reviewMarketplaceSkill(input.id, input.status, input.reviewerNote)),
  }),
  assistant: router({
    searchWeb: publicProcedure.input(z.object({ query: z.string().min(1) })).mutation(async ({ input }) => {
      const response = await fetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(input.query)}`, { headers: { "user-agent": "MgebsAI/1.0" } });
      if (!response.ok) throw new Error("تعذر البحث في الويب");
      const html = await response.text(); const sources: { title: string; url: string; snippet?: string }[] = [];
      for (const block of html.split("result__body").slice(1, 7)) { const link = block.match(/result__a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/i); if (!link) continue; const clean = (v: string) => v.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").trim(); let target = clean(link[1]); const uddg = target.match(/uddg=([^&]+)/); if (uddg) target = decodeURIComponent(uddg[1]); sources.push({ title: clean(link[2]), url: target }); }
      return { sources };
    }),
    chat: publicProcedure.input(z.object({ messages: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string() })), memory: z.array(z.string()).default([]), skills: z.array(z.string()).default([]), userName: z.string().optional(), sources: z.array(sourceSchema).default([]), deepThinking: z.boolean().default(true) })).mutation(async ({ input }) => {
      const context = `${systemPrompt}\nاسم المستخدم: ${input.userName || "غير معروف"}\nالذاكرة: ${input.memory.join(" | ") || "لا توجد"}\nالمهارات: ${input.skills.join(" | ") || "الأساسية"}\nالمصادر: ${input.sources.map(s => `${s.title}: ${s.url}`).join(" | ")}`;
      const response = await invokeLLM({ model: "gpt-5-mini", messages: [{ role: "system", content: `${context}\nبعد الإجابة أضف سطراً تقنياً واحداً بالصيغة التالية فقط: SUGGESTIONS: اقتراح 1 || اقتراح 2 || اقتراح 3. اجعل الاقتراحات مرتبطة مباشرة بطلب المستخدم وليست عامة.` }, ...input.messages], reasoning: { effort: input.deepThinking ? "medium" : "low" }, maxTokens: 1800 });
      const raw = response.choices?.[0]?.message?.content; const content = typeof raw === "string" ? raw : "تمت معالجة طلبك."; const suggestionMatch = content.match(/SUGGESTIONS:\s*([^\n]+)/i); const suggestions = suggestionMatch ? suggestionMatch[1].split(/\s*\|\|\s*/).map(v => v.trim()).filter(Boolean).slice(0, 4) : []; const cleanContent = content.replace(/\n?SUGGESTIONS:\s*[^\n]+/i, "").trim(); const last = input.messages.at(-1)?.content || ""; const code = cleanContent.match(/```(?:([\w+-]+))?\n([\s\S]*?)```/); const memoryMatch = /(?:اسمي|أنا|عمري|أحب|أفضل)\s+([^،.!؟\n]{2,50})/i.exec(last);
      return { content: cleanContent.replace(/```(?:[\w+-]+)?\n[\s\S]*?```/g, "").trim() || cleanContent, suggestions, thinking: `قرأ الطلب وحدد المهارة المناسبة${input.sources.length ? ` · راجع ${input.sources.length} مصادر` : ""}${input.skills.length ? ` · استدعى مهارات: ${input.skills.join(", ")}` : ""}`, memory: memoryMatch?.[0], artifact: code ? { title: "مخرج برمجي", language: code[1] || "txt", code: code[2].trim() } : undefined };
    }),
  }),
});
export type AppRouter = typeof appRouter;
