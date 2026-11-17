'use client';

import { useKakaoLoader } from 'react-kakao-maps-sdk';
import { MapPin } from 'lucide-react';
import type { Match } from '@/types';
import PlaceMap from './PlaceMap';

/**
 * 경기 상세의 장소 지도. 좌표가 없는 경기(기존 경기·직접 입력)나 SDK 로딩 실패 시엔 장소 이름만 보여준다.
 */
export default function MatchLocationMap({ match }: { match: Match }) {
  const [loading, error] = useKakaoLoader({
    appkey: process.env.NEXT_PUBLIC_KAKAO_MAP_JS_KEY ?? '',
    libraries: ['services'], // LocationPicker와 옵션을 맞춰야 SDK가 한 번만 로드된다
  });
  const { latitude: lat, longitude: lng, location, kakaoPlaceId } = match;

  if (lat == null || lng == null || error) {
    return (
      <div className="h-32 flex flex-col items-center justify-center gap-2">
        <MapPin className="w-6 h-6 text-zinc-700" />
        <p className="text-[9px] font-black text-zinc-700 uppercase tracking-widest">{location}</p>
      </div>
    );
  }

  const name = encodeURIComponent(location || '경기장');
  const placeUrl = kakaoPlaceId
    ? `https://place.map.kakao.com/${kakaoPlaceId}`
    : `https://map.kakao.com/link/map/${name},${lat},${lng}`;
  const routeUrl = `https://map.kakao.com/link/to/${name},${lat},${lng}`;

  return (
    <div>
      {loading ? (
        <div className="h-40 bg-white/[0.02] animate-pulse" />
      ) : (
        <PlaceMap lat={lat} lng={lng} />
      )}
      <div className="grid grid-cols-2 divide-x divide-white/5 border-t border-white/5 text-center text-[11px] font-black">
        <a
          href={placeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="py-3 text-zinc-300 hover:text-white transition-colors"
        >
          카카오맵에서 보기
        </a>
        <a
          href={routeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="py-3 text-[#00F5FF] hover:opacity-80 transition-opacity"
        >
          길찾기
        </a>
      </div>
    </div>
  );
}
