/* eslint-disable @typescript-eslint/no-explicit-any */
import { useLocation, useNavigate } from 'react-router-dom'

function Result() {
	const navigate = useNavigate()
	const location = useLocation() as any
	const win = Boolean(location.state?.win)
	const flips = Number(location.state?.flips ?? 0)
	const timeTaken = Number(location.state?.timeTaken ?? 0)

	return (
		<div className="mx-auto max-w-xl">
			<div className="bg-white/10 backdrop-blur rounded-2xl p-6 ring-1 ring-white/20 text-center">
				<h2 className="text-3xl font-bold">{win ? 'You Win! 🎉' : 'Time’s Up ⏱️'}</h2>
				<div className="mt-4 grid grid-cols-2 gap-4 text-left">
					<div className="bg-white/10 rounded-xl p-4">
						<div className="text-sm opacity-90">Flips</div>
						<div className="text-2xl font-semibold">{flips}</div>
					</div>
					<div className="bg-white/10 rounded-xl p-4">
						<div className="text-sm opacity-90">Time</div>
						<div className="text-2xl font-semibold">{timeTaken}s</div>
					</div>
				</div>
				<div className="mt-6 flex gap-3 justify-center">
					<button
						onClick={() => navigate('/')}
						className="inline-flex items-center justify-center rounded-xl bg-white text-indigo-700 font-semibold px-4 py-2 shadow hover:opacity-90"
					>
						Back
					</button>
					<button
						onClick={() => navigate('/game', { replace: true })}
						className="inline-flex items-center justify-center rounded-xl bg-indigo-700 text-white font-semibold px-4 py-2 shadow hover:opacity-90"
					>
						Retry
					</button>
				</div>
			</div>
		</div>
	)
}

export default Result


