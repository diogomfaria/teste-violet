import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Farmer, FarmerDocument } from '../schemas/farmer.schema';

export interface CreateFarmerDto {
  fullName: string;
  cpf: string;
  birthDate?: Date;
  phone?: string;
  active?: boolean;
}

export interface UpdateFarmerDto extends Partial<Omit<CreateFarmerDto, 'cpf'>> {}

interface DeleteResult {
  success: boolean;
  message?: string;
}

interface DeactivateResult {
  success: boolean;
  data?: Farmer;
  message?: string;
}

@Injectable()
export class FarmersService {
  constructor(
    @InjectModel(Farmer.name) private farmerModel: Model<FarmerDocument>,
  ) {}

  async create(createFarmerDto: CreateFarmerDto): Promise<Farmer> {
    const createdFarmer = new this.farmerModel({
      ...createFarmerDto,
      active: createFarmerDto.active !== false, // Default to true if not provided
    });
    return createdFarmer.save();
  }

  async findAll(activeOnly = true): Promise<Farmer[]> {
    const query = activeOnly ? { active: true } : {};
    return this.farmerModel.find(query).sort({ fullName: 1 }).exec();
  }

  async search(query: any): Promise<Farmer[]> {
    return this.farmerModel.find(query).sort({ fullName: 1 }).exec();
  }

  async findOne(id: string): Promise<Farmer | null> {
    return this.farmerModel.findById(id).exec();
  }

  async findByCpf(cpf: string): Promise<Farmer | null> {
    return this.farmerModel.findOne({ cpf }).exec();
  }

  async update(
    id: string,
    updateFarmerDto: UpdateFarmerDto & { cpf?: string },
  ): Promise<Farmer | null> {
    // Cria uma cópia do DTO para evitar modificar o objeto original
    const { cpf, ...updateData } = updateFarmerDto;
    
    // Se não houver campos para atualizar, retorna o agricultor atual
    if (Object.keys(updateData).length === 0) {
      return this.farmerModel.findById(id).exec();
    }
    
    // Atualiza apenas os campos fornecidos, ignorando o CPF
    const updatedFarmer = await this.farmerModel
      .findByIdAndUpdate(
        id, 
        { $set: updateData },
        { new: true, runValidators: true }
      )
      .exec();
    
    return updatedFarmer;
  }

  async remove(id: string): Promise<DeleteResult> {
    const farmer = await this.farmerModel.findById(id).exec();
    
    if (!farmer) {
      return { success: false, message: 'Farmer not found' };
    }
    
    // Verifica se o agricultor pode ser excluído (active === false)
    if (farmer.active) {
      return { 
        success: false, 
        message: 'Cannot delete an active farmer. Please deactivate first.' 
      };
    }
    
    const result = await this.farmerModel.deleteOne({ _id: id }).exec();
    return { 
      success: result.deletedCount > 0,
      message: result.deletedCount > 0 ? 'Farmer deleted successfully' : 'Failed to delete farmer'
    };
  }

  async deactivate(id: string): Promise<DeactivateResult> {
    const farmer = await this.farmerModel.findByIdAndUpdate(
      id,
      { active: false },
      { new: true },
    ).exec();
    
    if (!farmer) {
      return { success: false, message: 'Farmer not found' };
    }
    
    return { 
      success: true, 
      data: farmer,
      message: 'Farmer deactivated successfully' 
    };
  }
}
