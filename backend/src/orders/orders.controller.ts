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

  /**
   * Post-payment fallback. Frontend calls this after Stripe.confirmCardPayment
   * succeeds; if the Stripe webhook hasn't run yet, this creates the order from
   * the PaymentIntent's metadata. Idempotent on paymentIntentId — safe to call
   * even if the webhook already created the order.
   *
   * Legacy clients can still pass orderNumber instead.
   */
  @Post('confirm-payment')
  async confirmPayment(@Body() body: { orderNumber?: string; paymentIntentId?: string }) {
    if (body.paymentIntentId) {
      return this.ordersService.createOrderFromPayment(body.paymentIntentId);
    }
    if (body.orderNumber) {
      return this.ordersService.confirmOrderPayment(body.orderNumber);
    }
    throw new NotFoundException('paymentIntentId or orderNumber required');
  }

  /**
   * Place an order paid entirely by gift card. Used when the gift card balance
   * covers the whole total — there's no Stripe leg because the remaining charge
   * would be below Stripe's $0.50 PaymentIntent minimum.
   */
  @Post('place-with-gift-card')
  placeWithGiftCard(@Body() body: any) {
    return this.ordersService.placeOrderWithGiftCard(body);
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

  /**
   * Admin endpoint: view orders stuck in various states.
   */
  @Get('stuck')
  @UseGuards(AdminGuard)
  getStuckOrders() {
    return this.ordersService.getStuckOrders();
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
    if (order.orderType !== 'delivery' || !order.deliveryAddress) {
      return { error: 'Not a delivery order or missing delivery address' };
    }
    try {
      const result = await this.ordersService.dispatchDelivery(order);
      return result;
    } catch (err: any) {
      const message = err?.message || 'Dispatch failed';
      console.error(`[DISPATCH] Error dispatching order ${id}:`, message);
      return { error: message };
    }
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
