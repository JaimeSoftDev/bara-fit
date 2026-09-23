<?php

namespace Database\Seeders;

use App\Models\Booking;
use App\Models\Business;
use App\Models\ClientProfile;
use App\Models\Conversation;
use App\Models\Exercise;
use App\Models\Invoice;
use App\Models\NutritionPlan;
use App\Models\PayrollEntry;
use App\Models\ProgressEntry;
use App\Models\TrainerProfile;
use App\Models\User;
use App\Models\WorkoutPlan;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        // ---------------------------------------------------------------
        // Trainer
        // ---------------------------------------------------------------
        $carlos = User::create([
            'name' => 'Carlos Ríos',
            'email' => 'carlos@barafit.app',
            'password' => Hash::make('password'),
            'role' => 'trainer',
        ]);

        TrainerProfile::create([
            'user_id' => $carlos->id,
            'specialties' => ['Fuerza', 'Hipertrofia', 'Pérdida de grasa'],
            'bio' => 'Entrenador personal certificado NSCA-CPT. 8 años ayudando a personas a construir hábitos sostenibles.',
        ]);

        // ---------------------------------------------------------------
        // Clients
        // ---------------------------------------------------------------
        $lucia = User::create([
            'name' => 'Lucía Fernández',
            'email' => 'lucia@example.com',
            'password' => Hash::make('password'),
            'role' => 'client',
        ]);
        ClientProfile::create([
            'user_id' => $lucia->id,
            'trainer_id' => $carlos->id,
            'goal' => 'Ganar fuerza y tono muscular',
            'height_cm' => 165,
            'start_weight_kg' => 63.5,
        ]);

        $marcos = User::create([
            'name' => 'Marcos Iglesias',
            'email' => 'marcos@example.com',
            'password' => Hash::make('password'),
            'role' => 'client',
        ]);
        ClientProfile::create([
            'user_id' => $marcos->id,
            'trainer_id' => $carlos->id,
            'goal' => 'Perder grasa corporal',
            'height_cm' => 178,
            'start_weight_kg' => 89.0,
        ]);

        $paula = User::create([
            'name' => 'Paula Gómez',
            'email' => 'paula@example.com',
            'password' => Hash::make('password'),
            'role' => 'client',
        ]);
        ClientProfile::create([
            'user_id' => $paula->id,
            'trainer_id' => $carlos->id,
            'goal' => 'Preparación media maratón',
            'height_cm' => 170,
            'start_weight_kg' => 61.0,
        ]);

        // ---------------------------------------------------------------
        // Exercises
        // ---------------------------------------------------------------
        $exerciseData = [
            ['name' => 'Sentadilla trasera', 'muscle_group' => 'Piernas', 'equipment' => 'Barra', 'video_url' => 'https://www.youtube.com/watch?v=PbrlKe246E8'],
            ['name' => 'Press banca', 'muscle_group' => 'Pecho', 'equipment' => 'Barra', 'video_url' => 'https://www.youtube.com/watch?v=uRyOpJkStSI'],
            ['name' => 'Peso muerto rumano', 'muscle_group' => 'Piernas', 'equipment' => 'Barra'],
            ['name' => 'Dominadas', 'muscle_group' => 'Espalda', 'equipment' => 'Barra de dominadas', 'video_url' => 'https://www.youtube.com/watch?v=637SzIkGrIg'],
            ['name' => 'Press militar', 'muscle_group' => 'Hombros', 'equipment' => 'Barra'],
            ['name' => 'Remo con barra', 'muscle_group' => 'Espalda', 'equipment' => 'Barra'],
            ['name' => 'Curl de bíceps', 'muscle_group' => 'Brazos', 'equipment' => 'Mancuernas'],
            ['name' => 'Plancha', 'muscle_group' => 'Core', 'equipment' => 'Peso corporal'],
            ['name' => 'Zancadas', 'muscle_group' => 'Piernas', 'equipment' => 'Mancuernas'],
            ['name' => 'Carrera continua', 'muscle_group' => 'Cardio', 'equipment' => 'Ninguno'],
        ];

        $exercises = collect($exerciseData)->map(
            fn ($e) => Exercise::create(array_merge($e, ['trainer_id' => $carlos->id]))
        );

        $byName = fn (string $name) => $exercises->firstWhere('name', $name);

        // ---------------------------------------------------------------
        // Workout plan for Lucía (3 days)
        // ---------------------------------------------------------------
        $plan = WorkoutPlan::create([
            'trainer_id' => $carlos->id,
            'client_id' => $lucia->id,
            'name' => 'Fuerza — Mesociclo 1',
            'start_date' => Carbon::now()->subWeeks(2)->toDateString(),
            'end_date' => Carbon::now()->addWeeks(6)->toDateString(),
            'status' => 'active',
        ]);

        $day1 = $plan->days()->create(['label' => 'Día 1 · Tren inferior', 'position' => 0]);
        $day1->items()->create(['exercise_id' => $byName('Sentadilla trasera')->id, 'sets' => 4, 'reps' => '6-8', 'load_kg' => 50, 'rest_seconds' => 120, 'position' => 0]);
        $day1->items()->create(['exercise_id' => $byName('Peso muerto rumano')->id, 'sets' => 3, 'reps' => '8-10', 'load_kg' => 40, 'rest_seconds' => 90, 'position' => 1]);
        $day1->items()->create(['exercise_id' => $byName('Zancadas')->id, 'sets' => 3, 'reps' => '12', 'load_kg' => 12, 'rest_seconds' => 60, 'position' => 2]);

        $day2 = $plan->days()->create(['label' => 'Día 2 · Tren superior', 'position' => 1]);
        $day2->items()->create(['exercise_id' => $byName('Press banca')->id, 'sets' => 4, 'reps' => '6-8', 'load_kg' => 35, 'rest_seconds' => 120, 'position' => 0]);
        $day2->items()->create(['exercise_id' => $byName('Dominadas')->id, 'sets' => 3, 'reps' => '5-8', 'rest_seconds' => 90, 'position' => 1]);
        $day2->items()->create(['exercise_id' => $byName('Remo con barra')->id, 'sets' => 3, 'reps' => '10', 'load_kg' => 30, 'rest_seconds' => 90, 'position' => 2]);

        $day3 = $plan->days()->create(['label' => 'Día 3 · Full body', 'position' => 2]);
        $day3->items()->create(['exercise_id' => $byName('Press militar')->id, 'sets' => 3, 'reps' => '8', 'load_kg' => 20, 'rest_seconds' => 90, 'position' => 0]);
        $day3->items()->create(['exercise_id' => $byName('Curl de bíceps')->id, 'sets' => 3, 'reps' => '12', 'load_kg' => 8, 'rest_seconds' => 60, 'position' => 1]);
        $day3->items()->create(['exercise_id' => $byName('Plancha')->id, 'sets' => 3, 'reps' => '45s', 'rest_seconds' => 45, 'position' => 2]);

        // ---------------------------------------------------------------
        // Nutrition plans for Lucía and Marcos
        // ---------------------------------------------------------------
        $nutritionLucia = NutritionPlan::create([
            'trainer_id' => $carlos->id,
            'client_id' => $lucia->id,
            'name' => 'Plan de mantenimiento — Lucía',
            'daily_calories' => 2000,
            'protein_g' => 130,
            'carbs_g' => 210,
            'fat_g' => 60,
            'notes' => 'Ajustar hidratos en días de entrenamiento de piernas.',
        ]);
        $nutritionLucia->meals()->create(['name' => 'Desayuno', 'description' => 'Avena con fruta y claras de huevo', 'calories' => 450, 'protein' => 30, 'carbs' => 55, 'fat' => 10, 'position' => 0]);
        $nutritionLucia->meals()->create(['name' => 'Comida', 'description' => 'Pechuga de pollo, arroz y verduras', 'calories' => 650, 'protein' => 45, 'carbs' => 70, 'fat' => 15, 'position' => 1]);
        $nutritionLucia->meals()->create(['name' => 'Cena', 'description' => 'Salmón al horno con boniato', 'calories' => 550, 'protein' => 35, 'carbs' => 50, 'fat' => 20, 'position' => 2]);

        $nutritionMarcos = NutritionPlan::create([
            'trainer_id' => $carlos->id,
            'client_id' => $marcos->id,
            'name' => 'Plan de déficit — Marcos',
            'daily_calories' => 2200,
            'protein_g' => 170,
            'carbs_g' => 180,
            'fat_g' => 65,
            'notes' => 'Prioriza proteína magra y verduras de hoja verde.',
        ]);
        $nutritionMarcos->meals()->create(['name' => 'Desayuno', 'description' => 'Tortilla de claras con espinacas', 'calories' => 400, 'protein' => 35, 'carbs' => 20, 'fat' => 15, 'position' => 0]);
        $nutritionMarcos->meals()->create(['name' => 'Comida', 'description' => 'Ternera magra, quinoa y brócoli', 'calories' => 700, 'protein' => 55, 'carbs' => 60, 'fat' => 20, 'position' => 1]);
        $nutritionMarcos->meals()->create(['name' => 'Cena', 'description' => 'Merluza a la plancha con ensalada', 'calories' => 500, 'protein' => 40, 'carbs' => 25, 'fat' => 20, 'position' => 2]);

        // ---------------------------------------------------------------
        // Bookings
        // ---------------------------------------------------------------
        $luciaSession = Booking::create([
            'trainer_id' => $carlos->id,
            'title' => 'Sesión personal — Lucía',
            'type' => 'session',
            'starts_at' => Carbon::now()->addDay()->setTime(9, 0),
            'ends_at' => Carbon::now()->addDay()->setTime(10, 0),
            'status' => 'confirmed',
            'location' => 'Sala 1 — BaraFit Gym',
        ]);
        $luciaSession->attendees()->attach($lucia->id, ['status' => 'confirmed']);

        $marcosSession = Booking::create([
            'trainer_id' => $carlos->id,
            'title' => 'Sesión personal — Marcos',
            'type' => 'session',
            'starts_at' => Carbon::now()->addDays(3)->setTime(18, 0),
            'ends_at' => Carbon::now()->addDays(3)->setTime(19, 0),
            'status' => 'confirmed',
            'location' => 'Sala 2 — BaraFit Gym',
        ]);
        $marcosSession->attendees()->attach($marcos->id, ['status' => 'confirmed']);

        $completedSession = Booking::create([
            'trainer_id' => $carlos->id,
            'title' => 'Sesión personal — Paula',
            'type' => 'session',
            'starts_at' => Carbon::now()->subDays(4)->setTime(8, 0),
            'ends_at' => Carbon::now()->subDays(4)->setTime(9, 0),
            'status' => 'completed',
            'location' => 'Parque del Retiro',
        ]);
        $completedSession->attendees()->attach($paula->id, ['status' => 'confirmed', 'checked_in_at' => Carbon::now()->subDays(4)->setTime(8, 3)]);

        // Recurring weekly group class, 4 weekly occurrences, capacity 6, 2 attendees.
        $seriesId = (string) Str::uuid();
        $classStart = Carbon::now()->next(Carbon::MONDAY)->setTime(19, 0);
        for ($i = 0; $i < 4; $i++) {
            $occurrenceStart = $classStart->copy()->addWeeks($i);
            $class = Booking::create([
                'trainer_id' => $carlos->id,
                'title' => 'Entrenamiento funcional en grupo',
                'type' => 'class',
                'starts_at' => $occurrenceStart,
                'ends_at' => $occurrenceStart->copy()->addHour(),
                'status' => 'confirmed',
                'location' => 'Sala grupal — BaraFit Gym',
                'capacity' => 6,
                'series_id' => $seriesId,
            ]);
            $class->attendees()->attach([
                $marcos->id => ['status' => 'confirmed'],
                $paula->id => ['status' => 'confirmed'],
            ]);
        }

        // ---------------------------------------------------------------
        // Progress entries (Lucía & Marcos, several weeks)
        // ---------------------------------------------------------------
        $luciaWeights = [64.2, 63.9, 63.6, 63.5, 63.1];
        foreach ($luciaWeights as $i => $weight) {
            ProgressEntry::create([
                'client_id' => $lucia->id,
                'date' => Carbon::now()->subWeeks(count($luciaWeights) - $i)->toDateString(),
                'weight_kg' => $weight,
                'body_fat_pct' => 24.5 - ($i * 0.3),
                'measurements' => ['waistCm' => 72 - $i, 'hipsCm' => 96 - $i * 0.5, 'armCm' => 27 + $i * 0.1],
                'note' => $i === 0 ? 'Primer registro.' : null,
            ]);
        }

        $marcosWeights = [92.4, 91.5, 90.6, 89.8, 89.0];
        foreach ($marcosWeights as $i => $weight) {
            ProgressEntry::create([
                'client_id' => $marcos->id,
                'date' => Carbon::now()->subWeeks(count($marcosWeights) - $i)->toDateString(),
                'weight_kg' => $weight,
                'body_fat_pct' => 22.0 - ($i * 0.5),
                'measurements' => ['waistCm' => 94 - $i, 'chestCm' => 104 + $i * 0.2],
                'note' => $i === count($marcosWeights) - 1 ? 'Buen progreso este mes.' : null,
            ]);
        }

        // ---------------------------------------------------------------
        // Conversations + messages
        // ---------------------------------------------------------------
        foreach ([$lucia, $marcos, $paula] as $client) {
            $conversation = Conversation::create(['trainer_id' => $carlos->id, 'client_id' => $client->id]);

            $conversation->messages()->create([
                'sender_id' => $carlos->id,
                'text' => "¡Hola {$client->name}! ¿Cómo te sientes tras la última sesión?",
                'created_at' => Carbon::now()->subDays(2),
                'updated_at' => Carbon::now()->subDays(2),
            ]);
            $conversation->messages()->create([
                'sender_id' => $client->id,
                'text' => 'Bien, con algo de agujetas pero con ganas de seguir.',
                'created_at' => Carbon::now()->subDays(2)->addHour(),
                'updated_at' => Carbon::now()->subDays(2)->addHour(),
            ]);
            $conversation->messages()->create([
                'sender_id' => $carlos->id,
                'text' => 'Perfecto, es normal. Hidrátate bien y nos vemos la próxima semana.',
                'created_at' => Carbon::now()->subDay(),
                'updated_at' => Carbon::now()->subDay(),
            ]);
        }

        // ---------------------------------------------------------------
        // Invoices (paid / pending / overdue)
        // ---------------------------------------------------------------
        Invoice::create([
            'trainer_id' => $carlos->id,
            'client_id' => $lucia->id,
            'concept' => 'Mensualidad — Septiembre',
            'amount' => 90.00,
            'status' => 'paid',
            'issued_at' => Carbon::now()->subDays(20)->toDateString(),
            'due_date' => Carbon::now()->subDays(10)->toDateString(),
            'paid_at' => Carbon::now()->subDays(15)->toDateString(),
        ]);

        Invoice::create([
            'trainer_id' => $carlos->id,
            'client_id' => $marcos->id,
            'concept' => 'Mensualidad — Octubre',
            'amount' => 90.00,
            'status' => 'pending',
            'issued_at' => Carbon::now()->subDays(3)->toDateString(),
            'due_date' => Carbon::now()->addDays(7)->toDateString(),
        ]);

        Invoice::create([
            'trainer_id' => $carlos->id,
            'client_id' => $paula->id,
            'concept' => 'Mensualidad — Agosto',
            'amount' => 90.00,
            'status' => 'overdue',
            'issued_at' => Carbon::now()->subDays(45)->toDateString(),
            'due_date' => Carbon::now()->subDays(15)->toDateString(),
        ]);

        Invoice::create([
            'trainer_id' => $carlos->id,
            'client_id' => $lucia->id,
            'concept' => 'Plan nutricional personalizado',
            'amount' => 35.00,
            'status' => 'pending',
            'issued_at' => Carbon::now()->subDays(1)->toDateString(),
            'due_date' => Carbon::now()->addDays(14)->toDateString(),
        ]);

        // ---------------------------------------------------------------
        // Business/team: Carlos owns "BaraFit Gym Central", Ana is staff.
        // Demonstrates the shared team calendar and payroll.
        // ---------------------------------------------------------------
        $business = Business::create([
            'owner_id' => $carlos->id,
            'name' => 'BaraFit Gym Central',
            'brand_color' => '#0ea5e9',
        ]);

        $carlos->trainerProfile->update([
            'business_id' => $business->id,
            'business_role' => 'owner',
        ]);

        $ana = User::create([
            'name' => 'Ana Torres',
            'email' => 'ana@barafit.app',
            'password' => Hash::make('password'),
            'role' => 'trainer',
        ]);
        TrainerProfile::create([
            'user_id' => $ana->id,
            'business_id' => $business->id,
            'business_role' => 'staff',
            'specialties' => ['Yoga', 'Movilidad'],
            'bio' => 'Instructora de yoga y movilidad, parte del equipo de BaraFit Gym Central.',
        ]);

        // A booking on Ana's own agenda, visible in the shared team calendar.
        $anaClass = Booking::create([
            'trainer_id' => $ana->id,
            'title' => 'Yoga y movilidad',
            'type' => 'class',
            'starts_at' => Carbon::now()->addDays(2)->setTime(9, 0),
            'ends_at' => Carbon::now()->addDays(2)->setTime(10, 0),
            'status' => 'confirmed',
            'location' => 'Sala grupal — BaraFit Gym',
            'capacity' => 8,
        ]);
        $anaClass->attendees()->attach($lucia->id, ['status' => 'confirmed']);

        PayrollEntry::create([
            'business_id' => $business->id,
            'trainer_id' => $ana->id,
            'period_label' => 'Agosto 2026',
            'amount' => 950.00,
            'status' => 'paid',
            'paid_at' => Carbon::now()->subDays(20),
        ]);
        PayrollEntry::create([
            'business_id' => $business->id,
            'trainer_id' => $ana->id,
            'period_label' => 'Septiembre 2026',
            'amount' => 980.00,
            'status' => 'pending',
        ]);
    }
}
