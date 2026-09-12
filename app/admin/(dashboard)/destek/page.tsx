import { Card, PageHeader } from "@/components/admin/ui";
import { DestekForm } from "./DestekForm";

export default function DestekPage() {
  return (
    <div>
      <PageHeader
        title="Destek"
        description="7/24 canlı destek bulunmuyor. Buradan gönderdiğiniz mesajlar doğrudan e-posta olarak iletilir, size cevap yine e-posta üzerinden gelir."
      />

      <Card title="Yeni Mesaj">
        <DestekForm />
      </Card>
    </div>
  );
}
