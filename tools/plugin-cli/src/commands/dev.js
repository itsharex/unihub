import { spawn } from 'child_process'
import { createServer } from 'net'
import chalk from 'chalk'

/**
 * 检查端口是否可用
 */
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = createServer()
    server.once('error', () => resolve(false))
    server.once('listening', () => {
      server.close(() => resolve(true))
    })
    server.listen(port, '127.0.0.1')
  })
}

/**
 * 从 startPort 开始查找可用端口（最多尝试 20 个）
 */
async function findAvailablePort(startPort) {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) return port
  }
  return startPort // fallback
}

export async function devPlugin(options) {
  const requestedPort = parseInt(options.port, 10) || 5173
  const port = await findAvailablePort(requestedPort)

  if (port !== requestedPort) {
    console.log(chalk.yellow(`端口 ${requestedPort} 已被占用，使用 ${port}\n`))
  }

  console.log(chalk.cyan.bold('\n🚀 启动开发服务器\n'))
  console.log(chalk.gray(`端口: ${port}\n`))

  const dev = spawn('npm', ['run', 'dev'], {
    stdio: 'inherit',
    shell: true,
    env: {
      ...process.env,
      PORT: String(port)
    }
  })

  dev.on('error', (error) => {
    console.error(chalk.red('启动失败:'), error.message)
    process.exit(1)
  })
}
