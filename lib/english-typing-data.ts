// 打字学英语 · 句库与句型（本站原创编写）
// 句子翻译与语法点评、句型说明均为本站原创；影视台词风短句为自写风格句，非影视原台词。

export interface EtSentence {
  en: string; zh: string; note: string;
}

export interface EtSentencePack {
  id: string; name: string; desc: string; sentences: EtSentence[];
}

export const SENTENCE_PACKS: EtSentencePack[] = [
  { id: "s1", name: "入门日常", desc: "最简单的日常句子，12 句。", sentences: [
    { en: "Good morning, everyone.", zh: "早上好，各位。", note: "问候语，morning 前不用加 the。" },
    { en: "What is your name?", zh: "你叫什么名字？", note: "What is = What's，问名字。" },
    { en: "I am from China.", zh: "我来自中国。", note: "be from 表示来自某地。" },
    { en: "Nice to meet you.", zh: "很高兴见到你。", note: "初次见面常用语。" },
    { en: "How are you today?", zh: "你今天怎么样？", note: "回答：I'm fine, thanks." },
    { en: "I like apples very much.", zh: "我非常喜欢苹果。", note: "like + 名词，very much 表程度。" },
    { en: "She is my best friend.", zh: "她是我最好的朋友。", note: "best 是 good 的最高级。" },
    { en: "We go to school by bus.", zh: "我们坐公交车上学。", note: "by + 交通工具。" },
    { en: "It is sunny today.", zh: "今天天气晴朗。", note: "It is + 天气形容词。" },
    { en: "I have a big family.", zh: "我有一个大家庭。", note: "have 表示拥有。" },
    { en: "My mother cooks dinner every day.", zh: "我妈妈每天做晚饭。", note: "第三人称单数动词加 s。" },
    { en: "The cat is under the table.", zh: "猫在桌子下面。", note: "under 表示在……下面。" },
  ] },
  { id: "s2", name: "进阶生活", desc: "带从句与比较级的进阶句子，12 句。", sentences: [
    { en: "Could you help me with my homework?", zh: "你能帮我做作业吗？", note: "Could you…? 是礼貌请求。" },
    { en: "I would like a cup of coffee, please.", zh: "请给我一杯咖啡。", note: "would like 表想要，比 want 更礼貌。" },
    { en: "The movie was more interesting than I thought.", zh: "这部电影比我想象的有趣。", note: "more…than 比较级结构。" },
    { en: "If it rains tomorrow, we will stay at home.", zh: "如果明天下雨，我们就待在家里。", note: "if 引导条件句，主将从现。" },
    { en: "She has lived in Beijing for five years.", zh: "她在北京住了五年。", note: "现在完成时，for + 一段时间。" },
    { en: "I am looking forward to seeing you.", zh: "我期待见到你。", note: "look forward to 后接动名词。" },
    { en: "The book that I bought yesterday is very good.", zh: "我昨天买的那本书很好。", note: "that 引导定语从句修饰 book。" },
    { en: "He runs faster than anyone in our class.", zh: "他跑得比我们班任何人都快。", note: "比较级 + than anyone。" },
    { en: "You should drink more water when you are ill.", zh: "生病时你应该多喝水。", note: "should 表建议。" },
    { en: "I did not know that she could swim so well.", zh: "我不知道她游泳这么好。", note: "that 引导宾语从句。" },
    { en: "The longer you practice, the better you will be.", zh: "练得越久，你就越好。", note: "the + 比较级，the + 比较级，越……越……。" },
    { en: "It is important to learn English well.", zh: "学好英语很重要。", note: "It is + 形容词 + to do，形式主语。" },
  ] },
  { id: "s3", name: "职场沟通", desc: "邮件与会议里最常用的 12 句。", sentences: [
    { en: "Thank you for your email.", zh: "感谢你的邮件。", note: "商务邮件常用开头。" },
    { en: "Let us schedule a meeting next Monday.", zh: "我们下周一安排一次会议吧。", note: "schedule a meeting 安排会议。" },
    { en: "Could you send me the report by Friday?", zh: "你能在周五前把报告发给我吗？", note: "by Friday 表示不晚于周五。" },
    { en: "I am writing to confirm our appointment.", zh: "我写信确认我们的约会。", note: "be writing to do 写信是为了……。" },
    { en: "Please let me know if you have any questions.", zh: "如有任何问题请告诉我。", note: "let me know 告诉我。" },
    { en: "We need to discuss the budget today.", zh: "我们今天需要讨论预算。", note: "discuss 后直接接名词，不加 about。" },
    { en: "The project will be finished by the end of this month.", zh: "项目将在本月底前完成。", note: "被动语态 will be finished。" },
    { en: "I would like to introduce our new colleague.", zh: "我想介绍一下我们的新同事。", note: "introduce 介绍。" },
    { en: "Thank you for your time and support.", zh: "感谢你的时间和支持。", note: "商务致谢常用句。" },
    { en: "Could we move the deadline to next week?", zh: "我们能把截止日期推到下周吗？", note: "move the deadline 推迟截止日期。" },
    { en: "I am afraid I cannot attend the meeting.", zh: "恐怕我不能参加会议了。", note: "I'm afraid… 委婉拒绝。" },
    { en: "Looking forward to your reply.", zh: "期待你的回复。", note: "邮件结尾常用句。" },
  ] },
  { id: "s4", name: "四六级", desc: "四六级写作高频句型，12 句。", sentences: [
    { en: "With the development of the Internet, our life has changed a lot.", zh: "随着互联网的发展，我们的生活发生了很大变化。", note: "with + 名词表伴随；现在完成时。" },
    { en: "It is widely believed that reading is good for us.", zh: "人们普遍认为阅读对我们有益。", note: "It is believed that… 人们认为……。" },
    { en: "To solve this problem, we should take action at once.", zh: "为了解决这个问题，我们应该立即采取行动。", note: "不定式作目的状语。" },
    { en: "The number of students is increasing every year.", zh: "学生人数逐年增加。", note: "the number of… 谓语用单数。" },
    { en: "Not only students but also teachers should learn English.", zh: "不仅学生，老师也应该学英语。", note: "not only…but also… 不仅……而且……。" },
    { en: "Compared with the past, people live a better life now.", zh: "与过去相比，人们现在的生活更好了。", note: "compared with 与……相比。" },
    { en: "There is no doubt that hard work leads to success.", zh: "毫无疑问，努力会带来成功。", note: "There is no doubt that… 毫无疑问……。" },
    { en: "It is important for us to protect the environment.", zh: "保护环境对我们很重要。", note: "It is important for sb to do…。" },
    { en: "The more you read, the more you will learn.", zh: "你读得越多，学到的就越多。", note: "the more…the more… 越……越……。" },
    { en: "Only in this way can we solve the problem.", zh: "只有这样，我们才能解决问题。", note: "only 放在句首，句子部分倒装。" },
    { en: "As we all know, health is more important than wealth.", zh: "众所周知，健康比财富更重要。", note: "As we all know 众所周知。" },
    { en: "In my opinion, we should spend more time on study.", zh: "在我看来，我们应该花更多时间学习。", note: "In my opinion 在我看来。" },
  ] },
  { id: "s5", name: "雅思托福", desc: "雅思托福议论文常用句，12 句。", sentences: [
    { en: "Governments should invest more in public transport.", zh: "政府应该在公共交通上投入更多。", note: "invest in 投资于……。" },
    { en: "Some people argue that technology makes our lives easier.", zh: "有人认为科技让我们的生活更轻松。", note: "argue that… 认为……。" },
    { en: "The main reason for this is the lack of education.", zh: "其主要原因是缺乏教育。", note: "the reason for… ……的原因。" },
    { en: "It is essential to protect the environment for future generations.", zh: "为子孙后代保护环境至关重要。", note: "It is essential to do… 做……至关重要。" },
    { en: "There are several advantages and disadvantages to this idea.", zh: "这个想法有几个优点和缺点。", note: "advantages and disadvantages 优点和缺点。" },
    { en: "In recent years, more and more people have moved to big cities.", zh: "近年来，越来越多的人搬到了大城市。", note: "more and more 越来越多。" },
    { en: "This trend is likely to continue in the future.", zh: "这一趋势未来可能会持续。", note: "be likely to do 很可能做……。" },
    { en: "We should take measures to deal with the problem.", zh: "我们应该采取措施处理这个问题。", note: "take measures to do 采取措施做……。" },
    { en: "The data shows that the number is rising.", zh: "数据显示这个数字在上升。", note: "the data shows 数据显示。" },
    { en: "From my point of view, this policy is good for everyone.", zh: "在我看来，这项政策对每个人都有好处。", note: "From my point of view 在我看来。" },
    { en: "One of the biggest challenges is climate change.", zh: "最大的挑战之一是气候变化。", note: "one of + 最高级 + 复数名词。" },
    { en: "In conclusion, we should work together to solve this problem.", zh: "总之，我们应该共同努力解决这个问题。", note: "In conclusion 总之。" },
  ] },
  { id: "s6", name: "日常口语", desc: "最常用的口语短句，12 句。", sentences: [
    { en: "No way! I can't believe it.", zh: "不可能吧！我简直不敢相信。", note: "No way! 表惊讶，不可能。" },
    { en: "Take your time. There's no rush.", zh: "慢慢来，不着急。", note: "Take your time 慢慢来。" },
    { en: "I'm starving. Let's grab something to eat.", zh: "我饿坏了，找点吃的吧。", note: "starving 饿极了；grab something to eat 随便吃点。" },
    { en: "That sounds great. I'm in!", zh: "听起来不错，我参加！", note: "I'm in 我加入、我参加。" },
    { en: "It's up to you.", zh: "你说了算。", note: "It's up to you 由你决定。" },
    { en: "I have no idea.", zh: "我不知道。", note: "have no idea 一点都不知道。" },
    { en: "Long time no see!", zh: "好久不见！", note: "久别重逢常用语。" },
    { en: "Don't worry about it.", zh: "别担心这件事。", note: "worry about 担心……" },
    { en: "Let's call it a day.", zh: "今天就到这里吧。", note: "call it a day 收工、到此为止。" },
    { en: "You did a great job!", zh: "你做得太棒了！", note: "do a great job 干得好。" },
    { en: "Can I have a minute?", zh: "能给我一分钟吗？", note: "have a minute 有一分钟时间吗。" },
    { en: "It doesn't matter.", zh: "没关系。", note: "It doesn't matter 不要紧。" },
  ] },
  { id: "s7", name: "影视台词风", desc: "电影感短句（本站自写），12 句。", sentences: [
    { en: "We came this far. We can't stop now.", zh: "我们都走到这一步了，不能现在停下。", note: "come this far 走到这一步。" },
    { en: "Trust me. I've got a plan.", zh: "相信我，我有计划。", note: "I've got a plan 我有办法。" },
    { en: "The city never sleeps, and neither do we.", zh: "这座城市从不入眠，我们也是。", note: "neither do we 我们也不。" },
    { en: "Some doors, once opened, can never be closed.", zh: "有些门一旦打开，就再也关不上了。", note: "once opened 一旦打开。" },
    { en: "You don't know what you're capable of until you try.", zh: "不试一试，你永远不知道自己能做到什么。", note: "be capable of 能够做……" },
    { en: "Every choice has a price.", zh: "每个选择都有代价。", note: "have a price 有代价。" },
    { en: "We all have something to fight for.", zh: "我们每个人都有值得为之奋斗的东西。", note: "something to fight for 值得奋斗的东西。" },
    { en: "The truth always finds a way out.", zh: "真相总会水落石出。", note: "find a way out 找到出路。" },
    { en: "Hold on. We're almost there.", zh: "坚持住，我们快到了。", note: "hold on 坚持住；almost there 快到了。" },
    { en: "I never thought I'd say this, but thank you.", zh: "我从没想过会这么说，但谢谢你。", note: "I never thought… 我从没想过……" },
    { en: "This is where it all begins.", zh: "一切从这里开始。", note: "where 引导定语从句。" },
    { en: "No one can do it alone.", zh: "没有人能独自完成。", note: "alone 独自地。" },
  ] },
  { id: "s8", name: "旅行出行", desc: "出门旅行最常用的 12 句。", sentences: [
    { en: "Where is the nearest subway station?", zh: "最近的地铁站在哪里？", note: "the nearest 最近的。" },
    { en: "I'd like to check in, please.", zh: "我想办理入住。", note: "check in 办理入住。" },
    { en: "How much is the ticket to the museum?", zh: "去博物馆的票多少钱？", note: "How much…? 多少钱？" },
    { en: "Could you show me the way to the beach?", zh: "你能告诉我去海滩的路吗？", note: "show sb the way 指路。" },
    { en: "The flight leaves at nine in the morning.", zh: "航班早上九点起飞。", note: "leave 出发、离开。" },
    { en: "We booked a room with a sea view.", zh: "我们订了一间海景房。", note: "book a room 订房；sea view 海景。" },
    { en: "Excuse me, is this seat taken?", zh: "打扰一下，这个座位有人吗？", note: "is this seat taken 有人坐吗。" },
    { en: "I need to change some money.", zh: "我需要换点钱。", note: "change money 兑换货币。" },
    { en: "The weather here is much warmer than back home.", zh: "这里的天气比家里暖和多了。", note: "much warmer 暖和得多（比较级）。" },
    { en: "Don't forget your passport.", zh: "别忘了带护照。", note: "forget 忘记；祈使句。" },
    { en: "We are planning a trip to Japan next spring.", zh: "我们计划明年春天去日本旅行。", note: "plan a trip 计划旅行。" },
    { en: "The food here is amazing. You have to try it.", zh: "这里的食物太棒了，你一定要尝尝。", note: "have to do 必须做……" },
  ] },
];

