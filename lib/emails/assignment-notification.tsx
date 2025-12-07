import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface AssignmentNotificationEmailProps {
  santaName: string;
  targetName: string;
  targetWishlist: string | null;
  roomName: string;
  viewUrl: string;
}

export function AssignmentNotificationEmail({
  santaName,
  targetName,
  targetWishlist,
  roomName,
  viewUrl,
}: AssignmentNotificationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>
        🎁 Жеребьёвка проведена! Узнай, кому ты даришь подарок
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>🎄 Тайный Санта</Heading>

          <Text style={text}>Привет, {santaName}!</Text>

          <Text style={text}>
            Жеребьёвка в комнате <strong>«{roomName}»</strong> завершена!
          </Text>

          <Section style={highlightBox}>
            <Text style={highlightTitle}>Ты даришь подарок:</Text>
            <Text style={targetNameStyle}>{targetName}</Text>
          </Section>

          {targetWishlist && (
            <Section style={wishlistSection}>
              <Text style={wishlistTitle}>💝 Пожелания:</Text>
              <Text style={wishlistText}>{targetWishlist}</Text>
            </Section>
          )}

          <Hr style={hr} />

          <Text style={text}>
            Ты всегда можешь посмотреть эту информацию на сайте:
          </Text>

          <Link href={viewUrl} style={button}>
            Открыть WeSanta
          </Link>

          <Hr style={hr} />

          <Text style={footer}>
            Это письмо отправлено автоматически сервисом WeSanta.club
            <br />
            Не отвечайте на это письмо.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#0c1222",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "40px 20px",
  maxWidth: "560px",
};

const h1 = {
  color: "#ffffff",
  fontSize: "32px",
  fontWeight: "700",
  textAlign: "center" as const,
  margin: "0 0 30px",
};

const text = {
  color: "#cbd5e1",
  fontSize: "16px",
  lineHeight: "26px",
  margin: "16px 0",
};

const highlightBox = {
  backgroundColor: "#1e293b",
  borderRadius: "12px",
  padding: "24px",
  margin: "24px 0",
  textAlign: "center" as const,
  border: "1px solid #334155",
};

const highlightTitle = {
  color: "#94a3b8",
  fontSize: "14px",
  margin: "0 0 8px",
  textTransform: "uppercase" as const,
  letterSpacing: "1px",
};

const targetNameStyle = {
  color: "#22c55e",
  fontSize: "28px",
  fontWeight: "700",
  margin: "0",
};

const wishlistSection = {
  backgroundColor: "#1a1a2e",
  borderRadius: "12px",
  padding: "20px",
  margin: "20px 0",
  borderLeft: "4px solid #f59e0b",
};

const wishlistTitle = {
  color: "#f59e0b",
  fontSize: "14px",
  fontWeight: "600",
  margin: "0 0 8px",
};

const wishlistText = {
  color: "#e2e8f0",
  fontSize: "15px",
  lineHeight: "24px",
  margin: "0",
  whiteSpace: "pre-wrap" as const,
};

const hr = {
  borderColor: "#334155",
  margin: "30px 0",
};

const button = {
  backgroundColor: "#22c55e",
  borderRadius: "8px",
  color: "#ffffff",
  display: "inline-block",
  fontSize: "16px",
  fontWeight: "600",
  padding: "14px 28px",
  textDecoration: "none",
  textAlign: "center" as const,
};

const footer = {
  color: "#64748b",
  fontSize: "12px",
  lineHeight: "20px",
  textAlign: "center" as const,
};


