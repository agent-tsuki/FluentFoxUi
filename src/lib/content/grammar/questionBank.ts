/**
 * Grammar practice questions, per level, keyed to the grammar chapters.
 *
 * The API builds each chapter's graded exercise from these sentences (FluentFox
 * scripts/content/convert-frontend.mjs → content/chapters/n5.json); the Quiz
 * page still uses them directly for ungraded practice.
 *
 * Each item is one sentence with one gap ({} marks it). The same item is asked
 * three ways on the practice test page: pick the gap from a dropdown, type it,
 * or (unless `noMeaning`) read the whole sentence and pick its English.
 *
 * Writing an item:
 * - `distractors` must be wrong in this sentence with this translation (avoid
 *   a second grammatical option, e.g. に next to へ for a destination).
 * - `alsoAccept` lists other correct typed forms (kana of a kanji answer, a
 *   correct alternative); `romaji` lists typed romaji that kana conversion
 *   can't reach (particles は = wa, を = o, へ = e).
 * Loaded lazily with the practice test page.
 */

export interface GrammarBankItem {
  chapter: number
  /** The sentence, with {} where the answer goes. */
  sentence: string
  answer: string
  /** Three wrong answers for the dropdown. */
  distractors: [string, string, string]
  translation: string
  explanation: string
  alsoAccept?: string[]
  romaji?: string[]
  /** A form drill (e.g. "the te-form of …"): not asked as a translation. */
  noMeaning?: boolean
}

