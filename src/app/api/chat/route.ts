import clientPromise from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";

// ============================================================
// TYPES & INTERFACES FOR MONGO CHAT HISTORY
// ============================================================
interface ChatMessage {
  role: string;
  content: string;
  createdAt: Date;
}

interface ChatHistory {
  sessionId: string;
  messages: ChatMessage[];
  updatedAt: Date;
  createdAt?: Date;
}

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

export async function POST(req: NextRequest) {
  try {
    const { message, sessionId, history } = await req.json();

    if (!message || !message.trim()) {
      return NextResponse.json(
        { success: false, error: "মেসেজ দিন" },
        { status: 400 },
      );
    }

    // 1. সিস্টেম প্রম্পট সরাসরি 'system' রোল দিয়ে শুরু করুন
    const apiMessages: { role: string; content: string }[] = [
      { role: "system", content: SYSTEM_PROMPT },
    ];

    // হিস্ট্রি থাকলে পাস করুন
    if (history && Array.isArray(history)) {
      apiMessages.push(
        ...history.map((m) => ({ role: m.role, content: m.content })),
      );
    }

    // বর্তমান ইউজারের মেসেজ পুশ করুন
    apiMessages.push({ role: "user", content: message.trim() });

    // টোকেন ওভারফ্লো এড়াতে সর্বশেষ ২০টি মেসেজ ট্রিম করার সঠিক লজিক
    const systemPromptObj = apiMessages[0];
    const contextMessages = apiMessages.slice(1); // সিস্টেম প্রম্পট বাদে বাকি মেসেজ

    const trimmedMessages = [
      systemPromptObj,
      ...contextMessages.slice(Math.max(0, contextMessages.length - 20)),
    ];

    const apiKey = process.env.OPENAI_API_KEY;
    let aiResponse = "";

    if (apiKey) {
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: trimmedMessages,
          }),
        },
      );

      if (!response.ok) {
        const errText = await response.text();
        console.error("OpenAI API error response:", errText);
        throw new Error(`OpenAI API returned status ${response.status}`);
      }

      const resData = await response.json();
      aiResponse = resData.choices?.[0]?.message?.content || "";
    } else {
      // Fallback mock response
      aiResponse = `হ্যালো! আমি আপনার স্টাডি হাব এআই সহকারী। অনুগ্রহ করে চ্যাট সেবাটি সক্রিয় করতে আপনার .env ফাইলে \`OPENAI_API_KEY\` যুক্ত করুন। (আপনি জিজ্ঞেস করেছিলেন: "${message.trim()}")`;
    }

    if (!aiResponse) {
      return NextResponse.json(
        { success: false, error: "AI থেকে কোনো উত্তর আসেনি" },
        { status: 500 },
      );
    }

    // 2. মঙ্গোডিবি-তে চ্যাট হিস্ট্রি সেভ বা আপডেট করা (প্রোডাকশন রেডি পদ্ধতি)
    if (sessionId) {
      const client = await clientPromise;
      const db = client.db();

      // typed collection utilizing TypeScript schema interface to allow nested operators safely
      await db.collection<ChatHistory>("ChatHistory").updateOne(
        { sessionId: sessionId },
        {
          $push: {
            messages: {
              $each: [
                {
                  role: "user",
                  content: message.trim(),
                  createdAt: new Date(),
                },
                {
                  role: "assistant",
                  content: aiResponse,
                  createdAt: new Date(),
                },
              ],
              $slice: -40, // Keeps last 40 entries directly in database
            },
          },
          $set: { updatedAt: new Date() },
          $setOnInsert: { createdAt: new Date() },
        } as any, // Type-assert update document to cleanly bypass version-dependent driver schema issues
        { upsert: true },
      );
    }

    return NextResponse.json({
      success: true,
      response: aiResponse,
      sessionId,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { success: false, error: "এআই সহকারীর সাথে সংযোগে সমস্যা হয়েছে" },
      { status: 500 },
    );
  }
}

// ============================================================
// DELETE — ডাটাবেজ থেকে নির্দিষ্ট সেশনের চ্যাট হিস্ট্রি মুছে ফেলা
// ============================================================
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: "সেশন আইডি প্রয়োজন" },
        { status: 400 },
      );
    }

    const client = await clientPromise;
    const db = client.db();

    await db
      .collection<ChatHistory>("ChatHistory")
      .deleteOne({ sessionId: sessionId });

    return NextResponse.json({
      success: true,
      message: "চ্যাট হিস্ট্রি মুছে ফেলা হয়েছে",
    });
  } catch (error) {
    console.error("Delete Chat API error:", error);
    return NextResponse.json(
      { success: false, error: "চ্যাট হিস্ট্রি মুছতে সমস্যা হয়েছে" },
      { status: 500 },
    );
  }
}
