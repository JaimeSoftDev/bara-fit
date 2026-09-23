<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('trainer_profiles', function (Blueprint $table) {
            $table->foreignId('business_id')->nullable()->after('user_id')->constrained('businesses')->nullOnDelete();
            $table->enum('business_role', ['owner', 'staff'])->nullable()->after('business_id');
            $table->string('logo_url')->nullable()->after('brand_color');
        });
    }

    public function down(): void
    {
        Schema::table('trainer_profiles', function (Blueprint $table) {
            $table->dropConstrainedForeignId('business_id');
            $table->dropColumn(['business_role', 'logo_url']);
        });
    }
};
