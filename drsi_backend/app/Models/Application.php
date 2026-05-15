<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Application extends Model
{
    protected $fillable = [
        'user_id',
        'status',
        'form_data',
        'stage1_submitted_at',
    ];

    protected function casts(): array
    {
        return [
            'form_data' => 'array',
            'stage1_submitted_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function documents(): HasMany
    {
        return $this->hasMany(Document::class);
    }

    // Phase 3.4: audit trail for admin edits
    public function auditLogs(): HasMany
    {
        return $this->hasMany(ApplicationAuditLog::class)->orderByDesc('created_at');
    }
}
