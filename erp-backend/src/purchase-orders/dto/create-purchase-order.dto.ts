import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsOptional,
  IsInt,
  IsArray,
  ValidateNested,
  IsNumber,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

// नेस्टेड DTO: हर एक आइटम के लिए वैलिडेशन रूल्स
class CreatePurchaseOrderItemDto {
  @IsInt()
  @IsNotEmpty()
  item_id: number;

  @IsNumber()
  @Min(1)
  ordered_qty: number;

  @IsNumber()
  @Min(0)
  unit_price: number;

  // ✅ UOM (Unit of Measurement) property जोड़ी गई
  @IsString()
  @IsOptional()
  uom?: string;
}

// मुख्य DTO: Purchase Order बनाने के लिए
export class CreatePurchaseOrderDto {
  @IsString()
  @IsOptional()
  po_number?: string;

  @IsInt()
  @IsNotEmpty()
  supplier_id: number;

  // ✅ Warehouse ID property जोड़ी गई
  @IsInt()
  @IsNotEmpty({ message: 'A warehouse must be selected.' })
  warehouse_id: number;

  @IsDateString()
  @IsNotEmpty()
  order_date: string;

  @IsDateString()
  @IsOptional()
  expected_date?: string;

  @IsString()
  @IsOptional()
  status?: string;

  // आइटम्स की ऐरे और उसके अंदर के ऑब्जेक्ट्स को वैलिडेट करने के लिए
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePurchaseOrderItemDto)
  items: CreatePurchaseOrderItemDto[];
}