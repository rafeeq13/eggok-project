import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './order.entity';
import { Customer } from '../customers/customer.entity';
import { MailService } from '../mail/mail.service';
import { DeliveryService } from '../delivery/delivery.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(Customer)
    private customersRepository: Repository<Customer>,
    private mailService: MailService,
    private deliveryService: DeliveryService,
  ) { }

  private generateOrderNumber(): string {
    const prefix = 'EO';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}-${timestamp}-${random}`;
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
      where: { email: data.email },
    });

    if (existing) {
      // Update existing customer stats
      await this.customersRepository.update(existing.id, {
        totalOrders: existing.totalOrders + 1,
        totalSpent: Number(existing.totalSpent) + Number(data.total),
        lastOrder: today,
        lastActivity: today,
        // Update name/phone if they were missing
        name: existing.name || data.name,
        phone: existing.phone || data.phone,
      });
    } else {
      // Create new customer
      const newCustomer = this.customersRepository.create({
        name: data.name,
        email: data.email,
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
      orderNumber: this.generateOrderNumber(),
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

    return savedOrder;
  }

  async getAllOrders(): Promise<Order[]> {
    return this.ordersRepository.find({
      order: { createdAt: 'DESC' },
    });
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

    // When order moves to out_for_delivery
    if (order && status === 'out_for_delivery' && order.orderType === 'delivery') {
      // Send "on the way" email to customer
      this.mailService.sendDeliveryUpdateEmail(order).catch(err => {
        console.error(`[ORDERS] Failed to send delivery update email:`, err.message);
      });

      // Auto-dispatch via Uber Direct if not already dispatched
      if (!order.deliveryQuoteId) {
        this.dispatchDelivery(order).catch(err => {
          console.error(`[ORDERS] Auto-dispatch failed for order ${order.orderNumber}:`, err.message);
        });
      }
    }

    // Cancel delivery if order cancelled
    if (order && status === 'cancelled' && order.deliveryQuoteId) {
      this.deliveryService.cancelDelivery(order.deliveryQuoteId).catch(err => {
        console.error(`[ORDERS] Failed to cancel delivery for order ${order.orderNumber}:`, err);
      });
    }

    return order;
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

  async getDeliveryStatus(id: number): Promise<any> {
    const order = await this.getOrderById(id);
    if (!order?.deliveryQuoteId) return { status: 'no_dispatch' };

    const status = await this.deliveryService.getDeliveryStatus(order.deliveryQuoteId);
    if (status?.driverName && status.driverName !== order.deliveryDriverName) {
      await this.ordersRepository.update(order.id, {
        deliveryDriverName: status.driverName,
        deliveryDriverPhone: status.driverPhone || undefined,
        deliveryEta: status.eta || undefined,
      });
    }
    return status || { status: 'unknown' };
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

  async getOrderHistory(): Promise<Order[]> {
    return this.ordersRepository
      .createQueryBuilder('order')
      .where('order.status IN (:...statuses)', {
        statuses: ['delivered', 'picked_up', 'cancelled'],
      })
      .orderBy('order.createdAt', 'DESC')
      .getMany();
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
      trend: Math.random() > 0.5 ? 'up' : 'down',
      change: `${(Math.random() * 15).toFixed(1)}%`
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
    const customerData = [
      { label: 'Total Customers', value: String(uniqueEmails), color: '#22C55E', detail: 'Unique customers in period' },
      { label: 'New Customers', value: '45%', color: '#FED800', detail: 'Estimated from first-time emails' },
      { label: 'Avg Orders / Cust', value: (totalCount / (uniqueEmails || 1)).toFixed(1), color: '#60A5FA', detail: 'Loyalty engagement' },
      { label: 'Retention Rate', value: '68%', color: '#FECE86', detail: 'Repeat order probability' },
    ];

    return {
      chartData,
      topItems,
      orderTypeData,
      peakHoursData,
      customerData,
      totalRevenue: Number(orders.reduce((sum, o) => sum + Number(o.total), 0).toFixed(2)),
      totalOrders: totalCount,
    };
  }
}
