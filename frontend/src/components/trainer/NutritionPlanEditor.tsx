import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { id } from "../../lib/id";
import type { Meal, NutritionPlan } from "../../types";
import { Button } from "../ui/Button";
import { Field, Input, Textarea } from "../ui/Field";
import { Badge } from "../ui/Badge";

export function NutritionPlanEditor({
  plan,
  onSave,
}: {
  plan: NutritionPlan;
  onSave: (plan: NutritionPlan) => void;
}) {
  const [draft, setDraft] = useState<NutritionPlan>(plan);
  const [dirty, setDirty] = useState(false);

  function update(next: NutritionPlan) {
    setDraft(next);
    setDirty(true);
  }

  function addMeal() {
    const meal: Meal = { id: id("meal"), name: "Nueva comida", description: "", calories: 0, protein: 0, carbs: 0, fat: 0 };
    update({ ...draft, meals: [...draft.meals, meal] });
  }

  function updateMeal(mealId: string, patch: Partial<Meal>) {
    update({ ...draft, meals: draft.meals.map((m) => (m.id === mealId ? { ...m, ...patch } : m)) });
  }

  function removeMeal(mealId: string) {
    update({ ...draft, meals: draft.meals.filter((m) => m.id !== mealId) });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Input value={draft.name} onChange={(e) => update({ ...draft, name: e.target.value })} className="max-w-xs" />
        {dirty && <Badge tone="amber">Cambios sin guardar</Badge>}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Field label="Kcal diarias">
          <Input
            type="number"
            value={draft.dailyCalories}
            onChange={(e) => update({ ...draft, dailyCalories: Number(e.target.value) })}
          />
        </Field>
        <Field label="Proteína (g)">
          <Input
            type="number"
            value={draft.proteinG}
            onChange={(e) => update({ ...draft, proteinG: Number(e.target.value) })}
          />
        </Field>
        <Field label="Carbohidratos (g)">
          <Input
            type="number"
            value={draft.carbsG}
            onChange={(e) => update({ ...draft, carbsG: Number(e.target.value) })}
          />
        </Field>
        <Field label="Grasas (g)">
          <Input
            type="number"
            value={draft.fatG}
            onChange={(e) => update({ ...draft, fatG: Number(e.target.value) })}
          />
        </Field>
      </div>

      <div className="space-y-3">
        {draft.meals.map((meal) => (
          <div key={meal.id} className="rounded-xl border border-slate-200 p-3">
            <div className="mb-2 flex items-center gap-2">
              <Input
                value={meal.name}
                onChange={(e) => updateMeal(meal.id, { name: e.target.value })}
                className="max-w-[200px] font-medium"
              />
              <button
                onClick={() => removeMeal(meal.id)}
                className="ml-auto rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500"
                aria-label="Eliminar comida"
              >
                <Trash2 size={16} />
              </button>
            </div>
            <Textarea
              rows={2}
              placeholder="Descripción del menú"
              value={meal.description}
              onChange={(e) => updateMeal(meal.id, { description: e.target.value })}
            />
            <div className="mt-2 grid grid-cols-4 gap-2">
              <Input
                type="number"
                placeholder="Kcal"
                value={meal.calories}
                onChange={(e) => updateMeal(meal.id, { calories: Number(e.target.value) })}
              />
              <Input
                type="number"
                placeholder="Prot (g)"
                value={meal.protein}
                onChange={(e) => updateMeal(meal.id, { protein: Number(e.target.value) })}
              />
              <Input
                type="number"
                placeholder="Carb (g)"
                value={meal.carbs}
                onChange={(e) => updateMeal(meal.id, { carbs: Number(e.target.value) })}
              />
              <Input
                type="number"
                placeholder="Grasa (g)"
                value={meal.fat}
                onChange={(e) => updateMeal(meal.id, { fat: Number(e.target.value) })}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <Button variant="secondary" onClick={addMeal}>
          <Plus size={16} /> Añadir comida
        </Button>
        <Button
          onClick={() => {
            onSave(draft);
            setDirty(false);
          }}
        >
          Guardar plan nutricional
        </Button>
      </div>
    </div>
  );
}
