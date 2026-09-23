<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\BusinessController;
use App\Http\Controllers\BusinessInviteController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\ConversationController;
use App\Http\Controllers\ExerciseController;
use App\Http\Controllers\InviteController;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\NutritionPlanController;
use App\Http\Controllers\ProgressEntryController;
use App\Http\Controllers\WorkoutPlanController;
use Illuminate\Support\Facades\Route;

// ---- Public ----
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/invites/{token}', [InviteController::class, 'show']);
Route::post('/invites/{token}/accept', [InviteController::class, 'accept']);
Route::get('/team-invites/{token}', [BusinessInviteController::class, 'show']);
Route::post('/team-invites/{token}/accept', [BusinessInviteController::class, 'accept']);

// ---- Authenticated ----
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::patch('/me/profile', [AuthController::class, 'updateProfile']);
    Route::post('/me/logo', [AuthController::class, 'uploadLogo']);

    // Clients
    Route::get('/clients', [ClientController::class, 'index']);
    Route::get('/clients/{client}', [ClientController::class, 'show']);
    Route::post('/clients/invite', [ClientController::class, 'invite']);

    // Exercises
    Route::apiResource('exercises', ExerciseController::class);

    // Workout plans
    Route::get('/workout-plans', [WorkoutPlanController::class, 'index']);
    Route::post('/workout-plans', [WorkoutPlanController::class, 'store']);
    Route::get('/workout-plans/{workoutPlan}', [WorkoutPlanController::class, 'show']);
    Route::put('/workout-plans/{workoutPlan}', [WorkoutPlanController::class, 'update']);
    Route::get('/workout-plans/{workoutPlan}/completions', [WorkoutPlanController::class, 'completions']);
    Route::post('/workout-plans/{workoutPlan}/completions', [WorkoutPlanController::class, 'storeCompletion']);

    // Nutrition plans
    Route::get('/nutrition-plans', [NutritionPlanController::class, 'index']);
    Route::post('/nutrition-plans', [NutritionPlanController::class, 'store']);
    Route::get('/nutrition-plans/{nutritionPlan}', [NutritionPlanController::class, 'show']);
    Route::put('/nutrition-plans/{nutritionPlan}', [NutritionPlanController::class, 'update']);

    // Bookings
    Route::get('/bookings', [BookingController::class, 'index']);
    Route::get('/bookings/available', [BookingController::class, 'available']);
    Route::post('/bookings', [BookingController::class, 'store']);
    Route::patch('/bookings/{booking}', [BookingController::class, 'update']);
    Route::delete('/bookings/series/{seriesId}', [BookingController::class, 'destroySeries']);
    Route::delete('/bookings/{booking}', [BookingController::class, 'destroy']);
    Route::post('/bookings/{booking}/attendees', [BookingController::class, 'addAttendee']);
    Route::delete('/bookings/{booking}/attendees/{client}', [BookingController::class, 'removeAttendee']);
    Route::post('/bookings/{booking}/attendees/{client}/check-in', [BookingController::class, 'checkIn']);

    // Progress entries
    Route::get('/progress-entries', [ProgressEntryController::class, 'index']);
    Route::post('/progress-entries', [ProgressEntryController::class, 'store']);

    // Conversations / messages
    Route::get('/conversations', [ConversationController::class, 'index']);
    Route::get('/conversations/{conversation}/messages', [ConversationController::class, 'messages']);
    Route::post('/conversations/{conversation}/messages', [ConversationController::class, 'storeMessage']);

    // Invoices
    Route::get('/invoices', [InvoiceController::class, 'index']);
    Route::post('/invoices', [InvoiceController::class, 'store']);
    Route::patch('/invoices/{invoice}', [InvoiceController::class, 'update']);

    // Businesses / teams
    Route::post('/businesses', [BusinessController::class, 'store']);
    Route::get('/businesses/me', [BusinessController::class, 'me']);
    Route::patch('/businesses/{business}', [BusinessController::class, 'update']);
    Route::post('/businesses/{business}/invite', [BusinessController::class, 'invite']);
    Route::get('/businesses/{business}/calendar', [BusinessController::class, 'calendar']);
    Route::get('/businesses/{business}/payroll', [BusinessController::class, 'payrollIndex']);
    Route::post('/businesses/{business}/payroll', [BusinessController::class, 'payrollStore']);
    Route::patch('/businesses/{business}/payroll/{payrollEntry}', [BusinessController::class, 'payrollUpdate']);
});
