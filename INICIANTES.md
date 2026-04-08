# 📚 Guia Completo para Iniciantes - Restaurant Service

**Para pessoas que NÃO entendem React, TypeScript ou programação web**

---

## 🎯 Antes de Começar - Conceitos Fundamentais

### O que é este projeto?
Imagine um **cardápio digital** em um restaurante. Você:
1. Acessa o site do restaurante
2. Escolhe entre "comer aqui" ou "levar embora"
3. Vê o cardápio com categorias (Bebidas, Lanches, etc)
4. Clica em um produto para detalhes

Este projeto **constrói exatamente isso**.

---

## 🧠 Conceitos que Você Precisa Entender

### 1. **O que é React?**
React é um **brinquedo de construção** para interface web.

**Analogia:**
- Brinquedo Lego: você monta peças pequenas → forma um castelo grande
- React: você cria componentes pequenos → forma um site grande

**Exemplo real:**
```
┌─────────────────────────────┐
│     Página do Restaurante   │ (site inteiro)
│ ┌─────────────────────────┐ │
│ │  Componente: Header     │ │ (cabeçalho)
│ └─────────────────────────┘ │
│ ┌─────────────────────────┐ │
│ │ Componente: Categorias  │ │ (lista de categorias)
│ └─────────────────────────┘ │
│ ┌─────────────────────────┐ │
│ │ Componente: Produtos    │ │ (lista de produtos)
│ └─────────────────────────┘ │
└─────────────────────────────┘
```

Cada **componente** é uma peça reutilizável.

---

### 2. **O que é TypeScript?**
TypeScript é **JavaScript com regras**.

**Analogia:**
- JavaScript: escrever em Português sem regras (pode tudo)
- TypeScript: escrever em Português com regras gramaticais rígidas

**Vantagem:** o computador avisa **antes de rodar** se você errou algo.

**Exemplo:**
```typescript
// JavaScript (sem regras)
let preço = "R$ 10"  // Pode ser texto ou número
preço = preço + 5    // Erro!

// TypeScript (com regras)
let preço: number = 10  // Têm que ser SEMPRE número
preço = preço + 5       // OK! Vai funcionar
```

---

### 3. **O que é Next.js?**
Next.js é um **superpoder para React**.

**Analogia:**
- React: você constrói o site
- Next.js: React + servidor + banco de dados + otimizações

**O que Next.js oferece:**
- Rotas automáticas (URLs amigáveis)
- Carregamento mais rápido
- Conexão com banco de dados
- Segurança

---

### 4. **O que é um "Componente"?**
Componente = **bloco de construção reutilizável**

**Exemplo real:**
Um botão é um componente:
```
┌──────────────────┐
│  [Clique Aqui]   │ ← Botão
└──────────────────┘
```

Você pode usar este **mesmo botão** em:
- Tela inicial
- Menu
- Checkout
- Confirmação de pedido

**Benefício:** não precisa reescrever o botão 50 vezes!

---

### 5. **O que é "Estado"?**
Estado = **memória do componente**

**Analogia:**
Você clica em "Bebidas" e o site **lembra** que você escolheu bebidas.

```
┌──────────────────────────────┐
│ Categorias:                  │
│ [Bebidas] [Lanches]          │ ← Você clica
└──────────────────────────────┘
        ↓
   Estado muda:
   selectedCategory = "Bebidas"
        ↓
┌──────────────────────────────┐
│ Produtos de Bebidas:         │
│ - Coca-Cola                  │ ← Página atualiza
│ - Suco                       │
└──────────────────────────────┘
```

Isso é feito com `useState`:
```typescript
const [selectedCategory, setSelectedCategory] = useState("Bebidas")
```

---

### 6. **O que é "Async/Await"?**
Async/Await = **esperar algo terminar**

**Analogia de restaurante:**
1. Você chama o garçom
2. Ele vai à cozinha
3. Você **espera** a comida ficar pronta
4. Ele volta com a comida

