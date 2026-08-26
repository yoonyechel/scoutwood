const fs = require('fs');
const path = require('path');

// 1. ROCK-SOLID INDEX.HTML with INLINE ONCLICK HANDLERS
const indexHtml = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>스카우트 WOOD지역대 | 숲속 스카우트 인터랙티브 메인 웹</title>
  <meta name="description" content="숲속 스카우트 스타일의 풀사이즈 일러스트 노드 기반 인터랙티브 홍보 웹사이트. 텐트, 모닥불, 배낭, 표지판, 마스코트를 클릭하고 WOOD지역대 모험에 동참하세요!">
  
  <!-- Google Fonts: Jua & Gowun Dodum -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Gowun+Dodum&family=Jua&display=swap" rel="stylesheet">
  
  <!-- FontAwesome Icons -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  
  <link rel="stylesheet" href="styles.css">
</head>
<body>

  <!-- Sound & Ambient Header Bar -->
  <header class="top-interactive-bar">
    <div class="brand-badge">
      <i class="fa-solid fa-tree"></i>
      <span>한국스카우트 <b>WOOD지역대</b></span>
    </div>

    <!-- Quick Node Guide Pills (Direct Inline Onclick) -->
    <div class="node-quick-pills">
      <button class="pill-node-btn" onclick="openModal('modal-about')"><i class="fa-solid fa-campground"></i> 1. 지역대 소개</button>
      <button class="pill-node-btn" onclick="openModal('modal-activities')">
        <i class="fa-solid fa-fire"></i> 2. 주요 활동 
        <span class="global-new-dot" id="header-activity-new-dot" style="display:none;" title="신규 공지사항 있음"></span>
      </button>
      <button class="pill-node-btn" onclick="openModal('modal-join')"><i class="fa-solid fa-vest"></i> 3. 대원 모집</button>
      <button class="pill-node-btn" onclick="openModal('modal-gallery')"><i class="fa-solid fa-images"></i> 4. 활동 갤러리</button>
      <button class="pill-node-btn" onclick="openModal('modal-faq')"><i class="fa-solid fa-comments"></i> 5. FAQ & 문의</button>
    </div>

    <div class="sound-controls">
      <button id="admin-portal-btn" class="sound-btn admin-badge-btn" onclick="openAdminModal()" title="관리자 대시보드 열기">
        <i class="fa-solid fa-user-shield"></i>
        <span class="btn-text">관리자 모드</span>
      </button>
      <button id="audio-toggle-btn" class="sound-btn" onclick="toggleBgm()" title="숲속 새소리 & 바람 소리 BGM 토글">
        <i class="fa-solid fa-volume-xmark"></i>
        <span class="btn-text" id="bgm-btn-text">숲속 sound</span>
      </button>
      <button id="sfx-toggle-btn" class="sound-btn active" onclick="toggleSfx()" title="효과음 토글">
        <i class="fa-solid fa-wand-magic-sparkles"></i>
        <span class="btn-text" id="sfx-btn-text">효과음 On</span>
      </button>
    </div>
  </header>

  <!-- Full-Frame Main Visual Interactive Canvas Container -->
  <main class="fullframe-canvas-container" id="canvas-container">
    <!-- Main Background Illustration Layer -->
    <div class="canvas-bg-layer" id="bg-layer">
      <img src="images/scout_full_bg.jpg" alt="WOOD지역대 숲속 스카우트 메인 일러스트" class="full-bg-img" id="main-full-img">
      <div class="canvas-ambient-lighting"></div>
    </div>

    <!-- Animated Particle Overlay -->
    <div class="particles-overlay" id="particles-overlay"></div>

    <!-- Interactive Visual Nodes Overlay Layer (Direct Inline Onclick) -->
    <div class="visual-nodes-layer">

      <!-- Node 1: 중앙 메인 삼각텐트 -->
      <div class="interactive-node node-tent" id="node-tent" style="top: 50%; left: 43%;" onclick="openModal('modal-about')" role="button" aria-label="삼각 텐트 - WOOD지역대 소개">
        <div class="node-hotspot-glow green-glow"></div>
        <div class="node-illustration-box tent-box">
          <i class="fa-solid fa-campground node-main-icon"></i>
          <div class="node-tooltip">
            <i class="fa-solid fa-campground"></i>
            <span><b>삼각 텐트</b> | WOOD지역대 소개</span>
          </div>
        </div>
      </div>

      <!-- Node 2: 통나무 모닥불 -->
      <div class="interactive-node node-campfire" id="node-campfire" style="top: 76%; left: 49%;" onclick="openModal('modal-activities')" role="button" aria-label="통나무 모닥불 - 주요 활동 안내">
        <div class="node-hotspot-glow orange-glow"></div>
        <div class="node-illustration-box campfire-box">
          <i class="fa-solid fa-fire-flame-curved node-main-icon"></i>
          <span class="node-floating-new-tag" id="node-campfire-new-tag" style="display:none;">🔥 NEW</span>
          <div class="node-tooltip orange-tooltip">
            <i class="fa-solid fa-fire"></i>
            <span><b>통나무 모닥불</b> | 주요 활동 & 게시판</span>
          </div>
        </div>
      </div>

      <!-- Node 3: 스카우트 배낭 -->
      <div class="interactive-node node-backpack" id="node-backpack" style="top: 50%; left: 24%;" onclick="openModal('modal-join')" role="button" aria-label="스카우트 배낭 - 대원 모집 & 신청">
        <div class="node-hotspot-glow brown-glow"></div>
        <div class="node-illustration-box backpack-box">
          <i class="fa-solid fa-bag-shopping node-main-icon"></i>
          <div class="node-tooltip">
            <i class="fa-solid fa-paper-plane"></i>
            <span><b>스카우트 배낭</b> | 모집 안내 & 가입 신청</span>
          </div>
        </div>
      </div>

      <!-- Node 4: 숲속 갤러리 표지판 -->
      <div class="interactive-node node-signpost" id="node-signpost" style="top: 67%; left: 77%;" onclick="openModal('modal-gallery')" role="button" aria-label="숲속 표지판 - 활동 갤러리">
        <div class="node-hotspot-glow green-glow"></div>
        <div class="node-illustration-box signpost-box">
          <i class="fa-solid fa-signs-post node-main-icon"></i>
          <div class="node-tooltip">
            <i class="fa-solid fa-images"></i>
            <span><b>숲속 표지판</b> | 활동 갤러리</span>
          </div>
        </div>
      </div>

      <!-- Node 5: 나뭇잎 다람쥐 마스코트 -->
      <div class="interactive-node node-mascot" id="node-mascot" style="top: 31%; left: 68%;" onclick="openModal('modal-faq')" role="button" aria-label="다람쥐 마스코트 - FAQ & 카톡 문의">
        <div class="node-hotspot-glow yellow-glow"></div>
        <div class="node-illustration-box mascot-box">
          <i class="fa-solid fa-comments node-main-icon"></i>
          <div class="node-tooltip yellow-tooltip">
            <i class="fa-solid fa-comments"></i>
            <span><b>다람쥐 마스코트</b> | FAQ & 카톡 문의</span>
          </div>
        </div>
      </div>

    </div>

    <!-- Floating Quokka Guide Character -->
    <div class="floating-quokka-guide" id="quokka-guide">
      <div class="quokka-avatar">
        <img src="images/scout_salute.jpg" alt="쿼카 가이드">
      </div>
      <div class="quokka-speech-box">
        <p id="quokka-dialogue">"숲속 곳곳의 텐트, 모닥불, 배낭, 표지판, 다람쥐를 클릭해봐! 🌲✨"</p>
      </div>
    </div>
  </main>

  <!-- ==================== PARCHMENT MODALS ==================== -->

  <!-- Modal 1: 지역대 소개 -->
  <div class="parchment-modal-backdrop hidden" id="modal-about" onclick="handleBackdropClick(event, 'modal-about')">
    <div class="parchment-modal-card wooden-border">
      <button class="parchment-close-btn" onclick="closeModal('modal-about')"><i class="fa-solid fa-xmark"></i></button>
      
      <div class="modal-parchment-content">
        <div class="modal-badge-header">
          <i class="fa-solid fa-campground"></i>
          <span>ABOUT SCOUT WOOD</span>
        </div>
        <h2>스카우트 WOOD지역대 소개 🏕️</h2>
        <p class="subtitle-tag">"자연 속에서 함께 배우고 성장하는 숲속 모험가 공동체"</p>

        <div class="parchment-body-scroll">
          <div class="wooden-info-box">
            <h4>🌲 설립 철학 및 역사를 만나보세요</h4>
            <p>
              한국스카우트 WOOD지역대는 청소년들이 자연을 사랑하고 협동심, 자립심, 그리고 봉사 정신을 기를 수 있도록 
              설립된 전통 있는 스카우트 지역대입니다. 숲속 스카우트 친구들처럼 귀엽고 따뜻한 분위기 속에서 대원들이 안전하게 활동합니다.
            </p>
          </div>

          <div class="three-pillars-grid">
            <div class="pillar-card">
              <i class="fa-solid fa-leaf"></i>
              <h5>자연 존중</h5>
              <p>숲 생태계 탐사와 환경 정화 활동으로 자연의 가치를 배웁니다.</p>
            </div>
            <div class="pillar-card">
              <i class="fa-solid fa-people-line"></i>
              <h5>반(Patrol) 활동</h5>
              <p>소그룹 협동을 통해 또래 간의 우정과 리더십을 키웁니다.</p>
            </div>
            <div class="pillar-card">
              <i class="fa-solid fa-shield-heart"></i>
              <h5>안전 우선</h5>
              <p>전문 지도자의 지도 아래 철저한 응급 구조 및 안전 수칙 준수</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal 2: 주요 활동 안내 -->
  <div class="parchment-modal-backdrop hidden" id="modal-activities" onclick="handleBackdropClick(event, 'modal-activities')">
    <div class="parchment-modal-card wooden-border activities-card-wide">
      <button class="parchment-close-btn" onclick="closeModal('modal-activities')"><i class="fa-solid fa-xmark"></i></button>
      
      <div class="modal-parchment-content">
        <div class="modal-badge-header orange-badge">
          <i class="fa-solid fa-fire"></i>
          <span>SCOUT ACTIVITIES & BOARDS</span>
        </div>
        <h2>WOOD지역대 주요 활동 안내 🔥</h2>
        <p class="subtitle-tag">각 주제 카드나 <b>[📜 게시판 입장]</b> 버튼을 누르면 실시간 공지사항 게시판으로 바로 이동합니다!</p>

        <div class="parchment-body-scroll">
          <div style="margin-bottom: 12px;">
            <button class="cute-bubble-btn btn-topic-camp" onclick="openTopicBoard('all', '전체 공지사항')" style="padding: 9px 18px; font-size: 0.92rem; background: linear-gradient(135deg, #6B4F3A, #4A3222); color: #FFF; width: 100%; justify-content: center; box-shadow: 0 4px 12px rgba(107, 79, 58, 0.2);" title="전체 공지사항 모아보기">
              <i class="fa-solid fa-layer-group"></i> 🌟 전체 공지사항 모아보기 바로가기
            </button>
          </div>

          <div class="activity-accordion-list">
            
            <!-- Activity 1: 캠프 -->
            <div class="activity-row row-camp clickable-activity-row" onclick="openTopicBoard('camp', '매달 야영 대집회 캠프')">
              <div class="row-icon bg-orange"><i class="fa-solid fa-campground"></i></div>
              <div class="row-text">
                <div class="row-header-wrap">
                  <div class="row-title-with-num">
                    <span class="row-num-tag">01</span>
                    <h4>매달 야영 대집회 캠프</h4>
                    <button class="open-topic-board-btn cute-bubble-btn btn-topic-camp" onclick="event.stopPropagation(); openTopicBoard('camp', '매달 야영 대집회 캠프');" title="야영 대집회 게시판 열기">
                      <i class="fa-solid fa-scroll"></i>
                      <span>게시판 입장</span>
                      <span class="topic-new-badge" id="badge-topic-camp" style="display:none;">🔥 NEW</span>
                    </button>
                  </div>
                </div>
                <p>기본 1박 2일 (지역대 활동에 따라서 변동가능함), 숲속 텐트 구축, 야외 야영 요리, 별자리 탐사 및 밤하늘 모닥불 파티</p>
              </div>
            </div>

            <!-- Activity 2: 오리엔티어링 -->
            <div class="activity-row row-orienteering clickable-activity-row" onclick="openTopicBoard('orienteering', '숲 생태 오리엔티어링')">
              <div class="row-icon bg-sage"><i class="fa-solid fa-compass"></i></div>
              <div class="row-text">
                <div class="row-header-wrap">
                  <div class="row-title-with-num">
                    <span class="row-num-tag">02</span>
                    <h4>숲 생태 오리엔티어링</h4>
                    <button class="open-topic-board-btn cute-bubble-btn btn-topic-orienteering" onclick="event.stopPropagation(); openTopicBoard('orienteering', '숲 생태 오리엔티어링');" title="오리엔티어링 게시판 열기">
                      <i class="fa-solid fa-compass"></i>
                      <span>게시판 입장</span>
                      <span class="topic-new-badge" id="badge-topic-orienteering" style="display:none;">🔥 NEW</span>
                    </button>
                  </div>
                </div>
                <p>나침반과 지도를 활용하여 숲속 미션 포인트를 탐색하는 흥미진진한 모험 레이스</p>
              </div>
            </div>

            <!-- Activity 3: 기능 뱃지 -->
            <div class="activity-row row-badge clickable-activity-row" onclick="openTopicBoard('badge', '스카우트 기능 뱃지 이수')">
              <div class="row-icon bg-mustard"><i class="fa-solid fa-award"></i></div>
              <div class="row-text">
                <div class="row-header-wrap">
                  <div class="row-title-with-num">
                    <span class="row-num-tag">03</span>
                    <h4>스카우트 기능 뱃지 이수</h4>
                    <button class="open-topic-board-btn cute-bubble-btn btn-topic-badge" onclick="event.stopPropagation(); openTopicBoard('badge', '스카우트 기능 뱃지 이수');" title="기능 뱃지 게시판 열기">
                      <i class="fa-solid fa-award"></i>
                      <span>게시판 입장</span>
                      <span class="topic-new-badge" id="badge-topic-badge" style="display:none;">🔥 NEW</span>
                    </button>
                  </div>
                </div>
                <p>매듭법, 응급처치, 신호법, 야외 요리 등 18종 기능 과제 도전과 영예로운 뱃지 수집</p>
              </div>
            </div>

            <!-- Activity 4: 잼버리 -->
            <div class="activity-row row-jamboree clickable-activity-row" onclick="openTopicBoard('jamboree', '국제 잼버리 대회 및 문화 교류')">
              <div class="row-icon bg-sky"><i class="fa-solid fa-earth-americas"></i></div>
              <div class="row-text">
                <div class="row-header-wrap">
                  <div class="row-title-with-num">
                    <span class="row-num-tag">04</span>
                    <h4>국제 잼버리 대회 및 문화 교류</h4>
                    <button class="open-topic-board-btn cute-bubble-btn btn-topic-jamboree" onclick="event.stopPropagation(); openTopicBoard('jamboree', '국제 잼버리 대회 및 문화 교류');" title="국제 잼버리 게시판 열기">
                      <i class="fa-solid fa-earth-americas"></i>
                      <span>게시판 입장</span>
                      <span class="topic-new-badge" id="badge-topic-jamboree" style="display:none;">🔥 NEW</span>
                    </button>
                  </div>
                </div>
                <p>전 세계 스카우트 대원들과 우정을 쌓고 글로벌 리더십을 배울 수 있는 특별한 기회</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal: 주제별 공지사항 게시판 모달 (Activity Notice Board Modal) -->
  <div class="parchment-modal-backdrop hidden" id="modal-board" onclick="handleBackdropClick(event, 'modal-board')">
    <div class="parchment-modal-card wooden-border board-card-wide">
      <button class="parchment-close-btn" onclick="closeModal('modal-board')"><i class="fa-solid fa-xmark"></i></button>
      
      <div class="modal-parchment-content">
        
        <!-- Board Top Action Bar -->
        <div class="board-top-action-bar">
          <div class="board-title-block">
            <div class="modal-badge-header orange-badge" id="board-header-badge" style="margin-bottom:6px;">
              <i class="fa-solid fa-bullhorn" id="board-header-icon"></i>
              <span id="board-header-topic-name">매달 야영 대집회 캠프</span>
            </div>
            <h2 id="board-main-title">매달 야영 대집회 캠프 공지사항 📋</h2>
          </div>
          <div class="board-ctrl-btns">
            <button id="board-open-write-btn" class="wooden-mini-btn btn-highlight" onclick="openBoardWriteView()" title="새 공지사항 글쓰기">
              <i class="fa-solid fa-pen-nib"></i> 새 공지 작성
            </button>
            <button class="wooden-mini-btn" onclick="closeModal('modal-board'); openModal('modal-activities');" title="활동 목록으로 돌아가기">
              <i class="fa-solid fa-arrow-left"></i> 활동 목록
            </button>
            <button class="wooden-mini-btn" onclick="refreshCurrentBoard()" title="게시물 새로고침">
              <i class="fa-solid fa-rotate-right"></i> 새로고침
            </button>
          </div>
        </div>

        <!-- 5 Topic Navigation Tabs (Instant One-Click Board Switching) -->
        <div class="board-topic-tabs-bar" id="board-topic-tabs-bar">
          <button class="board-topic-tab-btn tab-btn-all active" id="tab-btn-all" onclick="switchBoardTopic('all', '전체 공지사항')">
            🌟 전체 공지
          </button>
          <button class="board-topic-tab-btn tab-btn-camp" id="tab-btn-camp" onclick="switchBoardTopic('camp', '매달 야영 대집회 캠프')">
            🏕️ 야영 캠프
            <span class="tab-flame-dot" id="tab-dot-camp"></span>
          </button>
          <button class="board-topic-tab-btn tab-btn-orienteering" id="tab-btn-orienteering" onclick="switchBoardTopic('orienteering', '숲 생태 오리엔티어링')">
            🧭 오리엔티어링
            <span class="tab-flame-dot" id="tab-dot-orienteering"></span>
          </button>
          <button class="board-topic-tab-btn tab-btn-badge" id="tab-btn-badge" onclick="switchBoardTopic('badge', '스카우트 기능 뱃지 이수')">
            🏅 기능 뱃지
            <span class="tab-flame-dot" id="tab-dot-badge"></span>
          </button>
          <button class="board-topic-tab-btn tab-btn-jamboree" id="tab-btn-jamboree" onclick="switchBoardTopic('jamboree', '국제 잼버리 대회 및 문화 교류')">
            🌏 잼버리
            <span class="tab-flame-dot" id="tab-dot-jamboree"></span>
          </button>
        </div>

        <!-- Board View 1: Notice List View -->
        <div class="parchment-body-scroll" id="board-list-view">
          <div class="board-notices-container" id="board-notices-container">
            <div class="loading-state-box">
              <i class="fa-solid fa-spinner fa-spin"></i>
              <p>게시글 목록을 불러오는 중입니다...</p>
            </div>
          </div>
          <!-- Pagination Bar (3 notices per page with number buttons) -->
          <div class="board-pagination-bar" id="board-pagination-bar"></div>
        </div>

        <!-- Board View 2: Notice Detail View -->
        <div class="parchment-body-scroll hidden" id="board-detail-view">
          <div class="notice-detail-box">
            <button class="notice-detail-back-btn" onclick="showBoardListView()">
              <i class="fa-solid fa-arrow-left"></i> 공지사항 목록으로 돌아가기
            </button>
            
            <div class="notice-detail-header-card">
              <div class="notice-detail-tags">
                <span class="notice-badge-pill important-pill" id="detail-important-pill">📢 중요 공지</span>
                <span class="notice-badge-pill topic-pill" id="detail-topic-pill">🏕️ 매달 야영 대집회 캠프</span>
              </div>
              <h3 id="detail-title" class="notice-detail-heading">공지 제목이 들어갑니다</h3>
              <div class="notice-detail-meta">
                <span><i class="fa-solid fa-user-pen"></i> 작성자: <b id="detail-author">WOOD지역대</b></span>
                <span><i class="fa-regular fa-calendar-check"></i> 작성일: <span id="detail-date">2026-08-26</span></span>
                <span><i class="fa-regular fa-eye"></i> 조회수: <span id="detail-views">0</span></span>
              </div>
            </div>

            <div class="notice-detail-content-body" id="detail-content"></div>
          </div>
        </div>

        <!-- Board View 3: In-Modal Notice Write View -->
        <div class="parchment-body-scroll hidden" id="board-write-view">
          <div class="notice-write-box">
            <button class="notice-detail-back-btn" onclick="showBoardListView()">
              <i class="fa-solid fa-arrow-left"></i> 글작성 취소하고 목록으로
            </button>
            
            <div class="admin-card-section mt-2">
              <h4>✍️ 새 공지사항 작성하기</h4>
              <form id="board-modal-notice-form" class="admin-form-grid" onsubmit="handleBoardModalNoticeSubmit(event)">
                <div class="form-row">
                  <div class="form-group">
                    <label for="b-topic">활동 주제 *</label>
                    <select id="b-topic" required>
                      <option value="camp">🏕️ 매달 야영 대집회 캠프</option>
                      <option value="orienteering">🧭 숲 생태 오리엔티어링</option>
                      <option value="badge">🏅 스카우트 기능 뱃지 이수</option>
                      <option value="jamboree">🌏 국제 잼버리 대회 및 문화 교류</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label for="b-author">작성자 명의</label>
                    <input type="text" id="b-author" value="WOOD지역대 훈련대장" required>
                  </div>
                </div>

                <div class="form-group">
                  <label for="b-title">공지 제목 *</label>
                  <input type="text" id="b-title" placeholder="예: [안내] 9월 가을 정기 야영 대회 일정 공지" required>
                </div>

                <div class="form-group">
                  <label class="checkbox-label">
                    <input type="checkbox" id="b-important">
                    <span><i class="fa-solid fa-star text-orange"></i> 중요 공지로 상단 강조</span>
                  </label>
                </div>

                <div class="form-group">
                  <label for="b-content">공지 본문 내용 *</label>
                  <textarea id="b-content" rows="6" placeholder="상세 공지 내용, 준비물, 일정 등을 작성해주세요." required></textarea>
                </div>

                <button type="submit" class="wooden-submit-btn">
                  <i class="fa-solid fa-paper-plane"></i> 공지사항 등록하기
                </button>
              </form>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>

  <!-- Modal 3: 모집 안내 & 가입 신청 -->
  <div class="parchment-modal-backdrop hidden" id="modal-join" onclick="handleBackdropClick(event, 'modal-join')">
    <div class="parchment-modal-card wooden-border">
      <button class="parchment-close-btn" onclick="closeModal('modal-join')"><i class="fa-solid fa-xmark"></i></button>
      
      <div class="modal-parchment-content">
        <div class="modal-badge-header brown-badge">
          <i class="fa-solid fa-user-plus"></i>
          <span>JOIN SCOUT WOOD</span>
        </div>
        <h2>신입 대원 & 지도자 모집 안내 🎒</h2>
        <p class="subtitle-tag">모험의 가방을 둘러메고 스카우트에 도전하세요!</p>

        <div class="parchment-body-scroll">
          <div class="join-info-bar">
            <div class="info-tag"><b>모집 대상:</b> 초·중·고·대학생 대원 & 성인 지도자</div>
            <div class="info-tag"><b>정기 집회:</b> 월 1회</div>
          </div>

          <form id="parchment-join-form" class="parchment-form" onsubmit="handleJoinSubmit(event)">
            <div class="form-group">
              <label for="p-name">신청자 성함 *</label>
              <input type="text" id="p-name" placeholder="예: 이쿼카" required>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="p-type">지원 구분 *</label>
                <select id="p-type" required>
                  <option value="">선택해주세요</option>
                  <option value="초등 (컵스카우트)">초등 (컵스카우트)</option>
                  <option value="중등 (스카우트)">중등 (스카우트)</option>
                  <option value="고등 (벤처스카우트)">고등 (벤처스카우트)</option>
                  <option value="대학생 (로버스카우트)">대학생 (로버스카우트)</option>
                  <option value="성인지도자">성인지도자</option>
                </select>
              </div>
              <div class="form-group">
                <label for="p-phone">연락처 *</label>
                <input type="tel" id="p-phone" placeholder="010-1234-5678" required>
              </div>
            </div>

            <div class="form-group">
              <label for="p-memo">희망 사항 및 소감</label>
              <textarea id="p-memo" rows="2" placeholder="WOOD지역대 활동에 기대하는 점을 자유롭게 적어주세요!"></textarea>
            </div>

            <button type="submit" class="wooden-submit-btn" id="join-submit-btn">
              <i class="fa-solid fa-paper-plane"></i> 가입 신청서 제출하기
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal 4: 활동 갤러리 -->
  <div class="parchment-modal-backdrop hidden" id="modal-gallery" onclick="handleBackdropClick(event, 'modal-gallery')">
    <div class="parchment-modal-card wooden-border gallery-card-wide">
      <button class="parchment-close-btn" onclick="closeModal('modal-gallery')"><i class="fa-solid fa-xmark"></i></button>
      
      <div class="modal-parchment-content">
        <div class="modal-badge-header green-badge">
          <i class="fa-solid fa-images"></i>
          <span>SCOUT GALLERY</span>
        </div>
        
        <div class="board-top-action-bar">
          <div>
            <h2>WOOD지역대 활동 갤러리 📸</h2>
            <p class="subtitle-tag">생생하고 즐거운 스카우트 모험의 순간들</p>
          </div>
          <div class="board-ctrl-btns">
            <button class="wooden-mini-btn btn-highlight" onclick="showGalleryUploadView()" title="새 사진 올리기">
              <i class="fa-solid fa-cloud-arrow-up"></i> 사진 올리기
            </button>
          </div>
        </div>

        <!-- Gallery View 1: List & Filters -->
        <div id="gallery-main-view">
          <div class="gallery-filter-bar">
            <button class="gallery-filter-btn active" onclick="filterGallery('전체', this)"><i class="fa-solid fa-border-all"></i> 전체보기</button>
            <button class="gallery-filter-btn" onclick="filterGallery('캠프', this)"><i class="fa-solid fa-campground"></i> 캠프</button>
            <button class="gallery-filter-btn" onclick="filterGallery('숲속탐사', this)"><i class="fa-solid fa-compass"></i> 숲속탐사</button>
            <button class="gallery-filter-btn" onclick="filterGallery('기능뱃지', this)"><i class="fa-solid fa-award"></i> 기능뱃지</button>
            <button class="gallery-filter-btn" onclick="filterGallery('행사', this)"><i class="fa-solid fa-earth-americas"></i> 행사/교류</button>
          </div>

          <div class="parchment-body-scroll">
            <div class="gallery-grid" id="gallery-dynamic-grid"></div>
          </div>
        </div>

        <!-- Gallery View 2: Upload View -->
        <div class="parchment-body-scroll hidden" id="gallery-upload-view">
          <button class="notice-detail-back-btn" onclick="showGalleryMainView()">
            <i class="fa-solid fa-arrow-left"></i> 사진 목록으로 돌아가기
          </button>

          <div class="admin-card-section mt-2">
            <h4>📸 새 활동 사진 등록하기</h4>
            <form id="modal-gallery-upload-form" class="admin-form-grid" enctype="multipart/form-data" onsubmit="handleGalleryUploadSubmit(event)">
              <div class="form-group">
                <label for="mg-title">사진 제목 *</label>
                <input type="text" id="mg-title" placeholder="예: 가을 숲속 모닥불 축제" required>
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <label for="mg-category">활동 카테고리 *</label>
                  <select id="mg-category" required>
                    <option value="캠프">🏕️ 캠프</option>
                    <option value="숲속탐사">🌲 숲속탐사</option>
                    <option value="기능뱃지">🏅 기능뱃지</option>
                    <option value="행사">🌏 행사/교류</option>
                    <option value="일반">기타/일반</option>
                  </select>
                </div>
                <div class="form-group">
                  <label for="mg-date">활동 일자</label>
                  <input type="date" id="mg-date">
                </div>
              </div>

              <div class="form-group">
                <label for="mg-file">사진 파일 선택 (JPG, PNG, WebP) *</label>
                <input type="file" id="mg-file" accept="image/*" required onchange="previewGalleryImage(this, 'mg-file-preview-box', 'mg-file-preview-img')">
                <div class="file-preview-box hidden" id="mg-file-preview-box">
                  <img id="mg-file-preview-img" src="" alt="미리보기">
                </div>
              </div>

              <div class="form-group">
                <label for="mg-desc">사진 설명 및 캡션</label>
                <textarea id="mg-desc" rows="2" placeholder="사진에 대한 설명을 적어주세요."></textarea>
              </div>

              <button type="submit" class="wooden-submit-btn">
                <i class="fa-solid fa-cloud-arrow-up"></i> 갤러리에 사진 등록하기
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  </div>

  <!-- Photo Lightbox Zoom Modal -->
  <div class="parchment-modal-backdrop hidden" id="modal-lightbox" onclick="handleBackdropClick(event, 'modal-lightbox')">
    <div class="lightbox-card wooden-border">
      <button class="parchment-close-btn" onclick="closeModal('modal-lightbox')"><i class="fa-solid fa-xmark"></i></button>
      <div class="lightbox-img-wrap">
        <img id="lightbox-img" src="" alt="확대 사진">
      </div>
      <div class="lightbox-info-wrap">
        <span class="lightbox-category-tag" id="lightbox-category">카테고리</span>
        <h3 id="lightbox-title">사진 제목</h3>
        <p id="lightbox-desc">사진 설명</p>
        <span class="lightbox-date" id="lightbox-date"><i class="fa-regular fa-calendar"></i> 날짜</span>
      </div>
    </div>
  </div>

  <!-- Modal 5: FAQ & 카톡 문의 -->
  <div class="parchment-modal-backdrop hidden" id="modal-faq" onclick="handleBackdropClick(event, 'modal-faq')">
    <div class="parchment-modal-card wooden-border">
      <button class="parchment-close-btn" onclick="closeModal('modal-faq')"><i class="fa-solid fa-xmark"></i></button>
      
      <div class="modal-parchment-content">
        <div class="modal-badge-header yellow-badge">
          <i class="fa-solid fa-comments"></i>
          <span>FAQ & CONTACT</span>
        </div>
        <h2>자주 묻는 질문 & 문의처 💬</h2>
        <p class="subtitle-tag">궁금한 점은 언제든 카카오톡 채팅으로 물어보세요!</p>

        <div class="parchment-body-scroll">
          <div class="faq-list">
            <div class="faq-card">
              <h5>Q. 스카우트 복장 및 용품은 어떻게 준비하나요?</h5>
              <p>가입 승인 후 단원 공식 제복 및 네커치프(스카프) 구매 안내서가 전달됩니다. 야영용 텐트는 지역대에서 지원됩니다.</p>
            </div>

            <div class="faq-card">
              <h5>Q. 정기 집회 장소는 어디인가요?</h5>
              <p>금산 막현리 산촌생태마을 또는 상주보 오토캠핑장<br><span style="color:var(--text-muted); font-size:0.88rem;">(장소 변경시 별도공지)</span></p>
            </div>
          </div>

          <div class="kakao-chat-box text-center">
            <a href="https://open.kakao.com/o/gnY2QPlf" target="_blank" class="btn-kakao" rel="noopener noreferrer">
              <i class="fa-solid fa-comment"></i> 카카오톡 오픈채팅 문의하기
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Admin Modal: 관리자 대시보드 -->
  <div class="parchment-modal-backdrop hidden" id="modal-admin" onclick="handleBackdropClick(event, 'modal-admin')">
    <div class="parchment-modal-card wooden-border admin-card-wide">
      <button class="parchment-close-btn" onclick="closeModal('modal-admin')"><i class="fa-solid fa-xmark"></i></button>
      
      <div class="modal-parchment-content">
        <div id="admin-dashboard-view">
          
          <div class="admin-top-header">
            <div class="admin-title-area">
              <div class="modal-badge-header brown-badge">
                <i class="fa-solid fa-user-gear"></i>
                <span>WOOD SCOUT ADMIN PORTAL</span>
              </div>
              <h2>WOOD지역대 관리자 대시보드 🛠️</h2>
            </div>
            <div class="admin-header-actions">
              <button class="wooden-mini-btn" onclick="loadAdminDashboard(); showToast('🔄 관리자 대시보드를 새로고침했습니다.');"><i class="fa-solid fa-rotate-right"></i> 전체 새로고침</button>
            </div>
          </div>

          <!-- Summary Stat Badges -->
          <div class="admin-stat-chips" id="admin-stat-chips">
            <div class="stat-chip">
              <i class="fa-solid fa-users"></i>
              <span>신규신청 <b id="stat-members-total">0</b>명 (<span id="stat-members-pending" class="text-orange">대기 0</span>)</span>
            </div>
            <div class="stat-chip">
              <i class="fa-solid fa-images"></i>
              <span>갤러리 <b id="stat-gallery-total">0</b>장</span>
            </div>
            <div class="stat-chip">
              <i class="fa-solid fa-bullhorn"></i>
              <span>공지사항 <b id="stat-notices-total">0</b>건</span>
            </div>
          </div>

          <!-- Admin Tabs -->
          <div class="admin-nav-tabs">
            <button class="admin-tab-btn active" id="btn-tab-members" onclick="switchAdminTab('tab-members', this)">
              <i class="fa-solid fa-user-check"></i> 신규 가입자 관리
            </button>
            <button class="admin-tab-btn" id="btn-tab-gallery" onclick="switchAdminTab('tab-gallery', this)">
              <i class="fa-solid fa-cloud-arrow-up"></i> 활동 갤러리 관리
            </button>
            <button class="admin-tab-btn" id="btn-tab-notices" onclick="switchAdminTab('tab-notices', this)">
              <i class="fa-solid fa-bullhorn"></i> 활동 게시판 공지 관리
            </button>
            <button class="admin-tab-btn" id="btn-tab-settings" onclick="switchAdminTab('tab-settings', this)">
              <i class="fa-solid fa-gear"></i> 관리자 설정
            </button>
          </div>

          <!-- Tab Contents -->
          <div class="parchment-body-scroll admin-tab-scroll">
            
            <!-- TAB 1: 신규 가입자 관리 -->
            <div class="admin-tab-pane active" id="tab-members">
              <div class="tab-header-flex">
                <h3>📋 신규 가입 신청자 명단</h3>
                <div class="filter-group">
                  <select id="admin-member-filter" class="wooden-select" onchange="loadAdminMembers()">
                    <option value="all">전체 상태 보기</option>
                    <option value="pending" selected>⏳ 승인 대기중만</option>
                    <option value="approved">✅ 승인 완료</option>
                    <option value="rejected">❌ 반려됨</option>
                  </select>
                  <button class="wooden-mini-btn" onclick="loadAdminMembers(); showToast('🔄 신청자 목록을 새로고침했습니다.');"><i class="fa-solid fa-rotate-right"></i></button>
                </div>
              </div>

              <div class="admin-members-list" id="admin-members-list"></div>
            </div>

            <!-- TAB 2: 활동 갤러리 관리 -->
            <div class="admin-tab-pane" id="tab-gallery">
              
              <div class="admin-card-section">
                <h4>📸 새 활동 사진 업로드</h4>
                <form id="admin-gallery-form" class="admin-form-grid" enctype="multipart/form-data" onsubmit="handleAdminGalleryUpload(event)">
                  <div class="form-group">
                    <label for="g-title">사진 제목 *</label>
                    <input type="text" id="g-title" placeholder="예: 가을 숲속 모닥불 축제" required>
                  </div>
                  
                  <div class="form-row">
                    <div class="form-group">
                      <label for="g-category">활동 카테고리 *</label>
                      <select id="g-category" required>
                        <option value="캠프">🏕️ 캠프</option>
                        <option value="숲속탐사">🌲 숲속탐사</option>
                        <option value="기능뱃지">🏅 기능뱃지</option>
                        <option value="행사">🌏 행사/교류</option>
                        <option value="일반">기타/일반</option>
                      </select>
                    </div>
                    <div class="form-group">
                      <label for="g-date">활동 일자</label>
                      <input type="date" id="g-date">
                    </div>
                  </div>

                  <div class="form-group">
                    <label for="g-file">사진 파일 선택 (JPG, PNG, WebP) *</label>
                    <input type="file" id="g-file" accept="image/*" required onchange="previewGalleryImage(this, 'file-preview-box', 'file-preview-img')">
                    <div class="file-preview-box hidden" id="file-preview-box">
                      <img id="file-preview-img" src="" alt="미리보기">
                    </div>
                  </div>

                  <div class="form-group">
                    <label for="g-desc">사진 설명 및 캡션</label>
                    <textarea id="g-desc" rows="2" placeholder="사진에 대한 설명을 적어주세요."></textarea>
                  </div>

                  <button type="submit" class="wooden-submit-btn" id="gallery-upload-btn">
                    <i class="fa-solid fa-cloud-arrow-up"></i> 갤러리에 사진 등록하기
                  </button>
                </form>
              </div>

              <div class="admin-card-section mt-4">
                <div class="tab-header-flex">
                  <h4>🖼️ 현재 등록된 갤러리 사진 목록</h4>
                  <button class="wooden-mini-btn" onclick="loadAdminGallery(); showToast('🔄 갤러리 목록을 새로고침했습니다.');"><i class="fa-solid fa-rotate-right"></i> 새로고침</button>
                </div>
                <div class="admin-gallery-manage-grid" id="admin-gallery-manage-grid"></div>
              </div>

            </div>

            <!-- TAB 3: 활동 게시판 공지 관리 -->
            <div class="admin-tab-pane" id="tab-notices">
              
              <div class="admin-card-section">
                <h4 id="notice-form-title">📢 새 공지사항 작성</h4>
                <form id="admin-notice-form" class="admin-form-grid" onsubmit="handleAdminNoticeSubmit(event)">
                  <input type="hidden" id="n-edit-id" value="">

                  <div class="form-row">
                    <div class="form-group">
                      <label for="n-topic">활동 주제 선택 *</label>
                      <select id="n-topic" required>
                        <option value="camp">🏕️ 매달 야영 대집회 캠프</option>
                        <option value="orienteering">🧭 숲 생태 오리엔티어링</option>
                        <option value="badge">🏅 스카우트 기능 뱃지 이수</option>
                        <option value="jamboree">🌏 국제 잼버리 대회 및 문화 교류</option>
                      </select>
                    </div>
                    <div class="form-group">
                      <label for="n-author">작성자 명의</label>
                      <input type="text" id="n-author" value="WOOD지역대 훈련대장" required>
                    </div>
                  </div>

                  <div class="form-group">
                    <label for="n-title">공지사항 제목 *</label>
                    <input type="text" id="n-title" placeholder="예: [안내] 9월 가을 정기 야영 대회 일정 공지" required>
                  </div>

                  <div class="form-group">
                    <label class="checkbox-label">
                      <input type="checkbox" id="n-important">
                      <span><i class="fa-solid fa-star text-orange"></i> 중요 공지로 상단 고정 및 강조</span>
                    </label>
                  </div>

                  <div class="form-group">
                    <label for="n-content">공지 내용 *</label>
                    <textarea id="n-content" rows="6" placeholder="상세 공지 내용, 준비물, 일정 등을 입력해주세요." required></textarea>
                  </div>

                  <div class="form-btns-flex">
                    <button type="submit" class="wooden-submit-btn" id="notice-save-btn">
                      <i class="fa-solid fa-floppy-disk"></i> 공지사항 등록하기
                    </button>
                    <button type="button" class="wooden-mini-btn hidden" id="notice-cancel-edit-btn" onclick="resetAdminNoticeForm()">취소</button>
                  </div>
                </form>
              </div>

              <div class="admin-card-section mt-4">
                <div class="tab-header-flex">
                  <h4>📝 등록된 공지사항 목록</h4>
                  <div class="filter-group">
                    <select id="admin-notice-topic-filter" class="wooden-select" onchange="loadAdminNotices()">
                      <option value="">전체 주제 보기</option>
                      <option value="camp">매달 야영 캠프</option>
                      <option value="orienteering">숲 생태 오리엔티어링</option>
                      <option value="badge">기능 뱃지 이수</option>
                      <option value="jamboree">잼버리</option>
                    </select>
                    <button class="wooden-mini-btn" onclick="loadAdminNotices(); showToast('🔄 공지 목록을 새로고침했습니다.');"><i class="fa-solid fa-rotate-right"></i></button>
                  </div>
                </div>

                <div class="admin-notices-list" id="admin-notices-list"></div>
              </div>

            </div>

            <!-- TAB 4: 관리자 설정 -->
            <div class="admin-tab-pane" id="tab-settings">
              <div class="admin-card-section">
                <h4>🔒 관리자 비밀번호 변경</h4>
                <p class="section-subtext">관리자 접속용 비밀번호를 안전하게 변경할 수 있습니다. (기본값: wood1234)</p>

                <form id="admin-pwd-form" class="admin-form-grid max-w-md" onsubmit="handleAdminPasswordSubmit(event)">
                  <div class="form-group">
                    <label for="new-admin-pwd">새 비밀번호 (4자리 이상)</label>
                    <input type="password" id="new-admin-pwd" placeholder="새 비밀번호 입력" required autocomplete="new-password">
                  </div>
                  <div class="form-group">
                    <label for="confirm-admin-pwd">비밀번호 확인</label>
                    <input type="password" id="confirm-admin-pwd" placeholder="새 비밀번호 재입력" required autocomplete="new-password">
                  </div>
                  <button type="submit" class="wooden-submit-btn">
                    <i class="fa-solid fa-key"></i> 비밀번호 변경 저장
                  </button>
                </form>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  </div>

  <!-- Toast Notification -->
  <div class="toast-notification hidden" id="node-toast">
    <i class="fa-solid fa-sparkles toast-icon"></i>
    <span id="node-toast-msg">메시지 내용</span>
  </div>

  <script src="app.js"></script>
