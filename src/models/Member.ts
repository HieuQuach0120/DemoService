import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity()
export class Member {
  @PrimaryGeneratedColumn({ type: "bigint" })
  id?: number;

  @Column()
  name?: string;

  @Column()
  description?: string;
}
