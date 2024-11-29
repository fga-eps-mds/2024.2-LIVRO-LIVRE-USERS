import { Module } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { Post } from 'libs/database/entities/post.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostRepository } from 'libs/database/repositories/post.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Post])],
  controllers: [PostsController],
  providers: [PostsService, PostRepository]
})
export class PostsModule {}
