import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Clean existing data
  await prisma.leaderboardEntry.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.progress.deleteMany();
  await prisma.studyGroupMember.deleteMany();
  await prisma.studyGroup.deleteMany();
  await prisma.liveClass.deleteMany();
  await prisma.qAAnswer.deleteMany();
  await prisma.qAQuestion.deleteMany();
  await prisma.assignmentSubmission.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.examResult.deleteMany();
  await prisma.examQuestion.deleteMany();
  await prisma.exam.deleteMany();
  await prisma.note.deleteMany();
  await prisma.video.deleteMany();
  await prisma.notice.deleteMany();
  await prisma.chapter.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.guardian.deleteMany();
  await prisma.teacherProfile.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.user.deleteMany();

  // ============================================================
  // CREATE USERS
  // ============================================================
  console.log('Creating users...');

  const admin = await prisma.user.create({
    data: {
      email: 'admin@studyhub.com',
      name: 'আলী হোসেন',
      password: hashedPassword,
      role: 'admin',
      phone: '01711111111',
    },
  });

  const teacher = await prisma.user.create({
    data: {
      email: 'teacher@studyhub.com',
      name: 'ফাতেমা বেগম',
      password: hashedPassword,
      role: 'teacher',
      phone: '01722222222',
      teacherProfile: {
        create: {
          subject: 'গণিত',
          bio: '২০ বছরের অভিজ্ঞ গণিত শিক্ষক',
        },
      },
    },
  });

  const guardian = await prisma.user.create({
    data: {
      email: 'guardian@studyhub.com',
      name: 'করিম উদ্দিন',
      password: hashedPassword,
      role: 'guardian',
      phone: '01733333333',
      guardian: {
        create: {},
      },
    },
    include: {
      guardian: true,
    },
  });

  const studentsData = [
    { name: 'রাফি আহমেদ', email: 'rafi@studyhub.com', phone: '01744444441', roll: '০১', school: 'ঢাকা কলেজিয়েট স্কুল' },
    { name: 'নুসরাত জাহান', email: 'nusrat@studyhub.com', phone: '01744444442', roll: '০২', school: 'ঢাকা কলেজিয়েট স্কুল' },
    { name: 'সাকিব হাসান', email: 'sakib@studyhub.com', phone: '01744444443', roll: '০৩', school: 'ভিক্টোরিয়া স্কুল' },
    { name: 'তানিয়া আক্তার', email: 'tania@studyhub.com', phone: '01744444444', roll: '০৪', school: 'ভিক্টোরিয়া স্কুল' },
    { name: 'মেহেদী হাসান', email: 'mehedi@studyhub.com', phone: '01744444445', roll: '০৫', school: 'সরকারি বিজ্ঞান কলেজ' },
    { name: 'ফারিহা ইসলাম', email: 'fariha@studyhub.com', phone: '01744444446', roll: '০৬', school: 'সরকারি বিজ্ঞান কলেজ' },
  ];

  const students = [];
  for (const s of studentsData) {
    const student = await prisma.user.create({
      data: {
        email: s.email,
        name: s.name,
        password: hashedPassword,
        role: 'student',
        phone: s.phone,
        studentProfile: {
          create: {
            class: '9-10',
            roll: s.roll,
            school: s.school,
            guardianId: guardian.guardian?.id,
          },
        },
      },
    });
    students.push(student);
  }

  // ============================================================
  // CREATE SUBJECTS & CHAPTERS
  // ============================================================
  console.log('Creating subjects and chapters...');

  const subjectsData = [
    {
      name: 'Bengali',
      nameBn: 'বাংলা',
      icon: 'BookOpen',
      color: '#E53935',
      order: 1,
      chapters: [
        { name: 'Unseen Passage (Comprehension)', nameBn: 'অপঠিত অনুচ্ছেদ', order: 1 },
        { name: 'Grammar & Composition', nameBn: 'ব্যাকরণ ও রচনা', order: 2 },
        { name: 'Poetry & Literature', nameBn: 'কবিতা ও সাহিত্য', order: 3 },
      ],
    },
    {
      name: 'English',
      nameBn: 'ইংরেজি',
      icon: 'Languages',
      color: '#1E88E5',
      order: 2,
      chapters: [
        { name: 'Reading Comprehension', nameBn: 'পঠন বোধগম্যতা', order: 1 },
        { name: 'Grammar & Writing', nameBn: 'ব্যাকরণ ও লেখালেখি', order: 2 },
        { name: 'Literature: Short Stories', nameBn: 'সাহিত্য: ছোটগল্প', order: 3 },
      ],
    },
    {
      name: 'Mathematics',
      nameBn: 'গণিত',
      icon: 'Calculator',
      color: '#43A047',
      order: 3,
      chapters: [
        { name: 'Algebra', nameBn: 'বীজগণিত', order: 1 },
        { name: 'Geometry', nameBn: 'জ্যামিতি', order: 2 },
        { name: 'Statistics & Probability', nameBn: 'পরিসংখ্যান ও সম্ভাবনা', order: 3 },
      ],
    },
    {
      name: 'Physics',
      nameBn: 'পদার্থবিজ্ঞান',
      icon: 'Atom',
      color: '#FB8C00',
      order: 4,
      chapters: [
        { name: 'Motion & Force', nameBn: 'গতি ও বল', order: 1 },
        { name: 'Work, Energy & Power', nameBn: 'কাজ, শক্তি ও ক্ষমতা', order: 2 },
        { name: 'Heat & Temperature', nameBn: 'তাপ ও তাপমাত্রা', order: 3 },
      ],
    },
    {
      name: 'Chemistry',
      nameBn: 'রসায়ন',
      icon: 'FlaskConical',
      color: '#8E24AA',
      order: 5,
      chapters: [
        { name: 'Matter & its Changes', nameBn: 'পদার্থ ও এর পরিবর্তন', order: 1 },
        { name: 'Chemical Bonding', nameBn: 'রাসায়নিক বন্ধন', order: 2 },
        { name: 'Acids, Bases & Salts', nameBn: 'অ্যাসিড, ক্ষার ও লবণ', order: 3 },
      ],
    },
    {
      name: 'Biology',
      nameBn: 'জীববিজ্ঞান',
      icon: 'Leaf',
      color: '#00897B',
      order: 6,
      chapters: [
        { name: 'Cell & its Structure', nameBn: 'কোষ ও এর গঠন', order: 1 },
        { name: 'Classification of Organisms', nameBn: 'জীবের শ্রেণিবিন্যাস', order: 2 },
        { name: 'Human Body & Health', nameBn: 'মানবদেহ ও স্বাস্থ্য', order: 3 },
      ],
    },
    {
      name: 'ICT',
      nameBn: 'তথ্য ও যোগাযোগ প্রযুক্তি',
      icon: 'Monitor',
      color: '#546E7A',
      order: 7,
      chapters: [
        { name: 'Introduction to ICT', nameBn: 'তথ্য ও যোগাযোগ প্রযুক্তি পরিচিতি', order: 1 },
        { name: 'Number Systems & Data Representation', nameBn: 'সংখ্যা পদ্ধতি ও তথ্য উপস্থাপন', order: 2 },
        { name: 'Web Design & HTML', nameBn: 'ওয়েব ডিজাইন ও HTML', order: 3 },
      ],
    },
    {
      name: 'BGS',
      nameBn: 'বাংলাদেশ ও বিশ্বপরিচয়',
      icon: 'Globe',
      color: '#D81B60',
      order: 8,
      chapters: [
        { name: 'History of Bangladesh', nameBn: 'বাংলাদেশের ইতিহাস', order: 1 },
        { name: 'Government & Citizenship', nameBn: 'সরকার ও নাগরিকতা', order: 2 },
        { name: 'Economy & Environment', nameBn: 'অর্থনীতি ও পরিবেশ', order: 3 },
      ],
    },
  ];

  const subjects: { id: string; chapters: { id: string }[] }[] = [];

  for (const sub of subjectsData) {
    const createdSubject = await prisma.subject.create({
      data: {
        name: sub.name,
        nameBn: sub.nameBn,
        icon: sub.icon,
        color: sub.color,
        order: sub.order,
        chapters: {
          create: sub.chapters.map((ch) => ({
            name: ch.name,
            nameBn: ch.nameBn,
            order: ch.order,
          })),
        },
      },
      include: { chapters: true },
    });
    subjects.push({
      id: createdSubject.id,
      chapters: createdSubject.chapters.map((ch) => ({ id: ch.id })),
    });
  }

  // ============================================================
  // CREATE NOTES
  // ============================================================
  console.log('Creating notes...');

  const noteTypes = ['handnote', 'suggestion', 'past-question'] as const;

  const noteContentTemplates: Record<string, string[]> = {
    handnote: [
      `# হ্যান্ডনোট\n\n## মূল পয়েন্টসমূহ\n\n- এই অধ্যায়ের মূল বিষয়গুলো নিচে আলোচনা করা হলো\n- পরীক্ষার জন্য গুরুত্বপূর্ণ তথ্য\n\n## বিস্তারিত\n\nএই অধ্যায়ে আমরা শিখব কিভাবে মূল ধারণাগুলো বুঝতে হয়। নিচে কিছু গুরুত্বপূর্ণ সূত্র ও সংজ্ঞা দেওয়া হলো:\n\n### সংজ্ঞা\n\n> এটি একটি গুরুত্বপূর্ণ সংজ্ঞা যা পরীক্ষায় প্রায়ই আসে।\n\n### সূত্র\n\n1. প্রথম সূত্র\n2. দ্বিতীয় সূত্র\n3. তৃতীয় সূত্র\n\n## সারাংশ\n\n- মূল বিষয় ১\n- মূল বিষয় ২\n- মূল বিষয় ৩`,
      `# হ্যান্ডনোট\n\n## গুরুত্বপূর্ণ ধারণা\n\nএই নোটে অধ্যায়ের সবচেয়ে গুরুত্বপূর্ণ ধারণাগুলো সহজ ভাষায় ব্যাখ্যা করা হয়েছে।\n\n## উদাহরণ\n\n### উদাহরণ ১\nনিচের সমস্যাটি সমাধান করুন:\n- প্রদত্ত তথ্য\n- সমাধান পদ্ধতি\n- উত্তর\n\n## অনুশীলনী\n\n1. প্রশ্ন ১\n2. প্রশ্ন ২\n3. প্রশ্ন ৩`,
    ],
    suggestion: [
      `# পরীক্ষার সাজেশন\n\n## অত্যন্ত গুরুত্বপূর্ণ (★★★)\n\n1. বিষয় A - এই প্রশ্নটি প্রায় প্রতি বছর আসে\n2. বিষয় B - গত ৩ বছর ধরে আসছে\n3. বিষয় C - খুবই সম্ভাব্য\n\n## গুরুত্বপূর্ণ (★★)\n\n1. বিষয় D\n2. বিষয় E\n\n## সাধারণ (★)\n\n1. বিষয় F\n2. বিষয় G\n\n### টিপস\n- উত্তর লেখার সময় প্রথমে মূল পয়েন্ট লিখুন\n- উদাহরণ দিতে ভুলবেন না`,
      `# সাজেশন ২০২৫\n\n## সৃজনশীল প্রশ্ন\n\n### অংশ ১\n- প্রশ্নের ধরন: সংক্ষিপ্ত উত্তর\n- গুরুত্ব: ★★★\n\n### অংশ ২  \n- প্রশ্নের ধরন: বিস্তারিত উত্তর\n- গুরুত্ব: ★★\n\n## বহুনির্বাচনি প্রশ্ন\n\nমোট প্রশ্ন: ৩০টি\nসময়: ৩০ মিনিট`,
    ],
    'past-question': [
      `# বিগত বছরের প্রশ্ন\n\n## ২০২৪ সাল\n\n### প্রশ্ন ১\n[বিগত বছরের প্রশ্নের বিবরণ]\n\n**উত্তর:** উত্তরের বিস্তারিত ব্যাখ্যা\n\n### প্রশ্ন ২\n[আরেকটি বিগত বছরের প্রশ্ন]\n\n**উত্তর:** ব্যাখ্যাসহ উত্তর\n\n## ২০২৩ সাল\n\n### প্রশ্ন ১\n[প্রশ্ন বিবরণ]\n\n**উত্তর:** উত্তর\n\n---\n\n*মোট প্রশ্ন সংখ্যা: ১০*\n*সময়: ২ ঘণ্টা*`,
      `# বিগত বছরের প্রশ্ন সমাধান\n\n## ২০২২ সাল\n\n1. **প্রশ্ন:** প্রশ্নের টেক্সট\n   **উত্তর:** উত্তরের টেক্সট\n\n2. **প্রশ্ন:** প্রশ্নের টেক্সট\n   **উত্তর:** উত্তরের টেক্সট\n\n## পুনরাবৃত্তি প্রশ্ন\n\nনিচের প্রশ্নগুলো একাধিকবার বোর্ড পরীক্ষায় এসেছে:\n\n| বছর | প্রশ্ন নং | ধরন |\n|------|-----------|------|\n| ২০২৪ | ১, ৩, ৫ | সৃজনশীল |\n| ২০২৩ | ২, ৪, ৬ | সংক্ষিপ্ত |`,
    ],
  };

  for (let si = 0; si < subjects.length; si++) {
    const subject = subjects[si];
    const subjectName = subjectsData[si].nameBn;

    for (let ci = 0; ci < subject.chapters.length; ci++) {
      const chapter = subject.chapters[ci];
      const chapterName = subjectsData[si].chapters[ci].nameBn;

      // Create 2-3 notes per chapter
      for (let ni = 0; ni < 2 + (ci % 2 === 0 ? 1 : 0); ni++) {
        const type = noteTypes[ni % noteTypes.length];
        const templates = noteContentTemplates[type];
        const content = templates[ni % templates.length];

        await prisma.note.create({
          data: {
            subjectId: subject.id,
            chapterId: chapter.id,
            title: `${chapterName} - ${type === 'handnote' ? 'হ্যান্ডনোট' : type === 'suggestion' ? 'সাজেশন' : 'বিগত বছরের প্রশ্ন'}`,
            titleBn: `${chapterName} - ${type === 'handnote' ? 'হ্যান্ডনোট' : type === 'suggestion' ? 'সাজেশন' : 'বিগত বছরের প্রশ্ন'}`,
            content: content.replace(/অধ্যায়/g, chapterName).replace(/বিষয় A/g, `${subjectName} বিষয় ১`),
            type,
            order: ni + 1,
          },
        });
      }
    }
  }

  // ============================================================
  // CREATE VIDEOS
  // ============================================================
  console.log('Creating videos...');

  const youtubeIds = [
    'dQw4w9WgXcQ', 'jNQXAC9IVRw', '9bZkp7q19f0',
    'kJQP7kiw5Fk', 'RgKAFK5djSk', 'OPf0YbXqDm0',
    'JGwWNGJdvx8', 'fJ9rUzIMcZQ', 'hT_nvWreIhg',
    'CevxZvSJLk8', 'e-ORhEE9VVg', 'YQHsXMglC9A',
  ];

  let videoIndex = 0;

  for (let si = 0; si < subjects.length; si++) {
    const subject = subjects[si];

    for (let ci = 0; ci < subject.chapters.length; ci++) {
      const chapter = subject.chapters[ci];
      const chapterName = subjectsData[si].chapters[ci].nameBn;

      // Create 2-3 videos per chapter
      const videoCount = 2 + (ci % 2 === 0 ? 1 : 0);
      for (let vi = 0; vi < videoCount; vi++) {
        await prisma.video.create({
          data: {
            subjectId: subject.id,
            chapterId: chapter.id,
            title: `${chapterName} - ভিডিও লেকচার ${vi + 1}`,
            titleBn: `${chapterName} - ভিডিও লেকচার ${vi + 1}`,
            youtubeId: youtubeIds[videoIndex % youtubeIds.length],
            duration: 15 + (videoIndex * 7) % 45,
            order: vi + 1,
          },
        });
        videoIndex++;
      }
    }
  }

  // ============================================================
  // CREATE NOTICES
  // ============================================================
  console.log('Creating notices...');

  const noticesData = [
    {
      title: 'Half-Yearly Exam Schedule 2025',
      titleBn: 'অর্ধবার্ষিক পরীক্ষার সময়সূচি ২০২৫',
      content: 'অর্ধবার্ষিক পরীক্ষা ২০২৫ সালের ১৫ই মার্চ থেকে শুরু হবে। সকল শিক্ষার্থীদের পরীক্ষার কার্ড সংগ্রহ করতে হবে। পরীক্ষার নিয়মাবলী জানতে অফিসে যোগাযোগ করুন।',
      type: 'exam',
      isActive: true,
    },
    {
      title: 'Class Schedule Change Notice',
      titleBn: 'ক্লাস রুটিন পরিবর্তন বিজ্ঞপ্তি',
      content: 'আগামী সপ্তাহ থেকে নতুন ক্লাস রুটিন কার্যকর হবে। বিস্তারিত রুটিন নোটিশ বোর্ডে দেখুন। পদার্থবিজ্ঞান ক্লাস মঙ্গলবার থেকে বুধবারে স্থানান্তরিত হয়েছে।',
      type: 'general',
      isActive: true,
    },
    {
      title: 'Independence Day Holiday',
      titleBn: 'স্বাধীনতা দিবসের ছুটি',
      content: '২৬শে মার্চ মহান স্বাধীনতা দিবস উপলক্ষে প্রতিষ্ঠান বন্ধ থাকবে। ২৭শে মার্চ থেকে নিয়মিত ক্লাস শুরু হবে।',
      type: 'holiday',
      isActive: true,
    },
    {
      title: 'Urgent: Lab Class Rescheduled',
      titleBn: 'জরুরি: ল্যাব ক্লাস পুনর্নির্ধারণ',
      content: 'আগামীকালের রসায়ন ল্যাব ক্লাস পরবর্তী সপ্তাহের শুক্রবারে স্থানান্তরিত হয়েছে। সকল শিক্ষার্থীদের নতুন সময়সূচি মেনে চলতে হবে।',
      type: 'urgent',
      isActive: true,
    },
    {
      title: 'Annual Sports Day',
      titleBn: 'বার্ষিক ক্রীড়া প্রতিযোগিতা',
      content: 'বার্ষিক ক্রীড়া প্রতিযোগিতা আগামী মাসের ৫ তারিখে অনুষ্ঠিত হবে। অংশগ্রহণে ইচ্ছুক শিক্ষার্থীরা শ্রেণি শিক্ষকের কাছে নাম দিন।',
      type: 'general',
      isActive: true,
    },
    {
      title: 'Summer Vacation Notice',
      titleBn: 'গ্রীষ্মকালীন ছুটির বিজ্ঞপ্তি',
      content: 'গ্রীষ্মকালীন ছুটি ১লা মে থেকে ৩১শে মে পর্যন্ত থাকবে। ছুটির হোমওয়ার্ক শ্রেণি শিক্ষকের কাছ থেকে সংগ্রহ করুন।',
      type: 'holiday',
      isActive: false,
    },
  ];

  for (const notice of noticesData) {
    await prisma.notice.create({ data: notice });
  }

  // ============================================================
  // CREATE EXAMS WITH MCQ QUESTIONS
  // ============================================================
  console.log('Creating exams and questions...');

  const examQuestionsBank: Record<string, Array<{
    question: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    correctAnswer: string;
    explanation: string;
  }[]>> = {
    'বাংলা': [
      [
        { question: '"সংশয়" শব্দের অর্থ কী?', optionA: 'বিশ্বাস', optionB: 'সন্দেহ', optionC: 'নিশ্চয়তা', optionD: 'প্রত্যয়', correctAnswer: 'B', explanation: '"সংশয়" শব্দের অর্থ সন্দেহ বা অবিশ্বাস।' },
        { question: 'কাজী নজরুল ইসলামের জন্মস্থান কোন জেলায়?', optionA: 'কুমিল্লা', optionB: 'ঢাকা', optionC: 'বর্ধমান', optionD: 'মুর্শিদাবাদ', correctAnswer: 'C', explanation: 'কাজী নজরুল ইসলাম ১৮৯৯ সালে পশ্চিমবঙ্গের বর্ধমান জেলায় জন্মগ্রহণ করেন।' },
        { question: '"অভিধান" শব্দে কোন কারকে কোন বিভক্তি?', optionA: 'কর্মে ষষ্ঠী', optionB: 'কর্তায় ষষ্ঠী', optionC: 'করণে ষষ্ঠী', optionD: 'অপাদানে ষষ্ঠী', correctAnswer: 'A', explanation: '"অভিধান" শব্দে কর্মে ষষ্ঠী কারকে ষষ্ঠী বিভক্তি হয়েছে।' },
        { question: 'রবীন্দ্রনাথ ঠাকুর কত সালে নোবেল পুরস্কার পান?', optionA: '১৯১১', optionB: '১৯১৩', optionC: '১৯১৫', optionD: '১৯১০', correctAnswer: 'B', explanation: 'রবীন্দ্রনাথ ঠাকুর ১৯১৩ সালে গীতাঞ্জলির জন্য নোবেল পুরস্কার লাভ করেন।' },
        { question: '"চাঁদের পাহাড়" উপন্যাসের রচয়িতা কে?', optionA: 'হুমায়ূন আহমেদ', optionB: 'জহির রায়হান', optionC: 'সৈয়দ ওয়ালীউল্লাহ', optionD: 'আবুল ফজল', correctAnswer: 'A', explanation: '"চাঁদের পাহাড়" হুমায়ূন আহমেদের রচিত একটি বিখ্যাত উপন্যাস।' },
      ],
      [
        { question: '"বিদ্রোহী" কবিতায় কোন রসের প্রাধান্য?', optionA: 'করুণ রস', optionB: 'বীর রস', optionC: 'হাস্য রস', optionD: 'শান্ত রস', correctAnswer: 'B', explanation: '"বিদ্রোহী" কবিতায় বীর রসের প্রাধান্য লক্ষ্য করা যায়।' },
        { question: 'সংকলন শব্দের সন্ধি বিচ্ছেদ কী?', optionA: 'সং + কলন', optionB: 'সম্ + কলন', optionC: 'সহ + কলন', optionD: 'সৎ + কলন', correctAnswer: 'B', explanation: 'সংকলন = সম্ + কলন। এটি ব্যঞ্জন সন্ধি।' },
        { question: 'নিচের কোনটি শুদ্ধ বানান?', optionA: 'উপলক্ষ', optionB: 'উপলক্ষ্য', optionC: 'উপলাক্ষ', optionD: 'উপোলক্ষ', correctAnswer: 'B', explanation: 'শুদ্ধ বানান হলো "উপলক্ষ্য"।' },
        { question: '"ঘরে-বাইরে" উপন্যাস কার রচনা?', optionA: 'বেগম রোকেয়া', optionB: 'রবীন্দ্রনাথ ঠাকুর', optionC: 'কাজী নজরুল ইসলাম', optionD: 'শরৎচন্দ্র চট্টোপাধ্যায়', correctAnswer: 'A', explanation: '"ঘরে-বাইরে" বেগম রোকেয়া সাখাওয়াত হোসেনের রচনা।' },
        { question: 'নিচের কোনটি কারক বাচক পদের উদাহরণ?', optionA: 'রামের বাড়ি', optionB: 'মাঠে খেলা', optionC: 'হাতে কলমে', optionD: 'পথে হাঁটা', correctAnswer: 'A', explanation: '"রামের বাড়ি" - এখানে "রামের" কারক বাচক পদ।' },
      ],
    ],
    'ইংরেজি': [
      [
        { question: 'What is the past participle of "go"?', optionA: 'goed', optionB: 'gone', optionC: 'went', optionD: 'going', correctAnswer: 'B', explanation: 'The past participle of "go" is "gone". "Went" is the simple past form.' },
        { question: 'Choose the correct sentence:', optionA: 'He don\'t like coffee', optionB: 'He doesn\'t likes coffee', optionC: 'He doesn\'t like coffee', optionD: 'He not like coffee', correctAnswer: 'C', explanation: 'With third person singular subjects, we use "doesn\'t + base form" in negative sentences.' },
        { question: 'The synonym of "abundant" is:', optionA: 'scarce', optionB: 'plentiful', optionC: 'limited', optionD: 'rare', correctAnswer: 'B', explanation: '"Abundant" means available in large quantities; plentiful is its synonym.' },
        { question: '"She has been working since morning." - This is in which tense?', optionA: 'Present Perfect', optionB: 'Present Perfect Continuous', optionC: 'Past Perfect', optionD: 'Past Continuous', correctAnswer: 'B', explanation: 'Has/have been + verb-ing is Present Perfect Continuous tense.' },
        { question: 'Which is the correct passive form of "They play cricket"?', optionA: 'Cricket is played by them', optionB: 'Cricket was played by them', optionC: 'Cricket is being played by them', optionD: 'Cricket has been played by them', correctAnswer: 'A', explanation: 'Simple present active becomes simple present passive: is/am/are + past participle.' },
      ],
      [
        { question: 'Fill in the blank: "If I ___ rich, I would help the poor."', optionA: 'am', optionB: 'was', optionC: 'were', optionD: 'be', correctAnswer: 'C', explanation: 'In second conditional (unreal present), we use "were" for all subjects.' },
        { question: '"To let the cat out of the bag" means:', optionA: 'to set an animal free', optionB: 'to reveal a secret', optionC: 'to make a mistake', optionD: 'to be successful', correctAnswer: 'B', explanation: 'This idiom means to accidentally reveal a secret.' },
        { question: 'Choose the correct spelling:', optionA: 'accomodation', optionB: 'accommodation', optionC: 'acommodation', optionD: 'acomodation', correctAnswer: 'B', explanation: 'The correct spelling is "accommodation" with double "c" and double "m".' },
        { question: 'What type of sentence is this: "What a beautiful day!"', optionA: 'Declarative', optionB: 'Interrogative', optionC: 'Imperative', optionD: 'Exclamatory', correctAnswer: 'D', explanation: 'Sentences expressing strong emotion with "What" or "How" are exclamatory.' },
        { question: 'The antonym of "benevolent" is:', optionA: 'kind', optionB: 'malevolent', optionC: 'generous', optionD: 'helpful', correctAnswer: 'B', explanation: '"Benevolent" means kind/generous; its antonym is "malevolent" meaning evil/harmful.' },
      ],
    ],
    'গণিত': [
      [
        { question: 'x² - 5x + 6 = 0 সমীকরণের মূল দুটি কী কী?', optionA: '২, ৩', optionB: '-২, -৩', optionC: '২, -৩', optionD: '-২, ৩', correctAnswer: 'A', explanation: 'x² - 5x + 6 = (x-2)(x-3) = 0, তাই x = 2 এবং x = 3।' },
        { question: 'একটি ত্রিভুজের কোণ তিনটির সমষ্টি কত?', optionA: '৯০°', optionB: '১৮০°', optionC: '২৭০°', optionD: '৩৬০°', correctAnswer: 'B', explanation: 'যেকোনো ত্রিভুজের অন্তঃকোণ তিনটির সমষ্টি ১৮০°।' },
        { question: 'log₁₀ ১০০ এর মান কত?', optionA: '১', optionB: '২', optionC: '১০', optionD: '১০০', correctAnswer: 'B', explanation: 'log₁₀ ১০০ = log₁₀ ১০² = ২ × log₁₀ ১০ = ২ × ১ = ২।' },
        { question: 'একটি বৃত্তের ব্যাসার্ধ ৭ সে.মি. হলে, ক্ষেত্রফল কত?', optionA: '১৫৪ বর্গ সে.মি.', optionB: '৪৪ বর্গ সে.মি.', optionC: '২২ বর্গ সে.মি.', optionD: '৪৯ বর্গ সে.মি.', correctAnswer: 'A', explanation: 'ক্ষেত্রফল = πr² = (২২/৭) × ৭² = (২২/৭) × ৪৯ = ১৫৪ বর্গ সে.মি.' },
        { question: '2, 4, 6, 8, ... ধারাটির ১০ম পদ কত?', optionA: '১৮', optionB: '২০', optionC: '১৬', optionD: '২২', correctAnswer: 'B', explanation: 'এটি একটি সমান্তর ধারা। a=2, d=2, n=10। a₁₀ = a + (n-1)d = 2 + 9×2 = 20।' },
      ],
      [
        { question: 'sin ৩০° এর মান কত?', optionA: '০', optionB: '১/২', optionC: '১', optionD: '√৩/২', correctAnswer: 'B', explanation: 'sin ৩০° = ১/২। এটি একটি মৌলিক ত্রিকোণমিতিক মান।' },
        { question: 'একটি সমকোণী ত্রিভুজের দুই বাহু ৩ ও ৪ হলে অতিভুজ কত?', optionA: '৫', optionB: '৬', optionC: '৭', optionD: '২৫', correctAnswer: 'A', explanation: 'পিথাগোরাসের উপপাদ্য: c² = a² + b² = ৯ + ১৬ = ২৫, তাই c = ৫।' },
        { question: '৫! এর মান কত?', optionA: '২৫', optionB: '৬০', optionC: '১২০', optionD: '২৪', correctAnswer: 'C', explanation: '৫! = ৫ × ৪ × ৩ × ২ × ১ = ১২০।' },
        { question: 'একটি সমান্তর ধারার প্রথম পদ ৩ এবং সাধারণ অন্তর ২ হলে প্রথম ৫টি পদের সমষ্টি কত?', optionA: '৩৫', optionB: '৩০', optionC: '২৫', optionD: '৪০', correctAnswer: 'A', explanation: 'S₅ = n/2 × [2a + (n-1)d] = ৫/২ × [৬ + ৮] = ৫/২ × ১৪ = ৩৫।' },
        { question: 'একটি ঘনকের একটি ধারার দৈর্ঘ্য ৫ সে.মি. হলে আয়তন কত?', optionA: '২৫ ঘন সে.মি.', optionB: '১২৫ ঘন সে.মি.', optionC: '১৫০ ঘন সে.মি.', optionD: '৭৫ ঘন সে.মি.', correctAnswer: 'B', explanation: 'ঘনকের আয়তন = a³ = ৫³ = ১২৫ ঘন সে.মি.' },
      ],
    ],
    'পদার্থবিজ্ঞান': [
      [
        { question: 'নিউটনের গতির প্রথম সূত্রকে কী বলা হয়?', optionA: 'ত্বরণের সূত্র', optionB: 'জড়তার সূত্র', optionC: 'ক্রিয়া-প্রতিক্রিয়ার সূত্র', optionD: 'মহাকর্ষীয় সূত্র', correctAnswer: 'B', explanation: 'নিউটনের প্রথম সূত্রকে জড়তার সূত্র বলা হয়।' },
        { question: 'বেগের SI একক কী?', optionA: 'm/s²', optionB: 'm/s', optionC: 'km/h', optionD: 'cm/s', correctAnswer: 'B', explanation: 'বেগের SI একক মিটার/সেকেন্ড (m/s)।' },
        { question: 'কাজের সূত্র কী?', optionA: 'W = F × d', optionB: 'W = F + d', optionC: 'W = F/d', optionD: 'W = F - d', correctAnswer: 'A', explanation: 'কাজ = বল × সরণ, অর্থাৎ W = F × d × cosθ।' },
        { question: '১ নিউটন বল কত?', optionA: '1 kg.m/s', optionB: '1 kg.m/s²', optionC: '1 g.cm/s²', optionD: '1 kg.m²/s²', correctAnswer: 'B', explanation: '১ নিউটন = 1 kg.m/s²। বলের SI একক নিউটন।' },
        { question: 'মুক্তভাবে পতনশীল বস্তুর ত্বরণ কত?', optionA: '৯.৮ m/s²', optionB: '১০ m/s²', optionC: '৮.৯ m/s²', optionD: '৯.৫ m/s²', correctAnswer: 'A', explanation: 'পৃথিবীর মহাকর্ষীয় ত্বরণ g = ৯.৮ m/s²।' },
      ],
      [
        { question: 'শক্তির সংরক্ষণ নীতি অনুসারে:', optionA: 'শক্তি সৃষ্টি হয়', optionB: 'শক্তি ধ্বংস হয়', optionC: 'শক্তির রূপান্তর হয়, পরিমাণ একই থাকে', optionD: 'শক্তি বৃদ্ধি পায়', correctAnswer: 'C', explanation: 'শক্তির সংরক্ষণ নীতি অনুসারে শক্তি সৃষ্টি বা ধ্বংস হয় না, শুধু রূপান্তরিত হয়।' },
        { question: 'ক্ষমতার SI একক কী?', optionA: 'জুল', optionB: 'নিউটন', optionC: 'ওয়াট', optionD: 'পাস্কেল', correctAnswer: 'C', explanation: 'ক্ষমতার SI একক ওয়াট (W)। ১ ওয়াট = ১ জুল/সেকেন্ড।' },
        { question: 'তাপমাত্রার SI একক কী?', optionA: 'সেলসিয়াস', optionB: 'ফারেনহাইট', optionC: 'কেলভিন', optionD: 'র‍্যাংকিন', correctAnswer: 'C', explanation: 'তাপমাত্রার SI একক কেলভিন (K)।' },
        { question: 'বস্তুর জড়তা কিসের উপর নির্ভর করে?', optionA: 'আয়তন', optionB: 'ভর', optionC: 'ঘনত্ব', optionD: 'তাপমাত্রা', correctAnswer: 'B', explanation: 'জড়তা বস্তুর ভরের উপর নির্ভর করে। ভর যত বেশি, জড়তা তত বেশি।' },
        { question: 'নিচের কোনটি ভেক্টর রাশি?', optionA: 'ভর', optionB: 'তাপমাত্রা', optionC: 'বেগ', optionD: 'সময়', correctAnswer: 'C', explanation: 'বেগ একটি ভেক্টর রাশি কারণ এর মান ও দিক দুটিই আছে।' },
      ],
    ],
    'রসায়ন': [
      [
        { question: 'পানির রাসায়নিক সংকেত কী?', optionA: 'H₂O', optionB: 'HO₂', optionC: 'H₂O₂', optionD: 'OH', correctAnswer: 'A', explanation: 'পানির রাসায়নিক সংকেত H₂O - ২টি হাইড্রোজেন ও ১টি অক্সিজেন পরমাণু।' },
        { question: 'পরমাণুর কেন্দ্রে কী থাকে?', optionA: 'ইলেকট্রন', optionB: 'নিউক্লিয়াস', optionC: 'শক্তি স্তর', optionD: 'যুগ্ম ইলেকট্রন', correctAnswer: 'B', explanation: 'পরমাণুর কেন্দ্রে নিউক্লিয়াস থাকে যাতে প্রোটন ও নিউট্রন থাকে।' },
        { question: 'pH স্কেলে নিরপেক্ষ দ্রবণের pH কত?', optionA: '০', optionB: '৭', optionC: '১৪', optionD: '১', correctAnswer: 'B', explanation: 'নিরপেক্ষ দ্রবণের pH = ৭। pH < 7 অম্ল, pH > 7 ক্ষারক।' },
        { question: 'অক্সিজেনের পারমাণবিক সংখ্যা কত?', optionA: '৬', optionB: '৭', optionC: '৮', optionD: '৯', correctAnswer: 'C', explanation: 'অক্সিজেনের পারমাণবিক সংখ্যা ৮, অর্থাৎ এর নিউক্লিয়াসে ৮টি প্রোটন আছে।' },
        { question: 'নিচের কোনটি মৌল?', optionA: 'পানি', optionB: 'লবণ', optionC: 'লোহা', optionD: 'চিনি', correctAnswer: 'C', explanation: 'লোহা (Fe) একটি মৌল। পানি, লবণ ও চিনি যৌগ।' },
      ],
      [
        { question: 'রাসায়নিক বন্ধনের তিনটি প্রধান প্রকার কী কী?', optionA: 'আয়নিক, সমযোজী, ধাতব', optionB: 'তরল, কঠিন, গ্যাসীয়', optionC: 'অম্ল, ক্ষার, লবণ', optionD: 'প্রোটন, নিউট্রন, ইলেকট্রন', correctAnswer: 'A', explanation: 'রাসায়নিক বন্ধনের তিনটি প্রধান প্রকার: আয়নিক, সমযোজী ও ধাতব বন্ধন।' },
        { question: 'সোডিয়াম ক্লোরাইড (NaCl) কোন ধরনের বন্ধন গঠন করে?', optionA: 'সমযোজী', optionB: 'আয়নিক', optionC: 'ধাতব', optionD: 'হাইড্রোজেন', correctAnswer: 'B', explanation: 'NaCl আয়নিক বন্ধন গঠন করে কারণ সোডিয়াম ইলেকট্রন ত্যাগ করে ও ক্লোরিন ইলেকট্রন গ্রহণ করে।' },
        { question: 'HCl কোন ধরনের পদার্থ?', optionA: 'ক্ষার', optionB: 'অম্ল', optionC: 'লবণ', optionD: 'অক্সাইড', correctAnswer: 'B', explanation: 'HCl (হাইড্রোক্লোরিক অ্যাসিড) একটি শক্তিশালী অম্ল।' },
        { question: 'লোহায় মরিচা ধরা কোন ধরনের বিক্রিয়া?', optionA: 'সংযোজন', optionB: 'বিযোোজন', optionC: 'জারণ', optionD: 'প্রতিস্থাপন', correctAnswer: 'C', explanation: 'মরিচা ধরা হলো জারণ বিক্রিয়া। লোহা অক্সিজেনের সাথে বিক্রিয়া করে আয়রন অক্সাইড তৈরি করে।' },
        { question: 'কোন গ্যাসটি চুনের পানিকে ঘোলা করে?', optionA: 'O₂', optionB: 'N₂', optionC: 'CO₂', optionD: 'H₂', correctAnswer: 'C', explanation: 'CO₂ গ্যাস চুনের পানিকে ঘোলা করে - Ca(OH)₂ + CO₂ → CaCO₃ + H₂O।' },
      ],
    ],
    'জীববিজ্ঞান': [
      [
        { question: 'কোষের শক্তি উৎপাদনকারী অঙ্গাণু কোনটি?', optionA: 'রাইবোজোম', optionB: 'মাইটোকন্ড্রিয়া', optionC: 'গলগি বডি', optionD: 'এন্ডোপ্লাজমিক রেটিকুলাম', correctAnswer: 'B', explanation: 'মাইটোকন্ড্রিয়া কোষের শক্তি উৎপাদনকারী অঙ্গাণু - একে "কোষের পাওয়ার হাউজ" বলা হয়।' },
        { question: 'কোষ বিভাজনের দুটি প্রকার কী কী?', optionA: 'মাইটোসিস ও মিয়োসিস', optionB: 'ফ্যাগোসাইটোসিস ও পিনোসাইটোসিস', optionC: 'অসিমোসিস ও ডিফিউশন', optionD: 'এন্ডোসাইটোসিস ও এক্সোসাইটোসিস', correctAnswer: 'A', explanation: 'কোষ বিভাজনের দুটি প্রধান প্রকার হলো মাইটোসিস ও মিয়োসিস।' },
        { question: 'উদ্ভিদ কোষের বিশেষ বৈশিষ্ট্য কোনটি?', optionA: 'সেন্ট্রিওল', optionB: 'কোষ প্রাচীর', optionC: 'ফ্ল্যাজেলাম', optionD: 'সিলিয়াম', correctAnswer: 'B', explanation: 'উদ্ভিদ কোষে সেলুলোজের তৈরি কোষ প্রাচীর থাকে যা প্রাণী কোষে থাকে না।' },
        { question: 'DNA এর পূর্ণরূপ কী?', optionA: 'ডাই নিউক্লিক অ্যাসিড', optionB: 'ডিঅক্সিরাইবো নিউক্লিক অ্যাসিড', optionC: 'ডাই অক্সি নিউক্লিক অ্যাসিড', optionD: 'ডাই অ্যাসিটাইল নিউক্লিক অ্যাসিড', correctAnswer: 'B', explanation: 'DNA = Deoxyribonucleic Acid = ডিঅক্সিরাইবো নিউক্লিক অ্যাসিড।' },
        { question: 'সালোকসংশ্লেষণে কোন গ্যাস নির্গত হয়?', optionA: 'CO₂', optionB: 'N₂', optionC: 'O₂', optionD: 'H₂', correctAnswer: 'C', explanation: 'সালোকসংশ্লেষণে অক্সিজেন (O₂) নির্গত হয়: 6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂।' },
      ],
      [
        { question: 'জীবের বর্গীকরণের সর্বোচ্চ একক কোনটি?', optionA: 'গণ', optionB: 'পরিবার', optionC: 'জগৎ', optionD: 'প্রজাতি', correctAnswer: 'C', explanation: 'বর্গীকরণের সর্বোচ্চ একক জগৎ (Kingdom) এবং সর্বনিম্ন প্রজাতি (Species)।' },
        { question: 'মানুষের বৈজ্ঞানিক নাম কী?', optionA: 'Homo sapiens', optionB: 'Homo erectus', optionC: 'Pan troglodytes', optionD: 'Gorilla gorilla', correctAnswer: 'A', explanation: 'মানুষের বৈজ্ঞানিক নাম Homo sapiens।' },
        { question: 'রক্তে অক্সিজেন বহনকারী উপাদান কী?', optionA: 'WBC', optionB: 'প্লেটলেট', optionC: 'হিমোগ্লোবিন', optionD: 'প্লাজমা', correctAnswer: 'C', explanation: 'লোহিত রক্তকণিকায় থাকা হিমোগ্লোবিন অক্সিজেন বহন করে।' },
        { question: 'ভিটামিন C এর রাসায়নিক নাম কী?', optionA: 'রেটিনল', optionB: 'অ্যাসকর্বিক অ্যাসিড', optionC: 'টোকোফেরল', optionD: 'থায়ামিন', correctAnswer: 'B', explanation: 'ভিটামিন C এর রাসায়নিক নাম অ্যাসকর্বিক অ্যাসিড।' },
        { question: 'কোন ভিটামিনের অভাবে স্কার্ভি রোগ হয়?', optionA: 'ভিটামিন A', optionB: 'ভিটামিন B', optionC: 'ভিটামিন C', optionD: 'ভিটামিন D', correctAnswer: 'C', explanation: 'ভিটামিন C এর অভাবে স্কার্ভি রোগ হয়।' },
      ],
    ],
    'তথ্য ও যোগাযোগ প্রযুক্তি': [
      [
        { question: 'কম্পিউটারের মস্তিষ্ক কোনটি?', optionA: 'RAM', optionB: 'CPU', optionC: 'HDD', optionD: 'GPU', correctAnswer: 'B', explanation: 'CPU (Central Processing Unit) কে কম্পিউটারের মস্তিষ্ক বলা হয়।' },
        { question: '১ কিলোবাইট (KB) = কত বাইট?', optionA: '১০০০ বাইট', optionB: '১০২৪ বাইট', optionC: '৫১২ বাইট', optionD: '২০৪৮ বাইট', correctAnswer: 'B', explanation: '১ KB = ২¹⁰ = ১০২৪ বাইট।' },
        { question: 'ইন্টারনেট কী?', optionA: 'একটি সফটওয়্যার', optionB: 'নেটওয়ার্কের নেটওয়ার্ক', optionC: 'একটি হার্ডওয়্যার', optionD: 'একটি প্রোগ্রামিং ভাষা', correctAnswer: 'B', explanation: 'ইন্টারনেট হলো বিশ্বব্যাপী কম্পিউটার নেটওয়ার্কের নেটওয়ার্ক।' },
        { question: 'HTML এর পূর্ণরূপ কী?', optionA: 'Hyper Text Markup Language', optionB: 'High Tech Modern Language', optionC: 'Hyper Transfer Markup Language', optionD: 'Home Tool Markup Language', correctAnswer: 'A', explanation: 'HTML = Hyper Text Markup Language। এটি ওয়েব পেজ তৈরির মার্কআপ ভাষা।' },
        { question: 'বাইনারি সংখ্যা পদ্ধতিতে কতটি সংখ্যা ব্যবহৃত হয়?', optionA: '৮টি', optionB: '১০টি', optionC: '২টি', optionD: '১৬টি', correctAnswer: 'C', explanation: 'বাইনারি সংখ্যা পদ্ধতিতে মাত্র ২টি সংখ্যা (০ ও ১) ব্যবহৃত হয়।' },
      ],
      [
        { question: 'RAM এর পূর্ণরূপ কী?', optionA: 'Random Access Memory', optionB: 'Read Access Memory', optionC: 'Rapid Access Memory', optionD: 'Run Access Memory', correctAnswer: 'A', explanation: 'RAM = Random Access Memory। এটি কম্পিউটারের প্রাথমিক স্মৃতি।' },
        { question: 'নিচের কোনটি অপারেটিং সিস্টেম?', optionA: 'Microsoft Word', optionB: 'Windows', optionC: 'Google Chrome', optionD: 'Photoshop', correctAnswer: 'B', explanation: 'Windows একটি অপারেটিং সিস্টেম। বাকিরা অ্যাপ্লিকেশন সফটওয়্যার।' },
        { question: 'IP অ্যাড্রেস কী?', optionA: 'ইন্টারনেট প্রোটোকল অ্যাড্রেস', optionB: 'ইন্টারনাল প্রোগ্রাম অ্যাড্রেস', optionC: 'ইনপুট প্রসেসর অ্যাড্রেস', optionD: 'ইন্টিগ্রেটেড প্ল্যাটফর্ম অ্যাড্রেস', correctAnswer: 'A', explanation: 'IP = Internet Protocol। IP অ্যাড্রেস নেটওয়ার্কে প্রতিটি ডিভাইসকে চিহ্নিত করে।' },
        { question: 'ওয়েব ব্রাউজারের উদাহরণ কোনটি?', optionA: 'Windows', optionB: 'Linux', optionC: 'Google Chrome', optionD: 'Microsoft Office', correctAnswer: 'C', explanation: 'Google Chrome একটি ওয়েব ব্রাউজার।' },
        { question: 'ডেটাবেজ ম্যানেজমেন্ট সিস্টেমের উদাহরণ কোনটি?', optionA: 'HTML', optionB: 'MySQL', optionC: 'CSS', optionD: 'JavaScript', correctAnswer: 'B', explanation: 'MySQL একটি জনপ্রিয় রিলেশনাল ডেটাবেজ ম্যানেজমেন্ট সিস্টেম।' },
      ],
    ],
    'বাংলাদেশ ও বিশ্বপরিচয়': [
      [
        { question: 'বাংলাদেশের স্বাধীনতা যুদ্ধ কত সালে হয়?', optionA: '১৯৫২', optionB: '১৯৬৯', optionC: '১৯৭১', optionD: '১৯৭৫', correctAnswer: 'C', explanation: 'বাংলাদেশের মহান স্বাধীনতা যুদ্ধ ১৯৭১ সালে সংঘটিত হয়।' },
        { question: 'বাংলাদেশের জাতীয় সংসদ কতটি আসনের সমন্বয়ে গঠিত?', optionA: '৩০০', optionB: '৩৫০', optionC: '৩৫০ (৩০০+৫০ সংরক্ষিত)', optionD: '৪০০', correctAnswer: 'C', explanation: 'জাতীয় সংসদ ৩৫০ আসনের - ৩০০টি সাধারণ ও ৫০টি নারী সংরক্ষিত আসন।' },
        { question: 'ভাষা আন্দোলন কত সালে হয়?', optionA: '১৯৪৭', optionB: '১৯৫২', optionC: '১৯৬৯', optionD: '১৯৭১', correctAnswer: 'B', explanation: 'ভাষা আন্দোলন ১৯৫২ সালে সংঘটিত হয়। ২১শে ফেব্রুয়ারি আন্তর্জাতিক মাতৃভাষা দিবস।' },
        { question: 'বাংলাদেশের সংবিধান কবে কার্যকর হয়?', optionA: '২৬ মার্চ ১৯৭১', optionB: '১৬ ডিসেম্বর ১৯৭১', optionC: '৪ নভেম্বর ১৯৭২', optionD: '১ জানুয়ারি ১৯৭৩', correctAnswer: 'C', explanation: 'বাংলাদেশের সংবিধান ৪ঠা নভেম্বর ১৯৭২ সালে কার্যকর হয়।' },
        { question: 'বাংলাদেশের মুক্তিযুদ্ধে কোন দেশ মিত্র ছিল?', optionA: 'পাকিস্তান', optionB: 'যুক্তরাষ্ট্র', optionC: 'ভারত', optionD: 'চীন', correctAnswer: 'C', explanation: 'মুক্তিযুদ্ধে ভারত বাংলাদেশের মিত্র ছিল এবং সামরিক সহায়তা প্রদান করেছিল।' },
      ],
      [
        { question: 'বাংলাদেশের সরকার ব্যবস্থা কী?', optionA: 'রাষ্ট্রপতি শাসিত', optionB: 'সংসদীয় গণতন্ত্র', optionC: 'সামরিক শাসন', optionD: 'একদলীয় শাসন', correctAnswer: 'B', explanation: 'বাংলাদেশের সরকার ব্যবস্থা সংসদীয় গণতন্ত্র।' },
        { question: 'বাংলাদেশের প্রধান রপ্তানি পণ্য কী?', optionA: 'পাট', optionB: 'চাল', optionC: 'তৈরি পোশাক', optionD: 'চা', correctAnswer: 'C', explanation: 'তৈরি পোশাক (RMG) বাংলাদেশের প্রধান রপ্তানি পণ্য।' },
        { question: 'বাংলাদেশের জনসংখ্যার ঘনত্ব কেমন?', optionA: 'কম', optionB: 'মাঝারি', optionC: 'বেশি', optionD: 'অত্যন্ত কম', correctAnswer: 'C', explanation: 'বাংলাদেশ বিশ্বের সবচেয়ে ঘনবসতিপূর্ণ দেশগুলোর একটি।' },
        { question: 'সুন্দরবন কোন নদী দ্বারা গঠিত?', optionA: 'পদ্মা', optionB: 'মেঘনা', optionC: 'গঙ্গা-ব্রহ্মপুত্র বদ্বীপ', optionD: 'কর্ণফুলী', correctAnswer: 'C', explanation: 'সুন্দরবন গঙ্গা-ব্রহ্মপুত্র বদ্বীপ অঞ্চলে অবস্থিত বিশ্বের বৃহত্তম ম্যানগ্রোভ বন।' },
        { question: 'বাংলাদেশের সর্বোচ্চ পর্বতশৃঙ্গ কোনটি?', optionA: 'চম্বল', optionB: 'তাজিংডং', optionC: 'কেওক্রাডং', optionD: 'মৃগকুমার', correctAnswer: 'B', explanation: 'তাজিংডং (বিজয়) বাংলাদেশের সর্বোচ্চ পর্বতশৃঙ্গ - উচ্চতা প্রায় ১,২৮০ মিটার।' },
      ],
    ],
  };

  for (let si = 0; si < subjects.length; si++) {
    const subject = subjects[si];
    const subjectName = subjectsData[si].nameBn;
    const questionSets = examQuestionsBank[subjectName];

    if (!questionSets) continue;

    // Create 2 exams per subject
    for (let ei = 0; ei < 2; ei++) {
      const chapter = subject.chapters[ei % subject.chapters.length];
      const questions = questionSets[ei % questionSets.length];

      const exam = await prisma.exam.create({
        data: {
          subjectId: subject.id,
          chapterId: chapter.id,
          title: `${subjectName} - পরীক্ষা ${ei + 1}`,
          titleBn: `${subjectName} - পরীক্ষা ${ei + 1}`,
          duration: 15 + ei * 5,
          totalMarks: questions.length,
          isActive: true,
          questions: {
            create: questions.map((q, qi) => ({
              question: q.question,
              optionA: q.optionA,
              optionB: q.optionB,
              optionC: q.optionC,
              optionD: q.optionD,
              correctAnswer: q.correctAnswer,
              explanation: q.explanation,
              marks: 1,
              order: qi + 1,
            })),
          },
        },
      });

      // Create exam results for some students
      for (let sti = 0; sti < Math.min(4, students.length); sti++) {
        const student = students[sti];
        const answers: Record<string, string> = {};
        let score = 0;

        for (const q of questions) {
          const options = ['A', 'B', 'C', 'D'];
          // Some correct, some random
          const isCorrect = Math.random() > 0.4;
          const selected = isCorrect ? q.correctAnswer : options[Math.floor(Math.random() * 4)];
          answers[q.question] = selected;
          if (selected === q.correctAnswer) score++;
        }

        await prisma.examResult.create({
          data: {
            examId: exam.id,
            userId: student.id,
            score,
            totalMarks: questions.length,
            answers: JSON.stringify(answers),
            timeTaken: 300 + Math.floor(Math.random() * 600),
          },
        });
      }
    }
  }

  // ============================================================
  // CREATE ASSIGNMENTS
  // ============================================================
  console.log('Creating assignments...');

  const assignmentNow = new Date();
  const dayMs = 24 * 60 * 60 * 1000;

  const assignmentsData = [
    {
      subjectIndex: 0,
      title: 'Bengali Essay Writing',
      titleBn: 'বাংলা রচনা লেখা',
      description: 'অপঠিত অনুচ্ছেদ থেকে একটি সারাংশ লিখুন এবং আপনার মতামত দিন। কমপক্ষে ৩০০ শব্দে লিখতে হবে।',
      deadline: new Date(assignmentNow.getTime() + 5 * dayMs),
      maxMarks: 50,
    },
    {
      subjectIndex: 2,
      title: 'Algebra Practice Problems',
      titleBn: 'বীজগণিত অনুশীলনী',
      description: 'পাঠ্যবইয়ের অনুশীলনী থেকে ১ থেকে ১৫ নং প্রশ্ন সমাধান করুন। প্রতিটি ধাপ সহকারে সমাধান লিখুন।',
      deadline: new Date(assignmentNow.getTime() + 10 * dayMs),
      maxMarks: 100,
    },
    {
      subjectIndex: 3,
      title: 'Physics Lab Report',
      titleBn: 'পদার্থবিজ্ঞান ল্যাব রিপোর্ট',
      description: 'সরণ ও বেগ সংক্রান্ত ল্যাব এক্সপেরিমেন্টের রিপোর্ট জমা দিন। গ্রাফ ও হিসাব সহ দিতে হবে।',
      deadline: new Date(assignmentNow.getTime() - 3 * dayMs), // expired
      maxMarks: 75,
    },
    {
      subjectIndex: 4,
      title: 'Chemical Equations Balancing',
      titleBn: 'রাসায়নিক সমীকরণ সমতলীকরণ',
      description: 'নিচের ২০টি রাসায়নিক সমীকরণ সমতলীকরণ করুন এবং বিক্রিয়ার ধরন চিহ্নিত করুন।',
      deadline: new Date(assignmentNow.getTime() + 15 * dayMs),
      maxMarks: 80,
    },
    {
      subjectIndex: 1,
      title: 'English Paragraph Writing',
      titleBn: 'ইংরেজি অনুচ্ছেদ লেখা',
      description: 'আপনার প্রিয় বই সম্পর্কে একটি অনুচ্ছেদ লিখুন (১৫০-২০০ শব্দ)। সঠিক ব্যাকরণ ও বানান ব্যবহার করুন।',
      deadline: new Date(assignmentNow.getTime() + 2 * dayMs),
      maxMarks: 60,
    },
    {
      subjectIndex: 5,
      title: 'Biology Plant Diagram',
      titleBn: 'জীববিজ্ঞান উদ্ভিদ চিত্র',
      description: 'একটি সপুষ্পক উদ্ভিদের পুষ্পির চিত্র আঁকুন এবং প্রতিটি অংশের নাম ও কাজ লিখুন।',
      deadline: new Date(assignmentNow.getTime() + 7 * dayMs),
      maxMarks: 40,
    },
    {
      subjectIndex: 6,
      title: 'ICT Project Report',
      titleBn: 'আইসিটি প্রকল্প রিপোর্ট',
      description: 'একটি স্প্রেডশিট সফটওয়্যার ব্যবহার করে আপনার ক্লাসের শিক্ষার্থীদের পরীক্ষার ফলাফল বিশ্লেষণ করুন।',
      deadline: new Date(assignmentNow.getTime() + 12 * dayMs),
      maxMarks: 100,
    },
    {
      subjectIndex: 7,
      title: 'Bangladesh History Timeline',
      titleBn: 'বাংলাদেশের ইতিহাস টাইমলাইন',
      description: '১৯৫২ থেকে ১৯৭১ সাল পর্যন্ত ভাষা আন্দোলন ও মুক্তিযুদ্ধের গুরুত্বপূর্ণ ঘটনাগুলোর টাইমলাইন তৈরি করুন।',
      deadline: new Date(assignmentNow.getTime() - 1 * dayMs), // recently expired
      maxMarks: 70,
    },
  ];

  for (const assignmentData of assignmentsData) {
    const subject = subjects[assignmentData.subjectIndex];
    const chapter = subject.chapters[0];

    const assignment = await prisma.assignment.create({
      data: {
        subjectId: subject.id,
        chapterId: chapter.id,
        title: assignmentData.title,
        titleBn: assignmentData.titleBn,
        description: assignmentData.description,
        deadline: assignmentData.deadline,
        maxMarks: assignmentData.maxMarks,
      },
    });

    // Some students have submitted (more varied patterns)
    const submitCount = Math.floor(Math.random() * 4) + 1; // 1-4 students submit
    for (let sti = 0; sti < Math.min(submitCount, students.length); sti++) {
      const isReviewed = sti < Math.ceil(submitCount / 2);
      const marks = isReviewed ? Math.floor(Math.random() * 30) + 65 : undefined; // 65-95
      const feedbackOptions = [
        'চমৎকার কাজ! অত্যন্ত সুন্দর উপস্থাপন।',
        'ভালো কাজ, কিন্তু আরও উন্নতি সম্ভব।',
        'বেশ ভালো হয়েছে। ধারাবাহিকতা বজায় রাখুন।',
        'চমৎকার! আপনার লেখায় গভীরতা আছে।',
      ];
      await prisma.assignmentSubmission.create({
        data: {
          assignmentId: assignment.id,
          userId: students[sti].id,
          fileUrl: `/uploads/assignment_${assignment.id}_${students[sti].id}.pdf`,
          fileName: `assignment_${sti + 1}.pdf`,
          marks: marks,
          feedback: isReviewed ? feedbackOptions[sti % feedbackOptions.length] : undefined,
          status: isReviewed ? 'reviewed' : 'submitted',
          reviewedAt: isReviewed ? new Date() : undefined,
        },
      });
    }
  }

  // ============================================================
  // CREATE QA QUESTIONS & ANSWERS
  // ============================================================
  console.log('Creating QA questions and answers...');

  const qaQuestionsData = [
    {
      userId: students[0].id,
      subjectId: subjects[2].id,
      title: 'দ্বিঘাত সমীকরণ কীভাবে সমাধান করব?',
      content: 'আমি দ্বিঘাত সমীকরণ সমাধান করতে পারছি না। বিশেষ করে যখন মূলবিহীন সংখ্যা আসে, তখন কী করতে হয়? দয়া করে একটি উদাহরণ সহ ব্যাখ্যা করুন।',
      answers: [
        {
          userId: teacher.id,
          content: 'দ্বিঘাত সমীকরণ সমাধানের জন্য শেষরূপ সূত্র ব্যবহার করা সবচেয়ে সহজ। সূত্রটি হলো:\n\nx = (-b ± √(b²-4ac)) / 2a\n\nযেখানে ax² + bx + c = 0\n\nউদাহরণ: 2x² - 5x + 3 = 0\nএখানে a=2, b=-5, c=3\n\nx = (5 ± √(25-24)) / 4\nx = (5 ± 1) / 4\nx₁ = 6/4 = 3/2 এবং x₂ = 4/4 = 1',
          isAccepted: true,
        },
        {
          userId: students[1].id,
          content: 'আমিও একই সমস্যায় পড়েছিলাম। উপায় নিচে দিলাম:\n\n১. প্রথমে a, b, c চিহ্নিত করুন\n২. বৈষম্য b²-4ac হিসাব করুন\n৩. যদি বৈষম্য ≥ 0 হয়, তাহলে শেষরূপ সূত্র প্রয়োগ করুন\n\nআশা করি সাহায্য হবে!',
          isAccepted: false,
        },
      ],
    },
    {
      userId: students[2].id,
      subjectId: subjects[3].id,
      title: 'নিউটনের তৃতীয় সূত্র বুঝতে পারছি না',
      content: 'নিউটনের তৃতীয় সূত্র "প্রতিটি ক্রিয়ার একটি সমান ও বিপরীত প্রতিক্রিয়া আছে" - এটি বুঝতে পারছি না। যদি সমান বল প্রয়োগ হয়, তাহলে বস্তু নড়ে কীভাবে?',
      answers: [
        {
          userId: teacher.id,
          content: 'খুব ভালো প্রশ্ন! মূল বিষয় হলো - ক্রিয়া ও প্রতিক্রিয়া বল দুটি ভিন্ন বস্তুর উপর কাজ করে।\n\nউদাহরণ: আপনি যখন দেয়াল ঠেলেন, আপনি দেয়ালে বল দিচ্ছেন (ক্রিয়া) এবং দেয়াল আপনাকে সমান বিপরীত বল দিচ্ছে (প্রতিক্রিয়া)।\n\nএই বল দুটি একই বস্তুর উপর কাজ করে না, তাই একে অপরকে বাতিল করে না।',
          isAccepted: true,
        },
      ],
    },
    {
      userId: students[3].id,
      subjectId: subjects[4].id,
      title: 'আয়নিক ও সমযোজী বন্ধনের পার্থক্য কী?',
      content: 'আয়নিক বন্ধন ও সমযোজী বন্ধনের মধ্যে মূল পার্থক্যগুলো কী কী? উদাহরণ সহ বুঝিয়ে বলুন।',
      answers: [],
    },
    {
      userId: students[1]?.id,
      subjectId: subjects[0]?.id,
      title: 'সন্ধির প্রকারভেদ বুঝতে সাহায্য চাই',
      content: 'সন্ধির বিভিন্ন প্রকারভেদ যেমন স্বরসন্ধি, ব্যঞ্জনসন্ধি, বিসর্গসন্ধি - এগুলো মনে রাখা কঠিন হয়ে যাচ্ছে। কোনো সহজ পদ্ধতি আছে কি?',
      upvotes: 5,
      answers: [
        {
          userId: teacher.id,
          content: 'সন্ধি মনে রাখার সহজ উপায় হলো প্রতিটি প্রকারের নিয়ম চার্ট তৈরি করা এবং প্রতিদিন অন্তত ৫টি উদাহরণ চর্চা করা।\n\nস্বরসন্ধি: দুটি স্বরবর্ণ মিলিত হলে (যেমন: দেব+আলয় = দেবালয়)\nব্যঞ্জনসন্ধি: দুটি ব্যঞ্জনবর্ণ মিলিত হলে (যেমন: বাক্+দান = বাগদান)\nবিসর্গসন্ধি: বিসর্গের পর অন্য বর্ণ যুক্ত হলে\n\nনিয়মিত চর্চা করলে সহজ হয়ে যাবে!',
          isAccepted: true,
          upvotes: 3,
        },
        {
          userId: students[2].id,
          content: 'আমার জন্যও একটি ফ্ল্যাশকার্ড তৈরি করে চর্চা করা সবচেয়ে কার্যকর ছিল। প্রতিটি সন্ধির ধরনের জন্য আলাদা রঙের কার্ড ব্যবহার করুন।',
          isAccepted: false,
          upvotes: 1,
        },
      ],
    },
    {
      userId: students[2]?.id,
      subjectId: subjects[1]?.id,
      title: 'Tense এর ব্যবহার কীভাবে বুঝব?',
      content: 'Present Perfect Tense এবং Past Simple Tense এর মধ্যে পার্থক্য বুঝতে পারছি না। কখন কোনটি ব্যবহার করতে হয় তার কি কোনো সহজ নিয়ম আছে?',
      upvotes: 8,
      answers: [
        {
          userId: teacher.id,
          content: 'মূল পার্থক্য হলো:\n\nPresent Perfect: অতীতে শুরু হয়ে বর্তমানে এর প্রভাব আছে\n- I have lived here for 5 years (এখনো থাকি)\n\nPast Simple: অতীতে সম্পন্ন হয়েছে, বর্তমানে কোনো সম্পর্ক নেই\n- I lived there for 5 years (এখন আর থাকি না)\n\nমনে রাখার টিপস: সময় উল্লেখ থাকলে Past Simple, সময় উল্লেখ না থাকলে Present Perfect।',
          isAccepted: true,
          upvotes: 6,
        },
      ],
    },
    {
      userId: students[3]?.id,
      subjectId: subjects[4]?.id,
      title: 'মাইটোসিস ও মিয়োসিস এর পার্থক্য কী?',
      content: 'কোষ বিভাজনের দুটি প্রক্রিয়া - মাইটোসিস ও মিয়োসিস এর মধ্যে মূল পার্থক্যগুলো কী কী? পরীক্ষার জন্য সহজে মনে রাখার উপায় বলে দিন।',
      upvotes: 12,
      answers: [
        {
          userId: teacher.id,
          content: 'মাইটোসিস ও মিয়োসিস এর পার্থক্য:\n\nমাইটোসিস:\n- সোমাটিক কোষে ঘটে\n- ২টি অপত্য কোষ তৈরি হয়\n- ক্রোমোসোম সংখ্যা অপরিবর্তিত থাকে (2n)\n- ১ বার বিভাজন হয়\n\nমিয়োসিস:\n- জনন কোষে ঘটে\n- ৪টি অপত্য কোষ তৈরি হয়\n- ক্রোমোসোম সংখ্যা অর্ধেক হয় (n)\n- ২ বার বিভাজন হয়\n\nমনে রাখার টিপস: মাইটোসিস = সংখ্যা অপরিবর্তিত, মিয়োসিস = সংখ্যা অর্ধেক।',
          isAccepted: true,
          upvotes: 9,
        },
        {
          userId: students[0].id,
          content: 'আমি একটি ছক তৈরি করে মনে রেখেছি:\n\n| বৈশিষ্ট্য | মাইটোসিস | মিয়োসিস |\n|---|---|---|\n| কোষ সংখ্যা | ২ | ৪ |\n| ক্রোমোসোম | 2n | n |\n| বিভাজন | ১ বার | ২ বার |\n\nএই ছকটি পরীক্ষার আগে দেখলেই মনে পড়ে যায়!',
          isAccepted: false,
          upvotes: 4,
        },
      ],
    },
    {
      userId: students[0]?.id,
      subjectId: subjects[5]?.id,
      title: 'বাংলাদেশের মুক্তিযুদ্ধের সংক্ষিপ্ত ইতিহাস',
      content: '১৯৭১ সালের মুক্তিযুদ্ধের প্রধান ঘটনাগুলো কালানুক্রমিকভাবে জানতে চাই। পরীক্ষার জন্য কোন কোন তারিখগুলো মনে রাখা জরুরি?',
      upvotes: 15,
      answers: [
        {
          userId: teacher.id,
          content: 'মুক্তিযুদ্ধের প্রধান ঘটনাপঞ্জি:\n\n৭ মার্চ - বঙ্গবন্ধুর ঐতিহাসিক ভাষণ\n২৫ মার্চ - কালরাত্রি (অপারেশন সার্চলাইট)\n২৬ মার্চ - স্বাধীনতার ঘোষণা\n১৭ এপ্রিল - মুজিবনগর সরকার গঠন\n১৬ ডিসেম্বর - বিজয় দিবস\n\nমনে রাখার জন্য: ৭-২৫-২৬-১৭-১৬ ক্রমটি মনে রাখুন।\n\nপরীক্ষায় সবচেয়ে বেশি প্রশ্ন আসে: ৭ই মার্চের ভাষণ, ২৫শে মার্চের গণহত্যা, এবং ১৬ই ডিসেম্বরের বিজয় নিয়ে।',
          isAccepted: true,
          upvotes: 11,
        },
      ],
    },
    {
      userId: students[1]?.id,
      subjectId: subjects[6]?.id,
      title: 'বাংলাদেশের নদী ব্যবস্থা কীভাবে কাজ করে?',
      content: 'বাংলাদেশের প্রধান নদীগুলো কোন কোন অঞ্চলে প্রবাহিত হয়েছে এবং এদের বৈশিষ্ট্য কী? মানচিত্রে কীভাবে চিহ্নিত করব?',
      upvotes: 6,
      answers: [],
    },
    {
      userId: students[2]?.id,
      subjectId: subjects[7]?.id,
      title: 'HTML ও CSS এর ব্যবহার',
      content: 'ওয়েব পেজ তৈরি করতে HTML এবং CSS এর ব্যবহার কীভাবে করতে হয়? একটি সহজ উদাহরণ দিন।',
      upvotes: 3,
      answers: [
        {
          userId: students[0].id,
          content: 'HTML হলো ওয়েব পেজের কাঠামো এবং CSS হলো সেটির ডিজাইন। একটি সহজ উদাহরণ:\n\nHTML: ঘরের ইট, দেয়াল, ছাদ\nCSS: ঘরের রং, সাজসজ্জা\n\nআগে HTML দিয়ে পেজের কাঠামো তৈরি করুন, তারপর CSS দিয়ে সুন্দর করুন।',
          isAccepted: false,
          upvotes: 2,
        },
      ],
    },
    {
      userId: students[2]?.id,
      subjectId: subjects[2]?.id,
      title: 'ত্রিকোণমিতির সূত্র মনে রাখার সহজ উপায়',
      content: 'sin, cos, tan এর সূত্রগুলো মনে রাখা কঠিন হয়ে যাচ্ছে। ০°, ৩০°, ৪৫°, ৬০°, ৯০° এর মানগুলো কীভাবে সহজে মনে রাখা যায়?',
      upvotes: 10,
      answers: [
        {
          userId: teacher.id,
          content: 'ত্রিকোণমিতির মান মনে রাখার সহজ পদ্ধতি:\n\nsin এর মান: ০, ১/২, ১/√২, √৩/২, ১\n(ভগ্নাংশের হর সব ২, লব হলো √0, √1, √2, √3, √4)\n\ncos এর মান: sin এর উল্টো ক্রম\n১, √৩/২, ১/√২, ১/২, ০\n\ntan = sin/cos\n\nটিপস: একটি টেবিল বানিয়ে প্রতিদিন ৫ মিনিট চর্চা করুন।',
          isAccepted: true,
          upvotes: 7,
        },
      ],
    },
  ];

  for (const qData of qaQuestionsData) {
    const question = await prisma.qAQuestion.create({
      data: {
        userId: qData.userId,
        subjectId: qData.subjectId,
        title: qData.title,
        content: qData.content,
        isSolved: qData.answers.some((a) => a.isAccepted),
        upvotes: (qData as { upvotes?: number }).upvotes || 0,
      },
    });

    for (const aData of qData.answers) {
      await prisma.qAAnswer.create({
        data: {
          questionId: question.id,
          userId: aData.userId,
          content: aData.content,
          isAccepted: aData.isAccepted,
          upvotes: (aData as { upvotes?: number }).upvotes || 0,
        },
      });
    }
  }

  // ============================================================
  // CREATE LEADERBOARD ENTRIES
  // ============================================================
  console.log('Creating leaderboard entries...');

  const weeks = ['2025-W09', '2025-W10', '2025-W11'];
  for (const week of weeks) {
    const scores = students.map(() => Math.floor(Math.random() * 500) + 100);
    const sorted = [...scores].sort((a, b) => b - a);

    for (let i = 0; i < students.length; i++) {
      const rank = sorted.indexOf(scores[i]) + 1;
      await prisma.leaderboardEntry.create({
        data: {
          userId: students[i].id,
          week,
          score: scores[i],
          rank,
        },
      });
    }
  }

  // ============================================================
  // CREATE PROGRESS RECORDS
  // ============================================================
  console.log('Creating progress records...');

  // Create some video progress
  const videos = await prisma.video.findMany({ take: 10 });
  for (const video of videos) {
    for (let sti = 0; sti < Math.min(3, students.length); sti++) {
      await prisma.progress.create({
        data: {
          userId: students[sti].id,
          type: 'video',
          refId: video.id,
          progress: Math.floor(Math.random() * 100),
        },
      });
    }
  }

  // Create some note progress
  const notes = await prisma.note.findMany({ take: 10 });
  for (const note of notes) {
    for (let sti = 0; sti < Math.min(3, students.length); sti++) {
      await prisma.progress.create({
        data: {
          userId: students[sti].id,
          type: 'note',
          refId: note.id,
          progress: Math.floor(Math.random() * 100),
        },
      });
    }
  }

  // ============================================================
  // CREATE NOTIFICATIONS
  // ============================================================
  console.log('Creating notifications...');

  for (const student of students) {
    await prisma.notification.create({
      data: {
        userId: student.id,
        title: 'নতুন পরীক্ষা যোগ হয়েছে',
        message: 'গণিত বিষয়ে একটি নতুন MCQ পরীক্ষা যোগ হয়েছে। দ্রুত অংশগ্রহণ করুন!',
        type: 'info',
        isRead: Math.random() > 0.5,
      },
    });

    await prisma.notification.create({
      data: {
        userId: student.id,
        title: 'অ্যাসাইনমেন্টের ডেডলাইন আসছে',
        message: 'বাংলা রচনা অ্যাসাইনমেন্টের ডেডলাইন আগামী ৩ দিনের মধ্যে।',
        type: 'warning',
        isRead: false,
      },
    });
  }

  // ============================================================
  // CREATE LIVE CLASSES
  // ============================================================
  console.log('Creating live classes...');

  const now = new Date();
  const liveClassesData = [
    { title: 'গণিত - বীজগণিত পর্ব ২', titleBn: 'গণিত - বীজগণিত পর্ব ২', subjectIdx: 2, hostName: 'ফাতেমা বেগম', youtubeId: 'dQw4w9WgXcQ', scheduledAt: new Date(now.getTime() + 2 * 60 * 60 * 1000), duration: 60, status: 'upcoming', description: 'বীজগণিতের দ্বিঘাত সমীকরণ নিয়ে বিস্তারিত আলোচনা' },
    { title: 'পদার্থবিজ্ঞান - গতি ও বল', titleBn: 'পদার্থবিজ্ঞান - গতি ও বল', subjectIdx: 3, hostName: 'আলী হোসেন', youtubeId: 'dQw4w9WgXcQ', scheduledAt: new Date(now.getTime() - 30 * 60 * 1000), duration: 45, status: 'live', description: 'নিউটনের গতিসূত্র ও এর প্রয়োগ' },
    { title: 'ইংরেজি - Grammar Masterclass', titleBn: 'ইংরেজি - Grammar Masterclass', subjectIdx: 1, hostName: 'রাহেলা খাতুন', youtubeId: 'dQw4w9WgXcQ', scheduledAt: new Date(now.getTime() + 24 * 60 * 60 * 1000), duration: 50, status: 'upcoming', description: 'Tense, Voice Change ও Narration একসাথে' },
    { title: 'রসায়ন - অ্যাসিড ও ক্ষার', titleBn: 'রসায়ন - অ্যাসিড ও ক্ষার', subjectIdx: 4, hostName: 'মোস্তফা করিম', youtubeId: 'dQw4w9WgXcQ', scheduledAt: new Date(now.getTime() + 48 * 60 * 60 * 1000), duration: 55, status: 'upcoming', description: 'অ্যাসিড, ক্ষার ও লবণের ধর্ম ও ব্যবহার' },
    { title: 'জীববিজ্ঞান - কোষ বিভাজন', titleBn: 'জীববিজ্ঞান - কোষ বিভাজন', subjectIdx: 5, hostName: 'নাসরিন সুলতানা', youtubeId: 'dQw4w9WgXcQ', scheduledAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), duration: 40, status: 'completed', description: 'মাইটোসিস ও মিয়োসিস কোষ বিভাজন' },
    { title: 'বাংলা - কবিতা বিশ্লেষণ', titleBn: 'বাংলা - কবিতা বিশ্লেষণ', subjectIdx: 0, hostName: 'শারমিন আক্তার', youtubeId: 'dQw4w9WgXcQ', scheduledAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), duration: 35, status: 'completed', description: 'রবীন্দ্রনাথ ও নজরুলের কবিতা বিশ্লেষণ' },
    { title: 'ICT - ওয়েব ডিজাইন ও HTML', titleBn: 'ICT - ওয়েব ডিজাইন ও HTML', subjectIdx: 6, hostName: 'রাকিব হাসান', youtubeId: 'dQw4w9WgXcQ', scheduledAt: new Date(now.getTime() + 72 * 60 * 60 * 1000), duration: 60, status: 'upcoming', description: 'HTML বেসিক থেকে অ্যাডভান্সড' },
    { title: 'বাংলাদেশ ও বিশ্বপরিচয় - মুক্তিযুদ্ধ', titleBn: 'বাংলাদেশ ও বিশ্বপরিচয় - মুক্তিযুদ্ধ', subjectIdx: 7, hostName: 'শিল্পী রায়', youtubeId: 'dQw4w9WgXcQ', scheduledAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), duration: 50, status: 'completed', description: 'বাংলাদেশের মুক্তিযুদ্ধের ইতিহাস' },
  ];

  for (const lc of liveClassesData) {
    await prisma.liveClass.create({
      data: {
        title: lc.title,
        titleBn: lc.titleBn,
        subjectId: subjects[lc.subjectIdx].id,
        youtubeId: lc.youtubeId,
        scheduledAt: lc.scheduledAt,
        duration: lc.duration,
        status: lc.status,
        hostName: lc.hostName,
        description: lc.description,
      },
    });
  }

  // ============================================================
  // CREATE STUDY GROUPS
  // ============================================================
  console.log('Creating study groups...');

  const studyGroupsData = [
    { name: 'বীজগণিত মাস্টার্স', subjectIdx: 2, description: 'বীজগণিতের কঠিন অংক একসাথে সমাধান করি! প্রতিদিন নতুন সমস্যা ও আলোচনা।', maxMembers: 15, creatorIdx: 0, memberIndices: [1, 2, 3, 4] },
    { name: 'পদার্থবিজ্ঞান ল্যাব', subjectIdx: 3, description: 'পদার্থবিজ্ঞানের পরীক্ষামূলক ও তাত্ত্বিক বিষয় নিয়ে আলোচনা। ল্যাব রিপোর্ট শেয়ারিং।', maxMembers: 12, creatorIdx: 1, memberIndices: [0, 2, 5] },
    { name: 'রসায়ন বন্ধন', subjectIdx: 4, description: 'রাসায়নিক বন্ধন, জৈব রসায়ন ও পরীক্ষার প্রস্তুতি নিই একসাথে।', maxMembers: 10, creatorIdx: 2, memberIndices: [3] },
    { name: 'জীববিজ্ঞান অন্বেষণ', subjectIdx: 5, description: 'কোষ বিজ্ঞান থেকে মানবদেহ - সবকিছু নিয়ে আলোচনা ও নোট শেয়ারিং।', maxMembers: 20, creatorIdx: 3, memberIndices: [0, 1, 4, 5] },
    { name: 'বাংলা সাহিত্য চর্চা', subjectIdx: 0, description: 'বাংলা সাহিত্য, কবিতা ও গদ্য নিয়ে গভীর আলোচনা। পরীক্ষার প্রস্তুতি ও রচনা অনুশীলন।', maxMembers: 15, creatorIdx: 4, memberIndices: [1, 2] },
    { name: 'ইংরেজি গ্রামার হাব', subjectIdx: 1, description: 'ইংরেজি ব্যাকরণ, রাইটিং ও কম্প্রিহেনশন প্র্যাকটিস। প্রতিদিন নতুন অনুশীলন।', maxMembers: 18, creatorIdx: 5, memberIndices: [0, 3] },
    { name: 'ICT কোডার্স', subjectIdx: 6, description: 'প্রোগ্রামিং, HTML, ওয়েব ডিজাইন ও ডাটাবেস নিয়ে হাতে-কলমে শিখি।', maxMembers: 16, creatorIdx: 0, memberIndices: [1, 2, 3, 4, 5] },
    { name: 'বিশ্বপরিচয় সমাজ', subjectIdx: 7, description: 'বাংলাদেশের ইতিহাস, সরকার ব্যবস্থা ও অর্থনীতি নিয়ে গভীর আলোচনা ও পরীক্ষার প্রস্তুতি।', maxMembers: 14, creatorIdx: 1, memberIndices: [0, 4, 5] },
  ];

  for (const sg of studyGroupsData) {
    const group = await prisma.studyGroup.create({
      data: {
        name: sg.name,
        description: sg.description,
        subjectId: subjects[sg.subjectIdx].id,
        creatorId: students[sg.creatorIdx].id,
        maxMembers: sg.maxMembers,
        members: {
          create: [
            { userId: students[sg.creatorIdx].id, role: 'admin' },
            ...sg.memberIndices.map((mi: number) => ({
              userId: students[mi].id,
              role: 'member' as const,
            })),
          ],
        },
      },
    });
  }

  console.log('✅ Seeding completed successfully!');
  console.log(`📊 Summary:`);
  console.log(`   - ${subjects.length} subjects with chapters`);
  console.log(`   - ${students.length + 2} users (1 admin, 1 teacher, ${students.length} students, 1 guardian)`);
  console.log(`   - ${liveClassesData.length} live classes`);
  console.log(`   - ${studyGroupsData.length} study groups`);
  console.log(`   - Notes, videos, exams, assignments, Q&A, leaderboard entries created`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
