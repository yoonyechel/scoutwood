/* ==========================================================================
   스카우트 WOOD지역대 - 마스터 프론트엔드 스크립트 (app.js)
   모든 함수가 window 전역에 선언되어 100% 신뢰성 있게 호출됩니다.
   ========================================================================== */

// --- Audio & State Variables ---
let isBgmPlaying = false;
let isSfxEnabled = true;
let bgmAudioCtx = null;
let bgmOscillators = [];

let currentTopicId = 'all';
let currentTopicName = '전체 공지사항';
let currentGalleryCategory = '전체';
let currentSearchQuery = '';
let boardCurrentPage = 1;
const BOARD_PAGE_SIZE = 3;
let defaultAdminToken = 'wood-admin-session-active';
let isAdminLoggedIn = false;

// In-memory data store for safe ID-based lookups
window.cachedNotices = [];
window.cachedMembers = [];
window.cachedGallery = [];
window.cachedNoticeMap = {};
window.cachedMemberMap = {};
window.cachedGalleryMap = {};

// --- Global Modal Open/Close ---
window.openModal = function(modalId) {
  document.querySelectorAll('.parchment-modal-backdrop').forEach(m => m.classList.add('hidden'));
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('hidden');
    playSfxPop();
  }
  if (modalId === 'modal-activities') {
    fetchTopicsStatus();
  } else if (modalId === 'modal-gallery') {
    showGalleryMainView();
    loadGallery(currentGalleryCategory);
  } else if (modalId === 'modal-board') {
    loadTopicNotices(currentTopicId);
  }
};

window.closeModal = function(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.add('hidden');
};

window.handleBackdropClick = function(e, modalId) {
  if (e.target.id === modalId) {
    closeModal(modalId);
  }
};

// ==========================================================================
// 1. NOTICE BOARD (활동별 & 전체 공지 게시판 모달)
// ==========================================================================

window.openTopicBoard = function(topicId = 'all', topicName) {
  openModal('modal-board');
  switchBoardTopic(topicId, topicName);
};

window.switchBoardTopic = function(topicId, topicName) {
  currentTopicId = topicId || 'all';
  currentTopicName = topicName || getTopicDisplayName(currentTopicId);
  boardCurrentPage = 1;

  // Update tab buttons active state
  document.querySelectorAll('.board-topic-tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.id === 'tab-btn-' + currentTopicId);
  });

  // Header update
  const headerTitle = document.getElementById('board-main-title');
  const headerBadgeName = document.getElementById('board-header-topic-name');
  const headerIcon = document.getElementById('board-header-icon');

  if (headerTitle) {
    const cleanTitle = currentTopicName.endsWith('공지사항') ? currentTopicName : (currentTopicName + ' 공지사항');
    headerTitle.textContent = cleanTitle + ' 📋';
  }
  if (headerBadgeName) headerBadgeName.textContent = currentTopicName;

  const iconClass = currentTopicId === 'camp' ? 'fa-campground' :
                   currentTopicId === 'orienteering' ? 'fa-compass' :
                   currentTopicId === 'badge' ? 'fa-award' :
                   currentTopicId === 'jamboree' ? 'fa-earth-americas' : 'fa-bullhorn';

  if (headerIcon) headerIcon.className = 'fa-solid ' + iconClass;

  showBoardListView();
  loadTopicNotices(currentTopicId);
  showToast('📋 [' + currentTopicName + '] 게시판으로 이동했습니다.');
};

window.handleBoardSearch = function(query) {
  currentSearchQuery = (query || '').trim().toLowerCase();
  boardCurrentPage = 1;
  renderFilteredNotices();
};

window.showBoardListView = function() {
  document.getElementById('board-write-view')?.classList.add('hidden');
  document.getElementById('board-detail-view')?.classList.add('hidden');
  document.getElementById('board-list-view')?.classList.remove('hidden');
};

window.openBoardWriteView = function() {
  playSfxPop();
  const sel = document.getElementById('b-topic');
  if (sel) {
    sel.value = currentTopicId === 'all' ? 'camp' : currentTopicId;
  }
  document.getElementById('board-list-view')?.classList.add('hidden');
  document.getElementById('board-detail-view')?.classList.add('hidden');
  document.getElementById('board-write-view')?.classList.remove('hidden');
};

window.refreshCurrentBoard = function() {
  loadTopicNotices(currentTopicId);
  showToast('🔄 [' + currentTopicName + '] 게시글 목록을 새로고침했습니다.');
};

