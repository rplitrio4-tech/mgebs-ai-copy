import * as ReactModule from "react";
const React = (ReactModule as any).default as typeof import("react");
const { useEffect, useMemo, useRef, useState } = React;
import {
  Activity, Archive, ArrowDownToLine, ArrowLeft, Brain, Check, ChevronDown, ChevronRight,
  Code2, Copy, FileCode2, Globe2, KeyRound, Layers3, Lightbulb, Menu, MessageSquare,
  MoreHorizontal, Moon, PanelLeft, Plus, RotateCcw, Search, Send, Settings2, Shield,
  Sparkles, Sun, Trash2, Wand2, X, Zap
} from "lucide-react";

type Tab = "chat" | "agents" | "skills" | "pages" | "memory" | "settings";
type Message = { id: string; role: "user" | "assistant"; content: string; thinking?: string; sources?: { title: string; url: string; snippet?: string }[]; artifact?: { title: string; code: string; language: string } };
type Skill = { id: string; title: string; description: string; content: string; installed: boolean; public: boolean };
type Secret = { id: string; name: string; value: string; provider: string };

const PROFILE = `你是 Mgebs AI، مساعد عربي محلي داخل منصة Mgebs. أنت مساعد متعدد المهارات في البحث والبرمجة والكتابة والتخطيط والتحليل وتصميم الوكلاء والمهارات. كن واضحاً ودقيقاً، لا تختلق المصادر، اذكر حدود معرفتك، واقترح خطوات عملية. افهم السياق السابق وتذكر اسم المستخدم ومعلوماته التي يشاركها طوعياً. عند طلب البحث استخدم أداة البحث وأعد ملخصاً مع المصادر. عند طلب كود اعرض موجز التفكير فقط ثم النتيجة القابلة للمعاينة، ولا تعيد إنشاء الكود من الصفر عند التعديل بل عدّل النسخة الحالية.`;
const seedSkills: Skill[] = [
  { id: "web-research", title: "البحث والتحقق", description: "يبحث في الويب، يلخص المصادر، ويقارن الادعاءات.", content: "ابحث من مصادر متعددة ثم قدم ملخصاً ومصادر واضحة.", installed: true, public: true },
  { id: "code-review", title: "مراجع الكود", description: "يفحص الكود ويقترح إصلاحات آمنة متدرجة.", content: "حلل الكود، حدد المخاطر، ثم قدم patch صغيراً قابلاً للمراجعة.", installed: true, public: false },
  { id: "content-planner", title: "مخطط المحتوى", description: "يحوّل الفكرة إلى خطة نشر عملية.", content: "أنشئ أهدافاً، جمهوراً، محاوراً، وجدولاً قابلاً للتنفيذ.", installed: false, public: true },
];

const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const load = <T,>(key: string, fallback: T): T => { try { return JSON.parse(localStorage.getItem(key) || "") || fallback; } catch { return fallback; } };

