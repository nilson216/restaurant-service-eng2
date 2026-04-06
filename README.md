# 🍽️ Restaurant Service - Sistema de Menu Digital

Aplicação Next.js para gerenciar menus de restaurantes com opções de consumo (dine-in e takeaway).

## 🚀 Iniciando

### Instalação
```bash
npm install
```

### Executar servidor de desenvolvimento
```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no navegador.

---

## 📊 Arquitetura do Projeto

### Estrutura de Pastas
```
src/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   └── [slug]/
│       ├── page.tsx                 (Tela inicial do restaurante)
│       ├── components/
│       │   └── consumption-method-option.tsx
│       └── menu/
│           ├── page.tsx              (Página do Menu)
│           └── components/
│               ├── header.tsx        (Cabeçalho com imagem de capa)
│               ├── categories.tsx    (Filtro de categorias)
│               └── products.tsx      (Lista de produtos)
├── components/ui/
│   ├── button.tsx
│   ├── card.tsx
│   ├── input.tsx
│   └── scroll-area.tsx
├── data/
│   └── get-restaurant-by-slug.ts    (Função auxiliar)
└── lib/
    ├── prisma.ts                    (Configuração do banco de dados)
    └── utils.ts
```

---

## 🔄 Fluxo da Aplicação

```
┌─────────────────────────────────────────────────────┐
│ 1. TELA INICIAL (/[slug])                           │
│ ┌──────────────────────────────────────────────────┐│
│ │ - Logo e Nome do Restaurante                     ││
│ │ - Mensagem: "Seja bem-vindo!"                    ││
│ │ - 2 Botões:                                      ││
│ │   • [Para comer aqui] → DINE_IN                  ││
│ │   • [Para levar] → TAKEAWAY                      ││
│ └──────────────────────────────────────────────────┘│
│              ↓                  ↓                     │
│        Clica em um       Clica em outro              │
│             ↓                  ↓                     │
└─────────────────────────────────────────────────────┘

          /pizzaria/menu?consumptionMethod=DINE_IN
                         ↓
┌─────────────────────────────────────────────────────┐
│ 2. PÁGINA DO MENU (/[slug]/menu)                    │
│ ┌──────────────────────────────────────────────────┐│
│ │ Header (Imagem de Capa + Botões)                 ││
│ └──────────────────────────────────────────────────┘│
│              ↓                                       │
│ ┌──────────────────────────────────────────────────┐│
│ │ Categories (Com scroll horizontal)               ││
│ │ ┌────────┬────────┬────────┐                     ││
│ │ │Bebidas │Lanches │Sobremesa│                   ││
│ │ └────────┴────────┴────────┘                     ││
│ └──────────────────────────────────────────────────┘│
│              ↓                                       │
│ ┌──────────────────────────────────────────────────┐│
│ │ Products (Lista filtrada)                         ││
│ │ ┌──────────────────────────────────┐             ││
│ │ │ Coca-Cola 2L      R$ 12,90  [IMG]│             ││
│ │ ├──────────────────────────────────┤             ││
│ │ │ Suco Natural      R$ 8,50   [IMG]│             ││
│ │ └──────────────────────────────────┘             ││
│ └──────────────────────────────────────────────────┘│
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 📝 Detalhamento de Cada Arquivo

### **Camada - Páginas & Layouts**

#### `src/app/[slug]/page.tsx` - Tela Inicial
**Responsabilidade:** Página de boas-vindas do restaurante

**O que faz:**
- Recebe `slug` via parâmetro dinâmico da URL
- Busca dados do restaurante no banco de dados
- Exibe logo, nome e mensagem de boas-vindas
- Renderiza 2 componentes `ConsumptionMethodOption`

**Exemplo de URL:** `/pizzaria-do-joao`

**Fluxo:**
```typescript
1. Aguarda parâmetro: { slug: "pizzaria-do-joao" }
2. await db.restaurant.findUnique({ where: { slug } })
3. Se não encontrar → notFound() (página 404)
4. Se encontrar → Renderiza layout com opções
```

