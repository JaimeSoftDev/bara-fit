<?php

namespace App\Providers;

use App\Models\Booking;
use App\Models\Business;
use App\Models\ClientProfile;
use App\Models\Conversation;
use App\Models\Exercise;
use App\Models\Form;
use App\Models\FormAssignment;
use App\Models\Invoice;
use App\Models\NutritionPlan;
use App\Models\ProgressEntry;
use App\Models\WorkoutPlan;
use App\Policies\BookingPolicy;
use App\Policies\BusinessPolicy;
use App\Policies\ClientProfilePolicy;
use App\Policies\ConversationPolicy;
use App\Policies\ExercisePolicy;
use App\Policies\FormAssignmentPolicy;
use App\Policies\FormPolicy;
use App\Policies\InvoicePolicy;
use App\Policies\NutritionPlanPolicy;
use App\Policies\ProgressEntryPolicy;
use App\Policies\WorkoutPlanPolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Gate::policy(Exercise::class, ExercisePolicy::class);
        Gate::policy(WorkoutPlan::class, WorkoutPlanPolicy::class);
        Gate::policy(NutritionPlan::class, NutritionPlanPolicy::class);
        Gate::policy(Booking::class, BookingPolicy::class);
        Gate::policy(ProgressEntry::class, ProgressEntryPolicy::class);
        Gate::policy(Conversation::class, ConversationPolicy::class);
        Gate::policy(Invoice::class, InvoicePolicy::class);
        Gate::policy(ClientProfile::class, ClientProfilePolicy::class);
        Gate::policy(Business::class, BusinessPolicy::class);
        Gate::policy(Form::class, FormPolicy::class);
        Gate::policy(FormAssignment::class, FormAssignmentPolicy::class);
    }
}