```typescript
// Buscar dados do banco de dados
const restaurant = await db.restaurant.findUnique(...) 
//                  ↑
//          "Espera isso terminar antes"
```

---

### 7. **O que é um "Banco de Dados"?**
Banco de Dados = **armário gigante de informações**

**Armário do restaurante:**
```
┌──────────────────────────────┐
│ ARMÁRIO: Banco de Dados      │
├──────────────────────────────┤
│ Gaveta 1: Restaurantes       │
│ - Pizzaria do João           │
│ - Burger King                │
├──────────────────────────────┤
│ Gaveta 2: Categorias         │
│ - Bebidas                    │
│ - Lanches                    │
├──────────────────────────────┤
│ Gaveta 3: Produtos           │
│ - Coca-Cola (R$ 5)           │
│ - Água (R$ 2)                │
└──────────────────────────────┘
```

Quando você acessa `/pizzaria-do-joao`:
1. Código busca no banco: "me traz os dados da pizzaria"
2. Banco retorna: logo, nome, descrição, etc
3. Página mostra os dados

---

## 📁 Explicação de Cada Arquivo

### **Arquivo 1: `src/app/[slug]/page.tsx`**

**O que significa `[slug]`?**
`[slug]` é um **atalho dinâmico** para URLs variáveis.

```
URL acessada:        /pizzaria-do-joao
                           ↓
Capturada por:      [slug]
                           ↓
Valor do slug:      "pizzaria-do-joao"
```

**O que este arquivo faz?**

```typescript
const RestaurantPage = async ({ params }: RestaurantPageProps) => {
  // 1. Recebe o slug da URL
  const { slug } = await params;
  
  // 2. Busca no banco de dados
  const restaurant = await db.restaurant.findUnique({ where: { slug } });
  
  // 3. Se não encontrar, mostra 404
  if (!restaurant) {
    return notFound();
  }
  
  // 4. Renderiza a página com os dados
  return (
    <div>
      {/* Logo do restaurante */}
      <Image src={restaurant.avatarImageUrl} />
      
      {/* Nome */}
      <h2>{restaurant.name}</h2>
      
      {/* 2 Botões de opção */}
      <ConsumptionMethodOption option="DINE_IN" />
      <ConsumptionMethodOption option="TAKEAWAY" />
    </div>
  );
};
```

**Fluxo visual:**
```
Usuário acessa:
/pizzaria-do-joao
      ↓
Código extrai slug:
"pizzaria-do-joao"
      ↓
Busca no banco:
SELECT * FROM Restaurant WHERE slug = "pizzaria-do-joao"
      ↓
Retorna dados:
{name: "Pizzaria do João", avatar: "...", ...}
      ↓
Renderiza página com:
- Logo
- Nome
- 2 Botões
```

---

### **Arquivo 2: `src/app/[slug]/components/consumption-method-option.tsx`**

**O que é este arquivo?**
Este é um **componente reutilizável** (peça Lego).

**Props (propriedades):**
Props são **parâmetros** do componente:

```typescript
interface ConsumptionMethodOptionProps {
  slug: string              // Ex: "pizzaria-do-joao"
  imageUrl: string          // Ex: "/dine_in.png"
  imageAlt: string          // Ex: "Comer aqui"
  buttonText: string        // Ex: "Para comer aqui"
  option: ConsumptionMethod // Ex: "DINE_IN"
}
```

**Analogia:**
Imagine uma **máquina de fazer pizzas**:
- Você coloca **ingredientes (props)** na entrada
- Máquina processa
- Sai uma pizza pronta

```
Entrada (Props):
┌──────────────────┐
│ slug: "pizzaria" │
│ option: "DINE_IN"│
│ imageUrl: "..."  │
└──────────────────┘
      ↓ Componente
      ↓
Saída (Visual):
┌────────────────┐
│    [Imagem]    │
│  [Botão Click] │
└────────────────┘
```

