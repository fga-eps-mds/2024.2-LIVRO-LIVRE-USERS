import { Repository } from 'typeorm';

export type MockType<T> = {
  [P in keyof T]?: jest.Mock<any>;
};

export const repositoryMockFactory: () => MockType<Repository<any>> = jest.fn(
  () => ({
    findOne: jest.fn((entity) => entity),
    findBy: jest.fn((entity) => entity),
    findOneBy: jest.fn((entity) => entity),
    find: jest.fn((entity) => entity),
    save: jest.fn((entity) => entity),
    create: jest.fn((entity) => entity),
    update: jest.fn((entity, values) => ({ ...entity, ...values })),
    createQueryBuilder: jest.fn((entity) => entity),
  }),
);