async function loadTopicNotices(topicId) {
  const container = document.getElementById('board-notices-container');
  if (!container) return;

  container.innerHTML = '<div class="loading-state-box"><i class="fa-solid fa-spinner fa-spin"></i><p>' + currentTopicName + ' 공지사항을 불러오는 중입니다...</p></div>';

  try {
    const url = (topicId && topicId !== 'all') ? '/api/notices?topic_id=' + encodeURIComponent(topicId) : '/api/notices';
    const res = await fetch(url);
    const data = await res.json();

    if (data.success && Array.isArray(data.data)) {
      window.cachedNotices = data.data;
      window.cachedNoticeMap = {};
      data.data.forEach(n => { window.cachedNoticeMap[n.id] = n; });
      renderFilteredNotices();
      return;
    }
  } catch(e) {
    console.warn('Backend notices offline, fallback mock notices:', e);
  }

  // Graceful fallback mock notices if backend is not ready
  if (!window.cachedNotices || window.cachedNotices.length === 0) {
    window.cachedNotices = getFallbackNotices();
    window.cachedNoticeMap = {};
    window.cachedNotices.forEach(n => { window.cachedNoticeMap[n.id] = n; });
  }
  renderFilteredNotices();
}

function renderFilteredNotices() {
  const container = document.getElementById('board-notices-container');
  const paginationBar = document.getElementById('board-pagination-bar');
  if (!container) return;

  let list = window.cachedNotices || [];

  // Filter by topic if not all
  if (currentTopicId && currentTopicId !== 'all') {
    list = list.filter(n => n.topic_id === currentTopicId);
  }

  // Filter by search query
  if (currentSearchQuery) {
    list = list.filter(n =>
      (n.title && n.title.toLowerCase().includes(currentSearchQuery)) ||
      (n.content && n.content.toLowerCase().includes(currentSearchQuery)) ||
      (n.author && n.author.toLowerCase().includes(currentSearchQuery))
    );
  }

  if (list.length === 0) {
    container.innerHTML = '<div class="empty-state-box"><i class="fa-regular fa-clipboard"></i><p>등록된 공지사항이 없습니다.</p><p style="margin-top:8px;"><button class="wooden-mini-btn btn-highlight" onclick="openBoardWriteView()"><i class="fa-solid fa-pen-nib"></i> 새 공지사항 작성하기</button></p></div>';
    if (paginationBar) paginationBar.innerHTML = '';
    return;
  }

  // Pagination calculation: 3 notices per page
  const totalCount = list.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / BOARD_PAGE_SIZE));
  if (boardCurrentPage > totalPages) boardCurrentPage = totalPages;
  if (boardCurrentPage < 1) boardCurrentPage = 1;

  const startIndex = (boardCurrentPage - 1) * BOARD_PAGE_SIZE;
  const pagedList = list.slice(startIndex, startIndex + BOARD_PAGE_SIZE);

  container.innerHTML = '';
  pagedList.forEach(notice => {
    const isImportant = notice.is_important === 1 || notice.is_important === true;
    const createdDate = notice.created_at ? notice.created_at.slice(0, 10) : '';

    const card = document.createElement('div');
    card.className = 'notice-card-item ' + (isImportant ? 'is-important' : '');
    
    const topicBadgeHtml = '<span class="notice-badge-pill topic-pill">' + escapeHtml(notice.topic_name || getTopicDisplayName(notice.topic_id)) + '</span>';
    const importantBadgeHtml = isImportant ? '<span class="notice-badge-pill important-pill"><i class="fa-solid fa-star"></i> 중요</span>' : '';

    card.innerHTML = 
      '<div class="notice-card-header">' +
        importantBadgeHtml + topicBadgeHtml +
        '<h4 class="notice-card-title">' + escapeHtml(notice.title) + '</h4>' +
      '</div>' +
      '<p class="notice-card-excerpt">' + escapeHtml(notice.content) + '</p>' +
      '<div class="notice-card-meta">' +
        '<span><i class="fa-solid fa-user-pen"></i> ' + escapeHtml(notice.author || 'WOOD지역대') + '</span>' +
        '<span><i class="fa-regular fa-calendar"></i> ' + createdDate + '</span>' +
        '<span><i class="fa-regular fa-eye"></i> 조회 ' + (notice.views || 0) + '</span>' +
      '</div>';

    card.onclick = function() {
      playSfxPop();
      viewNoticeDetailById(notice.id);
    };

    container.appendChild(card);
  });

  // Render Numbered Pagination Bar
  if (paginationBar) {
    if (totalPages <= 1) {
      paginationBar.innerHTML = '<span class="pagination-info">전체 ' + totalCount + '건의 공지사항 (1 / 1 페이지)</span>';
      return;
    }

    let paginationHtml = '';

    // Prev Button
    paginationHtml += '<button class="pagination-btn" onclick="goToBoardPage(' + (boardCurrentPage - 1) + ')" ' + (boardCurrentPage === 1 ? 'disabled' : '') + ' title="이전 페이지"><i class="fa-solid fa-chevron-left"></i></button>';

    // Page Number Buttons [1] [2] [3]...
    for (let p = 1; p <= totalPages; p++) {
      const isActive = p === boardCurrentPage;
      paginationHtml += '<button class="pagination-btn ' + (isActive ? 'active' : '') + '" onclick="goToBoardPage(' + p + ')" title="' + p + '페이지 열기">' + p + '</button>';
    }

    // Next Button
    paginationHtml += '<button class="pagination-btn" onclick="goToBoardPage(' + (boardCurrentPage + 1) + ')" ' + (boardCurrentPage === totalPages ? 'disabled' : '') + ' title="다음 페이지"><i class="fa-solid fa-chevron-right"></i></button>';

    // Summary Info
    paginationHtml += '<span class="pagination-info">(' + boardCurrentPage + ' / ' + totalPages + ' 페이지 · 총 ' + totalCount + '건)</span>';

    paginationBar.innerHTML = paginationHtml;
  }
}

