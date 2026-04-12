import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './order.entity';
import { Customer } from '../customers/customer.entity';
import { MailService } from '../mail/mail.service';
import { DeliveryService } from '../delivery/delivery.service';
import { PaymentsService } from '../payments/payments.service';
import { LoyaltyService } from '../loyalty/loyalty.service';
import { SquareService } from '../square/square.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(Customer)
    private customersRepository: Repository<Customer>,
    private mailService: MailService,
    private deliveryService: DeliveryService,
    private paymentsService: PaymentsService,
    private loyaltyService: LoyaltyService,
    private squareService: SquareService,
  ) { }

  private async generateOrderNumber(): Promise<string> {
    for (let attempt = 0; attempt < 3; attempt++) {
      const last = await this.ordersRepository
        .createQueryBuilder('order')
        .orderBy('order.id', 'DESC')
        .getOne();
      const next = (last ? last.id + 1 : 1) + attempt;
      const orderNumber = `EO-${next.toString().padStart(4, '0')}`;
      const exists = await this.ordersRepository.findOne({ where: { orderNumber } });
      if (!exists) return orderNumber;
    }
    // Fallback with timestamp
    return `EO-${Date.now().toString().slice(-6)}`;
  }

  /**
   * Upsert a customer record based on email.
   * - If customer doesn't exist → create them.
   * - If customer exists → increment totalOrders, add to totalSpent, update lastOrder.
   */
  private async upsertCustomer(data: {
    name: string;
    email: string;
    phone: string;
    total: number;
    orderNumber: string;
  }): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    const existing = await this.customersRepository.findOne({
      where: { email: data.email.toLowerCase().trim() },
    });

    if (existing) {
      // Atomic increment to avoid race conditions
      await this.customersRepository
        .createQueryBuilder()
        .update()
        .set({
          totalOrders: () => '"totalOrders" + 1',
          totalSpent: () => `"totalSpent" + ${Number(data.total)}`,
          lastOrder: today,
          lastActivity: today,
          name: existing.name || data.name,
          phone: existing.phone || data.phone,
        })
        .where('id = :id', { id: existing.id })
        .execute();
    } else {
      const newCustomer = this.customersRepository.create({
        name: data.name,
        email: data.email.toLowerCase().trim(),
        phone: data.phone,
        totalOrders: 1,
        totalSpent: Number(data.total),
        lastOrder: today,
        lastActivity: today,
        points: 0,
        totalPointsEarned: 0,
        tier: 'Bronze',
        redemptions: 0,
        status: 'Active',
      });
      await this.customersRepository.save(newCustomer);
    }
  }

  async createOrder(data: any): Promise<Order> {
    const order = this.ordersRepository.create({
      orderNumber: await this.generateOrderNumber(),
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone,
      orderType: data.orderType,
      scheduleType: data.scheduleType,
      scheduledDate: data.scheduledDate || null,
      scheduledTime: data.scheduledTime || null,
      deliveryAddress: data.deliveryAddress || null,
      deliveryApt: data.deliveryApt || null,
      deliveryInstructions: data.deliveryInstructions || null,
      items: data.items || [],
      subtotal: data.subtotal,
      tax: data.tax,
      deliveryFee: data.deliveryFee || 0,
      tip: data.tip || 0,
      total: data.total,
      promoCode: data.promoCode || null,
      discount: data.discount || 0,
      notes: data.notes || null,
      status: 'pending',
    });
    const savedOrder = await this.ordersRepository.save(order);

    // Only upsert customer record for authenticated (signed-up/signed-in) users.
    // Guest checkout orders should NOT create entries in the Customers table.
    if (data.isAuthenticated) {
      this.upsertCustomer({
        name: data.customerName,
        email: data.customerEmail,
        phone: data.customerPhone,
        total: data.total,
        orderNumber: savedOrder.orderNumber,
      }).catch(err => {
        console.error('Failed to upsert customer record:', err);
      });
    }

    // Send emails asynchronously
    this.mailService.sendOrderConfirmation(savedOrder).catch(err => {
      console.error('Failed to send order confirmation email:', err);
    });
    this.mailService.sendOwnerNotification(savedOrder).catch(err => {
      console.error('Failed to send owner notification email:', err);
    });

    // Award loyalty points for authenticated users
    if (data.isAuthenticated && data.customerEmail) {
      this.loyaltyService.getLoyaltySettings().then(settings => {
        if (!settings.loyaltyEnabled) return;
        this.customersRepository.findOne({ where: { email: data.customerEmail } })
          .then(customer => {
            if (customer) {
              const multiplier = LoyaltyService.getTierMultiplier(customer.tier);
              const basePoints = Math.floor(Number(data.total) * (settings.pointsPerDollar || 1));
              const pointsEarned = Math.floor(basePoints * multiplier);
              const history = Array.isArray(customer.pointsHistory) ? customer.pointsHistory : [];
              const desc = multiplier > 1
                ? `Order ${savedOrder.orderNumber} (${multiplier}x ${customer.tier} bonus)`
                : `Order ${savedOrder.orderNumber}`;
              history.unshift({ description: desc, points: pointsEarned, type: 'earned', date: new Date().toISOString() });
              if (history.length > 100) history.length = 100;
              const newTotalEarned = (customer.totalPointsEarned || 0) + pointsEarned;
              const newTier = LoyaltyService.calculateTier(newTotalEarned);
              this.customersRepository.update(customer.id, {
                points: (customer.points || 0) + pointsEarned,
                totalPointsEarned: newTotalEarned,
                tier: newTier,
                pointsHistory: history,
              });
            }
          })
          .catch(() => {});
      }).catch(() => {});
    }

    // Record payment transaction
    this.paymentsService.recordTransaction({
      orderNumber: savedOrder.orderNumber,
      customer: savedOrder.customerName,
      type: savedOrder.orderType === 'delivery' ? 'Delivery' : 'Pickup',
      orderTotal: Number(savedOrder.total),
      deliveryFee: Number(savedOrder.deliveryFee),
      tip: Number(savedOrder.tip) || 0,
    }).catch(err => {
      console.error('Failed to record transaction:', err.message);
    });

    // Sync order to Square POS for kitchen printing
    this.squareService.syncOrder({
      orderNumber: savedOrder.orderNumber,
      customerName: savedOrder.customerName,
      customerEmail: savedOrder.customerEmail,
      customerPhone: savedOrder.customerPhone,
      orderType: savedOrder.orderType,
      items: savedOrder.items,
      subtotal: Number(savedOrder.subtotal),
      tax: Number(savedOrder.tax),
      deliveryFee: Number(savedOrder.deliveryFee),
      tip: Number(savedOrder.tip) || 0,
      total: Number(savedOrder.total),
      deliveryAddress: savedOrder.deliveryAddress,
      notes: savedOrder.notes,
    }).then(result => {
      if (result?.squareOrderId) {
        this.ordersRepository.update(savedOrder.id, { squareOrderId: result.squareOrderId });
      }
    }).catch(err => {
      console.error('Failed to sync order to Square:', err.message);
    });

    return savedOrder;
  }

  async getAllOrders(page = 1, limit = 50): Promise<{ data: Order[]; total: number; page: number; limit: number }> {
    const [data, total] = await this.ordersRepository.findAndCount({
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, limit };
  }

  async getOrderById(id: number): Promise<Order | null> {
    return this.ordersRepository.findOne({ where: { id } });
  }

  async getOrderByNumber(orderNumber: string): Promise<Order | null> {
    return this.ordersRepository.findOne({ where: { orderNumber } });
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | null> {
    await this.ordersRepository.update(id, { status });
    const order = await this.getOrderById(id);
    if (!order) return null;

    // Sync status to Square POS
    if (order.squareOrderId) {
      this.squareService.updateOrderState(order.squareOrderId, status).catch(() => {});
    }

    // Send status update emails for all transitions
    const emailStatuses = ['confirmed', 'preparing', 'ready'];
    if (emailStatuses.includes(status)) {
      this.mailService.sendOrderStatusEmail(order, status).catch(() => {});
    }

    // Out for delivery
    if (status === 'out_for_delivery' && order.orderType === 'delivery') {
      this.mailService.sendDeliveryUpdateEmail(order).catch(() => {});
      if (!order.deliveryQuoteId) {
        this.dispatchDelivery(order).catch(err => {
          console.error(`[ORDERS] Auto-dispatch failed for ${order.orderNumber}:`, err.message);
        });
      }
    }

    // Delivered (delivery orders)
    if (status === 'delivered' && order.orderType === 'delivery') {
      this.mailService.sendDeliveryCompletedEmail(order).catch(() => {});
    }

    // Picked up (pickup orders)
    if (status === 'picked_up') {
      this.mailService.sendPickupCompleteEmail(order).catch(() => {});
    }

    // Cancelled
    if (status === 'cancelled') {
      this.mailService.sendOrderCancelledEmail(order).catch(() => {});
      if (order.deliveryQuoteId) {
        this.deliveryService.cancelDelivery(order.deliveryQuoteId).catch(err => {
          console.error(`[ORDERS] Failed to cancel delivery:`, err);
        });
      }
    }

    return order;
  }

  // Get delivery quote (cost estimate before dispatch)
  async getDeliveryQuote(id: number): Promise<any> {
    const order = await this.getOrderById(id);
    if (!order || order.orderType !== 'delivery' || !order.deliveryAddress) {
      return { error: 'Not a delivery order' };
    }

    const quote = await this.deliveryService.getQuote({
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      deliveryAddress: order.deliveryAddress,
      deliveryApt: order.deliveryApt,
      deliveryInstructions: order.deliveryInstructions,
      items: order.items,
      total: Number(order.total),
      orderNumber: order.orderNumber,
    });

    if (!quote) return { error: 'Could not get quote from Uber Direct' };
    return { fee: quote.fee, eta: quote.eta, currency: quote.currency };
  }

  async dispatchDelivery(order: Order): Promise<Order | null> {
    if (order.orderType !== 'delivery' || !order.deliveryAddress) {
      return order;
    }

    const result = await this.deliveryService.createDelivery({
      id: order.id,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      deliveryAddress: order.deliveryAddress,
      deliveryApt: order.deliveryApt,
      deliveryInstructions: order.deliveryInstructions,
      items: order.items,
      total: Number(order.total),
    });

    if (result) {
      await this.ordersRepository.update(order.id, {
        deliveryProvider: result.provider,
        deliveryQuoteId: result.quoteId,
        deliveryTrackingUrl: result.trackingUrl,
        deliveryEta: result.eta,
      });
      return this.getOrderById(order.id);
    }

    return order;
  }

  // Cancel an active delivery
  async cancelDeliveryDispatch(id: number): Promise<{ success: boolean; message: string }> {
    const order = await this.getOrderById(id);
    if (!order?.deliveryQuoteId) return { success: false, message: 'No active delivery to cancel' };

    const cancelled = await this.deliveryService.cancelDelivery(order.deliveryQuoteId);
    if (cancelled) {
      await this.ordersRepository.update(id, {
        deliveryProvider: undefined,
        deliveryQuoteId: undefined,
        deliveryTrackingUrl: undefined,
        deliveryDriverName: undefined,
        deliveryDriverPhone: undefined,
        deliveryEta: undefined,
      });
      return { success: true, message: 'Delivery cancelled successfully' };
    }
    return { success: false, message: 'Failed to cancel delivery with Uber' };
  }

  async getDeliveryStatus(id: number): Promise<any> {
    const order = await this.getOrderById(id);
    if (!order?.deliveryQuoteId) return { status: 'no_dispatch' };

    const status = await this.deliveryService.getDeliveryStatus(order.deliveryQuoteId);
    if (!status) return { status: 'unknown' };

    // Update order with latest driver info
    const updates: any = {};
    if (status.driverName && status.driverName !== order.deliveryDriverName) updates.deliveryDriverName = status.driverName;
    if (status.driverPhone && status.driverPhone !== order.deliveryDriverPhone) updates.deliveryDriverPhone = status.driverPhone;
    if (status.eta && status.eta !== order.deliveryEta) updates.deliveryEta = status.eta;
    if (Object.keys(updates).length > 0) {
      await this.ordersRepository.update(order.id, updates);
    }

    // Auto-complete order if Uber says delivered
    const mappedStatus = this.deliveryService.mapUberStatusToOrderStatus(status.uberStatus || status.status);
    if (mappedStatus === 'delivered' && order.status !== 'delivered') {
      await this.ordersRepository.update(order.id, { status: 'delivered' });
      console.log(`[ORDERS] Auto-completed order ${order.orderNumber} (Uber status: delivered)`);
      // Send delivered email
      const freshOrder = await this.getOrderById(order.id);
      if (freshOrder) {
        this.mailService.sendDeliveryCompletedEmail(freshOrder).catch(() => {});
      }
    }

    // Send driver assigned email (first time driver appears)
    if (status.driverName && !order.deliveryDriverName) {
      this.mailService.sendDriverAssignedEmail(order, status.driverName, status.eta).catch(() => {});
    }

    return status;
  }

  // Handle webhook from Uber Direct
  async handleDeliveryWebhook(payload: any): Promise<void> {
    const externalId = payload.data?.external_id || payload.external_id;
    const uberStatus = payload.data?.status || payload.status;
    const deliveryId = payload.data?.id || payload.id;

    if (!externalId && !deliveryId) {
      console.log('[WEBHOOK] No external_id or delivery_id in payload');
      return;
    }

    // Find order by orderNumber (external_id) or deliveryQuoteId
    let order: Order | null = null;
    if (externalId) {
      order = await this.ordersRepository.findOne({ where: { orderNumber: externalId } });
    }
    if (!order && deliveryId) {
      order = await this.ordersRepository.findOne({ where: { deliveryQuoteId: deliveryId } });
    }
    if (!order) {
      console.log(`[WEBHOOK] Order not found for external_id=${externalId}, delivery_id=${deliveryId}`);
      return;
    }

    console.log(`[WEBHOOK] Order ${order.orderNumber}: Uber status=${uberStatus}`);

    // Update driver info
    const courier = payload.data?.courier || payload.courier;
    const updates: any = {};
    if (courier?.name) updates.deliveryDriverName = courier.name;
    if (courier?.phone_number) updates.deliveryDriverPhone = courier.phone_number;
    if (payload.data?.dropoff_eta) updates.deliveryEta = payload.data.dropoff_eta;
    if (payload.data?.tracking_url) updates.deliveryTrackingUrl = payload.data.tracking_url;

    // Map Uber status to order status
    const mappedStatus = this.deliveryService.mapUberStatusToOrderStatus(uberStatus);
    if (mappedStatus && mappedStatus !== order.status) {
      updates.status = mappedStatus;
      console.log(`[WEBHOOK] Order ${order.orderNumber}: status ${order.status} → ${mappedStatus}`);
    }

    if (Object.keys(updates).length > 0) {
      await this.ordersRepository.update(order.id, updates);
    }

    // Send emails based on status
    const freshOrder = await this.getOrderById(order.id);
    if (!freshOrder) return;

    if (courier?.name && !order.deliveryDriverName) {
      this.mailService.sendDriverAssignedEmail(freshOrder, courier.name, payload.data?.dropoff_eta).catch(() => {});
    }
    if (mappedStatus === 'delivered' && order.status !== 'delivered') {
      this.mailService.sendDeliveryCompletedEmail(freshOrder).catch(() => {});
    }
  }

  async searchOrder(query: string): Promise<Order | null> {
    if (!query) return null;
    const q = query.trim();
    // Search by order number
    const byNumber = await this.ordersRepository.findOne({ where: { orderNumber: q } });
    if (byNumber) return byNumber;
    // Search with EO- prefix
    if (!q.startsWith('EO-')) {
      const byPrefix = await this.ordersRepository.findOne({ where: { orderNumber: `EO-${q}` } });
      if (byPrefix) return byPrefix;
    }
    // Search by numeric ID
    const numId = Number(q);
    if (!isNaN(numId)) {
      const byId = await this.ordersRepository.findOne({ where: { id: numId } });
      if (byId) return byId;
    }
    // Search by email - return most recent
    const byEmail = await this.ordersRepository.findOne({
      where: { customerEmail: q.toLowerCase() },
      order: { createdAt: 'DESC' },
    });
    return byEmail;
  }

  async getActiveOrders(): Promise<Order[]> {
    return this.ordersRepository
      .createQueryBuilder('order')
      .where('order.status IN (:...statuses)', {
        statuses: ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery'],
      })
      .orderBy('order.createdAt', 'ASC')
      .getMany();
  }

  async getScheduledOrders(): Promise<Order[]> {
    return this.ordersRepository
      .createQueryBuilder('order')
      .where('order.scheduleType = :type', { type: 'scheduled' })
      .andWhere('order.status NOT IN (:...statuses)', {
        statuses: ['delivered', 'picked_up', 'cancelled'],
      })
      .orderBy('order.scheduledDate', 'ASC')
      .getMany();
  }

  async getOrderHistory(page = 1, limit = 50): Promise<{ data: Order[]; total: number; page: number; limit: number }> {
    const [data, total] = await this.ordersRepository.findAndCount({
      where: [
        { status: 'delivered' },
        { status: 'picked_up' },
        { status: 'cancelled' },
      ],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, limit };
  }

  async cancelOrder(id: number): Promise<Order | null> {
    return this.updateOrderStatus(id, 'cancelled');
  }

  async getTodayStats(): Promise<any> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const orders = await this.ordersRepository
      .createQueryBuilder('order')
      .where('order.createdAt >= :today', { today })
      .andWhere('order.status != :status', { status: 'cancelled' })
      .getMany();

    const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total), 0);
    const avgOrder = orders.length > 0 ? totalRevenue / orders.length : 0;

    return {
      totalOrders: orders.length,
      totalRevenue: totalRevenue.toFixed(2),
      avgOrderValue: avgOrder.toFixed(2),
      pendingOrders: orders.filter(o => o.status === 'pending').length,
    };
  }

  async getHistoricalStats(days: number = 30): Promise<any> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const orders = await this.ordersRepository
      .createQueryBuilder('order')
      .where('order.createdAt >= :startDate', { startDate })
      .andWhere('order.status != :status', { status: 'cancelled' })
      .getMany();

    const dailyData: Record<string, { revenue: number, orders: number }> = {};
    orders.forEach(o => {
      const date = o.createdAt.toISOString().split('T')[0];
      if (!dailyData[date]) dailyData[date] = { revenue: 0, orders: 0 };
      dailyData[date].revenue += Number(o.total);
      dailyData[date].orders += 1;
    });

    const chartData = Object.entries(dailyData).map(([date, data]) => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      revenue: Number(data.revenue.toFixed(2)),
      orders: data.orders,
      rawDate: date
    })).sort((a, b) => a.rawDate.localeCompare(b.rawDate));

    const itemMap: Record<string, { orders: number, revenue: number }> = {};
    orders.forEach(o => {
      const items = Array.isArray(o.items) ? o.items : [];
      items.forEach((item: any) => {
        const name = item.name || 'Unknown Item';
        if (!itemMap[name]) itemMap[name] = { orders: 0, revenue: 0 };
        itemMap[name].orders += item.quantity || 1;
        itemMap[name].revenue += (item.price || 0) * (item.quantity || 1);
      });
    });

    const topItems = Object.entries(itemMap).map(([name, data]) => ({
      name,
      orders: data.orders,
      revenue: Number(data.revenue.toFixed(2)),
      trend: data.orders > 0 ? 'up' : 'neutral',
      change: '0%'
    })).sort((a, b) => b.revenue - a.revenue).slice(0, 10);

    const pickupCount = orders.filter(o => o.orderType?.toLowerCase() === 'pickup').length;
    const deliveryCount = orders.filter(o => o.orderType?.toLowerCase() === 'delivery').length;
    const totalCount = orders.length;

    const orderTypeData = [
      { name: 'Pickup', value: totalCount > 0 ? Math.round((pickupCount / totalCount) * 100) : 60, color: '#FED800' },
      { name: 'Delivery', value: totalCount > 0 ? Math.round((deliveryCount / totalCount) * 100) : 40, color: '#60A5FA' },
    ];

    const hourMap: Record<number, number> = {};
    for (let i = 0; i < 24; i++) hourMap[i] = 0;
    orders.forEach(o => {
      const hour = o.createdAt.getHours();
      hourMap[hour] += 1;
    });
    const peakHoursData = Object.entries(hourMap).map(([hour, count]) => {
      const h = parseInt(hour);
      const ampm = h < 12 ? 'am' : 'pm';
      const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
      return { hour: `${h12}${ampm}`, orders: count, rawHour: h };
    }).sort((a, b) => a.rawHour - b.rawHour);

    const uniqueEmails = new Set(orders.map(o => o.customerEmail)).size;

    // Calculate actual new vs returning customers
    const emailOrderCounts: Record<string, number> = {};
    orders.forEach(o => {
      const email = o.customerEmail?.toLowerCase();
      if (email) emailOrderCounts[email] = (emailOrderCounts[email] || 0) + 1;
    });
    const singleOrderCustomers = Object.values(emailOrderCounts).filter(c => c === 1).length;
    const repeatCustomers = Object.values(emailOrderCounts).filter(c => c > 1).length;
    const newCustomerPct = uniqueEmails > 0 ? Math.round((singleOrderCustomers / uniqueEmails) * 100) : 0;
    const retentionPct = uniqueEmails > 0 ? Math.round((repeatCustomers / uniqueEmails) * 100) : 0;

    const customerData = [
      { label: 'Total Customers', value: String(uniqueEmails), color: '#22C55E', detail: 'Unique customers in period' },
      { label: 'New Customers', value: `${newCustomerPct}%`, color: '#FED800', detail: `${singleOrderCustomers} first-time customers` },
      { label: 'Avg Orders / Cust', value: (totalCount / (uniqueEmails || 1)).toFixed(1), color: '#60A5FA', detail: 'Loyalty engagement' },
      { label: 'Retention Rate', value: `${retentionPct}%`, color: '#FECE86', detail: `${repeatCustomers} repeat customers` },
    ];

    return {
      chartData,
      topItems,
      orderTypeData,
      peakHoursData,
      customerData,
      totalRevenue: Number(orders.reduce((sum, o) => sum + Number(o.total), 0).toFixed(2)),
      totalTips: Number(orders.reduce((sum, o) => sum + (Number(o.tip) || 0), 0).toFixed(2)),
      totalOrders: totalCount,
    };
  }
}
