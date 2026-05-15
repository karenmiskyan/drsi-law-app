<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Document extends Model
{
    protected $fillable = [
        'application_id',
        'document_type',
        'document_index',
        'file_path',
        'original_name',
        'mime_type',
        'size',
        'needs_translation',
        'admin_comment',
        'document_status',
    ];

    protected function casts(): array
    {
        return [
            'needs_translation' => 'boolean',
            'size' => 'integer',
            'document_index' => 'integer',
        ];
    }

    public function application(): BelongsTo
    {
        return $this->belongsTo(Application::class);
    }
}