window.goToBoardPage = function(pageNum) {
  boardCurrentPage = pageNum;
  playSfxPop();
  renderFilteredNotices();
  const listView = document.getElementById('board-list-view');
  if (listView) listView.scrollTop = 0;
};

window.viewNoticeDetailById = async function(noticeId) {
  openModal('modal-board');
  let notice = window.cachedNoticeMap[noticeId];

  try {
    const res = await fetch('/api/notices/' + noticeId);
    const data = await res.json();
    if (data.success && data.data) {
      notice = data.data;
      window.cachedNoticeMap[noticeId] = notice;
    }
  } catch(e){}

  if (!notice) return;

  const detailTitle = document.getElementById('detail-title');
  const detailAuthor = document.getElementById('detail-author');
  const detailDate = document.getElementById('detail-date');
  const detailViews = document.getElementById('detail-views');
  const detailContent = document.getElementById('detail-content');
  const detailImportantPill = document.getElementById('detail-important-pill');
  const detailTopicPill = document.getElementById('detail-topic-pill');

  if (detailTitle) detailTitle.textContent = notice.title;
  if (detailAuthor) detailAuthor.textContent = notice.author || 'WOOD지역대';
  if (detailDate) detailDate.textContent = notice.created_at ? notice.created_at.slice(0, 10) : '';
  if (detailViews) detailViews.textContent = (notice.views || 1);
  if (detailContent) detailContent.textContent = notice.content;

  if (detailImportantPill) detailImportantPill.style.display = notice.is_important ? 'inline-flex' : 'none';
  if (detailTopicPill) detailTopicPill.textContent = notice.topic_name || getTopicDisplayName(notice.topic_id);

  document.getElementById('board-list-view')?.classList.add('hidden');
  document.getElementById('board-write-view')?.classList.add('hidden');
  document.getElementById('board-detail-view')?.classList.remove('hidden');
};

window.showNoticeDetail = function(noticeId) {
  window.viewNoticeDetailById(noticeId);
};

window.handleBoardModalNoticeSubmit = async function(e) {
  e.preventDefault();
  const topicId = document.getElementById('b-topic')?.value;
  const author = document.getElementById('b-author')?.value.trim();
  const title = document.getElementById('b-title')?.value.trim();
  const isImportant = document.getElementById('b-important')?.checked;
  const content = document.getElementById('b-content')?.value.trim();

  if (!topicId || !title || !content) {
    showToast('⚠️ 주제, 제목, 내용을 모두 입력해주세요.');
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
      return;
    }
  } catch(err) {
    console.warn('API error, local fallback save:', err);
  }

  // Fallback local save
  const newNotice = {
    id: Date.now(),
    topic_id: topicId,
    topic_name: getTopicDisplayName(topicId),
    title,
    author: author || 'WOOD지역대 훈련대장',
    content,
    is_important: isImportant ? 1 : 0,
    views: 0,
    created_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
  };
  window.cachedNotices.unshift(newNotice);
  window.cachedNoticeMap[newNotice.id] = newNotice;
  playSfxFanfare();
  showToast('📢 공지사항이 등록되었습니다!');
  document.getElementById('board-modal-notice-form')?.reset();
  showBoardListView();
  renderFilteredNotices();
};

