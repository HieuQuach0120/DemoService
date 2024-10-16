import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity()
export class User {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id?: number;

  @Column()
  userName?: string;

  @Column()
  passWord?: string;

  @Column()
  phoneNumber?: string;

  @Column()
  email?: string;
}
