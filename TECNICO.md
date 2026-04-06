# 📘 Documentação Técnica Detalhada - Restaurant Service

**Para desenvolvedores com conhecimento em React, TypeScript e programação web**

---

## 🏗️ Arquitetura & Design Patterns

### Estrutura de Pastas
```
src/
├── app/
│   ├── [slug]/
│   │   ├── page.tsx                    (Server Component - Async)
│   │   ├── components/
│   │   │   └── consumption-method-option.tsx (Client Component)
│   │   └── menu/
│   │       ├── page.tsx                (Server Component - Async)
│   │       └── components/
│   │           ├── header.tsx          (Client Component)
│   │           ├── categories.tsx      (Client Component - useState)
│   │           └── products.tsx        (Server Component)
├── components/
│   └── ui/
│       ├── card.tsx                    (Headless UI - Styled)
│       └── scroll-area.tsx             (Radix UI Wrapper)
├── data/
│   └── get-restaurant-by-slug.ts       (Data Layer)
├── lib/
│   ├── prisma.ts                       (Database Client Singleton)
│   └── utils.ts
└── [config files]
```

---

## 🎯 Análise Detalhada de Cada Arquivo

### **1. `src/app/[slug]/page.tsx` - Tela Inicial**

#### Padrão: Server Component (Async Function)
```typescript
interface RestaurantPageProps {
  params: Promise<{ slug: string }>;
}

const RestaurantPage = async ({ params }: RestaurantPageProps) => {
  // Código assíncrono aqui
}
```

**Next.js 15+ Pattern:**
- `params` retorna `Promise` (não mais direto)
- Componente pode ser `async` (Server Component por padrão)
- Executa no servidor, não no navegador

#### Fluxo de Execução

```typescript
1. const { slug } = await params;
   // Aguarda resolução da Promise
   // Extrai slug dos parâmetros de rota

2. const restaurant = await db.restaurant.findUnique({ where: { slug } });
   // Executa query SQL via Prisma:
   // SELECT * FROM "Restaurant" WHERE "slug" = ?
   // Bloqueante: espera até retornar

3. if (!restaurant) return notFound();
   // Retorna status 404 e página customizada (_not-found.tsx)

4. return <div>...</div>;
   // Renderiza No servidor
   // Envia HTML pronto para o navegador
```

#### Renderização de Props de Imagem
```typescript
<Image
  src={restaurant.avatarImageUrl}
  alt={restaurant.name}
  width={82}
  height={82}
/>
```

**Otimizações do Next.js Image:**
- Lazy loading automático
- Responsive images geradas
- WebP/moderno suporte
- Precisa de `width` e `height` (ou `fill`)
- Requer domínios configurados em `next.config.ts`

#### Performance
- **Rendering:** Server-side rendering (SSR)
- **Caching:** ISR possível com `revalidate`
- **Data Fetching:** Executa no build/request

---

### **2. `src/app/[slug]/components/consumption-method-option.tsx` - Card de Método de Consumo**

#### Padrão: Client Component
```typescript
// SEM "use client" explícito aqui, mas pode precisar se usar hooks
// Pai (page.tsx) é Server, este não herda automaticamente as capacidades
```

**Análise de Props:**
```typescript
interface ConsumptionMethodOptionProps {
  slug: string;              // Safe string, validado no pai
  imageUrl: string;          // Path público (/dine_in.png)
  imageAlt: string;          // Acessibilidade
  buttonText: string;        // i18n ready
  option: ConsumptionMethod; // Enum from Prisma schema
}
```

#### Renderização & Composição
```typescript
<Card>
  <CardContent className="...">
    <div className="relative h-[80px] w-[80px]">
      <Image src={imageUrl} fill alt={imageAlt} className="object-contain" />
    </div>
    <Button variant="secondary" className="rounded-full" asChild>
      <Link href={`/${slug}/menu?consumptionMethod=${option}`}>
        {buttonText}
      </Link>
    </Button>
  </CardContent>
</Card>
```

