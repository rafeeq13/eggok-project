import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from '../customers/customer.entity';
import { Order } from '../orders/order.entity';
import { Review } from '../reviews/review.entity';
import { Promotion } from '../promotions/promotion.entity';
import { Reward } from '../loyalty/reward.entity';
import { User } from '../users/user.entity';
import { Transaction } from '../payments/transaction.entity';

@Injectable()
export class SeedService {
    constructor(
        @InjectRepository(Customer) private customerRepo: Repository<Customer>,
        @InjectRepository(Order) private orderRepo: Repository<Order>,
        @InjectRepository(Review) private reviewRepo: Repository<Review>,
        @InjectRepository(Promotion) private promoRepo: Repository<Promotion>,
        @InjectRepository(Reward) private rewardRepo: Repository<Reward>,
        @InjectRepository(User) private userRepo: Repository<User>,
        @InjectRepository(Transaction) private txRepo: Repository<Transaction>,
    ) { }

    async clearAll() {
        await this.txRepo.clear();
        await this.orderRepo.clear();
        await this.reviewRepo.clear();
        await this.customerRepo.clear();
        await this.promoRepo.clear();
        await this.rewardRepo.clear();
        await this.userRepo.delete({ role: 'Staff' });
        await this.userRepo.delete({ role: 'Manager' });
    }