**O que renderiza:**
```typescript
<Card>                           {/* Caixa com borda */}
  <CardContent>
    <Image src={imageUrl} />     {/* Imagem */}
    <Button asChild>             {/* Botão clicável */}
      <Link href={`/${slug}/menu?consumptionMethod=${option}`}>
        {buttonText}
      </Link>
    </Button>
  </CardContent>
</Card>
```

**Fluxo ao clicar:**
```
Usuário clica no botão
      ↓
Link navega para:
/pizzaria-do-joao/menu?consumptionMethod=DINE_IN
      ↓
Carrega página do menu
```

---

### **Arquivo 3: `src/app/[slug]/menu/page.tsx`**

**O que faz:**
Valida o menu e mostra as categorias/produtos.

**Fluxo:**
```typescript
// 1. Recebe slug e consumptionMethod
const { slug } = await params;
const { consumptionMethod } = await searchParams;

// 2. Valida se consumptionMethod é válido
if (!isConsumptionMethodValid(consumptionMethod)) {
  return notFound(); // Mostra 404 se inválido
}

// 3. Busca restaurante COM categorias e produtos
const restaurant = await db.restaurant.findUnique({
  where: { slug },
  include: {                    {/* Buscar também: */}
    menuCategories: {           {/* Categorias */}
      include: { products: true } {/* E produtos */}
    }
  }
});

// 4. Se não encontrar, 404
if (!restaurant) return notFound();

// 5. Renderiza header + categorias
return (
  <div>
    <RestaurantHeader restaurant={restaurant} />
    <RestaurantCategories restaurant={restaurant} />
  </div>
);
```

**URL esperada:**
```
http://localhost:3000/pizzaria-do-joao/menu?consumptionMethod=DINE_IN
                      └─ slug ─────────┘    └─ searchParam ────────┘
```

**O `include` no banco de dados:**
```
SEM include:
db.restaurant.findUnique(...)
└─ Retorna só: {id, name, slug, avatar, ...}

COM include:
db.restaurant.findUnique({include: {menuCategories: {...}}})
└─ Retorna: Restaurant + menuCategories + products (tudo junto!)
```

---

### **Arquivo 4: `src/app/[slug]/menu/components/header.tsx`**

**O que renderiza:**
Uma imagem grande com 2 botões em cima.

```
┌──────────────────────────────┐
│ [← Voltar]     [Restaurante] │
│                              │
│   [Imagem grande de capa]   │
│                              │
└──────────────────────────────┘
```

**Componentes:**
- Botão **voltar** (← ChevronLeft): usa `router.back()` para voltar à página anterior
- Botão **menu** (↪ ScrollText): ainda não faz nada

**Código:**
```typescript
const handleBackClick = () => router.back();
// router.back() = voltar à página anterior no navegador
```

---

### **Arquivo 5: `src/app/[slug]/menu/components/categories.tsx`**

**Este é o MAIS IMPORTANTE! Usa `useState`**

**O que aparece:**
```
┌─────────────────────────────────────┐
│ Logo + Nome + "Aberto!"            │
├─────────────────────────────────────┤
│ [Bebidas] [Lanches] [Sobremesas]   │ ← Pode fazer scroll
├─────────────────────────────────────┤
│ Produtos da categoria selecionada   │
│ - Coca-Cola 2L       R$ 12,90       │
│ - Suco Natural       R$ 8,50        │
└─────────────────────────────────────┘
```

**O Estado (useState):**
```typescript
const [selectedCategory, setSelectedCategory] = 
  useState<MenuCategoriesWithProducts>(restaurant.menuCategories[0])
```

**O que significa:**
```
selectedCategory = categoria que está sendo mostrada
setSelectedCategory = função para MUDAR a categoria

Valor inicial = primeira categoria do array (menuCategories[0])
```

**Quando você clica em uma categoria:**
```
Clica em "Lanches"
      ↓
Executa: handleCategoryClick(lanchesCategory)
      ↓
Que chama: setSelectedCategory(lanchesCategory)
      ↓
Estado muda: selectedCategory agora é "Lanches"
      ↓
React detecta a mudança e renderiza novamente
      ↓
Produtos na tela mudam para produtos de Lanches
```