**Técnicas utilizadas:**
- **`asChild` prop:** Renderiza o Button como Link (composição flexível)
- **Template literals:** URL dinâmica com `${}`
- **`fill` no Image:** Preenche container relative

#### URL Gerada
```
Entrada: slug="pizzaria-do-joao", option="DINE_IN"
Saída: /pizzaria-do-joao/menu?consumptionMethod=DINE_IN
```

**Query String Encoding:**
Enum `ConsumptionMethod` é passado como string na URL. Será validado em `menu/page.tsx`

---

### **3. `src/app/[slug]/menu/page.tsx` - Página do Menu**

#### Server Component com Validação

```typescript
interface RestaurantMenuPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ consumptionMethod: string }>;
}

const isConsumptionMethodValid = (consumptionMethod: string) => {
  return ["DINE_IN", "TAKEAWAY"].includes(consumptionMethod.toUpperCase());
};

const RestaurantMenuPage = async ({ params, searchParams }: RestaurantMenuPageProps) => {
  // Validação de entrada
  const { slug } = await params;
  const { consumptionMethod } = await searchParams;
  
  if (!isConsumptionMethodValid(consumptionMethod)) {
    return notFound();
  }
  
  // Data fetching com eager loading
  const restaurant = await db.restaurant.findUnique({
    where: { slug },
    include: {
      menuCategories: {
        include: {
          products: true
        }
      }
    }
  });
  
  if (!restaurant) return notFound();
  
  return (
    <div>
      <RestaurantHeader restaurant={restaurant} />
      <RestaurantCategories restaurant={restaurant} />
    </div>
  );
};
```

#### Padrões Importantes

**1. Validação em Server Component**
```typescript
const isConsumptionMethodValid = (value: string) => {
  // Guard clause: valida antes de usar
  return ["DINE_IN", "TAKEAWAY"].includes(value.toUpperCase());
};

// Benefício: Previne SQL injection, XSS, estados inválidos
```

**2. Eager Loading com Prisma Include**
```prisma
// SEM include (N+1 problem):
const restaurant = db.restaurant.findUnique(...) // ← 1 query
const categories = db.menuCategory.findMany(...) // ← N queries
const products = db.product.findMany(...)        // ← N queries

// COM include (1 query):
const restaurant = db.restaurant.findUnique({
  include: {
    menuCategories: {
      include: { products: true }
    }
  }
}) // ← 1 query, tudo junto
```

**3. Type Safety com Prisma.RestaurantGetPayload**
```typescript
type FullRestaurant = Prisma.RestaurantGetPayload<{
  include: {
    menuCategories: {
      include: { products: true }
    }
  }
}>
```

Garante que TypeScript saiba exatamente qual estrutura retorna.

#### Data Fetching Strategy
- **Local/Development:** Sem cache (padrão)
- **Production:** ISR com `revalidate` é recomendado
  ```typescript
  export const revalidate = 3600; // 1 hora
  ```

---

### **4. `src/app/[slug]/menu/components/header.tsx` - Cabeçalho do Menu**

#### Client Component (Com useRouter)

```typescript
"use client"; // ← Necessário para useRouter

import { useRouter } from "next/navigation"; // navigation, não router

const RestaurantHeader = ({ restaurant }: RestaurantHeaderProps) => {
  const router = useRouter();
  
  const handleBackClick = () => router.back();
  
  return (
    <div className="relative h-[250px] w-full">
      {/* Overlay buttons */}
      <Button className="absolute left-4 top-4 z-50" onClick={handleBackClick}>
        <ChevronLeftIcon />
      </Button>
      
      <Image src={restaurant.coverImageUrl} alt={restaurant.name} fill />
      
      <Button className="absolute right-4 top-4 z-50">
        <ScrollTextIcon />
      </Button>
    </div>
  );
};
```

