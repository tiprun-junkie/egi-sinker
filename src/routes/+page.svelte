<script lang="ts">
	import { tiprunData, getStatusClass, getAnnotationText } from '$lib/data';
	import type { Egi, Sinker } from '$lib/data';

	let selectedEgiId: number | null = null;
	let selectedSinkerId: number | null = null;

	let activeTab: 'egi' | 'sinker' | 'check' = 'egi';

	// 選択されたエギIDに基づいて、対応するエギオブジェクトを検索します。
	$: selectedEgi =
		selectedEgiId !== null ? $tiprunData.egis.find((egi) => egi.id === selectedEgiId) : undefined;

	// 選択されたシンカーIDに基づいて、互換性のあるエギのリストをフィルタリングします。
	$: compatibleEgis =
		selectedSinkerId !== null
			? $tiprunData.egis.filter((egi) => egi.compatibility[selectedSinkerId!]?.status === 'OK')
			: [];

	// 適合確認用のステータス
	$: checkStatus =
		selectedEgiId !== null && selectedSinkerId !== null
			? selectedEgi?.compatibility[selectedSinkerId]?.status
			: undefined;

	// 適合確認用のシンカーオブジェクト
	$: checkSinker =
		selectedSinkerId !== null
			? $tiprunData.sinkers.find((s) => s.id === selectedSinkerId)
			: undefined;

	/**
	 * 重量の文字列 (e.g., "21g") から 'g' を取り除き、数値に変換します。
	 * @param weightString - 重量の文字列
	 */
	function parseWeight(weightString: string): number {
		if (!weightString) return 0;
		return parseInt(weightString, 10);
	}
</script>