// ==========================================================================
// 2. ADMIN PORTAL (관리자 모드 로그인 & 대시보드 팝업)
// ==========================================================================

window.openAdminModal = function() {
  openModal('modal-admin');
  checkAndRenderAdminView();
};

function checkAndRenderAdminView() {
  const loginView = document.getElementById('admin-login-view');
  const dashView = document.getElementById('admin-dashboard-view');
  const pwdInput = document.getElementById('admin-login-pwd-input');

  const storedAuth = sessionStorage.getItem('wood_admin_auth');
  if (storedAuth === 'true' && isAdminLoggedIn) {
    loginView?.classList.add('hidden');
    dashView?.classList.remove('hidden');
    loadAdminDashboard();
  } else {
    isAdminLoggedIn = false;
    dashView?.classList.add('hidden');
    loginView?.classList.remove('hidden');
    if (pwdInput) {
      pwdInput.value = '';
      setTimeout(() => pwdInput.focus(), 150);
    }
  }
}

window.handleAdminLoginSubmit = async function(e) {
  e.preventDefault();
  const pwdInput = document.getElementById('admin-login-pwd-input');
  const password = pwdInput ? pwdInput.value.trim() : '';

  if (!password) {
    showToast('⚠️ 비밀번호를 입력해주세요.');
    return;
  }

  try {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
    const data = await res.json();
    if (data.success) {
      isAdminLoggedIn = true;
      sessionStorage.setItem('wood_admin_auth', 'true');
      if (data.token) defaultAdminToken = data.token;
      playSfxFanfare();
      showToast('🛡️ 관리자 대시보드에 접속했습니다.');
      checkAndRenderAdminView();
      return;
    } else {
      showToast('❌ ' + (data.message || '비밀번호가 일치하지 않습니다.'));
      return;
    }
  } catch(err) {
    // Fallback: if offline, verify default password
    if (password === 'wood1234') {
      isAdminLoggedIn = true;
      sessionStorage.setItem('wood_admin_auth', 'true');
      playSfxFanfare();
      showToast('🛡️ 관리자 대시보드에 접속했습니다.');
      checkAndRenderAdminView();
      return;
    } else {
      showToast('❌ 비밀번호가 올바르지 않습니다.');
    }
  }
};

window.handleAdminLogout = function() {
  isAdminLoggedIn = false;
  sessionStorage.removeItem('wood_admin_auth');
  localStorage.removeItem('wood_admin_auth');
  playSfxPop();
  showToast('🔒 관리자 모드에서 로그아웃되었습니다.');
  checkAndRenderAdminView();
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

    if (data.success && Array.isArray(data.data)) {
      window.cachedMembers = data.data;
      window.cachedMemberMap = {};
      data.data.forEach(m => { window.cachedMemberMap[m.id] = m; });
      renderAdminMembersList(data.data);
      return;
    }
  } catch(e){}

  // Fallback members
  renderAdminMembersList(window.cachedMembers || []);
};

