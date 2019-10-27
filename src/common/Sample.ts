import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'
@Entity({ name: 'Sample' })
export class Sample {
  @PrimaryGeneratedColumn()
  id: number
  @Column()
  title: string
  @Column()
  content: string
}