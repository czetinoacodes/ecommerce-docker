<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PaymentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'order_id' => $this->order_id,
            'method' => $this->method,
            'amount' => $this->amount,
            'status' => $this->status,
            'paid_at' => $this->paid_at,

            //'created_at' => $this->created_at,
            //'updated_at' => $this->updated_at,
        ];
    }
}
