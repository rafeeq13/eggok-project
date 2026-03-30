import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './order.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
  ) {}

  private generateOrderNumber(): string {
    const prefix = 'EO';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}-${timestamp}-${random}`;
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
    return this.ordersRepository.save(order);
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
    return this.getOrderById(id);
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
}