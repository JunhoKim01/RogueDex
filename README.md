# RogueDex

포케로그 플레이를 돕는 React 웹 앱입니다.

## 주요 기능

- 포켓몬 검색 및 진화 정보 조회
- 파티 구성과 타입 상성 분석
- 융합 타입 상성 계산
- 아이템 가이드와 바이옴 경로 탐색

## 실행

Node.js 버전은 `.nvmrc`를 기준으로 합니다.

```sh
npm ci
npm run dev
```

## 빌드

```sh
npm run build
npm run preview
```

빌드 시 TypeScript 타입 검사를 수행하고, 배포 파일을 `dist/`에 생성합니다.
타입 검사만 실행하려면 `npm run typecheck`를 사용합니다.

## GitHub Pages 배포

저장소의 **Settings → Pages → Source**를 **GitHub Actions**로 설정한 뒤,
**Actions → Deploy to GitHub Pages → Run workflow**를 실행합니다.

Pages용 빌드는 `npm run build:pages`이며, 기본 경로는 `/RogueDex/`입니다.
저장소 이름을 변경하면 해당 경로도 수정해야 합니다.

## 데이터

포켓몬 정보와 이미지는 [PokeAPI](https://pokeapi.co/) 및 공개 리소스를 사용합니다.
데이터 조회에는 인터넷 연결이 필요합니다. 게임 가이드와 추천 결과는 참고용이며,
실제 게임의 최신 데이터와 차이가 있을 수 있습니다.
