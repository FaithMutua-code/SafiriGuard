<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\SaccoResource;
use App\Models\Sacco;
use Illuminate\Http\Request;

class SaccoController extends Controller
{
    public function index()
    {
        return SaccoResource::collection(Sacco::orderBy('name')->get());
    }

    public function store(Request $request)
    {
        //
    }

    public function show(Sacco $sacco)
    {
        //
    }

    public function update(Request $request, Sacco $sacco)
    {
        //
    }

    public function destroy(Sacco $sacco)
    {
        //
    }
}