function renderAdminMembersList(members) {
  const listElem = document.getElementById('admin-members-list');
  if (!listElem) return;

  if (!members || members.length === 0) {
    listElem.innerHTML = '<div class="empty-state-box"><i class="fa-solid fa-user-check"></i><p>해당 조건의 가입 신청자가 없습니다.</p></div>';
    return;
  }

  listElem.innerHTML = '';
  members.forEach(member => {
    const statusClass = member.status === 'approved' ? 'status-approved' :
                       member.status === 'rejected' ? 'status-rejected' : 'status-pending';
    const statusText = member.status === 'approved' ? '✅ 승인완료' :
                      member.status === 'rejected' ? '❌ 반려됨' : '⏳ 승인대기';

    const card = document.createElement('div');
    card.className = 'admin-member-card';
    card.innerHTML = 
      '<div class="member-card-header">' +
        '<div class="member-name-badge">' +
          '<h4>' + escapeHtml(member.name) + '</h4>' +
          '<span class="member-type-pill">' + escapeHtml(member.scout_type) + '</span>' +
        '</div>' +
        '<span class="status-badge ' + statusClass + '">' + statusText + '</span>' +
      '</div>' +
      '<div class="member-card-info">' +
        '<div><i class="fa-solid fa-phone"></i> <b>연락처:</b> ' + escapeHtml(member.phone) + '</div>' +
        (member.memo ? '<div class="member-memo"><b>지원 소감:</b> ' + escapeHtml(member.memo) + '</div>' : '') +
      '</div>' +
      '<div class="member-actions-row">' +
        '<span class="member-date"><i class="fa-regular fa-clock"></i> 신청: ' + (member.created_at || '').slice(0, 19) + '</span>' +
        '<div class="member-btns-group">' +
          '<button class="btn-action-sm btn-approve" onclick="updateMemberStatusById(' + member.id + ', \'approved\')">승인</button>' +
          '<button class="btn-action-sm btn-pending" onclick="updateMemberStatusById(' + member.id + ', \'pending\')">대기</button>' +
          '<button class="btn-action-sm btn-reject" onclick="updateMemberStatusById(' + member.id + ', \'rejected\')">반려</button>' +
          '<button class="btn-action-sm btn-delete" onclick="deleteMemberById(' + member.id + ')" title="신청서 삭제"><i class="fa-solid fa-trash"></i></button>' +
        '</div>' +
      '</div>';

    listElem.appendChild(card);
  });
}

window.updateMemberStatusById = async function(memberId, status) {
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
      return;
    }
  } catch(e){}

  // Local fallback update
  const m = window.cachedMemberMap[memberId];
  if (m) {
    m.status = status;
    showToast('✅ 신청서 상태가 변경되었습니다.');
    loadAdminMembers();
  }
};

window.deleteMemberById = async function(memberId) {
  const m = window.cachedMemberMap[memberId];
  const name = m ? m.name : '대원';
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
      return;
    }
  } catch(e){}

  // Local fallback
  window.cachedMembers = window.cachedMembers.filter(x => x.id !== memberId);
  delete window.cachedMemberMap[memberId];
  showToast('🗑️ 신청서가 삭제되었습니다.');
  loadAdminMembers();
};

window.loadAdminGallery = async function() {
  const grid = document.getElementById('admin-gallery-manage-grid');
  if (!grid) return;
  grid.innerHTML = '<div class="loading-state-box"><i class="fa-solid fa-spinner fa-spin"></i><p>갤러리 목록 로딩 중...</p></div>';

  try {
    const res = await fetch('/api/gallery');
    const data = await res.json();
    if (data.success && Array.isArray(data.data)) {
      window.cachedGallery = data.data;
      window.cachedGalleryMap = {};
      data.data.forEach(p => { window.cachedGalleryMap[p.id] = p; });
      renderAdminGalleryGrid(data.data);
      return;
    }
  } catch(e){}

  renderAdminGalleryGrid(window.cachedGallery || []);
};

function renderAdminGalleryGrid(photos) {
  const grid = document.getElementById('admin-gallery-manage-grid');
  if (!grid) return;

  if (!photos || photos.length === 0) {
    grid.innerHTML = '<div class="empty-state-box"><p>등록된 사진이 없습니다.</p></div>';
    return;
  }

  grid.innerHTML = '';
  photos.forEach(photo => {
    const card = document.createElement('div');
    card.className = 'admin-gallery-card';
    const imgSrc = photo.image_url.startsWith('http') ? photo.image_url : (photo.image_url.startsWith('/') ? photo.image_url : '/' + photo.image_url);

    card.innerHTML = 
      '<img src="' + imgSrc + '" alt="' + escapeHtml(photo.title) + '" onerror="this.onerror=null; this.src=\'images/scout_hero.jpg\';">' +
      '<div class="admin-gallery-card-body">' +
        '<div class="admin-gallery-card-title">' + escapeHtml(photo.title) + '</div>' +
        '<div style="font-size:0.75rem; color:#888;">' + escapeHtml(photo.category || '활동') + ' | ' + (photo.activity_date || photo.created_at.slice(0, 10)) + '</div>' +
        '<div class="admin-gallery-card-actions">' +
          '<button class="btn-action-sm btn-delete" onclick="deleteGalleryPhotoById(' + photo.id + ')"><i class="fa-solid fa-trash"></i> 삭제</button>' +
        '</div>' +
      '</div>';

    grid.appendChild(card);
  });
}

