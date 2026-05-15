<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Phase 3.1b: support multiple uploads per document type.
 *
 * Meir asked: "can i add documents that are not on the list? Like if i have 4 passports,
 * can i just click 'add passport'?"
 *
 * Adds `document_index` — a per-type counter so a client can upload e.g. two "pet-other-passport"
 * rows by sending document_type='pet-other-passport', document_index=0 then document_index=1.
 *
 * The old index on (application_id, document_type) is replaced with a three-column index
 * so lookups stay fast.
 */
return new class extends Migration {
    public function up(): void
    {
        Schema::table('documents', function (Blueprint $table) {
            $table->unsignedInteger('document_index')->default(0)->after('document_type');
        });

        // Drop the old (application_id, document_type) index if it exists, then create the new one.
        // Wrap in try/catch because SQLite (used in tests) doesn't always name indexes the same way.
        try {
            Schema::table('documents', function (Blueprint $table) {
                $table->dropIndex(['application_id', 'document_type']);
            });
        } catch (\Throwable $e) {
            // Index didn't exist — safe to ignore
        }

        Schema::table('documents', function (Blueprint $table) {
            $table->index(['application_id', 'document_type', 'document_index']);
        });
    }

    public function down(): void
    {
        Schema::table('documents', function (Blueprint $table) {
            try {
                $table->dropIndex(['application_id', 'document_type', 'document_index']);
            } catch (\Throwable $e) {
                // ignore
            }
            $table->dropColumn('document_index');
            $table->index(['application_id', 'document_type']);
        });
    }
};