</body>
</html>`;

// 2. GLOBAL WINDOW FUNCTION APP.JS
const appJs = `/* ==========================================================================
   스카우트 WOOD지역대 - 마스터 애플리케이션 스크립트 (app.js)
   모든 함수가 window 전역에 선언되어 100% 신뢰성 있게 즉시 호출됩니다.
   ========================================================================== */

let isBgmPlaying = false;
let isSfxEnabled = true;
let bgmAudioCtx = null;
let bgmOscillators = [];

let currentTopicId = 'camp';
let currentTopicName = '매달 야영 대집회 캠프';
let currentGalleryCategory = '전체';
const defaultAdminToken = 'wood-admin-session-active';

// --- Global Modal Open/Close ---
window.openModal = function(modalId) {
  document.querySelectorAll('.parchment-modal-backdrop').forEach(m => m.classList.add('hidden'));
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('hidden');
    playSfxPop();
  }
  if (modalId === 'modal-activities') fetchTopicsStatus();
  else if (modalId === 'modal-gallery') {
    showGalleryMainView();
    loadGallery(currentGalleryCategory);
  }
};

window.closeModal = function(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.add('hidden');
};

window.handleBackdropClick = function(e, modalId) {
  if (e.target.id === modalId) closeModal(modalId);
};

// --- Admin Modal ---
window.openAdminModal = function() {
  openModal('modal-admin');
  loadAdminDashboard();
};