**Técnicas CSS/Layout:**
```css
.relative h-[250px] w-full
  └─ relative: contexto de posicionamento para absolute children

.absolute left-4 top-4 z-50
  └─ Posicionamento absoluto sobre a imagem
  └─ z-50: sempre acima da imagem
```

**Importância:**
```typescript
import { useRouter } from "next/navigation"; // ← CORRETO (Next.js 13+)
import { useRouter } from "next/router";     // ← ERRADO (Pages Router)
```

---

### **5. `src/app/[slug]/menu/components/categories.tsx` - Filtro com Estado**

#### Client Component com useState

```typescript
"use client";

type MenuCategoriesWithProducts = Prisma.MenuCategoryGetPayload<{
  include: { products: true };
}>;

const RestaurantCategories = ({ restaurant }: RestaurantCategoriesProps) => {
  // Estado local: qual categoria está selecionada
  const [selectedCategory, setSelectedCategory] = 
    useState<MenuCategoriesWithProducts>(restaurant.menuCategories[0]);
  
  const handleCategoryClick = (category: MenuCategoriesWithProducts) => {
    setSelectedCategory(category);
  };
  
  const getCategoryButtonVariant = (category: MenuCategoriesWithProducts) => {
    return selectedCategory.id === category.id ? "default" : "secondary";
  };
  
  return (
    <div className="relative z-50 mt-[-1.5rem] rounded-t-3xl bg-white">
      {/* Info header */}
      <div className="p-5">
        <div className="flex items-center gap-3">
          <Image src={restaurant.avatarImageUrl} height={45} width={45} />
          <div>
            <h2>{restaurant.name}</h2>
            <p className="text-xs opacity-55">{restaurant.description}</p>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-1 text-xs text-green-500">
          <ClockIcon size={12} />
          <p>Aberto!</p>
        </div>
      </div>
      
      {/* Categories scroll */}
      <ScrollArea className="w-full">
        <div className="flex w-max space-x-4 p-4 pt-0">
          {restaurant.menuCategories.map((category) => (
            <Button
              onClick={() => handleCategoryClick(category)}
              key={category.id}
              variant={getCategoryButtonVariant(category)}
              size="sm"
              className="rounded-full"
            >
              {category.name}
            </Button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      
      {/* Products */}
      <h3 className="px-5 pt-2 font-semibold">{selectedCategory.name}</h3>
      <Products products={selectedCategory.products} />
    </div>
  );
};
```

#### State Management Pattern

**Problema que resolve:**
```
Sem estado: categoria hardcoded ou nenhum filtro
Com estado: categoria dinâmica baseada em cliques do usuário
```

**Fluxo:**
```
Clique do usuário
      ↓
onClick handler executado
      ↓
setSelectedCategory() chamado
      ↓
Estado React atualiza
      ↓
Componente re-renderiza
      ↓
Novo `selectedCategory.products` passado para `<Products>`
```

**Renderização condicional de style:**
```typescript
variant={selectedCategory.id === category.id ? "default" : "secondary"}
// Ternário: categoria ativa = "default", inativa = "secondary"
```

#### Composição de Componentes
```typescript
<Products products={selectedCategory.products} />
// Passa apenas products da categoria selecionada
// Componente filho (Products) não conhece estado da categoria
```

**Benefício:** `Products` é agnóstico a estado, reutilizável

---

### **6. `src/app/[slug]/menu/components/products.tsx` - Lista de Produtos**

#### Server Component (Sem hooks)

```typescript
// SEM "use client" - é Server Component
interface ProductsProps {
  products: Product[];
}

const Products = ({ products }: ProductsProps) => {
  return (
    <div className="space-y-3 px-5">
      {products.map((product) => (
        <Link
          key={product.id}
          href="/" // TODO: /[slug]/product/[id]
          className="flex items-center justify-between gap-10 border-b py-3"
        >
          {/* Left side */}
          <div>
            <h3 className="text-sm font-medium">{product.name}</h3>
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {product.description}
            </p>
            <p className="pt-3 text-sm font-semibold">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(product.price)}
            </p>
          </div>
          
          {/* Right side */}
          <div className="relative min-h-[82px] min-w-[120px]">
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="rounded-lg object-contain"
            />
          </div>
        </Link>
      ))}
    </div>
  );
};
```

