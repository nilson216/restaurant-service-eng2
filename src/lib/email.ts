import fs from "fs";
import path from "path";

interface ResendClient {
  emails: {
    send: (config: {
      from: string;
      to: string;
      subject: string;
      html: string;
    }) => Promise<{ data?: { id: string }; error?: string }>;
  };
}

// Simular Resend se não estiver instalado
let resend: ResendClient | null = null;

// Inicializar Resend de forma assíncrona
(async () => {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn("⚠️ RESEND_API_KEY não configurado");
      return;
    }
    // @ts-expect-error - resend será instalado via npm
    const { Resend } = (await import("resend")) as {
      Resend: new (key: string) => ResendClient;
    };
    resend = new Resend(process.env.RESEND_API_KEY);
  } catch {
    console.warn("⚠️ Resend não está instalado. Use: npm install resend");
  }
})();

interface SendOrderConfirmationEmailInput {
  customerEmail: string;
  customerName: string;
  orderId: string;
  totalAmount: string;
  items: Array<{
    name: string;
    quantity: number;
    price: string;
  }>;
  restaurantName: string;
}

/**
 * Converte o template HTML e substitui placeholders
 */
async function renderOrderConfirmationEmail(
  input: SendOrderConfirmationEmailInput,
): Promise<string> {
  try {
    // Ler o template HTML
    const templatePath = path.join(
      process.cwd(),
      "src/lib/email-templates/order-confirmation.html",
    );
    let html = fs.readFileSync(templatePath, "utf-8");

    // Gerar HTML dos itens
    const itemsHtml = input.items
      .map(
        (item) => `
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #E5E7EB;border-radius:10px;margin-bottom:10px;">
        <tr>
          <td style="padding:14px 18px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td valign="middle">
                  <p style="margin:0;font-size:14px;font-weight:700;color:#111827;font-family:'Plus Jakarta Sans',Arial,sans-serif;">${item.name}</p>
                  <p style="margin:2px 0 0;font-size:13px;color:#9CA3AF;font-family:'Plus Jakarta Sans',Arial,sans-serif;">Qtd: ${item.quantity}</p>
                </td>
                <td align="right" valign="middle">
                  <p style="margin:0;font-size:15px;font-weight:700;color:#1A56DB;font-family:'Plus Jakarta Sans',Arial,sans-serif;">${item.price}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    `,
      )
      .join("");

    // Obter data formatada
    const dataAtual = new Date().toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    // Substituir placeholders
    html = html
      .replaceAll("{{NOME_CLIENTE}}", input.customerName)
      .replaceAll("{{NUMERO_PEDIDO}}", input.orderId)
      .replaceAll("{{DATA_PEDIDO}}", dataAtual)
      .replaceAll("{{STATUS_PEDIDO}}", "Confirmado")
      .replaceAll("{{VALOR_TOTAL}}", input.totalAmount)
      .replaceAll("{{ITEMS_HTML}}", itemsHtml)
      .replaceAll("{{RESTAURANTE_NOME}}", input.restaurantName)
      .replaceAll(
        "{{LINK_PEDIDO}}",
        `${process.env.NEXT_PUBLIC_APP_URL || "https://seu-app.com"}/pedidos/${input.orderId}`,
      );

    return html;
  } catch (error) {
    console.error("Erro ao renderizar email:", error);
    // Fallback: Gerar HTML simples
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Pedido Confirmado</title>
        </head>
        <body style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; padding: 30px;">
            <h1 style="color: #1A56DB; margin-bottom: 10px;">✅ Pedido #${input.orderId} Confirmado!</h1>
            <p style="color: #666; font-size: 16px;">Olá <strong>${input.customerName}</strong>,</p>
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
              Seu pedido foi confirmado com sucesso em <strong>${input.restaurantName}</strong>.
            </p>
            
            <div style="background-color: #F0F7FF; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #1A56DB; margin-top: 0;">Resumo do Pedido</h3>
              <p><strong>Itens:</strong></p>
              <ul>
                ${input.items.map((item) => `<li>${item.quantity}x ${item.name} - ${item.price}</li>`).join("")}
              </ul>
              <p style="font-size: 18px; font-weight: bold; color: #1A56DB;">Total: ${input.totalAmount}</p>
            </div>
            
            <p style="color: #666; font-size: 14px; padding-top: 20px; border-top: 1px solid #eee;">
              © 2025 ${input.restaurantName}
            </p>
          </div>
        </body>
      </html>
    `;
  }
}

/**
 * Envia email de confirmação de pedido
 */
export async function sendOrderConfirmationEmail(
  input: SendOrderConfirmationEmailInput,
) {
  try {
    if (!input.customerEmail) {
      console.warn("⚠️ Email do cliente não fornecido");
      return { success: false, error: "Email não fornecido" };
    }

    // Se Resend estiver disponível, usar ele
    if (resend) {
      const emailHtml = await renderOrderConfirmationEmail(input);

      const response = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
        to: input.customerEmail,
        subject: `✅ Pedido #${input.orderId} - Univali Services`,
        html: emailHtml,
      });

      if (response?.error) {
        console.error("❌ Erro ao enviar email com Resend:", response.error);
        return { success: false, error: response.error };
      }

      console.log("✅ Email enviado com sucesso via Resend");
      return { success: true, id: response?.data?.id };
    }

    // Fallback: Log apenas (para desenvolvimento)
    const emailHtml = await renderOrderConfirmationEmail(input);
    console.log("📧 Email de confirmação (modo desenvolvimento):", {
      to: input.customerEmail,
      subject: `✅ Pedido #${input.orderId} - Univali Services`,
      html: emailHtml.substring(0, 200) + "...",
    });

    return {
      success: true,
      mode: "development",
      message: "Email logado em desenvolvimento",
    };
  } catch (err) {
    console.error("❌ Erro ao enviar email:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Erro desconhecido",
    };
  }
}

/**
 * Envia email que o pedido está pronto
 */
export async function sendOrderReadyEmail(
  customerEmail: string,
  orderId: string,
  restaurantName: string,
) {
  try {
    if (!resend) {
      console.log(
        `📧 [DESENVOLVIMENTO] Pedido #${orderId} está pronto em ${restaurantName}`,
      );
      return { success: true, mode: "development" };
    }

    const response = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
      to: customerEmail,
      subject: `🎉 Pedido #${orderId} pronto!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #00437A;">Seu pedido está pronto! 🎉</h2>
          <p>Olá,</p>
          <p>Seu pedido <strong>#${orderId}</strong> já está pronto em <strong>${restaurantName}</strong>.</p>
          <p>Venha buscar agora mesmo!</p>
          <div style="background-color: #F0F7FF; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Pedido: #${orderId}</strong></p>
            <p style="margin: 5px 0 0 0; color: #666;">Restaurante: ${restaurantName}</p>
          </div>
          <p style="color: #666; font-size: 12px; margin-top: 30px;">
            © 2024 Univali Services
          </p>
        </div>
      `,
    });

    if (response?.error) {
      console.error("❌ Erro ao enviar email pronto:", response.error);
      return { success: false, error: response.error };
    }

    return { success: true, id: response?.data?.id };
  } catch (err) {
    console.error("❌ Erro ao enviar email pronto:", err);
    return { success: false };
  }
}
