const path = require('path');
const fs = require('fs');

let db;
let DatabaseSync = null;

try {
  DatabaseSync = require('node:sqlite').DatabaseSync;
} catch (e) {
  console.warn('node:sqlite not available on this Node version. Using in-memory store adapter.');
}

if (DatabaseSync) {
  // Support Vercel serverless environment (where root filesystem is read-only at runtime)
  const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;
  let dbPath;

  if (isServerless) {
    const tmpDataDir = '/tmp';
    dbPath = path.join(tmpDataDir, 'scout_wood.db');
    const sourceDbPath = path.join(__dirname, 'data', 'scout_wood.db');
    
    if (!fs.existsSync(dbPath) && fs.existsSync(sourceDbPath)) {
      try {
        fs.copyFileSync(sourceDbPath, dbPath);
      } catch (e) {
        console.warn('Could not copy initial db to /tmp, will initialize new:', e);
      }
    }
  } else {
    const dataDir = path.join(__dirname, 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    dbPath = path.join(dataDir, 'scout_wood.db');
  }

  db = new DatabaseSync(dbPath);

  try {
    // Enable WAL mode for better concurrency and integrity
    db.exec('PRAGMA journal_mode = WAL;');
  } catch (e) {}

  // Initialize tables
  initDatabase();
} else {
  // In-memory fallback mock for environments without node:sqlite
  db = createInMemoryDbAdapter();
}

function initDatabase() {
  if (!db || !db.exec) return;

  // 1. Members table
  db.exec(`
    CREATE TABLE IF NOT EXISTS members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      scout_type TEXT NOT NULL,
      phone TEXT NOT NULL,
      memo TEXT,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 2. Gallery table
  db.exec(`
    CREATE TABLE IF NOT EXISTS gallery (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      category TEXT DEFAULT '일반',
      image_url TEXT NOT NULL,
      description TEXT,
      activity_date TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 3. Topics table
  db.exec(`
    CREATE TABLE IF NOT EXISTS topics (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      icon TEXT NOT NULL,
      color TEXT NOT NULL,
      description TEXT
    )
  `);

  // 4. Notices table
  db.exec(`
    CREATE TABLE IF NOT EXISTS notices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      topic_id TEXT NOT NULL,
      title TEXT NOT NULL,
      author TEXT DEFAULT 'WOOD지역대 대장',
      content TEXT NOT NULL,
      is_important INTEGER DEFAULT 0,
      views INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (topic_id) REFERENCES topics(id)
    )
  `);

  // 5. Admin config table
  db.exec(`
    CREATE TABLE IF NOT EXISTS admin_config (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `);

  // Seed default topics if empty
  const topicCount = db.prepare('SELECT COUNT(*) as count FROM topics').get()?.count || 0;
  if (topicCount === 0) {
    const insertTopic = db.prepare('INSERT INTO topics (id, name, icon, color, description) VALUES (?, ?, ?, ?, ?)');
    insertTopic.run('camp', '매달 야영 대집회 캠프', 'fa-campground', 'orange', '기본 1박 2일 야영, 텐트 구축, 야외 요리, 모닥불 파티');
    insertTopic.run('orienteering', '숲 생태 오리엔티어링', 'fa-compass', 'sage', '나침반과 지도를 활용한 숲속 미션 포인트 탐색 레이스');
    insertTopic.run('badge', '스카우트 기능 뱃지 이수', 'fa-award', 'mustard', '매듭법, 응급처치, 야외 요리 등 18종 기능 과제 도전과 뱃지 수집');
    insertTopic.run('jamboree', '국제 잼버리 대회 및 문화 교류', 'fa-earth-americas', 'sky', '전 세계 대원들과 우정을 쌓고 글로벌 리더십을 배우는 모험');
  }

  // Seed default gallery if empty
  const galleryCount = db.prepare('SELECT COUNT(*) as count FROM gallery').get()?.count || 0;
  if (galleryCount === 0) {
    const insertGallery = db.prepare('INSERT INTO gallery (title, category, image_url, description, activity_date) VALUES (?, ?, ?, ?, ?)');
    insertGallery.run('밤하늘 모닥불 파티 & 통기타 싱어롱', '캠프', 'images/gallery_campfire.jpg', '모닥불 앞에서 노래 부르고 마시멜로를 구워 먹는 행복한 시간', '2026-05-15');
    insertGallery.run('숲속 계곡 통나무 다리 건너기 탐사', '숲속탐사', 'images/gallery_hiking.jpg', '북한산 숲속 계곡에서 안전하게 진행된 자연 탐사 모험', '2026-06-10');
    insertGallery.run('반별 텐트 구축 및 야영 캠프', '캠프', 'images/scout_activities.jpg', '대원들이 직접 협동하여 삼각 텐트와 타프를 설치하는 실습', '2026-07-20');
    insertGallery.run('뱃지 수집과 자랑스러운 수여식', '기능뱃지', 'images/scout_badges.jpg', '열심히 훈련하고 취득한 기능 뱃지들을 수여받은 자랑스러운 순간', '2026-08-01');
  }

  // Seed default notices if empty
  const noticeCount = db.prepare('SELECT COUNT(*) as count FROM notices').get()?.count || 0;
  if (noticeCount === 0) {
    const insertNotice = db.prepare('INSERT INTO notices (topic_id, title, author, content, is_important, views, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)');
    
    insertNotice.run(
      'camp',
      '🏕️ [필독] 9월 가을 정기 야영 대회 일정 및 개인 준비물 안내',
      'WOOD지역대 훈련대장',
      '대원 여러분 안녕하십니까!\n\n올가을 첫 정기 야영 대집회가 9월 12일(토)~13일(일) 북한산 스카우트 전용 야영장에서 개최됩니다.\n\n[주요 프로그램]\n- 반별 삼각텐트 피칭 및 비박 훈련\n- 통나무 모닥불 파티 & 마시멜로 굽기\n- 밤하늘 별자리 관측 및 숲속 야간 추적\n\n[개인 필수 준비물]\n1. 스카우트 단복 및 모자, 네커치프\n2. 침낭, 개인 매트, 세면도구, 랜턴\n3. 개인 식기 세트 및 보온 외투\n\n궁금한 점은 각 반장 또는 대장님께 문의 바랍니다! 🌲🔥',
      1,
      42,
      new Date().toISOString()
    );

    insertNotice.run(
      'camp',
      '⛺ 캠프 야영 요리 경연대회 메뉴 공모전',
      'WOOD지역대 활동부',
      '이번 9월 캠프에서는 반별 "최고의 숲속 셰프" 경연대회가 열립니다!\n각 반별로 야외 코펠과 버너를 활용한 창의적인 레시피를 구상해오세요. 우수 반에는 특별 간식 뱃지가 수여됩니다.',
      0,
      18,
      new Date(Date.now() - 86400000).toISOString()
    );

    insertNotice.run(
      'orienteering',
      '🧭 [공지] 숲 생태 오리엔티어링 미션 지도 및 나침반 사용법 특강',
      'WOOD지역대 지도자',
      '숲속에서 길을 잃지 않고 목표 지점을 찾는 오리엔티어링 기본 교육이 이번 주 토요일 집회에서 진행됩니다.\n\n- 지도 정치법(도북, 자북 일치시키기)\n- 나침반 베어링(방위각) 측정 및 보폭 계산법\n- QR코드 숲속 생태 퀴즈 미션 포인트 안내\n\n모든 대원은 배낭에 나침반과 필기도구를 지참해주세요!',
      1,
      29,
      new Date().toISOString()
    );

    insertNotice.run(
      'badge',
      '🏅 2026 하반기 스카우트 기능 뱃지(매듭법, 응급처치) 검정 안내',
      'WOOD지역대 심사관',
      '스카우트 기능 뱃지 검정 일정을 공지합니다.\n\n1. 매듭법 뱃지: 옭매듭, 8자매듭, 바른매듭, 접친매듭, 고리매듭, 버클매듭 등 8종 실기\n2. 응급처치 뱃지: 삼각건 붕대법, 심폐소생술(CPR), 이동법 실습\n\n충분히 연습하여 전원 합격의 영예를 안으시길 응원합니다!',
      1,
      35,
      new Date().toISOString()
    );

    insertNotice.run(
      'jamboree',
      '🌏 2027 국제 스카우트 잼버리 파견 대원 사전 오리엔테이션',
      'WOOD지역대 대장',
      '해외 자매결연 지역대와의 국제 문화 교류 및 잼버리 파견 오리엔테이션이 개최됩니다.\n글로벌 시민으로서의 자질과 외국 스카우트와의 우정 교류에 관심 있는 대원과 학부모님의 많은 참여 바랍니다.',
      0,
      15,
      new Date(Date.now() - 172800000).toISOString()
    );
  }

  // Seed sample members if empty
  const memberCount = db.prepare('SELECT COUNT(*) as count FROM members').get()?.count || 0;
  if (memberCount === 0) {
    const insertMember = db.prepare('INSERT INTO members (name, scout_type, phone, memo, status, created_at) VALUES (?, ?, ?, ?, ?, ?)');
    insertMember.run('김모험', '초등 (컵스카우트)', '010-3344-5566', '자연에서 친구들과 텐트 치고 캠핑하는 걸 꼭 배워보고 싶어요!', 'approved', new Date(Date.now() - 259200000).toISOString());
    insertMember.run('박스카우트', '중등 (스카우트)', '010-7788-9900', '오리엔티어링과 기능 뱃지를 많이 따고 싶습니다.', 'pending', new Date(Date.now() - 86400000).toISOString());
  }

  // Seed default admin password if not exists
  const adminPass = db.prepare('SELECT value FROM admin_config WHERE key = ?').get('admin_password');
  if (!adminPass) {
    db.prepare('INSERT INTO admin_config (key, value) VALUES (?, ?)').run('admin_password', 'wood1234');
  }
}

function createInMemoryDbAdapter() {
  const store = {
    topics: [
      { id: 'camp', name: '매달 야영 대집회 캠프', icon: 'fa-campground', color: 'orange', description: '기본 1박 2일 야영, 텐트 구축, 야외 요리, 모닥불 파티' },
      { id: 'orienteering', name: '숲 생태 오리엔티어링', icon: 'fa-compass', color: 'sage', description: '나침반과 지도를 활용한 숲속 미션 포인트 탐색 레이스' },
      { id: 'badge', name: '스카우트 기능 뱃지 이수', icon: 'fa-award', color: 'mustard', description: '매듭법, 응급처치, 야외 요리 등 18종 기능 과제 도전과 뱃지 수집' },
      { id: 'jamboree', name: '국제 잼버리 대회 및 문화 교류', icon: 'fa-earth-americas', color: 'sky', description: '전 세계 대원들과 우정을 쌓고 글로벌 리더십을 배우는 모험' }
    ],
    notices: [
      { id: 1, topic_id: 'camp', title: '🏕️ [필독] 9월 가을 정기 야영 대회 일정 및 개인 준비물 안내', author: 'WOOD지역대 훈련대장', content: '올가을 첫 정기 야영 대집회가 북한산 야영장에서 개최됩니다.', is_important: 1, views: 42, created_at: new Date().toISOString() },
      { id: 2, topic_id: 'camp', title: '⛺ 캠프 야영 요리 경연대회 메뉴 공모전', author: 'WOOD지역대 활동부', content: '반별 최고의 숲속 셰프 경연대회가 열립니다.', is_important: 0, views: 18, created_at: new Date(Date.now() - 86400000).toISOString() },
      { id: 3, topic_id: 'orienteering', title: '🧭 [공지] 숲 생태 오리엔티어링 미션 지도 및 나침반 사용법 특강', author: 'WOOD지역대 지도자', content: '나침반과 지도를 활용한 숲속 미션 교육입니다.', is_important: 1, views: 29, created_at: new Date().toISOString() },
      { id: 4, topic_id: 'badge', title: '🏅 2026 하반기 스카우트 기능 뱃지 검정 안내', author: 'WOOD지역대 심사관', content: '매듭법, 응급처치 뱃지 검정이 진행됩니다.', is_important: 1, views: 35, created_at: new Date().toISOString() },
      { id: 5, topic_id: 'jamboree', title: '🌏 2027 국제 스카우트 잼버리 파견 대원 사전 오리엔테이션', author: 'WOOD지역대 대장', content: '글로벌 문화 교류 및 잼버리 사전 모임입니다.', is_important: 0, views: 15, created_at: new Date(Date.now() - 172800000).toISOString() }
    ],
    gallery: [
      { id: 1, title: '밤하늘 모닥불 파티 & 통기타 싱어롱', category: '캠프', image_url: 'images/gallery_campfire.jpg', description: '모닥불 앞에서 마시멜로 굽기', activity_date: '2026-05-15', created_at: new Date().toISOString() },
      { id: 2, title: '숲속 계곡 통나무 다리 건너기 탐사', category: '숲속탐사', image_url: 'images/gallery_hiking.jpg', description: '자연 탐사 모험', activity_date: '2026-06-10', created_at: new Date().toISOString() },
      { id: 3, title: '반별 텐트 구축 및 야영 캠프', category: '캠프', image_url: 'images/scout_activities.jpg', description: '삼각 텐트 설치 실습', activity_date: '2026-07-20', created_at: new Date().toISOString() },
      { id: 4, title: '뱃지 수집과 자랑스러운 수여식', category: '기능뱃지', image_url: 'images/scout_badges.jpg', description: '기능 뱃지 수여 순간', activity_date: '2026-08-01', created_at: new Date().toISOString() }
    ],
    members: [
      { id: 1, name: '김모험', scout_type: '초등 (컵스카우트)', phone: '010-3344-5566', memo: '캠핑을 배우고 싶어요!', status: 'approved', created_at: new Date().toISOString() },
      { id: 2, name: '박스카우트', scout_type: '중등 (스카우트)', phone: '010-7788-9900', memo: '기능 뱃지를 많이 따고 싶습니다.', status: 'pending', created_at: new Date().toISOString() }
    ],
    admin_config: { admin_password: 'wood1234' }
  };

  let nextId = 100;

  return {
    exec: () => {},
    prepare: (sql) => {
      const trimmed = sql.trim();
      return {
        all: (...params) => {
          if (trimmed.includes('FROM topics')) return store.topics;
          if (trimmed.includes('FROM notices')) {
            if (trimmed.includes('WHERE topic_id = ?')) {
              return store.notices.filter(n => n.topic_id === params[0]);
            }
            return store.notices;
          }
          if (trimmed.includes('FROM gallery')) {
            if (trimmed.includes('WHERE category = ?')) {
              return store.gallery.filter(g => g.category === params[0]);
            }
            return store.gallery;
          }
          if (trimmed.includes('FROM members')) return store.members;
          return [];
        },
        get: (...params) => {
          if (trimmed.includes('COUNT(*) as count FROM topics')) return { count: store.topics.length };
          if (trimmed.includes('COUNT(*) as count FROM notices')) return { count: store.notices.length };
          if (trimmed.includes('COUNT(*) as count FROM gallery')) return { count: store.gallery.length };
          if (trimmed.includes('COUNT(*) as count FROM members')) {
            if (trimmed.includes("status = 'pending'")) {
              return { count: store.members.filter(m => m.status === 'pending').length };
            }
            return { count: store.members.length };
          }
          if (trimmed.includes('FROM notices WHERE id = ?')) {
            return store.notices.find(n => n.id == params[0]) || null;
          }
          if (trimmed.includes('FROM gallery WHERE id = ?')) {
            return store.gallery.find(g => g.id == params[0]) || null;
          }
          if (trimmed.includes('FROM members WHERE id = ?')) {
            return store.members.find(m => m.id == params[0]) || null;
          }
          if (trimmed.includes('FROM admin_config WHERE key = ?')) {
            return { value: store.admin_config[params[0]] || 'wood1234' };
          }
          return null;
        },
        run: (...params) => {
          if (trimmed.startsWith('INSERT INTO notices')) {
            const [topic_id, title, author, content, is_important] = params;
            const newNotice = {
              id: ++nextId,
              topic_id,
              title,
              author: author || 'WOOD지역대 대장',
              content,
              is_important: is_important ? 1 : 0,
              views: 0,
              created_at: new Date().toISOString()
            };
            store.notices.unshift(newNotice);
            return { lastInsertRowid: newNotice.id, changes: 1 };
          }
          if (trimmed.startsWith('INSERT INTO members')) {
            const [name, scout_type, phone, memo] = params;
            const newMember = {
              id: ++nextId,
              name,
              scout_type,
              phone,
              memo,
              status: 'pending',
              created_at: new Date().toISOString()
            };
            store.members.unshift(newMember);
            return { lastInsertRowid: newMember.id, changes: 1 };
          }
          if (trimmed.startsWith('INSERT INTO gallery')) {
            const [title, category, image_url, description, activity_date] = params;
            const newPhoto = {
              id: ++nextId,
              title,
              category: category || '일반',
              image_url,
              description,
              activity_date: activity_date || new Date().toISOString().slice(0, 10),
              created_at: new Date().toISOString()
            };
            store.gallery.unshift(newPhoto);
            return { lastInsertRowid: newPhoto.id, changes: 1 };
          }
          if (trimmed.startsWith('UPDATE members SET status = ? WHERE id = ?')) {
            const [status, id] = params;
            const m = store.members.find(x => x.id == id);
            if (m) m.status = status;
            return { changes: m ? 1 : 0 };
          }
          if (trimmed.startsWith('UPDATE admin_config SET value = ? WHERE key = ?')) {
            const [val, key] = params;
            store.admin_config[key] = val;
            return { changes: 1 };
          }
          if (trimmed.startsWith('DELETE FROM notices WHERE id = ?')) {
            const id = params[0];
            const idx = store.notices.findIndex(n => n.id == id);
            if (idx >= 0) store.notices.splice(idx, 1);
            return { changes: 1 };
          }
          if (trimmed.startsWith('DELETE FROM gallery WHERE id = ?')) {
            const id = params[0];
            const idx = store.gallery.findIndex(g => g.id == id);
            if (idx >= 0) store.gallery.splice(idx, 1);
            return { changes: 1 };
          }
          if (trimmed.startsWith('DELETE FROM members WHERE id = ?')) {
            const id = params[0];
            const idx = store.members.findIndex(m => m.id == id);
            if (idx >= 0) store.members.splice(idx, 1);
            return { changes: 1 };
          }
          return { changes: 1, lastInsertRowid: nextId };
        }
      };
    }
  };
}

module.exports = {
  db,
  initDatabase
};
