import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { FarmersService, CreateFarmerDto, UpdateFarmerDto } from './farmers.service';
import { Farmer } from '../schemas/farmer.schema';

@Controller('farmers')
export class FarmersController {
  constructor(private readonly farmersService: FarmersService) {}

  @Post()
  async create(@Body() createFarmerDto: CreateFarmerDto): Promise<Farmer> {
    try {
      // Verifica se já existe um agricultor com o mesmo CPF
      const existingFarmer = await this.farmersService.findByCpf(createFarmerDto.cpf);
      if (existingFarmer) {
        throw new HttpException('CPF already registered', HttpStatus.CONFLICT);
      }
      
      return await this.farmersService.create(createFarmerDto);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Error creating farmer', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get()
  async findAll(@Query('includeInactive') includeInactive: string): Promise<Farmer[]> {
    const activeOnly = includeInactive !== 'true';
    return this.farmersService.findAll(!activeOnly);
  }

  @Get('search')
  async search(
    @Query('q') query: string,
    @Query('status') status?: 'active' | 'inactive',
  ): Promise<Farmer[]> {
    try {
      const searchQuery: any = {};
      
      // Filtro por status
      if (status === 'active') {
        searchQuery.active = true;
      } else if (status === 'inactive') {
        searchQuery.active = false;
      }
      
      // Filtro por nome ou CPF
      if (query) {
        const searchTerm = query.trim();
        const isCpf = /^\d{11}$/.test(searchTerm) || /^\d{3}\.?\d{3}\.?\d{3}\-?\d{2}$/.test(searchTerm);
        
        if (isCpf) {
          // Remove formatação do CPF para busca
          const cleanCpf = searchTerm.replace(/[^\d]/g, '');
          searchQuery.cpf = cleanCpf;
        } else {
          // Busca por nome (case insensitive)
          searchQuery.fullName = { $regex: searchTerm, $options: 'i' };
        }
      }
      
      return this.farmersService.search(searchQuery);
    } catch (error) {
      throw new HttpException(
        'Error searching farmers',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Farmer> {
    const farmer = await this.farmersService.findOne(id);
    if (!farmer) {
      throw new HttpException('Farmer not found', HttpStatus.NOT_FOUND);
    }
    return farmer;
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateFarmerDto: UpdateFarmerDto & { cpf?: string },
  ): Promise<Farmer> {
    try {
      // Cria uma cópia do DTO para evitar modificar o objeto original
      const { cpf, ...updateData } = updateFarmerDto;
      
      // Se não houver campos para atualizar, retorna o agricultor sem fazer nada
      if (Object.keys(updateData).length === 0) {
        const farmer = await this.farmersService.findOne(id);
        if (!farmer) {
          throw new HttpException('Farmer not found', HttpStatus.NOT_FOUND);
        }
        return farmer;
      }
      
      const updatedFarmer = await this.farmersService.update(id, updateData);
      if (!updatedFarmer) {
        throw new HttpException('Farmer not found', HttpStatus.NOT_FOUND);
      }
      return updatedFarmer;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error updating farmer',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    try {
      const result = await this.farmersService.remove(id);
      
      if (!result.success) {
        throw new HttpException(
          result.message || 'Failed to delete farmer',
          result.message?.includes('not found') ? HttpStatus.NOT_FOUND : HttpStatus.BAD_REQUEST
        );
      }
      
      return { message: result.message || 'Farmer deleted successfully' };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error deleting farmer',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post(':id/deactivate')
  async deactivate(@Param('id') id: string): Promise<{ message: string; data?: Farmer }> {
    try {
      const result = await this.farmersService.deactivate(id);
      
      if (!result.success) {
        throw new HttpException(
          result.message || 'Failed to deactivate farmer',
          result.message?.includes('not found') ? HttpStatus.NOT_FOUND : HttpStatus.BAD_REQUEST
        );
      }
      
      return { 
        message: result.message || 'Farmer deactivated successfully',
        data: result.data 
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error deactivating farmer',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