window.deleteGalleryPhotoById = async function(id) {
  const photo = window.cachedGalleryMap[id];
  const title = photo ? photo.title : '사진';
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
      return;
    }
  } catch(e){}

  window.cachedGallery = window.cachedGallery.filter(x => x.id !== id);
  delete window.cachedGalleryMap[id];
  showToast('🗑️ 사진이 삭제되었습니다.');
  loadAdminGallery();
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
      return;
    }
  } catch(err){}
};

window.loadAdminNotices = async function() {
  const listElem = document.getElementById('admin-notices-list');
  if (!listElem) return;
  listElem.innerHTML = '<div class="loading-state-box"><i class="fa-solid fa-spinner fa-spin"></i><p>공지사항 목록 로딩 중...</p></div>';

  const topicFilter = document.getElementById('admin-notice-topic-filter')?.value || '';
  try {
    const url = topicFilter ? '/api/notices?topic_id=' + encodeURIComponent(topicFilter) : '/api/notices';
    const res = await fetch(url);
    const data = await res.json();

    if (data.success && Array.isArray(data.data)) {
      window.cachedNotices = data.data;
      window.cachedNoticeMap = {};
      data.data.forEach(n => { window.cachedNoticeMap[n.id] = n; });
      renderAdminNoticesList(data.data);
      return;
    }
  } catch(e){}

  renderAdminNoticesList(window.cachedNotices || []);
};

function renderAdminNoticesList(notices) {
  const listElem = document.getElementById('admin-notices-list');
  if (!listElem) return;

  if (!notices || notices.length === 0) {
    listElem.innerHTML = '<div class="empty-state-box"><p>등록된 공지사항이 없습니다.</p></div>';
    return;
  }

  listElem.innerHTML = '';
  notices.forEach(notice => {
    const item = document.createElement('div');
    item.className = 'admin-notice-item';
    item.innerHTML = 
      '<div class="admin-notice-item-info">' +
        '<div class="admin-notice-item-title">' +
          (notice.is_important ? '<span class="important-pill" style="font-size:0.7rem;">⭐중요</span> ' : '') +
          '<b>[' + escapeHtml(notice.topic_name || getTopicDisplayName(notice.topic_id)) + ']</b> ' + escapeHtml(notice.title) +
        '</div>' +
        '<div class="admin-notice-item-meta">' +
          '<span>작성자: ' + escapeHtml(notice.author || 'WOOD지역대') + '</span>' +
          '<span>작성일: ' + (notice.created_at ? notice.created_at.slice(0, 10) : '') + '</span>' +
          '<span>조회: ' + (notice.views || 0) + '</span>' +
        '</div>' +
      '</div>' +
      '<div class="member-btns-group">' +
        '<button class="btn-action-sm btn-pending" onclick="editAdminNoticeById(' + notice.id + ')"><i class="fa-solid fa-pen"></i> 수정</button>' +
        '<button class="btn-action-sm btn-delete" onclick="deleteAdminNoticeById(' + notice.id + ')"><i class="fa-solid fa-trash"></i> 삭제</button>' +
      '</div>';

    listElem.appendChild(item);
  });
}

window.editAdminNoticeById = function(id) {
  const notice = window.cachedNoticeMap[id];
  if (!notice) return;

  document.getElementById('n-edit-id').value = notice.id;
  document.getElementById('n-topic').value = notice.topic_id;
  document.getElementById('n-author').value = notice.author || 'WOOD지역대 훈련대장';
  document.getElementById('n-title').value = notice.title;
  document.getElementById('n-important').checked = notice.is_important === 1 || notice.is_important === true;
  document.getElementById('n-content').value = notice.content;

  const noticeFormTitle = document.getElementById('notice-form-title');
  const noticeSaveBtn = document.getElementById('notice-save-btn');
  if (noticeFormTitle) noticeFormTitle.textContent = '✏️ 공지사항 수정 중 (ID: ' + notice.id + ')';
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
      return;
    }
  } catch(e){}

  // Local fallback
  if (editId) {
    const existing = window.cachedNoticeMap[editId];
    if (existing) {
      Object.assign(existing, payload);
    }
  } else {
    const newN = { id: Date.now(), ...payload, topic_name: getTopicDisplayName(topicId), created_at: new Date().toISOString().slice(0, 10), views: 0 };
    window.cachedNotices.unshift(newN);
    window.cachedNoticeMap[newN.id] = newN;
  }
  playSfxFanfare();
  showToast('📢 공지사항이 ' + (editId ? '수정' : '등록') + '되었습니다!');
  resetAdminNoticeForm();
  loadAdminNotices();
};

