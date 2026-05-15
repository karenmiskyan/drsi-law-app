<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    /**
     * Create the sole administrator account.
     */
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'meir@drsi.com'],
            [
                'name' => 'Meir Sklar',
                'password' => Hash::make('admin123'),
            ],
        );

        $this->command->info('Admin user created: meir@drsi.com');
    }
}
