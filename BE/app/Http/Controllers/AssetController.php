<?php

namespace App\Http\Controllers;

use App\Models\Asset;
use Illuminate\Http\Request;

class AssetController extends Controller
{
    public function index()
    {
        return response()->json(Asset::all());
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'required|string|max:255',
            'purchase_date' => 'required|date',
            'price' => 'required|numeric',
            'condition' => 'required|in:good,fair,broken',
            'location' => 'required|string|max:255',
        ]);

        $asset = Asset::create([
            'code' => 'AST-' . strtoupper(uniqid()),
            'name' => $request->name,
            'category' => $request->category,
            'purchase_date' => $request->purchase_date,
            'price' => $request->price,
            'condition' => $request->condition,
            'location' => $request->location,
        ]);

        return response()->json($asset, 201);
    }

    public function show($id)
    {
        $asset = Asset::find($id);
        if (!$asset) return response()->json(['message' => 'Asset not found'], 404);
        return response()->json($asset);
    }

    public function update(Request $request, $id)
    {
        $asset = Asset::find($id);
        if (!$asset) return response()->json(['message' => 'Asset not found'], 404);

        $asset->update($request->all());
        return response()->json($asset);
    }

    public function destroy($id)
    {
        $asset = Asset::find($id);
        if (!$asset) return response()->json(['message' => 'Asset not found'], 404);

        $asset->delete();
        return response()->json(['message' => 'Asset deleted successfully']);
    }
}