<div class="bg-gray-50 min-h-screen font-sans text-gray-800">
	<header class="bg-white shadow-sm">
		<div class="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
			<h1 class="text-2xl sm:text-3xl font-bold text-gray-900">エギ・シンカー適合表</h1>
		</div>
	</header>

	{#if $tiprunData.loading}
		<p class="text-center py-20">データを読み込んでいます...</p>
	{:else if $tiprunData.error}
		<p class="text-center py-20 text-red-500">エラー: {$tiprunData.error.message}</p>
	{:else}
		<main class="container mx-auto p-4 sm:p-6 lg:p-8">
			<!-- タブナビゲーション -->
			<div class="mb-4 border-b border-gray-200">
				<nav class="-mb-px flex space-x-6" aria-label="Tabs">
					<button
						on:click={() => (activeTab = 'egi')}
						class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
						class:border-indigo-500={activeTab === 'egi'}
						class:text-indigo-600={activeTab === 'egi'}
						class:border-transparent={activeTab !== 'egi'}
						class:text-gray-500={activeTab !== 'egi'}
						class:hover:text-gray-700={activeTab !== 'egi'}
						class:hover:border-gray-300={activeTab !== 'egi'}
					>
						エギから検索
					</button>
					<button
						on:click={() => (activeTab = 'sinker')}
						class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
						class:border-indigo-500={activeTab === 'sinker'}
						class:text-indigo-600={activeTab === 'sinker'}
						class:border-transparent={activeTab !== 'sinker'}
						class:text-gray-500={activeTab !== 'sinker'}
						class:hover:text-gray-700={activeTab !== 'sinker'}
						class:hover:border-gray-300={activeTab !== 'sinker'}
					>
						シンカーから検索
					</button>
					<button
						on:click={() => (activeTab = 'check')}
						class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
						class:border-indigo-500={activeTab === 'check'}
						class:text-indigo-600={activeTab === 'check'}
						class:border-transparent={activeTab !== 'check'}
						class:text-gray-500={activeTab !== 'check'}
						class:hover:text-gray-700={activeTab !== 'check'}
						class:hover:border-gray-300={activeTab !== 'check'}
					>
						適合確認
					</button>
				</nav>
			</div>

			<!-- タブコンテンツ -->
			{#if activeTab === 'egi'}
				<div class="bg-white p-4 sm:p-6 rounded-lg shadow-md">
					<select
						bind:value={selectedEgiId}
						class="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 mb-6"
					>
						<option value={null}>エギを選択してください</option>
						{#each $tiprunData.egis as egi (egi.id)}
							<option value={egi.id}>
								{egi.maker}
								{egi.name} ({egi.weight})
							</option>
						{/each}
					</select>

					{#if selectedEgi}
						<div class="mb-6 p-3 bg-gray-100 rounded-md border border-gray-200 -mt-2">
							<p class="text-sm text-gray-600">選択中のエギ:</p>
							<p class="font-semibold text-gray-800 break-words">
								<span class="block sm:inline text-xs sm:text-base text-gray-500 sm:text-gray-800"
									>{selectedEgi.maker}</span
								>
								{selectedEgi.name} ({selectedEgi.weight})
							</p>
						</div>
					{/if}

					{#if selectedEgi}
						<h3 class="text-lg font-semibold mb-3 text-gray-800">適合するシンカー</h3>
						<ul class="space-y-4">
							{#each selectedEgi.compatibility.filter((c) => c.status === 'OK') as comp (comp.sinkerId)}
								{@const sinker = $tiprunData.sinkers[comp.sinkerId]}
								{#if sinker}
									{@const totalWeight =
										parseWeight(selectedEgi.weight) + parseWeight(sinker.weight)}
									{@const annotation = getAnnotationText(comp.status)}
									<li class="bg-white rounded-lg shadow p-4">
										<div class="flex justify-between items-start mb-2">
											<p class="font-semibold text-gray-800 flex-grow">
												<span
													class="block sm:inline text-xs sm:text-base text-gray-500 sm:text-gray-800"
													>{sinker.maker}</span
												>
												<span class="block sm:inline sm:ml-1">{sinker.name} ({sinker.weight})</span>
											</p>
											<p class="text-sm text-gray-500 text-right ml-2 flex-shrink-0">
												合計: <span class="text-lg font-bold text-gray-900">{totalWeight}g</span>
											</p>
										</div>
									</li>
								{/if}
							{/each}
						</ul>
					{/if}
				</div>
			{/if}

			{#if activeTab === 'sinker'}
				<div class="bg-white p-4 sm:p-6 rounded-lg shadow-md">
					<select
						bind:value={selectedSinkerId}
						class="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 mb-6"
					>
						<option value={null}>シンカーを選択してください</option>
						{#each $tiprunData.sinkers as sinker (sinker.id)}
							<option value={sinker.id}>
								{sinker.maker}
								{sinker.name} ({sinker.weight})
							</option>
						{/each}
					</select>

					{#if checkSinker}
						<div class="mb-6 p-3 bg-gray-100 rounded-md border border-gray-200 -mt-2">
							<p class="text-sm text-gray-600">選択中のシンカー:</p>
							<p class="font-semibold text-gray-800 break-words">
								<span class="block sm:inline text-xs sm:text-base text-gray-500 sm:text-gray-800"
									>{checkSinker.maker}</span
								>
								{checkSinker.name} ({checkSinker.weight})
							</p>
						</div>
					{/if}

					{#if compatibleEgis.length > 0}
						<h3 class="text-lg font-semibold mb-3 text-gray-800">適合するエギ</h3>
						<ul class="space-y-4">
							{#each compatibleEgis as egi (egi.id)}
								{@const status =
									selectedSinkerId !== null
										? egi.compatibility[selectedSinkerId]?.status
										: undefined}
								{#if checkSinker && status}
									{@const totalWeight = parseWeight(egi.weight) + parseWeight(checkSinker.weight)}
									{@const annotation = getAnnotationText(status)}
									<li class="bg-white rounded-lg shadow p-4">
										<div class="flex justify-between items-start mb-2">
											<p class="font-semibold text-gray-800 flex-grow">
												<span
													class="block sm:inline text-xs sm:text-base text-gray-500 sm:text-gray-800"
													>{egi.maker}</span
												>
												<span class="block sm:inline sm:ml-1">{egi.name} ({egi.weight})</span>
											</p>
											<p class="text-sm text-gray-500 text-right ml-2 flex-shrink-0">
												合計: <span class="text-lg font-bold text-gray-900">{totalWeight}g</span>
											</p>
										</div>
									</li>
								{/if}
							{/each}
						</ul>
					{/if}
				</div>
			{/if}

			{#if activeTab === 'check'}
				<div class="bg-white p-4 sm:p-6 rounded-lg shadow-md">
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
						<div>
							<label for="egi-check" class="block text-sm font-medium text-gray-700">エギ</label>
							<select
								id="egi-check"
								bind:value={selectedEgiId}
								class="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
							>
								<option value={null}>エギを選択</option>
								{#each $tiprunData.egis as egi (egi.id)}
									<option value={egi.id}>{egi.maker} {egi.name} ({egi.weight})</option>
								{/each}
							</select>
						</div>
						<div>
							<label for="sinker-check" class="block text-sm font-medium text-gray-700"
								>シンカー</label
							>
							<select
								id="sinker-check"
								bind:value={selectedSinkerId}
								class="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
							>
								<option value={null}>シンカーを選択</option>
								{#each $tiprunData.sinkers as sinker (sinker.id)}
									<option value={sinker.id}>{sinker.maker} {sinker.name} ({sinker.weight})</option>
								{/each}
							</select>
						</div>
					</div>

					{#if selectedEgi || checkSinker}
						<div class="mt-4 space-y-2">
							{#if selectedEgi}
								<div class="p-3 bg-gray-100 rounded-md border border-gray-200">
									<p class="text-sm text-gray-600">選択中エギ:</p>
									<p class="font-semibold text-gray-800 break-words">
										<span
											class="block sm:inline text-xs sm:text-base text-gray-500 sm:text-gray-800"
											>{selectedEgi.maker}</span
										>
										{selectedEgi.name} ({selectedEgi.weight})
									</p>
								</div>
							{/if}
							{#if checkSinker}
								<div class="p-3 bg-gray-100 rounded-md border border-gray-200">
									<p class="text-sm text-gray-600">選択中シンカー:</p>
									<p class="font-semibold text-gray-800 break-words">
										<span
											class="block sm:inline text-xs sm:text-base text-gray-500 sm:text-gray-800"
											>{checkSinker.maker}</span
										>
										{checkSinker.name} ({checkSinker.weight})
									</p>
								</div>
							{/if}
						</div>
					{/if}

					{#if selectedEgi && checkSinker && checkStatus}
						{@const annotation = getAnnotationText(checkStatus)}
						{@const totalWeight = parseWeight(selectedEgi.weight) + parseWeight(checkSinker.weight)}
						<div class="mt-8 text-center bg-gray-50 p-6 rounded-lg border border-gray-200">
							<h3 class="text-xl font-bold text-gray-800">適合結果</h3>
							<p class="text-4xl font-bold my-3 {getStatusClass(checkStatus)} p-4 rounded-lg">
								{#if checkStatus === 'OK'}
									<!-- Check Circle Icon (OK) -->
									<svg
										xmlns="http://www.w3.org/2000/svg"
										class="h-16 w-16 inline-block"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
										stroke-width="2"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
										/>
									</svg>
								{:else if checkStatus.startsWith('OK')}
									<!-- Exclamation Triangle Icon (Conditional OK) -->
									<svg
										xmlns="http://www.w3.org/2000/svg"
										class="h-16 w-16 inline-block"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
										stroke-width="2"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
										/>
									</svg>
								{:else if checkStatus === 'NG'}
									<!-- X Circle Icon (NG) -->
									<svg
										xmlns="http://www.w3.org/2000/svg"
										class="h-16 w-16 inline-block"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
										stroke-width="2"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
										/>
									</svg>
								{:else}
									<!-- Question Mark Circle Icon (Unknown) -->
									<svg
										xmlns="http://www.w3.org/2000/svg"
										class="h-16 w-16 inline-block"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
										stroke-width="2"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
										/>
									</svg>
								{/if}
							</p>
							{#if checkStatus.startsWith('OK')}
								<p class="text-lg text-gray-600 mt-4">
									合計重量: <span class="font-bold">{totalWeight}g</span>
								</p>
							{/if}
						</div>
					{/if}
				</div>
			{/if}
		</main>
	{/if}
</div>
