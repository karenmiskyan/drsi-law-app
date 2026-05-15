{{-- Phase 3.4: Audit log viewer — shows every admin edit with old → new diff --}}
<div class="space-y-3">
    @if($logs->isEmpty())
        <p class="text-sm text-gray-500 italic">No edits recorded for this application.</p>
    @else
        <p class="text-xs text-gray-500">
            Showing the most recent {{ $logs->count() }} change(s). Newest first.
        </p>
        <div class="divide-y divide-gray-200 border border-gray-200 rounded-md overflow-hidden">
            @foreach($logs as $log)
                <div class="px-4 py-3 bg-white text-sm">
                    <div class="flex items-center justify-between mb-1">
                        <span class="font-mono text-xs text-[#b72b2b] font-semibold">{{ $log->field_path }}</span>
                        <span class="text-xs text-gray-500">
                            {{ $log->created_at->format('M d, Y H:i') }}
                            @if($log->user)
                                · by {{ $log->user->name ?? $log->user->email }}
                            @endif
                        </span>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div class="rounded bg-red-50 px-3 py-2 break-words">
                            <div class="text-red-700 font-semibold mb-1">Old</div>
                            <div class="text-gray-800 whitespace-pre-wrap">{{ $log->old_value ?? '—' }}</div>
                        </div>
                        <div class="rounded bg-green-50 px-3 py-2 break-words">
                            <div class="text-green-700 font-semibold mb-1">New</div>
                            <div class="text-gray-800 whitespace-pre-wrap">{{ $log->new_value ?? '—' }}</div>
                        </div>
                    </div>
                </div>
            @endforeach
        </div>
    @endif
</div>
