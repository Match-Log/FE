'use client';

import { useCallback, useState } from 'react';
// 내장 Map을 가리지 않도록 이름을 바꿔서 쓴다
import { Map as KakaoMap, MapMarker } from 'react-kakao-maps-sdk';
import { Plus, Minus, LocateFixed } from 'lucide-react';

const DEFAULT_LEVEL = 3;
const MIN_LEVEL = 1; // 가장 확대
const MAX_LEVEL = 10; // 경기장 위치 확인용이라 너무 멀리는 안 뺀다

interface Props {
  lat: number;
  lng: number;
  height?: number;
}

/**
 * 마커 하나짜리 지도. 드래그·핀치 줌과 +/- 버튼으로 확대·축소, 원위치 버튼으로 마커로 돌아온다.
 * 카카오 기본 ZoomControl은 슬라이더까지 있어서 작은 지도엔 커서 버튼을 직접 만든다.
 * SDK 로딩(useKakaoLoader)은 이 컴포넌트를 쓰는 쪽에서 한다.
 */
export default function PlaceMap({ lat, lng, height = 160 }: Props) {
  const [map, setMap] = useState<kakao.maps.Map | null>(null);
  const [level, setLevel] = useState(DEFAULT_LEVEL);

  // react-kakao-maps-sdk(1.2.x)의 Map은 minLevel/maxLevel prop을 서로 뒤바꿔 적용하는 버그가 있어
  // (setMinLevel(maxLevel), setMaxLevel(minLevel)) prop으로 넘기지 않고 생성 시점에 직접 설정한다.
  const handleCreate = useCallback((created: kakao.maps.Map) => {
    created.setMinLevel(MIN_LEVEL);
    created.setMaxLevel(MAX_LEVEL);
    setMap(created);
  }, []);

  const zoom = (delta: number) => {
    if (!map) return;
    const next = Math.min(MAX_LEVEL, Math.max(MIN_LEVEL, map.getLevel() + delta));
    map.setLevel(next, { animate: true });
  };

  const recenter = () => {
    if (!map) return;
    map.setLevel(DEFAULT_LEVEL);
    map.panTo(new kakao.maps.LatLng(lat, lng));
  };

  const buttonClass =
    'w-8 h-8 flex items-center justify-center bg-[#111218]/90 border border-white/10 text-zinc-300 hover:text-[#00F5FF] disabled:opacity-40 disabled:hover:text-zinc-300 transition-colors';

  return (
    <div className="relative">
      <KakaoMap
        center={{ lat, lng }}
        level={DEFAULT_LEVEL}
        onCreate={handleCreate}
        onZoomChanged={(m) => setLevel(m.getLevel())}
        style={{ width: '100%', height }}
      >
        <MapMarker position={{ lat, lng }} />
      </KakaoMap>

      <div className="absolute right-2 top-2 z-10 flex flex-col rounded-lg overflow-hidden shadow-lg">
        <button
          type="button"
          onClick={() => zoom(-1)}
          disabled={level <= MIN_LEVEL}
          aria-label="지도 확대"
          className={buttonClass}
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => zoom(1)}
          disabled={level >= MAX_LEVEL}
          aria-label="지도 축소"
          className={`${buttonClass} border-t-0`}
        >
          <Minus className="w-4 h-4" />
        </button>
      </div>
      <button
        type="button"
        onClick={recenter}
        aria-label="경기장 위치로 돌아가기"
        className={`${buttonClass} absolute right-2 bottom-2 z-10 rounded-lg shadow-lg`}
      >
        <LocateFixed className="w-4 h-4" />
      </button>
    </div>
  );
}
