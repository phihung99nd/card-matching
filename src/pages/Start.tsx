import { useNavigate } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../components/ui/select'

function Start() {
	const navigate = useNavigate()
	const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | 'hell'>('easy')
	const [imageSet, setImageSet] = useState<string>('emoji')

	const themesMap = useMemo(() => {
		const files = import.meta.glob('/src/assets/Illustration/**/*.{png,jpg,jpeg,webp,svg}', {
			eager: true,
			query: '?url',
			import: 'default',
		}) as Record<string, string>
		const map: Record<string, { back?: string; cards: string[] }> = {}
		for (const fullPath in files) {
			const url = files[fullPath]
			const parts = fullPath.split('/')
			const idx = parts.indexOf('Illustration')
			if (idx === -1 || idx + 1 >= parts.length) continue
			const themeName = parts[idx + 1]
			const fileName = parts[parts.length - 1]
			if (!map[themeName]) map[themeName] = { cards: [] }
			if (/^back\.(png|jpg|jpeg|webp|svg)$/i.test(fileName)) {
				map[themeName].back = url
			} else {
				map[themeName].cards.push(url)
			}
		}
		return map
	}, [])

	const themeNames = useMemo<string[]>(() => Object.keys(themesMap).sort(), [themesMap])

	function handleStart() {
		navigate('/game', { state: { difficulty, imageSet } })
	}

	return (
		<div className="mx-auto max-w-2xl">
			<div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 sm:p-8 ring-1 ring-white/50">
				<h1 className="text-3xl font-bold">Card Match</h1>
				<p className="opacity-90 mt-1">Train your memory. Match all pairs before time runs out.</p>

				<div className="grid md:grid-cols-2 gap-6 mt-6">
					<div className="space-y-4">
						<label className="block">
							<span className="text-sm opacity-90">Difficulty</span>
							<div className="mt-1">
								<Select value={difficulty} onValueChange={(v) => setDifficulty(v as 'easy' | 'medium' | 'hard' | 'hell')}>
									<SelectTrigger>
										<SelectValue placeholder="Select difficulty" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="easy">Easy (6 pairs)</SelectItem>
										<SelectItem value="medium">Medium (9 pairs)</SelectItem>
										<SelectItem value="hard">Hard (12 pairs)</SelectItem>
										<SelectItem value="hell">Hell (14 pairs)</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</label>

						<label className="block">
							<span className="text-sm opacity-90">Image set</span>
							<div className="mt-1">
								<Select value={imageSet} onValueChange={setImageSet}>
									<SelectTrigger>
										<SelectValue placeholder="Select image set" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="emoji">Emoji</SelectItem>
										{themeNames.map((name) => (
											<SelectItem key={name} value={name}>{name}</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</label>
					</div>

					<div className="block">
						<span className="text-sm opacity-90">Preview</span>
						<div className="mt-1 flex items-center justify-center rounded-xl ring-1 ring-white/50 bg-white/5" style={{ height: 160 }}>
							{imageSet === 'emoji' ? (
								<span className="text-5xl">😀</span>
							) : themesMap[imageSet]?.cards?.[0] ? (
								<img src={themesMap[imageSet].cards[0]} alt="preview" className="max-h-32 w-auto object-contain" />
							) : (
								<span className="text-sm opacity-70">No preview</span>
							)}
						</div>
					</div>
				</div>

				<button
					onClick={handleStart}
					className="mt-6 inline-flex items-center justify-center rounded-xl bg-white text-slate-700 font-semibold px-5 py-3 shadow-lg shadow-black/10 hover:opacity-90 transition"
				>
					Start Game
				</button>
			</div>
		</div>
	)
}

export default Start


