import bcrypt from 'bcryptjs';
import { IsString, validateOrReject, IsUppercase, IsBoolean, IsOptional } from 'class-validator';
import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert, BeforeUpdate, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, OneToOne, OneToMany, JoinColumn, ManyToOne } from 'typeorm';
// import { UserDetail } from './UserDetail';
// import { ParalympicEvent } from './ParalympicEvent';
// import { Reimbursement } from './Reimbursement'

// import { StructurPosition } from './StructurPosition';




@Entity()
export class User{
    @PrimaryGeneratedColumn('uuid')
    public id: string


    @Column({
        default: null,
        nullable: true
    })
    @IsString()
    public username: string

    
    @Column({
        default: null,
        nullable: true
    })
    @IsString()
    public image: string
    
    
    @Column({
        default: null,
        nullable: true
    })
    @IsString()
    @IsOptional()
    public password: string
    
    @Column({
        default: null,
        nullable: true,
        unique: true,

    })
    @IsString()
    public email: string
    

    @CreateDateColumn()
    public createdAt: Date

    @UpdateDateColumn()
    public updatedAt: Date

    @DeleteDateColumn()
    public deletedAt: Date

    public hashPassword() {
        this.password = bcrypt.hashSync(this.password, 8)
    }

    public checkIfPasswordMatch(unencryptedPassword: string): boolean {
        return bcrypt.compareSync(unencryptedPassword, this.password)
    }



    // @OneToMany(() => UserDetail, (buat) => buat.user, {onDelete: 'CASCADE'})
    // public buat: UserDetail

    // @OneToOne(() => UserDetail, (user_detail) => user_detail.user, {onDelete: 'CASCADE'})
    // public user_detail: UserDetail
    


    @BeforeInsert()
    @BeforeUpdate()
    async validate() {
        
        await validateOrReject(this);
    }
    
}