window.switchAdminTab = function(tabId, btn) {
  document.querySelectorAll('.admin-tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.admin-tab-pane').forEach(p => p.classList.remove('active'));
  if (btn) btn.classList.add('active');
  const pane = document.getElementById(tabId);
  if (pane) pane.classList.add('active');

  if (tabId === 'tab-members') loadAdminMembers();
  else if (tabId === 'tab-gallery') loadAdminGallery();
  else if (tabId === 'tab-notices') loadAdminNotices();
};

// --- Board Modal Operations ---
window.openTopicBoard = function(topicId, topicName) {
  openModal('modal-board');
  switchBoardTopic(topicId, topicName);
};

window.switchBoardTopic = function(topicId, topicName) {
  currentTopicId = topicId;
  currentTopicName = topicName || getTopicDisplayName(topicId);

  // Tab active state
  document.querySelectorAll('.board-topic-tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.id === 'tab-btn-' + topicId);
  });

  // Header update
  const headerTitle = document.getElementById('board-main-title');
  const headerBadgeName = document.getElementById('board-header-topic-name');
  const headerIcon = document.getElementById('board-header-icon');

  if (headerTitle) headerTitle.textContent = currentTopicName + ' 공지사항 📋';
  if (headerBadgeName) headerBadgeName.textContent = currentTopicName;

  const iconClass = topicId === 'camp' ? 'fa-campground' :
                   topicId === 'orienteering' ? 'fa-compass' :
                   topicId === 'badge' ? 'fa-award' : 'fa-earth-americas';

  if (headerIcon) headerIcon.className = 'fa-solid ' + iconClass;

  showBoardListView();
  loadTopicNotices(topicId);
  showToast('📋 [' + currentTopicName + '] 게시판으로 이동했습니다.');
};

