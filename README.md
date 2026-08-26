# 🌲 한국스카우트 WOOD지역대 인터랙티브 웹 & 관리자 시스템

숲속 모험가들을 위한 한국스카우트 WOOD지역대 공식 풀스택 인터랙티브 웹사이트 및 실시간 관리자 대시보드 시스템입니다.

---

## 🚀 주요 기능

- **인터랙티브 일러스트 메인 뷰**: 삼각 텐트, 통나무 모닥불, 스카우트 배낭, 숲속 표지판, 다람쥐 마스코트 노드 클릭 인터랙션
- **주요 활동 안내 & 공지사항 게시판**:
  - 매달 야영 캠프 / 숲 생태 오리엔티어링 / 기능 뱃지 / 잼버리 주제별 탭 및 통합 공지사항
  - 3개씩 분할 표시되는 페이지네이션 및 실시간 제목/내용 검색 기능
- **신입 대원 & 지도자 온라인 가입 신청**
- **활동 갤러리 & 포토 라이트박스 뷰어**
- **자주 묻는 질문(FAQ) & 카카오톡 오픈채팅 연동**
- **관리자 대시보드 (보안 로그인)**:
  - 대원 신청 승인/반려/삭제
  - 공지사항 실시간 작성/수정/삭제
  - 활동 사진 업로드 및 갤러리 관리
  - 환경 설정 및 비밀번호 변경

---

## 🛠️ 기술 스택

- **Frontend**: HTML5, CSS3 (우드 모던 테마, 반응형 디자인), Vanilla JavaScript
- **Backend**: Node.js, Express.js
- **Database**: SQLite (Node.js 내장 `node:sqlite`)
- **Deployment**: Vercel (Serverless Functions) & GitHub

---

## 🌐 Vercel 배포 가이드 (Step-by-Step)

### 1단계: 깃허브(GitHub) 저장소에 업로드

#### 방법 A. GitHub CLI / Git 명령어 사용
```bash
# 1. git 저장소 초기화
git init

# 2. 파일 추가 및 첫 커밋
git add .
git commit -m "feat: 한국스카우트 WOOD지역대 웹사이트 초기 릴리즈"

# 3. GitHub에서 생성한 새 리포지토리 연결 (예: 사용자명/scout-wood)
git branch -M main
git remote add origin https://github.com/사용자아이디/scout-wood.git

# 4. 푸시
git push -u origin main
```

#### 방법 B. GitHub Desktop 또는 GitHub 웹페이지 직접 업로드
1. [GitHub.com](https://github.com)에 로그인 후 **`New Repository`** 생성 (이름: `scout-wood`, Public 설정)
2. 생성된 리포지토리 페이지에서 **`uploading an existing file`**을 클릭하고, 프로젝트 파일 전체를 드래그하여 업로드 후 Commit 합니다.

---

### 2단계: 버셀(Vercel) 배포

1. [Vercel](https://vercel.com)에 접속하여 GitHub 계정으로 로그인합니다.
2. **`Add New...`** ➔ **`Project`** 클릭
3. 방금 생성한 **`scout-wood`** GitHub 리포지토리를 찾아 **`Import`** 버튼을 클릭합니다.
4. 설정 화면:
   - **Framework Preset**: `Other` (자동 감지)
   - **Root Directory**: `./` (기본값)
   - **Build and Output Settings**: 기본값 유지 (vercel.json 자동 인식)
5. **`Deploy`** 버튼을 클릭합니다.
6. 1분 이내에 배포가 완료되며, 생성된 전용 도메인(`https://scout-wood-xxx.vercel.app`)으로 전 세계 어디서나 접속할 수 있습니다! 🎉

---

## 💻 로컬 개발 환경 실행 방법

```bash
# 패키지 설치
npm install

# 서버 실행 (포트 8000)
npm start
```
브라우저에서 `http://localhost:8000` 접속

---

## 🛡️ 관리자 기본 계정 정보
- **초기 비밀번호**: `wood1234`
- (대시보드 로그인 후 환경설정 탭에서 안전하게 변경 가능합니다.)
