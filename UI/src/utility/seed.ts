import { createOption, useStore } from "./store";

export function seedIfEmpty() {
  const polls = useStore.getState().polls;
  if (Object.keys(polls).length > 0) return;
  const addr = "0xSEED";
  try {
    useStore.getState().createPoll({
      question: "Which category should win Sui Hackathon?",
      description: "Cast your vote and see live results!",
      options: [createOption("DeFi"), createOption("Gaming"), createOption("Infra")],
      createdBy: addr,
      imageUrl: "https://images.unsplash.com/photo-1518779578993-ec3579fee39f?w=800&q=80&auto=format&fit=crop",
    });
  } catch {
    // ignore
  }
}