**Estilo do botão ativo:**
```typescript
{selectedCategory.id === category.id ? "default" : "secondary"}
```

Significa:
- Se é a categoria selecionada: cor "default" (mais escuro, destaca)
- Se não é: cor "secondary" (mais claro)

**Renderiza o componente Products:**
```typescript
<Products products={selectedCategory.products} />
// Passa apenas os produtos da categoria selecionada
```

---

### **Arquivo 6: `src/app/[slug]/menu/components/products.tsx`**

**O que renderiza:**
Lista de produtos com nome, descrição, preço e imagem.

```
Cada produto:
┌─────────────────────────────────────┐
│ Coca-Cola 2L              [Imagem]  │
│ Bebida gelada refrescante           │
│ R$ 12,90                            │
└─────────────────────────────────────┘
```

**Formatação de preço:**
```typescript
new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL"
}).format(product.price)
```

**O que isso faz:**
```
Entrada:    12.9
                ↓
Formatação →
                ↓
Saída:      R$ 12,90
```

É como converter número para dinheiro.

**Loop de produtos:**
```typescript
{products.map((product) => (  // Para cada produto:
  <Link key={product.id}>     // Link clicável
    <div>                     // Lado esquerdo:
      <h3>{product.name}</h3>      // Nome
      <p>{product.description}</p> // Descrição
      <p>{preço}</p>               // Preço
    </div>
    <Image src={product.imageUrl}/> {/* Lado direito: imagem */}
  </Link>
))}
```

---

### **Arquivo 7: `src/lib/prisma.ts`**

**O que é Prisma?**
Prisma é um **assistente de banco de dados**.

Sem Prisma:
```sql
SELECT * FROM restaurant WHERE slug = 'pizzaria-do-joao'
// SQL crua (difícil)
```

Com Prisma:
```typescript
db.restaurant.findUnique({ where: { slug: 'pizzaria-do-joao' } })
// JavaScript normal (fácil)
```

**O que o arquivo faz:**
Create uma **instância única** de conexão com o banco.

```typescript
let prisma: PrismaClient;

if (process.env.NODE_ENV === "production") {
  // Em produção: cria nova conexão
  prisma = new PrismaClient();
} else {
  // Em desenvolvimento: reutiliza conexão
  if (!global.cachedPrisma) {
    global.cachedPrisma = new PrismaClient();
  }
  prisma = global.cachedPrisma;
}

export const db = prisma;
```

**Por que:**
- **Produção**: cada requisição é isolada
- **Desenvolvimento**: reutiliza conexão pra não sobrecarregar

**Como usar:**
```typescript
import { db } from "@/lib/prisma"

const restaurant = await db.restaurant.findUnique({...})
```

---

### **Arquivo 8: `src/components/ui/card.tsx`**

**O que é:**
Componente reutilizável que cria **caixas com estilo**.

**Componentes exportados:**
```typescript
<Card>               {/* Caixa com borda */}
  <CardHeader>      {/* Cabeçalho */}
    <CardTitle/>    {/* Título grande */}
    <CardDescription/> {/* Texto pequeno */}
  </CardHeader>
  <CardContent/>    {/* Conteúdo principal */}
  <CardFooter/>     {/* Rodapé */}
</Card>
```

**Exemplo real:**
```tsx
<Card>
  <CardHeader>
    <CardTitle>Consume-method Option</CardTitle>
  </CardHeader>
  <CardContent>
    <Image src="/dine-in.png" />
    <Button>Para comer aqui</Button>
  </CardContent>
</Card>
```

---

### **Arquivo 9: `src/components/ui/scroll-area.tsx`**

**O que é:**
Componente que cria **área com scroll horizontal/vertical** customizada.

