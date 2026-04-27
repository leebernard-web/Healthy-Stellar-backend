import {
  IsString,
  IsEnum,
  IsDateString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsUUID,
  IsNotEmpty,
  MaxLength,
  Min,
  Max,
} from 'class-validator';
import { AppointmentType, MedicalPriority } from '../entities/appointment.entity';

export class CreateAppointmentDto {
  @IsUUID()
  @IsNotEmpty()
  patientId: string;

  @IsUUID()
  @IsNotEmpty()
  doctorId: string;

  @IsDateString()
  appointmentDate: string;

  @IsNumber()
  @Min(15)
  @Max(240)
  duration: number;

  @IsEnum(AppointmentType)
  type: AppointmentType;

  @IsEnum(MedicalPriority)
  priority: MedicalPriority;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  specialty?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  reason?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;

  @IsOptional()
  @IsBoolean()
  isTelemedicine?: boolean;
}