#### Técnicas Implementadas

**1. Intl.NumberFormat (Internacionalização)**
```typescript
new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
}).format(12.9)
// Retorna: "R$ 12,90" (automático, respeita locale)
```

**Vantagem:** Não hardcodar "R$", respeita locales diferentes

**2. Tailwind Classes Avançadas**
```css
.line-clamp-2       {/* Máximo 2 linhas, resto com ellipsis (...) */}
.gap-10             {/* 10 * 0.25rem = 2.5rem entre items */}
.border-b           {/* Borda inferior */}
.min-h-[82px]       {/* Altura mínima (arbitrary) */}
.object-contain     {/* Imagem cabe sem distorcer (letterboxing) */}
```

**3. Image Layout Pattern**
```typescript
<div className="relative min-h-[82px] min-w-[120px]">
  <Image fill className="object-contain" />
</div>
```

**Por quê:**
- `fill`: Image preenche o container (precisa container com position relative)
- `object-contain`: Imagem não distorce, mantém proporções
- `min-h` e `min-w`: Espaço reservado (evita layout shift)

**4. Array.map com Key**
```typescript
products.map((product) => (
  <Link key={product.id} />
  // key = product.id (banco de dados, único)
  // Importante para reconciliação React
))
```

---

### **7. `src/lib/prisma.ts` - Database Client Singleton**

#### Padrão: Singleton Pattern com Caching

```typescript
import { PrismaClient } from "@prisma/client";

declare global {
  var cachedPrisma: PrismaClient;
}

let prisma: PrismaClient;

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  if (!global.cachedPrisma) {
    global.cachedPrisma = new PrismaClient();
  }
  prisma = global.cachedPrisma;
}

export const db = prisma;
```

#### Por Que Este Padrão?

**Problema em desenvolvimento:**
```typescript
// ❌ Ruim (cria múltiplas conexões)
if (true) {
  const db = new PrismaClient(); // Cada página.tsx novo client
  const db = new PrismaClient();
  const db = new PrismaClient();
  // ... Muitas conexões abertas!
}
```

**Solução (Singleton com Cache):**
```typescript
// ✅ Bom (reutiliza conexão)
if (!global.cachedPrisma) {
  global.cachedPrisma = new PrismaClient(); // Cria uma vez
}
const db = global.cachedPrisma; // Reutiliza sempre
```

**Diferença de Produção:**
- **Dev:** Client reutilizado entre hot reloads
- **Prod:** Cada requisição nova (lambda/serverless friendly)

#### Usage
```typescript
import { db } from "@/lib/prisma";

// Em qualquer server component:
const restaurant = await db.restaurant.findUnique({...});
const products = await db.product.findMany({...});
```

---

### **8. `src/components/ui/card.tsx` - Headless Card Component**

#### Padrão: Compound Components + Styled

```typescript
const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-lg border bg-card text-card-foreground shadow-sm",
        className
      )}
      {...props}
    />
  )
);
```

**Técnicas:**
1. **React.forwardRef:** Passagem de `ref` (DOM access)
2. **Generic typing:** `<HTMLDivElement>` para tipagem de ref
3. **Compound pattern:** `Card`, `CardHeader`, `CardContent`, etc.
4. **cn() utility:** Merge de classes (Tailwind CSS)

**Uso Prático:**
```typescript
<Card className="custom-class">            {/* Passível className */}
  <CardHeader>
    <CardTitle>Titulo</CardTitle>           {/* Nested compostos */}
  </CardHeader>
  <CardContent>Conteúdo</CardContent>
</Card>
```

