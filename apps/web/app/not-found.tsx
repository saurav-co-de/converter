import { Button, Container } from "@pdf-platform/ui";

export default function NotFound() {
  return (
    <Container className="py-24 text-center">
      <h1 className="font-display text-5xl font-semibold text-ink">Page not found</h1>
      <p className="mx-auto mt-4 max-w-xl text-lg text-slate-600">
        The route exists in the platform vision, but this path is not currently configured.
      </p>
      <div className="mt-8">
        <Button href="/">Back home</Button>
      </div>
    </Container>
  );
}
