<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;

class TripController extends Controller
{
    public function index()
    {
        return response()->json(['trips' => []]);
    }
    public function show($id)
    {
        return response()->json(['trip' => null]);
    }
}