**Benefício:** Componentes simples, altamente reutilizáveis

---

### **9. `src/components/ui/scroll-area.tsx` - Radix UI Wrapper**

#### Wrapper Pattern

```typescript
"use client";

import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";

const ScrollArea = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root>
>(({ className, children, ...props }, ref) => (
  <ScrollAreaPrimitive.Root
    ref={ref}
    className={cn("relative overflow-hidden", className)}
    {...props}
  >
    <ScrollAreaPrimitive.Viewport className="h-full w-full rounded-[inherit]">
      {children}
    </ScrollAreaPrimitive.Viewport>
    <ScrollBar />
    <ScrollAreaPrimitive.Corner />
  </ScrollAreaPrimitive.Root>
));

const ScrollBar = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>
>(({ className, orientation = "vertical", ...props }, ref) => (
  <ScrollAreaPrimitive.ScrollAreaScrollbar
    ref={ref}
    orientation={orientation}
    className={cn(
      "flex touch-none select-none transition-colors",
      orientation === "vertical" &&
        "h-full w-2.5 border-l border-l-transparent p-[1px]",
      orientation === "horizontal" &&
        "h-2.5 flex-col border-t border-t-transparent p-[1px]",
      className
    )}
    {...props}
  >
    <ScrollAreaPrimitive.ScrollAreaThumb className="relative flex-1 rounded-full bg-border" />
  </ScrollAreaPrimitive.ScrollAreaScrollbar>
));
```

**Padrão: Adapter Pattern**
```
Radix UI (primitives sem estilo)
          ↓
ScrollArea (wrapper com Tailwind)
          ↓
Componentes da app (uso simples)
```

**Uso em categories.tsx:**
```typescript
<ScrollArea className="w-full">
  <div className="flex w-max space-x-4">
    {/* Categorias - pode fazer scroll */}
  </div>
  <ScrollBar orientation="horizontal" />
</ScrollArea>
```

---

## 🗄️ Banco de Dados - Prisma Schema

### Entidades Principais (inferidas)

```prisma
model Restaurant {
  id                String        @id @default(cuid())
  slug              String        @unique
  name              String
  description       String
  avatarImageUrl    String        // Logo 82x82
  coverImageUrl     String        // Capa 250px height
  
  menuCategories    MenuCategory[] @relation("RestaurantCategories")
  
  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt
}

model MenuCategory {
  id                String        @id @default(cuid())
  restaurantId      String
  restaurant        Restaurant    @relation("RestaurantCategories", fields: [restaurantId], references: [id])
  
  name              String        // "Bebidas", "Lanches", etc
  order             Int?          // Para ordenação
  
  products          Product[]     @relation("CategoryProducts")
  
  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt
}

model Product {
  id                String        @id @default(cuid())
  categoryId        String
  category          MenuCategory  @relation("CategoryProducts", fields: [categoryId], references: [id])
  
  name              String
  description       String
  price             Decimal       @db.Decimal(10, 2)
  imageUrl          String
  
  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt
}

model ConsumptionMethod {
  DINE_IN           // enum string
  TAKEAWAY
}
```

### Queries Utilizadas

**1. GetRestaurant + Categories + Products (Eager Loading)**
```prisma
db.restaurant.findUnique({
  where: { slug: "pizzaria-do-joao" },
  include: {
    menuCategories: {
      include: { products: true }
    }
  }
})
```

**SQL Gerado:**
```sql
SELECT r.*, mc.*, p.*
FROM "Restaurant" r
LEFT JOIN "MenuCategory" mc ON r.id = mc.restaurantId
LEFT JOIN "Product" p ON mc.id = p.categoryId
WHERE r.slug = 'pizzaria-do-joao'
```

---

## 🔄 Request/Response Cycle

### Fluxo Completo de Uma Requisição

