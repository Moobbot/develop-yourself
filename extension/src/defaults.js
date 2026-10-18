/**
 * Default content shipped with Mindful Shield.
 * Everything here is copied into chrome.storage.local on first install,
 * after which the user can freely edit / delete / extend it in the Options page.
 *
 * Keyword syntax (see detector.js):
 *   phim sex   -> whole word / phrase match, diacritics-insensitive
 *   *porn      -> substring match anywhere (also catches "pornhub", "p o r n")
 *   =lồn       -> exact match WITH diacritics (avoids false positives like "lon bia")
 */

export const DEFAULT_KEYWORDS = [
  // English / international
  'sex', 'xxx', '*porn', 'pr0n', '*p0rn', 's3x', 'nsfw', '18+', '18 plus', 'r18', 'adult video',
  'nudes', 'nude girl', 'nude photo', 'naked girl', 'naked women', 'boobs', 'tits', 'pussy',
  'milf', 'erotic', 'erotica', 'bdsm', 'fetish', 'blowjob', 'handjob', 'threesome', 'gangbang',
  'creampie', 'incest', '*masturbat', 'camgirl', 'onlyfans', 'fansly', 'chaturbate', 'stripchat',
  'sexy girl', 'playboy', 'uncensored',
  // Anime / Japan
  '*hentai', 'ecchi', 'jav', 'av idol', 'idol jav', 'rule34', 'r34', '*hanime', '*エロ', '*アダルト', '*無修正',
  // Vietnamese
  'phim sex', 'phim heo', 'phim xxx', 'phim cấp 3', 'phim người lớn', 'clip sex', 'clip nóng',
  'ảnh sex', 'ảnh nóng', 'ảnh nude', 'clip nude', 'khỏa thân', 'khoả thân', 'khiêu dâm', 'thủ dâm',
  'loạn luân', 'truyện sex', 'truyện người lớn', 'truyện 18+', 'manhwa 18', 'manhwa 18+',
  'chịch nhau', 'địt nhau', 'lộ clip', 'gái xinh sexy', 'hot girl lộ', '=nứng', '=lồn', '=cặc', '=buồi',
  // Well-known adult brands typed into search engines
  '*xvideo', '*xnxx', '*xhamster', '*redtube', '*youporn', '*spankbang', '*brazzers', '*phimsex',
  '*sexvn', '*vlxx', '*javhd', '*missav', '*phimheo'
];

/** Phrases that cancel a match (education, health, place names…). */
export const DEFAULT_ALLOWLIST = [
  'giáo dục giới tính', 'sex education', 'sức khỏe sinh sản', 'sức khoẻ sinh sản', 'sexual health',
  'sex chromosome', 'nhiễm sắc thể giới tính', 'sex ratio', 'tỉ lệ giới tính', 'chống khiêu dâm',
  'cách bỏ xem phim sex', 'cai nghiện phim sex', 'nofap', 'porn addiction', 'quit porn', 'cai porn',
  'essex', 'sussex', 'middlesex'
];

/**
 * Domain list syntax:
 *   pornhub.com  -> that host and all its sub-domains
 *   .xxx         -> whole top-level domain
 *   *porn        -> any host containing the text
 */
export const DEFAULT_DOMAINS = [
  'pornhub.com', 'xvideos.com', 'xnxx.com', 'xhamster.com', 'redtube.com', 'youporn.com', 'tube8.com',
  'spankbang.com', 'eporner.com', 'tnaflix.com', 'beeg.com', 'porntrex.com', 'hqporner.com',
  'brazzers.com', 'onlyfans.com', 'fansly.com', 'chaturbate.com', 'stripchat.com', 'bongacams.com',
  'livejasmin.com', 'cam4.com', 'myfreecams.com', 'rule34.xxx', 'rule34.paheal.net', 'gelbooru.com',
  'danbooru.donmai.us', 'nhentai.net', 'e-hentai.org', 'exhentai.org', 'hentaihaven.xxx', 'hanime.tv',
  'hentai2read.com', 'hitomi.la', 'missav.com', 'missav.ws', 'javhd.com', 'jable.tv', 'javlibrary.com',
  'vlxx.com', 'sexvn.net', 'phimsexhay.net', 'heovl.fit', 'sextop1.net', 'xvideos2.com', 'xnxx.tv',
  '.xxx', '.porn', '.sex', '.adult',
  '*porn', '*hentai', '*xvideo', '*xnxx', '*xhamster', '*phimsex', '*phimheo', '*sexvn', '*vlxx'
];

