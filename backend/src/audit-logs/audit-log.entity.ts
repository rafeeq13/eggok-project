import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn()
  id: number;

  // Admin who performed the action — captured from the AdminGuard's req.user.
  // Stored denormalised (name + role) so logs stay readable even if the user
  // is later deleted or renamed.
  @Index()
  @Column({ nullable: true })
  userId: string;

  @Column({ nullable: true })
  userName: string;

  @Column({ nullable: true })
  userRole: string;

  // What happened — short verb-style label e.g. ADDED, UPDATED, DELETED,
  // TOGGLED, LINKED, UNLINKED. Indexed so the admin UI can filter by action.
  @Index()
  @Column()
  action: string;

  // What kind of thing changed — Category, Item, Modifier, Upsell, etc.
  @Index()
  @Column()
  target: string;

  // Free-form description: "Zinger Burger → Buns (1 modifier)" etc.
  @Column({ type: 'text', nullable: true })
  detail: string;

  // Origin IP, mostly for security review. Optional.
  @Column({ nullable: true })
  ipAddress: string;

  @CreateDateColumn()
  createdAt: Date;
}
