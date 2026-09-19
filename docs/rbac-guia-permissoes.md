# Guia de Permissões (RBAC)

Este guia explica como funciona o controle de acesso por perfil (RBAC) do EIP e como
replicar / substituir o mock por um backend real.

## Como o RBAC funciona

1. **Login / carga do perfil**: `AuthProfileService.loadProfile()` carrega o perfil
   do usuário a partir do mock `public/mock/current-profile.json`. O mock atual é um
   ADMIN com `fullAccess: true`, portanto tudo fica visível.
2. **Menu**: os itens visíveis são filtrados por `visibleMenuItems`, que consulta o
   `AuthProfileService` para exibir apenas as telas permitidas.
3. **Rotas**: o `profileAccessGuard` (`canActivateChild` no `home-logged`) bloqueia a
   navegação para telas sem permissão de visualização.
4. **Ações da tela**: os botões (criar/editar/excluir/exportar) são controlados pela
   diretiva estrutural `*appHasPermission`.

## Convenção de screenId

O `screenId` é a rota com as `/` trocadas por `_`:

- rota `financeiro/cambio` → screenId `financeiro_cambio`
- rota `supply-chain/fornecedores` → screenId `supply-chain_fornecedores`

Use `AuthProfileService.routeToScreenId(route)` para converter — não monte a string à mão.

## Ações disponíveis

`view` | `create` | `edit` | `delete` | `export`

## Como proteger um botão (template)

A diretiva vive em `src/app/directives/has-permission.directive.ts` (selector
`[appHasPermission]`). O formato é `'<rota>:<ação>'`:

```html
<!-- Aparece só quem pode criar em financeiro/cambio -->
<button mat-raised-button (click)="createContract()"
        *appHasPermission="'financeiro/cambio:create'">
  Novo Contrato
</button>

<!-- Forma em objeto (equivalente) -->
<button *appHasPermission="{ screen: 'financeiro/cambio', action: 'export' }">
  Exportar PDF
</button>
```

Regras:

- Adicione `HasPermissionDirective` ao array `imports` do componente standalone,
  importando pelo caminho relativo correto até `src/app/directives/has-permission.directive`.
- Se o botão já usa outra diretiva estrutural (ex.: `*ngIf`), envolva-o em um
  `<ng-container *appHasPermission="...">` (não empilhe duas estruturais no mesmo elemento).
- Bindings de propriedade como `[matMenuTriggerFor]` **não** são estruturais, então a
  `*appHasPermission` pode ficar direto no mesmo `<button>`.

## Como checar permissão no TypeScript

```ts
private auth = inject(AuthProfileService);

const screenId = this.auth.routeToScreenId('supply-chain/fornecedores');
if (this.auth.can(screenId, 'export')) { /* ... */ }

// Atalhos equivalentes:
this.auth.canView(screenId);
this.auth.canCreate(screenId);
this.auth.canEdit(screenId);
this.auth.canDelete(screenId);
this.auth.canExport(screenId);
```

## Como replicar nas demais telas

Para cada tela restante:

1. Importe `HasPermissionDirective` e adicione-a ao `imports` do componente.
2. Envolva/anote os botões de ação do cabeçalho com a ação correspondente:
   - "Novo/Adicionar" → `:create`
   - "Editar" → `:edit`
   - "Excluir/Remover" → `:delete`
   - "Exportar" (PDF/CSV, ou o gatilho do `mat-menu`) → `:export`
3. Faça o mesmo com os botões de ação nas linhas da grid (row-actions), usando a
   ação equivalente (ex.: `visibility` → `:view`, `edit` → `:edit`, `delete` → `:delete`).
4. Sempre use `'<rota-da-tela>:<ação>'`, com a mesma rota registrada no catálogo.

## Como substituir o mock por um backend real

1. Em `AuthProfileService.loadProfile()`, troque o `this.http.get(...)` do JSON mock por
   uma chamada ao endpoint real que retorne **o mesmo shape** `AccessProfile`
   (`id/name/description/color/system/usersCount/permissions/createdAt/updatedAt`).
2. Remova `fullAccess: true` do perfil para que as permissões reais passem a ser
   efetivamente aplicadas (sem isso o usuário continua com acesso total).
3. Nenhum outro arquivo precisa mudar: menu, guard e `*appHasPermission` já consomem o
   `AuthProfileService`.