export const ALL_SENTENCES: EtSentence[] = SENTENCE_PACKS.flatMap((p) => p.sentences);

// ---------- 句型（从句库里提炼，说明与例句均为本站自写） ----------

export interface EtPattern {
  id: string;
  name: string; // 句型名，如 It takes sb … to do sth
  pattern: string; // 结构展示
  explain: string; // 自写说明
  examples: EtSentence[]; // 3 例
}

export const PATTERNS: EtPattern[] = [
  { id: "p1", name: "It takes sb … to do sth", pattern: "It takes + 人 + 时间 + to do sth", explain: "做某事花某人多长时间。主语是形式主语 it，真正主语是后面的 to do。", examples: [
    { en: "It takes me half an hour to get to school.", zh: "我到学校要花半小时。", note: "take + 时间 + to do。" },
    { en: "It took us two days to finish the work.", zh: "我们花了两天完成这项工作。", note: "took 是 take 的过去式。" },
    { en: "How long does it take to walk there?", zh: "走到那里要多久？", note: "How long 提问时间长度。" },
  ] },
  { id: "p2", name: "have trouble (in) doing sth", pattern: "have trouble (in) doing sth / have trouble with sth", explain: "做某事有困难。trouble 后接动名词，也可以接 with + 名词。", examples: [
    { en: "I have trouble remembering new words.", zh: "我记新单词有困难。", note: "trouble doing 做……有困难。" },
    { en: "She had trouble with her computer yesterday.", zh: "她昨天电脑出了问题。", note: "have trouble with 某物有问题。" },
    { en: "Don't be afraid to ask for help.", zh: "需要帮助时别不好意思开口。", note: "be afraid to do 不敢做……" },
  ] },
  { id: "p3", name: "not only … but also …", pattern: "not only A but also B", explain: "不仅……而且……。连接两个并列成分；not only 放在句首时，句子要部分倒装。", examples: [
    { en: "Not only students but also teachers should learn English.", zh: "不仅学生，老师也应该学英语。", note: "连接两个主语。" },
    { en: "He is not only smart but also kind.", zh: "他不仅聪明而且善良。", note: "连接两个形容词。" },
    { en: "Not only did she win the game, but she also broke the record.", zh: "她不仅赢了比赛，还破了纪录。", note: "not only 句首，did 提前倒装。" },
  ] },
  { id: "p4", name: "It is + adj. + (for sb) to do sth", pattern: "It is + 形容词 + (for sb) to do sth", explain: "做某事是……的。用 it 作形式主语，真正主语是 to do；for sb 说明对谁而言。", examples: [
    { en: "It is important to learn English well.", zh: "学好英语很重要。", note: "important 重要的。" },
    { en: "It is easy for him to solve the problem.", zh: "对他来说解决这个问题很容易。", note: "for him 对他来说。" },
    { en: "It is dangerous to swim in this river.", zh: "在这条河里游泳很危险。", note: "dangerous 危险的。" },
  ] },
  { id: "p5", name: "look forward to doing sth", pattern: "look forward to doing sth / to + 名词", explain: "期待做某事。to 是介词，后面接动名词，不能接动词原形。", examples: [
    { en: "I am looking forward to seeing you.", zh: "我期待见到你。", note: "to 后接 seeing 动名词。" },
    { en: "We look forward to hearing from you.", zh: "我们期待收到你的来信。", note: "hear from 收到……的来信。" },
    { en: "She is looking forward to her birthday.", zh: "她期待着自己的生日。", note: "to 后也可以接名词。" },
  ] },
  { id: "p6", name: "be used to doing sth", pattern: "be used to doing sth / used to do sth", explain: "习惯于做某事。used to do sth 则是过去常常做某事，两者别混。", examples: [
    { en: "I am used to getting up early.", zh: "我习惯早起。", note: "be used to doing 习惯于。" },
    { en: "He used to live in the countryside.", zh: "他过去住在乡下。", note: "used to do 过去常常。" },
    { en: "You will get used to the new job soon.", zh: "你很快会习惯这份新工作。", note: "get used to 变得习惯。" },
  ] },
  { id: "p7", name: "The more …, the more …", pattern: "The + 比较级，the + 比较级", explain: "越……，越……。两个分句都用比较级。", examples: [
    { en: "The more you read, the more you will learn.", zh: "你读得越多，学到的就越多。", note: "两个 the 后的都是比较级。" },
    { en: "The harder you work, the better the result will be.", zh: "你越努力，结果就越好。", note: "harder / better 都是比较级。" },
    { en: "The longer you practice, the better you will be.", zh: "练得越久，你就越好。", note: "longer / better 比较级。" },
  ] },
  { id: "p8", name: "would like to do / Would you like …?", pattern: "would like to do sth / Would you like to …?", explain: "想要做……。would like 比 want 更礼貌；Would you like…? 用来礼貌地邀请或提供。", examples: [
    { en: "I would like a cup of coffee, please.", zh: "请给我一杯咖啡。", note: "would like 想要（礼貌）。" },
    { en: "Would you like to join us?", zh: "你想加入我们吗？", note: "Would you like to…? 邀请。" },
    { en: "She would like to be a teacher.", zh: "她想当一名老师。", note: "would like to be 想要成为。" },
  ] },
];
