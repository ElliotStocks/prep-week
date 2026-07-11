import { weekPlan, appetiteFactor } from './engine.js';

const fmt = grams => (grams >= 1000 ? `${Math.round(grams / 100) / 10} kg` : `${Math.round(grams / 5) * 5} g`);

export default function Cook({ profile, picked }) {
  const plan = weekPlan(profile, picked);

  if (!plan.length) {
    return (
      <div>
        <h2>Cooking this week</h2>
        <p className="sub">Pick some meals and their full methods appear here — ingredients scaled to your
          household, step by step.</p>
      </div>
    );
  }

  const factor = appetiteFactor(profile);

  return (
    <div>
      <h2>Cooking this week</h2>
      <p className="sub">Every picked meal with quantities scaled for {profile.people}
        {profile.people > 1 ? ' people' : ' person'} — cook once, portion it out, eat well all week.</p>

      {plan.map(r => {
        const servings = profile.people * r.nights;
        return (
          <div className="cook-card" key={r.id}>
            <div className="cook-photo">
              <img src={`${import.meta.env.BASE_URL}photos/${r.id}.jpg`} alt="" loading="lazy"
                onError={e => e.currentTarget.remove()} />
            </div>
            <div className="cook-body">
              <h3>{r.name}</h3>
              <p className="muted small">Cook once · {r.nights} night{r.nights > 1 ? 's' : ''} · {servings} portions
                · ~{r.mins} min{r.costPerServing > 0 && <> · ≈ £{r.costPerServing.toFixed(2)} a portion</>}</p>
              <div className="cook-cols">
                <div>
                  <h4>You’ll need</h4>
                  <ul className="plain">
                    {r.ingredients.map(([name, grams, kind]) => (
                      <li key={name}>{name}
                        <span className="muted"> — {kind === 'pantry' ? 'from the cupboard' : fmt(grams * servings * factor)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4>Method</h4>
                  <ol>{r.steps.map((s, i) => <li key={i}>{s}</li>)}</ol>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