window.showBoardListView = function() {
  document.getElementById('board-write-view')?.classList.add('hidden');
  document.getElementById('board-detail-view')?.classList.add('hidden');
  document.getElementById('board-list-view')?.classList.remove('hidden');
};

window.openBoardWriteView = function() {
  playSfxPop();
  const sel = document.getElementById('b-topic');
  if (sel) sel.value = currentTopicId;
  document.getElementById('board-list-view')?.classList.add('hidden');
  document.getElementById('board-detail-view')?.classList.add('hidden');
  document.getElementById('board-write-view')?.classList.remove('hidden');
};

window.refreshCurrentBoard = function() {
  loadTopicNotices(currentTopicId);
  showToast('🔄 [' + currentTopicName + '] 게시글 목록을 새로고침했습니다.');
};

window.handleBoardModalNoticeSubmit = async function(e) {
  e.preventDefault();
  const topicId = document.getElementById('b-topic')?.value;
  const author = document.getElementById('b-author')?.value.trim();
  const title = document.getElementById('b-title')?.value.trim();
  const isImportant = document.getElementById('b-important')?.checked;
  const content = document.getElementById('b-content')?.value.trim();

  if (!topicId || !title || !content) {
    showToast('⚠️ 제목과 내용을 모두 입력해주세요.');
    return;
  }

  try {
    const res = await fetch('/api/notices', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-token': defaultAdminToken
      },
      body: JSON.stringify({
        topic_id: topicId,
        author: author || 'WOOD지역대 훈련대장',
        title,
        is_important: isImportant,
        content
      })
    });
    const data = await res.json();
    if (data.success) {
      playSfxFanfare();
      showToast('📢 새 공지사항이 성공적으로 등록되었습니다!');
      document.getElementById('board-modal-notice-form')?.reset();
      document.getElementById('b-author').value = 'WOOD지역대 훈련대장';
      showBoardListView();
      switchBoardTopic(topicId);
      fetchTopicsStatus();
    } else {
      showToast('❌ 등록 실패: ' + data.message);
    }
  } catch(err) {
    showToast('❌ 네트워크 오류로 등록에 실패했습니다.');
  }
};

