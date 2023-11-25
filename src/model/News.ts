import { IsString } from "class-validator";
import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';

@Entity()
export class News {
    @PrimaryGeneratedColumn('uuid')
    public id: string

    @Column({
        type: 'longtext',
        default : null,
        nullable : true,
    })
    @IsString()
    public image: string
    
    @Column()
    @IsString()
    public title: string
    
    @Column({
        type: 'longtext'
    })
    @IsString()
    public description: string


    @Column({
        default: null,
        nullable: true
    })
    @IsString()
    public date : Date

    @Column({
        default: null,
        nullable: true
    })
    @IsString()
    public view : string


    @CreateDateColumn()
    public createdAt: Date

    @UpdateDateColumn()
    public updatedAt: Date

    @DeleteDateColumn()
    public deletedAt: Date

}
