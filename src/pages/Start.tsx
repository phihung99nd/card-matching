import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

function Start() {
	const navigate = useNavigate()
	const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy')
	const [cardBack, setCardBack] = useState<string>('violet')
	const [imageSet, setImageSet] = useState<string>('emoji')

	function handleStart() {
		navigate('/game', { state: { difficulty, cardBack, imageSet } })
	}

	return (
		<div className="mx-auto max-w-2xl">
			<div className="bg-white/10 backdrop-blur rounded-2xl p-6 sm:p-8 ring-1 ring-white/20">
				<h1 className="text-3xl font-bold">Card Match</h1>
				<p className="opacity-90 mt-1">Train your memory. Match all pairs before time runs out.</p>

				<div className="grid sm:grid-cols-2 gap-4 mt-6">
					<label className="block">
						<span className="text-sm opacity-90">Difficulty</span>
						<select
							value={difficulty}
							onChange={(e) => setDifficulty(e.target.value as any)}
							className="mt-1 w-full rounded-xl bg-white/20 text-white px-3 py-2 outline-none ring-1 ring-white/30 focus:ring-2 focus:ring-white/70"
						>
							<option value="easy">Easy (4x3)</option>
							<option value="medium">Medium (5x4)</option>
							<option value="hard">Hard (6x5)</option>
						</select>
					</label>

					<label className="block">
						<span className="text-sm opacity-90">Card back</span>
						<select
							value={cardBack}
							onChange={(e) => setCardBack(e.target.value)}
							className="mt-1 w-full rounded-xl bg-white/20 text-white px-3 py-2 outline-none ring-1 ring-white/30 focus:ring-2 focus:ring-white/70"
						>
							<option value="violet">Violet</option>
							<option value="cyan">Cyan</option>
							<option value="rose">Rose</option>
						</select>
					</label>

					<label className="block sm:col-span-2">
						<span className="text-sm opacity-90">Image set</span>
						<select
							value={imageSet}
							onChange={(e) => setImageSet(e.target.value)}
							className="mt-1 w-full rounded-xl bg-white/20 text-white px-3 py-2 outline-none ring-1 ring-white/30 focus:ring-2 focus:ring-white/70"
						>
							<option value="emoji">Emoji</option>
							<option value="animals">Animals</option>
							<option value="fruits">Fruits</option>
						</select>
					</label>
				</div>

				<button
					onClick={handleStart}
					className="mt-6 inline-flex items-center justify-center rounded-xl bg-white text-indigo-700 font-semibold px-5 py-3 shadow-lg shadow-black/10 hover:opacity-90 transition"
				>
					Start Game
				</button>
			</div>
		</div>
	)
}

export default Start