// --- Notice APIs ---
async function fetchTopicsStatus() {
  try {
    const res = await fetch('/api/topics');
    const data = await res.json();
    if (data.success && Array.isArray(data.data)) {
      let anyNew = false;
      data.data.forEach(t => {
        const badge = document.getElementById('badge-topic-' + t.id);
        const tabDot = document.getElementById('tab-dot-' + t.id);
        if (t.has_new) {
          if (badge) {
            badge.style.display = 'inline-flex';
            badge.innerHTML = '🔥 NEW (' + t.recent_count + ')';
          }
          if (tabDot) tabDot.style.display = 'inline-block';
          anyNew = true;
        } else {
          if (badge) badge.style.display = 'none';
          if (tabDot) tabDot.style.display = 'none';
        }
      });
      const headerDot = document.getElementById('header-activity-new-dot');
      const nodeTag = document.getElementById('node-campfire-new-tag');
      if (headerDot) headerDot.style.display = anyNew ? 'inline-block' : 'none';
      if (nodeTag) nodeTag.style.display = anyNew ? 'inline-block' : 'none';
    }
  } catch(e){}
}

async function loadTopicNotices(topicId) {
  const container = document.getElementById('board-notices-container');
  if (!container) return;

  container.innerHTML = '<div class="loading-state-box"><i class="fa-solid fa-spinner fa-spin"></i><p>' + currentTopicName + ' 공지사항을 불러오는 중입니다...</p></div>';

  try {
    const res = await fetch('/api/notices?topic_id=' + encodeURIComponent(topicId));
    const data = await res.json();

    if (!data.success || !data.data || data.data.length === 0) {
      container.innerHTML = '<div class="empty-state-box"><i class="fa-regular fa-clipboard"></i><p>아직 등록된 공지사항이 없습니다.</p><p style="margin-top:8px;"><button class="wooden-mini-btn btn-highlight" onclick="openBoardWriteView()"><i class="fa-solid fa-pen-nib"></i> 첫 번째 공지사항 작성하기</button></p></div>';
      return;
    }

    container.innerHTML = '';
    data.data.forEach(notice => {
      const isImportant = notice.is_important === 1;
      const createdDate = notice.created_at ? notice.created_at.slice(0, 10) : '';

      const card = document.createElement('div');
      card.className = 'notice-card-item ' + (isImportant ? 'is-important' : '');
      card.innerHTML = '<div class="notice-card-header">' +
        (isImportant ? '<span class="notice-badge-pill important-pill"><i class="fa-solid fa-star"></i> 중요</span>' : '') +
        '<h4 class="notice-card-title">' + escapeHtml(notice.title) + '</h4></div>' +
        '<p class="notice-card-excerpt">' + escapeHtml(notice.content) + '</p>' +
        '<div class="notice-card-meta">' +
        '<span><i class="fa-solid fa-user-pen"></i> ' + escapeHtml(notice.author) + '</span>' +
        '<span><i class="fa-regular fa-calendar"></i> ' + createdDate + '</span>' +
        '<span><i class="fa-regular fa-eye"></i> 조회 ' + (notice.views || 0) + '</span></div>';

      card.onclick = function() {
        playSfxPop();
        viewNoticeDetail(notice.id);
      };

      container.appendChild(card);
    });
  } catch(e) {
    container.innerHTML = '<div class="empty-state-box"><p>공지사항을 불러오지 못했습니다.</p></div>';
  }
}

