import { Controller, Get, Post, Patch, Param, Body, ParseIntPipe } from '@nestjs/common';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  createOrder(@Body() data: any) {
    return this.ordersService.createOrder(data);
  }

  @Get()
  getAllOrders() {
    return this.ordersService.getAllOrders();
  }

  @Get('active')
  getActiveOrders() {
    return this.ordersService.getActiveOrders();
  }

  @Get('scheduled')
  getScheduledOrders() {
    return this.ordersService.getScheduledOrders();
  }

  @Get('history')
  getOrderHistory() {
    return this.ordersService.getOrderHistory();
  }

  @Get('stats/today')
  getTodayStats() {
    return this.ordersService.getTodayStats();
  }

  @Get(':id')
  getOrderById(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.getOrderById(id);
  }

  @Patch(':id/status')
  updateStatus(@Param('id', ParseIntPipe) id: number, @Body('status') status: string) {
    return this.ordersService.updateOrderStatus(id, status);
  }

  @Patch(':id/cancel')
  cancelOrder(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.cancelOrder(id);
  }
}