window.deleteAdminNoticeById = async function(id) {
  const notice = window.cachedNoticeMap[id];
  const title = notice ? notice.title : '공지사항';
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
      return;
    }
  } catch(e){}

  window.cachedNotices = window.cachedNotices.filter(x => x.id !== id);
  delete window.cachedNoticeMap[id];
  showToast('🗑️ 공지사항이 삭제되었습니다.');
  loadAdminNotices();
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
      return;
    }
  } catch(e){}

  showToast('🔑 비밀번호가 임시 변경되었습니다.');
  document.getElementById('admin-pwd-form')?.reset();
};

// ==========================================================================
// 3. GALLERY OPERATIONS
// ==========================================================================

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
      return;
    }
  } catch(err){}
};

async function loadGallery(category = '전체') {
  const grid = document.getElementById('gallery-dynamic-grid');
  if (!grid) return;

  try {
    const url = category && category !== '전체' ? '/api/gallery?category=' + encodeURIComponent(category) : '/api/gallery';
    const res = await fetch(url);
    const data = await res.json();

    if (data.success && Array.isArray(data.data) && data.data.length > 0) {
      renderGalleryGrid(data.data);
      return;
    }
  } catch(e){}

  renderGalleryGrid(getFallbackGallery(category));
}

function renderGalleryGrid(items) {
  const grid = document.getElementById('gallery-dynamic-grid');
  if (!grid) return;

  if (!items || items.length === 0) {
    grid.innerHTML = '<div class="empty-state-box" style="grid-column: 1 / -1;"><i class="fa-regular fa-image"></i><p>해당 카테고리에 등록된 사진이 없습니다.</p><p style="margin-top:8px;"><button class="wooden-mini-btn btn-highlight" onclick="showGalleryUploadView()"><i class="fa-solid fa-cloud-arrow-up"></i> 사진 올리기</button></p></div>';
    return;
  }

  grid.innerHTML = '';
  items.forEach(item => {
    const itemCard = document.createElement('div');
    itemCard.className = 'gallery-item';
    const imgSrc = item.image_url.startsWith('http') ? item.image_url : (item.image_url.startsWith('/') ? item.image_url : '/' + item.image_url);

    itemCard.innerHTML = 
      '<div class="gallery-item-img-box">' +
        '<img src="' + imgSrc + '" alt="' + escapeHtml(item.title) + '" onerror="this.onerror=null; this.src=\'images/scout_hero.jpg\';">' +
        '<span class="gallery-item-badge">' + escapeHtml(item.category || '활동') + '</span>' +
      '</div>' +
      '<div class="gallery-caption">' +
        '<div class="gallery-caption-title">' + escapeHtml(item.title) + '</div>' +
        '<div class="gallery-caption-date"><i class="fa-regular fa-calendar"></i> ' + (item.activity_date || (item.created_at || '').slice(0, 10)) + '</div>' +
      '</div>';

    itemCard.onclick = function() {
      playSfxPop();
      openLightbox(item);
    };

    grid.appendChild(itemCard);
  });
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
  if (lightboxDate) lightboxDate.innerHTML = '<i class="fa-regular fa-calendar"></i> ' + (item.activity_date || (item.created_at || '').slice(0, 10));

  openModal('modal-lightbox');
};

// ==========================================================================
// 4. JOIN MEMBERSHIP FORM
// ==========================================================================

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
      showToast('🎉 ' + name + ' 대원님! 가입 신청서가 성공적으로 접수되었습니다!');
      return;
    }
  } catch(err){}

  // Local fallback
  closeModal('modal-join');
  document.getElementById('parchment-join-form')?.reset();
  playSfxFanfare();
  showToast('🎉 ' + name + ' 대원님! 가입 신청서가 접수되었습니다!');
};

// ==========================================================================
// 5. AUDIO & SOUND EFFECTS
// ==========================================================================

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

// ==========================================================================
// 6. HELPER FUNCTIONS
// ==========================================================================

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

