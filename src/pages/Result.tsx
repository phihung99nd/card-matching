/* eslint-disable @typescript-eslint/no-explicit-any */
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

function Result() {
	const navigate = useNavigate()
	const location = useLocation() as any
	const win = Boolean(location.state?.win)
	const flips = Number(location.state?.flips ?? 0)
	const timeTaken = Number(location.state?.timeTaken ?? 0)
	const difficulty = location.state?.difficulty ?? 'easy'
	const imageSet = location.state?.imageSet ?? 'emoji'
	const limitFlips = Boolean(location.state?.limitFlips ?? false)
	const loseReason = location.state?.loseReason as 'time' | 'flips' | null | undefined

	const containerVariants = {
		hidden: { opacity: 0, scale: 0.8 },
		visible: {
			opacity: 1,
			scale: 1,
			transition: {
				duration: 0.5,
				ease: [0.4, 0, 0.2, 1] as const,
			},
		},
	}

	const titleVariants = {
		hidden: { opacity: 0, scale: 0.5 },
		visible: {
			opacity: 1,
			scale: 1,
			transition: {
				delay: 0.2,
				duration: 0.5,
				ease: [0.4, 0, 0.2, 1] as const,
			},
		},
	}

	const statCardVariants = {
		hidden: { opacity: 0, y: 20 },
		visible: (i: number) => ({
			opacity: 1,
			y: 0,
			transition: {
				delay: 0.3 + i * 0.1,
				duration: 0.4,
				ease: [0.4, 0, 0.2, 1] as const,
			},
		}),
	}

	const buttonVariants = {
		hidden: { opacity: 0, x: -20 },
		visible: (i: number) => ({
			opacity: 1,
			x: 0,
			transition: {
				delay: 0.6 + i * 0.1,
				duration: 0.4,
				ease: [0.4, 0, 0.2, 1] as const,
			},
		}),
		hover: { scale: 1.05 },
		tap: { scale: 0.95 },
	}

	const getTitleText = () => {
		if (win) return 'You Win! 🎉'
		if (loseReason === 'time') return 'Time\'s Up ⏱️'
		if (loseReason === 'flips') return 'Out of Flips! 💔'
		return 'Game Over! 💔'
	}
	const titleText = getTitleText()

	return (
		<div className="mx-auto max-w-xl">
			<motion.div
				className="bg-card/80 backdrop-blur rounded-2xl p-6 ring-1 ring-border text-center"
				variants={containerVariants}
				initial="hidden"
				animate="visible"
			>
				<motion.h2
					className="text-3xl font-bold text-card-foreground"
					variants={titleVariants}
					initial="hidden"
					animate="visible"
				>
					{titleText}
				</motion.h2>
				<div className="mt-4 grid grid-cols-2 gap-4 text-left">
					<motion.div
						className="bg-muted/50 rounded-xl p-4"
						variants={statCardVariants}
						initial="hidden"
						animate="visible"
						custom={0}
					>
						<div className="text-sm text-muted-foreground">Flips</div>
						<div className="text-2xl font-semibold text-card-foreground">{flips}</div>
					</motion.div>
					<motion.div
						className="bg-muted/50 rounded-xl p-4"
						variants={statCardVariants}
						initial="hidden"
						animate="visible"
						custom={1}
					>
						<div className="text-sm text-muted-foreground">Time</div>
						<div className="text-2xl font-semibold text-card-foreground">{timeTaken}s</div>
					</motion.div>
				</div>
				<div className="mt-6 flex gap-3 justify-center">
					<motion.button
						onClick={() => navigate('/')}
						className="inline-flex items-center justify-center rounded-xl bg-secondary text-secondary-foreground font-semibold px-4 py-2 shadow hover:opacity-90"
						variants={buttonVariants}
						initial="hidden"
						animate="visible"
						whileHover="hover"
						whileTap="tap"
						custom={0}
					>
						Back
					</motion.button>
					<motion.button
						onClick={() => navigate('/game', { replace: true, state: { difficulty, imageSet, limitFlips } })}
						className="inline-flex items-center justify-center rounded-xl bg-primary text-primary-foreground font-semibold px-4 py-2 shadow hover:opacity-90"
						variants={buttonVariants}
						initial="hidden"
						animate="visible"
						whileHover="hover"
						whileTap="tap"
						custom={1}
					>
						Retry
					</motion.button>
				</div>
			</motion.div>
		</div>
	)
}

export default Result


