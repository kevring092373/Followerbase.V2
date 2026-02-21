/**
 * Viva Success-Redirect: t = transactionId.
 * Transaction verifizieren, Bestellung anlegen, zur Danke-Seite weiterleiten.
 */
import { redirect } from "next/navigation";
import {
  getVivaTransaction,
  isTransactionSuccessful,
} from "@/lib/viva-server";
import { createOrderFromVivaPendingAndRemove } from "@/lib/orders-data";
import {
  sendOrderConfirmationEmail,
  sendOrderNotificationToOwner,
} from "@/lib/email-order-confirmation";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function VivaSuccessPage({ searchParams }: Props) {
  const params = await searchParams;
  const t = params.t ?? params.TransactionId ?? params.tid;
  const transactionId = (Array.isArray(t) ? t[0] : t)?.trim();
  if (!transactionId) {
    redirect("/checkout?error=viva_missing");
  }

  const transaction = await getVivaTransaction(transactionId);
  if (!transaction || !isTransactionSuccessful(transaction)) {
    redirect("/checkout?error=viva_verify");
  }

  const order = await createOrderFromVivaPendingAndRemove(transaction.orderCode);
  if (!order) {
    redirect("/checkout?error=viva_order");
  }

  sendOrderConfirmationEmail(order).catch(() => {});
  sendOrderNotificationToOwner(order).catch(() => {});

  redirect(`/bestellung/danke?order=${encodeURIComponent(order.orderNumber)}`);
}
