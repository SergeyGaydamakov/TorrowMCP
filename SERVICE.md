# Запуск MCP сервера в режиме сервиса

Torrow MCP сервер поддерживает два режима работы:
- **Консольный режим (stdio)** - для MCP клиентов (Cursor, Claude Desktop)
- **HTTP режим** - независимый HTTP сервис

## Быстрый старт

**Консольный режим (для MCP клиентов):**
```bash
npm run dev        # разработка
npm run build
npm start          # продакшн
```

**HTTP режим (независимый сервис):**
```bash
npm run dev:http        # разработка
npm run build
npm run start:http      # продакшн
# или с указанием порта
PORT=3000 npm run start:http
```

## Режимы работы

### Консольный режим (stdio)

Используется MCP клиентами (Cursor, Claude Desktop) для запуска сервера как дочернего процесса через стандартный ввод/вывод.

**Разработка:**
```bash
npm run dev
```

**Продакшн:**
```bash
npm run build
npm start
```

Этот режим используется по умолчанию в конфигурации MCP клиентов.

### HTTP режим

Сервер работает как независимый HTTP сервис на порту 3000 (по умолчанию).

**Разработка:**
```bash
npm run dev:http
```

**Продакшн:**
```bash
npm run build
npm run start:http
# или с указанием порта и хоста
PORT=8080 HOST=0.0.0.0 npm run start:http
```

### Конфигурация HTTP сервера

HTTP сервер реализован в файле `src/index-http.ts` и использует общую фабрику серверов `src/serverFactory.ts` для переиспользования логики.

**Основные эндпоинты:**
- `POST /mcp` - основной эндпоинт для MCP запросов
- `GET /mcp` - для server-to-client уведомлений через SSE
- `DELETE /mcp` - для завершения сессии
- `GET /health` - проверка состояния сервера

