import { NextRequest, NextResponse } from 'next/server';

const SYSTEM_PROMPT = `তুমি "স্টাডি হাব" এর AI শিক্ষক সহকারী। তুমি বাংলাদেশের ক্লাস ৯-১০ শিক্ষার্থীদের সাহায্য করো।

তোমার বৈশিষ্ট্য:
- তুমি বাংলা ও ইংরেজি দুই ভাষাতেই উত্তর দিতে পারো
- তুমি বাংলাদেশের জাতীয় শিক্ষাক্রম অনুযায়ী পড়াশোনায় সাহায্য করো
- গণিত, পদার্থবিজ্ঞান, রসায়ন, জীববিজ্ঞান, বাংলা, ইংরেজি, তথ্য ও যোগাযোগ প্রযুক্তি, বাংলাদেশ ও বিশ্বপরিচয় - এই বিষয়গুলোতে তুমি দক্ষ
- সহজ ভাষায় ব্যাখ্যা করো, উদাহরণ দাও
- ধাপে ধাপে সমাধান দেখাও, বিশেষ করে গণিতে
- শিক্ষার্থীদের উৎসাহিত করো
- ভুল হলে ধৈর্য সহকারে শুধরে দাও
- প্রশ্নের উত্তরে সংক্ষিপ্ত কিন্তু সম্পূর্ণ উত্তর দাও
- পড়াশোনার টিপস ও কৌশল শেয়ার করো

মনে রাখবে:
- ক্লাস ৯-১০ এর সিলেবাস অনুযায়ী উত্তর দাও
- অতিরিক্ত জটিল তথ্য এড়াও
- বাংলাদেশের প্রেক্ষাপটে উদাহরণ ব্যবহার করো`;

// In-memory conversation store (per session)
const conversations = new Map<string, { role: string; content: string }[]>();

export async function POST(req: NextRequest) {
  try {
    const { message, sessionId, history } = await req.json();

    if (!message || !message.trim()) {
      return NextResponse.json(
        { success: false, error: 'মেসেজ দিন' },
        { status: 400 }
      );
    }

    // Build messages array
    const messages: { role: string; content: string }[] = [
      { role: 'assistant', content: SYSTEM_PROMPT },
    ];

    // Add conversation history
    if (history && Array.isArray(history)) {
      messages.push(...history);
    }

    // Add current user message
    messages.push({ role: 'user', content: message.trim() });

    // Limit context to last 20 messages to avoid token overflow
    const trimmedMessages = [
      messages[0], // System prompt
      ...messages.slice(Math.max(1, messages.length - 20)),
    ];

    const apiKey = process.env.OPENAI_API_KEY;
    let aiResponse = "";

    if (apiKey) {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: trimmedMessages.map(m => ({
            role: m.role === 'assistant' && m.content === SYSTEM_PROMPT ? 'system' : m.role,
            content: m.content
          })),
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error('OpenAI API error response:', errText);
        throw new Error(`OpenAI API returned status ${response.status}`);
      }

      const resData = await response.json();
      aiResponse = resData.choices?.[0]?.message?.content || "";
    } else {
      // Fallback mock response so the app doesn't break if API key is not configured
      aiResponse = `হ্যালো! আমি আপনার স্টাডি হাব এআই সহকারী। অনুগ্রহ করে চ্যাট সেবাটি সক্রিয় করতে আপনার .env ফাইলে \`OPENAI_API_KEY\` যুক্ত করুন। (আপনি জিজ্ঞেস করেছিলেন: "${message.trim()}")`;
    }

    if (!aiResponse) {
      return NextResponse.json(
        { success: false, error: 'AI থেকে কোনো উত্তর আসেনি' },
        { status: 500 }
      );
    }

    // Store conversation
    if (sessionId) {
      const existing = conversations.get(sessionId) || [];
      existing.push(
        { role: 'user', content: message.trim() },
        { role: 'assistant', content: aiResponse }
      );
      // Keep last 40 messages
      if (existing.length > 40) {
        conversations.set(sessionId, existing.slice(-40));
      } else {
        conversations.set(sessionId, existing);
      }
    }

    return NextResponse.json({
      success: true,
      response: aiResponse,
      sessionId,
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'এআই সহকারীর সাথে সংযোগে সমস্যা হয়েছে',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get('sessionId');
  if (sessionId) {
    conversations.delete(sessionId);
  }
  return NextResponse.json({ success: true });
}
