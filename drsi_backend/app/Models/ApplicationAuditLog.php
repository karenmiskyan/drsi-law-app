<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ApplicationAuditLog extends Model
{
    protected $table = 'application_audit_log';

    protected $fillable = [
        'application_id',
        'user_id',
        'field_path',
        'old_value',
        'new_value',
    ];

    public function application(): BelongsTo
    {
        return $this->belongsTo(Application::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
