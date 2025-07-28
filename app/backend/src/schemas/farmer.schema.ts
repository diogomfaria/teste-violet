import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { CpfValidator } from '../common/utils/cpf.validator';

export type FarmerDocument = Farmer & Document;

@Schema({
  timestamps: true,
  collection: 'farmers', // Nome da coleção no MongoDB
})
export class Farmer {
  @Prop({
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
  })
  fullName: string;

  @Prop({
    type: String,
    required: [true, 'CPF is required'],
    unique: true,
    trim: true,
    set: (value: string) => value.replace(/[^\d]/g, ''), // Remove formatação
    validate: {
      validator: function(v: string) {
        return CpfValidator.validate(v);
      },
      message: props => `${props.value} is not a valid CPF!`
    }
  })
  cpf: string;

  @Prop({
    type: Date,
    default: null,
  })
  birthDate?: Date;

  @Prop({
    type: String,
    default: null,
    trim: true,
  })
  phone?: string;

  @Prop({
    type: Boolean,
    default: true,
    index: true, // Para melhorar consultas por status
  })
  active: boolean;

  // Método para verificar se o agricultor pode ser excluído
  canBeDeleted(): boolean {
    return !this.active;
  }
}

export const FarmerSchema = SchemaFactory.createForClass(Farmer);

// Índice para melhorar buscas por CPF
FarmerSchema.index({ cpf: 1 }, { unique: true });