**Props recebidas:**
- `params.slug` - Identificador único do restaurante

---

#### `src/app/[slug]/menu/page.tsx` - Página do Menu
**Responsabilidade:** Validar e exibir menu do restaurante

**O que faz:**
- Valida se `consumptionMethod` é válido (DINE_IN ou TAKEAWAY)
- Busca restaurante com todas as categorias e produtos
- Renderiza Header + Categories

**Exemplo de URL:** `/pizzaria-do-joao/menu?consumptionMethod=DINE_IN`

**Fluxo:**
```typescript
1. Aguarda params: { slug } e searchParams: { consumptionMethod }
2. Valida: consumptionMethod tem que ser "DINE_IN" ou "TAKEAWAY"
3. Se inválido → notFound()
4. await db.restaurant.findUnique() + include categories + products
5. Renderiza RestaurantHeader + RestaurantCategories
```

**Props recebidas:**
- `params.slug` - Restaurant
- `searchParams.consumptionMethod` - Método de consumo

---

### **Camada - Componentes Funcionais**

#### `src/app/[slug]/components/consumption-method-option.tsx`
**Responsabilidade:** Card clicável para escolher método de consumo

**O que faz:**
- Renderiza card com imagem e botão
- Navega para menu com método de consumo selecionado

**Props:**
```typescript
{
  slug: string              // "pizzaria-do-joao"
  option: ConsumptionMethod // "DINE_IN" ou "TAKEAWAY"
  buttonText: string        // "Para comer aqui"
  imageUrl: string          // "/dine_in.png"
  imageAlt: string          // Texto alternativo
}
```

**Ação ao clicar:**
```
Navega para: /{slug}/menu?consumptionMethod={option}
Exemplo: /pizzaria-do-joao/menu?consumptionMethod=DINE_IN
```

---

#### `src/app/[slug]/menu/components/header.tsx`
**Responsabilidade:** Cabeçalho do menu com imagem de capa

**O que faz:**
- Exibe imagem grande de capa (250px height)
- Botão voltar (← ChevronLeft) - usa `router.back()`
- Botão de adicional (↪ ScrollText) - sem funcionalidade ainda

**Props:**
```typescript
{
  restaurant: Pick<Restaurant, "name" | "coverImageUrl">
}
```

**Componentes filhos:** Nenhum (leaf component)

---

#### `src/app/[slug]/menu/components/categories.tsx`
**Responsabilidade:** Filtro de categorias com estado local

**O que faz:**
- Exibe informações do restaurante (logo, nome, status)
- Lista categorias em scroll horizontal
- Permite clicar para filtrar
- Renderiza produtos da categoria selecionada
- **Usa `useState`** para rastrear categoria selecionada

**Estado:**
```typescript
const [selectedCategory, setSelectedCategory] = 
  useState<MenuCategoriesWithProducts>(restaurant.menuCategories[0])
```

**Interações:**
- Click categoria → atualiza `selectedCategory`
- Botão ativo tem `variant="default"`, inativos `variant="secondary"`
- Mostra produtos da categoria selecionada via componente `Products`

**Props:**
```typescript
{
  restaurant: Prisma.RestaurantGetPayload<{
    include: {
      menuCategories: { include: { products: true } }
    }
  }>
}
```

---

#### `src/app/[slug]/menu/components/products.tsx`
**Responsabilidade:** Listar produtos com informações e imagens

**O que faz:**
- Mapeia array de produtos
- Exibe para cada produto:
  - **Esquerda:** Nome, descrição (max 2 linhas), preço formatado
  - **Direita:** Imagem do produto
- Cada produto é clicável (Link para `/`)

**Formatação de preço:**
```typescript
new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL"
}).format(product.price)
// Resultado: R$ 29,90
```

**Props:**
```typescript
{
  products: Product[]
}
```

---

### **Camada - UI/Components Reutilizáveis**

