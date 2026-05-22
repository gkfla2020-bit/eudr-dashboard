# EUDR Deforestation-Free Compliance Dashboard

EU Regulation 2023/1115 (EUDR) 기반 산림 파괴 판정 대시보드.  
실제 위성 이미지 비교 + Hansen Forest Loss + 인도네시아 팜유 컨세션 경계 분석.

## 실행

```bash
npm install
npm run dev
```

## 구성

```
src/
├── App.jsx          # 메인 앱 (지도, 슬라이더, 차트)
├── App.css          # 스타일
├── data.js          # 컨세션 데이터 + NDVI 시계열 + 경계 폴리곤
├── index.css        # 글로벌 스타일
└── main.jsx         # 진입점

public/tiles/        # 연도별 Sentinel-2 위성 이미지 (2018~2024)
```

## 데이터 소스

| 소스 | 용도 | 인증 |
|------|------|------|
| MODIS MOD13Q1 (ORNL DAAC) | NDVI 시계열 (250m, 16일주기) | 불필요 |
| Sentinel-2 Cloudless (EOX) | 연도별 위성 사진 비교 | 불필요 |
| Hansen/UMD/Google/USGS/NASA | 연도별 산림 손실 타일 | 불필요 |
| ArcGIS Indonesia Oil Palm Concessions | HGU 컨세션 경계 폴리곤 | 불필요 |
| Copernicus OData API | Sentinel-2 장면 카탈로그 | 불필요 |
| NASA CMR (GEDI L2A) | 수관 높이 granule 검색 | 불필요 |

## EUDR 판정 기준

**Regulation (EU) 2023/1115 Article 2**

- **Deforestation (Art.2§3)**: Forest → Agricultural use 전환 (이진 판단, % 임계값 없음)
- **Forest (Art.2§4, FAO 기준)**:
  - 면적 > 0.5 ha
  - 수고 > 5 m
  - 수관 피복도 > 10%
- **Cut-off date**: 2020.12.31 이후 전환만 규제 대상
- **Forest Degradation (Art.2§7)**: Primary/Natural forest → Plantation forest 전환

참조:
- EUR-Lex: http://data.europa.eu/eli/reg/2023/1115/oj
- EU Forest Observatory: https://forest-observatory.ec.europa.eu/forest/gfc2020
- Commission Guidance: https://green-forum.ec.europa.eu/publications/guidance-document-regulation-eu-20231115-deforestation-free-products_en

## 한계

- MODIS 250m 해상도는 소규모 컨세션 정밀 분석에 부족
- "산림→농업 전환" 확인에는 LULC 분류가 필요 (현재 NDVI만 사용)
- 경계 폴리곤은 특정 기업 매칭 아닌 공개 HGU 데이터
- 정밀 분석에는 Copernicus 계정 + Sentinel-2 10m 이미지 필요

## 정밀화 로드맵

1. Copernicus Data Space 계정 → Sentinel-2 10m 이미지 경계 내 크롭
2. EU Forest Observatory GFC 2020 (10m) → 2020 기준 산림 여부 확정
3. Hansen GeoTIFF 다운로드 → 경계 내 연도별 손실 픽셀 정확히 계산
4. LULC 분류 (Random Forest / U-Net) → "농업 전환" 여부 확인

## 기술 스택

- React + Vite
- react-leaflet (지도)
- recharts (차트)
- Esri World Imagery (위성 배경)
- Hansen Forest Loss Tiles (산림 손실 오버레이)