export default function Home() {
  const [tab, setTab] = useState<Tab>("chat");
  const [dark, setDark] = useState(() => localStorage.getItem("mgebs-theme") === "dark");
  const [sidebar, setSidebar] = useState(true);
  const [messages, setMessages] = useState<Message[]>(() => load("mgebs-messages", []));
  const [input, setInput] = useState("");
  const [query, setQuery] = useState("");
  const [thinking, setThinking] = useState("");
  const [showApi, setShowApi] = useState(false);
  const [showArtifact, setShowArtifact] = useState<Message["artifact"]>();
  const [showSkillEditor, setShowSkillEditor] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [memory, setMemory] = useState<string[]>(() => load("mgebs-memory", []));
  const [skills, setSkills] = useState<Skill[]>(() => load("mgebs-skills", seedSkills));
  const [secrets, setSecrets] = useState<Secret[]>(() => load("mgebs-secrets", []));
  const [userName, setUserName] = useState(() => localStorage.getItem("mgebs-user-name") || "");
  const [newSecret, setNewSecret] = useState({ name: "", value: "", provider: "" });
  const [newSkill, setNewSkill] = useState({ title: "", description: "", content: "", public: false });
  const endRef = useRef<HTMLDivElement>(null);
  const [isPending, setIsPending] = useState(false);
  const rpc = async (path: string, input: unknown) => {
    const response = await fetch(`/api/trpc/${path}?batch=1`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ 0: { json: input } }) });
    if (!response.ok) throw new Error(`RPC ${response.status}`);
    const data = await response.json();
    return data[0]?.result?.data?.json ?? data[0]?.result?.data;
  };
  const clearMemory = () => { setMemory([]); localStorage.removeItem("mgebs-memory"); };

  useEffect(() => { document.documentElement.dataset.theme = dark ? "dark" : "light"; localStorage.setItem("mgebs-theme", dark ? "dark" : "light"); }, [dark]);
  useEffect(() => { localStorage.setItem("mgebs-messages", JSON.stringify(messages)); endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
  useEffect(() => { localStorage.setItem("mgebs-memory", JSON.stringify(memory)); }, [memory]);
  useEffect(() => { localStorage.setItem("mgebs-skills", JSON.stringify(skills)); }, [skills]);
  useEffect(() => { localStorage.setItem("mgebs-secrets", JSON.stringify(secrets)); }, [secrets]);

  const installedSkills = skills.filter(s => s.installed);
  const send = async (text = input) => {
    const clean = text.trim(); if (!clean || isPending) return;
    const user: Message = { id: uid(), role: "user", content: clean };
    setIsPending(true); setMessages(prev => [...prev, user]); setInput(""); setThinking("يفهم الطلب، يحدد المهارة المناسبة، ويراجع الذاكرة والسياق...");
    const wantsSearch = /ابحث|بحث|مصادر|آخر|اليوم|web|خبر|رابط/i.test(clean);
    try {
      let sources: Message["sources"] = [];
      if (wantsSearch) { setThinking("يبحث في الويب، يجمع المصادر، ويقارن النتائج..."); const result = await rpc("assistant.searchWeb", { query: clean }); sources = result.sources; }
      const result = await rpc("assistant.chat", { messages: [...messages, user].slice(-14).map(m => ({ role: m.role, content: m.content })), memory, skills: installedSkills.map(s => `${s.title}: ${s.content}`), userName, sources: sources || [], deepThinking: true });
      const artifact = result.artifact ? { title: result.artifact.title, code: result.artifact.code, language: result.artifact.language } : undefined;
      setMessages(prev => [...prev, { id: uid(), role: "assistant", content: result.content, thinking: result.thinking, sources, artifact }]);
      if (result.memory) setMemory(prev => Array.from(new Set([...prev, result.memory!])).slice(-30));
    } catch (e) { setMessages(prev => [...prev, { id: uid(), role: "assistant", content: "تعذر تشغيل الذكاء الآن. يمكنك المحاولة مرة أخرى أو إضافة مفتاح API من قسم الأسرار.", thinking: String(e) }]); }
    finally { setThinking(""); setIsPending(false); }
  };
  const toggleTheme = () => setDark(v => !v);

  const nav = [
    { id: "chat" as Tab, label: "الدردشة", icon: MessageSquare }, { id: "agents" as Tab, label: "الوكلاء", icon: Zap },
    { id: "skills" as Tab, label: "المهارات", icon: Layers3 }, { id: "pages" as Tab, label: "الصفحات", icon: FileCode2 },
    { id: "memory" as Tab, label: "الذاكرة", icon: Brain },
  ];
  return <div className="app-shell">
    <aside className={`sidebar ${sidebar ? "open" : "closed"}`}>
      <div className="brand"><div className="brand-mark"><Sparkles size={18} /></div>{sidebar && <><div><b>Mgebs</b><small>AI workspace</small></div><button className="icon-btn subtle" onClick={() => setSidebar(false)} title="طي القائمة"><PanelLeft size={16}/></button></>}</div>
      {sidebar && <>
        <button className="new-chat" onClick={() => { setMessages([]); setTab("chat"); }}><Plus size={16}/> محادثة جديدة</button>
        <nav>{nav.map(item => <button key={item.id} className={`nav-item ${tab === item.id ? "active" : ""}`} onClick={() => setTab(item.id)}><item.icon size={17}/><span>{item.label}</span>{item.id === "skills" && <em>{installedSkills.length}</em>}</button>)}</nav>
        <div className="sidebar-divider" />
        <button className={`nav-item ${tab === "settings" ? "active" : ""}`} onClick={() => setTab("settings")}><Settings2 size={17}/><span>الإعدادات</span></button>
        <div className="sidebar-footer"><div className="profile-dot">{userName?.[0] || "م"}</div><div><b>{userName || "مساحة العمل"}</b><small>محلي وآمن</small></div><button className="icon-btn subtle" onClick={() => setShowMenu(!showMenu)}><MoreHorizontal size={17}/></button></div>
      </>}
    </aside>
    {!sidebar && <button className="expand-side icon-btn" onClick={() => setSidebar(true)}><Menu size={18}/></button>}
    <main className="main-area">
      <header className="topbar"><div className="crumb"><span>{tab === "chat" ? "مساعد Mgebs" : nav.find(n => n.id === tab)?.label || "الإعدادات"}</span><ChevronRight size={14}/><b>{tab === "chat" ? "جلسة جديدة" : "مساحة العمل"}</b></div><div className="top-actions"><button className="icon-btn" title="تبديل المظهر" onClick={toggleTheme}>{dark ? <Sun size={17}/> : <Moon size={17}/>}</button><button className="icon-btn" title="الأسرار" onClick={() => { setTab("settings"); setTimeout(() => document.getElementById("secrets")?.scrollIntoView({ behavior: "smooth" }), 50); }}><KeyRound size={17}/></button><button className="avatar" onClick={() => setTab("settings")}>{userName?.[0] || "م"}</button></div></header>
      {tab === "chat" && <section className="chat-layout"><div className="chat-scroll">
        {messages.length === 0 ? <div className="welcome"><div className="welcome-orb"><Sparkles size={28}/></div><p className="eyebrow">مساحة ذكاء شخصية</p><h1>مرحباً بك في <span>Mgebs AI</span></h1><p className="muted">مساعدك للبحث، التفكير، البرمجة، وصناعة المهارات. اكتب طلبك وسأوضح لك ما أفعله في التفكير العميق قبل النتيجة.</p><div className="prompt-grid">{[["ابحث في الويب", "ابحث عن أحدث المعلومات مع المصادر", Globe2],["اكتب كوداً", "أنشئ أو عدّل كوداً قابلاً للمعاينة", Code2],["اصنع مهارة", "حوّل طريقة عملك إلى مهارة قابلة للتثبيت", Wand2],["حلل فكرة", "رتب الفكرة إلى خطة عملية", Lightbulb]].map(([title, desc, Icon]) => <button key={title as string} className="prompt-card" onClick={() => send(desc as string)}><Icon size={18}/><span><b>{title as string}</b><small>{desc as string}</small></span><ArrowLeft size={15}/></button>)}</div></div> : <div className="messages">{messages.map(m => <article key={m.id} className={`message ${m.role}`}><div className="message-avatar">{m.role === "assistant" ? <Sparkles size={15}/> : userName?.[0] || "م"}</div><div className="message-body"><div className="message-meta">{m.role === "assistant" ? "Mgebs AI" : userName || "أنت"}<span>{m.role === "assistant" ? "مساعد ذكي" : "الآن"}</span></div>{m.thinking && <details className="thinking"><summary><Brain size={14}/> التفكير العميق <span>تحليل، أدوات، وقرارات</span></summary><p>{m.thinking}</p></details>}<div className="message-content">{m.content}</div>{m.sources?.length ? <div className="sources"><b><Globe2 size={14}/> مصادر البحث</b>{m.sources.map((s, i) => <div className="source" key={i}><span>{i + 1}</span><div><b>{s.title}</b><small>{s.snippet || s.url}</small><code>{s.url}</code></div></div>)}</div> : null}{m.artifact && <div className="artifact-card"><FileCode2 size={18}/><div><b>{m.artifact.title}</b><small>نتيجة قابلة للمعاينة والتعديل</small></div><button onClick={() => setShowArtifact(m.artifact)} className="small-btn">معاينة</button><button className="small-btn ghost" onClick={() => navigator.clipboard?.writeText(m.artifact!.code)}><Copy size={14}/></button></div>}</div></article>)}{thinking && <div className="thinking live"><Brain size={16}/><span>{thinking}</span><i /></div>}<div ref={endRef}/></div>}
      </div><div className="composer-wrap"><div className="composer-tools"><button onClick={() => setShowApi(true)}><KeyRound size={15}/> إضافة API</button><button onClick={() => setShowSkillEditor(true)}><Wand2 size={15}/> صناعة مهارة</button><span className="composer-hint">{installedSkills.length} مهارات مفعلة · الذاكرة تعمل</span></div><div className="composer"><textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }} placeholder="اكتب طلبك... اسأل، ابحث، ابنِ أو عدّل" rows={2}/><button className="send-btn" disabled={!input.trim() || isPending} onClick={() => send()}><Send size={18}/></button></div><div className="composer-bottom"><span>Enter للإرسال · Shift + Enter لسطر جديد</span><span><Shield size={13}/> بياناتك محفوظة محلياً</span></div></div></section>}
      {tab === "agents" && <Agents onBack={() => setTab("chat")} />}
      {tab === "pages" && <Pages />}
      {tab === "skills" && <Skills skills={skills} setSkills={setSkills} onCreate={() => setShowSkillEditor(true)} />}
      {tab === "memory" && <Memory memory={memory} clear={clearMemory} userName={userName} setUserName={setUserName} />}
      {tab === "settings" && <Settings dark={dark} toggleTheme={toggleTheme} secrets={secrets} setSecrets={setSecrets} newSecret={newSecret} setNewSecret={setNewSecret} />}
    </main>
    {showApi && <ApiModal onClose={() => setShowApi(false)} secrets={secrets} setSecrets={setSecrets} />}
    {showArtifact && <ArtifactModal artifact={showArtifact} onClose={() => setShowArtifact(undefined)} />}
    {showSkillEditor && <SkillModal skill={newSkill} setSkill={setNewSkill} onClose={() => setShowSkillEditor(false)} onSave={() => { if (!newSkill.title.trim()) return; setSkills(p => [...p, { ...newSkill, id: uid(), installed: true }]); setNewSkill({ title: "", description: "", content: "", public: false }); setShowSkillEditor(false); }} />}
  </div>;
}

