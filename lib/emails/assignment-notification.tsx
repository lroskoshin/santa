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
import type { Locale } from "@/lib/i18n";

interface AssignmentNotificationEmailProps {
  santaName: string;
  targetName: string;
  targetWishlist: string | null;
  roomName: string;
  viewUrl: string;
  locale?: Locale;
}

const emailContent = {
  ru: {
    preview: "🎁 Жеребьёвка проведена! Узнай, кому ты даришь подарок",
    title: "🎄 Тайный Санта",
    greeting: (name: string) => `Привет, ${name}!`,
    completed: (roomName: string) => `Жеребьёвка в комнате «${roomName}» завершена!`,
    youGiftTo: "Ты даришь подарок:",
    wishes: "💝 Пожелания:",
    viewOnSite: "Ты всегда можешь посмотреть эту информацию на сайте:",
    openButton: "Открыть WeSanta",
    footer: "Это письмо отправлено автоматически сервисом WeSanta.club",
    doNotReply: "Не отвечайте на это письмо.",
  },
  en: {
    preview: "🎁 Draw completed! Find out who you're giving a gift to",
    title: "🎄 Secret Santa",
    greeting: (name: string) => `Hi, ${name}!`,
    completed: (roomName: string) => `The draw in room "${roomName}" is complete!`,
    youGiftTo: "You're giving a gift to:",
    wishes: "💝 Wishes:",
    viewOnSite: "You can always view this information on the website:",
    openButton: "Open WeSanta",
    footer: "This email was sent automatically by WeSanta.club",
    doNotReply: "Do not reply to this email.",
  },
};

export function AssignmentNotificationEmail({
  santaName,
  targetName,
  targetWishlist,
  roomName,
  viewUrl,
  locale = "ru",
}: AssignmentNotificationEmailProps) {
  const content = emailContent[locale];
  
  return (
    <Html>
      <Head />
      <Preview>{content.preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>{content.title}</Heading>

          <Text style={text}>{content.greeting(santaName)}</Text>

          <Text style={text}>
            {content.completed(roomName)}
          </Text>

          <Section style={highlightBox}>
            <Text style={highlightTitle}>{content.youGiftTo}</Text>
            <Text style={targetNameStyle}>{targetName}</Text>
          </Section>

          {targetWishlist && (
            <Section style={wishlistSection}>
              <Text style={wishlistTitle}>{content.wishes}</Text>
              <Text style={wishlistText}>{targetWishlist}</Text>
            </Section>
          )}

          <Hr style={hr} />

          <Text style={text}>{content.viewOnSite}</Text>

          <Link href={viewUrl} style={button}>
            {content.openButton}
          </Link>

          <Hr style={hr} />

          <Text style={footer}>
            {content.footer}
            <br />
            {content.doNotReply}
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