```
1. NAVIGATION
   URL: /pizzaria-do-joao/menu?consumptionMethod=DINE_IN
   Browser navega
   
2. SERVER (Next.js)
   a) Rota: /[slug]/menu/page.tsx
   b) Params parsing:
      - params.slug = "pizzaria-do-joao"
      - searchParams.consumptionMethod = "DINE_IN"
   
   c) Validação:
      isConsumptionMethodValid("DINE_IN") → true ✓
   
   d) Data fetching (executado no servidor):
      SELECT * FROM Restaurant
      WHERE slug = 'pizzaria-do-joao'
      WITH menuCategories
      WITH products
      
   e) Renderização (no servidor):
      JSX → React Fiber Tree → HTML String
   
   f) Response:
      Retorna HTML + inline CSS + data

3. NETWORK
   Server envia HTML já renderizado
   Tamanho: ~5-10KB (sem dados extras)

4. CLIENT (Browser)
   a) HTML parsing e DOM mounting
   b) JS parsing (Next.js runtime)
   c) Hydration (React toma conta do DOM)
   
5. INTERACTION
   Usuário clica em categoria
   
6. COMPONENT UPDATE
   a) categories.tsx é Cliente (com "use client")
   b) onClick → setSelectedCategory()
   c) React detecta estado mudou
   d) Re-renderiza APENAS este componente
   e) <Products products={selectedCategory.products} /> 
      recebe novos props
   f) Products re-renderiza
   g) DOM atualiza

7. RESPONSE
   Tudo acontece no navegador
   Sem nova requisição ao servidor (rápido!)
```

---

## ⚡ Performance Optimizations

### 1. Code Splitting Automático
```typescript
// Next.js faz automaticamente:
// - Page: /[slug]/page.tsx → bundle /[slug]
// - Component: Header.tsx → incluído onde usado
// - Node modules: Externos para caching
```

### 2. Image Optimization
```typescript
<Image 
  src={url}
  width={82}
  height={82}
  // Next.js gera:
  // - Progressive JPEGs
  // - WebP moderno
  // - Lazy loading
  // - Responsive srcsets
/>
```

### 3. Server Rendering vs Client Rendering

| Aspecto | Server | Client |
|---------|--------|--------|
| **Executado em** | Servidor Next.js | Navegador |
| **Dados sensíveis** | Seguro | Expostos |
| **Banco de dados** | Acessível | Via API |
| **Bibliotecas grandes** | OK (nunca envia) | Aumenta JS |
| **Hooks (useState, etc)** | ❌ Não | ✅ Sim |
| **"use client"** | ✅ Padrão | Necessário |

**Estratégia deste projeto:**
```
pages/    → Server (lógica, segurança)
├ [slug]/page.tsx
├ [slug]/menu/page.tsx

components/ → Misto
├ header.tsx → Client ("use client")
├ categories.tsx → Client ("use client", useState)
├ products.tsx → Server (simples, sem estado)
├ consumption-method-option.tsx → Client
```

### 4. Data Fetching Patterns

**Problema: N+1 Queries**
```typescript
// ❌ Ruim (3 queries)
const restaurants = db.restaurant.findMany(); // Query 1
for (const r of restaurants) {
  const categories = db.menuCategory.findMany({     // Query N
    where: { restaurantId: r.id }
  });
}
```

**Solução: Eager Loading**
```typescript
// ✅ Bom (1 query)
const restaurants = db.restaurant.findMany({
  include: { menuCategories: true }  // JOIN automático
});
```

---

## 🛡️ Security Considerations

### 1. SQL Injection
```typescript
// ❌ Vulnerável (raw SQL)
const dangerous = `SELECT * FROM Restaurant WHERE slug = '${slug}'`;

// ✅ Seguro (Prisma parameterized)
const safe = db.restaurant.findUnique({
  where: { slug } // Prisma escapa automaticamente
});
```