const N5: GrammarBankItem[] = [
  // 1 — Identity & basic particles
  { chapter: 1, sentence: 'わたし{}マイク・ミラーです。', answer: 'は', distractors: ['を', 'へ', 'で'], translation: 'I am Mike Miller.', explanation: 'は marks the topic; as a particle it is read “wa”.', romaji: ['wa'] },
  { chapter: 1, sentence: 'サントスさんは学生{}。', answer: 'じゃありません', distractors: ['です', 'ですか', 'でした'], translation: 'Mr Santos is not a student.', explanation: 'じゃありません is the polite “is not”.', alsoAccept: ['ではありません'] },
  { chapter: 1, sentence: 'ミラーさんはアメリカ人です{}。', answer: 'か', distractors: ['も', 'の', 'を'], translation: 'Is Mr Miller American?', explanation: 'か at the end turns a sentence into a question.' },
  { chapter: 1, sentence: 'グプタさん{}会社員です。', answer: 'も', distractors: ['を', 'へ', 'か'], translation: 'Mr Gupta is also a company employee.', explanation: 'も (“also”) replaces は when the same applies again.' },
  { chapter: 1, sentence: 'ミラーさんはＩＭＣ{}社員です。', answer: 'の', distractors: ['を', 'へ', 'か'], translation: 'Mr Miller is an employee of IMC.', explanation: 'N₁ の N₂: the N₂ that belongs to N₁.' },

  // 2 — Demonstratives & possession
  { chapter: 2, sentence: '{}は辞書です。', answer: 'これ', distractors: ['この', 'ここ', 'どの'], translation: 'This is a dictionary.', explanation: 'これ stands alone as “this (thing)”; この needs a noun after it.' },
  { chapter: 2, sentence: '{}本はわたしのです。', answer: 'この', distractors: ['これ', 'ここ', 'どれ'], translation: 'This book is mine.', explanation: 'この comes before a noun: この本 “this book”.' },
  { chapter: 2, sentence: 'それはボールペンです{}、シャープペンシルですか。', answer: 'か', distractors: ['も', 'の', 'は'], translation: 'Is that a ballpoint pen or a mechanical pencil?', explanation: '〜か、〜か asks which of two.' },
  { chapter: 2, sentence: 'この傘はだれ{}ですか。', answer: 'の', distractors: ['を', 'に', 'へ'], translation: 'Whose umbrella is this?', explanation: 'だれの “whose”: の can stand for the thing owned.' },
  { chapter: 2, sentence: 'これは本ですか。…いいえ、{}。', answer: '違います', distractors: ['そうです', 'はい', 'これです'], translation: 'Is this a book? …No, it isn’t.', explanation: '違います “that’s wrong / it isn’t” answers a yes/no question with no.', alsoAccept: ['ちがいます'] },

  // 3 — Locations & directions
  { chapter: 3, sentence: 'トイレは{}ですか。', answer: 'どこ', distractors: ['だれ', 'なに', 'いつ'], translation: 'Where is the toilet?', explanation: 'どこ asks “where”.' },
  { chapter: 3, sentence: '{}は食堂です。', answer: 'ここ', distractors: ['これ', 'この', 'どこ'], translation: 'This place is the cafeteria.', explanation: 'ここ is “here / this place”; これ is “this thing”.' },
  { chapter: 3, sentence: 'これはどこ{}車ですか。', answer: 'の', distractors: ['を', 'へ', 'で'], translation: 'Where is this car made?', explanation: 'Country の product: where something comes from.' },
  { chapter: 3, sentence: '会社は{}ですか。', answer: 'どちら', distractors: ['だれ', 'いつ', 'いくら'], translation: 'Which company do you work for? (polite)', explanation: 'どちら is the polite どこ.' },

  // 4 — Time & basic verbs
  { chapter: 4, sentence: '毎朝６時{}起きます。', answer: 'に', distractors: ['を', 'へ', 'の'], translation: 'I get up at six every morning.', explanation: 'に marks a clock time.' },
  { chapter: 4, sentence: '９時{}５時まで働きます。', answer: 'から', distractors: ['まで', 'に', 'と'], translation: 'I work from nine to five.', explanation: 'から “from”, まで “until”.' },
  { chapter: 4, sentence: 'きのうは勉強し{}。', answer: 'ませんでした', distractors: ['ます', 'ました', 'ません'], translation: 'I didn’t study yesterday.', explanation: '〜ませんでした is the polite past negative.' },
  { chapter: 4, sentence: '銀行の休みは土曜日{}日曜日です。', answer: 'と', distractors: ['を', 'へ', 'で'], translation: 'The bank is closed on Saturdays and Sundays.', explanation: 'と joins nouns: “A and B”.' },

  // 5 — Movement & transportation
  { chapter: 5, sentence: '来月、日本{}行きます。', answer: 'へ', distractors: ['を', 'で', 'と'], translation: 'I’m going to Japan next month.', explanation: 'へ (read “e”) marks where you go. に works too.', alsoAccept: ['に'], romaji: ['e'] },
  { chapter: 5, sentence: '日曜日はどこへ{}行きません。', answer: 'も', distractors: ['を', 'が', 'の'], translation: 'I don’t go anywhere on Sundays.', explanation: 'Question word + も + negative: “not anywhere / nothing / nobody”.' },
  { chapter: 5, sentence: '電車{}会社へ行きます。', answer: 'で', distractors: ['を', 'が', 'の'], translation: 'I go to work by train.', explanation: 'で marks the means of transport.' },
  { chapter: 5, sentence: '家族{}日本へ来ました。', answer: 'と', distractors: ['を', 'が', 'へ'], translation: 'I came to Japan with my family.', explanation: 'Person と: “together with”.' },
  { chapter: 5, sentence: '{}日本へ来ましたか。', answer: 'いつ', distractors: ['どこ', 'だれ', 'なに'], translation: 'When did you come to Japan?', explanation: 'いつ asks “when” and needs no particle.' },

  // 6 — Direct objects & invitations
  { chapter: 6, sentence: 'ジュース{}飲みます。', answer: 'を', distractors: ['へ', 'で', 'に'], translation: 'I drink juice.', explanation: 'を (read “o”) marks the object of the verb.', romaji: ['o', 'wo'] },
  { chapter: 6, sentence: '駅{}新聞を買います。', answer: 'で', distractors: ['を', 'へ', 'が'], translation: 'I buy a newspaper at the station.', explanation: 'Place で verb: where the action happens.' },
  { chapter: 6, sentence: 'いっしょに京都へ行き{}。', answer: 'ませんか', distractors: ['ましょう', 'ました', 'ます'], translation: 'Won’t you go to Kyoto with me?', explanation: '〜ませんか politely invites.' },
  { chapter: 6, sentence: 'ええ、行き{}。', answer: 'ましょう', distractors: ['ませんか', 'ません', 'ませんでした'], translation: 'Yes, let’s go.', explanation: '〜ましょう “let’s”.' },
  { chapter: 6, sentence: '日曜日、{}をしますか。', answer: 'なに', distractors: ['なん', 'どこ', 'だれ'], translation: 'What do you do on Sundays?', explanation: 'Before を, “what” is なに (なん comes before d-, t-, n- sounds).', alsoAccept: ['何'] },

  // 7 — Giving, receiving & methods
  { chapter: 7, sentence: 'はし{}ごはんを食べます。', answer: 'で', distractors: ['を', 'へ', 'が'], translation: 'I eat with chopsticks.', explanation: 'で marks the tool or means.' },
  { chapter: 7, sentence: '「Thank you」は日本語{}何ですか。', answer: 'で', distractors: ['を', 'へ', 'が'], translation: 'What is “Thank you” in Japanese?', explanation: 'Language で: “in (a language)”.' },
  { chapter: 7, sentence: 'わたしは木村さんに花を{}。', answer: 'あげました', distractors: ['もらいました', 'ありました', 'いました'], translation: 'I gave Ms Kimura flowers.', explanation: 'あげます: the giver is the subject, the receiver takes に.' },
  { chapter: 7, sentence: 'わたしは父{}ネクタイをもらいました。', answer: 'に', distractors: ['を', 'へ', 'で'], translation: 'I received a tie from my father.', explanation: 'With もらいます, the giver takes に (or から).', alsoAccept: ['から'] },
  { chapter: 7, sentence: 'もう昼ごはんを食べましたか。…いいえ、{}です。', answer: 'まだ', distractors: ['もう', 'よく', 'とても'], translation: 'Have you had lunch yet? …No, not yet.', explanation: 'まだです “not yet”.' },

  // 8 — Adjectives
  { chapter: 8, sentence: 'ここは静か{}町です。', answer: 'な', distractors: ['い', 'の', 'を'], translation: 'This is a quiet town.', explanation: 'A な-adjective takes な before a noun.' },
  { chapter: 8, sentence: 'この本はあまりおもしろく{}。', answer: 'ないです', distractors: ['です', 'いです', 'なです'], translation: 'This book isn’t very interesting.', explanation: 'い-adjective negative: drop い, add くないです.', alsoAccept: ['ありません'] },
  { chapter: 8, sentence: '日本の食べ物はおいしいです{}、高いです。', answer: 'が', distractors: ['を', 'へ', 'の'], translation: 'Japanese food is tasty, but expensive.', explanation: 'Sentence が sentence: “…, but …”.' },
  { chapter: 8, sentence: '奈良は{}町ですか。', answer: 'どんな', distractors: ['どう', 'どこ', 'だれ'], translation: 'What kind of town is Nara?', explanation: 'どんな + noun asks “what kind of”.' },
  { chapter: 8, sentence: 'この料理は{}おいしいです。', answer: 'とても', distractors: ['あまり', 'まだ', 'もう'], translation: 'This dish is very tasty.', explanation: 'とても “very” goes with positives; あまり needs a negative.' },

  // 9 — Preferences, abilities & reasons
  { chapter: 9, sentence: 'わたしはイタリア料理{}好きです。', answer: 'が', distractors: ['を', 'へ', 'で'], translation: 'I like Italian food.', explanation: '好き takes が for what you like.' },
  { chapter: 9, sentence: '日本語{}少しわかります。', answer: 'が', distractors: ['を', 'へ', 'で'], translation: 'I understand a little Japanese.', explanation: 'わかります takes が for what you understand.' },
  { chapter: 9, sentence: '時間がありません{}、新聞を読みません。', answer: 'から', distractors: ['まで', 'を', 'へ'], translation: 'I don’t read the paper because I have no time.', explanation: 'Reason から, result: “because …, …”.' },
  { chapter: 9, sentence: '{}早く帰りますか。', answer: 'どうして', distractors: ['どこ', 'だれ', 'なに'], translation: 'Why are you going home early?', explanation: 'どうして asks “why”.', alsoAccept: ['なぜ'] },

  // 10 — Existence & location
  { chapter: 10, sentence: 'あそこに男の人が{}。', answer: 'います', distractors: ['あります', 'します', 'きます'], translation: 'There is a man over there.', explanation: 'います for people and animals; あります for things.' },
  { chapter: 10, sentence: '机の上に本が{}。', answer: 'あります', distractors: ['います', 'します', 'きます'], translation: 'There is a book on the desk.', explanation: 'あります for things that don’t move by themselves.' },
  { chapter: 10, sentence: '郵便局は銀行の{}にあります。', answer: 'となり', distractors: ['うえ', 'した', 'なか'], translation: 'The post office is next to the bank.', explanation: 'N の となり “next to N”.', alsoAccept: ['隣'] },
  { chapter: 10, sentence: '箱の中に手紙{}写真があります。', answer: 'や', distractors: ['を', 'へ', 'で'], translation: 'In the box there are letters, photos and so on.', explanation: 'や lists a few examples (“A, B and so on”).' },
  { chapter: 10, sentence: 'ミラーさんは会議室{}います。', answer: 'に', distractors: ['を', 'へ', 'が'], translation: 'Mr Miller is in the meeting room.', explanation: 'Place に います/あります: where someone or something is.' },

  // 11 — Counting & quantities
  { chapter: 11, sentence: 'りんごを{}買いました。', answer: '四つ', distractors: ['四人', '四枚', '四台'], translation: 'I bought four apples.', explanation: '〜つ counts general things; 人 people, 枚 flat things, 台 machines.', alsoAccept: ['よっつ'] },
  { chapter: 11, sentence: 'この会社に外国人が{}います。', answer: '三人', distractors: ['三つ', '三枚', '三台'], translation: 'There are three foreigners at this company.', explanation: '〜人 counts people.', alsoAccept: ['さんにん'] },
  { chapter: 11, sentence: '国で２か月{}日本語を勉強しました。', answer: 'ぐらい', distractors: ['しか', 'を', 'に'], translation: 'I studied Japanese for about two months in my country.', explanation: 'Amount + ぐらい “about”.', alsoAccept: ['くらい'] },
  { chapter: 11, sentence: '休みは日曜日{}です。', answer: 'だけ', distractors: ['しか', 'ぐらい', 'を'], translation: 'My only day off is Sunday.', explanation: 'だけ “only” works with a positive; しか needs a negative verb.' },
  { chapter: 11, sentence: '１時間{}寝ませんでした。', answer: 'しか', distractors: ['だけ', 'ぐらい', 'も'], translation: 'I only slept for an hour.', explanation: 'しか + negative: “nothing but”.' },

  // 12 — Past tense & comparisons
  { chapter: 12, sentence: 'きのうは雨{}。', answer: 'でした', distractors: ['です', 'じゃありません', 'かったです'], translation: 'It was rainy yesterday.', explanation: 'Noun + でした is the polite past.' },
  { chapter: 12, sentence: '旅行は楽し{}。', answer: 'かったです', distractors: ['いでした', 'でした', 'くないです'], translation: 'The trip was fun.', explanation: 'い-adjective past: drop い, add かったです (never いでした).' },
  { chapter: 12, sentence: '中国は日本{}大きいです。', answer: 'より', distractors: ['から', 'まで', 'ほう'], translation: 'China is bigger than Japan.', explanation: 'A は B より …: “A is more … than B”.' },
  { chapter: 12, sentence: 'スポーツの中で何が{}好きですか。', answer: 'いちばん', distractors: ['より', 'あまり', 'まだ'], translation: 'Which sport do you like the most?', explanation: 'いちばん “the most”.', alsoAccept: ['一番'] },
  { chapter: 12, sentence: 'きのうは寒く{}。', answer: 'なかったです', distractors: ['ないでした', 'なかったでした', 'ないです'], translation: 'It wasn’t cold yesterday.', explanation: 'い-adjective past negative: 〜くなかったです.', alsoAccept: ['ありませんでした'] },

  // 13 — Desires & purposes
  { chapter: 13, sentence: 'わたしは新しい車{}ほしいです。', answer: 'が', distractors: ['を', 'へ', 'で'], translation: 'I want a new car.', explanation: 'ほしい takes が for the thing wanted.' },
  { chapter: 13, sentence: '沖縄へ行き{}です。', answer: 'たい', distractors: ['ほしい', 'ます', 'ない'], translation: 'I want to go to Okinawa.', explanation: 'Verb stem + たいです “want to do”.' },
  { chapter: 13, sentence: 'デパートへ靴を買い{}行きます。', answer: 'に', distractors: ['を', 'で', 'へ'], translation: 'I’m going to the department store to buy shoes.', explanation: 'Verb stem に 行きます: go in order to do.' },
  { chapter: 13, sentence: 'のどがかわきましたから、{}飲みたいです。', answer: '何か', distractors: ['何も', 'だれか', 'どこか'], translation: 'I’m thirsty, so I want to drink something.', explanation: '何か “something”; 何も + negative is “nothing”.', alsoAccept: ['なにか'] },

  // 14 — Te-form & polite requests
  { chapter: 14, sentence: 'ちょっと待っ{}ください。', answer: 'て', distractors: ['た', 'で', 'に'], translation: 'Please wait a moment.', explanation: '待ちます → 待って: て-form + ください.' },
  { chapter: 14, sentence: 'この漢字の読み方を教え{}。', answer: 'てください', distractors: ['てます', 'たいです', 'ました'], translation: 'Please tell me how to read this kanji.', explanation: 'て-form + ください: a polite request.' },
  { chapter: 14, sentence: 'ミラーさんは今、電話をかけ{}。', answer: 'ています', distractors: ['てください', 'ません', 'たいです'], translation: 'Mr Miller is making a phone call now.', explanation: 'て-form + います: an action in progress.' },
  { chapter: 14, sentence: '暑いですね。窓を開け{}。', answer: 'ましょうか', distractors: ['ませんでした', 'ています', 'たいです'], translation: 'It’s hot, isn’t it? Shall I open the window?', explanation: '〜ましょうか offers help: “shall I …?”.' },
  { chapter: 14, sentence: '「飲みます」のて形は「{}」です。', answer: '飲んで', distractors: ['飲みて', '飲って', '飲いて'], translation: 'The te-form of nomimasu is nonde.', explanation: 'Group 1 verbs in み・び・に → んで.', alsoAccept: ['のんで'], noMeaning: true },

  // 15 — Permission, prohibition & states
  { chapter: 15, sentence: '写真を撮っ{}いいですか。', answer: 'ても', distractors: ['ては', 'て', 'たら'], translation: 'May I take a photo?', explanation: '〜てもいいですか asks permission.' },
  { chapter: 15, sentence: 'ここでたばこを吸っ{}いけません。', answer: 'ては', distractors: ['ても', 'て', 'ないで'], translation: 'You must not smoke here.', explanation: '〜てはいけません: “must not”.' },
  { chapter: 15, sentence: 'わたしは大阪に住ん{}。', answer: 'でいます', distractors: ['ています', 'でください', 'だいます'], translation: 'I live in Osaka.', explanation: '住みます → 住んで; 〜ています for a lasting state.' },
  { chapter: 15, sentence: 'わたしは結婚し{}。', answer: 'ています', distractors: ['てください', 'てもいいです', 'ましょう'], translation: 'I am married.', explanation: '結婚しています: the state that results from marrying.' },

  // 16 — Nai-form & obligations
  { chapter: 16, sentence: '「行きます」のない形は「{}」です。', answer: '行かない', distractors: ['行きない', '行くない', '行けない'], translation: 'The nai-form of ikimasu is ikanai.', explanation: 'Group 1: change the い-sound before ます to あ, add ない.', alsoAccept: ['いかない'], noMeaning: true },
  { chapter: 16, sentence: 'ここに車を止め{}ください。', answer: 'ないで', distractors: ['て', 'なくて', 'ても'], translation: 'Please don’t park your car here.', explanation: 'ない-form + で ください: “please don’t”.' },
  { chapter: 16, sentence: '薬を飲ま{}なりません。', answer: 'なければ', distractors: ['なくても', 'ないで', 'ては'], translation: 'I have to take medicine.', explanation: '〜なければなりません: “must”.' },
  { chapter: 16, sentence: 'あしたは来{}いいです。', answer: 'なくても', distractors: ['なければ', 'ないで', 'ては'], translation: 'You don’t have to come tomorrow.', explanation: '〜なくてもいいです: “don’t have to”.' },
  { chapter: 16, sentence: '荷物はここ{}置かないでください。', answer: 'に', distractors: ['を', 'が', 'の'], translation: 'Please don’t put your luggage here.', explanation: 'Place に 置きます: where something is put.' },

  // 17 — Dictionary form & ability
  { chapter: 17, sentence: 'わたしはピアノを弾く{}ができます。', answer: 'こと', distractors: ['もの', 'ところ', 'とき'], translation: 'I can play the piano.', explanation: 'Dictionary form + ことができます: “can do”.' },
  { chapter: 17, sentence: 'わたしの趣味は写真を撮る{}です。', answer: 'こと', distractors: ['もの', 'ところ', 'とき'], translation: 'My hobby is taking photos.', explanation: 'Dictionary form + こと makes an action a noun.' },
  { chapter: 17, sentence: '寝る{}、歯をみがきます。', answer: 'まえに', distractors: ['あとで', 'から', 'まで'], translation: 'I brush my teeth before I go to bed.', explanation: 'Dictionary form + まえに: “before doing”.', alsoAccept: ['前に'] },
  { chapter: 17, sentence: '「書きます」の辞書形は「{}」です。', answer: '書く', distractors: ['書る', '書きる', '書いる'], translation: 'The dictionary form of kakimasu is kaku.', explanation: 'Group 1: change the い-sound before ます to う.', alsoAccept: ['かく'], noMeaning: true },
  { chapter: 17, sentence: '食事の{}、手を洗います。', answer: 'まえに', distractors: ['あとで', 'から', 'まで'], translation: 'I wash my hands before meals.', explanation: 'Noun の まえに: “before (a meal, a meeting…)”.', alsoAccept: ['前に'] },

  // 18 — Ta-form & experience
  { chapter: 18, sentence: 'わたしは北海道へ行った{}があります。', answer: 'こと', distractors: ['もの', 'ところ', 'とき'], translation: 'I have been to Hokkaido.', explanation: 'た-form + ことがあります: “have done (before)”.' },
  { chapter: 18, sentence: '日曜日はテニスをし{}、映画を見たりします。', answer: 'たり', distractors: ['ても', 'たら', 'ないで'], translation: 'On Sundays I do things like play tennis and watch films.', explanation: '〜たり、〜たりします lists some of the things you do.' },
  { chapter: 18, sentence: 'だんだん寒{}なりました。', answer: 'く', distractors: ['い', 'に', 'な'], translation: 'It has gradually got colder.', explanation: 'い-adjective: drop い, add くなります (“become”).' },
  { chapter: 18, sentence: '元気{}なりました。', answer: 'に', distractors: ['く', 'な', 'の'], translation: 'I got well again.', explanation: 'な-adjective or noun + になります.' },
  { chapter: 18, sentence: '「飲みます」のた形は「{}」です。', answer: '飲んだ', distractors: ['飲みた', '飲った', '飲いた'], translation: 'The ta-form of nomimasu is nonda.', explanation: 'The た-form follows the て-form: 飲んで → 飲んだ.', alsoAccept: ['のんだ'], noMeaning: true },

  // 19 — Plain form, と思います, と言いました
  { chapter: 19, sentence: 'あしたは雨が降る{}思います。', answer: 'と', distractors: ['を', 'が', 'に'], translation: 'I think it will rain tomorrow.', explanation: 'Plain form + と思います: “I think …”.' },
  { chapter: 19, sentence: '「行きます」の普通形は「{}」です。', answer: '行く', distractors: ['行き', '行きる', '行かる'], translation: 'The plain form of ikimasu is iku.', explanation: 'The plain present is the dictionary form.', alsoAccept: ['いく'], noMeaning: true },
  { chapter: 19, sentence: 'ミラーさんは来週東京へ行く{}言いました。', answer: 'と', distractors: ['を', 'が', 'で'], translation: 'Mr Miller said he will go to Tokyo next week.', explanation: 'Plain form + と言いました reports what someone said.' },
  { chapter: 19, sentence: '日本は物価が高い{}思います。', answer: 'と', distractors: ['を', 'が', 'へ'], translation: 'I think prices in Japan are high.', explanation: 'An い-adjective is already plain: 高い + と思います.' },

  // 20 — Noun modification
  { chapter: 20, sentence: 'めがねをかけている{}はミラーさんです。', answer: '人', distractors: ['を', 'が', 'に'], translation: 'The person wearing glasses is Mr Miller.', explanation: 'A plain-form clause comes straight before the noun it describes.', alsoAccept: ['ひと'] },
  { chapter: 20, sentence: 'これはわたし{}作ったケーキです。', answer: 'が', distractors: ['を', 'へ', 'で'], translation: 'This is a cake I made.', explanation: 'Inside a noun-describing clause, the subject takes が (or の), not は.', alsoAccept: ['の'] },
  { chapter: 20, sentence: 'ミラーさんが住んでいる{}はどこですか。', answer: 'うち', distractors: ['を', 'が', 'に'], translation: 'Where is the house Mr Miller lives in?', explanation: 'The clause 住んでいる describes うち.', alsoAccept: ['家', 'いえ'] },
  { chapter: 20, sentence: 'わたしは朝ごはんを食べる{}がありません。', answer: '時間', distractors: ['を', 'に', 'へ'], translation: 'I have no time to eat breakfast.', explanation: 'Dictionary form + 時間: “time to do”.', alsoAccept: ['じかん'] },

  // 21 — Time & consequences
  { chapter: 21, sentence: '図書館で本を借りる{}、カードが要ります。', answer: 'とき', distractors: ['から', 'まで', 'より'], translation: 'When you borrow books at the library, you need a card.', explanation: '〜とき: “when …”.', alsoAccept: ['時'] },
  { chapter: 21, sentence: 'このボタンを押す{}、お釣りが出ます。', answer: 'と', distractors: ['を', 'が', 'へ'], translation: 'If you press this button, your change comes out.', explanation: 'Dictionary form + と: a result that always follows.' },
  { chapter: 21, sentence: '道{}渡って、右へ曲がってください。', answer: 'を', distractors: ['に', 'へ', 'で'], translation: 'Cross the road and turn right, please.', explanation: 'を marks the place you move through or across.', romaji: ['o', 'wo'] },
  { chapter: 21, sentence: '暇な{}、何をしますか。', answer: 'とき', distractors: ['から', 'まで', 'より'], translation: 'What do you do when you’re free?', explanation: 'な-adjective + な + とき.', alsoAccept: ['時'] },

  // 22 — Conditionals & advice
  { chapter: 22, sentence: '雨が降っ{}、行きません。', answer: 'たら', distractors: ['ないで', 'ては', 'たり'], translation: 'If it rains, I won’t go.', explanation: 'た-form + ら: “if / when …”.' },
  { chapter: 22, sentence: '雨が降っ{}、行きます。', answer: 'ても', distractors: ['たら', 'ては', 'ないで'], translation: 'Even if it rains, I’ll go.', explanation: 'て-form + も: “even if …”.' },
  { chapter: 22, sentence: 'どうし{}いいですか。', answer: 'たら', distractors: ['ても', 'ては', 'て'], translation: 'What should I do?', explanation: 'Question word + 〜たらいいですか asks for advice.' },
  { chapter: 22, sentence: 'パーティーに学生が２００人{}来ました。', answer: 'も', distractors: ['しか', 'を', 'が'], translation: 'As many as 200 students came to the party.', explanation: 'Amount + も: “as many as”.' },
  { chapter: 22, sentence: 'お金が５００円{}ありません。', answer: 'しか', distractors: ['だけ', 'も', 'ぐらい'], translation: 'I only have 500 yen.', explanation: 'Amount + しか + negative: “only”.' },

  // 23 — Giving & receiving
  { chapter: 23, sentence: '佐藤さんがわたしにチョコレートを{}。', answer: 'くれました', distractors: ['あげました', 'もらいました', 'ありました'], translation: 'Ms Sato gave me chocolate.', explanation: 'くれます: someone gives to me (or my side).' },
  { chapter: 23, sentence: 'わたしは木村さんに本を貸して{}。', answer: 'あげました', distractors: ['くれました', 'もらいました', 'ください'], translation: 'I lent Ms Kimura a book (as a favour).', explanation: 'て-form + あげます: I do something for someone.' },
  { chapter: 23, sentence: 'わたしは母に料理を教えて{}。', answer: 'もらいました', distractors: ['あげました', 'くれました', 'ください'], translation: 'My mother taught me how to cook.', explanation: 'て-form + もらいます: I receive a favour from someone (に).' },
  { chapter: 23, sentence: '{}がその時計をくれましたか。', answer: 'だれ', distractors: ['どこ', 'なに', 'いつ'], translation: 'Who gave you that watch?', explanation: 'だれが asks who did it.', alsoAccept: ['誰'] },

  // 24 — Potential & completion
  { chapter: 24, sentence: 'わたしは日本語{}話せます。', answer: 'が', distractors: ['に', 'で', 'へ'], translation: 'I can speak Japanese.', explanation: 'A potential verb usually takes が for its object.', alsoAccept: ['を'] },
  { chapter: 24, sentence: '「泳ぎます」の可能形は「{}」です。', answer: '泳げます', distractors: ['泳ぎます', '泳がます', '泳ぎれます'], translation: 'The potential form of oyogimasu is oyogemasu.', explanation: 'Group 1: change the い-sound before ます to え.', alsoAccept: ['およげます'], noMeaning: true },
  { chapter: 24, sentence: '部屋の窓から海が{}。', answer: '見えます', distractors: ['見ます', '聞こえます', '見せます'], translation: 'You can see the sea from my room’s window.', explanation: '見えます: something is visible (no effort).', alsoAccept: ['みえます'] },
  { chapter: 24, sentence: '宿題を忘れて{}。', answer: 'しまいました', distractors: ['いました', 'みました', 'おきました'], translation: 'I (regrettably) forgot my homework.', explanation: 'て-form + しまいました: done completely, often with regret.' },
  { chapter: 24, sentence: 'ひらがな{}書けません。', answer: 'しか', distractors: ['だけ', 'も', 'を'], translation: 'I can only write hiragana.', explanation: 'しか + negative potential: “can only”.' },

  // 25 — Timing & reasons
  { chapter: 25, sentence: '頭が痛い{}、早く帰ります。', answer: 'ので', distractors: ['のに', 'まで', 'より'], translation: 'I have a headache, so I’ll go home early.', explanation: '〜ので gives a reason, a little softer than から.', alsoAccept: ['から'] },
  { chapter: 25, sentence: 'これは「すし」{}食べ物です。', answer: 'という', distractors: ['といって', 'とした', 'をいう'], translation: 'This is a food called sushi.', explanation: 'N₁ という N₂: “an N₂ called N₁”.' },
  { chapter: 25, sentence: 'ごはんを食べた{}、歯をみがきます。', answer: 'あとで', distractors: ['まえに', 'まで', 'より'], translation: 'I brush my teeth after eating.', explanation: 'た-form + あとで: “after doing”.', alsoAccept: ['後で'] },
  { chapter: 25, sentence: 'どこで切符を買っ{}いいですか。', answer: 'たら', distractors: ['ても', 'ては', 'て'], translation: 'Where should I buy the ticket?', explanation: 'Question word + 〜たらいいですか asks what to do.' },
]

/** Practice questions per grammar level (lower-case level id). Levels without questions are absent. */
export const GRAMMAR_QUESTION_BANK: Readonly<Record<string, readonly GrammarBankItem[]>> = { n5: N5 }
