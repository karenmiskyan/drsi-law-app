<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Phase 3.4: Audit log for admin edits to application form_data.
 *
 * Meir asked: "how can i as an admin go in the form of editing my client's answers?"
 *
 * This table records every field-level change made via the Filament admin edit page,
 * so we have a paper trail of what was changed, when, and by whom.
 */
return new class extends Migration {
    public function up(): void
    {
        Schema::create('application_audit_log', function (Blueprint $table) {
            $table->id();
            $table->foreignId('application_id')->constrained()->cascadeOnDelete();
            // admin user who made the edit
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            // dot-separated path into form_data (e.g. "petitioner.firstName")
            $table->string('field_path', 500);
            $table->text('old_value')->nullable();
            $table->text('new_value')->nullable();
            $table->timestamps();

            $table->index(['application_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('application_audit_log');
    }
};
