import { useAuth } from "../../store/auth";
import { useCurrentDb } from "../../store/db";
import { getNutritionPlanOfClient } from "../../lib/queries";
import { PageHeader } from "../../components/ui/PageHeader";
import { Card, CardBody } from "../../components/ui/Card";

function MacroBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs text-slate-500">
        <span>{label}</span>
        <span>{value} g</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

export default function ClientNutrition() {
  const { currentUserId } = useAuth();
  const db = useCurrentDb();
  const clientId = currentUserId!;
  const plan = getNutritionPlanOfClient(db, clientId);

  if (!plan) {
    return (
      <div>
        <PageHeader title="Nutrición" />
        <p className="text-sm text-slate-400">Tu entrenador aún no te ha asignado un plan nutricional.</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title={plan.name} subtitle={`${plan.dailyCalories} kcal recomendadas al día`} />

      <Card className="mb-4">
        <CardBody className="space-y-3">
          <MacroBar label="Proteína" value={plan.proteinG} max={plan.proteinG} color="#4f46e5" />
          <MacroBar label="Carbohidratos" value={plan.carbsG} max={plan.carbsG} color="#0ea5e9" />
          <MacroBar label="Grasas" value={plan.fatG} max={plan.fatG} color="#f59e0b" />
        </CardBody>
      </Card>

      <div className="space-y-3">
        {plan.meals.map((meal) => (
          <Card key={meal.id}>
            <CardBody>
              <div className="mb-1 flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-900">{meal.name}</p>
                <span className="text-xs font-medium text-slate-500">{meal.calories} kcal</span>
              </div>
              <p className="text-sm text-slate-600">{meal.description}</p>
              <p className="mt-2 text-xs text-slate-400">
                P: {meal.protein}g · C: {meal.carbs}g · G: {meal.fat}g
              </p>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