**Переменные окружения:**
- `PORT` - порт сервера (по умолчанию: 3000)
- `HOST` - хост сервера (по умолчанию: 127.0.0.1)
- `TORROW_API_BASE` - базовый URL API (по умолчанию: https://torrow.net)
- `MCP_SERVER_NAME` - имя сервера (по умолчанию: torrow-mcp-service)
- `DANGEROUSLY_OMIT_AUTH` - если установлен в `1`, позволяет использовать токен из переменных окружения (только для разработки)

**Авторизация:**
- HTTP сервер использует авторизацию по токену согласно стандарту MCP
- Токен передается клиентом в заголовке `Authorization: Bearer <token>`
- При отсутствии или невалидности токена сервер возвращает HTTP 401 с заголовком `WWW-Authenticate: Bearer`

### Настройка клиента для HTTP режима

#### Для Cursor

1. **Запустите HTTP сервер:**
   ```bash
   npm run build
   npm run start:http
   ```

2. **Откройте файл конфигурации MCP:**
   - **Windows**: `%AppData%\Cursor\User\globalStorage\mcp.json`
   - **macOS**: `~/Library/Application Support/Cursor/User/globalStorage/mcp.json`
   - **Linux**: `~/.config/Cursor/User/globalStorage/mcp.json`

3. **Добавьте конфигурацию для HTTP режима:**

```json
{
  "mcpServers": {
    "torrow-mcp-service": {
      "url": "http://localhost:3000/mcp"
    }
  }
}
```

**Важно:** 
- В HTTP режиме токен передается клиентом в заголовке `Authorization: Bearer <token>` согласно стандарту MCP
- Клиент должен включать токен в каждый HTTP запрос к серверу
- При отсутствии токена сервер вернет HTTP 401 Unauthorized

4. **Сохраните и перезапустите Cursor**

#### Для Claude Desktop

В конфигурации Claude Desktop (`claude_desktop_config.json`) используйте HTTP транспорт:

```json
{
  "mcpServers": {
    "torrow-mcp-service": {
      "url": "http://localhost:3000/mcp",
      "headers": {
        "Authorization": "Bearer your_torrow_token_here"
      }
    }
  }
}
```

**Примечание:** Некоторые MCP клиенты могут автоматически передавать токен из конфигурации. Если ваш клиент не поддерживает заголовки напрямую, проверьте документацию клиента для настройки авторизации.

**Важно:** 
- HTTP сервер слушает на `http://127.0.0.1:3000/mcp` по умолчанию
- Порт можно изменить через переменную окружения `PORT` (например: `PORT=8080 npm run start:http`)
- Хост можно изменить через переменную окружения `HOST` (например: `HOST=0.0.0.0 npm run start:http`)
- Health check доступен по адресу `http://127.0.0.1:3000/health`
- **Убедитесь, что HTTP сервер запущен перед использованием в клиенте**

## Запуск как системный сервис

### Windows Service через NSSM

NSSM (Non-Sucking Service Manager) - простой способ создать Windows Service из любого исполняемого файла.

#### Установка NSSM

1. Скачайте NSSM с [официального сайта](https://nssm.cc/download)
2. Распакуйте архив
3. Скопируйте `nssm.exe` в папку с проектом или добавьте в PATH

#### Создание сервиса

```cmd
# От имени администратора
nssm install TorrowMCP "C:\Program Files\nodejs\node.exe"
nssm set TorrowMCP AppDirectory "C:\Sergeyg\Torrow\AI\TorrowMCP"
nssm set TorrowMCP AppParameters "dist\index-http.js"
nssm set TorrowMCP AppEnvironmentExtra "TORROW_TOKEN=your_token_here"
nssm set TorrowMCP Description "Torrow MCP HTTP Service"
nssm set TorrowMCP Start SERVICE_AUTO_START
nssm start TorrowMCP
```

#### Управление сервисом

```cmd
# Запуск
nssm start TorrowMCP

# Остановка
nssm stop TorrowMCP

# Перезапуск
nssm restart TorrowMCP

# Удаление
nssm remove TorrowMCP confirm
```

Или через стандартный интерфейс Windows:
```cmd
services.msc
```

### systemd (Linux)

Для Linux систем можно использовать systemd.

#### Создание unit файла

Создайте файл `/etc/systemd/system/torrow-mcp.service`:

```ini
[Unit]
Description=Torrow MCP HTTP Service
After=network.target

[Service]
Type=simple
User=your-username
WorkingDirectory=/path/to/TorrowMCP
Environment="NODE_ENV=production"
Environment="TORROW_TOKEN=your_token_here"
Environment="TORROW_API_BASE=https://torrow.net"
Environment="MCP_SERVER_NAME=torrow-mcp-service"
Environment="PORT=3000"
Environment="HOST=127.0.0.1"
ExecStart=/usr/bin/node /path/to/TorrowMCP/dist/index-http.js
# Для консольного режима используйте: /path/to/TorrowMCP/dist/index.js
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

#### Управление сервисом

```bash
# Перезагрузка конфигурации
sudo systemctl daemon-reload

# Запуск
sudo systemctl start torrow-mcp

# Остановка
sudo systemctl stop torrow-mcp

# Автозапуск при загрузке
sudo systemctl enable torrow-mcp

# Просмотр статуса
sudo systemctl status torrow-mcp

# Просмотр логов
sudo journalctl -u torrow-mcp -f
```

## Рекомендации

1. **Для разработки**: Используйте `npm run dev`
2. **Для продакшена на Windows**: Используйте NSSM для создания Windows Service
3. **Для продакшена на Linux**: Используйте systemd
4. **Для тестирования**: Используйте `npm start` напрямую

## Важные замечания

- HTTP сервер работает как независимый сервис и доступен по HTTP
- Убедитесь, что переменные окружения правильно настроены
- Для безопасности храните токены в переменных окружения, а не в коде
- По умолчанию сервер слушает только на localhost (127.0.0.1) для безопасности
- Для доступа извне установите `HOST=0.0.0.0` (убедитесь в безопасности!)