async function viewNoticeDetail(noticeId) {
  try {
    const res = await fetch('/api/notices/' + noticeId);
    const data = await res.json();
    if (!data.success || !data.data) return;

    const notice = data.data;
    const detailTitle = document.getElementById('detail-title');
    const detailAuthor = document.getElementById('detail-author');
    const detailDate = document.getElementById('detail-date');
    const detailViews = document.getElementById('detail-views');
    const detailContent = document.getElementById('detail-content');
    const detailImportantPill = document.getElementById('detail-important-pill');
    const detailTopicPill = document.getElementById('detail-topic-pill');

    if (detailTitle) detailTitle.textContent = notice.title;
    if (detailAuthor) detailAuthor.textContent = notice.author;
    if (detailDate) detailDate.textContent = notice.created_at ? notice.created_at.slice(0, 10) : '';
    if (detailViews) detailViews.textContent = notice.views;
    if (detailContent) detailContent.textContent = notice.content;

    if (detailImportantPill) detailImportantPill.style.display = notice.is_important ? 'inline-flex' : 'none';
    if (detailTopicPill) detailTopicPill.textContent = notice.topic_name || currentTopicName;

    document.getElementById('board-list-view')?.classList.add('hidden');
    document.getElementById('board-write-view')?.classList.add('hidden');
    document.getElementById('board-detail-view')?.classList.remove('hidden');
  } catch(e){}
}

function getTopicDisplayName(id) {
  switch(id) {
    case 'camp': return '매달 야영 대집회 캠프';
    case 'orienteering': return '숲 생태 오리엔티어링';
    case 'badge': return '스카우트 기능 뱃지 이수';
    case 'jamboree': return '국제 잼버리 대회 및 문화 교류';
    default: return '주요 활동';
  }
}

// --- Gallery Operations ---
window.showGalleryMainView = function() {
  document.getElementById('gallery-upload-view')?.classList.add('hidden');
  document.getElementById('gallery-main-view')?.classList.remove('hidden');
};

window.showGalleryUploadView = function() {
  playSfxPop();
  document.getElementById('gallery-main-view')?.classList.add('hidden');
  document.getElementById('gallery-upload-view')?.classList.remove('hidden');
};

window.filterGallery = function(category, btn) {
  document.querySelectorAll('.gallery-filter-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  currentGalleryCategory = category;
  loadGallery(category);
};

window.previewGalleryImage = function(input, boxId, imgId) {
  const file = input.files[0];
  const box = document.getElementById(boxId);
  const img = document.getElementById(imgId);
  if (file && box && img) {
    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target.result;
      box.classList.remove('hidden');
    };
    reader.readAsDataURL(file);
  } else if (box) {
    box.classList.add('hidden');
  }
};

window.handleGalleryUploadSubmit = async function(e) {
  e.preventDefault();
  const title = document.getElementById('mg-title')?.value.trim();
  const category = document.getElementById('mg-category')?.value;
  const date = document.getElementById('mg-date')?.value || new Date().toISOString().slice(0, 10);
  const desc = document.getElementById('mg-desc')?.value.trim();
  const file = document.getElementById('mg-file')?.files[0];

  if (!file || !title) {
    showToast('⚠️ 사진 파일과 제목을 입력해주세요.');
    return;
  }

  const formData = new FormData();
  formData.append('title', title);
  formData.append('category', category);
  formData.append('activity_date', date);
  formData.append('description', desc);
  formData.append('image', file);

  try {
    const res = await fetch('/api/gallery', {
      method: 'POST',
      headers: { 'x-admin-token': defaultAdminToken },
      body: formData
    });
    const data = await res.json();
    if (data.success) {
      playSfxFanfare();
      showToast('📸 새 활동 사진이 등록되었습니다!');
      document.getElementById('modal-gallery-upload-form')?.reset();
      document.getElementById('mg-file-preview-box')?.classList.add('hidden');
      showGalleryMainView();
      loadGallery(currentGalleryCategory);
    } else {
      showToast('❌ 등록 실패: ' + data.message);
    }
  } catch(err) {
    showToast('❌ 사진 업로드 실패');
  }
};

async function loadGallery(category = '전체') {
  const grid = document.getElementById('gallery-dynamic-grid');
  if (!grid) return;

  try {
    const url = category && category !== '전체' ? '/api/gallery?category=' + encodeURIComponent(category) : '/api/gallery';
    const res = await fetch(url);
    const data = await res.json();

    if (!data.success || !data.data || data.data.length === 0) {
      grid.innerHTML = '<div class="empty-state-box" style="grid-column: 1 / -1;"><i class="fa-regular fa-image"></i><p>해당 카테고리에 등록된 사진이 없습니다.</p><p style="margin-top:8px;"><button class="wooden-mini-btn btn-highlight" onclick="showGalleryUploadView()"><i class="fa-solid fa-cloud-arrow-up"></i> 사진 올리기</button></p></div>';
      return;
    }

    grid.innerHTML = '';
    data.data.forEach(item => {
      const itemCard = document.createElement('div');
      itemCard.className = 'gallery-item';
      const imgSrc = item.image_url.startsWith('http') ? item.image_url : (item.image_url.startsWith('/') ? item.image_url : '/' + item.image_url);

      itemCard.innerHTML = '<div class="gallery-item-img-box">' +
        '<img src="' + imgSrc + '" alt="' + escapeHtml(item.title) + '" onerror="this.onerror=null; this.src=\\'images/scout_hero.jpg\\';">' +
        '<span class="gallery-item-badge">' + escapeHtml(item.category || '활동') + '</span></div>' +
        '<div class="gallery-caption"><div class="gallery-caption-title">' + escapeHtml(item.title) + '</div>' +
        '<div class="gallery-caption-date"><i class="fa-regular fa-calendar"></i> ' + (item.activity_date || item.created_at.slice(0, 10)) + '</div></div>';

      itemCard.onclick = function() {
        playSfxPop();
        openLightbox(item);
      };

      grid.appendChild(itemCard);
    });
  } catch(e){}
}

window.openLightbox = function(item) {
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCat = document.getElementById('lightbox-category');
  const lightboxTitle = document.getElementById('lightbox-title');
  const lightboxDesc = document.getElementById('lightbox-desc');
  const lightboxDate = document.getElementById('lightbox-date');

  const imgSrc = item.image_url.startsWith('http') ? item.image_url : (item.image_url.startsWith('/') ? item.image_url : '/' + item.image_url);

  if (lightboxImg) {
    lightboxImg.src = imgSrc;
    lightboxImg.onerror = function() { this.src = 'images/scout_hero.jpg'; };
  }
  if (lightboxCat) lightboxCat.textContent = item.category || '일반';
  if (lightboxTitle) lightboxTitle.textContent = item.title;
  if (lightboxDesc) lightboxDesc.textContent = item.description || '등록된 설명이 없습니다.';
  if (lightboxDate) lightboxDate.innerHTML = '<i class="fa-regular fa-calendar"></i> ' + (item.activity_date || item.created_at.slice(0, 10));

  openModal('modal-lightbox');
};

// --- Join Form Submit ---
window.handleJoinSubmit = async function(e) {
  e.preventDefault();
  const name = document.getElementById('p-name')?.value.trim();
  const scoutType = document.getElementById('p-type')?.value;
  const phone = document.getElementById('p-phone')?.value.trim();
  const memo = document.getElementById('p-memo')?.value.trim();

  if (!name || !scoutType || !phone) {
    showToast('⚠️ 필수 항목을 모두 입력해주세요.');
    return;
  }

  try {
    const res = await fetch('/api/members/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, scout_type: scoutType, phone, memo })
    });
    const data = await res.json();
    if (data.success) {
      closeModal('modal-join');
      document.getElementById('parchment-join-form')?.reset();
      playSfxFanfare();
      showToast('🎉 ' + name + ' 대원님! 가입 신청서가 접수되었습니다!');
    } else {
      showToast('❌ 접수 실패: ' + data.message);
    }
  } catch(err) {
    showToast('❌ 네트워크 오류');
  }
};

