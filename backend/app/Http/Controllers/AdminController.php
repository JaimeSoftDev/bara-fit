<?php

namespace App\Http\Controllers;

use App\Http\Resources\AdminBusinessResource;
use App\Http\Resources\AdminTrainerResource;
use App\Models\Business;
use App\Models\ClientProfile;
use App\Models\Invoice;
use App\Models\TrainerProfile;
use App\Models\User;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function overview(Request $request)
    {
        return response()->json([
            'businessCount' => Business::count(),
            'independentTrainerCount' => TrainerProfile::whereNull('business_id')->count(),
            'trainerCount' => TrainerProfile::count(),
            'clientCount' => ClientProfile::count(),
            'totalRevenue' => (float) Invoice::where('status', 'paid')->sum('amount'),
        ]);
    }

    public function businesses(Request $request)
    {
        $businesses = Business::with('owner', 'trainerProfiles.user')->orderByDesc('id')->get();

        return AdminBusinessResource::collection($businesses);
    }

    public function businessShow(Request $request, Business $business)
    {
        $business->load('owner', 'trainerProfiles.user');

        return new AdminBusinessResource($business);
    }

    public function trainers(Request $request)
    {
        $trainers = TrainerProfile::whereNull('business_id')->with('user')->orderByDesc('user_id')->get();

        return AdminTrainerResource::collection($trainers);
    }

    public function trainerShow(Request $request, User $trainer)
    {
        abort_unless($trainer->trainerProfile && $trainer->trainerProfile->business_id === null, 404);

        $trainer->trainerProfile->setRelation('user', $trainer);

        return new AdminTrainerResource($trainer->trainerProfile);
    }
}
