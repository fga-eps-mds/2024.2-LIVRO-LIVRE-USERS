import { Injectable } from '@nestjs/common';
import { Post } from 'libs/database/entities/post.entity';
import { PostRepository } from 'libs/database/repositories/post.repository';
import { CreatePostDto } from './dtos/createPost.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PostsService {
  constructor(private postRepository: PostRepository) {}

  async create(data: CreatePostDto, userId: string): Promise<Post> {
    return this.postRepository.create({
      id: uuidv4(),
      userId,
      ...data,
    });
  }

  findAll(): Promise<Post[]> {
    return this.postRepository.findAll();
  }

  findOne(id: string): Promise<Post | null> {
    return this.postRepository.findOneById(id);
  }

  async remove(id: string): Promise<void> {
    await this.postRepository.remove(id);
  }
}
