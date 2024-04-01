FROM node:19.5.0-alpine

WORKDIR /app

# Встановлення pnpm через npm
RUN npm install -g pnpm

# Копіюємо pnpm-lock.yaml та всі інші файли з проекту
COPY pnpm-lock.yaml package.json ./
COPY . .

# Встановлюємо залежності з флагом --prod, щоб ігнорувати devDependencies

RUN pnpm install --frozen-lockfile --prod

# Видаляємо глобальний prisma, якщо він встановлений
RUN pnpm remove -g prisma || true

ENV SHELL /bin/bash
RUN pnpm setup
RUN pnpm add -g prisma
# Генеруємо моделі prisma
RUN prisma generate

# Копіюємо файл схеми prisma
COPY prisma/schema.prisma ./prisma/

# Використовуємо порт 3000
EXPOSE 3000

# Запускаємо додаток
CMD [ "pnpm", "start" ]

