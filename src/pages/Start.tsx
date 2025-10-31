import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../components/ui/select'

function Start() {
	const navigate = useNavigate()
	const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | 'hell'>('easy')
	const [cardBack, setCardBack] = useState<string>('violet')
	const [imageSet, setImageSet] = useState<string>('emoji')

	function handleStart() {
		navigate('/game', { state: { difficulty, cardBack, imageSet } })
	}

	return (
		<div className="mx-auto max-w-2xl">
			<div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 sm:p-8 ring-1 ring-white/50">
				<h1 className="text-3xl font-bold">Card Match</h1>
				<p className="opacity-90 mt-1">Train your memory. Match all pairs before time runs out.</p>

				<div className="grid sm:grid-cols-2 gap-4 mt-6">
					<label className="block">
						<span className="text-sm opacity-90">Difficulty</span>
					<div className="mt-1">
						<Select value={difficulty} onValueChange={(v) => setDifficulty(v as any)}>
							<SelectTrigger>
								<SelectValue placeholder="Select difficulty" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="easy">Easy (4x3)</SelectItem>
								<SelectItem value="medium">Medium (6x5)</SelectItem>
								<SelectItem value="hard">Hard (8x6)</SelectItem>
								<SelectItem value="hell">Hell (10x8)</SelectItem>
							</SelectContent>
						</Select>
					</div>
					</label>

					<label className="block">
						<span className="text-sm opacity-90">Card back</span>
					<div className="mt-1">
						<Select value={cardBack} onValueChange={setCardBack}>
							<SelectTrigger>
								<SelectValue placeholder="Select card back" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="violet">Violet</SelectItem>
								<SelectItem value="cyan">Cyan</SelectItem>
								<SelectItem value="rose">Rose</SelectItem>
							</SelectContent>
						</Select>
					</div>
					</label>

					<label className="block sm:col-span-2">
						<span className="text-sm opacity-90">Image set</span>
					<div className="mt-1">
						<Select value={imageSet} onValueChange={setImageSet}>
							<SelectTrigger>
								<SelectValue placeholder="Select image set" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="emoji">Emoji</SelectItem>
								<SelectItem value="animals">Animals</SelectItem>
								<SelectItem value="fruits">Fruits</SelectItem>
							</SelectContent>
						</Select>
					</div>
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


