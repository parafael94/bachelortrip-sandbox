import { useUserBudget, VOTE_BUDGET } from '../hooks/useVotes'

export default function VoteBudgetBar() {
  const { spent, remaining, loading } = useUserBudget()
  if (loading) return null

  const pct = Math.min(100, Math.round((spent / VOTE_BUDGET) * 100))
  const over = remaining < 0

  return (
    <div className="vote-budget-bar">
      <div className="vb-label">
        <span>🗳️ Your Vote Budget</span>
        <span className={`vb-remaining ${over ? 'over' : remaining < 100 ? 'low' : ''}`}>
          ${remaining.toLocaleString()} remaining
        </span>
      </div>
      <div className="vb-track">
        <div
          className={`vb-fill ${over ? 'over' : pct > 75 ? 'warn' : ''}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="vb-sub">
        ${spent.toLocaleString()} spent of ${VOTE_BUDGET} total
      </div>
    </div>
  )
}
