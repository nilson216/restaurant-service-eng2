import * as React from "react";

interface OrderConfirmationEmailProps {
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

export const OrderConfirmationEmail = ({
  customerName,
  orderId,
  totalAmount,
  items,
  restaurantName,
}: OrderConfirmationEmailProps) => (
  <div
    style={{
      fontFamily: "Segoe UI, Roboto, Helvetica, Arial, sans-serif",
      maxWidth: "600px",
      margin: "0 auto",
      backgroundColor: "#f5f5f5",
      padding: "20px",
    }}
  >
    {/* Header with Logo */}
    <div
      style={{
        backgroundColor: "#FFFFFF",
        padding: "30px",
        borderRadius: "12px 12px 0 0",
        textAlign: "center",
        borderBottom: "4px solid #00437A",
      }}
    >
      <div
        style={{
          fontSize: "32px",
          fontWeight: "bold",
          color: "#00437A",
          marginBottom: "10px",
        }}
      >
        🎉
      </div>
      <h1
        style={{
          color: "#00437A",
          fontSize: "28px",
          margin: "0 0 10px 0",
          fontWeight: "bold",
        }}
      >
        Pedido Criado com Sucesso!
      </h1>
      <p style={{ color: "#666", margin: "0", fontSize: "14px" }}>
        Obrigado por escolher a Univali Services
      </p>
    </div>

    {/* Content */}
    <div style={{ backgroundColor: "#FFFFFF", padding: "30px" }}>
      <p style={{ color: "#333", fontSize: "16px", marginBottom: "20px" }}>
        Olá <strong>{customerName}</strong>,
      </p>

      <p style={{ color: "#666", fontSize: "15px", lineHeight: "1.6" }}>
        Seu pedido foi criado com sucesso em <strong>{restaurantName}</strong>.
        Aqui está um resumo do seu pedido:
      </p>

      {/* Order Number Card */}
      <div
        style={{
          backgroundColor: "#F0F7FF",
          border: "2px solid #00437A",
          borderRadius: "8px",
          padding: "15px",
          margin: "20px 0",
          textAlign: "center",
        }}
      >
        <p style={{ color: "#666", margin: "0", fontSize: "12px" }}>
          número do pedido
        </p>
        <p style={{ color: "#00437A", margin: "5px 0 0 0", fontSize: "24px", fontWeight: "bold" }}>
          #{orderId}
        </p>
      </div>

      {/* Items */}
      <div style={{ marginBottom: "20px" }}>
        <h3 style={{ color: "#00437A", marginBottom: "15px", fontSize: "16px" }}>
          📋 Itens do Pedido
        </h3>
        <div
          style={{
            border: "1px solid #eee",
            borderRadius: "8px",
            overflow: "hidden",
          }}
        >
          {items.map((item, index) => (
            <div
              key={index}
              style={{
                padding: "12px 15px",
                borderBottom: index < items.length - 1 ? "1px solid #eee" : "none",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <p style={{ color: "#333", margin: "0", fontWeight: "500" }}>
                  {item.name}
                </p>
                <p style={{ color: "#999", margin: "5px 0 0 0", fontSize: "13px" }}>
                  Qtd: {item.quantity}
                </p>
              </div>
              <p style={{ color: "#333", margin: "0", fontWeight: "bold" }}>
                {item.price}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Total */}
      <div
        style={{
          backgroundColor: "#F9F9F9",
          padding: "15px",
          borderRadius: "8px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <span style={{ color: "#333", fontSize: "16px", fontWeight: "bold" }}>
          Total:
        </span>
        <span style={{ color: "#00437A", fontSize: "24px", fontWeight: "bold" }}>
          {totalAmount}
        </span>
      </div>

      {/* Next Steps */}
      <div
        style={{
          backgroundColor: "#F0F7FF",
          padding: "15px",
          borderRadius: "8px",
          marginBottom: "20px",
        }}
      >
        <h4 style={{ color: "#00437A", margin: "0 0 10px 0", fontSize: "14px" }}>
          ⏭️ Próximos passos:
        </h4>
        <ol style={{ color: "#666", margin: "0", paddingLeft: "20px", fontSize: "14px" }}>
          <li style={{ marginBottom: "8px" }}>
            Seu pedido será preparado em breve
          </li>
          <li style={{ marginBottom: "8px" }}>
            Você receberá uma notificação quando estiver pronto
          </li>
          <li>Venha buscar ou receba sua entrega</li>
        </ol>
      </div>

      {/* CTA Button */}
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <a
          href="https://univali-services.com"
          style={{
            display: "inline-block",
            backgroundColor: "#00437A",
            color: "#FFFFFF",
            padding: "12px 30px",
            borderRadius: "24px",
            textDecoration: "none",
            fontWeight: "bold",
            fontSize: "16px",
          }}
        >
          Acompanhar Pedido
        </a>
      </div>
    </div>

    {/* Footer */}
    <div
      style={{
        backgroundColor: "#00437A",
        color: "#FFFFFF",
        padding: "20px",
        textAlign: "center",
        borderRadius: "0 0 12px 12px",
        fontSize: "12px",
      }}
    >
      <p style={{ margin: "0 0 10px 0" }}>
        <strong>Univali Services</strong>
      </p>
      <p style={{ margin: "0", color: "#E0E0E0" }}>
        © 2024 Todos os direitos reservados.
      </p>
      <p style={{ margin: "10px 0 0 0", color: "#B0B0B0", fontSize: "11px" }}>
        Dúvidas? Entre em contato conosco: suporte@univaliservices.com
      </p>
    </div>
  </div>
);