export const DEFAULT_QUESTIONS = [
  'Bạn xem nội dung này để làm gì? Điều bạn thật sự cần lúc này là gì?',
  '10 phút sau khi xem xong, bạn sẽ cảm thấy thế nào về bản thân?',
  'Việc này đưa bạn đến gần hay xa hơn mục tiêu bạn đã đặt ra?',
  'Bạn đang buồn chán, cô đơn, căng thẳng hay mệt mỏi? Có cách nào lành mạnh hơn để giải quyết cảm xúc đó?',
  'Phiên bản tốt nhất của bạn – người mà bạn muốn trở thành – sẽ làm gì ngay lúc này?',
  'Nếu người bạn yêu thương nhất nhìn thấy màn hình của bạn bây giờ, bạn có thấy thoải mái không?',
  'Thời gian này có thể dùng để học một kỹ năng, tập thể dục hay ngủ sớm hơn không?',
  'Bạn có đang để một thói quen kiểm soát mình, hay bạn đang làm chủ lựa chọn của mình?',
  'Nội dung này mang lại ý nghĩa gì lâu dài cho cuộc sống của bạn?',
  'Bạn có nhớ cảm giác tự hào khi đã vượt qua cám dỗ lần trước không?'
];

export const DEFAULT_GOALS = [
  'Tôi muốn có một tâm trí minh mẫn, tập trung cho học tập và công việc.',
  'Tôi muốn xây dựng mối quan hệ thật, sâu sắc và tôn trọng.',
  'Tôi muốn làm chủ bản thân, không để thói quen xấu điều khiển mình.'
];

export const DEFAULT_ACTIONS = [
  '🫁 Hít thở sâu 1 phút',
  '💪 Chống đẩy 20 cái',
  '💧 Uống một cốc nước lạnh',
  '🚶 Đi bộ 10 phút ngoài trời',
  '📖 Đọc 5 trang sách',
  '📞 Gọi điện cho một người bạn / người thân',
  '🚿 Tắm nước mát',
  '📝 Viết ra 3 điều bạn biết ơn hôm nay',
  '🧹 Dọn dẹp bàn làm việc trong 5 phút',
  '😴 Đi ngủ sớm – bạn của ngày mai sẽ cảm ơn bạn'
];

const q = (text, author = '') => ({ text, author });

export const DEFAULT_QUOTES = [
  q('Kỷ luật là cầu nối giữa mục tiêu và thành tựu.', 'Jim Rohn'),
  q('Chúng ta là những gì chúng ta lặp đi lặp lại. Vì vậy, sự xuất sắc không phải là một hành động, mà là một thói quen.', 'Will Durant (tóm lược Aristotle)'),
  q('Người chiến thắng chính mình là người mạnh nhất.', 'Lão Tử'),
  q('Giữa kích thích và phản ứng có một khoảng trống. Trong khoảng trống đó là quyền lựa chọn của chúng ta.', 'Viktor Frankl'),
  q('Đừng đánh đổi điều bạn muốn nhất để lấy điều bạn muốn ngay bây giờ.'),
  q('Bạn không thể quay lại và thay đổi khởi đầu, nhưng bạn có thể bắt đầu từ đây và thay đổi kết thúc.', 'C.S. Lewis'),
  q('Nỗi đau của kỷ luật nhẹ hơn nhiều so với nỗi đau của sự hối tiếc.', 'Jim Rohn'),
  q('Thành công là tổng của những nỗ lực nhỏ, lặp lại ngày qua ngày.', 'Robert Collier'),
  q('Hãy là người mà bạn cần khi bạn còn nhỏ.'),
  q('Tự do không phải là làm điều mình thích, mà là làm chủ được chính mình.'),
  q('Mỗi lần bạn nói "không" với cám dỗ, bạn đang nói "có" với tương lai của mình.'),
  q('Bạn không thất bại khi bạn ngã. Bạn chỉ thất bại khi bạn không đứng dậy.'),
  q('Năng lượng chảy đến nơi sự chú ý hướng tới.', 'Tony Robbins'),
  q('Điều bạn làm khi không ai nhìn thấy mới là con người thật của bạn.'),
  q('Thói quen nhỏ, kết quả lớn. 1% tốt hơn mỗi ngày, sau một năm bạn sẽ tốt hơn 37 lần.', 'James Clear'),
  q('Mọi hành động bạn làm là một lá phiếu bầu cho con người mà bạn muốn trở thành.', 'James Clear'),
  q('Không có áp lực, không có kim cương.', 'Thomas Carlyle'),
  q('Hãy tập trung vào những gì bạn có thể kiểm soát.', 'Epictetus'),
  q('Chúng ta chịu đựng nhiều hơn trong tưởng tượng so với thực tế.', 'Seneca'),
  q('Hạnh phúc của cuộc đời bạn phụ thuộc vào chất lượng suy nghĩ của bạn.', 'Marcus Aurelius'),
  q('Hôm nay bạn gieo gì, ngày mai bạn gặt nấy.'),
  q('Cơ thể đạt được những gì tâm trí tin tưởng.'),
  q('Khó khăn rèn luyện ý chí, cũng như lao động rèn luyện cơ thể.', 'Seneca'),
  q('Đừng đếm ngày, hãy làm cho mỗi ngày đều đáng giá.', 'Muhammad Ali'),
  q('Bạn mạnh mẽ hơn bạn nghĩ. Cơn thèm muốn sẽ qua đi sau vài phút – sự tự hào sẽ ở lại.'),
  q('Một người không thể làm chủ bản thân thì không thể làm chủ được điều gì khác.'),
  q('Người khôn ngoan điều khiển ham muốn, kẻ dại khờ bị ham muốn điều khiển.'),
  q('Thành công không phải là đích đến, mà là hành trình mỗi ngày bạn chọn đúng.'),
  q('Bạn đầu tư vào bản thân là khoản đầu tư sinh lời nhất.', 'Warren Buffett'),
  q('Ngày tốt nhất để trồng cây là 20 năm trước. Ngày tốt thứ hai là hôm nay.', 'Ngạn ngữ Trung Hoa'),
  q('Hãy sống sao cho khi nhìn lại, bạn không hối tiếc vì đã phí hoài thời gian.'),
  q('Động lực giúp bạn bắt đầu. Thói quen giúp bạn tiếp tục.', 'Jim Ryun'),
  q('Tâm trí giống như chiếc dù, chỉ hoạt động khi nó được mở ra – và được bảo vệ.'),
  q('Người khác có thể ngừng tin vào bạn, nhưng bạn thì đừng bao giờ.'),
  q('Một giờ tập trung sâu đáng giá hơn mười giờ lướt mạng vô định.'),
  q('Hãy trở thành phiên bản mà 5 năm sau bạn sẽ biết ơn.'),
  q('Cám dỗ chỉ mạnh khi bạn đứng yên. Hãy đứng dậy và di chuyển.'),
  q('Mọi bậc thầy đều từng là người mới bắt đầu. Mọi chuỗi ngày dài đều bắt đầu từ ngày thứ nhất.')
];