### 2. XSS (Cross-Site Scripting)
```typescript
// React escapa HTML automaticamente
<h1>{restaurant.name}</h1>
// Se name = "<script>alert('xss')</script>"
// Renderiza: &lt;script&gt;alert('xss')&lt;/script&gt;
// (texto literal, não executa)

// Mas:
<div dangerouslySetInnerHTML={{__html: html}} />
// Só usar com conteúdo validado!
```

### 3. Enumeration Validation
```typescript
// ✅ Validar enum no servidor
const isValid = ["DINE_IN", "TAKEAWAY"].includes(consumptionMethod);

if (!isValid) return notFound();
// Previne: consumptionMethod="INVALID_METHOD"
```

### 4. Image Domain Whitelist
```typescript
// next.config.ts
images: {
  remotePatterns: [
    { hostname: "u9a6wmr3as.ufs.sh" }
  ]
}
// Só permite imagens do domínio aprovado
// Previne: hotlink, malware, phishing
```

---

## 🧪 Testing Strategies

### Unit Tests (Componentes)
```typescript
// consumption-method-option.test.tsx
import { render, screen } from "@testing-library/react";

describe("ConsumptionMethodOption", () => {
  it("renders correct href", () => {
    render(
      <ConsumptionMethodOption
        slug="pizzaria"
        option="DINE_IN"
        buttonText="Comer aqui"
        imageAlt="..."
        imageUrl="/dine_in.png"
      />
    );
    
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute(
      "href",
      "/pizzaria/menu?consumptionMethod=DINE_IN"
    );
  });
});
```

### Integration Tests (Pages)
```typescript
// [slug]/page.test.tsx
import { render, screen } from "@testing-library/react";
import RestaurantPage from "./page";

jest.mock("@/lib/prisma", () => ({
  db: {
    restaurant: {
      findUnique: jest.fn()
    }
  }
}));

describe("RestaurantPage", () => {
  it("shows restaurant name from database", async () => {
    // Mock database
    (db.restaurant.findUnique as jest.Mock).mockResolvedValue({
      slug: "pizzaria",
      name: "Pizzaria do João",
      avatarImageUrl: "..."
    });
    
    // Render server component
    const { container } = render(
      await RestaurantPage({ params: Promise.resolve({ slug: "pizzaria" }) })
    );
    
    expect(screen.getByText("Pizzaria do João")).toBeInTheDocument();
  });
});
```

---

## 📊 Métricas de Performance

### Core Web Vitals Target
- **LCP (Largest Contentful Paint):** < 2.5s
- **FID (First Input Delay):** < 100ms
- **CLS (Cumulative Layout Shift):** < 0.1

### Otimizações Implementadas
1. **Server Rendering:** FCP rápido (HTML pronto)
2. **Image Optimization:** LCP melhorado
3. **Code Splitting:** JS reduzido
4. **Minimal Client JS:** categories.tsx mínimo, products.tsx no servidor

---

## 🚀 Deployment

### Vercel (Recomendado)
```bash
# Automático com git push
git push origin main
# Vercel detecta Next.js
# Build automático
# Deploy automático
# Serverless functions geradas
```

### Variáveis de Ambiente
```env
DATABASE_URL=postgresql://user:pass@host/db
NEXT_PUBLIC_API_URL=https://api.example.com
```

### Build Output
```bash
npm run build
# .next/
# ├─ standalone/ (production server)
# ├─ static/     (JS bundles)
# └─ server/     (API routes)
```

---

## 📝 Conclusão

Este projeto demonstra:
- ✅ **Server Components** para lógica do servidor
- ✅ **Client Components** para interatividade
- ✅ **Prisma ORM** para type-safe queries
- ✅ **Next.js Routing** dinâmico
- ✅ **Tailwind CSS** para styling eficiente
- ✅ **Shadcn/ui** para componentização

**Próximos passos recomendados:**
1. Página de detalhe do produto (/[slug]/product/[id])
2. Carrinho de compras (contexto global)
3. Checkout
4. Sistema de pedidos (banco de dados)
5. API para mobile

