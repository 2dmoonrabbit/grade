# Moon Bunny (GitHub Pages)

## 업로드 방법
1. 이 폴더 내용을 그대로 GitHub 리포지토리에 업로드합니다.
2. GitHub → Settings → Pages → Branch를 `main` / root로 설정하면 배포됩니다.

## 점수(평점) 구글 스프레드시트 연동
`script.js`에서 아래 값을 본인 시트에 맞게 바꿔주세요.

- `SHEET_ID`: 스프레드시트 URL의 `/d/<여기>/` 부분
- `SHEET_NAME`: 탭 이름 (예: Sheet1)
- `CELL_RANGE`: 점수가 들어있는 셀 (예: A1)

또한 시트는 브라우저에서 읽을 수 있게:
- 링크 공개(뷰어) + 웹에 게시(또는 게시) 설정이 필요합니다.