export const DEFAULT_IMAGES = [
  { type: 'builtin', src: '/assets/images/mountain_sunrise.jpg', caption: 'Đỉnh núi chỉ dành cho người dám leo.' },
  { type: 'builtin', src: '/assets/images/morning_run.jpg', caption: 'Mỗi bước chạy là một lời hứa với bản thân.' },
  { type: 'builtin', src: '/assets/images/study_desk.jpg', caption: 'Đầu tư vào tri thức – khoản lãi lớn nhất.' },
  { type: 'builtin', src: '/assets/images/lake_meditation.jpg', caption: 'Tĩnh lặng để thấy rõ điều mình thật sự muốn.' },
  { type: 'builtin', src: '/assets/images/discipline_workout.jpg', caption: 'Kỷ luật hôm nay, tự do ngày mai.' }
];

export const DEFAULT_VIDEOS = [
  { type: 'youtube', src: 'https://www.youtube.com/watch?v=wSF82AwSDiU', title: 'The great porn experiment – Gary Wilson (TEDxGlasgow)' },
  { type: 'youtube', src: 'https://www.youtube.com/watch?v=gRJ_QfP2mhU', title: 'Why I stopped watching porn – Ran Gavrieli (TEDxJaffa)' },
  { type: 'youtube', src: 'https://www.youtube.com/watch?v=UNP03fDSj1U', title: 'Try something new for 30 days – Matt Cutts (TED)' },
  { type: 'youtube', src: 'https://www.youtube.com/watch?v=H14bBuluwB8', title: 'Grit: The power of passion and perseverance – Angela Duckworth (TED)' },
  { type: 'youtube', src: 'https://www.youtube.com/watch?v=arj7oStGLkU', title: 'Inside the mind of a master procrastinator – Tim Urban (TED)' }
];

export const DEFAULT_SETTINGS = {
  enabled: true,
  pausedUntil: 0,
  strictMode: false,          // hide the "continue anyway" button completely
  continueDelaySec: 30,       // countdown before "continue anyway" unlocks
  requireReason: true,        // must write a reason before continuing
  minReasonLength: 20,
  monitorDomains: true,       // block known adult domains directly
  genericSearch: true,        // inspect ?q=/search= params on every website (TikTok, Facebook, Reddit…)
  hideQuery: false,           // do not display the typed query on the intervention page
  lockDisable: true,          // require typing a commitment sentence to pause/disable
  allowMinutes: 10,           // after "continue anyway", same query/site is allowed for N minutes
  safeUrl: 'https://www.google.com',
  autoPlayVideo: false,
  installedAt: 0
};

export const LOCK_PHRASE = 'Tôi chịu trách nhiệm với lựa chọn của mình';