    async seedAll() {
        await this.clearAll();

        // 1. Seed Promotions
        await this.promoRepo.save([
            { code: 'WELCOME10', name: 'Welcome 10%', type: 'Percentage', value: '10', minOrder: '15', usageLimit: '100', usedCount: 45, status: 'Active', endDate: '2026-12-31' },
            { code: 'EGGLOVER', name: 'Egg Lover $5', type: 'Fixed Amount', value: '5', minOrder: '20', usageLimit: '50', usedCount: 12, status: 'Active', endDate: '2026-06-30' },
            { code: 'FREEDEL', name: 'Free Delivery', type: 'Fixed Amount', value: '0', minOrder: '25', usageLimit: '200', usedCount: 89, status: 'Active', endDate: '2026-05-15' },
        ]);

        // 2. Seed Users
        await this.userRepo.save([
            { name: 'Berry', email: 'berry@eggok.com', role: 'Manager', status: 'Active', joinDate: new Date('2026-03-01'), lastActive: new Date() },
            { name: 'Steven', email: 'steven@eggok.com', role: 'Manager', status: 'Active', joinDate: new Date('2026-03-02'), lastActive: new Date() },
            { name: 'Alice Staff', email: 'alice@eggok.com', role: 'Staff', status: 'Active', joinDate: new Date('2026-03-10'), lastActive: new Date() },
        ]);

        // 3. Seed Customers (with loyalty data)
        const customers = await this.customerRepo.save([
            { name: 'John Smith', email: 'john@gmail.com', phone: '215-555-0101', totalOrders: 12, totalSpent: 185.50, lastOrder: '2026-03-20', status: 'active', points: 756, totalPointsEarned: 1200, tier: 'Silver', lastActivity: '2026-03-20' },
            { name: 'Sarah Lee', email: 'sarah@gmail.com', phone: '215-555-0102', totalOrders: 8, totalSpent: 142.20, lastOrder: '2026-03-19', status: 'active', points: 340, totalPointsEarned: 620, tier: 'Bronze', lastActivity: '2026-03-18' },
            { name: 'Mike Johnson', email: 'mike@gmail.com', phone: '215-555-0103', totalOrders: 25, totalSpent: 420.00, lastOrder: '2026-03-20', status: 'active', points: 980, totalPointsEarned: 1800, tier: 'Silver', lastActivity: '2026-03-20' },
            { name: 'Emma Davis', email: 'emma@gmail.com', phone: '215-555-0104', totalOrders: 3, totalSpent: 56.40, lastOrder: '2026-03-15', status: 'active', points: 50, totalPointsEarned: 120, tier: 'Bronze', lastActivity: '2026-03-15' },
            { name: 'James Wilson', email: 'james@gmail.com', phone: '215-555-0105', totalOrders: 15, totalSpent: 280.00, lastOrder: '2026-03-20', status: 'active', points: 2340, totalPointsEarned: 4200, tier: 'Gold', lastActivity: '2026-03-20' },
        ]);

        // 4. Seed Loyalty Rewards
        await this.rewardRepo.save([
            { name: '$5 Off Your Order', description: 'Get $5 off any order over $15', pointsCost: 200, type: 'discount', value: '$5', active: true, redemptions: 47 },
            { name: 'Free Signature Sandwich', description: 'Get any signature breakfast sandwich free', pointsCost: 500, type: 'freeItem', value: 'Signature Sandwich', active: true, redemptions: 31 },
            { name: 'Free Delivery', description: 'Free delivery on your next order', pointsCost: 150, type: 'freeDelivery', value: 'Free Delivery', active: true, redemptions: 89 },
        ]);

        // 5. Seed Orders & Transactions
        const orderTypes = ['pickup', 'delivery'];
        const orderStatuses = ['delivered', 'picked_up', 'ready', 'preparing', 'pending'];

        for (let i = 0; i < 30; i++) {
            const cust = customers[Math.floor(Math.random() * customers.length)];
            const type = orderTypes[Math.floor(Math.random() * orderTypes.length)];
            const status = i < 5 ? orderStatuses[Math.floor(Math.random() * 3) + 2] : orderStatuses[Math.floor(Math.random() * 2)];
            const date = new Date();
            date.setDate(date.getDate() - Math.floor(Math.random() * 7)); // Recent 7 days

            const subtotal = Math.floor(Math.random() * 30) + 10;
            const tax = subtotal * 0.08;
            const deliveryFee = type === 'delivery' ? 3.99 : 0;
            const tip = subtotal * 0.15;
            const total = subtotal + tax + deliveryFee + tip;

            const order = await this.orderRepo.save({
                orderNumber: `EO-SEED-${1000 + i}`,
                customerName: cust.name,
                customerEmail: cust.email,
                customerPhone: cust.phone,
                orderType: type,
                status: status,
                subtotal: subtotal,
                tax: tax,
                deliveryFee: deliveryFee,
                tip: tip,
                total: total,
                createdAt: date,
                items: [{ id: 1, name: 'Signature Bacon Egg & Cheese', quantity: 1, price: 11.00 }],
            });

            await this.txRepo.save({
                id: order.orderNumber,
                date: date,
                customer: cust.name,
                type: type === 'pickup' ? 'Pickup' : 'Delivery', // Keep Transaction UI string for now or change to match
                orderTotal: total,
                stripeFee: (total * 0.029) + 0.30,
                deliveryFee: deliveryFee,
                netRevenue: total - ((total * 0.029) + 0.30) - deliveryFee,
                status: 'Paid',
                refundAmount: 0,
            });
        }

        // 6. Seed Reviews
        await this.reviewRepo.save([
            { customer: 'John Smith', email: 'john@gmail.com', rating: 5, title: 'Best breakfast in Philly!', body: 'The Signature Bacon Egg & Cheese is absolutely amazing. The bread is perfectly toasted and the OK sauce is incredible. Will definitely be back!', date: new Date('2026-03-20'), orderType: 'Pickup', orderId: 'EO-1001', status: 'Published', reply: '', repliedAt: '' },
            { customer: 'Sarah Lee', email: 'sarah@gmail.com', rating: 4, title: 'Great food, fast delivery', body: 'Nashville Hot Chicken sandwich was delicious. Delivery was quick and food arrived hot. Only minor issue was the packaging could be better.', date: new Date('2026-03-19'), orderType: 'Delivery', orderId: 'EO-0997', status: 'Published', reply: 'Thank you Sarah! We appreciate your feedback on the packaging — we are always looking to improve!', repliedAt: '2026-03-19' },
            { customer: 'Liam Martinez', email: 'liam@gmail.com', rating: 1, title: 'Very disappointed', body: 'Food was cold when it arrived and the order was wrong. I ordered a veggie burrito and got a meat one. Very disappointing.', date: new Date('2026-03-14'), orderType: 'Delivery', orderId: 'EO-0975', status: 'Flagged', reply: '', repliedAt: '' },
        ]);
    }
}
