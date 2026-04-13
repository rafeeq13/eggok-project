import { Controller, Get, Post, Patch, Param, Body, ParseIntPipe, Query, UseGuards, NotFoundException } from '@nestjs/common';
import { AdminGuard } from '../auth/admin.guard';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './create-order.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) { }

  @Post()
  createOrder(@Body() data: CreateOrderDto) {
    return this.ordersService.createOrder(data);
  }

  @Get()
  @UseGuards(AdminGuard)
  getAllOrders(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.ordersService.getAllOrders(page ? +page : 1, limit ? +limit : 50);
  }

  @Post('confirm-payment')
  confirmPayment(@Body('orderNumber') orderNumber: string) {
    return this.ordersService.confirmOrderPayment(orderNumber);
  }

  @Get('search')
  @UseGuards(AdminGuard)
  searchOrder(@Query('q') q: string) {
    return this.ordersService.searchOrder(q);
  }

  @Get('track')
  trackOrder(@Query('q') q: string) {
    return this.ordersService.searchOrder(q);
  }

  @Get('active')
  @UseGuards(AdminGuard)
  getActiveOrders() {
    return this.ordersService.getActiveOrders();
  }

  @Get('scheduled')
  @UseGuards(AdminGuard)
  getScheduledOrders() {
    return this.ordersService.getScheduledOrders();
  }

  @Get('history')
  @UseGuards(AdminGuard)
  getOrderHistory(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.ordersService.getOrderHistory(page ? +page : 1, limit ? +limit : 50);
  }

  @Get('stats/today')
  @UseGuards(AdminGuard)
  getTodayStats() {
    return this.ordersService.getTodayStats();
  }

  @Get('stats/historical')
  @UseGuards(AdminGuard)
  getHistoricalStats(@Query('days') days?: string) {
    return this.ordersService.getHistoricalStats(days ? +days : 30);
  }


  @Get(':id')
  getOrderById(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.getOrderById(id);
  }

  @Patch(':id/status')
  @UseGuards(AdminGuard)
  updateStatus(@Param('id', ParseIntPipe) id: number, @Body('status') status: string) {
    return this.ordersService.updateOrderStatus(id, status);
  }

  @Patch(':id/cancel')
  @UseGuards(AdminGuard)
  cancelOrder(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.cancelOrder(id);
  }

  @Post(':id/dispatch')
  @UseGuards(AdminGuard)
  async dispatchDelivery(@Param('id', ParseIntPipe) id: number) {
    const order = await this.ordersService.getOrderById(id);
    if (!order) throw new NotFoundException('Order not found');
    return this.ordersService.dispatchDelivery(order);
  }

  @Get(':id/delivery-quote')
  @UseGuards(AdminGuard)
  getDeliveryQuote(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.getDeliveryQuote(id);
  }

  @Post(':id/cancel-delivery')
  @UseGuards(AdminGuard)
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