**Uso (em categories.tsx):**
```typescript
<ScrollArea className="w-full">
  <div className="flex w-max space-x-4">
    {/* Categorias aqui (pode fazer scroll) */}
  </div>
  <ScrollBar orientation="horizontal" />
</ScrollArea>
```

**O que renderiza:**
```
┌──────────────────────────────────────┐
│[Bebidas][Lanches][Sobremesas]...→   │ ← Pode fazer scroll
│                                      │
│  ▬▬▬▬▬▬▬▬▬▬ (barra de scroll)     │
└──────────────────────────────────────┘
```

---

## 🔄 Fluxo Completo - Passo a Passo

### Cenário: Usuário acessa pizzaria-do-joao

```
1. TELA INICIAL
   URL: /pizzaria-do-joao
   ├─ Arquivo: src/app/[slug]/page.tsx
   ├─ [slug] =  "pizzaria-do-joao"
   ├─ Busca: SELECT * FROM Restaurant WHERE slug = 'pizzaria-do-joao'
   ├─ Retorna: {id: 1, name: "Pizzaria do João", avatar: "...", ...}
   └─ Renderiza:
        ┌──────────────────────────┐
        │  Logo: [imagem]          │
        │  Nome: Pizzaria do João  │
        │  "Seja bem-vindo!"       │
        │  [Para comer aqui]       │
        │  [Para levar]            │
        └──────────────────────────┘

2. USUÁRIO CLICA EM "PARA COMER AQUI"
   ├─ Evento: onClick em ConsumptionMethodOption
   ├─ Navega para: /pizzaria-do-joao/menu?consumptionMethod=DINE_IN
   └─ Carrega nova página

3. PÁGINA DO MENU
   URL: /pizzaria-do-joao/menu?consumptionMethod=DINE_IN
   ├─ Arquivo: src/app/[slug]/menu/page.tsx
   ├─ Valida: consumptionMethod = "DINE_IN" ✓ (válido)
   ├─ Busca: SELECT * FROM Restaurant WHERE slug='pizzaria-do-joao'
   │         + menuCategories
   │         + products (de cada categoria)
   ├─ Retorna: {
   │   id: 1,
   │   name: "Pizzaria do João",
   │   menuCategories: [
   │     {id: 1, name: "Bebidas", products: [...]},
   │     {id: 2, name: "Pizzas", products: [...]},
   │   ]
   │ }
   └─ Renderiza:
        ┌──────────────────────────┐
        │  <RestaurantHeader />    │ ← Imagem grande
        ├──────────────────────────┤
        │ <RestaurantCategories /> │ ← Categoria + produtos
        └──────────────────────────┘

4. DENTRO DE RESTAURANT_CATEGORIES
   ├─ Estado: selectedCategory = Bebidas (primeira categoria)
   ├─ Renderiza:
   │  ┌────────────────────────┐
   │  │ Logo + Nome + "Aberto!"│
   │  ├────────────────────────┤
   │  │[Bebidas✓][Pizzas]      │
   │  │(Bebidas é selecionada) │
   │  ├────────────────────────┤
   │  │ <Products drinks />    │
   │  └────────────────────────┘
   │
   └─ USUÁRIO CLICA EM "PIZZAS"
      ├─ Executa: setSelectedCategory("Pizzas")
      ├─ Estado muda: selectedCategory = "Pizzas"
      ├─ React detecta mudança
      ├─ Renderiza novamente com:
      │  [Bebidas][Pizzas✓] ← Pizzas agora selecionada
      │  <Products pizzas /> ← Mostra produtos de pizza
      └─ Tela atualiza instantaneamente

5. PRODUTOS RENDERIZADOS
   ├─ Arquivo: src/app/[slug]/menu/components/products.tsx
   ├─ Para cada produto:
   │  ┌─────────────────────────────┐
   │  │ Pizza Margherita  [imagem]  │
   │  │ Massa, tomate, queijo       │
   │  │ R$ 35,90                    │
   │  └─────────────────────────────┘
   └─ Clicável (Link para / - página do produto)
```

---

