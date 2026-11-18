# 계산기 허브 (life-calc-hub)

생활 계산기 12종 + 업무 도구 5종 = **17개 도구**를 담은 정적 사이트입니다.
빌드 과정이 없고, HTML·CSS·JavaScript만으로 동작합니다.

- 라이브: https://yoon0819.github.io/life-calc-hub/
- 저장소: https://github.com/yoon0819/life-calc-hub
- 호스팅: GitHub Pages (`main` 브랜치 루트)

## 구조

```
.
├── index.html                 # 허브 (검색·카테고리 필터)
├── about.html                 # 사이트 소개
├── privacy.html               # 개인정보처리방침 (쿠키·AdSense 안내 포함)
├── sitemap.xml                # 20개 URL
├── robots.txt
├── ads.txt                    # AdSense 승인 후 pub ID 교체 필요
├── assets/
│   ├── css/style.css          # 공용 스타일 (모바일 우선)
│   ├── js/common.js           # 공용 유틸 (복사·공유·날짜·숫자 포맷)
│   ├── js/vendor/qrcode.js    # QR 생성 라이브러리 (MIT, Kazuhiko Arase)
│   └── favicon.svg
├── tools/                     # 도구 17개
│   ├── part-time-pay.html     # 알바 주휴수당·주급·월급
│   ├── severance-pay.html     # 퇴직금
│   ├── salary-net.html        # 연봉 실수령액
│   ├── vat.html               # 부가세
│   ├── dday.html              # 디데이
│   ├── military-discharge.html# 군 전역일·복무율
│   ├── due-date.html          # 출산예정일·임신 주수
│   ├── age.html               # 만 나이·띠·별자리
│   ├── savings-interest.html  # 예금·적금 이자
│   ├── loan-interest.html     # 대출 이자·상환 스케줄
│   ├── pyeong.html            # 평수·㎡ 변환
│   ├── bmi.html               # BMI·BMR·TDEE
│   ├── char-counter.html      # 글자수·바이트 세기
│   ├── lotto.html             # 로또 번호·당첨금 세후
│   ├── menu-roulette.html     # 메뉴 룰렛
│   ├── qr-generator.html      # QR코드 생성·PNG 저장
│   └── symbols.html           # 특수문자·이모지 복사
└── previews/                  # 모바일 스크린샷 (저장소에는 올리지 않음)
```

## 로컬에서 보기

```bash
cd projects/calc-hub
python3 -m http.server 8765
# http://localhost:8765/
```

## 도메인을 바꿀 때

아래 파일에서 `https://yoon0819.github.io/life-calc-hub` 를 새 주소로 모두 바꿉니다.

- 모든 HTML의 `<link rel="canonical">`, `og:url`
- `sitemap.xml`, `robots.txt`

```bash
grep -rl "yoon0819.github.io/life-calc-hub" . | xargs sed -i 's#https://yoon0819.github.io/life-calc-hub#https://새도메인#g'
```

## AdSense 준비

1. `ads.txt` 의 `pub-XXXXXXXXXXXXXXXX` 을 실제 게시자 ID로 교체합니다.
2. 각 HTML 상단의 주석 처리된 AdSense 로더를 해제하고 같은 ID를 넣습니다.
3. `<div class="ad-slot">` 안에 광고 단위 `<ins class="adsbygoogle" ...>` 코드를 넣습니다.
4. Search Console·AdSense에 사이트를 등록하고 `sitemap.xml` 을 제출합니다.
5. 승인 전에는 `ads.txt` 를 임시로 비워 두어도 됩니다.

## 계산 로직 기준

- 4대보험(2026): 국민연금 9.5%(근로자 4.75%), 건강보험 7.19%(3.595%), 장기요양 0.9448%(건강보험료의 13.14%, 근로자 0.4724%), 고용보험 1.8%(0.9%)
- 최저임금(2026): 시간급 10,320원, 월 환산 2,156,880원(209시간)
- 주휴수당: (주 소정근로시간 ÷ 40) × 8 × 시급, 주 15시간 이상
- 퇴직금: 1일 평균임금 × 30 × 재직일수 ÷ 365
- 평: 1평 = 400/121㎡ = 3.305785㎡
- 부가세: 10%, 합계금액 ÷ 1.1 = 공급가액
- 로또 세금: 3억 이하 22%, 3억 초과분 33%

모든 결과는 참고용 추정치이며, 실제 금액은 관련 기관·고용주·금융기관의 계산과 다를 수 있습니다.
