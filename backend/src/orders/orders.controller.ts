import { Controller, Get, Post, Patch, Param, Body, ParseIntPipe, Query } from '@nestjs/common';

import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) { }

  @Post()
  createOrder(@Body() data: any) {
    return this.ordersService.createOrder(data);
  }

  @Get()
  getAllOrders() {
    return this.ordersService.getAllOrders();
  }

  @Get('search')
  searchOrder(@Query('q') q: string) {
    return this.ordersService.searchOrder(q);
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

  @Get('stats/historical')
  getHistoricalStats(@Query('days') days?: string) {
    return this.ordersService.getHistoricalStats(days ? +days : 30);
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

  @Post(':id/dispatch')
  dispatchDelivery(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.getOrderById(id).then(order => {
      if (!order) throw new Error('Order not found');
      return this.ordersService.dispatchDelivery(order);
    });
  }

  @Get(':id/delivery-quote')
  getDeliveryQuote(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.getDeliveryQuote(id);
  }

  @Post(':id/cancel-delivery')
  cancelDelivery(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.cancelDeliveryDispatch(id);
  }

  @Get(':id/delivery-status')
  getDeliveryStatus(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.getDeliveryStatus(id);
  }

  // Uber Direct webhook
  @Post('webhooks/uber')
  handleUberWebhook(@Body() payload: any) {
    this.ordersService.handleDeliveryWebhook(payload).catch(err => {
      console.error('[WEBHOOK] Error processing:', err.message);
    });
    return { status: 'ok' };
  }
}