function Agents({ onBack }: { onBack: () => void }) { return <section className="content-page"><div className="page-head"><div><p className="eyebrow">وكلاء قابلون للتخصيص</p><h2>اصنع وكيلك</h2><p className="muted">اجمع التعليمات والمهارات والأدوات في وكيل واحد.</p></div><button className="primary-btn" onClick={onBack}><Plus size={16}/> وكيل جديد</button></div><div className="empty-grid">{["باحث الويب", "مراجع الكود", "مخطط المشاريع"].map((x, i) => <div className="agent-card" key={x}><div className="agent-icon"><Zap size={20}/></div><b>{x}</b><p>وكيل جاهز للعمل مع مهارات Mgebs.</p><small>{i + 2} مهارات · نشط</small></div>)}</div></section> }
function Pages() { return <section className="content-page"><div className="page-head"><div><p className="eyebrow">مساحة البناء</p><h2>الصفحات والمخرجات</h2><p className="muted">كل كود تنشئه يظهر هنا ويمكن معاينته وتعديله وتنزيله.</p></div><button className="primary-btn"><Plus size={16}/> صفحة جديدة</button></div><div className="blank-panel"><FileCode2 size={28}/><h3>لا توجد صفحات بعد</h3><p>اطلب من Mgebs إنشاء صفحة أو تطبيق، وستظهر النتيجة هنا.</p></div></section> }
function Skills({ skills, setSkills, onCreate }: { skills: Skill[]; setSkills: React.Dispatch<React.SetStateAction<Skill[]>>; onCreate: () => void }) { const [q, setQ] = useState(""); return <section className="content-page"><div className="page-head"><div><p className="eyebrow">مكتبة القدرات</p><h2>المهارات</h2><p className="muted">ثبّت مهاراتك، عدّلها، أو اصنع مهارة جديدة ينفذها الذكاء في الخلفية.</p></div><button className="primary-btn" onClick={onCreate}><Wand2 size={16}/> صناعة مهارة</button></div><div className="search-row"><Search size={16}/><input value={q} onChange={e => setQ(e.target.value)} placeholder="ابحث في المهارات..."/><span>{skills.length} مهارات</span></div><div className="skill-grid">{skills.filter(s => s.title.includes(q) || s.description.includes(q)).map(s => <div className="skill-card" key={s.id}><div className="skill-top"><div className="skill-icon"><Sparkles size={17}/></div><button className="icon-btn" onClick={() => setSkills(p => p.filter(x => x.id !== s.id))}><Trash2 size={15}/></button></div><h3>{s.title}</h3><p>{s.description}</p><div className="skill-footer"><span>{s.public ? "عامة" : "خاصة"} · ملف مهارة</span><button className={s.installed ? "installed" : "small-btn"} onClick={() => setSkills(p => p.map(x => x.id === s.id ? { ...x, installed: !x.installed } : x))}>{s.installed ? <><Check size={13}/> مثبتة</> : "تجربة وتثبيت"}</button></div></div>)}</div></section> }
function Memory({ memory, clear, userName, setUserName }: { memory: string[]; clear: () => void; userName: string; setUserName: (v: string) => void }) { return <section className="content-page"><div className="page-head"><div><p className="eyebrow">سياق طويل المدى</p><h2>ذاكرة Mgebs</h2><p className="muted">المعلومات التي تشاركها تبقى على هذا الجهاز ويمكن حذفها في أي وقت.</p></div><button className="danger-btn" onClick={clear}><Trash2 size={15}/> مسح الذاكرة</button></div><div className="memory-profile"><div className="profile-dot large">{userName?.[0] || "م"}</div><div><b>كيف أناديك؟</b><input value={userName} onChange={e => { setUserName(e.target.value); localStorage.setItem("mgebs-user-name", e.target.value); }} placeholder="اكتب اسمك"/><small>سيستخدمه Mgebs في المحادثات القادمة.</small></div></div><div className="memory-list">{memory.length ? memory.map((m, i) => <div className="memory-item" key={i}><Brain size={15}/><span>{m}</span></div>) : <div className="blank-panel small"><Brain size={25}/><h3>الذاكرة فارغة</h3><p>شارك اسمك أو تفضيلاتك أو معلومات تساعدك، وسيتذكرها Mgebs.</p></div>}</div></section> }
function Settings({ dark, toggleTheme, secrets, setSecrets, newSecret, setNewSecret }: any) { const [saved, setSaved] = useState(false); return <section className="content-page settings-page"><div className="page-head"><div><p className="eyebrow">تحكم كامل</p><h2>الإعدادات</h2><p className="muted">اضبط تجربة Mgebs، الخصوصية، المظهر، والأسرار.</p></div></div><div className="settings-grid"><div className="setting-card"><div className="setting-icon"><Sun size={17}/></div><div><b>المظهر</b><p>انتقال دائري ناعم بين الوضع الفاتح والداكن.</p></div><button className={`theme-switch ${dark ? "on" : ""}`} onClick={toggleTheme}><span>{dark ? <Moon size={13}/> : <Sun size={13}/>}</span></button></div><div className="setting-card"><div className="setting-icon"><Brain size={17}/></div><div><b>التفكير العميق</b><p>يعرض ملخص خطوات التحليل واستدعاء المهارات دون كشف التفكير الداخلي الكامل.</p></div><div className="status-pill active">مفعل</div></div><div className="setting-card"><div className="setting-icon"><Shield size={17}/></div><div><b>الخصوصية</b><p>المحادثات والذاكرة والأسرار محفوظة محلياً في هذا المتصفح.</p></div><div className="status-pill">محلي</div></div></div><div id="secrets" className="section-block"><div className="section-title"><div><h3><KeyRound size={17}/> الأسرار و API</h3><p>أضف مفاتيحك عند الحاجة. لا تُعرض في الدردشة ولا تُشارك مع Mgebs.</p></div></div><div className="secret-add"><input placeholder="اسم السر مثل OpenAI" value={newSecret.name} onChange={e => setNewSecret({ ...newSecret, name: e.target.value })}/><input placeholder="المزود" value={newSecret.provider} onChange={e => setNewSecret({ ...newSecret, provider: e.target.value })}/><input type="password" placeholder="قيمة API" value={newSecret.value} onChange={e => setNewSecret({ ...newSecret, value: e.target.value })}/><button className="primary-btn" onClick={() => { if (!newSecret.name || !newSecret.value) return; setSecrets((p: Secret[]) => [...p, { ...newSecret, id: uid() }]); setNewSecret({ name: "", value: "", provider: "" }); setSaved(true); setTimeout(() => setSaved(false), 1800); }}><Plus size={15}/> حفظ</button></div>{saved && <div className="save-note"><Check size={14}/> تم حفظ السر محلياً</div>}<div className="secret-list">{secrets.map((s: Secret) => <div className="secret-row" key={s.id}><KeyRound size={15}/><div><b>{s.name}</b><small>{s.provider || "مزود مخصص"} · {"•".repeat(Math.min(12, s.value.length))}</small></div><button className="icon-btn" onClick={() => setSecrets((p: Secret[]) => p.filter(x => x.id !== s.id))}><Trash2 size={15}/></button></div>)}</div></div></section> }
function ApiModal({ onClose, secrets, setSecrets }: { onClose: () => void; secrets: Secret[]; setSecrets: React.Dispatch<React.SetStateAction<Secret[]>> }) { const [name, setName] = useState(""); const [value, setValue] = useState(""); return <div className="modal-backdrop"><div className="modal"><div className="modal-head"><div><b>إضافة API للمهمة</b><small>يمكن لـ Mgebs استخدامه لاحقاً دون أن تسأل مرة أخرى.</small></div><button className="icon-btn" onClick={onClose}><X size={18}/></button></div><div className="question-chips"><button onClick={() => setName("Web Search API")}>هل تريد مفتاح بحث؟</button><button onClick={() => setName("Code Provider")}>هل تريد مزود كود؟</button></div><label>اسم المفتاح<input value={name} onChange={e => setName(e.target.value)} placeholder="مثلاً: بحث الشركة"/></label><label>قيمة API<input value={value} onChange={e => setValue(e.target.value)} type="password" placeholder="تُحفظ محلياً فقط"/></label><div className="modal-actions"><button className="ghost-btn" onClick={onClose}>إلغاء</button><button className="primary-btn" onClick={() => { if (name && value) setSecrets(p => [...p, { id: uid(), name, value, provider: "مخصص" }]); onClose(); }}>حفظ المفتاح</button></div></div></div> }
function ArtifactModal({ artifact, onClose }: { artifact: NonNullable<Message["artifact"]>; onClose: () => void }) { const [code, setCode] = useState(artifact.code); return <div className="modal-backdrop"><div className="modal artifact-modal"><div className="modal-head"><div><b>{artifact.title}</b><small>يمكنك التعديل ثم حفظ النسخة الحالية مع Mgebs.</small></div><div className="modal-head-actions"><button className="small-btn" onClick={() => navigator.clipboard?.writeText(code)}><Copy size={14}/> نسخ</button><button className="small-btn" onClick={() => { const blob = new Blob([code], { type: "text/plain" }); const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `${artifact.title.replace(/\s+/g, "-")}.${artifact.language || "txt"}`; a.click(); }}><ArrowDownToLine size={14}/> تنزيل</button><button className="icon-btn" onClick={onClose}><X size={18}/></button></div></div><textarea className="code-editor" value={code} onChange={e => setCode(e.target.value)}/><div className="modal-actions"><span className="muted">التعديلات محفوظة في هذه المعاينة</span><button className="primary-btn" onClick={onClose}><Check size={15}/> حفظ وإغلاق</button></div></div></div> }
function SkillModal({ skill, setSkill, onClose, onSave }: any) { return <div className="modal-backdrop"><div className="modal"><div className="modal-head"><div><b>صناعة مهارة جديدة</b><small>اكتب ملف المهارة، ثم ثبّتها وجربها داخل الدردشة.</small></div><button className="icon-btn" onClick={onClose}><X size={18}/></button></div><label>عنوان المهارة *<input value={skill.title} onChange={e => setSkill({ ...skill, title: e.target.value })} placeholder="مثلاً: محلل العقود"/></label><label>وصف اختياري<input value={skill.description} onChange={e => setSkill({ ...skill, description: e.target.value })} placeholder="ماذا تفعل المهارة؟"/></label><label>ملف المهارة والتعليمات<textarea value={skill.content} onChange={e => setSkill({ ...skill, content: e.target.value })} placeholder="اكتب خطوات المهارة وقواعدها..." rows={6}/></label><div className="public-toggle"><button className={`theme-switch ${skill.public ? "on" : ""}`} onClick={() => setSkill({ ...skill, public: !skill.public })}><span>{skill.public ? <Check size={13}/> : <X size={13}/>}</span></button><span>نشر المهارة للمستخدمين</span></div><div className="modal-actions"><button className="ghost-btn" onClick={onClose}>إلغاء</button><button className="primary-btn" disabled={!skill.title.trim()} onClick={onSave}><Wand2 size={15}/> تثبيت وتجربة</button></div></div></div> }
