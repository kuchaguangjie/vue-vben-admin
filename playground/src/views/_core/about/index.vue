<script lang="ts" setup>
import { Page } from '@vben/common-ui';

defineOptions({ name: 'About' });
</script>

<template>
  <Page title="关于项目">
    <template #description>
      <p class="mt-3 text-sm leading-6 text-foreground">
        fiber-crud 是一个生产级全栈 Web
        脚手架，基于最新技术栈构建，专注于快速构建企业级后台管理系统。
      </p>
    </template>

    <div class="card-box p-5">
      <h5 class="text-lg text-foreground">基本信息</h5>
      <dl class="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        <div class="border-t border-border px-4 py-6 sm:px-0">
          <dt class="text-sm font-medium leading-6 text-foreground">
            项目名称
          </dt>
          <dd class="mt-1 text-sm leading-6 text-foreground sm:mt-2">
            fiber-crud
          </dd>
        </div>
        <div class="border-t border-border px-4 py-6 sm:px-0">
          <dt class="text-sm font-medium leading-6 text-foreground">
            开源协议
          </dt>
          <dd class="mt-1 text-sm leading-6 text-foreground sm:mt-2">MIT</dd>
        </div>
        <div class="border-t border-border px-4 py-6 sm:px-0">
          <dt class="text-sm font-medium leading-6 text-foreground">
            后端框架
          </dt>
          <dd class="mt-1 text-sm leading-6 text-foreground sm:mt-2">
            Go Fiber v3 + GORM + PostgreSQL
          </dd>
        </div>
        <div class="border-t border-border px-4 py-6 sm:px-0">
          <dt class="text-sm font-medium leading-6 text-foreground">
            前端框架
          </dt>
          <dd class="mt-1 text-sm leading-6 text-foreground sm:mt-2">
            Vue 3 + Vben Admin 5.x + Ant Design Vue
          </dd>
        </div>
      </dl>
    </div>

    <div class="card-box mt-6 p-5">
      <h5 class="text-lg text-foreground">技术栈</h5>
      <dl class="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        <div class="border-t border-border px-4 py-3 sm:px-0">
          <dt class="text-sm text-foreground">Go</dt>
          <dd class="mt-1 text-sm text-foreground/80 sm:mt-2">1.25</dd>
        </div>
        <div class="border-t border-border px-4 py-3 sm:px-0">
          <dt class="text-sm text-foreground">Fiber</dt>
          <dd class="mt-1 text-sm text-foreground/80 sm:mt-2">v3</dd>
        </div>
        <div class="border-t border-border px-4 py-3 sm:px-0">
          <dt class="text-sm text-foreground">GORM</dt>
          <dd class="mt-1 text-sm text-foreground/80 sm:mt-2">v2</dd>
        </div>
        <div class="border-t border-border px-4 py-3 sm:px-0">
          <dt class="text-sm text-foreground">PostgreSQL</dt>
          <dd class="mt-1 text-sm text-foreground/80 sm:mt-2">17</dd>
        </div>
        <div class="border-t border-border px-4 py-3 sm:px-0">
          <dt class="text-sm text-foreground">Redis</dt>
          <dd class="mt-1 text-sm text-foreground/80 sm:mt-2">7</dd>
        </div>
        <div class="border-t border-border px-4 py-3 sm:px-0">
          <dt class="text-sm text-foreground">NATS</dt>
          <dd class="mt-1 text-sm text-foreground/80 sm:mt-2">✔</dd>
        </div>
        <div class="border-t border-border px-4 py-3 sm:px-0">
          <dt class="text-sm text-foreground">Casbin</dt>
          <dd class="mt-1 text-sm text-foreground/80 sm:mt-2">✔</dd>
        </div>
        <div class="border-t border-border px-4 py-3 sm:px-0">
          <dt class="text-sm text-foreground">Vue</dt>
          <dd class="mt-1 text-sm text-foreground/80 sm:mt-2">3</dd>
        </div>
        <div class="border-t border-border px-4 py-3 sm:px-0">
          <dt class="text-sm text-foreground">Ant Design Vue</dt>
          <dd class="mt-1 text-sm text-foreground/80 sm:mt-2">4</dd>
        </div>
        <div class="border-t border-border px-4 py-3 sm:px-0">
          <dt class="text-sm text-foreground">Tailwind CSS</dt>
          <dd class="mt-1 text-sm text-foreground/80 sm:mt-2">4</dd>
        </div>
        <div class="border-t border-border px-4 py-3 sm:px-0">
          <dt class="text-sm text-foreground">TypeScript</dt>
          <dd class="mt-1 text-sm text-foreground/80 sm:mt-2">✔</dd>
        </div>
        <div class="border-t border-border px-4 py-3 sm:px-0">
          <dt class="text-sm text-foreground">Vite</dt>
          <dd class="mt-1 text-sm text-foreground/80 sm:mt-2">5</dd>
        </div>
      </dl>
    </div>

    <div class="card-box mt-6 p-5">
      <h5 class="text-lg text-foreground">核心特性</h5>
      <ul
        class="mt-4 list-inside list-disc space-y-2 text-sm text-foreground/80"
      >
        <li>RBAC 权限管理（Casbin 动态策略）</li>
        <li>多租户架构（SaaS）</li>
        <li>平台分佣系统</li>
        <li>租户分佣系统</li>
        <li>提现审核（用户 + 租户）</li>
        <li>AI 服务管理</li>
        <li>知识库管理</li>
        <li>JWT 认证（RSA 密钥）</li>
        <li>NATS 消息队列</li>
        <li>自动化测试覆盖</li>
      </ul>
    </div>
  </Page>
</template>