// --- Admin Dashboard Load & CRUD ---
window.loadAdminDashboard = function() {
  loadAdminStats();
  loadAdminMembers();
};

async function loadAdminStats() {
  try {
    const res = await fetch('/api/admin/stats', {
      headers: { 'x-admin-token': defaultAdminToken }
    });
    const data = await res.json();
    if (data.success && data.data) {
      const stats = data.data;
      const totalElem = document.getElementById('stat-members-total');
      const pendingElem = document.getElementById('stat-members-pending');
      const galleryElem = document.getElementById('stat-gallery-total');
      const noticesElem = document.getElementById('stat-notices-total');

      if (totalElem) totalElem.textContent = stats.membersTotal || 0;
      if (pendingElem) pendingElem.textContent = '대기 ' + (stats.membersPending || 0);
      if (galleryElem) galleryElem.textContent = stats.galleryTotal || 0;
      if (noticesElem) noticesElem.textContent = stats.noticesTotal || 0;
    }
  } catch(e){}
}

window.loadAdminMembers = async function() {
  const listElem = document.getElementById('admin-members-list');
  if (!listElem) return;

  listElem.innerHTML = '<div class="loading-state-box"><i class="fa-solid fa-spinner fa-spin"></i><p>가입 신청자 명단을 조회하는 중...</p></div>';
  const statusFilter = document.getElementById('admin-member-filter')?.value || 'pending';

  try {
    const res = await fetch('/api/members?status=' + statusFilter, {
      headers: { 'x-admin-token': defaultAdminToken }
    });
    const data = await res.json();

    if (!data.success || !data.data || data.data.length === 0) {
      listElem.innerHTML = '<div class="empty-state-box"><i class="fa-solid fa-user-check"></i><p>해당 조건의 가입 신청자가 없습니다.</p></div>';
      return;
    }

    listElem.innerHTML = '';
    data.data.forEach(member => {
      const statusClass = member.status === 'approved' ? 'status-approved' :
                         member.status === 'rejected' ? 'status-rejected' : 'status-pending';
      const statusText = member.status === 'approved' ? '✅ 승인완료' :
                        member.status === 'rejected' ? '❌ 반려됨' : '⏳ 승인대기';

      const card = document.createElement('div');
      card.className = 'admin-member-card';
      card.innerHTML = '<div class="member-card-header"><div class="member-name-badge">' +
        '<h4>' + escapeHtml(member.name) + '</h4>' +
        '<span class="member-type-pill">' + escapeHtml(member.scout_type) + '</span></div>' +
        '<span class="status-badge ' + statusClass + '">' + statusText + '</span></div>' +
        '<div class="member-card-info"><div><i class="fa-solid fa-phone"></i> <b>연락처:</b> ' + escapeHtml(member.phone) + '</div>' +
        (member.memo ? '<div class="member-memo"><b>지원 소감:</b> ' + escapeHtml(member.memo) + '</div>' : '') + '</div>' +
        '<div class="member-actions-row"><span class="member-date"><i class="fa-regular fa-clock"></i> 신청: ' + member.created_at + '</span>' +
        '<div class="member-btns-group">' +
        '<button class="btn-action-sm btn-approve" onclick="updateMemberStatus(' + member.id + ', \\'approved\\')">승인</button>' +
        '<button class="btn-action-sm btn-pending" onclick="updateMemberStatus(' + member.id + ', \\'pending\\')">대기</button>' +
        '<button class="btn-action-sm btn-reject" onclick="updateMemberStatus(' + member.id + ', \\'rejected\\')">반려</button>' +
        '<button class="btn-action-sm btn-delete" onclick="deleteMember(' + member.id + ', \\'' + escapeHtml(member.name) + '\\')"><i class="fa-solid fa-trash"></i></button></div></div>';

      listElem.appendChild(card);
    });
  } catch(e){}
};

window.updateMemberStatus = async function(memberId, status) {
  try {
    const res = await fetch('/api/members/' + memberId + '/status', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-admin-token': defaultAdminToken },
      body: JSON.stringify({ status })
    });
    const data = await res.json();
    if (data.success) {
      showToast('✅ ' + data.message);
      loadAdminMembers();
      loadAdminStats();
    }
  } catch(e){}
};

window.deleteMember = async function(memberId, name) {
  if (!confirm("'" + name + "' 대원의 가입 신청서를 삭제하시겠습니까?")) return;
  try {
    const res = await fetch('/api/members/' + memberId, {
      method: 'DELETE',
      headers: { 'x-admin-token': defaultAdminToken }
    });
    const data = await res.json();
    if (data.success) {
      showToast('🗑️ 신청서가 삭제되었습니다.');
      loadAdminMembers();
      loadAdminStats();
    }
  } catch(e){}
};

window.loadAdminGallery = async function() {
  const grid = document.getElementById('admin-gallery-manage-grid');
  if (!grid) return;
  grid.innerHTML = '<div class="loading-state-box"><i class="fa-solid fa-spinner fa-spin"></i><p>갤러리 목록 로딩 중...</p></div>';

  try {
    const res = await fetch('/api/gallery');
    const data = await res.json();
    if (!data.success || !data.data || data.data.length === 0) {
      grid.innerHTML = '<div class="empty-state-box"><p>등록된 사진이 없습니다.</p></div>';
      return;
    }
    grid.innerHTML = '';
    data.data.forEach(photo => {
      const card = document.createElement('div');
      card.className = 'admin-gallery-card';
      const imgSrc = photo.image_url.startsWith('http') ? photo.image_url : (photo.image_url.startsWith('/') ? photo.image_url : '/' + photo.image_url);

      card.innerHTML = '<img src="' + imgSrc + '" alt="' + escapeHtml(photo.title) + '" onerror="this.onerror=null; this.src=\\'images/scout_hero.jpg\\';">' +
        '<div class="admin-gallery-card-body"><div class="admin-gallery-card-title">' + escapeHtml(photo.title) + '</div>' +
        '<div style="font-size:0.75rem; color:#888;">' + photo.category + ' | ' + (photo.activity_date || photo.created_at.slice(0, 10)) + '</div>' +
        '<div class="admin-gallery-card-actions"><button class="btn-action-sm btn-delete" onclick="deleteGalleryPhoto(' + photo.id + ', \\'' + escapeHtml(photo.title) + '\\')"><i class="fa-solid fa-trash"></i> 삭제</button></div></div>';

      grid.appendChild(card);
    });
  } catch(e){}
};

window.deleteGalleryPhoto = async function(id, title) {
  if (!confirm("'" + title + "' 사진을 삭제하시겠습니까?")) return;
  try {
    const res = await fetch('/api/gallery/' + id, {
      method: 'DELETE',
      headers: { 'x-admin-token': defaultAdminToken }
    });
    const data = await res.json();
    if (data.success) {
      showToast('🗑️ 사진이 삭제되었습니다.');
      loadAdminGallery();
      loadAdminStats();
      loadGallery(currentGalleryCategory);
    }
  } catch(e){}
};

window.handleAdminGalleryUpload = async function(e) {
  e.preventDefault();
  const title = document.getElementById('g-title')?.value.trim();
  const category = document.getElementById('g-category')?.value;
  const date = document.getElementById('g-date')?.value || new Date().toISOString().slice(0, 10);
  const desc = document.getElementById('g-desc')?.value.trim();
  const file = document.getElementById('g-file')?.files[0];

  if (!file || !title) {
    showToast('⚠️ 사진 제목과 파일을 입력해주세요.');
    return;
  }

  const formData = new FormData();
  formData.append('title', title);
  formData.append('category', category);
  formData.append('activity_date', date);
  formData.append('description', desc);
  formData.append('image', file);

  try {
    const res = await fetch('/api/gallery', {
      method: 'POST',
      headers: { 'x-admin-token': defaultAdminToken },
      body: formData
    });
    const data = await res.json();
    if (data.success) {
      playSfxFanfare();
      showToast('📸 새 활동 사진이 등록되었습니다!');
      document.getElementById('admin-gallery-form')?.reset();
      document.getElementById('file-preview-box')?.classList.add('hidden');
      loadAdminGallery();
      loadAdminStats();
      loadGallery(currentGalleryCategory);
    }
  } catch(err) {
    showToast('❌ 사진 업로드 실패');
  }
};

