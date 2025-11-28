# Быстрая настройка подключения к Torrow MCP серверу

## Шаг 1: Подготовка проекта

```bash
# Установка зависимостей
npm install

# Создание .env файла
cp env.example .env

# Редактирование .env - добавьте ваш токен
# TORROW_TOKEN=your_torrow_token_here

# Сборка проекта
npm run build
```

## Шаг 2: Настройка клиента

### Claude Desktop

1. Откройте файл: `%AppData%\Claude\claude_desktop_config.json` (Windows) или `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS/Linux)

2. Добавьте конфигурацию (замените путь на ваш):

```json
{
  "mcpServers": {
    "torrow-mcp-service": {
      "command": "node",
      "args": ["C:\\Sergeyg\\Torrow\\AI\\TorrowMCP\\dist\\index.js"],
      "env": {
        "TORROW_API_BASE": "https://torrow.net",
        "TORROW_TOKEN": "your_torrow_token_here"
      }
    }
  }
}
```

3. Перезапустите Claude Desktop

### Cursor

1. Откройте настройки MCP в Cursor
2. Добавьте аналогичную конфигурацию
3. Перезапустите Cursor

## Шаг 3: Проверка

После перезапуска клиента проверьте:
- Доступность инструментов (tools) Torrow
- Доступность ресурсов (resources) Torrow  
- Доступность промптов (prompts) Torrow

## Важные замечания

- Используйте **абсолютный путь** к `dist/index.js`
- На Windows используйте двойные обратные слеши `\\` или прямые `/`
- Токен можно указать в `env` или в файле `.env` в корне проекта
- Убедитесь, что проект собран (`npm run build`)

## Отладка

Если сервер не подключается:

```bash
# Проверка сборки
npm run build

# Запуск инспектора для отладки
npm run inspector
```

## Альтернатива: режим разработки

Для разработки можно использовать TypeScript напрямую:

```json
{
  "mcpServers": {
    "torrow-mcp-service": {
      "command": "npx",
      "args": ["tsx", "C:\\Sergeyg\\Torrow\\AI\\TorrowMCP\\src\\index.ts"],
      "env": {
        "TORROW_TOKEN": "your_torrow_token_here"
      }
    }
  }
}
```

