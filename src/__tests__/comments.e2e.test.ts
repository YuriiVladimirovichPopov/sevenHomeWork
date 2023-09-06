const request = require('supertest');
const app = require('../app'); // Замените на путь к вашему Express приложению

describe('Tests for /posts/:postId/comments', () => {
  it('should return 404 when trying to get comments for a non-existent post', async () => {
    const response = await request(app).get('/posts/nonExistentPostId/comments');
    expect(response.status).toBe(404);
  });

  it('should return a list of comments when getting comments for an existing post', async () => {
    // Замените 'existingPostId' на существующий идентификатор поста
    const response = await request(app).get('/posts/existingPostId/comments');
    expect(response.status).toBe(200);
    expect(response.body).toEqual(expect.any(Array)); // Убедитесь, что в ответе массив комментариев
  });

  it('should return 404 when trying to create a comment for a non-existent post', async () => {
    const response = await request(app).post('/posts/nonExistentPostId/comments').send({ /* ваше тело комментария */ });
    expect(response.status).toBe(404);
  });

  it('should create a comment for an existing post', async () => {
    // Замените 'existingPostId' на существующий идентификатор поста
    const response = await request(app)
      .post('/posts/existingPostId/comments')
      .send({ /* ваше тело комментария */ });
    expect(response.status).toBe(201); // 201 - код успешного создания ресурса
    expect(response.body).toEqual(expect.objectContaining({ /* ожидаемые свойства комментария */ }));
  });
});
