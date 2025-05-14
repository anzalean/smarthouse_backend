import createHttpError from 'http-errors';
import swaggerUI from 'swagger-ui-express';
import fs from 'node:fs';

import { SWAGGER_PATH } from '../constants/constants.js';

const options = {
  explorer: true,
  docExpansion: 'none', // Відображення описів (none, list, full)
  displayOperationId: true, // Відображення operationId для кожного маршруту
  defaultModelsExpandDepth: 1, // Відображення схем за замовчуванням
  defaultModelExpandDepth: 1, // Рівень розширення моделей
  defaultModelRendering: 'model', // Відображення моделі чи коду прикладу
  displayRequestDuration: true, // Відображення тривалості запиту
  };

export const swaggerDocs = () => {
  try {
    const swaggerDoc = JSON.parse(fs.readFileSync(SWAGGER_PATH).toString());
    return [...swaggerUI.serve, swaggerUI.setup(swaggerDoc, options)];
  } catch (err) {
    return (req, res, next) =>
      next(createHttpError(500, "Can't load swagger docs", { error: err }));
  }
};
