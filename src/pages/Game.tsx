import { useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'

type Card = {
	id: number
	value: string
	flipped: boolean
	matched: boolean
}

function useGridSize(difficulty: 'easy' | 'medium' | 'hard' | 'hell') {
	if (difficulty === 'easy') return { cols: 4, rows: 3 }
	if (difficulty === 'medium') return { cols: 6, rows: 5 }
	if (difficulty === 'hard') return { cols: 8, rows: 6 }
	return { cols: 10, rows: 8 }
}

function Game() {
	const navigate = useNavigate()
	const location = useLocation() as any
	const difficulty = (location.state?.difficulty ?? 'easy') as 'easy' | 'medium' | 'hard'
	const cardBack = (location.state?.cardBack ?? 'violet') as string
	const imageSet = (location.state?.imageSet ?? 'emoji') as string
	const { cols, rows } = useGridSize(difficulty)

	const [cards, setCards] = useState<Card[]>([])
	const [selectedIds, setSelectedIds] = useState<number[]>([])
	const [flipCount, setFlipCount] = useState(0)
	const [timeLeft, setTimeLeft] = useState(() => {
		if (difficulty === 'easy') return 60
		if (difficulty === 'medium') return 90
		if (difficulty === 'hard') return 120
		return 180
	})

	const values = useMemo(() => {
		const emoji = ['😀','😎','🤖','🐶','🐱','🐼','🍎','🍉','🍓','⚽','🎧','🚀','🌈','⭐','🔥']
		const animals = ['🐶','🐱','🐭','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐷','🐸','🐵','🐔','🐧']
		const fruits = ['🍎','🍐','🍊','🍋','🍌','🍉','🍇','🍓','🫐','🍒','🍑','🥭','🍍','🥝','🍈']
		const pool = imageSet === 'animals' ? animals : imageSet === 'fruits' ? fruits : emoji
		return pool
	}, [imageSet])

	useEffect(() => {
		const total = cols * rows
		const needed = total / 2
		const candidates = values.slice(0, needed)
		const deck: Card[] = [...candidates, ...candidates]
			.map((v, idx) => ({ id: idx + 1, value: v, flipped: false, matched: false }))
			.sort(() => Math.random() - 0.5)
		setCards(deck)
		setFlipCount(0)
		setSelectedIds([])
	}, [cols, rows, values])

	useEffect(() => {
		if (timeLeft <= 0) {
			navigate('/result', { state: { win: false, flips: flipCount, timeTaken: 0 } })
			return
		}
		const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000)
		return () => clearTimeout(t)
	}, [timeLeft, flipCount, navigate])

	useEffect(() => {
		if (cards.length > 0 && cards.every((c) => c.matched)) {
			const totalTime = difficulty === 'easy' ? 60 : difficulty === 'medium' ? 90 : difficulty === 'hard' ? 120 : 180
			navigate('/result', { state: { win: true, flips: flipCount, timeTaken: totalTime - timeLeft } })
		}
	}, [cards, timeLeft, flipCount, difficulty, navigate])

	function flip(cardId: number) {
		setCards((prev) => prev.map((c) => (c.id === cardId ? { ...c, flipped: true } : c)))
		setFlipCount((n) => n + 1)
		setSelectedIds((sel) => {
			const next = [...sel, cardId]
			if (next.length === 2) {
				const [aId, bId] = next
				const a = cards.find((c) => c.id === aId)!
				const b = cards.find((c) => c.id === bId)!
				if (a.value === b.value) {
					setTimeout(() => {
						setCards((prev) => prev.map((c) => (c.id === aId || c.id === bId ? { ...c, matched: true } : c)))
					}, 300)
				} else {
					setTimeout(() => {
						setCards((prev) => prev.map((c) => (c.id === aId || c.id === bId ? { ...c, flipped: false } : c)))
					}, 600)
				}
				return []
			}
			return next
		})
	}

	const backColor = cardBack === 'cyan' ? 'bg-cyan-400' : cardBack === 'rose' ? 'bg-rose-400' : 'bg-violet-400'

	return (
		<div className="mx-auto max-w-5xl">
			<div className="flex items-center justify-between mb-4">
				<div className="font-semibold">Time: {timeLeft}s</div>
				<div className="font-semibold">Flips: {flipCount}</div>
			</div>
			<div
				className="grid gap-3"
				style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
			>
				{cards.map((card) => (
					<motion.button
						key={card.id}
						whileTap={{ scale: 0.98 }}
						onClick={() => !card.flipped && !card.matched && flip(card.id)}
						className={`aspect-[3/4] rounded-xl relative overflow-hidden ring-1 ring-white/20 ${card.matched ? 'opacity-60' : ''}`}
					>
						<motion.div
							className={`absolute inset-0 ${backColor}`}
							animate={{ rotateY: card.flipped ? 180 : 0 }}
							transition={{ duration: 0.35 }}
							style={{ backfaceVisibility: 'hidden' }}
						/>
						<motion.div
							className="absolute inset-0 flex items-center justify-center bg-white text-slate-900 text-4xl"
							animate={{ rotateY: card.flipped ? 0 : -180 }}
							transition={{ duration: 0.35 }}
							style={{ backfaceVisibility: 'hidden' }}
						>
							{card.value}
						</motion.div>
					</motion.button>
				))}
			</div>
			<div className="mt-6 flex gap-3">
				<button
					onClick={() => navigate('/')}
					className="inline-flex items-center justify-center rounded-xl bg-white text-indigo-700 font-semibold px-4 py-2 shadow hover:opacity-90"
				>
					Quit
				</button>
				<button
					onClick={() => navigate(0)}
					className="inline-flex items-center justify-center rounded-xl bg-indigo-700 text-white font-semibold px-4 py-2 shadow hover:opacity-90"
				>
					Restart
				</button>
			</div>
		</div>
	)
}

export default Game


