import { IsString, IsEmail, IsEnum, IsOptional, IsNumber, IsArray, IsBoolean, Min, ValidateNested } from 'class-validator';
import { Type, Transform } from 'class-transformer';

class OrderItemDto {
  @IsNumber()
  @Type(() => Number)
  id: number;

  @IsString()
  name: string;

  @IsNumber()
  @Type(() => Number)
  @Min(0)
  price: number;

  @IsNumber()
  @Type(() => Number)
  @Min(1)
  quantity: number;

  @IsOptional()
  @IsArray()
  modifiers?: any[];

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value ?? undefined)
  specialInstructions?: string;
}

export class CreateOrderDto {
  @IsString()
  customerName: string;

  @IsEmail()
  customerEmail: string;

  @IsString()
  customerPhone: string;

  @IsEnum(['pickup', 'delivery'])
  orderType: string;

  @IsEnum(['asap', 'scheduled'])
  scheduleType: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value ?? undefined)
  scheduledDate?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value ?? undefined)
  scheduledTime?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value ?? undefined)
  deliveryAddress?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value ?? undefined)
  deliveryApt?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value ?? undefined)
  deliveryInstructions?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @IsNumber()
  @Type(() => Number)
  @Min(0)
  subtotal: number;

  @IsNumber()
  @Type(() => Number)
  @Min(0)
  tax: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  deliveryFee?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  tip?: number;

  @IsNumber()
  @Type(() => Number)
  @Min(0)
  total: number;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value ?? undefined)
  promoCode?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  discount?: number;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value ?? undefined)
  notes?: string;

  @IsOptional()
  @IsBoolean()
  isAuthenticated?: boolean;
}
