from pathlib import Path
p=Path('/home/ubuntu/mgebs-ai-copy/client/src/pages/Home.tsx')
s=p.read_text()
s=s.replace('import { trpc } from "@/lib/trpc";\n','')
s=s.replace('  const endRef = useRef<HTMLDivElement>(null);\n  const chat = trpc.assistant.chat.useMutation();\n  const search = trpc.assistant.searchWeb.useMutation();\n', '''  const endRef = useRef<HTMLDivElement>(null);
  const [isPending, setIsPending] = useState(false);
  const rpc = async (path: string, input: unknown) => {
    const response = await fetch(`/api/trpc/${path}?batch=1`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ 0: { json: input } }) });
    if (!response.ok) throw new Error(`RPC ${response.status}`);
    const data = await response.json();
    return data[0]?.result?.data?.json ?? data[0]?.result?.data;
  };
''')
s=s.replace('if (!clean || chat.isPending) return;', 'if (!clean || isPending) return;')
s=s.replace('    setMessages(prev => [...prev, user]); setInput(""); setThinking("يفهم الطلب، يحدد المهارة المناسبة، ويراجع الذاكرة والسياق...");', '    setIsPending(true); setMessages(prev => [...prev, user]); setInput(""); setThinking("يفهم الطلب، يحدد المهارة المناسبة، ويراجع الذاكرة والسياق...");')
s=s.replace('const result = await search.mutateAsync({ query: clean });', 'const result = await rpc("assistant.searchWeb", { query: clean });')
s=s.replace('const result = await chat.mutateAsync({ messages:', 'const result = await rpc("assistant.chat", { messages:')
s=s.replace('    finally { setThinking(""); }', '    finally { setThinking(""); setIsPending(false); }')
s=s.replace('disabled={!input.trim() || chat.isPending}', 'disabled={!input.trim() || isPending}')
p.write_text(s)
print('patched')
