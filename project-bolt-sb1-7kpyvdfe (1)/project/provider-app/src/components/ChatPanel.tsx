import { useState, useEffect, useRef } from 'react';
import { supabase, type ChatMessage } from '@/lib/supabase';
import { Send, Loader2 } from 'lucide-react';

interface ChatPanelProps {
  requestId: string;
  senderType: 'customer' | 'provider';
  senderName: string;
  recipientName: string | null;
}

export default function ChatPanel({ requestId, senderType, senderName, recipientName }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetchMessages();

    const channel = supabase
      .channel(`chat_${requestId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `request_id=eq.${requestId}` },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as ChatMessage]);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [requestId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const fetchMessages = async () => {
    const { data } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('request_id', requestId)
      .order('created_at', { ascending: true });

    if (data) setMessages(data as ChatMessage[]);
    setLoading(false);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sending) return;

    setSending(true);
    const text = input.trim();
    setInput('');

    const { data } = await supabase
      .from('chat_messages')
      .insert({
        request_id: requestId,
        sender_type: senderType,
        sender_name: senderName,
        message: text,
      })
      .select()
      .single();

    if (data) setMessages((prev) => [...prev, data as ChatMessage]);
    setSending(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-72 rounded-xl border border-slate-700 bg-slate-800/30 overflow-hidden">
      <div className="flex items-center gap-2 border-b border-slate-700/50 bg-slate-800/50 px-4 py-2.5">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-500/20">
          <Send className="h-3.5 w-3.5 text-sky-400" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-white">المحادثة</p>
          {recipientName && (
            <p className="text-xs text-slate-400">مع {recipientName}</p>
          )}
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-2 px-3 py-3">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-center">
            <p className="text-xs text-slate-500">لا توجد رسائل بعد. ابدأ المحادثة!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMine = msg.sender_type === senderType;
            return (
              <div key={msg.id} className={`flex ${isMine ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[75%] rounded-2xl px-3.5 py-2 ${isMine ? 'bg-sky-500/20 text-sky-100 rounded-tl-sm' : 'bg-slate-700 text-slate-100 rounded-tr-sm'}`}>
                  <p className="text-xs leading-relaxed">{msg.message}</p>
                  <p className="mt-0.5 text-[10px] text-slate-400" dir="ltr">
                    {new Date(msg.created_at).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-slate-700/50 bg-slate-800/50 px-3 py-2.5">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="اكتب رسالة..."
          disabled={sending}
          className="flex-1 rounded-xl border border-slate-600 bg-slate-900/50 px-3 py-2 text-sm text-white placeholder-slate-500 outline-none transition-colors focus:border-sky-500/50"
        />
        <button
          type="submit"
          disabled={!input.trim() || sending}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-l from-sky-500 to-blue-700 text-white transition-transform hover:scale-105 disabled:opacity-50 disabled:scale-100"
        >
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </button>
      </form>
    </div>
  );
}
