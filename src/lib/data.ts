import { readable, type Readable } from 'svelte/store';

// 型定義
export interface Sinker {
    id: number;
    maker: string;
    name: string;
    weight: string;
}

export interface Compatibility {
    sinkerId: number;
    status: string;
}

export interface Egi {
    id: number;
    maker: string;
    name: string;
    weight: string;
    compatibility: Compatibility[];
}

interface TiprunData {
    egis: Egi[];
    sinkers: Sinker[];
    loading: boolean;
    error: Error | null;
}

/**
 * CSVデータをフェッチしてパースし、扱いやすいデータ構造に変換します。
 */
export const tiprunData: Readable<TiprunData> = readable<TiprunData>(
    { egis: [], sinkers: [], loading: true, error: null },
    (set) => {
        async function load() {
            try {
                const response = await fetch('./data.csv');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const csvText = await response.text();
                const lines = csvText.split('\n').map((line) => line.trim());

                // ヘッダー行をパース
                const sinkerMakers = lines[0].split(',').slice(3);
                const sinkerNames = lines[1].split(',').slice(3);
                const sinkerWeights = lines[2].split(',').slice(3);

                const sinkers: Sinker[] = sinkerMakers.map((maker, i) => ({
                    id: i,
                    maker: maker,
                    name: sinkerNames[i],
                    weight: sinkerWeights[i]
                }));

                // データ行をパース
                const egis: Egi[] = lines
                    .slice(3)
                    .filter((line) => line.split(',').length > 3)
                    .map((line, index) => {
                        const columns = line.split(',');
                        const egiMaker = columns[0];
                        const egiName = columns[1];
                        const egiWeight = columns[2];
                        const compatibility: Compatibility[] = columns.slice(3).map((value, sinkerIndex) => ({
                            sinkerId: sinkerIndex,
                            status: value.trim() || 'N/A' // 空白の場合は 'N/A' とする
                        }));

                        return {
                            id: index,
                            maker: egiMaker,
                            name: egiName,
                            weight: egiWeight,
                            compatibility
                        };
                    });

                set({ egis, sinkers, loading: false, error: null });
            } catch (e) {
                console.error('Failed to load or parse CSV data:', e);
                set({ egis: [], sinkers: [], loading: false, error: e as Error });
            }
        }

        load();
    }
);

const annotations: Map<string, string> = new Map([
    ['*1', 'エギ-シンカー間のクリアランスが大きい'],
    ['*2', 'シンカーからエギのアイが少ししか出ないため、細目のスナップの使用が必要'],
    ['*3', 'エギ-シンカー間のクリアランスが大きい。装着にやや難あり'],
    ['*4', '対象重量での確認はしていないが、形状や他重量シンカーの確認結果からNGと推定'],
    ['*5', '対象重量での確認はしていないが、形状や他重量シンカーの確認結果からOKと推定'],
    ['*6', '結束バンド2個使用で固定可']
]);

/**
 * 適合ステータスから注釈テキストを抽出します。
 * @param status - 適合ステータス文字列 (例: "OK*1")
 * @returns 注釈テキスト、またはundefined
 */
export function getAnnotationText(status: string): string | undefined {
    if (!status) return undefined;
    const match = status.match(/\*\d+/);
    if (match && match[0]) {
        return annotations.get(match[0]);
    }
    return undefined;
}

/**
 * 適合ステータスに応じてスタイルを返します。
 * @param status
 * @returns
 */
export function getStatusClass(status: string): string {
    if (status.startsWith('OK') && status.includes('*')) {
        return 'bg-blue-200 text-blue-800'; // 注釈付きOK
    }
    if (status.startsWith('OK')) {
        return 'bg-green-200 text-green-800';
    }
    if (status.startsWith('NG')) {
        return 'bg-red-200 text-red-800';
    }
    if (status === '？') {
        return 'bg-yellow-200 text-yellow-800';
    }
    return 'bg-gray-200 text-gray-800';
}