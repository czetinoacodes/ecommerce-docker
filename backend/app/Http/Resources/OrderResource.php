<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'status' => $this->status,
            'total' => $this->total,
            'user_name' => $this->whenLoaded('user', fn() => $this->user->name),
            'items' => OrderItemResource::collection(
                $this->whenLoaded('orderItems')
            ),
            'payment_method' => $this->whenLoaded('payment', fn() => $this->payment->method),
            //'created_at' => $this->created_at,
            //'updated_at' => $this->updated_at,
        ];
    }
}
