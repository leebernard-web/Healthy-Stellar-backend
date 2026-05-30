import {
  Resolver,
  Query,
  Mutation,
  Args,
  ID,
  Context,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { InputType, Field } from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MedicalRecord } from '../types/medical-record.type';
import { Patient } from '../types/patient.type';
import { GqlAuthGuard } from '../guards/gql-auth.guard';
import { DataloaderService } from '../dataloader.service';
import { RecordsService } from '../../records/services/records.service';
import { Record as RecordEntity } from '../../records/entities/record.entity';
import DataLoader from 'dataloader';

@InputType()
export class AddRecordInput {
  @Field()
  patientId: string;

  @Field()
  cid: string;

  @Field()
  recordType: string;

  @Field({ nullable: true })
  stellarTxHash?: string;
}

@Resolver(() => MedicalRecord)
@UseGuards(GqlAuthGuard)
export class MedicalRecordResolver {
  constructor(
    private readonly recordsService: RecordsService,
    private readonly dataloaderService: DataloaderService,
    @InjectRepository(RecordEntity)
    private readonly recordRepo: Repository<RecordEntity>,
  ) {}

  @Query(() => MedicalRecord, { nullable: true })
  async record(
    @Args('id', { type: () => ID }) id: string,
    @Context() ctx: { req: { user: { sub: string } } },
  ): Promise<MedicalRecord | null> {
    try {
      const r = await this.recordsService.findOne(id, ctx.req.user.sub);
      return this.toGqlType(r, ctx.req.user.sub);
    } catch {
      return null;
    }
  }

  @Query(() => [MedicalRecord])
  async records(
    @Args('patientId', { type: () => ID }) patientId: string,
    @Context() ctx: { req: { user: { sub: string } } },
  ): Promise<MedicalRecord[]> {
    const result = await this.recordsService.findAll({ patientId } as any);
    return result.data.map((r) => this.toGqlType(r, ctx.req.user.sub));
  }

  @Mutation(() => MedicalRecord)
  async addRecord(
    @Args('input') input: AddRecordInput,
    @Context() ctx: { req: { user: { sub: string } } },
  ): Promise<MedicalRecord> {
    const saved = await this.recordRepo.save(
      this.recordRepo.create({
        patientId: input.patientId,
        cid: input.cid,
        recordType: input.recordType as any,
        stellarTxHash: input.stellarTxHash,
        providerId: ctx.req.user.sub,
      }),
    );
    return this.toGqlType(saved, ctx.req.user.sub);
  }

  // DataLoader field resolver — prevents N+1 when querying patient on each record
  @ResolveField(() => Patient, { nullable: true })
  async patient(
    @Parent() record: MedicalRecord,
    @Context() ctx: { patientLoader: DataLoader<string, Patient> },
  ): Promise<Patient | null> {
    return ctx.patientLoader.load(record.patientId);
  }

  private toGqlType(r: RecordEntity, uploadedBy: string): MedicalRecord {
    return {
      id: r.id,
      patientId: r.patientId,
      cid: r.cid,
      recordType: r.recordType as string,
      stellarTxHash: r.stellarTxHash,
      uploadedBy,
      createdAt: r.createdAt,
      updatedAt: r.createdAt,
    };
  }
}