## 🛠️ Tecnologias - Explicado Simples

| Tecnologia | O que é | Analogia |
|------------|---------|----------|
| **React** | Biblioteca p/ criar interface | Brinquedo Lego para web |
| **TypeScript** | JavaScript com regras | Português com gramática rígida |
| **Next.js** | React + servidor + extras | React turbinado |
| **Prisma** | Assistente para banco de dados | Tradutor de SQL para JavaScript |
| **Tailwind CSS** | Estilo/design rápido | Roupas pré-prontas que você customiza |
| **Lucide Icons** | Ícones simples | Desenhinhos pequenos reutilizáveis |

---

## 📊 Banco de Dados - Visualizado

```
┌─────────────────────┐
│    Restaurant       │
├─────────────────────┤
│ id: 1               │
│ name: Pizzaria...   │
│ slug: pizzaria...   │
│ avatarImageUrl: ... │
│ coverImageUrl: ...  │
│ description: "..."  │
└──────┬──────────────┘
       │ (1 restaurante tem muitas categorias)
       │
       ├─ ┌──────────────────────┐
       │  │   MenuCategory       │
       │  ├──────────────────────┤
       │  │ id: 1                │
       │  │ name: "Bebidas"      │
       │  └──────┬───────────────┘
       │         │ (1 categoria tem muitos produtos)
       │         │
       │         ├─ ┌────────────────────┐
       │         │  │     Product        │
       │         │  ├────────────────────┤
       │         │  │ id: 1              │
       │         │  │ name: "Coca-Cola"  │
       │         │  │ price: 5.00        │
       │         │  │ description: "..." │
       │         │  │ imageUrl: "..."    │
       │         │  └────────────────────┘
       │         │
       │         └─ (mais produtos...)
       │
       └─ (mais categorias...)
```

---

## 🚀 Como Rodar o Projeto

### Passo 1: Instalar dependências
```bash
npm install
```
**O que faz:** Baixa todas as bibliotecas necessárias (React, Next.js, Prisma, etc)

### Passo 2: Rodar servidor de desenvolvimento
```bash
npm run dev
```
**O que faz:** Inicia o site localmente em `http://localhost:3000`

### Passo 3: Acessar no navegador
```
http://localhost:3000/pizzaria-do-joao
```
**O que faz:** Mostra a página inicial da pizzaria

---

## ⚡ Resumo Rápido

| Arquivo | Para quê? | Tipo |
|---------|-----------|------|
| `[slug]/page.tsx` | Tela inicial com opções | **Página** |
| `consumption-method-option.tsx` | Botão de opção | **Componente** |
| `[slug]/menu/page.tsx` | Validar e carregar menu | **Página** |
| `header.tsx` | Cabeçalho com capa | **Componente** |
| `categories.tsx` | Filtro de categorias (com estado) | **Componente** |
| `products.tsx` | Lista de produtos | **Componente** |
| `prisma.ts` | Conexão com banco | **Configuração** |
| `card.tsx` | Caixa com estilo | **Componente UI** |
| `scroll-area.tsx` | Scroll customizado | **Componente UI** |

---

## 📝 Dúvidas Frequentes

### P: Por que `[slug]` tem colchetes?
R: Colchetes significam "rota dinâmica". Qualquer valor funciona:
- `/pizzaria-do-joao` → slug = "pizzaria-do-joao"
- `/burger-king` → slug = "burger-king"
- `/mcdonalds` → slug = "mcdonalds"

### P: O que é `async`?
R: Significa "esperador". O código espera banco de dados responder antes de continuar.

### P: E o `await`?
R: Ainda está esperando. Tipo levanta a mão: "ó, banco, me traz aqueles dados aí!"

### P: Por que `useState`?
R: Para o componente "lembrar" qual categoria foi selecionada.

### P: Posso clicar em um produto?
R: Sim! Mas agora leva para `/` (página vazia). No futuro mostrará detalhes.

---

**Parabéns! Você agora entende como este projeto funciona!** 🎉
