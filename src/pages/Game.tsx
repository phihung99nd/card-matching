import { useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

type Card = {
	id: number
	value: string
	flipped: boolean
	matched: boolean
}

type Difficulty = 'easy' | 'medium' | 'hard' | 'hell'

function useGridSize(difficulty: Difficulty) {
	if (difficulty === 'easy') return { cols: 4, rows: 3 }
	if (difficulty === 'medium') return { cols: 6, rows: 5 }
	if (difficulty === 'hard') return { cols: 8, rows: 6 }
	return { cols: 10, rows: 8 }
}

function Game() {
	const navigate = useNavigate()
	const location = useLocation() as any
	const difficulty = (location.state?.difficulty ?? 'easy') as Difficulty
	const cardBack = (location.state?.cardBack ?? 'violet') as string
	const imageSet = (location.state?.imageSet ?? 'emoji') as string
	const { cols, rows } = useGridSize(difficulty)

	const [cards, setCards] = useState<Card[]>([])
	const [selectedIds, setSelectedIds] = useState<number[]>([])
	const [flipCount, setFlipCount] = useState(0)
	const [lastMatched, setLastMatched] = useState<number[]>([])
	const [timeLeft, setTimeLeft] = useState(() => {
		if (difficulty === 'easy') return 60
		if (difficulty === 'medium') return 90
		if (difficulty === 'hard') return 120
		return 180
	})

	// Compute a card size that fits the viewport without scrolling
	const [cardSize, setCardSize] = useState<number>(64)
	useEffect(() => {
		function computeSize() {
			const paddingX = 32 // page horizontal padding
			const gap = 12 // grid gap in px (gap-3)
			const headerH = 48 // HUD height estimate
			const controlsH = 56 // buttons area estimate
			const verticalPadding = 40 // top/bottom padding/margins
			const availableW = Math.max(280, window.innerWidth - paddingX * 2 - gap * (cols - 1))
			const availableH = Math.max(
				200,
				window.innerHeight - headerH - controlsH - verticalPadding - gap * (rows - 1)
			)
			const sizeByW = Math.floor(availableW / cols)
			const sizeByH = Math.floor((availableH / rows) / (4 / 3)) // account for 3:4 aspect
			const size = Math.max(36, Math.min(sizeByW, sizeByH))
			setCardSize(size)
		}
		computeSize()
		window.addEventListener('resize', computeSize)
		return () => window.removeEventListener('resize', computeSize)
	}, [cols, rows])

  function buildPool(kind: string, needed: number): string[] {
		const emoji = ['😀','😎','🤖','🐶','🐱','🐼','🍎','🍉','🍓','⚽','🎧','🚀','🌈','⭐','🔥','🧠','🎲','🎯','🎮','🎹','🎨','🎪','🎆','🎇','✨','⚡','❄️','🌙','☀️','🌟','🌸','🌼','🌻','🍁','🍂','🍃','🌊','🔥','💧','🪐','🌍','🛰️','📱','💡','🔔','🔮','🧩','🪄','🧸','🪅','🎁','🧁','🍩','🍪','🍰','🍫','🍬','🍭','🥨','🥐','🍔','🍟','🌮','🍕','🍣','🍤','🍙','🍜','🍝','🥟','🥗','🍗','🥩','🥪','🥞','🧇']
		const animals = ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐸','🐵','🐔','🐧','🐦','🦆','🦉','🦇','🐺','🦄','🐝','🦋','🐌','🐞','🐢','🦎','🐍','🐙','🦑','🦀','🪼','🐠','🐟','🐬','🐳','🦈']
		const fruits = ['🍎','🍐','🍊','🍋','🍌','🍉','🍇','🍓','🫐','🍒','🍑','🥭','🍍','🥝','🍈','🍏','🍅','🥥','🌶️','🧄','🧅']
		const shapes = ['★','☆','◆','◇','◼','◻','⬛','⬜','🔶','🔷','🔺','🔻','🔸','🔹']
		const weather = ['☀️','🌤️','⛅','🌥️','☁️','🌧️','⛈️','❄️','🌩️','🌫️']
		const transport = ['🚗','🚕','🚙','🚌','🚎','🏎️','🚓','🚑','🚒','🚚','🚛','🚜','✈️','🚀','🚁','🚂']
		const base = kind === 'animals' ? animals : kind === 'fruits' ? fruits : emoji
		let pool = [...new Set([...base, ...animals, ...fruits, ...shapes, ...weather, ...transport])]
		if (pool.length >= needed) return pool.slice(0, needed)
		while (pool.length < needed) {
			pool = pool.concat(pool).slice(0, needed)
		}
		return pool.slice(0, needed)
	}

	useEffect(() => {
		const total = cols * rows
		const needed = total / 2
		const candidates = buildPool(imageSet, needed)
		const deck: Card[] = [...candidates, ...candidates]
			.map((v, idx) => ({ id: idx + 1, value: v, flipped: false, matched: false }))
			.sort(() => Math.random() - 0.5)
		setCards(deck)
		setFlipCount(0)
		setSelectedIds([])
	}, [cols, rows, imageSet])

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
						setLastMatched([aId, bId])
						setTimeout(() => setLastMatched([]), 700)
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
		<div className="mx-auto px-4 min-h-screen flex flex-col" style={{ maxWidth: '100%' }}>
			<div className="flex items-center justify-between mb-4">
				<div className="font-semibold">Time: {timeLeft}s</div>
				<div className="font-semibold">Flips: {flipCount}</div>
			</div>
			<div className="flex-1 flex items-center justify-center">
				<div
					className="grid gap-3"
					style={{ gridTemplateColumns: `repeat(${cols}, ${cardSize}px)` }}
				>
					{cards.map((card) => (
					<motion.button
							key={card.id}
							whileTap={{ scale: 0.98 }}
							onClick={() => !card.flipped && !card.matched && flip(card.id)}
							className={`relative ${card.matched ? 'opacity-60' : ''}`}
							style={{ perspective: '1000px' }}
						>
						{/* Matched bounce + pop flash */}
						<motion.div
							className="absolute inset-0"
							animate={lastMatched.includes(card.id) ? { scale: [1, 2, 1], rotate: [0, -3, 3, 0] } : undefined}
							transition={{ duration: 0.6, ease: 'easeOut' }}
						/>
							<motion.div
								className={`absolute inset-0 rounded ring shadow-md shadow-black/20 ${backColor}`}
								initial={{ rotateY: card.flipped ? 180 : 0 }}
								animate={{ rotateY: card.flipped ? 180 : 0 }}
								transition={{ duration: 0.35, ease: 'easeInOut' }}
								style={{ backfaceVisibility: 'hidden', transformStyle: 'preserve-3d' }}
							/>
							<motion.div
								className="absolute inset-0 flex items-center justify-center rounded ring shadow-md shadow-black/20 bg-white text-slate-900 text-4xl"
								initial={{ rotateY: card.flipped ? 0 : -180 }}
								animate={{ rotateY: card.flipped ? 0 : -180 }}
								transition={{ duration: 0.35, ease: 'easeInOut' }}
								style={{ backfaceVisibility: 'hidden', transformStyle: 'preserve-3d' }}
							>
								{card.value}
							</motion.div>
							{/* Size the card explicitly to avoid page scroll */}
							<div style={{ width: cardSize, height: Math.round(cardSize * (4 / 3)) }} />
						</motion.button>
					))}
				</div>
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


