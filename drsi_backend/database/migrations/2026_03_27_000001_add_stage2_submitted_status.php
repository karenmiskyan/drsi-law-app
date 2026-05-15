<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE applications MODIFY COLUMN status ENUM('draft', 'stage1_submitted', 'pending_i130', 'stage2_unlocked', 'stage2_submitted', 'completed') DEFAULT 'draft'");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE applications MODIFY COLUMN status ENUM('draft', 'stage1_submitted', 'pending_i130', 'stage2_unlocked', 'completed') DEFAULT 'draft'");
    }
};
