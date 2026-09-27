import { redirect } from "next/navigation";

export default async function CategoryPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const params = await props.params;
  redirect(`/shop?category=${params.slug}`);
}
