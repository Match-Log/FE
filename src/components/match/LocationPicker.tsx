'use client';

import { useState } from 'react';
import { useKakaoLoader } from 'react-kakao-maps-sdk';
import { MapPin, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import PlaceMap from './PlaceMap';

export interface PlaceValue {
  location: string;
  locationAddress?: string;
  latitude?: number;
  longitude?: number;
  kakaoPlaceId?: string;
}

interface Props {
  value?: PlaceValue;
  onChange: (value: PlaceValue | undefined) => void;
  error?: string;
}

/**
 * 경기 장소 선택. 카카오 장소 검색으로 고르면 주소·좌표까지 채우고,
 * 검색에 없는 장소(학교 운동장 등)나 SDK 로딩 실패 시에는 이름만 직접 입력한다.
 */
export default function LocationPicker({ value, onChange, error }: Props) {
  const [loading, loadError] = useKakaoLoader({
    appkey: process.env.NEXT_PUBLIC_KAKAO_MAP_JS_KEY ?? '',
    libraries: ['services'],
  });
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState<kakao.maps.services.PlacesSearchResult>([]);
  const [searched, setSearched] = useState(false);

  const trimmed = keyword.trim();

  const search = () => {
    if (!trimmed || loading || loadError) return;
    new kakao.maps.services.Places().keywordSearch(trimmed, (data, status) => {
      setSearched(true);
      setResults(status === kakao.maps.services.Status.OK ? data : []);
    });
  };

  const reset = () => {
    setKeyword('');
    setResults([]);
    setSearched(false);
  };

  const selectPlace = (p: kakao.maps.services.PlacesSearchResultItem) => {
    onChange({
      location: p.place_name,
      locationAddress: p.road_address_name || p.address_name,
      latitude: Number(p.y), // y = 위도
      longitude: Number(p.x), // x = 경도
      kakaoPlaceId: p.id,
    });
    reset();
  };

  const selectManual = () => {
    if (trimmed.length < 2) return;
    onChange({ location: trimmed }); // 좌표 없이 이름만
    reset();
  };

  // 선택 완료 상태
  if (value) {
    const { latitude: lat, longitude: lng } = value;
    const hasCoords = lat != null && lng != null;
    return (
      <div className="rounded-xl border border-[#00F5FF]/20 bg-white/[0.03] overflow-hidden">
        <div className="flex items-start justify-between gap-3 px-4 py-4">
          <div className="flex items-start gap-3 min-w-0">
            <MapPin className="w-4 h-4 text-[#00F5FF] mt-0.5 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-black truncate">{value.location}</p>
              {value.locationAddress && (
                <p className="text-[11px] text-zinc-500 font-bold mt-1 truncate">
                  {value.locationAddress}
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => onChange(undefined)}
            aria-label="장소 다시 선택"
            className="p-1 -m-1 text-zinc-500 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        {hasCoords && !loadError && (
          <PlaceMap lat={lat} lng={lng} />
        )}
      </div>
    );
  }

  // 검색 상태
  return (
    <div className="space-y-2">
      <div className="relative">
        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 pointer-events-none" />
        <input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={(e) => {
            // 폼 안이라 Enter를 막지 않으면 경기 생성이 제출된다
            if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
              e.preventDefault();
              if (loadError) selectManual();
              else search();
            }
          }}
          placeholder={loadError ? '경기장 이름 직접 입력' : '경기장 이름으로 검색'}
          className={cn(
            'w-full bg-white/[0.03] border rounded-xl pl-11 pr-12 py-4 text-sm font-semibold placeholder-zinc-700 outline-none focus:border-[#00F5FF]/40 transition-colors',
            error ? 'border-red-500/50' : 'border-white/5'
          )}
        />
        {!loadError && (
          <button
            type="button"
            onClick={search}
            disabled={loading || !trimmed}
            aria-label="장소 검색"
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-zinc-400 hover:text-[#00F5FF] disabled:opacity-40 transition-colors"
          >
            <Search className="w-4 h-4" />
          </button>
        )}
      </div>

      {results.length > 0 && (
        <ul className="max-h-64 overflow-y-auto rounded-xl border border-white/5 divide-y divide-white/5">
          {results.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => selectPlace(p)}
                className="w-full text-left px-4 py-3 hover:bg-white/[0.04] transition-colors"
              >
                <p className="text-sm font-black">{p.place_name}</p>
                <p className="text-[11px] text-zinc-500 font-bold mt-0.5">
                  {p.road_address_name || p.address_name}
                </p>
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* 검색에 없는 장소 또는 SDK 로딩 실패 시 직접 입력 */}
      {(searched || loadError) && trimmed.length >= 2 && (
        <button
          type="button"
          onClick={selectManual}
          className="text-[11px] font-bold text-zinc-400 underline underline-offset-2"
        >
          {searched && results.length === 0 ? '검색 결과가 없어요. ' : ''}
          &lsquo;{trimmed}&rsquo;(으)로 직접 입력
        </button>
      )}
    </div>
  );
}