window.loadAdminNotices = async function() {
  const listElem = document.getElementById('admin-notices-list');
  if (!listElem) return;
  listElem.innerHTML = '<div class="loading-state-box"><i class="fa-solid fa-spinner fa-spin"></i><p>공지사항 목록 로딩 중...</p></div>';

  const topicFilter = document.getElementById('admin-notice-topic-filter')?.value || '';
  try {
    const url = topicFilter ? '/api/notices?topic_id=' + topicFilter : '/api/notices';
    const res = await fetch(url);
    const data = await res.json();

    if (!data.success || !data.data || data.data.length === 0) {
      listElem.innerHTML = '<div class="empty-state-box"><p>등록된 공지사항이 없습니다.</p></div>';
      return;
    }

    listElem.innerHTML = '';
    data.data.forEach(notice => {
      const item = document.createElement('div');
      item.className = 'admin-notice-item';
      item.innerHTML = '<div class="admin-notice-item-info"><div class="admin-notice-item-title">' +
        (notice.is_important ? '<span class="important-pill" style="font-size:0.7rem;">⭐중요</span> ' : '') +
        '<b>[' + notice.topic_name + ']</b> ' + escapeHtml(notice.title) + '</div>' +
        '<div class="admin-notice-item-meta"><span>작성자: ' + escapeHtml(notice.author) + '</span>' +
        '<span>작성일: ' + (notice.created_at ? notice.created_at.slice(0, 10) : '') + '</span>' +
        '<span>조회: ' + (notice.views || 0) + '</span></div></div>' +
        '<div class="member-btns-group"><button class="btn-action-sm btn-pending" onclick="editAdminNotice(' + JSON.stringify(notice).replace(/"/g, '&quot;') + ')"><i class="fa-solid fa-pen"></i> 수정</button>' +
        '<button class="btn-action-sm btn-delete" onclick="deleteAdminNotice(' + notice.id + ', \\'' + escapeHtml(notice.title) + '\\')"><i class="fa-solid fa-trash"></i> 삭제</button></div>';

      listElem.appendChild(item);
    });
  } catch(e){}
};

window.editAdminNotice = function(notice) {
  document.getElementById('n-edit-id').value = notice.id;
  document.getElementById('n-topic').value = notice.topic_id;
  document.getElementById('n-author').value = notice.author;
  document.getElementById('n-title').value = notice.title;
  document.getElementById('n-important').checked = notice.is_important === 1;
  document.getElementById('n-content').value = notice.content;

  const noticeFormTitle = document.getElementById('notice-form-title');
  const noticeSaveBtn = document.getElementById('notice-save-btn');
  if (noticeFormTitle) noticeFormTitle.textContent = '✏️ 공지사항 수정 중';
  if (noticeSaveBtn) noticeSaveBtn.innerHTML = '<i class="fa-solid fa-pen-to-square"></i> 수정사항 저장';
  document.getElementById('notice-cancel-edit-btn')?.classList.remove('hidden');
  document.getElementById('admin-notice-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

window.resetAdminNoticeForm = function() {
  document.getElementById('admin-notice-form')?.reset();
  document.getElementById('n-edit-id').value = '';
  document.getElementById('n-author').value = 'WOOD지역대 훈련대장';
  const noticeFormTitle = document.getElementById('notice-form-title');
  const noticeSaveBtn = document.getElementById('notice-save-btn');
  if (noticeFormTitle) noticeFormTitle.textContent = '📢 새 공지사항 작성';
  if (noticeSaveBtn) noticeSaveBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> 공지사항 등록하기';
  document.getElementById('notice-cancel-edit-btn')?.classList.add('hidden');
};

window.handleAdminNoticeSubmit = async function(e) {
  e.preventDefault();
  const editId = document.getElementById('n-edit-id')?.value;
  const topicId = document.getElementById('n-topic')?.value;
  const author = document.getElementById('n-author')?.value.trim();
  const title = document.getElementById('n-title')?.value.trim();
  const isImportant = document.getElementById('n-important')?.checked;
  const content = document.getElementById('n-content')?.value.trim();

  if (!topicId || !title || !content) {
    showToast('⚠️ 주제, 제목, 내용을 모두 입력해주세요.');
    return;
  }

  const payload = { topic_id: topicId, author, title, is_important: isImportant, content };
  const url = editId ? '/api/notices/' + editId : '/api/notices';
  const method = editId ? 'PUT' : 'POST';

  try {
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', 'x-admin-token': defaultAdminToken },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.success) {
      playSfxFanfare();
      showToast('📢 공지사항이 ' + (editId ? '수정' : '등록') + '되었습니다!');
      resetAdminNoticeForm();
      loadAdminNotices();
      loadAdminStats();
      fetchTopicsStatus();
    }
  } catch(e){}
};

window.deleteAdminNotice = async function(id, title) {
  if (!confirm("'" + title + "' 공지사항을 삭제하시겠습니까?")) return;
  try {
    const res = await fetch('/api/notices/' + id, {
      method: 'DELETE',
      headers: { 'x-admin-token': defaultAdminToken }
    });
    const data = await res.json();
    if (data.success) {
      showToast('🗑️ 공지사항이 삭제되었습니다.');
      loadAdminNotices();
      loadAdminStats();
      fetchTopicsStatus();
    }
  } catch(e){}
};

window.handleAdminPasswordSubmit = async function(e) {
  e.preventDefault();
  const newPwd = document.getElementById('new-admin-pwd')?.value;
  const confirmPwd = document.getElementById('confirm-admin-pwd')?.value;

  if (!newPwd || newPwd.length < 4) {
    showToast('⚠️ 새 비밀번호는 4자리 이상이어야 합니다.');
    return;
  }
  if (newPwd !== confirmPwd) {
    showToast('⚠️ 비밀번호 확인이 일치하지 않습니다.');
    return;
  }

  try {
    const res = await fetch('/api/admin/password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-token': defaultAdminToken },
      body: JSON.stringify({ newPassword: newPwd })
    });
    const data = await res.json();
    if (data.success) {
      showToast('🔑 비밀번호가 성공적으로 변경되었습니다!');
      document.getElementById('admin-pwd-form')?.reset();
    }
  } catch(e){}
};

// --- Audio Controls ---
window.toggleBgm = function() {
  const btn = document.getElementById('audio-toggle-btn');
  const txt = document.getElementById('bgm-btn-text');
  if (!isBgmPlaying) {
    startForestBgm();
    btn?.classList.add('active');
    if (txt) txt.textContent = '숲속 sound On';
    showToast('🌿 숲속 소리가 시작되었습니다.');
    isBgmPlaying = true;
  } else {
    stopForestBgm();
    btn?.classList.remove('active');
    if (txt) txt.textContent = '숲속 sound Mute';
    showToast('🔇 숲속 소리가 정지되었습니다.');
    isBgmPlaying = false;
  }
};

window.toggleSfx = function() {
  const btn = document.getElementById('sfx-toggle-btn');
  const txt = document.getElementById('sfx-btn-text');
  isSfxEnabled = !isSfxEnabled;
  btn?.classList.toggle('active', isSfxEnabled);
  if (txt) txt.textContent = isSfxEnabled ? '효과음 On' : '효과음 Off';
};

function startForestBgm() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    bgmAudioCtx = new AudioContext();
    const bufferSize = bgmAudioCtx.sampleRate * 2;
    const noiseBuffer = bgmAudioCtx.createBuffer(1, bufferSize, bgmAudioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) output[i] = (Math.random() * 2 - 1) * 0.02;

    const whiteNoise = bgmAudioCtx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const windFilter = bgmAudioCtx.createBiquadFilter();
    windFilter.type = 'lowpass';
    windFilter.frequency.setValueAtTime(350, bgmAudioCtx.currentTime);

    const gainNode = bgmAudioCtx.createGain();
    gainNode.gain.setValueAtTime(0.12, bgmAudioCtx.currentTime);

    whiteNoise.connect(windFilter);
    windFilter.connect(gainNode);
    gainNode.connect(bgmAudioCtx.destination);
    whiteNoise.start();

    bgmOscillators.push(whiteNoise);

    setInterval(() => {
      if (isBgmPlaying && bgmAudioCtx) playBirdChirp(bgmAudioCtx);
    }, 3500);
  } catch(e){}
}

function stopForestBgm() {
  if (bgmOscillators.length > 0) {
    bgmOscillators.forEach(osc => osc.stop && osc.stop());
    bgmOscillators = [];
  }
  if (bgmAudioCtx) {
    bgmAudioCtx.close();
    bgmAudioCtx = null;
  }
}

function playBirdChirp(ctx) {
  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    const startFreq = 2200 + Math.random() * 600;
    osc.frequency.setValueAtTime(startFreq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(startFreq + 800, ctx.currentTime + 0.1);
    osc.frequency.exponentialRampToValueAtTime(startFreq, ctx.currentTime + 0.2);
    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.25);
  } catch(e){}
}

function playSfxHover() {
  if (!isSfxEnabled) return;
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(500, ctx.currentTime + 0.05);
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  } catch(e){}
}

function playSfxPop() {
  if (!isSfxEnabled) return;
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  } catch(e){}
}

function playSfxFanfare() {
  if (!isSfxEnabled) return;
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioContext();
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);
      gain.gain.setValueAtTime(0.1, ctx.currentTime + idx * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.1 + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + idx * 0.1);
      osc.stop(ctx.currentTime + idx * 0.1 + 0.3);
    });
  } catch(e){}
}

window.showToast = function(msg) {
  const toast = document.getElementById('node-toast');
  const txt = document.getElementById('node-toast-msg');
  if (!toast || !txt) return;
  txt.textContent = msg;
  toast.classList.remove('hidden');
  setTimeout(() => toast.classList.add('hidden'), 3500);
};

function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Check if opened via file:// protocol
if (window.location.protocol === 'file:') {
  const banner = document.createElement('div');
  banner.style.cssText = 'position:fixed; top:0; left:0; width:100vw; background:#E63946; color:#FFF; text-align:center; padding:14px; font-weight:bold; z-index:99999; font-size:1.15rem; box-shadow:0 4px 20px rgba(0,0,0,0.5);';
  banner.innerHTML = '⚠️ 현재 로컬 파일(file://)로 열려 있어 백엔드 서버와 통신할 수 없습니다! 브라우저 주소창에 <a href="http://localhost:8000" style="color:#FFE600; text-decoration:underline; font-size:1.25rem;">http://localhost:8000</a> 을 입력해주세요!';
  document.body.prepend(banner);
}

// Initial Preloads
document.addEventListener('DOMContentLoaded', () => {
  fetchTopicsStatus();
  loadGallery('전체');
});
`;

fs.writeFileSync(path.join(__dirname, 'index.html'), indexHtml, 'utf8');
fs.writeFileSync(path.join(__dirname, 'app.js'), appJs, 'utf8');
console.log('Successfully wrote rock-solid index.html and app.js with inline handlers!');