#### `src/components/ui/card.tsx`
**Componentes exportados:**
- `Card` - Container principal com borda, sombra
- `CardHeader` - Seção cabeçalho
- `CardTitle` - Título do card
- `CardDescription` - Descrição
- `CardContent` - Conteúdo principal
- `CardFooter` - Rodapé

**Exemplo de uso:**
```tsx
<Card>
  <CardHeader>
    <CardTitle>Título</CardTitle>
  </CardHeader>
  <CardContent>Conteúdo</CardContent>
</Card>
```

---

#### `src/components/ui/scroll-area.tsx`
**Componentes exportados:**
- `ScrollArea` - Wrapper com scroll customizado
- `ScrollBar` - Barra de scroll (horizontal/vertical)

**Exemplo de uso (em categories.tsx):**
```tsx
<ScrollArea className="w-full">
  <div className="flex w-max space-x-4">
    {/* Categorias */}
  </div>
  <ScrollBar orientation="horizontal" />
</ScrollArea>
```

---

### **Camada - Dados & Banco**

#### `src/lib/prisma.ts` - Instância do Prisma Client
**Responsabilidade:** Exportar instância única de Prisma

**Configuração:**
- Em **produção**: nova instância a cada requisição
- Em **desenvolvimento**: cacheia global para evitar múltiplas conexões

**Exportação:**
```typescript
export const db = prisma
```

**Uso em todo projeto:**
```typescript
import { db } from "@/lib/prisma"

const restaurant = await db.restaurant.findUnique({...})
```

---

#### `src/data/get-restaurant-by-slug.ts` - Função Utilitária
**Responsabilidade:** Encapsular busca por slug

**O que faz:**
```typescript
export const getRestaurantBySlug = async (slug: string) => {
  const restaurant = await db.restaurant.findUnique({ where: {slug} })
  return restaurant
}
```

**Nota:** Atualmente não é utilizada (código repete a lógica), mas pronta para reutilização.

---

### **Configuração - Next.js**

#### `next.config.ts`
**Configuração adicionada:**
```typescript
images: {
  remotePatterns: [
    { hostname: "u9a6wmr3as.ufs.sh" }
  ]
}
```

**Por que?** Next.js bloqueia imagens externas por padrão. Esse padrão permite carregar imagens do domínio `u9a6wmr3as.ufs.sh` (provável serviço de storage).

---

## 🗄️ Banco de Dados (Prisma)

### Tabelas utilizadas:
- `Restaurant` - Dados do restaurante (nome, slug, avatar, coverImage, etc)
- `MenuCategory` - Categorias do menu (Bebidas, Lanches, Sobremesas)
- `Product` - Produtos (nome, descrição, preço, imagem)

### Relacionamentos:
```
Restaurant
  └── MenuCategory (has many)
      └── Product (has many)
```

---

## 🖼️ Imagens

### Adicionadas:
- `/public/dine_in.png` - Ícone "Para comer aqui"
- `/public/takeaway.png` - Ícone "Para levar"

### Removidas (padrão Next.js):
- `/public/file.svg`, `/public/globe.svg`, `/public/next.svg` e outros

---

## 🛠️ Stack Tecnológico

- **Framework:** Next.js 15 (App Router)
- **Linguagem:** TypeScript
- **BD:** Prisma ORM + PostgreSQL
- **Styling:** Tailwind CSS
- **UI:** Shadcn/ui components
- **Icons:** Lucide React

---

## 📋 Status Atual

✅ Implementado:
- Tela inicial com opções de consumo
- Página de menu com filtro de categorias
- Listagem de produtos
- Navegação básica

⏳ À fazer:
- Funcionalidade click em produto
- Carrinho de compras
- Sistema de pedidos
- Pagamento

---

## 🔗 Exemplos de URLs

```
http://localhost:3000/pizzaria-do-joao
http://localhost:3000/pizzaria-do-joao/menu?consumptionMethod=DINE_IN
http://localhost:3000/pizzaria-do-joao/menu?consumptionMethod=TAKEAWAY
```
