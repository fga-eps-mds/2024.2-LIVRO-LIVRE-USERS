import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from '../entities/post.entity';
import { IPost } from 'libs/types/post.type';

@Injectable()
export class PostRepository {
  constructor(
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
  ) {}

  async create(data: IPost): Promise<Post> {
    const post = this.postsRepository.create(data);
    await this.postsRepository.save(post);
    return post;
  }

  findAll(): Promise<Post[]> {
    return this.postsRepository.find();
  }

  findOneById(id: string): Promise<Post | null> {
    return this.postsRepository.createQueryBuilder().where({ id }).getOne()
  }

  findOneByUserId(userId: string): Promise<Post | null> {
    return this.postsRepository.createQueryBuilder().where({ userId }).getOne()
  }

  async remove(id: string): Promise<void> {
    await this.postsRepository.delete(id);
  }
}
