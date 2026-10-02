<?php

namespace App\Services;

use App\Models\DrivingEvent;
use App\Models\Trip;
use App\Models\VehicleOwner;
use Illuminate\Support\Carbon;

class InsightsService
{
    public function getInsights(int $ownerId, string $range = 'week'): array
    {
        $owner = VehicleOwner::find($ownerId);
        if (! $owner) {
            return [];
        }

        $vehicleIds = $owner->vehicles()->pluck('id');
        if ($vehicleIds->isEmpty()) {
            return [];
        }

        [$since, $previousSince, $periodLabel] = $this->getDateRange($range);

        $trips = Trip::whereIn('vehicle_id', $vehicleIds)
            ->where('started_at', '>=', $since)
            ->get();

        if ($trips->isEmpty()) {
            return [];
        }

        $previousTrips = Trip::whereIn('vehicle_id', $vehicleIds)
            ->where('started_at', '>=', $previousSince)
            ->where('started_at', '<', $since)
            ->get();

        $events = DrivingEvent::whereIn('vehicle_id', $vehicleIds)
            ->where('recorded_at', '>=', $since)
            ->get();

        $insights = [];

        // 1. Peak boarding hour
        $hourlyBoardings = $trips->groupBy(fn ($t) => $t->started_at?->format('H') ?? '00')
            ->map(fn ($group) => $group->sum('boardings_estimate'));

        if ($hourlyBoardings->isNotEmpty()) {
            $peakHour = $hourlyBoardings->sortDesc()->keys()->first();
            $peakValue = $hourlyBoardings[$peakHour];
            $nextHour = str_pad(((int) $peakHour + 1) % 24, 2, '0', STR_PAD_LEFT);
            $insights[] = [
                'type'        => 'peak_boarding_hour',
                'title'       => "Peak Hour: {$peakHour}:00\u2013{$nextHour}:00",
                'description' => "Most estimated boardings occur between {$peakHour}:00 and {$nextHour}:00, with approximately {$peakValue} estimated boardings.",
                'priority'    => 'medium',
            ];
        }

        // 2. Busiest day
        $dailyBoardings = $trips->groupBy(fn ($t) => $t->started_at?->format('Y-m-d') ?? 'unknown')
            ->map(fn ($group) => $group->sum('boardings_estimate'));

        $prevAvg = $previousTrips->isNotEmpty()
            ? $previousTrips->sum('boardings_estimate') / max(1, $previousTrips->groupBy(fn ($t) => $t->started_at?->format('Y-m-d'))->count())
            : null;

        if ($dailyBoardings->isNotEmpty() && $prevAvg && $prevAvg > 0) {
            $busiestDay = $dailyBoardings->sortDesc()->keys()->first();
            $busiestValue = $dailyBoardings[$busiestDay];
            $pctAbove = round((($busiestValue - $prevAvg) / $prevAvg) * 100);
            $dayName = Carbon::parse($busiestDay)->format('l');
            $insights[] = [
                'type'        => 'busiest_day',
                'title'       => "Busiest Day: {$dayName}",
                'description' => "Most active day was {$dayName} with an estimated {$busiestValue} boardings, {$pctAbove}% " . ($pctAbove >= 0 ? 'above' : 'below') . ' the previous average.',
                'priority'    => 'medium',
            ];

            // 3. Lowest day
            $lowestDay = $dailyBoardings->sort()->keys()->first();
            $lowestValue = $dailyBoardings[$lowestDay];
            $pctBelow = round((($lowestValue - $prevAvg) / $prevAvg) * 100);
            $lowestDayName = Carbon::parse($lowestDay)->format('l');
            $insights[] = [
                'type'        => 'lowest_day',
                'title'       => "Slowest Day: {$lowestDayName}",
                'description' => "Lowest activity was {$lowestDayName} with an estimated {$lowestValue} boardings, " . abs($pctBelow) . '% ' . ($pctBelow >= 0 ? 'above' : 'below') . ' the previous average.',
                'priority'    => 'low',
            ];
        }

        // 4. Event-prone time window
        if ($events->isNotEmpty()) {
            $hourlyEvents = $events->groupBy(fn ($e) => $e->recorded_at?->format('H') ?? '00')
                ->map(fn ($group) => $group->count())
                ->sortDesc();

            $proneHour = $hourlyEvents->keys()->first();
            $proneCount = $hourlyEvents[$proneHour];
            $proneEnd = str_pad(((int) $proneHour + 2) % 24, 2, '0', STR_PAD_LEFT);
            $insights[] = [
                'type'        => 'event_prone_window',
                'title'       => "Alert Window: {$proneHour}:00\u2013{$proneEnd}:00",
                'description' => "Most driving events ({$proneCount}) occur between {$proneHour}:00 and {$proneEnd}:00. Consider route or timing adjustments.",
                'priority'    => $proneCount > 3 ? 'high' : 'medium',
            ];
        }

        // 5. Revenue trend
        $currentRevenue = $trips->sum('revenue_estimate');
        $previousRevenue = $previousTrips->sum('revenue_estimate');

        if ($previousRevenue > 0) {
            $pctChange = round((($currentRevenue - $previousRevenue) / $previousRevenue) * 100);
            $direction = $pctChange >= 0 ? 'increase' : 'decrease';
            $insights[] = [
                'type'        => 'revenue_trend',
                'title'       => 'Estimated Revenue ' . ucfirst($direction),
                'description' => abs($pctChange) . "% {$direction} in estimated revenue compared to the previous {$periodLabel}.",
                'priority'    => ($direction === 'decrease' && abs($pctChange) > 10) ? 'high' : 'medium',
            ];
        }

        return $insights;
    }

    private function getDateRange(string $range): array
    {
        return match ($range) {
            'today' => [today(), today()->subDay(), 'day'],
            'month' => [now()->subMonth(), now()->subMonths(2), 'month'],
            default => [now()->subWeek(), now()->subWeeks(2), 'week'],
        };
    }
}
