<?php

namespace App\Filament\Widgets;

use App\Models\Application;
use Filament\Widgets\StatsOverviewWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class ApplicationStatsWidget extends StatsOverviewWidget
{
    protected function getStats(): array
    {
        return [
            Stat::make('Total Applications', Application::count())
                ->icon('heroicon-o-document-text')
                ->color('gray'),

            Stat::make('Drafts', Application::where('status', 'draft')->count())
                ->icon('heroicon-o-pencil-square')
                ->color('gray'),

            Stat::make('Stage 1 Submitted', Application::where('status', 'stage1_submitted')->count())
                ->icon('heroicon-o-inbox-arrow-down')
                ->color('warning'),

            Stat::make('Pending I-130', Application::where('status', 'pending_i130')->count())
                ->icon('heroicon-o-clock')
                ->color('info'),

            Stat::make('Stage 2 Unlocked', Application::where('status', 'stage2_unlocked')->count())
                ->icon('heroicon-o-lock-open')
                ->color('success'),

            Stat::make('Completed', Application::where('status', 'completed')->count())
                ->icon('heroicon-o-check-circle')
                ->color('primary'),
        ];
    }
}