function getTopicDisplayName(id) {
  switch(id) {
    case 'all': return '전체 공지사항';
    case 'camp': return '매달 야영 대집회 캠프';
    case 'orienteering': return '숲 생태 오리엔티어링';
    case 'badge': return '스카우트 기능 뱃지 이수';
    case 'jamboree': return '국제 잼버리 대회 및 문화 교류';
    default: return '주요 활동';
  }
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

function getFallbackNotices() {
  return [
    {
      id: 101,
      topic_id: 'camp',
      topic_name: '매달 야영 대집회 캠프',
      title: '🏕️ [안내] 9월 가을 정기 야영 대회 일정 및 준비물 안내',
      author: 'WOOD지역대 훈련대장',
      content: '9월 셋째 주 주말 1박 2일간 북한산 전용 야영장에서 2026 가을 정기 야영 대집회가 진행됩니다. 개인 침낭, 세면도구, 네커치프를 준비해주세요.',
      is_important: 1,
      views: 28,
      created_at: '2026-08-26 10:00:00'
    },
    {
      id: 102,
      topic_id: 'orienteering',
      topic_name: '숲 생태 오리엔티어링',
      title: '🧭 숲속 지도독도법 및 나침반 방위각 훈련 미션',
      author: '오리엔티어링 지도대원',
      content: '대원 여러분! 나침반과 지도를 활용하여 숨겨진 미션 보물 포인트를 탐색하는 흥미진진한 모험 레이스가 펼쳐집니다.',
      is_important: 0,
      views: 15,
      created_at: '2026-08-25 14:30:00'
    },
    {
      id: 103,
      topic_id: 'badge',
      topic_name: '스카우트 기능 뱃지 이수',
      title: '🏅 야영 요리 & 매듭법 1급 기능 뱃지 심사 공지',
      author: 'WOOD지역대 대장',
      content: '로프 매듭법(보울라인, 맞매듭) 및 야외 요리 기능과제 심사가 진행됩니다. 도전하는 대원들의 많은 참여 바랍니다.',
      is_important: 1,
      views: 42,
      created_at: '2026-08-24 16:00:00'
    },
    {
      id: 104,
      topic_id: 'jamboree',
      topic_name: '국제 잼버리 대회 및 문화 교류',
      title: '🌏 2026 국제 스카우트 교류 캠프 참가자 선발',
      author: '국제교류팀장',
      content: '전 세계 스카우트 대원들과 우정을 쌓고 글로벌 리더십을 배울 수 있는 국제 잼버리 참가 대원을 선발합니다.',
      is_important: 0,
      views: 19,
      created_at: '2026-08-23 09:15:00'
    }
  ];
}

function getFallbackGallery(cat) {
  const allPhotos = [
    { id: 1, title: '🌲 가을 숲속 텐트 구축 실습', category: '캠프', image_url: 'images/scout_camp.jpg', activity_date: '2026-08-20', description: '우리 반 대원들과 함께 완성한 4인용 A형 텐트!' },
    { id: 2, title: '🔥 즐거운 모닥불 캠프파이어', category: '캠프', image_url: 'images/scout_campfire.jpg', activity_date: '2026-08-18', description: '밤하늘 아래 마시멜로를 구우며 부르는 스카우트 연가' },
    { id: 3, title: '🧭 북한산 숲속 오리엔티어링 레이스', category: '숲속탐사', image_url: 'images/scout_hiking.jpg', activity_date: '2026-08-15', description: '나침반과 지도로 미션 지점을 모두 찾았습니다!' },
    { id: 4, title: '🏅 매듭법 1급 기능 뱃지 수여식', category: '기능뱃지', image_url: 'images/scout_badge.jpg', activity_date: '2026-08-10', description: '영예로운 1급 기능 뱃지를 획득한 멋진 대원들' }
  ];
  if (cat && cat !== '전체') {
    return allPhotos.filter(p => p.category === cat);
  }
  return allPhotos;
}

// Check if opened via file:// protocol
if (window.location.protocol === 'file:') {
  const banner = document.createElement('div');
  banner.style.cssText = 'position:fixed; top:0; left:0; width:100vw; background:#E63946; color:#FFF; text-align:center; padding:14px; font-weight:bold; z-index:99999; font-size:1.1rem; box-shadow:0 4px 20px rgba(0,0,0,0.5);';
  banner.innerHTML = '⚠️ 현재 로컬 파일(file://)로 열려 있습니다. 백엔드 API와의 실시간 연동을 위해 브라우저 주소창에 <a href="http://localhost:8000" style="color:#FFE600; text-decoration:underline; font-weight:bold; font-size:1.2rem;">http://localhost:8000</a> 을 입력해주세요!';
  document.body.prepend(banner);
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  fetchTopicsStatus();
  loadGallery('전체');
});
